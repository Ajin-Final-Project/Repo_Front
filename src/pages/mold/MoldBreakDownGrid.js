// src/pages/mold/MoldBreakdownData.js
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
  Alert
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

import s from './MoldCleaningData.module.scss'; 

const API_URL = 'http://localhost:8000/smartFactory/mold_breakDown/list';

class MoldBreakdownGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        // 문자열
        status: '',
        document: '',
        function_location: '',
        function_location_detail: '',
        equipment_detail: '',
        order_type: '',
        order_type_detail: '',
        order_detail: '',
        failure: '',
        // 숫자
        equipment: '',
        order_no: '',
        notification_no: '',
        // 날짜(문자열 YYYY-MM-DD)
        start_date: '',
        end_date: ''
      },
      filterExpanded: false,
      rows: [],
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  // 빈 값 / '0' / 0 제거 로직
  buildPayload = () => {
    const f = this.state.filters;

    const parseIntOrNull = (v) => {
      if (v === '' || v === null || v === undefined) return null;
      const n = parseInt(v, 10);
      // 기본값 0은 필터 의미가 아니므로 제거 (필요 시 조건 주석 변경)
      if (n === 0) return null;
      return Number.isNaN(n) ? null : n;
    };

    const cleanStr = (v) => {
      if (v === null || v === undefined) return null;
      const s = String(v).trim();
      return s === '' ? null : s;
    };

    const payload = {
      status: cleanStr(f.status),
      document: cleanStr(f.document),
      function_location: cleanStr(f.function_location),
      function_location_detail: cleanStr(f.function_location_detail),
      equipment: parseIntOrNull(f.equipment),        // 0 -> null (필터 제외)
      equipment_detail: cleanStr(f.equipment_detail),
      order_type: cleanStr(f.order_type),
      order_type_detail: cleanStr(f.order_type_detail),
      order_no: parseIntOrNull(f.order_no),           // 0 -> null
      order_detail: cleanStr(f.order_detail),
      notification_no: parseIntOrNull(f.notification_no), // 0 -> null
      failure: cleanStr(f.failure),
      start_date: cleanStr(f.start_date),
      end_date: cleanStr(f.end_date)
    };

    // null/''/undefined 키 제거
    Object.keys(payload).forEach((k) => {
      if (payload[k] === null || payload[k] === '' || payload[k] === undefined) {
        delete payload[k];
      }
    });

    return payload;
  };

  fetchData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.buildPayload()),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      const formatted = this.formatApiData(json.data ?? json); // 서버 포맷에 맞춰 사용
      this.setState({ rows: formatted, loading: false });
    } catch (error) {
      console.error('금형고장내역 데이터 로드 오류:', error);
      this.setState({ error: '데이터를 불러오는 중 오류가 발생했습니다.', loading: false });
    }
  };

  // API 응답(한글/영문 키 혼용 대비) → DataGrid 행 매핑
  formatApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    return apiData.map((item, index) => {
      const status = item.status ?? item['상태'] ?? '';
      const document = item.document ?? item['문서'] ?? '';
      const function_location = item.function_location ?? item['기능위치'] ?? '';
      const function_location_detail = item.function_location_detail ?? item['기능위치내역'] ?? '';
      const equipment = item.equipment ?? item['설비'] ?? null;
      const equipment_detail = item.equipment_detail ?? item['설비내역'] ?? '';
      const order_type = item.order_type ?? item['오더유형'] ?? '';
      const order_type_detail = item.order_type_detail ?? item['오더유형내역'] ?? '';
      const order_no = item.order_no ?? item['오더번호'] ?? null;
      const order_detail = item.order_detail ?? item['오더내역'] ?? '';
      const start_date = item.start_date ?? item['기본시작일'] ?? null;
      const end_date = item.end_date ?? item['기본종료일'] ?? null;
      const planned_cost = item.planned_cost ?? item['계획비용'] ?? null;
      const actual_cost = item.actual_cost ?? item['실적비용'] ?? null;
      const settled_cost = item.settled_cost ?? item['정산비용'] ?? null;
      const notification_no = item.notification_no ?? item['통지번호'] ?? null;
      const failure = item.failure ?? item['고장'] ?? '';

      return {
        id: index + 1,
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
        planned_cost,
        actual_cost,
        settled_cost,
        notification_no,
        failure
      };
    });
  };

  clearFilters = () => {
    this.setState({
      filters: {
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
        start_date: '',
        end_date: ''
      },
      rows: []
    });
  };

  handleFilterChange = (field, value) => {
    this.setState(prev => ({
      filters: { ...prev.filters, [field]: value },
      rows: []
    }));
  };

  handleSearch = () => {
    this.fetchData();
  };

  toggleFilterExpansion = () => {
    this.setState(prev => ({ filterExpanded: !prev.filterExpanded }));
  };

  columns = [
    { field: 'id', headerName: 'ID', width: 70, type: 'string',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

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

    { field: 'equipment_detail', headerName: '설비내역', width: 160,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

    { field: 'order_type', headerName: '오더유형', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

    { field: 'order_type_detail', headerName: '오더유형내역', width: 130,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

    { field: 'order_no', headerName: '오더번호', width: 110, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

    { field: 'order_detail', headerName: '오더내역', width: 180,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

    { field: 'start_date', headerName: '기본시작일', width: 130, type: 'date',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      valueGetter: (p) => (p.value ? new Date(p.value) : null) },

    { field: 'end_date', headerName: '기본종료일', width: 130, type: 'date',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      valueGetter: (p) => (p.value ? new Date(p.value) : null) },

    { field: 'planned_cost', headerName: '계획비용', width: 110, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

    { field: 'actual_cost', headerName: '실적비용', width: 110, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

    { field: 'settled_cost', headerName: '정산비용', width: 110, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

    { field: 'notification_no', headerName: '통지번호', width: 120, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

    { field: 'failure', headerName: '고장', width: 180,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
  ];

  render() {
    const { filters, filterExpanded, rows, loading, error } = this.state;

    return (
      <Box className={s.root} sx={{
        height: '100vh',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{
            color: '#ffb300',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <FilterIcon />
            금형고장내역 데이터 그리드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            상태/문서/기능위치/오더/기간/비용/통지/고장 등 조건으로 조회합니다.
          </Typography>
        </Box>

        {/* 검색 필터 카드 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                color: 'white'
              }}>
                <SearchIcon />
                검색 조건
              </Typography>
            }
            action={
              <IconButton onClick={this.toggleFilterExpansion} sx={{ color: 'white' }}>
                {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
            sx={{
              backgroundColor: '#ff8f00',
              color: 'white',
              borderRadius: 1,
              mb: 2
            }}
          />

          {/* 기본 필터 */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth label="검색 시작일" type="date"
                value={filters.start_date}
                onChange={(e) => this.handleFilterChange('start_date', e.target.value)}
                InputLabelProps={{ shrink: true }} size="small" variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth label="검색 종료일" type="date"
                value={filters.end_date}
                onChange={(e) => this.handleFilterChange('end_date', e.target.value)}
                InputLabelProps={{ shrink: true }} size="small" variant="outlined"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth label="상태"
                value={filters.status}
                onChange={(e) => this.handleFilterChange('status', e.target.value)}
                size="small" variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth label="문서"
                value={filters.document}
                onChange={(e) => this.handleFilterChange('document', e.target.value)}
                size="small" variant="outlined"
              />
            </Grid>
          </Grid>

          {/* 확장 필터 */}
          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="기능위치"
                  value={filters.function_location}
                  onChange={(e) => this.handleFilterChange('function_location', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="기능위치내역"
                  value={filters.function_location_detail}
                  onChange={(e) => this.handleFilterChange('function_location_detail', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="설비" type="number"
                  value={filters.equipment}
                  onChange={(e) => this.handleFilterChange('equipment', e.target.value)}
                  size="small" variant="outlined"
                  helperText="0은 자동 제거(필터 미적용)"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="설비내역"
                  value={filters.equipment_detail}
                  onChange={(e) => this.handleFilterChange('equipment_detail', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="오더유형"
                  value={filters.order_type}
                  onChange={(e) => this.handleFilterChange('order_type', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="오더유형내역"
                  value={filters.order_type_detail}
                  onChange={(e) => this.handleFilterChange('order_type_detail', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="오더번호" type="number"
                  value={filters.order_no}
                  onChange={(e) => this.handleFilterChange('order_no', e.target.value)}
                  size="small" variant="outlined"
                  helperText="0은 자동 제거(필터 미적용)"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="오더내역"
                  value={filters.order_detail}
                  onChange={(e) => this.handleFilterChange('order_detail', e.target.value)}
                  size="small" variant="outlined"
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="통지번호" type="number"
                  value={filters.notification_no}
                  onChange={(e) => this.handleFilterChange('notification_no', e.target.value)}
                  size="small" variant="outlined"
                  helperText="0은 자동 제거(필터 미적용)"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={9}>
                <TextField
                  fullWidth label="고장"
                  value={filters.failure}
                  onChange={(e) => this.handleFilterChange('failure', e.target.value)}
                  size="small" variant="outlined"
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
                size="large"
                sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
                onClick={this.handleSearch}
              >
                검색
              </Button>
            </Box>
          </Grid>
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
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
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
      </Box>
    );
  }
}

export default MoldBreakdownGrid;
