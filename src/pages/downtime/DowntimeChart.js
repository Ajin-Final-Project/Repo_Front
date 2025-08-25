import React, { Component } from 'react';
import { connect } from "react-redux";

import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import {
  Box, Grid, TextField, MenuItem, Paper, Typography, Stack,
  InputAdornment, IconButton, List, ListItem, Chip, CircularProgress
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
    const jan1 = '2024-01-01';

    this.DEFAULT_END = DEFAULT_END;
    this.PIE_TOP_N = 5;          // 총 5개로 제한
    this.PIE_WITH_OTHERS = true; // 기타 포함
    this.API = (path) => `http://localhost:8000/smartFactory${path}`;

    this.ctrl = { summary:null, monthly:null, pie:null, notes:null, codes:null };

    this.state = {
      // 전역 로딩/에러 (전체 스피너)
      pageLoading: false,
      pageError: null,

      // 섹션별 로딩/에러
      loading: { summary:false, monthly:false, pie:false, notes:false, codes:false },
      error:   { summary:null,  monthly:null,  pie:null,  notes:null,  codes:null  },

      // 필터(press → workplace로 서버 전송)
      kpiFilters: { start_work_date: jan1, end_work_date: DEFAULT_END, press: '1500T' },

      kpiSummary: { total: 0, count: 0, avg: 0, topName: '-', topValue: 0 },

      itemCodeOptions: [],
      chartItemCode: '',
      itemSearch: '',

      chartMonths: [],
      chartSeries: [{ label: '비가동(분)', data: [] }],
      pieData: [],
      topNotes: [],
    };
  }

  componentDidMount() {
    this.fetchItemCodes().then((codes) => {
      const preferred = '64312-JI000';
      const defaultCode = codes.includes(preferred) ? preferred : (codes[0] || '');
      this.setState(
        { chartItemCode: defaultCode, itemSearch: defaultCode },
        () => this.fetchAllSections()
      );
    });
  }

  // ---------- utils ----------
  abortPrev = (key) => {
    try { this.ctrl[key]?.abort(); } catch(e) {}
    this.ctrl[key] = new AbortController();
    return this.ctrl[key].signal;
  };
  setLoading = (key, v) => this.setState(s => ({ loading: { ...s.loading, [key]: v } }));
  setError   = (key, v) => this.setState(s => ({ error:   { ...s.error,   [key]: v } }));

  parseDate = (raw) => {
    if (!raw) return null;
    let s = String(raw).split('T')[0].replace(/[./]/g, '-');
    const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) s = `${m[1]}-${String(m[2]).padStart(2,'0')}-${String(m[3]).padStart(2,'0')}`;
    const d = new Date(`${s}T00:00:00`);
    return isNaN(d) ? null : d;
  };
  ensureValidRange = (f) => {
    const sd = this.parseDate(f.start_work_date);
    const ed = this.parseDate(f.end_work_date);
    if (sd && ed && sd > ed) return { ...f, end_work_date: f.start_work_date };
    return f;
  };

  // ✅ YYYY년 M월 라벨로 출력
  monthKeyToLabel = (ym) => {
    //년 월 형식으로 변환
    // const [y, m] = String(ym).split('-'); // 'YYYY-MM'
    // return `${y}년${Number(m)}월`;
    // 월 형식으로 변환
    const mm = Number(String(ym).split('-')[1] || 0);
    return `${mm}월`;
  };

  fmtNumber = (n) => new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(n ?? 0);
  fmtMinutes = (n) => `${this.fmtNumber(Math.round(n ?? 0))}분`;

  normalizeSummary = (json) => ({
    total: Number(json?.total ?? 0),
    count: Number(json?.count ?? 0),
    avg:   Number(json?.avg ?? 0),
    topName: String(json?.topName ?? '-'),
    topValue: Number(json?.topValue ?? 0),
  });

  normalizeMonthly = (arr) => {
    const months = (arr || []).map(r => String(r.ym)).sort();
    const data   = months.map(m => Number(arr.find(x => x.ym === m)?.minutes ?? 0));
    return { months, data };
  };

  // ✅ 기타 포함 총 5개로 제한 (상위 4개 + 기타). 나머지 합이 0이면 Top 5 반환.
  normalizePie = (arr) => {
    const sorted = (arr || []).slice().sort((a,b) => (b.minutes||0) - (a.minutes||0));

    if (this.PIE_WITH_OTHERS) {
      if (sorted.length >= this.PIE_TOP_N) {
        const topCount = this.PIE_TOP_N - 1; // 4개
        const top = sorted.slice(0, topCount);
        const othersSum = sorted.slice(topCount).reduce((s,x) => s + (x.minutes || 0), 0);

        if (othersSum > 0) {
          const dataTop = top.map((r,i) => ({
            id: i,
            label: r.label || '(없음)',
            value: Number(r.minutes || 0),
          }));
          dataTop.push({ id: dataTop.length, label: '기타', value: othersSum });
          return dataTop; // 총 5개
        }
        // 나머지 합이 0이면 단순 Top 5
        return sorted.slice(0, this.PIE_TOP_N).map((r,i) => ({
          id: i, label: r.label || '(없음)', value: Number(r.minutes || 0)
        }));
      }
      // 5개 미만이면 그대로 반환
      return sorted.map((r,i) => ({
        id: i, label: r.label || '(없음)', value: Number(r.minutes || 0)
      }));
    }

    // 기타 미포함 모드
    return sorted.slice(0, this.PIE_TOP_N).map((r,i) => ({
      id: i, label: r.label || '(없음)', value: Number(r.minutes || 0)
    }));
  };

  normalizeTopNotes = (arr) => (arr||[]).map(x => ({
    text: String(x.text || ''), count: Number(x.count || 0), minutes: Number(x.minutes || 0)
  }));

  setStateAsync = (st) => new Promise((res)=>this.setState(st, res));

  // ---------- API ----------
  async fetchJson(url, options, key) {
    const res = await fetch(url, options);
    if (!res.ok) {
      const txt = await res.text().catch(()=> '');
      throw new Error(`${key || 'API'} 실패: HTTP ${res.status} ${txt}`);
    }
    return res.json();
  }

  // 자재번호 목록
  fetchItemCodes = async () => {
    const { kpiFilters } = this.state;
    this.setLoading('codes', true); this.setError('codes', null);
    try {
      const qs = new URLSearchParams({
        workplace:       kpiFilters.press || '',
        start_work_date: kpiFilters.start_work_date || '',
        end_work_date:   kpiFilters.end_work_date || '',
      }).toString();
      const signal = this.abortPrev('codes');
      const json = await this.fetchJson(this.API(`/downtime_chart/item-codes?${qs}`), { signal }, '자재코드');
      const codes = Array.isArray(json?.data) ? json.data : [];
      this.setState({ itemCodeOptions: codes });
      return codes;
    } catch (e) {
      console.error('[fetchItemCodes]', e);
      this.setError('codes', e.message || '자재번호 목록 조회 실패');
      this.setState({ itemCodeOptions: [] });
      return [];
    } finally {
      this.setLoading('codes', false);
    }
  };

  // KPI Summary
  fetchSummary = async () => {
    const { kpiFilters } = this.state;
    this.setLoading('summary', true); this.setError('summary', null);
    try {
      const signal = this.abortPrev('summary');
      const json = await this.fetchJson(this.API('/downtime_chart/summary'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          start_work_date: kpiFilters.start_work_date,
          end_work_date:   kpiFilters.end_work_date,
          workplace:       kpiFilters.press,
        }),
      }, 'summary');
      const payload = json?.data || json;
      this.setState({ kpiSummary: this.normalizeSummary(payload) });
    } catch (e) {
      console.error('[fetchSummary]', e);
      this.setError('summary', e.message || 'KPI 요약 조회 실패');
      throw e;
    } finally {
      this.setLoading('summary', false);
    }
  };

  // 월별 합계
  fetchMonthly = async () => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!chartItemCode) {
      this.setState({ chartMonths: [], chartSeries: [{ label: '비가동(분)', data: [] }] });
      return;
    }
    this.setLoading('monthly', true); this.setError('monthly', null);
    try {
      const signal = this.abortPrev('monthly');
      const json = await this.fetchJson(this.API('/downtime_chart/monthly'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          start_work_date: kpiFilters.start_work_date,
          end_work_date:   kpiFilters.end_work_date,
          workplace:       kpiFilters.press,
          itemCode:        chartItemCode,
        }),
      }, 'monthly');
      const rows = Array.isArray(json?.data) ? json.data : [];
      const { months, data } = this.normalizeMonthly(rows);
      this.setState({ chartMonths: months, chartSeries: [{ label: '비가동(분)', data }] });
    } catch (e) {
      console.error('[fetchMonthly]', e);
      this.setError('monthly', e.message || '월별 합계 조회 실패');
      this.setState({ chartMonths: [], chartSeries: [{ label: '비가동(분)', data: [] }] });
      throw e;
    } finally {
      this.setLoading('monthly', false);
    }
  };

  // 파이
  fetchPie = async () => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!chartItemCode) { this.setState({ pieData: [] }); return; }
    this.setLoading('pie', true); this.setError('pie', null);
    try {
      const signal = this.abortPrev('pie');
      const json = await this.fetchJson(this.API('/downtime_chart/pie'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          start_work_date: kpiFilters.start_work_date,
          end_work_date:   kpiFilters.end_work_date,
          workplace:       kpiFilters.press,
          itemCode:        chartItemCode,
          top:             this.PIE_TOP_N,
          withOthers:      this.PIE_WITH_OTHERS
        }),
      }, 'pie');
      const rows = Array.isArray(json?.data) ? json.data : [];
      this.setState({ pieData: this.normalizePie(rows) });
    } catch (e) {
      console.error('[fetchPie]', e);
      this.setError('pie', e.message || '파이 데이터 조회 실패');
      this.setState({ pieData: [] });
      throw e;
    } finally {
      this.setLoading('pie', false);
    }
  };

  // 비고 Top
  fetchTopNotes = async () => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!chartItemCode) { this.setState({ topNotes: [] }); return; }
    this.setLoading('notes', true); this.setError('notes', null);
    try {
      const signal = this.abortPrev('notes');
      const json = await this.fetchJson(this.API('/downtime_chart/top-notes'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal,
        body: JSON.stringify({
          start_work_date: kpiFilters.start_work_date,
          end_work_date:   kpiFilters.end_work_date,
          workplace:       kpiFilters.press,
          itemCode:        chartItemCode,
          limit: 10
        }),
      }, 'top-notes');
      const rows = Array.isArray(json?.data) ? json.data : [];
      this.setState({ topNotes: this.normalizeTopNotes(rows) });
    } catch (e) {
      console.error('[fetchTopNotes]', e);
      this.setError('notes', e.message || '비고 Top 조회 실패');
      this.setState({ topNotes: [] });
      throw e;
    } finally {
      this.setLoading('notes', false);
    }
  };

  // 전역 로딩/에러 기반 일괄 호출
  fetchAllSections = async () => {
    this.setState({ pageLoading: true, pageError: null });
    try {
      await Promise.all([
        this.fetchSummary(),
        this.fetchMonthly(),
        this.fetchPie(),
        this.fetchTopNotes(),
      ]);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      this.setState({ pageError: '데이터를 불러오는 중 오류가 발생했습니다.' });
    } finally {
      this.setState({ pageLoading: false });
    }
  };

  // 필터 변경
  onKpiChange = (k) => async (e) => {
    const next = this.ensureValidRange({ ...this.state.kpiFilters, [k]: e.target.value });
    await this.setStateAsync({ kpiFilters: next });
    const codes = await this.fetchItemCodes();
    let selected = this.state.chartItemCode;
    if (!codes.includes(selected)) {
      selected = codes[0] || '';
      await this.setStateAsync({ chartItemCode: selected, itemSearch: selected });
    }
    this.fetchAllSections();
  };

  // 자재 자동완성
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
  commitItemCode = async (code) => {
    if (!code) return;
    const { itemCodeOptions } = this.state;
    const lower = code.toLowerCase();
    const exact = itemCodeOptions.find(c => c.toLowerCase() === lower);
    const fallback = itemCodeOptions.find(c => c.toLowerCase().includes(lower));
    const selected = exact || fallback;
    if (!selected) return;
    await this.setStateAsync({ chartItemCode: selected, itemSearch: selected });
    this.fetchAllSections();
  };
  clearItemSearch = () => this.setState({ itemSearch: '' });

  // ---------- render ----------
  render() {
    const {
      pageLoading, pageError,
      loading, error, kpiFilters, kpiSummary,
      itemCodeOptions, chartItemCode, chartMonths, chartSeries, pieData,
      topNotes, itemSearch
    } = this.state;
    const { themeHex } = this.props;

    return (
      <div className={s.root}>
        <div className={s.titleCon}>
          <h1 style={{ color: themeHex }}>비가동 데이터 차트</h1>
          <p className={s.contant}>비가동 현황을 차트로 한눈에 파악할 수 있습니다.</p>
        </div>

        {/* KPI + 공통 필터 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          {pageLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
            </Box>
          ) : pageError ? (
            <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
              {pageError}
            </Typography>
          ) : (
            <>
              <Typography variant="h6" sx={{ display:'flex', alignItems:'center', gap:1, color: themeHex, mb:2 }}>
                <PieChartIcon /> 비가동 현황 지표
              </Typography>

              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                        mb:3, p:2, backgroundColor:'background.paper', borderRadius:2, border:'1px solid #e0e0e0' }}>
                {/* 프레스(작업장) */}
                <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
                  <Typography variant="body2" sx={{ fontWeight:500, minWidth:'120px' }}>프레스(작업장):</Typography>
                  <TextField select size="small" value={kpiFilters.press} onChange={this.onKpiChange('press')}
                    sx={{ backgroundColor:'background.paper', minWidth:200,
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: '#4CAF50' },
                            '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                          }}}>
                    <MenuItem value="1500T">1500T</MenuItem>
                    <MenuItem value="1200T">1200T</MenuItem>
                    <MenuItem value="1000T">1000T</MenuItem>
                    <MenuItem value="1000T PRO">1000T PRO</MenuItem>
                  </TextField>
                </Box>

                {/* 기간 */}
                <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
                  <Typography variant="body2" sx={{ fontWeight:500, minWidth:'80px' }}>기간 선택:</Typography>
                  <TextField type="date" size="small" value={kpiFilters.start_work_date} onChange={this.onKpiChange('start_work_date')}
                    sx={{ backgroundColor:'background.paper',
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: '#4CAF50' },
                            '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                          }}} />
                  <Typography variant="body2" sx={{ color:'#666' }}>~</Typography>
                  <TextField type="date" size="small" value={kpiFilters.end_work_date} onChange={this.onKpiChange('end_work_date')}
                    sx={{ backgroundColor:'background.paper',
                          '& .MuiOutlinedInput-root': {
                            '&:hover fieldset': { borderColor: '#4CAF50' },
                            '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                          }}} />
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
                    <Paper elevation={3} sx={{ p:2, borderRadius:'16px', textAlign:'center',
                      height:160, display:'flex', flexDirection:'column', justifyContent:'center',
                      "&:hover": { backgroundColor:"#f5f5f5", cursor:"pointer" }}}>
                      <Box sx={{ display:'flex', justifyContent:'center', mb:1 }}>
                        {React.cloneElement(kpi.icon, { fontSize:"large" })}
                      </Box>
                      <Typography variant="overline" sx={{fontSize:'13px', fontWeight:'bold', color:'text.secondary'}}>{kpi.label}</Typography>
                      <Typography variant="h4" sx={{ mt:.5, fontSize:'28px', fontWeight:'bold' }}>{kpi.value}</Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>

              {loading.summary && <Box sx={{ mt:2, display:'flex', alignItems:'center', gap:1 }}><CircularProgress size={18}/><span>지표 로딩…</span></Box>}
              {error.summary && <Typography color="error" sx={{ mt: 1 }}>{error.summary}</Typography>}
            </>
          )}
        </Paper>

        {/* 차트 + 자재번호 검색 */}
        <Paper sx={{ p:3, mb:3, borderRadius:'16px' }}>
          {pageLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
            </Box>
          ) : pageError ? (
            <Typography color="error" sx={{ textAlign: 'center', py: 4 }}>
              {pageError}
            </Typography>
          ) : (
            <>
              <Typography variant="h6" sx={{ display:'flex', alignItems:'center', gap:1, color: themeHex, mb:2 }}>
                <BarChartIcon /> 자재별 월간 비가동
              </Typography>

              <Box sx={{ display:'flex', justifyContent:'flex-end', alignItems:'center', gap:2, p:2,
                        backgroundColor:'background.paper', borderRadius:2, border:'1px solid #e0e0e0' }}>
                <Typography variant="body2" sx={{ fontWeight:500, minWidth:'20px' }}>자재번호:</Typography>

                <Autocomplete
                  freeSolo autoHighlight openOnFocus
                  disableClearable clearOnEscape clearOnBlur={false} selectOnFocus handleHomeEndKeys
                  options={this.rankItemOptions(itemCodeOptions, itemSearch)}
                  filterOptions={(x) => x}
                  inputValue={itemSearch}
                  onInputChange={(e, value) => this.setState({ itemSearch: value })}
                  onChange={(e, value) => this.commitItemCode(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="자재번호 검색"
                      onFocus={(e) => e.target.select()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') { e.preventDefault(); this.commitItemCode(this.state.itemSearch); }
                        if (e.key === 'Escape') { e.preventDefault(); this.clearItemSearch(); }
                      }}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                        ),
                        endAdornment: (
                          <>
                            {this.state.itemSearch ? (
                              <InputAdornment position="end">
                                <IconButton size="small" aria-label="clear"
                                  onMouseDown={(ev) => ev.preventDefault()} onClick={this.clearItemSearch}>
                                  <ClearIcon fontSize="small" />
                                </IconButton>
                              </InputAdornment>
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      sx={{ backgroundColor:'background.paper', borderRadius:'8px', minWidth:220,
                            '& .MuiOutlinedInput-root': {
                              '&:hover fieldset': { borderColor: '#4CAF50' },
                              '&.Mui-focused fieldset': { borderColor: '#4CAF50' },
                            }}}
                    />
                  )}
                  renderOption={(props, option, { inputValue }) => {
                    const i = option.toLowerCase().indexOf((inputValue || '').toLowerCase());
                    return (
                      <li {...props}>
                        {i >= 0 ? (<>{option.slice(0, i)}<strong>{option.slice(i, i + inputValue.length)}</strong>{option.slice(i + inputValue.length)}</>) : option}
                      </li>
                    );
                  }}
                  noOptionsText={itemSearch ? '일치하는 자재번호가 없어요' : '검색어를 입력하세요'}
                />
              </Box>

              {/* 월별 막대차트 */}
              {(!loading.monthly && !error.monthly && chartItemCode && chartMonths.length > 0) ? (
                <BarChart
                  xAxis={[{
                    id: 'months',
                    scaleType: 'band',
                    data: chartMonths,                 
                    label: '월',                  
                    valueFormatter: this.monthKeyToLabel,
                    tickLabelInterval: () => true,
                  }]}
                  yAxis={[{ label: '비가동(분)' }]}
                  series={[{
                    label: '비가동(분)',
                    data: chartSeries[0].data,
                    valueFormatter: (v) => `${this.fmtNumber(v)}분`,
                    color: this.props.themeHex,
                  }]}
                  barLabel={(item) => `${item.value?.toString()}분`}
                  height={420}
                  margin={{ top: 24, right: 24, bottom: 64, left: 64 }}
                  borderRadius={8}
                  slotProps={{ legend: { hidden: true } }}
                />
              ) : (
                <Box sx={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary', gap: 1 }}>
                  {loading.monthly ? <><CircularProgress size={18}/> 월별 합계 로딩…</> : '표시할 데이터가 없습니다.'}
                </Box>
              )}
              {error.monthly && <Typography color="error" sx={{ mt: 1 }}>{error.monthly}</Typography>}

              {/* 파이 + 비고 Top */}
              <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: '16px', height: '100%', display: 'flex',
                                flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                      {chartItemCode || '-'} · 비가동명 비중 (Top {this.PIE_TOP_N}{this.PIE_WITH_OTHERS ? ', 기타 포함' : ''})
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%' }}>
                      {pieData?.length ? (
                        <PieChart
                          series={[{
                            data: pieData,               // ✅ 최대 5개 (Top4 + 기타)
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
                        <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color:'text.secondary', gap:1 }}>
                          {loading.pie ? <><CircularProgress size={18}/> 파이 데이터 로딩…</> : '해당 자재번호의 비가동명 데이터가 없습니다.'}
                        </Box>
                      )}
                    </Box>
                    {error.pie && <Typography color="error" sx={{ mt: 1 }}>{error.pie}</Typography>}
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, borderRadius: '16px', height: '100%' }}>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600, textAlign: 'center' }}>
                      {chartItemCode || '-'} · 가장 많이 등장한 비고
                    </Typography>
                    {topNotes.length ? (
                      <List dense>
                        {topNotes.map((n, i) => (
                          <ListItem key={i} disableGutters sx={{ "&:hover": { backgroundColor: "#f5f5f5", cursor: "pointer" }}}>
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
                      <Box sx={{ minHeight: 120, display:'flex', alignItems:'center', justifyContent:'center', color:'text.secondary', gap:1 }}>
                        {loading.notes ? <><CircularProgress size={18}/> 비고 데이터 로딩…</> : '반복적으로 등장한 비고가 없습니다.'}
                      </Box>
                    )}
                    {error.notes && <Typography color="error" sx={{ mt: 1 }}>{error.notes}</Typography>}
                  </Paper>
                </Grid>
              </Grid>
            </>
          )}
        </Paper>
      </div>
    );
  }
}

export default connect(mapStateToProps)(DowntimeChart);
