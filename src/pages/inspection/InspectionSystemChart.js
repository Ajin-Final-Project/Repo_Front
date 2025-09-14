// // // // // // // // // import React, { Component } from "react";
// // // // // // // // // import config from "../../config";

// // // // // // // // // import {
// // // // // // // // //   Box,
// // // // // // // // //   Paper,
// // // // // // // // //   Typography,
// // // // // // // // //   CardHeader,
// // // // // // // // //   IconButton,
// // // // // // // // //   Divider,
// // // // // // // // //   Collapse,
// // // // // // // // //   CircularProgress,
// // // // // // // // //   Alert,
// // // // // // // // //   Menu,
// // // // // // // // //   MenuItem,
// // // // // // // // //   TextField,
// // // // // // // // //   Button,
// // // // // // // // //   InputAdornment,
// // // // // // // // //   Chip,
// // // // // // // // // } from "@mui/material";
// // // // // // // // // import { Autocomplete } from "@mui/material";

// // // // // // // // // import {
// // // // // // // // //   Search as SearchIcon,
// // // // // // // // //   Clear as ClearIcon,
// // // // // // // // //   FilterList as FilterIcon,
// // // // // // // // //   ExpandMore as ExpandMoreIcon,
// // // // // // // // //   ExpandLess as ExpandLessIcon,
// // // // // // // // //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // // // // // // // //   FileDownload as DownloadIcon,
// // // // // // // // // } from "@mui/icons-material";

// // // // // // // // // import {
// // // // // // // // //   ResponsiveContainer,
// // // // // // // // //   LineChart,
// // // // // // // // //   Line,
// // // // // // // // //   XAxis,
// // // // // // // // //   YAxis,
// // // // // // // // //   CartesianGrid,
// // // // // // // // //   Tooltip as RTooltip,
// // // // // // // // //   Legend,
// // // // // // // // // } from "recharts";

// // // // // // // // // import InspectionItemModal from "../common/InspectionItemModal";
// // // // // // // // // import s from "./InspectionSystemChart.module.scss";

// // // // // // // // // /** ---------- helpers ---------- */
// // // // // // // // // const mainColor = "#1e88e5";

// // // // // // // // // const fmtNum = (v, d = null) => {
// // // // // // // // //   if (v === null || v === undefined || v === "") return "";
// // // // // // // // //   const n = Number(v);
// // // // // // // // //   if (Number.isNaN(n)) return String(v);
// // // // // // // // //   return d === null
// // // // // // // // //     ? n.toLocaleString()
// // // // // // // // //     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// // // // // // // // // };

// // // // // // // // // const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
// // // // // // // // // const today0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
// // // // // // // // // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // // // // // // // const getAnchorPos = (el) => {
// // // // // // // // //   if (!el) return null;
// // // // // // // // //   const r = el.getBoundingClientRect();
// // // // // // // // //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // // // // // // // // };
// // // // // // // // // const startOfWeek = (d) => { const day = d.getDay(); const diff = (day === 0 ? -6 : 1) - day; const s2 = new Date(d); s2.setDate(d.getDate() + diff); return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate()); };
// // // // // // // // // const endOfWeek = (d) => { const s2 = startOfWeek(d); return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate() + 6); };
// // // // // // // // // const getWeeksOfMonth = (year, month) => {
// // // // // // // // //   const first = new Date(year, month - 1, 1);
// // // // // // // // //   const last = lastOfMonth(first);
// // // // // // // // //   let cur = startOfWeek(first);
// // // // // // // // //   const out = [];
// // // // // // // // //   let idx = 1;
// // // // // // // // //   while (cur <= last) {
// // // // // // // // //     const s = new Date(cur), e = endOfWeek(cur);
// // // // // // // // //     const clipS = new Date(Math.max(s, first));
// // // // // // // // //     const clipE = new Date(Math.min(e, last));
// // // // // // // // //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// // // // // // // // //     idx += 1; cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// // // // // // // // //   }
// // // // // // // // //   return out;
// // // // // // // // // };

// // // // // // // // // /** 기본 필터 */
// // // // // // // // // const getDefaultFilters = () => {
// // // // // // // // //   const y = new Date().getFullYear();
// // // // // // // // //   return {
// // // // // // // // //     start_date: iso(new Date(y, 0, 1)),
// // // // // // // // //     end_date: iso(new Date(y, 11, 31)),
// // // // // // // // //     factory: "아진산업-본사(경산)",
// // // // // // // // //     process: "프레스",
// // // // // // // // //     equipment: "1500T(E라인)",
// // // // // // // // //     partNo: "",
// // // // // // // // //     item: "",
// // // // // // // // //     inspType: "",
// // // // // // // // //     workType: "",
// // // // // // // // //     shiftType: "",
// // // // // // // // //     topN: 5,
// // // // // // // // //   };
// // // // // // // // // };

// // // // // // // // // /** ----- 정렬 유틸 ----- */
// // // // // // // // // const firstSeqIndex = (row, cols, shifts) => {
// // // // // // // // //   for (let i = 0; i < cols.length; i += 1) {
// // // // // // // // //     const c = cols[i];
// // // // // // // // //     for (const s of shifts) {
// // // // // // // // //       const v = row?.[s]?.[c];
// // // // // // // // //       if (v !== null && v !== undefined && v !== "") return i + 1;
// // // // // // // // //     }
// // // // // // // // //   }
// // // // // // // // //   return Number.MAX_SAFE_INTEGER;
// // // // // // // // // };
// // // // // // // // // const getInspectionSeq = (row, cols, shifts) => {
// // // // // // // // //   const raw = row?.["검사순번"];
// // // // // // // // //   const n = Number(raw);
// // // // // // // // //   if (raw !== undefined && raw !== null && !Number.isNaN(n)) return n;
// // // // // // // // //   return firstSeqIndex(row, cols, shifts);
// // // // // // // // // };
// // // // // // // // // const sortRowsByInspectionSeqAsc = (rows, cols, shifts) => {
// // // // // // // // //   return [...rows].sort((a, b) => {
// // // // // // // // //     const ia = getInspectionSeq(a, cols, shifts);
// // // // // // // // //     const ib = getInspectionSeq(b, cols, shifts);
// // // // // // // // //     if (ia !== ib) return ia - ib;
// // // // // // // // //     const an = (a["검사항목명"] || "").localeCompare(b["검사항목명"] || "");
// // // // // // // // //     if (an !== 0) return an;
// // // // // // // // //     return (a["검사내용"] || "").localeCompare(b["검사내용"] || "");
// // // // // // // // //   });
// // // // // // // // // };

// // // // // // // // // class InspectionSystemChart extends Component {
// // // // // // // // //   state = {
// // // // // // // // //     filters: getDefaultFilters(),

// // // // // // // // //     // ✅ 보고일 목록 + 표 데이터(주/야 + 작업구분 라벨)
// // // // // // // // //     dailyCols: [],
// // // // // // // // //     dailyDays: [],
// // // // // // // // //     dailyList: [],         // [{ d, equipment, partNo }]
// // // // // // // // //     dailyTables: {},        // rows 안에 "검사순번" 포함
// // // // // // // // //     dailyShifts: [],
// // // // // // // // //     dailyWorkHeaders: {},
// // // // // // // // //     selectedDay: null,

// // // // // // // // //     // ✅ 숫자형(실측값) 검사항목 추이
// // // // // // // // //     numTrend: { dates: [], series: [] },

// // // // // // // // //     // 옵션
// // // // // // // // //     factories: [],
// // // // // // // // //     processes: [],
// // // // // // // // //     equipments: [],
// // // // // // // // //     parts: [],
// // // // // // // // //     items: [],
// // // // // // // // //     optionsLoading: false,

// // // // // // // // //     // UI
// // // // // // // // //     loading: false,
// // // // // // // // //     error: "",
// // // // // // // // //     filterExpanded: false,

// // // // // // // // //     // 프리셋 상태/앵커
// // // // // // // // //     selectedYear: new Date().getFullYear(),
// // // // // // // // //     selectedMonth: new Date().getMonth() + 1,
// // // // // // // // //     yearAnchorPos: null,
// // // // // // // // //     monthAnchorPos: null,
// // // // // // // // //     weekAnchorPos: null,

// // // // // // // // //     years: [],

// // // // // // // // //     // 모달
// // // // // // // // //     itemCodeModalOpen: false,
// // // // // // // // //   };

// // // // // // // // //   componentDidMount() {
// // // // // // // // //     const base = getDefaultFilters();
// // // // // // // // //     const saved = localStorage.getItem("inspectionFilters");
// // // // // // // // //     if (saved) {
// // // // // // // // //       try {
// // // // // // // // //         const parsed = JSON.parse(saved);
// // // // // // // // //         const merged = { ...base, ...parsed };
// // // // // // // // //         merged.factory = merged.factory || base.factory;
// // // // // // // // //         merged.process = merged.process || base.process;
// // // // // // // // //         merged.equipment = merged.equipment || base.equipment;
// // // // // // // // //         this.setState({ filters: merged });
// // // // // // // // //       } catch {
// // // // // // // // //         this.setState({ filters: base });
// // // // // // // // //       }
// // // // // // // // //     } else {
// // // // // // // // //       this.setState({ filters: base });
// // // // // // // // //     }
// // // // // // // // //     this.bootstrap();
// // // // // // // // //   }

// // // // // // // // //   /** --------- API ---------- */
// // // // // // // // //   post = async (path, body) => {
// // // // // // // // //     const headers = { "Content-Type": "application/json" };
// // // // // // // // //     const res = await fetch(
// // // // // // // // //       `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
// // // // // // // // //       { method: "POST", headers, body: JSON.stringify(body || {}) }
// // // // // // // // //     );
// // // // // // // // //     if (!res.ok) {
// // // // // // // // //       const t = await res.text().catch(() => "");
// // // // // // // // //       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// // // // // // // // //     }
// // // // // // // // //     const json = await res.json();
// // // // // // // // //     return json.data || [];
// // // // // // // // //   };

// // // // // // // // //   bootstrap = async () => {
// // // // // // // // //     await this.loadYears();
// // // // // // // // //     await this.loadOptions();
// // // // // // // // //     this.loadAll();
// // // // // // // // //   };

// // // // // // // // //   loadOptions = async () => {
// // // // // // // // //     const { filters } = this.state;
// // // // // // // // //     this.setState({ optionsLoading: true });
// // // // // // // // //     try {
// // // // // // // // //       const [factories, processes, equipments, parts, items] = await Promise.all([
// // // // // // // // //         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
// // // // // // // // //         this.post("/options/processes", { ...filters }),
// // // // // // // // //         this.post("/options/equipments", { ...filters }),
// // // // // // // // //         this.post("/options/parts", { ...filters }),
// // // // // // // // //         this.post("/options/items", { ...filters }),
// // // // // // // // //       ]);
// // // // // // // // //       this.setState({ factories, processes, equipments, parts, items, optionsLoading: false });
// // // // // // // // //     } catch (e) {
// // // // // // // // //       console.error(e);
// // // // // // // // //       this.setState({ optionsLoading: false });
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   /** 연도 옵션 */
// // // // // // // // //   loadYears = async () => {
// // // // // // // // //     try {
// // // // // // // // //       const raw = await this.post("/options/years", { ...this.state.filters });
// // // // // // // // //       let years = Array.isArray(raw) ? raw.map((y) => Number(y)).filter(Boolean) : [];
// // // // // // // // //       if (!years.length) throw new Error("no years");
// // // // // // // // //       years.sort((a, b) => b - a);
// // // // // // // // //       this.setState({ years, selectedYear: years[0] });
// // // // // // // // //     } catch {
// // // // // // // // //       const y = new Date().getFullYear();
// // // // // // // // //       const years = [y, y - 1, y - 2, y - 3, y - 4];
// // // // // // // // //       this.setState({ years, selectedYear: y });
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   /** 필터 변경 */
// // // // // // // // //   handleFilterChange = async (field, value) => {
// // // // // // // // //     this.setState(
// // // // // // // // //       (prev) => {
// // // // // // // // //         const f = { ...prev.filters, [field]: value };
// // // // // // // // //         if (field === "factory") {
// // // // // // // // //           f.process = ""; f.equipment = ""; f.partNo = ""; f.item = "";
// // // // // // // // //         } else if (field === "process") {
// // // // // // // // //           f.equipment = ""; f.partNo = ""; f.item = "";
// // // // // // // // //         } else if (field === "equipment") {
// // // // // // // // //           f.partNo = ""; f.item = "";
// // // // // // // // //         } else if (field === "start_date" || field === "end_date") {
// // // // // // // // //           f.partNo = ""; f.item = "";
// // // // // // // // //         } else if (field === "topN") {
// // // // // // // // //           f.topN = Number(value) || 5;
// // // // // // // // //         }
// // // // // // // // //         return { filters: f };
// // // // // // // // //       },
// // // // // // // // //       async () => {
// // // // // // // // //         await this.loadOptions();
// // // // // // // // //         await this.loadAll();
// // // // // // // // //       }
// // // // // // // // //     );
// // // // // // // // //   };

// // // // // // // // //   /** 날짜 프리셋/범위 */
// // // // // // // // //   setDateRange = async (start, end) => {
// // // // // // // // //     const start_date = iso(start);
// // // // // // // // //     const end_date = iso(end);
// // // // // // // // //     this.setState(
// // // // // // // // //       (prev) => ({
// // // // // // // // //         filters: { ...prev.filters, start_date, end_date, partNo: "", item: "" },
// // // // // // // // //       }),
// // // // // // // // //       async () => {
// // // // // // // // //         try { localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters)); } catch {}
// // // // // // // // //         await this.loadOptions();
// // // // // // // // //         this.loadAll();
// // // // // // // // //       }
// // // // // // // // //     );
// // // // // // // // //   };
// // // // // // // // //   applyToday = () => { const t = today0(); this.setDateRange(t, t); };
// // // // // // // // //   selectYear = (y) => { const s = new Date(y, 0, 1); const e = new Date(y, 11, 31); this.setState({ selectedYear: y, yearAnchorPos: null }); this.setDateRange(s, e); };
// // // // // // // // //   selectMonth = (m) => { const y = this.state.selectedYear; const s = new Date(y, m - 1, 1); const e = lastOfMonth(s); this.setState({ monthAnchorPos: null, selectedMonth: m }); this.setDateRange(s, e); };
// // // // // // // // //   selectWeek = (w) => { this.setState({ weekAnchorPos: null }); this.setDateRange(w.start, w.end); };

// // // // // // // // //   /** 전체 초기화 */
// // // // // // // // //   resetToThisYear = async () => {
// // // // // // // // //     const y = new Date().getFullYear();
// // // // // // // // //     const filters = { ...getDefaultFilters(), start_date: iso(new Date(y, 0, 1)), end_date: iso(new Date(y, 11, 31)) };
// // // // // // // // //     this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth() + 1 }, async () => {
// // // // // // // // //       try { localStorage.removeItem("inspectionFilters"); } catch {}
// // // // // // // // //       await this.loadOptions();
// // // // // // // // //       this.loadAll();
// // // // // // // // //     });
// // // // // // // // //   };

// // // // // // // // //   /** 데이터 로드 */
// // // // // // // // //   loadAll = async () => {
// // // // // // // // //     const { filters } = this.state;
// // // // // // // // //     try { localStorage.setItem("inspectionFilters", JSON.stringify(filters)); } catch {}
// // // // // // // // //     this.setState({ loading: true, error: "" });
// // // // // // // // //     try {
// // // // // // // // //       const daily = await this.post("/xn_daily", filters);
// // // // // // // // //       const numeric = await this.post("/numeric_trend", filters);

// // // // // // // // //       const cols = daily?.cols || [];
// // // // // // // // //       const days = daily?.days || [];
// // // // // // // // //       const tables = daily?.tables || {};
// // // // // // // // //       const shifts = daily?.shifts || [];
// // // // // // // // //       const workHeaders = daily?.workHeaders || {};
// // // // // // // // //       const dayList = daily?.dayList || (days || []).map((d) => ({ d, equipment: "", partNo: "" }));

// // // // // // // // //       this.setState({
// // // // // // // // //         dailyCols: cols,
// // // // // // // // //         dailyDays: days,
// // // // // // // // //         dailyList: dayList,
// // // // // // // // //         dailyTables: tables,
// // // // // // // // //         dailyShifts: shifts,
// // // // // // // // //         dailyWorkHeaders: workHeaders,
// // // // // // // // //         selectedDay: (dayList?.[0]?.d) || (days?.[0]) || null,
// // // // // // // // //         numTrend: numeric || { dates: [], series: [] },
// // // // // // // // //         loading: false,
// // // // // // // // //       });
// // // // // // // // //     } catch (e) {
// // // // // // // // //       console.error(e);
// // // // // // // // //       this.setState({ error: "데이터를 불러오지 못했습니다.", loading: false });
// // // // // // // // //     }
// // // // // // // // //   };

// // // // // // // // //   /** CSV 내보내기: 행은 검사순번 오름차순 정렬 적용 */
// // // // // // // // //   exportCsv = () => {
// // // // // // // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // // // // // // //     if (!selectedDay) return;
// // // // // // // // //     const rawRows = dailyTables[selectedDay] || [];
// // // // // // // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// // // // // // // // //     const headLeft = ["NO", "검사항목명", "검사내용"];
// // // // // // // // //     const headMid = dailyShifts.flatMap((s) => dailyCols.map((c) => `${s}-${c}`));
// // // // // // // // //     const header = [...headLeft, ...headMid, "평균"];

// // // // // // // // //     const csvRows = [
// // // // // // // // //       header,
// // // // // // // // //       ...rows.map((r, idx) => {
// // // // // // // // //         const vals = dailyShifts.flatMap((s) => dailyCols.map((c) => r?.[s]?.[c] ?? ""));
// // // // // // // // //         return [String(idx + 1), r["검사항목명"] ?? "", r["검사내용"] ?? "", ...vals, r["평균"] ?? ""];
// // // // // // // // //       }),
// // // // // // // // //     ];
// // // // // // // // //     const csv = csvRows.map((r) => r.join(",")).join("\n");
// // // // // // // // //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // // // // // // // //     const url = URL.createObjectURL(blob);
// // // // // // // // //     const a = document.createElement("a");
// // // // // // // // //     a.href = url;
// // // // // // // // //     a.download = `xn_daily_${selectedDay}.csv`;
// // // // // // // // //     a.click();
// // // // // // // // //     URL.revokeObjectURL(url);
// // // // // // // // //   };

// // // // // // // // //   /** 품번/품명 모달 */
// // // // // // // // //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// // // // // // // // //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// // // // // // // // //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// // // // // // // // //     this.setState(
// // // // // // // // //       (prev) => ({
// // // // // // // // //         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
// // // // // // // // //         itemCodeModalOpen: false,
// // // // // // // // //       }),
// // // // // // // // //       () => { this.loadOptions(); this.loadAll(); }
// // // // // // // // //     );
// // // // // // // // //   };

// // // // // // // // //   // ---------- 상단 필터 ----------
// // // // // // // // //   renderFilterBar = () => {
// // // // // // // // //     const { filters } = this.state;

// // // // // // // // //     const now = today0();
// // // // // // // // //     const thisYear = now.getFullYear();
// // // // // // // // //     const thisMonth = now.getMonth() + 1;
// // // // // // // // //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// // // // // // // // //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// // // // // // // // //     return (
// // // // // // // // //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// // // // // // // // //         <CardHeader
// // // // // // // // //           title={
// // // // // // // // //             <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
// // // // // // // // //               <FilterIcon /> 검색 조건
// // // // // // // // //             </Typography>
// // // // // // // // //           }
// // // // // // // // //           action={
// // // // // // // // //             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
// // // // // // // // //               <Button size="small" variant="outlined" color="success"
// // // // // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // // // // //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}>
// // // // // // // // //                 연간
// // // // // // // // //               </Button>
// // // // // // // // //               <Menu open={!!this.state.yearAnchorPos} onClose={() => this.setState({ yearAnchorPos: null })}
// // // // // // // // //                 anchorReference="anchorPosition" anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}>
// // // // // // // // //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
// // // // // // // // //                 {this.state.years.map((y) => (
// // // // // // // // //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
// // // // // // // // //                 ))}
// // // // // // // // //               </Menu>

// // // // // // // // //               <Button size="small" variant="outlined" color="success"
// // // // // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // // // // //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}>
// // // // // // // // //                 월간
// // // // // // // // //               </Button>
// // // // // // // // //               <Menu open={!!this.state.monthAnchorPos} onClose={() => this.setState({ monthAnchorPos: null })}
// // // // // // // // //                 anchorReference="anchorPosition" anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}>
// // // // // // // // //                 <MenuItem dense onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}>
// // // // // // // // //                   이번달
// // // // // // // // //                 </MenuItem>
// // // // // // // // //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // // // // // // // //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>{this.state.selectedYear}년 {m}월</MenuItem>
// // // // // // // // //                 ))}
// // // // // // // // //               </Menu>

// // // // // // // // //               <Button size="small" variant="outlined" color="success"
// // // // // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // // // // //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}>
// // // // // // // // //                 주간
// // // // // // // // //               </Button>
// // // // // // // // //               <Menu open={!!this.state.weekAnchorPos} onClose={() => this.setState({ weekAnchorPos: null })}
// // // // // // // // //                 anchorReference="anchorPosition" anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}>
// // // // // // // // //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// // // // // // // // //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// // // // // // // // //                 </MenuItem>
// // // // // // // // //                 {weeks.map((w, i) => (
// // // // // // // // //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// // // // // // // // //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// // // // // // // // //                   </MenuItem>
// // // // // // // // //                 ))}
// // // // // // // // //               </Menu>

// // // // // // // // //               <Button size="small" variant="outlined" color="success"
// // // // // // // // //                 onClick={this.applyToday}
// // // // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}>
// // // // // // // // //                 오늘
// // // // // // // // //               </Button>

// // // // // // // // //               <Typography sx={{ color: "white", opacity: 0.8, mx: 0.5 }}>|</Typography>
// // // // // // // // //               <Typography sx={{ color: "white" }}>기간선택</Typography>
// // // // // // // // //               <TextField type="date" value={filters.start_date} onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// // // // // // // // //                 size="small" variant="outlined" sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }} InputLabelProps={{ shrink: true }} />
// // // // // // // // //               <Typography sx={{ color: "white" }}>~</Typography>
// // // // // // // // //               <TextField type="date" value={filters.end_date} onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// // // // // // // // //                 size="small" variant="outlined" sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }} InputLabelProps={{ shrink: true }} />

// // // // // // // // //               <IconButton onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))} sx={{ color: "white" }}>
// // // // // // // // //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// // // // // // // // //               </IconButton>
// // // // // // // // //             </Box>
// // // // // // // // //           }
// // // // // // // // //           sx={{ backgroundColor: "#ff8f00", color: "white", borderRadius: 1, mb: 2 }}
// // // // // // // // //         />

// // // // // // // // //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// // // // // // // // //         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 2, mb: 1 }}>
// // // // // // // // //           <Autocomplete size="small" options={this.state.factories} value={filters.factory || null}
// // // // // // // // //             onChange={(_, v) => this.handleFilterChange("factory", v || "")}
// // // // // // // // //             renderInput={(params) => <TextField {...params} label="공장" />} clearOnEscape />
// // // // // // // // //           <Autocomplete size="small" options={this.state.processes} value={filters.process || null}
// // // // // // // // //             onChange={(_, v) => this.handleFilterChange("process", v || "")}
// // // // // // // // //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />} clearOnEscape />
// // // // // // // // //           <Autocomplete size="small" options={this.state.equipments} value={filters.equipment || null}
// // // // // // // // //             onChange={(_, v) => this.handleFilterChange("equipment", v || "")}
// // // // // // // // //             renderInput={(params) => <TextField {...params} label="라인(설비)" />} clearOnEscape />
// // // // // // // // //           <TextField fullWidth label="품번" value={filters.partNo} onClick={this.openItemCodeModal} size="small" variant="outlined"
// // // // // // // // //             InputProps={{ readOnly: true, style: { cursor: "pointer" }, endAdornment: (<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color: "text.secondary" }} /></InputAdornment>) }}
// // // // // // // // //             sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }} />
// // // // // // // // //           <TextField fullWidth label="품명(검사항목)" value={filters.item} onClick={this.openItemCodeModal} size="small" variant="outlined"
// // // // // // // // //             InputProps={{ readOnly: true, style: { cursor: "pointer" }, endAdornment: (<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color: "text.secondary" }} /></InputAdornment>) }}
// // // // // // // // //             sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }} />
// // // // // // // // //         </Box>

// // // // // // // // //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// // // // // // // // //           <Divider sx={{ my: 2 }} />
// // // // // // // // //           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16 }}>
// // // // // // // // //             <TextField fullWidth label="검사구분" value={filters.inspType} onChange={(e) => this.handleFilterChange("inspType", e.target.value)} size="small" variant="outlined" />
// // // // // // // // //             <TextField fullWidth label="작업구분" value={filters.workType} onChange={(e) => this.handleFilterChange("workType", e.target.value)} size="small" variant="outlined" />
// // // // // // // // //             <TextField fullWidth label="주야구분" value={filters.shiftType} onChange={(e) => this.handleFilterChange("shiftType", e.target.value)} size="small" variant="outlined" />
// // // // // // // // //             <TextField fullWidth label="Top N" type="number" value={filters.topN ?? 5} onChange={(e) => this.handleFilterChange("topN", e.target.value)} size="small" variant="outlined" />
// // // // // // // // //           </Box>
// // // // // // // // //         </Collapse>

// // // // // // // // //         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
// // // // // // // // //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">필터 초기화</Button>
// // // // // // // // //           <Button variant="contained" startIcon={<SearchIcon />} size="large"
// // // // // // // // //             sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // // // // // // // //             onClick={() => { this.loadOptions(); this.loadAll(); }}>
// // // // // // // // //             검색
// // // // // // // // //           </Button>
// // // // // // // // //           <Button variant="outlined" startIcon={<DownloadIcon />} size="large" onClick={this.exportCsv}>CSV 내보내기</Button>
// // // // // // // // //         </Box>

// // // // // // // // //         <InspectionItemModal
// // // // // // // // //           open={this.state.itemCodeModalOpen}
// // // // // // // // //           onClose={this.closeItemCodeModal}
// // // // // // // // //           onSelect={this.handleItemCodeSelect}
// // // // // // // // //           selectedItemCode={filters.partNo}
// // // // // // // // //           plant={filters.factory}
// // // // // // // // //           worker={filters.process}
// // // // // // // // //           line={filters.equipment}
// // // // // // // // //           startDate={filters.start_date}
// // // // // // // // //           endDate={filters.end_date}
// // // // // // // // //         />
// // // // // // // // //       </Paper>
// // // // // // // // //     );
// // // // // // // // //   };

// // // // // // // // //   /** 선택 일자의 Xn 표 (주/야 + 작업구분 라벨) — 행 정렬 적용 */
// // // // // // // // //   renderDailyTable = () => {
// // // // // // // // //     const { dailyCols, dailyTables, dailyShifts, dailyWorkHeaders, selectedDay, loading, filters } = this.state;
// // // // // // // // //     const rawRows = selectedDay ? dailyTables[selectedDay] || [] : [];
// // // // // // // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts); // 검사순번 오름차순

// // // // // // // // //     const partText = filters.partNo ? filters.partNo : "전체 품번";
// // // // // // // // //     const itemText = filters.item || "";
// // // // // // // // //     const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

// // // // // // // // //     return (
// // // // // // // // //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // // // // // // // //         <Box className={s.sectionHeader}>
// // // // // // // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // // // // // // //             작업순번(Xn) 결과표 — 주/야/작업구분
// // // // // // // // //           </Typography>
// // // // // // // // //             <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
// // // // // // // // //               <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
// // // // // // // // //               <Chip size="small" label={partText} />
// // // // // // // // //               {itemText && <Chip size="small" variant="outlined" label={itemText} />}
// // // // // // // // //               <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
// // // // // // // // //               <Chip size="small" label={rangeText} />
// // // // // // // // //               {selectedDay && (
// // // // // // // // //                 <>
// // // // // // // // //                   <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>보고일</Typography>
// // // // // // // // //                   <Chip size="small" color="primary" variant="outlined" label={selectedDay} />
// // // // // // // // //                 </>
// // // // // // // // //               )}
// // // // // // // // //             </Box>
// // // // // // // // //         </Box>

// // // // // // // // //         {loading ? (
// // // // // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // // // // //           </Box>
// // // // // // // // //         ) : (
// // // // // // // // //           <Box
// // // // // // // // //             sx={{
// // // // // // // // //               maxHeight: 600,
// // // // // // // // //               overflow: "auto",
// // // // // // // // //               borderRadius: 1,
// // // // // // // // //               "& table": { width: "100%", borderCollapse: "separate", borderSpacing: 0 },
// // // // // // // // //               "& th, & td": { padding: "8px 10px", borderBottom: "1px solid #eceff1", fontSize: 13 },
// // // // // // // // //               "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
// // // // // // // // //               "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
// // // // // // // // //             }}
// // // // // // // // //           >
// // // // // // // // //             <table>
// // // // // // // // //               <thead>
// // // // // // // // //                 <tr>
// // // // // // // // //                   <th style={{ width: 60, textAlign: "center" }} rowSpan={3}>NO</th>
// // // // // // // // //                   <th style={{ width: 120 }} rowSpan={3}>검사항목명</th>
// // // // // // // // //                   <th style={{ width: 200 }} rowSpan={3}>검사내용</th>
// // // // // // // // //                   {dailyShifts.map((s) => (
// // // // // // // // //                     <th key={s} colSpan={dailyCols.length} style={{ textAlign: "center" }}>{s || "전체"}</th>
// // // // // // // // //                   ))}
// // // // // // // // //                   <th rowSpan={3} style={{ textAlign: "right", minWidth: 100 }}>평균</th>
// // // // // // // // //                 </tr>
// // // // // // // // //                 <tr>
// // // // // // // // //                   {dailyShifts.map((s) =>
// // // // // // // // //                     dailyCols.map((c) => (
// // // // // // // // //                       <th key={`${s}-${c}`} style={{ textAlign: "center" }}>{c}</th>
// // // // // // // // //                     ))
// // // // // // // // //                   )}
// // // // // // // // //                 </tr>
// // // // // // // // //                 <tr>
// // // // // // // // //                   {dailyShifts.map((s) =>
// // // // // // // // //                     dailyCols.map((c) => (
// // // // // // // // //                       <th key={`${s}-${c}-work`} style={{ textAlign: "center", fontWeight: 600, color: "#607d8b" }}>
// // // // // // // // //                         {dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // // // // // // // //                       </th>
// // // // // // // // //                     ))
// // // // // // // // //                   )}
// // // // // // // // //                 </tr>
// // // // // // // // //               </thead>
// // // // // // // // //               <tbody>
// // // // // // // // //                 {rows.map((r, idx) => (
// // // // // // // // //                   <tr key={idx}>
// // // // // // // // //                     <td style={{ textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
// // // // // // // // //                     <td>{r["검사항목명"] ?? ""}</td>
// // // // // // // // //                     <td>{r["검사내용"] ?? ""}</td>
// // // // // // // // //                     {dailyShifts.map((s) =>
// // // // // // // // //                       dailyCols.map((c) => (
// // // // // // // // //                         <td key={`${idx}-${s}-${c}`} style={{ textAlign: "right" }}>
// // // // // // // // //                           {fmtNum(r?.[s]?.[c], 3)}
// // // // // // // // //                         </td>
// // // // // // // // //                       ))
// // // // // // // // //                     )}
// // // // // // // // //                     <td style={{ textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
// // // // // // // // //                   </tr>
// // // // // // // // //                 ))}
// // // // // // // // //                 {(!rows || rows.length === 0) && (
// // // // // // // // //                   <tr>
// // // // // // // // //                     <td colSpan={3 + dailyShifts.length * dailyCols.length + 1} style={{ textAlign: "center", padding: "32px 0" }}>
// // // // // // // // //                       데이터가 없습니다.
// // // // // // // // //                     </td>
// // // // // // // // //                   </tr>
// // // // // // // // //                 )}
// // // // // // // // //               </tbody>
// // // // // // // // //             </table>
// // // // // // // // //           </Box>
// // // // // // // // //         )}
// // // // // // // // //       </Paper>
// // // // // // // // //     );
// // // // // // // // //   };

// // // // // // // // //   /** 선택 일자 기준 멀티라인 차트 데이터 (주/야 평균) */
// // // // // // // // //   buildChartDataForSelectedDay = () => {
// // // // // // // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // // // // // // //     if (!selectedDay) return { seriesKeys: [], rows: [] };
// // // // // // // // //     const rowsSrc = dailyTables[selectedDay] || [];

// // // // // // // // //     const labelOf = (r) => {
// // // // // // // // //       const name = r["검사항목명"] ?? "";
// // // // // // // // //       const spec = r["검사내용"] ?? "";
// // // // // // // // //       return spec ? `${name} | ${spec}` : name;
// // // // // // // // //     };

// // // // // // // // //     const rows = dailyCols.map((x) => {
// // // // // // // // //       const row = { x };
// // // // // // // // //       rowsSrc.forEach((r) => {
// // // // // // // // //         const key = labelOf(r);
// // // // // // // // //         let sum = 0, cnt = 0;
// // // // // // // // //         dailyShifts.forEach((s) => {
// // // // // // // // //           const v = r?.[s]?.[x];
// // // // // // // // //           if (v != null && v !== "") { sum += Number(v); cnt += 1; }
// // // // // // // // //         });
// // // // // // // // //         row[key] = cnt > 0 ? sum / cnt : null;
// // // // // // // // //       });
// // // // // // // // //       return row;
// // // // // // // // //     });

// // // // // // // // //     const seriesKeys = rowsSrc.map((r) => labelOf(r));
// // // // // // // // //     return { seriesKeys, rows };
// // // // // // // // //   };

// // // // // // // // //   /** Xn 멀티라인 차트 (선택 일자) */
// // // // // // // // //   renderSelectedDayChart = () => {
// // // // // // // // //     const { loading, selectedDay } = this.state;
// // // // // // // // //     const { seriesKeys, rows } = this.buildChartDataForSelectedDay();

// // // // // // // // //     return (
// // // // // // // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // // // // // //         <Box className={s.sectionHeader}>
// // // // // // // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // // // // // //             {selectedDay ? `${selectedDay} — 검사항목별 Xn 흐름` : "검사항목별 Xn 흐름"}
// // // // // // // // //           </Typography>
// // // // // // // // //         </Box>

// // // // // // // // //         {loading ? (
// // // // // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // // // // //           </Box>
// // // // // // // // //         ) : rows.length === 0 ? (
// // // // // // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // // // // // // //         ) : (
// // // // // // // // //           <Box style={{ width: "100%", height: 380 }}>
// // // // // // // // //             <ResponsiveContainer>
// // // // // // // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // // // // // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // // // // // // //                 <XAxis dataKey="x" />
// // // // // // // // //                 <YAxis />
// // // // // // // // //                 <RTooltip />
// // // // // // // // //                 <Legend />
// // // // // // // // //                 {seriesKeys.map((k) => (
// // // // // // // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // // // // // // //                 ))}
// // // // // // // // //               </LineChart>
// // // // // // // // //             </ResponsiveContainer>
// // // // // // // // //           </Box>
// // // // // // // // //         )}
// // // // // // // // //       </Paper>
// // // // // // // // //     );
// // // // // // // // //   };

// // // // // // // // //   /** 숫자형(실측값) 검사항목 — 일자별 추이 차트 */
// // // // // // // // //   buildNumericTrendChart = () => {
// // // // // // // // //     const { numTrend } = this.state;
// // // // // // // // //     const dates = numTrend?.dates || [];
// // // // // // // // //     const series = numTrend?.series || [];
// // // // // // // // //     if (dates.length === 0 || series.length === 0) return { keys: [], rows: [] };
// // // // // // // // //     const rows = dates.map((d, i) => {
// // // // // // // // //       const o = { date: d };
// // // // // // // // //       series.forEach((s) => { o[s.label] = s.data?.[i] != null ? Number(s.data[i]) : null; });
// // // // // // // // //       return o;
// // // // // // // // //     });
// // // // // // // // //     const keys = series.map((s) => s.label);
// // // // // // // // //     return { keys, rows };
// // // // // // // // //   };

// // // // // // // // //   renderNumericTrendChart = () => {
// // // // // // // // //     const { loading, filters } = this.state;
// // // // // // // // //     const { keys, rows } = this.buildNumericTrendChart();
// // // // // // // // //     return (
// // // // // // // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // // // // // //         <Box className={s.sectionHeader}>
// // // // // // // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // // // // // //             숫자형 검사항목 — 일자별 실측값 추이 (Top {filters.topN ?? 5})
// // // // // // // // //           </Typography>
// // // // // // // // //         </Box>
// // // // // // // // //         {loading ? (
// // // // // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // // // // //           </Box>
// // // // // // // // //         ) : rows.length === 0 ? (
// // // // // // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // // // // // // //         ) : (
// // // // // // // // //           <Box style={{ width: "100%", height: 380 }}>
// // // // // // // // //             <ResponsiveContainer>
// // // // // // // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // // // // // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // // // // // // //                 <XAxis dataKey="date" />
// // // // // // // // //                 <YAxis />
// // // // // // // // //                 <RTooltip />
// // // // // // // // //                 <Legend />
// // // // // // // // //                 {keys.map((k) => (
// // // // // // // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // // // // // // //                 ))}
// // // // // // // // //               </LineChart>
// // // // // // // // //             </ResponsiveContainer>
// // // // // // // // //           </Box>
// // // // // // // // //         )}
// // // // // // // // //       </Paper>
// // // // // // // // //     );
// // // // // // // // //   };

// // // // // // // // //   render() {
// // // // // // // // //     const { error, dailyList, selectedDay } = this.state;

// // // // // // // // //     return (
// // // // // // // // //       <Box className={s.root}>
// // // // // // // // //         {/* 필터 바 */}
// // // // // // // // //         {this.renderFilterBar()}

// // // // // // // // //         {/* 에러 */}
// // // // // // // // //         {error && (
// // // // // // // // //           <Box sx={{ mb: 2 }}>
// // // // // // // // //             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
// // // // // // // // //             <Button variant="contained" onClick={this.loadAll}
// // // // // // // // //               sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}>
// // // // // // // // //               다시 시도
// // // // // // // // //             </Button>
// // // // // // // // //           </Box>
// // // // // // // // //         )}

// // // // // // // // //         {/* 본문: 좌측 날짜 목록 + 우측 표/차트 */}
// // // // // // // // //         <Box className={s.dailyLayout}>
// // // // // // // // //           <Paper className={s.dayPanel}>
// // // // // // // // //             <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a", mb: 1 }}>보고일</Typography>

// // // // // // // // //             <Box className={s.dayList}>
// // // // // // // // //               <div className={s.dayListHead}>
// // // // // // // // //                 <span>보고일</span>
// // // // // // // // //                 <span>설비</span>
// // // // // // // // //                 <span>품번</span>
// // // // // // // // //               </div>
// // // // // // // // //               <div className={s.dayListBody}>
// // // // // // // // //                 {dailyList.map(({ d, equipment, partNo }) => (
// // // // // // // // //                   <div key={d}
// // // // // // // // //                        className={`${s.dayRow} ${selectedDay === d ? s.active : ""}`}
// // // // // // // // //                        onClick={() => this.setState({ selectedDay: d })}>
// // // // // // // // //                     <span>{d}</span>
// // // // // // // // //                     <span>{equipment || "-"}</span>
// // // // // // // // //                     <span>{partNo || "-"}</span>
// // // // // // // // //                   </div>
// // // // // // // // //                 ))}
// // // // // // // // //                 {(!dailyList || dailyList.length === 0) && (
// // // // // // // // //                   <div className={s.dayEmpty}>기간/필터 조건에 해당하는 결과가 없습니다.</div>
// // // // // // // // //                 )}
// // // // // // // // //               </div>
// // // // // // // // //             </Box>
// // // // // // // // //           </Paper>

// // // // // // // // //           <Box className={s.rightArea}>
// // // // // // // // //             {this.renderDailyTable()}
// // // // // // // // //             {this.renderSelectedDayChart()}
// // // // // // // // //             {this.renderNumericTrendChart()}
// // // // // // // // //           </Box>
// // // // // // // // //         </Box>
// // // // // // // // //       </Box>
// // // // // // // // //     );
// // // // // // // // //   }
// // // // // // // // // }

// // // // // // // // // export default InspectionSystemChart;


// // // // // // // // import React, { Component } from "react";
// // // // // // // // import config from "../../config";

// // // // // // // // import {
// // // // // // // //   Box,
// // // // // // // //   Paper,
// // // // // // // //   Typography,
// // // // // // // //   CardHeader,
// // // // // // // //   IconButton,
// // // // // // // //   Divider,
// // // // // // // //   Collapse,
// // // // // // // //   CircularProgress,
// // // // // // // //   Alert,
// // // // // // // //   Menu,
// // // // // // // //   MenuItem,
// // // // // // // //   TextField,
// // // // // // // //   Button,
// // // // // // // //   InputAdornment,
// // // // // // // //   Chip,
// // // // // // // // } from "@mui/material";
// // // // // // // // import { Autocomplete } from "@mui/material";

// // // // // // // // import {
// // // // // // // //   Search as SearchIcon,
// // // // // // // //   Clear as ClearIcon,
// // // // // // // //   FilterList as FilterIcon,
// // // // // // // //   ExpandMore as ExpandMoreIcon,
// // // // // // // //   ExpandLess as ExpandLessIcon,
// // // // // // // //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // // // // // // //   FileDownload as DownloadIcon,
// // // // // // // // } from "@mui/icons-material";

// // // // // // // // import {
// // // // // // // //   ResponsiveContainer,
// // // // // // // //   LineChart,
// // // // // // // //   Line,
// // // // // // // //   XAxis,
// // // // // // // //   YAxis,
// // // // // // // //   CartesianGrid,
// // // // // // // //   Tooltip as RTooltip,
// // // // // // // //   Legend,
// // // // // // // // } from "recharts";

// // // // // // // // import InspectionItemModal from "../common/InspectionItemModal";
// // // // // // // // import s from "./InspectionSystemChart.module.scss";

// // // // // // // // /** ---------- helpers ---------- */
// // // // // // // // const mainColor = "#1e88e5";

// // // // // // // // const fmtNum = (v, d = null) => {
// // // // // // // //   if (v === null || v === undefined || v === "") return "";
// // // // // // // //   const n = Number(v);
// // // // // // // //   if (Number.isNaN(n)) return String(v);
// // // // // // // //   return d === null
// // // // // // // //     ? n.toLocaleString()
// // // // // // // //     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// // // // // // // // };

// // // // // // // // const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
// // // // // // // // const today0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
// // // // // // // // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // // // // // // const getAnchorPos = (el) => {
// // // // // // // //   if (!el) return null;
// // // // // // // //   const r = el.getBoundingClientRect();
// // // // // // // //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // // // // // // // };
// // // // // // // // const startOfWeek = (d) => { const day = d.getDay(); const diff = (day === 0 ? -6 : 1) - day; const s2 = new Date(d); s2.setDate(d.getDate() + diff); return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate()); };
// // // // // // // // const endOfWeek = (d) => { const s2 = startOfWeek(d); return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate() + 6); };
// // // // // // // // const getWeeksOfMonth = (year, month) => {
// // // // // // // //   const first = new Date(year, month - 1, 1);
// // // // // // // //   const last = lastOfMonth(first);
// // // // // // // //   let cur = startOfWeek(first);
// // // // // // // //   const out = [];
// // // // // // // //   let idx = 1;
// // // // // // // //   while (cur <= last) {
// // // // // // // //     const s = new Date(cur), e = endOfWeek(cur);
// // // // // // // //     const clipS = new Date(Math.max(s, first));
// // // // // // // //     const clipE = new Date(Math.min(e, last));
// // // // // // // //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// // // // // // // //     idx += 1; cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// // // // // // // //   }
// // // // // // // //   return out;
// // // // // // // // };

// // // // // // // // /** 기본 필터 */
// // // // // // // // const getDefaultFilters = () => {
// // // // // // // //   const y = new Date().getFullYear();
// // // // // // // //   return {
// // // // // // // //     start_date: iso(new Date(y, 0, 1)),
// // // // // // // //     end_date: iso(new Date(y, 11, 31)),
// // // // // // // //     factory: "아진산업-본사(경산)",
// // // // // // // //     process: "프레스",
// // // // // // // //     equipment: "1500T(E라인)",
// // // // // // // //     partNo: "",
// // // // // // // //     item: "",
// // // // // // // //     inspType: "",
// // // // // // // //     workType: "",
// // // // // // // //     shiftType: "",
// // // // // // // //     topN: 5,
// // // // // // // //   };
// // // // // // // // };

// // // // // // // // /** ---- 표 틀 고정용 폭 정의 ---- */
// // // // // // // // const COL_W = {
// // // // // // // //   no: 64,     // NO
// // // // // // // //   name: 180,  // 검사항목명
// // // // // // // //   spec: 320,  // 검사내용
// // // // // // // //   data: 96,   // Xn 데이터 열(모두 동일)
// // // // // // // //   avg: 100,   // 평균
// // // // // // // // };
// // // // // // // // const calcTableMinWidth = (colsLen, shiftsLen) => {
// // // // // // // //   const dataCols = (colsLen || 0) * (shiftsLen || 0);
// // // // // // // //   return COL_W.no + COL_W.name + COL_W.spec + dataCols * COL_W.data + COL_W.avg;
// // // // // // // // };

// // // // // // // // /** ----- 정렬 유틸 ----- */
// // // // // // // // const firstSeqIndex = (row, cols, shifts) => {
// // // // // // // //   for (let i = 0; i < cols.length; i += 1) {
// // // // // // // //     const c = cols[i];
// // // // // // // //     for (const s of shifts) {
// // // // // // // //       const v = row?.[s]?.[c];
// // // // // // // //       if (v !== null && v !== undefined && v !== "") return i + 1;
// // // // // // // //     }
// // // // // // // //   }
// // // // // // // //   return Number.MAX_SAFE_INTEGER;
// // // // // // // // };
// // // // // // // // const getInspectionSeq = (row, cols, shifts) => {
// // // // // // // //   const raw = row?.["검사순번"];
// // // // // // // //   const n = Number(raw);
// // // // // // // //   if (raw !== undefined && raw !== null && !Number.isNaN(n)) return n;
// // // // // // // //   return firstSeqIndex(row, cols, shifts);
// // // // // // // // };
// // // // // // // // const sortRowsByInspectionSeqAsc = (rows, cols, shifts) => {
// // // // // // // //   return [...rows].sort((a, b) => {
// // // // // // // //     const ia = getInspectionSeq(a, cols, shifts);
// // // // // // // //     const ib = getInspectionSeq(b, cols, shifts);
// // // // // // // //     if (ia !== ib) return ia - ib;
// // // // // // // //     const an = (a["검사항목명"] || "").localeCompare(b["검사항목명"] || "");
// // // // // // // //     if (an !== 0) return an;
// // // // // // // //     return (a["검사내용"] || "").localeCompare(b["검사내용"] || "");
// // // // // // // //   });
// // // // // // // // };

// // // // // // // // class InspectionSystemChart extends Component {
// // // // // // // //   state = {
// // // // // // // //     filters: getDefaultFilters(),

// // // // // // // //     // ✅ 보고일 목록 + 표 데이터(주/야 + 작업구분 라벨)
// // // // // // // //     dailyCols: [],
// // // // // // // //     dailyDays: [],
// // // // // // // //     dailyList: [],         // [{ d, equipment, partNo }]
// // // // // // // //     dailyTables: {},        // rows 안에 "검사순번" 포함
// // // // // // // //     dailyShifts: [],
// // // // // // // //     dailyWorkHeaders: {},
// // // // // // // //     selectedDay: null,

// // // // // // // //     // ✅ 숫자형(실측값) 검사항목 추이
// // // // // // // //     numTrend: { dates: [], series: [] },

// // // // // // // //     // 옵션
// // // // // // // //     factories: [],
// // // // // // // //     processes: [],
// // // // // // // //     equipments: [],
// // // // // // // //     parts: [],
// // // // // // // //     items: [],
// // // // // // // //     optionsLoading: false,

// // // // // // // //     // UI
// // // // // // // //     loading: false,
// // // // // // // //     error: "",
// // // // // // // //     filterExpanded: false,

// // // // // // // //     // 프리셋 상태/앵커
// // // // // // // //     selectedYear: new Date().getFullYear(),
// // // // // // // //     selectedMonth: new Date().getMonth() + 1,
// // // // // // // //     yearAnchorPos: null,
// // // // // // // //     monthAnchorPos: null,
// // // // // // // //     weekAnchorPos: null,

// // // // // // // //     years: [],

// // // // // // // //     // 모달
// // // // // // // //     itemCodeModalOpen: false,
// // // // // // // //   };

// // // // // // // //   componentDidMount() {
// // // // // // // //     const base = getDefaultFilters();
// // // // // // // //     const saved = localStorage.getItem("inspectionFilters");
// // // // // // // //     if (saved) {
// // // // // // // //       try {
// // // // // // // //         const parsed = JSON.parse(saved);
// // // // // // // //         const merged = { ...base, ...parsed };
// // // // // // // //         merged.factory = merged.factory || base.factory;
// // // // // // // //         merged.process = merged.process || base.process;
// // // // // // // //         merged.equipment = merged.equipment || base.equipment;
// // // // // // // //         this.setState({ filters: merged });
// // // // // // // //       } catch {
// // // // // // // //         this.setState({ filters: base });
// // // // // // // //       }
// // // // // // // //     } else {
// // // // // // // //       this.setState({ filters: base });
// // // // // // // //     }
// // // // // // // //     this.bootstrap();
// // // // // // // //   }

// // // // // // // //   /** --------- API ---------- */
// // // // // // // //   post = async (path, body) => {
// // // // // // // //     const headers = { "Content-Type": "application/json" };
// // // // // // // //     const res = await fetch(
// // // // // // // //       `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
// // // // // // // //       { method: "POST", headers, body: JSON.stringify(body || {}) }
// // // // // // // //     );
// // // // // // // //     if (!res.ok) {
// // // // // // // //       const t = await res.text().catch(() => "");
// // // // // // // //       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// // // // // // // //     }
// // // // // // // //     const json = await res.json();
// // // // // // // //     return json.data || [];
// // // // // // // //   };

// // // // // // // //   bootstrap = async () => {
// // // // // // // //     await this.loadYears();
// // // // // // // //     await this.loadOptions();
// // // // // // // //     this.loadAll();
// // // // // // // //   };

// // // // // // // //   loadOptions = async () => {
// // // // // // // //     const { filters } = this.state;
// // // // // // // //     this.setState({ optionsLoading: true });
// // // // // // // //     try {
// // // // // // // //       const [factories, processes, equipments, parts, items] = await Promise.all([
// // // // // // // //         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
// // // // // // // //         this.post("/options/processes", { ...filters }),
// // // // // // // //         this.post("/options/equipments", { ...filters }),
// // // // // // // //         this.post("/options/parts", { ...filters }),
// // // // // // // //         this.post("/options/items", { ...filters }),
// // // // // // // //       ]);
// // // // // // // //       this.setState({ factories, processes, equipments, parts, items, optionsLoading: false });
// // // // // // // //     } catch (e) {
// // // // // // // //       console.error(e);
// // // // // // // //       this.setState({ optionsLoading: false });
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   /** 연도 옵션 */
// // // // // // // //   loadYears = async () => {
// // // // // // // //     try {
// // // // // // // //       const raw = await this.post("/options/years", { ...this.state.filters });
// // // // // // // //       let years = Array.isArray(raw) ? raw.map((y) => Number(y)).filter(Boolean) : [];
// // // // // // // //       if (!years.length) throw new Error("no years");
// // // // // // // //       years.sort((a, b) => b - a);
// // // // // // // //       this.setState({ years, selectedYear: years[0] });
// // // // // // // //     } catch {
// // // // // // // //       const y = new Date().getFullYear();
// // // // // // // //       const years = [y, y - 1, y - 2, y - 3, y - 4];
// // // // // // // //       this.setState({ years, selectedYear: y });
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   /** 필터 변경 */
// // // // // // // //   handleFilterChange = async (field, value) => {
// // // // // // // //     this.setState(
// // // // // // // //       (prev) => {
// // // // // // // //         const f = { ...prev.filters, [field]: value };
// // // // // // // //         if (field === "factory") {
// // // // // // // //           f.process = ""; f.equipment = ""; f.partNo = ""; f.item = "";
// // // // // // // //         } else if (field === "process") {
// // // // // // // //           f.equipment = ""; f.partNo = ""; f.item = "";
// // // // // // // //         } else if (field === "equipment") {
// // // // // // // //           f.partNo = ""; f.item = "";
// // // // // // // //         } else if (field === "start_date" || field === "end_date") {
// // // // // // // //           f.partNo = ""; f.item = "";
// // // // // // // //         } else if (field === "topN") {
// // // // // // // //           f.topN = Number(value) || 5;
// // // // // // // //         }
// // // // // // // //         return { filters: f };
// // // // // // // //       },
// // // // // // // //       async () => {
// // // // // // // //         await this.loadOptions();
// // // // // // // //         await this.loadAll();
// // // // // // // //       }
// // // // // // // //     );
// // // // // // // //   };

// // // // // // // //   /** 날짜 프리셋/범위 */
// // // // // // // //   setDateRange = async (start, end) => {
// // // // // // // //     const start_date = iso(start);
// // // // // // // //     const end_date = iso(end);
// // // // // // // //     this.setState(
// // // // // // // //       (prev) => ({
// // // // // // // //         filters: { ...prev.filters, start_date, end_date, partNo: "", item: "" },
// // // // // // // //       }),
// // // // // // // //       async () => {
// // // // // // // //         try { localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters)); } catch {}
// // // // // // // //         await this.loadOptions();
// // // // // // // //         this.loadAll();
// // // // // // // //       }
// // // // // // // //     );
// // // // // // // //   };
// // // // // // // //   applyToday = () => { const t = today0(); this.setDateRange(t, t); };
// // // // // // // //   selectYear = (y) => { const s = new Date(y, 0, 1); const e = new Date(y, 11, 31); this.setState({ selectedYear: y, yearAnchorPos: null }); this.setDateRange(s, e); };
// // // // // // // //   selectMonth = (m) => { const y = this.state.selectedYear; const s = new Date(y, m - 1, 1); const e = lastOfMonth(s); this.setState({ monthAnchorPos: null, selectedMonth: m }); this.setDateRange(s, e); };
// // // // // // // //   selectWeek = (w) => { this.setState({ weekAnchorPos: null }); this.setDateRange(w.start, w.end); };

// // // // // // // //   /** 전체 초기화 */
// // // // // // // //   resetToThisYear = async () => {
// // // // // // // //     const y = new Date().getFullYear();
// // // // // // // //     const filters = { ...getDefaultFilters(), start_date: iso(new Date(y, 0, 1)), end_date: iso(new Date(y, 11, 31)) };
// // // // // // // //     this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth() + 1 }, async () => {
// // // // // // // //       try { localStorage.removeItem("inspectionFilters"); } catch {}
// // // // // // // //       await this.loadOptions();
// // // // // // // //       this.loadAll();
// // // // // // // //     });
// // // // // // // //   };

// // // // // // // //   /** 데이터 로드 */
// // // // // // // //   loadAll = async () => {
// // // // // // // //     const { filters } = this.state;
// // // // // // // //     try { localStorage.setItem("inspectionFilters", JSON.stringify(filters)); } catch {}
// // // // // // // //     this.setState({ loading: true, error: "" });
// // // // // // // //     try {
// // // // // // // //       const daily = await this.post("/xn_daily", filters);
// // // // // // // //       const numeric = await this.post("/numeric_trend", filters);

// // // // // // // //       const cols = daily?.cols || [];
// // // // // // // //       const days = daily?.days || [];
// // // // // // // //       const tables = daily?.tables || {};
// // // // // // // //       const shifts = daily?.shifts || [];
// // // // // // // //       const workHeaders = daily?.workHeaders || {};
// // // // // // // //       const dayList = daily?.dayList || (days || []).map((d) => ({ d, equipment: "", partNo: "" }));

// // // // // // // //       this.setState({
// // // // // // // //         dailyCols: cols,
// // // // // // // //         dailyDays: days,
// // // // // // // //         dailyList: dayList,
// // // // // // // //         dailyTables: tables,
// // // // // // // //         dailyShifts: shifts,
// // // // // // // //         dailyWorkHeaders: workHeaders,
// // // // // // // //         selectedDay: (dayList?.[0]?.d) || (days?.[0]) || null,
// // // // // // // //         numTrend: numeric || { dates: [], series: [] },
// // // // // // // //         loading: false,
// // // // // // // //       });
// // // // // // // //     } catch (e) {
// // // // // // // //       console.error(e);
// // // // // // // //       this.setState({ error: "데이터를 불러오지 못했습니다.", loading: false });
// // // // // // // //     }
// // // // // // // //   };

// // // // // // // //   /** CSV 내보내기: 행은 검사순번 오름차순 정렬 적용 */
// // // // // // // //   exportCsv = () => {
// // // // // // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // // // // // //     if (!selectedDay) return;
// // // // // // // //     const rawRows = dailyTables[selectedDay] || [];
// // // // // // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// // // // // // // //     const headLeft = ["NO", "검사항목명", "검사내용"];
// // // // // // // //     const headMid = dailyShifts.flatMap((s) => dailyCols.map((c) => `${s}-${c}`));
// // // // // // // //     const header = [...headLeft, ...headMid, "평균"];

// // // // // // // //     const csvRows = [
// // // // // // // //       header,
// // // // // // // //       ...rows.map((r, idx) => {
// // // // // // // //         const vals = dailyShifts.flatMap((s) => dailyCols.map((c) => r?.[s]?.[c] ?? ""));
// // // // // // // //         return [String(idx + 1), r["검사항목명"] ?? "", r["검사내용"] ?? "", ...vals, r["평균"] ?? ""];
// // // // // // // //       }),
// // // // // // // //     ];
// // // // // // // //     const csv = csvRows.map((r) => r.join(",")).join("\n");
// // // // // // // //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // // // // // // //     const url = URL.createObjectURL(blob);
// // // // // // // //     const a = document.createElement("a");
// // // // // // // //     a.href = url;
// // // // // // // //     a.download = `xn_daily_${selectedDay}.csv`;
// // // // // // // //     a.click();
// // // // // // // //     URL.revokeObjectURL(url);
// // // // // // // //   };

// // // // // // // //   /** 품번/품명 모달 */
// // // // // // // //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// // // // // // // //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// // // // // // // //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// // // // // // // //     this.setState(
// // // // // // // //       (prev) => ({
// // // // // // // //         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
// // // // // // // //         itemCodeModalOpen: false,
// // // // // // // //       }),
// // // // // // // //       () => { this.loadOptions(); this.loadAll(); }
// // // // // // // //     );
// // // // // // // //   };

// // // // // // // //   // ---------- 상단 필터 ----------
// // // // // // // //   renderFilterBar = () => {
// // // // // // // //     const { filters } = this.state;

// // // // // // // //     const now = today0();
// // // // // // // //     const thisYear = now.getFullYear();
// // // // // // // //     const thisMonth = now.getMonth() + 1;
// // // // // // // //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// // // // // // // //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// // // // // // // //     return (
// // // // // // // //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// // // // // // // //         <CardHeader
// // // // // // // //           title={
// // // // // // // //             <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
// // // // // // // //               <FilterIcon /> 검색 조건
// // // // // // // //             </Typography>
// // // // // // // //           }
// // // // // // // //           action={
// // // // // // // //             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
// // // // // // // //               <Button size="small" variant="outlined" color="success"
// // // // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // // // //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}>
// // // // // // // //                 연간
// // // // // // // //               </Button>
// // // // // // // //               <Menu open={!!this.state.yearAnchorPos} onClose={() => this.setState({ yearAnchorPos: null })}
// // // // // // // //                 anchorReference="anchorPosition" anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}>
// // // // // // // //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
// // // // // // // //                 {this.state.years.map((y) => (
// // // // // // // //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
// // // // // // // //                 ))}
// // // // // // // //               </Menu>

// // // // // // // //               <Button size="small" variant="outlined" color="success"
// // // // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // // // //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}>
// // // // // // // //                 월간
// // // // // // // //               </Button>
// // // // // // // //               <Menu open={!!this.state.monthAnchorPos} onClose={() => this.setState({ monthAnchorPos: null })}
// // // // // // // //                 anchorReference="anchorPosition" anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}>
// // // // // // // //                 <MenuItem dense onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}>
// // // // // // // //                   이번달
// // // // // // // //                 </MenuItem>
// // // // // // // //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // // // // // // //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>{this.state.selectedYear}년 {m}월</MenuItem>
// // // // // // // //                 ))}
// // // // // // // //               </Menu>

// // // // // // // //               <Button size="small" variant="outlined" color="success"
// // // // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // // // //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}>
// // // // // // // //                 주간
// // // // // // // //               </Button>
// // // // // // // //               <Menu open={!!this.state.weekAnchorPos} onClose={() => this.setState({ weekAnchorPos: null })}
// // // // // // // //                 anchorReference="anchorPosition" anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}>
// // // // // // // //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// // // // // // // //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// // // // // // // //                 </MenuItem>
// // // // // // // //                 {weeks.map((w, i) => (
// // // // // // // //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// // // // // // // //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// // // // // // // //                   </MenuItem>
// // // // // // // //                 ))}
// // // // // // // //               </Menu>

// // // // // // // //               <Button size="small" variant="outlined" color="success"
// // // // // // // //                 onClick={this.applyToday}
// // // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}>
// // // // // // // //                 오늘
// // // // // // // //               </Button>

// // // // // // // //               <Typography sx={{ color: "white", opacity: 0.8, mx: 0.5 }}>|</Typography>
// // // // // // // //               <Typography sx={{ color: "white" }}>기간선택</Typography>
// // // // // // // //               <TextField type="date" value={filters.start_date} onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// // // // // // // //                 size="small" variant="outlined" sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }} InputLabelProps={{ shrink: true }} />
// // // // // // // //               <Typography sx={{ color: "white" }}>~</Typography>
// // // // // // // //               <TextField type="date" value={filters.end_date} onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// // // // // // // //                 size="small" variant="outlined" sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }} InputLabelProps={{ shrink: true }} />

// // // // // // // //               <IconButton onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))} sx={{ color: "white" }}>
// // // // // // // //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// // // // // // // //               </IconButton>
// // // // // // // //             </Box>
// // // // // // // //           }
// // // // // // // //           sx={{ backgroundColor: "#ff8f00", color: "white", borderRadius: 1, mb: 2 }}
// // // // // // // //         />

// // // // // // // //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// // // // // // // //         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 2, mb: 1 }}>
// // // // // // // //           <Autocomplete size="small" options={this.state.factories} value={filters.factory || null}
// // // // // // // //             onChange={(_, v) => this.handleFilterChange("factory", v || "")}
// // // // // // // //             renderInput={(params) => <TextField {...params} label="공장" />} clearOnEscape />
// // // // // // // //           <Autocomplete size="small" options={this.state.processes} value={filters.process || null}
// // // // // // // //             onChange={(_, v) => this.handleFilterChange("process", v || "")}
// // // // // // // //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />} clearOnEscape />
// // // // // // // //           <Autocomplete size="small" options={this.state.equipments} value={filters.equipment || null}
// // // // // // // //             onChange={(_, v) => this.handleFilterChange("equipment", v || "")}
// // // // // // // //             renderInput={(params) => <TextField {...params} label="라인(설비)" />} clearOnEscape />
// // // // // // // //           <TextField fullWidth label="품번" value={filters.partNo} onClick={this.openItemCodeModal} size="small" variant="outlined"
// // // // // // // //             InputProps={{ readOnly: true, style: { cursor: "pointer" }, endAdornment: (<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color: "text.secondary" }} /></InputAdornment>) }}
// // // // // // // //             sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }} />
// // // // // // // //           <TextField fullWidth label="품명(검사항목)" value={filters.item} onClick={this.openItemCodeModal} size="small" variant="outlined"
// // // // // // // //             InputProps={{ readOnly: true, style: { cursor: "pointer" }, endAdornment: (<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color: "text.secondary" }} /></InputAdornment>) }}
// // // // // // // //             sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }} />
// // // // // // // //         </Box>

// // // // // // // //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// // // // // // // //           <Divider sx={{ my: 2 }} />
// // // // // // // //           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16 }}>
// // // // // // // //             <TextField fullWidth label="검사구분" value={filters.inspType} onChange={(e) => this.handleFilterChange("inspType", e.target.value)} size="small" variant="outlined" />
// // // // // // // //             <TextField fullWidth label="작업구분" value={filters.workType} onChange={(e) => this.handleFilterChange("workType", e.target.value)} size="small" variant="outlined" />
// // // // // // // //             <TextField fullWidth label="주야구분" value={filters.shiftType} onChange={(e) => this.handleFilterChange("shiftType", e.target.value)} size="small" variant="outlined" />
// // // // // // // //             <TextField fullWidth label="Top N" type="number" value={filters.topN ?? 5} onChange={(e) => this.handleFilterChange("topN", e.target.value)} size="small" variant="outlined" />
// // // // // // // //           </Box>
// // // // // // // //         </Collapse>

// // // // // // // //         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
// // // // // // // //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">필터 초기화</Button>
// // // // // // // //           <Button variant="contained" startIcon={<SearchIcon />} size="large"
// // // // // // // //             sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // // // // // // //             onClick={() => { this.loadOptions(); this.loadAll(); }}>
// // // // // // // //             검색
// // // // // // // //           </Button>
// // // // // // // //           <Button variant="outlined" startIcon={<DownloadIcon />} size="large" onClick={this.exportCsv}>CSV 내보내기</Button>
// // // // // // // //         </Box>

// // // // // // // //         <InspectionItemModal
// // // // // // // //           open={this.state.itemCodeModalOpen}
// // // // // // // //           onClose={this.closeItemCodeModal}
// // // // // // // //           onSelect={this.handleItemCodeSelect}
// // // // // // // //           selectedItemCode={filters.partNo}
// // // // // // // //           plant={filters.factory}
// // // // // // // //           worker={filters.process}
// // // // // // // //           line={filters.equipment}
// // // // // // // //           startDate={filters.start_date}
// // // // // // // //           endDate={filters.end_date}
// // // // // // // //         />
// // // // // // // //       </Paper>
// // // // // // // //     );
// // // // // // // //   };

// // // // // // // //   /** 선택 일자의 Xn 표 (주/야 + 작업구분 라벨) — 행 정렬 적용 */
// // // // // // // //   renderDailyTable = () => {
// // // // // // // //     const { dailyCols, dailyTables, dailyShifts, dailyWorkHeaders, selectedDay, loading, filters } = this.state;
// // // // // // // //     const rawRows = selectedDay ? dailyTables[selectedDay] || [] : [];
// // // // // // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts); // 검사순번 오름차순

// // // // // // // //     const partText = filters.partNo ? filters.partNo : "전체 품번";
// // // // // // // //     const itemText = filters.item || "";
// // // // // // // //     const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

// // // // // // // //     return (
// // // // // // // //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // // // // // // //         <Box className={s.sectionHeader}>
// // // // // // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // // // // // //             작업순번(Xn) 결과표 — 주/야/작업구분
// // // // // // // //           </Typography>
// // // // // // // //             <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
// // // // // // // //               <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
// // // // // // // //               <Chip size="small" label={partText} />
// // // // // // // //               {itemText && <Chip size="small" variant="outlined" label={itemText} />}
// // // // // // // //               <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
// // // // // // // //               <Chip size="small" label={rangeText} />
// // // // // // // //               {selectedDay && (
// // // // // // // //                 <>
// // // // // // // //                   <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>보고일</Typography>
// // // // // // // //                   <Chip size="small" color="primary" variant="outlined" label={selectedDay} />
// // // // // // // //                 </>
// // // // // // // //               )}
// // // // // // // //             </Box>
// // // // // // // //         </Box>

// // // // // // // //         {loading ? (
// // // // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // // // //           </Box>
// // // // // // // //         ) : (
// // // // // // // //           <Box
// // // // // // // //             sx={{
// // // // // // // //               maxHeight: 600,
// // // // // // // //               overflow: "auto",
// // // // // // // //               borderRadius: 1,
// // // // // // // //               "& table": {
// // // // // // // //                 width: "100%",
// // // // // // // //                 borderCollapse: "separate",
// // // // // // // //                 borderSpacing: 0,
// // // // // // // //                 tableLayout: "fixed",                                            // ★ 고정 레이아웃
// // // // // // // //                 minWidth: calcTableMinWidth(dailyCols.length, dailyShifts.length) // ★ 최소폭 고정
// // // // // // // //               },
// // // // // // // //               "& th, & td": {
// // // // // // // //                 padding: "8px 10px",
// // // // // // // //                 borderBottom: "1px solid #eceff1",
// // // // // // // //                 fontSize: 13,
// // // // // // // //                 whiteSpace: "nowrap",                                            // ★ 줄바꿈 금지
// // // // // // // //                 overflow: "hidden",
// // // // // // // //                 textOverflow: "ellipsis",                                        // ★ 말줄임
// // // // // // // //                 height: 40,
// // // // // // // //                 lineHeight: "24px",
// // // // // // // //                 verticalAlign: "middle",
// // // // // // // //               },
// // // // // // // //               "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
// // // // // // // //               "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
// // // // // // // //             }}
// // // // // // // //           >
// // // // // // // //             <table>
// // // // // // // //               <thead>
// // // // // // // //                 <tr>
// // // // // // // //                   <th style={{ width: COL_W.no, textAlign: "center" }} rowSpan={3}>NO</th>
// // // // // // // //                   <th style={{ width: COL_W.name }} rowSpan={3}>검사항목명</th>
// // // // // // // //                   <th style={{ width: COL_W.spec }} rowSpan={3}>검사내용</th>
// // // // // // // //                   {dailyShifts.map((s) => (
// // // // // // // //                     <th key={s} colSpan={dailyCols.length} style={{ textAlign: "center" }}>{s || "전체"}</th>
// // // // // // // //                   ))}
// // // // // // // //                   <th rowSpan={3} style={{ width: COL_W.avg, textAlign: "right" }}>평균</th>
// // // // // // // //                 </tr>
// // // // // // // //                 <tr>
// // // // // // // //                   {dailyShifts.map((s) =>
// // // // // // // //                     dailyCols.map((c) => (
// // // // // // // //                       <th key={`${s}-${c}`} style={{ width: COL_W.data, textAlign: "center" }}>{c}</th>
// // // // // // // //                     ))
// // // // // // // //                   )}
// // // // // // // //                 </tr>
// // // // // // // //                 <tr>
// // // // // // // //                   {dailyShifts.map((s) =>
// // // // // // // //                     dailyCols.map((c) => (
// // // // // // // //                       <th
// // // // // // // //                         key={`${s}-${c}-work`}
// // // // // // // //                         style={{ width: COL_W.data, textAlign: "center", fontWeight: 600, color: "#607d8b" }}
// // // // // // // //                         title={dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // // // // // // //                       >
// // // // // // // //                         {dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // // // // // // //                       </th>
// // // // // // // //                     ))
// // // // // // // //                   )}
// // // // // // // //                 </tr>
// // // // // // // //               </thead>
// // // // // // // //               <tbody>
// // // // // // // //                 {rows.map((r, idx) => (
// // // // // // // //                   <tr key={idx}>
// // // // // // // //                     <td style={{ width: COL_W.no, textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
// // // // // // // //                     <td style={{ width: COL_W.name }} title={r["검사항목명"] ?? ""}>{r["검사항목명"] ?? ""}</td>
// // // // // // // //                     <td style={{ width: COL_W.spec }} title={r["검사내용"] ?? ""}>{r["검사내용"] ?? ""}</td>
// // // // // // // //                     {dailyShifts.map((s) =>
// // // // // // // //                       dailyCols.map((c) => (
// // // // // // // //                         <td key={`${idx}-${s}-${c}`} style={{ width: COL_W.data, textAlign: "right" }}>
// // // // // // // //                           {fmtNum(r?.[s]?.[c], 3)}
// // // // // // // //                         </td>
// // // // // // // //                       ))
// // // // // // // //                     )}
// // // // // // // //                     <td style={{ width: COL_W.avg, textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
// // // // // // // //                   </tr>
// // // // // // // //                 ))}
// // // // // // // //                 {(!rows || rows.length === 0) && (
// // // // // // // //                   <tr>
// // // // // // // //                     <td colSpan={3 + dailyShifts.length * dailyCols.length + 1} style={{ textAlign: "center", padding: "32px 0" }}>
// // // // // // // //                       데이터가 없습니다.
// // // // // // // //                     </td>
// // // // // // // //                   </tr>
// // // // // // // //                 )}
// // // // // // // //               </tbody>
// // // // // // // //             </table>
// // // // // // // //           </Box>
// // // // // // // //         )}
// // // // // // // //       </Paper>
// // // // // // // //     );
// // // // // // // //   };

// // // // // // // //   /** 선택 일자 기준 멀티라인 차트 데이터 (주/야 평균) */
// // // // // // // //   buildChartDataForSelectedDay = () => {
// // // // // // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // // // // // //     if (!selectedDay) return { seriesKeys: [], rows: [] };
// // // // // // // //     const rowsSrc = dailyTables[selectedDay] || [];

// // // // // // // //     const labelOf = (r) => {
// // // // // // // //       const name = r["검사항목명"] ?? "";
// // // // // // // //       const spec = r["검사내용"] ?? "";
// // // // // // // //       return spec ? `${name} | ${spec}` : name;
// // // // // // // //     };

// // // // // // // //     const rows = dailyCols.map((x) => {
// // // // // // // //       const row = { x };
// // // // // // // //       rowsSrc.forEach((r) => {
// // // // // // // //         const key = labelOf(r);
// // // // // // // //         let sum = 0, cnt = 0;
// // // // // // // //         dailyShifts.forEach((s) => {
// // // // // // // //           const v = r?.[s]?.[x];
// // // // // // // //           if (v != null && v !== "") { sum += Number(v); cnt += 1; }
// // // // // // // //         });
// // // // // // // //         row[key] = cnt > 0 ? sum / cnt : null;
// // // // // // // //       });
// // // // // // // //       return row;
// // // // // // // //     });

// // // // // // // //     const seriesKeys = rowsSrc.map((r) => labelOf(r));
// // // // // // // //     return { seriesKeys, rows };
// // // // // // // //   };

// // // // // // // //   /** Xn 멀티라인 차트 (선택 일자) */
// // // // // // // //   renderSelectedDayChart = () => {
// // // // // // // //     const { loading, selectedDay } = this.state;
// // // // // // // //     const { seriesKeys, rows } = this.buildChartDataForSelectedDay();

// // // // // // // //     return (
// // // // // // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // // // // //         <Box className={s.sectionHeader}>
// // // // // // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // // // // //             {selectedDay ? `${selectedDay} — 검사항목별 Xn 흐름` : "검사항목별 Xn 흐름"}
// // // // // // // //           </Typography>
// // // // // // // //         </Box>

// // // // // // // //         {loading ? (
// // // // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // // // //           </Box>
// // // // // // // //         ) : rows.length === 0 ? (
// // // // // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // // // // // //         ) : (
// // // // // // // //           <Box style={{ width: "100%", height: 380 }}>
// // // // // // // //             <ResponsiveContainer>
// // // // // // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // // // // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // // // // // //                 <XAxis dataKey="x" />
// // // // // // // //                 <YAxis />
// // // // // // // //                 <RTooltip />
// // // // // // // //                 <Legend />
// // // // // // // //                 {seriesKeys.map((k) => (
// // // // // // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // // // // // //                 ))}
// // // // // // // //               </LineChart>
// // // // // // // //             </ResponsiveContainer>
// // // // // // // //           </Box>
// // // // // // // //         )}
// // // // // // // //       </Paper>
// // // // // // // //     );
// // // // // // // //   };

// // // // // // // //   /** 숫자형(실측값) 검사항목 — 일자별 추이 차트 */
// // // // // // // //   buildNumericTrendChart = () => {
// // // // // // // //     const { numTrend } = this.state;
// // // // // // // //     const dates = numTrend?.dates || [];
// // // // // // // //     const series = numTrend?.series || [];
// // // // // // // //     if (dates.length === 0 || series.length === 0) return { keys: [], rows: [] };
// // // // // // // //     const rows = dates.map((d, i) => {
// // // // // // // //       const o = { date: d };
// // // // // // // //       series.forEach((s) => { o[s.label] = s.data?.[i] != null ? Number(s.data[i]) : null; });
// // // // // // // //       return o;
// // // // // // // //     });
// // // // // // // //     const keys = series.map((s) => s.label);
// // // // // // // //     return { keys, rows };
// // // // // // // //   };

// // // // // // // //   renderNumericTrendChart = () => {
// // // // // // // //     const { loading, filters } = this.state;
// // // // // // // //     const { keys, rows } = this.buildNumericTrendChart();
// // // // // // // //     return (
// // // // // // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // // // // //         <Box className={s.sectionHeader}>
// // // // // // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // // // // //             숫자형 검사항목 — 일자별 실측값 추이 (Top {filters.topN ?? 5})
// // // // // // // //           </Typography>
// // // // // // // //         </Box>
// // // // // // // //         {loading ? (
// // // // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // // // //           </Box>
// // // // // // // //         ) : rows.length === 0 ? (
// // // // // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // // // // // //         ) : (
// // // // // // // //           <Box style={{ width: "100%", height: 380 }}>
// // // // // // // //             <ResponsiveContainer>
// // // // // // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // // // // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // // // // // //                 <XAxis dataKey="date" />
// // // // // // // //                 <YAxis />
// // // // // // // //                 <RTooltip />
// // // // // // // //                 <Legend />
// // // // // // // //                 {keys.map((k) => (
// // // // // // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // // // // // //                 ))}
// // // // // // // //               </LineChart>
// // // // // // // //             </ResponsiveContainer>
// // // // // // // //           </Box>
// // // // // // // //         )}
// // // // // // // //       </Paper>
// // // // // // // //     );
// // // // // // // //   };

// // // // // // // //   render() {
// // // // // // // //     const { error, dailyList, selectedDay } = this.state;

// // // // // // // //     return (
// // // // // // // //       <Box className={s.root}>
// // // // // // // //         {/* 필터 바 */}
// // // // // // // //         {this.renderFilterBar()}

// // // // // // // //         {/* 에러 */}
// // // // // // // //         {error && (
// // // // // // // //           <Box sx={{ mb: 2 }}>
// // // // // // // //             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
// // // // // // // //             <Button variant="contained" onClick={this.loadAll}
// // // // // // // //               sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}>
// // // // // // // //               다시 시도
// // // // // // // //             </Button>
// // // // // // // //           </Box>
// // // // // // // //         )}

// // // // // // // //         {/* 본문: 좌측 날짜 목록 + 우측 표/차트 */}
// // // // // // // //         <Box className={s.dailyLayout}>
// // // // // // // //           <Paper className={s.dayPanel}>
// // // // // // // //             <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a", mb: 1 }}>보고일</Typography>

// // // // // // // //             <Box className={s.dayList}>
// // // // // // // //               <div className={s.dayListHead}>
// // // // // // // //                 <span>보고일</span>
// // // // // // // //                 <span>설비</span>
// // // // // // // //                 <span>품번</span>
// // // // // // // //               </div>
// // // // // // // //               <div className={s.dayListBody}>
// // // // // // // //                 {dailyList.map(({ d, equipment, partNo }) => (
// // // // // // // //                   <div key={d}
// // // // // // // //                        className={`${s.dayRow} ${selectedDay === d ? s.active : ""}`}
// // // // // // // //                        onClick={() => this.setState({ selectedDay: d })}>
// // // // // // // //                     <span>{d}</span>
// // // // // // // //                     <span>{equipment || "-"}</span>
// // // // // // // //                     <span>{partNo || "-"}</span>
// // // // // // // //                   </div>
// // // // // // // //                 ))}
// // // // // // // //                 {(!dailyList || dailyList.length === 0) && (
// // // // // // // //                   <div className={s.dayEmpty}>기간/필터 조건에 해당하는 결과가 없습니다.</div>
// // // // // // // //                 )}
// // // // // // // //               </div>
// // // // // // // //             </Box>
// // // // // // // //           </Paper>

// // // // // // // //           <Box className={s.rightArea}>
// // // // // // // //             {this.renderDailyTable()}
// // // // // // // //             {this.renderSelectedDayChart()}
// // // // // // // //             {this.renderNumericTrendChart()}
// // // // // // // //           </Box>
// // // // // // // //         </Box>
// // // // // // // //       </Box>
// // // // // // // //     );
// // // // // // // //   }
// // // // // // // // }

// // // // // // // // export default InspectionSystemChart;


// // // // // // // // src/pages/inspection/InspectionSystemChart.js
// // // // // // // import React, { Component } from "react";
// // // // // // // import config from "../../config";

// // // // // // // import {
// // // // // // //   Box,
// // // // // // //   Paper,
// // // // // // //   Typography,
// // // // // // //   CardHeader,
// // // // // // //   IconButton,
// // // // // // //   Divider,
// // // // // // //   Collapse,
// // // // // // //   CircularProgress,
// // // // // // //   Alert,
// // // // // // //   Menu,
// // // // // // //   MenuItem,
// // // // // // //   TextField,
// // // // // // //   Button,
// // // // // // //   InputAdornment,
// // // // // // //   Chip,
// // // // // // // } from "@mui/material";
// // // // // // // import { Autocomplete } from "@mui/material";

// // // // // // // import {
// // // // // // //   Search as SearchIcon,
// // // // // // //   Clear as ClearIcon,
// // // // // // //   FilterList as FilterIcon,
// // // // // // //   ExpandMore as ExpandMoreIcon,
// // // // // // //   ExpandLess as ExpandLessIcon,
// // // // // // //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // // // // // //   FileDownload as DownloadIcon,
// // // // // // // } from "@mui/icons-material";

// // // // // // // import {
// // // // // // //   ResponsiveContainer,
// // // // // // //   LineChart,
// // // // // // //   Line,
// // // // // // //   XAxis,
// // // // // // //   YAxis,
// // // // // // //   CartesianGrid,
// // // // // // //   Tooltip as RTooltip,
// // // // // // //   Legend,
// // // // // // // } from "recharts";

// // // // // // // import InspectionItemModal from "../common/InspectionItemModal";
// // // // // // // import s from "./InspectionSystemChart.module.scss";

// // // // // // // /** ---------- helpers ---------- */
// // // // // // // const mainColor = "#1e88e5";

// // // // // // // const fmtNum = (v, d = null) => {
// // // // // // //   if (v === null || v === undefined || v === "") return "";
// // // // // // //   const n = Number(v);
// // // // // // //   if (Number.isNaN(n)) return String(v);
// // // // // // //   return d === null
// // // // // // //     ? n.toLocaleString()
// // // // // // //     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// // // // // // // };

// // // // // // // const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
// // // // // // // const today0 = () => {
// // // // // // //   const t = new Date();
// // // // // // //   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// // // // // // // };
// // // // // // // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // // // // // const getAnchorPos = (el) => {
// // // // // // //   if (!el) return null;
// // // // // // //   const r = el.getBoundingClientRect();
// // // // // // //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // // // // // // };
// // // // // // // const startOfWeek = (d) => {
// // // // // // //   const day = d.getDay();
// // // // // // //   const diff = (day === 0 ? -6 : 1) - day;
// // // // // // //   const s2 = new Date(d);
// // // // // // //   s2.setDate(d.getDate() + diff);
// // // // // // //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate());
// // // // // // // };
// // // // // // // const endOfWeek = (d) => {
// // // // // // //   const s2 = startOfWeek(d);
// // // // // // //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate() + 6);
// // // // // // // };
// // // // // // // const getWeeksOfMonth = (year, month) => {
// // // // // // //   const first = new Date(year, month - 1, 1);
// // // // // // //   const last = lastOfMonth(first);
// // // // // // //   let cur = startOfWeek(first);
// // // // // // //   const out = [];
// // // // // // //   let idx = 1;
// // // // // // //   while (cur <= last) {
// // // // // // //     const s = new Date(cur),
// // // // // // //       e = endOfWeek(cur);
// // // // // // //     const clipS = new Date(Math.max(s, first));
// // // // // // //     const clipE = new Date(Math.min(e, last));
// // // // // // //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// // // // // // //     idx += 1;
// // // // // // //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// // // // // // //   }
// // // // // // //   return out;
// // // // // // // };

// // // // // // // /** 기본 필터 */
// // // // // // // const getDefaultFilters = () => {
// // // // // // //   const y = new Date().getFullYear();
// // // // // // //   return {
// // // // // // //     start_date: iso(new Date(y, 0, 1)),
// // // // // // //     end_date: iso(new Date(y, 11, 31)),
// // // // // // //     factory: "아진산업-본사(경산)",
// // // // // // //     process: "프레스",
// // // // // // //     equipment: "1500T(E라인)",
// // // // // // //     partNo: "",
// // // // // // //     item: "",
// // // // // // //     inspType: "",
// // // // // // //     workType: "",
// // // // // // //     shiftType: "",
// // // // // // //     topN: 5,
// // // // // // //   };
// // // // // // // };

// // // // // // // /** ---- 표 틀 고정용 기본 폭 정의 ---- */
// // // // // // // const COL_W = {
// // // // // // //   no: 64, // NO
// // // // // // //   name: 180, // 검사항목명
// // // // // // //   specBase: 320, // 검사내용 "기본" 폭(동적 계산의 최소값)
// // // // // // //   data: 96, // Xn 데이터 열(모두 동일)
// // // // // // //   avg: 100, // 평균
// // // // // // // };
// // // // // // // const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

// // // // // // // /** 전체 표의 최소폭 계산 (검사내용 폭을 인자로 받음) */
// // // // // // // const calcTableMinWidth = (colsLen, shiftsLen, specW) => {
// // // // // // //   const dataCols = (colsLen || 0) * (shiftsLen || 0);
// // // // // // //   return COL_W.no + COL_W.name + specW + dataCols * COL_W.data + COL_W.avg;
// // // // // // // };

// // // // // // // /** ----- 정렬 유틸 (빠져서 에러났던 부분 복구) ----- */
// // // // // // // const firstSeqIndex = (row, cols, shifts) => {
// // // // // // //   for (let i = 0; i < cols.length; i += 1) {
// // // // // // //     const c = cols[i];
// // // // // // //     for (const s of shifts) {
// // // // // // //       const v = row?.[s]?.[c];
// // // // // // //       if (v !== null && v !== undefined && v !== "") return i + 1;
// // // // // // //     }
// // // // // // //   }
// // // // // // //   return Number.MAX_SAFE_INTEGER;
// // // // // // // };
// // // // // // // const getInspectionSeq = (row, cols, shifts) => {
// // // // // // //   const raw = row?.["검사순번"];
// // // // // // //   const n = Number(raw);
// // // // // // //   if (raw !== undefined && raw !== null && !Number.isNaN(n)) return n;
// // // // // // //   return firstSeqIndex(row, cols, shifts);
// // // // // // // };
// // // // // // // const sortRowsByInspectionSeqAsc = (rows, cols, shifts) => {
// // // // // // //   return [...rows].sort((a, b) => {
// // // // // // //     const ia = getInspectionSeq(a, cols, shifts);
// // // // // // //     const ib = getInspectionSeq(b, cols, shifts);
// // // // // // //     if (ia !== ib) return ia - ib;
// // // // // // //     const an = (a["검사항목명"] || "").localeCompare(b["검사항목명"] || "");
// // // // // // //     if (an !== 0) return an;
// // // // // // //     return (a["검사내용"] || "").localeCompare(b["검사내용"] || "");
// // // // // // //   });
// // // // // // // };

// // // // // // // class InspectionSystemChart extends Component {
// // // // // // //   state = {
// // // // // // //     filters: getDefaultFilters(),

// // // // // // //     // ✅ 보고일 목록 + 표 데이터(주/야 + 작업구분 라벨)
// // // // // // //     dailyCols: [],
// // // // // // //     dailyDays: [],
// // // // // // //     dailyList: [], // [{ d, equipment, partNo }]
// // // // // // //     dailyTables: {}, // rows 안에 "검사순번" 포함
// // // // // // //     dailyShifts: [],
// // // // // // //     dailyWorkHeaders: {},
// // // // // // //     selectedDay: null,

// // // // // // //     // ✅ 숫자형(실측값) 검사항목 추이
// // // // // // //     numTrend: { dates: [], series: [] },

// // // // // // //     // 옵션
// // // // // // //     factories: [],
// // // // // // //     processes: [],
// // // // // // //     equipments: [],
// // // // // // //     parts: [],
// // // // // // //     items: [],
// // // // // // //     optionsLoading: false,

// // // // // // //     // UI
// // // // // // //     loading: false,
// // // // // // //     error: "",
// // // // // // //     filterExpanded: false,

// // // // // // //     // 프리셋 상태/앵커
// // // // // // //     selectedYear: new Date().getFullYear(),
// // // // // // //     selectedMonth: new Date().getMonth() + 1,
// // // // // // //     yearAnchorPos: null,
// // // // // // //     monthAnchorPos: null,
// // // // // // //     weekAnchorPos: null,

// // // // // // //     years: [],

// // // // // // //     // 모달
// // // // // // //     itemCodeModalOpen: false,

// // // // // // //     // ⬇︎ 동적 "검사내용" 폭(px)
// // // // // // //     specColWidth: COL_W.specBase,
// // // // // // //   };

// // // // // // //   /** canvas context 캐시 */
// // // // // // //   _measureCtx = null;
// // // // // // //   getMeasureCtx = () => {
// // // // // // //     if (typeof document === "undefined") return null;
// // // // // // //     if (!this._measureCtx) {
// // // // // // //       const canvas = document.createElement("canvas");
// // // // // // //       this._measureCtx = canvas.getContext("2d");
// // // // // // //     }
// // // // // // //     return this._measureCtx;
// // // // // // //   };
// // // // // // //   /** 테이블 폰트 기준으로 텍스트 픽셀폭 측정 */
// // // // // // //   measureTextPx = (text) => {
// // // // // // //     const ctx = this.getMeasureCtx();
// // // // // // //     const font = '13px "Noto Sans KR", Roboto, Apple SD Gothic Neo, Arial, sans-serif';
// // // // // // //     if (!ctx) return String(text ?? "").length * 12; // SSR 등 fallback
// // // // // // //     ctx.font = font;
// // // // // // //     return ctx.measureText(String(text ?? "")).width;
// // // // // // //   };
// // // // // // //   /** 전체 dailyTables에서 검사내용 최장폭(px) 계산 */
// // // // // // //   computeSpecWidthFromTables = (tables) => {
// // // // // // //     let longestPx = this.measureTextPx("검사내용"); // 누적 최장값
// // // // // // //     const addPad = 36; // 좌우 패딩/여백 보정
// // // // // // //     const minPx = COL_W.specBase; // 너무 작지 않게
// // // // // // //     const hardMaxPx = 720; // 너무 넓어지지 않게 (원하면 조정)

// // // // // // //     Object.values(tables || {}).forEach((rows) => {
// // // // // // //       (rows || []).forEach((r) => {
// // // // // // //         const px = this.measureTextPx(r?.["검사내용"]);
// // // // // // //         if (px > longestPx) longestPx = px;
// // // // // // //       });
// // // // // // //     });

// // // // // // //     return clamp(Math.ceil(longestPx) + addPad, minPx, hardMaxPx);
// // // // // // //   };

// // // // // // //   componentDidMount() {
// // // // // // //     const base = getDefaultFilters();
// // // // // // //     const saved = localStorage.getItem("inspectionFilters");
// // // // // // //     if (saved) {
// // // // // // //       try {
// // // // // // //         const parsed = JSON.parse(saved);
// // // // // // //         const merged = { ...base, ...parsed };
// // // // // // //         merged.factory = merged.factory || base.factory;
// // // // // // //         merged.process = merged.process || base.process;
// // // // // // //         merged.equipment = merged.equipment || base.equipment;
// // // // // // //         this.setState({ filters: merged });
// // // // // // //       } catch {
// // // // // // //         this.setState({ filters: base });
// // // // // // //       }
// // // // // // //     } else {
// // // // // // //       this.setState({ filters: base });
// // // // // // //     }
// // // // // // //     this.bootstrap();
// // // // // // //   }

// // // // // // //   /** --------- API ---------- */
// // // // // // //   post = async (path, body) => {
// // // // // // //     const headers = { "Content-Type": "application/json" };
// // // // // // //     const res = await fetch(
// // // // // // //       `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
// // // // // // //       { method: "POST", headers, body: JSON.stringify(body || {}) }
// // // // // // //     );
// // // // // // //     if (!res.ok) {
// // // // // // //       const t = await res.text().catch(() => "");
// // // // // // //       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// // // // // // //     }
// // // // // // //     const json = await res.json();
// // // // // // //     return json.data || [];
// // // // // // //   };

// // // // // // //   bootstrap = async () => {
// // // // // // //     await this.loadYears();
// // // // // // //     await this.loadOptions();
// // // // // // //     this.loadAll();
// // // // // // //   };

// // // // // // //   loadOptions = async () => {
// // // // // // //     const { filters } = this.state;
// // // // // // //     this.setState({ optionsLoading: true });
// // // // // // //     try {
// // // // // // //       const [factories, processes, equipments, parts, items] = await Promise.all([
// // // // // // //         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
// // // // // // //         this.post("/options/processes", { ...filters }),
// // // // // // //         this.post("/options/equipments", { ...filters }),
// // // // // // //         this.post("/options/parts", { ...filters }),
// // // // // // //         this.post("/options/items", { ...filters }),
// // // // // // //       ]);
// // // // // // //       this.setState({ factories, processes, equipments, parts, items, optionsLoading: false });
// // // // // // //     } catch (e) {
// // // // // // //       console.error(e);
// // // // // // //       this.setState({ optionsLoading: false });
// // // // // // //     }
// // // // // // //   };

// // // // // // //   /** 연도 옵션 */
// // // // // // //   loadYears = async () => {
// // // // // // //     try {
// // // // // // //       const raw = await this.post("/options/years", { ...this.state.filters });
// // // // // // //       let years = Array.isArray(raw) ? raw.map((y) => Number(y)).filter(Boolean) : [];
// // // // // // //       if (!years.length) throw new Error("no years");
// // // // // // //       years.sort((a, b) => b - a);
// // // // // // //       this.setState({ years, selectedYear: years[0] });
// // // // // // //     } catch {
// // // // // // //       const y = new Date().getFullYear();
// // // // // // //       const years = [y, y - 1, y - 2, y - 3, y - 4];
// // // // // // //       this.setState({ years, selectedYear: y });
// // // // // // //     }
// // // // // // //   };

// // // // // // //   /** 필터 변경 */
// // // // // // //   handleFilterChange = async (field, value) => {
// // // // // // //     this.setState(
// // // // // // //       (prev) => {
// // // // // // //         const f = { ...prev.filters, [field]: value };
// // // // // // //         if (field === "factory") {
// // // // // // //           f.process = "";
// // // // // // //           f.equipment = "";
// // // // // // //           f.partNo = "";
// // // // // // //           f.item = "";
// // // // // // //         } else if (field === "process") {
// // // // // // //           f.equipment = "";
// // // // // // //           f.partNo = "";
// // // // // // //           f.item = "";
// // // // // // //         } else if (field === "equipment") {
// // // // // // //           f.partNo = "";
// // // // // // //           f.item = "";
// // // // // // //         } else if (field === "start_date" || field === "end_date") {
// // // // // // //           f.partNo = "";
// // // // // // //           f.item = "";
// // // // // // //         } else if (field === "topN") {
// // // // // // //           f.topN = Number(value) || 5;
// // // // // // //         }
// // // // // // //         return { filters: f };
// // // // // // //       },
// // // // // // //       async () => {
// // // // // // //         await this.loadOptions();
// // // // // // //         await this.loadAll();
// // // // // // //       }
// // // // // // //     );
// // // // // // //   };

// // // // // // //   /** 날짜 프리셋/범위 */
// // // // // // //   setDateRange = async (start, end) => {
// // // // // // //     const start_date = iso(start);
// // // // // // //     const end_date = iso(end);
// // // // // // //     this.setState(
// // // // // // //       (prev) => ({
// // // // // // //         filters: { ...prev.filters, start_date, end_date, partNo: "", item: "" },
// // // // // // //       }),
// // // // // // //       async () => {
// // // // // // //         try {
// // // // // // //           localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
// // // // // // //         } catch {}
// // // // // // //         await this.loadOptions();
// // // // // // //         this.loadAll();
// // // // // // //       }
// // // // // // //     );
// // // // // // //   };
// // // // // // //   applyToday = () => {
// // // // // // //     const t = today0();
// // // // // // //     this.setDateRange(t, t);
// // // // // // //   };
// // // // // // //   selectYear = (y) => {
// // // // // // //     const s = new Date(y, 0, 1);
// // // // // // //     const e = new Date(y, 11, 31);
// // // // // // //     this.setState({ selectedYear: y, yearAnchorPos: null });
// // // // // // //     this.setDateRange(s, e);
// // // // // // //   };
// // // // // // //   selectMonth = (m) => {
// // // // // // //     const y = this.state.selectedYear;
// // // // // // //     const s = new Date(y, m - 1, 1);
// // // // // // //     const e = lastOfMonth(s);
// // // // // // //     this.setState({ monthAnchorPos: null, selectedMonth: m });
// // // // // // //     this.setDateRange(s, e);
// // // // // // //   };
// // // // // // //   selectWeek = (w) => {
// // // // // // //     this.setState({ weekAnchorPos: null });
// // // // // // //     this.setDateRange(w.start, w.end);
// // // // // // //   };

// // // // // // //   /** 전체 초기화 */
// // // // // // //   resetToThisYear = async () => {
// // // // // // //     const y = new Date().getFullYear();
// // // // // // //     const filters = { ...getDefaultFilters(), start_date: iso(new Date(y, 0, 1)), end_date: iso(new Date(y, 11, 31)) };
// // // // // // //     this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth() + 1 }, async () => {
// // // // // // //       try {
// // // // // // //         localStorage.removeItem("inspectionFilters");
// // // // // // //       } catch {}
// // // // // // //       await this.loadOptions();
// // // // // // //       this.loadAll();
// // // // // // //     });
// // // // // // //   };

// // // // // // //   /** 데이터 로드 */
// // // // // // //   loadAll = async () => {
// // // // // // //     const { filters } = this.state;
// // // // // // //     try {
// // // // // // //       localStorage.setItem("inspectionFilters", JSON.stringify(filters));
// // // // // // //     } catch {}
// // // // // // //     this.setState({ loading: true, error: "" });
// // // // // // //     try {
// // // // // // //       const daily = await this.post("/xn_daily", filters);
// // // // // // //       const numeric = await this.post("/numeric_trend", filters);

// // // // // // //       const cols = daily?.cols || [];
// // // // // // //       const days = daily?.days || [];
// // // // // // //       const tables = daily?.tables || {};
// // // // // // //       const shifts = daily?.shifts || [];
// // // // // // //       const workHeaders = daily?.workHeaders || {};
// // // // // // //       const dayList = daily?.dayList || (days || []).map((d) => ({ d, equipment: "", partNo: "" }));

// // // // // // //       // ★ 검사내용 최장폭 픽셀 계산
// // // // // // //       const specColWidth = this.computeSpecWidthFromTables(tables);

// // // // // // //       this.setState({
// // // // // // //         dailyCols: cols,
// // // // // // //         dailyDays: days,
// // // // // // //         dailyList: dayList,
// // // // // // //         dailyTables: tables,
// // // // // // //         dailyShifts: shifts,
// // // // // // //         dailyWorkHeaders: workHeaders,
// // // // // // //         selectedDay: dayList?.[0]?.d || days?.[0] || null,
// // // // // // //         numTrend: numeric || { dates: [], series: [] },
// // // // // // //         specColWidth,
// // // // // // //         loading: false,
// // // // // // //       });
// // // // // // //     } catch (e) {
// // // // // // //       console.error(e);
// // // // // // //       this.setState({ error: "데이터를 불러오지 못했습니다.", loading: false });
// // // // // // //     }
// // // // // // //   };

// // // // // // //   /** CSV 내보내기: 행은 검사순번 오름차순 정렬 적용 */
// // // // // // //   exportCsv = () => {
// // // // // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // // // // //     if (!selectedDay) return;
// // // // // // //     const rawRows = dailyTables[selectedDay] || [];
// // // // // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// // // // // // //     const headLeft = ["NO", "검사항목명", "검사내용"];
// // // // // // //     const headMid = dailyShifts.flatMap((s) => dailyCols.map((c) => `${s}-${c}`));
// // // // // // //     const header = [...headLeft, ...headMid, "평균"];

// // // // // // //     const csvRows = [
// // // // // // //       header,
// // // // // // //       ...rows.map((r, idx) => {
// // // // // // //         const vals = dailyShifts.flatMap((s) => dailyCols.map((c) => r?.[s]?.[c] ?? ""));
// // // // // // //         return [String(idx + 1), r["검사항목명"] ?? "", r["검사내용"] ?? "", ...vals, r["평균"] ?? ""];
// // // // // // //       }),
// // // // // // //     ];
// // // // // // //     const csv = csvRows.map((r) => r.join(",")).join("\n");
// // // // // // //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // // // // // //     const url = URL.createObjectURL(blob);
// // // // // // //     const a = document.createElement("a");
// // // // // // //     a.href = url;
// // // // // // //     a.download = `xn_daily_${selectedDay}.csv`;
// // // // // // //     a.click();
// // // // // // //     URL.revokeObjectURL(url);
// // // // // // //   };

// // // // // // //   /** 품번/품명 모달 */
// // // // // // //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// // // // // // //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// // // // // // //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// // // // // // //     this.setState(
// // // // // // //       (prev) => ({
// // // // // // //         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
// // // // // // //         itemCodeModalOpen: false,
// // // // // // //       }),
// // // // // // //       () => {
// // // // // // //         this.loadOptions();
// // // // // // //         this.loadAll();
// // // // // // //       }
// // // // // // //     );
// // // // // // //   };

// // // // // // //   // ---------- 상단 필터 ----------
// // // // // // //   renderFilterBar = () => {
// // // // // // //     const { filters } = this.state;

// // // // // // //     const now = today0();
// // // // // // //     const thisYear = now.getFullYear();
// // // // // // //     const thisMonth = now.getMonth() + 1;
// // // // // // //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// // // // // // //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// // // // // // //     return (
// // // // // // //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// // // // // // //         <CardHeader
// // // // // // //           title={
// // // // // // //             <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
// // // // // // //               <FilterIcon /> 검색 조건
// // // // // // //             </Typography>
// // // // // // //           }
// // // // // // //           action={
// // // // // // //             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
// // // // // // //               <Button
// // // // // // //                 size="small"
// // // // // // //                 variant="outlined"
// // // // // // //                 color="success"
// // // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // // //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // // // //               >
// // // // // // //                 연간
// // // // // // //               </Button>
// // // // // // //               <Menu
// // // // // // //                 open={!!this.state.yearAnchorPos}
// // // // // // //                 onClose={() => this.setState({ yearAnchorPos: null })}
// // // // // // //                 anchorReference="anchorPosition"
// // // // // // //                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// // // // // // //               >
// // // // // // //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>
// // // // // // //                   올해
// // // // // // //                 </MenuItem>
// // // // // // //                 {this.state.years.map((y) => (
// // // // // // //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
// // // // // // //                     {y}년
// // // // // // //                   </MenuItem>
// // // // // // //                 ))}
// // // // // // //               </Menu>

// // // // // // //               <Button
// // // // // // //                 size="small"
// // // // // // //                 variant="outlined"
// // // // // // //                 color="success"
// // // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // // //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // // // //               >
// // // // // // //                 월간
// // // // // // //               </Button>
// // // // // // //               <Menu
// // // // // // //                 open={!!this.state.monthAnchorPos}
// // // // // // //                 onClose={() => this.setState({ monthAnchorPos: null })}
// // // // // // //                 anchorReference="anchorPosition"
// // // // // // //                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// // // // // // //               >
// // // // // // //                 <MenuItem
// // // // // // //                   dense
// // // // // // //                   onClick={() => {
// // // // // // //                     this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth));
// // // // // // //                   }}
// // // // // // //                 >
// // // // // // //                   이번달
// // // // // // //                 </MenuItem>
// // // // // // //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // // // // // //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// // // // // // //                     {this.state.selectedYear}년 {m}월
// // // // // // //                   </MenuItem>
// // // // // // //                 ))}
// // // // // // //               </Menu>

// // // // // // //               <Button
// // // // // // //                 size="small"
// // // // // // //                 variant="outlined"
// // // // // // //                 color="success"
// // // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // // //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // // // //               >
// // // // // // //                 주간
// // // // // // //               </Button>
// // // // // // //               <Menu
// // // // // // //                 open={!!this.state.weekAnchorPos}
// // // // // // //                 onClose={() => this.setState({ weekAnchorPos: null })}
// // // // // // //                 anchorReference="anchorPosition"
// // // // // // //                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
// // // // // // //               >
// // // // // // //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// // // // // // //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// // // // // // //                 </MenuItem>
// // // // // // //                 {weeks.map((w, i) => (
// // // // // // //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// // // // // // //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// // // // // // //                   </MenuItem>
// // // // // // //                 ))}
// // // // // // //               </Menu>

// // // // // // //               <Button
// // // // // // //                 size="small"
// // // // // // //                 variant="outlined"
// // // // // // //                 color="success"
// // // // // // //                 onClick={this.applyToday}
// // // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // // // //               >
// // // // // // //                 오늘
// // // // // // //               </Button>

// // // // // // //               <Typography sx={{ color: "white", opacity: 0.8, mx: 0.5 }}>|</Typography>
// // // // // // //               <Typography sx={{ color: "white" }}>기간선택</Typography>
// // // // // // //               <TextField
// // // // // // //                 type="date"
// // // // // // //                 value={filters.start_date}
// // // // // // //                 onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// // // // // // //                 size="small"
// // // // // // //                 variant="outlined"
// // // // // // //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// // // // // // //                 InputLabelProps={{ shrink: true }}
// // // // // // //               />
// // // // // // //               <Typography sx={{ color: "white" }}>~</Typography>
// // // // // // //               <TextField
// // // // // // //                 type="date"
// // // // // // //                 value={filters.end_date}
// // // // // // //                 onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// // // // // // //                 size="small"
// // // // // // //                 variant="outlined"
// // // // // // //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// // // // // // //                 InputLabelProps={{ shrink: true }}
// // // // // // //               />

// // // // // // //               <IconButton
// // // // // // //                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
// // // // // // //                 sx={{ color: "white" }}
// // // // // // //               >
// // // // // // //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// // // // // // //               </IconButton>
// // // // // // //             </Box>
// // // // // // //           }
// // // // // // //           sx={{ backgroundColor: "#ff8f00", color: "white", borderRadius: 1, mb: 2 }}
// // // // // // //         />

// // // // // // //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// // // // // // //         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 2, mb: 1 }}>
// // // // // // //           <Autocomplete
// // // // // // //             size="small"
// // // // // // //             options={this.state.factories}
// // // // // // //             value={filters.factory || null}
// // // // // // //             onChange={(_, v) => this.handleFilterChange("factory", v || "")}
// // // // // // //             renderInput={(params) => <TextField {...params} label="공장" />}
// // // // // // //             clearOnEscape
// // // // // // //           />
// // // // // // //           <Autocomplete
// // // // // // //             size="small"
// // // // // // //             options={this.state.processes}
// // // // // // //             value={filters.process || null}
// // // // // // //             onChange={(_, v) => this.handleFilterChange("process", v || "")}
// // // // // // //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
// // // // // // //             clearOnEscape
// // // // // // //           />
// // // // // // //           <Autocomplete
// // // // // // //             size="small"
// // // // // // //             options={this.state.equipments}
// // // // // // //             value={filters.equipment || null}
// // // // // // //             onChange={(_, v) => this.handleFilterChange("equipment", v || "")}
// // // // // // //             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
// // // // // // //             clearOnEscape
// // // // // // //           />
// // // // // // //           <TextField
// // // // // // //             fullWidth
// // // // // // //             label="품번"
// // // // // // //             value={filters.partNo}
// // // // // // //             onClick={this.openItemCodeModal}
// // // // // // //             size="small"
// // // // // // //             variant="outlined"
// // // // // // //             InputProps={{
// // // // // // //               readOnly: true,
// // // // // // //               style: { cursor: "pointer" },
// // // // // // //               endAdornment: (
// // // // // // //                 <InputAdornment position="end">
// // // // // // //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// // // // // // //                 </InputAdornment>
// // // // // // //               ),
// // // // // // //             }}
// // // // // // //             sx={{
// // // // // // //               "& .MuiInputBase-root": {
// // // // // // //                 cursor: "pointer",
// // // // // // //                 "&:hover": { backgroundColor: "#f5f5f5" },
// // // // // // //               },
// // // // // // //             }}
// // // // // // //           />
// // // // // // //           <TextField
// // // // // // //             fullWidth
// // // // // // //             label="품명(검사항목)"
// // // // // // //             value={filters.item}
// // // // // // //             onClick={this.openItemCodeModal}
// // // // // // //             size="small"
// // // // // // //             variant="outlined"
// // // // // // //             InputProps={{
// // // // // // //               readOnly: true,
// // // // // // //               style: { cursor: "pointer" },
// // // // // // //               endAdornment: (
// // // // // // //                 <InputAdornment position="end">
// // // // // // //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// // // // // // //                 </InputAdornment>
// // // // // // //               ),
// // // // // // //             }}
// // // // // // //             sx={{
// // // // // // //               "& .MuiInputBase-root": {
// // // // // // //                 cursor: "pointer",
// // // // // // //                 "&:hover": { backgroundColor: "#f5f5f5" },
// // // // // // //               },
// // // // // // //             }}
// // // // // // //           />
// // // // // // //         </Box>

// // // // // // //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// // // // // // //           <Divider sx={{ my: 2 }} />
// // // // // // //           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16 }}>
// // // // // // //             <TextField
// // // // // // //               fullWidth
// // // // // // //               label="검사구분"
// // // // // // //               value={filters.inspType}
// // // // // // //               onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
// // // // // // //               size="small"
// // // // // // //               variant="outlined"
// // // // // // //             />
// // // // // // //             <TextField
// // // // // // //               fullWidth
// // // // // // //               label="작업구분"
// // // // // // //               value={filters.workType}
// // // // // // //               onChange={(e) => this.handleFilterChange("workType", e.target.value)}
// // // // // // //               size="small"
// // // // // // //               variant="outlined"
// // // // // // //             />
// // // // // // //             <TextField
// // // // // // //               fullWidth
// // // // // // //               label="주야구분"
// // // // // // //               value={filters.shiftType}
// // // // // // //               onChange={(e) => this.handleFilterChange("shiftType", e.target.value)}
// // // // // // //               size="small"
// // // // // // //               variant="outlined"
// // // // // // //             />
// // // // // // //             <TextField
// // // // // // //               fullWidth
// // // // // // //               label="Top N"
// // // // // // //               type="number"
// // // // // // //               value={filters.topN ?? 5}
// // // // // // //               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
// // // // // // //               size="small"
// // // // // // //               variant="outlined"
// // // // // // //             />
// // // // // // //           </Box>
// // // // // // //         </Collapse>

// // // // // // //         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
// // // // // // //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
// // // // // // //             필터 초기화
// // // // // // //           </Button>
// // // // // // //           <Button
// // // // // // //             variant="contained"
// // // // // // //             startIcon={<SearchIcon />}
// // // // // // //             size="large"
// // // // // // //             sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // // // // // //             onClick={() => {
// // // // // // //               this.loadOptions();
// // // // // // //               this.loadAll();
// // // // // // //             }}
// // // // // // //           >
// // // // // // //             검색
// // // // // // //           </Button>
// // // // // // //           <Button variant="outlined" startIcon={<DownloadIcon />} size="large" onClick={this.exportCsv}>
// // // // // // //             CSV 내보내기
// // // // // // //           </Button>
// // // // // // //         </Box>

// // // // // // //         <InspectionItemModal
// // // // // // //           open={this.state.itemCodeModalOpen}
// // // // // // //           onClose={this.closeItemCodeModal}
// // // // // // //           onSelect={this.handleItemCodeSelect}
// // // // // // //           selectedItemCode={filters.partNo}
// // // // // // //           plant={filters.factory}
// // // // // // //           worker={filters.process}
// // // // // // //           line={filters.equipment}
// // // // // // //           startDate={filters.start_date}
// // // // // // //           endDate={filters.end_date}
// // // // // // //         />
// // // // // // //       </Paper>
// // // // // // //     );
// // // // // // //   };

// // // // // // //   /** 선택 일자의 Xn 표 (주/야 + 작업구분 라벨) — 행 정렬 적용 */
// // // // // // //   renderDailyTable = () => {
// // // // // // //     const { dailyCols, dailyTables, dailyShifts, dailyWorkHeaders, selectedDay, loading, filters, specColWidth } =
// // // // // // //       this.state;

// // // // // // //     const rawRows = selectedDay ? dailyTables[selectedDay] || [] : [];
// // // // // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts); // 검사순번 오름차순

// // // // // // //     const partText = filters.partNo ? filters.partNo : "전체 품번";
// // // // // // //     const itemText = filters.item || "";
// // // // // // //     const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

// // // // // // //     const tableMinW = calcTableMinWidth(dailyCols.length, dailyShifts.length, specColWidth);

// // // // // // //     return (
// // // // // // //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // // // // // //         <Box className={s.sectionHeader}>
// // // // // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // // // // //             작업순번(Xn) 결과표 — 주/야/작업구분
// // // // // // //           </Typography>
// // // // // // //           <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
// // // // // // //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
// // // // // // //             <Chip size="small" label={partText} />
// // // // // // //             {itemText && <Chip size="small" variant="outlined" label={itemText} />}
// // // // // // //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
// // // // // // //             <Chip size="small" label={rangeText} />
// // // // // // //             {selectedDay && (
// // // // // // //               <>
// // // // // // //                 <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>보고일</Typography>
// // // // // // //                 <Chip size="small" color="primary" variant="outlined" label={selectedDay} />
// // // // // // //               </>
// // // // // // //             )}
// // // // // // //           </Box>
// // // // // // //         </Box>

// // // // // // //         {loading ? (
// // // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // // //           </Box>
// // // // // // //         ) : (
// // // // // // //           <Box
// // // // // // //             sx={{
// // // // // // //               maxHeight: 800,
// // // // // // //               overflow: "auto",
// // // // // // //               borderRadius: 1,
// // // // // // //               "& table": {
// // // // // // //                 width: "100%",
// // // // // // //                 borderCollapse: "separate",
// // // // // // //                 borderSpacing: 0,
// // // // // // //                 tableLayout: "fixed",
// // // // // // //                 minWidth: tableMinW, // ★ 동적으로 계산된 최솟값
// // // // // // //               },
// // // // // // //               "& th, & td": {
// // // // // // //                 padding: "8px 10px",
// // // // // // //                 borderBottom: "1px solid #eceff1",
// // // // // // //                 fontSize: 13,
// // // // // // //                 whiteSpace: "nowrap",
// // // // // // //                 overflow: "hidden",
// // // // // // //                 textOverflow: "ellipsis",
// // // // // // //                 height: 40,
// // // // // // //                 lineHeight: "24px",
// // // // // // //                 verticalAlign: "middle",
// // // // // // //               },
// // // // // // //               "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
// // // // // // //               "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
// // // // // // //             }}
// // // // // // //           >
// // // // // // //             <table>
// // // // // // //               <thead>
// // // // // // //                 <tr>
// // // // // // //                   <th style={{ width: COL_W.no, textAlign: "center" }} rowSpan={3}>
// // // // // // //                     NO
// // // // // // //                   </th>
// // // // // // //                   <th style={{ width: COL_W.name }} rowSpan={3}>
// // // // // // //                     검사항목명
// // // // // // //                   </th>
// // // // // // //                   <th style={{ width: specColWidth }} rowSpan={3}>
// // // // // // //                     검사내용
// // // // // // //                   </th>
// // // // // // //                   {dailyShifts.map((s) => (
// // // // // // //                     <th key={s} colSpan={dailyCols.length} style={{ textAlign: "center" }}>
// // // // // // //                       {s || "전체"}
// // // // // // //                     </th>
// // // // // // //                   ))}
// // // // // // //                   <th rowSpan={3} style={{ width: COL_W.avg, textAlign: "right" }}>
// // // // // // //                     평균
// // // // // // //                   </th>
// // // // // // //                 </tr>
// // // // // // //                 <tr>
// // // // // // //                   {dailyShifts.map((s) =>
// // // // // // //                     dailyCols.map((c) => (
// // // // // // //                       <th key={`${s}-${c}`} style={{ width: COL_W.data, textAlign: "center" }}>
// // // // // // //                         {c}
// // // // // // //                       </th>
// // // // // // //                     ))
// // // // // // //                   )}
// // // // // // //                 </tr>
// // // // // // //                 <tr>
// // // // // // //                   {dailyShifts.map((s) =>
// // // // // // //                     dailyCols.map((c) => (
// // // // // // //                       <th
// // // // // // //                         key={`${s}-${c}-work`}
// // // // // // //                         style={{ width: COL_W.data, textAlign: "center", fontWeight: 600, color: "#607d8b" }}
// // // // // // //                         title={dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // // // // // //                       >
// // // // // // //                         {dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // // // // // //                       </th>
// // // // // // //                     ))
// // // // // // //                   )}
// // // // // // //                 </tr>
// // // // // // //               </thead>
// // // // // // //               <tbody>
// // // // // // //                 {rows.map((r, idx) => (
// // // // // // //                   <tr key={idx}>
// // // // // // //                     <td style={{ width: COL_W.no, textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
// // // // // // //                     <td style={{ width: COL_W.name }} title={r["검사항목명"] ?? ""}>
// // // // // // //                       {r["검사항목명"] ?? ""}
// // // // // // //                     </td>
// // // // // // //                     <td style={{ width: specColWidth }} title={r["검사내용"] ?? ""}>
// // // // // // //                       {r["검사내용"] ?? ""}
// // // // // // //                     </td>
// // // // // // //                     {dailyShifts.map((s) =>
// // // // // // //                       dailyCols.map((c) => (
// // // // // // //                         <td key={`${idx}-${s}-${c}`} style={{ width: COL_W.data, textAlign: "right" }}>
// // // // // // //                           {fmtNum(r?.[s]?.[c], 3)}
// // // // // // //                         </td>
// // // // // // //                       ))
// // // // // // //                     )}
// // // // // // //                     <td style={{ width: COL_W.avg, textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
// // // // // // //                   </tr>
// // // // // // //                 ))}
// // // // // // //                 {(!rows || rows.length === 0) && (
// // // // // // //                   <tr>
// // // // // // //                     <td colSpan={3 + dailyShifts.length * dailyCols.length + 1} style={{ textAlign: "center", padding: "32px 0" }}>
// // // // // // //                       데이터가 없습니다.
// // // // // // //                     </td>
// // // // // // //                   </tr>
// // // // // // //                 )}
// // // // // // //               </tbody>
// // // // // // //             </table>
// // // // // // //           </Box>
// // // // // // //         )}
// // // // // // //       </Paper>
// // // // // // //     );
// // // // // // //   };

// // // // // // //   /** 선택 일자 기준 멀티라인 차트 데이터 (주/야 평균) */
// // // // // // //   buildChartDataForSelectedDay = () => {
// // // // // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // // // // //     if (!selectedDay) return { seriesKeys: [], rows: [] };
// // // // // // //     const rowsSrc = dailyTables[selectedDay] || [];

// // // // // // //     const labelOf = (r) => {
// // // // // // //       const name = r["검사항목명"] ?? "";
// // // // // // //       const spec = r["검사내용"] ?? "";
// // // // // // //       return spec ? `${name} | ${spec}` : name;
// // // // // // //     };

// // // // // // //     const rows = dailyCols.map((x) => {
// // // // // // //       const row = { x };
// // // // // // //       rowsSrc.forEach((r) => {
// // // // // // //         const key = labelOf(r);
// // // // // // //         let sum = 0,
// // // // // // //           cnt = 0;
// // // // // // //         dailyShifts.forEach((s) => {
// // // // // // //           const v = r?.[s]?.[x];
// // // // // // //           if (v != null && v !== "") {
// // // // // // //             sum += Number(v);
// // // // // // //             cnt += 1;
// // // // // // //           }
// // // // // // //         });
// // // // // // //         row[key] = cnt > 0 ? sum / cnt : null;
// // // // // // //       });
// // // // // // //       return row;
// // // // // // //     });

// // // // // // //     const seriesKeys = rowsSrc.map((r) => labelOf(r));
// // // // // // //     return { seriesKeys, rows };
// // // // // // //   };

// // // // // // //   /** Xn 멀티라인 차트 (선택 일자) */
// // // // // // //   renderSelectedDayChart = () => {
// // // // // // //     const { loading, selectedDay } = this.state;
// // // // // // //     const { seriesKeys, rows } = this.buildChartDataForSelectedDay();

// // // // // // //     return (
// // // // // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // // // //         <Box className={s.sectionHeader}>
// // // // // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // // // //             {selectedDay ? `${selectedDay} — 검사항목별 Xn 흐름` : "검사항목별 Xn 흐름"}
// // // // // // //           </Typography>
// // // // // // //         </Box>

// // // // // // //         {loading ? (
// // // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // // //           </Box>
// // // // // // //         ) : rows.length === 0 ? (
// // // // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // // // // //         ) : (
// // // // // // //           <Box style={{ width: "100%", height: 380 }}>
// // // // // // //             <ResponsiveContainer>
// // // // // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // // // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // // // // //                 <XAxis dataKey="x" />
// // // // // // //                 <YAxis />
// // // // // // //                 <RTooltip />
// // // // // // //                 <Legend />
// // // // // // //                 {seriesKeys.map((k) => (
// // // // // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // // // // //                 ))}
// // // // // // //               </LineChart>
// // // // // // //             </ResponsiveContainer>
// // // // // // //           </Box>
// // // // // // //         )}
// // // // // // //       </Paper>
// // // // // // //     );
// // // // // // //   };

// // // // // // //   /** 숫자형(실측값) 검사항목 — 일자별 추이 차트 */
// // // // // // //   buildNumericTrendChart = () => {
// // // // // // //     const { numTrend } = this.state;
// // // // // // //     const dates = numTrend?.dates || [];
// // // // // // //     const series = numTrend?.series || [];
// // // // // // //     if (dates.length === 0 || series.length === 0) return { keys: [], rows: [] };
// // // // // // //     const rows = dates.map((d, i) => {
// // // // // // //       const o = { date: d };
// // // // // // //       series.forEach((s) => {
// // // // // // //         o[s.label] = s.data?.[i] != null ? Number(s.data[i]) : null;
// // // // // // //       });
// // // // // // //       return o;
// // // // // // //     });
// // // // // // //     const keys = series.map((s) => s.label);
// // // // // // //     return { keys, rows };
// // // // // // //   };

// // // // // // //   renderNumericTrendChart = () => {
// // // // // // //     const { loading, filters } = this.state;
// // // // // // //     const { keys, rows } = this.buildNumericTrendChart();
// // // // // // //     return (
// // // // // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // // // //         <Box className={s.sectionHeader}>
// // // // // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // // // //             숫자형 검사항목 — 일자별 실측값 추이 (Top {filters.topN ?? 5})
// // // // // // //           </Typography>
// // // // // // //         </Box>
// // // // // // //         {loading ? (
// // // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // // //           </Box>
// // // // // // //         ) : rows.length === 0 ? (
// // // // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // // // // //         ) : (
// // // // // // //           <Box style={{ width: "100%", height: 380 }}>
// // // // // // //             <ResponsiveContainer>
// // // // // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // // // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // // // // //                 <XAxis dataKey="date" />
// // // // // // //                 <YAxis />
// // // // // // //                 <RTooltip />
// // // // // // //                 <Legend />
// // // // // // //                 {keys.map((k) => (
// // // // // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // // // // //                 ))}
// // // // // // //               </LineChart>
// // // // // // //             </ResponsiveContainer>
// // // // // // //           </Box>
// // // // // // //         )}
// // // // // // //       </Paper>
// // // // // // //     );
// // // // // // //   };

// // // // // // //   render() {
// // // // // // //     const { error, dailyList, selectedDay } = this.state;

// // // // // // //     return (
// // // // // // //       <Box className={s.root}>
// // // // // // //         {/* 필터 바 */}
// // // // // // //         {this.renderFilterBar()}

// // // // // // //         {/* 에러 */}
// // // // // // //         {error && (
// // // // // // //           <Box sx={{ mb: 2 }}>
// // // // // // //             <Alert severity="error" sx={{ mb: 2 }}>
// // // // // // //               {error}
// // // // // // //             </Alert>
// // // // // // //             <Button
// // // // // // //               variant="contained"
// // // // // // //               onClick={this.loadAll}
// // // // // // //               sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // // // // // //             >
// // // // // // //               다시 시도
// // // // // // //             </Button>
// // // // // // //           </Box>
// // // // // // //         )}

// // // // // // //         {/* 본문: 좌측 날짜 목록 + 우측 표/차트 */}
// // // // // // //         <Box className={s.dailyLayout}>
// // // // // // //           <Paper className={s.dayPanel}>
// // // // // // //             <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a", mb: 1 }}>보고일</Typography>

// // // // // // //             <Box className={s.dayList}>
// // // // // // //               <div className={s.dayListHead}>
// // // // // // //                 <span>보고일</span>
// // // // // // //                 <span>설비</span>
// // // // // // //                 <span>품번</span>
// // // // // // //               </div>
// // // // // // //               <div className={s.dayListBody}>
// // // // // // //                 {dailyList.map(({ d, equipment, partNo }) => (
// // // // // // //                   <div
// // // // // // //                     key={d}
// // // // // // //                     className={`${s.dayRow} ${selectedDay === d ? s.active : ""}`}
// // // // // // //                     onClick={() => this.setState({ selectedDay: d })}
// // // // // // //                   >
// // // // // // //                     <span>{d}</span>
// // // // // // //                     <span>{equipment || "-"}</span>
// // // // // // //                     <span>{partNo || "-"}</span>
// // // // // // //                   </div>
// // // // // // //                 ))}
// // // // // // //                 {(!dailyList || dailyList.length === 0) && (
// // // // // // //                   <div className={s.dayEmpty}>기간/필터 조건에 해당하는 결과가 없습니다.</div>
// // // // // // //                 )}
// // // // // // //               </div>
// // // // // // //             </Box>
// // // // // // //           </Paper>

// // // // // // //           <Box className={s.rightArea}>
// // // // // // //             {this.renderDailyTable()}
// // // // // // //             {this.renderSelectedDayChart()}
// // // // // // //             {this.renderNumericTrendChart()}
// // // // // // //           </Box>
// // // // // // //         </Box>
// // // // // // //       </Box>
// // // // // // //     );
// // // // // // //   }
// // // // // // // }

// // // // // // // export default InspectionSystemChart;


// // // // // // // src/pages/inspection/InspectionSystemChart.js
// // // // // // import React, { Component } from "react";
// // // // // // import config from "../../config";

// // // // // // import {
// // // // // //   Box,
// // // // // //   Paper,
// // // // // //   Typography,
// // // // // //   CardHeader,
// // // // // //   IconButton,
// // // // // //   Divider,
// // // // // //   Collapse,
// // // // // //   CircularProgress,
// // // // // //   Alert,
// // // // // //   Menu,
// // // // // //   MenuItem,
// // // // // //   TextField,
// // // // // //   Button,
// // // // // //   InputAdornment,
// // // // // //   Chip,
// // // // // // } from "@mui/material";
// // // // // // import { Autocomplete } from "@mui/material";

// // // // // // import {
// // // // // //   Search as SearchIcon,
// // // // // //   Clear as ClearIcon,
// // // // // //   FilterList as FilterIcon,
// // // // // //   ExpandMore as ExpandMoreIcon,
// // // // // //   ExpandLess as ExpandLessIcon,
// // // // // //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // // // // //   FileDownload as DownloadIcon,
// // // // // // } from "@mui/icons-material";

// // // // // // import {
// // // // // //   ResponsiveContainer,
// // // // // //   LineChart,
// // // // // //   Line,
// // // // // //   XAxis,
// // // // // //   YAxis,
// // // // // //   CartesianGrid,
// // // // // //   Tooltip as RTooltip,
// // // // // //   Legend,
// // // // // // } from "recharts";

// // // // // // import InspectionItemModal from "../common/InspectionItemModal";
// // // // // // import s from "./InspectionSystemChart.module.scss";

// // // // // // /** ---------- helpers ---------- */
// // // // // // const mainColor = "#1e88e5";

// // // // // // const fmtNum = (v, d = null) => {
// // // // // //   if (v === null || v === undefined || v === "") return "";
// // // // // //   const n = Number(v);
// // // // // //   if (Number.isNaN(n)) return String(v);
// // // // // //   return d === null
// // // // // //     ? n.toLocaleString()
// // // // // //     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// // // // // // };

// // // // // // const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
// // // // // // const today0 = () => {
// // // // // //   const t = new Date();
// // // // // //   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// // // // // // };
// // // // // // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // // // // const getAnchorPos = (el) => {
// // // // // //   if (!el) return null;
// // // // // //   const r = el.getBoundingClientRect();
// // // // // //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // // // // // };
// // // // // // const startOfWeek = (d) => {
// // // // // //   const day = d.getDay();
// // // // // //   const diff = (day === 0 ? -6 : 1) - day;
// // // // // //   const s2 = new Date(d);
// // // // // //   s2.setDate(d.getDate() + diff);
// // // // // //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate());
// // // // // // };
// // // // // // const endOfWeek = (d) => {
// // // // // //   const s2 = startOfWeek(d);
// // // // // //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate() + 6);
// // // // // // };
// // // // // // const getWeeksOfMonth = (year, month) => {
// // // // // //   const first = new Date(year, month - 1, 1);
// // // // // //   const last = lastOfMonth(first);
// // // // // //   let cur = startOfWeek(first);
// // // // // //   const out = [];
// // // // // //   let idx = 1;
// // // // // //   while (cur <= last) {
// // // // // //     const s = new Date(cur),
// // // // // //       e = endOfWeek(cur);
// // // // // //     const clipS = new Date(Math.max(s, first));
// // // // // //     const clipE = new Date(Math.min(e, last));
// // // // // //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// // // // // //     idx += 1;
// // // // // //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// // // // // //   }
// // // // // //   return out;
// // // // // // };

// // // // // // /** 기본 필터 */
// // // // // // const getDefaultFilters = () => {
// // // // // //   const y = new Date().getFullYear();
// // // // // //   return {
// // // // // //     start_date: iso(new Date(y, 0, 1)),
// // // // // //     end_date: iso(new Date(y, 11, 31)),
// // // // // //     factory: "아진산업-본사(경산)",
// // // // // //     process: "프레스",
// // // // // //     equipment: "1500T(E라인)",
// // // // // //     partNo: "",
// // // // // //     item: "",
// // // // // //     inspType: "",
// // // // // //     workType: "",
// // // // // //     shiftType: "",
// // // // // //     topN: 5,
// // // // // //   };
// // // // // // };

// // // // // // /** ---- 표 틀 고정용 기본 폭 정의 ---- */
// // // // // // const COL_W = { no: 64, name: 180, specBase: 320, data: 96, avg: 100 };
// // // // // // const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
// // // // // // const calcTableMinWidth = (colsLen, shiftsLen, specW) =>
// // // // // //   COL_W.no + COL_W.name + specW + (colsLen || 0) * (shiftsLen || 0) * COL_W.data + COL_W.avg;

// // // // // // /** ----- 정렬 유틸 ----- */
// // // // // // const firstSeqIndex = (row, cols, shifts) => {
// // // // // //   for (let i = 0; i < cols.length; i += 1) {
// // // // // //     const c = cols[i];
// // // // // //     for (const s of shifts) {
// // // // // //       const v = row?.[s]?.[c];
// // // // // //       if (v !== null && v !== undefined && v !== "") return i + 1;
// // // // // //     }
// // // // // //   }
// // // // // //   return Number.MAX_SAFE_INTEGER;
// // // // // // };
// // // // // // const getInspectionSeq = (row, cols, shifts) => {
// // // // // //   const raw = row?.["검사순번"];
// // // // // //   const n = Number(raw);
// // // // // //   if (raw !== undefined && raw !== null && !Number.isNaN(n)) return n;
// // // // // //   return firstSeqIndex(row, cols, shifts);
// // // // // // };
// // // // // // const sortRowsByInspectionSeqAsc = (rows, cols, shifts) =>
// // // // // //   [...rows].sort((a, b) => {
// // // // // //     const ia = getInspectionSeq(a, cols, shifts);
// // // // // //     const ib = getInspectionSeq(b, cols, shifts);
// // // // // //     if (ia !== ib) return ia - ib;
// // // // // //     const an = (a["검사항목명"] || "").localeCompare(b["검사항목명"] || "");
// // // // // //     if (an !== 0) return an;
// // // // // //     return (a["검사내용"] || "").localeCompare(b["검사내용"] || "");
// // // // // //   });

// // // // // // /** ---- 간단 LRU 캐시 ---- */
// // // // // // class Lru {
// // // // // //   constructor(limit = 8) {
// // // // // //     this.limit = limit;
// // // // // //     this.map = new Map();
// // // // // //   }
// // // // // //   get(k) {
// // // // // //     if (!this.map.has(k)) return undefined;
// // // // // //     const v = this.map.get(k);
// // // // // //     this.map.delete(k);
// // // // // //     this.map.set(k, v);
// // // // // //     return v;
// // // // // //   }
// // // // // //   set(k, v) {
// // // // // //     if (this.map.has(k)) this.map.delete(k);
// // // // // //     this.map.set(k, v);
// // // // // //     if (this.map.size > this.limit) {
// // // // // //       const first = this.map.keys().next().value;
// // // // // //       this.map.delete(first);
// // // // // //     }
// // // // // //   }
// // // // // // }
// // // // // // const keyOf = (filters) => {
// // // // // //   const {
// // // // // //     start_date,
// // // // // //     end_date,
// // // // // //     factory,
// // // // // //     process,
// // // // // //     equipment,
// // // // // //     partNo,
// // // // // //     inspType,
// // // // // //     workType,
// // // // // //     shiftType,
// // // // // //     topN,
// // // // // //   } = filters || {};
// // // // // //   return JSON.stringify({ start_date, end_date, factory, process, equipment, partNo, inspType, workType, shiftType, topN });
// // // // // // };

// // // // // // class InspectionSystemChart extends Component {
// // // // // //   state = {
// // // // // //     filters: getDefaultFilters(),

// // // // // //     // 보고일/표 데이터
// // // // // //     dailyCols: [],
// // // // // //     dailyDays: [],
// // // // // //     dailyList: [],
// // // // // //     dailyTables: {},
// // // // // //     dailyShifts: [],
// // // // // //     dailyWorkHeaders: {},
// // // // // //     selectedDay: null,

// // // // // //     // 숫자형 추이
// // // // // //     numTrend: { dates: [], series: [] },

// // // // // //     // 옵션
// // // // // //     factories: [],
// // // // // //     processes: [],
// // // // // //     equipments: [],
// // // // // //     parts: [],
// // // // // //     items: [],
// // // // // //     optionsLoading: false,

// // // // // //     // UI 로딩 플래그(분리)
// // // // // //     loadingDaily: false, // 보고일 목록 + 표 데이터
// // // // // //     loadingTrend: false, // 숫자형 추이
// // // // // //     error: "",
// // // // // //     filterExpanded: false,

// // // // // //     // 프리셋 상태/앵커
// // // // // //     selectedYear: new Date().getFullYear(),
// // // // // //     selectedMonth: new Date().getMonth() + 1,
// // // // // //     yearAnchorPos: null,
// // // // // //     monthAnchorPos: null,
// // // // // //     weekAnchorPos: null,

// // // // // //     years: [],

// // // // // //     // 모달
// // // // // //     itemCodeModalOpen: false,

// // // // // //     // 동적 "검사내용" 폭(px)
// // // // // //     specColWidth: COL_W.specBase,
// // // // // //   };

// // // // // //   // ==== 상태 플래그 ====
// // // // // //   _hadSavedFilters = false; // 저장된 필터가 있었는지
// // // // // //   _didDefaultFromDB = false; // 최신달 디폴트 설정을 했는지

// // // // // //   // ==== 성능: 요청 무시 토큰 & 디바운스 타이머 & Abort ====
// // // // // //   _runId = 0;
// // // // // //   _pendingTimer = null;
// // // // // //   _controllers = new Set();

// // // // // //   // ==== 캐시 ====
// // // // // //   _dailyCache = new Lru(6);
// // // // // //   _trendCache = new Lru(6);
// // // // // //   _optionsCache = new Lru(6);

// // // // // //   // ==== 측정용 canvas ====
// // // // // //   _measureCtx = null;
// // // // // //   getMeasureCtx = () => {
// // // // // //     if (typeof document === "undefined") return null;
// // // // // //     if (!this._measureCtx) {
// // // // // //       const canvas = document.createElement("canvas");
// // // // // //       this._measureCtx = canvas.getContext("2d");
// // // // // //     }
// // // // // //     return this._measureCtx;
// // // // // //   };
// // // // // //   measureTextPx = (text) => {
// // // // // //     const ctx = this.getMeasureCtx();
// // // // // //     const font = '13px "Noto Sans KR", Roboto, Apple SD Gothic Neo, Arial, sans-serif';
// // // // // //     if (!ctx) return String(text ?? "").length * 12;
// // // // // //     ctx.font = font;
// // // // // //     return ctx.measureText(String(text ?? "")).width;
// // // // // //   };
// // // // // //   computeSpecWidthFromRows = (rows) => {
// // // // // //     let longestPx = this.measureTextPx("검사내용");
// // // // // //     const addPad = 36;
// // // // // //     const minPx = COL_W.specBase;
// // // // // //     const hardMaxPx = 720;
// // // // // //     (rows || []).forEach((r) => {
// // // // // //       const px = this.measureTextPx(r?.["검사내용"]);
// // // // // //       if (px > longestPx) longestPx = px;
// // // // // //     });
// // // // // //     return clamp(Math.ceil(longestPx) + addPad, minPx, hardMaxPx);
// // // // // //   };

// // // // // //   componentDidMount() {
// // // // // //     const base = getDefaultFilters();
// // // // // //     const saved = localStorage.getItem("inspectionFilters");
// // // // // //     if (saved) {
// // // // // //       try {
// // // // // //         const parsed = JSON.parse(saved);
// // // // // //         const merged = { ...base, ...parsed };
// // // // // //         merged.factory = merged.factory || base.factory;
// // // // // //         merged.process = merged.process || base.process;
// // // // // //         merged.equipment = merged.equipment || base.equipment;
// // // // // //         this._hadSavedFilters = true;
// // // // // //         this.setState({ filters: merged });
// // // // // //       } catch {
// // // // // //         this.setState({ filters: base });
// // // // // //       }
// // // // // //     } else {
// // // // // //       this.setState({ filters: base });
// // // // // //     }
// // // // // //     this.bootstrap();
// // // // // //   }

// // // // // //   componentDidUpdate(_, prevState) {
// // // // // //     if (this.state.selectedDay !== prevState.selectedDay) {
// // // // // //       const rows = this.state.dailyTables?.[this.state.selectedDay] || [];
// // // // // //       const w = this.computeSpecWidthFromRows(rows);
// // // // // //       if (w !== this.state.specColWidth) this.setState({ specColWidth: w });
// // // // // //     }
// // // // // //   }

// // // // // //   /** --------- API ---------- */
// // // // // //   _abortAll = () => {
// // // // // //     for (const c of this._controllers) try { c.abort(); } catch {}
// // // // // //     this._controllers.clear();
// // // // // //   };
// // // // // //   post = async (path, body) => {
// // // // // //     const controller = new AbortController();
// // // // // //     this._controllers.add(controller);
// // // // // //     try {
// // // // // //       const headers = { "Content-Type": "application/json" };
// // // // // //       const res = await fetch(
// // // // // //         `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
// // // // // //         { method: "POST", headers, body: JSON.stringify(body || {}), signal: controller.signal }
// // // // // //       );
// // // // // //       if (!res.ok) {
// // // // // //         const t = await res.text().catch(() => "");
// // // // // //         throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// // // // // //       }
// // // // // //       const json = await res.json();
// // // // // //       return json.data || [];
// // // // // //     } finally {
// // // // // //       this._controllers.delete(controller);
// // // // // //     }
// // // // // //   };

// // // // // //   bootstrap = async () => {
// // // // // //     await this.loadYears();
// // // // // //     await this.loadOptions();
// // // // // //     await this.initDefaultMonthFromDBIfNeeded(); // ★ 최신 달로 기간 자동 설정 (저장된 필터 없을 때만 1회)
// // // // // //     this.loadAll();
// // // // // //   };

// // // // // //   /** 옵션 로드 + 품명 보정 (캐시) */
// // // // // //   loadOptions = async () => {
// // // // // //     const runId = ++this._runId;
// // // // // //     const { filters } = this.state;
// // // // // //     const k = keyOf({ ...filters, partNo: "", topN: undefined });
// // // // // //     const cached = this._optionsCache.get(k);
// // // // // //     if (cached) {
// // // // // //       this.setState((prev) => {
// // // // // //         const filledName = this.getItemNameFromOptions(prev.filters.partNo, cached.parts, cached.items);
// // // // // //         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
// // // // // //         const next = { ...cached, optionsLoading: false };
// // // // // //         if (needFill) next.filters = { ...prev.filters, item: filledName };
// // // // // //         return next;
// // // // // //       });
// // // // // //       return;
// // // // // //     }

// // // // // //     this.setState({ optionsLoading: true });
// // // // // //     try {
// // // // // //       const [factories, processes, equipments, parts, items] = await Promise.all([
// // // // // //         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
// // // // // //         this.post("/options/processes", { ...filters }),
// // // // // //         this.post("/options/equipments", { ...filters }),
// // // // // //         this.post("/options/parts", { ...filters }),
// // // // // //         this.post("/options/items", { ...filters }),
// // // // // //       ]);
// // // // // //       if (runId !== this._runId) return;

// // // // // //       const payload = { factories, processes, equipments, parts, items };
// // // // // //       this._optionsCache.set(k, payload);

// // // // // //       this.setState((prev) => {
// // // // // //         const filledName = this.getItemNameFromOptions(prev.filters.partNo, parts, items);
// // // // // //         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
// // // // // //         const next = { ...payload, optionsLoading: false };
// // // // // //         if (needFill) next.filters = { ...prev.filters, item: filledName };
// // // // // //         return next;
// // // // // //       });
// // // // // //     } catch (e) {
// // // // // //       console.error(e);
// // // // // //       this.setState({ optionsLoading: false });
// // // // // //     }
// // // // // //   };

// // // // // //   /** 연도 옵션 */
// // // // // //   loadYears = async () => {
// // // // // //     try {
// // // // // //       const raw = await this.post("/options/years", { ...this.state.filters });
// // // // // //       let years = Array.isArray(raw) ? raw.map((y) => Number(y)).filter(Boolean) : [];
// // // // // //       if (!years.length) throw new Error("no years");
// // // // // //       years.sort((a, b) => b - a);
// // // // // //       this.setState({ years, selectedYear: years[0] });
// // // // // //     } catch {
// // // // // //       const y = new Date().getFullYear();
// // // // // //       const years = [y, y - 1, y - 2, y - 3, y - 4];
// // // // // //       this.setState({ years, selectedYear: y });
// // // // // //     }
// // // // // //   };

// // // // // //   /** 최초 1회: DB의 가장 최근 보고일이 속한 "달"을 기본 기간으로 설정 */
// // // // // //   initDefaultMonthFromDBIfNeeded = async () => {
// // // // // //     if (this._hadSavedFilters || this._didDefaultFromDB) return; // 저장된 필터 있으면 스킵
// // // // // //     try {
// // // // // //       const y = this.state.selectedYear || new Date().getFullYear();
// // // // // //       const tempFilters = {
// // // // // //         ...this.state.filters,
// // // // // //         start_date: iso(new Date(y, 0, 1)),
// // // // // //         end_date: iso(new Date(y, 11, 31)),
// // // // // //         partNo: "", // 품번 없이도 왼쪽은 조회됨(요구사항)
// // // // // //         item: "",
// // // // // //       };
// // // // // //       // 최신 연도에서 보고일 목록 받아오기
// // // // // //       const daily = await this.post("/xn_daily", tempFilters);
// // // // // //       const dayStrs = [
// // // // // //         ...(Array.isArray(daily?.days) ? daily.days : []),
// // // // // //         ...((daily?.dayList || []).map((r) => r?.d).filter(Boolean)),
// // // // // //       ].filter(Boolean);
// // // // // //       if (!dayStrs.length) {
// // // // // //         this._didDefaultFromDB = true;
// // // // // //         return;
// // // // // //       }
// // // // // //       // YYYY-MM-DD 문자열이므로 사전식 비교로 최대값 가능
// // // // // //       let latest = dayStrs[0];
// // // // // //       for (const s of dayStrs) if (s > latest) latest = s;

// // // // // //       const [yy, mm] = latest.split("-").map((n) => parseInt(n, 10));
// // // // // //       const ms = new Date(yy, mm - 1, 1);
// // // // // //       const me = lastOfMonth(ms);

// // // // // //       await new Promise((resolve) =>
// // // // // //         this.setState(
// // // // // //           (prev) => ({
// // // // // //             filters: { ...prev.filters, start_date: iso(ms), end_date: iso(me) },
// // // // // //             selectedYear: yy,
// // // // // //             selectedMonth: mm,
// // // // // //           }),
// // // // // //           resolve
// // // // // //         )
// // // // // //       );
// // // // // //       this._didDefaultFromDB = true;
// // // // // //     } catch (e) {
// // // // // //       console.warn("initDefaultMonthFromDBIfNeeded failed:", e);
// // // // // //       this._didDefaultFromDB = true; // 실패해도 재시도 루프 방지
// // // // // //     }
// // // // // //   };

// // // // // //   /** 필터 변경 (200ms 디바운스) */
// // // // // //   handleFilterChange = (field, value) => {
// // // // // //     this.setState((prev) => {
// // // // // //       const f = { ...prev.filters, [field]: value };
// // // // // //       if (field === "factory") {
// // // // // //         f.process = "";
// // // // // //         f.equipment = "";
// // // // // //         f.partNo = "";
// // // // // //         f.item = "";
// // // // // //       } else if (field === "process") {
// // // // // //         f.equipment = "";
// // // // // //         f.partNo = "";
// // // // // //         f.item = "";
// // // // // //       } else if (field === "equipment") {
// // // // // //         f.partNo = "";
// // // // // //         f.item = "";
// // // // // //       } else if (field === "start_date" || field === "end_date") {
// // // // // //         f.partNo = "";
// // // // // //         f.item = "";
// // // // // //       } else if (field === "topN") {
// // // // // //         f.topN = Number(value) || 5;
// // // // // //       }
// // // // // //       return { filters: f };
// // // // // //     }, () => {
// // // // // //       if (this._pendingTimer) clearTimeout(this._pendingTimer);
// // // // // //       this._pendingTimer = setTimeout(async () => {
// // // // // //         await this.loadOptions();
// // // // // //         await this.loadAll();
// // // // // //       }, 200);
// // // // // //     });
// // // // // //   };

// // // // // //   /** 날짜 프리셋/범위 */
// // // // // //   setDateRange = async (start, end) => {
// // // // // //     const start_date = iso(start);
// // // // // //     const end_date = iso(end);
// // // // // //     this.setState(
// // // // // //       (prev) => ({
// // // // // //         filters: { ...prev.filters, start_date, end_date, partNo: "", item: "" },
// // // // // //       }),
// // // // // //       async () => {
// // // // // //         try {
// // // // // //           localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
// // // // // //         } catch {}
// // // // // //         await this.loadOptions();
// // // // // //         this.loadAll();
// // // // // //       }
// // // // // //     );
// // // // // //   };
// // // // // //   applyToday = () => {
// // // // // //     const t = today0();
// // // // // //     this.setDateRange(t, t);
// // // // // //   };
// // // // // //   selectYear = (y) => {
// // // // // //     const s = new Date(y, 0, 1);
// // // // // //     const e = new Date(y, 11, 31);
// // // // // //     this.setState({ selectedYear: y, yearAnchorPos: null });
// // // // // //     this.setDateRange(s, e);
// // // // // //   };
// // // // // //   selectMonth = (m) => {
// // // // // //     const y = this.state.selectedYear;
// // // // // //     const s = new Date(y, m - 1, 1);
// // // // // //     const e = lastOfMonth(s);
// // // // // //     this.setState({ monthAnchorPos: null, selectedMonth: m });
// // // // // //     this.setDateRange(s, e);
// // // // // //   };
// // // // // //   selectWeek = (w) => {
// // // // // //     this.setState({ weekAnchorPos: null });
// // // // // //     this.setDateRange(w.start, w.end);
// // // // // //   };

// // // // // //   /** 전체 초기화 */
// // // // // //   resetToThisYear = async () => {
// // // // // //     const y = new Date().getFullYear();
// // // // // //     const filters = { ...getDefaultFilters(), start_date: iso(new Date(y, 0, 1)), end_date: iso(new Date(y, 11, 31)) };
// // // // // //     this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth() + 1 }, async () => {
// // // // // //       try {
// // // // // //         localStorage.removeItem("inspectionFilters");
// // // // // //       } catch {}
// // // // // //       this._hadSavedFilters = false;
// // // // // //       this._didDefaultFromDB = false; // 초기화 후 다시 최신달로 맞추도록
// // // // // //       await this.loadOptions();
// // // // // //       await this.initDefaultMonthFromDBIfNeeded();
// // // // // //       this.loadAll();
// // // // // //     });
// // // // // //   };

// // // // // //   /** 데이터 로드 (캐시 + 단계적 로딩: daily 먼저, trend 나중) */
// // // // // //   loadAll = async () => {
// // // // // //     const runId = ++this._runId;
// // // // // //     this._abortAll();

// // // // // //     const { filters } = this.state;
// // // // // //     try {
// // // // // //       localStorage.setItem("inspectionFilters", JSON.stringify(filters));
// // // // // //     } catch {}

// // // // // //     // --- DAILY ---
// // // // // //     this.setState({ loadingDaily: true, error: "" });

// // // // // //     const dailyKey = `daily:${keyOf(filters)}`;
// // // // // //     const cachedDaily = this._dailyCache.get(dailyKey);
// // // // // //     let daily;
// // // // // //     try {
// // // // // //       if (cachedDaily) {
// // // // // //         daily = cachedDaily;
// // // // // //       } else {
// // // // // //         daily = await this.post("/xn_daily", filters);
// // // // // //         this._dailyCache.set(dailyKey, daily);
// // // // // //       }
// // // // // //     } catch (e) {
// // // // // //       console.error(e);
// // // // // //       if (runId === this._runId) this.setState({ error: "데일리 데이터를 불러오지 못했습니다.", loadingDaily: false });
// // // // // //       return;
// // // // // //     }
// // // // // //     if (runId !== this._runId) return;

// // // // // //     const cols = daily?.cols || [];
// // // // // //     const days = daily?.days || [];
// // // // // //     const tables = daily?.tables || {};
// // // // // //     const shifts = daily?.shifts || [];
// // // // // //     const workHeaders = daily?.workHeaders || {};
// // // // // //     const dayList = daily?.dayList || (days || []).map((d) => ({ d, equipment: "", partNo: "" }));

// // // // // //     const firstDay = dayList?.[0]?.d || days?.[0] || null;
// // // // // //     const nextSelected = this.state.selectedDay ?? firstDay;

// // // // // //     const specColWidth = this.computeSpecWidthFromRows(tables?.[nextSelected] || []);

// // // // // //     this.setState({
// // // // // //       dailyCols: cols,
// // // // // //       dailyDays: days,
// // // // // //       dailyList: dayList,
// // // // // //       dailyTables: tables,
// // // // // //       dailyShifts: shifts,
// // // // // //       dailyWorkHeaders: workHeaders,
// // // // // //       selectedDay: nextSelected,
// // // // // //       specColWidth,
// // // // // //       loadingDaily: false,
// // // // // //     });

// // // // // //     // --- NUMERIC TREND ---
// // // // // //     if (!filters.partNo) {
// // // // // //       this.setState({ numTrend: { dates: [], series: [] }, loadingTrend: false });
// // // // // //       return;
// // // // // //     }

// // // // // //     this.setState({ loadingTrend: true });
// // // // // //     const trendKey = `trend:${keyOf(filters)}`;
// // // // // //     try {
// // // // // //       const numeric =
// // // // // //         this._trendCache.get(trendKey) || (await this.post("/numeric_trend", filters));
// // // // // //       this._trendCache.set(trendKey, numeric);
// // // // // //       if (runId !== this._runId) return;
// // // // // //       this.setState({ numTrend: numeric || { dates: [], series: [] }, loadingTrend: false });
// // // // // //     } catch (e) {
// // // // // //       console.error(e);
// // // // // //       if (runId === this._runId) this.setState({ loadingTrend: false });
// // // // // //     }
// // // // // //   };

// // // // // //   /** CSV 내보내기 */
// // // // // //   exportCsv = () => {
// // // // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // // // //     if (!selectedDay) return;
// // // // // //     const rawRows = dailyTables[selectedDay] || [];
// // // // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// // // // // //     const headLeft = ["NO", "검사항목명", "검사내용"];
// // // // // //     const headMid = dailyShifts.flatMap((s) => dailyCols.map((c) => `${s}-${c}`));
// // // // // //     const header = [...headLeft, ...headMid, "평균"];

// // // // // //     const csvRows = [
// // // // // //       header,
// // // // // //       ...rows.map((r, idx) => {
// // // // // //         const vals = dailyShifts.flatMap((s) => dailyCols.map((c) => r?.[s]?.[c] ?? ""));
// // // // // //         return [String(idx + 1), r["검사항목명"] ?? "", r["검사내용"] ?? "", ...vals, r["평균"] ?? ""];
// // // // // //       }),
// // // // // //     ];
// // // // // //     const csv = csvRows.map((r) => r.join(",")).join("\n");
// // // // // //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // // // // //     const url = URL.createObjectURL(blob);
// // // // // //     const a = document.createElement("a");
// // // // // //     a.href = url;
// // // // // //     a.download = `xn_daily_${selectedDay}.csv`;
// // // // // //     a.click();
// // // // // //     URL.revokeObjectURL(url);
// // // // // //   };

// // // // // //   /** 품번/품명 모달 */
// // // // // //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// // // // // //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// // // // // //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// // // // // //     this.setState(
// // // // // //       (prev) => ({
// // // // // //         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
// // // // // //         itemCodeModalOpen: false,
// // // // // //       }),
// // // // // //       () => {
// // // // // //         this.loadOptions();
// // // // // //         this.loadAll();
// // // // // //       }
// // // // // //     );
// // // // // //   };

// // // // // //   /** 품번 선택 해제 */
// // // // // //   handleClearPart = () => {
// // // // // //     this.setState(
// // // // // //       (prev) => ({ filters: { ...prev.filters, partNo: "", item: "" } }),
// // // // // //       () => {
// // // // // //         this.loadOptions();
// // // // // //         this.loadAll();
// // // // // //       }
// // // // // //     );
// // // // // //   };

// // // // // //   /** partNo → item(품명) 추론 (옵션 배열 사용) */
// // // // // //   getItemNameFromOptions = (partNo, parts = this.state.parts, items = this.state.items) => {
// // // // // //     if (!partNo) return "";
// // // // // //     const readPn = (o) =>
// // // // // //       o?.partNo ?? o?.품목번호 ?? o?.code ?? o?.value ?? o?.id ?? o?.PART_NO ?? o?.PartNo;
// // // // // //     const readNm = (o) =>
// // // // // //       o?.item ?? o?.itemName ?? o?.품목명 ?? o?.name ?? o?.label ?? o?.ITEM_NM ?? o?.ItemName;
// // // // // //     for (const it of parts || []) if (readPn(it) === partNo) return readNm(it) || "";
// // // // // //     for (const it of items || []) if (readPn(it) === partNo) return readNm(it) || "";
// // // // // //     return "";
// // // // // //   };

// // // // // //   /** dayList 행에서 품명 추론 → 옵션으로 보정 */
// // // // // //   resolveItemName = (row, partNo) => {
// // // // // //     const cands = [
// // // // // //       row?.item,
// // // // // //       row?.itemName,
// // // // // //       row?.partName,
// // // // // //       row?.품목명,
// // // // // //       row?.item_label,
// // // // // //       row?.name,
// // // // // //       row?.label,
// // // // // //     ].filter(Boolean);
// // // // // //     if (cands.length) return cands[0];
// // // // // //     return this.getItemNameFromOptions(partNo);
// // // // // //   };

// // // // // //   /** 보고일 클릭 → 설비/품번(+품명) 자동 조회 (필요 시에만 네트워크) */
// // // // // //   handleDayClick = async (row) => {
// // // // // //     const { d, equipment, partNo } = row || {};
// // // // // //     const { filters } = this.state;

// // // // // //     if ((equipment || filters.equipment) === filters.equipment && (partNo || "") === (filters.partNo || "")) {
// // // // // //       this.setState({ selectedDay: d });
// // // // // //       return;
// // // // // //     }

// // // // // //     const preItem = this.resolveItemName(row, partNo || "");
// // // // // //     this.setState(
// // // // // //       (prev) => ({
// // // // // //         selectedDay: d,
// // // // // //         filters: {
// // // // // //           ...prev.filters,
// // // // // //           equipment: equipment || prev.filters.equipment,
// // // // // //           partNo: partNo || "",
// // // // // //           item: preItem || "",
// // // // // //         },
// // // // // //       }),
// // // // // //       async () => {
// // // // // //         await this.loadOptions();
// // // // // //         const fixed = this.getItemNameFromOptions(this.state.filters.partNo);
// // // // // //         if (fixed && !this.state.filters.item) {
// // // // // //           this.setState((prev) => ({ filters: { ...prev.filters, item: fixed } }));
// // // // // //         }
// // // // // //         await this.loadAll();
// // // // // //       }
// // // // // //     );
// // // // // //   };

// // // // // //   // ---------- 상단 필터 ----------
// // // // // //   renderFilterBar = () => {
// // // // // //     const { filters } = this.state;

// // // // // //     const now = today0();
// // // // // //     const thisYear = now.getFullYear();
// // // // // //     const thisMonth = now.getMonth() + 1;
// // // // // //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// // // // // //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// // // // // //     return (
// // // // // //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// // // // // //         <CardHeader
// // // // // //           title={
// // // // // //             <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
// // // // // //               <FilterIcon /> 검색 조건
// // // // // //             </Typography>
// // // // // //           }
// // // // // //           action={
// // // // // //             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
// // // // // //               <Button
// // // // // //                 size="small"
// // // // // //                 variant="outlined"
// // // // // //                 color="success"
// // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // // //               >
// // // // // //                 연간
// // // // // //               </Button>
// // // // // //               <Menu
// // // // // //                 open={!!this.state.yearAnchorPos}
// // // // // //                 onClose={() => this.setState({ yearAnchorPos: null })}
// // // // // //                 anchorReference="anchorPosition"
// // // // // //                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// // // // // //               >
// // // // // //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>
// // // // // //                   올해
// // // // // //                 </MenuItem>
// // // // // //                 {this.state.years.map((y) => (
// // // // // //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
// // // // // //                     {y}년
// // // // // //                   </MenuItem>
// // // // // //                 ))}
// // // // // //               </Menu>

// // // // // //               <Button
// // // // // //                 size="small"
// // // // // //                 variant="outlined"
// // // // // //                 color="success"
// // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // // //               >
// // // // // //                 월간
// // // // // //               </Button>
// // // // // //               <Menu
// // // // // //                 open={!!this.state.monthAnchorPos}
// // // // // //                 onClose={() => this.setState({ monthAnchorPos: null })}
// // // // // //                 anchorReference="anchorPosition"
// // // // // //                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// // // // // //               >
// // // // // //                 <MenuItem
// // // // // //                   dense
// // // // // //                   onClick={() => {
// // // // // //                     this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth));
// // // // // //                   }}
// // // // // //                 >
// // // // // //                   이번달
// // // // // //                 </MenuItem>
// // // // // //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // // // // //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// // // // // //                     {this.state.selectedYear}년 {m}월
// // // // // //                   </MenuItem>
// // // // // //                 ))}
// // // // // //               </Menu>

// // // // // //               <Button
// // // // // //                 size="small"
// // // // // //                 variant="outlined"
// // // // // //                 color="success"
// // // // // //                 endIcon={<ExpandMoreIcon />}
// // // // // //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // // //               >
// // // // // //                 주간
// // // // // //               </Button>
// // // // // //               <Menu
// // // // // //                 open={!!this.state.weekAnchorPos}
// // // // // //                 onClose={() => this.setState({ weekAnchorPos: null })}
// // // // // //                 anchorReference="anchorPosition"
// // // // // //                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
// // // // // //               >
// // // // // //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// // // // // //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// // // // // //                 </MenuItem>
// // // // // //                 {weeks.map((w, i) => (
// // // // // //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// // // // // //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// // // // // //                   </MenuItem>
// // // // // //                 ))}
// // // // // //               </Menu>

// // // // // //               <Button
// // // // // //                 size="small"
// // // // // //                 variant="outlined"
// // // // // //                 color="success"
// // // // // //                 onClick={this.applyToday}
// // // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // // //               >
// // // // // //                 오늘
// // // // // //               </Button>

// // // // // //               <Typography sx={{ color: "white", opacity: 0.8, mx: 0.5 }}>|</Typography>
// // // // // //               <Typography sx={{ color: "white" }}>기간선택</Typography>
// // // // // //               <TextField
// // // // // //                 type="date"
// // // // // //                 value={filters.start_date}
// // // // // //                 onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// // // // // //                 size="small"
// // // // // //                 variant="outlined"
// // // // // //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// // // // // //                 InputLabelProps={{ shrink: true }}
// // // // // //               />
// // // // // //               <Typography sx={{ color: "white" }}>~</Typography>
// // // // // //               <TextField
// // // // // //                 type="date"
// // // // // //                 value={filters.end_date}
// // // // // //                 onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// // // // // //                 size="small"
// // // // // //                 variant="outlined"
// // // // // //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// // // // // //                 InputLabelProps={{ shrink: true }}
// // // // // //               />

// // // // // //               <IconButton
// // // // // //                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
// // // // // //                 sx={{ color: "white" }}
// // // // // //               >
// // // // // //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// // // // // //               </IconButton>
// // // // // //             </Box>
// // // // // //           }
// // // // // //           sx={{ backgroundColor: "#ff8f00", color: "white", borderRadius: 1, mb: 2 }}
// // // // // //         />

// // // // // //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// // // // // //         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 2, mb: 1 }}>
// // // // // //           <Autocomplete
// // // // // //             size="small"
// // // // // //             options={this.state.factories}
// // // // // //             value={filters.factory || null}
// // // // // //             onChange={(_, v) => this.handleFilterChange("factory", v || "")}
// // // // // //             renderInput={(params) => <TextField {...params} label="공장" />}
// // // // // //             clearOnEscape
// // // // // //           />
// // // // // //           <Autocomplete
// // // // // //             size="small"
// // // // // //             options={this.state.processes}
// // // // // //             value={filters.process || null}
// // // // // //             onChange={(_, v) => this.handleFilterChange("process", v || "")}
// // // // // //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
// // // // // //             clearOnEscape
// // // // // //           />
// // // // // //           <Autocomplete
// // // // // //             size="small"
// // // // // //             options={this.state.equipments}
// // // // // //             value={filters.equipment || null}
// // // // // //             onChange={(_, v) => this.handleFilterChange("equipment", v || "")}
// // // // // //             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
// // // // // //             clearOnEscape
// // // // // //           />
// // // // // //           <TextField
// // // // // //             fullWidth
// // // // // //             label="품번"
// // // // // //             value={filters.partNo}
// // // // // //             onClick={this.openItemCodeModal}
// // // // // //             size="small"
// // // // // //             variant="outlined"
// // // // // //             InputProps={{
// // // // // //               readOnly: true,
// // // // // //               style: { cursor: "pointer" },
// // // // // //               endAdornment: (
// // // // // //                 <InputAdornment position="end">
// // // // // //                   {Boolean(filters.partNo) && (
// // // // // //                     <IconButton
// // // // // //                       size="small"
// // // // // //                       aria-label="품번 선택해제"
// // // // // //                       onClick={(e) => {
// // // // // //                         e.stopPropagation();
// // // // // //                         this.handleClearPart();
// // // // // //                       }}
// // // // // //                       sx={{ mr: 0.5 }}
// // // // // //                     >
// // // // // //                       <ClearIcon fontSize="small" />
// // // // // //                     </IconButton>
// // // // // //                   )}
// // // // // //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// // // // // //                 </InputAdornment>
// // // // // //               ),
// // // // // //             }}
// // // // // //             sx={{
// // // // // //               "& .MuiInputBase-root": {
// // // // // //                 cursor: "pointer",
// // // // // //                 "&:hover": { backgroundColor: "#f5f5f5" },
// // // // // //               },
// // // // // //             }}
// // // // // //           />
// // // // // //           <TextField
// // // // // //             fullWidth
// // // // // //             label="품명(검사항목)"
// // // // // //             value={filters.item}
// // // // // //             onClick={this.openItemCodeModal}
// // // // // //             size="small"
// // // // // //             variant="outlined"
// // // // // //             InputProps={{
// // // // // //               readOnly: true,
// // // // // //               style: { cursor: "pointer" },
// // // // // //               endAdornment: (
// // // // // //                 <InputAdornment position="end">
// // // // // //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// // // // // //                 </InputAdornment>
// // // // // //               ),
// // // // // //             }}
// // // // // //             sx={{
// // // // // //               "& .MuiInputBase-root": {
// // // // // //                 cursor: "pointer",
// // // // // //                 "&:hover": { backgroundColor: "#f5f5f5" },
// // // // // //               },
// // // // // //             }}
// // // // // //           />
// // // // // //         </Box>

// // // // // //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// // // // // //           <Divider sx={{ my: 2 }} />
// // // // // //           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16 }}>
// // // // // //             <TextField
// // // // // //               fullWidth
// // // // // //               label="검사구분"
// // // // // //               value={filters.inspType}
// // // // // //               onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
// // // // // //               size="small"
// // // // // //               variant="outlined"
// // // // // //             />
// // // // // //             <TextField
// // // // // //               fullWidth
// // // // // //               label="작업구분"
// // // // // //               value={filters.workType}
// // // // // //               onChange={(e) => this.handleFilterChange("workType", e.target.value)}
// // // // // //               size="small"
// // // // // //               variant="outlined"
// // // // // //             />
// // // // // //             <TextField
// // // // // //               fullWidth
// // // // // //               label="주야구분"
// // // // // //               value={filters.shiftType}
// // // // // //               onChange={(e) => this.handleFilterChange("shiftType", e.target.value)}
// // // // // //               size="small"
// // // // // //               variant="outlined"
// // // // // //             />
// // // // // //             <TextField
// // // // // //               fullWidth
// // // // // //               label="Top N"
// // // // // //               type="number"
// // // // // //               value={filters.topN ?? 5}
// // // // // //               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
// // // // // //               size="small"
// // // // // //               variant="outlined"
// // // // // //             />
// // // // // //           </Box>
// // // // // //         </Collapse>

// // // // // //         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
// // // // // //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
// // // // // //             필터 초기화
// // // // // //           </Button>
// // // // // //           <Button
// // // // // //             variant="contained"
// // // // // //             startIcon={<SearchIcon />}
// // // // // //             size="large"
// // // // // //             sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // // // // //             onClick={() => {
// // // // // //               if (this._pendingTimer) clearTimeout(this._pendingTimer);
// // // // // //               this.loadOptions();
// // // // // //               this.loadAll();
// // // // // //             }}
// // // // // //           >
// // // // // //             검색
// // // // // //           </Button>
// // // // // //           <Button
// // // // // //             variant="outlined"
// // // // // //             startIcon={<DownloadIcon />}
// // // // // //             size="large"
// // // // // //             onClick={this.exportCsv}
// // // // // //             disabled={!this.state.filters.partNo}
// // // // // //           >
// // // // // //             CSV 내보내기
// // // // // //           </Button>
// // // // // //         </Box>

// // // // // //         <InspectionItemModal
// // // // // //           open={this.state.itemCodeModalOpen}
// // // // // //           onClose={this.closeItemCodeModal}
// // // // // //           onSelect={this.handleItemCodeSelect}
// // // // // //           selectedItemCode={filters.partNo}
// // // // // //           plant={filters.factory}
// // // // // //           worker={filters.process}
// // // // // //           line={filters.equipment}
// // // // // //           startDate={filters.start_date}
// // // // // //           endDate={filters.end_date}
// // // // // //         />
// // // // // //       </Paper>
// // // // // //     );
// // // // // //   };

// // // // // //   /** 선택 일자의 Xn 표 */
// // // // // //   renderDailyTable = () => {
// // // // // //     const {
// // // // // //       dailyCols,
// // // // // //       dailyTables,
// // // // // //       dailyShifts,
// // // // // //       dailyWorkHeaders,
// // // // // //       selectedDay,
// // // // // //       loadingDaily,
// // // // // //       filters,
// // // // // //       specColWidth,
// // // // // //     } = this.state;

// // // // // //     if (!filters.partNo) {
// // // // // //       return (
// // // // // //         <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // // // // //           <Box className={s.sectionHeader}>
// // // // // //             <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // // // //               작업순번(Xn) 결과표 — 주/야/작업구분
// // // // // //             </Typography>
// // // // // //           </Box>
// // // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // // // // //         </Paper>
// // // // // //       );
// // // // // //     }

// // // // // //     const rawRows = selectedDay ? dailyTables[selectedDay] || [] : [];
// // // // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// // // // // //     const partText = filters.partNo ? filters.partNo : "전체 품번";
// // // // // //     const itemText = filters.item || "";
// // // // // //     const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

// // // // // //     const tableMinW = calcTableMinWidth(dailyCols.length, dailyShifts.length, specColWidth);

// // // // // //     return (
// // // // // //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // // // // //         <Box className={s.sectionHeader}>
// // // // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // // // //             작업순번(Xn) 결과표 — 주/야/작업구분
// // // // // //           </Typography>
// // // // // //           <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
// // // // // //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
// // // // // //             <Chip size="small" label={partText} />
// // // // // //             {itemText && <Chip size="small" variant="outlined" label={itemText} />}
// // // // // //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
// // // // // //             <Chip size="small" label={rangeText} />
// // // // // //             {selectedDay && (
// // // // // //               <>
// // // // // //                 <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>보고일</Typography>
// // // // // //                 <Chip size="small" color="primary" variant="outlined" label={selectedDay} />
// // // // // //               </>
// // // // // //             )}
// // // // // //           </Box>
// // // // // //         </Box>

// // // // // //         {loadingDaily ? (
// // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // //           </Box>
// // // // // //         ) : (
// // // // // //           <Box
// // // // // //             sx={{
// // // // // //               maxHeight: 800,
// // // // // //               overflow: "auto",
// // // // // //               borderRadius: 1,
// // // // // //               "& table": {
// // // // // //                 width: "100%",
// // // // // //                 borderCollapse: "separate",
// // // // // //                 borderSpacing: 0,
// // // // // //                 tableLayout: "fixed",
// // // // // //                 minWidth: tableMinW,
// // // // // //               },
// // // // // //               "& th, & td": {
// // // // // //                 padding: "8px 10px",
// // // // // //                 borderBottom: "1px solid #eceff1",
// // // // // //                 fontSize: 13,
// // // // // //                 whiteSpace: "nowrap",
// // // // // //                 overflow: "hidden",
// // // // // //                 textOverflow: "ellipsis",
// // // // // //                 height: 40,
// // // // // //                 lineHeight: "24px",
// // // // // //                 verticalAlign: "middle",
// // // // // //               },
// // // // // //               "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
// // // // // //               "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
// // // // // //             }}
// // // // // //           >
// // // // // //             <table>
// // // // // //               <thead>
// // // // // //                 <tr>
// // // // // //                   <th style={{ width: COL_W.no, textAlign: "center" }} rowSpan={3}>
// // // // // //                     NO
// // // // // //                   </th>
// // // // // //                   <th style={{ width: COL_W.name }} rowSpan={3}>
// // // // // //                     검사항목명
// // // // // //                   </th>
// // // // // //                   <th style={{ width: this.state.specColWidth }} rowSpan={3}>
// // // // // //                     검사내용
// // // // // //                   </th>
// // // // // //                   {dailyShifts.map((s) => (
// // // // // //                     <th key={s} colSpan={dailyCols.length} style={{ textAlign: "center" }}>
// // // // // //                       {s || "전체"}
// // // // // //                     </th>
// // // // // //                   ))}
// // // // // //                   <th rowSpan={3} style={{ width: COL_W.avg, textAlign: "right" }}>
// // // // // //                     평균
// // // // // //                   </th>
// // // // // //                 </tr>
// // // // // //                 <tr>
// // // // // //                   {dailyShifts.map((s) =>
// // // // // //                     dailyCols.map((c) => (
// // // // // //                       <th key={`${s}-${c}`} style={{ width: COL_W.data, textAlign: "center" }}>
// // // // // //                         {c}
// // // // // //                       </th>
// // // // // //                     ))
// // // // // //                   )}
// // // // // //                 </tr>
// // // // // //                 <tr>
// // // // // //                   {dailyShifts.map((s) =>
// // // // // //                     dailyCols.map((c) => (
// // // // // //                       <th
// // // // // //                         key={`${s}-${c}-work`}
// // // // // //                         style={{ width: COL_W.data, textAlign: "center", fontWeight: 600, color: "#607d8b" }}
// // // // // //                         title={dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // // // // //                       >
// // // // // //                         {dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // // // // //                       </th>
// // // // // //                     ))
// // // // // //                   )}
// // // // // //                 </tr>
// // // // // //               </thead>
// // // // // //               <tbody>
// // // // // //                 {rows.map((r, idx) => (
// // // // // //                   <tr key={idx}>
// // // // // //                     <td style={{ width: COL_W.no, textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
// // // // // //                     <td style={{ width: COL_W.name }} title={r["검사항목명"] ?? ""}>
// // // // // //                       {r["검사항목명"] ?? ""}
// // // // // //                     </td>
// // // // // //                     <td style={{ width: this.state.specColWidth }} title={r["검사내용"] ?? ""}>
// // // // // //                       {r["검사내용"] ?? ""}
// // // // // //                     </td>
// // // // // //                     {dailyShifts.map((s) =>
// // // // // //                       dailyCols.map((c) => (
// // // // // //                         <td key={`${idx}-${s}-${c}`} style={{ width: COL_W.data, textAlign: "right" }}>
// // // // // //                           {fmtNum(r?.[s]?.[c], 3)}
// // // // // //                         </td>
// // // // // //                       ))
// // // // // //                     )}
// // // // // //                     <td style={{ width: COL_W.avg, textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
// // // // // //                   </tr>
// // // // // //                 ))}
// // // // // //                 {(!rows || rows.length === 0) && (
// // // // // //                   <tr>
// // // // // //                     <td colSpan={3 + dailyShifts.length * dailyCols.length + 1} style={{ textAlign: "center", padding: "32px 0" }}>
// // // // // //                       데이터가 없습니다.
// // // // // //                     </td>
// // // // // //                   </tr>
// // // // // //                 )}
// // // // // //               </tbody>
// // // // // //             </table>
// // // // // //           </Box>
// // // // // //         )}
// // // // // //       </Paper>
// // // // // //     );
// // // // // //   };

// // // // // //   /** 선택 일자 기준 멀티라인 차트 데이터 */
// // // // // //   buildChartDataForSelectedDay = () => {
// // // // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // // // //     if (!selectedDay) return { seriesKeys: [], rows: [] };
// // // // // //     const rowsSrc = dailyTables[selectedDay] || [];

// // // // // //     const labelOf = (r) => {
// // // // // //       const name = r["검사항목명"] ?? "";
// // // // // //       const spec = r["검사내용"] ?? "";
// // // // // //       return spec ? `${name} | ${spec}` : name;
// // // // // //     };

// // // // // //     const rows = dailyCols.map((x) => {
// // // // // //       const row = { x };
// // // // // //       rowsSrc.forEach((r) => {
// // // // // //         const key = labelOf(r);
// // // // // //         let sum = 0,
// // // // // //           cnt = 0;
// // // // // //         dailyShifts.forEach((s) => {
// // // // // //           const v = r?.[s]?.[x];
// // // // // //           if (v != null && v !== "") {
// // // // // //             sum += Number(v);
// // // // // //             cnt += 1;
// // // // // //           }
// // // // // //         });
// // // // // //         row[key] = cnt > 0 ? sum / cnt : null;
// // // // // //       });
// // // // // //       return row;
// // // // // //     });

// // // // // //     const seriesKeys = rowsSrc.map((r) => labelOf(r));
// // // // // //     return { seriesKeys, rows };
// // // // // //   };

// // // // // //   /** Xn 멀티라인 차트 (선택 일자) */
// // // // // //   renderSelectedDayChart = () => {
// // // // // //     const { loadingTrend, loadingDaily, selectedDay, filters } = this.state;

// // // // // //     if (!filters.partNo) {
// // // // // //       return (
// // // // // //         <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // // //           <Box className={s.sectionHeader}>
// // // // // //             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // // //               검사항목별 Xn 흐름
// // // // // //             </Typography>
// // // // // //           </Box>
// // // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // // // // //         </Paper>
// // // // // //       );
// // // // // //     }

// // // // // //     const { seriesKeys, rows } = this.buildChartDataForSelectedDay();

// // // // // //     return (
// // // // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // // //         <Box className={s.sectionHeader}>
// // // // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // // //             {selectedDay ? `${selectedDay} — 검사항목별 Xn 흐름` : "검사항목별 Xn 흐름"}
// // // // // //           </Typography>
// // // // // //         </Box>

// // // // // //         {loadingDaily ? (
// // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // //           </Box>
// // // // // //         ) : rows.length === 0 ? (
// // // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // // // //         ) : loadingTrend ? (
// // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // //             <CircularProgress size={44} sx={{ color: "#90caf9" }} />
// // // // // //           </Box>
// // // // // //         ) : (
// // // // // //           <Box style={{ width: "100%", height: 380 }}>
// // // // // //             <ResponsiveContainer>
// // // // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // // // //                 <XAxis dataKey="x" />
// // // // // //                 <YAxis />
// // // // // //                 <RTooltip />
// // // // // //                 <Legend />
// // // // // //                 {seriesKeys.map((k) => (
// // // // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // // // //                 ))}
// // // // // //               </LineChart>
// // // // // //             </ResponsiveContainer>
// // // // // //           </Box>
// // // // // //         )}
// // // // // //       </Paper>
// // // // // //     );
// // // // // //   };

// // // // // //   /** 숫자형(실측값) 검사항목 — 일자별 추이 차트 */
// // // // // //   buildNumericTrendChart = () => {
// // // // // //     const { numTrend } = this.state;
// // // // // //     const dates = numTrend?.dates || [];
// // // // // //     const series = numTrend?.series || [];
// // // // // //     if (dates.length === 0 || series.length === 0) return { keys: [], rows: [] };
// // // // // //     const rows = dates.map((d, i) => {
// // // // // //       const o = { date: d };
// // // // // //       series.forEach((s) => {
// // // // // //         o[s.label] = s.data?.[i] != null ? Number(s.data[i]) : null;
// // // // // //       });
// // // // // //       return o;
// // // // // //     });
// // // // // //     const keys = series.map((s) => s.label);
// // // // // //     return { keys, rows };
// // // // // //   };

// // // // // //   renderNumericTrendChart = () => {
// // // // // //     const { loadingTrend, filters } = this.state;

// // // // // //     if (!filters.partNo) {
// // // // // //       return (
// // // // // //         <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // // //           <Box className={s.sectionHeader}>
// // // // // //             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // // //               숫자형 검사항목 — 일자별 실측값 추이
// // // // // //             </Typography>
// // // // // //           </Box>
// // // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // // // // //         </Paper>
// // // // // //       );
// // // // // //     }

// // // // // //     const { keys, rows } = this.buildNumericTrendChart();
// // // // // //     return (
// // // // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // // //         <Box className={s.sectionHeader}>
// // // // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // // //             숫자형 검사항목 — 일자별 실측값 추이 (Top {filters.topN ?? 5})
// // // // // //           </Typography>
// // // // // //         </Box>
// // // // // //         {loadingTrend ? (
// // // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // // //           </Box>
// // // // // //         ) : rows.length === 0 ? (
// // // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // // // //         ) : (
// // // // // //           <Box style={{ width: "100%", height: 380 }}>
// // // // // //             <ResponsiveContainer>
// // // // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // // // //                 <XAxis dataKey="date" />
// // // // // //                 <YAxis />
// // // // // //                 <RTooltip />
// // // // // //                 <Legend />
// // // // // //                 {keys.map((k) => (
// // // // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // // // //                 ))}
// // // // // //               </LineChart>
// // // // // //             </ResponsiveContainer>
// // // // // //           </Box>
// // // // // //         )}
// // // // // //       </Paper>
// // // // // //     );
// // // // // //   };

// // // // // //   render() {
// // // // // //     const { error, dailyList, selectedDay, loadingDaily } = this.state;

// // // // // //     return (
// // // // // //       <Box className={s.root}>
// // // // // //         {/* 필터 바 */}
// // // // // //         {this.renderFilterBar()}

// // // // // //         {/* 에러 */}
// // // // // //         {error && (
// // // // // //           <Box sx={{ mb: 2 }}>
// // // // // //             <Alert severity="error" sx={{ mb: 2 }}>
// // // // // //               {error}
// // // // // //             </Alert>
// // // // // //             <Button
// // // // // //               variant="contained"
// // // // // //               onClick={this.loadAll}
// // // // // //               sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // // // // //             >
// // // // // //               다시 시도
// // // // // //             </Button>
// // // // // //           </Box>
// // // // // //         )}

// // // // // //         {/* 본문: 좌측 날짜 목록 + 우측 표/차트 */}
// // // // // //         <Box className={s.dailyLayout}>
// // // // // //           <Paper className={s.dayPanel}>
// // // // // //             <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a", mb: 1 }}>보고일</Typography>

// // // // // //             <Box className={s.dayList}>
// // // // // //               <div className={s.dayListHead}>
// // // // // //                 <span>보고일</span>
// // // // // //                 <span>설비</span>
// // // // // //                 <span>품번</span>
// // // // // //               </div>
// // // // // //               <div className={s.dayListBody}>
// // // // // //                 {loadingDaily ? (
// // // // // //                   <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6, color: "#90a4ae" }}>
// // // // // //                     <CircularProgress size={28} sx={{ mr: 1, color: "#ff8f00" }} />
// // // // // //                     로딩 중...
// // // // // //                   </Box>
// // // // // //                 ) : dailyList.length > 0 ? (
// // // // // //                   dailyList.map((row) => (
// // // // // //                     <div
// // // // // //                       key={row.d}
// // // // // //                       className={`${s.dayRow} ${selectedDay === row.d ? s.active : ""}`}
// // // // // //                       onClick={() => this.handleDayClick(row)}
// // // // // //                     >
// // // // // //                       <span>{row.d}</span>
// // // // // //                       <span>{row.equipment || "-"}</span>
// // // // // //                       <span>{row.partNo || "-"}</span>
// // // // // //                     </div>
// // // // // //                   ))
// // // // // //                 ) : (
// // // // // //                   <div className={s.dayEmpty}>기간/필터 조건에 해당하는 결과가 없습니다.</div>
// // // // // //                 )}
// // // // // //               </div>
// // // // // //             </Box>
// // // // // //           </Paper>

// // // // // //           <Box className={s.rightArea}>
// // // // // //             {this.renderDailyTable()}
// // // // // //             {this.renderSelectedDayChart()}
// // // // // //             {this.renderNumericTrendChart()}
// // // // // //           </Box>
// // // // // //         </Box>
// // // // // //       </Box>
// // // // // //     );
// // // // // //   }
// // // // // // }

// // // // // // export default InspectionSystemChart;

// // // // // // src/pages/inspection/InspectionSystemChart.js
// // // // // import React, { Component } from "react";
// // // // // import config from "../../config";

// // // // // import {
// // // // //   Box,
// // // // //   Paper,
// // // // //   Typography,
// // // // //   CardHeader,
// // // // //   IconButton,
// // // // //   Divider,
// // // // //   Collapse,
// // // // //   CircularProgress,
// // // // //   Alert,
// // // // //   Menu,
// // // // //   MenuItem,
// // // // //   TextField,
// // // // //   Button,
// // // // //   InputAdornment,
// // // // //   Chip,
// // // // // } from "@mui/material";
// // // // // import { Autocomplete } from "@mui/material";

// // // // // import {
// // // // //   Search as SearchIcon,
// // // // //   Clear as ClearIcon,
// // // // //   FilterList as FilterIcon,
// // // // //   ExpandMore as ExpandMoreIcon,
// // // // //   ExpandLess as ExpandLessIcon,
// // // // //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // // // //   FileDownload as DownloadIcon,
// // // // // } from "@mui/icons-material";

// // // // // import {
// // // // //   ResponsiveContainer,
// // // // //   LineChart,
// // // // //   Line,
// // // // //   XAxis,
// // // // //   YAxis,
// // // // //   CartesianGrid,
// // // // //   Tooltip as RTooltip,
// // // // //   Legend,
// // // // // } from "recharts";

// // // // // import InspectionItemModal from "../common/InspectionItemModal";
// // // // // import s from "./InspectionSystemChart.module.scss";

// // // // // /** ---------- helpers ---------- */
// // // // // const mainColor = "#1e88e5";

// // // // // const fmtNum = (v, d = null) => {
// // // // //   if (v === null || v === undefined || v === "") return "";
// // // // //   const n = Number(v);
// // // // //   if (Number.isNaN(n)) return String(v);
// // // // //   return d === null
// // // // //     ? n.toLocaleString()
// // // // //     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// // // // // };

// // // // // const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
// // // // // const today0 = () => {
// // // // //   const t = new Date();
// // // // //   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// // // // // };
// // // // // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // // // const getAnchorPos = (el) => {
// // // // //   if (!el) return null;
// // // // //   const r = el.getBoundingClientRect();
// // // // //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // // // // };
// // // // // const startOfWeek = (d) => {
// // // // //   const day = d.getDay();
// // // // //   const diff = (day === 0 ? -6 : 1) - day;
// // // // //   const s2 = new Date(d);
// // // // //   s2.setDate(d.getDate() + diff);
// // // // //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate());
// // // // // };
// // // // // const endOfWeek = (d) => {
// // // // //   const s2 = startOfWeek(d);
// // // // //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate() + 6);
// // // // // };
// // // // // const getWeeksOfMonth = (year, month) => {
// // // // //   const first = new Date(year, month - 1, 1);
// // // // //   const last = lastOfMonth(first);
// // // // //   let cur = startOfWeek(first);
// // // // //   const out = [];
// // // // //   let idx = 1;
// // // // //   while (cur <= last) {
// // // // //     const s = new Date(cur),
// // // // //       e = endOfWeek(cur);
// // // // //     const clipS = new Date(Math.max(s, first));
// // // // //     const clipE = new Date(Math.min(e, last));
// // // // //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// // // // //     idx += 1;
// // // // //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// // // // //   }
// // // // //   return out;
// // // // // };

// // // // // /** 기본 필터 */
// // // // // const getDefaultFilters = () => {
// // // // //   const y = new Date().getFullYear();
// // // // //   return {
// // // // //     start_date: iso(new Date(y, 0, 1)),
// // // // //     end_date: iso(new Date(y, 11, 31)),
// // // // //     factory: "아진산업-본사(경산)",
// // // // //     process: "프레스",
// // // // //     equipment: "1500T(E라인)",
// // // // //     partNo: "",
// // // // //     item: "",
// // // // //     inspType: "",
// // // // //     workType: "",
// // // // //     shiftType: "",
// // // // //     topN: 5,
// // // // //   };
// // // // // };

// // // // // /** ---- 표 틀 고정용 기본 폭 정의 ---- */
// // // // // const COL_W = { no: 64, name: 180, specBase: 320, data: 96, avg: 100 };
// // // // // const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
// // // // // const calcTableMinWidth = (colsLen, shiftsLen, specW) =>
// // // // //   COL_W.no + COL_W.name + specW + (colsLen || 0) * (shiftsLen || 0) * COL_W.data + COL_W.avg;

// // // // // /** ----- 정렬 유틸 ----- */
// // // // // const firstSeqIndex = (row, cols, shifts) => {
// // // // //   for (let i = 0; i < cols.length; i += 1) {
// // // // //     const c = cols[i];
// // // // //     for (const s of shifts) {
// // // // //       const v = row?.[s]?.[c];
// // // // //       if (v !== null && v !== undefined && v !== "") return i + 1;
// // // // //     }
// // // // //   }
// // // // //   return Number.MAX_SAFE_INTEGER;
// // // // // };
// // // // // const getInspectionSeq = (row, cols, shifts) => {
// // // // //   const raw = row?.["검사순번"];
// // // // //   const n = Number(raw);
// // // // //   if (raw !== undefined && raw !== null && !Number.isNaN(n)) return n;
// // // // //   return firstSeqIndex(row, cols, shifts);
// // // // // };
// // // // // const sortRowsByInspectionSeqAsc = (rows, cols, shifts) =>
// // // // //   [...rows].sort((a, b) => {
// // // // //     const ia = getInspectionSeq(a, cols, shifts);
// // // // //     const ib = getInspectionSeq(b, cols, shifts);
// // // // //     if (ia !== ib) return ia - ib;
// // // // //     const an = (a["검사항목명"] || "").localeCompare(b["검사항목명"] || "");
// // // // //     if (an !== 0) return an;
// // // // //     return (a["검사내용"] || "").localeCompare(b["검사내용"] || "");
// // // // //   });

// // // // // /** ---- 간단 LRU 캐시 ---- */
// // // // // class Lru {
// // // // //   constructor(limit = 8) {
// // // // //     this.limit = limit;
// // // // //     this.map = new Map();
// // // // //   }
// // // // //   get(k) {
// // // // //     if (!this.map.has(k)) return undefined;
// // // // //     const v = this.map.get(k);
// // // // //     this.map.delete(k);
// // // // //     this.map.set(k, v);
// // // // //     return v;
// // // // //   }
// // // // //   set(k, v) {
// // // // //     if (this.map.has(k)) this.map.delete(k);
// // // // //     this.map.set(k, v);
// // // // //     if (this.map.size > this.limit) {
// // // // //       const first = this.map.keys().next().value;
// // // // //       this.map.delete(first);
// // // // //     }
// // // // //   }
// // // // // }
// // // // // const keyOf = (filters) => {
// // // // //   const {
// // // // //     start_date,
// // // // //     end_date,
// // // // //     factory,
// // // // //     process,
// // // // //     equipment,
// // // // //     partNo,
// // // // //     inspType,
// // // // //     workType,
// // // // //     shiftType,
// // // // //     topN,
// // // // //   } = filters || {};
// // // // //   return JSON.stringify({ start_date, end_date, factory, process, equipment, partNo, inspType, workType, shiftType, topN });
// // // // // };

// // // // // class InspectionSystemChart extends Component {
// // // // //   state = {
// // // // //     filters: getDefaultFilters(),

// // // // //     // 보고일/표 데이터
// // // // //     dailyCols: [],
// // // // //     dailyDays: [],
// // // // //     dailyList: [],
// // // // //     dailyTables: {},
// // // // //     dailyShifts: [],
// // // // //     dailyWorkHeaders: {},
// // // // //     selectedDay: null,

// // // // //     // 숫자형 추이
// // // // //     numTrend: { dates: [], series: [] },

// // // // //     // 옵션
// // // // //     factories: [],
// // // // //     processes: [],
// // // // //     equipments: [],
// // // // //     parts: [],
// // // // //     items: [],
// // // // //     optionsLoading: false,

// // // // //     // UI 로딩 플래그(분리)
// // // // //     loadingDaily: false, // 보고일 목록 + 표 데이터
// // // // //     loadingTrend: false, // 숫자형 추이
// // // // //     error: "",
// // // // //     filterExpanded: false,

// // // // //     // 프리셋 상태/앵커
// // // // //     selectedYear: new Date().getFullYear(),
// // // // //     selectedMonth: new Date().getMonth() + 1,
// // // // //     yearAnchorPos: null,
// // // // //     monthAnchorPos: null,
// // // // //     weekAnchorPos: null,

// // // // //     years: [],

// // // // //     // 모달
// // // // //     itemCodeModalOpen: false,

// // // // //     // 동적 "검사내용" 폭(px)
// // // // //     specColWidth: COL_W.specBase,
// // // // //   };

// // // // //   // ==== 상태 플래그 ====
// // // // //   _hadSavedFilters = false; // 저장된 필터가 있었는지
// // // // //   _didDefaultFromDB = false; // 최신달 디폴트 설정을 했는지

// // // // //   // ==== 성능: 요청 무시 토큰 & 디바운스 타이머 & Abort ====
// // // // //   _runId = 0;
// // // // //   _pendingTimer = null;
// // // // //   _controllers = new Set();

// // // // //   // ==== 캐시 ====
// // // // //   _dailyCache = new Lru(6);
// // // // //   _trendCache = new Lru(6);
// // // // //   _optionsCache = new Lru(6);

// // // // //   // ==== 측정용 canvas ====
// // // // //   _measureCtx = null;
// // // // //   getMeasureCtx = () => {
// // // // //     if (typeof document === "undefined") return null;
// // // // //     if (!this._measureCtx) {
// // // // //       const canvas = document.createElement("canvas");
// // // // //       this._measureCtx = canvas.getContext("2d");
// // // // //     }
// // // // //     return this._measureCtx;
// // // // //   };
// // // // //   measureTextPx = (text) => {
// // // // //     const ctx = this.getMeasureCtx();
// // // // //     const font = '13px "Noto Sans KR", Roboto, Apple SD Gothic Neo, Arial, sans-serif';
// // // // //     if (!ctx) return String(text ?? "").length * 12;
// // // // //     ctx.font = font;
// // // // //     return ctx.measureText(String(text ?? "")).width;
// // // // //   };
// // // // //   computeSpecWidthFromRows = (rows) => {
// // // // //     let longestPx = this.measureTextPx("검사내용");
// // // // //     const addPad = 36;
// // // // //     const minPx = COL_W.specBase;
// // // // //     const hardMaxPx = 720;
// // // // //     (rows || []).forEach((r) => {
// // // // //       const px = this.measureTextPx(r?.["검사내용"]);
// // // // //       if (px > longestPx) longestPx = px;
// // // // //     });
// // // // //     return clamp(Math.ceil(longestPx) + addPad, minPx, hardMaxPx);
// // // // //   };

// // // // //   componentDidMount() {
// // // // //     const base = getDefaultFilters();
// // // // //     const saved = localStorage.getItem("inspectionFilters");
// // // // //     if (saved) {
// // // // //       try {
// // // // //         const parsed = JSON.parse(saved);
// // // // //         const merged = { ...base, ...parsed };
// // // // //         merged.factory = merged.factory || base.factory;
// // // // //         merged.process = merged.process || base.process;
// // // // //         merged.equipment = merged.equipment || base.equipment;
// // // // //         this._hadSavedFilters = true;
// // // // //         this.setState({ filters: merged });
// // // // //       } catch {
// // // // //         this.setState({ filters: base });
// // // // //       }
// // // // //     } else {
// // // // //       this.setState({ filters: base });
// // // // //     }
// // // // //     this.bootstrap();
// // // // //   }

// // // // //   componentDidUpdate(_, prevState) {
// // // // //     if (this.state.selectedDay !== prevState.selectedDay) {
// // // // //       const rows = this.state.dailyTables?.[this.state.selectedDay] || [];
// // // // //       const w = this.computeSpecWidthFromRows(rows);
// // // // //       if (w !== this.state.specColWidth) this.setState({ specColWidth: w });
// // // // //     }
// // // // //   }

// // // // //   /** --------- API ---------- */
// // // // //   _abortAll = () => {
// // // // //     for (const c of this._controllers) try { c.abort(); } catch {}
// // // // //     this._controllers.clear();
// // // // //   };
// // // // //   post = async (path, body) => {
// // // // //     const controller = new AbortController();
// // // // //     this._controllers.add(controller);
// // // // //     try {
// // // // //       const headers = { "Content-Type": "application/json" };
// // // // //       const res = await fetch(
// // // // //         `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
// // // // //         { method: "POST", headers, body: JSON.stringify(body || {}), signal: controller.signal }
// // // // //       );
// // // // //       if (!res.ok) {
// // // // //         const t = await res.text().catch(() => "");
// // // // //         throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// // // // //       }
// // // // //       const json = await res.json();
// // // // //       return json.data || [];
// // // // //     } finally {
// // // // //       this._controllers.delete(controller);
// // // // //     }
// // // // //   };

// // // // //   /** 모달 아이템 조회(정확 일치 우선) */
// // // // //   fetchItemFromModal = async (partNo) => {
// // // // //     if (!partNo) return "";
// // // // //     try {
// // // // //       const payload = {
// // // // //         q: String(partNo),
// // // // //         exact: true, // 백엔드에서 지원하면 정확일치, 미지원이어도 프론트에서 한 번 더 필터링
// // // // //         plant: this.state.filters.factory,
// // // // //         worker: this.state.filters.process,
// // // // //         line: this.state.filters.equipment,
// // // // //         startDate: this.state.filters.start_date,
// // // // //         endDate: this.state.filters.end_date,
// // // // //       };

// // // // //       const res = await fetch(
// // // // //         `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_modal/item_list`,
// // // // //         {
// // // // //           method: "POST",
// // // // //           headers: { "Content-Type": "application/json" },
// // // // //           body: JSON.stringify(payload),
// // // // //         }
// // // // //       );

// // // // //       const json = await res.json().catch(() => null);
// // // // //       const rows = Array.isArray(json?.data) ? json.data : [];

// // // // //       const readPn = (o) =>
// // // // //         o?.partNo ??
// // // // //         o?.품목번호 ??
// // // // //         o?.code ??
// // // // //         o?.value ??
// // // // //         o?.id ??
// // // // //         o?.PART_NO ??
// // // // //         o?.PartNo ??
// // // // //         o?.품번 ??
// // // // //         o?.itemCode;
// // // // //       const readNm = (o) =>
// // // // //         o?.item ??
// // // // //         o?.itemName ??
// // // // //         o?.품목명 ??
// // // // //         o?.name ??
// // // // //         o?.label ??
// // // // //         o?.ITEM_NM ??
// // // // //         o?.ItemName ??
// // // // //         o?.품명 ??
// // // // //         o?.part_nm;

// // // // //       // 정확 일치 우선
// // // // //       const exact = rows.find((r) => String(readPn(r)) === String(partNo));
// // // // //       if (exact) return readNm(exact) || "";

// // // // //       // fallback: 첫 번째 후보
// // // // //       if (rows.length) return readNm(rows[0]) || "";

// // // // //       return "";
// // // // //     } catch {
// // // // //       return "";
// // // // //     }
// // // // //   };

// // // // //   bootstrap = async () => {
// // // // //     await this.loadYears();
// // // // //     await this.loadOptions();
// // // // //     await this.initDefaultMonthFromDBIfNeeded(); // ★ 최신 달로 기간 자동 설정 (저장된 필터 없을 때만 1회)
// // // // //     this.loadAll();
// // // // //   };

// // // // //   /** 옵션 로드 + 품명 보정 (캐시) */
// // // // //   loadOptions = async () => {
// // // // //     const runId = ++this._runId;
// // // // //     const { filters } = this.state;
// // // // //     const k = keyOf({ ...filters, partNo: "", topN: undefined });
// // // // //     const cached = this._optionsCache.get(k);
// // // // //     if (cached) {
// // // // //       this.setState((prev) => {
// // // // //         const filledName = this.getItemNameFromOptions(prev.filters.partNo, cached.parts, cached.items);
// // // // //         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
// // // // //         const next = { ...cached, optionsLoading: false };
// // // // //         if (needFill) next.filters = { ...prev.filters, item: filledName };
// // // // //         return next;
// // // // //       });
// // // // //       return;
// // // // //     }

// // // // //     this.setState({ optionsLoading: true });
// // // // //     try {
// // // // //       const [factories, processes, equipments, parts, items] = await Promise.all([
// // // // //         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
// // // // //         this.post("/options/processes", { ...filters }),
// // // // //         this.post("/options/equipments", { ...filters }),
// // // // //         this.post("/options/parts", { ...filters }),
// // // // //         this.post("/options/items", { ...filters }),
// // // // //       ]);
// // // // //       if (runId !== this._runId) return;

// // // // //       const payload = { factories, processes, equipments, parts, items };
// // // // //       this._optionsCache.set(k, payload);

// // // // //       this.setState((prev) => {
// // // // //         const filledName = this.getItemNameFromOptions(prev.filters.partNo, parts, items);
// // // // //         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
// // // // //         const next = { ...payload, optionsLoading: false };
// // // // //         if (needFill) next.filters = { ...prev.filters, item: filledName };
// // // // //         return next;
// // // // //       });
// // // // //     } catch (e) {
// // // // //       console.error(e);
// // // // //       this.setState({ optionsLoading: false });
// // // // //     }
// // // // //   };

// // // // //   /** 연도 옵션 */
// // // // //   loadYears = async () => {
// // // // //     try {
// // // // //       const raw = await this.post("/options/years", { ...this.state.filters });
// // // // //       let years = Array.isArray(raw) ? raw.map((y) => Number(y)).filter(Boolean) : [];
// // // // //       if (!years.length) throw new Error("no years");
// // // // //       years.sort((a, b) => b - a);
// // // // //       this.setState({ years, selectedYear: years[0] });
// // // // //     } catch {
// // // // //       const y = new Date().getFullYear();
// // // // //       const years = [y, y - 1, y - 2, y - 3, y - 4];
// // // // //       this.setState({ years, selectedYear: y });
// // // // //     }
// // // // //   };

// // // // //   /** 최초 1회: DB의 가장 최근 보고일이 속한 "달"을 기본 기간으로 설정 */
// // // // //   initDefaultMonthFromDBIfNeeded = async () => {
// // // // //     if (this._hadSavedFilters || this._didDefaultFromDB) return; // 저장된 필터 있으면 스킵
// // // // //     try {
// // // // //       const y = this.state.selectedYear || new Date().getFullYear();
// // // // //       const tempFilters = {
// // // // //         ...this.state.filters,
// // // // //         start_date: iso(new Date(y, 0, 1)),
// // // // //         end_date: iso(new Date(y, 11, 31)),
// // // // //         partNo: "", // 품번 없이도 왼쪽은 조회됨(요구사항)
// // // // //         item: "",
// // // // //       };
// // // // //       // 최신 연도에서 보고일 목록 받아오기
// // // // //       const daily = await this.post("/xn_daily", tempFilters);
// // // // //       const dayStrs = [
// // // // //         ...(Array.isArray(daily?.days) ? daily.days : []),
// // // // //         ...((daily?.dayList || []).map((r) => r?.d).filter(Boolean)),
// // // // //       ].filter(Boolean);
// // // // //       if (!dayStrs.length) {
// // // // //         this._didDefaultFromDB = true;
// // // // //         return;
// // // // //       }
// // // // //       // YYYY-MM-DD 문자열이므로 사전식 비교로 최대값 가능
// // // // //       let latest = dayStrs[0];
// // // // //       for (const s of dayStrs) if (s > latest) latest = s;

// // // // //       const [yy, mm] = latest.split("-").map((n) => parseInt(n, 10));
// // // // //       const ms = new Date(yy, mm - 1, 1);
// // // // //       const me = lastOfMonth(ms);

// // // // //       await new Promise((resolve) =>
// // // // //         this.setState(
// // // // //           (prev) => ({
// // // // //             filters: { ...prev.filters, start_date: iso(ms), end_date: iso(me) },
// // // // //             selectedYear: yy,
// // // // //             selectedMonth: mm,
// // // // //           }),
// // // // //           resolve
// // // // //         )
// // // // //       );
// // // // //       this._didDefaultFromDB = true;
// // // // //     } catch (e) {
// // // // //       console.warn("initDefaultMonthFromDBIfNeeded failed:", e);
// // // // //       this._didDefaultFromDB = true; // 실패해도 재시도 루프 방지
// // // // //     }
// // // // //   };

// // // // //   /** 필터 변경 (200ms 디바운스) */
// // // // //   handleFilterChange = (field, value) => {
// // // // //     this.setState(
// // // // //       (prev) => {
// // // // //         const f = { ...prev.filters, [field]: value };
// // // // //         if (field === "factory") {
// // // // //           f.process = "";
// // // // //           f.equipment = "";
// // // // //           f.partNo = "";
// // // // //           f.item = "";
// // // // //         } else if (field === "process") {
// // // // //           f.equipment = "";
// // // // //           f.partNo = "";
// // // // //           f.item = "";
// // // // //         } else if (field === "equipment") {
// // // // //           f.partNo = "";
// // // // //           f.item = "";
// // // // //         } else if (field === "start_date" || field === "end_date") {
// // // // //           f.partNo = "";
// // // // //           f.item = "";
// // // // //         } else if (field === "topN") {
// // // // //           f.topN = Number(value) || 5;
// // // // //         }
// // // // //         return { filters: f };
// // // // //       },
// // // // //       () => {
// // // // //         if (this._pendingTimer) clearTimeout(this._pendingTimer);
// // // // //         this._pendingTimer = setTimeout(async () => {
// // // // //           await this.loadOptions();
// // // // //           await this.loadAll();
// // // // //         }, 200);
// // // // //       }
// // // // //     );
// // // // //   };

// // // // //   /** 날짜 프리셋/범위 */
// // // // //   setDateRange = async (start, end) => {
// // // // //     const start_date = iso(start);
// // // // //     const end_date = iso(end);
// // // // //     this.setState(
// // // // //       (prev) => ({
// // // // //         filters: { ...prev.filters, start_date, end_date, partNo: "", item: "" },
// // // // //       }),
// // // // //       async () => {
// // // // //         try {
// // // // //           localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
// // // // //         } catch {}
// // // // //         await this.loadOptions();
// // // // //         this.loadAll();
// // // // //       }
// // // // //     );
// // // // //   };
// // // // //   applyToday = () => {
// // // // //     const t = today0();
// // // // //     this.setDateRange(t, t);
// // // // //   };
// // // // //   selectYear = (y) => {
// // // // //     const s = new Date(y, 0, 1);
// // // // //     const e = new Date(y, 11, 31);
// // // // //     this.setState({ selectedYear: y, yearAnchorPos: null });
// // // // //     this.setDateRange(s, e);
// // // // //   };
// // // // //   selectMonth = (m) => {
// // // // //     const y = this.state.selectedYear;
// // // // //     const s = new Date(y, m - 1, 1);
// // // // //     const e = lastOfMonth(s);
// // // // //     this.setState({ monthAnchorPos: null, selectedMonth: m });
// // // // //     this.setDateRange(s, e);
// // // // //   };
// // // // //   selectWeek = (w) => {
// // // // //     this.setState({ weekAnchorPos: null });
// // // // //     this.setDateRange(w.start, w.end);
// // // // //   };

// // // // //   /** 전체 초기화 */
// // // // //   resetToThisYear = async () => {
// // // // //     const y = new Date().getFullYear();
// // // // //     const filters = { ...getDefaultFilters(), start_date: iso(new Date(y, 0, 1)), end_date: iso(new Date(y, 11, 31)) };
// // // // //     this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth() + 1 }, async () => {
// // // // //       try {
// // // // //         localStorage.removeItem("inspectionFilters");
// // // // //       } catch {}
// // // // //       this._hadSavedFilters = false;
// // // // //       this._didDefaultFromDB = false; // 초기화 후 다시 최신달로 맞추도록
// // // // //       await this.loadOptions();
// // // // //       await this.initDefaultMonthFromDBIfNeeded();
// // // // //       this.loadAll();
// // // // //     });
// // // // //   };

// // // // //   /** 데이터 로드 (캐시 + 단계적 로딩: daily 먼저, trend 나중) */
// // // // //   loadAll = async () => {
// // // // //     const runId = ++this._runId;
// // // // //     this._abortAll();

// // // // //     const { filters } = this.state;
// // // // //     try {
// // // // //       localStorage.setItem("inspectionFilters", JSON.stringify(filters));
// // // // //     } catch {}

// // // // //     // --- DAILY ---
// // // // //     this.setState({ loadingDaily: true, error: "" });

// // // // //     const dailyKey = `daily:${keyOf(filters)}`;
// // // // //     const cachedDaily = this._dailyCache.get(dailyKey);
// // // // //     let daily;
// // // // //     try {
// // // // //       if (cachedDaily) {
// // // // //         daily = cachedDaily;
// // // // //       } else {
// // // // //         daily = await this.post("/xn_daily", filters);
// // // // //         this._dailyCache.set(dailyKey, daily);
// // // // //       }
// // // // //     } catch (e) {
// // // // //       console.error(e);
// // // // //       if (runId === this._runId) this.setState({ error: "데일리 데이터를 불러오지 못했습니다.", loadingDaily: false });
// // // // //       return;
// // // // //     }
// // // // //     if (runId !== this._runId) return;

// // // // //     const cols = daily?.cols || [];
// // // // //     const days = daily?.days || [];
// // // // //     const tables = daily?.tables || {};
// // // // //     const shifts = daily?.shifts || [];
// // // // //     const workHeaders = daily?.workHeaders || {};
// // // // //     const dayList = daily?.dayList || (days || []).map((d) => ({ d, equipment: "", partNo: "" }));

// // // // //     const firstDay = dayList?.[0]?.d || days?.[0] || null;
// // // // //     const nextSelected = this.state.selectedDay ?? firstDay;

// // // // //     const specColWidth = this.computeSpecWidthFromRows(tables?.[nextSelected] || []);

// // // // //     this.setState({
// // // // //       dailyCols: cols,
// // // // //       dailyDays: days,
// // // // //       dailyList: dayList,
// // // // //       dailyTables: tables,
// // // // //       dailyShifts: shifts,
// // // // //       dailyWorkHeaders: workHeaders,
// // // // //       selectedDay: nextSelected,
// // // // //       specColWidth,
// // // // //       loadingDaily: false,
// // // // //     });

// // // // //     // --- NUMERIC TREND ---
// // // // //     if (!filters.partNo) {
// // // // //       this.setState({ numTrend: { dates: [], series: [] }, loadingTrend: false });
// // // // //       return;
// // // // //     }

// // // // //     this.setState({ loadingTrend: true });
// // // // //     const trendKey = `trend:${keyOf(filters)}`;
// // // // //     try {
// // // // //       const numeric =
// // // // //         this._trendCache.get(trendKey) || (await this.post("/numeric_trend", filters));
// // // // //       this._trendCache.set(trendKey, numeric);
// // // // //       if (runId !== this._runId) return;
// // // // //       this.setState({ numTrend: numeric || { dates: [], series: [] }, loadingTrend: false });
// // // // //     } catch (e) {
// // // // //       console.error(e);
// // // // //       if (runId === this._runId) this.setState({ loadingTrend: false });
// // // // //     }
// // // // //   };

// // // // //   /** CSV 내보내기 */
// // // // //   exportCsv = () => {
// // // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // // //     if (!selectedDay) return;
// // // // //     const rawRows = dailyTables[selectedDay] || [];
// // // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// // // // //     const headLeft = ["NO", "검사항목명", "검사내용"];
// // // // //     const headMid = dailyShifts.flatMap((s) => dailyCols.map((c) => `${s}-${c}`));
// // // // //     const header = [...headLeft, ...headMid, "평균"];

// // // // //     const csvRows = [
// // // // //       header,
// // // // //       ...rows.map((r, idx) => {
// // // // //         const vals = dailyShifts.flatMap((s) => dailyCols.map((c) => r?.[s]?.[c] ?? ""));
// // // // //         return [String(idx + 1), r["검사항목명"] ?? "", r["검사내용"] ?? "", ...vals, r["평균"] ?? ""];
// // // // //       }),
// // // // //     ];
// // // // //     const csv = csvRows.map((r) => r.join(",")).join("\n");
// // // // //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // // // //     const url = URL.createObjectURL(blob);
// // // // //     const a = document.createElement("a");
// // // // //     a.href = url;
// // // // //     a.download = `xn_daily_${selectedDay}.csv`;
// // // // //     a.click();
// // // // //     URL.revokeObjectURL(url);
// // // // //   };

// // // // //   /** 품번/품명 모달 */
// // // // //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// // // // //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// // // // //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// // // // //     this.setState(
// // // // //       (prev) => ({
// // // // //         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
// // // // //         itemCodeModalOpen: false,
// // // // //       }),
// // // // //       () => {
// // // // //         this.loadOptions();
// // // // //         this.loadAll();
// // // // //       }
// // // // //     );
// // // // //   };

// // // // //   /** 품번 선택 해제 */
// // // // //   handleClearPart = () => {
// // // // //     this.setState(
// // // // //       (prev) => ({ filters: { ...prev.filters, partNo: "", item: "" } }),
// // // // //       () => {
// // // // //         this.loadOptions();
// // // // //         this.loadAll();
// // // // //       }
// // // // //     );
// // // // //   };

// // // // //   /** partNo → item(품명) 추론 (옵션 배열 사용) */
// // // // //   getItemNameFromOptions = (partNo, parts = this.state.parts, items = this.state.items) => {
// // // // //     if (!partNo) return "";
// // // // //     // 문자열 옵션도 허용
// // // // //     const readPn = (o) =>
// // // // //       typeof o === "string"
// // // // //         ? o
// // // // //         : (o?.partNo ??
// // // // //           o?.품목번호 ??
// // // // //           o?.code ??
// // // // //           o?.value ??
// // // // //           o?.id ??
// // // // //           o?.PART_NO ??
// // // // //           o?.PartNo ??
// // // // //           o?.품번 ??
// // // // //           o?.itemCode);
// // // // //     const readNm = (o) =>
// // // // //       typeof o === "string"
// // // // //         ? o
// // // // //         : (o?.item ??
// // // // //           o?.itemName ??
// // // // //           o?.품목명 ??
// // // // //           o?.name ??
// // // // //           o?.label ??
// // // // //           o?.ITEM_NM ??
// // // // //           o?.ItemName ??
// // // // //           o?.품명 ??
// // // // //           o?.part_nm);
// // // // //     for (const it of parts || []) if (String(readPn(it)) === String(partNo)) return readNm(it) || "";
// // // // //     for (const it of items || []) if (String(readPn(it)) === String(partNo)) return readNm(it) || "";
// // // // //     return "";
// // // // //   };

// // // // //   /** dayList 행에서 품명 추론 → 옵션으로 보정 */
// // // // //   resolveItemName = (row, partNo) => {
// // // // //     const cands = [
// // // // //       row?.item,
// // // // //       row?.itemName,
// // // // //       row?.partName,
// // // // //       row?.품목명,
// // // // //       row?.item_label,
// // // // //       row?.name,
// // // // //       row?.label,
// // // // //       row?.품명,
// // // // //       row?.part_nm,
// // // // //     ].filter(Boolean);
// // // // //     if (cands.length) return cands[0];
// // // // //     return this.getItemNameFromOptions(partNo);
// // // // //   };

// // // // //   /** 보고일 클릭 → 설비/품번(+품명) 자동 조회 (필요 시에만 네트워크) */
// // // // //   handleDayClick = async (row) => {
// // // // //     const { d, equipment, partNo } = row || {};
// // // // //     const { filters } = this.state;

// // // // //     if ((equipment || filters.equipment) === filters.equipment && (partNo || "") === (filters.partNo || "")) {
// // // // //       this.setState({ selectedDay: d });
// // // // //       return;
// // // // //     }

// // // // //     const preItem = this.resolveItemName(row, partNo || "");
// // // // //     this.setState(
// // // // //       (prev) => ({
// // // // //         selectedDay: d,
// // // // //         filters: {
// // // // //           ...prev.filters,
// // // // //           equipment: equipment || prev.filters.equipment,
// // // // //           partNo: partNo || "",
// // // // //           item: preItem || "",
// // // // //         },
// // // // //       }),
// // // // //       async () => {
// // // // //         // 1차: 옵션 재적재(옵션에서 보정 가능)
// // // // //         await this.loadOptions();

// // // // //         // 2차: 모달 API로 최종 보정 (품명이 비거나 '-' 같은 placeholder일 때)
// // // // //         const curPn = this.state.filters.partNo;
// // // // //         const curItem = (this.state.filters.item || "").trim();
// // // // //         if (curPn && (!curItem || curItem === "-")) {
// // // // //           const modalName = await this.fetchItemFromModal(curPn);
// // // // //           if (modalName) {
// // // // //             this.setState((prev) => ({ filters: { ...prev.filters, item: modalName } }));
// // // // //           } else {
// // // // //             // fallback: 옵션에서 다시 한 번
// // // // //             const fixed = this.getItemNameFromOptions(curPn);
// // // // //             if (fixed) this.setState((prev) => ({ filters: { ...prev.filters, item: fixed } }));
// // // // //           }
// // // // //         }

// // // // //         await this.loadAll();
// // // // //       }
// // // // //     );
// // // // //   };

// // // // //   // ---------- 상단 필터 ----------
// // // // //   renderFilterBar = () => {
// // // // //     const { filters } = this.state;

// // // // //     const now = today0();
// // // // //     const thisYear = now.getFullYear();
// // // // //     const thisMonth = now.getMonth() + 1;
// // // // //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// // // // //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// // // // //     return (
// // // // //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// // // // //         <CardHeader
// // // // //           title={
// // // // //             <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
// // // // //               <FilterIcon /> 검색 조건
// // // // //             </Typography>
// // // // //           }
// // // // //           action={
// // // // //             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
// // // // //               <Button
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 color="success"
// // // // //                 endIcon={<ExpandMoreIcon />}
// // // // //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // //               >
// // // // //                 연간
// // // // //               </Button>
// // // // //               <Menu
// // // // //                 open={!!this.state.yearAnchorPos}
// // // // //                 onClose={() => this.setState({ yearAnchorPos: null })}
// // // // //                 anchorReference="anchorPosition"
// // // // //                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// // // // //               >
// // // // //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>
// // // // //                   올해
// // // // //                 </MenuItem>
// // // // //                 {this.state.years.map((y) => (
// // // // //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
// // // // //                     {y}년
// // // // //                   </MenuItem>
// // // // //                 ))}
// // // // //               </Menu>

// // // // //               <Button
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 color="success"
// // // // //                 endIcon={<ExpandMoreIcon />}
// // // // //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // //               >
// // // // //                 월간
// // // // //               </Button>
// // // // //               <Menu
// // // // //                 open={!!this.state.monthAnchorPos}
// // // // //                 onClose={() => this.setState({ monthAnchorPos: null })}
// // // // //                 anchorReference="anchorPosition"
// // // // //                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// // // // //               >
// // // // //                 <MenuItem
// // // // //                   dense
// // // // //                   onClick={() => {
// // // // //                     this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth));
// // // // //                   }}
// // // // //                 >
// // // // //                   이번달
// // // // //                 </MenuItem>
// // // // //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // // // //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// // // // //                     {this.state.selectedYear}년 {m}월
// // // // //                   </MenuItem>
// // // // //                 ))}
// // // // //               </Menu>

// // // // //               <Button
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 color="success"
// // // // //                 endIcon={<ExpandMoreIcon />}
// // // // //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // //               >
// // // // //                 주간
// // // // //               </Button>
// // // // //               <Menu
// // // // //                 open={!!this.state.weekAnchorPos}
// // // // //                 onClose={() => this.setState({ weekAnchorPos: null })}
// // // // //                 anchorReference="anchorPosition"
// // // // //                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
// // // // //               >
// // // // //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// // // // //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// // // // //                 </MenuItem>
// // // // //                 {weeks.map((w, i) => (
// // // // //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// // // // //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// // // // //                   </MenuItem>
// // // // //                 ))}
// // // // //               </Menu>

// // // // //               <Button
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 color="success"
// // // // //                 onClick={this.applyToday}
// // // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // // //               >
// // // // //                 오늘
// // // // //               </Button>

// // // // //               <Typography sx={{ color: "white", opacity: 0.8, mx: 0.5 }}>|</Typography>
// // // // //               <Typography sx={{ color: "white" }}>기간선택</Typography>
// // // // //               <TextField
// // // // //                 type="date"
// // // // //                 value={filters.start_date}
// // // // //                 onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// // // // //                 InputLabelProps={{ shrink: true }}
// // // // //               />
// // // // //               <Typography sx={{ color: "white" }}>~</Typography>
// // // // //               <TextField
// // // // //                 type="date"
// // // // //                 value={filters.end_date}
// // // // //                 onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// // // // //                 InputLabelProps={{ shrink: true }}
// // // // //               />

// // // // //               <IconButton
// // // // //                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
// // // // //                 sx={{ color: "white" }}
// // // // //               >
// // // // //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// // // // //               </IconButton>
// // // // //             </Box>
// // // // //           }
// // // // //           sx={{ backgroundColor: "#ff8f00", color: "white", borderRadius: 1, mb: 2 }}
// // // // //         />

// // // // //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// // // // //         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 2, mb: 1 }}>
// // // // //           <Autocomplete
// // // // //             size="small"
// // // // //             options={this.state.factories}
// // // // //             value={filters.factory || null}
// // // // //             onChange={(_, v) => this.handleFilterChange("factory", v || "")}
// // // // //             renderInput={(params) => <TextField {...params} label="공장" />}
// // // // //             clearOnEscape
// // // // //           />
// // // // //           <Autocomplete
// // // // //             size="small"
// // // // //             options={this.state.processes}
// // // // //             value={filters.process || null}
// // // // //             onChange={(_, v) => this.handleFilterChange("process", v || "")}
// // // // //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
// // // // //             clearOnEscape
// // // // //           />
// // // // //           <Autocomplete
// // // // //             size="small"
// // // // //             options={this.state.equipments}
// // // // //             value={filters.equipment || null}
// // // // //             onChange={(_, v) => this.handleFilterChange("equipment", v || "")}
// // // // //             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
// // // // //             clearOnEscape
// // // // //           />
// // // // //           <TextField
// // // // //             fullWidth
// // // // //             label="품번"
// // // // //             value={filters.partNo}
// // // // //             onClick={this.openItemCodeModal}
// // // // //             size="small"
// // // // //             variant="outlined"
// // // // //             InputProps={{
// // // // //               readOnly: true,
// // // // //               style: { cursor: "pointer" },
// // // // //               endAdornment: (
// // // // //                 <InputAdornment position="end">
// // // // //                   {Boolean(filters.partNo) && (
// // // // //                     <IconButton
// // // // //                       size="small"
// // // // //                       aria-label="품번 선택해제"
// // // // //                       onClick={(e) => {
// // // // //                         e.stopPropagation();
// // // // //                         this.handleClearPart();
// // // // //                       }}
// // // // //                       sx={{ mr: 0.5 }}
// // // // //                     >
// // // // //                       <ClearIcon fontSize="small" />
// // // // //                     </IconButton>
// // // // //                   )}
// // // // //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// // // // //                 </InputAdornment>
// // // // //               ),
// // // // //             }}
// // // // //             sx={{
// // // // //               "& .MuiInputBase-root": {
// // // // //                 cursor: "pointer",
// // // // //                 "&:hover": { backgroundColor: "#f5f5f5" },
// // // // //               },
// // // // //             }}
// // // // //           />
// // // // //           <TextField
// // // // //             fullWidth
// // // // //             label="품명(검사항목)"
// // // // //             value={filters.item}
// // // // //             onClick={this.openItemCodeModal}
// // // // //             size="small"
// // // // //             variant="outlined"
// // // // //             InputProps={{
// // // // //               readOnly: true,
// // // // //               style: { cursor: "pointer" },
// // // // //               endAdornment: (
// // // // //                 <InputAdornment position="end">
// // // // //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// // // // //                 </InputAdornment>
// // // // //               ),
// // // // //             }}
// // // // //             sx={{
// // // // //               "& .MuiInputBase-root": {
// // // // //                 cursor: "pointer",
// // // // //                 "&:hover": { backgroundColor: "#f5f5f5" },
// // // // //               },
// // // // //             }}
// // // // //           />
// // // // //         </Box>

// // // // //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// // // // //           <Divider sx={{ my: 2 }} />
// // // // //           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16 }}>
// // // // //             <TextField
// // // // //               fullWidth
// // // // //               label="검사구분"
// // // // //               value={filters.inspType}
// // // // //               onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
// // // // //               size="small"
// // // // //               variant="outlined"
// // // // //             />
// // // // //             <TextField
// // // // //               fullWidth
// // // // //               label="작업구분"
// // // // //               value={filters.workType}
// // // // //               onChange={(e) => this.handleFilterChange("workType", e.target.value)}
// // // // //               size="small"
// // // // //               variant="outlined"
// // // // //             />
// // // // //             <TextField
// // // // //               fullWidth
// // // // //               label="주야구분"
// // // // //               value={filters.shiftType}
// // // // //               onChange={(e) => this.handleFilterChange("shiftType", e.target.value)}
// // // // //               size="small"
// // // // //               variant="outlined"
// // // // //             />
// // // // //             <TextField
// // // // //               fullWidth
// // // // //               label="Top N"
// // // // //               type="number"
// // // // //               value={filters.topN ?? 5}
// // // // //               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
// // // // //               size="small"
// // // // //               variant="outlined"
// // // // //             />
// // // // //           </Box>
// // // // //         </Collapse>

// // // // //         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
// // // // //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
// // // // //             필터 초기화
// // // // //           </Button>
// // // // //           <Button
// // // // //             variant="contained"
// // // // //             startIcon={<SearchIcon />}
// // // // //             size="large"
// // // // //             sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // // // //             onClick={() => {
// // // // //               if (this._pendingTimer) clearTimeout(this._pendingTimer);
// // // // //               this.loadOptions();
// // // // //               this.loadAll();
// // // // //             }}
// // // // //           >
// // // // //             검색
// // // // //           </Button>
// // // // //           <Button
// // // // //             variant="outlined"
// // // // //             startIcon={<DownloadIcon />}
// // // // //             size="large"
// // // // //             onClick={this.exportCsv}
// // // // //             disabled={!this.state.filters.partNo}
// // // // //           >
// // // // //             CSV 내보내기
// // // // //           </Button>
// // // // //         </Box>

// // // // //         <InspectionItemModal
// // // // //           open={this.state.itemCodeModalOpen}
// // // // //           onClose={this.closeItemCodeModal}
// // // // //           onSelect={this.handleItemCodeSelect}
// // // // //           selectedItemCode={filters.partNo}
// // // // //           plant={filters.factory}
// // // // //           worker={filters.process}
// // // // //           line={filters.equipment}
// // // // //           startDate={filters.start_date}
// // // // //           endDate={filters.end_date}
// // // // //         />
// // // // //       </Paper>
// // // // //     );
// // // // //   };

// // // // //   /** 선택 일자의 Xn 표 */
// // // // //   renderDailyTable = () => {
// // // // //     const {
// // // // //       dailyCols,
// // // // //       dailyTables,
// // // // //       dailyShifts,
// // // // //       dailyWorkHeaders,
// // // // //       selectedDay,
// // // // //       loadingDaily,
// // // // //       filters,
// // // // //       specColWidth,
// // // // //     } = this.state;

// // // // //     if (!filters.partNo) {
// // // // //       return (
// // // // //         <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // // // //           <Box className={s.sectionHeader}>
// // // // //             <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // // //               작업순번(Xn) 결과표 — 주/야/작업구분
// // // // //             </Typography>
// // // // //           </Box>
// // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // // // //         </Paper>
// // // // //       );
// // // // //     }

// // // // //     const rawRows = selectedDay ? dailyTables[selectedDay] || [] : [];
// // // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// // // // //     const partText = filters.partNo ? filters.partNo : "전체 품번";
// // // // //     const itemText = filters.item || "";
// // // // //     const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

// // // // //     const tableMinW = calcTableMinWidth(dailyCols.length, dailyShifts.length, specColWidth);

// // // // //     return (
// // // // //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // // // //         <Box className={s.sectionHeader}>
// // // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // // //             작업순번(Xn) 결과표 — 주/야/작업구분
// // // // //           </Typography>
// // // // //           <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
// // // // //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
// // // // //             <Chip size="small" label={partText} />
// // // // //             {itemText && <Chip size="small" variant="outlined" label={itemText} />}
// // // // //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
// // // // //             <Chip size="small" label={rangeText} />
// // // // //             {selectedDay && (
// // // // //               <>
// // // // //                 <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>보고일</Typography>
// // // // //                 <Chip size="small" color="primary" variant="outlined" label={selectedDay} />
// // // // //               </>
// // // // //             )}
// // // // //           </Box>
// // // // //         </Box>

// // // // //         {loadingDaily ? (
// // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // //           </Box>
// // // // //         ) : (
// // // // //           <Box
// // // // //             sx={{
// // // // //               maxHeight: 800,
// // // // //               overflow: "auto",
// // // // //               borderRadius: 1,
// // // // //               "& table": {
// // // // //                 width: "100%",
// // // // //                 borderCollapse: "separate",
// // // // //                 borderSpacing: 0,
// // // // //                 tableLayout: "fixed",
// // // // //                 minWidth: tableMinW,
// // // // //               },
// // // // //               "& th, & td": {
// // // // //                 padding: "8px 10px",
// // // // //                 borderBottom: "1px solid #eceff1",
// // // // //                 fontSize: 13,
// // // // //                 whiteSpace: "nowrap",
// // // // //                 overflow: "hidden",
// // // // //                 textOverflow: "ellipsis",
// // // // //                 height: 40,
// // // // //                 lineHeight: "24px",
// // // // //                 verticalAlign: "middle",
// // // // //               },
// // // // //               "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
// // // // //               "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
// // // // //             }}
// // // // //           >
// // // // //             <table>
// // // // //               <thead>
// // // // //                 <tr>
// // // // //                   <th style={{ width: COL_W.no, textAlign: "center" }} rowSpan={3}>
// // // // //                     NO
// // // // //                   </th>
// // // // //                   <th style={{ width: COL_W.name }} rowSpan={3}>
// // // // //                     검사항목명
// // // // //                   </th>
// // // // //                   <th style={{ width: this.state.specColWidth }} rowSpan={3}>
// // // // //                     검사내용
// // // // //                   </th>
// // // // //                   {dailyShifts.map((s) => (
// // // // //                     <th key={s} colSpan={dailyCols.length} style={{ textAlign: "center" }}>
// // // // //                       {s || "전체"}
// // // // //                     </th>
// // // // //                   ))}
// // // // //                   <th rowSpan={3} style={{ width: COL_W.avg, textAlign: "right" }}>
// // // // //                     평균
// // // // //                   </th>
// // // // //                 </tr>
// // // // //                 <tr>
// // // // //                   {dailyShifts.map((s) =>
// // // // //                     dailyCols.map((c) => (
// // // // //                       <th key={`${s}-${c}`} style={{ width: COL_W.data, textAlign: "center" }}>
// // // // //                         {c}
// // // // //                       </th>
// // // // //                     ))
// // // // //                   )}
// // // // //                 </tr>
// // // // //                 <tr>
// // // // //                   {dailyShifts.map((s) =>
// // // // //                     dailyCols.map((c) => (
// // // // //                       <th
// // // // //                         key={`${s}-${c}-work`}
// // // // //                         style={{ width: COL_W.data, textAlign: "center", fontWeight: 600, color: "#607d8b" }}
// // // // //                         title={dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // // // //                       >
// // // // //                         {dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // // // //                       </th>
// // // // //                     ))
// // // // //                   )}
// // // // //                 </tr>
// // // // //               </thead>
// // // // //               <tbody>
// // // // //                 {rows.map((r, idx) => (
// // // // //                   <tr key={idx}>
// // // // //                     <td style={{ width: COL_W.no, textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
// // // // //                     <td style={{ width: COL_W.name }} title={r["검사항목명"] ?? ""}>
// // // // //                       {r["검사항목명"] ?? ""}
// // // // //                     </td>
// // // // //                     <td style={{ width: this.state.specColWidth }} title={r["검사내용"] ?? ""}>
// // // // //                       {r["검사내용"] ?? ""}
// // // // //                     </td>
// // // // //                     {dailyShifts.map((s) =>
// // // // //                       dailyCols.map((c) => (
// // // // //                         <td key={`${idx}-${s}-${c}`} style={{ width: COL_W.data, textAlign: "right" }}>
// // // // //                           {fmtNum(r?.[s]?.[c], 3)}
// // // // //                         </td>
// // // // //                       ))
// // // // //                     )}
// // // // //                     <td style={{ width: COL_W.avg, textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
// // // // //                   </tr>
// // // // //                 ))}
// // // // //                 {(!rows || rows.length === 0) && (
// // // // //                   <tr>
// // // // //                     <td colSpan={3 + dailyShifts.length * dailyCols.length + 1} style={{ textAlign: "center", padding: "32px 0" }}>
// // // // //                       데이터가 없습니다.
// // // // //                     </td>
// // // // //                   </tr>
// // // // //                 )}
// // // // //               </tbody>
// // // // //             </table>
// // // // //           </Box>
// // // // //         )}
// // // // //       </Paper>
// // // // //     );
// // // // //   };

// // // // //   /** 선택 일자 기준 멀티라인 차트 데이터 */
// // // // //   buildChartDataForSelectedDay = () => {
// // // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // // //     if (!selectedDay) return { seriesKeys: [], rows: [] };
// // // // //     const rowsSrc = dailyTables[selectedDay] || [];

// // // // //     const labelOf = (r) => {
// // // // //       const name = r["검사항목명"] ?? "";
// // // // //       const spec = r["검사내용"] ?? "";
// // // // //       return spec ? `${name} | ${spec}` : name;
// // // // //     };

// // // // //     const rows = dailyCols.map((x) => {
// // // // //       const row = { x };
// // // // //       rowsSrc.forEach((r) => {
// // // // //         const key = labelOf(r);
// // // // //         let sum = 0,
// // // // //           cnt = 0;
// // // // //         dailyShifts.forEach((s) => {
// // // // //           const v = r?.[s]?.[x];
// // // // //           if (v != null && v !== "") {
// // // // //             sum += Number(v);
// // // // //             cnt += 1;
// // // // //           }
// // // // //         });
// // // // //         row[key] = cnt > 0 ? sum / cnt : null;
// // // // //       });
// // // // //       return row;
// // // // //     });

// // // // //     const seriesKeys = rowsSrc.map((r) => labelOf(r));
// // // // //     return { seriesKeys, rows };
// // // // //   };

// // // // //   /** Xn 멀티라인 차트 (선택 일자) */
// // // // //   renderSelectedDayChart = () => {
// // // // //     const { loadingTrend, loadingDaily, selectedDay, filters } = this.state;

// // // // //     if (!filters.partNo) {
// // // // //       return (
// // // // //         <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // //           <Box className={s.sectionHeader}>
// // // // //             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // //               검사항목별 Xn 흐름
// // // // //             </Typography>
// // // // //           </Box>
// // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // // // //         </Paper>
// // // // //       );
// // // // //     }

// // // // //     const { seriesKeys, rows } = this.buildChartDataForSelectedDay();

// // // // //     return (
// // // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // //         <Box className={s.sectionHeader}>
// // // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // //             {selectedDay ? `${selectedDay} — 검사항목별 Xn 흐름` : "검사항목별 Xn 흐름"}
// // // // //           </Typography>
// // // // //         </Box>

// // // // //         {loadingDaily ? (
// // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // //           </Box>
// // // // //         ) : rows.length === 0 ? (
// // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // // //         ) : loadingTrend ? (
// // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // //             <CircularProgress size={44} sx={{ color: "#90caf9" }} />
// // // // //           </Box>
// // // // //         ) : (
// // // // //           <Box style={{ width: "100%", height: 380 }}>
// // // // //             <ResponsiveContainer>
// // // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // // //                 <XAxis dataKey="x" />
// // // // //                 <YAxis />
// // // // //                 <RTooltip />
// // // // //                 <Legend />
// // // // //                 {seriesKeys.map((k) => (
// // // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // // //                 ))}
// // // // //               </LineChart>
// // // // //             </ResponsiveContainer>
// // // // //           </Box>
// // // // //         )}
// // // // //       </Paper>
// // // // //     );
// // // // //   };

// // // // //   /** 숫자형(실측값) 검사항목 — 일자별 추이 차트 */
// // // // //   buildNumericTrendChart = () => {
// // // // //     const { numTrend } = this.state;
// // // // //     const dates = numTrend?.dates || [];
// // // // //     const series = numTrend?.series || [];
// // // // //     if (dates.length === 0 || series.length === 0) return { keys: [], rows: [] };
// // // // //     const rows = dates.map((d, i) => {
// // // // //       const o = { date: d };
// // // // //       series.forEach((s) => {
// // // // //         o[s.label] = s.data?.[i] != null ? Number(s.data[i]) : null;
// // // // //       });
// // // // //       return o;
// // // // //     });
// // // // //     const keys = series.map((s) => s.label);
// // // // //     return { keys, rows };
// // // // //   };

// // // // //   renderNumericTrendChart = () => {
// // // // //     const { loadingTrend, filters } = this.state;

// // // // //     if (!filters.partNo) {
// // // // //       return (
// // // // //         <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // //           <Box className={s.sectionHeader}>
// // // // //             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // //               숫자형 검사항목 — 일자별 실측값 추이
// // // // //             </Typography>
// // // // //           </Box>
// // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // // // //         </Paper>
// // // // //       );
// // // // //     }

// // // // //     const { keys, rows } = this.buildNumericTrendChart();
// // // // //     return (
// // // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // // //         <Box className={s.sectionHeader}>
// // // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // // //             숫자형 검사항목 — 일자별 실측값 추이 (Top {filters.topN ?? 5})
// // // // //           </Typography>
// // // // //         </Box>
// // // // //         {loadingTrend ? (
// // // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // // //           </Box>
// // // // //         ) : rows.length === 0 ? (
// // // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // // //         ) : (
// // // // //           <Box style={{ width: "100%", height: 380 }}>
// // // // //             <ResponsiveContainer>
// // // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // // //                 <XAxis dataKey="date" />
// // // // //                 <YAxis />
// // // // //                 <RTooltip />
// // // // //                 <Legend />
// // // // //                 {keys.map((k) => (
// // // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // // //                 ))}
// // // // //               </LineChart>
// // // // //             </ResponsiveContainer>
// // // // //           </Box>
// // // // //         )}
// // // // //       </Paper>
// // // // //     );
// // // // //   };

// // // // //   render() {
// // // // //     const { error, dailyList, selectedDay, loadingDaily } = this.state;

// // // // //     return (
// // // // //       <Box className={s.root}>
// // // // //         {/* 필터 바 */}
// // // // //         {this.renderFilterBar()}

// // // // //         {/* 에러 */}
// // // // //         {error && (
// // // // //           <Box sx={{ mb: 2 }}>
// // // // //             <Alert severity="error" sx={{ mb: 2 }}>
// // // // //               {error}
// // // // //             </Alert>
// // // // //             <Button
// // // // //               variant="contained"
// // // // //               onClick={this.loadAll}
// // // // //               sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // // // //             >
// // // // //               다시 시도
// // // // //             </Button>
// // // // //           </Box>
// // // // //         )}

// // // // //         {/* 본문: 좌측 날짜 목록 + 우측 표/차트 */}
// // // // //         <Box className={s.dailyLayout}>
// // // // //           <Paper className={s.dayPanel}>
// // // // //             <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a", mb: 1 }}>보고일</Typography>

// // // // //             <Box className={s.dayList}>
// // // // //               <div className={s.dayListHead}>
// // // // //                 <span>보고일</span>
// // // // //                 <span>설비</span>
// // // // //                 <span>품번</span>
// // // // //               </div>
// // // // //               <div className={s.dayListBody}>
// // // // //                 {loadingDaily ? (
// // // // //                   <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6, color: "#90a4ae" }}>
// // // // //                     <CircularProgress size={28} sx={{ mr: 1, color: "#ff8f00" }} />
// // // // //                     로딩 중...
// // // // //                   </Box>
// // // // //                 ) : dailyList.length > 0 ? (
// // // // //                   dailyList.map((row) => (
// // // // //                     <div
// // // // //                       key={row.d}
// // // // //                       className={`${s.dayRow} ${selectedDay === row.d ? s.active : ""}`}
// // // // //                       onClick={() => this.handleDayClick(row)}
// // // // //                     >
// // // // //                       <span>{row.d}</span>
// // // // //                       <span>{row.equipment || "-"}</span>
// // // // //                       <span>{row.partNo || "-"}</span>
// // // // //                     </div>
// // // // //                   ))
// // // // //                 ) : (
// // // // //                   <div className={s.dayEmpty}>기간/필터 조건에 해당하는 결과가 없습니다.</div>
// // // // //                 )}
// // // // //               </div>
// // // // //             </Box>
// // // // //           </Paper>

// // // // //           <Box className={s.rightArea}>
// // // // //             {this.renderDailyTable()}
// // // // //             {this.renderSelectedDayChart()}
// // // // //             {this.renderNumericTrendChart()}
// // // // //           </Box>
// // // // //         </Box>
// // // // //       </Box>
// // // // //     );
// // // // //   }
// // // // // }

// // // // // export default InspectionSystemChart;


// // // // // src/pages/inspection/InspectionSystemChart.js
// // // // import React, { Component } from "react";
// // // // import config from "../../config";

// // // // import {
// // // //   Box,
// // // //   Paper,
// // // //   Typography,
// // // //   CardHeader,
// // // //   IconButton,
// // // //   Divider,
// // // //   Collapse,
// // // //   CircularProgress,
// // // //   Alert,
// // // //   Menu,
// // // //   MenuItem,
// // // //   TextField,
// // // //   Button,
// // // //   InputAdornment,
// // // //   Chip,
// // // // } from "@mui/material";
// // // // import { Autocomplete } from "@mui/material";

// // // // import {
// // // //   Search as SearchIcon,
// // // //   Clear as ClearIcon,
// // // //   FilterList as FilterIcon,
// // // //   ExpandMore as ExpandMoreIcon,
// // // //   ExpandLess as ExpandLessIcon,
// // // //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // // //   FileDownload as DownloadIcon,
// // // // } from "@mui/icons-material";

// // // // import {
// // // //   ResponsiveContainer,
// // // //   LineChart,
// // // //   Line,
// // // //   XAxis,
// // // //   YAxis,
// // // //   CartesianGrid,
// // // //   Tooltip as RTooltip,
// // // //   Legend,
// // // // } from "recharts";

// // // // import InspectionItemModal from "../common/InspectionItemModal";
// // // // import s from "./InspectionSystemChart.module.scss";

// // // // /** ---------- helpers ---------- */
// // // // const mainColor = "#1e88e5";

// // // // const fmtNum = (v, d = null) => {
// // // //   if (v === null || v === undefined || v === "") return "";
// // // //   const n = Number(v);
// // // //   if (Number.isNaN(n)) return String(v);
// // // //   return d === null
// // // //     ? n.toLocaleString()
// // // //     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// // // // };

// // // // const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
// // // // const today0 = () => {
// // // //   const t = new Date();
// // // //   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// // // // };
// // // // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // // const getAnchorPos = (el) => {
// // // //   if (!el) return null;
// // // //   const r = el.getBoundingClientRect();
// // // //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // // // };
// // // // const startOfWeek = (d) => {
// // // //   const day = d.getDay();
// // // //   const diff = (day === 0 ? -6 : 1) - day;
// // // //   const s2 = new Date(d);
// // // //   s2.setDate(d.getDate() + diff);
// // // //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate());
// // // // };
// // // // const endOfWeek = (d) => {
// // // //   const s2 = startOfWeek(d);
// // // //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate() + 6);
// // // // };
// // // // const getWeeksOfMonth = (year, month) => {
// // // //   const first = new Date(year, month - 1, 1);
// // // //   const last = lastOfMonth(first);
// // // //   let cur = startOfWeek(first);
// // // //   const out = [];
// // // //   let idx = 1;
// // // //   while (cur <= last) {
// // // //     const s = new Date(cur),
// // // //       e = endOfWeek(cur);
// // // //     const clipS = new Date(Math.max(s, first));
// // // //     const clipE = new Date(Math.min(e, last));
// // // //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// // // //     idx += 1;
// // // //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// // // //   }
// // // //   return out;
// // // // };

// // // // /** 기본 필터 */
// // // // const getDefaultFilters = () => {
// // // //   const y = new Date().getFullYear();
// // // //   return {
// // // //     start_date: iso(new Date(y, 0, 1)),
// // // //     end_date: iso(new Date(y, 11, 31)),
// // // //     factory: "아진산업-본사(경산)",
// // // //     process: "프레스",
// // // //     equipment: "1500T(E라인)",
// // // //     partNo: "",
// // // //     item: "",
// // // //     inspType: "",
// // // //     workType: "",
// // // //     shiftType: "",
// // // //     topN: 5,
// // // //   };
// // // // };

// // // // /** ---- 표 틀 고정용 기본 폭 정의 ---- */
// // // // const COL_W = { no: 64, name: 180, specBase: 320, data: 96, avg: 100 };
// // // // const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
// // // // const calcTableMinWidth = (colsLen, shiftsLen, specW) =>
// // // //   COL_W.no + COL_W.name + specW + (colsLen || 0) * (shiftsLen || 0) * COL_W.data + COL_W.avg;

// // // // /** ----- 정렬 유틸 ----- */
// // // // const firstSeqIndex = (row, cols, shifts) => {
// // // //   for (let i = 0; i < cols.length; i += 1) {
// // // //     const c = cols[i];
// // // //     for (const s of shifts) {
// // // //       const v = row?.[s]?.[c];
// // // //       if (v !== null && v !== undefined && v !== "") return i + 1;
// // // //     }
// // // //   }
// // // //   return Number.MAX_SAFE_INTEGER;
// // // // };
// // // // const getInspectionSeq = (row, cols, shifts) => {
// // // //   const raw = row?.["검사순번"];
// // // //   const n = Number(raw);
// // // //   if (raw !== undefined && raw !== null && !Number.isNaN(n)) return n;
// // // //   return firstSeqIndex(row, cols, shifts);
// // // // };
// // // // const sortRowsByInspectionSeqAsc = (rows, cols, shifts) =>
// // // //   [...rows].sort((a, b) => {
// // // //     const ia = getInspectionSeq(a, cols, shifts);
// // // //     const ib = getInspectionSeq(b, cols, shifts);
// // // //     if (ia !== ib) return ia - ib;
// // // //     const an = (a["검사항목명"] || "").localeCompare(b["검사항목명"] || "");
// // // //     if (an !== 0) return an;
// // // //     return (a["검사내용"] || "").localeCompare(b["검사내용"] || "");
// // // //   });

// // // // /** ---- 간단 LRU 캐시 ---- */
// // // // class Lru {
// // // //   constructor(limit = 8) {
// // // //     this.limit = limit;
// // // //     this.map = new Map();
// // // //   }
// // // //   get(k) {
// // // //     if (!this.map.has(k)) return undefined;
// // // //     const v = this.map.get(k);
// // // //     this.map.delete(k);
// // // //     this.map.set(k, v);
// // // //     return v;
// // // //   }
// // // //   set(k, v) {
// // // //     if (this.map.has(k)) this.map.delete(k);
// // // //     this.map.set(k, v);
// // // //     if (this.map.size > this.limit) {
// // // //       const first = this.map.keys().next().value;
// // // //       this.map.delete(first);
// // // //     }
// // // //   }
// // // // }
// // // // const keyOf = (filters) => {
// // // //   const {
// // // //     start_date,
// // // //     end_date,
// // // //     factory,
// // // //     process,
// // // //     equipment,
// // // //     partNo,
// // // //     inspType,
// // // //     workType,
// // // //     shiftType,
// // // //     topN,
// // // //   } = filters || {};
// // // //   return JSON.stringify({ start_date, end_date, factory, process, equipment, partNo, inspType, workType, shiftType, topN });
// // // // };

// // // // // 문자열 정규화
// // // // const norm = (v) => String(v ?? "").trim();

// // // // class InspectionSystemChart extends Component {
// // // //   state = {
// // // //     filters: getDefaultFilters(),

// // // //     // 보고일/표 데이터
// // // //     dailyCols: [],
// // // //     dailyDays: [],
// // // //     dailyList: [],
// // // //     dailyTables: {},
// // // //     dailyShifts: [],
// // // //     dailyWorkHeaders: {},
// // // //     selectedDay: null,

// // // //     // 숫자형 추이
// // // //     numTrend: { dates: [], series: [] },

// // // //     // 옵션
// // // //     factories: [],
// // // //     processes: [],
// // // //     equipments: [],
// // // //     parts: [],
// // // //     items: [],
// // // //     optionsLoading: false,

// // // //     // UI 로딩 플래그(분리)
// // // //     loadingDaily: false, // 보고일 목록 + 표 데이터
// // // //     loadingTrend: false, // 숫자형 추이
// // // //     error: "",
// // // //     filterExpanded: false,

// // // //     // 프리셋 상태/앵커
// // // //     selectedYear: new Date().getFullYear(),
// // // //     selectedMonth: new Date().getMonth() + 1,
// // // //     yearAnchorPos: null,
// // // //     monthAnchorPos: null,
// // // //     weekAnchorPos: null,

// // // //     years: [],

// // // //     // 모달
// // // //     itemCodeModalOpen: false,

// // // //     // 동적 "검사내용" 폭(px)
// // // //     specColWidth: COL_W.specBase,
// // // //   };

// // // //   // ==== 상태 플래그 ====
// // // //   _hadSavedFilters = false; // 저장된 필터가 있었는지
// // // //   _didDefaultFromDB = false; // 최신달 디폴트 설정을 했는지

// // // //   // ==== 성능 ====
// // // //   _runId = 0;
// // // //   _pendingTimer = null;
// // // //   _controllers = new Set();

// // // //   // ==== 캐시 ====
// // // //   _dailyCache = new Lru(6);
// // // //   _trendCache = new Lru(6);
// // // //   _optionsCache = new Lru(6);

// // // //   // ==== 측정용 canvas ====
// // // //   _measureCtx = null;
// // // //   getMeasureCtx = () => {
// // // //     if (typeof document === "undefined") return null;
// // // //     if (!this._measureCtx) {
// // // //       const canvas = document.createElement("canvas");
// // // //       this._measureCtx = canvas.getContext("2d");
// // // //     }
// // // //     return this._measureCtx;
// // // //   };
// // // //   measureTextPx = (text) => {
// // // //     const ctx = this.getMeasureCtx();
// // // //     const font = '13px "Noto Sans KR", Roboto, Apple SD Gothic Neo, Arial, sans-serif';
// // // //     if (!ctx) return String(text ?? "").length * 12;
// // // //     ctx.font = font;
// // // //     return ctx.measureText(String(text ?? "")).width;
// // // //   };
// // // //   computeSpecWidthFromRows = (rows) => {
// // // //     let longestPx = this.measureTextPx("검사내용");
// // // //     const addPad = 36;
// // // //     const minPx = COL_W.specBase;
// // // //     const hardMaxPx = 720;
// // // //     (rows || []).forEach((r) => {
// // // //       const px = this.measureTextPx(r?.["검사내용"]);
// // // //       if (px > longestPx) longestPx = px;
// // // //     });
// // // //     return clamp(Math.ceil(longestPx) + addPad, minPx, hardMaxPx);
// // // //   };

// // // //   componentDidMount() {
// // // //     const base = getDefaultFilters();
// // // //     const saved = localStorage.getItem("inspectionFilters");
// // // //     if (saved) {
// // // //       try {
// // // //         const parsed = JSON.parse(saved);
// // // //         const merged = { ...base, ...parsed };
// // // //         merged.factory = merged.factory || base.factory;
// // // //         merged.process = merged.process || base.process;
// // // //         merged.equipment = merged.equipment || base.equipment;
// // // //         this._hadSavedFilters = true;
// // // //         this.setState({ filters: merged });
// // // //       } catch {
// // // //         this.setState({ filters: base });
// // // //       }
// // // //     } else {
// // // //       this.setState({ filters: base });
// // // //     }
// // // //     this.bootstrap();
// // // //   }

// // // //   componentDidUpdate(_, prevState) {
// // // //     if (this.state.selectedDay !== prevState.selectedDay) {
// // // //       const rows = this.state.dailyTables?.[this.state.selectedDay] || [];
// // // //       const w = this.computeSpecWidthFromRows(rows);
// // // //       if (w !== this.state.specColWidth) this.setState({ specColWidth: w });
// // // //     }
// // // //   }

// // // //   /** --------- API ---------- */
// // // //   _abortAll = () => {
// // // //     for (const c of this._controllers) try { c.abort(); } catch {}
// // // //     this._controllers.clear();
// // // //   };
// // // //   post = async (path, body) => {
// // // //     const controller = new AbortController();
// // // //     this._controllers.add(controller);
// // // //     try {
// // // //       const headers = { "Content-Type": "application/json" };
// // // //       const res = await fetch(
// // // //         `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
// // // //         { method: "POST", headers, body: JSON.stringify(body || {}), signal: controller.signal }
// // // //       );
// // // //       if (!res.ok) {
// // // //         const t = await res.text().catch(() => "");
// // // //         throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// // // //       }
// // // //       const json = await res.json();
// // // //       return json.data || [];
// // // //     } finally {
// // // //       this._controllers.delete(controller);
// // // //     }
// // // //   };

// // // //   /** 모달 아이템 조회(정확 일치 우선, 품번과 같은 문자열은 무시) */
// // // //   fetchItemFromModal = async (partNo) => {
// // // //     const pn = norm(partNo);
// // // //     if (!pn) return "";
// // // //     try {
// // // //       const payload = {
// // // //         q: pn,
// // // //         exact: true,
// // // //         plant: this.state.filters.factory,
// // // //         worker: this.state.filters.process,
// // // //         line: this.state.filters.equipment,
// // // //         startDate: this.state.filters.start_date,
// // // //         endDate: this.state.filters.end_date,
// // // //       };

// // // //       const res = await fetch(
// // // //         `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_modal/item_list`,
// // // //         {
// // // //           method: "POST",
// // // //           headers: { "Content-Type": "application/json" },
// // // //           body: JSON.stringify(payload),
// // // //         }
// // // //       );

// // // //       const json = await res.json().catch(() => null);
// // // //       const rows = Array.isArray(json?.data) ? json.data : [];

// // // //       const readPn = (o) =>
// // // //         o?.partNo ??
// // // //         o?.품목번호 ??
// // // //         o?.code ??
// // // //         o?.value ??
// // // //         o?.id ??
// // // //         o?.PART_NO ??
// // // //         o?.PartNo ??
// // // //         o?.품번 ??
// // // //         o?.itemCode;
// // // //       const readNm = (o) =>
// // // //         o?.item ??
// // // //         o?.itemName ??
// // // //         o?.품목명 ??
// // // //         o?.name ??
// // // //         o?.label ??
// // // //         o?.ITEM_NM ??
// // // //         o?.ItemName ??
// // // //         o?.품명 ??
// // // //         o?.part_nm;

// // // //       // 정확 일치 우선
// // // //       const exact = rows.find((r) => norm(readPn(r)) === pn);
// // // //       const nm = norm(exact ? readNm(exact) : rows.length ? readNm(rows[0]) : "");
// // // //       // 품번과 완전히 같은 문자열이면 품명으로 사용하지 않음
// // // //       if (nm && nm !== pn) return nm;
// // // //       return "";
// // // //     } catch {
// // // //       return "";
// // // //     }
// // // //   };

// // // //   bootstrap = async () => {
// // // //     await this.loadYears();
// // // //     await this.loadOptions();
// // // //     await this.initDefaultMonthFromDBIfNeeded(); // 저장된 필터 없을 때 최신 달로
// // // //     this.loadAll();
// // // //   };

// // // //   /** 옵션 로드 + 품명 보정 (캐시) */
// // // //   loadOptions = async () => {
// // // //     const runId = ++this._runId;
// // // //     const { filters } = this.state;
// // // //     const k = keyOf({ ...filters, partNo: "", topN: undefined });
// // // //     const cached = this._optionsCache.get(k);
// // // //     if (cached) {
// // // //       this.setState((prev) => {
// // // //         const filledName = this.getItemNameFromOptions(prev.filters.partNo, cached.parts, cached.items);
// // // //         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
// // // //         const next = { ...cached, optionsLoading: false };
// // // //         if (needFill) next.filters = { ...prev.filters, item: filledName };
// // // //         return next;
// // // //       });
// // // //       return;
// // // //     }

// // // //     this.setState({ optionsLoading: true });
// // // //     try {
// // // //       const [factories, processes, equipments, parts, items] = await Promise.all([
// // // //         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
// // // //         this.post("/options/processes", { ...filters }),
// // // //         this.post("/options/equipments", { ...filters }),
// // // //         this.post("/options/parts", { ...filters }),
// // // //         this.post("/options/items", { ...filters }),
// // // //       ]);
// // // //       if (runId !== this._runId) return;

// // // //       const payload = { factories, processes, equipments, parts, items };
// // // //       this._optionsCache.set(k, payload);

// // // //       this.setState((prev) => {
// // // //         const filledName = this.getItemNameFromOptions(prev.filters.partNo, parts, items);
// // // //         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
// // // //         const next = { ...payload, optionsLoading: false };
// // // //         if (needFill) next.filters = { ...prev.filters, item: filledName };
// // // //         return next;
// // // //       });
// // // //     } catch (e) {
// // // //       console.error(e);
// // // //       this.setState({ optionsLoading: false });
// // // //     }
// // // //   };

// // // //   /** 연도 옵션 */
// // // //   loadYears = async () => {
// // // //     try {
// // // //       const raw = await this.post("/options/years", { ...this.state.filters });
// // // //       let years = Array.isArray(raw) ? raw.map((y) => Number(y)).filter(Boolean) : [];
// // // //       if (!years.length) throw new Error("no years");
// // // //       years.sort((a, b) => b - a);
// // // //       this.setState({ years, selectedYear: years[0] });
// // // //     } catch {
// // // //       const y = new Date().getFullYear();
// // // //       const years = [y, y - 1, y - 2, y - 3, y - 4];
// // // //       this.setState({ years, selectedYear: y });
// // // //     }
// // // //   };

// // // //   /** 최초 1회: DB 최신 보고일의 "달"을 기본 기간으로 설정 */
// // // //   initDefaultMonthFromDBIfNeeded = async () => {
// // // //     if (this._hadSavedFilters || this._didDefaultFromDB) return;
// // // //     try {
// // // //       const y = this.state.selectedYear || new Date().getFullYear();
// // // //       const tempFilters = {
// // // //         ...this.state.filters,
// // // //         start_date: iso(new Date(y, 0, 1)),
// // // //         end_date: iso(new Date(y, 11, 31)),
// // // //         partNo: "",
// // // //         item: "",
// // // //       };
// // // //       const daily = await this.post("/xn_daily", tempFilters);
// // // //       const dayStrs = [
// // // //         ...(Array.isArray(daily?.days) ? daily.days : []),
// // // //         ...((daily?.dayList || []).map((r) => r?.d).filter(Boolean)),
// // // //       ].filter(Boolean);
// // // //       if (!dayStrs.length) {
// // // //         this._didDefaultFromDB = true;
// // // //         return;
// // // //       }
// // // //       let latest = dayStrs[0];
// // // //       for (const s of dayStrs) if (s > latest) latest = s;

// // // //       const [yy, mm] = latest.split("-").map((n) => parseInt(n, 10));
// // // //       const ms = new Date(yy, mm - 1, 1);
// // // //       const me = lastOfMonth(ms);

// // // //       await new Promise((resolve) =>
// // // //         this.setState(
// // // //           (prev) => ({
// // // //             filters: { ...prev.filters, start_date: iso(ms), end_date: iso(me) },
// // // //             selectedYear: yy,
// // // //             selectedMonth: mm,
// // // //           }),
// // // //           resolve
// // // //         )
// // // //       );
// // // //       this._didDefaultFromDB = true;
// // // //     } catch (e) {
// // // //       console.warn("initDefaultMonthFromDBIfNeeded failed:", e);
// // // //       this._didDefaultFromDB = true;
// // // //     }
// // // //   };

// // // //   /** 필터 변경 (200ms 디바운스) */
// // // //   handleFilterChange = (field, value) => {
// // // //     this.setState(
// // // //       (prev) => {
// // // //         const f = { ...prev.filters, [field]: value };
// // // //         if (field === "factory") {
// // // //           f.process = "";
// // // //           f.equipment = "";
// // // //           f.partNo = "";
// // // //           f.item = "";
// // // //         } else if (field === "process") {
// // // //           f.equipment = "";
// // // //           f.partNo = "";
// // // //           f.item = "";
// // // //         } else if (field === "equipment") {
// // // //           f.partNo = "";
// // // //           f.item = "";
// // // //         } else if (field === "start_date" || field === "end_date") {
// // // //           f.partNo = "";
// // // //           f.item = "";
// // // //         } else if (field === "topN") {
// // // //           f.topN = Number(value) || 5;
// // // //         }
// // // //         return { filters: f };
// // // //       },
// // // //       () => {
// // // //         if (this._pendingTimer) clearTimeout(this._pendingTimer);
// // // //         this._pendingTimer = setTimeout(async () => {
// // // //           await this.loadOptions();
// // // //           await this.loadAll();
// // // //         }, 200);
// // // //       }
// // // //     );
// // // //   };

// // // //   /** 날짜 프리셋/범위 */
// // // //   setDateRange = async (start, end) => {
// // // //     const start_date = iso(start);
// // // //     const end_date = iso(end);
// // // //     this.setState(
// // // //       (prev) => ({
// // // //         filters: { ...prev.filters, start_date, end_date, partNo: "", item: "" },
// // // //       }),
// // // //       async () => {
// // // //         try {
// // // //           localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
// // // //         } catch {}
// // // //         await this.loadOptions();
// // // //         this.loadAll();
// // // //       }
// // // //     );
// // // //   };
// // // //   applyToday = () => {
// // // //     const t = today0();
// // // //     this.setDateRange(t, t);
// // // //   };
// // // //   selectYear = (y) => {
// // // //     const s = new Date(y, 0, 1);
// // // //     const e = new Date(y, 11, 31);
// // // //     this.setState({ selectedYear: y, yearAnchorPos: null });
// // // //     this.setDateRange(s, e);
// // // //   };
// // // //   selectMonth = (m) => {
// // // //     const y = this.state.selectedYear;
// // // //     const s = new Date(y, m - 1, 1);
// // // //     const e = lastOfMonth(s);
// // // //     this.setState({ monthAnchorPos: null, selectedMonth: m });
// // // //     this.setDateRange(s, e);
// // // //   };
// // // //   selectWeek = (w) => {
// // // //     this.setState({ weekAnchorPos: null });
// // // //     this.setDateRange(w.start, w.end);
// // // //   };

// // // //   /** 전체 초기화 */
// // // //   resetToThisYear = async () => {
// // // //     const y = new Date().getFullYear();
// // // //     const filters = { ...getDefaultFilters(), start_date: iso(new Date(y, 0, 1)), end_date: iso(new Date(y, 11, 31)) };
// // // //     this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth() + 1 }, async () => {
// // // //       try {
// // // //         localStorage.removeItem("inspectionFilters");
// // // //       } catch {}
// // // //       this._hadSavedFilters = false;
// // // //       this._didDefaultFromDB = false;
// // // //       await this.loadOptions();
// // // //       await this.initDefaultMonthFromDBIfNeeded();
// // // //       this.loadAll();
// // // //     });
// // // //   };

// // // //   /** 데이터 로드 (캐시 + 단계적 로딩: daily 먼저, trend 나중) */
// // // //   loadAll = async () => {
// // // //     const runId = ++this._runId;
// // // //     this._abortAll();

// // // //     const { filters } = this.state;
// // // //     try {
// // // //       localStorage.setItem("inspectionFilters", JSON.stringify(filters));
// // // //     } catch {}

// // // //     // --- DAILY ---
// // // //     this.setState({ loadingDaily: true, error: "" });

// // // //     const dailyKey = `daily:${keyOf(filters)}`;
// // // //     const cachedDaily = this._dailyCache.get(dailyKey);
// // // //     let daily;
// // // //     try {
// // // //       if (cachedDaily) {
// // // //         daily = cachedDaily;
// // // //       } else {
// // // //         daily = await this.post("/xn_daily", filters);
// // // //         this._dailyCache.set(dailyKey, daily);
// // // //       }
// // // //     } catch (e) {
// // // //       console.error(e);
// // // //       if (runId === this._runId) this.setState({ error: "데일리 데이터를 불러오지 못했습니다.", loadingDaily: false });
// // // //       return;
// // // //     }
// // // //     if (runId !== this._runId) return;

// // // //     const cols = daily?.cols || [];
// // // //     const days = daily?.days || [];
// // // //     const tables = daily?.tables || {};
// // // //     const shifts = daily?.shifts || [];
// // // //     const workHeaders = daily?.workHeaders || {};
// // // //     const dayList = daily?.dayList || (days || []).map((d) => ({ d, equipment: "", partNo: "" }));

// // // //     const firstDay = dayList?.[0]?.d || days?.[0] || null;
// // // //     const nextSelected = this.state.selectedDay ?? firstDay;

// // // //     const specColWidth = this.computeSpecWidthFromRows(tables?.[nextSelected] || []);

// // // //     this.setState({
// // // //       dailyCols: cols,
// // // //       dailyDays: days,
// // // //       dailyList: dayList,
// // // //       dailyTables: tables,
// // // //       dailyShifts: shifts,
// // // //       dailyWorkHeaders: workHeaders,
// // // //       selectedDay: nextSelected,
// // // //       specColWidth,
// // // //       loadingDaily: false,
// // // //     });

// // // //     // --- NUMERIC TREND ---
// // // //     if (!filters.partNo) {
// // // //       this.setState({ numTrend: { dates: [], series: [] }, loadingTrend: false });
// // // //       return;
// // // //     }

// // // //     this.setState({ loadingTrend: true });
// // // //     const trendKey = `trend:${keyOf(filters)}`;
// // // //     try {
// // // //       const numeric =
// // // //         this._trendCache.get(trendKey) || (await this.post("/numeric_trend", filters));
// // // //       this._trendCache.set(trendKey, numeric);
// // // //       if (runId !== this._runId) return;
// // // //       this.setState({ numTrend: numeric || { dates: [], series: [] }, loadingTrend: false });
// // // //     } catch (e) {
// // // //       console.error(e);
// // // //       if (runId === this._runId) this.setState({ loadingTrend: false });
// // // //     }
// // // //   };

// // // //   /** CSV 내보내기 */
// // // //   exportCsv = () => {
// // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // //     if (!selectedDay) return;
// // // //     const rawRows = dailyTables[selectedDay] || [];
// // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// // // //     const headLeft = ["NO", "검사항목명", "검사내용"];
// // // //     const headMid = dailyShifts.flatMap((s) => dailyCols.map((c) => `${s}-${c}`));
// // // //     const header = [...headLeft, ...headMid, "평균"];

// // // //     const csvRows = [
// // // //       header,
// // // //       ...rows.map((r, idx) => {
// // // //         const vals = dailyShifts.flatMap((s) => dailyCols.map((c) => r?.[s]?.[c] ?? ""));
// // // //         return [String(idx + 1), r["검사항목명"] ?? "", r["검사내용"] ?? "", ...vals, r["평균"] ?? ""];
// // // //       }),
// // // //     ];
// // // //     const csv = csvRows.map((r) => r.join(",")).join("\n");
// // // //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // // //     const url = URL.createObjectURL(blob);
// // // //     const a = document.createElement("a");
// // // //     a.href = url;
// // // //     a.download = `xn_daily_${selectedDay}.csv`;
// // // //     a.click();
// // // //     URL.revokeObjectURL(url);
// // // //   };

// // // //   /** 품번/품명 모달 */
// // // //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// // // //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// // // //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// // // //     this.setState(
// // // //       (prev) => ({
// // // //         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
// // // //         itemCodeModalOpen: false,
// // // //       }),
// // // //       () => {
// // // //         this.loadOptions();
// // // //         this.loadAll();
// // // //       }
// // // //     );
// // // //   };

// // // //   /** 품번 선택 해제 */
// // // //   handleClearPart = () => {
// // // //     this.setState(
// // // //       (prev) => ({ filters: { ...prev.filters, partNo: "", item: "" } }),
// // // //       () => {
// // // //         this.loadOptions();
// // // //         this.loadAll();
// // // //       }
// // // //     );
// // // //   };

// // // //   /** partNo → item(품명) 추론 (옵션 배열 사용) */
// // // //   getItemNameFromOptions = (partNo, parts = this.state.parts, items = this.state.items) => {
// // // //     const pn = norm(partNo);
// // // //     if (!pn) return "";
// // // //     const readPn = (o) =>
// // // //       typeof o === "string"
// // // //         ? o
// // // //         : (o?.partNo ??
// // // //           o?.품목번호 ??
// // // //           o?.code ??
// // // //           o?.value ??
// // // //           o?.id ??
// // // //           o?.PART_NO ??
// // // //           o?.PartNo ??
// // // //           o?.품번 ??
// // // //           o?.itemCode);
// // // //     const readNm = (o) =>
// // // //       typeof o === "string"
// // // //         ? o
// // // //         : (o?.item ??
// // // //           o?.itemName ??
// // // //           o?.품목명 ??
// // // //           o?.name ??
// // // //           o?.label ??
// // // //           o?.ITEM_NM ??
// // // //           o?.ItemName ??
// // // //           o?.품명 ??
// // // //           o?.part_nm);

// // // //     for (const it of parts || []) {
// // // //       if (norm(readPn(it)) === pn) {
// // // //         const nm = norm(readNm(it));
// // // //         if (nm && nm !== pn) return nm;
// // // //       }
// // // //     }
// // // //     for (const it of items || []) {
// // // //       if (norm(readPn(it)) === pn) {
// // // //         const nm = norm(readNm(it));
// // // //         if (nm && nm !== pn) return nm;
// // // //       }
// // // //     }
// // // //     return "";
// // // //   };

// // // //   /** dayList 행에서 품명 후보 추론 → 옵션으로 보정 */
// // // //   resolveItemNameFromRow = (row, partNo) => {
// // // //     const pn = norm(partNo);
// // // //     const cands = [
// // // //       row?.item, row?.itemName, row?.partName, row?.품목명,
// // // //       row?.item_label, row?.name, row?.label, row?.품명, row?.part_nm,
// // // //     ].map(norm).filter((v) => v && v !== pn && v !== "-");
// // // //     if (cands.length) return cands[0];
// // // //     return this.getItemNameFromOptions(pn);
// // // //   };

// // // //   /** 보고일 클릭 → 설비/품번(+품명) 자동 반영 + 모달로 최종 보정 */
// // // //   handleDayClick = async (row) => {
// // // //     const { d, equipment, partNo } = row || {};
// // // //     const { filters } = this.state;

// // // //     // 동일 조건이면 날짜만 갱신
// // // //     if ((equipment || filters.equipment) === filters.equipment && (partNo || "") === (filters.partNo || "")) {
// // // //       this.setState({ selectedDay: d });
// // // //       return;
// // // //     }

// // // //     // 1차: row/옵션에서 품명 후보
// // // //     const preItem = this.resolveItemNameFromRow(row, partNo || "");
// // // //     this.setState(
// // // //       (prev) => ({
// // // //         selectedDay: d,
// // // //         filters: {
// // // //           ...prev.filters,
// // // //           equipment: equipment || prev.filters.equipment,
// // // //           partNo: partNo || "",
// // // //           item: preItem || "",
// // // //         },
// // // //       }),
// // // //       async () => {
// // // //         // 2차: 옵션 재적재(보정 가능)
// // // //         await this.loadOptions();

// // // //         // 3차: 모달 API에서 최종 보정 (비었거나 '-' 또는 품번과 동일하게 들어온 경우)
// // // //         const curPn = norm(this.state.filters.partNo);
// // // //         const curItem = norm(this.state.filters.item);
// // // //         if (curPn && (!curItem || curItem === "-" || curItem === curPn)) {
// // // //           const modalName = await this.fetchItemFromModal(curPn);
// // // //           if (modalName) {
// // // //             this.setState((prev) => ({ filters: { ...prev.filters, item: modalName } }));
// // // //           } else {
// // // //             // 옵션에서 마지막 시도
// // // //             const fixed = this.getItemNameFromOptions(curPn);
// // // //             const finalNm = norm(fixed);
// // // //             this.setState((prev) => ({
// // // //               filters: { ...prev.filters, item: finalNm && finalNm !== curPn ? finalNm : "" },
// // // //             }));
// // // //           }
// // // //         }

// // // //         await this.loadAll();
// // // //       }
// // // //     );
// // // //   };

// // // //   // ---------- 상단 필터 ----------
// // // //   renderFilterBar = () => {
// // // //     const { filters } = this.state;

// // // //     const now = today0();
// // // //     const thisYear = now.getFullYear();
// // // //     const thisMonth = now.getMonth() + 1;
// // // //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// // // //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// // // //     return (
// // // //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// // // //         <CardHeader
// // // //           title={
// // // //             <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
// // // //               <FilterIcon /> 검색 조건
// // // //             </Typography>
// // // //           }
// // // //           action={
// // // //             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
// // // //               <Button
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 color="success"
// // // //                 endIcon={<ExpandMoreIcon />}
// // // //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // //               >
// // // //                 연간
// // // //               </Button>
// // // //               <Menu
// // // //                 open={!!this.state.yearAnchorPos}
// // // //                 onClose={() => this.setState({ yearAnchorPos: null })}
// // // //                 anchorReference="anchorPosition"
// // // //                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// // // //               >
// // // //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>
// // // //                   올해
// // // //                 </MenuItem>
// // // //                 {this.state.years.map((y) => (
// // // //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
// // // //                     {y}년
// // // //                   </MenuItem>
// // // //                 ))}
// // // //               </Menu>

// // // //               <Button
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 color="success"
// // // //                 endIcon={<ExpandMoreIcon />}
// // // //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // //               >
// // // //                 월간
// // // //               </Button>
// // // //               <Menu
// // // //                 open={!!this.state.monthAnchorPos}
// // // //                 onClose={() => this.setState({ monthAnchorPos: null })}
// // // //                 anchorReference="anchorPosition"
// // // //                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// // // //               >
// // // //                 <MenuItem
// // // //                   dense
// // // //                   onClick={() => {
// // // //                     this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth));
// // // //                   }}
// // // //                 >
// // // //                   이번달
// // // //                 </MenuItem>
// // // //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // // //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// // // //                     {this.state.selectedYear}년 {m}월
// // // //                   </MenuItem>
// // // //                 ))}
// // // //               </Menu>

// // // //               <Button
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 color="success"
// // // //                 endIcon={<ExpandMoreIcon />}
// // // //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // //               >
// // // //                 주간
// // // //               </Button>
// // // //               <Menu
// // // //                 open={!!this.state.weekAnchorPos}
// // // //                 onClose={() => this.setState({ weekAnchorPos: null })}
// // // //                 anchorReference="anchorPosition"
// // // //                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
// // // //               >
// // // //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// // // //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// // // //                 </MenuItem>
// // // //                 {weeks.map((w, i) => (
// // // //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// // // //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// // // //                   </MenuItem>
// // // //                 ))}
// // // //               </Menu>

// // // //               <Button
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 color="success"
// // // //                 onClick={this.applyToday}
// // // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // // //               >
// // // //                 오늘
// // // //               </Button>

// // // //               <Typography sx={{ color: "white", opacity: 0.8, mx: 0.5 }}>|</Typography>
// // // //               <Typography sx={{ color: "white" }}>기간선택</Typography>
// // // //               <TextField
// // // //                 type="date"
// // // //                 value={filters.start_date}
// // // //                 onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// // // //                 InputLabelProps={{ shrink: true }}
// // // //               />
// // // //               <Typography sx={{ color: "white" }}>~</Typography>
// // // //               <TextField
// // // //                 type="date"
// // // //                 value={filters.end_date}
// // // //                 onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// // // //                 InputLabelProps={{ shrink: true }}
// // // //               />

// // // //               <IconButton
// // // //                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
// // // //                 sx={{ color: "white" }}
// // // //               >
// // // //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// // // //               </IconButton>
// // // //             </Box>
// // // //           }
// // // //           sx={{ backgroundColor: "#ff8f00", color: "white", borderRadius: 1, mb: 2 }}
// // // //         />

// // // //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// // // //         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 2, mb: 1 }}>
// // // //           <Autocomplete
// // // //             size="small"
// // // //             options={this.state.factories}
// // // //             value={filters.factory || null}
// // // //             onChange={(_, v) => this.handleFilterChange("factory", v || "")}
// // // //             renderInput={(params) => <TextField {...params} label="공장" />}
// // // //             clearOnEscape
// // // //           />
// // // //           <Autocomplete
// // // //             size="small"
// // // //             options={this.state.processes}
// // // //             value={filters.process || null}
// // // //             onChange={(_, v) => this.handleFilterChange("process", v || "")}
// // // //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
// // // //             clearOnEscape
// // // //           />
// // // //           <Autocomplete
// // // //             size="small"
// // // //             options={this.state.equipments}
// // // //             value={filters.equipment || null}
// // // //             onChange={(_, v) => this.handleFilterChange("equipment", v || "")}
// // // //             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
// // // //             clearOnEscape
// // // //           />
// // // //           <TextField
// // // //             fullWidth
// // // //             label="품번"
// // // //             value={filters.partNo}
// // // //             onClick={this.openItemCodeModal}
// // // //             size="small"
// // // //             variant="outlined"
// // // //             InputProps={{
// // // //               readOnly: true,
// // // //               style: { cursor: "pointer" },
// // // //               endAdornment: (
// // // //                 <InputAdornment position="end">
// // // //                   {Boolean(filters.partNo) && (
// // // //                     <IconButton
// // // //                       size="small"
// // // //                       aria-label="품번 선택해제"
// // // //                       onClick={(e) => {
// // // //                         e.stopPropagation();
// // // //                         this.handleClearPart();
// // // //                       }}
// // // //                       sx={{ mr: 0.5 }}
// // // //                     >
// // // //                       <ClearIcon fontSize="small" />
// // // //                     </IconButton>
// // // //                   )}
// // // //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// // // //                 </InputAdornment>
// // // //               ),
// // // //             }}
// // // //             sx={{
// // // //               "& .MuiInputBase-root": {
// // // //                 cursor: "pointer",
// // // //                 "&:hover": { backgroundColor: "#f5f5f5" },
// // // //               },
// // // //             }}
// // // //           />
// // // //           <TextField
// // // //             fullWidth
// // // //             label="품명(검사항목)"
// // // //             value={filters.item}
// // // //             onClick={this.openItemCodeModal}
// // // //             size="small"
// // // //             variant="outlined"
// // // //             InputProps={{
// // // //               readOnly: true,
// // // //               style: { cursor: "pointer" },
// // // //               endAdornment: (
// // // //                 <InputAdornment position="end">
// // // //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// // // //                 </InputAdornment>
// // // //               ),
// // // //             }}
// // // //             sx={{
// // // //               "& .MuiInputBase-root": {
// // // //                 cursor: "pointer",
// // // //                 "&:hover": { backgroundColor: "#f5f5f5" },
// // // //               },
// // // //             }}
// // // //           />
// // // //         </Box>

// // // //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// // // //           <Divider sx={{ my: 2 }} />
// // // //           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16 }}>
// // // //             <TextField
// // // //               fullWidth
// // // //               label="검사구분"
// // // //               value={filters.inspType}
// // // //               onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
// // // //               size="small"
// // // //               variant="outlined"
// // // //             />
// // // //             <TextField
// // // //               fullWidth
// // // //               label="작업구분"
// // // //               value={filters.workType}
// // // //               onChange={(e) => this.handleFilterChange("workType", e.target.value)}
// // // //               size="small"
// // // //               variant="outlined"
// // // //             />
// // // //             <TextField
// // // //               fullWidth
// // // //               label="주야구분"
// // // //               value={filters.shiftType}
// // // //               onChange={(e) => this.handleFilterChange("shiftType", e.target.value)}
// // // //               size="small"
// // // //               variant="outlined"
// // // //             />
// // // //             <TextField
// // // //               fullWidth
// // // //               label="Top N"
// // // //               type="number"
// // // //               value={filters.topN ?? 5}
// // // //               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
// // // //               size="small"
// // // //               variant="outlined"
// // // //             />
// // // //           </Box>
// // // //         </Collapse>

// // // //         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
// // // //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
// // // //             필터 초기화
// // // //           </Button>
// // // //           <Button
// // // //             variant="contained"
// // // //             startIcon={<SearchIcon />}
// // // //             size="large"
// // // //             sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // // //             onClick={() => {
// // // //               if (this._pendingTimer) clearTimeout(this._pendingTimer);
// // // //               this.loadOptions();
// // // //               this.loadAll();
// // // //             }}
// // // //           >
// // // //             검색
// // // //           </Button>
// // // //           <Button
// // // //             variant="outlined"
// // // //             startIcon={<DownloadIcon />}
// // // //             size="large"
// // // //             onClick={this.exportCsv}
// // // //             disabled={!this.state.filters.partNo}
// // // //           >
// // // //             CSV 내보내기
// // // //           </Button>
// // // //         </Box>

// // // //         <InspectionItemModal
// // // //           open={this.state.itemCodeModalOpen}
// // // //           onClose={this.closeItemCodeModal}
// // // //           onSelect={this.handleItemCodeSelect}
// // // //           selectedItemCode={filters.partNo}
// // // //           plant={filters.factory}
// // // //           worker={filters.process}
// // // //           line={filters.equipment}
// // // //           startDate={filters.start_date}
// // // //           endDate={filters.end_date}
// // // //         />
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   /** 선택 일자의 Xn 표 */
// // // //   renderDailyTable = () => {
// // // //     const {
// // // //       dailyCols,
// // // //       dailyTables,
// // // //       dailyShifts,
// // // //       dailyWorkHeaders,
// // // //       selectedDay,
// // // //       loadingDaily,
// // // //       filters,
// // // //       specColWidth,
// // // //     } = this.state;

// // // //     if (!filters.partNo) {
// // // //       return (
// // // //         <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // // //           <Box className={s.sectionHeader}>
// // // //             <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //               작업순번(Xn) 결과표 — 주/야/작업구분
// // // //             </Typography>
// // // //           </Box>
// // // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // // //         </Paper>
// // // //       );
// // // //     }

// // // //     const rawRows = selectedDay ? dailyTables[selectedDay] || [] : [];
// // // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// // // //     const partText = filters.partNo ? filters.partNo : "전체 품번";
// // // //     const itemText = filters.item || "";
// // // //     const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

// // // //     const tableMinW = calcTableMinWidth(dailyCols.length, dailyShifts.length, specColWidth);

// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             작업순번(Xn) 결과표 — 주/야/작업구분
// // // //           </Typography>
// // // //           <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
// // // //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
// // // //             <Chip size="small" label={partText} />
// // // //             {itemText && <Chip size="small" variant="outlined" label={itemText} />}
// // // //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
// // // //             <Chip size="small" label={rangeText} />
// // // //             {selectedDay && (
// // // //               <>
// // // //                 <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>보고일</Typography>
// // // //                 <Chip size="small" color="primary" variant="outlined" label={selectedDay} />
// // // //               </>
// // // //             )}
// // // //           </Box>
// // // //         </Box>

// // // //         {loadingDaily ? (
// // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // //           </Box>
// // // //         ) : (
// // // //           <Box
// // // //             sx={{
// // // //               maxHeight: 800,
// // // //               overflow: "auto",
// // // //               borderRadius: 1,
// // // //               "& table": {
// // // //                 width: "100%",
// // // //                 borderCollapse: "separate",
// // // //                 borderSpacing: 0,
// // // //                 tableLayout: "fixed",
// // // //                 minWidth: tableMinW,
// // // //               },
// // // //               "& th, & td": {
// // // //                 padding: "8px 10px",
// // // //                 borderBottom: "1px solid #eceff1",
// // // //                 fontSize: 13,
// // // //                 whiteSpace: "nowrap",
// // // //                 overflow: "hidden",
// // // //                 textOverflow: "ellipsis",
// // // //                 height: 40,
// // // //                 lineHeight: "24px",
// // // //                 verticalAlign: "middle",
// // // //               },
// // // //               "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
// // // //               "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
// // // //             }}
// // // //           >
// // // //             <table>
// // // //               <thead>
// // // //                 <tr>
// // // //                   <th style={{ width: COL_W.no, textAlign: "center" }} rowSpan={3}>
// // // //                     NO
// // // //                   </th>
// // // //                   <th style={{ width: COL_W.name }} rowSpan={3}>
// // // //                     검사항목명
// // // //                   </th>
// // // //                   <th style={{ width: this.state.specColWidth }} rowSpan={3}>
// // // //                     검사내용
// // // //                   </th>
// // // //                   {dailyShifts.map((s) => (
// // // //                     <th key={s} colSpan={dailyCols.length} style={{ textAlign: "center" }}>
// // // //                       {s || "전체"}
// // // //                     </th>
// // // //                   ))}
// // // //                   <th rowSpan={3} style={{ width: COL_W.avg, textAlign: "right" }}>
// // // //                     평균
// // // //                   </th>
// // // //                 </tr>
// // // //                 <tr>
// // // //                   {dailyShifts.map((s) =>
// // // //                     dailyCols.map((c) => (
// // // //                       <th key={`${s}-${c}`} style={{ width: COL_W.data, textAlign: "center" }}>
// // // //                         {c}
// // // //                       </th>
// // // //                     ))
// // // //                   )}
// // // //                 </tr>
// // // //                 <tr>
// // // //                   {dailyShifts.map((s) =>
// // // //                     dailyCols.map((c) => (
// // // //                       <th
// // // //                         key={`${s}-${c}-work`}
// // // //                         style={{ width: COL_W.data, textAlign: "center", fontWeight: 600, color: "#607d8b" }}
// // // //                         title={dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // // //                       >
// // // //                         {dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // // //                       </th>
// // // //                     ))
// // // //                   )}
// // // //                 </tr>
// // // //               </thead>
// // // //               <tbody>
// // // //                 {rows.map((r, idx) => (
// // // //                   <tr key={idx}>
// // // //                     <td style={{ width: COL_W.no, textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
// // // //                     <td style={{ width: COL_W.name }} title={r["검사항목명"] ?? ""}>
// // // //                       {r["검사항목명"] ?? ""}
// // // //                     </td>
// // // //                     <td style={{ width: this.state.specColWidth }} title={r["검사내용"] ?? ""}>
// // // //                       {r["검사내용"] ?? ""}
// // // //                     </td>
// // // //                     {dailyShifts.map((s) =>
// // // //                       dailyCols.map((c) => (
// // // //                         <td key={`${idx}-${s}-${c}`} style={{ width: COL_W.data, textAlign: "right" }}>
// // // //                           {fmtNum(r?.[s]?.[c], 3)}
// // // //                         </td>
// // // //                       ))
// // // //                     )}
// // // //                     <td style={{ width: COL_W.avg, textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
// // // //                   </tr>
// // // //                 ))}
// // // //                 {(!rows || rows.length === 0) && (
// // // //                   <tr>
// // // //                     <td colSpan={3 + dailyShifts.length * dailyCols.length + 1} style={{ textAlign: "center", padding: "32px 0" }}>
// // // //                       데이터가 없습니다.
// // // //                     </td>
// // // //                   </tr>
// // // //                 )}
// // // //               </tbody>
// // // //             </table>
// // // //           </Box>
// // // //         )}
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   /** 선택 일자 기준 멀티라인 차트 데이터 */
// // // //   buildChartDataForSelectedDay = () => {
// // // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // // //     if (!selectedDay) return { seriesKeys: [], rows: [] };
// // // //     const rowsSrc = dailyTables[selectedDay] || [];

// // // //     const labelOf = (r) => {
// // // //       const name = r["검사항목명"] ?? "";
// // // //       const spec = r["검사내용"] ?? "";
// // // //       return spec ? `${name} | ${spec}` : name;
// // // //     };

// // // //     const rows = dailyCols.map((x) => {
// // // //       const row = { x };
// // // //       rowsSrc.forEach((r) => {
// // // //         const key = labelOf(r);
// // // //         let sum = 0,
// // // //           cnt = 0;
// // // //         dailyShifts.forEach((s) => {
// // // //           const v = r?.[s]?.[x];
// // // //           if (v != null && v !== "") {
// // // //             sum += Number(v);
// // // //             cnt += 1;
// // // //           }
// // // //         });
// // // //         row[key] = cnt > 0 ? sum / cnt : null;
// // // //       });
// // // //       return row;
// // // //     });

// // // //     const seriesKeys = rowsSrc.map((r) => labelOf(r));
// // // //     return { seriesKeys, rows };
// // // //   };

// // // //   /** Xn 멀티라인 차트 (선택 일자) */
// // // //   renderSelectedDayChart = () => {
// // // //     const { loadingTrend, loadingDaily, selectedDay, filters } = this.state;

// // // //     if (!filters.partNo) {
// // // //       return (
// // // //         <Paper className={s.section} style={{ marginTop: 16 }}>
// // // //           <Box className={s.sectionHeader}>
// // // //             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // //               검사항목별 Xn 흐름
// // // //             </Typography>
// // // //           </Box>
// // // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // // //         </Paper>
// // // //       );
// // // //     }

// // // //     const { seriesKeys, rows } = this.buildChartDataForSelectedDay();

// // // //     return (
// // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // //             {selectedDay ? `${selectedDay} — 검사항목별 Xn 흐름` : "검사항목별 Xn 흐름"}
// // // //           </Typography>
// // // //         </Box>

// // // //         {loadingDaily ? (
// // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // //           </Box>
// // // //         ) : rows.length === 0 ? (
// // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // //         ) : loadingTrend ? (
// // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // //             <CircularProgress size={44} sx={{ color: "#90caf9" }} />
// // // //           </Box>
// // // //         ) : (
// // // //           <Box style={{ width: "100%", height: 380 }}>
// // // //             <ResponsiveContainer>
// // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // //                 <XAxis dataKey="x" />
// // // //                 <YAxis />
// // // //                 <RTooltip />
// // // //                 <Legend />
// // // //                 {seriesKeys.map((k) => (
// // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // //                 ))}
// // // //               </LineChart>
// // // //             </ResponsiveContainer>
// // // //           </Box>
// // // //         )}
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   /** 숫자형(실측값) 검사항목 — 일자별 추이 차트 */
// // // //   buildNumericTrendChart = () => {
// // // //     const { numTrend } = this.state;
// // // //     const dates = numTrend?.dates || [];
// // // //     const series = numTrend?.series || [];
// // // //     if (dates.length === 0 || series.length === 0) return { keys: [], rows: [] };
// // // //     const rows = dates.map((d, i) => {
// // // //       const o = { date: d };
// // // //       series.forEach((s) => {
// // // //         o[s.label] = s.data?.[i] != null ? Number(s.data[i]) : null;
// // // //       });
// // // //       return o;
// // // //     });
// // // //     const keys = series.map((s) => s.label);
// // // //     return { keys, rows };
// // // //   };

// // // //   renderNumericTrendChart = () => {
// // // //     const { loadingTrend, filters } = this.state;

// // // //     if (!filters.partNo) {
// // // //       return (
// // // //         <Paper className={s.section} style={{ marginTop: 16 }}>
// // // //           <Box className={s.sectionHeader}>
// // // //             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // //               숫자형 검사항목 — 일자별 실측값 추이
// // // //             </Typography>
// // // //           </Box>
// // // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // // //         </Paper>
// // // //       );
// // // //     }

// // // //     const { keys, rows } = this.buildNumericTrendChart();
// // // //     return (
// // // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // // //             숫자형 검사항목 — 일자별 실측값 추이 (Top {filters.topN ?? 5})
// // // //           </Typography>
// // // //         </Box>
// // // //         {loadingTrend ? (
// // // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // // //           </Box>
// // // //         ) : rows.length === 0 ? (
// // // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // // //         ) : (
// // // //           <Box style={{ width: "100%", height: 380 }}>
// // // //             <ResponsiveContainer>
// // // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // // //                 <CartesianGrid strokeDasharray="3 3" />
// // // //                 <XAxis dataKey="date" />
// // // //                 <YAxis />
// // // //                 <RTooltip />
// // // //                 <Legend />
// // // //                 {keys.map((k) => (
// // // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // // //                 ))}
// // // //               </LineChart>
// // // //             </ResponsiveContainer>
// // // //           </Box>
// // // //         )}
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   render() {
// // // //     const { error, dailyList, selectedDay, loadingDaily } = this.state;

// // // //     return (
// // // //       <Box className={s.root}>
// // // //         {/* 필터 바 */}
// // // //         {this.renderFilterBar()}

// // // //         {/* 에러 */}
// // // //         {error && (
// // // //           <Box sx={{ mb: 2 }}>
// // // //             <Alert severity="error" sx={{ mb: 2 }}>
// // // //               {error}
// // // //             </Alert>
// // // //             <Button
// // // //               variant="contained"
// // // //               onClick={this.loadAll}
// // // //               sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // // //             >
// // // //               다시 시도
// // // //             </Button>
// // // //           </Box>
// // // //         )}

// // // //         {/* 본문: 좌측 날짜 목록 + 우측 표/차트 */}
// // // //         <Box className={s.dailyLayout}>
// // // //           <Paper className={s.dayPanel}>
// // // //             <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a", mb: 1 }}>보고일</Typography>

// // // //             <Box className={s.dayList}>
// // // //               <div className={s.dayListHead}>
// // // //                 <span>보고일</span>
// // // //                 <span>설비</span>
// // // //                 <span>품번</span>
// // // //               </div>
// // // //               <div className={s.dayListBody}>
// // // //                 {loadingDaily ? (
// // // //                   <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6, color: "#90a4ae" }}>
// // // //                     <CircularProgress size={28} sx={{ mr: 1, color: "#ff8f00" }} />
// // // //                     로딩 중...
// // // //                   </Box>
// // // //                 ) : dailyList.length > 0 ? (
// // // //                   dailyList.map((row) => (
// // // //                     <div
// // // //                       key={row.d}
// // // //                       className={`${s.dayRow} ${selectedDay === row.d ? s.active : ""}`}
// // // //                       onClick={() => this.handleDayClick(row)}
// // // //                       title="클릭 시 상단 설비/품번/품명이 자동 반영됩니다"
// // // //                     >
// // // //                       <span>{row.d}</span>
// // // //                       <span>{row.equipment || "-"}</span>
// // // //                       <span>{row.partNo || "-"}</span>
// // // //                     </div>
// // // //                   ))
// // // //                 ) : (
// // // //                   <div className={s.dayEmpty}>기간/필터 조건에 해당하는 결과가 없습니다.</div>
// // // //                 )}
// // // //               </div>
// // // //             </Box>
// // // //           </Paper>

// // // //           <Box className={s.rightArea}>
// // // //             {this.renderDailyTable()}
// // // //             {this.renderSelectedDayChart()}
// // // //             {this.renderNumericTrendChart()}
// // // //           </Box>
// // // //         </Box>
// // // //       </Box>
// // // //     );
// // // //   }
// // // // }

// // // // export default InspectionSystemChart;


// // // // src/pages/inspection/InspectionSystemChart.js
// // // import React, { Component } from "react";
// // // import config from "../../config";

// // // import {
// // //   Box,
// // //   Paper,
// // //   Typography,
// // //   CardHeader,
// // //   IconButton,
// // //   Divider,
// // //   Collapse,
// // //   CircularProgress,
// // //   Alert,
// // //   Menu,
// // //   MenuItem,
// // //   TextField,
// // //   Button,
// // //   InputAdornment,
// // //   Chip,
// // // } from "@mui/material";
// // // import { Autocomplete } from "@mui/material";

// // // import {
// // //   Search as SearchIcon,
// // //   Clear as ClearIcon,
// // //   FilterList as FilterIcon,
// // //   ExpandMore as ExpandMoreIcon,
// // //   ExpandLess as ExpandLessIcon,
// // //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // //   FileDownload as DownloadIcon,
// // // } from "@mui/icons-material";

// // // import {
// // //   ResponsiveContainer,
// // //   LineChart,
// // //   Line,
// // //   XAxis,
// // //   YAxis,
// // //   CartesianGrid,
// // //   Tooltip as RTooltip,
// // //   Legend,
// // // } from "recharts";

// // // import InspectionItemModal from "../common/InspectionItemModal";
// // // import s from "./InspectionSystemChart.module.scss";

// // // /** ---------- helpers ---------- */
// // // const mainColor = "#1e88e5";

// // // const fmtNum = (v, d = null) => {
// // //   if (v === null || v === undefined || v === "") return "";
// // //   const n = Number(v);
// // //   if (Number.isNaN(n)) return String(v);
// // //   return d === null
// // //     ? n.toLocaleString()
// // //     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// // // };

// // // const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
// // // const today0 = () => {
// // //   const t = new Date();
// // //   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// // // };
// // // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // const getAnchorPos = (el) => {
// // //   if (!el) return null;
// // //   const r = el.getBoundingClientRect();
// // //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // // };
// // // const startOfWeek = (d) => {
// // //   const day = d.getDay();
// // //   const diff = (day === 0 ? -6 : 1) - day;
// // //   const s2 = new Date(d);
// // //   s2.setDate(d.getDate() + diff);
// // //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate());
// // // };
// // // const endOfWeek = (d) => {
// // //   const s2 = startOfWeek(d);
// // //   return new Date(s2.getFullYear(), s2.getMonth(), s2.getDate() + 6);
// // // };
// // // const getWeeksOfMonth = (year, month) => {
// // //   const first = new Date(year, month - 1, 1);
// // //   const last = lastOfMonth(first);
// // //   let cur = startOfWeek(first);
// // //   const out = [];
// // //   let idx = 1;
// // //   while (cur <= last) {
// // //     const s = new Date(cur),
// // //       e = endOfWeek(cur);
// // //     const clipS = new Date(Math.max(s, first));
// // //     const clipE = new Date(Math.min(e, last));
// // //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// // //     idx += 1;
// // //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// // //   }
// // //   return out;
// // // };

// // // /** 기본 필터 */
// // // const getDefaultFilters = () => {
// // //   const y = new Date().getFullYear();
// // //   return {
// // //     start_date: iso(new Date(y, 0, 1)),
// // //     end_date: iso(new Date(y, 11, 31)),
// // //     factory: "아진산업-본사(경산)",
// // //     process: "프레스",
// // //     equipment: "1500T(E라인)",
// // //     partNo: "",
// // //     item: "",
// // //     inspType: "",
// // //     workType: "",
// // //     shiftType: "",
// // //     topN: 5,
// // //   };
// // // };

// // // /** ---- 표 틀 고정용 기본 폭 정의 ---- */
// // // const COL_W = { no: 64, name: 180, specBase: 320, data: 96, avg: 100 };
// // // const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
// // // const calcTableMinWidth = (colsLen, shiftsLen, specW) =>
// // //   COL_W.no + COL_W.name + specW + (colsLen || 0) * (shiftsLen || 0) * COL_W.data + COL_W.avg;

// // // /** ----- 정렬 유틸 ----- */
// // // const firstSeqIndex = (row, cols, shifts) => {
// // //   for (let i = 0; i < cols.length; i += 1) {
// // //     const c = cols[i];
// // //     for (const s of shifts) {
// // //       const v = row?.[s]?.[c];
// // //       if (v !== null && v !== undefined && v !== "") return i + 1;
// // //     }
// // //   }
// // //   return Number.MAX_SAFE_INTEGER;
// // // };
// // // const getInspectionSeq = (row, cols, shifts) => {
// // //   const raw = row?.["검사순번"];
// // //   const n = Number(raw);
// // //   if (raw !== undefined && raw !== null && !Number.isNaN(n)) return n;
// // //   return firstSeqIndex(row, cols, shifts);
// // // };
// // // const sortRowsByInspectionSeqAsc = (rows, cols, shifts) =>
// // //   [...rows].sort((a, b) => {
// // //     const ia = getInspectionSeq(a, cols, shifts);
// // //     const ib = getInspectionSeq(b, cols, shifts);
// // //     if (ia !== ib) return ia - ib;
// // //     const an = (a["검사항목명"] || "").localeCompare(b["검사항목명"] || "");
// // //     if (an !== 0) return an;
// // //     return (a["검사내용"] || "").localeCompare(b["검사내용"] || "");
// // //   });

// // // /** ---- 간단 LRU 캐시 ---- */
// // // class Lru {
// // //   constructor(limit = 8) {
// // //     this.limit = limit;
// // //     this.map = new Map();
// // //   }
// // //   get(k) {
// // //     if (!this.map.has(k)) return undefined;
// // //     const v = this.map.get(k);
// // //     this.map.delete(k);
// // //     this.map.set(k, v);
// // //     return v;
// // //   }
// // //   set(k, v) {
// // //     if (this.map.has(k)) this.map.delete(k);
// // //     this.map.set(k, v);
// // //     if (this.map.size > this.limit) {
// // //       const first = this.map.keys().next().value;
// // //       this.map.delete(first);
// // //     }
// // //   }
// // // }
// // // const keyOf = (filters) => {
// // //   const {
// // //     start_date,
// // //     end_date,
// // //     factory,
// // //     process,
// // //     equipment,
// // //     partNo,
// // //     inspType,
// // //     workType,
// // //     shiftType,
// // //     topN,
// // //   } = filters || {};
// // //   return JSON.stringify({ start_date, end_date, factory, process, equipment, partNo, inspType, workType, shiftType, topN });
// // // };

// // // // 문자열 정규화
// // // const norm = (v) => String(v ?? "").trim();

// // // class InspectionSystemChart extends Component {
// // //   state = {
// // //     filters: getDefaultFilters(),

// // //     // 보고일/표 데이터
// // //     dailyCols: [],
// // //     dailyDays: [],
// // //     dailyList: [],
// // //     dailyTables: {},
// // //     dailyShifts: [],
// // //     dailyWorkHeaders: {},
// // //     selectedDay: null,

// // //     // 숫자형 추이
// // //     numTrend: { dates: [], series: [] },

// // //     // 옵션
// // //     factories: [],
// // //     processes: [],
// // //     equipments: [],
// // //     parts: [],
// // //     items: [],
// // //     optionsLoading: false,

// // //     // UI 로딩 플래그(분리)
// // //     loadingDaily: false, // 보고일 목록 + 표 데이터
// // //     loadingTrend: false, // 숫자형 추이
// // //     error: "",
// // //     filterExpanded: false,

// // //     // 프리셋 상태/앵커
// // //     selectedYear: new Date().getFullYear(),
// // //     selectedMonth: new Date().getMonth() + 1,
// // //     yearAnchorPos: null,
// // //     monthAnchorPos: null,
// // //     weekAnchorPos: null,

// // //     years: [],

// // //     // 모달
// // //     itemCodeModalOpen: false,

// // //     // 동적 "검사내용" 폭(px)
// // //     specColWidth: COL_W.specBase,
// // //   };

// // //   // ==== 상태 플래그 ====
// // //   _hadSavedFilters = false; // 저장된 필터가 있었는지
// // //   _didDefaultFromDB = false; // 최신달 디폴트 설정을 했는지

// // //   // ==== 성능 ====
// // //   _runId = 0;
// // //   _pendingTimer = null;
// // //   _controllers = new Set();

// // //   // ==== 캐시 ====
// // //   _dailyCache = new Lru(6);
// // //   _trendCache = new Lru(6);
// // //   _optionsCache = new Lru(6);

// // //   // ==== 측정용 canvas ====
// // //   _measureCtx = null;
// // //   getMeasureCtx = () => {
// // //     if (typeof document === "undefined") return null;
// // //     if (!this._measureCtx) {
// // //       const canvas = document.createElement("canvas");
// // //       this._measureCtx = canvas.getContext("2d");
// // //     }
// // //     return this._measureCtx;
// // //   };
// // //   measureTextPx = (text) => {
// // //     const ctx = this.getMeasureCtx();
// // //     const font = '13px "Noto Sans KR", Roboto, Apple SD Gothic Neo, Arial, sans-serif';
// // //     if (!ctx) return String(text ?? "").length * 12;
// // //     ctx.font = font;
// // //     return ctx.measureText(String(text ?? "")).width;
// // //   };
// // //   computeSpecWidthFromRows = (rows) => {
// // //     let longestPx = this.measureTextPx("검사내용");
// // //     const addPad = 36;
// // //     const minPx = COL_W.specBase;
// // //     const hardMaxPx = 720;
// // //     (rows || []).forEach((r) => {
// // //       const px = this.measureTextPx(r?.["검사내용"]);
// // //       if (px > longestPx) longestPx = px;
// // //     });
// // //     return clamp(Math.ceil(longestPx) + addPad, minPx, hardMaxPx);
// // //   };

// // //   componentDidMount() {
// // //     const base = getDefaultFilters();
// // //     const saved = localStorage.getItem("inspectionFilters");
// // //     if (saved) {
// // //       try {
// // //         const parsed = JSON.parse(saved);
// // //         const merged = { ...base, ...parsed };
// // //         merged.factory = merged.factory || base.factory;
// // //         merged.process = merged.process || base.process;
// // //         merged.equipment = merged.equipment || base.equipment;
// // //         this._hadSavedFilters = true;
// // //         this.setState({ filters: merged });
// // //       } catch {
// // //         this.setState({ filters: base });
// // //       }
// // //     } else {
// // //       this.setState({ filters: base });
// // //     }
// // //     this.bootstrap();
// // //   }

// // //   componentDidUpdate(_, prevState) {
// // //     if (this.state.selectedDay !== prevState.selectedDay) {
// // //       const rows = this.state.dailyTables?.[this.state.selectedDay] || [];
// // //       const w = this.computeSpecWidthFromRows(rows);
// // //       if (w !== this.state.specColWidth) this.setState({ specColWidth: w });
// // //     }
// // //   }

// // //   /** --------- API ---------- */
// // //   _abortAll = () => {
// // //     for (const c of this._controllers) try { c.abort(); } catch {}
// // //     this._controllers.clear();
// // //   };
// // //   post = async (path, body) => {
// // //     const controller = new AbortController();
// // //     this._controllers.add(controller);
// // //     try {
// // //       const headers = { "Content-Type": "application/json" };
// // //       const res = await fetch(
// // //         `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
// // //         { method: "POST", headers, body: JSON.stringify(body || {}), signal: controller.signal }
// // //       );
// // //       if (!res.ok) {
// // //         const t = await res.text().catch(() => "");
// // //         throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// // //       }
// // //       const json = await res.json();
// // //       return json.data || [];
// // //     } finally {
// // //       this._controllers.delete(controller);
// // //     }
// // //   };

// // //   /** 모달 아이템 조회(정확 일치 우선, 품번과 같은 문자열은 무시) */
// // //   fetchItemFromModal = async (partNo) => {
// // //     const pn = norm(partNo);
// // //     if (!pn) return "";
// // //     try {
// // //       const payload = {
// // //         q: pn,
// // //         exact: true,
// // //         plant: this.state.filters.factory,
// // //         worker: this.state.filters.process,
// // //         line: this.state.filters.equipment,
// // //         startDate: this.state.filters.start_date,
// // //         endDate: this.state.filters.end_date,
// // //       };

// // //       const res = await fetch(
// // //         `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_modal/item_list`,
// // //         {
// // //           method: "POST",
// // //           headers: { "Content-Type": "application/json" },
// // //           body: JSON.stringify(payload),
// // //         }
// // //       );

// // //       const json = await res.json().catch(() => null);
// // //       const rows = Array.isArray(json?.data) ? json.data : [];

// // //       const readPn = (o) =>
// // //         o?.partNo ??
// // //         o?.품목번호 ??
// // //         o?.code ??
// // //         o?.value ??
// // //         o?.id ??
// // //         o?.PART_NO ??
// // //         o?.PartNo ??
// // //         o?.품번 ??
// // //         o?.itemCode;
// // //       const readNm = (o) =>
// // //         o?.item ??
// // //         o?.itemName ??
// // //         o?.품목명 ??
// // //         o?.name ??
// // //         o?.label ??
// // //         o?.ITEM_NM ??
// // //         o?.ItemName ??
// // //         o?.품명 ??
// // //         o?.part_nm;

// // //       // 정확 일치 우선
// // //       const exact = rows.find((r) => norm(readPn(r)) === pn);
// // //       const nm = norm(exact ? readNm(exact) : rows.length ? readNm(rows[0]) : "");
// // //       // 품번과 완전히 같은 문자열이면 품명으로 사용하지 않음
// // //       if (nm && nm !== pn) return nm;
// // //       return "";
// // //     } catch {
// // //       return "";
// // //     }
// // //   };

// // //   bootstrap = async () => {
// // //     await this.loadYears();
// // //     await this.loadOptions();
// // //     await this.initDefaultMonthFromDBIfNeeded(); // 저장된 필터 없을 때 최신 달로
// // //     this.loadAll();
// // //   };

// // //   /** 옵션 로드 + 품명 보정 (캐시) */
// // //   loadOptions = async () => {
// // //     const runId = ++this._runId;
// // //     const { filters } = this.state;
// // //     const k = keyOf({ ...filters, partNo: "", topN: undefined });
// // //     const cached = this._optionsCache.get(k);
// // //     if (cached) {
// // //       this.setState((prev) => {
// // //         const filledName = this.getItemNameFromOptions(prev.filters.partNo, cached.parts, cached.items);
// // //         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
// // //         const next = { ...cached, optionsLoading: false };
// // //         if (needFill) next.filters = { ...prev.filters, item: filledName };
// // //         return next;
// // //       });
// // //       return;
// // //     }

// // //     this.setState({ optionsLoading: true });
// // //     try {
// // //       const [factories, processes, equipments, parts, items] = await Promise.all([
// // //         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
// // //         this.post("/options/processes", { ...filters }),
// // //         this.post("/options/equipments", { ...filters }),
// // //         this.post("/options/parts", { ...filters }),
// // //         this.post("/options/items", { ...filters }),
// // //       ]);
// // //       if (runId !== this._runId) return;

// // //       const payload = { factories, processes, equipments, parts, items };
// // //       this._optionsCache.set(k, payload);

// // //       this.setState((prev) => {
// // //         const filledName = this.getItemNameFromOptions(prev.filters.partNo, parts, items);
// // //         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
// // //         const next = { ...payload, optionsLoading: false };
// // //         if (needFill) next.filters = { ...prev.filters, item: filledName };
// // //         return next;
// // //       });
// // //     } catch (e) {
// // //       console.error(e);
// // //       this.setState({ optionsLoading: false });
// // //     }
// // //   };

// // //   /** 연도 옵션 */
// // //   loadYears = async () => {
// // //     try {
// // //       const raw = await this.post("/options/years", { ...this.state.filters });
// // //       let years = Array.isArray(raw) ? raw.map((y) => Number(y)).filter(Boolean) : [];
// // //       if (!years.length) throw new Error("no years");
// // //       years.sort((a, b) => b - a);
// // //       this.setState({ years, selectedYear: years[0] });
// // //     } catch {
// // //       const y = new Date().getFullYear();
// // //       const years = [y, y - 1, y - 2, y - 3, y - 4];
// // //       this.setState({ years, selectedYear: y });
// // //     }
// // //   };

// // //   /** 최초 1회: DB 최신 보고일의 "달"을 기본 기간으로 설정 */
// // //   initDefaultMonthFromDBIfNeeded = async () => {
// // //     if (this._hadSavedFilters || this._didDefaultFromDB) return;
// // //     try {
// // //       const y = this.state.selectedYear || new Date().getFullYear();
// // //       const tempFilters = {
// // //         ...this.state.filters,
// // //         start_date: iso(new Date(y, 0, 1)),
// // //         end_date: iso(new Date(y, 11, 31)),
// // //         partNo: "",
// // //         item: "",
// // //       };
// // //       const daily = await this.post("/xn_daily", tempFilters);
// // //       const dayStrs = [
// // //         ...(Array.isArray(daily?.days) ? daily.days : []),
// // //         ...((daily?.dayList || []).map((r) => r?.d).filter(Boolean)),
// // //       ].filter(Boolean);
// // //       if (!dayStrs.length) {
// // //         this._didDefaultFromDB = true;
// // //         return;
// // //       }
// // //       let latest = dayStrs[0];
// // //       for (const s of dayStrs) if (s > latest) latest = s;

// // //       const [yy, mm] = latest.split("-").map((n) => parseInt(n, 10));
// // //       const ms = new Date(yy, mm - 1, 1);
// // //       const me = lastOfMonth(ms);

// // //       await new Promise((resolve) =>
// // //         this.setState(
// // //           (prev) => ({
// // //             filters: { ...prev.filters, start_date: iso(ms), end_date: iso(me) },
// // //             selectedYear: yy,
// // //             selectedMonth: mm,
// // //           }),
// // //           resolve
// // //         )
// // //       );
// // //       this._didDefaultFromDB = true;
// // //     } catch (e) {
// // //       console.warn("initDefaultMonthFromDBIfNeeded failed:", e);
// // //       this._didDefaultFromDB = true;
// // //     }
// // //   };

// // //   /** 필터 변경 (200ms 디바운스) */
// // //   handleFilterChange = (field, value) => {
// // //     this.setState(
// // //       (prev) => {
// // //         const f = { ...prev.filters, [field]: value };
// // //         if (field === "factory") {
// // //           f.process = "";
// // //           f.equipment = "";
// // //           f.partNo = "";
// // //           f.item = "";
// // //         } else if (field === "process") {
// // //           f.equipment = "";
// // //           f.partNo = "";
// // //           f.item = "";
// // //         } else if (field === "equipment") {
// // //           f.partNo = "";
// // //           f.item = "";
// // //         } else if (field === "topN") {
// // //           f.topN = Number(value) || 5;
// // //         }
// // //         // ✅ 날짜 변경 시에도 품번/품명 유지 (start_date/end_date는 초기화 안 함)
// // //         return { filters: f };
// // //       },
// // //       () => {
// // //         if (this._pendingTimer) clearTimeout(this._pendingTimer);
// // //         this._pendingTimer = setTimeout(async () => {
// // //           await this.loadOptions();
// // //           await this.loadAll();
// // //         }, 200);
// // //       }
// // //     );
// // //   };

// // //   /** 날짜 프리셋/범위 */
// // //   setDateRange = async (start, end) => {
// // //     const start_date = iso(start);
// // //     const end_date = iso(end);
// // //     this.setState(
// // //       (prev) => ({
// // //         // ✅ 날짜만 변경하고 기존 partNo/item 그대로 유지
// // //         filters: { ...prev.filters, start_date, end_date },
// // //       }),
// // //       async () => {
// // //         try {
// // //           localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
// // //         } catch {}
// // //         await this.loadOptions();
// // //         this.loadAll();
// // //       }
// // //     );
// // //   };
// // //   applyToday = () => {
// // //     const t = today0();
// // //     this.setDateRange(t, t);
// // //     };
// // //   selectYear = (y) => {
// // //     const s = new Date(y, 0, 1);
// // //     const e = new Date(y, 11, 31);
// // //     this.setState({ selectedYear: y, yearAnchorPos: null });
// // //     this.setDateRange(s, e);
// // //   };
// // //   selectMonth = (m) => {
// // //     const y = this.state.selectedYear;
// // //     const s = new Date(y, m - 1, 1);
// // //     const e = lastOfMonth(s);
// // //     this.setState({ monthAnchorPos: null, selectedMonth: m });
// // //     this.setDateRange(s, e);
// // //   };
// // //   selectWeek = (w) => {
// // //     this.setState({ weekAnchorPos: null });
// // //     this.setDateRange(w.start, w.end);
// // //   };

// // //   /** 전체 초기화 */
// // //   resetToThisYear = async () => {
// // //     const y = new Date().getFullYear();
// // //     const filters = { ...getDefaultFilters(), start_date: iso(new Date(y, 0, 1)), end_date: iso(new Date(y, 11, 31)) };
// // //     this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth() + 1 }, async () => {
// // //       try {
// // //         localStorage.removeItem("inspectionFilters");
// // //       } catch {}
// // //       this._hadSavedFilters = false;
// // //       this._didDefaultFromDB = false;
// // //       await this.loadOptions();
// // //       await this.initDefaultMonthFromDBIfNeeded();
// // //       this.loadAll();
// // //     });
// // //   };

// // //   /** 데이터 로드 (캐시 + 단계적 로딩: daily 먼저, trend 나중) */
// // //   loadAll = async () => {
// // //     const runId = ++this._runId;
// // //     this._abortAll();

// // //     const { filters } = this.state;
// // //     try {
// // //       localStorage.setItem("inspectionFilters", JSON.stringify(filters));
// // //     } catch {}

// // //     // --- DAILY ---
// // //     this.setState({ loadingDaily: true, error: "" });

// // //     const dailyKey = `daily:${keyOf(filters)}`;
// // //     const cachedDaily = this._dailyCache.get(dailyKey);
// // //     let daily;
// // //     try {
// // //       if (cachedDaily) {
// // //         daily = cachedDaily;
// // //       } else {
// // //         daily = await this.post("/xn_daily", filters);
// // //         this._dailyCache.set(dailyKey, daily);
// // //       }
// // //     } catch (e) {
// // //       console.error(e);
// // //       if (runId === this._runId) this.setState({ error: "데일리 데이터를 불러오지 못했습니다.", loadingDaily: false });
// // //       return;
// // //     }
// // //     if (runId !== this._runId) return;

// // //     const cols = daily?.cols || [];
// // //     const days = daily?.days || [];
// // //     const tables = daily?.tables || {};
// // //     const shifts = daily?.shifts || [];
// // //     const workHeaders = daily?.workHeaders || {};
// // //     const dayList = daily?.dayList || (days || []).map((d) => ({ d, equipment: "", partNo: "" }));

// // //     const firstDay = dayList?.[0]?.d || days?.[0] || null;
// // //     const nextSelected = this.state.selectedDay ?? firstDay;

// // //     const specColWidth = this.computeSpecWidthFromRows(tables?.[nextSelected] || []);

// // //     this.setState({
// // //       dailyCols: cols,
// // //       dailyDays: days,
// // //       dailyList: dayList,
// // //       dailyTables: tables,
// // //       dailyShifts: shifts,
// // //       dailyWorkHeaders: workHeaders,
// // //       selectedDay: nextSelected,
// // //       specColWidth,
// // //       loadingDaily: false,
// // //     });

// // //     // --- NUMERIC TREND ---
// // //     if (!filters.partNo) {
// // //       this.setState({ numTrend: { dates: [], series: [] }, loadingTrend: false });
// // //       return;
// // //     }

// // //     this.setState({ loadingTrend: true });
// // //     const trendKey = `trend:${keyOf(filters)}`;
// // //     try {
// // //       const numeric =
// // //         this._trendCache.get(trendKey) || (await this.post("/numeric_trend", filters));
// // //       this._trendCache.set(trendKey, numeric);
// // //       if (runId !== this._runId) return;
// // //       this.setState({ numTrend: numeric || { dates: [], series: [] }, loadingTrend: false });
// // //     } catch (e) {
// // //       console.error(e);
// // //       if (runId === this._runId) this.setState({ loadingTrend: false });
// // //     }
// // //   };

// // //   /** CSV 내보내기 */
// // //   exportCsv = () => {
// // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // //     if (!selectedDay) return;
// // //     const rawRows = dailyTables[selectedDay] || [];
// // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// // //     const headLeft = ["NO", "검사항목명", "검사내용"];
// // //     const headMid = dailyShifts.flatMap((s) => dailyCols.map((c) => `${s}-${c}`));
// // //     const header = [...headLeft, ...headMid, "평균"];

// // //     const csvRows = [
// // //       header,
// // //       ...rows.map((r, idx) => {
// // //         const vals = dailyShifts.flatMap((s) => dailyCols.map((c) => r?.[s]?.[c] ?? ""));
// // //         return [String(idx + 1), r["검사항목명"] ?? "", r["검사내용"] ?? "", ...vals, r["평균"] ?? ""];
// // //       }),
// // //     ];
// // //     const csv = csvRows.map((r) => r.join(",")).join("\n");
// // //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // //     const url = URL.createObjectURL(blob);
// // //     const a = document.createElement("a");
// // //     a.href = url;
// // //     a.download = `xn_daily_${selectedDay}.csv`;
// // //     a.click();
// // //     URL.revokeObjectURL(url);
// // //   };

// // //   /** 품번/품명 모달 */
// // //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// // //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// // //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// // //     this.setState(
// // //       (prev) => ({
// // //         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
// // //         itemCodeModalOpen: false,
// // //       }),
// // //       () => {
// // //         this.loadOptions();
// // //         this.loadAll();
// // //       }
// // //     );
// // //   };

// // //   /** 품번 선택 해제 */
// // //   handleClearPart = () => {
// // //     this.setState(
// // //       (prev) => ({ filters: { ...prev.filters, partNo: "", item: "" } }),
// // //       () => {
// // //         this.loadOptions();
// // //         this.loadAll();
// // //       }
// // //     );
// // //   };

// // //   /** partNo → item(품명) 추론 (옵션 배열 사용) */
// // //   getItemNameFromOptions = (partNo, parts = this.state.parts, items = this.state.items) => {
// // //     const pn = norm(partNo);
// // //     if (!pn) return "";
// // //     const readPn = (o) =>
// // //       typeof o === "string"
// // //         ? o
// // //         : (o?.partNo ??
// // //           o?.품목번호 ??
// // //           o?.code ??
// // //           o?.value ??
// // //           o?.id ??
// // //           o?.PART_NO ??
// // //           o?.PartNo ??
// // //           o?.품번 ??
// // //           o?.itemCode);
// // //     const readNm = (o) =>
// // //       typeof o === "string"
// // //         ? o
// // //         : (o?.item ??
// // //           o?.itemName ??
// // //           o?.품목명 ??
// // //           o?.name ??
// // //           o?.label ??
// // //           o?.ITEM_NM ??
// // //           o?.ItemName ??
// // //           o?.품명 ??
// // //           o?.part_nm);

// // //     for (const it of parts || []) {
// // //       if (norm(readPn(it)) === pn) {
// // //         const nm = norm(readNm(it));
// // //         if (nm && nm !== pn) return nm;
// // //       }
// // //     }
// // //     for (const it of items || []) {
// // //       if (norm(readPn(it)) === pn) {
// // //         const nm = norm(readNm(it));
// // //         if (nm && nm !== pn) return nm;
// // //       }
// // //     }
// // //     return "";
// // //   };

// // //   /** dayList 행에서 품명 후보 추론 → 옵션으로 보정 */
// // //   resolveItemNameFromRow = (row, partNo) => {
// // //     const pn = norm(partNo);
// // //     const cands = [
// // //       row?.item, row?.itemName, row?.partName, row?.품목명,
// // //       row?.item_label, row?.name, row?.label, row?.품명, row?.part_nm,
// // //     ].map(norm).filter((v) => v && v !== pn && v !== "-");
// // //     if (cands.length) return cands[0];
// // //     return this.getItemNameFromOptions(pn);
// // //   };

// // //   /** 보고일 클릭 → 설비/품번(+품명) 자동 반영 + 모달로 최종 보정 */
// // //   handleDayClick = async (row) => {
// // //     const { d, equipment, partNo } = row || {};
// // //     const { filters } = this.state;

// // //     // 동일 조건이면 날짜만 갱신
// // //     if ((equipment || filters.equipment) === filters.equipment && (partNo || "") === (filters.partNo || "")) {
// // //       this.setState({ selectedDay: d });
// // //       return;
// // //     }

// // //     // 1차: row/옵션에서 품명 후보
// // //     const preItem = this.resolveItemNameFromRow(row, partNo || "");
// // //     this.setState(
// // //       (prev) => ({
// // //         selectedDay: d,
// // //         filters: {
// // //           ...prev.filters,
// // //           equipment: equipment || prev.filters.equipment,
// // //           partNo: partNo || "",
// // //           item: preItem || "",
// // //         },
// // //       }),
// // //       async () => {
// // //         // 2차: 옵션 재적재(보정 가능)
// // //         await this.loadOptions();

// // //         // 3차: 모달 API에서 최종 보정 (비었거나 '-' 또는 품번과 동일하게 들어온 경우)
// // //         const curPn = norm(this.state.filters.partNo);
// // //         const curItem = norm(this.state.filters.item);
// // //         if (curPn && (!curItem || curItem === "-" || curItem === curPn)) {
// // //           const modalName = await this.fetchItemFromModal(curPn);
// // //           if (modalName) {
// // //             this.setState((prev) => ({ filters: { ...prev.filters, item: modalName } }));
// // //           } else {
// // //             // 옵션에서 마지막 시도
// // //             const fixed = this.getItemNameFromOptions(curPn);
// // //             const finalNm = norm(fixed);
// // //             this.setState((prev) => ({
// // //               filters: { ...prev.filters, item: finalNm && finalNm !== curPn ? finalNm : "" },
// // //             }));
// // //           }
// // //         }

// // //         await this.loadAll();
// // //       }
// // //     );
// // //   };

// // //   // ---------- 상단 필터 ----------
// // //   renderFilterBar = () => {
// // //     const { filters } = this.state;

// // //     const now = today0();
// // //     const thisYear = now.getFullYear();
// // //     const thisMonth = now.getMonth() + 1;
// // //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// // //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// // //     return (
// // //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// // //         <CardHeader
// // //           title={
// // //             <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
// // //               <FilterIcon /> 검색 조건
// // //             </Typography>
// // //           }
// // //           action={
// // //             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
// // //               <Button
// // //                 size="small"
// // //                 variant="outlined"
// // //                 color="success"
// // //                 endIcon={<ExpandMoreIcon />}
// // //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // //               >
// // //                 연간
// // //               </Button>
// // //               <Menu
// // //                 open={!!this.state.yearAnchorPos}
// // //                 onClose={() => this.setState({ yearAnchorPos: null })}
// // //                 anchorReference="anchorPosition"
// // //                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// // //               >
// // //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>
// // //                   올해
// // //                 </MenuItem>
// // //                 {this.state.years.map((y) => (
// // //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
// // //                     {y}년
// // //                   </MenuItem>
// // //                 ))}
// // //               </Menu>

// // //               <Button
// // //                 size="small"
// // //                 variant="outlined"
// // //                 color="success"
// // //                 endIcon={<ExpandMoreIcon />}
// // //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // //               >
// // //                 월간
// // //               </Button>
// // //               <Menu
// // //                 open={!!this.state.monthAnchorPos}
// // //                 onClose={() => this.setState({ monthAnchorPos: null })}
// // //                 anchorReference="anchorPosition"
// // //                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// // //               >
// // //                 <MenuItem
// // //                   dense
// // //                   onClick={() => {
// // //                     this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth));
// // //                   }}
// // //                 >
// // //                   이번달
// // //                 </MenuItem>
// // //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// // //                     {this.state.selectedYear}년 {m}월
// // //                   </MenuItem>
// // //                 ))}
// // //               </Menu>

// // //               <Button
// // //                 size="small"
// // //                 variant="outlined"
// // //                 color="success"
// // //                 endIcon={<ExpandMoreIcon />}
// // //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // //               >
// // //                 주간
// // //               </Button>
// // //               <Menu
// // //                 open={!!this.state.weekAnchorPos}
// // //                 onClose={() => this.setState({ weekAnchorPos: null })}
// // //                 anchorReference="anchorPosition"
// // //                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
// // //               >
// // //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// // //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// // //                 </MenuItem>
// // //                 {weeks.map((w, i) => (
// // //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// // //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// // //                   </MenuItem>
// // //                 ))}
// // //               </Menu>

// // //               <Button
// // //                 size="small"
// // //                 variant="outlined"
// // //                 color="success"
// // //                 onClick={this.applyToday}
// // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // //               >
// // //                 오늘
// // //               </Button>

// // //               <Typography sx={{ color: "white", opacity: 0.8, mx: 0.5 }}>|</Typography>
// // //               <Typography sx={{ color: "white" }}>기간선택</Typography>
// // //               <TextField
// // //                 type="date"
// // //                 value={filters.start_date}
// // //                 onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// // //                 size="small"
// // //                 variant="outlined"
// // //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// // //                 InputLabelProps={{ shrink: true }}
// // //               />
// // //               <Typography sx={{ color: "white" }}>~</Typography>
// // //               <TextField
// // //                 type="date"
// // //                 value={filters.end_date}
// // //                 onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// // //                 size="small"
// // //                 variant="outlined"
// // //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// // //                 InputLabelProps={{ shrink: true }}
// // //               />

// // //               <IconButton
// // //                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
// // //                 sx={{ color: "white" }}
// // //               >
// // //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// // //               </IconButton>
// // //             </Box>
// // //           }
// // //           sx={{ backgroundColor: "#ff8f00", color: "white", borderRadius: 1, mb: 2 }}
// // //         />

// // //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// // //         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 2, mb: 1 }}>
// // //           <Autocomplete
// // //             size="small"
// // //             options={this.state.factories}
// // //             value={filters.factory || null}
// // //             onChange={(_, v) => this.handleFilterChange("factory", v || "")}
// // //             renderInput={(params) => <TextField {...params} label="공장" />}
// // //             clearOnEscape
// // //           />
// // //           <Autocomplete
// // //             size="small"
// // //             options={this.state.processes}
// // //             value={filters.process || null}
// // //             onChange={(_, v) => this.handleFilterChange("process", v || "")}
// // //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
// // //             clearOnEscape
// // //           />
// // //           <Autocomplete
// // //             size="small"
// // //             options={this.state.equipments}
// // //             value={filters.equipment || null}
// // //             onChange={(_, v) => this.handleFilterChange("equipment", v || "")}
// // //             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
// // //             clearOnEscape
// // //           />
// // //           <TextField
// // //             fullWidth
// // //             label="품번"
// // //             value={filters.partNo}
// // //             onClick={this.openItemCodeModal}
// // //             size="small"
// // //             variant="outlined"
// // //             InputProps={{
// // //               readOnly: true,
// // //               style: { cursor: "pointer" },
// // //               endAdornment: (
// // //                 <InputAdornment position="end">
// // //                   {Boolean(filters.partNo) && (
// // //                     <IconButton
// // //                       size="small"
// // //                       aria-label="품번 선택해제"
// // //                       onClick={(e) => {
// // //                         e.stopPropagation();
// // //                         this.handleClearPart();
// // //                       }}
// // //                       sx={{ mr: 0.5 }}
// // //                     >
// // //                       <ClearIcon fontSize="small" />
// // //                     </IconButton>
// // //                   )}
// // //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// // //                 </InputAdornment>
// // //               ),
// // //             }}
// // //             sx={{
// // //               "& .MuiInputBase-root": {
// // //                 cursor: "pointer",
// // //                 "&:hover": { backgroundColor: "#f5f5f5" },
// // //               },
// // //             }}
// // //           />
// // //           <TextField
// // //             fullWidth
// // //             label="품명(검사항목)"
// // //             value={filters.item}
// // //             onClick={this.openItemCodeModal}
// // //             size="small"
// // //             variant="outlined"
// // //             InputProps={{
// // //               readOnly: true,
// // //               style: { cursor: "pointer" },
// // //               endAdornment: (
// // //                 <InputAdornment position="end">
// // //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// // //                 </InputAdornment>
// // //               ),
// // //             }}
// // //             sx={{
// // //               "& .MuiInputBase-root": {
// // //                 cursor: "pointer",
// // //                 "&:hover": { backgroundColor: "#f5f5f5" },
// // //               },
// // //             }}
// // //           />
// // //         </Box>

// // //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// // //           <Divider sx={{ my: 2 }} />
// // //           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16 }}>
// // //             <TextField
// // //               fullWidth
// // //               label="검사구분"
// // //               value={filters.inspType}
// // //               onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
// // //               size="small"
// // //               variant="outlined"
// // //             />
// // //             <TextField
// // //               fullWidth
// // //               label="작업구분"
// // //               value={filters.workType}
// // //               onChange={(e) => this.handleFilterChange("workType", e.target.value)}
// // //               size="small"
// // //               variant="outlined"
// // //             />
// // //             <TextField
// // //               fullWidth
// // //               label="주야구분"
// // //               value={filters.shiftType}
// // //               onChange={(e) => this.handleFilterChange("shiftType", e.target.value)}
// // //               size="small"
// // //               variant="outlined"
// // //             />
// // //             <TextField
// // //               fullWidth
// // //               label="Top N"
// // //               type="number"
// // //               value={filters.topN ?? 5}
// // //               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
// // //               size="small"
// // //               variant="outlined"
// // //             />
// // //           </Box>
// // //         </Collapse>

// // //         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
// // //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
// // //             필터 초기화
// // //           </Button>
// // //           <Button
// // //             variant="contained"
// // //             startIcon={<SearchIcon />}
// // //             size="large"
// // //             sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // //             onClick={() => {
// // //               if (this._pendingTimer) clearTimeout(this._pendingTimer);
// // //               this.loadOptions();
// // //               this.loadAll();
// // //             }}
// // //           >
// // //             검색
// // //           </Button>
// // //           <Button
// // //             variant="outlined"
// // //             startIcon={<DownloadIcon />}
// // //             size="large"
// // //             onClick={this.exportCsv}
// // //             disabled={!this.state.filters.partNo}
// // //           >
// // //             CSV 내보내기
// // //           </Button>
// // //         </Box>

// // //         <InspectionItemModal
// // //           open={this.state.itemCodeModalOpen}
// // //           onClose={this.closeItemCodeModal}
// // //           onSelect={this.handleItemCodeSelect}
// // //           selectedItemCode={filters.partNo}
// // //           plant={filters.factory}
// // //           worker={filters.process}
// // //           line={filters.equipment}
// // //           startDate={filters.start_date}
// // //           endDate={filters.end_date}
// // //         />
// // //       </Paper>
// // //     );
// // //   };

// // //   /** 선택 일자의 Xn 표 */
// // //   renderDailyTable = () => {
// // //     const {
// // //       dailyCols,
// // //       dailyTables,
// // //       dailyShifts,
// // //       dailyWorkHeaders,
// // //       selectedDay,
// // //       loadingDaily,
// // //       filters,
// // //       specColWidth,
// // //     } = this.state;

// // //     if (!filters.partNo) {
// // //       return (
// // //         <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // //           <Box className={s.sectionHeader}>
// // //             <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //               작업순번(Xn) 결과표 — 주/야/작업구분
// // //             </Typography>
// // //           </Box>
// // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // //         </Paper>
// // //       );
// // //     }

// // //     const rawRows = selectedDay ? dailyTables[selectedDay] || [] : [];
// // //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// // //     const partText = filters.partNo ? filters.partNo : "전체 품번";
// // //     const itemText = filters.item || "";
// // //     const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

// // //     const tableMinW = calcTableMinWidth(dailyCols.length, dailyShifts.length, specColWidth);

// // //     return (
// // //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             작업순번(Xn) 결과표 — 주/야/작업구분
// // //           </Typography>
// // //           <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
// // //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
// // //             <Chip size="small" label={partText} />
// // //             {itemText && <Chip size="small" variant="outlined" label={itemText} />}
// // //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
// // //             <Chip size="small" label={rangeText} />
// // //             {selectedDay && (
// // //               <>
// // //                 <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>보고일</Typography>
// // //                 <Chip size="small" color="primary" variant="outlined" label={selectedDay} />
// // //               </>
// // //             )}
// // //           </Box>
// // //         </Box>

// // //         {loadingDaily ? (
// // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // //           </Box>
// // //         ) : (
// // //           <Box
// // //             sx={{
// // //               maxHeight: 800,
// // //               overflow: "auto",
// // //               borderRadius: 1,
// // //               "& table": {
// // //                 width: "100%",
// // //                 borderCollapse: "separate",
// // //                 borderSpacing: 0,
// // //                 tableLayout: "fixed",
// // //                 minWidth: tableMinW,
// // //               },
// // //               "& th, & td": {
// // //                 padding: "8px 10px",
// // //                 borderBottom: "1px solid #eceff1",
// // //                 fontSize: 13,
// // //                 whiteSpace: "nowrap",
// // //                 overflow: "hidden",
// // //                 textOverflow: "ellipsis",
// // //                 height: 40,
// // //                 lineHeight: "24px",
// // //                 verticalAlign: "middle",
// // //               },
// // //               "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
// // //               "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
// // //             }}
// // //           >
// // //             <table>
// // //               <thead>
// // //                 <tr>
// // //                   <th style={{ width: COL_W.no, textAlign: "center" }} rowSpan={3}>
// // //                     NO
// // //                   </th>
// // //                   <th style={{ width: COL_W.name }} rowSpan={3}>
// // //                     검사항목명
// // //                   </th>
// // //                   <th style={{ width: this.state.specColWidth }} rowSpan={3}>
// // //                     검사내용
// // //                   </th>
// // //                   {dailyShifts.map((s) => (
// // //                     <th key={s} colSpan={dailyCols.length} style={{ textAlign: "center" }}>
// // //                       {s || "전체"}
// // //                     </th>
// // //                   ))}
// // //                   <th rowSpan={3} style={{ width: COL_W.avg, textAlign: "right" }}>
// // //                     평균
// // //                   </th>
// // //                 </tr>
// // //                 <tr>
// // //                   {dailyShifts.map((s) =>
// // //                     dailyCols.map((c) => (
// // //                       <th key={`${s}-${c}`} style={{ width: COL_W.data, textAlign: "center" }}>
// // //                         {c}
// // //                       </th>
// // //                     ))
// // //                   )}
// // //                 </tr>
// // //                 <tr>
// // //                   {dailyShifts.map((s) =>
// // //                     dailyCols.map((c) => (
// // //                       <th
// // //                         key={`${s}-${c}-work`}
// // //                         style={{ width: COL_W.data, textAlign: "center", fontWeight: 600, color: "#607d8b" }}
// // //                         title={dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // //                       >
// // //                         {dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// // //                       </th>
// // //                     ))
// // //                   )}
// // //                 </tr>
// // //               </thead>
// // //               <tbody>
// // //                 {rows.map((r, idx) => (
// // //                   <tr key={idx}>
// // //                     <td style={{ width: COL_W.no, textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
// // //                     <td style={{ width: COL_W.name }} title={r["검사항목명"] ?? ""}>
// // //                       {r["검사항목명"] ?? ""}
// // //                     </td>
// // //                     <td style={{ width: this.state.specColWidth }} title={r["검사내용"] ?? ""}>
// // //                       {r["검사내용"] ?? ""}
// // //                     </td>
// // //                     {dailyShifts.map((s) =>
// // //                       dailyCols.map((c) => (
// // //                         <td key={`${idx}-${s}-${c}`} style={{ width: COL_W.data, textAlign: "right" }}>
// // //                           {fmtNum(r?.[s]?.[c], 3)}
// // //                         </td>
// // //                       ))
// // //                     )}
// // //                     <td style={{ width: COL_W.avg, textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
// // //                   </tr>
// // //                 ))}
// // //                 {(!rows || rows.length === 0) && (
// // //                   <tr>
// // //                     <td colSpan={3 + dailyShifts.length * dailyCols.length + 1} style={{ textAlign: "center", padding: "32px 0" }}>
// // //                       데이터가 없습니다.
// // //                     </td>
// // //                   </tr>
// // //                 )}
// // //               </tbody>
// // //             </table>
// // //           </Box>
// // //         )}
// // //       </Paper>
// // //     );
// // //   };

// // //   /** 선택 일자 기준 멀티라인 차트 데이터 */
// // //   buildChartDataForSelectedDay = () => {
// // //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// // //     if (!selectedDay) return { seriesKeys: [], rows: [] };
// // //     const rowsSrc = dailyTables[selectedDay] || [];

// // //     const labelOf = (r) => {
// // //       const name = r["검사항목명"] ?? "";
// // //       const spec = r["검사내용"] ?? "";
// // //       return spec ? `${name} | ${spec}` : name;
// // //     };

// // //     const rows = dailyCols.map((x) => {
// // //       const row = { x };
// // //       rowsSrc.forEach((r) => {
// // //         const key = labelOf(r);
// // //         let sum = 0,
// // //           cnt = 0;
// // //         dailyShifts.forEach((s) => {
// // //           const v = r?.[s]?.[x];
// // //           if (v != null && v !== "") {
// // //             sum += Number(v);
// // //             cnt += 1;
// // //           }
// // //         });
// // //         row[key] = cnt > 0 ? sum / cnt : null;
// // //       });
// // //       return row;
// // //     });

// // //     const seriesKeys = rowsSrc.map((r) => labelOf(r));
// // //     return { seriesKeys, rows };
// // //   };

// // //   /** Xn 멀티라인 차트 (선택 일자) */
// // //   renderSelectedDayChart = () => {
// // //     const { loadingTrend, loadingDaily, selectedDay, filters } = this.state;

// // //     if (!filters.partNo) {
// // //       return (
// // //         <Paper className={s.section} style={{ marginTop: 16 }}>
// // //           <Box className={s.sectionHeader}>
// // //             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // //               검사항목별 Xn 흐름
// // //             </Typography>
// // //           </Box>
// // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // //         </Paper>
// // //       );
// // //     }

// // //     const { seriesKeys, rows } = this.buildChartDataForSelectedDay();

// // //     return (
// // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // //             {selectedDay ? `${selectedDay} — 검사항목별 Xn 흐름` : "검사항목별 Xn 흐름"}
// // //           </Typography>
// // //         </Box>

// // //         {loadingDaily ? (
// // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // //           </Box>
// // //         ) : rows.length === 0 ? (
// // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // //         ) : loadingTrend ? (
// // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // //             <CircularProgress size={44} sx={{ color: "#90caf9" }} />
// // //           </Box>
// // //         ) : (
// // //           <Box style={{ width: "100%", height: 380 }}>
// // //             <ResponsiveContainer>
// // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // //                 <CartesianGrid strokeDasharray="3 3" />
// // //                 <XAxis dataKey="x" />
// // //                 <YAxis />
// // //                 <RTooltip />
// // //                 <Legend />
// // //                 {seriesKeys.map((k) => (
// // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // //                 ))}
// // //               </LineChart>
// // //             </ResponsiveContainer>
// // //           </Box>
// // //         )}
// // //       </Paper>
// // //     );
// // //   };

// // //   /** 숫자형(실측값) 검사항목 — 일자별 추이 차트 */
// // //   buildNumericTrendChart = () => {
// // //     const { numTrend } = this.state;
// // //     const dates = numTrend?.dates || [];
// // //     const series = numTrend?.series || [];
// // //     if (dates.length === 0 || series.length === 0) return { keys: [], rows: [] };
// // //     const rows = dates.map((d, i) => {
// // //       const o = { date: d };
// // //       series.forEach((s) => {
// // //         o[s.label] = s.data?.[i] != null ? Number(s.data[i]) : null;
// // //       });
// // //       return o;
// // //     });
// // //     const keys = series.map((s) => s.label);
// // //     return { keys, rows };
// // //   };

// // //   renderNumericTrendChart = () => {
// // //     const { loadingTrend, filters } = this.state;

// // //     if (!filters.partNo) {
// // //       return (
// // //         <Paper className={s.section} style={{ marginTop: 16 }}>
// // //           <Box className={s.sectionHeader}>
// // //             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // //               숫자형 검사항목 — 일자별 실측값 추이
// // //             </Typography>
// // //           </Box>
// // //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// // //         </Paper>
// // //       );
// // //     }

// // //     const { keys, rows } = this.buildNumericTrendChart();
// // //     return (
// // //       <Paper className={s.section} style={{ marginTop: 16 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// // //             숫자형 검사항목 — 일자별 실측값 추이 (Top {filters.topN ?? 5})
// // //           </Typography>
// // //         </Box>
// // //         {loadingTrend ? (
// // //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// // //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// // //           </Box>
// // //         ) : rows.length === 0 ? (
// // //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// // //         ) : (
// // //           <Box style={{ width: "100%", height: 380 }}>
// // //             <ResponsiveContainer>
// // //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// // //                 <CartesianGrid strokeDasharray="3 3" />
// // //                 <XAxis dataKey="date" />
// // //                 <YAxis />
// // //                 <RTooltip />
// // //                 <Legend />
// // //                 {keys.map((k) => (
// // //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// // //                 ))}
// // //               </LineChart>
// // //             </ResponsiveContainer>
// // //           </Box>
// // //         )}
// // //       </Paper>
// // //     );
// // //   };

// // //   render() {
// // //     const { error, dailyList, selectedDay, loadingDaily } = this.state;

// // //     return (
// // //       <Box className={s.root}>
// // //         {/* 필터 바 */}
// // //         {this.renderFilterBar()}

// // //         {/* 에러 */}
// // //         {error && (
// // //           <Box sx={{ mb: 2 }}>
// // //             <Alert severity="error" sx={{ mb: 2 }}>
// // //               {error}
// // //             </Alert>
// // //             <Button
// // //               variant="contained"
// // //               onClick={this.loadAll}
// // //               sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// // //             >
// // //               다시 시도
// // //             </Button>
// // //           </Box>
// // //         )}

// // //         {/* 본문: 좌측 날짜 목록 + 우측 표/차트 */}
// // //         <Box className={s.dailyLayout}>
// // //           <Paper className={s.dayPanel}>
// // //             <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a", mb: 1 }}>보고일</Typography>

// // //             <Box className={s.dayList}>
// // //               <div className={s.dayListHead}>
// // //                 <span>보고일</span>
// // //                 <span>설비</span>
// // //                 <span>품번</span>
// // //               </div>
// // //               <div className={s.dayListBody}>
// // //                 {loadingDaily ? (
// // //                   <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6, color: "#90a4ae" }}>
// // //                     <CircularProgress size={28} sx={{ mr: 1, color: "#ff8f00" }} />
// // //                     로딩 중...
// // //                   </Box>
// // //                 ) : dailyList.length > 0 ? (
// // //                   dailyList.map((row) => (
// // //                     <div
// // //                       key={row.d}
// // //                       className={`${s.dayRow} ${selectedDay === row.d ? s.active : ""}`}
// // //                       onClick={() => this.handleDayClick(row)}
// // //                       title="클릭 시 상단 설비/품번/품명이 자동 반영됩니다"
// // //                     >
// // //                       <span>{row.d}</span>
// // //                       <span>{row.equipment || "-"}</span>
// // //                       <span>{row.partNo || "-"}</span>
// // //                     </div>
// // //                   ))
// // //                 ) : (
// // //                   <div className={s.dayEmpty}>기간/필터 조건에 해당하는 결과가 없습니다.</div>
// // //                 )}
// // //               </div>
// // //             </Box>
// // //           </Paper>

// // //           <Box className={s.rightArea}>
// // //             {this.renderDailyTable()}
// // //             {this.renderSelectedDayChart()}
// // //             {this.renderNumericTrendChart()}
// // //           </Box>
// // //         </Box>
// // //       </Box>
// // //     );
// // //   }
// // // }

// // // export default InspectionSystemChart;


// // // src/pages/inspection/InspectionSystemChart.js
// // import React, { Component } from "react";
// // import config from "../../config";

// // import {
// //   Box,
// //   Paper,
// //   Typography,
// //   CardHeader,
// //   IconButton,
// //   Divider,
// //   Collapse,
// //   CircularProgress,
// //   Alert,
// //   Menu,
// //   MenuItem,
// //   TextField,
// //   Button,
// //   InputAdornment,
// //   Chip,
// // } from "@mui/material";
// // import { Autocomplete } from "@mui/material";

// // import {
// //   Search as SearchIcon,
// //   Clear as ClearIcon,
// //   FilterList as FilterIcon,
// //   ExpandMore as ExpandMoreIcon,
// //   ExpandLess as ExpandLessIcon,
// //   KeyboardArrowDown as KeyboardArrowDownIcon,
// //   FileDownload as DownloadIcon,
// // } from "@mui/icons-material";

// // import {
// //   ResponsiveContainer,
// //   LineChart,
// //   Line,
// //   XAxis,
// //   YAxis,
// //   CartesianGrid,
// //   Tooltip as RTooltip,
// //   Legend,
// // } from "recharts";

// // import InspectionItemModal from "../common/InspectionItemModal";
// // import s from "./InspectionSystemChart.module.scss";

// // /** ---------- helpers ---------- */
// // const mainColor = "#1e88e5";

// // const fmtNum = (v, d = null) => {
// //   if (v === null || v === undefined || v === "") return "";
// //   const n = Number(v);
// //   if (Number.isNaN(n)) return String(v);
// //   return d === null
// //     ? n.toLocaleString()
// //     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// // };

// // const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
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
// //     const s = new Date(cur),
// //       e = endOfWeek(cur);
// //     const clipS = new Date(Math.max(s, first));
// //     const clipE = new Date(Math.min(e, last));
// //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// //     idx += 1;
// //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// //   }
// //   return out;
// // };

// // /** 기본 필터 */
// // const getDefaultFilters = () => {
// //   const y = new Date().getFullYear();
// //   return {
// //     start_date: iso(new Date(y, 0, 1)),
// //     end_date: iso(new Date(y, 11, 31)),
// //     factory: "아진산업-본사(경산)",
// //     process: "프레스",
// //     equipment: "1500T(E라인)",
// //     partNo: "",
// //     item: "",
// //     inspType: "",
// //     workType: "",
// //     shiftType: "",
// //     topN: 5,
// //   };
// // };

// // /** ---- 표 틀 고정용 기본 폭 정의 ---- */
// // const COL_W = { no: 64, name: 180, specBase: 320, data: 96, avg: 100 };
// // const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
// // const calcTableMinWidth = (colsLen, shiftsLen, specW) =>
// //   COL_W.no + COL_W.name + specW + (colsLen || 0) * (shiftsLen || 0) * COL_W.data + COL_W.avg;

// // /** ----- 정렬 유틸 ----- */
// // const firstSeqIndex = (row, cols, shifts) => {
// //   for (let i = 0; i < cols.length; i += 1) {
// //     const c = cols[i];
// //     for (const s of shifts) {
// //       const v = row?.[s]?.[c];
// //       if (v !== null && v !== undefined && v !== "") return i + 1;
// //     }
// //   }
// //   return Number.MAX_SAFE_INTEGER;
// // };
// // const getInspectionSeq = (row, cols, shifts) => {
// //   const raw = row?.["검사순번"];
// //   const n = Number(raw);
// //   if (raw !== undefined && raw !== null && !Number.isNaN(n)) return n;
// //   return firstSeqIndex(row, cols, shifts);
// // };
// // const sortRowsByInspectionSeqAsc = (rows, cols, shifts) =>
// //   [...rows].sort((a, b) => {
// //     const ia = getInspectionSeq(a, cols, shifts);
// //     const ib = getInspectionSeq(b, cols, shifts);
// //     if (ia !== ib) return ia - ib;
// //     const an = (a["검사항목명"] || "").localeCompare(b["검사항목명"] || "");
// //     if (an !== 0) return an;
// //     return (a["검사내용"] || "").localeCompare(b["검사내용"] || "");
// //   });

// // /** ---- 간단 LRU 캐시 ---- */
// // class Lru {
// //   constructor(limit = 8) {
// //     this.limit = limit;
// //     this.map = new Map();
// //   }
// //   get(k) {
// //     if (!this.map.has(k)) return undefined;
// //     const v = this.map.get(k);
// //     this.map.delete(k);
// //     this.map.set(k, v);
// //     return v;
// //   }
// //   set(k, v) {
// //     if (this.map.has(k)) this.map.delete(k);
// //     this.map.set(k, v);
// //     if (this.map.size > this.limit) {
// //       const first = this.map.keys().next().value;
// //       this.map.delete(first);
// //     }
// //   }
// // }
// // const keyOf = (filters) => {
// //   const {
// //     start_date,
// //     end_date,
// //     factory,
// //     process,
// //     equipment,
// //     partNo,
// //     inspType,
// //     workType,
// //     shiftType,
// //     topN,
// //   } = filters || {};
// //   return JSON.stringify({ start_date, end_date, factory, process, equipment, partNo, inspType, workType, shiftType, topN });
// // };

// // // 문자열 정규화
// // const norm = (v) => String(v ?? "").trim();

// // class InspectionSystemChart extends Component {
// //   state = {
// //     filters: getDefaultFilters(),

// //     // 보고일/표 데이터
// //     dailyCols: [],
// //     dailyDays: [],
// //     dailyList: [],
// //     dailyTables: {},
// //     dailyShifts: [],
// //     dailyWorkHeaders: {},
// //     selectedDay: null,

// //     // 숫자형 추이
// //     numTrend: { dates: [], series: [] },

// //     // 옵션
// //     factories: [],
// //     processes: [],
// //     equipments: [],
// //     parts: [],
// //     items: [],
// //     optionsLoading: false,

// //     // UI 로딩 플래그(분리)
// //     loadingDaily: false, // 보고일 목록 + 표 데이터
// //     loadingTrend: false, // 숫자형 추이
// //     error: "",
// //     filterExpanded: false,

// //     // 프리셋 상태/앵커
// //     selectedYear: new Date().getFullYear(),
// //     selectedMonth: new Date().getMonth() + 1,
// //     yearAnchorPos: null,
// //     monthAnchorPos: null,
// //     weekAnchorPos: null,

// //     years: [],

// //     // 모달
// //     itemCodeModalOpen: false,

// //     // 동적 "검사내용" 폭(px)
// //     specColWidth: COL_W.specBase,
// //   };

// //   // ==== 상태 플래그 ====
// //   _hadSavedFilters = false; // 저장된 필터가 있었는지

// //   // ==== 성능 ====
// //   _runId = 0;
// //   _pendingTimer = null;
// //   _controllers = new Set();

// //   // ==== 캐시 ====
// //   _dailyCache = new Lru(6);
// //   _trendCache = new Lru(6);
// //   _optionsCache = new Lru(6);

// //   // ==== 측정용 canvas ====
// //   _measureCtx = null;
// //   getMeasureCtx = () => {
// //     if (typeof document === "undefined") return null;
// //     if (!this._measureCtx) {
// //       const canvas = document.createElement("canvas");
// //       this._measureCtx = canvas.getContext("2d");
// //     }
// //     return this._measureCtx;
// //   };
// //   measureTextPx = (text) => {
// //     const ctx = this.getMeasureCtx();
// //     const font = '13px "Noto Sans KR", Roboto, Apple SD Gothic Neo, Arial, sans-serif';
// //     if (!ctx) return String(text ?? "").length * 12;
// //     ctx.font = font;
// //     return ctx.measureText(String(text ?? "")).width;
// //   };
// //   computeSpecWidthFromRows = (rows) => {
// //     let longestPx = this.measureTextPx("검사내용");
// //     const addPad = 36;
// //     const minPx = COL_W.specBase;
// //     const hardMaxPx = 720;
// //     (rows || []).forEach((r) => {
// //       const px = this.measureTextPx(r?.["검사내용"]);
// //       if (px > longestPx) longestPx = px;
// //     });
// //     return clamp(Math.ceil(longestPx) + addPad, minPx, hardMaxPx);
// //   };

// //   componentDidMount() {
// //     const base = getDefaultFilters();
// //     const saved = localStorage.getItem("inspectionFilters");
// //     if (saved) {
// //       try {
// //         const parsed = JSON.parse(saved);
// //         const merged = { ...base, ...parsed };
// //         merged.factory = merged.factory || base.factory;
// //         merged.process = merged.process || base.process;
// //         merged.equipment = merged.equipment || base.equipment;
// //         this._hadSavedFilters = true;
// //         this.setState({ filters: merged });
// //       } catch {
// //         this.setState({ filters: base });
// //       }
// //     } else {
// //       this.setState({ filters: base });
// //     }
// //     this.bootstrap();
// //   }

// //   componentDidUpdate(_, prevState) {
// //     if (this.state.selectedDay !== prevState.selectedDay) {
// //       const rows = this.state.dailyTables?.[this.state.selectedDay] || [];
// //       const w = this.computeSpecWidthFromRows(rows);
// //       if (w !== this.state.specColWidth) this.setState({ specColWidth: w });
// //     }
// //   }

// //   /** --------- API ---------- */
// //   _abortAll = () => {
// //     for (const c of this._controllers) try { c.abort(); } catch {}
// //     this._controllers.clear();
// //   };
// //   post = async (path, body) => {
// //     const controller = new AbortController();
// //     this._controllers.add(controller);
// //     try {
// //       const headers = { "Content-Type": "application/json" };
// //       const res = await fetch(
// //         `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
// //         { method: "POST", headers, body: JSON.stringify(body || {}), signal: controller.signal }
// //       );
// //       if (!res.ok) {
// //         const t = await res.text().catch(() => "");
// //         throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// //       }
// //       const json = await res.json();
// //       return json.data || [];
// //     } finally {
// //       this._controllers.delete(controller);
// //     }
// //   };

// //   /** 모달 아이템 조회(정확 일치 우선, 품번과 같은 문자열은 무시) */
// //   fetchItemFromModal = async (partNo) => {
// //     const pn = norm(partNo);
// //     if (!pn) return "";
// //     try {
// //       const payload = {
// //         q: pn,
// //         exact: true,
// //         plant: this.state.filters.factory,
// //         worker: this.state.filters.process,
// //         line: this.state.filters.equipment,
// //         startDate: this.state.filters.start_date,
// //         endDate: this.state.filters.end_date,
// //       };

// //       const res = await fetch(
// //         `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_modal/item_list`,
// //         {
// //           method: "POST",
// //           headers: { "Content-Type": "application/json" },
// //           body: JSON.stringify(payload),
// //         }
// //       );

// //       const json = await res.json().catch(() => null);
// //       const rows = Array.isArray(json?.data) ? json.data : [];

// //       const readPn = (o) =>
// //         o?.partNo ??
// //         o?.품목번호 ??
// //         o?.code ??
// //         o?.value ??
// //         o?.id ??
// //         o?.PART_NO ??
// //         o?.PartNo ??
// //         o?.품번 ??
// //         o?.itemCode;
// //       const readNm = (o) =>
// //         o?.item ??
// //         o?.itemName ??
// //         o?.품목명 ??
// //         o?.name ??
// //         o?.label ??
// //         o?.ITEM_NM ??
// //         o?.ItemName ??
// //         o?.품명 ??
// //         o?.part_nm;

// //       // 정확 일치 우선
// //       const exact = rows.find((r) => norm(readPn(r)) === pn);
// //       const nm = norm(exact ? readNm(exact) : rows.length ? readNm(rows[0]) : "");
// //       // 품번과 완전히 같은 문자열이면 품명으로 사용하지 않음
// //       if (nm && nm !== pn) return nm;
// //       return "";
// //     } catch {
// //       return "";
// //     }
// //   };

// //   /** DB 최신 보고일의 "달"을 기본 기간으로 세팅 (force=true면 저장된 필터 유무와 상관없이 적용) */
// //   setDefaultToLatestMonthFromDB = async (force = false) => {
// //     try {
// //       if (!force && this._hadSavedFilters) return; // 저장된 필터 있으면 건드리지 않음

// //       // 연도 목록 확보(최신 연도 우선)
// //       let { years } = this.state;
// //       if (!years || years.length === 0) {
// //         await this.loadYears();
// //         years = this.state.years;
// //       }
// //       const latestYear = years && years.length ? years[0] : new Date().getFullYear();

// //       // 최신 연도 범위로 조회하여 가장 최신 보고일 찾기
// //       const tempFilters = {
// //         ...this.state.filters,
// //         start_date: iso(new Date(latestYear, 0, 1)),
// //         end_date: iso(new Date(latestYear, 11, 31)),
// //         partNo: "",
// //         item: "",
// //       };
// //       const daily = await this.post("/xn_daily", tempFilters);
// //       const dayStrs = [
// //         ...(Array.isArray(daily?.days) ? daily.days : []),
// //         ...((daily?.dayList || []).map((r) => r?.d).filter(Boolean)),
// //       ].filter(Boolean);
// //       if (!dayStrs.length) {
// //         // 데이터가 없으면 연간 기본값 유지
// //         this.setState({
// //           selectedYear: latestYear,
// //           selectedMonth: new Date().getMonth() + 1,
// //           filters: tempFilters,
// //         });
// //         return;
// //       }

// //       // 가장 최신 일자의 월을 기본 기간으로 세팅
// //       let latest = dayStrs[0];
// //       for (const s of dayStrs) if (s > latest) latest = s;

// //       const [yy, mm] = latest.split("-").map((n) => parseInt(n, 10));
// //       const ms = new Date(yy, mm - 1, 1);
// //       const me = lastOfMonth(ms);

// //       this.setState(
// //         (prev) => ({
// //           selectedYear: yy,
// //           selectedMonth: mm,
// //           filters: {
// //             ...prev.filters,
// //             start_date: iso(ms),
// //             end_date: iso(me),
// //           },
// //         }),
// //         () => {
// //           try {
// //             localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
// //           } catch {}
// //         }
// //       );
// //     } catch (e) {
// //       console.warn("setDefaultToLatestMonthFromDB failed:", e);
// //     }
// //   };

// //   bootstrap = async () => {
// //     await this.loadYears();
// //     await this.loadOptions();
// //     // ✅ 기본값 자체를 DB 최신 달로(저장된 필터 없을 때만)
// //     await this.setDefaultToLatestMonthFromDB(false);
// //     this.loadAll();
// //   };

// //   /** 옵션 로드 + 품명 보정 (캐시) */
// //   loadOptions = async () => {
// //     const runId = ++this._runId;
// //     const { filters } = this.state;
// //     const k = keyOf({ ...filters, partNo: "", topN: undefined });
// //     const cached = this._optionsCache.get(k);
// //     if (cached) {
// //       this.setState((prev) => {
// //         const filledName = this.getItemNameFromOptions(prev.filters.partNo, cached.parts, cached.items);
// //         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
// //         const next = { ...cached, optionsLoading: false };
// //         if (needFill) next.filters = { ...prev.filters, item: filledName };
// //         return next;
// //       });
// //       return;
// //     }

// //     this.setState({ optionsLoading: true });
// //     try {
// //       const [factories, processes, equipments, parts, items] = await Promise.all([
// //         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
// //         this.post("/options/processes", { ...filters }),
// //         this.post("/options/equipments", { ...filters }),
// //         this.post("/options/parts", { ...filters }),
// //         this.post("/options/items", { ...filters }),
// //       ]);
// //       if (runId !== this._runId) return;

// //       const payload = { factories, processes, equipments, parts, items };
// //       this._optionsCache.set(k, payload);

// //       this.setState((prev) => {
// //         const filledName = this.getItemNameFromOptions(prev.filters.partNo, parts, items);
// //         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
// //         const next = { ...payload, optionsLoading: false };
// //         if (needFill) next.filters = { ...prev.filters, item: filledName };
// //         return next;
// //       });
// //     } catch (e) {
// //       console.error(e);
// //       this.setState({ optionsLoading: false });
// //     }
// //   };

// //   /** 연도 옵션 */
// //   loadYears = async () => {
// //     try {
// //       const raw = await this.post("/options/years", { ...this.state.filters });
// //       let years = Array.isArray(raw) ? raw.map((y) => Number(y)).filter(Boolean) : [];
// //       if (!years.length) throw new Error("no years");
// //       years.sort((a, b) => b - a);
// //       this.setState({ years, selectedYear: years[0] });
// //     } catch {
// //       const y = new Date().getFullYear();
// //       const years = [y, y - 1, y - 2, y - 3, y - 4];
// //       this.setState({ years, selectedYear: y });
// //     }
// //   };

// //   /** 필터 변경 (200ms 디바운스) */
// //   handleFilterChange = (field, value) => {
// //     this.setState(
// //       (prev) => {
// //         const f = { ...prev.filters, [field]: value };
// //         if (field === "factory") {
// //           f.process = "";
// //           f.equipment = "";
// //           f.partNo = "";
// //           f.item = "";
// //         } else if (field === "process") {
// //           f.equipment = "";
// //           f.partNo = "";
// //           f.item = "";
// //         } else if (field === "equipment") {
// //           f.partNo = "";
// //           f.item = "";
// //         } else if (field === "topN") {
// //           f.topN = Number(value) || 5;
// //         }
// //         // ✅ 날짜 변경 시에도 품번/품명 유지 (start_date/end_date는 초기화 안 함)
// //         return { filters: f };
// //       },
// //       () => {
// //         if (this._pendingTimer) clearTimeout(this._pendingTimer);
// //         this._pendingTimer = setTimeout(async () => {
// //           await this.loadOptions();
// //           await this.loadAll();
// //         }, 200);
// //       }
// //     );
// //   };

// //   /** 날짜 프리셋/범위 */
// //   setDateRange = async (start, end) => {
// //     const start_date = iso(start);
// //     const end_date = iso(end);
// //     this.setState(
// //       (prev) => ({
// //         // ✅ 날짜만 변경하고 기존 partNo/item 그대로 유지
// //         filters: { ...prev.filters, start_date, end_date },
// //       }),
// //       async () => {
// //         try {
// //           localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
// //         } catch {}
// //         await this.loadOptions();
// //         this.loadAll();
// //       }
// //     );
// //   };
// //   applyToday = () => {
// //     const t = today0();
// //     this.setDateRange(t, t);
// //   };
// //   selectYear = (y) => {
// //     const s = new Date(y, 0, 1);
// //     const e = new Date(y, 11, 31);
// //     this.setState({ selectedYear: y, yearAnchorPos: null });
// //     this.setDateRange(s, e);
// //   };
// //   selectMonth = (m) => {
// //     const y = this.state.selectedYear;
// //     const s = new Date(y, m - 1, 1);
// //     const e = lastOfMonth(s);
// //     this.setState({ monthAnchorPos: null, selectedMonth: m });
// //     this.setDateRange(s, e);
// //   };
// //   selectWeek = (w) => {
// //     this.setState({ weekAnchorPos: null });
// //     this.setDateRange(w.start, w.end);
// //   };

// //   /** 전체 초기화 → DB 최신 달로 */
// //   resetToThisYear = async () => {
// //     const base = getDefaultFilters();
// //     this.setState(
// //       {
// //         filters: { ...base },
// //         selectedYear: new Date().getFullYear(),
// //         selectedMonth: new Date().getMonth() + 1,
// //       },
// //       async () => {
// //         try {
// //           localStorage.removeItem("inspectionFilters");
// //         } catch {}
// //         this._hadSavedFilters = false; // 저장된 필터 삭제로 간주
// //         await this.loadOptions();
// //         // ✅ 강제 최신 달로 재세팅
// //         await this.setDefaultToLatestMonthFromDB(true);
// //         this.loadAll();
// //       }
// //     );
// //   };

// //   /** 데이터 로드 (캐시 + 단계적 로딩: daily 먼저, trend 나중) */
// //   loadAll = async () => {
// //     const runId = ++this._runId;
// //     this._abortAll();

// //     const { filters } = this.state;
// //     try {
// //       localStorage.setItem("inspectionFilters", JSON.stringify(filters));
// //     } catch {}

// //     // --- DAILY ---
// //     this.setState({ loadingDaily: true, error: "" });

// //     const dailyKey = `daily:${keyOf(filters)}`;
// //     const cachedDaily = this._dailyCache.get(dailyKey);
// //     let daily;
// //     try {
// //       if (cachedDaily) {
// //         daily = cachedDaily;
// //       } else {
// //         daily = await this.post("/xn_daily", filters);
// //         this._dailyCache.set(dailyKey, daily);
// //       }
// //     } catch (e) {
// //       console.error(e);
// //       if (runId === this._runId) this.setState({ error: "데일리 데이터를 불러오지 못했습니다.", loadingDaily: false });
// //       return;
// //     }
// //     if (runId !== this._runId) return;

// //     const cols = daily?.cols || [];
// //     const days = daily?.days || [];
// //     const tables = daily?.tables || {};
// //     const shifts = daily?.shifts || [];
// //     const workHeaders = daily?.workHeaders || {};
// //     const dayList = daily?.dayList || (days || []).map((d) => ({ d, equipment: "", partNo: "" }));

// //     const firstDay = dayList?.[0]?.d || days?.[0] || null;
// //     const nextSelected = this.state.selectedDay ?? firstDay;

// //     const specColWidth = this.computeSpecWidthFromRows(tables?.[nextSelected] || []);

// //     this.setState({
// //       dailyCols: cols,
// //       dailyDays: days,
// //       dailyList: dayList,
// //       dailyTables: tables,
// //       dailyShifts: shifts,
// //       dailyWorkHeaders: workHeaders,
// //       selectedDay: nextSelected,
// //       specColWidth,
// //       loadingDaily: false,
// //     });

// //     // --- NUMERIC TREND ---
// //     if (!filters.partNo) {
// //       this.setState({ numTrend: { dates: [], series: [] }, loadingTrend: false });
// //       return;
// //     }

// //     this.setState({ loadingTrend: true });
// //     const trendKey = `trend:${keyOf(filters)}`;
// //     try {
// //       const numeric =
// //         this._trendCache.get(trendKey) || (await this.post("/numeric_trend", filters));
// //       this._trendCache.set(trendKey, numeric);
// //       if (runId !== this._runId) return;
// //       this.setState({ numTrend: numeric || { dates: [], series: [] }, loadingTrend: false });
// //     } catch (e) {
// //       console.error(e);
// //       if (runId === this._runId) this.setState({ loadingTrend: false });
// //     }
// //   };

// //   /** CSV 내보내기 */
// //   exportCsv = () => {
// //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// //     if (!selectedDay) return;
// //     const rawRows = dailyTables[selectedDay] || [];
// //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// //     const headLeft = ["NO", "검사항목명", "검사내용"];
// //     const headMid = dailyShifts.flatMap((s) => dailyCols.map((c) => `${s}-${c}`));
// //     const header = [...headLeft, ...headMid, "평균"];

// //     const csvRows = [
// //       header,
// //       ...rows.map((r, idx) => {
// //         const vals = dailyShifts.flatMap((s) => dailyCols.map((c) => r?.[s]?.[c] ?? ""));
// //         return [String(idx + 1), r["검사항목명"] ?? "", r["검사내용"] ?? "", ...vals, r["평균"] ?? ""];
// //       }),
// //     ];
// //     const csv = csvRows.map((r) => r.join(",")).join("\n");
// //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// //     const url = URL.createObjectURL(blob);
// //     const a = document.createElement("a");
// //     a.href = url;
// //     a.download = `xn_daily_${selectedDay}.csv`;
// //     a.click();
// //     URL.revokeObjectURL(url);
// //   };

// //   /** 품번/품명 모달 */
// //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// //     this.setState(
// //       (prev) => ({
// //         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
// //         itemCodeModalOpen: false,
// //       }),
// //       () => {
// //         this.loadOptions();
// //         this.loadAll();
// //       }
// //     );
// //   };

// //   /** 품번 선택 해제 */
// //   handleClearPart = () => {
// //     this.setState(
// //       (prev) => ({ filters: { ...prev.filters, partNo: "", item: "" } }),
// //       () => {
// //         this.loadOptions();
// //         this.loadAll();
// //       }
// //     );
// //   };

// //   /** partNo → item(품명) 추론 (옵션 배열 사용) */
// //   getItemNameFromOptions = (partNo, parts = this.state.parts, items = this.state.items) => {
// //     const pn = norm(partNo);
// //     if (!pn) return "";
// //     const readPn = (o) =>
// //       typeof o === "string"
// //         ? o
// //         : (o?.partNo ??
// //           o?.품목번호 ??
// //           o?.code ??
// //           o?.value ??
// //           o?.id ??
// //           o?.PART_NO ??
// //           o?.PartNo ??
// //           o?.품번 ??
// //           o?.itemCode);
// //     const readNm = (o) =>
// //       typeof o === "string"
// //         ? o
// //         : (o?.item ??
// //           o?.itemName ??
// //           o?.품목명 ??
// //           o?.name ??
// //           o?.label ??
// //           o?.ITEM_NM ??
// //           o?.ItemName ??
// //           o?.품명 ??
// //           o?.part_nm);

// //     for (const it of parts || []) {
// //       if (norm(readPn(it)) === pn) {
// //         const nm = norm(readNm(it));
// //         if (nm && nm !== pn) return nm;
// //       }
// //     }
// //     for (const it of items || []) {
// //       if (norm(readPn(it)) === pn) {
// //         const nm = norm(readNm(it));
// //         if (nm && nm !== pn) return nm;
// //       }
// //     }
// //     return "";
// //   };

// //   /** dayList 행에서 품명 후보 추론 → 옵션으로 보정 */
// //   resolveItemNameFromRow = (row, partNo) => {
// //     const pn = norm(partNo);
// //     const cands = [
// //       row?.item, row?.itemName, row?.partName, row?.품목명,
// //       row?.item_label, row?.name, row?.label, row?.품명, row?.part_nm,
// //     ].map(norm).filter((v) => v && v !== pn && v !== "-");
// //     if (cands.length) return cands[0];
// //     return this.getItemNameFromOptions(pn);
// //   };

// //   /** 보고일 클릭 → 설비/품번(+품명) 자동 반영 + 모달로 최종 보정 */
// //   handleDayClick = async (row) => {
// //     const { d, equipment, partNo } = row || {};
// //     const { filters } = this.state;

// //     // 동일 조건이면 날짜만 갱신
// //     if ((equipment || filters.equipment) === filters.equipment && (partNo || "") === (filters.partNo || "")) {
// //       this.setState({ selectedDay: d });
// //       return;
// //     }

// //     // 1차: row/옵션에서 품명 후보
// //     const preItem = this.resolveItemNameFromRow(row, partNo || "");
// //     this.setState(
// //       (prev) => ({
// //         selectedDay: d,
// //         filters: {
// //           ...prev.filters,
// //           equipment: equipment || prev.filters.equipment,
// //           partNo: partNo || "",
// //           item: preItem || "",
// //         },
// //       }),
// //       async () => {
// //         // 2차: 옵션 재적재(보정 가능)
// //         await this.loadOptions();

// //         // 3차: 모달 API에서 최종 보정 (비었거나 '-' 또는 품번과 동일하게 들어온 경우)
// //         const curPn = norm(this.state.filters.partNo);
// //         const curItem = norm(this.state.filters.item);
// //         if (curPn && (!curItem || curItem === "-" || curItem === curPn)) {
// //           const modalName = await this.fetchItemFromModal(curPn);
// //           if (modalName) {
// //             this.setState((prev) => ({ filters: { ...prev.filters, item: modalName } }));
// //           } else {
// //             // 옵션에서 마지막 시도
// //             const fixed = this.getItemNameFromOptions(curPn);
// //             const finalNm = norm(fixed);
// //             this.setState((prev) => ({
// //               filters: { ...prev.filters, item: finalNm && finalNm !== curPn ? finalNm : "" },
// //             }));
// //           }
// //         }

// //         await this.loadAll();
// //       }
// //     );
// //   };

// //   // ---------- 상단 필터 ----------
// //   renderFilterBar = () => {
// //     const { filters } = this.state;

// //     const now = today0();
// //     const thisYear = now.getFullYear();
// //     const thisMonth = now.getMonth() + 1;
// //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// //     return (
// //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// //         <CardHeader
// //           title={
// //             <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
// //               <FilterIcon /> 검색 조건
// //             </Typography>
// //           }
// //           action={
// //             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 endIcon={<ExpandMoreIcon />}
// //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// //               >
// //                 연간
// //               </Button>
// //               <Menu
// //                 open={!!this.state.yearAnchorPos}
// //                 onClose={() => this.setState({ yearAnchorPos: null })}
// //                 anchorReference="anchorPosition"
// //                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// //               >
// //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>
// //                   올해
// //                 </MenuItem>
// //                 {this.state.years.map((y) => (
// //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
// //                     {y}년
// //                   </MenuItem>
// //                 ))}
// //               </Menu>

// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 endIcon={<ExpandMoreIcon />}
// //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
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
// //                   onClick={() => {
// //                     this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth));
// //                   }}
// //                 >
// //                   이번달
// //                 </MenuItem>
// //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// //                     {this.state.selectedYear}년 {m}월
// //                   </MenuItem>
// //                 ))}
// //               </Menu>

// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 endIcon={<ExpandMoreIcon />}
// //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
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

// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 onClick={this.applyToday}
// //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// //               >
// //                 오늘
// //               </Button>

// //               <Typography sx={{ color: "white", opacity: 0.8, mx: 0.5 }}>|</Typography>
// //               <Typography sx={{ color: "white" }}>기간선택</Typography>
// //               <TextField
// //                 type="date"
// //                 value={filters.start_date}
// //                 onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// //                 size="small"
// //                 variant="outlined"
// //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// //                 InputLabelProps={{ shrink: true }}
// //               />
// //               <Typography sx={{ color: "white" }}>~</Typography>
// //               <TextField
// //                 type="date"
// //                 value={filters.end_date}
// //                 onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// //                 size="small"
// //                 variant="outlined"
// //                 sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
// //                 InputLabelProps={{ shrink: true }}
// //               />

// //               <IconButton
// //                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
// //                 sx={{ color: "white" }}
// //               >
// //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// //               </IconButton>
// //             </Box>
// //           }
// //           sx={{ backgroundColor: "#ff8f00", color: "white", borderRadius: 1, mb: 2 }}
// //         />

// //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// //         <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, minmax(160px, 1fr))", gap: 2, mb: 1 }}>
// //           <Autocomplete
// //             size="small"
// //             options={this.state.factories}
// //             value={filters.factory || null}
// //             onChange={(_, v) => this.handleFilterChange("factory", v || "")}
// //             renderInput={(params) => <TextField {...params} label="공장" />}
// //             clearOnEscape
// //           />
// //           <Autocomplete
// //             size="small"
// //             options={this.state.processes}
// //             value={filters.process || null}
// //             onChange={(_, v) => this.handleFilterChange("process", v || "")}
// //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
// //             clearOnEscape
// //           />
// //           <Autocomplete
// //             size="small"
// //             options={this.state.equipments}
// //             value={filters.equipment || null}
// //             onChange={(_, v) => this.handleFilterChange("equipment", v || "")}
// //             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
// //             clearOnEscape
// //           />
// //           <TextField
// //             fullWidth
// //             label="품번"
// //             value={filters.partNo}
// //             onClick={this.openItemCodeModal}
// //             size="small"
// //             variant="outlined"
// //             InputProps={{
// //               readOnly: true,
// //               style: { cursor: "pointer" },
// //               endAdornment: (
// //                 <InputAdornment position="end">
// //                   {Boolean(filters.partNo) && (
// //                     <IconButton
// //                       size="small"
// //                       aria-label="품번 선택해제"
// //                       onClick={(e) => {
// //                         e.stopPropagation();
// //                         this.handleClearPart();
// //                       }}
// //                       sx={{ mr: 0.5 }}
// //                     >
// //                       <ClearIcon fontSize="small" />
// //                     </IconButton>
// //                   )}
// //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// //                 </InputAdornment>
// //               ),
// //             }}
// //             sx={{
// //               "& .MuiInputBase-root": {
// //                 cursor: "pointer",
// //                 "&:hover": { backgroundColor: "#f5f5f5" },
// //               },
// //             }}
// //           />
// //           <TextField
// //             fullWidth
// //             label="품명(검사항목)"
// //             value={filters.item}
// //             onClick={this.openItemCodeModal}
// //             size="small"
// //             variant="outlined"
// //             InputProps={{
// //               readOnly: true,
// //               style: { cursor: "pointer" },
// //               endAdornment: (
// //                 <InputAdornment position="end">
// //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// //                 </InputAdornment>
// //               ),
// //             }}
// //             sx={{
// //               "& .MuiInputBase-root": {
// //                 cursor: "pointer",
// //                 "&:hover": { backgroundColor: "#f5f5f5" },
// //               },
// //             }}
// //           />
// //         </Box>

// //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// //           <Divider sx={{ my: 2 }} />
// //           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 16 }}>
// //             <TextField
// //               fullWidth
// //               label="검사구분"
// //               value={filters.inspType}
// //               onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
// //               size="small"
// //               variant="outlined"
// //             />
// //             <TextField
// //               fullWidth
// //               label="작업구분"
// //               value={filters.workType}
// //               onChange={(e) => this.handleFilterChange("workType", e.target.value)}
// //               size="small"
// //               variant="outlined"
// //             />
// //             <TextField
// //               fullWidth
// //               label="주야구분"
// //               value={filters.shiftType}
// //               onChange={(e) => this.handleFilterChange("shiftType", e.target.value)}
// //               size="small"
// //               variant="outlined"
// //             />
// //             <TextField
// //               fullWidth
// //               label="Top N"
// //               type="number"
// //               value={filters.topN ?? 5}
// //               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
// //               size="small"
// //               variant="outlined"
// //             />
// //           </Box>
// //         </Collapse>

// //         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
// //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
// //             필터 초기화
// //           </Button>
// //           <Button
// //             variant="contained"
// //             startIcon={<SearchIcon />}
// //             size="large"
// //             sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// //             onClick={() => {
// //               if (this._pendingTimer) clearTimeout(this._pendingTimer);
// //               this.loadOptions();
// //               this.loadAll();
// //             }}
// //           >
// //             검색
// //           </Button>
// //           <Button
// //             variant="outlined"
// //             startIcon={<DownloadIcon />}
// //             size="large"
// //             onClick={this.exportCsv}
// //             disabled={!this.state.filters.partNo}
// //           >
// //             CSV 내보내기
// //           </Button>
// //         </Box>

// //         <InspectionItemModal
// //           open={this.state.itemCodeModalOpen}
// //           onClose={this.closeItemCodeModal}
// //           onSelect={this.handleItemCodeSelect}
// //           selectedItemCode={filters.partNo}
// //           plant={filters.factory}
// //           worker={filters.process}
// //           line={filters.equipment}
// //           startDate={filters.start_date}
// //           endDate={filters.end_date}
// //         />
// //       </Paper>
// //     );
// //   };

// //   /** 선택 일자의 Xn 표 */
// //   renderDailyTable = () => {
// //     const {
// //       dailyCols,
// //       dailyTables,
// //       dailyShifts,
// //       dailyWorkHeaders,
// //       selectedDay,
// //       loadingDaily,
// //       filters,
// //       specColWidth,
// //     } = this.state;

// //     if (!filters.partNo) {
// //       return (
// //         <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// //           <Box className={s.sectionHeader}>
// //             <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //               작업순번(Xn) 결과표 — 주/야/작업구분
// //             </Typography>
// //           </Box>
// //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// //         </Paper>
// //       );
// //     }

// //     const rawRows = selectedDay ? dailyTables[selectedDay] || [] : [];
// //     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

// //     const partText = filters.partNo ? filters.partNo : "전체 품번";
// //     const itemText = filters.item || "";
// //     const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

// //     const tableMinW = calcTableMinWidth(dailyCols.length, dailyShifts.length, specColWidth);

// //     return (
// //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             작업순번(Xn) 결과표 — 주/야/작업구분
// //           </Typography>
// //           <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
// //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
// //             <Chip size="small" label={partText} />
// //             {itemText && <Chip size="small" variant="outlined" label={itemText} />}
// //             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
// //             <Chip size="small" label={rangeText} />
// //             {selectedDay && (
// //               <>
// //                 <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>보고일</Typography>
// //                 <Chip size="small" color="primary" variant="outlined" label={selectedDay} />
// //               </>
// //             )}
// //           </Box>
// //         </Box>

// //         {loadingDaily ? (
// //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// //           </Box>
// //         ) : (
// //           <Box
// //             sx={{
// //               maxHeight: 800,
// //               overflow: "auto",
// //               borderRadius: 1,
// //               "& table": {
// //                 width: "100%",
// //                 borderCollapse: "separate",
// //                 borderSpacing: 0,
// //                 tableLayout: "fixed",
// //                 minWidth: tableMinW,
// //               },
// //               "& th, & td": {
// //                 padding: "8px 10px",
// //                 borderBottom: "1px solid #eceff1",
// //                 fontSize: 13,
// //                 whiteSpace: "nowrap",
// //                 overflow: "hidden",
// //                 textOverflow: "ellipsis",
// //                 height: 40,
// //                 lineHeight: "24px",
// //                 verticalAlign: "middle",
// //               },
// //               "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
// //               "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
// //             }}
// //           >
// //             <table>
// //               <thead>
// //                 <tr>
// //                   <th style={{ width: COL_W.no, textAlign: "center" }} rowSpan={3}>
// //                     NO
// //                   </th>
// //                   <th style={{ width: COL_W.name }} rowSpan={3}>
// //                     검사항목명
// //                   </th>
// //                   <th style={{ width: this.state.specColWidth }} rowSpan={3}>
// //                     검사내용
// //                   </th>
// //                   {dailyShifts.map((s) => (
// //                     <th key={s} colSpan={dailyCols.length} style={{ textAlign: "center" }}>
// //                       {s || "전체"}
// //                     </th>
// //                   ))}
// //                   <th rowSpan={3} style={{ width: COL_W.avg, textAlign: "right" }}>
// //                     평균
// //                   </th>
// //                 </tr>
// //                 <tr>
// //                   {dailyShifts.map((s) =>
// //                     dailyCols.map((c) => (
// //                       <th key={`${s}-${c}`} style={{ width: COL_W.data, textAlign: "center" }}>
// //                         {c}
// //                       </th>
// //                     ))
// //                   )}
// //                 </tr>
// //                 <tr>
// //                   {dailyShifts.map((s) =>
// //                     dailyCols.map((c) => (
// //                       <th
// //                         key={`${s}-${c}-work`}
// //                         style={{ width: COL_W.data, textAlign: "center", fontWeight: 600, color: "#607d8b" }}
// //                         title={dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// //                       >
// //                         {dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
// //                       </th>
// //                     ))
// //                   )}
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {rows.map((r, idx) => (
// //                   <tr key={idx}>
// //                     <td style={{ width: COL_W.no, textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
// //                     <td style={{ width: COL_W.name }} title={r["검사항목명"] ?? ""}>
// //                       {r["검사항목명"] ?? ""}
// //                     </td>
// //                     <td style={{ width: this.state.specColWidth }} title={r["검사내용"] ?? ""}>
// //                       {r["검사내용"] ?? ""}
// //                     </td>
// //                     {dailyShifts.map((s) =>
// //                       dailyCols.map((c) => (
// //                         <td key={`${idx}-${s}-${c}`} style={{ width: COL_W.data, textAlign: "right" }}>
// //                           {fmtNum(r?.[s]?.[c], 3)}
// //                         </td>
// //                       ))
// //                     )}
// //                     <td style={{ width: COL_W.avg, textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
// //                   </tr>
// //                 ))}
// //                 {(!rows || rows.length === 0) && (
// //                   <tr>
// //                     <td colSpan={3 + dailyShifts.length * dailyCols.length + 1} style={{ textAlign: "center", padding: "32px 0" }}>
// //                       데이터가 없습니다.
// //                     </td>
// //                   </tr>
// //                 )}
// //               </tbody>
// //             </table>
// //           </Box>
// //         )}
// //       </Paper>
// //     );
// //   };

// //   /** 선택 일자 기준 멀티라인 차트 데이터 */
// //   buildChartDataForSelectedDay = () => {
// //     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
// //     if (!selectedDay) return { seriesKeys: [], rows: [] };
// //     const rowsSrc = dailyTables[selectedDay] || [];

// //     const labelOf = (r) => {
// //       const name = r["검사항목명"] ?? "";
// //       const spec = r["검사내용"] ?? "";
// //       return spec ? `${name} | ${spec}` : name;
// //     };

// //     const rows = dailyCols.map((x) => {
// //       const row = { x };
// //       rowsSrc.forEach((r) => {
// //         const key = labelOf(r);
// //         let sum = 0,
// //           cnt = 0;
// //         dailyShifts.forEach((s) => {
// //           const v = r?.[s]?.[x];
// //           if (v != null && v !== "") {
// //             sum += Number(v);
// //             cnt += 1;
// //           }
// //         });
// //         row[key] = cnt > 0 ? sum / cnt : null;
// //       });
// //       return row;
// //     });

// //     const seriesKeys = rowsSrc.map((r) => labelOf(r));
// //     return { seriesKeys, rows };
// //   };

// //   /** Xn 멀티라인 차트 (선택 일자) */
// //   renderSelectedDayChart = () => {
// //     const { loadingTrend, loadingDaily, selectedDay, filters } = this.state;

// //     if (!filters.partNo) {
// //       return (
// //         <Paper className={s.section} style={{ marginTop: 16 }}>
// //           <Box className={s.sectionHeader}>
// //             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// //               검사항목별 Xn 흐름
// //             </Typography>
// //           </Box>
// //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// //         </Paper>
// //       );
// //     }

// //     const { seriesKeys, rows } = this.buildChartDataForSelectedDay();

// //     return (
// //       <Paper className={s.section} style={{ marginTop: 16 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// //             {selectedDay ? `${selectedDay} — 검사항목별 Xn 흐름` : "검사항목별 Xn 흐름"}
// //           </Typography>
// //         </Box>

// //         {loadingDaily ? (
// //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// //           </Box>
// //         ) : rows.length === 0 ? (
// //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// //         ) : loadingTrend ? (
// //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// //             <CircularProgress size={44} sx={{ color: "#90caf9" }} />
// //           </Box>
// //         ) : (
// //           <Box style={{ width: "100%", height: 380 }}>
// //             <ResponsiveContainer>
// //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// //                 <CartesianGrid strokeDasharray="3 3" />
// //                 <XAxis dataKey="x" />
// //                 <YAxis />
// //                 <RTooltip />
// //                 <Legend />
// //                 {seriesKeys.map((k) => (
// //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// //                 ))}
// //               </LineChart>
// //             </ResponsiveContainer>
// //           </Box>
// //         )}
// //       </Paper>
// //     );
// //   };

// //   /** 숫자형(실측값) 검사항목 — 일자별 추이 차트 */
// //   buildNumericTrendChart = () => {
// //     const { numTrend } = this.state;
// //     const dates = numTrend?.dates || [];
// //     const series = numTrend?.series || [];
// //     if (dates.length === 0 || series.length === 0) return { keys: [], rows: [] };
// //     const rows = dates.map((d, i) => {
// //       const o = { date: d };
// //       series.forEach((s) => {
// //         o[s.label] = s.data?.[i] != null ? Number(s.data[i]) : null;
// //       });
// //       return o;
// //     });
// //     const keys = series.map((s) => s.label);
// //     return { keys, rows };
// //   };

// //   renderNumericTrendChart = () => {
// //     const { loadingTrend, filters } = this.state;

// //     if (!filters.partNo) {
// //       return (
// //         <Paper className={s.section} style={{ marginTop: 16 }}>
// //           <Box className={s.sectionHeader}>
// //             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// //               숫자형 검사항목 — 일자별 실측값 추이
// //             </Typography>
// //           </Box>
// //           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
// //         </Paper>
// //       );
// //     }

// //     const { keys, rows } = this.buildNumericTrendChart();
// //     return (
// //       <Paper className={s.section} style={{ marginTop: 16 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
// //             숫자형 검사항목 — 일자별 실측값 추이 (Top {filters.topN ?? 5})
// //           </Typography>
// //         </Box>
// //         {loadingTrend ? (
// //           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
// //             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
// //           </Box>
// //         ) : rows.length === 0 ? (
// //           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
// //         ) : (
// //           <Box style={{ width: "100%", height: 380 }}>
// //             <ResponsiveContainer>
// //               <LineChart data={rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
// //                 <CartesianGrid strokeDasharray="3 3" />
// //                 <XAxis dataKey="date" />
// //                 <YAxis />
// //                 <RTooltip />
// //                 <Legend />
// //                 {keys.map((k) => (
// //                   <Line key={k} type="monotone" dataKey={k} dot={false} strokeWidth={2} />
// //                 ))}
// //               </LineChart>
// //             </ResponsiveContainer>
// //           </Box>
// //         )}
// //       </Paper>
// //     );
// //   };

// //   render() {
// //     const { error, dailyList, selectedDay, loadingDaily } = this.state;

// //     return (
// //       <Box className={s.root}>
// //         {/* 필터 바 */}
// //         {this.renderFilterBar()}

// //         {/* 에러 */}
// //         {error && (
// //           <Box sx={{ mb: 2 }}>
// //             <Alert severity="error" sx={{ mb: 2 }}>
// //               {error}
// //             </Alert>
// //             <Button
// //               variant="contained"
// //               onClick={this.loadAll}
// //               sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
// //             >
// //               다시 시도
// //             </Button>
// //           </Box>
// //         )}

// //         {/* 본문: 좌측 날짜 목록 + 우측 표/차트 */}
// //         <Box className={s.dailyLayout}>
// //           <Paper className={s.dayPanel}>
// //             <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a", mb: 1 }}>보고일</Typography>

// //             <Box className={s.dayList}>
// //               <div className={s.dayListHead}>
// //                 <span>보고일</span>
// //                 <span>설비</span>
// //                 <span>품번</span>
// //               </div>
// //               <div className={s.dayListBody}>
// //                 {loadingDaily ? (
// //                   <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6, color: "#90a4ae" }}>
// //                     <CircularProgress size={28} sx={{ mr: 1, color: "#ff8f00" }} />
// //                     로딩 중...
// //                   </Box>
// //                 ) : dailyList.length > 0 ? (
// //                   dailyList.map((row) => (
// //                     <div
// //                       key={row.d}
// //                       className={`${s.dayRow} ${selectedDay === row.d ? s.active : ""}`}
// //                       onClick={() => this.handleDayClick(row)}
// //                       title="클릭 시 상단 설비/품번/품명이 자동 반영됩니다"
// //                     >
// //                       <span>{row.d}</span>
// //                       <span>{row.equipment || "-"}</span>
// //                       <span>{row.partNo || "-"}</span>
// //                     </div>
// //                   ))
// //                 ) : (
// //                   <div className={s.dayEmpty}>기간/필터 조건에 해당하는 결과가 없습니다.</div>
// //                 )}
// //               </div>
// //             </Box>
// //           </Paper>

// //           <Box className={s.rightArea}>
// //             {this.renderDailyTable()}
// //             {this.renderSelectedDayChart()}
// //             {this.renderNumericTrendChart()}
// //           </Box>
// //         </Box>
// //       </Box>
// //     );
// //   }
// // }

// // export default InspectionSystemChart;

// // src/pages/inspection/InspectionSystemChart.js
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
//   if (v === null || v === undefined || v === "") return "";
//   const n = Number(v);
//   if (Number.isNaN(n)) return String(v);
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

// /** 기본 필터 */
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

// /** ---- 표 틀 고정용 기본 폭 정의 ---- */
// const COL_W = { no: 64, name: 180, specBase: 320, data: 96, avg: 100 };
// const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
// const calcTableMinWidth = (colsLen, shiftsLen, specW) =>
//   COL_W.no + COL_W.name + specW + (colsLen || 0) * (shiftsLen || 0) * COL_W.data + COL_W.avg;

// /** ----- 정렬 유틸 ----- */
// const firstSeqIndex = (row, cols, shifts) => {
//   for (let i = 0; i < cols.length; i += 1) {
//     const c = cols[i];
//     for (const s of shifts) {
//       const v = row?.[s]?.[c];
//       if (v !== null && v !== undefined && v !== "") return i + 1;
//     }
//   }
//   return Number.MAX_SAFE_INTEGER;
// };
// const getInspectionSeq = (row, cols, shifts) => {
//   const raw = row?.["검사순번"];
//   const n = Number(raw);
//   if (raw !== undefined && raw !== null && !Number.isNaN(n)) return n;
//   return firstSeqIndex(row, cols, shifts);
// };
// const sortRowsByInspectionSeqAsc = (rows, cols, shifts) =>
//   [...rows].sort((a, b) => {
//     const ia = getInspectionSeq(a, cols, shifts);
//     const ib = getInspectionSeq(b, cols, shifts);
//     if (ia !== ib) return ia - ib;
//     const an = (a["검사항목명"] || "").localeCompare(b["검사항목명"] || "");
//     if (an !== 0) return an;
//     return (a["검사내용"] || "").localeCompare(b["검사내용"] || "");
//   });

// /** ---- 간단 LRU 캐시 ---- */
// class Lru {
//   constructor(limit = 8) {
//     this.limit = limit;
//     this.map = new Map();
//   }
//   get(k) {
//     if (!this.map.has(k)) return undefined;
//     const v = this.map.get(k);
//     this.map.delete(k);
//     this.map.set(k, v);
//     return v;
//   }
//   set(k, v) {
//     if (this.map.has(k)) this.map.delete(k);
//     this.map.set(k, v);
//     if (this.map.size > this.limit) {
//       const first = this.map.keys().next().value;
//       this.map.delete(first);
//     }
//   }
// }
// const keyOf = (filters) => {
//   const {
//     start_date,
//     end_date,
//     factory,
//     process,
//     equipment,
//     partNo,
//     inspType,
//     workType,
//     shiftType,
//     topN,
//   } = filters || {};
//   return JSON.stringify({ start_date, end_date, factory, process, equipment, partNo, inspType, workType, shiftType, topN });
// };

// // 문자열 정규화
// const norm = (v) => String(v ?? "").trim();

// class InspectionSystemChart extends Component {
//   state = {
//     filters: getDefaultFilters(),

//     // 보고일/표 데이터
//     dailyCols: [],
//     dailyDays: [],
//     dailyList: [],
//     dailyTables: {},
//     dailyShifts: [],
//     dailyWorkHeaders: {},
//     selectedDay: null,

//     // 숫자형 추이
//     numTrend: { dates: [], series: [] },

//     // 옵션
//     factories: [],
//     processes: [],
//     equipments: [],
//     parts: [],
//     items: [],
//     optionsLoading: false,

//     // UI 로딩 플래그(분리)
//     loadingDaily: false, // 보고일 목록 + 표 데이터
//     loadingTrend: false, // 숫자형 추이
//     error: "",
//     filterExpanded: false,

//     // 프리셋 상태/앵커
//     selectedYear: new Date().getFullYear(),
//     selectedMonth: new Date().getMonth() + 1,
//     yearAnchorPos: null,
//     monthAnchorPos: null,
//     weekAnchorPos: null,

//     years: [],

//     // 모달
//     itemCodeModalOpen: false,

//     // 동적 "검사내용" 폭(px)
//     specColWidth: COL_W.specBase,
//   };

//   // ==== 상태 플래그 ====
//   _hadSavedFilters = false; // 저장된 필터가 있었는지

//   // ==== 성능 ====
//   _runId = 0;
//   _pendingTimer = null;
//   _controllers = new Set();

//   // ==== 캐시 ====
//   _dailyCache = new Lru(6);
//   _trendCache = new Lru(6);
//   _optionsCache = new Lru(6);

//   // ==== 측정용 canvas ====
//   _measureCtx = null;
//   getMeasureCtx = () => {
//     if (typeof document === "undefined") return null;
//     if (!this._measureCtx) {
//       const canvas = document.createElement("canvas");
//       this._measureCtx = canvas.getContext("2d");
//     }
//     return this._measureCtx;
//   };
//   measureTextPx = (text) => {
//     const ctx = this.getMeasureCtx();
//     const font = '13px "Noto Sans KR", Roboto, Apple SD Gothic Neo, Arial, sans-serif';
//     if (!ctx) return String(text ?? "").length * 12;
//     ctx.font = font;
//     return ctx.measureText(String(text ?? "")).width;
//   };
//   computeSpecWidthFromRows = (rows) => {
//     let longestPx = this.measureTextPx("검사내용");
//     const addPad = 36;
//     const minPx = COL_W.specBase;
//     const hardMaxPx = 720;
//     (rows || []).forEach((r) => {
//       const px = this.measureTextPx(r?.["검사내용"]);
//       if (px > longestPx) longestPx = px;
//     });
//     return clamp(Math.ceil(longestPx) + addPad, minPx, hardMaxPx);
//   };

//   componentDidMount() {
//     const base = getDefaultFilters();
//     const saved = localStorage.getItem("inspectionFilters");
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         const merged = { ...base, ...parsed };
//         merged.factory = merged.factory || base.factory;
//         merged.process = merged.process || base.process;
//         merged.equipment = merged.equipment || base.equipment;
//         this._hadSavedFilters = true;
//         this.setState({ filters: merged });
//       } catch {
//         this.setState({ filters: base });
//       }
//     } else {
//       this.setState({ filters: base });
//     }
//     this.bootstrap();
//   }

//   componentDidUpdate(_, prevState) {
//     if (this.state.selectedDay !== prevState.selectedDay) {
//       const rows = this.state.dailyTables?.[this.state.selectedDay] || [];
//       const w = this.computeSpecWidthFromRows(rows);
//       if (w !== this.state.specColWidth) this.setState({ specColWidth: w });
//     }
//   }

//   /** --------- API ---------- */
//   _abortAll = () => {
//     for (const c of this._controllers) try { c.abort(); } catch {}
//     this._controllers.clear();
//   };
//   post = async (path, body) => {
//     const controller = new AbortController();
//     this._controllers.add(controller);
//     try {
//       const headers = { "Content-Type": "application/json" };
//       const res = await fetch(
//         `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
//         { method: "POST", headers, body: JSON.stringify(body || {}), signal: controller.signal }
//       );
//       if (!res.ok) {
//         const t = await res.text().catch(() => "");
//         throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
//       }
//       const json = await res.json();
//       return json.data || [];
//     } finally {
//       this._controllers.delete(controller);
//     }
//   };

//   /** 모달 아이템 조회(정확 일치 우선, 품번과 같은 문자열은 무시) */
//   fetchItemFromModal = async (partNo) => {
//     const pn = norm(partNo);
//     if (!pn) return "";
//     try {
//       const payload = {
//         q: pn,
//         exact: true,
//         plant: this.state.filters.factory,
//         worker: this.state.filters.process,
//         line: this.state.filters.equipment,
//         startDate: this.state.filters.start_date,
//         endDate: this.state.filters.end_date,
//       };

//       const res = await fetch(
//         `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_modal/item_list`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }
//       );

//       const json = await res.json().catch(() => null);
//       const rows = Array.isArray(json?.data) ? json.data : [];

//       const readPn = (o) =>
//         o?.partNo ??
//         o?.품목번호 ??
//         o?.code ??
//         o?.value ??
//         o?.id ??
//         o?.PART_NO ??
//         o?.PartNo ??
//         o?.품번 ??
//         o?.itemCode;
//       const readNm = (o) =>
//         o?.item ??
//         o?.itemName ??
//         o?.품목명 ??
//         o?.name ??
//         o?.label ??
//         o?.ITEM_NM ??
//         o?.ItemName ??
//         o?.품명 ??
//         o?.part_nm;

//       // 정확 일치 우선
//       const exact = rows.find((r) => norm(readPn(r)) === pn);
//       const nm = norm(exact ? readNm(exact) : rows.length ? readNm(rows[0]) : "");
//       // 품번과 완전히 같은 문자열이면 품명으로 사용하지 않음
//       if (nm && nm !== pn) return nm;
//       return "";
//     } catch {
//       return "";
//     }
//   };

//   /** ✅ DB 최신 보고일의 "달"을 기본 기간으로 세팅 (신규 엔드포인트 사용) */
//   setDefaultToLatestMonthViaEndpoint = async (force = false) => {
//     try {
//       if (!force && this._hadSavedFilters) return; // 저장된 필터 있으면 건드리지 않음

//       const { filters } = this.state;
//       // 날짜는 빼고 나머지 필터만 전달
//       const payload = {
//         factory: filters.factory,
//         process: filters.process,
//         equipment: filters.equipment,
//         partNo: "",       // 기본 부트스트랩은 품번 고정 안함
//         item: "",
//         inspectItem: "",
//         inspType: filters.inspType,
//         workType: filters.workType,
//         shiftType: filters.shiftType,
//       };
//       const data = await this.post("/options/latest_month", payload);
//       const start = data?.start, end = data?.end, year = data?.year, month = data?.month;

//       if (start && end) {
//         this.setState(
//           (prev) => ({
//             selectedYear: year || prev.selectedYear,
//             selectedMonth: month || prev.selectedMonth,
//             filters: { ...prev.filters, start_date: start, end_date: end },
//           }),
//           () => {
//             try {
//               localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
//             } catch {}
//           }
//         );
//       }
//     } catch (e) {
//       console.warn("setDefaultToLatestMonthViaEndpoint failed:", e);
//       // 실패해도 연간 기본값으로 진행
//     }
//   };

//   bootstrap = async () => {
//     await this.loadYears();
//     // ✅ 기본값 자체를 DB 최신 달로(저장된 필터 없을 때만)
//     await this.setDefaultToLatestMonthViaEndpoint(false);
//     await this.loadOptions();
//     this.loadAll();
//   };

//   /** 옵션 로드 + 품명 보정 (캐시) */
//   loadOptions = async () => {
//     const runId = ++this._runId;
//     const { filters } = this.state;
//     const k = keyOf({ ...filters, partNo: "", topN: undefined });
//     const cached = this._optionsCache.get(k);
//     if (cached) {
//       this.setState((prev) => {
//         const filledName = this.getItemNameFromOptions(prev.filters.partNo, cached.parts, cached.items);
//         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
//         const next = { ...cached, optionsLoading: false };
//         if (needFill) next.filters = { ...prev.filters, item: filledName };
//         return next;
//       });
//       return;
//     }

//     this.setState({ optionsLoading: true });
//     try {
//       const [factories, processes, equipments, parts, items] = await Promise.all([
//         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
//         this.post("/options/processes", { ...filters }),
//         this.post("/options/equipments", { ...filters }),
//         this.post("/options/parts", { ...filters }),
//         this.post("/options/items", { ...filters }),
//       ]);
//       if (runId !== this._runId) return;

//       const payload = { factories, processes, equipments, parts, items };
//       this._optionsCache.set(k, payload);

//       this.setState((prev) => {
//         const filledName = this.getItemNameFromOptions(prev.filters.partNo, parts, items);
//         const needFill = prev.filters.partNo && !prev.filters.item && filledName;
//         const next = { ...payload, optionsLoading: false };
//         if (needFill) next.filters = { ...prev.filters, item: filledName };
//         return next;
//       });
//     } catch (e) {
//       console.error(e);
//       this.setState({ optionsLoading: false });
//     }
//   };

//   /** 연도 옵션 */
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

//   /** 필터 변경 (200ms 디바운스) */
//   handleFilterChange = (field, value) => {
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
//         // ✅ 날짜 변경 시에도 품번/품명 유지 (start_date/end_date는 초기화 안 함)
//         return { filters: f };
//       },
//       () => {
//         if (this._pendingTimer) clearTimeout(this._pendingTimer);
//         this._pendingTimer = setTimeout(async () => {
//           await this.loadOptions();
//           await this.loadAll();
//         }, 200);
//       }
//     );
//   };

//   /** 날짜 프리셋/범위 */
//   setDateRange = async (start, end) => {
//     const start_date = iso(start);
//     const end_date = iso(end);
//     this.setState(
//       (prev) => ({
//         // ✅ 날짜만 변경하고 기존 partNo/item 그대로 유지
//         filters: { ...prev.filters, start_date, end_date },
//       }),
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

//   /** 전체 초기화 → DB 최신 달로 */
//   resetToThisYear = async () => {
//     const base = getDefaultFilters();
//     this.setState(
//       {
//         filters: { ...base },
//         selectedYear: new Date().getFullYear(),
//         selectedMonth: new Date().getMonth() + 1,
//       },
//       async () => {
//         try {
//           localStorage.removeItem("inspectionFilters");
//         } catch {}
//         this._hadSavedFilters = false; // 저장된 필터 삭제로 간주
//         await this.loadOptions();
//         // ✅ 강제 최신 달로 재세팅 (신규 엔드포인트)
//         await this.setDefaultToLatestMonthViaEndpoint(true);
//         this.loadAll();
//       }
//     );
//   };

//   /** 데이터 로드 (캐시 + 단계적 로딩: daily 먼저, trend 나중) */
//   loadAll = async () => {
//     const runId = ++this._runId;
//     this._abortAll();

//     const { filters } = this.state;
//     try {
//       localStorage.setItem("inspectionFilters", JSON.stringify(filters));
//     } catch {}

//     // --- DAILY ---
//     this.setState({ loadingDaily: true, error: "" });

//     const dailyKey = `daily:${keyOf(filters)}`;
//     const cachedDaily = this._dailyCache.get(dailyKey);
//     let daily;
//     try {
//       if (cachedDaily) {
//         daily = cachedDaily;
//       } else {
//         daily = await this.post("/xn_daily", filters);
//         this._dailyCache.set(dailyKey, daily);
//       }
//     } catch (e) {
//       console.error(e);
//       if (runId === this._runId) this.setState({ error: "데일리 데이터를 불러오지 못했습니다.", loadingDaily: false });
//       return;
//     }
//     if (runId !== this._runId) return;

//     const cols = daily?.cols || [];
//     const days = daily?.days || [];
//     const tables = daily?.tables || {};
//     const shifts = daily?.shifts || [];
//     const workHeaders = daily?.workHeaders || {};
//     const dayList = daily?.dayList || (days || []).map((d) => ({ d, equipment: "", partNo: "" }));

//     const firstDay = dayList?.[0]?.d || days?.[0] || null;
//     const nextSelected = this.state.selectedDay ?? firstDay;

//     const specColWidth = this.computeSpecWidthFromRows(tables?.[nextSelected] || []);

//     this.setState({
//       dailyCols: cols,
//       dailyDays: days,
//       dailyList: dayList,
//       dailyTables: tables,
//       dailyShifts: shifts,
//       dailyWorkHeaders: workHeaders,
//       selectedDay: nextSelected,
//       specColWidth,
//       loadingDaily: false,
//     });

//     // --- NUMERIC TREND ---
//     if (!filters.partNo) {
//       this.setState({ numTrend: { dates: [], series: [] }, loadingTrend: false });
//       return;
//     }

//     this.setState({ loadingTrend: true });
//     const trendKey = `trend:${keyOf(filters)}`;
//     try {
//       const numeric =
//         this._trendCache.get(trendKey) || (await this.post("/numeric_trend", filters));
//       this._trendCache.set(trendKey, numeric);
//       if (runId !== this._runId) return;
//       this.setState({ numTrend: numeric || { dates: [], series: [] }, loadingTrend: false });
//     } catch (e) {
//       console.error(e);
//       if (runId === this._runId) this.setState({ loadingTrend: false });
//     }
//   };

//   /** CSV 내보내기 */
//   exportCsv = () => {
//     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
//     if (!selectedDay) return;
//     const rawRows = dailyTables[selectedDay] || [];
//     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

//     const headLeft = ["NO", "검사항목명", "검사내용"];
//     const headMid = dailyShifts.flatMap((s) => dailyCols.map((c) => `${s}-${c}`));
//     const header = [...headLeft, ...headMid, "평균"];

//     const csvRows = [
//       header,
//       ...rows.map((r, idx) => {
//         const vals = dailyShifts.flatMap((s) => dailyCols.map((c) => r?.[s]?.[c] ?? ""));
//         return [String(idx + 1), r["검사항목명"] ?? "", r["검사내용"] ?? "", ...vals, r["평균"] ?? ""];
//       }),
//     ];
//     const csv = csvRows.map((r) => r.join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `xn_daily_${selectedDay}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   /** 품번/품명 모달 */
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

//   /** 품번 선택 해제 */
//   handleClearPart = () => {
//     this.setState(
//       (prev) => ({ filters: { ...prev.filters, partNo: "", item: "" } }),
//       () => {
//         this.loadOptions();
//         this.loadAll();
//       }
//     );
//   };

//   /** partNo → item(품명) 추론 (옵션 배열 사용) */
//   getItemNameFromOptions = (partNo, parts = this.state.parts, items = this.state.items) => {
//     const pn = norm(partNo);
//     if (!pn) return "";
//     const readPn = (o) =>
//       typeof o === "string"
//         ? o
//         : (o?.partNo ??
//           o?.품목번호 ??
//           o?.code ??
//           o?.value ??
//           o?.id ??
//           o?.PART_NO ??
//           o?.PartNo ??
//           o?.품번 ??
//           o?.itemCode);
//     const readNm = (o) =>
//       typeof o === "string"
//         ? o
//         : (o?.item ??
//           o?.itemName ??
//           o?.품목명 ??
//           o?.name ??
//           o?.label ??
//           o?.ITEM_NM ??
//           o?.ItemName ??
//           o?.품명 ??
//           o?.part_nm);

//     for (const it of parts || []) {
//       if (norm(readPn(it)) === pn) {
//         const nm = norm(readNm(it));
//         if (nm && nm !== pn) return nm;
//       }
//     }
//     for (const it of items || []) {
//       if (norm(readPn(it)) === pn) {
//         const nm = norm(readNm(it));
//         if (nm && nm !== pn) return nm;
//       }
//     }
//     return "";
//   };

//   /** dayList 행에서 품명 후보 추론 → 옵션으로 보정 */
//   resolveItemNameFromRow = (row, partNo) => {
//     const pn = norm(partNo);
//     const cands = [
//       row?.item, row?.itemName, row?.partName, row?.품목명,
//       row?.item_label, row?.name, row?.label, row?.품명, row?.part_nm,
//     ].map(norm).filter((v) => v && v !== pn && v !== "-");
//     if (cands.length) return cands[0];
//     return this.getItemNameFromOptions(pn);
//   };

//   /** 보고일 클릭 → 설비/품번(+품명) 자동 반영 + 모달로 최종 보정 */
//   handleDayClick = async (row) => {
//     const { d, equipment, partNo } = row || {};
//     const { filters } = this.state;

//     // 동일 조건이면 날짜만 갱신
//     if ((equipment || filters.equipment) === filters.equipment && (partNo || "") === (filters.partNo || "")) {
//       this.setState({ selectedDay: d });
//       return;
//     }

//     // 1차: row/옵션에서 품명 후보
//     const preItem = this.resolveItemNameFromRow(row, partNo || "");
//     this.setState(
//       (prev) => ({
//         selectedDay: d,
//         filters: {
//           ...prev.filters,
//           equipment: equipment || prev.filters.equipment,
//           partNo: partNo || "",
//           item: preItem || "",
//         },
//       }),
//       async () => {
//         // 2차: 옵션 재적재(보정 가능)
//         await this.loadOptions();

//         // 3차: 모달 API에서 최종 보정 (비었거나 '-' 또는 품번과 동일하게 들어온 경우)
//         const curPn = norm(this.state.filters.partNo);
//         const curItem = norm(this.state.filters.item);
//         if (curPn && (!curItem || curItem === "-" || curItem === curPn)) {
//           const modalName = await this.fetchItemFromModal(curPn);
//           if (modalName) {
//             this.setState((prev) => ({ filters: { ...prev.filters, item: modalName } }));
//           } else {
//             // 옵션에서 마지막 시도
//             const fixed = this.getItemNameFromOptions(curPn);
//             const finalNm = norm(fixed);
//             this.setState((prev) => ({
//               filters: { ...prev.filters, item: finalNm && finalNm !== curPn ? finalNm : "" },
//             }));
//           }
//         }

//         await this.loadAll();
//       }
//     );
//   };

//   // ---------- 상단 필터 ----------
//   renderFilterBar = () => {
//     const { filters } = this.state;

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

//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 onClick={this.applyToday}
//                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
//               >
//                 오늘
//               </Button>

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
//             options={this.state.factories}
//             value={filters.factory || null}
//             onChange={(_, v) => this.handleFilterChange("factory", v || "")}
//             renderInput={(params) => <TextField {...params} label="공장" />}
//             clearOnEscape
//           />
//           <Autocomplete
//             size="small"
//             options={this.state.processes}
//             value={filters.process || null}
//             onChange={(_, v) => this.handleFilterChange("process", v || "")}
//             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
//             clearOnEscape
//           />
//           <Autocomplete
//             size="small"
//             options={this.state.equipments}
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
//                   {Boolean(filters.partNo) && (
//                     <IconButton
//                       size="small"
//                       aria-label="품번 선택해제"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         this.handleClearPart();
//                       }}
//                       sx={{ mr: 0.5 }}
//                     >
//                       <ClearIcon fontSize="small" />
//                     </IconButton>
//                   )}
//                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{
//               "& .MuiInputBase-root": {
//                 cursor: "pointer",
//                 "&:hover": { backgroundColor: "#f5f5f5" },
//               },
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
//               "& .MuiInputBase-root": {
//                 cursor: "pointer",
//                 "&:hover": { backgroundColor: "#f5f5f5" },
//               },
//             }}
//           />
//         </Box>

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
//               if (this._pendingTimer) clearTimeout(this._pendingTimer);
//               this.loadOptions();
//               this.loadAll();
//             }}
//           >
//             검색
//           </Button>
//           <Button
//             variant="outlined"
//             startIcon={<DownloadIcon />}
//             size="large"
//             onClick={this.exportCsv}
//             disabled={!this.state.filters.partNo}
//           >
//             CSV 내보내기
//           </Button>
//         </Box>

//         <InspectionItemModal
//           open={this.state.itemCodeModalOpen}
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

//   /** 선택 일자의 Xn 표 */
//   renderDailyTable = () => {
//     const {
//       dailyCols,
//       dailyTables,
//       dailyShifts,
//       dailyWorkHeaders,
//       selectedDay,
//       loadingDaily,
//       filters,
//       specColWidth,
//     } = this.state;

//     if (!filters.partNo) {
//       return (
//         <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
//           <Box className={s.sectionHeader}>
//             <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//               작업순번(Xn) 결과표 — 주/야/작업구분
//             </Typography>
//           </Box>
//           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
//         </Paper>
//       );
//     }

//     const rawRows = selectedDay ? dailyTables[selectedDay] || [] : [];
//     const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

//     const partText = filters.partNo ? filters.partNo : "전체 품번";
//     const itemText = filters.item || "";
//     const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

//     const tableMinW = calcTableMinWidth(dailyCols.length, dailyShifts.length, specColWidth);

//     return (
//       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             작업순번(Xn) 결과표 — 주/야/작업구분
//           </Typography>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
//             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
//             <Chip size="small" label={partText} />
//             {itemText && <Chip size="small" variant="outlined" label={itemText} />}
//             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
//             <Chip size="small" label={rangeText} />
//             {selectedDay && (
//               <>
//                 <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>보고일</Typography>
//                 <Chip size="small" color="primary" variant="outlined" label={selectedDay} />
//               </>
//             )}
//           </Box>
//         </Box>

//         {loadingDaily ? (
//           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
//             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
//           </Box>
//         ) : (
//           <Box
//             sx={{
//               maxHeight: 800,
//               overflow: "auto",
//               borderRadius: 1,
//               "& table": {
//                 width: "100%",
//                 borderCollapse: "separate",
//                 borderSpacing: 0,
//                 tableLayout: "fixed",
//                 minWidth: tableMinW,
//               },
//               "& th, & td": {
//                 padding: "8px 10px",
//                 borderBottom: "1px solid #eceff1",
//                 fontSize: 13,
//                 whiteSpace: "nowrap",
//                 overflow: "hidden",
//                 textOverflow: "ellipsis",
//                 height: 40,
//                 lineHeight: "24px",
//                 verticalAlign: "middle",
//               },
//               "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
//               "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
//             }}
//           >
//             <table>
//               <thead>
//                 <tr>
//                   <th style={{ width: COL_W.no, textAlign: "center" }} rowSpan={3}>
//                     NO
//                   </th>
//                   <th style={{ width: COL_W.name }} rowSpan={3}>
//                     검사항목명
//                   </th>
//                   <th style={{ width: this.state.specColWidth }} rowSpan={3}>
//                     검사내용
//                   </th>
//                   {dailyShifts.map((s) => (
//                     <th key={s} colSpan={dailyCols.length} style={{ textAlign: "center" }}>
//                       {s || "전체"}
//                     </th>
//                   ))}
//                   <th rowSpan={3} style={{ width: COL_W.avg, textAlign: "right" }}>
//                     평균
//                   </th>
//                 </tr>
//                 <tr>
//                   {dailyShifts.map((s) =>
//                     dailyCols.map((c) => (
//                       <th key={`${s}-${c}`} style={{ width: COL_W.data, textAlign: "center" }}>
//                         {c}
//                       </th>
//                     ))
//                   )}
//                 </tr>
//                 <tr>
//                   {dailyShifts.map((s) =>
//                     dailyCols.map((c) => (
//                       <th
//                         key={`${s}-${c}-work`}
//                         style={{ width: COL_W.data, textAlign: "center", fontWeight: 600, color: "#607d8b" }}
//                         title={dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
//                       >
//                         {dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
//                       </th>
//                     ))
//                   )}
//                 </tr>
//               </thead>
//               <tbody>
//                 {rows.map((r, idx) => (
//                   <tr key={idx}>
//                     <td style={{ width: COL_W.no, textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
//                     <td style={{ width: COL_W.name }} title={r["검사항목명"] ?? ""}>
//                       {r["검사항목명"] ?? ""}
//                     </td>
//                     <td style={{ width: this.state.specColWidth }} title={r["검사내용"] ?? ""}>
//                       {r["검사내용"] ?? ""}
//                     </td>
//                     {dailyShifts.map((s) =>
//                       dailyCols.map((c) => (
//                         <td key={`${idx}-${s}-${c}`} style={{ width: COL_W.data, textAlign: "right" }}>
//                           {fmtNum(r?.[s]?.[c], 3)}
//                         </td>
//                       ))
//                     )}
//                     <td style={{ width: COL_W.avg, textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
//                   </tr>
//                 ))}
//                 {(!rows || rows.length === 0) && (
//                   <tr>
//                     <td colSpan={3 + dailyShifts.length * dailyCols.length + 1} style={{ textAlign: "center", padding: "32px 0" }}>
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

//   /** 선택 일자 기준 멀티라인 차트 데이터 */
//   buildChartDataForSelectedDay = () => {
//     const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
//     if (!selectedDay) return { seriesKeys: [], rows: [] };
//     const rowsSrc = dailyTables[selectedDay] || [];

//     const labelOf = (r) => {
//       const name = r["검사항목명"] ?? "";
//       const spec = r["검사내용"] ?? "";
//       return spec ? `${name} | ${spec}` : name;
//     };

//     const rows = dailyCols.map((x) => {
//       const row = { x };
//       rowsSrc.forEach((r) => {
//         const key = labelOf(r);
//         let sum = 0,
//           cnt = 0;
//         dailyShifts.forEach((s) => {
//           const v = r?.[s]?.[x];
//           if (v != null && v !== "") {
//             sum += Number(v);
//             cnt += 1;
//           }
//         });
//         row[key] = cnt > 0 ? sum / cnt : null;
//       });
//       return row;
//     });

//     const seriesKeys = rowsSrc.map((r) => labelOf(r));
//     return { seriesKeys, rows };
//   };

//   /** Xn 멀티라인 차트 (선택 일자) */
//   renderSelectedDayChart = () => {
//     const { loadingTrend, loadingDaily, selectedDay, filters } = this.state;

//     if (!filters.partNo) {
//       return (
//         <Paper className={s.section} style={{ marginTop: 16 }}>
//           <Box className={s.sectionHeader}>
//             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
//               검사항목별 Xn 흐름
//             </Typography>
//           </Box>
//           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
//         </Paper>
//       );
//     }

//     const { seriesKeys, rows } = this.buildChartDataForSelectedDay();

//     return (
//       <Paper className={s.section} style={{ marginTop: 16 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
//             {selectedDay ? `${selectedDay} — 검사항목별 Xn 흐름` : "검사항목별 Xn 흐름"}
//           </Typography>
//         </Box>

//         {loadingDaily ? (
//           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
//             <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
//           </Box>
//         ) : rows.length === 0 ? (
//           <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
//         ) : loadingTrend ? (
//           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
//             <CircularProgress size={44} sx={{ color: "#90caf9" }} />
//           </Box>
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

//   /** 숫자형(실측값) 검사항목 — 일자별 추이 차트 */
//   buildNumericTrendChart = () => {
//     const { numTrend } = this.state;
//     const dates = numTrend?.dates || [];
//     const series = numTrend?.series || [];
//     if (dates.length === 0 || series.length === 0) return { keys: [], rows: [] };
//     const rows = dates.map((d, i) => {
//       const o = { date: d };
//       series.forEach((s) => {
//         o[s.label] = s.data?.[i] != null ? Number(s.data[i]) : null;
//       });
//       return o;
//     });
//     const keys = series.map((s) => s.label);
//     return { keys, rows };
//   };

//   renderNumericTrendChart = () => {
//     const { loadingTrend, filters } = this.state;

//     if (!filters.partNo) {
//       return (
//         <Paper className={s.section} style={{ marginTop: 16 }}>
//           <Box className={s.sectionHeader}>
//             <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
//               숫자형 검사항목 — 일자별 실측값 추이
//             </Typography>
//           </Box>
//           <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
//         </Paper>
//       );
//     }

//     const { keys, rows } = this.buildNumericTrendChart();
//     return (
//       <Paper className={s.section} style={{ marginTop: 16 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
//             숫자형 검사항목 — 일자별 실측값 추이 (Top {filters.topN ?? 5})
//           </Typography>
//         </Box>
//         {loadingTrend ? (
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
//                 <XAxis dataKey="date" />
//                 <YAxis />
//                 <RTooltip />
//                 <Legend />
//                 {keys.map((k) => (
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
//     const { error, dailyList, selectedDay, loadingDaily } = this.state;

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

//         {/* 본문: 좌측 날짜 목록 + 우측 표/차트 */}
//         <Box className={s.dailyLayout}>
//           <Paper className={s.dayPanel}>
//             <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a", mb: 1 }}>보고일</Typography>

//             <Box className={s.dayList}>
//               <div className={s.dayListHead}>
//                 <span>보고일</span>
//                 <span>설비</span>
//                 <span>품번</span>
//               </div>
//               <div className={s.dayListBody}>
//                 {loadingDaily ? (
//                   <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6, color: "#90a4ae" }}>
//                     <CircularProgress size={28} sx={{ mr: 1, color: "#ff8f00" }} />
//                     로딩 중...
//                   </Box>
//                 ) : dailyList.length > 0 ? (
//                   dailyList.map((row) => (
//                     <div
//                       key={row.d}
//                       className={`${s.dayRow} ${selectedDay === row.d ? s.active : ""}`}
//                       onClick={() => this.handleDayClick(row)}
//                       title="클릭 시 상단 설비/품번/품명이 자동 반영됩니다"
//                     >
//                       <span>{row.d}</span>
//                       <span>{row.equipment || "-"}</span>
//                       <span>{row.partNo || "-"}</span>
//                     </div>
//                   ))
//                 ) : (
//                   <div className={s.dayEmpty}>기간/필터 조건에 해당하는 결과가 없습니다.</div>
//                 )}
//               </div>
//             </Box>
//           </Paper>

//           <Box className={s.rightArea}>
//             {this.renderDailyTable()}
//             {this.renderSelectedDayChart()}
//             {this.renderNumericTrendChart()}
//           </Box>
//         </Box>
//       </Box>
//     );
//   }
// }

// export default InspectionSystemChart;

// src/pages/inspection/InspectionSystemChart.js
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
  if (v === null || v === undefined || v === "") return "";
  const n = Number(v);
  if (Number.isNaN(n)) return String(v);
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

/** 기본 필터 */
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

/** ---- 표 틀 고정용 기본 폭 정의 ---- */
const COL_W = { no: 64, name: 180, specBase: 320, data: 96, avg: 100 };
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const calcTableMinWidth = (colsLen, shiftsLen, specW) =>
  COL_W.no + COL_W.name + specW + (colsLen || 0) * (shiftsLen || 0) * COL_W.data + COL_W.avg;

/** ----- 정렬 유틸 ----- */
const firstSeqIndex = (row, cols, shifts) => {
  for (let i = 0; i < cols.length; i += 1) {
    const c = cols[i];
    for (const s of shifts) {
      const v = row?.[s]?.[c];
      if (v !== null && v !== undefined && v !== "") return i + 1;
    }
  }
  return Number.MAX_SAFE_INTEGER;
};
const getInspectionSeq = (row, cols, shifts) => {
  const raw = row?.["검사순번"];
  const n = Number(raw);
  if (raw !== undefined && raw !== null && !Number.isNaN(n)) return n;
  return firstSeqIndex(row, cols, shifts);
};
const sortRowsByInspectionSeqAsc = (rows, cols, shifts) =>
  [...rows].sort((a, b) => {
    const ia = getInspectionSeq(a, cols, shifts);
    const ib = getInspectionSeq(b, cols, shifts);
    if (ia !== ib) return ia - ib;
    const an = (a["검사항목명"] || "").localeCompare(b["검사항목명"] || "");
    if (an !== 0) return an;
    return (a["검사내용"] || "").localeCompare(b["검사내용"] || "");
  });

/** ---- 간단 LRU 캐시 ---- */
class Lru {
  constructor(limit = 8) {
    this.limit = limit;
    this.map = new Map();
  }
  get(k) {
    if (!this.map.has(k)) return undefined;
    const v = this.map.get(k);
    this.map.delete(k);
    this.map.set(k, v);
    return v;
  }
  set(k, v) {
    if (this.map.has(k)) this.map.delete(k);
    this.map.set(k, v);
    if (this.map.size > this.limit) {
      const first = this.map.keys().next().value;
      this.map.delete(first);
    }
  }
}
const keyOf = (filters) => {
  const {
    start_date,
    end_date,
    factory,
    process,
    equipment,
    partNo,
    inspType,
    workType,
    shiftType,
    topN,
  } = filters || {};
  return JSON.stringify({ start_date, end_date, factory, process, equipment, partNo, inspType, workType, shiftType, topN });
};

// 문자열 정규화
const norm = (v) => String(v ?? "").trim();

class InspectionSystemChart extends Component {
  state = {
    filters: getDefaultFilters(),

    // 보고일/표 데이터
    dailyCols: [],
    dailyDays: [],
    dailyList: [],
    dailyTables: {},
    dailyShifts: [],
    dailyWorkHeaders: {},
    selectedDay: null,

    // 숫자형 추이
    numTrend: { dates: [], series: [] },

    // 옵션
    factories: [],
    processes: [],
    equipments: [],
    parts: [],
    items: [],
    optionsLoading: false,

    // UI 로딩 플래그(분리)
    loadingDaily: false, // 보고일 목록 + 표 데이터
    loadingTrend: false, // 숫자형 추이
    error: "",
    filterExpanded: false,

    // 프리셋 상태/앵커
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    yearAnchorPos: null,
    monthAnchorPos: null,
    weekAnchorPos: null,

    years: [],

    // 모달
    itemCodeModalOpen: false,

    // 동적 "검사내용" 폭(px)
    specColWidth: COL_W.specBase,
  };

  // ==== 상태 플래그 ====
  _hadSavedFilters = false; // 저장된 필터가 있었는지

  // ==== 성능 ====
  _runId = 0;
  _pendingTimer = null;
  _controllers = new Set();

  // ==== 캐시 ====
  _dailyCache = new Lru(6);
  _trendCache = new Lru(6);
  _optionsCache = new Lru(6);

  // ==== 측정용 canvas ====
  _measureCtx = null;
  getMeasureCtx = () => {
    if (typeof document === "undefined") return null;
    if (!this._measureCtx) {
      const canvas = document.createElement("canvas");
      this._measureCtx = canvas.getContext("2d");
    }
    return this._measureCtx;
  };
  measureTextPx = (text) => {
    const ctx = this.getMeasureCtx();
    const font = '13px "Noto Sans KR", Roboto, Apple SD Gothic Neo, Arial, sans-serif';
    if (!ctx) return String(text ?? "").length * 12;
    ctx.font = font;
    return ctx.measureText(String(text ?? "")).width;
  };
  computeSpecWidthFromRows = (rows) => {
    let longestPx = this.measureTextPx("검사내용");
    const addPad = 36;
    const minPx = COL_W.specBase;
    const hardMaxPx = 720;
    (rows || []).forEach((r) => {
      const px = this.measureTextPx(r?.["검사내용"]);
      if (px > longestPx) longestPx = px;
    });
    return clamp(Math.ceil(longestPx) + addPad, minPx, hardMaxPx);
  };

  componentDidMount() {
    const base = getDefaultFilters();
    const saved = localStorage.getItem("inspectionFilters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...base, ...parsed };
        merged.factory = merged.factory || base.factory;
        merged.process = merged.process || base.process;
        merged.equipment = merged.equipment || base.equipment;
        this._hadSavedFilters = true;
        this.setState({ filters: merged });
      } catch {
        this.setState({ filters: base });
      }
    } else {
      this.setState({ filters: base });
    }
    this.bootstrap();
  }

  componentDidUpdate(_, prevState) {
    if (this.state.selectedDay !== prevState.selectedDay) {
      const rows = this.state.dailyTables?.[this.state.selectedDay] || [];
      const w = this.computeSpecWidthFromRows(rows);
      if (w !== this.state.specColWidth) this.setState({ specColWidth: w });
    }
  }

  /** --------- API ---------- */
  _abortAll = () => {
    for (const c of this._controllers) try { c.abort(); } catch {}
    this._controllers.clear();
  };
  post = async (path, body) => {
    const controller = new AbortController();
    this._controllers.add(controller);
    try {
      const headers = { "Content-Type": "application/json" };
      const res = await fetch(
        `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_chart${path}`,
        { method: "POST", headers, body: JSON.stringify(body || {}), signal: controller.signal }
      );
      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
      }
      const json = await res.json();
      return json.data || [];
    } finally {
      this._controllers.delete(controller);
    }
  };

  /** 모달 아이템 조회(정확 일치 우선, 품번과 같은 문자열은 무시) */
  fetchItemFromModal = async (partNo) => {
    const pn = norm(partNo);
    if (!pn) return "";
    try {
      const payload = {
        q: pn,
        exact: true,
        plant: this.state.filters.factory,
        worker: this.state.filters.process,
        line: this.state.filters.equipment,
        startDate: this.state.filters.start_date,
        endDate: this.state.filters.end_date,
      };

      const res = await fetch(
        `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_modal/item_list`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const json = await res.json().catch(() => null);
      const rows = Array.isArray(json?.data) ? json.data : [];

      const readPn = (o) =>
        o?.partNo ??
        o?.품목번호 ??
        o?.code ??
        o?.value ??
        o?.id ??
        o?.PART_NO ??
        o?.PartNo ??
        o?.품번 ??
        o?.itemCode;
      const readNm = (o) =>
        o?.item ??
        o?.itemName ??
        o?.품목명 ??
        o?.name ??
        o?.label ??
        o?.ITEM_NM ??
        o?.ItemName ??
        o?.품명 ??
        o?.part_nm;

      // 정확 일치 우선
      const exact = rows.find((r) => norm(readPn(r)) === pn);
      const nm = norm(exact ? readNm(exact) : rows.length ? readNm(rows[0]) : "");
      // 품번과 완전히 같은 문자열이면 품명으로 사용하지 않음
      if (nm && nm !== pn) return nm;
      return "";
    } catch {
      return "";
    }
  };

  /** ✅ DB 최신 보고일의 "달"을 기본 기간으로 세팅(상태 업데이트 완료 보장) */
  setDefaultToLatestMonthViaEndpoint = async (force = false) => {
    try {
      if (!force && this._hadSavedFilters) return false; // 저장된 필터 있으면 건드리지 않음

      const { filters } = this.state;
      const payload = {
        factory: filters.factory,
        process: filters.process,
        equipment: filters.equipment,
        partNo: "",
        item: "",
        inspectItem: "",
        inspType: filters.inspType,
        workType: filters.workType,
        shiftType: filters.shiftType,
      };
      const data = await this.post("/options/latest_month", payload);
      const start = data?.start, end = data?.end, year = data?.year, month = data?.month;

      if (start && end) {
        // setState 완료를 기다림
        await new Promise((resolve) => {
          this.setState(
            (prev) => ({
              selectedYear: year || prev.selectedYear,
              selectedMonth: month || prev.selectedMonth,
              filters: { ...prev.filters, start_date: start, end_date: end },
            }),
            () => {
              try {
                localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
              } catch {}
              resolve();
            }
          );
        });
        return true;
      }
      return false;
    } catch (e) {
      console.warn("setDefaultToLatestMonthViaEndpoint failed:", e);
      return false; // 실패 시 연간 기본값 유지
    }
  };

  bootstrap = async () => {
    await this.loadYears();
    // ✅ 최신 달 반영이 끝난 뒤 옵션/데이터 로딩
    await this.setDefaultToLatestMonthViaEndpoint(false);
    await this.loadOptions();
    await this.loadAll();
  };

  /** 옵션 로드 + 품명 보정 (캐시) */
  loadOptions = async () => {
    const runId = ++this._runId;
    const { filters } = this.state;
    const k = keyOf({ ...filters, partNo: "", topN: undefined });
    const cached = this._optionsCache.get(k);
    if (cached) {
      this.setState((prev) => {
        const filledName = this.getItemNameFromOptions(prev.filters.partNo, cached.parts, cached.items);
        const needFill = prev.filters.partNo && !prev.filters.item && filledName;
        const next = { ...cached, optionsLoading: false };
        if (needFill) next.filters = { ...prev.filters, item: filledName };
        return next;
      });
      return;
    }

    this.setState({ optionsLoading: true });
    try {
      const [factories, processes, equipments, parts, items] = await Promise.all([
        this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
        this.post("/options/processes", { ...filters }),
        this.post("/options/equipments", { ...filters }),
        this.post("/options/parts", { ...filters }),
        this.post("/options/items", { ...filters }),
      ]);
      if (runId !== this._runId) return;

      const payload = { factories, processes, equipments, parts, items };
      this._optionsCache.set(k, payload);

      this.setState((prev) => {
        const filledName = this.getItemNameFromOptions(prev.filters.partNo, parts, items);
        const needFill = prev.filters.partNo && !prev.filters.item && filledName;
        const next = { ...payload, optionsLoading: false };
        if (needFill) next.filters = { ...prev.filters, item: filledName };
        return next;
      });
    } catch (e) {
      console.error(e);
      this.setState({ optionsLoading: false });
    }
  };

  /** 연도 옵션 */
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

  /** 필터 변경 (200ms 디바운스) */
  handleFilterChange = (field, value) => {
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
        } else if (field === "topN") {
          f.topN = Number(value) || 5;
        }
        // 날짜 직접 변경 시에도 품번/품명 유지
        return { filters: f };
      },
      () => {
        if (this._pendingTimer) clearTimeout(this._pendingTimer);
        this._pendingTimer = setTimeout(async () => {
          await this.loadOptions();
          await this.loadAll();
        }, 200);
      }
    );
  };

  /** 날짜 프리셋/범위 */
  setDateRange = async (start, end) => {
    const start_date = iso(start);
    const end_date = iso(end);
    this.setState(
      (prev) => ({
        filters: { ...prev.filters, start_date, end_date },
      }),
      async () => {
        try {
          localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
        } catch {}
        await this.loadOptions();
        await this.loadAll();
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

  /** 전체 초기화 → DB 최신 달로 */
  resetToThisYear = async () => {
    const base = getDefaultFilters();

    // 1) 먼저 상태 초기화 완료를 기다림
    await new Promise((resolve) => {
      this.setState(
        {
          filters: { ...base },
          selectedYear: new Date().getFullYear(),
          selectedMonth: new Date().getMonth() + 1,
        },
        () => {
          try {
            localStorage.removeItem("inspectionFilters");
          } catch {}
          this._hadSavedFilters = false; // 저장된 필터 삭제로 간주
          resolve();
        }
      );
    });

    // 2) 옵션 로드 → 최신 달 강제 세팅(상태 반영 대기) → 데이터 로드
    await this.loadOptions();
    await this.setDefaultToLatestMonthViaEndpoint(true);
    await this.loadAll();
  };

  /** 데이터 로드 (캐시 + 단계적 로딩: daily 먼저, trend 나중) */
  loadAll = async () => {
    const runId = ++this._runId;
    this._abortAll();

    const { filters } = this.state;
    try {
      localStorage.setItem("inspectionFilters", JSON.stringify(filters));
    } catch {}

    // --- DAILY ---
    this.setState({ loadingDaily: true, error: "" });

    const dailyKey = `daily:${keyOf(filters)}`;
    const cachedDaily = this._dailyCache.get(dailyKey);
    let daily;
    try {
      if (cachedDaily) {
        daily = cachedDaily;
      } else {
        daily = await this.post("/xn_daily", filters);
        this._dailyCache.set(dailyKey, daily);
      }
    } catch (e) {
      console.error(e);
      if (runId === this._runId) this.setState({ error: "데일리 데이터를 불러오지 못했습니다.", loadingDaily: false });
      return;
    }
    if (runId !== this._runId) return;

    const cols = daily?.cols || [];
    const days = daily?.days || [];
    const tables = daily?.tables || {};
    const shifts = daily?.shifts || [];
    const workHeaders = daily?.workHeaders || {};
    const dayList = daily?.dayList || (days || []).map((d) => ({ d, equipment: "", partNo: "" }));

    const firstDay = dayList?.[0]?.d || days?.[0] || null;
    const nextSelected = this.state.selectedDay ?? firstDay;

    const specColWidth = this.computeSpecWidthFromRows(tables?.[nextSelected] || []);

    this.setState({
      dailyCols: cols,
      dailyDays: days,
      dailyList: dayList,
      dailyTables: tables,
      dailyShifts: shifts,
      dailyWorkHeaders: workHeaders,
      selectedDay: nextSelected,
      specColWidth,
      loadingDaily: false,
    });

    // --- NUMERIC TREND ---
    if (!filters.partNo) {
      this.setState({ numTrend: { dates: [], series: [] }, loadingTrend: false });
      return;
    }

    this.setState({ loadingTrend: true });
    const trendKey = `trend:${keyOf(filters)}`;
    try {
      const numeric =
        this._trendCache.get(trendKey) || (await this.post("/numeric_trend", filters));
      this._trendCache.set(trendKey, numeric);
      if (runId !== this._runId) return;
      this.setState({ numTrend: numeric || { dates: [], series: [] }, loadingTrend: false });
    } catch (e) {
      console.error(e);
      if (runId === this._runId) this.setState({ loadingTrend: false });
    }
  };

  /** CSV 내보내기 */
  exportCsv = () => {
    const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
    if (!selectedDay) return;
    const rawRows = dailyTables[selectedDay] || [];
    const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

    const headLeft = ["NO", "검사항목명", "검사내용"];
    const headMid = dailyShifts.flatMap((s) => dailyCols.map((c) => `${s}-${c}`));
    const header = [...headLeft, ...headMid, "평균"];

    const csvRows = [
      header,
      ...rows.map((r, idx) => {
        const vals = dailyShifts.flatMap((s) => dailyCols.map((c) => r?.[s]?.[c] ?? ""));
        return [String(idx + 1), r["검사항목명"] ?? "", r["검사내용"] ?? "", ...vals, r["평균"] ?? ""];
      }),
    ];
    const csv = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `xn_daily_${selectedDay}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  /** 품번/품명 모달 */
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

  /** 품번 선택 해제 */
  handleClearPart = () => {
    this.setState(
      (prev) => ({ filters: { ...prev.filters, partNo: "", item: "" } }),
      () => {
        this.loadOptions();
        this.loadAll();
      }
    );
  };

  /** partNo → item(품명) 추론 (옵션 배열 사용) */
  getItemNameFromOptions = (partNo, parts = this.state.parts, items = this.state.items) => {
    const pn = norm(partNo);
    if (!pn) return "";
    const readPn = (o) =>
      typeof o === "string"
        ? o
        : (o?.partNo ??
          o?.품목번호 ??
          o?.code ??
          o?.value ??
          o?.id ??
          o?.PART_NO ??
          o?.PartNo ??
          o?.품번 ??
          o?.itemCode);
    const readNm = (o) =>
      typeof o === "string"
        ? o
        : (o?.item ??
          o?.itemName ??
          o?.품목명 ??
          o?.name ??
          o?.label ??
          o?.ITEM_NM ??
          o?.ItemName ??
          o?.품명 ??
          o?.part_nm);

    for (const it of parts || []) {
      if (norm(readPn(it)) === pn) {
        const nm = norm(readNm(it));
        if (nm && nm !== pn) return nm;
      }
    }
    for (const it of items || []) {
      if (norm(readPn(it)) === pn) {
        const nm = norm(readNm(it));
        if (nm && nm !== pn) return nm;
      }
    }
    return "";
  };

  /** dayList 행에서 품명 후보 추론 → 옵션으로 보정 */
  resolveItemNameFromRow = (row, partNo) => {
    const pn = norm(partNo);
    const cands = [
      row?.item, row?.itemName, row?.partName, row?.품목명,
      row?.item_label, row?.name, row?.label, row?.품명, row?.part_nm,
    ].map(norm).filter((v) => v && v !== pn && v !== "-");
    if (cands.length) return cands[0];
    return this.getItemNameFromOptions(pn);
  };

  /** 보고일 클릭 → 설비/품번(+품명) 자동 반영 + 모달로 최종 보정 */
  handleDayClick = async (row) => {
    const { d, equipment, partNo } = row || {};
    const { filters } = this.state;

    // 동일 조건이면 날짜만 갱신
    if ((equipment || filters.equipment) === filters.equipment && (partNo || "") === (filters.partNo || "")) {
      this.setState({ selectedDay: d });
      return;
    }

    // 1차: row/옵션에서 품명 후보
    const preItem = this.resolveItemNameFromRow(row, partNo || "");
    this.setState(
      (prev) => ({
        selectedDay: d,
        filters: {
          ...prev.filters,
          equipment: equipment || prev.filters.equipment,
          partNo: partNo || "",
          item: preItem || "",
        },
      }),
      async () => {
        // 2차: 옵션 재적재(보정 가능)
        await this.loadOptions();

        // 3차: 모달 API에서 최종 보정 (비었거나 '-' 또는 품번과 동일하게 들어온 경우)
        const curPn = norm(this.state.filters.partNo);
        const curItem = norm(this.state.filters.item);
        if (curPn && (!curItem || curItem === "-" || curItem === curPn)) {
          const modalName = await this.fetchItemFromModal(curPn);
          if (modalName) {
            this.setState((prev) => ({ filters: { ...prev.filters, item: modalName } }));
          } else {
            // 옵션에서 마지막 시도
            const fixed = this.getItemNameFromOptions(curPn);
            const finalNm = norm(fixed);
            this.setState((prev) => ({
              filters: { ...prev.filters, item: finalNm && finalNm !== curPn ? finalNm : "" },
            }));
          }
        }

        await this.loadAll();
      }
    );
  };

  // ---------- 상단 필터 ----------
  renderFilterBar = () => {
    const { filters } = this.state;

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

              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={this.applyToday}
                sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
              >
                오늘
              </Button>

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
            options={this.state.factories}
            value={filters.factory || null}
            onChange={(_, v) => this.handleFilterChange("factory", v || "")}
            renderInput={(params) => <TextField {...params} label="공장" />}
            clearOnEscape
          />
          <Autocomplete
            size="small"
            options={this.state.processes}
            value={filters.process || null}
            onChange={(_, v) => this.handleFilterChange("process", v || "")}
            renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
            clearOnEscape
          />
          <Autocomplete
            size="small"
            options={this.state.equipments}
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
                  {Boolean(filters.partNo) && (
                    <IconButton
                      size="small"
                      aria-label="품번 선택해제"
                      onClick={(e) => {
                        e.stopPropagation();
                        this.handleClearPart();
                      }}
                      sx={{ mr: 0.5 }}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                  <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiInputBase-root": {
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f5f5f5" },
              },
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
              "& .MuiInputBase-root": {
                cursor: "pointer",
                "&:hover": { backgroundColor: "#f5f5f5" },
              },
            }}
          />
        </Box>

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
              if (this._pendingTimer) clearTimeout(this._pendingTimer);
              this.loadOptions();
              this.loadAll();
            }}
          >
            검색
          </Button>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            size="large"
            onClick={this.exportCsv}
            disabled={!this.state.filters.partNo}
          >
            CSV 내보내기
          </Button>
        </Box>

        <InspectionItemModal
          open={this.state.itemCodeModalOpen}
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

  /** 선택 일자의 Xn 표 */
  renderDailyTable = () => {
    const {
      dailyCols,
      dailyTables,
      dailyShifts,
      dailyWorkHeaders,
      selectedDay,
      loadingDaily,
      filters,
      specColWidth,
    } = this.state;

    if (!filters.partNo) {
      return (
        <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <Box className={s.sectionHeader}>
            <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
              작업순번(Xn) 결과표 — 주/야/작업구분
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
        </Paper>
      );
    }

    const rawRows = selectedDay ? dailyTables[selectedDay] || [] : [];
    const rows = sortRowsByInspectionSeqAsc(rawRows, dailyCols, dailyShifts);

    const partText = filters.partNo ? filters.partNo : "전체 품번";
    const itemText = filters.item || "";
    const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

    const tableMinW = calcTableMinWidth(dailyCols.length, dailyShifts.length, specColWidth);

    return (
      <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            작업순번(Xn) 결과표 — 주/야/작업구분
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
            <Chip size="small" label={partText} />
            {itemText && <Chip size="small" variant="outlined" label={itemText} />}
            <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
            <Chip size="small" label={rangeText} />
            {selectedDay && (
              <>
                <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>보고일</Typography>
                <Chip size="small" color="primary" variant="outlined" label={selectedDay} />
              </>
            )}
          </Box>
        </Box>

        {loadingDaily ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
            <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
          </Box>
        ) : (
          <Box
            sx={{
              maxHeight: 800,
              overflow: "auto",
              borderRadius: 1,
              "& table": {
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: 0,
                tableLayout: "fixed",
                minWidth: tableMinW,
              },
              "& th, & td": {
                padding: "8px 10px",
                borderBottom: "1px solid #eceff1",
                fontSize: 13,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                height: 40,
                lineHeight: "24px",
                verticalAlign: "middle",
              },
              "& th": { position: "sticky", top: 0, background: "#fafafa", zIndex: 1, fontWeight: 900, color: "#37474f" },
              "& tbody tr:nth-of-type(odd)": { backgroundColor: "#fcfcfc" },
            }}
          >
            <table>
              <thead>
                <tr>
                  <th style={{ width: COL_W.no, textAlign: "center" }} rowSpan={3}>
                    NO
                  </th>
                  <th style={{ width: COL_W.name }} rowSpan={3}>
                    검사항목명
                  </th>
                  <th style={{ width: this.state.specColWidth }} rowSpan={3}>
                    검사내용
                  </th>
                  {dailyShifts.map((s) => (
                    <th key={s} colSpan={dailyCols.length} style={{ textAlign: "center" }}>
                      {s || "전체"}
                    </th>
                  ))}
                  <th rowSpan={3} style={{ width: COL_W.avg, textAlign: "right" }}>
                    평균
                  </th>
                </tr>
                <tr>
                  {dailyShifts.map((s) =>
                    dailyCols.map((c) => (
                      <th key={`${s}-${c}`} style={{ width: COL_W.data, textAlign: "center" }}>
                        {c}
                      </th>
                    ))
                  )}
                </tr>
                <tr>
                  {dailyShifts.map((s) =>
                    dailyCols.map((c) => (
                      <th
                        key={`${s}-${c}-work`}
                        style={{ width: COL_W.data, textAlign: "center", fontWeight: 600, color: "#607d8b" }}
                        title={dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
                      >
                        {dailyWorkHeaders?.[selectedDay]?.[s]?.[c] || ""}
                      </th>
                    ))
                  )}
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={idx}>
                    <td style={{ width: COL_W.no, textAlign: "center", fontWeight: 700 }}>{idx + 1}</td>
                    <td style={{ width: COL_W.name }} title={r["검사항목명"] ?? ""}>
                      {r["검사항목명"] ?? ""}
                    </td>
                    <td style={{ width: this.state.specColWidth }} title={r["검사내용"] ?? ""}>
                      {r["검사내용"] ?? ""}
                    </td>
                    {dailyShifts.map((s) =>
                      dailyCols.map((c) => (
                        <td key={`${idx}-${s}-${c}`} style={{ width: COL_W.data, textAlign: "right" }}>
                          {fmtNum(r?.[s]?.[c], 3)}
                        </td>
                      ))
                    )}
                    <td style={{ width: COL_W.avg, textAlign: "right", fontWeight: 700 }}>{fmtNum(r["평균"], 3)}</td>
                  </tr>
                ))}
                {(!rows || rows.length === 0) && (
                  <tr>
                    <td colSpan={3 + dailyShifts.length * dailyCols.length + 1} style={{ textAlign: "center", padding: "32px 0" }}>
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

  /** 선택 일자 기준 멀티라인 차트 데이터 */
  buildChartDataForSelectedDay = () => {
    const { dailyCols, dailyTables, dailyShifts, selectedDay } = this.state;
    if (!selectedDay) return { seriesKeys: [], rows: [] };
    const rowsSrc = dailyTables[selectedDay] || [];

    const labelOf = (r) => {
      const name = r["검사항목명"] ?? "";
      const spec = r["검사내용"] ?? "";
      return spec ? `${name} | ${spec}` : name;
    };

    const rows = dailyCols.map((x) => {
      const row = { x };
      rowsSrc.forEach((r) => {
        const key = labelOf(r);
        let sum = 0,
          cnt = 0;
        dailyShifts.forEach((s) => {
          const v = r?.[s]?.[x];
          if (v != null && v !== "") {
            sum += Number(v);
            cnt += 1;
          }
        });
        row[key] = cnt > 0 ? sum / cnt : null;
      });
      return row;
    });

    const seriesKeys = rowsSrc.map((r) => labelOf(r));
    return { seriesKeys, rows };
  };

  /** Xn 멀티라인 차트 (선택 일자) */
  renderSelectedDayChart = () => {
    const { loadingTrend, loadingDaily, selectedDay, filters } = this.state;

    if (!filters.partNo) {
      return (
        <Paper className={s.section} style={{ marginTop: 16 }}>
          <Box className={s.sectionHeader}>
            <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
              검사항목별 Xn 흐름
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
        </Paper>
      );
    }

    const { seriesKeys, rows } = this.buildChartDataForSelectedDay();

    return (
      <Paper className={s.section} style={{ marginTop: 16 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
            {selectedDay ? `${selectedDay} — 검사항목별 Xn 흐름` : "검사항목별 Xn 흐름"}
          </Typography>
        </Box>

        {loadingDaily ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
            <CircularProgress size={60} sx={{ color: "#ff8f00" }} />
          </Box>
        ) : rows.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 6, color: "#78909c" }}>데이터가 없습니다.</Box>
        ) : loadingTrend ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320 }}>
            <CircularProgress size={44} sx={{ color: "#90caf9" }} />
          </Box>
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

  /** 숫자형(실측값) 검사항목 — 일자별 추이 차트 */
  buildNumericTrendChart = () => {
    const { numTrend } = this.state;
    const dates = numTrend?.dates || [];
    const series = numTrend?.series || [];
    if (dates.length === 0 || series.length === 0) return { keys: [], rows: [] };
    const rows = dates.map((d, i) => {
      const o = { date: d };
      series.forEach((s) => {
        o[s.label] = s.data?.[i] != null ? Number(s.data[i]) : null;
      });
      return o;
    });
    const keys = series.map((s) => s.label);
    return { keys, rows };
  };

  renderNumericTrendChart = () => {
    const { loadingTrend, filters } = this.state;

    if (!filters.partNo) {
      return (
        <Paper className={s.section} style={{ marginTop: 16 }}>
          <Box className={s.sectionHeader}>
            <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
              숫자형 검사항목 — 일자별 실측값 추이
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center", py: 6, color: "#90a4ae", fontWeight: 700 }}>조회할 품번을 선택하세요</Box>
        </Paper>
      );
    }

    const { keys, rows } = this.buildNumericTrendChart();
    return (
      <Paper className={s.section} style={{ marginTop: 16 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: "#1e88e5", fontWeight: 800 }}>
            숫자형 검사항목 — 일자별 실측값 추이 (Top {filters.topN ?? 5})
          </Typography>
        </Box>
        {loadingTrend ? (
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
                <XAxis dataKey="date" />
                <YAxis />
                <RTooltip />
                <Legend />
                {keys.map((k) => (
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
    const { error, dailyList, selectedDay, loadingDaily } = this.state;

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

        {/* 본문: 좌측 날짜 목록 + 우측 표/차트 */}
        <Box className={s.dailyLayout}>
          <Paper className={s.dayPanel}>
            <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a", mb: 1 }}>보고일</Typography>

            <Box className={s.dayList}>
              <div className={s.dayListHead}>
                <span>보고일</span>
                <span>설비</span>
                <span>품번</span>
              </div>
              <div className={s.dayListBody}>
                {loadingDaily ? (
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6, color: "#90a4ae" }}>
                    <CircularProgress size={28} sx={{ mr: 1, color: "#ff8f00" }} />
                    로딩 중...
                  </Box>
                ) : dailyList.length > 0 ? (
                  dailyList.map((row) => (
                    <div
                      key={row.d}
                      className={`${s.dayRow} ${selectedDay === row.d ? s.active : ""}`}
                      onClick={() => this.handleDayClick(row)}
                      title="클릭 시 상단 설비/품번/품명이 자동 반영됩니다"
                    >
                      <span>{row.d}</span>
                      <span>{row.equipment || "-"}</span>
                      <span>{row.partNo || "-"}</span>
                    </div>
                  ))
                ) : (
                  <div className={s.dayEmpty}>기간/필터 조건에 해당하는 결과가 없습니다.</div>
                )}
              </div>
            </Box>
          </Paper>

          <Box className={s.rightArea}>
            {this.renderDailyTable()}
            {this.renderSelectedDayChart()}
            {this.renderNumericTrendChart()}
          </Box>
        </Box>
      </Box>
    );
  }
}

export default InspectionSystemChart;
