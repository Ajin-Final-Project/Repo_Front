// src/pages/mold/MoldShotCheck.js
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
  MenuItem
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon, 
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  ThermostatOutlined
} from '@mui/icons-material';

import s from './MoldCleaningData.module.scss'; // 스타일 재사용(원하면 파일명 변경)
import config from '../../config';

import ItemCodeModal from '../common/ItemCodeModal';

const API_URL = `${config.baseURLApi}/smartFactory/mold_shot_check/list`; 
// ↑ 백엔드 경로가 다르면 여기만 수정하세요.

class MoldShotCheck extends Component {
  constructor(props) {
    super(props);

    this.state = {
      filters: {
        // === 생산내역 필터링 조건 ===
        responsible_person: '',
        work_center: '',
        itemCode: '',
        itemName: '',
        plant: "아진산업-경산(본사)",                  // 공장
        worker: "프레스",                 // 작업자
        line: "1500T",
        
        // === 금형세척주기 검색 조건 ===
        equipment_detail: '',
        order_type: '',
        action_content: '',
        basic_start_date: new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE'),
        basic_end_date:  new Date().toLocaleDateString('sv-SE'),
        
        // === 금형타발수관리 검색 조건 ===
        mold_no: '',
        measuring_point: '',
        measuring_position: '',
        cum_shot_min: '',
        cum_shot_max: '',
        inspection_hit_count: '',
        maintenance_cycle: '',
        progress_min: '',
        progress_max: '',
        
        // === 날짜 범위 검색 ===
        start_date: "2025-01-01",
        end_date: "2025-06-30",   
      },
      filterExpanded: false,
      quickRange: 'year', // 빠른 기간 선택 상태
      rows: [],
      loading: false,
      error: null,
      itemCodeModalOpen: false,
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
      // === 생산내역 필터링 조건 ===
      plant: f.plant?.trim() || null,
      responsible_person: f.worker?.trim() || null,
      work_center: f.line?.trim() || null,
      material_no: f.itemCode?.trim() || null,
      material_name: f.itemName?.trim() || null,
      
      // === 금형세척주기 검색 조건 ===
      equipment_detail: f.equipment_detail?.trim() || null,
      order_type: f.order_type?.trim() || null,
      action_content: f.action_content?.trim() || null,
      basic_start_date: f.basic_start_date || null,
      basic_end_date: f.basic_end_date || null,
      
      // === 금형타발수관리 검색 조건 ===
      mold_no: f.mold_no?.trim() || null,
      measuring_point: f.measuring_point?.trim() || null,
      measuring_position: f.measuring_position?.trim() || null,
      cum_shot_min: parseIntOrNull(f.cum_shot_min),
      cum_shot_max: parseIntOrNull(f.cum_shot_max),
      inspection_hit_count: parseIntOrNull(f.inspection_hit_count),
      maintenance_cycle: parseIntOrNull(f.maintenance_cycle),
      progress_min: parseFloatOrNull(f.progress_min),
      progress_max: parseFloatOrNull(f.progress_max),
      

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
      const plant = item.plant ?? item['플랜트'] ?? '';
      const responsible_person = item.responsible_person ?? item['책임자'] ?? '';
      const material_no = item.material_no ?? item['자재번호'] ?? '';
      const material_name = item.material_name ?? item['자재명'] ?? '';
      const equipment_detail = item.equipment_detail ?? item['설비내역'] ?? '';
      const order_type = item.order_type ?? item['오더유형'] ?? '';
      const action_content = item.action_content ?? item['조치내용'] ?? '';
      const basic_start_date = item.basic_start_date ?? item['기본시작일'] ?? '';
      const basic_end_date = item.basic_end_date ?? item['기본종료일'] ?? '';
      const shot_plant = item.shot_plant ?? item['shot_플랜트'] ?? null;
      const mold_no = item.mold_no ?? item['금형번호'] ?? null;
      const measuring_point = item.measuring_point ?? item['측정지점'] ?? null;
      const measuring_position = item.measuring_position ?? item['측정위치'] ?? '';
      const cum_shot = item.cum_shot ?? item['누적_Shot_수'] ?? null;
      const inspection_hit_count_80 = item.inspection_hit_count_80 ?? item['점검타발수_80'] ?? null;
      const inspection_hit_count_90 = item.inspection_hit_count_90 ?? item['점검타발수_90'] ?? null;
      const inspection_hit_count = item.inspection_hit_count ?? item['점검타발수'] ?? null;
      const maintenance_cycle = item.maintenance_cycle ?? item['유지보수주기'] ?? null;
      const progress_pct = item.progress_pct ?? item['진행율_pct'] ?? null;

      return {
        id: index+1,
        plant,
        responsible_person,
        material_no,
        material_name,
        equipment_detail,
        order_type,
        action_content,
        basic_start_date,
        basic_end_date,
        shot_plant,
        mold_no,
        measuring_point,
        measuring_position,
        cum_shot,
        inspection_hit_count_80,
        inspection_hit_count_90,
        inspection_hit_count,
        maintenance_cycle,
        progress_pct
      };
    });
  };

  clearFilters = () => {
    this.setState({
      filters: {
        ...this.state.filters,
        // plant: '',
        ////  worker: '',
        //line: '',
        itemCode: '',
        itemName: '',
        
        // === 금형세척주기 검색 조건 ===
        equipment_detail: '',
        order_type: '',
        action_content: '',
        basic_start_date: '',
        basic_end_date: '',
        
        // === 금형타발수관리 검색 조건 ===
        mold_no: '',
        measuring_point: '',
        measuring_position: '',
        cum_shot_min: '',
        cum_shot_max: '',
        inspection_hit_count: '',
        maintenance_cycle: '',
        progress_min: '',
        progress_max: '',
        
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

  // 빠른 기간 선택 메서드
  toYMD = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD

  setQuickRange = (type) => {
    const now = new Date();
    const today = this.toYMD(now);

    let start = today;
    let end = today;

    if (type === 'today') {
      // 금일: 오늘~오늘
      start = today;
      end = today;
    } else if (type === 'week') {
      // 주간: 월요일~오늘 (한국/ISO 기준 월요일 시작)
      const d = new Date(now);
      const day = d.getDay();           // 0(일)~6(토)
      const diffToMonday = (day + 6) % 7; // 월=1 -> 0, 일=0 -> 6
      d.setDate(d.getDate() - diffToMonday);
      start = this.toYMD(d);
      end = today;
    } else if (type === 'month') {
      // 월간: 1일~오늘
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      start = this.toYMD(d);
      end = today;
    } else if (type === 'year') {
      // 년간: 1월1일~오늘
      const d = new Date(now.getFullYear(), 0, 1);
      start = this.toYMD(d);
      end = today;
    }

    this.setState(prev => ({
      quickRange: type,
      filters: {
        ...prev.filters,
        basic_start_date: start,
        basic_end_date: end,
      },
      rows: [], // 선택 시 기존 데이터 초기화
    }));
  };

  columns = [
    { field: 'id', headerName: 'ID', width: 70, type: 'string',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell'},
    { field: 'plant', headerName: '공장', width: 180,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'responsible_person', headerName: '작업자', width: 100,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'material_no', headerName: '품번', width: 150,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'material_name', headerName: '품명', width: 200,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      renderCell: (params) => (<Chip label={params.value || '-'} size="small" variant="outlined" />) },
    { field: 'equipment_detail', headerName: '설비내역', width: 200,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'order_type', headerName: '오더유형', width: 100,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'action_content', headerName: '조치내용', width: 220,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'basic_start_date', headerName: '기본시작일', width: 120, type: 'date',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      valueGetter: (params) => (params.value ? new Date(params.value) : null) },
    { field: 'basic_end_date', headerName: '기본종료일', width: 120, type: 'date',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      valueGetter: (params) => (params.value ? new Date(params.value) : null) },
    { field: 'shot_plant', headerName: 'Shot 플랜트', width: 120, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'mold_no', headerName: '금형번호', width: 110, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'measuring_point', headerName: '측정지점', width: 110, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'measuring_position', headerName: '측정위치', width: 160,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'cum_shot', headerName: '누적 Shot 수', width: 130, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspection_hit_count_80', headerName: '점검타발수(80%)', width: 140, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspection_hit_count_90', headerName: '점검타발수(90%)', width: 140, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspection_hit_count', headerName: '점검타발수', width: 120, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'maintenance_cycle', headerName: '유지보수주기', width: 120, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'progress_pct', headerName: '진행률(%)', width: 110, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' }
  ];

  openItemCodeModal = () => {
    this.setState({ itemCodeModalOpen: true });
  };


closeItemCodeModal = () => {
    this.setState({ itemCodeModalOpen: false });
  };

 handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
            this.setState(prev => ({
              filters: {
                ...prev.filters,
                itemCode: 품목번호 || '',
                itemName: 품목명   || '',
              },
              itemCodeModalOpen: false, // 선택 후 모달 닫기
            }));
          };



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
            금형세척/점검 데이터 그리드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            금형세척 점검 데이터(생산내역, 금형세척주기, 금형타발수관리) 통합 조회.
          </Typography>
        </Box>

        {/* 검색 필터 카드 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          {/* 필터 섹션의 헤더 */}
          <CardHeader
            title={
              <Typography
                variant="h6"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'white',
                }}
              >
                <SearchIcon />
                검색 조건
              </Typography>
            }
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {/* 빠른 기간 버튼 */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={this.state.quickRange === 'today' ? 'contained' : 'outlined'}
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
                    variant={this.state.quickRange === 'week' ? 'contained' : 'outlined'}
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
                    variant={this.state.quickRange === 'month' ? 'contained' : 'outlined'}
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
                    variant={this.state.quickRange === 'year' ? 'contained' : 'outlined'}
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

                {/* 구분자 파이프(옵션) */}
                <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>

                {/* 기간선택 + 날짜 필드 */}
                <Typography sx={{ color: 'white' }}>기간선택</Typography>
                <TextField
                  type="date"
                  value={filters.basic_start_date}
                  onChange={(e) => this.handleFilterChange('basic_start_date', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                />
                <Typography sx={{ color: 'white' }}>~</Typography>
                <TextField
                  type="date"
                  value={filters.basic_end_date}
                  onChange={(e) => this.handleFilterChange('basic_end_date', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                />

                {/* 확장/축소 버튼 */}
                <IconButton onClick={this.toggleFilterExpansion} sx={{ color: 'white' }}>
                  {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            }
            sx={{
              backgroundColor: '#ff8f00',
              color: 'white',
              borderRadius: 1,
              mb: 2,
            }}
          />

          {/* 기본 필터 (8개) - 항상 보이는 주요 검색 필드들 */}
          <Grid container spacing={2}>
            {/* 플랜트 */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="공장"
                value={filters.plant}
                onChange={(e) => this.handleFilterChange('plant', e.target.value)}
                size="small"
                variant="outlined"
              >
              <MenuItem value="아진산업-경산(본사)">아진산업-본사(경산)</MenuItem>
              <MenuItem value="아진산업-1공장(경산)">아진산업-1공장(경산)</MenuItem>
              <MenuItem value="아진산업-구어공장(경주)">아진산업-구어공장(경주)</MenuItem>
              <MenuItem value="아진산업-하양공장(예정)">아진산업-하양공장(예정)</MenuItem>
              </TextField>
            </Grid>

            {/* 책임자 */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="작업자"
                value={filters.worker}
                onChange={(e) => this.handleFilterChange('worker', e.target.value)}
                size="small"
                variant="outlined"
               >
               <MenuItem value="프레스">프레스</MenuItem>
                          <MenuItem value="금형">금형</MenuItem>
                          <MenuItem value="블랭크">블랭크</MenuItem>
              </TextField>
            </Grid>

            {/* 작업장 */}
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="라인"
                value={filters.line}
                onChange={(e) => this.handleFilterChange('line', e.target.value)}
                size="small"
                variant="outlined"
                >
                <MenuItem value="1500T">1500T(E라인) </MenuItem>
                            <MenuItem value="1200T">1200T(D라인)</MenuItem>
                            <MenuItem value="1000T">1000T(F라인)</MenuItem>
                            <MenuItem value="1000T-PRO">1000T-PRO(G라인)</MenuItem>
              </TextField>
            </Grid>

            {/* 자재번호 */}
            <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="품번"
              value={filters.itemCode}
              onClick={this.openItemCodeModal}
              onSelect={this.handleItemCodeSelect}
              size="small"
              variant="outlined"
              InputProps={{
                readOnly: true,
                style: { cursor: 'pointer' },
                endAdornment: (
                  <InputAdornment position="end">
                    <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiInputBase-root': {
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="품목명"
              value={filters.itemName}
              onClick={this.openItemCodeModal}
              onSelect={this.handleItemCodeSelect}
              onChange={(e) => this.handleFilterChange('itemName', e.target.value)}
              size="small"
              variant="outlined"
               InputProps={{
                readOnly: true,
                style: { cursor: 'pointer' },
                endAdornment: (
                  <InputAdornment position="end">
                    <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiInputBase-root': {
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }
              }}
            />
          </Grid>
          </Grid>

          {/* 확장된 필터 - 화살표 클릭 시 펼쳐지는 추가 검색 필드들 */}
          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            {/* 구분선 추가 */}
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              {/* 금형세척주기 검색 조건 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#ff8f00', fontWeight: 'bold' }}>
                  금형세척주기 검색 조건
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="설비내역"
                  value={filters.equipment_detail}
                  onChange={(e) => this.handleFilterChange('equipment_detail', e.target.value)}
                  size="small"
                  variant="outlined"
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
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="조치내용"
                  value={filters.action_content}
                  onChange={(e) => this.handleFilterChange('action_content', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              {/* 금형타발수관리 검색 조건 */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2, color: '#ff8f00', fontWeight: 'bold', mt: 2 }}>
                  금형타발수관리 검색 조건
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="금형번호"
                  value={filters.mold_no}
                  onChange={(e) => this.handleFilterChange('mold_no', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="측정지점"
                  value={filters.measuring_point}
                  onChange={(e) => this.handleFilterChange('measuring_point', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="측정위치"
                  value={filters.measuring_position}
                  onChange={(e) => this.handleFilterChange('measuring_position', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="누적 Shot 수 (이상)"
                  type="number"
                  value={filters.cum_shot_min}
                  onChange={(e) => this.handleFilterChange('cum_shot_min', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="누적 Shot 수 (이하)"
                  type="number"
                  value={filters.cum_shot_max}
                  onChange={(e) => this.handleFilterChange('cum_shot_max', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="점검타발수"
                  type="number"
                  value={filters.inspection_hit_count}
                  onChange={(e) => this.handleFilterChange('inspection_hit_count', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="유지보수주기"
                  type="number"
                  value={filters.maintenance_cycle}
                  onChange={(e) => this.handleFilterChange('maintenance_cycle', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="진행률(%) (이상)"
                  type="number"
                  value={filters.progress_min}
                  onChange={(e) => this.handleFilterChange('progress_min', e.target.value)}
                  size="small"
                  variant="outlined"
                  inputProps={{ step: '0.01' }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="진행률(%) (이하)"
                  type="number"
                  value={filters.progress_max}
                  onChange={(e) => this.handleFilterChange('progress_max', e.target.value)}
                  size="small"
                  variant="outlined"
                  inputProps={{ step: '0.01' }}
                />
              </Grid>
            </Grid>
          </Collapse>

          {/* 버튼 행 - 필터 초기화와 검색 버튼 */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {/* 필터 초기화 버튼 */}
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={this.clearFilters}
                size="large"
                color="secondary"
              >
                필터 초기화
              </Button>
              
              {/* 검색 버튼 */}
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                size="large"
                sx={{ 
                  backgroundColor: '#ff8f00',
                  '&:hover': {
                    backgroundColor: '#f57c00'
                  }
                }}
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
                  columns: {
                      columnVisibilityModel: {
                        id: false,       
                        shot_plant: false,
                        mold_no: false, // hide:true 대신 여기서 숨김
                        measuring_point: false,
                        measuring_position: false
                      }}
                }}
                disableRowSelectionOnClick
                density="compact"
                slots={{ toolbar: GridToolbar }}
                slotProps={{
                  toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } },
                }}
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
        <ItemCodeModal
          open={this.state.itemCodeModalOpen}
          onClose={this.closeItemCodeModal}
          onSelect={this.handleItemCodeSelect}
          selectedItemCode={this.state.filters.itemCode}
          plant={this.state.filters.plant}
          worker={this.state.filters.worker}
          line={this.state.filters.line}
        />
      </Box>
    );
    
  }

}

export default MoldShotCheck;
