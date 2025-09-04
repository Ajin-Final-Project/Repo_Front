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

import s from './MoldCleaningData.module.scss';
import config from '../../config';
import ItemCodeModal from '../common/ItemCodeModal';

const API_URL = `${config.baseURLApi}/smartFactory/mold_breakDown/list`;

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

export default class MoldBreakdownGrid extends Component {
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

      filterExpanded: false,
      quickRange: 'year',

      rows: [],
      allRows: [],
      loading: false,
      error: null,

      itemCodeModalOpen: false,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

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

      // 클라이언트 필터
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
      this.setState({ error: '데이터를 불러오는 중 오류가 발생했습니다.', loading: false });
    }
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

  // -------- 핸들러 --------
  handleSelectChange = (field, value) => {
    this.setState(
      (prev) => ({ filters: { ...prev.filters, [field]: value } }),
      () => this.fetchData()
    );
  };

  handleFilterChange = (field, value) => {
    this.setState((prev) => ({ filters: { ...prev.filters, [field]: value } }));
  };

  setQuickRange = (type) => {
    const now = new Date();
    const today = toYMD(now);
    let start = today;
    let end = today;

    if (type === 'today') {
      start = today;
      end = today;
    } else if (type === 'week') {
      const d = new Date(now);
      const day = d.getDay();
      const diffToMonday = (day + 6) % 7;
      d.setDate(d.getDate() - diffToMonday);
      start = toYMD(d);
      end = today;
    } else if (type === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      start = toYMD(d);
      end = today;
    } else if (type === 'year') {
      const d = new Date(now.getFullYear(), 0, 1);
      start = toYMD(d);
      end = today;
    }

    this.setState(
      (prev) => ({
        quickRange: type,
        filters: { ...prev.filters, start_date: start, end_date: end },
      }),
      () => this.fetchData()
    );
  };

  openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
  closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });

  handleItemCodeSelect = ({ 품목번호, 품목명, itemCode, itemName, code, name }) => {
    const nextCode = 품목번호 || itemCode || code || '';
    const nextName = 품목명 || itemName || name || '';
    this.setState(
      (prev) => ({
        filters: { ...prev.filters, itemCode: nextCode, itemName: nextName },
        itemCodeModalOpen: false,
      }),
      () => this.fetchData()
    );
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
    this.setState({ filters: next, quickRange: 'year' }, () => this.fetchData());
  };

  handleSearch = () => {
    this.fetchData();
  };

  toggleFilterExpansion = () =>
    this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }));

  // -------- 컬럼 --------
  columns = [
    {
      field: 'id',
      headerName: 'ID',
      width: 70,
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'plant',
      headerName: '공장',
      width: 160,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'worker',
      headerName: '작업자',
      width: 120,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      renderCell: (p) => (p.value && String(p.value).trim() !== '' ? p.value : '－'),
    },

    {
      field: 'line',
      headerName: '라인',
      width: 120,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'itemCode',
      headerName: '품번',
      width: 130,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    // 품명 칩(동그라미) 렌더링
    {
      field: 'itemName',
      headerName: '품목명',
      width: 200,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      renderCell: (p) => <Chip label={p.value || '-'} size="small" variant="outlined" />,
    },

    {
      field: 'status',
      headerName: '상태',
      width: 90,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      renderCell: (p) => <Chip size="small" label={p.value || '-'} />,
    },

    {
      field: 'document',
      headerName: '문서',
      width: 120,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'function_location',
      headerName: '기능위치',
      width: 150,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'function_location_detail',
      headerName: '기능위치내역',
      width: 160,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'equipment',
      headerName: '설비',
      width: 100,
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'equipment_detail',
      headerName: '설비내역',
      minWidth: 270,
      flex: 1,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'order_type',
      headerName: '오더유형',
      width: 120,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'order_type_detail',
      headerName: '오더유형내역',
      width: 130,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'order_no',
      headerName: '오더번호',
      width: 110,
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'order_detail',
      headerName: '오더내역',
      width: 200,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'start_date',
      headerName: '기본시작일',
      width: 130,
      type: 'date',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      valueFormatter: (p) => (p.value ? toYMD(p.value) : ''),
      sortComparator: (v1, v2) => {
        const d1 = parseDate(v1);
        const d2 = parseDate(v2);
        if (!d1 && !d2) return 0;
        if (!d1) return -1;
        if (!d2) return 1;
        return d1 - d2; // asc
      },
    },

    {
      field: 'end_date',
      headerName: '기본종료일',
      width: 130,
      type: 'date',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      valueFormatter: (p) => (p.value ? toYMD(p.value) : ''),
      sortComparator: (v1, v2) => {
        const d1 = parseDate(v1);
        const d2 = parseDate(v2);
        if (!d1 && !d2) return 0;
        if (!d1) return -1;
        if (!d2) return 1;
        return d1 - d2;
      },
    },

    {
      field: 'notification_no',
      headerName: '통지번호',
      width: 120,
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },

    {
      field: 'failure',
      headerName: '고장',
      width: 200,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
  ];

  render() {
    const { filters, filterExpanded, quickRange, rows, loading, error, itemCodeModalOpen } =
      this.state;

    return (
      <Box
        className={s.root}
        sx={{ height: '100vh', p: 3, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}
      >
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: '#ffb300', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FilterIcon /> 금형고장내역 데이터 그리드
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontSize: { xs: 16, sm: 16, md: 17 } }}>
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
                {/* 빠른 기간 */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={quickRange === 'today' ? 'contained' : 'outlined'}
                    onClick={() => this.setQuickRange('today')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&.MuiButton-contained': { backgroundColor: 'white', color: '#ff8f00' },
                    }}
                  >
                    금일
                  </Button>
                  <Button
                    size="small"
                    variant={quickRange === 'week' ? 'contained' : 'outlined'}
                    onClick={() => this.setQuickRange('week')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&.MuiButton-contained': { backgroundColor: 'white', color: '#ff8f00' },
                    }}
                  >
                    주간
                  </Button>
                  <Button
                    size="small"
                    variant={quickRange === 'month' ? 'contained' : 'outlined'}
                    onClick={() => this.setQuickRange('month')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&.MuiButton-contained': { backgroundColor: 'white', color: '#ff8f00' },
                    }}
                  >
                    월간
                  </Button>
                  <Button
                    size="small"
                    variant={quickRange === 'year' ? 'contained' : 'outlined'}
                    onClick={() => this.setQuickRange('year')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&.MuiButton-contained': { backgroundColor: 'white', color: '#ff8f00' },
                    }}
                  >
                    년간
                  </Button>
                </Box>

                <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>

                {/* 기간선택 */}
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
            sx={{ backgroundColor: '#ff8f00', color: 'white', borderRadius: 1, mb: 2 }}
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
                onClick={this.openItemCodeModal}
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
                onClick={this.openItemCodeModal}
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
              <TextField
                fullWidth
                label="상태"
                value={this.state.filters.status}
                onChange={(e) => this.handleFilterChange('status', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="문서"
                value={this.state.filters.document}
                onChange={(e) => this.handleFilterChange('document', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="기능위치"
                value={this.state.filters.function_location}
                onChange={(e) => this.handleFilterChange('function_location', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="기능위치내역"
                value={this.state.filters.function_location_detail}
                onChange={(e) => this.handleFilterChange('function_location_detail', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="설비"
                type="number"
                value={this.state.filters.equipment}
                onChange={(e) => this.handleFilterChange('equipment', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="설비내역"
                value={this.state.filters.equipment_detail}
                onChange={(e) => this.handleFilterChange('equipment_detail', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="오더유형"
                value={this.state.filters.order_type}
                onChange={(e) => this.handleFilterChange('order_type', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="오더유형내역"
                value={this.state.filters.order_type_detail}
                onChange={(e) => this.handleFilterChange('order_type_detail', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="오더번호"
                type="number"
                value={this.state.filters.order_no}
                onChange={(e) => this.handleFilterChange('order_no', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="오더내역 (부분검색)"
                value={this.state.filters.order_detail}
                onChange={(e) => this.handleFilterChange('order_detail', e.target.value)}
                size="small"
                placeholder="예: 취출, 이물, 누수…"
              />
              <TextField
                fullWidth
                label="통지번호"
                type="number"
                value={this.state.filters.notification_no}
                onChange={(e) => this.handleFilterChange('notification_no', e.target.value)}
                size="small"
              />
              <TextField
                fullWidth
                label="고장 (부분검색)"
                value={this.state.filters.failure}
                onChange={(e) => this.handleFilterChange('failure', e.target.value)}
                size="small"
                placeholder="예: 스크랩, 진동…"
              />
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
              sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
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
                <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
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
                  sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
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
                    backgroundColor: '#ff8f00',
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
          onClose={this.closeItemCodeModal}
          onSelect={this.handleItemCodeSelect}
          selectedItemCode={filters.itemCode}
          plant={filters.plant}
          worker={filters.worker}
          line={filters.line}
        />
      </Box>
    );
  }
}
