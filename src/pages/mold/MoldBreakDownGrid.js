// src/pages/mold/MoldBreakDownGrid.js
import React, { Component } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  InputAdornment,
  Chip,
  IconButton,
  Divider,
  Collapse,
  CircularProgress,
  Alert,
  CardHeader,
  Grid,
  Menu,
  MenuItem,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';

import { connect } from 'react-redux';
import { selectThemeHex, selectThemeKey } from '../../reducers/layout';

import s from './MoldCleaningData.module.scss';
import config from '../../config';
import ItemCodeModal from '../common/ItemCodeModal';

const API_URL = `${config.baseURLApi}/smartFactory/mold_breakDown/list`;

/* ===================== 날짜/유틸 ===================== */
// YYYY-MM-DD
const toYMD = (v) => {
  const d = v instanceof Date ? v : (v ? new Date(v) : null);
  if (!d || isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
};

const parseDate = (v) => {
  if (!v) return null;
  const d = v instanceof Date ? v : new Date(v);
  return isNaN(d) ? null : d;
};

const today0 = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};
const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/** 버튼 기준 화면 좌표 → Menu anchorPosition */
const getAnchorPos = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
};
/** 월요일 시작 주간 */
const startOfWeek = (d) => {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const s = new Date(d);
  s.setDate(d.getDate() + diff);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate());
};
const endOfWeek = (d) => {
  const s = startOfWeek(d);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
};
const getWeeksOfMonth = (year, month) => {
  const first = new Date(year, month - 1, 1);
  const last = lastOfMonth(first);
  let cur = startOfWeek(first);
  const out = [];
  let idx = 1;
  while (cur <= last) {
    const s = new Date(cur),
      e = endOfWeek(cur);
    const clipS = new Date(Math.max(s, first));
    const clipE = new Date(Math.min(e, last));
    out.push({ label: `${idx}주차`, start: clipS, end: clipE });
    idx += 1;
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
  }
  return out;
};

/* ===================== 컴포넌트 ===================== */
class MoldBreakdownGrid extends Component {
  constructor(props) {
    super(props);
    const today = new Date();
    const yStart = new Date(today.getFullYear(), 0, 1);

    this.state = {
      filters: {
        plant: '아진산업-경산(본사)',
        worker: '프레스',
        line: '1500T',
        itemCode: '',
        itemName: '',
        start_date: toYMD(yStart),
        end_date: toYMD(today),

        // 서버 기타
        status: '',
        document: '',
        function_location: '',
        function_location_detail: '',
        equipment_detail: '',
        order_type: '',
        order_type_detail: '',
        order_detail: '', // 부분검색
        failure: '', // 부분검색
        equipment: '',
        order_no: '',
        notification_no: '',
      },

      // 기간 프리셋/메뉴
      selectedYear: today.getFullYear(),
      selectedMonth: today.getMonth() + 1,
      years: [],
      yearAnchorPos: null,
      monthAnchorPos: null,
      weekAnchorPos: null,

      filterExpanded: false,

      rows: [],
      allRows: [],
      loading: false,
      error: null,

      itemCodeModalOpen: false,
    };
  }

  componentDidMount() {
    // 첫 화면: 기본 기간(올해 1/1~오늘)으로 자동 조회
    this.loadYears();
    this.fetchData();
  }

  /** 연도 옵션 (서버 없으면 fallback) */
  loadYears = async () => {
    try {
      const y = new Date().getFullYear();
      const years = [y, y - 1, y - 2, y - 3, y - 4];
      this.setState({ years, selectedYear: y });
    } catch {
      const y = new Date().getFullYear();
      const years = [y, y - 1, y - 2, y - 3, y - 4];
      this.setState({ years, selectedYear: y });
    }
  };

  // "1000T-PRO", "1000T PRO", "1000T-PRO(G라인)" => "1000TPRO"
  normalizeLine = (v) =>
    String(v ?? '')
      .toUpperCase()
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, '')
      .replace(/-/g, '');

  // 서버 전송용: 공백 -> 하이픈
  canonicalizeLine = (v) =>
    String(v ?? '')
      .toUpperCase()
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

  // -------- 서버 요청 --------
  buildPayload = () => {
    const f = this.state.filters;

    const intOrNull = (v) => {
      if (v === '' || v === null || v === undefined) return null;
      const n = parseInt(v, 10);
      return Number.isNaN(n) ? null : n;
    };
    const clean = (v) => {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      return s === '' ? null : s;
    };

    const payload = {
      start_date: clean(f.start_date),
      end_date: clean(f.end_date),

      plant: clean(f.plant),
      worker: clean(f.worker),
      line: clean(this.canonicalizeLine(f.line)),

      item_code: clean(f.itemCode),
      item_name: clean(f.itemName),

      status: clean(f.status),
      document: clean(f.document),
      function_location: clean(f.function_location),
      function_location_detail: clean(f.function_location_detail),
      equipment: intOrNull(f.equipment),
      equipment_detail: clean(f.equipment_detail),
      order_type: clean(f.order_type),
      order_type_detail: clean(f.order_type_detail),
      order_no: intOrNull(f.order_no),
      order_detail: clean(f.order_detail),
      notification_no: intOrNull(f.notification_no),
      failure: clean(f.failure),
    };

    Object.keys(payload).forEach((k) => payload[k] === null && delete payload[k]);
    return payload;
  };

  fetchData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const payload = this.buildPayload();
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const json = await res.json();

      const allRows = this.formatApiData(json.data ?? json);

      // 클라이언트 필터(서버 필터와 동일하지만 안전차원 유지)
      const filtered = this.applyClientFilter(allRows, this.state.filters);

      // 기본시작일 desc 정렬
      const sorted = [...filtered].sort((a, b) => {
        const da = parseDate(a.start_date);
        const db = parseDate(b.start_date);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return db - da;
      });

      // 연번 재부여
      const renumbered = sorted.map((r, i) => ({ ...r, id: i + 1 }));

      this.setState({ allRows, rows: renumbered, loading: false });
    } catch (err) {
      console.error('금형고장내역 데이터 로드 오류:', err);
      this.setState({ error: '데이터를 불러오는 중 오류가 발생했습니다.', loading: false, rows: [] });
    }
  };

  // -------- 기간 프리셋/선택 (조회 X, 상태만 변경 + 그리드 비우기) --------
  setDateRange = (start, end) => {
    const start_date = toYMD(start);
    const end_date = toYMD(end);
    this.setState((prev) => ({
      filters: { ...prev.filters, start_date, end_date, itemCode: '', itemName: '' },
      rows: [],
      allRows: [],
      error: null,
    }));
  };

  applyToday = () => {
    const t = today0();
    this.setDateRange(t, t);
  };

  selectYear = (y) => {
    const s = new Date(y, 0, 1);
    const e = new Date(y, 11, 31);
    this.setState({ selectedYear: y, yearAnchorPos: null });
    this.setDateRange(s, e);
  };

  selectMonth = (m) => {
    const y = this.state.selectedYear;
    const s = new Date(y, m - 1, 1);
    const e = lastOfMonth(s);
    this.setState({ monthAnchorPos: null, selectedMonth: m });
    this.setDateRange(s, e);
  };

  selectWeek = (w) => {
    this.setState({ weekAnchorPos: null });
    this.setDateRange(w.start, w.end);
  };

  // -------- 클라이언트 필터 --------
  applyClientFilter = (rows, filters) => {
    const has = (v) => v !== null && v !== undefined && String(v).trim() !== '';
    const contains = (a, b) =>
      String(a ?? '').toLowerCase().includes(String(b ?? '').trim().toLowerCase());

    const sd = has(filters.start_date) ? filters.start_date : null;
    const ed = has(filters.end_date) ? filters.end_date : null;

    return rows.filter((r) => {
      if (has(filters.plant) && r.plant !== filters.plant) return false;
      if (has(filters.worker) && r.worker !== filters.worker) return false;
      if (has(filters.line) && this.normalizeLine(r.line) !== this.normalizeLine(filters.line))
        return false;

      if (has(filters.itemCode) && r.itemCode !== filters.itemCode) return false;
      if (has(filters.itemName) && r.itemName !== filters.itemName) return false;

      if (has(filters.status) && r.status !== filters.status) return false;
      if (has(filters.document) && r.document !== filters.document) return false;
      if (has(filters.function_location) && r.function_location !== filters.function_location)
        return false;
      if (
        has(filters.function_location_detail) &&
        r.function_location_detail !== filters.function_location_detail
      )
        return false;
      if (has(filters.order_type) && r.order_type !== filters.order_type) return false;
      if (has(filters.order_type_detail) && r.order_type_detail !== filters.order_type_detail)
        return false;
      if (has(filters.order_no) && String(r.order_no ?? '') !== String(filters.order_no))
        return false;
      if (
        has(filters.notification_no) &&
        String(r.notification_no ?? '') !== String(filters.notification_no)
      )
        return false;
      if (has(filters.equipment) && String(r.equipment ?? '') !== String(filters.equipment))
        return false;

      if (has(filters.equipment_detail) && !contains(r.equipment_detail, filters.equipment_detail))
        return false;
      if (has(filters.order_detail) && !contains(r.order_detail, filters.order_detail)) return false;
      if (has(filters.failure) && !contains(r.failure, filters.failure)) return false;

      const rs = r.start_date ? toYMD(r.start_date) : null;
      const re = r.end_date ? toYMD(r.end_date) : null;
      if (sd && rs && rs < sd) return false;
      if (ed && re && re > ed) return false;

      return true;
    });
  };

  // -------- 데이터 정규화 --------
  formatApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];

    return apiData.map((item, idx) => {
      const plant = item.plant ?? item['플랜트'] ?? '';
      const line = item.line ?? item.line_name ?? item['작업장'] ?? '';
      const worker = item.worker ?? item.workshop ?? item['작업자'] ?? item['책임자'] ?? '';
      const itemCode = item.item_code ?? item.itemCode ?? item['품번'] ?? '';
      const itemName = item.item_name ?? item.itemName ?? item['품명'] ?? '';

      const status = item.status ?? item['상태'] ?? '';
      const document = item.document ?? item['문서'] ?? '';
      const function_location = item.function_location ?? item['기능위치'] ?? '';
      const function_location_detail =
        item.function_location_detail ?? item['기능위치내역'] ?? '';
      const equipment = item.equipment ?? item['설비'] ?? '';
      const equipment_detail = item.equipment_detail ?? item['설비내역'] ?? '';
      const order_type = item.order_type ?? item['오더유형'] ?? '';
      const order_type_detail = item.order_type_detail ?? item['오더유형내역'] ?? '';
      const order_no = item.order_no ?? item['오더번호'] ?? '';
      const order_detail = item.order_detail ?? item['오더내역'] ?? '';
      const start_date = item.start_date ?? item['기본시작일'] ?? '';
      const end_date = item.end_date ?? item['기본종료일'] ?? '';
      const notification_no = item.notification_no ?? item['통지번호'] ?? '';
      const failure = item.failure ?? item['고장'] ?? '';

      return {
        id: idx + 1,
        plant,
        worker,
        line,
        itemCode,
        itemName,
        status,
        document,
        function_location,
        function_location_detail,
        equipment,
        equipment_detail,
        order_type,
        order_type_detail,
        order_no,
        order_detail,
        start_date,
        end_date,
        notification_no,
        failure,
      };
    });
  };

  // -------- 핸들러 (조회 X, 상태만 변경 + 그리드 비우기) --------
  handleSelectChange = (field, value) => {
    this.setState((prev) => ({
      filters: { ...prev.filters, [field]: value },
      rows: [],
      allRows: [],
      error: null,
    }));
  };

  handleFilterChange = (field, value) => {
    this.setState((prev) => ({
      filters: { ...prev.filters, [field]: value },
      rows: [],
      allRows: [],
      error: null,
    }));
  };

  clearFilters = () => {
    const today = new Date();
    const yStart = new Date(today.getFullYear(), 0, 1);
    const next = {
      plant: '아진산업-경산(본사)',
      worker: '프레스',
      line: '1500T',
      itemCode: '',
      itemName: '',
      start_date: toYMD(yStart),
      end_date: toYMD(today),
      status: '',
      document: '',
      function_location: '',
      function_location_detail: '',
      equipment_detail: '',
      order_type: '',
      order_type_detail: '',
      order_detail: '',
      failure: '',
      equipment: '',
      order_no: '',
      notification_no: '',
    };
    this.setState(
      {
        filters: next,
        selectedYear: today.getFullYear(),
        selectedMonth: today.getMonth() + 1,
        rows: [],
        allRows: [],
        error: null,
      }
      // 초기값으로 바로 재조회하려면 아래 주석 해제
      // , () => this.fetchData()
    );
  };

  handleSearch = () => this.fetchData();

  toggleFilterExpansion = () =>
    this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }));

  // -------- 컬럼 --------
  columns = [
    { field: 'id', headerName: 'ID', width: 70, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'plant', headerName: '공장', width: 160,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'worker', headerName: '작업자', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      renderCell: (p) => (p.value && String(p.value).trim() !== '' ? p.value : '－') },
    { field: 'line', headerName: '라인', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'itemCode', headerName: '품번', width: 130,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'itemName', headerName: '품목명', width: 200,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      renderCell: (p) => <Chip label={p.value || '-'} size="small" variant="outlined" /> },
    { field: 'status', headerName: '상태', width: 90,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      renderCell: (p) => <Chip size="small" label={p.value || '-'} /> },
    { field: 'document', headerName: '문서', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'function_location', headerName: '기능위치', width: 150,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'function_location_detail', headerName: '기능위치내역', width: 160,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'equipment', headerName: '설비', width: 100, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'equipment_detail', headerName: '설비내역', minWidth: 270, flex: 1,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'order_type', headerName: '오더유형', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'order_type_detail', headerName: '오더유형내역', width: 130,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'order_no', headerName: '오더번호', width: 110, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'order_detail', headerName: '오더내역', width: 200,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'start_date', headerName: '기본시작일', width: 130, type: 'date',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      valueFormatter: (p) => (p.value ? toYMD(p.value) : ''),
      sortComparator: (v1, v2) => {
        const d1 = parseDate(v1);
        const d2 = parseDate(v2);
        if (!d1 && !d2) return 0;
        if (!d1) return -1;
        if (!d2) return 1;
        return d1 - d2;
      } },
    { field: 'end_date', headerName: '기본종료일', width: 130, type: 'date',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      valueFormatter: (p) => (p.value ? toYMD(p.value) : ''),
      sortComparator: (v1, v2) => {
        const d1 = parseDate(v1);
        const d2 = parseDate(v2);
        if (!d1 && !d2) return 0;
        if (!d1) return -1;
        if (!d2) return 1;
        return d1 - d2;
      } },
    { field: 'notification_no', headerName: '통지번호', width: 120, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'failure', headerName: '고장', width: 200,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
  ];

  render() {
    const { themeHex } = this.props;
    const {
      filters,
      filterExpanded,
      rows,
      loading,
      error,
      itemCodeModalOpen,
      // 기간 프리셋 상태
      selectedYear,
      selectedMonth,
      years,
      yearAnchorPos,
      monthAnchorPos,
      weekAnchorPos,
    } = this.state;

    const now = today0();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
    const weeks = getWeeksOfMonth(selectedYear, selectedMonth);

    return (
      <Box
        className={s.root}
        sx={{ height: '100vh', p: 3, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: themeHex, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FilterIcon /> 금형고장내역 데이터 그리드
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontSize: { xs: 15, sm: 15, md: 16 } }}>
            금형고장 현황을 상세하게 조회하고 관리할 수 있습니다.
          </Typography>
        </Box>

        {/* 검색 필터 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <SearchIcon /> 검색 조건
              </Typography>
            }
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* 연간 */}
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
                  sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
                >
                  연간
                </Button>
                <Menu
                  open={!!yearAnchorPos}
                  onClose={() => this.setState({ yearAnchorPos: null })}
                  anchorReference="anchorPosition"
                  anchorPosition={yearAnchorPos || { top: 0, left: 0 }}
                >
                  <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
                  {years.map((y) => (
                    <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
                      {y}년
                    </MenuItem>
                  ))}
                </Menu>

                {/* 월간 */}
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
                  sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
                >
                  월간
                </Button>
                <Menu
                  open={!!monthAnchorPos}
                  onClose={() => this.setState({ monthAnchorPos: null })}
                  anchorReference="anchorPosition"
                  anchorPosition={monthAnchorPos || { top: 0, left: 0 }}
                >
                  <MenuItem
                    dense
                    onClick={() => {
                      this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth));
                    }}
                  >
                    이번달
                  </MenuItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
                      {selectedYear}년 {m}월
                    </MenuItem>
                  ))}
                </Menu>

                {/* 주간 */}
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
                  sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
                >
                  주간
                </Button>
                <Menu
                  open={!!weekAnchorPos}
                  onClose={() => this.setState({ weekAnchorPos: null })}
                  anchorReference="anchorPosition"
                  anchorPosition={weekAnchorPos || { top: 0, left: 0 }}
                >
                  <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
                    이번주 ({toYMD(thisWeek.start)}~{toYMD(thisWeek.end)})
                  </MenuItem>
                  {weeks.map((w, i) => (
                    <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
                      {selectedYear}년 {selectedMonth}월 {w.label} ({toYMD(w.start)}~{toYMD(w.end)})
                    </MenuItem>
                  ))}
                </Menu>

                {/* 금일 */}
                <Button
                  size="small"
                  variant="outlined"
                  onClick={this.applyToday}
                  sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
                >
                  금일
                </Button>

                {/* 구분자 & 기간선택 직접 입력 */}
                <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>
                <Typography sx={{ color: 'white' }}>기간선택</Typography>
                <TextField
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => this.handleSelectChange('start_date', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                  InputLabelProps={{ shrink: true }}
                />
                <Typography sx={{ color: 'white' }}>~</Typography>
                <TextField
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => this.handleSelectChange('end_date', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                  InputLabelProps={{ shrink: true }}
                />

                <IconButton onClick={this.toggleFilterExpansion} sx={{ color: 'white' }}>
                  {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            }
            sx={{ backgroundColor: themeHex, color: 'white', borderRadius: 1, mb: 2 }}
          />

          {/* 기본 필터 */}
          <Grid container spacing={2}>
            {/* 공장 : 드롭다운 */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="공장"
                value={filters.plant ?? ''}
                onChange={(e) => this.handleSelectChange('plant', e.target.value)}
                size="small"
                variant="outlined"
              >
                <MenuItem value="아진산업-경산(본사)">아진산업-본사(경산)</MenuItem>
                <MenuItem value="아진산업-1공장(경산)">아진산업-1공장(경산)</MenuItem>
                <MenuItem value="아진산업-구어공장(경주)">아진산업-구어공장(경주)</MenuItem>
                <MenuItem value="아진산업-하양공장(예정)">아진산업-하양공장(예정)</MenuItem>
              </TextField>
            </Grid>

            {/* 작업자 : 드롭다운 */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="작업자"
                value={filters.worker}
                onChange={(e) => this.handleSelectChange('worker', e.target.value)}
                size="small"
                variant="outlined"
              >
                <MenuItem value="프레스">프레스</MenuItem>
                <MenuItem value="금형">금형</MenuItem>
                <MenuItem value="블랭크">블랭크</MenuItem>
              </TextField>
            </Grid>

            {/* 라인 : 드롭다운 */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="라인"
                value={filters.line}
                onChange={(e) => this.handleSelectChange('line', e.target.value)}
                size="small"
                variant="outlined"
              >
                <MenuItem value="1500T">1500T(E라인)</MenuItem>
                <MenuItem value="1200T">1200T(D라인)</MenuItem>
                <MenuItem value="1000T">1000T(F라인)</MenuItem>
                <MenuItem value="1000T-PRO">1000T-PRO(G라인)</MenuItem>
              </TextField>
            </Grid>

            {/* 품번 */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="품번"
                value={filters.itemCode}
                onClick={() => this.setState({ itemCodeModalOpen: true })}
                size="small"
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  style: { cursor: 'pointer' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  },
                }}
              />
            </Grid>

            {/* 품목명 */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="품목명"
                value={filters.itemName}
                onClick={() => this.setState({ itemCodeModalOpen: true })}
                size="small"
                variant="outlined"
                InputProps={{
                  readOnly: true,
                  style: { cursor: 'pointer' },
                  endAdornment: (
                    <InputAdornment position="end">
                      <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: '#f5f5f5' },
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* 추가 필터 */}
          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Box
              sx={{
                display: 'grid',
                gap: 2,
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              }}
            >
              <TextField fullWidth label="상태" value={filters.status} onChange={(e) => this.handleFilterChange('status', e.target.value)} size="small" />
              <TextField fullWidth label="문서" value={filters.document} onChange={(e) => this.handleFilterChange('document', e.target.value)} size="small" />
              <TextField fullWidth label="기능위치" value={filters.function_location} onChange={(e) => this.handleFilterChange('function_location', e.target.value)} size="small" />
              <TextField fullWidth label="기능위치내역" value={filters.function_location_detail} onChange={(e) => this.handleFilterChange('function_location_detail', e.target.value)} size="small" />
              <TextField fullWidth label="설비" type="number" value={filters.equipment} onChange={(e) => this.handleFilterChange('equipment', e.target.value)} size="small" />
              <TextField fullWidth label="설비내역" value={filters.equipment_detail} onChange={(e) => this.handleFilterChange('equipment_detail', e.target.value)} size="small" />
              <TextField fullWidth label="오더유형" value={filters.order_type} onChange={(e) => this.handleFilterChange('order_type', e.target.value)} size="small" />
              <TextField fullWidth label="오더유형내역" value={filters.order_type_detail} onChange={(e) => this.handleFilterChange('order_type_detail', e.target.value)} size="small" />
              <TextField fullWidth label="오더번호" type="number" value={filters.order_no} onChange={(e) => this.handleFilterChange('order_no', e.target.value)} size="small" />
              <TextField fullWidth label="오더내역 (부분검색)" value={filters.order_detail} onChange={(e) => this.handleFilterChange('order_detail', e.target.value)} size="small" placeholder="예: 취출, 이물, 누수…" />
              <TextField fullWidth label="통지번호" type="number" value={filters.notification_no} onChange={(e) => this.handleFilterChange('notification_no', e.target.value)} size="small" />
              <TextField fullWidth label="고장 (부분검색)" value={filters.failure} onChange={(e) => this.handleFilterChange('failure', e.target.value)} size="small" placeholder="예: 스크랩, 진동…" />
            </Box>
          </Collapse>

          {/* 버튼 */}
          <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.clearFilters} size="large" color="secondary">
              필터 초기화
            </Button>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              size="large"
              sx={{ backgroundColor: themeHex, '&:hover': { backgroundColor: themeHex } }}
              onClick={this.handleSearch}
            >
              검색
            </Button>
          </Box>
        </Paper>

        {/* 데이터 그리드 */}
        <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
          <Box sx={{ height: '100%', width: '100%' }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress size={60} sx={{ color: themeHex }} />
              </Box>
            )}

            {error && (
              <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                <Button
                  variant="contained"
                  onClick={this.fetchData}
                  sx={{ backgroundColor: themeHex, '&:hover': { backgroundColor: themeHex } }}
                >
                  다시 시도
                </Button>
              </Box>
            )}

            {!loading && !error && (
              <DataGrid
                rows={rows}
                columns={this.columns}
                pagination
                paginationMode="client"
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  sorting: { sortModel: [{ field: 'start_date', sort: 'desc' }] },
                  pagination: { paginationModel: { page: 0, pageSize: 10 } },
                  columns: {
                    columnVisibilityModel: {
                      id: false,
                      function_location: false,
                      equipment: false,
                      document: false, // ▶ 문서 컬럼 기본 숨김
                    },
                  },
                }}
                disableRowSelectionOnClick
                density="compact"
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
                sx={{
                  height: '600px',
                  '& .super-app-theme--header': {
                    backgroundColor: themeHex,
                    color: 'white',
                    fontWeight: 'bold',
                  },
                  '& .super-app-theme--cell': {
                    borderBottom: '1px solid #e0e0e0',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    backgroundColor: '#fafafa',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '2px solid #e0e0e0',
                    backgroundColor: '#f5f5f5',
                  },
                  '& .MuiDataGrid-toolbarContainer': {
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #e0e0e0',
                    padding: '8px 16px',
                  },
                }}
              />
            )}
          </Box>
        </Paper>

        {/* 품목 코드 선택 모달 */}
        <ItemCodeModal
          open={itemCodeModalOpen}
          onClose={() => this.setState({ itemCodeModalOpen: false })}
          onSelect={({ 품목번호, 품목명, itemCode, itemName, code, name }) => {
            const nextCode = 품목번호 || itemCode || code || '';
            const nextName = 품목명 || itemName || name || '';
            this.setState((prev) => ({
              filters: { ...prev.filters, itemCode: nextCode, itemName: nextName },
              itemCodeModalOpen: false,
              rows: [],        // 선택 후 즉시 조회하지 않음 → 그리드 비워두기
              allRows: [],
              error: null,
            }));
          }}
          selectedItemCode={filters.itemCode}
          plant={filters.plant}
          worker={filters.worker}
          line={filters.line}
          start_work_date={filters.start_date}
          end_work_date={filters.end_date}
        />
      </Box>
    );
  }
}

export default connect((state) => ({
  themeHex: selectThemeHex(state),
  themeKey: selectThemeKey(state),
}))(MoldBreakdownGrid);
