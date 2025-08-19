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
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import s from './DowntimeGrid.module.scss';

class DowntimeGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 검색 필터
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
      filterExpanded: false,
      downtimeData: [],
      loading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchDowntimeData();
  }

  fetchDowntimeData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const requestBody = { ...this.state.filters };
      const response = await fetch('http://localhost:8000/smartFactory/downtime_grid/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const json = await response.json();

      // ── 원본 응답 로깅 ─────────────────────────────────────────────
      console.log('[RAW json]', json);

      // 다양한 응답 형태에 대비하여 배열을 안전하게 추출
      const dataArray =
        (Array.isArray(json) && json) ||
        (Array.isArray(json?.data) && json.data) ||
        (Array.isArray(json?.result) && json.result) ||
        [];

      if (dataArray.length > 0) {
        console.log('[RAW first row keys]', Object.keys(dataArray[0]));
      } else {
        console.log('[RAW] data 배열이 비어있거나 구조가 다릅니다.');
      }

      const formatted = this.formatApiData(dataArray);

      // 포맷 결과 확인
      console.log('[FORMATTED first row]', formatted[0]);
      console.log('[FORMATTED workDate list]', formatted.map(r => r.workDate));

      this.setState({ downtimeData: formatted, loading: false });
    } catch (err) {
      console.error('데이터 로드 중 오류:', err);
      this.setState({
        error: '데이터를 불러오는 중 오류가 발생했습니다.',
        loading: false,
      });
    }
  };

  // ★★★ 전처리에서 Date 객체로 변환(방법 2 핵심)
  formatApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];

    return apiData.map((item, idx) => {
      // 근무일자 후보를 넓게 잡아 매핑
      const workDateRaw =
        item.workDate ??
        item.work_date ??
        item.start_work_date ??
        item.end_work_date ??
        item['근무일자'] ??
        item.date ??
        item.Date ??
        '';

      // 안전 파싱: 'YYYY-MM-DD' → 로컬 기준 날짜로 인식되도록 T00:00:00 붙임
      let workDate = null;
      if (workDateRaw) {
        const str = typeof workDateRaw === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(workDateRaw)
          ? `${workDateRaw}T00:00:00`
          : workDateRaw;
        const d = new Date(str);
        workDate = isNaN(d.getTime()) ? null : d;
      }

      // 비가동(분) 숫자화
      const downtimeMinutesRaw =
        item.downtimeMinutes ??
        item['비가동(분)'] ??
        item.비가동분 ??
        0;
      const downtimeMinutes = Number(downtimeMinutesRaw) || 0;

      return {
        id: item.id || idx + 1,
        workDate, // ★ Date 객체로 저장
        plant: item.plant ?? item.플랜트 ?? '',
        worker: item.worker ?? item.책임자 ?? '',
        workplace: item.workplace ?? item.작업장 ?? '',
        itemCode: item.itemCode ?? item.자재번호 ?? '',
        carModel: item.carModel ?? item.차종 ?? '',
        downtimeCode: item.downtimeCode ?? item.비가동코드 ?? '',
        downtimeName: item.downtimeName ?? item.비가동명 ?? '',
        downtimeMinutes,
        note: item.note ?? item.비고 ?? '',
      };
    });
  };

  clearFilters = () => {
    this.setState({
      filters: {
        start_work_date: '',
        end_work_date: '',
        plant: '',
        worker: '',
        workplace: '',
        itemCode: '',
        carModel: '',
        downtimeCode: '',
        downtimeName: '',
        downtimeMinutes: '',
        note: '',
      },
      downtimeData: [],
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

  // DataGrid 컬럼 정의
  columns = [
    {
      field: 'id',
      headerName: 'No.',
      width: 80,
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'workDate',
      headerName: '근무일자',
      width: 120,
      type: 'date',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      // ★ valueGetter 제거! (row 접근 없이, Date로 이미 저장됨)
      valueFormatter: (params) => {
        const v = params?.value;
        const d = v instanceof Date ? v : (v ? new Date(v) : null);
        return d && !isNaN(d.getTime()) ? d.toLocaleDateString('ko-KR') : '';
      },
    },
    {
      field: 'plant',
      headerName: '플랜트',
      width: 160,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'worker',
      headerName: '책임자',
      width: 120,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'workplace',
      headerName: '작업장',
      width: 120,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'itemCode',
      headerName: '자재번호',
      width: 140,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'carModel',
      headerName: '차종',
      width: 120,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'downtimeCode',
      headerName: '비가동코드',
      width: 140,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'downtimeName',
      headerName: '비가동명',
      width: 200,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
    {
      field: 'downtimeMinutes',
      headerName: '비가동(분)',
      width: 120,
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
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
    {
      field: 'note',
      headerName: '비고',
      width: 260,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
    },
  ];

  componentDidUpdate(prevProps, prevState) {
    if (prevState.downtimeData !== this.state.downtimeData) {
      // state에 저장된 workDate들을 한 번 더 확인 (필요 없으면 제거)
      console.log('[STATE] workDate list after setState:',
        this.state.downtimeData.map(r => r.workDate)
      );
    }
  }

  render() {
    const { filters, filterExpanded, downtimeData, loading, error } = this.state;

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
              <IconButton onClick={this.toggleFilterExpansion} sx={{ color: 'white' }}>
                {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
            sx={{
              backgroundColor: '#ff8f00',
              color: 'white',
              borderRadius: 1,
              mb: 2,
            }}
          />

          {/* 기본 필터 */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="시작일"
                type="date"
                value={filters.start_work_date}
                onChange={(e) => this.handleFilterChange('start_work_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="종료일"
                type="date"
                value={filters.end_work_date}
                onChange={(e) => this.handleFilterChange('end_work_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="플랜트"
                value={filters.plant}
                onChange={(e) => this.handleFilterChange('plant', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="책임자"
                value={filters.worker}
                onChange={(e) => this.handleFilterChange('worker', e.target.value)}
                size="small"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="작업장"
                value={filters.workplace}
                onChange={(e) => this.handleFilterChange('workplace', e.target.value)}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="자재번호"
                value={filters.itemCode}
                onChange={(e) => this.handleFilterChange('itemCode', e.target.value)}
                size="small"
              />
            </Grid>
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
          </Grid>

          {/* 확장 필터 */}
          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
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
                  backgroundColor: '#ff8f00',
                  '&:hover': { backgroundColor: '#f57c00' },
                }}
              >
                검색
              </Button>
            </Box>
          </Grid>
        </Paper>

        {/* 그리드 */}
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
                  onClick={this.refreshData}
                  sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
                >
                  다시 시도
                </Button>
              </Box>
            )}

            {!loading && !error && (
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

export default DowntimeGrid;
