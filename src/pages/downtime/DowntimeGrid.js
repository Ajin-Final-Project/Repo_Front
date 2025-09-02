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
// ⬇️ 품목코드 선택 모달
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

      quickRange: null,         // 금일/주간/월간/년간
      filterExpanded: false,
      itemCodeModalOpen: false, // 모달 열림/닫힘

      downtimeData: [],
      loading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchDowntimeData();
  }

  // ---------- 유틸 ----------
  toYMD = (d) => {
    if (!d) return "";
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleDateString("sv-SE"); // YYYY-MM-DD
  };

  setQuickRange = (type) => {
    const now = new Date();
    const today = this.toYMD(now);

    let start = today;
    let end = today;

    if (type === 'today') {
      start = today; end = today;
    } else if (type === 'week') {
      const d = new Date(now);
      const day = d.getDay();                 // 0(일)~6(토)
      const diffToMonday = (day + 6) % 7;     // 월=0, 일=6
      d.setDate(d.getDate() - diffToMonday);  // 월요일
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
      downtimeData: [], // 선택 즉시 기존 데이터 초기화(옵션)
    }));
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
      this.setState({ downtimeData: formatted, loading: false });
    } catch (err) {
      console.error('데이터 로드 중 오류:', err);
      this.setState({
        error: '데이터를 불러오는 중 오류가 발생했습니다.',
        loading: false,
      });
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
        itemName: item.itemName ?? item.자재명 ?? '', // 표시용
        carModel: item.carModel ?? item.차종 ?? '',
        downtimeCode: item.downtimeCode ?? item.비가동코드 ?? '',
        downtimeName: item.downtimeName ?? item.비가동명 ?? '',
        downtimeMinutes,
        note: item.note ?? item.비고 ?? '',
        shift: item.shift ?? item['주야구분'] ?? '',
        productName: item.productName ?? item['품명'] ?? '',
        itemType: item.itemType ?? item['품목구분'] ?? '',
        categoryMain: item.categoryMain ?? item['대분류'] ?? '',
        categorySub: item.categorySub ?? item['소분류'] ?? '',
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
    { field: 'id', headerName: 'No.', width: 80, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
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

    { field: 'shift', headerName: '주야구분', width: 110,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'productName', headerName: '품명', width: 160,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'itemType', headerName: '품목구분', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'categoryMain', headerName: '대분류', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'categorySub', headerName: '소분류', width: 120,
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
              color: '#ffb300',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FilterIcon />
            비가동 데이터 그리드
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
            {/* 공장 */}
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

            {/* 작업장(공정군) */}
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

            {/* 라인 */}
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
                label="품목코드"
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
              {/* 1열 */}
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

              {/* 2열 */}
              <Grid item xs={12} sm={12} md={6}>
                <TextField
                  fullWidth
                  label="비고"
                  value={filters.note}
                  onChange={(e) => this.handleFilterChange('note', e.target.value)}
                  size="small"
                />
              </Grid>

              {/* 추가 필터 */}
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="주야구분"
                  value={filters.shift}
                  onChange={(e) => this.handleFilterChange('shift', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="품명"
                  value={filters.productName}
                  onChange={(e) => this.handleFilterChange('productName', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="품목구분"
                  value={filters.itemType}
                  onChange={(e) => this.handleFilterChange('itemType', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="대분류"
                  value={filters.categoryMain}
                  onChange={(e) => this.handleFilterChange('categoryMain', e.target.value)}
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="소분류"
                  value={filters.categorySub}
                  onChange={(e) => this.handleFilterChange('categorySub', e.target.value)}
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
          {/* ⚠️ DataGrid가 자기 내부 스크롤(세로/가로)을 가지도록 고정 높이 부여 */}
          <Box sx={{ height: 'calc(100vh - 380px)', width: '100%' }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress size={60} sx={{ color: themeHex }} />
              </Box>
            )}

            {error && (
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
            )}

            {!loading && !error && (
              <DataGrid
                rows={downtimeData}
                columns={this.columns}
                // ✅ autoHeight 제거: 내부 스크롤을 DataGrid가 관리
                // autoHeight

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
                  // (선택) 가로 스크롤바 가독성 향상
                  '& .MuiDataGrid-scrollbar--horizontal': {
                    minHeight: 12,
                  },
                }}
              />
            )}
          </Box>
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
