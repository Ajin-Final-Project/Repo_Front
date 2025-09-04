// // src/pages/inspection/InspectionSystemData.js
// import config from '../../config';

// import React, { Component } from 'react';

// import {
//   Box,
//   Paper,
//   TextField,
//   Button,
//   Typography,
//   Grid,
//   Chip,
//   CardHeader,
//   IconButton,
//   Divider,
//   Collapse,
//   CircularProgress,
//   Alert,
//   Menu,
//   MenuItem,
//   Popover,
//   InputAdornment,
// } from '@mui/material';
// import { Autocomplete } from '@mui/material';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import {
//   Search as SearchIcon,
//   Clear as ClearIcon,
//   FilterList as FilterIcon,
//   ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon,
//   KeyboardArrowDown as KeyboardArrowDownIcon,
// } from '@mui/icons-material';

// import ItemCodeModal from '../common/ItemCodeModal';
// import s from './InspectionSystemData.module.scss';

// /* ====== 기간 프리셋 유틸 ====== */
// const iso = (d) => d.toLocaleDateString('sv-SE');
// const today0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
// const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// const getAnchorPos = (el) => {
//   if (!el) return null;
//   const r = el.getBoundingClientRect();
//   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// };
// const startOfWeek = (d) => {
//   const day = d.getDay();
//   const diff = (day === 0 ? -6 : 1) - day;
//   const s = new Date(d);
//   s.setDate(d.getDate() + diff);
//   return new Date(s.getFullYear(), s.getMonth(), s.getDate());
// };
// const endOfWeek = (d) => { const s = startOfWeek(d); return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6); };
// /* ================================= */

// const parseDate = (v) => (v ? new Date(v) : null);

// class InspectionGrid extends Component {
//   constructor(props) {
//     super(props);

//     const today = new Date().toLocaleDateString('sv-SE');
//     const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');

//     this.state = {
//       filters: {
//         plant: '',
//         process: '',
//         equipment: '',
//         itemNumber: '',
//         itemName: '',
//         businessPlace: '',
//         inspectionType: '',
//         start_work_date: jan1,
//         end_work_date: today,
//         shiftType: '',
//         workSequence: null,
//         workType: '',
//         inspectionSequence: null,
//         inspectionItemName: '',
//         inspectionDetails: '',
//         productionValue: null,
//       },

//       options: { plants: [], processes: [], equipments: [] },

//       selectedYear: new Date().getFullYear(),
//       selectedMonth: new Date().getMonth() + 1,
//       yearAnchorPos: null,
//       monthAnchorPos: null,
//       weekAnchorPos: null,
//       customAnchorPos: null,

//       itemCodeModalOpen: false,
//       filterExpanded: false,

//       originalData: [],
//       inspectionData: [],
//       loading: false,
//       error: null
//     };
//   }

//   componentDidMount() {
//     this.fetchAllDataOnce();
//   }

//   fetchAllDataOnce = async () => {
//     this.setState({ loading: true, error: null });
//     try {
//       const API_BASE = (config.baseURLApi || '').replace(/\/$/, '');
//       const url = `${API_BASE}/smartFactory/inspection_grid/list`;

//       const res = await fetch(url, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({})
//       });
//       if (!res.ok) {
//         const t = await res.text();
//         throw new Error(`HTTP error! status: ${res.status}, message: ${t}`);
//       }
//       const json = await res.json();
//       const all = this.formatApiData(json.data);

//       this.setState(
//         { originalData: all, loading: false, error: null },
//         () => { this.recomputeOptions(); this.applyFilters(); }
//       );
//     } catch (e) {
//       console.error('초기 데이터 로드 오류:', e);
//       this.setState({ loading: false, error: `데이터 로드 오류: ${e.message || e}` });
//     }
//   };

//   formatApiData = (apiData) => {
//     if (Array.isArray(apiData)) {
//       return apiData.map((item, index) => ({
//         id: item.id || index + 1,
//         businessPlace: item.businessPlace || '',
//         plant: item.plant || '',
//         process: item.process || '',
//         equipment: item.equipment || '',
//         inspectionType: item.inspectionType || '',
//         itemNumber: item.itemNumber || item.자재번호 || '',
//         reportDate: item.reportDate ? new Date(item.reportDate) : (item.근무일자 ? new Date(item.근무일자) : null),
//         shiftType: item.shiftType || '',
//         workSequence: item.workSequence ?? null,
//         workType: item.workType || '',
//         inspectionSequence: item.inspectionSequence ?? null,
//         inspectionItemName: item.inspectionItemName || '',
//         inspectionDetails: item.inspectionDetails || '',
//         productionValue: item.productionValue ?? null,
//         itemName: item.itemName || item.자재명 || '',
//       }));
//     }
//     return [];
//   };

//   applyFilters = () => {
//     const { originalData, filters } = this.state;

//     const sDate = parseDate(filters.start_work_date);
//     const eDate = parseDate(filters.end_work_date);
//     const str = (v) => String(v ?? '').trim();
//     const numEq = (a, b) => (b === null || b === '' ? true : Number(a) === Number(b));

//     const pass = (row) => {
//       if (filters.plant && row.plant !== filters.plant) return false;
//       if (filters.process && row.process !== filters.process) return false;
//       if (filters.equipment && row.equipment !== filters.equipment) return false;
//       if (filters.itemNumber && row.itemNumber !== filters.itemNumber) return false;

//       if (filters.businessPlace && row.businessPlace !== filters.businessPlace) return false;
//       if (filters.inspectionType && row.inspectionType !== filters.inspectionType) return false;
//       if (filters.shiftType && row.shiftType !== filters.shiftType) return false;
//       if (filters.workType && row.workType !== filters.workType) return false;

//       if (!numEq(row.workSequence, filters.workSequence)) return false;
//       if (!numEq(row.inspectionSequence, filters.inspectionSequence)) return false;
//       if (!numEq(row.productionValue, filters.productionValue)) return false;

//       if (str(filters.inspectionItemName)) {
//         if (!str(row.inspectionItemName).includes(str(filters.inspectionItemName))) return false;
//       }
//       if (str(filters.inspectionDetails)) {
//         if (!str(row.inspectionDetails).includes(str(filters.inspectionDetails))) return false;
//       }

//       if (sDate && row.reportDate && row.reportDate < sDate) return false;
//       if (eDate && row.reportDate && row.reportDate > eDate) return false;

//       return true;
//     };

//     this.setState({ inspectionData: originalData.filter(pass) });
//   };

//   recomputeOptions = () => {
//     const { originalData, filters } = this.state;
//     const uniq = (arr) => Array.from(new Set(arr.filter((v) => v !== null && v !== undefined && String(v).trim() !== '')));
//     const plants = uniq(originalData.map((r) => r.plant)).sort();
//     const scopeForProcess = filters.plant ? originalData.filter((r) => r.plant === filters.plant) : originalData;
//     const processes = uniq(scopeForProcess.map((r) => r.process)).sort();
//     const scopeForEquip = scopeForProcess.filter((r) => (filters.process ? r.process === filters.process : true));
//     const equipments = uniq(scopeForEquip.map((r) => r.equipment)).sort();
//     this.setState({ options: { plants, processes, equipments } });
//   };

//   handleFilterChange = (field, value) => {
//     this.setState(
//       (prev) => ({
//         filters: {
//           ...prev.filters,
//           [field]: (field.includes('Sequence') || field === 'productionValue') && value === '' ? null : value,
//         },
//       }),
//       () => {
//         if (['plant', 'process', 'equipment'].includes(field)) {
//           this.setState(
//             (prev) => {
//               const next = { ...prev.filters };
//               if (field === 'plant') {
//                 next.process = ''; next.equipment = ''; next.itemNumber = ''; next.itemName = '';
//               } else if (field === 'process') {
//                 next.equipment = ''; next.itemNumber = ''; next.itemName = '';
//               } else if (field === 'equipment') {
//                 next.itemNumber = ''; next.itemName = '';
//               }
//               return { filters: next };
//             },
//             () => { this.recomputeOptions(); this.applyFilters(); }
//           );
//         } else {
//           this.applyFilters();
//         }
//       }
//     );
//   };

//   handleSearch = () => this.applyFilters();
//   toggleFilterExpansion = () => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }));
//   clearFilters = () => {
//     const today = new Date().toLocaleDateString('sv-SE');
//     const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');
//     this.setState({
//       filters: {
//         plant: '',
//         process: '',
//         equipment: '',
//         itemNumber: '',
//         itemName: '',
//         businessPlace: '',
//         inspectionType: '',
//         start_work_date: jan1,
//         end_work_date: today,
//         shiftType: '',
//         workSequence: null,
//         workType: '',
//         inspectionSequence: null,
//         inspectionItemName: '',
//         inspectionDetails: '',
//         productionValue: null,
//       },
//     }, () => { this.recomputeOptions(); this.applyFilters(); });
//   };

//   /* ===== 기간 프리셋 동작 ===== */
//   setDateRange = (start, end) => {
//     const start_work_date = iso(start);
//     const end_work_date = iso(end);
//     this.setState((prev) => ({ filters: { ...prev.filters, start_work_date, end_work_date } }), this.applyFilters);
//   };
//   applyToday = () => { const t = today0(); this.setDateRange(t, t); };
//   selectYear = (y) => { const s = new Date(y, 0, 1); const e = new Date(y, 11, 31); this.setState({ selectedYear: y, yearAnchorPos: null }); this.setDateRange(s, e); };
//   selectMonth = (m) => { const y = this.state.selectedYear; const s = new Date(y, m - 1, 1); const e = lastOfMonth(s); this.setState({ monthAnchorPos: null, selectedMonth: m }); this.setDateRange(s, e); };
//   selectWeek = (w) => { this.setState({ weekAnchorPos: null }); this.setDateRange(w.start, w.end); };
//   /* ======================== */

//   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
//   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
//   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
//     this.setState(
//       (prev) => ({
//         filters: { ...prev.filters, itemNumber: 품목번호 || '', itemName: 품목명 || '' },
//         itemCodeModalOpen: false,
//       }),
//       this.applyFilters
//     );
//   };

//   columns = [
//     { field: 'id', headerName: 'ID', width: 80, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'businessPlace', headerName: '사업장', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'plant', headerName: '공장', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'process', headerName: '공정', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'equipment', headerName: '설비', width: 150, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'inspectionType', headerName: '검사구분', width: 100, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'itemNumber', headerName: '품번', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'reportDate', headerName: '보고일', width: 120, type: 'date', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell', valueGetter: (p)=> (p.value instanceof Date && !isNaN(p.value) ? p.value : null) },
//     { field: 'shiftType', headerName: '주야구분', width: 100, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'workSequence', headerName: '작업순번', width: 100, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'workType', headerName: '작업구분', width: 100, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'inspectionSequence', headerName: '검사순번', width: 120, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'inspectionItemName', headerName: '검사항목명', width: 150, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'inspectionDetails', headerName: '검사내용', width: 200, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
//     { field: 'productionValue', headerName: '생산', width: 100, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
//       renderCell: (p)=>(<Chip label={p.value ? p.value.toLocaleString() : '0'} color="primary" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />) },
//   ];

//   render() {
//     const { filters, filterExpanded, inspectionData, loading, error, options } = this.state;

//     const now = today0();
//     const thisYear  = now.getFullYear();
//     const thisMonth = now.getMonth() + 1;
//     const thisWeek  = { start: startOfWeek(now), end: endOfWeek(now) };

//     return (
//       <Box className={s.root} sx={{ height:'100vh', p:3, display:'flex', flexDirection:'column', backgroundColor:'#f5f5f5' }}>
//         {/* 헤더 */}
//         <Box sx={{ mb: 3 }}>
//           <Typography variant="h4" gutterBottom sx={{ color:'#ffb300', fontWeight:'bold', display:'flex', alignItems:'center', gap:1 }}>
//             <FilterIcon /> 검사 데이터 그리드
//           </Typography>
//           <Typography variant="body1" color="text.secondary">검사 현황을 상세하게 조회하고 관리할 수 있습니다.</Typography>
//         </Box>

//         {/* 검색 필터 */}
//         <Paper elevation={3} sx={{ p:3, mb:3, borderRadius:2 }}>
//           <CardHeader
//             title={
//               <Typography variant="h6" sx={{ display:'flex', alignItems:'center', gap:1, color:'white' }}>
//                 <SearchIcon /> 검색 조건
//               </Typography>
//             }
//             action={
//               <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
//                 {/* 프리셋 버튼들: 생산관리와 동일한 위치/모양 */}
//                 <Button
//                   size="small"
//                   variant="outlined"
//                   color="success"
//                   endIcon={<ExpandMoreIcon />}
//                   onClick={(e)=>this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
//                   sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
//                 >
//                   연간
//                 </Button>
//                 <Menu
//                   open={!!this.state.yearAnchorPos}
//                   onClose={()=>this.setState({ yearAnchorPos: null })}
//                   anchorReference="anchorPosition"
//                   anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
//                 >
//                   <MenuItem dense onClick={()=>this.selectYear(thisYear)}>올해</MenuItem>
//                   {[0,1,2,3,4].map(i=>{
//                     const y = thisYear - i;
//                     return <MenuItem key={y} dense onClick={()=>this.selectYear(y)}>{y}년</MenuItem>;
//                   })}
//                 </Menu>

//                 <Button
//                   size="small"
//                   variant="outlined"
//                   color="success"
//                   endIcon={<ExpandMoreIcon />}
//                   onClick={(e)=>this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
//                   sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
//                 >
//                   월간
//                 </Button>
//                 <Menu
//                   open={!!this.state.monthAnchorPos}
//                   onClose={()=>this.setState({ monthAnchorPos: null })}
//                   anchorReference="anchorPosition"
//                   anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
//                 >
//                   <MenuItem dense onClick={()=>{ this.setState({ selectedYear: thisYear }, ()=>this.selectMonth(thisMonth)); }}>
//                     이번달
//                   </MenuItem>
//                   {Array.from({length:12},(_,i)=>i+1).map(m=>(
//                     <MenuItem key={m} dense onClick={()=>this.selectMonth(m)}>{this.state.selectedYear}년 {m}월</MenuItem>
//                   ))}
//                 </Menu>

//                 <Button
//                   size="small"
//                   variant="outlined"
//                   color="success"
//                   endIcon={<ExpandMoreIcon />}
//                   onClick={(e)=>this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
//                   sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
//                 >
//                   주간
//                 </Button>
//                 <Menu
//                   open={!!this.state.weekAnchorPos}
//                   onClose={()=>this.setState({ weekAnchorPos: null })}
//                   anchorReference="anchorPosition"
//                   anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
//                 >
//                   <MenuItem dense onClick={()=>this.selectWeek(thisWeek)}>
//                     이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
//                   </MenuItem>
//                   {/* 선택된 연/월 기준 주차 목록 */}
//                   {(() => {
//                     const first = new Date(this.state.selectedYear, this.state.selectedMonth - 1, 1);
//                     const last  = lastOfMonth(first);
//                     let cur = startOfWeek(first);
//                     let idx = 1;
//                     const items = [];
//                     while (cur <= last) {
//                       const s = new Date(cur), e = endOfWeek(cur);
//                       const clipS = new Date(Math.max(s, first));
//                       const clipE = new Date(Math.min(e, last));
//                       items.push(
//                         <MenuItem key={idx} dense onClick={()=>this.selectWeek({ start: clipS, end: clipE })}>
//                           {this.state.selectedYear}년 {this.state.selectedMonth}월 {idx}주차 ({iso(clipS)}~{iso(clipE)})
//                         </MenuItem>
//                       );
//                       idx += 1;
//                       cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
//                     }
//                     return items;
//                   })()}
//                 </Menu>

//                 <Button
//                   size="small"
//                   variant="outlined"
//                   color="success"
//                   onClick={this.applyToday}
//                   sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
//                 >
//                   오늘
//                 </Button>

//                 <Button
//                   size="small"
//                   variant="outlined"
//                   color="success"
//                   endIcon={<ExpandMoreIcon />}
//                   onClick={(e)=>this.setState({ customAnchorPos: getAnchorPos(e.currentTarget) })}
//                   sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
//                 >
//                   직접입력
//                 </Button>
//                 <Popover
//                   open={!!this.state.customAnchorPos}
//                   onClose={()=>this.setState({ customAnchorPos: null })}
//                   anchorReference="anchorPosition"
//                   anchorPosition={this.state.customAnchorPos || { top: 0, left: 0 }}
//                   PaperProps={{ sx:{ p:1.5, borderRadius:2 } }}
//                 >
//                   <Box sx={{ display:'grid', gap:1, minWidth: 260 }}>
//                     <TextField size="small" label="시작일" type="date"
//                       value={filters.start_work_date}
//                       onChange={(e)=>this.handleFilterChange('start_work_date', e.target.value)}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                     <TextField size="small" label="종료일" type="date"
//                       value={filters.end_work_date}
//                       onChange={(e)=>this.handleFilterChange('end_work_date', e.target.value)}
//                       InputLabelProps={{ shrink: true }}
//                     />
//                   </Box>
//                 </Popover>

//                 {/* 구분자 */}
//                 <Typography sx={{ color:'white', opacity:0.8, mx:0.5 }}>|</Typography>

//                 {/* 기간선택 입력 */}
//                 <Typography sx={{ color:'white' }}>기간선택</Typography>
//                 <TextField
//                   type="date"
//                   value={filters.start_work_date}
//                   onChange={(e)=>this.handleFilterChange('start_work_date', e.target.value)}
//                   size="small"
//                   variant="outlined"
//                   sx={{ backgroundColor:'white', borderRadius:1, minWidth:150 }}
//                   InputLabelProps={{ shrink: true }}
//                 />
//                 <Typography sx={{ color:'white' }}>~</Typography>
//                 <TextField
//                   type="date"
//                   value={filters.end_work_date}
//                   onChange={(e)=>this.handleFilterChange('end_work_date', e.target.value)}
//                   size="small"
//                   variant="outlined"
//                   sx={{ backgroundColor:'white', borderRadius:1, minWidth:150 }}
//                   InputLabelProps={{ shrink: true }}
//                 />

//                 {/* 확장/축소 */}
//                 <IconButton onClick={this.toggleFilterExpansion} sx={{ color:'white' }}>
//                   {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//                 </IconButton>
//               </Box>
//             }
//             sx={{ backgroundColor:'#ff8f00', color:'white', borderRadius:1, mb:2 }}
//           />

//           {/* === 1행: 공장/공정/설비/품번/품명 === */}
//           <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(160px, 1fr))', gap:2, mb:1 }}>
//             <Autocomplete size="small" options={options.plants} value={filters.plant || null}
//               onChange={(_, v)=>this.handleFilterChange('plant', v || '')}
//               renderInput={(params)=><TextField {...params} label="공장" />} clearOnEscape />
//             <Autocomplete size="small" options={options.processes} value={filters.process || null}
//               onChange={(_, v)=>this.handleFilterChange('process', v || '')}
//               renderInput={(params)=><TextField {...params} label="작업장(공정)" />} clearOnEscape />
//             <Autocomplete size="small" options={options.equipments} value={filters.equipment || null}
//               onChange={(_, v)=>this.handleFilterChange('equipment', v || '')}
//               renderInput={(params)=><TextField {...params} label="라인(설비)" />} clearOnEscape />

//             <TextField fullWidth label="품번" value={filters.itemNumber} onClick={this.openItemCodeModal}
//               size="small" variant="outlined"
//               InputProps={{ readOnly:true, style:{cursor:'pointer'},
//                 endAdornment:(<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color:'text.secondary' }}/></InputAdornment>) }}
//               sx={{ '& .MuiInputBase-root':{ cursor:'pointer', '&:hover':{ backgroundColor:'#f5f5f5' } }}} />

//             <TextField fullWidth label="품명" value={filters.itemName} onClick={this.openItemCodeModal}
//               size="small" variant="outlined"
//               InputProps={{ readOnly:true, style:{cursor:'pointer'},
//                 endAdornment:(<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color:'text.secondary' }}/></InputAdornment>) }}
//               sx={{ '& .MuiInputBase-root':{ cursor:'pointer', '&:hover':{ backgroundColor:'#f5f5f5' } }}} />
//           </Box>

//           {/* 기본 나머지 필터 */}
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6} md={3}>
//               <TextField fullWidth label="사업장" value={filters.businessPlace} onChange={(e)=>this.handleFilterChange('businessPlace', e.target.value)} size="small" variant="outlined" />
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <TextField fullWidth label="검사구분" value={filters.inspectionType} onChange={(e)=>this.handleFilterChange('inspectionType', e.target.value)} size="small" variant="outlined" />
//             </Grid>
//           </Grid>

//           {/* 확장 필터 */}
//           <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
//             <Divider sx={{ my: 2 }} />
//             <Grid container spacing={2}>
//               <Grid item xs={12} sm={6} md={3}>
//                 <TextField fullWidth label="주야구분" value={filters.shiftType} onChange={(e)=>this.handleFilterChange('shiftType', e.target.value)} size="small" variant="outlined" />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <TextField fullWidth label="작업순번" type="number" value={filters.workSequence ?? ''} onChange={(e)=>this.handleFilterChange('workSequence', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <TextField fullWidth label="작업구분" value={filters.workType} onChange={(e)=>this.handleFilterChange('workType', e.target.value)} size="small" variant="outlined" />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <TextField fullWidth label="검사순번" type="number" value={filters.inspectionSequence ?? ''} onChange={(e)=>this.handleFilterChange('inspectionSequence', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <TextField fullWidth label="검사항목명" value={filters.inspectionItemName} onChange={(e)=>this.handleFilterChange('inspectionItemName', e.target.value)} size="small" variant="outlined" />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <TextField fullWidth label="검사내용" value={filters.inspectionDetails} onChange={(e)=>this.handleFilterChange('inspectionDetails', e.target.value)} size="small" variant="outlined" />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <TextField fullWidth label="생산" type="number" value={filters.productionValue ?? ''} onChange={(e)=>this.handleFilterChange('productionValue', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
//               </Grid>
//             </Grid>
//           </Collapse>

//           {/* 버튼 */}
//           <Grid item xs={12} sx={{ mt: 2 }}>
//             <Box sx={{ display:'flex', gap:2, justifyContent:'flex-end' }}>
//               <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.clearFilters} size="large" color="secondary">
//                 필터 초기화
//               </Button>
//               <Button variant="contained" startIcon={<SearchIcon />} size="large"
//                 sx={{ backgroundColor:'#ff8f00', '&:hover':{ backgroundColor:'#f57c00' } }}
//                 onClick={this.handleSearch}>
//                 검색
//               </Button>
//             </Box>
//           </Grid>
//         </Paper>

//         {/* 데이터 그리드 */}
//         <Paper elevation={3} sx={{ flex:1, display:'flex', flexDirection:'column', borderRadius:2 }}>
//           <Box sx={{ height:'100%', width:'100%' }}>
//             {loading && (
//               <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'200px' }}>
//                 <CircularProgress size={60} sx={{ color:'#ff8f00' }} />
//               </Box>
//             )}
//             {error && (
//               <Box sx={{ p:3 }}>
//                 <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>
//                 <Button variant="contained" onClick={this.fetchAllDataOnce}
//                   sx={{ backgroundColor:'#ff8f00', '&:hover':{ backgroundColor:'#f57c00' } }}>
//                   다시 시도
//                 </Button>
//               </Box>
//             )}
//             {!loading && !error && (
//               <DataGrid
//                 rows={inspectionData}
//                 columns={this.columns}
//                 pagination
//                 paginationMode="client"
//                 pageSizeOptions={[10, 25, 50, 100]}
//                 initialState={{ pagination:{ paginationModel:{ page:0, pageSize:10 } } }}
//                 disableRowSelectionOnClick
//                 density="compact"
//                 slots={{ toolbar: GridToolbar }}
//                 slotProps={{ toolbar: { showQuickFilter:true, quickFilterProps:{ debounceMs:500 } } }}
//                 sx={{
//                   '& .super-app-theme--header': { backgroundColor:'#ff8f00', color:'white', fontWeight:'bold' },
//                   '& .MuiDataGrid-cell': { borderBottom:'1px solid #e0e0e0' },
//                   '& .MuiDataGrid-root': { border:'none' },
//                   '& .MuiDataGrid-virtualScroller': { backgroundColor:'#fafafa' },
//                   '& .MuiDataGrid-footerContainer': { borderTop:'1px solid #e0e0e0' }
//                 }}
//               />
//             )}
//           </Box>
//         </Paper>

//         {/* 품목 코드/명 선택 모달 */}
//         <ItemCodeModal
//           open={this.state.itemCodeModalOpen}
//           onClose={this.closeItemCodeModal}
//           onSelect={this.handleItemCodeSelect}
//           selectedItemCode={this.state.filters.itemNumber}
//           plant={this.state.filters.plant}
//           worker={this.state.filters.process}
//           line={this.state.filters.equipment}
//         />
//       </Box>
//     );
//   }
// }

// export default InspectionGrid;


// src/pages/inspection/InspectionSystemData.js
import config from '../../config';

import React, { Component } from 'react';

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
  InputAdornment,
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  FactCheck as FactCheckIcon,
} from '@mui/icons-material';

// import ItemCodeModal from '../common/ItemCodeModal'; // 생산기준 품목 모달(필요 시 사용)
import InspectionSelectModal from '../common/InspectionSelectModal';
import s from './InspectionSystemData.module.scss';

/* ====== 기간 프리셋 유틸 ====== */
const iso = (d) => d.toLocaleDateString('sv-SE');
const today0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const getAnchorPos = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
};
const startOfWeek = (d) => {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const s = new Date(d);
  s.setDate(d.getDate() + diff);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate());
};
const endOfWeek = (d) => { const s = startOfWeek(d); return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6); };
/* ================================= */

const parseDate = (v) => (v ? new Date(v) : null);

class InspectionGrid extends Component {
  constructor(props) {
    super(props);

    const today = new Date().toLocaleDateString('sv-SE');
    const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');

    this.state = {
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

      options: { plants: [], processes: [], equipments: [] },

      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      yearAnchorPos: null,
      monthAnchorPos: null,
      weekAnchorPos: null,
      customAnchorPos: null,

      itemCodeModalOpen: false,
      inspectionModalOpen: false,
      filterExpanded: false,

      originalData: [],
      inspectionData: [],
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    this.fetchAllDataOnce();
    // 옵션은 항상 서버에서 조회 (목록이 비어도 드롭다운을 채우기 위해)
    this.fetchPlantOptions();
    // process/equipment는 선택에 따라 불러온다.
  }

  /* ================= 서버호출: 리스트 ================= */
  fetchAllDataOnce = async () => {
    this.setState({ loading: true, error: null });
    try {
      const API_BASE = (config.baseURLApi || '').replace(/\/$/, '');
      const url = `${API_BASE}/smartFactory/inspection_grid/list`;

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

      this.setState(
        { originalData: all, loading: false, error: null },
        () => { this.recomputeOptionsFromLocal(); this.applyFilters(); }
      );
    } catch (e) {
      console.error('초기 데이터 로드 오류:', e);
      this.setState({ loading: false, error: `데이터 로드 오류: ${e.message || e}` });
    }
  };

  /* ================= 서버호출: 옵션 ================= */
  fetchPlantOptions = async () => {
    try {
      const API_BASE = (config.baseURLApi || '').replace(/\/$/, '');
      const url = `${API_BASE}/smartFactory/inspection_grid/options/plants`;
      const body = {
        start_work_date: this.state.filters.start_work_date,
        end_work_date: this.state.filters.end_work_date,
        businessPlace: this.state.filters.businessPlace || undefined,
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      this.setState(prev => ({ options: { ...prev.options, plants: json.data || [] }}));
    } catch (e) {
      console.warn('공장 옵션 로드 실패:', e);
      this.setState(prev => ({ options: { ...prev.options, plants: [] }}));
    }
  };

  fetchProcessOptions = async () => {
    try {
      const API_BASE = (config.baseURLApi || '').replace(/\/$/, '');
      const url = `${API_BASE}/smartFactory/inspection_grid/options/processes`;
      const body = {
        start_work_date: this.state.filters.start_work_date,
        end_work_date: this.state.filters.end_work_date,
        plant: this.state.filters.plant || undefined,
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      this.setState(prev => ({ options: { ...prev.options, processes: json.data || [] }}));
    } catch (e) {
      console.warn('공정 옵션 로드 실패:', e);
      this.setState(prev => ({ options: { ...prev.options, processes: [] }}));
    }
  };

  fetchEquipmentOptions = async () => {
    try {
      const API_BASE = (config.baseURLApi || '').replace(/\/$/, '');
      const url = `${API_BASE}/smartFactory/inspection_grid/options/equipments`;
      const body = {
        start_work_date: this.state.filters.start_work_date,
        end_work_date: this.state.filters.end_work_date,
        plant: this.state.filters.plant || undefined,
        process: this.state.filters.process || undefined,
      };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const json = await res.json();
      this.setState(prev => ({ options: { ...prev.options, equipments: json.data || [] }}));
    } catch (e) {
      console.warn('설비 옵션 로드 실패:', e);
      this.setState(prev => ({ options: { ...prev.options, equipments: [] }}));
    }
  };

  /* ================= 유틸 ================= */
  formatApiData = (apiData) => {
    if (Array.isArray(apiData)) {
      return apiData.map((item, index) => ({
        id: item.id || index + 1,
        businessPlace: item.businessPlace || '',
        plant: item.plant || '',
        process: item.process || '',
        equipment: item.equipment || '',
        inspectionType: item.inspectionType || '',
        itemNumber: item.itemNumber || item.자재번호 || '',
        reportDate: item.reportDate ? new Date(item.reportDate) : (item.근무일자 ? new Date(item.근무일자) : null),
        shiftType: item.shiftType || '',
        workSequence: item.workSequence ?? null,
        workType: item.workType || '',
        inspectionSequence: item.inspectionSequence ?? null,
        inspectionItemName: item.inspectionItemName || '',
        inspectionDetails: item.inspectionDetails || '',
        productionValue: item.productionValue ?? null,
        itemName: item.itemName || item.자재명 || '',
      }));
    }
    return [];
  };

  applyFilters = () => {
    const { originalData, filters } = this.state;

    const sDate = parseDate(filters.start_work_date);
    const eDate = parseDate(filters.end_work_date);
    const str = (v) => String(v ?? '').trim();
    const numEq = (a, b) => (b === null || b === '' ? true : Number(a) === Number(b));

    const pass = (row) => {
      if (filters.plant && row.plant !== filters.plant) return false;
      if (filters.process && row.process !== filters.process) return false;
      if (filters.equipment && row.equipment !== filters.equipment) return false;
      if (filters.itemNumber && row.itemNumber !== filters.itemNumber) return false;

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

      if (sDate && row.reportDate && row.reportDate < sDate) return false;
      if (eDate && row.reportDate && row.reportDate > eDate) return false;

      return true;
    };

    this.setState({ inspectionData: originalData.filter(pass) });
  };

  // (초기 데이터에서) 옵션을 뽑아 로컬로 채우는 기존 로직 – 서버옵션을 우선하지만 백업용으로 유지
  recomputeOptionsFromLocal = () => {
    const { originalData, filters } = this.state;
    const uniq = (arr) => Array.from(new Set(arr.filter((v) => v !== null && v !== undefined && String(v).trim() !== '')));
    const plants = uniq(originalData.map((r) => r.plant)).sort();
    const scopeForProcess = filters.plant ? originalData.filter((r) => r.plant === filters.plant) : originalData;
    const processes = uniq(scopeForProcess.map((r) => r.process)).sort();
    const scopeForEquip = scopeForProcess.filter((r) => (filters.process ? r.process === filters.process : true));
    const equipments = uniq(scopeForEquip.map((r) => r.equipment)).sort();
    // 서버 옵션이 비어 있을 때만 덮어쓰기
    this.setState(prev => ({
      options: {
        plants: prev.options.plants.length ? prev.options.plants : plants,
        processes: prev.options.processes.length ? prev.options.processes : processes,
        equipments: prev.options.equipments.length ? prev.options.equipments : equipments,
      }
    }));
  };

  handleFilterChange = (field, value) => {
    this.setState(
      (prev) => ({
        filters: {
          ...prev.filters,
          [field]: (field.includes('Sequence') || field === 'productionValue') && value === '' ? null : value,
        },
      }),
      async () => {
        if (field === 'plant') {
          this.setState(prev => ({ filters: { ...prev.filters, process: '', equipment: '', itemNumber: '', itemName: '' }}));
          await this.fetchProcessOptions();
          await this.fetchEquipmentOptions();
        } else if (field === 'process') {
          this.setState(prev => ({ filters: { ...prev.filters, equipment: '', itemNumber: '', itemName: '' }}));
          await this.fetchEquipmentOptions();
        }
        this.applyFilters();
      }
    );
  };

  handleSearch = () => this.applyFilters();
  toggleFilterExpansion = () => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }));
  clearFilters = () => {
    const today = new Date().toLocaleDateString('sv-SE');
    const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');
    this.setState({
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
    }, () => {
      this.applyFilters();
      this.fetchPlantOptions();
      this.setState(prev => ({ options: { ...prev.options, processes: [], equipments: [] }}));
    });
  };

  /* ===== 기간 프리셋 동작 ===== */
  setDateRange = (start, end) => {
    const start_work_date = iso(start);
    const end_work_date = iso(end);
    this.setState(
      (prev) => ({ filters: { ...prev.filters, start_work_date, end_work_date } }),
      () => {
        this.applyFilters();
        // 기간이 바뀌면 옵션도 갱신
        this.fetchPlantOptions();
        this.fetchProcessOptions();
        this.fetchEquipmentOptions();
      }
    );
  };
  applyToday = () => { const t = today0(); this.setDateRange(t, t); };
  selectYear = (y) => { const s = new Date(y, 0, 1); const e = new Date(y, 11, 31); this.setState({ selectedYear: y, yearAnchorPos: null }); this.setDateRange(s, e); };
  selectMonth = (m) => { const y = this.state.selectedYear; const s = new Date(y, m - 1, 1); const e = lastOfMonth(s); this.setState({ monthAnchorPos: null, selectedMonth: m }); this.setDateRange(s, e); };
  selectWeek = (w) => { this.setState({ weekAnchorPos: null }); this.setDateRange(w.start, w.end); };
  /* ======================== */

  // 생산 품목 모달 – 사용 안 하면 주석 유지
  // openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
  // closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
  // handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
  //   this.setState(
  //     (prev) => ({
  //       filters: { ...prev.filters, itemNumber: 품목번호 || '', itemName: 품목명 || '' },
  //       itemCodeModalOpen: false,
  //     }),
  //     this.applyFilters
  //   );
  // };

  /* ===== 검사 데이터 선택 모달 ===== */
  openInspectionModal = () => this.setState({ inspectionModalOpen: true });
  closeInspectionModal = () => this.setState({ inspectionModalOpen: false });
  handleInspectionPick = (row) => {
    // 모달에서 더블클릭/선택한 행을 받아서 필터에 반영
    this.setState(
      (prev) => ({
        filters: {
          ...prev.filters,
          itemNumber: row?.itemNumber || prev.filters.itemNumber,
          itemName: row?.itemName || prev.filters.itemName,
          plant: row?.plant || prev.filters.plant,
          process: row?.process || prev.filters.process,
          equipment: row?.equipment || prev.filters.equipment,
        },
        inspectionModalOpen: false,
      }),
      () => {
        // 상위 필터가 달라졌을 수 있으므로 옵션도 갱신
        this.fetchProcessOptions();
        this.fetchEquipmentOptions();
        this.applyFilters();
      }
    );
  };

  /* ===== 그리드 컬럼 ===== */
  columns = [
    { field: 'id', headerName: 'ID', width: 80, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'businessPlace', headerName: '사업장', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'plant', headerName: '공장', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'process', headerName: '공정', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'equipment', headerName: '설비', width: 150, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspectionType', headerName: '검사구분', width: 100, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'itemNumber', headerName: '품번', width: 120, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'reportDate', headerName: '보고일', width: 120, type: 'date', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      valueGetter: (p)=> (p.value instanceof Date && !isNaN(p.value) ? p.value : null) },
    { field: 'shiftType', headerName: '주야구분', width: 100, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'workSequence', headerName: '작업순번', width: 100, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'workType', headerName: '작업구분', width: 100, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspectionSequence', headerName: '검사순번', width: 120, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspectionItemName', headerName: '검사항목명', width: 150, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'inspectionDetails', headerName: '검사내용', width: 200, headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'productionValue', headerName: '생산', width: 100, type: 'number', headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      renderCell: (p)=>(<Chip label={p.value ? p.value.toLocaleString() : '0'} color="primary" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />) },
  ];

  render() {
    const { filters, filterExpanded, inspectionData, loading, error, options } = this.state;

    const now = today0();
    const thisYear  = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const thisWeek  = { start: startOfWeek(now), end: endOfWeek(now) };

    return (
      <Box className={s.root} sx={{ height:'100vh', p:3, display:'flex', flexDirection:'column', backgroundColor:'#f5f5f5' }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color:'#ffb300', fontWeight:'bold', display:'flex', alignItems:'center', gap:1 }}>
              <FilterIcon /> 검사 데이터 그리드
            </Typography>
            <Typography variant="body1" color="text.secondary">검사 현황을 상세하게 조회하고 관리할 수 있습니다.</Typography>
          </Box>

          {/* 검사 선택 모달 버튼 */}
          <Button
            variant="outlined"
            startIcon={<FactCheckIcon/>}
            onClick={this.openInspectionModal}
            sx={{ borderColor:'#ff8f00', color:'#ff8f00', fontWeight:'bold' }}
          >
            검사 데이터 선택
          </Button>
        </Box>

        {/* 검색 필터 */}
        <Paper elevation={3} sx={{ p:3, mb:3, borderRadius:2 }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ display:'flex', alignItems:'center', gap:1, color:'white' }}>
                <SearchIcon /> 검색 조건
              </Typography>
            }
            action={
              <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                {/* 프리셋 버튼들 */}
                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e)=>this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
                  sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
                >
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

                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e)=>this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
                  sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
                >
                  월간
                </Button>
                <Menu
                  open={!!this.state.monthAnchorPos}
                  onClose={()=>this.setState({ monthAnchorPos: null })}
                  anchorReference="anchorPosition"
                  anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
                >
                  <MenuItem dense onClick={()=>{ this.setState({ selectedYear: thisYear }, ()=>this.selectMonth(thisMonth)); }}>
                    이번달
                  </MenuItem>
                  {Array.from({length:12},(_,i)=>i+1).map(m=>(
                    <MenuItem key={m} dense onClick={()=>this.selectMonth(m)}>{this.state.selectedYear}년 {m}월</MenuItem>
                  ))}
                </Menu>

                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e)=>this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
                  sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
                >
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
                  {/* 선택된 연/월 기준 주차 목록 */}
                  {(() => {
                    const first = new Date(this.state.selectedYear, this.state.selectedMonth - 1, 1);
                    const last  = lastOfMonth(first);
                    let cur = startOfWeek(first);
                    let idx = 1;
                    const items = [];
                    while (cur <= last) {
                      const s = new Date(cur), e = endOfWeek(cur);
                      const clipS = new Date(Math.max(s, first));
                      const clipE = new Date(Math.min(e, last));
                      items.push(
                        <MenuItem key={idx} dense onClick={()=>this.selectWeek({ start: clipS, end: clipE })}>
                          {this.state.selectedYear}년 {this.state.selectedMonth}월 {idx}주차 ({iso(clipS)}~{iso(clipE)})
                        </MenuItem>
                      );
                      idx += 1;
                      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
                    }
                    return items;
                  })()}
                </Menu>

                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  onClick={this.applyToday}
                  sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
                >
                  오늘
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  color="success"
                  endIcon={<ExpandMoreIcon />}
                  onClick={(e)=>this.setState({ customAnchorPos: getAnchorPos(e.currentTarget) })}
                  sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
                >
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

                {/* 구분자 */}
                <Typography sx={{ color:'white', opacity:0.8, mx:0.5 }}>|</Typography>

                {/* 기간선택 입력 */}
                <Typography sx={{ color:'white' }}>기간선택</Typography>
                <TextField
                  type="date"
                  value={filters.start_work_date}
                  onChange={(e)=>this.handleFilterChange('start_work_date', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor:'white', borderRadius:1, minWidth:150 }}
                  InputLabelProps={{ shrink: true }}
                />
                <Typography sx={{ color:'white' }}>~</Typography>
                <TextField
                  type="date"
                  value={filters.end_work_date}
                  onChange={(e)=>this.handleFilterChange('end_work_date', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor:'white', borderRadius:1, minWidth:150 }}
                  InputLabelProps={{ shrink: true }}
                />

                {/* 확장/축소 */}
                <IconButton onClick={this.toggleFilterExpansion} sx={{ color:'white' }}>
                  {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
              </Box>
            }
            sx={{ backgroundColor:'#ff8f00', color:'white', borderRadius:1, mb:2 }}
          />

          {/* === 1행: 공장/공정/설비/품번/품명 === */}
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(160px, 1fr))', gap:2, mb:1 }}>
            <Autocomplete
              size="small"
              options={options.plants}
              value={filters.plant || null}
              onChange={(_, v)=>this.handleFilterChange('plant', v || '')}
              renderInput={(params)=><TextField {...params} label="공장" />}
              clearOnEscape
            />
            <Autocomplete
              size="small"
              options={options.processes}
              value={filters.process || null}
              onChange={(_, v)=>this.handleFilterChange('process', v || '')}
              renderInput={(params)=><TextField {...params} label="작업장(공정)" />}
              clearOnEscape
            />
            <Autocomplete
              size="small"
              options={options.equipments}
              value={filters.equipment || null}
              onChange={(_, v)=>this.handleFilterChange('equipment', v || '')}
              renderInput={(params)=><TextField {...params} label="라인(설비)" />}
              clearOnEscape
            />

            {/* 품번/품명: 필요 시 생산기준 모달로 전환 가능 */}
            <TextField
              fullWidth
              label="품번"
              value={filters.itemNumber}
              // onClick={this.openItemCodeModal}
              size="small"
              variant="outlined"
              InputProps={{
                readOnly:true, style:{cursor:'pointer'},
                endAdornment:(<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color:'text.secondary' }}/></InputAdornment>)
              }}
              sx={{ '& .MuiInputBase-root':{ cursor:'pointer', '&:hover':{ backgroundColor:'#f5f5f5' } }}}
            />

            <TextField
              fullWidth
              label="품명"
              value={filters.itemName}
              // onClick={this.openItemCodeModal}
              size="small"
              variant="outlined"
              InputProps={{
                readOnly:true, style:{cursor:'pointer'},
                endAdornment:(<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color:'text.secondary' }}/></InputAdornment>)
              }}
              sx={{ '& .MuiInputBase-root':{ cursor:'pointer', '&:hover':{ backgroundColor:'#f5f5f5' } }}}
            />
          </Box>

          {/* 기본 나머지 필터 */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="사업장" value={filters.businessPlace} onChange={(e)=>this.handleFilterChange('businessPlace', e.target.value)} size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="검사구분" value={filters.inspectionType} onChange={(e)=>this.handleFilterChange('inspectionType', e.target.value)} size="small" variant="outlined" />
            </Grid>
          </Grid>

          {/* 확장 필터 */}
          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="주야구분" value={filters.shiftType} onChange={(e)=>this.handleFilterChange('shiftType', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="작업순번" type="number" value={filters.workSequence ?? ''} onChange={(e)=>this.handleFilterChange('workSequence', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="작업구분" value={filters.workType} onChange={(e)=>this.handleFilterChange('workType', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="검사순번" type="number" value={filters.inspectionSequence ?? ''} onChange={(e)=>this.handleFilterChange('inspectionSequence', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="검사항목명" value={filters.inspectionItemName} onChange={(e)=>this.handleFilterChange('inspectionItemName', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="검사내용" value={filters.inspectionDetails} onChange={(e)=>this.handleFilterChange('inspectionDetails', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="생산" type="number" value={filters.productionValue ?? ''} onChange={(e)=>this.handleFilterChange('productionValue', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
              </Grid>
            </Grid>
          </Collapse>

          {/* 버튼 */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display:'flex', gap:2, justifyContent:'flex-end' }}>
              <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.clearFilters} size="large" color="secondary">
                필터 초기화
              </Button>
              <Button variant="contained" startIcon={<SearchIcon />} size="large"
                sx={{ backgroundColor:'#ff8f00', '&:hover':{ backgroundColor:'#f57c00' } }}
                onClick={this.handleSearch}>
                검색
              </Button>
            </Box>
          </Grid>
        </Paper>

        {/* 데이터 그리드 */}
        <Paper elevation={3} sx={{ flex:1, display:'flex', flexDirection:'column', borderRadius:2 }}>
          <Box sx={{ height:'100%', width:'100%' }}>
            {loading && (
              <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height:'200px' }}>
                <CircularProgress size={60} sx={{ color:'#ff8f00' }} />
              </Box>
            )}
            {error && (
              <Box sx={{ p:3 }}>
                <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>
                <Button variant="contained" onClick={this.fetchAllDataOnce}
                  sx={{ backgroundColor:'#ff8f00', '&:hover':{ backgroundColor:'#f57c00' } }}>
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
                initialState={{ pagination:{ paginationModel:{ page:0, pageSize:10 } } }}
                disableRowSelectionOnClick
                density="compact"
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter:true, quickFilterProps:{ debounceMs:500 } } }}
                sx={{
                  '& .super-app-theme--header': { backgroundColor:'#ff8f00', color:'white', fontWeight:'bold' },
                  '& .MuiDataGrid-cell': { borderBottom:'1px solid #e0e0e0' },
                  '& .MuiDataGrid-root': { border:'none' },
                  '& .MuiDataGrid-virtualScroller': { backgroundColor:'#fafafa' },
                  '& .MuiDataGrid-footerContainer': { borderTop:'1px solid #e0e0e0' }
                }}
              />
            )}
          </Box>
        </Paper>

        {/* 생산 품목 모달(필요 시 활성화)
        <ItemCodeModal
          open={this.state.itemCodeModalOpen}
          onClose={this.closeItemCodeModal}
          onSelect={this.handleItemCodeSelect}
          selectedItemCode={this.state.filters.itemNumber}
          plant={this.state.filters.plant}
          worker={this.state.filters.process}
          line={this.state.filters.equipment}
        /> */}

        {/* 검사 데이터 선택 모달(검사×생산 조인 결과) */}
        <InspectionSelectModal
          open={this.state.inspectionModalOpen}
          onClose={this.closeInspectionModal}
          onSelect={this.handleInspectionPick}
          plant={this.state.filters.plant}
          process={this.state.filters.process}
          equipment={this.state.filters.equipment}
          startDate={this.state.filters.start_work_date}
          endDate={this.state.filters.end_work_date}
        />
      </Box>
    );
  }
}

export default InspectionGrid;
