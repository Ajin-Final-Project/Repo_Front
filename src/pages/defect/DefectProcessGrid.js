// // // src/pages/defect/DefectProcessGrid.js

// // import config from '../../config';
// // import React, { Component } from 'react';
// // import { connect } from 'react-redux';
// // import { selectThemeHex } from '../../reducers/layout';

// // import {
// //   Box,
// //   Paper,
// //   TextField,
// //   Button,
// //   Typography,
// //   CardHeader,
// //   IconButton,
// //   CircularProgress,
// //   Alert,
// //   Chip,
// //   Menu,
// //   MenuItem,
// //   InputAdornment,
// // } from '@mui/material';

// // // 아이콘
// // import SearchIcon from '@mui/icons-material/Search';
// // import ClearIcon from '@mui/icons-material/Clear';
// // import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// // import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// // import { FilterList as FilterIcon } from '@mui/icons-material';

// // import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// // import InspectionItemModal from '../common/InspectionItemModal';
// // import s from './DefectProcessGrid.module.scss';

// // /** ---------- helpers ---------- */
// // const iso = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD
// // const today0 = () => {
// //   const t = new Date();
// //   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// // };
// // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // const getAnchorPos = (el) => {
// //   if (!el) return null;
// //   const r = el.getBoundingClientRect();
// //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // };
// // const startOfWeek = (d) => {
// //   const day = d.getDay();
// //   const diff = (day === 0 ? -6 : 1) - day;
// //   const s2 = new Date(d);
// //   s2.setDate(d.getDate() + diff);
// //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate());
// // };
// // const endOfWeek = (d) => {
// //   const s2 = startOfWeek(d);
// //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate() + 6);
// // };
// // const getWeeksOfMonth = (year, month) => {
// //   const first = new Date(year, month - 1, 1);
// //   const last = lastOfMonth(first);
// //   let cur = startOfWeek(first);
// //   const out = [];
// //   let idx = 1;
// //   while (cur <= last) {
// //     const s = new Date(cur), e = endOfWeek(cur);
// //     const clipS = new Date(Math.max(s, first));
// //     const clipE = new Date(Math.min(e, last));
// //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// //     idx += 1;
// //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// //   }
// //   return out;
// // };

// // // 기본 필터
// // const getDefaultFilters = () => {
// //   const y = new Date().getFullYear();
// //   return {
// //     start_date: iso(new Date(y, 0, 1)),
// //     end_date: iso(new Date(y, 11, 31)),
// //     plant: '',
// //     workplace: '',
// //     line: '',
// //     partNo: '',
// //     item: '',
// //     carModel: '',
// //     orderType: '',
// //     defectCode: '',
// //     defectType: '',
// //     remark: '',
// //     worker: '',
// //     goodItemCount: null,
// //     waitItemCount: null,
// //     rwkCount: null,
// //     scrapCount: null,
// //   };
// // };

// // function mapStateToProps(state) {
// //   return { themeHex: selectThemeHex(state) };
// // }

// // class DefectProcessGrid extends Component {
// //   plantOptions = ['아진산업-본사(경산)', '아진산업-1공장(경산)', '아진산업-구어공장(경주)', '아진산업-하양공장(예정)'];
// //   workplaceOptions = ['프레스', '금형', '블랭크'];
// //   lineOptions = ['1500T(E라인)', '1200T(D라인)', '1000T(F라인)', '1000T-PRO(G라인)'];

// //   constructor(props) {
// //     super(props);
// //     const saved = localStorage.getItem('defectFilters');
// //     let base = getDefaultFilters();
// //     if (saved) {
// //       try { base = { ...base, ...JSON.parse(saved) }; } catch {}
// //     }
// //     this.state = {
// //       filters: base,
// //       rows: [],
// //       loading: false,
// //       error: null,

// //       selectedYear: new Date().getFullYear(),
// //       selectedMonth: new Date().getMonth() + 1,
// //       yearAnchorPos: null,
// //       monthAnchorPos: null,
// //       weekAnchorPos: null,
// //       years: [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2],

// //       itemCodeModalOpen: false,
// //     };
// //   }

// //   componentDidMount() {
// //     this.fetchData();
// //   }

// //   /** ---------- API ---------- */
// //   fetchData = async () => {
// //     this.setState({ loading: true, error: null });
// //     try {
// //       const f = this.state.filters;

// //       // 서버 요청 바디(기존 스키마 유지)
// //       const body = {
// //         start_work_date: f.start_date,
// //         end_work_date: f.end_date,
// //         workplace: f.workplace || undefined,
// //         itemInfo: f.partNo || undefined,
// //         carModel: f.carModel || undefined,
// //         orderType: f.orderType || undefined,
// //         defectCode: f.defectCode || undefined,
// //         defectType: f.defectType || undefined,
// //         remark: f.remark || undefined,
// //         worker: f.worker || undefined,
// //         goodItemCount: f.goodItemCount ?? undefined,
// //         waitItemCount: f.waitItemCount ?? undefined,
// //         rwkCount: f.rwkCount ?? undefined,
// //         scrapCount: f.scrapCount ?? undefined,
// //       };

// //       const res = await fetch(`${config.baseURLApi}/smartFactory/defect_grid/list`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify(body),
// //       });
// //       if (!res.ok) throw new Error(`HTTP ${res.status}`);
// //       const json = await res.json();
// //       const arr = Array.isArray(json.data) ? json.data : [];

// //       const mapped = arr.map((it, idx) => ({
// //         id: it.id || idx + 1,
// //         workDate: it.근무일자 || it.workDate || '',
// //         workplace: it.작업장 || it.workplace || '',
// //         partNo: it.자재번호 || it.itemInfo || '',
// //         itemName: it.품목명_보정 || it.품목명 || it.자재명 || it.품명 || it.itemName || '',
// //         carModel: it.차종 || it.carModel || '',
// //         orderType: it.수주유형 || it.orderType || '',
// //         goodItemCount: it.양품수량 ?? it.goodItemCount ?? 0,
// //         waitItemCount: it.판정대기 ?? it.waitItemCount ?? 0,
// //         rwkCount: it['RWK 수량'] ?? it.rwkCount ?? 0,
// //         scrapCount: it['폐기 수량'] ?? it.scrapCount ?? 0,
// //         defectCode: it.불량코드 || it.defectCode || '',
// //         defectType: it.불량유형 || it.defectType || '',
// //         remark: it.비고 || it.remark || '',
// //         worker: it.작업자 || it.worker || '',
// //       }));

// //       this.setState({ rows: mapped, loading: false }, () => {
// //         try { localStorage.setItem('defectFilters', JSON.stringify(this.state.filters)); } catch {}
// //       });
// //     } catch (e) {
// //       console.error(e);
// //       this.setState({ error: '불량공정 데이터를 불러오는 중 오류가 발생했습니다.', loading: false });
// //     }
// //   };

// //   /** ---------- 필터 바 ---------- */
// //   setDateRange = async (start, end) => {
// //     const start_date = iso(start);
// //     const end_date = iso(end);
// //     await new Promise((resolve) =>
// //       this.setState((prev) => ({ filters: { ...prev.filters, start_date, end_date } }), resolve)
// //     );
// //     this.fetchData();
// //   };
// //   applyToday = () => { const t = today0(); this.setDateRange(t, t); };
// //   selectYear = async (y) => {
// //     const s = new Date(y, 0, 1), e = new Date(y, 11, 31);
// //     await new Promise((r) => this.setState({ selectedYear: y, yearAnchorPos: null }, r));
// //     this.setDateRange(s, e);
// //   };
// //   selectMonth = async (m) => {
// //     const y = this.state.selectedYear;
// //     const s = new Date(y, m - 1, 1), e = lastOfMonth(new Date(y, m - 1, 1));
// //     await new Promise((r) => this.setState({ selectedMonth: m, monthAnchorPos: null }, r));
// //     this.setDateRange(s, e);
// //   };
// //   selectWeek = async (w) => {
// //     await new Promise((r) => this.setState({ weekAnchorPos: null }, r));
// //     this.setDateRange(w.start, w.end);
// //   };

// //   handleFilterChange = (field, value) => {
// //     this.setState((prev) => ({ filters: { ...prev.filters, [field]: value } }));
// //   };

// //   clearFilters = () => {
// //     const base = getDefaultFilters();
// //     this.setState({ filters: base, rows: [] }, this.fetchData);
// //   };

// //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// //     this.setState(
// //       (prev) => ({ filters: { ...prev.filters, partNo: 품목번호 || '', item: 품목명 || '' }, itemCodeModalOpen: false }),
// //       this.fetchData
// //     );
// //   };
// //   handleClearPart = () => {
// //     this.setState((prev) => ({ filters: { ...prev.filters, partNo: '', item: '' } }), this.fetchData);
// //   };

// //   renderFilterBar = () => {
// //     const { filters } = this.state;

// //     const now = today0();
// //     const thisYear = now.getFullYear();
// //     const thisMonth = now.getMonth() + 1;
// //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// //     return (
// //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// //         {/* 상단 헤더(연간/월간/주간/오늘 + 기간선택) */}
// //         <CardHeader
// //           title={
// //             <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
// //               <SearchIcon /> 검색 조건
// //             </Typography>
// //           }
// //           action={
// //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
// //               {/* 연간 */}
// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 endIcon={<ExpandMoreIcon />}
// //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// //               >
// //                 연간
// //               </Button>
// //               <Menu
// //                 open={!!this.state.yearAnchorPos}
// //                 onClose={() => this.setState({ yearAnchorPos: null })}
// //                 anchorReference="anchorPosition"
// //                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// //               >
// //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
// //                 {this.state.years.map((y) => (
// //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
// //                 ))}
// //               </Menu>

// //               {/* 월간 */}
// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 endIcon={<ExpandMoreIcon />}
// //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// //               >
// //                 월간
// //               </Button>
// //               <Menu
// //                 open={!!this.state.monthAnchorPos}
// //                 onClose={() => this.setState({ monthAnchorPos: null })}
// //                 anchorReference="anchorPosition"
// //                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// //               >
// //                 <MenuItem
// //                   dense
// //                   onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}
// //                 >
// //                   이번달
// //                 </MenuItem>
// //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// //                     {this.state.selectedYear}년 {m}월
// //                   </MenuItem>
// //                 ))}
// //               </Menu>

// //               {/* 주간 */}
// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 endIcon={<ExpandMoreIcon />}
// //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// //               >
// //                 주간
// //               </Button>
// //               <Menu
// //                 open={!!this.state.weekAnchorPos}
// //                 onClose={() => this.setState({ weekAnchorPos: null })}
// //                 anchorReference="anchorPosition"
// //                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
// //               >
// //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// //                 </MenuItem>
// //                 {weeks.map((w, i) => (
// //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// //                   </MenuItem>
// //                 ))}
// //               </Menu>

// //               {/* 오늘 */}
// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// //                 onClick={this.applyToday}
// //               >
// //                 오늘
// //               </Button>

// //               {/* 기간선택 */}
// //               <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>
// //               <Typography sx={{ color: 'white' }}>기간선택</Typography>
// //               <TextField
// //                 type="date"
// //                 value={filters.start_date}
// //                 onChange={(e) => this.handleFilterChange('start_date', e.target.value)}
// //                 size="small"
// //                 variant="outlined"
// //                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
// //                 InputLabelProps={{ shrink: true }}
// //               />
// //               <Typography sx={{ color: 'white' }}>~</Typography>
// //               <TextField
// //                 type="date"
// //                 value={filters.end_date}
// //                 onChange={(e) => this.handleFilterChange('end_date', e.target.value)}
// //                 size="small"
// //                 variant="outlined"
// //                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
// //                 InputLabelProps={{ shrink: true }}
// //               />
// //             </Box>
// //           }
// //           sx={{ backgroundColor: this.props.themeHex, color: 'white', borderRadius: 1, mb: 2 }}
// //         />

// //         {/* 입력부: 5등분(공장/공정/설비/품번/품명) */}
// //         <Box
// //           sx={{
// //             display: 'grid',
// //             gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
// //             gap: 2,
// //             alignItems: 'center',
// //           }}
// //         >
// //           <TextField
// //             label="공장"
// //             size="small"
// //             select
// //             value={filters.plant}
// //             onChange={(e) => this.handleFilterChange('plant', e.target.value)}
// //             fullWidth
// //             sx={{ minWidth: 0 }}
// //           >
// //             {this.plantOptions.map((v) => (
// //               <MenuItem key={v} value={v}>{v}</MenuItem>
// //             ))}
// //           </TextField>

// //           <TextField
// //             label="작업장(공정)"
// //             size="small"
// //             select
// //             value={filters.workplace}
// //             onChange={(e) => this.handleFilterChange('workplace', e.target.value)}
// //             fullWidth
// //             sx={{ minWidth: 0 }}
// //           >
// //             {this.workplaceOptions.map((v) => (
// //               <MenuItem key={v} value={v}>{v}</MenuItem>
// //             ))}
// //           </TextField>

// //           <TextField
// //             label="라인(설비)"
// //             size="small"
// //             select
// //             value={filters.line}
// //             onChange={(e) => this.handleFilterChange('line', e.target.value)}
// //             fullWidth
// //             sx={{ minWidth: 0 }}
// //           >
// //             {this.lineOptions.map((v) => (
// //               <MenuItem key={v} value={v}>{v}</MenuItem>
// //             ))}
// //           </TextField>

// //           <TextField
// //             label="품번"
// //             value={filters.partNo}
// //             onClick={() => this.setState({ itemCodeModalOpen: true })}
// //             size="small"
// //             variant="outlined"
// //             fullWidth
// //             sx={{ minWidth: 0, '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { background: '#f5f5f5' } } }}
// //             InputProps={{
// //               readOnly: true,
// //               endAdornment: (
// //                 <InputAdornment position="end">
// //                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
// //                 </InputAdornment>
// //               ),
// //             }}
// //           />

// //           <TextField
// //             label="품명(검사항목)"
// //             value={filters.item}
// //             onClick={() => this.setState({ itemCodeModalOpen: true })}
// //             size="small"
// //             variant="outlined"
// //             fullWidth
// //             sx={{ minWidth: 0, '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { background: '#f5f5f5' } } }}
// //             InputProps={{
// //               readOnly: true,
// //               endAdornment: (
// //                 <InputAdornment position="end">
// //                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
// //                 </InputAdornment>
// //               ),
// //             }}
// //           />
// //         </Box>

// //         {/* 버튼 줄(아래, 우측 정렬) */}
// //         <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
// //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.clearFilters} size="large" color="secondary">
// //             필터 초기화
// //           </Button>
// //           <Button
// //             variant="contained"
// //             startIcon={<SearchIcon />}
// //             size="large"
// //             sx={{ backgroundColor: this.props.themeHex, '&:hover': { backgroundColor: '#f57c00' } }}
// //             onClick={this.fetchData}
// //           >
// //             검색
// //           </Button>
// //         </Box>

// //         {/* 품목 선택 모달 */}
// //         <InspectionItemModal
// //           open={this.state.itemCodeModalOpen}
// //           onClose={() => this.setState({ itemCodeModalOpen: false })}
// //           onSelect={this.handleItemCodeSelect}
// //           selectedItemCode={filters.partNo}
// //           plant={filters.plant}
// //           worker={filters.workplace}
// //           line={filters.line}
// //           startDate={filters.start_date}
// //           endDate={filters.end_date}
// //         />
// //       </Paper>
// //     );
// //   };

// //   /** ---------- 표 컬럼 ---------- */
// //   columns = [
// //     { field: 'id', headerName: 'ID', width: 80, type: 'number',
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
// //     { field: 'workDate', headerName: '근무일자', width: 120, type: 'date',
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
// //       valueGetter: (p) => (p.value ? new Date(p.value) : null) },
// //     { field: 'workplace', headerName: '작업장', width: 120,
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
// //     { field: 'partNo', headerName: '자재번호', width: 170,
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
// //     { field: 'itemName', headerName: '품목명(보정)', width: 220,
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
// //     { field: 'carModel', headerName: '차종', width: 100,
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
// //     { field: 'orderType', headerName: '수주유형', width: 110,
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

// //     { field: 'goodItemCount', headerName: '양품', width: 90, type: 'number',
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
// //       renderCell: (p) => (
// //         <Chip label={(p.value ?? 0).toLocaleString()} color="success" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
// //       ) },
// //     { field: 'waitItemCount', headerName: '판정대기', width: 100, type: 'number',
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
// //       renderCell: (p) => (
// //         <Chip label={(p.value ?? 0).toLocaleString()} color="warning" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
// //       ) },
// //     { field: 'rwkCount', headerName: 'RWK', width: 90, type: 'number',
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
// //     { field: 'scrapCount', headerName: '폐기', width: 90, type: 'number',
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

// //     { field: 'defectCode', headerName: '불량코드', width: 110,
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
// //     { field: 'defectType', headerName: '불량유형', width: 150,
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
// //     { field: 'remark', headerName: '비고', width: 220,
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
// //     { field: 'worker', headerName: '작업자', width: 100,
// //       headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
// //   ];

// //   render() {
// //     const { rows, loading, error } = this.state;
// //     return (
// //       <Box className={s.root}>
// //         {/* 상단 타이틀 */}
// //         <Box sx={{ mb: 3 }}>
// //           <Typography
// //             variant="h4"
// //             gutterBottom
// //             sx={{ color: this.props.themeHex, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
// //           >
// //             <FilterIcon /> 불량 데이터 내역
// //           </Typography>
// //           <Typography variant="body1" color="text.secondary">
// //             생산_불량 테이블을 기간/조건으로 조회합니다.
// //           </Typography>
// //         </Box>

// //         {/* 필터 바 */}
// //         {this.renderFilterBar()}

// //         {/* 오류/로딩 */}
// //         {loading && (
// //           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
// //             <CircularProgress size={60} sx={{ color: this.props.themeHex }} />
// //           </Box>
// //         )}
// //         {error && (
// //           <Box sx={{ p: 3 }}>
// //             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
// //             <Button variant="contained" onClick={this.fetchData}
// //               sx={{ backgroundColor: this.props.themeHex, '&:hover': { backgroundColor: '#f57c00' } }}>
// //               다시 시도
// //             </Button>
// //           </Box>
// //         )}

// //         {/* 데이터 그리드 */}
// //         {!loading && !error && (
// //           <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
// //             <Box sx={{ height: '100%', width: '100%' }}>
// //               <DataGrid
// //                 rows={rows}
// //                 columns={this.columns}
// //                 pagination
// //                 paginationMode="client"
// //                 pageSizeOptions={[10, 25, 50, 100]}
// //                 initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
// //                 disableRowSelectionOnClick
// //                 density="compact"
// //                 slots={{ toolbar: GridToolbar }}
// //                 slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
// //                 sx={{
// //                   '& .super-app-theme--header': { backgroundColor: this.props.themeHex, color: '#fff', fontWeight: 800 },
// //                   '& .super-app-theme--cell': { borderBottom: '1px solid #e0e0e0' },
// //                   '& .MuiDataGrid-row:hover': { backgroundColor: '#fff8f4' },
// //                   '& .MuiDataGrid-virtualScroller': { backgroundColor: '#fafafa' },
// //                   '& .MuiDataGrid-footerContainer': { borderTop: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' },
// //                   '& .MuiDataGrid-toolbarContainer': { backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', p: '8px 16px' },
// //                 }}
// //               />
// //             </Box>
// //           </Paper>
// //         )}
// //       </Box>
// //     );
// //   }
// // }

// // export default connect(mapStateToProps)(DefectProcessGrid);





// // src/pages/defect/DefectProcessGrid.js

// import config from '../../config';
// import React, { Component } from 'react';
// import { connect } from 'react-redux';
// import { selectThemeHex } from '../../reducers/layout';

// import {
//   Box,
//   Paper,
//   TextField,
//   Button,
//   Typography,
//   CardHeader,
//   CircularProgress,
//   Alert,
//   Menu,
//   MenuItem,
//   InputAdornment,
// } from '@mui/material';

// // 아이콘
// import SearchIcon from '@mui/icons-material/Search';
// import ClearIcon from '@mui/icons-material/Clear';
// import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
// import { FilterList as FilterIcon } from '@mui/icons-material';

// import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// import InspectionItemModal from '../common/InspectionItemModal';
// import s from './DefectProcessGrid.module.scss';

// /** ---------- helpers ---------- */
// const iso = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD
// const today0 = () => {
//   const t = new Date();
//   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// };
// const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// const getAnchorPos = (el) => {
//   if (!el) return null;
//   const r = el.getBoundingClientRect();
//   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// };
// const startOfWeek = (d) => {
//   const day = d.getDay();
//   const diff = (day === 0 ? -6 : 1) - day;
//   const s2 = new Date(d);
//   s2.setDate(d.getDate() + diff);
//   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate());
// };
// const endOfWeek = (d) => {
//   const s2 = startOfWeek(d);
//   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate() + 6);
// };
// const getWeeksOfMonth = (year, month) => {
//   const first = new Date(year, month - 1, 1);
//   const last = lastOfMonth(first);
//   let cur = startOfWeek(first);
//   const out = [];
//   let idx = 1;
//   while (cur <= last) {
//     const s = new Date(cur), e = endOfWeek(cur);
//     const clipS = new Date(Math.max(s, first));
//     const clipE = new Date(Math.min(e, last));
//     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
//     idx += 1;
//     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
//   }
//   return out;
// };

// // 기본 필터
// const getDefaultFilters = () => {
//   const y = new Date().getFullYear();
//   return {
//     start_date: iso(new Date(y, 0, 1)),
//     end_date: iso(new Date(y, 11, 31)),
//     plant: '',
//     workplace: '',
//     line: '',
//     partNo: '',
//     item: '',
//     carModel: '',
//     orderType: '',
//     defectCode: '',
//     defectType: '',
//     remark: '',
//     worker: '',
//     goodItemCount: null,
//     waitItemCount: null,
//     rwkCount: null,
//     scrapCount: null,
//   };
// };

// function mapStateToProps(state) {
//   return { themeHex: selectThemeHex(state) };
// }

// class DefectProcessGrid extends Component {
//   plantOptions = ['아진산업-본사(경산)', '아진산업-1공장(경산)', '아진산업-구어공장(경주)', '아진산업-하양공장(예정)'];
//   workplaceOptions = ['프레스', '금형', '블랭크'];
//   lineOptions = ['1500T(E라인)', '1200T(D라인)', '1000T(F라인)', '1000T-PRO(G라인)'];

//   constructor(props) {
//     super(props);
//     const saved = localStorage.getItem('defectFilters');
//     let base = getDefaultFilters();
//     if (saved) {
//       try { base = { ...base, ...JSON.parse(saved) }; } catch {}
//     }
//     this.state = {
//       filters: base,
//       rows: [],
//       columns: [], // ✅ 동적 컬럼
//       loading: false,
//       error: null,

//       selectedYear: new Date().getFullYear(),
//       selectedMonth: new Date().getMonth() + 1,
//       yearAnchorPos: null,
//       monthAnchorPos: null,
//       weekAnchorPos: null,
//       years: [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2],

//       itemCodeModalOpen: false,
//     };
//   }

//   componentDidMount() {
//     this.fetchData();
//   }

//   /** ---------- API ---------- */
//   fetchData = async () => {
//     this.setState({ loading: true, error: null });
//     try {
//       const f = this.state.filters;

//       // 서버 요청 바디(기존 스키마 유지)
//       const body = {
//         start_work_date: f.start_date,
//         end_work_date: f.end_date,
//         plant: f.plant || undefined,          // ✅ 추가
//         workplace: f.workplace || undefined,
//         line: f.line || undefined,            // ✅ 추가
//         // 품번이 비어있고 품명만 있는 경우까지 감안
//         itemInfo: (f.partNo || f.item || '') || undefined,
//         carModel: f.carModel || undefined,
//         orderType: f.orderType || undefined,
//         defectCode: f.defectCode || undefined,
//         defectType: f.defectType || undefined,
//         remark: f.remark || undefined,
//         worker: f.worker || undefined,
//         goodItemCount: f.goodItemCount ?? undefined,
//         waitItemCount: f.waitItemCount ?? undefined,
//         rwkCount: f.rwkCount ?? undefined,
//         scrapCount: f.scrapCount ?? undefined,
//       };

//       const res = await fetch(`${config.baseURLApi}/smartFactory/defect_grid/list`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();
//       const arr = Array.isArray(json.data) ? json.data : [];

//       // ✅ DB 그대로: id만 붙이고 나머지는 원본 유지
//       const mapped = arr.map((row, idx) => ({ id: idx + 1, ...row }));

//       // ✅ 응답 키로 동적 컬럼 구성
//       const keys = Array.from(new Set(arr.flatMap(o => Object.keys(o))));
//       const autoCols = [
//         {
//           field: 'id',
//           headerName: 'ID',
//           width: 80,
//           headerClassName: 'super-app-theme--header',
//           cellClassName: 'super-app-theme--cell',
//         },
//         ...keys.map(k => ({
//           field: k,
//           headerName: k,
//           minWidth: 140,
//           flex: 1,
//           headerClassName: 'super-app-theme--header',
//           cellClassName: 'super-app-theme--cell',
//         })),
//       ];

//       this.setState({ rows: mapped, columns: autoCols, loading: false }, () => {
//         try { localStorage.setItem('defectFilters', JSON.stringify(this.state.filters)); } catch {}
//       });
//     } catch (e) {
//       console.error(e);
//       this.setState({ error: '불량공정 데이터를 불러오는 중 오류가 발생했습니다.', loading: false });
//     }
//   };

//   /** ---------- 필터 바 ---------- */
//   setDateRange = async (start, end) => {
//     const start_date = iso(start);
//     const end_date = iso(end);
//     await new Promise((resolve) =>
//       this.setState((prev) => ({ filters: { ...prev.filters, start_date, end_date } }), resolve)
//     );
//     this.fetchData();
//   };
//   applyToday = () => { const t = today0(); this.setDateRange(t, t); };
//   selectYear = async (y) => {
//     const s = new Date(y, 0, 1), e = new Date(y, 11, 31);
//     await new Promise((r) => this.setState({ selectedYear: y, yearAnchorPos: null }, r));
//     this.setDateRange(s, e);
//   };
//   selectMonth = async (m) => {
//     const y = this.state.selectedYear;
//     const s = new Date(y, m - 1, 1), e = lastOfMonth(new Date(y, m - 1, 1));
//     await new Promise((r) => this.setState({ selectedMonth: m, monthAnchorPos: null }, r));
//     this.setDateRange(s, e);
//   };
//   selectWeek = async (w) => {
//     await new Promise((r) => this.setState({ weekAnchorPos: null }, r));
//     this.setDateRange(w.start, w.end);
//   };

//   handleFilterChange = (field, value) => {
//     this.setState((prev) => ({ filters: { ...prev.filters, [field]: value } }));
//   };

//   clearFilters = () => {
//     const base = getDefaultFilters();
//     this.setState({ filters: base, rows: [] }, this.fetchData);
//   };

//   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
//   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
//   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
//     this.setState(
//       (prev) => ({ filters: { ...prev.filters, partNo: 품목번호 || '', item: 품목명 || '' }, itemCodeModalOpen: false }),
//       this.fetchData
//     );
//   };

//   renderFilterBar = () => {
//     const { filters } = this.state;

//     const now = today0();
//     const thisYear = now.getFullYear();
//     const thisMonth = now.getMonth() + 1;
//     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
//     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

//     return (
//       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
//         {/* 상단 헤더(연간/월간/주간/오늘 + 기간선택) */}
//         <CardHeader
//           title={
//             <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
//               <SearchIcon /> 검색 조건
//             </Typography>
//           }
//           action={
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//               {/* 연간 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
//               >
//                 연간
//               </Button>
//               <Menu
//                 open={!!this.state.yearAnchorPos}
//                 onClose={() => this.setState({ yearAnchorPos: null })}
//                 anchorReference="anchorPosition"
//                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
//               >
//                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
//                 {this.state.years.map((y) => (
//                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
//                 ))}
//               </Menu>

//               {/* 월간 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
//               >
//                 월간
//               </Button>
//               <Menu
//                 open={!!this.state.monthAnchorPos}
//                 onClose={() => this.setState({ monthAnchorPos: null })}
//                 anchorReference="anchorPosition"
//                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
//               >
//                 <MenuItem
//                   dense
//                   onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}
//                 >
//                   이번달
//                 </MenuItem>
//                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
//                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
//                     {this.state.selectedYear}년 {m}월
//                   </MenuItem>
//                 ))}
//               </Menu>

//               {/* 주간 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
//               >
//                 주간
//               </Button>
//               <Menu
//                 open={!!this.state.weekAnchorPos}
//                 onClose={() => this.setState({ weekAnchorPos: null })}
//                 anchorReference="anchorPosition"
//                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
//               >
//                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
//                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
//                 </MenuItem>
//                 {weeks.map((w, i) => (
//                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
//                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
//                   </MenuItem>
//                 ))}
//               </Menu>

//               {/* 오늘 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
//                 onClick={this.applyToday}
//               >
//                 오늘
//               </Button>

//               {/* 기간선택 */}
//               <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>
//               <Typography sx={{ color: 'white' }}>기간선택</Typography>
//               <TextField
//                 type="date"
//                 value={filters.start_date}
//                 onChange={(e) => this.handleFilterChange('start_date', e.target.value)}
//                 size="small"
//                 variant="outlined"
//                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
//                 InputLabelProps={{ shrink: true }}
//               />
//               <Typography sx={{ color: 'white' }}>~</Typography>
//               <TextField
//                 type="date"
//                 value={filters.end_date}
//                 onChange={(e) => this.handleFilterChange('end_date', e.target.value)}
//                 size="small"
//                 variant="outlined"
//                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
//                 InputLabelProps={{ shrink: true }}
//               />
//             </Box>
//           }
//           sx={{ backgroundColor: this.props.themeHex, color: 'white', borderRadius: 1, mb: 2 }}
//         />

//         {/* 입력부: 5등분(공장/공정/설비/품번/품명) */}
//         <Box
//           sx={{
//             display: 'grid',
//             gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
//             gap: 2,
//             alignItems: 'center',
//           }}
//         >
//           <TextField
//             label="공장"
//             size="small"
//             select
//             value={filters.plant}
//             onChange={(e) => this.handleFilterChange('plant', e.target.value)}
//             fullWidth
//             sx={{ minWidth: 0 }}
//           >
//             {this.plantOptions.map((v) => (
//               <MenuItem key={v} value={v}>{v}</MenuItem>
//             ))}
//           </TextField>

//           <TextField
//             label="작업장(공정)"
//             size="small"
//             select
//             value={filters.workplace}
//             onChange={(e) => this.handleFilterChange('workplace', e.target.value)}
//             fullWidth
//             sx={{ minWidth: 0 }}
//           >
//             {this.workplaceOptions.map((v) => (
//               <MenuItem key={v} value={v}>{v}</MenuItem>
//             ))}
//           </TextField>

//           <TextField
//             label="라인(설비)"
//             size="small"
//             select
//             value={filters.line}
//             onChange={(e) => this.handleFilterChange('line', e.target.value)}
//             fullWidth
//             sx={{ minWidth: 0 }}
//           >
//             {this.lineOptions.map((v) => (
//               <MenuItem key={v} value={v}>{v}</MenuItem>
//             ))}
//           </TextField>

//           <TextField
//             label="품번"
//             value={filters.partNo}
//             onClick={() => this.setState({ itemCodeModalOpen: true })}
//             size="small"
//             variant="outlined"
//             fullWidth
//             sx={{ minWidth: 0, '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { background: '#f5f5f5' } } }}
//             InputProps={{
//               readOnly: true,
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
//                 </InputAdornment>
//               ),
//             }}
//           />

//           <TextField
//             label="품명(검사항목)"
//             value={filters.item}
//             onClick={() => this.setState({ itemCodeModalOpen: true })}
//             size="small"
//             variant="outlined"
//             fullWidth
//             sx={{ minWidth: 0, '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { background: '#f5f5f5' } } }}
//             InputProps={{
//               readOnly: true,
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
//                 </InputAdornment>
//               ),
//             }}
//           />
//         </Box>

//         {/* 버튼 줄(아래, 우측 정렬) */}
//         <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
//           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.clearFilters} size="large" color="secondary">
//             필터 초기화
//           </Button>
//           <Button
//             variant="contained"
//             startIcon={<SearchIcon />}
//             size="large"
//             sx={{ backgroundColor: this.props.themeHex, '&:hover': { backgroundColor: '#f57c00' } }}
//             onClick={this.fetchData}
//           >
//             검색
//           </Button>
//         </Box>

//         {/* 품목 선택 모달 */}
//         <InspectionItemModal
//           open={this.state.itemCodeModalOpen}
//           onClose={() => this.setState({ itemCodeModalOpen: false })}
//           onSelect={this.handleItemCodeSelect}
//           selectedItemCode={filters.partNo}
//           plant={filters.plant}
//           worker={filters.workplace}
//           line={filters.line}
//           startDate={filters.start_date}
//           endDate={filters.end_date}
//         />
//       </Paper>
//     );
//   };

//   render() {
//     const { rows, columns, loading, error } = this.state;
//     return (
//       <Box className={s.root}>
//         {/* 상단 타이틀 */}
//         <Box sx={{ mb: 3 }}>
//           <Typography
//             variant="h4"
//             gutterBottom
//             sx={{ color: this.props.themeHex, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
//           >
//             <FilterIcon /> 불량 데이터 내역
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             생산_불량 테이블(DB 컬럼 그대로)을 기간/조건으로 조회합니다.
//           </Typography>
//         </Box>

//         {/* 필터 바 */}
//         {this.renderFilterBar()}

//         {/* 오류/로딩 */}
//         {loading && (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
//             <CircularProgress size={60} sx={{ color: this.props.themeHex }} />
//           </Box>
//         )}
//         {error && (
//           <Box sx={{ p: 3 }}>
//             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
//             <Button variant="contained" onClick={this.fetchData}
//               sx={{ backgroundColor: this.props.themeHex, '&:hover': { backgroundColor: '#f57c00' } }}>
//               다시 시도
//             </Button>
//           </Box>
//         )}

//         {/* 데이터 그리드 */}
//         {!loading && !error && (
//           <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
//             <Box sx={{ height: '100%', width: '100%' }}>
//               <DataGrid
//                 rows={rows}
//                 columns={columns}
//                 pagination
//                 paginationMode="client"
//                 pageSizeOptions={[10, 25, 50, 100]}
//                 initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
//                 disableRowSelectionOnClick
//                 density="compact"
//                 slots={{ toolbar: GridToolbar }}
//                 slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
//                 sx={{
//                   '& .super-app-theme--header': { backgroundColor: this.props.themeHex, color: '#fff', fontWeight: 800 },
//                   '& .super-app-theme--cell': { borderBottom: '1px solid #e0e0e0' },
//                   '& .MuiDataGrid-row:hover': { backgroundColor: '#fff8f4' },
//                   '& .MuiDataGrid-virtualScroller': { backgroundColor: '#fafafa' },
//                   '& .MuiDataGrid-footerContainer': { borderTop: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' },
//                   '& .MuiDataGrid-toolbarContainer': { backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', p: '8px 16px' },
//                 }}
//               />
//             </Box>
//           </Paper>
//         )}
//       </Box>
//     );
//   }
// }

// export default connect(mapStateToProps)(DefectProcessGrid);


// src/pages/defect/DefectProcessGrid.js

import config from '../../config';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { selectThemeHex } from '../../reducers/layout';

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CardHeader,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  InputAdornment,
} from '@mui/material';

// 아이콘
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { FilterList as FilterIcon } from '@mui/icons-material';

import { DataGrid, GridToolbar } from '@mui/x-data-grid';

import InspectionItemModal from '../common/InspectionItemModal';
import s from './DefectProcessGrid.module.scss';

/** ---------- helpers ---------- */
const iso = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD
const today0 = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};
const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

const getAnchorPos = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
};
const startOfWeek = (d) => {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const s2 = new Date(d);
  s2.setDate(d.getDate() + diff);
  return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate());
};
const endOfWeek = (d) => {
  const s2 = startOfWeek(d);
  return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate() + 6);
};
const getWeeksOfMonth = (year, month) => {
  const first = new Date(year, month - 1, 1);
  const last = lastOfMonth(first);
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

// 기본 필터
const getDefaultFilters = () => {
  const y = new Date().getFullYear();
  return {
    start_date: iso(new Date(y, 0, 1)),
    end_date: iso(new Date(y, 11, 31)),
    // ✅ 디폴트 선택값
    plant: '아진산업-본사(경산)',
    workplace: '프레스',
    line: '1500T(E라인)',
    partNo: '',
    item: '',
    carModel: '',
    orderType: '',
    defectCode: '',
    defectType: '',
    remark: '',
    worker: '',
    goodItemCount: null,
    waitItemCount: null,
    rwkCount: null,
    scrapCount: null,
  };
};

function mapStateToProps(state) {
  return { themeHex: selectThemeHex(state) };
}

class DefectProcessGrid extends Component {
  plantOptions = ['아진산업-본사(경산)', '아진산업-1공장(경산)', '아진산업-구어공장(경주)', '아진산업-하양공장(예정)'];
  workplaceOptions = ['프레스', '금형', '블랭크'];
  lineOptions = ['1500T(E라인)', '1200T(D라인)', '1000T(F라인)', '1000T-PRO(G라인)'];

  constructor(props) {
    super(props);
    const saved = localStorage.getItem('defectFilters');
    const DEFAULTS = getDefaultFilters();
    let base = DEFAULTS;
    if (saved) {
      try {
        // 이전 필터가 저장되어 있어도 '공장/작업장/라인'은 항상 디폴트로 시작
        const parsed = JSON.parse(saved);
        const { plant, workplace, line, ...rest } = parsed || {};
        base = { ...DEFAULTS, ...rest };
      } catch {}
    }
    this.state = {
      filters: base,
      rows: [],
      columns: [], // ✅ 동적 컬럼
      loading: false,
      error: null,

      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      yearAnchorPos: null,
      monthAnchorPos: null,
      weekAnchorPos: null,
      years: [new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2],

      itemCodeModalOpen: false,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  /** ---------- API ---------- */
  fetchData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const f = this.state.filters;

      // 서버 요청 바디(기존 스키마 유지)
      const body = {
        start_work_date: f.start_date,
        end_work_date: f.end_date,
        plant: f.plant || undefined,          // ✅ 공장 필터 전달
        workplace: f.workplace || undefined,
        line: f.line || undefined,            // ✅ 라인 필터 전달
        // 품번이 비어있고 품명만 있는 경우까지 감안
        itemInfo: (f.partNo || f.item || '') || undefined,
        carModel: f.carModel || undefined,
        orderType: f.orderType || undefined,
        defectCode: f.defectCode || undefined,
        defectType: f.defectType || undefined,
        remark: f.remark || undefined,
        worker: f.worker || undefined,
        goodItemCount: f.goodItemCount ?? undefined,
        waitItemCount: f.waitItemCount ?? undefined,
        rwkCount: f.rwkCount ?? undefined,
        scrapCount: f.scrapCount ?? undefined,
      };

      const res = await fetch(`${config.baseURLApi}/smartFactory/defect_grid/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json.data) ? json.data : [];

      // ✅ DB 그대로: id만 붙이고 나머지는 원본 유지
      const mapped = arr.map((row, idx) => ({ id: idx + 1, ...row }));

      // ✅ 응답 키로 동적 컬럼 구성
      const keys = Array.from(new Set(arr.flatMap(o => Object.keys(o))));
      const autoCols = [
        {
          field: 'id',
          headerName: 'ID',
          width: 80,
          headerClassName: 'super-app-theme--header',
          cellClassName: 'super-app-theme--cell',
        },
        ...keys.map(k => ({
          field: k,
          headerName: k,
          minWidth: 140,
          flex: 1,
          headerClassName: 'super-app-theme--header',
          cellClassName: 'super-app-theme--cell',
        })),
      ];

      this.setState({ rows: mapped, columns: autoCols, loading: false }, () => {
        try { localStorage.setItem('defectFilters', JSON.stringify(this.state.filters)); } catch {}
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: '불량공정 데이터를 불러오는 중 오류가 발생했습니다.', loading: false });
    }
  };

  /** ---------- 필터 바 ---------- */
  setDateRange = async (start, end) => {
    const start_date = iso(start);
    const end_date = iso(end);
    await new Promise((resolve) =>
      this.setState((prev) => ({ filters: { ...prev.filters, start_date, end_date } }), resolve)
    );
    this.fetchData();
  };
  applyToday = () => { const t = today0(); this.setDateRange(t, t); };
  selectYear = async (y) => {
    const s = new Date(y, 0, 1), e = new Date(y, 11, 31);
    await new Promise((r) => this.setState({ selectedYear: y, yearAnchorPos: null }, r));
    this.setDateRange(s, e);
  };
  selectMonth = async (m) => {
    const y = this.state.selectedYear;
    const s = new Date(y, m - 1, 1), e = lastOfMonth(new Date(y, m - 1, 1));
    await new Promise((r) => this.setState({ selectedMonth: m, monthAnchorPos: null }, r));
    this.setDateRange(s, e);
  };
  selectWeek = async (w) => {
    await new Promise((r) => this.setState({ weekAnchorPos: null }, r));
    this.setDateRange(w.start, w.end);
  };

  handleFilterChange = (field, value) => {
    this.setState((prev) => ({ filters: { ...prev.filters, [field]: value } }));
  };

  clearFilters = () => {
    const base = getDefaultFilters();
    this.setState({ filters: base, rows: [] }, this.fetchData);
  };

  openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
  closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
  handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
    this.setState(
      (prev) => ({ filters: { ...prev.filters, partNo: 품목번호 || '', item: 품목명 || '' }, itemCodeModalOpen: false }),
      this.fetchData
    );
  };

  renderFilterBar = () => {
    const { filters } = this.state;

    const now = today0();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
    const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        {/* 상단 헤더(연간/월간/주간/오늘 + 기간선택) */}
        <CardHeader
          title={
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
              <SearchIcon /> 검색 조건
            </Typography>
          }
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* 연간 */}
              <Button
                size="small"
                variant="outlined"
                color="success"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
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
                  <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
                ))}
              </Menu>

              {/* 월간 */}
              <Button
                size="small"
                variant="outlined"
                color="success"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
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
                  onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}
                >
                  이번달
                </MenuItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
                    {this.state.selectedYear}년 {m}월
                  </MenuItem>
                ))}
              </Menu>

              {/* 주간 */}
              <Button
                size="small"
                variant="outlined"
                color="success"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
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
                  이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
                </MenuItem>
                {weeks.map((w, i) => (
                  <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
                    {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
                  </MenuItem>
                ))}
              </Menu>

              {/* 오늘 */}
              <Button
                size="small"
                variant="outlined"
                color="success"
                sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
                onClick={this.applyToday}
              >
                오늘
              </Button>

              {/* 기간선택 */}
              <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>
              <Typography sx={{ color: 'white' }}>기간선택</Typography>
              <TextField
                type="date"
                value={filters.start_date}
                onChange={(e) => this.handleFilterChange('start_date', e.target.value)}
                size="small"
                variant="outlined"
                sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
              <Typography sx={{ color: 'white' }}>~</Typography>
              <TextField
                type="date"
                value={filters.end_date}
                onChange={(e) => this.handleFilterChange('end_date', e.target.value)}
                size="small"
                variant="outlined"
                sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          }
          sx={{ backgroundColor: this.props.themeHex, color: 'white', borderRadius: 1, mb: 2 }}
        />

        {/* 입력부: 5등분(공장/공정/설비/품번/품명) */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
            gap: 2,
            alignItems: 'center',
          }}
        >
          <TextField
            label="공장"
            size="small"
            select
            value={filters.plant}
            onChange={(e) => this.handleFilterChange('plant', e.target.value)}
            fullWidth
            sx={{ minWidth: 0 }}
          >
            {this.plantOptions.map((v) => (
              <MenuItem key={v} value={v}>{v}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="작업장(공정)"
            size="small"
            select
            value={filters.workplace}
            onChange={(e) => this.handleFilterChange('workplace', e.target.value)}
            fullWidth
            sx={{ minWidth: 0 }}
          >
            {this.workplaceOptions.map((v) => (
              <MenuItem key={v} value={v}>{v}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="라인(설비)"
            size="small"
            select
            value={filters.line}
            onChange={(e) => this.handleFilterChange('line', e.target.value)}
            fullWidth
            sx={{ minWidth: 0 }}
          >
            {this.lineOptions.map((v) => (
              <MenuItem key={v} value={v}>{v}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="품번"
            value={filters.partNo}
            onClick={() => this.setState({ itemCodeModalOpen: true })}
            size="small"
            variant="outlined"
            fullWidth
            sx={{ minWidth: 0, '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { background: '#f5f5f5' } } }}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="품명(검사항목)"
            value={filters.item}
            onClick={() => this.setState({ itemCodeModalOpen: true })}
            size="small"
            variant="outlined"
            fullWidth
            sx={{ minWidth: 0, '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { background: '#f5f5f5' } } }}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <InputAdornment position="end">
                  <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* 버튼 줄(아래, 우측 정렬) */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.clearFilters} size="large" color="secondary">
            필터 초기화
          </Button>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            size="large"
            sx={{ backgroundColor: this.props.themeHex, '&:hover': { backgroundColor: '#f57c00' } }}
            onClick={this.fetchData}
          >
            검색
          </Button>
        </Box>

        {/* 품목 선택 모달 */}
        <InspectionItemModal
          open={this.state.itemCodeModalOpen}
          onClose={() => this.setState({ itemCodeModalOpen: false })}
          onSelect={this.handleItemCodeSelect}
          selectedItemCode={filters.partNo}
          plant={filters.plant}
          worker={filters.workplace}
          line={filters.line}
          startDate={filters.start_date}
          endDate={filters.end_date}
        />
      </Paper>
    );
  };

  render() {
    const { rows, columns, loading, error } = this.state;
    return (
      <Box className={s.root}>
        {/* 상단 타이틀 */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ color: this.props.themeHex, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}
          >
            <FilterIcon /> 불량 데이터 내역
          </Typography>
          <Typography variant="body1" color="text.secondary">
            생산_불량 테이블(DB 컬럼 그대로)을 기간/조건으로 조회합니다.
          </Typography>
        </Box>

        {/* 필터 바 */}
        {this.renderFilterBar()}

        {/* 오류/로딩 */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
            <CircularProgress size={60} sx={{ color: this.props.themeHex }} />
          </Box>
        )}
        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Button variant="contained" onClick={this.fetchData}
              sx={{ backgroundColor: this.props.themeHex, '&:hover': { backgroundColor: '#f57c00' } }}>
              다시 시도
            </Button>
          </Box>
        )}

        {/* 데이터 그리드 */}
        {!loading && !error && (
          <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
            <Box sx={{ height: '100%', width: '100%' }}>
              <DataGrid
                rows={rows}
                columns={columns}
                pagination
                paginationMode="client"
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                disableRowSelectionOnClick
                density="compact"
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
                sx={{
                  '& .super-app-theme--header': { backgroundColor: this.props.themeHex, color: '#fff', fontWeight: 800 },
                  '& .super-app-theme--cell': { borderBottom: '1px solid #e0e0e0' },
                  '& .MuiDataGrid-row:hover': { backgroundColor: '#fff8f4' },
                  '& .MuiDataGrid-virtualScroller': { backgroundColor: '#fafafa' },
                  '& .MuiDataGrid-footerContainer': { borderTop: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' },
                  '& .MuiDataGrid-toolbarContainer': { backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', p: '8px 16px' },
                }}
              />
            </Box>
          </Paper>
        )}
      </Box>
    );
  }
}

export default connect(mapStateToProps)(DefectProcessGrid);
