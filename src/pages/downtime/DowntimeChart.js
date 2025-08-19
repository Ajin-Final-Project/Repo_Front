// DowntimeChart.jsx
import React, { Component } from 'react';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { Box, Grid, TextField, MenuItem } from '@mui/material';
import s from './DowntimeChart.module.scss';

class DowntimeChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // DowntimeGrid와 동일한 필터
      filters: {
        start_work_date: new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE'),
        end_work_date: new Date().toLocaleDateString('sv-SE'),
        plant: '',
        worker: '',
        workplace: '',
        itemCode: '',
        carModel: '',
        downtimeCode: '',
        downtimeName: '',
        downtimeMinutes: null,
        note: '',
      },

      // 상태
      loading: false,
      error: null,

      // 원본/전처리/차트 데이터
      rawData: [],
      formattedData: [],

      // 막대차트용
      itemCodes: [],   // x축 카테고리(자재번호)
      months: [],      // YYYY-MM 리스트
      series: [],      // [{label:'YYYY-MM', data:[...]}]

      // 선택 상태
      selectedMonth: '',
      availableItemCodes: [], // 선택한 월에 실제 데이터가 있는 자재번호들
      selectedItemCode: '',

      // 파이차트용
      pieData: [],     // [{id, value, label}] : 비가동명별 누적 분
    };
  }

  componentDidMount() {
    this.fetchDowntimeData();
  }

  // ───────────────── DB 조회 ─────────────────
  fetchDowntimeData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:8000/smartFactory/downtime_grid/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...this.state.filters }),
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

      // 기본 선택: 최신 월 + 그 월에서 첫 번째 자재번호
      const defaultMonth = months[months.length - 1] || '';
      const availableItemCodes = this.getAvailableItemCodesForMonth(formatted, defaultMonth);
      const defaultItem = availableItemCodes[0] || '';

      this.setState(
        {
          rawData: dataArray,
          formattedData: formatted,
          itemCodes,
          months,
          series,
          loading: false,
          selectedMonth: defaultMonth,
          availableItemCodes,
          selectedItemCode: defaultItem,
        },
        this.updatePieData // 파이차트 데이터 생성
      );
    } catch (err) {
      console.error('[CHART] fetch error:', err);
      this.setState({ loading: false, error: '차트 데이터를 불러오는 중 오류가 발생했습니다.' });
    }
  };

  // ─────────────── 전처리 (DowntimeGrid와 동일) ───────────────
  formatApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    return apiData.map((item, idx) => {
      const workDateRaw =
        item.workDate ?? item.work_date ?? item.start_work_date ?? item.end_work_date ??
        item['근무일자'] ?? item.date ?? item.Date ?? '';

      let workDate = null;
      if (workDateRaw) {
        const str =
          typeof workDateRaw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(workDateRaw)
            ? `${workDateRaw}T00:00:00`
            : workDateRaw;
        const d = new Date(str);
        workDate = isNaN(d.getTime()) ? null : d;
      }

      const downtimeMinutesRaw =
        item.downtimeMinutes ?? item['비가동(분)'] ?? item.비가동분 ?? 0;

      return {
        id: item.id || idx + 1,
        workDate,
        plant: item.plant ?? item.플랜트 ?? '',
        worker: item.worker ?? item.책임자 ?? '',
        workplace: item.workplace ?? item.작업장 ?? '',
        itemCode: item.itemCode ?? item.자재번호 ?? '',
        carModel: item.carModel ?? item.차종 ?? '',
        downtimeCode: item.downtimeCode ?? item.비가동코드 ?? '',
        downtimeName: item.downtimeName ?? item.비가동명 ?? '',
        downtimeMinutes: Number(downtimeMinutesRaw) || 0,
        note: item.note ?? item.비고 ?? '',
      };
    });
  };

  monthKey = (d) => {
    if (!(d instanceof Date) || isNaN(d.getTime())) return '(날짜없음)';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  };

  // ─────────────── 집계: 막대차트 ───────────────
  aggregateForBar = (rows) => {
    const byItem = new Map(); // itemCode -> { [YYYY-MM]: sumMinutes }
    const monthSet = new Set();

    for (const r of rows) {
      const item = (r.itemCode || '').trim() || '(미지정)';
      const mKey = this.monthKey(r.workDate);
      monthSet.add(mKey);

      if (!byItem.has(item)) byItem.set(item, {});
      const bucket = byItem.get(item);
      bucket[mKey] = (bucket[mKey] || 0) + (Number(r.downtimeMinutes) || 0);
    }

    const itemCodes = Array.from(byItem.keys()).sort((a, b) => a.localeCompare(b, 'ko'));
    const months = Array.from(monthSet).sort();

    const series = months.map((m) => ({
      label: m,
      data: itemCodes.map((code) => (byItem.get(code)?.[m] || 0)),
    }));

    return { itemCodes, months, series };
  };

  // ─────────────── 집계: 파이차트 ───────────────
  aggregateForPie = (rows, month, itemCode) => {
    if (!month || !itemCode) return [];
    const map = new Map(); // downtimeName -> sumMinutes

    for (const r of rows) {
      const sameMonth = this.monthKey(r.workDate) === month;
      const sameItem  = ((r.itemCode || '').trim() || '(미지정)') === itemCode;
      if (!sameMonth || !sameItem) continue;

      const key = (r.downtimeName || '').trim() || '(비가동명없음)';
      map.set(key, (map.get(key) || 0) + (Number(r.downtimeMinutes) || 0));
    }

    // PieChart 데이터 형식
    const entries = Array.from(map.entries())
      .sort((a, b) => b[1] - a[1]); // 큰 값 우선
    return entries.map(([label, value], idx) => ({ id: idx, value, label }));
  };

  // 선택한 월에서 실제 값이 있는 자재번호 목록
  getAvailableItemCodesForMonth = (rows, month) => {
    if (!month) return [];
    const sums = new Map();
    for (const r of rows) {
      if (this.monthKey(r.workDate) !== month) continue;
      const item = (r.itemCode || '').trim() || '(미지정)';
      sums.set(item, (sums.get(item) || 0) + (Number(r.downtimeMinutes) || 0));
    }
    return Array.from(sums.entries())
      .filter(([, v]) => v > 0)
      .map(([k]) => k)
      .sort((a, b) => a.localeCompare(b, 'ko'));
  };

  // 파이차트 데이터 갱신
  updatePieData = () => {
    const { formattedData, selectedMonth, selectedItemCode } = this.state;
    const pieData = this.aggregateForPie(formattedData, selectedMonth, selectedItemCode);
    this.setState({ pieData });
  };

  // ─────────────── 핸들러 ───────────────
  handleMonthChange = (e) => {
    const selectedMonth = e.target.value;
    const availableItemCodes = this.getAvailableItemCodesForMonth(this.state.formattedData, selectedMonth);
    const selectedItemCode = availableItemCodes[0] || '';
    this.setState({ selectedMonth, availableItemCodes, selectedItemCode }, this.updatePieData);
  };

  handleItemChange = (e) => {
    this.setState({ selectedItemCode: e.target.value }, this.updatePieData);
  };

  render() {
    const {
      loading, error,
      itemCodes, months, series,
      selectedMonth, availableItemCodes, selectedItemCode,
      pieData,
    } = this.state;

    // 선택한 월만 보이는 막대 시리즈
    const displaySeries = selectedMonth
      ? series.filter((s) => s.label === selectedMonth)
      : [];

    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>비가동 통계 차트</h1>

          {/* 컨트롤 영역 */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
            <TextField
              select
              size="small"
              label="월 선택 (YYYY-MM)"
              value={selectedMonth}
              onChange={this.handleMonthChange}
              sx={{ minWidth: 180 }}
              helperText="선택한 월만 차트에 표시됩니다."
            >
              {months.map((m) => (
                <MenuItem key={m} value={m}>{m}</MenuItem>
              ))}
            </TextField>

            <TextField
              select
              size="small"
              label="자재번호 선택"
              value={selectedItemCode}
              onChange={this.handleItemChange}
              sx={{ minWidth: 220 }}
              helperText="파이차트에 반영됩니다."
            >
              {availableItemCodes.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </TextField>
          </Box>

          {loading && <p>로딩 중…</p>}
          {error && <p style={{ color: 'crimson' }}>{error}</p>}

          {/* 반응형 레이아웃: md 이상 가로 2분할, xs/sm 세로 스택 */}
          {!loading && !error && selectedMonth && (
            <Grid container spacing={2}>
              {/* 막대 차트 (좌) */}
              <Grid item xs={12} md={8}>
                <Box className={s.chartSection} sx={{ p: 1 }}>
                  <div className={s.chartContainer}>
                    <h3>자재번호별 총 비가동시간 — {selectedMonth}</h3>
                    <BarChart
                      xAxis={[
                        { id: 'itemCodes', scaleType: 'band', data: itemCodes, label: '자재번호' },
                      ]}
                      yAxis={[{ label: '총 비가동(분)' }]}
                      series={displaySeries}
                      height={420}
                      margin={{ top: 24, right: 24, bottom: 56, left: 64 }}
                      slotProps={{
                        legend: { direction: 'row', position: { vertical: 'top', horizontal: 'right' } },
                      }}
                    />
                  </div>
                </Box>
              </Grid>

              {/* 파이 차트 (우) */}
              <Grid item xs={12} md={4}>
                <Box className={s.chartSection} sx={{ p: 1 }}>
                  <div className={s.chartContainer}>
                    <h3>비가동명 비중 — {selectedMonth} / {selectedItemCode || '자재번호 선택'}</h3>
                    {pieData.length > 0 ? (
                      <PieChart
                        series={[
                          {
                            data: pieData,                 // [{id,value,label}]
                            arcLabel: (item) => `${item.label}`,
                            arcLabelMinAngle: 10,
                            innerRadius: 40,
                            paddingAngle: 2,
                          },
                        ]}
                        height={420}
                        margin={{ top: 24, right: 16, bottom: 16, left: 16 }}
                        slotProps={{
                          legend: { direction: 'column', position: { vertical: 'middle', horizontal: 'right' } },
                        }}
                      />
                    ) : (
                      <Box sx={{ height: 420, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
                        선택한 조건의 데이터가 없습니다.
                      </Box>
                    )}
                  </div>
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
