// DowntimeChart.jsx
import React, { Component } from 'react';
import { connect } from "react-redux";

import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import {
  Box, Grid, TextField, MenuItem, Paper, Typography, Stack,
  InputAdornment, IconButton, List, ListItem, Chip
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';

import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssignmentIcon from '@mui/icons-material/Assignment';
import TimelineIcon from '@mui/icons-material/Timeline';
import BuildIcon from '@mui/icons-material/Build';

import s from './DowntimeChart.module.scss';

// 리덕스에서 색상 상태 불러옴
import { selectThemeHex, selectThemeKey } from '../../reducers/layout';

function mapStateToProps(state) {
  return {
    themeHex: selectThemeHex(state),
    themeKey: selectThemeKey(state), 
  };
}

class DowntimeChart extends Component {
  constructor(props) {
    super(props);

    const DEFAULT_END = '2025-06-30';
    const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');

    this.DEFAULT_END = DEFAULT_END;
    this.PIE_TOP_N = 5;
    this.PIE_WITH_OTHERS = true;

    this.state = {
      loading: false,
      error: null,

      // 원본 데이터
      formattedData: [],

      // 공통 필터(프레스+기간)
      kpiFilters: { start_work_date: jan1, end_work_date: DEFAULT_END, press: '1500T' },
      kpiSummary: { total: 0, count: 0, avg: 0, topName: '-', topValue: 0 },

      // 자재번호
      itemCodeOptions: [],
      chartItemCode: '76121-G9000-F1',
      itemSearch: '76121-G9000-F1', // 🔍 검색창의 실제 표시값(유저 입력)

      // 시각화 데이터
      chartMonths: [],
      chartSeries: [{ label: '비가동(분)', data: [] }],
      pieData: [],
      topNotes: [],
      actionTop: [],
      causeTop: [],
    };
  }

  componentDidMount() {
    this.fetchAllData();
  }

  // ---------- 유틸 ----------
  fmtNumber = (n) => new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(n ?? 0);
  fmtMinutes = (n) => `${this.fmtNumber(Math.round(n ?? 0))}분`;

  parseDate = (raw) => {
    if (!raw) return null;
    let s = String(raw).split('T')[0].replace(/[./]/g, '-');
    const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) s = `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
    const d = new Date(`${s}T00:00:00`);
    return isNaN(d) ? null : d;
  };
  monthKey = (d) =>
    d instanceof Date && !isNaN(d) ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : '';
  tickMonth = (ym) => {
    if (!ym) return '';
    const mm = Number(String(ym).split('-')[1] || 0);
    return `${mm}월`;
  };

  // ---------- 데이터 로드 ----------
  fetchAllData = async () => {
    this.setState({ loading: true, error: null });
    try {
      let res = await fetch('http://localhost:8000/smartFactory/downtime_grid/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!res.ok) {
        if (res.status === 405) {
          res = await fetch('http://localhost:8000/smartFactory/downtime_grid/list');
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      const arr = (Array.isArray(json) && json) || json?.data || json?.result || [];
      const formatted = this.formatApiData(arr);

      const itemCodes = [...new Set(formatted.map(r => (r.itemCode || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'ko'));

      const preferred = '76121-G9000-F1';
      const defaultCode = itemCodes.includes(preferred) ? preferred : (itemCodes[0] || '');

      const kpiSummary = this.computeKPISummary(
        this.applyKpiFilters(formatted, this.state.kpiFilters)
      );

      const { months, data } = this.aggregateMonthlyByItem(
        formatted, defaultCode, this.state.kpiFilters
      );
      const pieData = this.aggregateDowntimeNamePie(
        formatted, defaultCode, this.PIE_TOP_N, this.PIE_WITH_OTHERS, this.state.kpiFilters
      );
      const topNotes = this.summarizeTopNotes(
        formatted, defaultCode, 10, this.state.kpiFilters
      );
      const actionTop = this.summarizeActions(
        formatted, defaultCode, 8, this.state.kpiFilters
      );
      const causeTop = this.summarizeCauses(
        formatted, defaultCode, 8, this.state.kpiFilters
      );

      this.setState({
        loading: false,
        formattedData: formatted,
        itemCodeOptions: itemCodes,
        chartItemCode: defaultCode,
        itemSearch: defaultCode, // 🔄 검색창도 동기화
        kpiSummary,
        chartMonths: months,
        chartSeries: [{ label: '비가동(분)', data }],
        pieData,
        topNotes,
        actionTop,
        causeTop,
      });
    } catch (e) {
      console.error('[fetchAllData] Error:', e);
      this.setState({ loading: false, error: '데이터 로드 실패' });
    }
  };

  formatApiData = (apiData) =>
    apiData.map((item, idx) => ({
      id: item.id || idx + 1,
      workDate: this.parseDate(
        item.workDate ?? item.work_date ?? item.start_work_date ?? item['근무일자'] ?? item.date
      ),
      workplace: item.workplace ?? item.작업장 ?? item.work_place ?? '',
      itemCode: item.itemCode ?? item.자재번호 ?? item.item_code ?? '',
      downtimeName: item.downtimeName ?? item.비가동명 ?? item.downtime_name ?? '',
      downtimeMinutes: Number(item.downtimeMinutes ?? item['비가동(분)'] ?? item.비가동분 ?? 0) || 0,
      note: item.note ?? item.비고 ?? '',
    }));

  // ---------- 공통 필터(프레스+기간) ----------
  applyKpiFilters = (rows, f) => {
    const s = f.start_work_date ? this.parseDate(f.start_work_date) : null;
    const e = f.end_work_date ? this.parseDate(f.end_work_date) : null;
    const kw = (x) => String(x || '').toLowerCase();

    return rows.filter((r) => {
      if (r.workDate) {
        if (s && r.workDate < s) return false;
        if (e && r.workDate > e) return false;
      }
      if (f.press && f.press.trim()) {
        if (!kw(r.workplace).includes(kw(f.press))) return false;
      }
      return true;
    });
  };

  computeKPISummary = (rows) => {
    const total = rows.reduce((a, r) => a + (r.downtimeMinutes || 0), 0);
    const count = rows.length;
    const avg = count ? total / count : 0;

    const by = new Map();
    rows.forEach((r) => {
      const k = (r.downtimeName || '(없음)').trim();
      by.set(k, (by.get(k) || 0) + (r.downtimeMinutes || 0));
    });
    let topName = '-', topValue = 0;
    if (by.size) {
      const [n, v] = [...by.entries()].sort((a, b) => b[1] - a[1])[0];
      topName = n;
      topValue = v;
    }
    return { total, count, avg, topName, topValue };
  };

  ensureValidRange = (f) => {
    const s = this.parseDate(f.start_work_date);
    const e = this.parseDate(f.end_work_date);
    if (s && e && s > e) {
      return { ...f, end_work_date: f.start_work_date };
    }
    return f;
  };

  // KPI/차트 동시 갱신
  onKpiChange = (k) => (e) => {
    let next = { ...this.state.kpiFilters, [k]: e.target.value };
    next = this.ensureValidRange(next);

    const base = this.applyKpiFilters(this.state.formattedData, next);
    const kpiSummary = this.computeKPISummary(base);

    const code = this.state.chartItemCode;
    const { months, data } = this.aggregateMonthlyByItem(this.state.formattedData, code, next);
    const pieData = this.aggregateDowntimeNamePie(
      this.state.formattedData, code, this.PIE_TOP_N, this.PIE_WITH_OTHERS, next
    );
    const topNotes = this.summarizeTopNotes(this.state.formattedData, code, 10, next);
    const actionTop = this.summarizeActions(this.state.formattedData, code, 8, next);
    const causeTop = this.summarizeCauses(this.state.formattedData, code, 8, next);

    this.setState({
      kpiFilters: next,
      kpiSummary,
      chartMonths: months,
      chartSeries: [{ label: '비가동(분)', data }],
      pieData,
      topNotes,
      actionTop,
      causeTop,
    });
  };

  // ---------- 자재 자동완성 ----------
  // 입력어 기준 부분일치 정렬
  rankItemOptions = (options, inputValue) => {
    if (!inputValue) return options.slice(0, 20);
    const q = inputValue.toLowerCase();
    return options
      .map(o => ({ o, idx: o.toLowerCase().indexOf(q) }))
      .filter(x => x.idx >= 0)
      .sort((a, b) => a.idx - b.idx || a.o.length - b.o.length)
      .map(x => x.o)
      .slice(0, 20);
  };

  // 선택/입력 확정 시 차트 갱신
  commitItemCode = (code) => {
    if (!code) return;
    const { itemCodeOptions, kpiFilters } = this.state;
    const lower = code.toLowerCase();
    const exact = itemCodeOptions.find(c => c.toLowerCase() === lower);
    const fallback = itemCodeOptions.find(c => c.toLowerCase().includes(lower));
    const selected = exact || fallback;
    if (!selected) return;

    const { months, data } = this.aggregateMonthlyByItem(this.state.formattedData, selected, kpiFilters);
    const pieData = this.aggregateDowntimeNamePie(this.state.formattedData, selected, this.PIE_TOP_N, this.PIE_WITH_OTHERS, kpiFilters);
    const topNotes = this.summarizeTopNotes(this.state.formattedData, selected, 10, kpiFilters);
    const actionTop = this.summarizeActions(this.state.formattedData, selected, 8, kpiFilters);
    const causeTop = this.summarizeCauses(this.state.formattedData, selected, 8, kpiFilters);

    this.setState({
      chartItemCode: selected,
      itemSearch: selected,
      chartMonths: months,
      chartSeries: [{ label: '비가동(분)', data }],
      pieData,
      topNotes,
      actionTop,
      causeTop,
    });
  };

  clearItemSearch = () => {
    // ✅ 입력창만 깨끗하게 초기화 (차트 선택은 유지)
    this.setState({ itemSearch: '' });
  };

  // ---------- 집계 ----------
  aggregateMonthlyByItem = (rows, itemCode, kpiFilters = null) => {
    if (!itemCode) return { months: [], data: [] };
    let src = rows;
    if (kpiFilters) src = this.applyKpiFilters(src, kpiFilters);

    const m = new Map();
    src.forEach((r) => {
      if ((r.itemCode || '').trim() !== itemCode) return;
      const k = this.monthKey(r.workDate);
      if (!k) return;
      m.set(k, (m.get(k) || 0) + (r.downtimeMinutes || 0));
    });
    const months = [...m.keys()].sort();
    const data = months.map((k) => m.get(k));
    return { months, data };
  };

  aggregateDowntimeNamePie = (rows, itemCode, topN = 5, withOthers = true, kpiFilters = null) => {
    if (!itemCode) return [];
    let src = rows;
    if (kpiFilters) src = this.applyKpiFilters(src, kpiFilters);

    const m = new Map();
    src.forEach((r) => {
      if ((r.itemCode || '').trim() !== itemCode) return;
      const k = (r.downtimeName || '(비가동명없음)').trim();
      m.set(k, (m.get(k) || 0) + (r.downtimeMinutes || 0));
    });

    if (!m.size) return [];

    const sorted = [...m.entries()].sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, Math.max(0, topN));
    const othersSum = sorted.slice(topN).reduce((acc, [, v]) => acc + v, 0);

    const data = top.map(([label, value], i) => ({ id: i, label, value }));
    if (withOthers && othersSum > 0) data.push({ id: data.length, label: '기타', value: othersSum });
    return data;
  };

  // ---------- 비고 정규화/요약 ----------
  normalizeNote = (txt) => {
    if (!txt) return '';
    let t = String(txt).trim();

    t = t
      .replace(/\s+/g, ' ')
      .replace(/\b(\d{1,2}):\d{2}(?:-\d{1,2}:\d{2})?\b/g, '')
      .replace(/\b\d+\s*EA\b/ig, '')
      .replace(/\b\d+\s*회\b/g, '')
      .replace(/[-–—]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    t = t
      .replace(/\bOP\s*0?(\d{1,2})\b/ig, 'OP$1')
      .replace(/\bR#?\s*(\d)\b/ig, 'R#$1')
      .replace(/\bP#?\s*(\d)\b/ig, 'P#$1');

    const repl = [
      [/세정|세척/g, '청소'],
      [/교환/g, '교체'],
      [/리부팅|재기동/g, '재부팅'],
      [/발란스\s*블록?/g, '발란스블록'],
      [/언로딩\s*파트\s*감지\s*이상/g, '언로딩 센서 이상'],
      [/티칭수정/g, '티칭 수정'],
      [/무빙변경/g, '무빙 변경'],
    ];
    repl.forEach(([re, to]) => { t = t.replace(re, to); });

    return t.trim();
  };

  summarizeTopNotes = (rows, itemCode, topN = 10, kpiFilters = null) => {
    let src = rows;
    if (kpiFilters) src = this.applyKpiFilters(src, kpiFilters);

    const map = new Map();
    src.forEach((r) => {
      if ((r.itemCode || '').trim() !== itemCode) return;
      const norm = this.normalizeNote(r.note || '');
      if (!norm || norm.length < 2) return;
      const cur = map.get(norm) || { count: 0, minutes: 0 };
      map.set(norm, { count: cur.count + 1, minutes: cur.minutes + (r.downtimeMinutes || 0) });
    });
    return [...map.entries()]
      .map(([text, v]) => ({ text, ...v }))
      .sort((a, b) => b.count - a.count || b.minutes - a.minutes)
      .slice(0, topN);
  };

  summarizeActions = (rows, itemCode, topN = 10, kpiFilters = null) => {
    let src = rows;
    if (kpiFilters) src = this.applyKpiFilters(src, kpiFilters);

    const rules = [
      ['청소', /(청소|세척|세정)/],
      ['교체', /(교체|교환)/],
      ['점검', /(점검|확인|체크|확보)/],
      ['조정', /(조정|조절|셋팅|세팅|발란스블록|심\s*조정)/],
      ['수리/정비', /(수리|보수|정비|사상)/],
      ['티칭 수정', /(티칭\s*수정|티칭|데이터\s*수정)/],
      ['윤활', /(윤활|그리스|오일|급유)/],
      ['재부팅/재가동', /(재부팅|리셋|재가동|재기동)/],
      ['선별/이관', /(선별|이관)/],
      ['수동조작/수동교체', /(수동조작|수동교체|자동교환\s*불)/],
    ];
    const agg = new Map();
    const inc = (k, mins) => {
      const v = agg.get(k) || { count: 0, minutes: 0 };
      agg.set(k, { count: v.count + 1, minutes: v.minutes + (mins || 0) });
    };
    src.forEach((r) => {
      if ((r.itemCode || '').trim() !== itemCode) return;
      const t = String(r.note || '');
      let matched = false;
      for (const [label, re] of rules) {
        if (re.test(t)) {
          inc(label, r.downtimeMinutes);
          matched = true;
        }
      }
      if (!matched && t.trim()) inc('기타', r.downtimeMinutes);
    });
    return [...agg.entries()]
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => b.minutes - a.minutes || b.count - a.count)
      .slice(0, topN);
  };

  summarizeCauses = (rows, itemCode, topN = 10, kpiFilters = null) => {
    let src = rows;
    if (kpiFilters) src = this.applyKpiFilters(src, kpiFilters);

    const rules = [
      ['진공 이상', /(진공이상|진공에러|진공솔\s*작동\s*불|진공\s*지연)/],
      ['2매 감지', /(2매감지|두매\s*감지)/],
      ['비전 이상', /(비전\s*이상|오\s*촬영)/],
      ['언로딩/파트감지 이상', /(언로딩\s*센서|파트감지\s*이상)/],
      ['하사점 이탈/불일치', /(하사점\s*(이탈|불일치))/],
      ['QDC 후진/체결 불', /(QDC.*(후진|체결).*(불|지연))/],
      ['스크랩 취출/막힘', /(스크랩\s*(취출\s*불|막힘|정체))/],
      ['크랙/접힘/찍힘/넥', /(크랙|접힘|찍힘|요철|넥)/],
      ['무빙/안착 문제', /(무빙.*(지연|이상|인입\s*불)|안착\s*불)/],
      ['인버터/모터 이상', /(인버터\s*이상|모터.*이상|감속기)/],
      ['금형/센서 이상', /(금형\s*센서|금형\s*청소|게이지|센서\s*이상)/],
      ['공압/에어/컴프레서', /(에어\s*압|메인\s*에어|콤프레서|컴프레셔)/],
      ['컨베어/벨트 이상', /(컨베어|벨트)\s*(이상|정지|작동\s*불)/],
      ['차기 금형 미대기', /(차기\s*금형.*(미대기|부족)|금형\s*대기\s*지연)/],
      ['사양 교체/변경', /(사양\s*(교체|변경|확인))/],
    ];
    const agg = new Map();
    const inc = (k, mins) => {
      const v = agg.get(k) || { count: 0, minutes: 0 };
      agg.set(k, { count: v.count + 1, minutes: v.minutes + (mins || 0) });
    };
    src.forEach((r) => {
      if ((r.itemCode || '').trim() !== itemCode) return;
      const t = String(r.note || '');
      let hit = false;
      for (const [label, re] of rules) {
        if (re.test(t)) {
          inc(label, r.downtimeMinutes);
          hit = true;
        }
      }
      if (!hit && t.trim()) inc('기타', r.downtimeMinutes);
    });
    return [...agg.entries()]
      .map(([label, v]) => ({ label, ...v }))
      .sort((a, b) => b.count - a.count || b.minutes - a.minutes)
      .slice(0, topN);
  };

  // ---------- Render ----------
  render() {
    const {
      loading, error,
      kpiFilters, kpiSummary,
      itemCodeOptions, chartItemCode, chartMonths, chartSeries, pieData,
      topNotes, actionTop, causeTop, itemSearch
    } = this.state;

    const { themeHex } = this.props; // HEX만 꺼내 씀

    return (
      <div className={s.root} >
        <div className={s.titleCon}>
          <h1 style={{ color: themeHex }}>비가동 데이터 차트</h1>
          <p className={s.contant}>비가동 현황을 차트로 한눈에 파악할 수 있습니다.</p>
        </div>

        {/* KPI + 공통 필터 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2 }}>
            <PieChartIcon />
            비가동 현황 지표
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      mb: 3, p: 2, backgroundColor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            {/* 프레스 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '120px' }}>
                프레스(작업장):
              </Typography>
              <TextField
                select size="small" value={kpiFilters.press} onChange={this.onKpiChange('press')}
                sx={{ backgroundColor: 'background.paper', minWidth: 200,
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#4CAF50' },
                        '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                      }}}
              >
                <MenuItem value="">전체</MenuItem>
                <MenuItem value="1500T">1500T</MenuItem>
                <MenuItem value="1200T">1200T</MenuItem>
                <MenuItem value="1000T">1000T</MenuItem>
                <MenuItem value="1000PT">1000PT</MenuItem>
              </TextField>
            </Box>

            {/* 기간 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '80px' }}>
                기간 선택:
              </Typography>
              <TextField type="date" size="small" value={kpiFilters.start_work_date} onChange={this.onKpiChange('start_work_date')}
                sx={{ 
                      backgroundColor: 'background.paper',
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#4CAF50' },
                        '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  }}}
              />
              <Typography variant="body2" sx={{ color: '#666' }}>~</Typography>
              <TextField type="date" size="small" value={kpiFilters.end_work_date} onChange={this.onKpiChange('end_work_date')}
                sx={{ 
                      backgroundColor: 'background.paper',    
                      '& .MuiOutlinedInput-root': {
                        '&:hover fieldset': { borderColor: '#4CAF50' },
                        '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                      }}}
              />
            </Box>
          </Box>

          {/* KPI 카드 */}
          <Grid container spacing={2}>
            {[
              { label: '총 비가동(분)', value: this.fmtMinutes(kpiSummary.total), icon: <AccessTimeIcon color="warning" /> },
              { label: '건수', value: `${this.fmtNumber(kpiSummary.count)}건`, icon: <AssignmentIcon color="primary" /> },
              { label: '1건 평균(분)', value: this.fmtMinutes(kpiSummary.avg), icon: <TimelineIcon color="success" /> },
              { label: '최다 비가동명', value: kpiSummary.topName, icon: <BuildIcon color="error" /> },
            ].map((kpi, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper 
                  elevation={3} 
                  sx={{ 
                    p: 2, 
                    borderRadius: '16px', 
                    textAlign: 'center',
                    height: 160, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center',
                    "&:hover": {
                        backgroundColor: "#f5f5f5", // hover 시 배경색
                        cursor: "pointer",          // 마우스 포인터
                      },
                    }}>
                  <Box 
                    sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                    {React.cloneElement(kpi.icon, { fontSize: "large" })}
                  </Box>
                  <Typography variant="overline" sx={{fontSize: '13px', fontWeight: 'bold', color: 'text.secondary'}}>{kpi.label}</Typography>
                  <Typography variant="h4" sx={{ mt: .5, fontSize: '28px', fontWeight: 'bold' }}>{kpi.value}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* 차트 + 자재번호 검색 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2 }}>
            <BarChartIcon />
            자재별 월간 비가동
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2, p: 2,
                      backgroundColor: 'background.paper', borderRadius: 2, border: '1px solid #e0e0e0' }}>
            <Typography variant="body2" sx={{ fontWeight: 500, minWidth: '20px' }}>
              자재번호:
            </Typography>

            {/* 🔍 Google 스타일 자동완성 (입력 전용 제어) */}
            <Autocomplete
              freeSolo
              autoHighlight
              openOnFocus
              // 내장 clear는 끄고(버그 유발), 커스텀 X 사용
              disableClearable
              clearOnEscape
              clearOnBlur={false}
              selectOnFocus
              handleHomeEndKeys
              options={this.rankItemOptions(itemCodeOptions, itemSearch)}
              filterOptions={(x) => x} // 우리가 직접 필터/정렬함
              // ✅ 입력값만 제어: value는 아예 주지 않음(선택값이 입력을 덮어쓰지 않도록)
              inputValue={itemSearch}
              onInputChange={(e, value) => this.setState({ itemSearch: value })}
              // 옵션 선택 시 커밋
              onChange={(e, value) => this.commitItemCode(value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder="자재번호 검색"
                  onFocus={(e) => e.target.select()}              // 포커스 시 전체 선택 → 바로 덮어쓰기
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      this.commitItemCode(this.state.itemSearch);
                    }
                    if (e.key === 'Escape') {
                      e.preventDefault();
                      this.clearItemSearch();
                    }
                  }}
                  InputProps={{
                    ...params.InputProps,
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <>
                        {this.state.itemSearch ? (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              aria-label="clear"
                              onMouseDown={(ev) => ev.preventDefault()} // 포커스 유지
                              onClick={this.clearItemSearch}
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ) : null}
                        {params.InputProps.endAdornment /* Autocomplete 내부 adornment(loading 등) 유지 */}
                      </>
                    ),
                  }}
                  sx={{ 
                    backgroundColor: 'background.paper',
                    borderRadius: '8px',
                    minWidth: 220,
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': { borderColor: '#4CAF50' },
                      '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                    }
                  }}
                />
              )}
              renderOption={(props, option, { inputValue }) => {
                const i = option.toLowerCase().indexOf((inputValue || '').toLowerCase());
                return (
                  <li {...props}>
                    {i >= 0 ? (
                      <>
                        {option.slice(0, i)}
                        <strong>{option.slice(i, i + inputValue.length)}</strong>
                        {option.slice(i + inputValue.length)}
                      </>
                    ) : option}
                  </li>
                );
              }}
              noOptionsText={itemSearch ? '일치하는 자재번호가 없어요' : '검색어를 입력하세요'}
            />
          </Box>

          {/* 월별 합계 막대차트 */}
          {!loading && !error && chartItemCode && chartMonths.length > 0 ? (
            <BarChart
              xAxis={[{
                id: 'months',
                scaleType: 'band',
                data: chartMonths,
                label: '월',
                valueFormatter: this.tickMonth,
                tickLabelInterval: () => true,
              }]}
              yAxis={[{ label: '비가동(분)' }]}
              series={[{
                label: '비가동(분)',
                data: chartSeries[0].data,
                valueFormatter: (v) => `${this.fmtNumber(v)}분`,
                color: themeHex,
              }]}
              barLabel={(item) => `${item.value?.toString()}분`}
              height={420}
              margin={{ top: 24, right: 24, bottom: 64, left: 64 }}
              borderRadius={8}
              slotProps={{ legend: { hidden: true } }}
            />
          ) : (
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
              표시할 데이터가 없습니다.
            </Box>
          )}

          {/* 파이 + 비고 Top */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: '16px', height: '100%', display: 'flex',
                            flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                  {chartItemCode} · 비가동명 비중 (Top {this.PIE_TOP_N}{this.PIE_WITH_OTHERS ? ' + 기타' : ''})
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                  {pieData?.length ? (
                    <PieChart
                      series={[{
                        data: pieData,
                        arcLabel: (it) => it.label,
                        arcLabelMinAngle: 12,
                        innerRadius: 40,
                        paddingAngle: 2,
                      }]}
                      height={360}
                      margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
                      slotProps={{ legend: { direction: 'column', position: { vertical: 'middle', horizontal: 'right' } } }}
                    />
                  ) : (
                    <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                      해당 자재번호의 비가동명 데이터가 없습니다.
                    </Box>
                  )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                  {chartItemCode} · 가장 많이 등장한 비고
                </Typography>
                {topNotes.length ? (
                  <List dense>
                    {topNotes.map((n, i) => (
                      <ListItem 
                      key={i} 
                      disableGutters 
                      sx={{
                        "&:hover": {
                          backgroundColor: "#f5f5f5", // hover 시 배경색
                          cursor: "pointer",          // 마우스 포인터
                        },
                      }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    width: '100%', p: 0.5, borderBottom: '1px solid #f0f0f0' }}>
                          <Box sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            {i + 1}. {n.text}
                          </Box>
                          <Stack direction="row" spacing={1} sx={{ minWidth: 85 }}>
                            <Chip size="small" label={`${this.fmtNumber(n.count)}건`} 
                                  sx={{ minWidth: 45, backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 600 }} />
                            <Chip size="small" label={`${this.fmtNumber(n.minutes)}분`} 
                                  sx={{ minWidth: 45, backgroundColor: '#fce4ec', color: '#d81b60', fontWeight: 600 }} />
                          </Stack>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Typography color="text.secondary">반복적으로 등장한 비고가 없습니다.</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {/* 행동/원인 요약 */}
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                  조치 유형 Top (누적 분)
                </Typography>
                {actionTop.length ? (
                  <BarChart
                    xAxis={[{ id: 'act', scaleType: 'band', data: actionTop.map((d) => d.label) }]}
                    yAxis={[{ label: '누적 분' }]}
                    series={[{ 
                      data: actionTop.map((d) => d.minutes), 
                      valueFormatter: (v) => `${this.fmtNumber(v)}분`,
                      color: themeHex
                    }]}
                    height={320}
                    margin={{ top: 16, right: 24, bottom: 64, left: 64 }}
                    borderRadius={8}
                    slotProps={{ legend: { hidden: true } }}
                  />
                ) : (
                  <Typography color="text.secondary">표시할 데이터 없음</Typography>
                )}
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                  원인/증상 Top (건수)
                </Typography>
                {causeTop.length ? (
                  <BarChart
                    xAxis={[{ id: 'cause', scaleType: 'band', data: causeTop.map((d) => d.label) }]}
                    yAxis={[{ label: '건수' }]}
                    series={[{ 
                      data: causeTop.map((d) => d.count), 
                      valueFormatter: (v) => `${this.fmtNumber(v)}건`,
                      color: themeHex
                    }]}
                    height={320}
                    margin={{ top: 16, right: 24, bottom: 64, left: 64 }}
                    borderRadius={8}
                    slotProps={{ legend: { hidden: true } }}
                  />
                ) : (
                  <Typography color="text.secondary">표시할 데이터 없음</Typography>
                )}
              </Paper>
            </Grid>
          </Grid>

          {loading && <Typography sx={{ mt: 2 }}>로딩 중…</Typography>}
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
        </Paper>

      </div>
    );
  }
}

export default connect(mapStateToProps)(DowntimeChart);