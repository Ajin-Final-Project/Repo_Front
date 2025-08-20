// DowntimeChart.jsx
import React, { Component } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import {
  Box, Grid, TextField, MenuItem, Paper, Typography, Stack,
  InputAdornment, IconButton, List, ListItem, ListItemText, Chip
} from '@mui/material';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import s from './DowntimeChart.module.scss';

class DowntimeChart extends Component {
  constructor(props) {
    super(props);

    const DEFAULT_END = '2025-06-30'; // 기본 종료일(요구)
    const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');

    this.DEFAULT_END = DEFAULT_END;

    this.state = {
      loading: false,
      error: null,

      // 원본 데이터
      formattedData: [],

      // KPI 필터(프레스+기간) — KPI에만 적용
      kpiFilters: { start_work_date: jan1, end_work_date: DEFAULT_END, press: '' },
      kpiSummary: { total: 0, count: 0, avg: 0, topName: '-', topValue: 0 },

      // 차트 필터(자재번호) — 차트/파이/비고 요약에만 적용
      itemCodeOptions: [],
      chartItemCode: '76121-G9000-F1', // 기본 자재번호(요구)
      chartMonths: [],
      chartSeries: [{ label: '비가동(분)', data: [] }],
      pieData: [],

      // 파이 옆 Top 비고(정규화)
      topNotes: [], // [{text, count, minutes}]

      // (옵션) 추가 요약용
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
      // 1차: POST 시도
      let res = await fetch('http://localhost:8000/smartFactory/downtime_grid/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // 서버 필터 미적용: KPI/차트 각자 로컬필터
      });

      // 405 등 실패 시 GET 폴백
      if (!res.ok) {
        if (res.status === 405) {
          res = await fetch('http://localhost:8000/smartFactory/downtime_grid/list');
        }
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      }

      const json = await res.json();
      const arr = (Array.isArray(json) && json) || json?.data || json?.result || [];
      const formatted = this.formatApiData(arr);

      // 자재번호 옵션
      const itemCodes = [...new Set(formatted.map(r => (r.itemCode || '').trim()).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b, 'ko'));

      // 기본 자재 존재 여부 확인
      const preferred = '76121-G9000-F1';
      const defaultCode = itemCodes.includes(preferred) ? preferred : (itemCodes[0] || '');

      // KPI 초기 요약
      const kpiSummary = this.computeKPISummary(this.applyKpiFilters(formatted, this.state.kpiFilters));

      // 차트/파이/비고 요약 초기화
      const { months, data } = this.aggregateMonthlyByItem(formatted, defaultCode);
      const pieData = this.aggregateDowntimeNamePie(formatted, defaultCode);
      const topNotes = this.summarizeTopNotes(formatted, defaultCode);
      const actionTop = this.summarizeActions(formatted, defaultCode, 8);
      const causeTop = this.summarizeCauses(formatted, defaultCode, 8);

      this.setState({
        loading: false,
        formattedData: formatted,
        itemCodeOptions: itemCodes,
        chartItemCode: defaultCode,
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

  // ---------- KPI (프레스+기간만 적용) ----------
  applyKpiFilters = (rows, f) => {
    const s = f.start_work_date ? this.parseDate(f.start_work_date) : null;
    const e = f.end_work_date ? this.parseDate(f.end_work_date) : null;
    const kw = (x) => String(x || '').toLowerCase();

    return rows.filter((r) => {
      if (r.workDate) {
        if (s && r.workDate < s) return false;
        if (e && r.workDate > e) return false;
      }
      if (f.press && !kw(r.workplace).includes(kw(f.press))) return false;
      return true;
    });
  };

  computeKPISummary = (rows) => {
    const total = rows.reduce((a, r) => a + (r.downtimeMinutes || 0), 0);
    const count = rows.length;
    const avg = count ? total / count : 0;

    // 최다 비가동명(분 기준)
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

  // 날짜 역전 자동 보정(시작 > 종료면 종료일을 시작일로 맞춤)
  ensureValidRange = (f) => {
    const s = this.parseDate(f.start_work_date);
    const e = this.parseDate(f.end_work_date);
    if (s && e && s > e) {
      return { ...f, end_work_date: f.start_work_date };
    }
    return f;
  };

  // ★ 변경 포인트: 입력 즉시 KPI 재계산(적용 버튼 제거)
  onKpiChange = (k) => (e) => {
    let next = { ...this.state.kpiFilters, [k]: e.target.value };
    next = this.ensureValidRange(next);
    const filtered = this.applyKpiFilters(this.state.formattedData, next);
    const kpiSummary = this.computeKPISummary(filtered);
    this.setState({ kpiFilters: next, kpiSummary });
  };

  // ---------- 차트(자재 기준) ----------
  aggregateMonthlyByItem = (rows, itemCode) => {
    if (!itemCode) return { months: [], data: [] };
    const m = new Map();
    rows.forEach((r) => {
      if ((r.itemCode || '').trim() !== itemCode) return;
      const k = this.monthKey(r.workDate);
      if (!k) return;
      m.set(k, (m.get(k) || 0) + (r.downtimeMinutes || 0));
    });
    const months = [...m.keys()].sort(); // 데이터가 있는 월만
    const data = months.map((k) => m.get(k));
    return { months, data };
  };

  aggregateDowntimeNamePie = (rows, itemCode) => {
    if (!itemCode) return [];
    const m = new Map();
    rows.forEach((r) => {
      if ((r.itemCode || '').trim() !== itemCode) return;
      const k = (r.downtimeName || '(비가동명없음)').trim();
      m.set(k, (m.get(k) || 0) + (r.downtimeMinutes || 0));
    });
    return [...m.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([label, value], i) => ({ id: i, label, value }));
  };

  onItemChange = (e) => {
    const code = e.target.value;
    const { months, data } = this.aggregateMonthlyByItem(this.state.formattedData, code);
    const pieData = this.aggregateDowntimeNamePie(this.state.formattedData, code);
    const topNotes = this.summarizeTopNotes(this.state.formattedData, code);
    const actionTop = this.summarizeActions(this.state.formattedData, code, 8);
    const causeTop = this.summarizeCauses(this.state.formattedData, code, 8);

    this.setState({
      chartItemCode: code,
      chartMonths: months,
      chartSeries: [{ label: '비가동(분)', data }],
      pieData,
      topNotes,
      actionTop,
      causeTop,
    });
  };

  // ---------- 파이 옆 Top 비고(정규화) ----------
  normalizeNote = (txt) => {
    if (!txt) return '';
    let t = String(txt).trim();

    // 자주 등장하는 숫자/횟수/시간/하이픈류 제거·정리
    t = t
      .replace(/\s+/g, ' ')
      .replace(/\b(\d{1,2}):\d{2}(?:-\d{1,2}:\d{2})?\b/g, '') // 07:00-07:40 등
      .replace(/\b\d+\s*EA\b/ig, '')
      .replace(/\b\d+\s*회\b/g, '')
      .replace(/[-–—]+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    // OP/R/P 등 표기 통일
    t = t
      .replace(/\bOP\s*0?(\d{1,2})\b/ig, 'OP$1')
      .replace(/\bR#?\s*(\d)\b/ig, 'R#$1')
      .replace(/\bP#?\s*(\d)\b/ig, 'P#$1');

    // 동의어 통합
    const repl = [
      [/세정|세척/g, '청소'],
      [/교환/g, '교체'],
      [/리부팅|재기동/g, '재부팅'],
      [/발란스\s*블록?/g, '발란스블록'],
      [/언로딩\s*파트\s*감지\s*이상/g, '언로딩 센서 이상'],
      [/티칭수정/g, '티칭 수정'],
      [/무빙변경/g, '무빙 변경'],
    ];
    repl.forEach(([re, to]) => {
      t = t.replace(re, to);
    });

    return t.trim();
  };

  summarizeTopNotes = (rows, itemCode, topN = 10) => {
    const map = new Map();
    rows.forEach((r) => {
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

  // ---------- (옵션) 조치/원인 요약 ----------
  summarizeActions = (rows, itemCode, topN = 10) => {
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
    rows.forEach((r) => {
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

  summarizeCauses = (rows, itemCode, topN = 10) => {
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
    rows.forEach((r) => {
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
      topNotes, actionTop, causeTop
    } = this.state;

    return (
      <div className={s.root}>
        <div className={s.titleCon}>
          <h1>비가동 데이터 차트</h1>
          <p className={s.contant}>비가동 현황을 차트로 한눈에 파악할 수 있습니다.</p>
        </div>


        {/* KPI 필터: 프레스(좌) / 시작·종료(우) */}
        {/* KPI 필터: 프레스 + 기간 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1,
            color: '#ffb300',
            mb: 2
          }}>
            <PieChartIcon />
            비가동 현황 지표
          </Typography>

          {/* 필터 박스 */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 3,
            p: 2,
            backgroundColor: '#f8f9fa',
            borderRadius: 2,
            border: '1px solid #e0e0e0'
          }}>
            {/* 프레스 검색 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 500,
                color: '#333',
                minWidth: '100px'
              }}>
                프레스(작업장):
              </Typography>
              <TextField
                size="small"
                placeholder="프레스 검색"
                value={kpiFilters.press}
                onChange={this.onKpiChange('press')}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: !!kpiFilters.press && (
                    <IconButton
                      size="small"
                      onClick={() => this.onKpiChange('press')({ target: { value: '' } })}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                sx={{ 
                  backgroundColor: 'white',
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#4CAF50' },
                    '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  }
                }}
              />
            </Box>

            {/* 기간 선택 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 500,
                color: '#333',
                minWidth: '80px'
              }}>
                기간 선택:
              </Typography>
              <TextField
                type="date"
                size="small"
                value={kpiFilters.start_work_date}
                onChange={this.onKpiChange('start_work_date')}
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#4CAF50' },
                    '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  }
                }}
              />
              <Typography variant="body2" sx={{ color: '#666' }}>~</Typography>
              <TextField
                type="date"
                size="small"
                value={kpiFilters.end_work_date}
                onChange={this.onKpiChange('end_work_date')}
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#4CAF50' },
                    '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  }
                }}
              />
            </Box>
          </Box>

          {/* KPI 카드 (KPI 필터만 반영) */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: '16px', textAlign: 'center' }}>
                <Typography variant="overline" color="text.secondary">총 비가동(분)</Typography>
                <Typography variant="h4" sx={{ mt: .5 }}>{this.fmtMinutes(kpiSummary.total)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: '16px', textAlign: 'center' }}>
                <Typography variant="overline" color="text.secondary">건수</Typography>
                <Typography variant="h4" sx={{ mt: .5 }}>{this.fmtNumber(kpiSummary.count)}건</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: '16px', textAlign: 'center' }}>
                <Typography variant="overline" color="text.secondary">1건 평균(분)</Typography>
                <Typography variant="h4" sx={{ mt: .5 }}>{this.fmtMinutes(kpiSummary.avg)}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper elevation={2} sx={{ p: 2, borderRadius: '16px', textAlign: 'center' }}>
                <Typography variant="overline" color="text.secondary">최다 비가동명</Typography>
                <Typography variant="h6" sx={{ mt: .5, lineHeight: 1.3 }}>{kpiSummary.topName}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>
                  누적 {this.fmtMinutes(kpiSummary.topValue)}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>

          {/* 차트 필터 (자재번호) */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: '16px' }}>
            <Typography variant="h6" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: '#ffb300',
                mb: 2
              }}>
              <BarChartIcon />
              자재별 월간 비가동
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 3
            }}>
              <Typography variant="body1" sx={{ 
                fontWeight: 500,
                color: '#333'
              }}>
                월별 비가동을 확인하려면 자재를 선택하세요
              </Typography>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              p: 2,
              backgroundColor: '#f8f9fa',
              borderRadius: 2,
              border: '1px solid #e0e0e0'
            }}>
              <Typography variant="body2" sx={{ 
                fontWeight: 500,
                color: '#333',
                minWidth: '80px'
              }}>
                자재번호:
              </Typography>

              <TextField
                select
                size="small"
                value={chartItemCode}
                onChange={this.onItemChange}
                sx={{ 
                  backgroundColor: 'white',
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#4CAF50' },
                    '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                  }
                }}
              >
                {itemCodeOptions.length === 0 && (
                  <MenuItem value="">(자재번호 없음)</MenuItem>
                )}
                {itemCodeOptions.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

        {/* 월별 합계 막대차트 (자재 기준) */}
          <Typography variant="h6" sx={{ mb: 1 }}>
            {/* {chartItemCode ? `${chartItemCode} · 월별 비가동(분)` : '자재번호를 선택하세요'} */}
          </Typography>
          {!loading && !error && chartItemCode && chartMonths.length > 0 ? (
            <BarChart
              xAxis={[{
                id: 'months',
                scaleType: 'band',
                data: chartMonths,
                label: '월',
                valueFormatter: this.tickMonth, // '1월' 형식
                tickLabelInterval: () => true,
              }]}
              yAxis={[{ label: '비가동(분)' }]}
              series={[{
                label: '비가동(분)',
                data: chartSeries[0].data,
                valueFormatter: (v) => `${this.fmtNumber(v)}분`,
                color: '#ffb300',
              }]}
              height={420}
              margin={{ top: 24, right: 24, bottom: 64, left: 64 }}
              slotProps={{ legend: { hidden: true } }}
            />
          ) : (
            <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
              표시할 데이터가 없습니다.
            </Box>
          )}
        </Paper>

        {/* 파이차트 + Top 비고(정규화) 나란히 */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          {/* 좌: 비가동명 파이 */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ 
                p: 2, 
                borderRadius: '16px', 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'center', 
                alignItems: 'center'
              }}>
              <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>{chartItemCode} · 비가동명 비중</Typography>
              <Box
                  sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center', 
                  width: '100%' 
                }}
              >
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

          {/* 우: 가장 많이 등장한 비고(정규화) */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
              <Typography variant="h6" sx={{ mb: 1, textAlign: 'center' }}>{chartItemCode} · 가장 많이 등장한 비고</Typography>
              {topNotes.length ? (
                <List dense>
                  {topNotes.map((n, i) => (
                    <ListItem key={i} disableGutters>
                      <Box 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          width: '100%',
                          p: 0.5,
                          borderBottom: '1px solid #f0f0f0'
                        }}
                      >
                        {/* 왼쪽 조치 내용 */}
                        <Box sx={{ 
                          // px: 1.5, py: 0.5, 
                          borderRadius: 1, 
                          // backgroundColor: '#f5f5f5',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          color: '#333'
                        }}>
                          {i + 1}. {n.text}
                        </Box>

                        {/* 오른쪽 집계 */}
                        <Stack direction="row" spacing={1} sx={{ minWidth: 85 }}>
                          <Chip 
                            size="small" 
                            label={`${this.fmtNumber(n.count)}건`} 
                            sx={{ minWidth: 45, backgroundColor: '#e3f2fd', color: '#1976d2', fontWeight: 600 }}
                          />
                          <Chip 
                            size="small" 
                            label={`${this.fmtNumber(n.minutes)}분`} 
                            sx={{ minWidth: 45, backgroundColor: '#fce4ec', color: '#d81b60', fontWeight: 600 }}
                          />
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

        {/* (옵션) 행동/원인 요약 */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, textAlign: 'center' }}>조치 유형 Top (누적 분)</Typography>
              {actionTop.length ? (
                <BarChart
                  xAxis={[{ id: 'act', scaleType: 'band', data: actionTop.map((d) => d.label) }]}
                  yAxis={[{ label: '누적 분' }]}
                  series={[{ 
                    data: actionTop.map((d) => d.minutes), 
                    valueFormatter: (v) => `${this.fmtNumber(v)}분`,
                    color: '#ffb300'
                  }]}
                  height={320}
                  margin={{ top: 16, right: 24, bottom: 64, left: 64 }}
                  slotProps={{ legend: { hidden: true } }}
                />
              ) : (
                <Typography color="text.secondary">표시할 데이터 없음</Typography>
              )}
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
              <Typography variant="subtitle1" sx={{ mb: 1, textAlign: 'center' }}>원인/증상 Top (건수)</Typography>
              {causeTop.length ? (
                <BarChart
                  xAxis={[{ id: 'cause', scaleType: 'band', data: causeTop.map((d) => d.label) }]}
                  yAxis={[{ label: '건수' }]}
                  series={[{ 
                    data: causeTop.map((d) => d.count), 
                    valueFormatter: (v) => `${this.fmtNumber(v)}건`,
                    color: '#ffb300'
                  }]}
                  height={320}
                  margin={{ top: 16, right: 24, bottom: 64, left: 64 }}
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
      </div>
    );
  }
}

export default DowntimeChart;
