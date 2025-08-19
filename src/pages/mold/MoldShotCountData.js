// src/pages/mold/MoldShotCountData.js
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
  ExpandLess as ExpandLessIcon,
  ThermostatOutlined
} from '@mui/icons-material';

import s from './MoldCleaningData.module.scss'; // 스타일 재사용(원하면 파일명 변경)

const API_URL = 'http://localhost:8000/smartFactory/mold_shotCount/list'; 
// ↑ 백엔드 경로가 다르면 여기만 수정하세요.

class MoldShotCountData extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: {
        // === 주신 스키마를 그대로 반영 (초기값은 공란) ===
        plant: '',
        equipment_type: '',
        mold_no: '',
        mold_name: '',
        measuring_point: '',
        measuring_position: '',
        cum_shot_min: '',
        cum_shot_max: '',
        inspection_hit_count: '',
        maintenance_cycle: '',
        maintenance_cycle_unit: '',
        progress_min: '',
        progress_max: '',
        functional_location: '',
        functional_location_desc: '',
        planner_group: '',
        maintenance_plan: '',
        startDate: "2025-01-01",
        endDate: "2025-06-30",
        part_no1: '',
        part_no2: '',
        part_no3: '',
        part_no4: '',
        part_no5: ''
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

  // 빈 값 제거 + 숫자/실수 변환
  buildPayload = () => {
    const f = this.state.filters;

    const parseIntOrNull = (v) => (v === '' || v === null || v === undefined ? null : parseInt(v, 10));
    const parseFloatOrNull = (v) => (v === '' || v === null || v === undefined ? null : parseFloat(v));

    const payload = {
      plant: parseIntOrNull(f.plant),
      equipment_type: f.equipment_type?.trim() || null,
      mold_no: parseIntOrNull(f.mold_no),
      mold_name: f.mold_name?.trim() || null,
      measuring_point: parseIntOrNull(f.measuring_point),
      measuring_position: f.measuring_position?.trim() || null,
      cum_shot_min: parseIntOrNull(f.cum_shot_min),
      cum_shot_max: parseIntOrNull(f.cum_shot_max),
      inspection_hit_count: parseIntOrNull(f.inspection_hit_count),
      maintenance_cycle: parseIntOrNull(f.maintenance_cycle),
      maintenance_cycle_unit: f.maintenance_cycle_unit?.trim() || null,
      progress_min: parseFloatOrNull(f.progress_min),
      progress_max: parseFloatOrNull(f.progress_max),
      functional_location: f.functional_location?.trim() || null,
      functional_location_desc: f.functional_location_desc?.trim() || null,
      planner_group: f.planner_group?.trim() || null,
      maintenance_plan: f.maintenance_plan?.trim() || null,
      startDate: f.startDate || null, // YYYY-MM-DD
      endDate: f.endDate || null,
      part_no1: f.part_no1?.trim() || null,
      part_no2: f.part_no2?.trim() || null,
      part_no3: f.part_no3?.trim() || null,
      part_no4: f.part_no4?.trim() || null,
      part_no5: f.part_no5?.trim() || null
    };

    // 값이 null/''/undefined인 키는 제거 → 불필요한 0/빈값 전송 방지
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
      console.log(JSON.stringify(this.buildPayload()))
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      // 백엔드가 { data: [...] } 형태라면 아래처럼, 아니면 json로 교체
      const formatted = this.formatApiData(json.data);
      this.setState({ rows: formatted, loading: false });
    } catch (error) {
      console.error('금형타발수 데이터 로드 오류:', error);
      this.setState({ error: '데이터를 불러오는 중 오류가 발생했습니다.', loading: false });
    }
  };

  formatApiData = (apiData) => {
    if (!Array.isArray(apiData)) return [];
    return apiData.map((item, index) => {
      // 한글 컬럼 ↔ 영문 키 매핑 (SELECT * 원본을 그대로 받더라도 안전)
      const plant = item.plant ?? item['플랜트'] ?? null;
      const equipment_type = item.equipment_type ?? item['설비유형'] ?? '';
      const mold_no = item.mold_no ?? item['금형번호'] ?? null;
      const mold_name = item.mold_name ?? item['금형내역'] ?? '';
      const measuring_point = item.measuring_point ?? item['측정지점'] ?? null;
      const measuring_position = item.measuring_position ?? item['측정위치'] ?? '';
      const cum_shot = item.cum_shot ?? item['누적 Shot 수'] ?? null;
      const inspection_hit_count = item.inspection_hit_count ?? item['점검타발수'] ?? null;
      const maintenance_cycle = item.maintenance_cycle ?? item['유지보수주기'] ?? null;
      const progress = item.progress ?? item['진행률(%)'] ?? null;
      const maintenance_cycle_unit = item.maintenance_cycle_unit ?? item['유지보수주기단위'] ?? '';
      const functional_location = item.functional_location ?? item['기능위치'] ?? '';
      const functional_location_desc = item.functional_location_desc ?? item['기능위치 내역'] ?? '';
      const planner_group = item.planner_group ?? item['계획자그룹'] ?? '';
      const maintenance_plan = item.maintenance_plan ?? item['유지보수계획'] ?? '';
      const last_result_date = item.last_result_date ?? item['생산실적처리 최종일'] ?? ''; // date
      const part_no1 = item.part_no1 ?? item['타발처리 품번1'] ?? '';
      const part_no2 = item.part_no2 ?? item['타발처리 품번2'] ?? '';
      const part_no3 = item.part_no3 ?? item['타발처리 품번3'] ?? '';
      const part_no4 = item.part_no4 ?? item['타발처리 품번4'] ?? '';
      const part_no5 = item.part_no5 ?? item['타발처리 품번5'] ?? '';

      return {
        id: index+1,
        plant,
        equipment_type,
        mold_no,
        mold_name,
        measuring_point,
        measuring_position,
        cum_shot,
        inspection_hit_count,
        maintenance_cycle,
        progress,
        maintenance_cycle_unit,
        functional_location,
        functional_location_desc,
        planner_group,
        maintenance_plan,
        last_result_date,
        part_no1,
        part_no2,
        part_no3,
        part_no4,
        part_no5
      };
    });
  };

  clearFilters = () => {
    this.setState({
      filters: {
        plant: '',
        equipment_type: '',
        mold_no: '',
        mold_name: '',
        measuring_point: '',
        measuring_position: '',
        cum_shot_min: '',
        cum_shot_max: '',
        inspection_hit_count: '',
        maintenance_cycle: '',
        maintenance_cycle_unit: '',
        progress_min: '',
        progress_max: '',
        functional_location: '',
        functional_location_desc: '',
        planner_group: '',
        maintenance_plan: '',
        startDate: '',
        endDate: '',
        part_no1: '',
        part_no2: '',
        part_no3: '',
        part_no4: '',
        part_no5: ''
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
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell'},
    { field: 'last_result_date', headerName: '최종처리일', width: 140, type: 'date',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      valueGetter: (params) => (params.value ? new Date(params.value) : null) },
    { field: 'plant', headerName: '플랜트', width: 100, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'equipment_type', headerName: '설비유형', width: 110,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'mold_no', headerName: '금형번호', width: 110, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'mold_name', headerName: '금형내역', width: 100,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      renderCell: (params) => (<Chip label={params.value || '-'} size="small" variant="outlined" />) },
    { field: 'measuring_point', headerName: '측정지점', width: 110, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'measuring_position', headerName: '측정위치', width: 160,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'cum_shot', headerName: '누적 Shot 수', width: 130, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspection_hit_count', headerName: '점검타발수', width: 120, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'maintenance_cycle', headerName: '유지보수주기', width: 120, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'maintenance_cycle_unit', headerName: '주기단위', width: 100,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'progress', headerName: '진행률(%)', width: 110, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'functional_location', headerName: '기능위치', width: 150,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'functional_location_desc', headerName: '기능위치 내역', width: 150,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'planner_group', headerName: '계획자그룹', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'maintenance_plan', headerName: '유지보수계획', width: 180,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'part_no1', headerName: '품번1', width: 110,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'part_no2', headerName: '품번2', width: 110,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'part_no3', headerName: '품번3', width: 110,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'part_no4', headerName: '품번4', width: 110,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'part_no5', headerName: '품번5', width: 110,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' }
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
            금형타발수 데이터 그리드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            금형타발수(누적/점검타발/주기/진행률) 및 기능/계획/품번 정보 조회.
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
                value={filters.startDate}
                onChange={(e) => this.handleFilterChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }} size="small" variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth label="검색 종료일" type="date"
                value={filters.endDate}
                onChange={(e) => this.handleFilterChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }} size="small" variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth label="플랜트" type="number"
                value={filters.plant}
                onChange={(e) => this.handleFilterChange('plant', e.target.value)}
                size="small" variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth label="설비유형"
                value={filters.equipment_type}
                onChange={(e) => this.handleFilterChange('equipment_type', e.target.value)}
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
                  fullWidth label="금형번호" type="number"
                  value={filters.mold_no}
                  onChange={(e) => this.handleFilterChange('mold_no', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="금형내역"
                  value={filters.mold_name}
                  onChange={(e) => this.handleFilterChange('mold_name', e.target.value)}
                  size="small" variant="outlined"
                  InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="측정지점" type="number"
                  value={filters.measuring_point}
                  onChange={(e) => this.handleFilterChange('measuring_point', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="측정위치"
                  value={filters.measuring_position}
                  onChange={(e) => this.handleFilterChange('measuring_position', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="누적 Shot 수 (이상)" type="number"
                  value={filters.cum_shot_min}
                  onChange={(e) => this.handleFilterChange('cum_shot_min', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="누적 Shot 수 (이하)" type="number"
                  value={filters.cum_shot_max}
                  onChange={(e) => this.handleFilterChange('cum_shot_max', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="점검타발수" type="number"
                  value={filters.inspection_hit_count}
                  onChange={(e) => this.handleFilterChange('inspection_hit_count', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="유지보수주기" type="number"
                  value={filters.maintenance_cycle}
                  onChange={(e) => this.handleFilterChange('maintenance_cycle', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="주기단위"
                  value={filters.maintenance_cycle_unit}
                  onChange={(e) => this.handleFilterChange('maintenance_cycle_unit', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="진행률(%) (이상)" type="number"
                  value={filters.progress_min}
                  onChange={(e) => this.handleFilterChange('progress_min', e.target.value)}
                  size="small" variant="outlined" inputProps={{ step: '0.01' }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="진행률(%) (이하)" type="number"
                  value={filters.progress_max}
                  onChange={(e) => this.handleFilterChange('progress_max', e.target.value)}
                  size="small" variant="outlined" inputProps={{ step: '0.01' }}
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="기능위치"
                  value={filters.functional_location}
                  onChange={(e) => this.handleFilterChange('functional_location', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="기능위치 내역"
                  value={filters.functional_location_desc}
                  onChange={(e) => this.handleFilterChange('functional_location_desc', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="계획자그룹"
                  value={filters.planner_group}
                  onChange={(e) => this.handleFilterChange('planner_group', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth label="유지보수계획"
                  value={filters.maintenance_plan}
                  onChange={(e) => this.handleFilterChange('maintenance_plan', e.target.value)}
                  size="small" variant="outlined"
                />
              </Grid>

              {/* 품번 1~5 */}
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField fullWidth label="품번1"
                  value={filters.part_no1}
                  onChange={(e) => this.handleFilterChange('part_no1', e.target.value)}
                  size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField fullWidth label="품번2"
                  value={filters.part_no2}
                  onChange={(e) => this.handleFilterChange('part_no2', e.target.value)}
                  size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField fullWidth label="품번3"
                  value={filters.part_no3}
                  onChange={(e) => this.handleFilterChange('part_no3', e.target.value)}
                  size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField fullWidth label="품번4"
                  value={filters.part_no4}
                  onChange={(e) => this.handleFilterChange('part_no4', e.target.value)}
                  size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={2.4}>
                <TextField fullWidth label="품번5"
                  value={filters.part_no5}
                  onChange={(e) => this.handleFilterChange('part_no5', e.target.value)}
                  size="small" variant="outlined" />
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

export default MoldShotCountData;
