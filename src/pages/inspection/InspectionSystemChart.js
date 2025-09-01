// import React, { Component } from "react";
// import config from "../../config";

// import {
//   Box,
//   Paper,
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
//   TextField,
//   Button,
//   InputAdornment,
//   FormControlLabel,
//   Switch,
// } from "@mui/material";
// import { Autocomplete } from "@mui/material";

// import {
//   Search as SearchIcon,
//   Clear as ClearIcon,
//   FilterList as FilterIcon,
//   ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon,
//   KeyboardArrowDown as KeyboardArrowDownIcon,
//   PieChart as PieChartIcon,
//   BarChart as BarChartIcon,
//   RestartAlt as ResetIcon,
//   FileDownload as DownloadIcon,
// } from "@mui/icons-material";

// import {
//   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip as RTooltip, ResponsiveContainer, Area, Line, ReferenceLine,
//   ComposedChart, Legend
// } from "recharts";

// import ItemCodeModal from "../common/ItemCodeModal";
// import s from "./InspectionSystemChart.module.scss";

// /** ---------- helpers ---------- */
// const palette = [
//   "#ff7043", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc",
//   "#26c6da", "#ec407a", "#7e57c2", "#8d6e63", "#26a69a"
// ];
// const mainColor = "#1e88e5";

// const fmtNum = (v, d = null) => {
//   const n = Number(v) || 0;
//   return d === null
//     ? n.toLocaleString()
//     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// };
// const fmtInt = (v) => fmtNum(v, 0);

// const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
// const today0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
// const lastOfMonth  = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// /** 주차 키/집계 */
// const wkKey = (ds) => {
//   const d = new Date(ds);
//   if (Number.isNaN(d.getTime())) return ds;
//   const jan1 = new Date(d.getFullYear(), 0, 1);
//   const days = Math.floor((d - jan1) / 86400000);
//   const w = Math.ceil((days + jan1.getDay() + 1) / 7);
//   return `${d.getFullYear()}-W${String(w).padStart(2, "0")}`;
// };
// const aggregateWeekly = (rows, keys) => {
//   const m = new Map();
//   rows.forEach(r => {
//     const k = wkKey(r.date);
//     const base = m.get(k) || { date: k };
//     keys.forEach(key => base[key] = (base[key] || 0) + (r[key] || 0));
//     m.set(k, base);
//   });
//   return [...m.values()];
// };

// /** 버튼 기준 화면 좌표 계산 → Popover/Menu에 anchorPosition으로 전달 */
// const getAnchorPos = (el) => {
//   if (!el) return null;
//   const r = el.getBoundingClientRect();
//   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// };

// /** 월요일 시작 주간 */
// const startOfWeek = (d) => {
//   const day = d.getDay();
//   const diff = (day === 0 ? -6 : 1) - day;
//   const s = new Date(d);
//   s.setDate(d.getDate() + diff);
//   return new Date(s.getFullYear(), s.getMonth(), s.getDate());
// };
// const endOfWeek = (d) => { const s = startOfWeek(d); return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6); };
// const getWeeksOfMonth = (year, month) => {
//   const first = new Date(year, month - 1, 1);
//   const last  = lastOfMonth(first);
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

// /** 차트 초기 필터 (올해 전체) */
// const getDefaultFilters = () => {
//   const y = new Date().getFullYear();
//   return {
//     start_date: iso(new Date(y, 0, 1)),
//     end_date: iso(new Date(y, 11, 31)),
//     factory: "",
//     process: "",
//     equipment: "",     // ✅ 설비 추가(옵션/필터 계단식)
//     partNo: "",
//     item: "",
//     inspType: "",
//     workType: "",
//     shiftType: "",     // ✅ 주야구분 필터 추가
//     topN: 5,
//   };
// };

// class InspectionSystemChart extends Component {
//   state = {
//     filters: getDefaultFilters(),

//     // datasets
//     kpis: { total: 0, partKinds: 0, itemKinds: 0, dailyAvg: 0, prodSum: 0, intensityPerK: 0, byInspType: [], byWorkType: [] },
//     byItem: [], trend: [], stacked: [], byPart: [], byProcess: [], machines: [],
//     throughput: [], shift: [], momentum: [],
//     weekdayProfile: [], machIntensity: [], machShiftImbalance: [], anomalyDays: [],

//     // 옵션
//     factories: [], processes: [], equipments: [], parts: [], items: [],
//     optionsLoading: false,

//     // UI
//     loading: false, error: "",
//     showStacked: true, showWeeklyTrend: false, showWeeklyThroughput: false, showWeeklyShift: false,

//     // 프리셋 상태/앵커
//     selectedYear: new Date().getFullYear(),
//     selectedMonth: new Date().getMonth() + 1,
//     yearAnchorPos: null, monthAnchorPos: null, weekAnchorPos: null, customAnchorPos: null,

//     // 연도 목록
//     years: [],

//     // 모달
//     itemCodeModalOpen: false,
//   };

//   componentDidMount() {
//     const saved = localStorage.getItem("inspectionFilters");
//     if (saved) {
//       try { this.setState({ filters: { ...getDefaultFilters(), ...JSON.parse(saved) } }); } catch {}
//     }
//     this.bootstrap();
//   }

//   /** --------- API ---------- */
//   post = async (path, body) => {
//     const headers = { "Content-Type": "application/json" };
//     const res = await fetch(`${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`, {
//       method: "POST", headers, body: JSON.stringify(body || {})
//     });
//     if (!res.ok) {
//       const t = await res.text().catch(()=> "");
//       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
//     }
//     const json = await res.json();
//     return json.data || [];
//   };

//   bootstrap = async () => {
//     await this.loadYears();
//     await this.loadOptions();
//     this.loadAll();
//   };

//   /** 옵션 로드: 공장/공정/설비/품번/검사항목 */
//   loadOptions = async () => {
//     const { filters } = this.state;
//     this.setState({ optionsLoading: true });
//     try {
//       const [factories, processes, equipments, parts, items] = await Promise.all([
//         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
//         this.post("/options/processes", { ...filters }),
//         this.post("/options/equipments", { ...filters }), // ✅ 설비
//         this.post("/options/parts",     { ...filters }),
//         this.post("/options/items",     { ...filters }),
//       ]);
//       this.setState({ factories, processes, equipments, parts, items, optionsLoading: false });
//     } catch (e) {
//       console.error(e);
//       this.setState({ optionsLoading: false });
//     }
//   };

//   /** 연도 옵션 (서버 없으면 fallback) */
//   loadYears = async () => {
//     try {
//       const raw = await this.post("/options/years", { ...this.state.filters });
//       let years = Array.isArray(raw) ? raw.map(y => Number(y)).filter(Boolean) : [];
//       if (!years.length) throw new Error("no years");
//       years.sort((a,b) => b - a);
//       this.setState({ years, selectedYear: years[0] });
//     } catch {
//       const y = new Date().getFullYear();
//       const years = [y, y-1, y-2, y-3, y-4];
//       this.setState({ years, selectedYear: y });
//     }
//   };

//   /** 필터 변경: 계단식 초기화 + 옵션/데이터 새로고침 */
//   handleFilterChange = async (field, value) => {
//     this.setState(prev => {
//       const f = { ...prev.filters, [field]: value };
//       if (field === "factory") { f.process = ""; f.equipment = ""; f.partNo = ""; f.item = ""; }
//       else if (field === "process") { f.equipment = ""; f.partNo = ""; f.item = ""; }
//       else if (field === "equipment") { f.partNo = ""; f.item = ""; }
//       else if (field === "topN") { f.topN = Number(value) || 5; }
//       return { filters: f };
//     }, async () => {
//       await this.loadOptions();
//       await this.loadAll();
//     });
//   };

//   /** 날짜 프리셋/범위 */
//   setDateRange = async (start, end) => {
//     const start_date = iso(start);
//     const end_date   = iso(end);
//     this.setState(prev => ({ filters: { ...prev.filters, start_date, end_date } }), async () => {
//       try { localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters)); } catch {}
//       await this.loadOptions();
//       this.loadAll();
//     });
//   };
//   applyToday = () => { const t = today0(); this.setDateRange(t, t); };
//   selectYear = (y) => { const s = new Date(y, 0, 1); const e = new Date(y, 11, 31); this.setState({ selectedYear: y, yearAnchorPos: null }); this.setDateRange(s, e); };
//   selectMonth = (m) => { const y = this.state.selectedYear; const s = new Date(y, m - 1, 1); const e = lastOfMonth(s); this.setState({ monthAnchorPos: null, selectedMonth: m }); this.setDateRange(s, e); };
//   selectWeek = (w) => { this.setState({ weekAnchorPos: null }); this.setDateRange(w.start, w.end); };

//   /** 전체 초기화(올해) */
//   resetToThisYear = async () => {
//     const y = new Date().getFullYear();
//     const filters = { ...getDefaultFilters(), start_date: iso(new Date(y,0,1)), end_date: iso(new Date(y,11,31)) };
//     this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth()+1 }, async () => {
//       try { localStorage.removeItem("inspectionFilters"); } catch {}
//       await this.loadOptions();
//       this.loadAll();
//     });
//   };

//   /** 데이터 일괄 로드 */
//   loadAll = async () => {
//     const { filters } = this.state;
//     try { localStorage.setItem("inspectionFilters", JSON.stringify(filters)); } catch {}
//     this.setState({ loading: true, error: "" });
//     try {
//       const dashboard = await this.post("/dashboard", filters);
//       this.setState({
//         kpis:                  dashboard.kpis || {},
//         byItem:                dashboard.byItem || [],
//         trend:                 dashboard.trend || [],
//         stacked:               dashboard.stacked || [],
//         byPart:                dashboard.byPart || [],
//         byProcess:             dashboard.byProcess || [],
//         machines:              dashboard.machines || [],
//         throughput:            dashboard.throughput || [],
//         shift:                 dashboard.shift || [],
//         momentum:              dashboard.momentum || [],
//         weekdayProfile:        dashboard.weekdayProfile || [],
//         machIntensity:         dashboard.machIntensity || [],
//         machShiftImbalance:    dashboard.machShiftImbalance || [],
//         anomalyDays:           dashboard.anomalyDays || [],
//         loading: false
//       });
//     } catch (e) {
//       console.error(e);
//       this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
//     }
//   };

//   /** CSV 내보내기 */
//   exportCsv = () => {
//     const { byItem, trend, byPart, byProcess, machines, throughput } = this.state;
//     const rows = [
//       ["[Pareto] item", "qty"], ...byItem.map(r => [r.item, r.qty]), [],
//       ["[Trend] date", "count"], ...trend.map(d => [d.date, d.count]), [],
//       ["[Top Part] partNo", "qty"], ...byPart.map(d => [d.partNo, d.qty]), [],
//       ["[Top Process] process", "qty"], ...byProcess.map(d => [d.proc, d.qty]), [],
//       ["[Top Machine] machine", "qty"], ...machines.map(d => [d.machine, d.qty]), [],
//       ["[Throughput] date", "prod", "count", "intensity_per_1k"], ...throughput.map(d => [d.date, d.prod, d.count, d.intensity]),
//     ];
//     const csv = rows.map(r => r.join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url; a.download = `inspection_charts_${Date.now()}.csv`; a.click();
//     URL.revokeObjectURL(url);
//   };

//   /** 품번/품명(검사항목) — ItemCodeModal 사용 */
//   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
//   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
//   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
//     this.setState(
//       (prev) => ({
//         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
//         itemCodeModalOpen: false,
//       }),
//       () => { this.loadOptions(); this.loadAll(); }
//     );
//   };

//   /** ----- tick formatter ----- */
//   formatTick = (v, weekly) => {
//     const s = String(v || "");
//     if (weekly) {
//       const wk = s.split("-W")[1] || s;
//       return `W${wk}`;
//     }
//     return s.length >= 10 ? s.slice(5) : s;
//   };

//   /** ---------- 상단 필터(그리드와 동일 UI) ---------- */
//   renderFilterBar = () => {
//     const { filters, factories, processes, equipments, itemCodeModalOpen } = this.state;

//     const now = today0();
//     const thisYear  = now.getFullYear();
//     const thisMonth = now.getMonth() + 1;
//     const thisWeek  = { start: startOfWeek(now), end: endOfWeek(now) };
//     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

//     // 활성 프리셋 판정
//     const sd = new Date(filters.start_date), ed = new Date(filters.end_date), t = today0();
//     const isToday = sd.getTime() === t.getTime() && ed.getTime() === t.getTime();
//     const isYear  = sd.getFullYear() === ed.getFullYear()
//                  && sd.getMonth() === 0 && sd.getDate() === 1
//                  && ed.getMonth() === 11 && ed.getDate() === 31;
//     const isMonth = sd.getFullYear() === ed.getFullYear()
//                  && sd.getMonth() === ed.getMonth()
//                  && sd.getDate() === 1
//                  && ed.getDate() === lastOfMonth(sd).getDate();

//     return (
//       <Paper elevation={3} sx={{ p:3, mb:3, borderRadius:2 }}>
//         <CardHeader
//           title={
//             <Typography variant="h6" sx={{ display:'flex', alignItems:'center', gap:1, color:'white' }}>
//               <FilterIcon /> 검색 조건
//             </Typography>
//           }
//           action={
//             <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
//               {/* 연간 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e)=>this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
//               >
//                 연간
//               </Button>
//               <Menu
//                 open={!!this.state.yearAnchorPos}
//                 onClose={()=>this.setState({ yearAnchorPos: null })}
//                 anchorReference="anchorPosition"
//                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
//               >
//                 <MenuItem dense onClick={()=>this.selectYear(thisYear)}>올해</MenuItem>
//                 {this.state.years.map((y)=>(
//                   <MenuItem key={y} dense onClick={()=>this.selectYear(y)}>{y}년</MenuItem>
//                 ))}
//               </Menu>

//               {/* 월간 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e)=>this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
//               >
//                 월간
//               </Button>
//               <Menu
//                 open={!!this.state.monthAnchorPos}
//                 onClose={()=>this.setState({ monthAnchorPos: null })}
//                 anchorReference="anchorPosition"
//                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
//               >
//                 <MenuItem dense onClick={()=>{ this.setState({ selectedYear: thisYear }, ()=>this.selectMonth(thisMonth)); }}>
//                   이번달
//                 </MenuItem>
//                 {Array.from({length:12},(_,i)=>i+1).map((m)=>(
//                   <MenuItem key={m} dense onClick={()=>this.selectMonth(m)}>{this.state.selectedYear}년 {m}월</MenuItem>
//                 ))}
//               </Menu>

//               {/* 주간 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e)=>this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
//               >
//                 주간
//               </Button>
//               <Menu
//                 open={!!this.state.weekAnchorPos}
//                 onClose={()=>this.setState({ weekAnchorPos: null })}
//                 anchorReference="anchorPosition"
//                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
//               >
//                 <MenuItem dense onClick={()=>this.selectWeek(thisWeek)}>
//                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
//                 </MenuItem>
//                 {weeks.map((w,i)=>(
//                   <MenuItem key={i} dense onClick={()=>this.selectWeek(w)}>
//                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
//                   </MenuItem>
//                 ))}
//               </Menu>

//               {/* 오늘 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 onClick={this.applyToday}
//                 sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
//               >
//                 오늘
//               </Button>

//               {/* 직접입력 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e)=>this.setState({ customAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
//               >
//                 직접입력
//               </Button>
//               <Popover
//                 open={!!this.state.customAnchorPos}
//                 onClose={()=>this.setState({ customAnchorPos: null })}
//                 anchorReference="anchorPosition"
//                 anchorPosition={this.state.customAnchorPos || { top: 0, left: 0 }}
//                 PaperProps={{ sx:{ p:1.5, borderRadius:2 } }}
//               >
//                 <Box sx={{ display:'grid', gap:1, minWidth: 260 }}>
//                   <TextField size="small" label="시작일" type="date"
//                     value={filters.start_date}
//                     onChange={(e)=>this.handleFilterChange("start_date", e.target.value)}
//                     InputLabelProps={{ shrink: true }}
//                   />
//                   <TextField size="small" label="종료일" type="date"
//                     value={filters.end_date}
//                     onChange={(e)=>this.handleFilterChange("end_date", e.target.value)}
//                     InputLabelProps={{ shrink: true }}
//                   />
//                 </Box>
//               </Popover>

//               {/* 구분자 & 기간선택 직접 입력 */}
//               <Typography sx={{ color:'white', opacity:0.8, mx:0.5 }}>|</Typography>
//               <Typography sx={{ color:'white' }}>기간선택</Typography>
//               <TextField
//                 type="date"
//                 value={filters.start_date}
//                 onChange={(e)=>this.handleFilterChange("start_date", e.target.value)}
//                 size="small" variant="outlined"
//                 sx={{ backgroundColor:'white', borderRadius:1, minWidth:150 }}
//                 InputLabelProps={{ shrink: true }}
//               />
//               <Typography sx={{ color:'white' }}>~</Typography>
//               <TextField
//                 type="date"
//                 value={filters.end_date}
//                 onChange={(e)=>this.handleFilterChange("end_date", e.target.value)}
//                 size="small" variant="outlined"
//                 sx={{ backgroundColor:'white', borderRadius:1, minWidth:150 }}
//                 InputLabelProps={{ shrink: true }}
//               />

//               {/* 확장/축소 */}
//               <IconButton onClick={()=>this.setState(prev=>({ filterExpanded: !prev.filterExpanded }))} sx={{ color:'white' }}>
//                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//               </IconButton>
//             </Box>
//           }
//           sx={{ backgroundColor:'#ff8f00', color:'white', borderRadius:1, mb:2 }}
//         />

//         {/* === 1행: 공장/공정/설비/품번/품명 === */}
//         <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(160px, 1fr))', gap:2, mb:1 }}>
//           <Autocomplete size="small" options={factories} value={filters.factory || null}
//             onChange={(_, v)=>this.handleFilterChange('factory', v || '')}
//             renderInput={(params)=><TextField {...params} label="공장" />} clearOnEscape />
//           <Autocomplete size="small" options={processes} value={filters.process || null}
//             onChange={(_, v)=>this.handleFilterChange('process', v || '')}
//             renderInput={(params)=><TextField {...params} label="작업장(공정)" />} clearOnEscape />
//           <Autocomplete size="small" options={equipments} value={filters.equipment || null}
//             onChange={(_, v)=>this.handleFilterChange('equipment', v || '')}
//             renderInput={(params)=><TextField {...params} label="라인(설비)" />} clearOnEscape />

//           <TextField fullWidth label="품번" value={filters.partNo} onClick={this.openItemCodeModal}
//             size="small" variant="outlined"
//             InputProps={{ readOnly:true, style:{cursor:'pointer'},
//               endAdornment:(<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color:'text.secondary' }}/></InputAdornment>) }}
//             sx={{ '& .MuiInputBase-root':{ cursor:'pointer', '&:hover':{ backgroundColor:'#f5f5f5' } }}} />

//           <TextField fullWidth label="품명(검사항목)" value={filters.item} onClick={this.openItemCodeModal}
//             size="small" variant="outlined"
//             InputProps={{ readOnly:true, style:{cursor:'pointer'},
//               endAdornment:(<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color:'text.secondary' }}/></InputAdornment>) }}
//             sx={{ '& .MuiInputBase-root':{ cursor:'pointer', '&:hover':{ backgroundColor:'#f5f5f5' } }}} />
//         </Box>

//         {/* 기본 나머지 필터 */}
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField fullWidth label="검사구분" value={filters.inspType} onChange={(e)=>this.handleFilterChange('inspType', e.target.value)} size="small" variant="outlined" />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField fullWidth label="작업구분" value={filters.workType} onChange={(e)=>this.handleFilterChange('workType', e.target.value)} size="small" variant="outlined" />
//           </Grid>
//         </Grid>

//         {/* 확장 필터 */}
//         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
//           <Divider sx={{ my: 2 }} />
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6} md={3}>
//               <TextField fullWidth label="주야구분" value={filters.shiftType} onChange={(e)=>this.handleFilterChange('shiftType', e.target.value)} size="small" variant="outlined" />
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <TextField fullWidth label="Top N" type="number" value={filters.topN ?? 5} onChange={(e)=>this.handleFilterChange('topN', e.target.value)} size="small" variant="outlined" />
//             </Grid>
//           </Grid>
//         </Collapse>

//         {/* 버튼 */}
//         <Grid item xs={12} sx={{ mt: 2 }}>
//           <Box sx={{ display:'flex', gap:2, justifyContent:'flex-end' }}>
//             <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
//               필터 초기화
//             </Button>
//             <Button variant="contained" startIcon={<SearchIcon />} size="large"
//               sx={{ backgroundColor:'#ff8f00', '&:hover':{ backgroundColor:'#f57c00' } }}
//               onClick={()=>{ this.loadOptions(); this.loadAll(); }}>
//               검색
//             </Button>
//             <Button variant="outlined" startIcon={<DownloadIcon />} size="large" onClick={this.exportCsv}>
//               CSV 내보내기
//             </Button>
//           </Box>
//         </Grid>

//         {/* 품목 코드/명 선택 모달 */}
//         <ItemCodeModal
//           open={itemCodeModalOpen}
//           onClose={this.closeItemCodeModal}
//           onSelect={this.handleItemCodeSelect}
//           selectedItemCode={filters.partNo}
//           plant={filters.factory}
//           worker={filters.process}
//           line={filters.equipment}
//         />
//       </Paper>
//     );
//   };

//   /** ---------- charts & tables (원래 로직 유지) ---------- */

//   KPI = ({ title, value, color, sub }) => (
//     <Paper className={s.section} sx={{ flex: 1, height: '100%' }}>
//       <Box sx={{ p: 2 }}>
//         <Typography className={s.kpiTitle} sx={{ color, fontSize: 13, fontWeight: 800 }}>{title}</Typography>
//         <Typography className={s.kpiValue} sx={{ color: '#263238', fontSize: 28, fontWeight: 900 }}>{value}</Typography>
//         <Typography className={s.kpiSub} sx={{ fontSize: 12, fontWeight: 500, color:'#8694a5' }}>{sub}</Typography>
//       </Box>
//     </Paper>
//   );

//   renderKpis = () => {
//     const { kpis } = this.state;
//     const cards = [
//       { title: "총 검사건수", value: fmtInt(kpis.total), sub: "필터 조건 내", color: "#1e88e5" },
//       { title: "품번 종류", value: fmtInt(kpis.partKinds), sub: "고유 품번 수", color: "#43a047" },
//       { title: "검사항목 종류", value: fmtInt(kpis.itemKinds), sub: "고유 항목 수", color: "#8e24aa" },
//       { title: "일 평균 검사", value: fmtNum(kpis.dailyAvg, 2), sub: "보고일 기준", color: "#ff7043" },
//       { title: "총 생산수량", value: fmtNum(kpis.prodSum, 0), sub: "해당 기간 합계", color: "#00897b" },
//       { title: "검사강도(1k 생산당)", value: fmtNum(kpis.intensityPerK, 2), sub: "검사건수 / (생산/1000)", color: "#6d4c41" },
//     ];
//     return (
//       <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
//         {cards.map((c, i) => (
//           <Grid item xs={12} sm={6} md={3} lg={2} key={i} sx={{ display: 'flex' }}>
//             <this.KPI {...c} />
//           </Grid>
//         ))}
//       </Grid>
//     );
//   };

//   renderDonut = () => {
//     const { kpis, loading } = this.state;
//     const data = (kpis.byInspType || []).map((d, i) => ({ name: d.type || "미지정", value: d.qty || 0, color: palette[i % palette.length] }));
//     const total = data.reduce((s, d) => s + d.value, 0);
//     return (
//       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             <PieChartIcon /> 검사구분 분포
//           </Typography>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
//             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//           </Box>
//         ) : (
//           <>
//             <Box sx={{ flex: 1, minHeight: 280, position: "relative" }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
//                     {data.map((d, i) => <Cell key={i} fill={d.color} />)}
//                   </Pie>
//                   <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <Box className={s.donutCenter}>
//                 <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
//                 <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#263238" }}>{fmtInt(total)}</Typography>
//               </Box>
//             </Box>
//             <Box className={s.legendRow}>
//               {data.map(d => (
//                 <span key={d.name} className={s.legendItem}>
//                   <span className={s.legendDot} style={{ background: d.color }} />
//                   {d.name}
//                 </span>
//               ))}
//             </Box>
//           </>
//         )}
//       </Paper>
//     );
//   };

//   renderPareto = () => {
//     const { byItem, loading } = this.state;
//     const total = byItem.reduce((s, x) => s + (x.qty || 0), 0) || 1;
//     let cum = 0;
//     const data = byItem.map(d => { cum += d.qty || 0; const rate = Math.min(100, (cum / total) * 100); return { ...d, cumRate: Math.round(rate * 100) / 100 }; });
//     return (
//       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             <BarChartIcon /> 검사항목 파레토
//           </Typography>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
//             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//           </Box>
//         ) : (
//           <Box sx={{ flex: 1, minHeight: 280 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={data}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis dataKey="item" axisLine={false} tickLine={false} />
//                 <YAxis yAxisId="left" axisLine={false} tickLine={false} />
//                 <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
//                 <Legend />
//                 <RTooltip formatter={(v, name, { payload }) => {
//                   if (name === "수량") return [fmtInt(v), "수량"];
//                   if (name === "누적(%)") return [`${(payload.cumRate ?? 0).toFixed(2)}%`, "누적(%)"];
//                   return [v, name];
//                 }}/>
//                 <Bar yAxisId="left" dataKey="qty" name="수량" radius={[4, 4, 0, 0]}>
//                   {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//                 </Bar>
//                 <Line yAxisId="right" type="monotone" dataKey="cumRate" name="누적(%)" stroke="#90a4ae" dot={false} />
//                 <ReferenceLine yAxisId="right" y={80} stroke={mainColor} strokeDasharray="4 4" />
//               </BarChart>
//             </ResponsiveContainer>
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   renderTrend = () => {
//     const { trend, stacked, showStacked, showWeeklyTrend, loading } = this.state;
//     const map = new Map();
//     trend.forEach(r => map.set(r.date, { ...r }));
//     stacked.forEach(r => { const base = map.get(r.date) || { date: r.date, count: 0 }; map.set(r.date, { ...base, auto: r.auto, self: r.self, other: r.other }); });
//     const mergedDaily = Array.from(map.values()).sort((a,b) => (a.date > b.date ? 1 : -1));
//     const merged = showWeeklyTrend ? aggregateWeekly(mergedDaily, ["count","auto","self","other"]) : mergedDaily;
//     return (
//       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             검사 건수 추이
//           </Typography>
//           <Box>
//             <FormControlLabel
//               control={<Switch size="small" checked={showWeeklyTrend} onChange={(e) => this.setState({ showWeeklyTrend: e.target.checked })} />}
//               label="주간 합계 보기"
//             />
//             <FormControlLabel
//               control={<Switch size="small" checked={showStacked} onChange={(e) => this.setState({ showStacked: e.target.checked })} />}
//               label="검사구분 같이 보기"
//             />
//           </Box>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
//             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//           </Box>
//         ) : (
//           <Box sx={{ height: 320 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <ComposedChart data={merged} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }} tickFormatter={(v) => this.formatTick(v, showWeeklyTrend)} />
//                 <YAxis yAxisId="left" />
//                 <RTooltip />
//                 <Legend verticalAlign="top" height={32} iconType="circle" iconSize={14}
//                         wrapperStyle={{ fontWeight: 700, letterSpacing: ".2px" }}
//                         formatter={(value) => <span style={{ fontWeight: 700 }}>{value}</span>} />
//                 <Area yAxisId="left" type="monotone" dataKey="count" name="검사건수" stroke={mainColor} fill="rgba(30,136,229,.15)" />
//                 {showStacked && (
//                   <>
//                     <Bar dataKey="auto" name="자동검사" yAxisId="left" fill="rgba(255,112,67,.55)" barSize={10} />
//                     <Bar dataKey="self" name="자주검사" yAxisId="left" fill="rgba(66,165,245,.55)" barSize={10} />
//                     <Bar dataKey="other" name="기타" yAxisId="left" fill="rgba(171,71,188,.55)" barSize={10} />
//                   </>
//                 )}
//               </ComposedChart>
//             </ResponsiveContainer>
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   renderThroughput = () => {
//     const { throughput, showWeeklyThroughput, loading } = this.state;
//     const thr = showWeeklyThroughput ? aggregateWeekly(throughput, ["prod","count"]) : throughput;
//     const thrReady = thr.map(r => ({ ...r, intensity: r.prod > 0 ? +(r.count/(r.prod/1000)).toFixed(3) : 0 }));
//     return (
//       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             생산-검사 스루풋 & 정규화(1k 생산당)
//           </Typography>
//           <FormControlLabel
//             control={<Switch size="small" checked={showWeeklyThroughput} onChange={(e)=>this.setState({ showWeeklyThroughput: e.target.checked })} />}
//             label="주간 합계 보기"
//           />
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
//             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//           </Box>
//         ) : (
//           <Box sx={{ height: 320 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <ComposedChart data={thrReady} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }} tickFormatter={(v) => this.formatTick(v, showWeeklyThroughput)} />
//                 <YAxis yAxisId="left" />
//                 <YAxis yAxisId="right" orientation="right" />
//                 <Legend verticalAlign="top" height={32} />
//                 <RTooltip formatter={(v, n) => {
//                   if (n === "생산합") return [fmtInt(v), "생산합"];
//                   if (n === "검사건수") return [fmtInt(v), "검사건수"];
//                   if (n === "정규화강도") return [fmtNum(v,3), "정규화강도(1k당)"];
//                   return [v, n];
//                 }}/>
//                 <Bar  yAxisId="left"  dataKey="prod"       name="생산합"      fill="rgba(76,175,80,.55)"  barSize={12} />
//                 <Line yAxisId="left"  type="monotone"      dataKey="count"     name="검사건수"    stroke="#1565c0" dot={false} />
//                 <Line yAxisId="right" type="monotone"      dataKey="intensity"  name="정규화강도"  stroke="#6d4c41" dot={false} />
//               </ComposedChart>
//             </ResponsiveContainer>
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   renderTopPart = () => {
//     const { byPart, loading } = this.state;
//     return (
//       <Paper className={s.section} sx={{ flex: 1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             품번 Top {this.state.filters.topN}
//           </Typography>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
//             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//           </Box>
//         ) : (
//           <Box sx={{ height: 280 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={byPart} layout="vertical" margin={{ left: 40 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis type="number" />
//                 <YAxis type="category" dataKey="partNo" width={160} />
//                 <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
//                 <Bar dataKey="qty" name="검사건수">
//                   {byPart.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   renderTopProcess = () => {
//     const { byProcess, loading } = this.state;
//     return (
//       <Paper className={s.section} sx={{ flex: 1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             공정 Top {this.state.filters.topN}
//           </Typography>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
//             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//           </Box>
//         ) : (
//           <Box sx={{ height: 280 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={byProcess}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis dataKey="proc" />
//                 <YAxis />
//                 <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
//                 <Bar dataKey="qty" name="검사건수">
//                   {byProcess.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   renderTopMachine = () => {
//     const { machines, loading } = this.state;
//     return (
//       <Paper className={s.section} sx={{ flex: 1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             설비 Top {this.state.filters.topN}
//           </Typography>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
//             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//           </Box>
//         ) : (
//           <Box sx={{ height: 280 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={machines} layout="vertical" margin={{ left: 40 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis type="number" />
//                 <YAxis type="category" dataKey="machine" width={160} />
//                 <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
//                 <Bar dataKey="qty" name="검사건수">
//                   {machines.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   renderShift = () => {
//     const { shift, showWeeklyShift, loading } = this.state;
//     const shiftData = showWeeklyShift ? aggregateWeekly(shift, ["day","night"]) : shift;
//     const totalDay = shift.reduce((s, r) => s + (r.day || 0), 0);
//     const totalNight = shift.reduce((s, r) => s + (r.night || 0), 0);
//     const donut = [{ name: "주간", value: totalDay, color: "#42a5f5" }, { name: "야간", value: totalNight, color: "#ab47bc" }];

//     return (
//       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             주/야 구분 추이 & 분포
//           </Typography>
//           <FormControlLabel
//             control={<Switch size="small" checked={showWeeklyShift} onChange={(e)=>this.setState({ showWeeklyShift: e.target.checked })} />}
//             label="주간 합계 보기"
//           />
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
//             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//           </Box>
//         ) : (
//           <Grid container spacing={2}>
//             <Grid item xs={12} md={8}>
//               <Box sx={{ height: 280 }}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <ComposedChart data={shiftData} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                     <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }}
//                           tickFormatter={(v) => this.formatTick(v, showWeeklyShift)} />
//                     <YAxis />
//                     <Legend verticalAlign="top" height={32} />
//                     <RTooltip />
//                     <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" barSize={10} />
//                     <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" barSize={10} />
//                   </ComposedChart>
//                 </ResponsiveContainer>
//               </Box>
//             </Grid>
//             <Grid item xs={12} md={4}>
//               <Box sx={{ height: 280, position: "relative" }}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={donut} innerRadius={55} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={2}>
//                       {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
//                     </Pie>
//                     <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
//                   </PieChart>
//                 </ResponsiveContainer>
//                 <Box className={s.donutCenter}>
//                   <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
//                   <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#263238" }}>{fmtInt(totalDay + totalNight)}</Typography>
//                 </Box>
//               </Box>
//             </Grid>
//           </Grid>
//         )}
//       </Paper>
//     );
//   };

//   renderWeekdayProfile = () => {
//     const { weekdayProfile, loading } = this.state;
//     const labels = {1:"일",2:"월",3:"화",4:"수",5:"목",6:"금",7:"토"};
//     const data = (weekdayProfile || []).map(r => ({ name: labels[r.dow] || r.dow, day: r.day, night: r.night, total: r.total }));
//     return (
//       <Paper className={s.section} sx={{ flex:1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             요일 패턴(주/야)
//           </Typography>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
//             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//           </Box>
//         ) : (
//           <Box sx={{ height: 280 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <ComposedChart data={data}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Legend />
//                 <RTooltip />
//                 <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" />
//                 <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" />
//                 <Line type="monotone" dataKey="total" name="총계" stroke="#263238" dot={false} />
//               </ComposedChart>
//             </ResponsiveContainer>
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   renderMachIntensity = () => {
//     const { machIntensity, loading } = this.state;
//     const data = machIntensity;
//     return (
//       <Paper className={s.section} sx={{ flex:1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             설비별 검사강도(1k 생산당)
//           </Typography>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
//             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//           </Box>
//         ) : (
//           <Box sx={{ height: 280 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis type="number" />
//                 <YAxis type="category" dataKey="machine" width={160} />
//                 <Legend />
//                 <RTooltip formatter={(v, n) => (n === "검사강도" ? [fmtNum(v,3), "검사강도(1k)"] : [fmtInt(v), n])} />
//                 <Bar dataKey="intensity" name="검사강도">
//                   {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   renderMachShiftImbalance = () => {
//     const { machShiftImbalance, loading } = this.state;
//     const data = machShiftImbalance;
//     return (
//       <Paper className={s.section} sx={{ flex:1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             설비별 주/야 불균형 Top {this.state.filters.topN}
//           </Typography>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
//             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//           </Box>
//         ) : (
//           <Box sx={{ height: 280 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                 <XAxis type="number" />
//                 <YAxis type="category" dataKey="machine" width={160} />
//                 <Legend />
//                 <RTooltip formatter={(v, n) => {
//                   if (n === "불균형") return [`${fmtNum(v*100,1)}%`, "불균형(|주-야|/총)"];
//                   if (n === "야/주 비율") return [v, "야/주 비율"];
//                   return [fmtInt(v), n];
//                 }} />
//                 <Bar dataKey="imbalance" name="불균형">
//                   {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//                 </Bar>
//               </BarChart>
//             </ResponsiveContainer>
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   renderAnomalyTable = () => {
//     const rows = this.state.anomalyDays || [];
//     return (
//       <Paper className={s.section} sx={{ flex:1, display:'flex', flexDirection:'column' }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ fontWeight: 800 }}>
//             일간 스파이크 알림 (z≥2.0)
//           </Typography>
//         </Box>
//         <Box sx={{
//           maxHeight: 340, borderRadius: 1, overflow: "auto",
//           "& .stickyHead": { position:"sticky", top:0, backgroundColor: mainColor, color:"#fff", zIndex:1, fontWeight:800, p:1 }
//         }}>
//           <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)' }}>
//             <Box className="stickyHead">일자</Box>
//             <Box className="stickyHead" sx={{ textAlign:'right' }}>검사건수</Box>
//             <Box className="stickyHead" sx={{ textAlign:'right' }}>평균</Box>
//             <Box className="stickyHead" sx={{ textAlign:'right' }}>표준편차</Box>
//             <Box className="stickyHead" sx={{ textAlign:'right' }}>z-score</Box>
//           </Box>
//           {rows.map((r,i)=>(
//             <Box key={i} sx={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', p:1, "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
//               <Box>{r.date}</Box>
//               <Box sx={{ textAlign:'right' }}>{fmtInt(r.count)}</Box>
//               <Box sx={{ textAlign:'right' }}>{fmtNum(r.avg,2)}</Box>
//               <Box sx={{ textAlign:'right' }}>{fmtNum(r.std,2)}</Box>
//               <Box sx={{ textAlign:'right', fontWeight:900, color:"#d84315" }}>{fmtNum(r.z,2)}</Box>
//             </Box>
//           ))}
//           {rows.length===0 && (
//             <Box sx={{ p:2, textAlign:'center' }}>이상치가 없습니다.</Box>
//           )}
//         </Box>
//       </Paper>
//     );
//   };

//   renderDailyTable = () => {
//     const map = new Map();
//     this.state.trend.forEach(r => map.set(r.date, { date: r.date, count: r.count }));
//     this.state.stacked.forEach(r => {
//       const row = map.get(r.date) || { date: r.date, count: 0 };
//       map.set(r.date, { ...row, auto: r.auto, self: r.self, other: r.other });
//     });
//     const all = Array.from(map.values()).sort((a,b) => (a.date > b.date ? 1 : -1));
//     const rows = all.slice(-7).reverse();

//     return (
//       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ fontWeight: 800 }}>최근 7일 일자별 요약</Typography>
//         </Box>
//         <Box sx={{
//           maxHeight: 380, borderRadius: 1, overflow: "auto",
//           "& .stickyHead": { position:"sticky", top:0, backgroundColor: mainColor, color:"#fff", zIndex:1, fontWeight:800, p:1 }
//         }}>
//           <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)' }}>
//             <Box className="stickyHead">보고일</Box>
//             <Box className="stickyHead" sx={{ textAlign:'right' }}>총 검사</Box>
//             <Box className="stickyHead" sx={{ textAlign:'right' }}>자동검사</Box>
//             <Box className="stickyHead" sx={{ textAlign:'right' }}>자주검사</Box>
//             <Box className="stickyHead" sx={{ textAlign:'right' }}>기타</Box>
//           </Box>
//           {rows.map((r,i)=>(
//             <Box key={i} sx={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', p:1, "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
//               <Box>{r.date}</Box>
//               <Box sx={{ textAlign:'right' }}>{fmtInt(r.count)}</Box>
//               <Box sx={{ textAlign:'right' }}>{fmtInt(r.auto || 0)}</Box>
//               <Box sx={{ textAlign:'right' }}>{fmtInt(r.self || 0)}</Box>
//               <Box sx={{ textAlign:'right' }}>{fmtInt(r.other || 0)}</Box>
//             </Box>
//           ))}
//           {rows.length === 0 && (
//             <Box sx={{ p:2, textAlign:'center' }}>데이터가 없습니다.</Box>
//           )}
//         </Box>
//       </Paper>
//     );
//   };

//   render() {
//     const { loading, error } = this.state;

//     return (
//       <Box className={s.root}>
//         {/* 필터 바 (그리드 동일 UI) */}
//         {this.renderFilterBar()}

//         {/* 에러/로딩 핸들링 */}
//         {error && (
//           <Box sx={{ mb:2 }}>
//             <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>
//             <Button variant="contained" onClick={this.loadAll}
//               sx={{ backgroundColor:'#ff8f00', '&:hover':{ backgroundColor:'#f57c00' } }}>
//               다시 시도
//             </Button>
//           </Box>
//         )}

//         {/* KPI */}
//         {this.renderKpis()}

//         {/* 1행: 검사구분 도넛 / 파레토 */}
//         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
//           <Grid item xs={12} md={5} sx={{ display: 'flex', minWidth: 0  }}>{this.renderDonut()}</Grid>
//           <Grid item xs={12} md={7} sx={{ display: 'flex', minWidth: 0  }}>{this.renderPareto()}</Grid>
//         </Grid>

//         {/* 2행: 검사 추이 / 스루풋 */}
//         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
//           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTrend()}</Grid>
//           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderThroughput()}</Grid>
//         </Grid>

//         {/* 3행: 품번 / 공정 / 설비 TopN */}
//         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
//           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopPart()}</Grid>
//           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopProcess()}</Grid>
//           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopMachine()}</Grid>
//         </Grid>

//         {/* 4행: 주/야 / 스파이크 */}
//         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
//           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderShift()}</Grid>
//           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderAnomalyTable()}</Grid>
//         </Grid>

//         {/* 5행: 요일 / 설비강도 / 설비 불균형 */}
//         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
//           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderWeekdayProfile()}</Grid>
//           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderMachIntensity()}</Grid>
//           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderMachShiftImbalance()}</Grid>
//         </Grid>

//         {/* 최근 7일 표 */}
//         {this.renderDailyTable()}
//       </Box>
//     );
//   }
// }

// export default InspectionSystemChart;

import React, { Component } from "react";
import config from "../../config";

import {
  Box,
  Paper,
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
  // Popover 제거
  TextField,
  Button,
  InputAdornment,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Autocomplete } from "@mui/material";

import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  RestartAlt as ResetIcon,
  FileDownload as DownloadIcon,
} from "@mui/icons-material";

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Area, Line, ReferenceLine,
  ComposedChart, Legend
} from "recharts";

import ItemCodeModal from "../common/ItemCodeModal";
import s from "./InspectionSystemChart.module.scss";

/** ---------- helpers ---------- */
const palette = [
  "#ff7043", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc",
  "#26c6da", "#ec407a", "#7e57c2", "#8d6e63", "#26a69a"
];
const mainColor = "#1e88e5";

const fmtNum = (v, d = null) => {
  const n = Number(v) || 0;
  return d === null
    ? n.toLocaleString()
    : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
};
const fmtInt = (v) => fmtNum(v, 0);

const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
const today0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
const lastOfMonth  = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/** 주차 키/집계 */
const wkKey = (ds) => {
  const d = new Date(ds);
  if (Number.isNaN(d.getTime())) return ds;
  const jan1 = new Date(d.getFullYear(), 0, 1);
  const days = Math.floor((d - jan1) / 86400000);
  const w = Math.ceil((days + jan1.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${String(w).padStart(2, "0")}`;
};
const aggregateWeekly = (rows, keys) => {
  const m = new Map();
  rows.forEach(r => {
    const k = wkKey(r.date);
    const base = m.get(k) || { date: k };
    keys.forEach(key => base[key] = (base[key] || 0) + (r[key] || 0));
    m.set(k, base);
  });
  return [...m.values()];
};

/** 버튼 기준 화면 좌표 계산 → Menu에 anchorPosition으로 전달 */
const getAnchorPos = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
};

/** 월요일 시작 주간 */
const startOfWeek = (d) => {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
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

/** 차트 초기 필터 (올해 전체) */
const getDefaultFilters = () => {
  const y = new Date().getFullYear();
  return {
    start_date: iso(new Date(y, 0, 1)),
    end_date: iso(new Date(y, 11, 31)),
    factory: "",
    process: "",
    equipment: "",
    partNo: "",
    item: "",
    inspType: "",
    workType: "",
    shiftType: "",
    topN: 5,
  };
};

class InspectionSystemChart extends Component {
  state = {
    filters: getDefaultFilters(),

    // datasets
    kpis: { total: 0, partKinds: 0, itemKinds: 0, dailyAvg: 0, prodSum: 0, intensityPerK: 0, byInspType: [], byWorkType: [] },
    byItem: [], trend: [], stacked: [], byPart: [], byProcess: [], machines: [],
    throughput: [], shift: [], momentum: [],
    weekdayProfile: [], machIntensity: [], machShiftImbalance: [], anomalyDays: [],

    // 옵션
    factories: [], processes: [], equipments: [], parts: [], items: [],
    optionsLoading: false,

    // UI
    loading: false, error: "",
    showStacked: true, showWeeklyTrend: false, showWeeklyThroughput: false, showWeeklyShift: false,

    // 프리셋 상태/앵커
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    yearAnchorPos: null, monthAnchorPos: null, weekAnchorPos: null, // customAnchorPos 제거

    // 연도 목록
    years: [],

    // 모달
    itemCodeModalOpen: false,
  };

  componentDidMount() {
    const saved = localStorage.getItem("inspectionFilters");
    if (saved) {
      try { this.setState({ filters: { ...getDefaultFilters(), ...JSON.parse(saved) } }); } catch {}
    }
    this.bootstrap();
  }

  /** --------- API ---------- */
  post = async (path, body) => {
    const headers = { "Content-Type": "application/json" };
    const res = await fetch(`${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`, {
      method: "POST", headers, body: JSON.stringify(body || {})
    });
    if (!res.ok) {
      const t = await res.text().catch(()=> "");
      throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
    }
    const json = await res.json();
    return json.data || [];
  };

  bootstrap = async () => {
    await this.loadYears();
    await this.loadOptions();
    this.loadAll();
  };

  /** 옵션 로드 */
  loadOptions = async () => {
    const { filters } = this.state;
    this.setState({ optionsLoading: true });
    try {
      const [factories, processes, equipments, parts, items] = await Promise.all([
        this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
        this.post("/options/processes", { ...filters }),
        this.post("/options/equipments", { ...filters }),
        this.post("/options/parts",     { ...filters }),
        this.post("/options/items",     { ...filters }),
      ]);
      this.setState({ factories, processes, equipments, parts, items, optionsLoading: false });
    } catch (e) {
      console.error(e);
      this.setState({ optionsLoading: false });
    }
  };

  /** 연도 옵션 (서버 없으면 fallback) */
  loadYears = async () => {
    try {
      const raw = await this.post("/options/years", { ...this.state.filters });
      let years = Array.isArray(raw) ? raw.map(y => Number(y)).filter(Boolean) : [];
      if (!years.length) throw new Error("no years");
      years.sort((a,b) => b - a);
      this.setState({ years, selectedYear: years[0] });
    } catch {
      const y = new Date().getFullYear();
      const years = [y, y-1, y-2, y-3, y-4];
      this.setState({ years, selectedYear: y });
    }
  };

  /** 필터 변경 */
  handleFilterChange = async (field, value) => {
    this.setState(prev => {
      const f = { ...prev.filters, [field]: value };
      if (field === "factory") { f.process = ""; f.equipment = ""; f.partNo = ""; f.item = ""; }
      else if (field === "process") { f.equipment = ""; f.partNo = ""; f.item = ""; }
      else if (field === "equipment") { f.partNo = ""; f.item = ""; }
      else if (field === "topN") { f.topN = Number(value) || 5; }
      return { filters: f };
    }, async () => {
      await this.loadOptions();
      await this.loadAll();
    });
  };

  /** 날짜 프리셋/범위 */
  setDateRange = async (start, end) => {
    const start_date = iso(start);
    const end_date   = iso(end);
    this.setState(prev => ({ filters: { ...prev.filters, start_date, end_date } }), async () => {
      try { localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters)); } catch {}
      await this.loadOptions();
      this.loadAll();
    });
  };
  applyToday = () => { const t = today0(); this.setDateRange(t, t); };
  selectYear = (y) => { const s = new Date(y, 0, 1); const e = new Date(y, 11, 31); this.setState({ selectedYear: y, yearAnchorPos: null }); this.setDateRange(s, e); };
  selectMonth = (m) => { const y = this.state.selectedYear; const s = new Date(y, m - 1, 1); const e = lastOfMonth(s); this.setState({ monthAnchorPos: null, selectedMonth: m }); this.setDateRange(s, e); };
  selectWeek = (w) => { this.setState({ weekAnchorPos: null }); this.setDateRange(w.start, w.end); };

  /** 전체 초기화(올해) */
  resetToThisYear = async () => {
    const y = new Date().getFullYear();
    const filters = { ...getDefaultFilters(), start_date: iso(new Date(y,0,1)), end_date: iso(new Date(y,11,31)) };
    this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth()+1 }, async () => {
      try { localStorage.removeItem("inspectionFilters"); } catch {}
      await this.loadOptions();
      this.loadAll();
    });
  };

  /** 데이터 일괄 로드 */
  loadAll = async () => {
    const { filters } = this.state;
    try { localStorage.setItem("inspectionFilters", JSON.stringify(filters)); } catch {}
    this.setState({ loading: true, error: "" });
    try {
      const dashboard = await this.post("/dashboard", filters);
      this.setState({
        kpis:                  dashboard.kpis || {},
        byItem:                dashboard.byItem || [],
        trend:                 dashboard.trend || [],
        stacked:               dashboard.stacked || [],
        byPart:                dashboard.byPart || [],
        byProcess:             dashboard.byProcess || [],
        machines:              dashboard.machines || [],
        throughput:            dashboard.throughput || [],
        shift:                 dashboard.shift || [],
        momentum:              dashboard.momentum || [],
        weekdayProfile:        dashboard.weekdayProfile || [],
        machIntensity:         dashboard.machIntensity || [],
        machShiftImbalance:    dashboard.machShiftImbalance || [],
        anomalyDays:           dashboard.anomalyDays || [],
        loading: false
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
    }
  };

  /** CSV 내보내기 */
  exportCsv = () => {
    const { byItem, trend, byPart, byProcess, machines, throughput } = this.state;
    const rows = [
      ["[Pareto] item", "qty"], ...byItem.map(r => [r.item, r.qty]), [],
      ["[Trend] date", "count"], ...trend.map(d => [d.date, d.count]), [],
      ["[Top Part] partNo", "qty"], ...byPart.map(d => [d.partNo, d.qty]), [],
      ["[Top Process] process", "qty"], ...byProcess.map(d => [d.proc, d.qty]), [],
      ["[Top Machine] machine", "qty"], ...machines.map(d => [d.machine, d.qty]), [],
      ["[Throughput] date", "prod", "count", "intensity_per_1k"], ...throughput.map(d => [d.date, d.prod, d.count, d.intensity]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `inspection_charts_${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  /** 품번/품명(검사항목) — ItemCodeModal 사용 */
  openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
  closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
  handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
    this.setState(
      (prev) => ({
        filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
        itemCodeModalOpen: false,
      }),
      () => { this.loadOptions(); this.loadAll(); }
    );
  };

  /** ----- tick formatter ----- */
  formatTick = (v, weekly) => {
    const s = String(v || "");
    if (weekly) {
      const wk = s.split("-W")[1] || s;
      return `W${wk}`;
    }
    return s.length >= 10 ? s.slice(5) : s;
  };

  /** ---------- 상단 필터(그리드와 동일 UI) ---------- */
  renderFilterBar = () => {
    const { filters, factories, processes, equipments, itemCodeModalOpen } = this.state;

    const now = today0();
    const thisYear  = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const thisWeek  = { start: startOfWeek(now), end: endOfWeek(now) };
    const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

    // 활성 프리셋 판정(표시용)
    const sd = new Date(filters.start_date), ed = new Date(filters.end_date);

    return (
      <Paper elevation={3} sx={{ p:3, mb:3, borderRadius:2 }}>
        <CardHeader
          title={
            <Typography variant="h6" sx={{ display:'flex', alignItems:'center', gap:1, color:'white' }}>
              <FilterIcon /> 검색 조건
            </Typography>
          }
          action={
            <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
              {/* 연간 */}
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
                {this.state.years.map((y)=>(
                  <MenuItem key={y} dense onClick={()=>this.selectYear(y)}>{y}년</MenuItem>
                ))}
              </Menu>

              {/* 월간 */}
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
                {Array.from({length:12},(_,i)=>i+1).map((m)=>(
                  <MenuItem key={m} dense onClick={()=>this.selectMonth(m)}>{this.state.selectedYear}년 {m}월</MenuItem>
                ))}
              </Menu>

              {/* 주간 */}
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
                {weeks.map((w,i)=>(
                  <MenuItem key={i} dense onClick={()=>this.selectWeek(w)}>
                    {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
                  </MenuItem>
                ))}
              </Menu>

              {/* 오늘 */}
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={this.applyToday}
                sx={{ textTransform:'none', fontWeight:700, borderColor:'white', color:'white' }}
              >
                오늘
              </Button>

              {/* 구분자 & 기간선택 직접 입력 (이 필드로 직접 입력 지원) */}
              <Typography sx={{ color:'white', opacity:0.8, mx:0.5 }}>|</Typography>
              <Typography sx={{ color:'white' }}>기간선택</Typography>
              <TextField
                type="date"
                value={filters.start_date}
                onChange={(e)=>this.handleFilterChange("start_date", e.target.value)}
                size="small" variant="outlined"
                sx={{ backgroundColor:'white', borderRadius:1, minWidth:150 }}
                InputLabelProps={{ shrink: true }}
              />
              <Typography sx={{ color:'white' }}>~</Typography>
              <TextField
                type="date"
                value={filters.end_date}
                onChange={(e)=>this.handleFilterChange("end_date", e.target.value)}
                size="small" variant="outlined"
                sx={{ backgroundColor:'white', borderRadius:1, minWidth:150 }}
                InputLabelProps={{ shrink: true }}
              />

              {/* 확장/축소 */}
              <IconButton onClick={()=>this.setState(prev=>({ filterExpanded: !prev.filterExpanded }))} sx={{ color:'white' }}>
                {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          }
          sx={{ backgroundColor:'#ff8f00', color:'white', borderRadius:1, mb:2 }}
        />

        {/* === 1행: 공장/공정/설비/품번/품명 === */}
        <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(160px, 1fr))', gap:2, mb:1 }}>
          <Autocomplete size="small" options={factories} value={filters.factory || null}
            onChange={(_, v)=>this.handleFilterChange('factory', v || '')}
            renderInput={(params)=><TextField {...params} label="공장" />} clearOnEscape />
          <Autocomplete size="small" options={processes} value={filters.process || null}
            onChange={(_, v)=>this.handleFilterChange('process', v || '')}
            renderInput={(params)=><TextField {...params} label="작업장(공정)" />} clearOnEscape />
          <Autocomplete size="small" options={equipments} value={filters.equipment || null}
            onChange={(_, v)=>this.handleFilterChange('equipment', v || '')}
            renderInput={(params)=><TextField {...params} label="라인(설비)" />} clearOnEscape />

          <TextField fullWidth label="품번" value={filters.partNo} onClick={this.openItemCodeModal}
            size="small" variant="outlined"
            InputProps={{ readOnly:true, style:{cursor:'pointer'},
              endAdornment:(<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color:'text.secondary' }}/></InputAdornment>) }}
            sx={{ '& .MuiInputBase-root':{ cursor:'pointer', '&:hover':{ backgroundColor:'#f5f5f5' } }}} />

          <TextField fullWidth label="품명(검사항목)" value={filters.item} onClick={this.openItemCodeModal}
            size="small" variant="outlined"
            InputProps={{ readOnly:true, style:{cursor:'pointer'},
              endAdornment:(<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color:'text.secondary' }}/></InputAdornment>) }}
            sx={{ '& .MuiInputBase-root':{ cursor:'pointer', '&:hover':{ backgroundColor:'#f5f5f5' } }}} />
        </Box>

        {/* 기본 나머지 필터 */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="검사구분" value={filters.inspType} onChange={(e)=>this.handleFilterChange('inspType', e.target.value)} size="small" variant="outlined" />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField fullWidth label="작업구분" value={filters.workType} onChange={(e)=>this.handleFilterChange('workType', e.target.value)} size="small" variant="outlined" />
          </Grid>
        </Grid>

        {/* 확장 필터 */}
        <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="주야구분" value={filters.shiftType} onChange={(e)=>this.handleFilterChange('shiftType', e.target.value)} size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="Top N" type="number" value={filters.topN ?? 5} onChange={(e)=>this.handleFilterChange('topN', e.target.value)} size="small" variant="outlined" />
            </Grid>
          </Grid>
        </Collapse>

        {/* 버튼 */}
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Box sx={{ display:'flex', gap:2, justifyContent:'flex-end' }}>
            <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
              필터 초기화
            </Button>
            <Button variant="contained" startIcon={<SearchIcon />} size="large"
              sx={{ backgroundColor:'#ff8f00', '&:hover':{ backgroundColor:'#f57c00' } }}
              onClick={()=>{ this.loadOptions(); this.loadAll(); }}>
              검색
            </Button>
            <Button variant="outlined" startIcon={<DownloadIcon />} size="large" onClick={this.exportCsv}>
              CSV 내보내기
            </Button>
          </Box>
        </Grid>

        {/* 품목 코드/명 선택 모달 */}
        <ItemCodeModal
          open={itemCodeModalOpen}
          onClose={this.closeItemCodeModal}
          onSelect={this.handleItemCodeSelect}
          selectedItemCode={filters.partNo}
          plant={filters.factory}
          worker={filters.process}
          line={filters.equipment}
        />
      </Paper>
    );
  };

  /** ---------- charts & tables (원래 로직 유지) ---------- */

  KPI = ({ title, value, color, sub }) => (
    <Paper className={s.section} sx={{ flex: 1, height: '100%' }}>
      <Box sx={{ p: 2 }}>
        <Typography className={s.kpiTitle} sx={{ color, fontSize: 13, fontWeight: 800 }}>{title}</Typography>
        <Typography className={s.kpiValue} sx={{ color: '#263238', fontSize: 28, fontWeight: 900 }}>{value}</Typography>
        <Typography className={s.kpiSub} sx={{ fontSize: 12, fontWeight: 500, color:'#8694a5' }}>{sub}</Typography>
      </Box>
    </Paper>
  );

  renderKpis = () => {
    const { kpis } = this.state;
    const cards = [
      { title: "총 검사건수", value: fmtInt(kpis.total), sub: "필터 조건 내", color: "#1e88e5" },
      { title: "품번 종류", value: fmtInt(kpis.partKinds), sub: "고유 품번 수", color: "#43a047" },
      { title: "검사항목 종류", value: fmtInt(kpis.itemKinds), sub: "고유 항목 수", color: "#8e24aa" },
      { title: "일 평균 검사", value: fmtNum(kpis.dailyAvg, 2), sub: "보고일 기준", color: "#ff7043" },
      { title: "총 생산수량", value: fmtNum(kpis.prodSum, 0), sub: "해당 기간 합계", color: "#00897b" },
      { title: "검사강도(1k 생산당)", value: fmtNum(kpis.intensityPerK, 2), sub: "검사건수 / (생산/1000)", color: "#6d4c41" },
    ];
    return (
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
        {cards.map((c, i) => (
          <Grid item xs={12} sm={6} md={3} lg={2} key={i} sx={{ display: 'flex' }}>
            <this.KPI {...c} />
          </Grid>
        ))}
      </Grid>
    );
  };

  renderDonut = () => {
    const { kpis, loading } = this.state;
    const data = (kpis.byInspType || []).map((d, i) => ({ name: d.type || "미지정", value: d.qty || 0, color: palette[i % palette.length] }));
    const total = data.reduce((s, d) => s + d.value, 0);
    return (
      <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            <PieChartIcon /> 검사구분 분포
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : (
          <>
            <Box sx={{ flex: 1, minHeight: 280, position: "relative" }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                    {data.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
                </PieChart>
              </ResponsiveContainer>
              <Box className={s.donutCenter}>
                <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
                <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#263238" }}>{fmtInt(total)}</Typography>
              </Box>
            </Box>
            <Box className={s.legendRow}>
              {data.map(d => (
                <span key={d.name} className={s.legendItem}>
                  <span className={s.legendDot} style={{ background: d.color }} />
                  {d.name}
                </span>
              ))}
            </Box>
          </>
        )}
      </Paper>
    );
  };

  renderPareto = () => {
    const { byItem, loading } = this.state;
    const total = byItem.reduce((s, x) => s + (x.qty || 0), 0) || 1;
    let cum = 0;
    const data = byItem.map(d => { cum += d.qty || 0; const rate = Math.min(100, (cum / total) * 100); return { ...d, cumRate: Math.round(rate * 100) / 100 }; });
    return (
      <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            <BarChartIcon /> 검사항목 파레토
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : (
          <Box sx={{ flex: 1, minHeight: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="item" axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Legend />
                <RTooltip formatter={(v, name, { payload }) => {
                  if (name === "수량") return [fmtInt(v), "수량"];
                  if (name === "누적(%)") return [`${(payload.cumRate ?? 0).toFixed(2)}%`, "누적(%)"];
                  return [v, name];
                }}/>
                <Bar yAxisId="left" dataKey="qty" name="수량" radius={[4, 4, 0, 0]}>
                  {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                </Bar>
                <Line yAxisId="right" type="monotone" dataKey="cumRate" name="누적(%)" stroke="#90a4ae" dot={false} />
                <ReferenceLine yAxisId="right" y={80} stroke={mainColor} strokeDasharray="4 4" />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  };

  renderTrend = () => {
    const { trend, stacked, showStacked, showWeeklyTrend, loading } = this.state;
    const map = new Map();
    trend.forEach(r => map.set(r.date, { ...r }));
    stacked.forEach(r => { const base = map.get(r.date) || { date: r.date, count: 0 }; map.set(r.date, { ...base, auto: r.auto, self: r.self, other: r.other }); });
    const mergedDaily = Array.from(map.values()).sort((a,b) => (a.date > b.date ? 1 : -1));
    const merged = showWeeklyTrend ? aggregateWeekly(mergedDaily, ["count","auto","self","other"]) : mergedDaily;
    return (
      <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            검사 건수 추이
          </Typography>
          <Box>
            <FormControlLabel
              control={<Switch size="small" checked={showWeeklyTrend} onChange={(e) => this.setState({ showWeeklyTrend: e.target.checked })} />}
              label="주간 합계 보기"
            />
            <FormControlLabel
              control={<Switch size="small" checked={showStacked} onChange={(e) => this.setState({ showStacked: e.target.checked })} />}
              label="검사구분 같이 보기"
            />
          </Box>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : (
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={merged} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }} tickFormatter={(v) => this.formatTick(v, showWeeklyTrend)} />
                <YAxis yAxisId="left" />
                <RTooltip />
                <Legend verticalAlign="top" height={32} iconType="circle" iconSize={14}
                        wrapperStyle={{ fontWeight: 700, letterSpacing: ".2px" }}
                        formatter={(value) => <span style={{ fontWeight: 700 }}>{value}</span>} />
                <Area yAxisId="left" type="monotone" dataKey="count" name="검사건수" stroke={mainColor} fill="rgba(30,136,229,.15)" />
                {showStacked && (
                  <>
                    <Bar dataKey="auto" name="자동검사" yAxisId="left" fill="rgba(255,112,67,.55)" barSize={10} />
                    <Bar dataKey="self" name="자주검사" yAxisId="left" fill="rgba(66,165,245,.55)" barSize={10} />
                    <Bar dataKey="other" name="기타" yAxisId="left" fill="rgba(171,71,188,.55)" barSize={10} />
                  </>
                )}
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  };

  renderThroughput = () => {
    const { throughput, showWeeklyThroughput, loading } = this.state;
    const thr = showWeeklyThroughput ? aggregateWeekly(throughput, ["prod","count"]) : throughput;
    const thrReady = thr.map(r => ({ ...r, intensity: r.prod > 0 ? +(r.count/(r.prod/1000)).toFixed(3) : 0 }));
    return (
      <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            생산-검사 스루풋 & 정규화(1k 생산당)
          </Typography>
          <FormControlLabel
            control={<Switch size="small" checked={showWeeklyThroughput} onChange={(e)=>this.setState({ showWeeklyThroughput: e.target.checked })} />}
            label="주간 합계 보기"
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : (
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={thrReady} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }} tickFormatter={(v) => this.formatTick(v, showWeeklyThroughput)} />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Legend verticalAlign="top" height={32} />
                <RTooltip formatter={(v, n) => {
                  if (n === "생산합") return [fmtInt(v), "생산합"];
                  if (n === "검사건수") return [fmtInt(v), "검사건수"];
                  if (n === "정규화강도") return [fmtNum(v,3), "정규화강도(1k당)"];
                  return [v, n];
                }}/>
                <Bar  yAxisId="left"  dataKey="prod"       name="생산합"      fill="rgba(76,175,80,.55)"  barSize={12} />
                <Line yAxisId="left"  type="monotone"      dataKey="count"     name="검사건수"    stroke="#1565c0" dot={false} />
                <Line yAxisId="right" type="monotone"      dataKey="intensity"  name="정규화강도"  stroke="#6d4c41" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  };

  renderTopPart = () => {
    const { byPart, loading } = this.state;
    return (
      <Paper className={s.section} sx={{ flex: 1 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            품번 Top {this.state.filters.topN}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : (
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byPart} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="partNo" width={160} />
                <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
                <Bar dataKey="qty" name="검사건수">
                  {byPart.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  };

  renderTopProcess = () => {
    const { byProcess, loading } = this.state;
    return (
      <Paper className={s.section} sx={{ flex: 1 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            공정 Top {this.state.filters.topN}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : (
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byProcess}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="proc" />
                <YAxis />
                <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
                <Bar dataKey="qty" name="검사건수">
                  {byProcess.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  };

  renderTopMachine = () => {
    const { machines, loading } = this.state;
    return (
      <Paper className={s.section} sx={{ flex: 1 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            설비 Top {this.state.filters.topN}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : (
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={machines} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="machine" width={160} />
                <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
                <Bar dataKey="qty" name="검사건수">
                  {machines.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  };

  renderShift = () => {
    const { shift, showWeeklyShift, loading } = this.state;
    const shiftData = showWeeklyShift ? aggregateWeekly(shift, ["day","night"]) : shift;
    const totalDay = shift.reduce((s, r) => s + (r.day || 0), 0);
    const totalNight = shift.reduce((s, r) => s + (r.night || 0), 0);
    const donut = [{ name: "주간", value: totalDay, color: "#42a5f5" }, { name: "야간", value: totalNight, color: "#ab47bc" }];

    return (
      <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            주/야 구분 추이 & 분포
          </Typography>
          <FormControlLabel
            control={<Switch size="small" checked={showWeeklyShift} onChange={(e)=>this.setState({ showWeeklyShift: e.target.checked })} />}
            label="주간 합계 보기"
          />
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : (
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <Box sx={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={shiftData} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }}
                          tickFormatter={(v) => this.formatTick(v, showWeeklyShift)} />
                    <YAxis />
                    <Legend verticalAlign="top" height={32} />
                    <RTooltip />
                    <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" barSize={10} />
                    <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" barSize={10} />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ height: 280, position: "relative" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={donut} innerRadius={55} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={2}>
                      {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <Box className={s.donutCenter}>
                  <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
                  <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#263238" }}>{fmtInt(totalDay + totalNight)}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        )}
      </Paper>
    );
  };

  renderWeekdayProfile = () => {
    const { weekdayProfile, loading } = this.state;
    const labels = {1:"일",2:"월",3:"화",4:"수",5:"목",6:"금",7:"토"};
    const data = (weekdayProfile || []).map(r => ({ name: labels[r.dow] || r.dow, day: r.day, night: r.night, total: r.total }));
    return (
      <Paper className={s.section} sx={{ flex:1 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            요일 패턴(주/야)
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : (
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" />
                <YAxis />
                <Legend />
                <RTooltip />
                <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" />
                <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" />
                <Line type="monotone" dataKey="total" name="총계" stroke="#263238" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  };

  renderMachIntensity = () => {
    const { machIntensity, loading } = this.state;
    const data = machIntensity;
    return (
      <Paper className={s.section} sx={{ flex:1 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            설비별 검사강도(1k 생산당)
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : (
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="machine" width={160} />
                <Legend />
                <RTooltip formatter={(v, n) => (n === "검사강도" ? [fmtNum(v,3), "검사강도(1k)"] : [fmtInt(v), n])} />
                <Bar dataKey="intensity" name="검사강도">
                  {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  };

  renderMachShiftImbalance = () => {
    const { machShiftImbalance, loading } = this.state;
    const data = machShiftImbalance;
    return (
      <Paper className={s.section} sx={{ flex:1 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            설비별 주/야 불균형 Top {this.state.filters.topN}
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : (
          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="machine" width={160} />
                <Legend />
                <RTooltip formatter={(v, n) => {
                  if (n === "불균형") return [`${fmtNum(v*100,1)}%`, "불균형(|주-야|/총)"];
                  if (n === "야/주 비율") return [v, "야/주 비율"];
                  return [fmtInt(v), n];
                }} />
                <Bar dataKey="imbalance" name="불균형">
                  {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  };

  renderAnomalyTable = () => {
    const rows = this.state.anomalyDays || [];
    return (
      <Paper className={s.section} sx={{ flex:1, display:'flex', flexDirection:'column' }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ fontWeight: 800 }}>
            일간 스파이크 알림 (z≥2.0)
          </Typography>
        </Box>
        <Box sx={{
          maxHeight: 340, borderRadius: 1, overflow: "auto",
          "& .stickyHead": { position:"sticky", top:0, backgroundColor: mainColor, color:"#fff", zIndex:1, fontWeight:800, p:1 }
        }}>
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)' }}>
            <Box className="stickyHead">일자</Box>
            <Box className="stickyHead" sx={{ textAlign:'right' }}>검사건수</Box>
            <Box className="stickyHead" sx={{ textAlign:'right' }}>평균</Box>
            <Box className="stickyHead" sx={{ textAlign:'right' }}>표준편차</Box>
            <Box className="stickyHead" sx={{ textAlign:'right' }}>z-score</Box>
          </Box>
          {rows.map((r,i)=>(
            <Box key={i} sx={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', p:1, "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
              <Box>{r.date}</Box>
              <Box sx={{ textAlign:'right' }}>{fmtInt(r.count)}</Box>
              <Box sx={{ textAlign:'right' }}>{fmtNum(r.avg,2)}</Box>
              <Box sx={{ textAlign:'right' }}>{fmtNum(r.std,2)}</Box>
              <Box sx={{ textAlign:'right', fontWeight:900, color:"#d84315" }}>{fmtNum(r.z,2)}</Box>
            </Box>
          ))}
          {rows.length===0 && (
            <Box sx={{ p:2, textAlign:'center' }}>이상치가 없습니다.</Box>
          )}
        </Box>
      </Paper>
    );
  };

  renderDailyTable = () => {
    const map = new Map();
    this.state.trend.forEach(r => map.set(r.date, { date: r.date, count: r.count }));
    this.state.stacked.forEach(r => {
      const row = map.get(r.date) || { date: r.date, count: 0 };
      map.set(r.date, { ...row, auto: r.auto, self: r.self, other: r.other });
    });
    const all = Array.from(map.values()).sort((a,b) => (a.date > b.date ? 1 : -1));
    const rows = all.slice(-7).reverse();

    return (
      <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ fontWeight: 800 }}>최근 7일 일자별 요약</Typography>
        </Box>
        <Box sx={{
          maxHeight: 380, borderRadius: 1, overflow: "auto",
          "& .stickyHead": { position:"sticky", top:0, backgroundColor: mainColor, color:"#fff", zIndex:1, fontWeight:800, p:1 }
        }}>
          <Box sx={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)' }}>
            <Box className="stickyHead">보고일</Box>
            <Box className="stickyHead" sx={{ textAlign:'right' }}>총 검사</Box>
            <Box className="stickyHead" sx={{ textAlign:'right' }}>자동검사</Box>
            <Box className="stickyHead" sx={{ textAlign:'right' }}>자주검사</Box>
            <Box className="stickyHead" sx={{ textAlign:'right' }}>기타</Box>
          </Box>
          {rows.map((r,i)=>(
            <Box key={i} sx={{ display:'grid', gridTemplateColumns:'repeat(5, 1fr)', p:1, "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
              <Box>{r.date}</Box>
              <Box sx={{ textAlign:'right' }}>{fmtInt(r.count)}</Box>
              <Box sx={{ textAlign:'right' }}>{fmtInt(r.auto || 0)}</Box>
              <Box sx={{ textAlign:'right' }}>{fmtInt(r.self || 0)}</Box>
              <Box sx={{ textAlign:'right' }}>{fmtInt(r.other || 0)}</Box>
            </Box>
          ))}
          {rows.length === 0 && (
            <Box sx={{ p:2, textAlign:'center' }}>데이터가 없습니다.</Box>
          )}
        </Box>
      </Paper>
    );
  };

  render() {
    const { loading, error } = this.state;

    return (
      <Box className={s.root}>
        {/* 필터 바 (그리드 동일 UI) */}
        {this.renderFilterBar()}

        {/* 에러/로딩 핸들링 */}
        {error && (
          <Box sx={{ mb:2 }}>
            <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>
            <Button variant="contained" onClick={this.loadAll}
              sx={{ backgroundColor:'#ff8f00', '&:hover':{ backgroundColor:'#f57c00' } }}>
              다시 시도
            </Button>
          </Box>
        )}

        {/* KPI */}
        {this.renderKpis()}

        {/* 1행: 검사구분 도넛 / 파레토 */}
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
          <Grid item xs={12} md={5} sx={{ display: 'flex', minWidth: 0  }}>{this.renderDonut()}</Grid>
          <Grid item xs={12} md={7} sx={{ display: 'flex', minWidth: 0  }}>{this.renderPareto()}</Grid>
        </Grid>

        {/* 2행: 검사 추이 / 스루풋 */}
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
          <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTrend()}</Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderThroughput()}</Grid>
        </Grid>

        {/* 3행: 품번 / 공정 / 설비 TopN */}
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
          <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopPart()}</Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopProcess()}</Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopMachine()}</Grid>
        </Grid>

        {/* 4행: 주/야 / 스파이크 */}
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
          <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderShift()}</Grid>
          <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderAnomalyTable()}</Grid>
        </Grid>

        {/* 5행: 요일 / 설비강도 / 설비 불균형 */}
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
          <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderWeekdayProfile()}</Grid>
          <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderMachIntensity()}</Grid>
          <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderMachShiftImbalance()}</Grid>
        </Grid>

        {/* 최근 7일 표 */}
        {this.renderDailyTable()}
      </Box>
    );
  }
}

export default InspectionSystemChart;
