// import React, { Component } from "react";
// import config from "../../config";

// import {
//   Box,
//   Paper,
//   Typography,
//   CardHeader,
//   IconButton,
//   Divider,
//   Collapse,
//   CircularProgress,
//   Alert,
//   Menu,
//   MenuItem,
//   TextField,
//   Button,
//   InputAdornment,
//   Chip,
// } from "@mui/material";
// import { Autocomplete } from "@mui/material";

// import {
//   Search as SearchIcon,
//   Clear as ClearIcon,
//   FilterList as FilterIcon,
//   ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon,
//   KeyboardArrowDown as KeyboardArrowDownIcon,
//   FileDownload as DownloadIcon,
// } from "@mui/icons-material";

// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RTooltip,
//   Legend,
// } from "recharts";

// import InspectionItemModal from "../common/InspectionItemModal";
// import s from "./InspectionSystemChart.module.scss";

// /** ---------- helpers ---------- */
// const mainColor = "#1e88e5";

// const fmtNum = (v, d = null) => {
//   const n = Number(v);
//   if (Number.isNaN(n)) return "";
//   return d === null
//     ? n.toLocaleString()
//     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// };

// const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
// const today0 = () => {
//   const t = new Date();
//   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// };
// const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// /** 버튼 기준 화면 좌표 → Menu anchorPosition */
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
// const endOfWeek = (d) => {
//   const s = startOfWeek(d);
//   return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
// };
// const getWeeksOfMonth = (year, month) => {
//   const first = new Date(year, month - 1, 1);
//   const last = lastOfMonth(first);
//   let cur = startOfWeek(first);
//   const out = [];
//   let idx = 1;
//   while (cur <= last) {
//     const s = new Date(cur),
//       e = endOfWeek(cur);
//     const clipS = new Date(Math.max(s, first));
//     const clipE = new Date(Math.min(e, last));
//     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
//     idx += 1;
//     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
//   }
//   return out;
// };

// /** 초기 필터 (올해 전체 + 기본 공정 선택) */
// const getDefaultFilters = () => {
//   const y = new Date().getFullYear();
//   return {
//     start_date: iso(new Date(y, 0, 1)),
//     end_date: iso(new Date(y, 11, 31)),
//     factory: "아진산업-본사(경산)",
//     process: "프레스",
//     equipment: "1500T(E라인)",
//     partNo: "",
//     item: "",
//     inspType: "",
//     workType: "",
//     shiftType: "",
//     topN: 5,
//   };
// };

// class InspectionSystemChart extends Component {
//   state = {
//     filters: getDefaultFilters(),

//     // Xn 피벗 데이터
//     xnCols: [],
//     xnRows: [],

//     // 옵션
//     factories: [],
//     processes: [],
//     equipments: [],
//     parts: [],
//     items: [],
//     optionsLoading: false,

//     // UI
//     loading: false,
//     error: "",
//     filterExpanded: false,

//     // 프리셋 상태/앵커
//     selectedYear: new Date().getFullYear(),
//     selectedMonth: new Date().getMonth() + 1,
//     yearAnchorPos: null,
//     monthAnchorPos: null,
//     weekAnchorPos: null,

//     // 연도 목록
//     years: [],

//     // 모달
//     itemCodeModalOpen: false,
//   };

//   componentDidMount() {
//     const base = getDefaultFilters();
//     const saved = localStorage.getItem("inspectionFilters");
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         const merged = { ...base, ...parsed };
//         // 저장값이 비어있으면 기본값으로 보정
//         merged.factory = merged.factory || base.factory;
//         merged.process = merged.process || base.process;
//         merged.equipment = merged.equipment || base.equipment;

//         this.setState({ filters: merged });
//       } catch {
//         this.setState({ filters: base });
//       }
//     } else {
//       this.setState({ filters: base });
//     }
//     this.bootstrap();
//   }

//   /** --------- API ---------- */
//   post = async (path, body) => {
//     const headers = { "Content-Type": "application/json" };
//     const res = await fetch(
//       `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
//       { method: "POST", headers, body: JSON.stringify(body || {}) }
//     );
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
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

//   /** 옵션 로드 */
//   loadOptions = async () => {
//     const { filters } = this.state;
//     this.setState({ optionsLoading: true });
//     try {
//       const [factories, processes, equipments, parts, items] = await Promise.all([
//         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
//         this.post("/options/processes", { ...filters }),
//         this.post("/options/equipments", { ...filters }),
//         this.post("/options/parts", { ...filters }),
//         this.post("/options/items", { ...filters }),
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
//       let years = Array.isArray(raw) ? raw.map((y) => Number(y)).filter(Boolean) : [];
//       if (!years.length) throw new Error("no years");
//       years.sort((a, b) => b - a);
//       this.setState({ years, selectedYear: years[0] });
//     } catch {
//       const y = new Date().getFullYear();
//       const years = [y, y - 1, y - 2, y - 3, y - 4];
//       this.setState({ years, selectedYear: y });
//     }
//   };

//   /** 필터 변경 */
//   handleFilterChange = async (field, value) => {
//     this.setState(
//       (prev) => {
//         const f = { ...prev.filters, [field]: value };
//         if (field === "factory") {
//           f.process = "";
//           f.equipment = "";
//           f.partNo = "";
//           f.item = "";
//         } else if (field === "process") {
//           f.equipment = "";
//           f.partNo = "";
//           f.item = "";
//         } else if (field === "equipment") {
//           f.partNo = "";
//           f.item = "";
//         } else if (field === "topN") {
//           f.topN = Number(value) || 5;
//         }
//         return { filters: f };
//       },
//       async () => {
//         await this.loadOptions();
//         await this.loadAll();
//       }
//     );
//   };

//   /** 날짜 프리셋/범위 */
//   setDateRange = async (start, end) => {
//     const start_date = iso(start);
//     const end_date = iso(end);
//     this.setState(
//       (prev) => ({ filters: { ...prev.filters, start_date, end_date } }),
//       async () => {
//         try {
//           localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
//         } catch {}
//         await this.loadOptions();
//         this.loadAll();
//       }
//     );
//   };
//   applyToday = () => {
//     const t = today0();
//     this.setDateRange(t, t);
//   };
//   selectYear = (y) => {
//     const s = new Date(y, 0, 1);
//     const e = new Date(y, 11, 31);
//     this.setState({ selectedYear: y, yearAnchorPos: null });
//     this.setDateRange(s, e);
//   };
//   selectMonth = (m) => {
//     const y = this.state.selectedYear;
//     const s = new Date(y, m - 1, 1);
//     const e = lastOfMonth(s);
//     this.setState({ monthAnchorPos: null, selectedMonth: m });
//     this.setDateRange(s, e);
//   };
//   selectWeek = (w) => {
//     this.setState({ weekAnchorPos: null });
//     this.setDateRange(w.start, w.end);
//   };

//   /** 전체 초기화(올해) */
//   resetToThisYear = async () => {
//     const y = new Date().getFullYear();
//     const filters = {
//       ...getDefaultFilters(),
//       start_date: iso(new Date(y, 0, 1)),
//       end_date: iso(new Date(y, 11, 31)),
//     };
//     this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth() + 1 }, async () => {
//       try {
//         localStorage.removeItem("inspectionFilters");
//       } catch {}
//       await this.loadOptions();
//       this.loadAll();
//     });
//   };

//   /** 데이터 로드: Xn 피벗만 */
//   loadAll = async () => {
//     const { filters } = this.state;
//     try {
//       localStorage.setItem("inspectionFilters", JSON.stringify(filters));
//     } catch {}
//     this.setState({ loading: true, error: "" });
//     try {
//       const pivot = await this.post("/xn_pivot", filters);
//       const p = pivot || {};
//       this.setState({
//         xnCols: p.cols || [],
//         xnRows: p.rows || [],
//         loading: false,
//       });
//     } catch (e) {
//       console.error(e);
//       this.setState({ error: "데이터를 불러오지 못했습니다.", loading: false });
//     }
//   };

//   /** CSV 내보내기: 현재 Xn 표만 */
//   exportCsv = () => {
//     const { xnCols, xnRows } = this.state;
//     const header = ["NO", "검사항목명", "검사내용", ...xnCols, "평균"];
//     const rows = [
//       header,
//       ...xnRows.map((r) => [
//         r.NO ?? "",
//         r["검사항목명"] ?? "",
//         r["검사내용"] ?? "",
//         ...xnCols.map((c) => r[c] ?? ""),
//         r["평균"] ?? "",
//       ]),
//     ];
//     const csv = rows.map((r) => r.join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `xn_pivot_${Date.now()}.csv`;
//     a.click();
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
//       () => {
//         this.loadOptions();
//         this.loadAll();
//       }
//     );
//   };

//   /** ---------- 상단 필터 ---------- */
//   renderFilterBar = () => {
//     const { filters, factories, processes, equipments, itemCodeModalOpen } = this.state;

//     const now = today0();
//     const thisYear = now.getFullYear();
//     const thisMonth = now.getMonth() + 1;
//     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
//     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

//     return (
//       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
//         <CardHeader
//           title={
//             <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
//               <FilterIcon /> 검색 조건
//             </Typography>
//           }
//           action={
//             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
//               {/* 연간 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
//               >
//                 연간
//               </Button>
//               <Menu
//                 open={!!this.state.yearAnchorPos}
//                 onClose={() => this.setState({ yearAnchorPos: null })}
//                 anchorReference="anchorPosition"
//                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
//               >
//                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>
//                   올해
//                 </MenuItem>
//                 {this.state.years.map((y) => (
//                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
//                     {y}년
//                   </MenuItem>
//                 ))}
//               </Menu>

//               {/* 월간 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
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
//                   onClick={() => {
//                     this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth));
//                   }}
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
//                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
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
//                 onClick={this.applyToday}
//                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
//               >
//                 오늘
//               </Button>

//               {/* 구분자 & 기간선택 직접 입력 */}
//               <Typography sx={{ color: "white", opacity: 0.8, mx: 0.5 }}>|</Typography>
//               <Typography sx={{ color: "white" }}>기간선택</Typography>
//               <TextField
//                 type="date"
//                 value={filters.start_date}
//                 onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
//                 size="small"
//                 variant="outlined"
//                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
//                 InputLabelProps={{ shrink: true }}
//               />
//               <Typography sx={{ color: "white" }}>~</Typography>
//               <TextField
//                 type="date"
//                 value={filters.end_date}
//                 onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
//                 size="small"
//                 variant="outlined"
//                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
//                 InputLabelProps={{ shrink: true }}
//               />

//               {/* 확장/축소 */}
//               <IconButton
//                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
//                 sx={{ color: "white" }}
//               >
//                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//               </IconButton>
//             </Box>
//           }
//           sx={{ backgroundColor: "#ff8f00", color: "white", borderRadius: 1, mb: 2 }}
//         />

//         {/* === 1행: 공장/공정/설비/품번/품명 === */}
//         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 2, mb: 1 }}>
//           <Autocomplete
//             size="small"
//             options={factories}
//             value={filters.factory || null}
//             onChange={(_, v) => this.handleFilterChange("factory", v || "")}
//             renderInput={(params) => <TextField {...params} label="공장" />}
//             clearOnEscape
//           />
//           <Autocomplete
//             size="small"
//             options={processes}
//             value={filters.process || null}
//             onChange={(_, v) => this.handleFilterChange("process", v || "")}
//             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
//             clearOnEscape
//           />
//           <Autocomplete
//             size="small"
//             options={equipments}
//             value={filters.equipment || null}
//             onChange={(_, v) => this.handleFilterChange("equipment", v || "")}
//             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
//             clearOnEscape
//           />

//           <TextField
//             fullWidth
//             label="품번"
//             value={filters.partNo}
//             onClick={this.openItemCodeModal}
//             size="small"
//             variant="outlined"
//             InputProps={{
//               readOnly: true,
//               style: { cursor: "pointer" },
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{
//               "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } },
//             }}
//           />

//           <TextField
//             fullWidth
//             label="품명(검사항목)"
//             value={filters.item}
//             onClick={this.openItemCodeModal}
//             size="small"
//             variant="outlined"
//             InputProps={{
//               readOnly: true,
//               style: { cursor: "pointer" },
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{
//               "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } },
//             }}
//           />
//         </Box>

//         {/* 확장 필터 */}
//         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
//           <Divider sx={{ my: 2 }} />
//           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16 }}>
//             <TextField
//               fullWidth
//               label="검사구분"
//               value={filters.inspType}
//               onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
//               size="small"
//               variant="outlined"
//             />
//             <TextField
//               fullWidth
//               label="작업구분"
//               value={filters.workType}
//               onChange={(e) => this.handleFilterChange("workType", e.target.value)}
//               size="small"
//               variant="outlined"
//             />
//             <TextField
//               fullWidth
//               label="주야구분"
//               value={filters.shiftType}
//               onChange={(e) => this.handleFilterChange("shiftType", e.target.value)}
//               size="small"
//               variant="outlined"
//             />
//             <TextField
//               fullWidth
//               label="Top N"
//               type="number"
//               value={filters.topN ?? 5}
//               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
//               size="small"
//               variant="outlined"
//             />
//           </Box>
//         </Collapse>

//         {/* 버튼 */}
//         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
//           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
//             필터 초기화
//           </Button>
//           <Button
//             variant="contained"
//             startIcon={<SearchIcon />}
//             size="large"
//             sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
//             onClick={() => {
//               this.loadOptions();
//               this.loadAll();
//             }}
//           >
//             검색
//           </Button>
//           <Button variant="outlined" startIcon={<DownloadIcon />} size="large" onClick={this.exportCsv}>
//             CSV 내보내기
//           </Button>
//         </Box>

//         {/* 품목 코드/명 선택 모달 */}
//         <InspectionItemModal
//           open={itemCodeModalOpen}
//           onClose={this.closeItemCodeModal}
//           onSelect={this.handleItemCodeSelect}
//           selectedItemCode={filters.partNo}
//           plant={filters.factory}
//           worker={filters.process}
//           line={filters.equipment}
//           startDate={filters.start_date}
//           endDate={filters.end_date}
//         />
//       </Paper>
//     );
//   };

//   /** ---------- Xn 표 ---------- */
//   renderXnTable = () => {
//     const { xnCols, xnRows, loading, filters } = this.state;
//     const header = ["NO", "검사항목명", "검사내용", ...xnCols, "평균"];

//     const partText = filters.partNo ? filters.partNo : "전체 품번";
//     const itemText = filters.item || "";
//     const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

//     return (
//       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             작업순번(Xn) 결과표
//           </Typography>

//           {/* 우측에 품번/기간 표시 */}
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
//             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
//             <Chip size="small" label={partText} />
//             {itemText && <Chip size="small" variant="outlined" label={itemText} />}
//             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
//             <Chip size="small" label={rangeText} />
//           </Box>
//         </Box>

//         <Typography sx={{ color: "#8694a5", fontSize: 12, mb: 0.5 }}>
//           동일 키(사업장·공장·공정·설비·검사구분·품번·보고일·주야구분) 내에서 작업순번을 X1..Xn으로 피벗합니다.
//         </Typography>

//         {loading ? (
//           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
//             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
//           </Box>
//         ) : (
//           <Box
//             sx={{
//               maxHeight: 500,
//               overflow: "auto",
//               borderRadius: 1,
//               "& table": { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
//               "& th, & td": { padding: "8px 10px", borderBottom: "1px solid #eceff1", fontSize: 13 },
//               "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
//               "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
//             }}
//           >
//             <table>
//               <thead>
//                 <tr>
//                   {header.map((h) => (
//                     <th
//                       key={h}
//                       style={{
//                         textAlign: h === "NO" ? "center" : h.startsWith("X") || h === "평균" ? "right" : "left",
//                       }}
//                     >
//                       {h}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {xnRows.map((r, idx) => (
//                   <tr key={idx}>
//                     <td style={{ textAlign: "center", fontWeight: 700 }}>{r.NO ?? ""}</td>
//                     <td>{r["검사항목명"] ?? ""}</td>
//                     <td>{r["검사내용"] ?? ""}</td>
//                     {xnCols.map((c) => (
//                       <td key={c} style={{ textAlign: "right" }}>
//                         {fmtNum(r[c], 3)}
//                       </td>
//                     ))}
//                     <td style={{ textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
//                   </tr>
//                 ))}
//                 {(!xnRows || xnRows.length === 0) && (
//                   <tr>
//                     <td colSpan={header.length} style={{ textAlign: "center", padding: "32px 0" }}>
//                       데이터가 없습니다.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   /** ---------- Xn 피벗 → 멀티라인 차트 데이터 ---------- */
//   buildXnChartData = () => {
//     const { xnCols, xnRows } = this.state; // xnCols: ["X1","X2",...], xnRows: [{검사항목명, 검사내용, X1, ...}]
//     if (!xnCols?.length || !xnRows?.length) return { seriesKeys: [], rows: [] };

//     const labelOf = (r) => {
//       const name = r["검사항목명"] ?? "";
//       const spec = r["검사내용"] ?? "";
//       return spec ? `${name} | ${spec}` : name;
//     };

//     // x축별로 재구성
//     const rows = xnCols.map((x) => {
//       const row = { x };
//       xnRows.forEach((r) => {
//         const key = labelOf(r);
//         const v = r?.[x];
//         row[key] = v === null || v === undefined || v === "" ? null : Number(v);
//       });
//       return row;
//     });

//     const seriesKeys = xnRows.map((r) => labelOf(r));
//     return { seriesKeys, rows };
//   };

//   /** ---------- 작업순번(Xn) 멀티라인 차트 ---------- */
//   renderXnTrendChart = () => {
//     const { loading } = this.state;
//     const { seriesKeys, rows } = this.buildXnChartData();

//     return (
//       <Paper className={s.section} style={{ marginTop: 16 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
//             검사항목별 작업순번(Xn) 흐름
//           </Typography>
//         </Box>

//         {loading ? (
//           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
//             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
//           </Box>
//         ) : rows.length === 0 ? (
//           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
//         ) : (
//           <Box style={{ width: "100%", height: 380 }}>
//             <ResponsiveContainer>
//               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="x" />
//                 <YAxis />
//                 <RTooltip />
//                 <Legend />
//                 {seriesKeys.map((k) => (
//                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
//                 ))}
//               </LineChart>
//             </ResponsiveContainer>
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   render() {
//     const { error } = this.state;

//     return (
//       <Box className={s.root}>
//         {/* 필터 바 */}
//         {this.renderFilterBar()}

//         {/* 에러 */}
//         {error && (
//           <Box sx={{ mb: 2 }}>
//             <Alert severity="error" sx={{ mb: 2 }}>
//               {error}
//             </Alert>
//             <Button
//               variant="contained"
//               onClick={this.loadAll}
//               sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
//             >
//               다시 시도
//             </Button>
//           </Box>
//         )}

//         {/* Xn 피벗 표 */}
//         {this.renderXnTable()}

//         {/* Xn 멀티라인 차트 */}
//         {this.renderXnTrendChart()}
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
  CardHeader,
  IconButton,
  Divider,
  Collapse,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  TextField,
  Button,
  InputAdornment,
  Chip,
} from "@mui/material";
import { Autocomplete } from "@mui/material";

import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  FileDownload as DownloadIcon,
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Legend,
} from "recharts";

import InspectionItemModal from "../common/InspectionItemModal";
import s from "./InspectionSystemChart.module.scss";

/** ---------- helpers ---------- */
const mainColor = "#1e88e5";

const fmtNum = (v, d = null) => {
  const n = Number(v);
  if (Number.isNaN(n)) return "";
  return d === null
    ? n.toLocaleString()
    : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
};

const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
const today0 = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};
const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/** 버튼 기준 화면 좌표 → Menu anchorPosition */
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
const endOfWeek = (d) => {
  const s = startOfWeek(d);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
};
const getWeeksOfMonth = (year, month) => {
  const first = new Date(year, month - 1, 1);
  const last = lastOfMonth(first);
  let cur = startOfWeek(first);
  const out = [];
  let idx = 1;
  while (cur <= last) {
    const s = new Date(cur),
      e = endOfWeek(cur);
    const clipS = new Date(Math.max(s, first));
    const clipE = new Date(Math.min(e, last));
    out.push({ label: `${idx}주차`, start: clipS, end: clipE });
    idx += 1;
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
  }
  return out;
};

/** 초기 필터 (올해 전체 + 기본 공정 선택) */
const getDefaultFilters = () => {
  const y = new Date().getFullYear();
  return {
    start_date: iso(new Date(y, 0, 1)),
    end_date: iso(new Date(y, 11, 31)),
    factory: "아진산업-본사(경산)",
    process: "프레스",
    equipment: "1500T(E라인)",
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

    // Xn 피벗 데이터
    xnCols: [],
    xnRows: [],

    // 옵션
    factories: [],
    processes: [],
    equipments: [],
    parts: [],
    items: [],
    optionsLoading: false,

    // UI
    loading: false,
    error: "",
    filterExpanded: false,

    // 프리셋 상태/앵커
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    yearAnchorPos: null,
    monthAnchorPos: null,
    weekAnchorPos: null,

    // 연도 목록
    years: [],

    // 모달
    itemCodeModalOpen: false,
  };

  componentDidMount() {
    const base = getDefaultFilters();
    const saved = localStorage.getItem("inspectionFilters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...base, ...parsed };
        // 저장값이 비어있으면 기본값으로 보정
        merged.factory = merged.factory || base.factory;
        merged.process = merged.process || base.process;
        merged.equipment = merged.equipment || base.equipment;

        this.setState({ filters: merged });
      } catch {
        this.setState({ filters: base });
      }
    } else {
      this.setState({ filters: base });
    }
    this.bootstrap();
  }

  /** --------- API ---------- */
  post = async (path, body) => {
    const headers = { "Content-Type": "application/json" };
    const res = await fetch(
      `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
      { method: "POST", headers, body: JSON.stringify(body || {}) }
    );
    if (!res.ok) {
      const t = await res.text().catch(() => "");
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
        this.post("/options/parts", { ...filters }),
        this.post("/options/items", { ...filters }),
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
      let years = Array.isArray(raw) ? raw.map((y) => Number(y)).filter(Boolean) : [];
      if (!years.length) throw new Error("no years");
      years.sort((a, b) => b - a);
      this.setState({ years, selectedYear: years[0] });
    } catch {
      const y = new Date().getFullYear();
      const years = [y, y - 1, y - 2, y - 3, y - 4];
      this.setState({ years, selectedYear: y });
    }
  };

  /** 필터 변경 */
  handleFilterChange = async (field, value) => {
    this.setState(
      (prev) => {
        const f = { ...prev.filters, [field]: value };
        if (field === "factory") {
          f.process = "";
          f.equipment = "";
          f.partNo = "";
          f.item = "";
        } else if (field === "process") {
          f.equipment = "";
          f.partNo = "";
          f.item = "";
        } else if (field === "equipment") {
          f.partNo = "";
          f.item = "";
        } else if (field === "start_date" || field === "end_date") {
          // 기간 변경 시 선택된 품번/품명 초기화
          f.partNo = "";
          f.item = "";
        } else if (field === "topN") {
          f.topN = Number(value) || 5;
        }
        return { filters: f };
      },
      async () => {
        await this.loadOptions();
        await this.loadAll();
      }
    );
  };

  /** 날짜 프리셋/범위 */
  setDateRange = async (start, end) => {
    const start_date = iso(start);
    const end_date = iso(end);
    this.setState(
      (prev) => ({
        // 기간 프리셋으로 바꿀 때도 품번/품명 초기화
        filters: { ...prev.filters, start_date, end_date, partNo: "", item: "" }
      }),
      async () => {
        try {
          localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
        } catch {}
        await this.loadOptions();
        this.loadAll();
      }
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

  /** 전체 초기화(올해) */
  resetToThisYear = async () => {
    const y = new Date().getFullYear();
    const filters = {
      ...getDefaultFilters(),
      start_date: iso(new Date(y, 0, 1)),
      end_date: iso(new Date(y, 11, 31)),
    };
    this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth() + 1 }, async () => {
      try {
        localStorage.removeItem("inspectionFilters");
      } catch {}
      await this.loadOptions();
      this.loadAll();
    });
  };

  /** 데이터 로드: Xn 피벗만 */
  loadAll = async () => {
    const { filters } = this.state;
    try {
      localStorage.setItem("inspectionFilters", JSON.stringify(filters));
    } catch {}
    this.setState({ loading: true, error: "" });
    try {
      const pivot = await this.post("/xn_pivot", filters);
      const p = pivot || {};
      this.setState({
        xnCols: p.cols || [],
        xnRows: p.rows || [],
        loading: false,
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: "데이터를 불러오지 못했습니다.", loading: false });
    }
  };

  /** CSV 내보내기: 현재 Xn 표만 */
  exportCsv = () => {
    const { xnCols, xnRows } = this.state;
    const header = ["NO", "검사항목명", "검사내용", ...xnCols, "평균"];
    const rows = [
      header,
      ...xnRows.map((r) => [
        r.NO ?? "",
        r["검사항목명"] ?? "",
        r["검사내용"] ?? "",
        ...xnCols.map((c) => r[c] ?? ""),
        r["평균"] ?? "",
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xn_pivot_${Date.now()}.csv`;
    a.click();
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
      () => {
        this.loadOptions();
        this.loadAll();
      }
    );
  };

  /** ---------- 상단 필터 ---------- */
  renderFilterBar = () => {
    const { filters, factories, processes, equipments, itemCodeModalOpen } = this.state;

    const now = today0();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
    const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <CardHeader
          title={
            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
              <FilterIcon /> 검색 조건
            </Typography>
          }
          action={
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {/* 연간 */}
              <Button
                size="small"
                variant="outlined"
                color="success"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
                sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
              >
                연간
              </Button>
              <Menu
                open={!!this.state.yearAnchorPos}
                onClose={() => this.setState({ yearAnchorPos: null })}
                anchorReference="anchorPosition"
                anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
              >
                <MenuItem dense onClick={() => this.selectYear(thisYear)}>
                  올해
                </MenuItem>
                {this.state.years.map((y) => (
                  <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
                    {y}년
                  </MenuItem>
                ))}
              </Menu>

              {/* 월간 */}
              <Button
                size="small"
                variant="outlined"
                color="success"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
                sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
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
                  onClick={() => {
                    this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth));
                  }}
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
                sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
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
                onClick={this.applyToday}
                sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
              >
                오늘
              </Button>

              {/* 구분자 & 기간선택 직접 입력 */}
              <Typography sx={{ color: "white", opacity: 0.8, mx: 0.5 }}>|</Typography>
              <Typography sx={{ color: "white" }}>기간선택</Typography>
              <TextField
                type="date"
                value={filters.start_date}
                onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
                size="small"
                variant="outlined"
                sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
              <Typography sx={{ color: "white" }}>~</Typography>
              <TextField
                type="date"
                value={filters.end_date}
                onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
                size="small"
                variant="outlined"
                sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />

              {/* 확장/축소 */}
              <IconButton
                onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
                sx={{ color: "white" }}
              >
                {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          }
          sx={{ backgroundColor: "#ff8f00", color: "white", borderRadius: 1, mb: 2 }}
        />

        {/* === 1행: 공장/공정/설비/품번/품명 === */}
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 2, mb: 1 }}>
          <Autocomplete
            size="small"
            options={factories}
            value={filters.factory || null}
            onChange={(_, v) => this.handleFilterChange("factory", v || "")}
            renderInput={(params) => <TextField {...params} label="공장" />}
            clearOnEscape
          />
          <Autocomplete
            size="small"
            options={processes}
            value={filters.process || null}
            onChange={(_, v) => this.handleFilterChange("process", v || "")}
            renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
            clearOnEscape
          />
          <Autocomplete
            size="small"
            options={equipments}
            value={filters.equipment || null}
            onChange={(_, v) => this.handleFilterChange("equipment", v || "")}
            renderInput={(params) => <TextField {...params} label="라인(설비)" />}
            clearOnEscape
          />

          <TextField
            fullWidth
            label="품번"
            value={filters.partNo}
            onClick={this.openItemCodeModal}
            size="small"
            variant="outlined"
            InputProps={{
              readOnly: true,
              style: { cursor: "pointer" },
              endAdornment: (
                <InputAdornment position="end">
                  <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } },
            }}
          />

          <TextField
            fullWidth
            label="품명(검사항목)"
            value={filters.item}
            onClick={this.openItemCodeModal}
            size="small"
            variant="outlined"
            InputProps={{
              readOnly: true,
              style: { cursor: "pointer" },
              endAdornment: (
                <InputAdornment position="end">
                  <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } },
            }}
          />
        </Box>

        {/* 확장 필터 */}
        <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16 }}>
            <TextField
              fullWidth
              label="검사구분"
              value={filters.inspType}
              onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
              size="small"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="작업구분"
              value={filters.workType}
              onChange={(e) => this.handleFilterChange("workType", e.target.value)}
              size="small"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="주야구분"
              value={filters.shiftType}
              onChange={(e) => this.handleFilterChange("shiftType", e.target.value)}
              size="small"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Top N"
              type="number"
              value={filters.topN ?? 5}
              onChange={(e) => this.handleFilterChange("topN", e.target.value)}
              size="small"
              variant="outlined"
            />
          </Box>
        </Collapse>

        {/* 버튼 */}
        <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
            필터 초기화
          </Button>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            size="large"
            sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
            onClick={() => {
              this.loadOptions();
              this.loadAll();
            }}
          >
            검색
          </Button>
          <Button variant="outlined" startIcon={<DownloadIcon />} size="large" onClick={this.exportCsv}>
            CSV 내보내기
          </Button>
        </Box>

        {/* 품목 코드/명 선택 모달 */}
        <InspectionItemModal
          open={itemCodeModalOpen}
          onClose={this.closeItemCodeModal}
          onSelect={this.handleItemCodeSelect}
          selectedItemCode={filters.partNo}
          plant={filters.factory}
          worker={filters.process}
          line={filters.equipment}
          startDate={filters.start_date}
          endDate={filters.end_date}
        />
      </Paper>
    );
  };

  /** ---------- Xn 표 ---------- */
  renderXnTable = () => {
    const { xnCols, xnRows, loading, filters } = this.state;
    const header = ["NO", "검사항목명", "검사내용", ...xnCols, "평균"];

    const partText = filters.partNo ? filters.partNo : "전체 품번";
    const itemText = filters.item || "";
    const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

    return (
      <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            작업순번(Xn) 결과표
          </Typography>

          {/* 우측에 품번/기간 표시 */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
            <Chip size="small" label={partText} />
            {itemText && <Chip size="small" variant="outlined" label={itemText} />}
            <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
            <Chip size="small" label={rangeText} />
          </Box>
        </Box>

        <Typography sx={{ color: "#8694a5", fontSize: 12, mb: 0.5 }}>
          동일 키(사업장·공장·공정·설비·검사구분·품번·보고일·주야구분) 내에서 작업순번을 X1..Xn으로 피벗합니다.
        </Typography>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
            <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: 500,
              overflow: "auto",
              borderRadius: 1,
              "& table": { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
              "& th, & td": { padding: "8px 10px", borderBottom: "1px solid #eceff1", fontSize: 13 },
              "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
              "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
            }}
          >
            <table>
              <thead>
                <tr>
                  {header.map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: h === "NO" ? "center" : h.startsWith("X") || h === "평균" ? "right" : "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {xnRows.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ textAlign: "center", fontWeight: 700 }}>{r.NO ?? ""}</td>
                    <td>{r["검사항목명"] ?? ""}</td>
                    <td>{r["검사내용"] ?? ""}</td>
                    {xnCols.map((c) => (
                      <td key={c} style={{ textAlign: "right" }}>
                        {fmtNum(r[c], 3)}
                      </td>
                    ))}
                    <td style={{ textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
                  </tr>
                ))}
                {(!xnRows || xnRows.length === 0) && (
                  <tr>
                    <td colSpan={header.length} style={{ textAlign: "center", padding: "32px 0" }}>
                      데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>
    );
  };

  /** ---------- Xn 피벗 → 멀티라인 차트 데이터 ---------- */
  buildXnChartData = () => {
    const { xnCols, xnRows } = this.state; // xnCols: ["X1","X2",...], xnRows: [{검사항목명, 검사내용, X1, ...}]
    if (!xnCols?.length || !xnRows?.length) return { seriesKeys: [], rows: [] };

    const labelOf = (r) => {
      const name = r["검사항목명"] ?? "";
      const spec = r["검사내용"] ?? "";
      return spec ? `${name} | ${spec}` : name;
    };

    // x축별로 재구성
    const rows = xnCols.map((x) => {
      const row = { x };
      xnRows.forEach((r) => {
        const key = labelOf(r);
        const v = r?.[x];
        row[key] = v === null || v === undefined || v === "" ? null : Number(v);
      });
      return row;
    });

    const seriesKeys = xnRows.map((r) => labelOf(r));
    return { seriesKeys, rows };
  };

  /** ---------- 작업순번(Xn) 멀티라인 차트 ---------- */
  renderXnTrendChart = () => {
    const { loading } = this.state;
    const { seriesKeys, rows } = this.buildXnChartData();

    return (
      <Paper className={s.section} style={{ marginTop: 16 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
            검사항목별 작업순번(Xn) 흐름
          </Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
            <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
        ) : (
          <Box style={{ width: "100%", height: 380 }}>
            <ResponsiveContainer>
              <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <RTooltip />
                <Legend />
                {seriesKeys.map((k) => (
                  <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  };

  render() {
    const { error } = this.state;

    return (
      <Box className={s.root}>
        {/* 필터 바 */}
        {this.renderFilterBar()}

        {/* 에러 */}
        {error && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={this.loadAll}
              sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
            >
              다시 시도
            </Button>
          </Box>
        )}

        {/* Xn 피벗 표 */}
        {this.renderXnTable()}

        {/* Xn 멀티라인 차트 */}
        {this.renderXnTrendChart()}
      </Box>
    );
  }
}

export default InspectionSystemChart;
