// src/pages/inspection/InspectionSystemData.js
import config from '../../config';

// React
import React, { Component } from 'react';

// MUI
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Chip,
  CardHeader,
  IconButton,
  Divider,
  Collapse,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Popover,
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { 
  Search as SearchIcon, 
  Clear as ClearIcon, 
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

// SCSS
import s from './InspectionSystemData.module.scss'; 

/* =================== 기간 프리셋 유틸 =================== */
const iso = (d) => d.toLocaleDateString('sv-SE');                             // YYYY-MM-DD
const today0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const getAnchorPos = (el) => {                                                // 버튼 화면좌표 → anchorPosition
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
};
// 주간(월~일)
const startOfWeek = (d) => {
  const day = d.getDay();                       // 0=일,1=월...
  const diff = (day === 0 ? -6 : 1) - day;      // 월요일까지 보정
  const s = new Date(d);
  s.setDate(d.getDate() + diff);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate());
};
const endOfWeek = (d) => { const s = startOfWeek(d); return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6); };

const getWeeksOfMonth = (year, month) => {
  const first = new Date(year, month - 1, 1);
  const last  = lastOfMonth(first);
  let cur = startOfWeek(first);
  const out = [];
  let idx = 1;
  while (cur <= last) {
    const s = new Date(cur), e = endOfWeek(cur);
    const clipS = new Date(Math.max(s, first));
    const clipE = new Date(Math.min(e, last));
    out.push({ label: `${idx}주차`, start: clipS, end: clipE });
    idx += 1;
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
  }
  return out;
};
/* ======================================================= */

const parseDate = (v) => (v ? new Date(v) : null);

/**
 * 검사 데이터 그리드
 */
class InspectionGrid extends Component {
  constructor(props) {
    super(props);
    
    const today = new Date().toLocaleDateString('sv-SE');
    const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');

    this.state = {
      // === 1행 고정 5칸 ===
      filters: {
        plant: '',           // 공장
        process: '',         // 공정
        equipment: '',       // 설비
        itemNumber: '',      // 품번
        itemName: '',        // 품명 (백엔드 미전송, 자리만 확보)
        // === 나머지 ===
        businessPlace: '',
        inspectionType: '',
        start_work_date: jan1, 
        end_work_date: today,  
        shiftType: '',
        workSequence: null,
        workType: '',
        inspectionSequence: null,
        inspectionItemName: '',
        inspectionDetails: '',
        productionValue: null,
      },

      // 드롭다운 옵션 (원본데이터에서 계산)
      options: {
        plants: [],
        processes: [],
        equipments: [],
        itemNumbers: [],
      },

      // 기간 프리셋 UI 상태
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      yearAnchorPos: null,
      monthAnchorPos: null,
      weekAnchorPos: null,
      customAnchorPos: null,

      filterExpanded: false,

      // 데이터
      originalData: [],    // 최초 1회 로드 전체데이터
      inspectionData: [],  // 필터 적용된 결과
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    this.fetchAllDataOnce();   // 초기 전체 데이터 로드(단 1회)
  }

  /** 최초 1회 전체 데이터 로드 -> originalData 저장, 옵션/필터 적용 */
  fetchAllDataOnce = async () => {
    this.setState({ loading: true, error: null });
    try {
      const API_BASE = (config.baseURLApi || '').replace(/\/$/, '');
      const url = `${API_BASE}/smartFactory/inspection_grid/list`;

      // 전체 조회: 빈 바디로 호출 (백엔드는 모두 Optional)
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`HTTP error! status: ${res.status}, message: ${t}`);
      }
      const json = await res.json();
      const all = this.formatApiData(json.data);

      // 원본 저장 -> 옵션 계산 -> 필터 적용
      this.setState(
        { originalData: all, loading: false, error: null },
        () => {
          this.recomputeOptions();  // 드롭다운 옵션 계산
          this.applyFilters();      // 현재 필터로 결과 반영
        }
      );
    } catch (e) {
      console.error('초기 데이터 로드 오류:', e);
      this.setState({ loading: false, error: `데이터 로드 오류: ${e.message || e}` });
    }
  };

  /** 응답 → 그리드 매핑 */
  formatApiData = (apiData) => {
    if (Array.isArray(apiData)) {
      return apiData.map((item, index) => ({
        id: item.id || index + 1,
        businessPlace: item.businessPlace || '',
        plant: item.plant || '',
        process: item.process || '',
        equipment: item.equipment || '',
        inspectionType: item.inspectionType || '',
        itemNumber: item.itemNumber || '',
        reportDate: item.reportDate ? new Date(item.reportDate) : null,
        shiftType: item.shiftType || '',
        workSequence: item.workSequence ?? null,
        workType: item.workType || '',
        inspectionSequence: item.inspectionSequence ?? null,
        inspectionItemName: item.inspectionItemName || '',
        inspectionDetails: item.inspectionDetails || '',
        productionValue: item.productionValue ?? null
      }));
    }
    console.warn("API 응답 데이터 형식이 예상과 다릅니다. 배열이 아닙니다:", apiData);
    return [];
  };

  /** 현재 filters에 맞춰 로컬 필터링 */
  applyFilters = () => {
    const { originalData, filters } = this.state;

    const sDate = parseDate(filters.start_work_date);
    const eDate = parseDate(filters.end_work_date);
    const str = (v) => String(v ?? '').trim();

    const numEq = (a, b) => (b === null || b === '' ? true : Number(a) === Number(b));

    const pass = (row) => {
      // 1행 5칸
      if (filters.plant && row.plant !== filters.plant) return false;
      if (filters.process && row.process !== filters.process) return false;
      if (filters.equipment && row.equipment !== filters.equipment) return false;
      if (filters.itemNumber && row.itemNumber !== filters.itemNumber) return false;
      // 품명은 자리확보용(현재 조건 미적용)

      // 2행 이후
      if (filters.businessPlace && row.businessPlace !== filters.businessPlace) return false;
      if (filters.inspectionType && row.inspectionType !== filters.inspectionType) return false;
      if (filters.shiftType && row.shiftType !== filters.shiftType) return false;
      if (filters.workType && row.workType !== filters.workType) return false;

      if (!numEq(row.workSequence, filters.workSequence)) return false;
      if (!numEq(row.inspectionSequence, filters.inspectionSequence)) return false;
      if (!numEq(row.productionValue, filters.productionValue)) return false;

      if (str(filters.inspectionItemName)) {
        if (!str(row.inspectionItemName).includes(str(filters.inspectionItemName))) return false;
      }
      if (str(filters.inspectionDetails)) {
        if (!str(row.inspectionDetails).includes(str(filters.inspectionDetails))) return false;
      }

      // 날짜 범위
      if (sDate && row.reportDate && row.reportDate < sDate) return false;
      if (eDate && row.reportDate && row.reportDate > eDate) return false;

      return true;
    };

    this.setState({ inspectionData: originalData.filter(pass) });
  };

  /** 원본데이터 + 현재 상위 선택값으로 드롭다운 옵션 재계산 (연쇄) */
  recomputeOptions = () => {
    const { originalData, filters } = this.state;

    // 유틸: 중복제거
    const uniq = (arr) => Array.from(new Set(arr.filter((v) => v !== null && v !== undefined && String(v).trim() !== '')));

    // 1) plant 옵션: 전체에서
    const plants = uniq(originalData.map((r) => r.plant)).sort();

    // 2) process 옵션: plant가 선택되면 그 plant만, 아니면 전체
    const scopeForProcess = filters.plant
      ? originalData.filter((r) => r.plant === filters.plant)
      : originalData;
    const processes = uniq(scopeForProcess.map((r) => r.process)).sort();

    // 3) equipment 옵션: plant/process 둘 다 고려
    const scopeForEquip = scopeForProcess.filter((r) =>
      filters.process ? r.process === filters.process : true
    );
    const equipments = uniq(scopeForEquip.map((r) => r.equipment)).sort();

    // 4) itemNumber 옵션: plant/process/equipment 모두 고려
    const scopeForItem = scopeForEquip.filter((r) =>
      filters.equipment ? r.equipment === filters.equipment : true
    );
    const itemNumbers = uniq(scopeForItem.map((r) => r.itemNumber)).sort();

    this.setState({
      options: { plants, processes, equipments, itemNumbers }
    });
  };

  /** 필터 변경 → 즉시 로컬 필터 + 옵션 재계산 */
  handleFilterChange = (field, value) => {
    this.setState(
      (prev) => ({
        filters: {
          ...prev.filters,
          [field]:
            (field.includes('Sequence') || field === 'productionValue') && value === ''
              ? null
              : value,
        },
      }),
      () => {
        // 1행(연쇄) 관련 필드가 바뀌면 옵션부터 갱신
        if (['plant', 'process', 'equipment'].includes(field)) {
          // 하위 필터 자동 초기화(상위 바뀌면 하위 선택이 무의미해질 수 있으니)
          this.setState(
            (prev) => {
              const next = { ...prev.filters };
              if (field === 'plant') {
                next.process = '';
                next.equipment = '';
                next.itemNumber = '';
              } else if (field === 'process') {
                next.equipment = '';
                next.itemNumber = '';
              } else if (field === 'equipment') {
                next.itemNumber = '';
              }
              return { filters: next };
            },
            () => {
              this.recomputeOptions();
              this.applyFilters();
            }
          );
        } else {
          // 일반 필터는 바로 적용
          this.applyFilters();
        }
      }
    );
  };

  /** 수동 검색 버튼: 서버 재호출 없이 로컬 필터만 재적용 */
  handleSearch = () => this.applyFilters();

  /** 확장 토글 */
  toggleFilterExpansion = () => {
    this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }));
  };

  /** 필터 초기화 */
  clearFilters = () => {
    const today = new Date().toLocaleDateString('sv-SE');
    const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');

    this.setState(
      {
        filters: {
          plant: '',
          process: '',
          equipment: '',
          itemNumber: '',
          itemName: '',
          businessPlace: '',
          inspectionType: '',
          start_work_date: jan1,
          end_work_date: today,
          shiftType: '',
          workSequence: null,
          workType: '',
          inspectionSequence: null,
          inspectionItemName: '',
          inspectionDetails: '',
          productionValue: null,
        },
      },
      () => {
        this.recomputeOptions();
        this.applyFilters();
      }
    );
  };

  /* ===================== 기간 프리셋 동작 ===================== */
  setDateRange = (start, end) => {
    const start_work_date = iso(start);
    const end_work_date   = iso(end);
    this.setState(
      (prev) => ({ filters: { ...prev.filters, start_work_date, end_work_date } }),
      this.applyFilters
    );
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

  resetToThisYear = () => {
    const y = new Date().getFullYear();
    const s = new Date(y, 0, 1);
    const e = new Date(y, 11, 31);
    this.setState({ selectedYear: y, selectedMonth: new Date().getMonth()+1 });
    this.setDateRange(s, e);
  };
  /* =========================================================== */

  /** 그리드 컬럼 */
  columns = [
    { field: 'id', headerName: 'ID', width: 80, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'businessPlace', headerName: '사업장', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'plant', headerName: '공장', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'process', headerName: '공정', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'equipment', headerName: '설비', width: 150, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspectionType', headerName: '검사구분', width: 100, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'itemNumber', headerName: '품번', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'reportDate', headerName: '보고일', width: 120, type: 'date', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', valueGetter: (params) => params.value instanceof Date && !isNaN(params.value) ? params.value : null },
    { field: 'shiftType', headerName: '주야구분', width: 100, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'workSequence', headerName: '작업순번', width: 100, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'workType', headerName: '작업구분', width: 100, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspectionSequence', headerName: '검사순번', width: 120, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspectionItemName', headerName: '검사항목명', width: 150, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspectionDetails', headerName: '검사내용', width: 200, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'productionValue', headerName: '생산', width: 100, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      renderCell: (params) => (
        <Chip 
          label={params.value ? params.value.toLocaleString() : '0'}
          color="primary"
          size="small" 
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      )
    }
  ];

  render() {
    const { filters, filterExpanded, inspectionData, loading, error, options } = this.state;

    /* 프리셋 표시용 계산값 */
    const now = today0();
    const thisYear  = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const thisWeek  = { start: startOfWeek(now), end: endOfWeek(now) };

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
            <FilterIcon /> 검사 데이터 그리드 
          </Typography>
          <Typography variant="body1" color="text.secondary">
            검사 현황을 상세하게 조회하고 관리할 수 있습니다.
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
              <IconButton onClick={this.toggleFilterExpansion} sx={{ color: 'white' }}>
                {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
            sx={{ backgroundColor: '#ff8f00', color: 'white', borderRadius: 1, mb: 2 }}
          />
          
          {/* === 1행: 고정 5칸(공장/공정/설비/품번/품명) === */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))',
              gap: 2,
              mb: 1
            }}
          >
            {/* 공장 */}
            <Autocomplete
              size="small"
              options={options.plants}
              value={filters.plant || null}
              onChange={(_, v) => this.handleFilterChange('plant', v || '')}
              renderInput={(params) => <TextField {...params} label="공장" />}
              clearOnEscape
            />
            {/* 공정 */}
            <Autocomplete
              size="small"
              options={options.processes}
              value={filters.process || null}
              onChange={(_, v) => this.handleFilterChange('process', v || '')}
              renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
              clearOnEscape
            />
            {/* 설비 */}
            <Autocomplete
              size="small"
              options={options.equipments}
              value={filters.equipment || null}
              onChange={(_, v) => this.handleFilterChange('equipment', v || '')}
              renderInput={(params) => <TextField {...params} label="라인(설비)" />}
              clearOnEscape
            />
            {/* 품번 */}
            <Autocomplete
              size="small"
              options={options.itemNumbers}
              value={filters.itemNumber || null}
              onChange={(_, v) => this.handleFilterChange('itemNumber', v || '')}
              renderInput={(params) => <TextField {...params} label="품번" />}
              clearOnEscape
            />
            {/* 품명: 자리만 확보(전송/조건 미적용) */}
            <TextField
              fullWidth
              label="품명(자리만 확보)"
              value={filters.itemName}
              onChange={(e) => this.handleFilterChange('itemName', e.target.value)}
              size="small"
              variant="outlined"
              placeholder="(준비 중)"
            />
          </Box>

          {/* === 기간 프리셋 + 일반 필터 === */}
          <Box sx={{
            display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center',
            background: '#f9fbff', border: '1px solid #e3e7ee', borderRadius: 2, p: 1.5, mb: 2
          }}>
            {/* 날짜 직접 입력 */}
            <TextField size="small" label="시작일" type="date" value={filters.start_work_date}
              onChange={(e)=>this.handleFilterChange('start_work_date', e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ width: 190 }} />
            <TextField size="small" label="종료일" type="date" value={filters.end_work_date}
              onChange={(e)=>this.handleFilterChange('end_work_date', e.target.value)}
              InputLabelProps={{ shrink: true }} sx={{ width: 190 }} />

            {/* 우측 프리셋 컨트롤 */}
            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {/* 연간 */}
              <Button size="small" variant="outlined"
                onClick={(e)=>this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
                endIcon={<ExpandMoreIcon/>}
                sx={{ textTransform:'none', fontWeight:700 }}>
                연간
              </Button>
              <Menu
                open={!!this.state.yearAnchorPos}
                onClose={()=>this.setState({ yearAnchorPos: null })}
                anchorReference="anchorPosition"
                anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
              >
                <MenuItem dense onClick={()=>this.selectYear(thisYear)}>올해</MenuItem>
                {[0,1,2,3,4].map(i=>{
                  const y = thisYear - i;
                  return <MenuItem key={y} dense onClick={()=>this.selectYear(y)}>{y}년</MenuItem>;
                })}
              </Menu>

              {/* 월간 */}
              <Button size="small" variant="outlined"
                onClick={(e)=>this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
                endIcon={<ExpandMoreIcon/>}
                sx={{ textTransform:'none', fontWeight:700 }}>
                월간
              </Button>
              <Menu
                open={!!this.state.monthAnchorPos}
                onClose={()=>this.setState({ monthAnchorPos: null })}
                anchorReference="anchorPosition"
                anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
              >
                <MenuItem dense onClick={()=>{
                  this.setState({ selectedYear: thisYear }, ()=>this.selectMonth(thisMonth));
                }}>이번달</MenuItem>
                {Array.from({length:12},(_,i)=>i+1).map(m=>(
                  <MenuItem key={m} dense onClick={()=>this.selectMonth(m)}>
                    {this.state.selectedYear}년 {m}월
                  </MenuItem>
                ))}
              </Menu>

              {/* 주간 */}
              <Button size="small" variant="outlined"
                onClick={(e)=>this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
                endIcon={<ExpandMoreIcon/>}
                sx={{ textTransform:'none', fontWeight:700 }}>
                주간
              </Button>
              <Menu
                open={!!this.state.weekAnchorPos}
                onClose={()=>this.setState({ weekAnchorPos: null })}
                anchorReference="anchorPosition"
                anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
              >
                <MenuItem dense onClick={()=>this.selectWeek(thisWeek)}>
                  이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
                </MenuItem>
                {getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth).map((w,i)=>(
                  <MenuItem key={i} dense onClick={()=>this.selectWeek(w)}>
                    {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label}
                    &nbsp;({iso(w.start)}~{iso(w.end)})
                  </MenuItem>
                ))}
              </Menu>

              {/* 오늘 */}
              <Button size="small" variant="outlined" onClick={this.applyToday}
                sx={{ textTransform:'none', fontWeight:700 }}>
                오늘
              </Button>

              {/* 직접입력 팝오버 */}
              <Button size="small" variant="outlined"
                onClick={(e)=>this.setState({ customAnchorPos: getAnchorPos(e.currentTarget) })}
                endIcon={<ExpandMoreIcon/>}
                sx={{ textTransform:'none', fontWeight:700 }}>
                직접입력
              </Button>
              <Popover
                open={!!this.state.customAnchorPos}
                onClose={()=>this.setState({ customAnchorPos: null })}
                anchorReference="anchorPosition"
                anchorPosition={this.state.customAnchorPos || { top: 0, left: 0 }}
                PaperProps={{ sx:{ p:1.5, borderRadius:2 } }}
              >
                <Box sx={{ display:'grid', gap:1, minWidth: 260 }}>
                  <TextField size="small" label="시작일" type="date"
                    value={filters.start_work_date}
                    onChange={(e)=>this.handleFilterChange('start_work_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField size="small" label="종료일" type="date"
                    value={filters.end_work_date}
                    onChange={(e)=>this.handleFilterChange('end_work_date', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Box>
              </Popover>
            </Box>
          </Box>

          {/* 기본 나머지 필터 */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="사업장" value={filters.businessPlace} onChange={(e) => this.handleFilterChange('businessPlace', e.target.value)} size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="검사구분" value={filters.inspectionType} onChange={(e) => this.handleFilterChange('inspectionType', e.target.value)} size="small" variant="outlined" />
            </Grid>
          </Grid>

          {/* 확장 필터 */}
          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="주야구분" value={filters.shiftType} onChange={(e) => this.handleFilterChange('shiftType', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="작업순번" type="number" value={filters.workSequence ?? ''} onChange={(e) => this.handleFilterChange('workSequence', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="작업구분" value={filters.workType} onChange={(e) => this.handleFilterChange('workType', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="검사순번" type="number" value={filters.inspectionSequence ?? ''} onChange={(e) => this.handleFilterChange('inspectionSequence', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="검사항목명" value={filters.inspectionItemName} onChange={(e) => this.handleFilterChange('inspectionItemName', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="검사내용" value={filters.inspectionDetails} onChange={(e) => this.handleFilterChange('inspectionDetails', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="생산" type="number" value={filters.productionValue ?? ''} onChange={(e) => this.handleFilterChange('productionValue', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
              </Grid>
            </Grid>
          </Collapse>

          {/* 버튼 (수동 검색은 로컬 필터 재적용용으로 유지) */}
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
                sx={{ 
                  backgroundColor: '#ff8f00',
                  '&:hover': { backgroundColor: '#f57c00' }
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
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
              </Box>
            )}

            {error && (
              <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="contained" onClick={this.fetchAllDataOnce}
                  sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}>
                  다시 시도
                </Button>
              </Box>
            )}

            {!loading && !error && (
              <DataGrid
                rows={inspectionData}
                columns={this.columns}
                pagination
                paginationMode="client"
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                disableRowSelectionOnClick
                density="compact"
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
                sx={{
                  '& .super-app-theme--header': { backgroundColor: '#ff8f00', color: 'white', fontWeight: 'bold' },
                  '& .MuiDataGrid-cell': { borderBottom: '1px solid #e0e0e0' },
                  '& .MuiDataGrid-root': { border: 'none' },
                  '& .MuiDataGrid-virtualScroller': { backgroundColor: '#fafafa' },
                  '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e0e0e0' }
                }}
              />
            )}
          </Box>
        </Paper>
      </Box>
    );
  }
}

export default InspectionGrid;
