// src/pages/mold/MoldCleaningData.js
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

class MoldCleaningData extends Component {
  constructor(props) {
    super(props);

    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.state = {
      filters: {
        // 금형세척 전용 필터
        startDate: "2025-01-01" || firstDayOfMonth.toLocaleDateString('sv-SE'),
        endDate: "2025-06-30" || today.toLocaleDateString('sv-SE'),
        equipment_detail: '',
        order_type: '',
        order_type_detail: '',
        order_detail: '',
        action_detail: '',
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

  fetchData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const response = await fetch('http://localhost:8000/smartFactory/mold_cleaning/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.state.filters),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      const formatted = this.formatApiData(json?.data || []);
      this.setState({ rows: formatted, loading: false });
    } catch (error) {
      console.error('금형세척 데이터 로드 오류:', error);
      this.setState({ error: '데이터를 불러오는 중 오류가 발생했습니다.', loading: false });
    }
  };

  formatApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    return apiData.map((item, index) => {
      // 한글/영문 키 혼용 대비
      const equipment_detail = item.equipment_detail ?? item['설비내역'] ?? '';
      const order_type = item.order_type ?? item['오더유형'] ?? '';
      const order_type_detail = item.order_type_detail ?? item['오더유형내역'] ?? '';
      const order_detail = item.order_detail ?? item['오더내역'] ?? '';
      const action_detail = item.action_detail ?? item['조치내용'] ?? '';
      const base_start_date = item.base_start_date ?? item['기본시작일'] ?? '';
      const base_end_date = item.base_end_date ?? item['기본종료일'] ?? '';

      return {
        id: item.id ?? index + 1,
        equipment_detail,
        order_type,
        order_type_detail,
        order_detail,
        action_detail,
        base_start_date,
        base_end_date,
      };
    });
  };

  clearFilters = () => {
    this.setState({
      filters: {
        startDate: '',
        endDate: '',
        equipment_detail: '',
        order_type: '',
        order_type_detail: '',
        order_detail: '',
        action_detail: '',
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
    { 
      field: 'id',
      headerName: 'ID',
      width: 80,
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    {
      field: 'base_start_date',
      headerName: '기본시작일',
      width: 140,
      type: 'date',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      valueGetter: (params) => (params.value ? new Date(params.value) : null),
    },
    {
      field: 'base_end_date',
      headerName: '기본종료일',
      width: 140,
      type: 'date',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      valueGetter: (params) => (params.value ? new Date(params.value) : null),
    },
    {
      field: 'equipment_detail',
      headerName: '설비내역',
      width: 300,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      renderCell: (params) => (
        <Chip label={params.value || '-'} size="small" variant="outlined" />
      ),
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
      width: 160,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'order_detail',
      headerName: '오더내역',
      width: 250,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'action_detail',
      headerName: '조치내용',
      width: 300,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
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
            금형세척 데이터 그리드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            기본시작/종료일과 오더/조치 내역을 조회합니다.
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
                fullWidth
                label="검색 시작일"
                type="date"
                value={filters.startDate}
                onChange={(e) => this.handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="검색 종료일"
                type="date"
                value={filters.endDate}
                onChange={(e) => this.handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="설비내역"
                value={filters.equipment_detail}
                onChange={(e) => this.handleFilterChange('equipment_detail', e.target.value)}
                size="small"
                variant="outlined"
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
                label="오더유형"
                value={filters.order_type}
                onChange={(e) => this.handleFilterChange('order_type', e.target.value)}
                size="small"
                variant="outlined"
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
                  label="오더유형내역"
                  value={filters.order_type_detail}
                  onChange={(e) => this.handleFilterChange('order_type_detail', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="오더내역"
                  value={filters.order_detail}
                  onChange={(e) => this.handleFilterChange('order_detail', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="조치내용"
                  value={filters.action_detail}
                  onChange={(e) => this.handleFilterChange('action_detail', e.target.value)}
                  size="small"
                  variant="outlined"
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

export default MoldCleaningData;
