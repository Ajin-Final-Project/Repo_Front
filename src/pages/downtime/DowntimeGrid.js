// DowntimeGrid.jsx
import React, { Component } from 'react';
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  Chip,
  CardHeader,
  IconButton,
  Divider,
  Collapse,
  CircularProgress,
  Alert,
  MenuItem,
  Menu,                  // ⬅️ 추가
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
import s from './DowntimeGrid.module.scss';
import config from "../../config";
import ItemCodeModal from '../common/ItemCodeModal';
import { connect } from "react-redux";
import { selectThemeHex, selectThemeKey } from "../../reducers/layout";

class DowntimeGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 검색 필터
      filters: {
        start_work_date: "2025-06-01",
        end_work_date: "2025-06-30",

        // 기본 필터
        plant: "아진산업-경산(본사)",
        workerplace: "프레스",
        line: "1500T",
        itemCode: "",

        // 확장 필터
        carModel: "",
        downtimeCode: "",
        downtimeName: "",
        downtimeMinutes: null,
        note: "",

        // 추가 필터
        shift: "",
        productName: "",
        itemType: "",
        categoryMain: "",
        categorySub: "",
      },

      quickRange: null,         // (유지) 금일/주간/월간/년간 플래그
      filterExpanded: false,
      itemCodeModalOpen: false,

      downtimeData: [],
      loading: false,
      error: null,

      // ⬇️ InspectionSystemChart 방식 기간 선택용 상태
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      yearAnchorPos: null,
      monthAnchorPos: null,
      weekAnchorPos: null,
      years: [],
    };
  }

  componentDidMount() {
    this.loadYears();          // ⬅️ 연도 메뉴 데이터 준비
    this.fetchDowntimeData();
  }

  // ---------- 유틸 ----------
  toYMD = (d) => {
    if (!d) return "";
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleDateString("sv-SE"); // YYYY-MM-DD
  };

  // ⬇️ 기간 계산 유틸들 (InspectionSystemChart 스타일)
  today0 = () => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  };
  lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

  getAnchorPos = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
  };

  startOfWeek = (d) => {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // 월요일 시작
    const s = new Date(d);
    s.setDate(d.getDate() + diff);
    return new Date(s.getFullYear(), s.getMonth(), s.getDate());
  };
  endOfWeek = (d) => {
    const s = this.startOfWeek(d);
    return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
  };

  getWeeksOfMonth = (year, month) => {
    const first = new Date(year, month - 1, 1);
    const last = this.lastOfMonth(first);
    let cur = this.startOfWeek(first);
    const out = [];
    let idx = 1;
    while (cur <= last) {
      const s = new Date(cur), e = this.endOfWeek(cur);
      const clipS = new Date(Math.max(s, first));
      const clipE = new Date(Math.min(e, last));
      out.push({ label: `${idx}주차`, start: clipS, end: clipE });
      idx += 1;
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
    }
    return out;
  };

  loadYears = () => {
    const y = new Date().getFullYear();
    this.setState({ years: [y, y - 1, y - 2, y - 3, y - 4], selectedYear: y });
  };

  setDateRange = (start, end) => {
    this.setState((prev) => ({
      filters: {
        ...prev.filters,
        start_work_date: this.toYMD(start),
        end_work_date: this.toYMD(end),
      },
    }));
  };

  // (기존 quickRange 유지: 필요 시 사용할 수 있음)
  setQuickRange = (type) => {
    const now = new Date();
    const today = this.toYMD(now);
    let start = today;
    let end = today;

    if (type === 'today') {
      start = today; end = today;
    } else if (type === 'week') {
      const d = this.startOfWeek(now);
      start = this.toYMD(d);
      end = today;
    } else if (type === 'month') {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      start = this.toYMD(d);
      end = today;
    } else if (type === 'year') {
      const d = new Date(now.getFullYear(), 0, 1);
      start = this.toYMD(d);
      end = today;
    }

    this.setState((prev) => ({
      quickRange: type,
      filters: { ...prev.filters, start_work_date: start, end_work_date: end },
      downtimeData: [],
    }));
  };

  // ⬇️ 메뉴에서 실제 반영
  applyToday = () => {
    const t = this.today0();
    this.setDateRange(t, t);
    this.setState({ quickRange: 'today' });
  };
  selectYear = (y) => {
    const s = new Date(y, 0, 1);
    const e = new Date(y, 11, 31);
    this.setState({ selectedYear: y, yearAnchorPos: null, quickRange: 'year' });
    this.setDateRange(s, e);
  };
  selectMonth = (m) => {
    const y = this.state.selectedYear;
    const s = new Date(y, m - 1, 1);
    const e = this.lastOfMonth(s);
    this.setState({ selectedMonth: m, monthAnchorPos: null, quickRange: 'month' });
    this.setDateRange(s, e);
  };
  selectWeek = (w) => {
    this.setState({ weekAnchorPos: null, quickRange: 'week' });
    this.setDateRange(w.start, w.end);
  };

  // ---------- 모달 ----------
  openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
  closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
  handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
    this.setState((prev) => ({
      filters: {
        ...prev.filters,
        itemCode: 품목번호 || "",
        itemName: 품목명 || "",
      },
      itemCodeModalOpen: false,
      downtimeData: [],
    }));
  };

  // ---------- API ----------
  fetchDowntimeData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const requestBody = { ...this.state.filters };
      const response = await fetch(`${config.baseURLApi}/smartFactory/downtime_grid/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();

      const dataArray =
        (Array.isArray(json) && json) ||
        (Array.isArray(json?.data) && json.data) ||
        (Array.isArray(json?.result) && json.result) ||
        [];

      const formatted = this.formatApiData(dataArray);
      this.setState({ downtimeData: formatted });
    } catch (err) {
      console.error('데이터 로드 중 오류:', err);
      this.setState({
        error: '데이터를 불러오는 중 오류가 발생했습니다.',
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  formatApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    return apiData.map((item, idx) => {
      const workDateRaw =
        item.workDate ??
        item.work_date ??
        item.start_work_date ??
        item.end_work_date ??
        item['근무일자'] ??
        item.date ??
        item.Date ??
        '';

      let workDate = null;
      if (workDateRaw) {
        const str = typeof workDateRaw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(workDateRaw)
          ? `${workDateRaw}T00:00:00`
          : workDateRaw;
        const d = new Date(str);
        workDate = isNaN(d.getTime()) ? null : d;
      }

      const downtimeMinutesRaw =
        item.downtimeMinutes ??
        item['비가동(분)'] ??
        item.비가동분 ??
        0;
      const downtimeMinutes = Number(downtimeMinutesRaw) || 0;

      return {
        id: item.id || idx + 1,
        workDate,
        plant: item.plant ?? item.플랜트 ?? '',
        workerplace: item.workerplace ?? item.책임자 ?? '',
        line: item.line ?? item.작업장 ?? '',
        itemCode: item.itemCode ?? item.자재번호 ?? '',
        itemName: item.itemName ?? item.자재명 ?? '',
        carModel: item.carModel ?? item.차종 ?? '',
        downtimeCode: item.downtimeCode ?? item.비가동코드 ?? '',
        downtimeName: item.downtimeName ?? item.비가동명 ?? '',
        downtimeMinutes,
        note: item.note ?? item.비고 ?? '',
      };
    });
  };

  // ---------- 핸들러 ----------
  clearFilters = () => {
    this.setState({
      filters: {
        start_work_date: '',
        end_work_date: '',
        plant: "아진산업-경산(본사)",
        workerplace: "프레스",
        line: "1500T",
        itemCode: '',
        itemName: '',

        carModel: '',
        downtimeCode: '',
        downtimeName: '',
        downtimeMinutes: '',
        note: '',

        shift: '',
        productName: '',
        itemType: '',
        categoryMain: '',
        categorySub: '',
      },
      downtimeData: [],
      quickRange: null,
    });
  };

  handleFilterChange = (field, value) => {
    this.setState((prev) => ({
      filters: { ...prev.filters, [field]: value },
      downtimeData: [],
    }));
  };

  handleSearch = () => this.fetchDowntimeData();
  toggleFilterExpansion = () =>
    this.setState((p) => ({ filterExpanded: !p.filterExpanded }));
  refreshData = () => this.fetchDowntimeData();

  // ---------- 그리드 컬럼 ----------
  columns = [
    // { field: 'id', headerName: 'No.', width: 80, type: 'number',
    //   headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'workDate', headerName: '근무일자', width: 120, type: 'date',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      valueFormatter: (p) => {
        const v = p?.value;
        const d = v instanceof Date ? v : (v ? new Date(v) : null);
        return d && !isNaN(d.getTime()) ? d.toLocaleDateString('ko-KR') : '';
      },
    },
    { field: 'plant', headerName: '플랜트', width: 180,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'workerplace', headerName: '책임자', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'line', headerName: '작업장', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'itemCode', headerName: '자재번호', width: 140,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'itemName', headerName: '자재명', width: 160,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'carModel', headerName: '차종', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'downtimeCode', headerName: '비가동코드', width: 140,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'downtimeName', headerName: '비가동명', width: 200,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'downtimeMinutes', headerName: '비가동(분)', width: 120, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      renderCell: (params) => (
        <Chip
          label={
            typeof params.value === 'number'
              ? params.value.toLocaleString()
              : (params.value || 0).toString()
          }
          color="warning"
          size="small"
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      ),
    },
    { field: 'note', headerName: '비고', width: 260,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
  ];

  render() {
    const { themeHex } = this.props;
    const { filters, filterExpanded, itemCodeModalOpen, quickRange, downtimeData, loading, error } = this.state;

    // ⬇️ 연/월/주 메뉴용 계산
    const now = this.today0();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const thisWeek = { start: this.startOfWeek(now), end: this.endOfWeek(now) };
    const weeks = this.getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

    // 공통 높이(스피너/그리드 영역 동일)
    const gridHeight = 'calc(100vh - 380px)';

    return (
      <Box
        className={s.root}
        sx={{
          height: '100vh',
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f5f5f5',
        }}
      >
        {/* 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: themeHex,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FilterIcon sx={{color: themeHex}}/>
            비가동 데이터 내역
          </Typography>
          <Typography variant="body1" color="text.secondary">
            비가동 현황을 상세하게 조회하고 관리할 수 있습니다.
          </Typography>
        </Box>

        {/* 필터 카드 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <CardHeader
            title={
              <Typography
                variant="h6"
                sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}
              >
                <SearchIcon />
                검색 조건
              </Typography>
            }
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* ⬇️ InspectionSystemChart 방식의 연/월/주/오늘 */}
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) =>
                    this.setState({ yearAnchorPos: this.getAnchorPos(e.currentTarget) })
                  }
                  sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
                >
                  연간
                </Button>
                <Menu
                  open={!!this.state.yearAnchorPos}
                  onClose={() => this.setState({ yearAnchorPos: null })}
                  anchorReference="anchorPosition"
                  anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
                >
                  <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
                  {this.state.years.map((y) => (
                    <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
                      {y}년
                    </MenuItem>
                  ))}
                </Menu>

                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) =>
                    this.setState({ monthAnchorPos: this.getAnchorPos(e.currentTarget) })
                  }
                  sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
                >
                  월간
                </Button>
                <Menu
                  open={!!this.state.monthAnchorPos}
                  onClose={() => this.setState({ monthAnchorPos: null })}
                  anchorReference="anchorPosition"
                  anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
                >
                  <MenuItem
                    dense
                    onClick={() => this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth))}
                  >
                    이번달
                  </MenuItem>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
                      {this.state.selectedYear}년 {m}월
                    </MenuItem>
                  ))}
                </Menu>

                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e) =>
                    this.setState({ weekAnchorPos: this.getAnchorPos(e.currentTarget) })
                  }
                  sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
                >
                  주간
                </Button>
                <Menu
                  open={!!this.state.weekAnchorPos}
                  onClose={() => this.setState({ weekAnchorPos: null })}
                  anchorReference="anchorPosition"
                  anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
                >
                  <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
                    이번주 ({this.toYMD(thisWeek.start)}~{this.toYMD(thisWeek.end)})
                  </MenuItem>
                  {weeks.map((w, i) => (
                    <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
                      {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({this.toYMD(w.start)}~{this.toYMD(w.end)})
                    </MenuItem>
                  ))}
                </Menu>

                <Button
                  size="small"
                  variant="outlined"
                  onClick={this.applyToday}
                  sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
                >
                  오늘
                </Button>

                {/* 구분선 */}
                <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>

                {/* 기간 선택 */}
                <Typography sx={{ color: 'white' }}>기간선택</Typography>
                <TextField
                  type="date"
                  value={filters.start_work_date || ''}
                  onChange={(e) => this.handleFilterChange('start_work_date', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                />
                <Typography sx={{ color: 'white' }}>~</Typography>
                <TextField
                  type="date"
                  value={filters.end_work_date || ''}
                  onChange={(e) => this.handleFilterChange('end_work_date', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                />

                {/* 확장 토글 */}
                <IconButton onClick={this.toggleFilterExpansion} sx={{ color: 'white' }}>
                  {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            }
            sx={{
              backgroundColor: themeHex,
              color: 'white',
              borderRadius: 1,
              mb: 2,
            }}
          />

          {/* 기본 필터 */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="공장"
                value={filters.plant ?? ''}
                onChange={(e) => this.handleFilterChange('plant', e.target.value)}
                size="small"
                variant="outlined"
                SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 280 } } } }}
              >
                <MenuItem value="아진산업-경산(본사)">아진산업-경산(본사)</MenuItem>
                <MenuItem value="아진산업-1공장(경산)">아진산업-1공장(경산)</MenuItem>
                <MenuItem value="아진산업-구어공장(경주)">아진산업-구어공장(경주)</MenuItem>
                <MenuItem value="아진산업-하양공장(예정)">아진산업-하양공장(예정)</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="작업장"
                value={filters.workerplace ?? '프레스'}
                onChange={(e) => this.handleFilterChange('workerplace', e.target.value)}
                size="small"
                variant="outlined"
              >
                <MenuItem value="프레스">프레스</MenuItem>
                <MenuItem value="금형">금형</MenuItem>
                <MenuItem value="블랭크">블랭크</MenuItem>
              </TextField>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                label="라인"
                value={filters.line ?? '1500T'}
                onChange={(e) => this.handleFilterChange('line', e.target.value)}
                size="small"
                variant="outlined"
              >
                <MenuItem value="1500T">1500T(E라인)</MenuItem>
                <MenuItem value="1200T">1200T(D라인)</MenuItem>
                <MenuItem value="1000T">1000T(F라인)</MenuItem>
                <MenuItem value="1000T-PRO">1000T-PRO(G라인)</MenuItem>
              </TextField>
            </Grid>

            {/* 품목코드 (모달 오픈) */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                fullWidth
                label="품번"
                value={filters.itemCode || ''}
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

            {/* 품목명 (표시용) */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="품목명"
                value={filters.itemName || ''}
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

          {/* 확장 필터 */}
          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="차종"
                  value={filters.carModel}
                  onChange={(e) => this.handleFilterChange('carModel', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="비가동코드"
                  value={filters.downtimeCode}
                  onChange={(e) => this.handleFilterChange('downtimeCode', e.target.value)}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="비가동명"
                  value={filters.downtimeName}
                  onChange={(e) => this.handleFilterChange('downtimeName', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="비가동(분)"
                  type="number"
                  value={filters.downtimeMinutes ?? ''}
                  onChange={(e) => this.handleFilterChange('downtimeMinutes', e.target.value)}
                  size="small"
                />
              </Grid>

              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  label="비고"
                  value={filters.note}
                  onChange={(e) => this.handleFilterChange('note', e.target.value)}
                  size="small"
                />
              </Grid>
            </Grid>
          </Collapse>

          {/* 버튼 */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={this.clearFilters}
                size="large"
                color="secondary"
              >
                필터 초기화
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={this.handleSearch}
                size="large"
                sx={{
                  backgroundColor: themeHex,
                  '&:hover': { backgroundColor: themeHex },
                }}
              >
                검색
              </Button>
            </Box>
          </Grid>
        </Paper>

        {/* 그리드 */}
        <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
          {loading ? (
            <Box sx={{ height: gridHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
            </Box>
          ) : error ? (
            <Box sx={{ p: 3 }}>
              <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              <Button
                variant="contained"
                onClick={this.refreshData}
                sx={{ backgroundColor: themeHex }}
              >
                다시 시도
              </Button>
            </Box>
          ) : (downtimeData?.length ?? 0) === 0 ? (
            <Box sx={{ height: gridHeight, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Typography color="text.secondary">데이터가 없습니다.</Typography>
            </Box>
          ) : (
            <Box sx={{ height: gridHeight, width: '100%' }}>
              <DataGrid
                rows={downtimeData}
                columns={this.columns}
                pagination
                paginationMode="client"
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: { paginationModel: { page: 0, pageSize: 10 } },
                }}
                disableRowSelectionOnClick
                density="compact"
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } },
                }}
                sx={{
                  '& .super-app-theme--header': {
                    backgroundColor: themeHex,
                    color: 'white',
                    fontWeight: 'bold',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
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
                  '& .MuiDataGrid-scrollbar--horizontal': {
                    minHeight: 12,
                  },
                }}
              />
            </Box>
          )}
        </Paper>

        {/* 품목코드 선택 모달 */}
        <ItemCodeModal
          open={itemCodeModalOpen}
          onClose={this.closeItemCodeModal}
          onSelect={this.handleItemCodeSelect}
          selectedItemCode={filters.itemCode}
          plant={filters.plant}
          worker={filters.workerplace}
          line={filters.line}
          start_work_date={filters.start_work_date}
          end_work_date={filters.end_work_date}
        />
      </Box>
    );
  }
}

export default connect((state) => ({
  themeHex: selectThemeHex(state),
  themeKey: selectThemeKey(state),
}))(DowntimeGrid);
