// DowntimeChart.jsx
import React, { Component } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import {
  Box, Grid, TextField, MenuItem, Paper, Typography,
  Button, Tabs, Tab, Card, CardContent,
  Drawer, Divider, List, ListItem, ListItemText,
  Chip, Stack, ButtonGroup
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';
import s from './DowntimeChart.module.scss';

class DowntimeChart extends Component {
  constructor(props) {
    super(props);

    const today = new Date().toLocaleDateString('sv-SE');
    const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');

    this.state = {
      // 서버 전송용 전역 필터 (간단화)
      filters: {
        start_work_date: jan1,
        end_work_date: today,
        press: '1500T', // 기본값
      },

      // 기간 UI
      periodType: 'day',
      periodStartRaw: jan1,
      periodEndRaw: today,

      // 상태
      loading: false,
      error: null,

      // 데이터
      rawData: [],
      formattedData: [],

      // 막대차트
      itemCodes: [],
      months: [],
      series: [],

      selectedMonth: '',

      // 하단 Top-N
      topTab: 'itemCode',
      topNCount: 5,
      detailFilter: null,
      drawerOpen: false,
      selectedRow: null,
      similarCases: [],
    };
  }

  componentDidMount() {
    this.fetchDowntimeData();
  }

  toYYYYMMDD = (d) => {
    if (!(d instanceof Date) || isNaN(d)) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${dd}`;
  };

  // ───────── 서버 조회 ─────────
  fetchDowntimeData = async (filtersOverride = null) => {
    const filtersToUse = filtersOverride || this.state.filters;
    this.setState({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:8000/smartFactory/downtime_grid/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...filtersToUse }),
      });
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);

      const json = await response.json();
      const dataArray =
        (Array.isArray(json) && json) ||
        (Array.isArray(json?.data) && json.data) ||
        (Array.isArray(json?.result) && json.result) ||
        [];

      const formatted = this.formatApiData(dataArray);
      const { itemCodes, months, series } = this.aggregateForBar(formatted);

      const defaultMonth = months[months.length - 1] || '';

      this.setState({
        rawData: dataArray,
        formattedData: formatted,
        itemCodes,
        months,
        series,
        loading: false,
        selectedMonth: defaultMonth,
      });
    } catch (err) {
      console.error('[CHART] fetch error:', err);
      this.setState({ loading: false, error: '차트 데이터를 불러오는 중 오류가 발생했습니다.' });
    }
  };

  // ───────── 전처리 ─────────
  formatApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    return apiData.map((item, idx) => {
      const workDateRaw =
        item.workDate ?? item.start_work_date ?? item.end_work_date ?? item.date ?? '';
      let workDate = null;
      if (workDateRaw) {
        const d = new Date(workDateRaw);
        workDate = isNaN(d.getTime()) ? null : d;
      }
      return {
        id: item.id || idx + 1,
        workDate,
        plant: item.plant ?? '',
        workplace: item.workplace ?? '',
        itemCode: item.itemCode ?? '',
        carModel: item.carModel ?? '',
        downtimeName: item.downtimeName ?? '',
        downtimeMinutes: Number(item.downtimeMinutes) || 0,
        worker: item.worker ?? '',
        note: item.note ?? '',
      };
    });
  };

  monthKey = (d) => {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '(날짜없음)';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  aggregateForBar = (rows) => {
    const byItem = new Map();
    const monthSet = new Set();
    for (const r of rows) {
      const item = (r.itemCode || '').trim() || '(미지정)';
      const mKey = this.monthKey(r.workDate);
      monthSet.add(mKey);
      if (!byItem.has(item)) byItem.set(item, {});
      const bucket = byItem.get(item);
      bucket[mKey] = (bucket[mKey] || 0) + (Number(r.downtimeMinutes) || 0);
    }
    const itemCodes = Array.from(byItem.keys());
    const months = Array.from(monthSet).sort();
    const series = months.map((m) => ({
      label: m,
      data: itemCodes.map((code) => (byItem.get(code)?.[m] || 0)),
    }));
    return { itemCodes, months, series };
  };

  // KPI 계산
  computeKPIs = (rows, month) => {
    if (!month) return { total: 0, avgPerEvent: 0, changePct: null };
    const current = rows.filter(r => this.monthKey(r.workDate) === month);
    const total = current.reduce((acc, r) => acc + (Number(r.downtimeMinutes) || 0), 0);
    const count = current.length;
    const avgPerEvent = count > 0 ? total / count : 0;
    return { total, avgPerEvent, count };
  };

  // 적용 버튼
  applyButton = async () => {
    const { periodStartRaw, periodEndRaw, filters } = this.state;
    const filtersOverride = {
      ...filters,
      start_work_date: periodStartRaw,
      end_work_date: periodEndRaw,
    };
    await this.fetchDowntimeData(filtersOverride);
  };

  resetButton = async () => {
    const today = new Date().toLocaleDateString('sv-SE');
    const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');
    const filtersOverride = {
      start_work_date: jan1,
      end_work_date: today,
      press: '1500T',
    };
    this.setState({
      filters: filtersOverride,
      periodStartRaw: jan1,
      periodEndRaw: today,
    });
    await this.fetchDowntimeData(filtersOverride);
  };

  fmtNumber = (n) => new Intl.NumberFormat('ko-KR').format(n ?? 0);
  fmtMinutes = (n) => `${this.fmtNumber(Math.round(n ?? 0))}분`;

  render() {
    const {
      loading, error,
      itemCodes, series,
      selectedMonth,
      filters, periodStartRaw, periodEndRaw,
    } = this.state;

    const kpi = this.computeKPIs(this.state.formattedData, selectedMonth);
    const displaySeries = selectedMonth ? this.state.series.filter((s) => s.label === selectedMonth) : [];

    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>비가동 통계 차트</h1>

          {/* 필터바 단순화 */}
          <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: '16px' }}>
            <Grid container spacing={2} alignItems="center">

              {/* 프레스 선택 */}
              <Grid item xs={12} md={3}>
                <TextField
                  select size="small" label="프레스 선택"
                  value={filters.press}
                  onChange={(e) => this.setState(prev => ({ filters: { ...prev.filters, press: e.target.value } }))}
                  fullWidth
                >
                  <MenuItem value="1500T">1500T</MenuItem>
                  <MenuItem value="1000T">1000T</MenuItem>
                  <MenuItem value="500T">500T</MenuItem>
                </TextField>
              </Grid>

              {/* 기간 선택 */}
              <Grid item xs={12} md={3}>
                <TextField
                  size="small" label="시작일" type="date"
                  value={periodStartRaw}
                  onChange={(e) => this.setState({ periodStartRaw: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField
                  size="small" label="종료일" type="date"
                  value={periodEndRaw}
                  onChange={(e) => this.setState({ periodEndRaw: e.target.value })}
                  fullWidth
                />
              </Grid>

              <Grid item xs={12} md={3} sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={this.applyButton} variant="contained">적용</Button>
                <Button onClick={this.resetButton} variant="outlined">초기화</Button>
              </Grid>
            </Grid>
          </Paper>

          {/* KPI */}
          {!loading && !error && selectedMonth && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="overline">총 비가동(분)</Typography>
                  <Typography variant="h4">{this.fmtMinutes(kpi.total)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="overline">1건 평균</Typography>
                  <Typography variant="h4">{this.fmtMinutes(kpi.avgPerEvent)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="overline">건수</Typography>
                  <Typography variant="h4">{this.fmtNumber(kpi.count)} 건</Typography>
                </Paper>
              </Grid>
            </Grid>
          )}

          {/* 차트 */}
          {!loading && !error && selectedMonth && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Box className={s.chartSection} sx={{ p: 1 }}>
                  <h3>자재번호별 총 비가동시간 — {selectedMonth}</h3>
                  <BarChart
                    xAxis={[{ id: 'itemCodes', scaleType: 'band', data: itemCodes, label: '자재번호' }]}
                    yAxis={[{ label: '총 비가동(분)' }]}
                    series={displaySeries}
                    height={400}
                  />
                </Box>
              </Grid>
            </Grid>
          )}
        </div>
      </div>
    );
  }
}

export default DowntimeChart;
