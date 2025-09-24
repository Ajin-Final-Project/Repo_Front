// // // import React, { Component } from "react";
// // // import { connect } from "react-redux";

// // // import {
// // //   Box, Paper, Typography, Grid, Card, CardContent, TextField, Button,
// // //   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
// // //   IconButton, Chip, InputAdornment, CardHeader, Divider, Collapse, Menu, MenuItem,
// // //   LinearProgress, CardActions, Stack, Tooltip
// // // } from "@mui/material";
// // // import { Autocomplete } from "@mui/material";
// // // import {
// // //   ResponsiveContainer, ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid,
// // //   Tooltip as RTooltip, Legend, Label, LabelList
// // // } from "recharts";
// // // import {
// // //   Search as SearchIcon,
// // //   Clear as ClearIcon,
// // //   ExpandMore as ExpandMoreIcon,
// // //   ExpandLess as ExpandLessIcon,
// // //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // //   TrendingUp,
// // //   Download as DownloadIcon,
// // // } from "@mui/icons-material";
// // // import { selectThemeHex, selectThemeKey } from '../../reducers/layout';

// // // import s from "./DefectProcessChart.module.scss";
// // // import config from "../../config";
// // // import InspectionItemModal from "../common/InspectionItemModal";

// // // /* ───────────────────────── 공용 유틸 ───────────────────────── */
// // // const fmtInt = (v) => (Number(v) || 0).toLocaleString();
// // // const fmtPct = (v, digits = 1) => v == null ? "—" : `${Number(v).toFixed(digits)}%`;

// // // /* 색/등급 */
// // // const gradeColor = (p) => {
// // //   if (p == null) return "default";
// // //   if (p >= 90) return "success";
// // //   if (p >= 70) return "warning";
// // //   return "error";
// // // };
// // // const waitColor = (p) => {
// // //   if (p == null) return "default";
// // //   if (p <= 10) return "success";
// // //   if (p <= 30) return "warning";
// // //   return "error";
// // // };

// // // /* ───────────────────────── 날짜/프리셋 ───────────────────────── */
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
// // //   const s = new Date(d);
// // //   s.setDate(d.getDate() + diff);
// // //   return new Date(s.getFullYear(), s.getMonth(), s.getDate());
// // // };
// // // const endOfWeek = (d) => {
// // //   const s = startOfWeek(d);
// // //   return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
// // // };
// // // const getWeeksOfMonth = (year, month) => {
// // //   const first = new Date(year, month - 1, 1);
// // //   const last = lastOfMonth(first);
// // //   let cur = startOfWeek(first);
// // //   const out = [];
// // //   let idx = 1;
// // //   while (cur <= last) {
// // //     const s = new Date(cur), e = endOfWeek(cur);
// // //     const clipS = new Date(Math.max(s, first));
// // //     const clipE = new Date(Math.min(e, last));
// // //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// // //     idx += 1;
// // //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// // //   }
// // //   return out;
// // // };

// // // /* ───────────────────────── 기본 필터 ───────────────────────── */
// // // const getDefaultFilters = () => {
// // //   const now = today0();
// // //   const start = new Date(now.getFullYear(), 0, 1);
// // //   return {
// // //     start_date: iso(start),
// // //     end_date: "", // 최신 work_date로 채움
// // //     factory: "아진산업-본사(경산)",
// // //     process: "프레스",
// // //     equipment: "1500T(E라인)",
// // //     partNo: "",
// // //     item: "",
// // //     defectType: "",
// // //     topN: 10,
// // //   };
// // // };

// // // function mapStateToProps(state) {
// // //   return {
// // //     themeHex: selectThemeHex(state),
// // //     themeKey: selectThemeKey(state),
// // //   };
// // // }

// // // /* ───────────────────────── 본문 ───────────────────────── */
// // // class DefectProcessChart extends Component {
// // //   state = {
// // //     /* 필터/옵션 */
// // //     filters: getDefaultFilters(),
// // //     factories: [],
// // //     processes: [],
// // //     equipments: [],
// // //     optionsLoading: false,

// // //     // 날짜 프리셋
// // //     selectedYear: new Date().getFullYear(),
// // //     selectedMonth: new Date().getMonth() + 1,
// // //     yearAnchorPos: null,
// // //     monthAnchorPos: null,
// // //     weekAnchorPos: null,
// // //     years: [],

// // //     // 모달
// // //     itemCodeModalOpen: false,

// // //     /* 기본 데이터 */
// // //     kpis: { good: 0, defect: 0, wait: 0, rwk: 0, scrap: 0, throughput: 0, defectRate: null, scrapRate: null, rwkRate: null, opMinutes: 0, opHours: 0, defectPerHour: null },
// // //     trend: [],

// // //     /* 리스트 & 집계 */
// // //     defectRows: [],
// // //     defectLoading: false,
// // //     itemSummary: [],           // [{itemCode, itemName, defect, days, dailyAvg, waitRatio, solveRatio}]
// // //     itemTopTypes: {},          // {itemCode: [{type, defect, waitRatio, solveRatio}]}
// // //     selectedItemCode: null,

// // //     /* UI */
// // //     loading: false,
// // //     error: "",
// // //     filterExpanded: false,
// // //   };

// // //   /* ===== 서버 호출 공통 ===== */
// // //   postGrid = async (path, body) => {
// // //     const headers = { "Content-Type": "application/json" };
// // //     const url = `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_grid${path}`;
// // //     const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body || {}) });
// // //     if (!res.ok) {
// // //       const t = await res.text().catch(() => "");
// // //       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// // //     }
// // //     const json = await res.json();
// // //     return json.data || [];
// // //   };

// // //   mapToDefectListReq = (f) => {
// // //     const todayIso = new Date().toLocaleDateString("sv-SE");
// // //     const start = f.start_date || undefined;
// // //     const end = f.end_date || f.start_date || todayIso;
// // //     const itemInfo = f.partNo && String(f.partNo).trim() ? String(f.partNo).trim() : undefined;
// // //     return {
// // //       start_work_date: start,
// // //       end_work_date: end,
// // //       plant: f.factory || undefined,
// // //       workplace: f.process || undefined,
// // //       line: f.equipment || undefined,
// // //       itemInfo, // 품번 완전일치
// // //       defectType: f.defectType || undefined,
// // //     };
// // //   };

// // //   mapToDefectReq = (f) => {
// // //     const todayIso = new Date().toLocaleDateString("sv-SE");
// // //     const itemCode = (f.partNo && String(f.partNo).trim()) ? String(f.partNo).trim() : undefined;
// // //     const itemName = (f.item && String(f.item).trim()) ? String(f.item).trim() : undefined;
// // //     return {
// // //       start_date: f.start_date || undefined,
// // //       end_date: f.end_date || f.start_date || todayIso,
// // //       plant: f.factory || undefined,
// // //       workplace: f.process || undefined,
// // //       line: f.equipment || undefined,
// // //       defectType: f.defectType || undefined,
// // //       topN: f.topN || 10,
// // //       itemCode,
// // //       itemName,
// // //       itemInfo: itemCode,
// // //     };
// // //   };

// // //   /* ===== 초기 부팅 ===== */
// // //   async componentDidMount() {
// // //     const saved = localStorage.getItem("defectFilters");
// // //     if (saved) {
// // //       try {
// // //         const parsed = JSON.parse(saved);
// // //         this.setState({ filters: { ...this.state.filters, ...parsed } });
// // //       } catch {}
// // //     }
// // //     await this.bootstrap();
// // //   }

// // //   bootstrap = async () => {
// // //     await this.loadYears();
// // //     await this.ensureDefaultDbLastDate();
// // //     await this.loadOptions();
// // //     await this.loadAll();
// // //   };

// // //   loadYears = async () => {
// // //     const y = new Date().getFullYear();
// // //     this.setState({ years: [y, y - 1, y - 2, y - 3, y - 4], selectedYear: y });
// // //   };

// // //   ensureDefaultDbLastDate = async () => {
// // //     const { filters } = this.state;
// // //     if (filters.end_date) return;

// // //     const todayIso = new Date().toLocaleDateString("sv-SE");
// // //     let endDate = "";

// // //     try {
// // //       const lastDate = await this.postGrid("/options/latest_date", {});
// // //       if (typeof lastDate === "string" && lastDate.trim()) {
// // //         endDate = lastDate.trim();
// // //       }
// // //     } catch (e) {
// // //       console.warn("최신 날짜 조회 실패, 보정값 사용:", e?.message || e);
// // //     }
// // //     if (!endDate) endDate = filters.start_date || todayIso;

// // //     this.setState(
// // //       (prev) => ({ filters: { ...prev.filters, end_date: endDate } }),
// // //       () => {
// // //         try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
// // //       }
// // //     );
// // //   };

// // //   /** 옵션 로드(검사 그리드 옵션 API 재사용) */
// // //   loadOptions = async () => {
// // //     const { filters } = this.state;
// // //     this.setState({ optionsLoading: true });
// // //     try {
// // //       const reqBase = {
// // //         start_work_date: filters.start_date || undefined,
// // //         end_work_date: filters.end_date || undefined,
// // //         plant: filters.factory || undefined,
// // //         process: filters.process || undefined,
// // //         equipment: filters.equipment || undefined,
// // //       };
// // //       const [factories, processes, equipments] = await Promise.all([
// // //         this.postGrid("/options/plants", { start_work_date: reqBase.start_work_date, end_work_date: reqBase.end_work_date }),
// // //         this.postGrid("/options/processes", { ...reqBase }),
// // //         this.postGrid("/options/equipments", { ...reqBase }),
// // //       ]);

// // //       const fixed = { ...filters };
// // //       if (fixed.factory && factories.length && !factories.includes(fixed.factory)) fixed.factory = "";
// // //       if (fixed.process && processes.length && !processes.includes(fixed.process)) fixed.process = "";
// // //       if (fixed.equipment && equipments.length && !equipments.includes(fixed.equipment)) fixed.equipment = "";

// // //       this.setState({
// // //         factories, processes, equipments, optionsLoading: false, filters: fixed,
// // //       });
// // //     } catch (e) {
// // //       console.error(e);
// // //       this.setState({ optionsLoading: false });
// // //     }
// // //   };

// // //   /** 필터 변경 */
// // //   handleFilterChange = async (field, value) => {
// // //     this.setState(
// // //       (prev) => {
// // //         const f = { ...prev.filters, [field]: value };
// // //         if (field === "factory") {
// // //           f.process = ""; f.equipment = ""; f.partNo = ""; f.item = "";
// // //         } else if (field === "process") {
// // //           f.equipment = ""; f.partNo = ""; f.item = "";
// // //         } else if (field === "equipment") {
// // //           f.partNo = ""; f.item = "";
// // //         } else if (field === "topN") {
// // //           f.topN = Number(value) || 10;
// // //         }
// // //         return { filters: f, selectedItemCode: null };
// // //       },
// // //       async () => {
// // //         try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
// // //         await this.loadOptions();
// // //         await this.loadAll();
// // //       }
// // //     );
// // //   };

// // //   /** 기간 */
// // //   setDateRange = async (start, end) => {
// // //     const start_date = start ? iso(start) : "";
// // //     const end_date = end ? iso(end) : "";
// // //     this.setState(
// // //       (prev) => ({ filters: { ...prev.filters, start_date, end_date }, selectedItemCode: null }),
// // //       async () => {
// // //         try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
// // //         await this.loadOptions();
// // //         await this.loadAll();
// // //       }
// // //     );
// // //   };
// // //   applyToday = () => {
// // //     const t = today0();
// // //     this.setDateRange(t, t);
// // //   };
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
// // //   resetToAll = async () => {
// // //     const filters = getDefaultFilters();
// // //     this.setState(
// // //       { filters, selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1, selectedItemCode: null },
// // //       async () => {
// // //         try { localStorage.removeItem("defectFilters"); } catch {}
// // //         await this.ensureDefaultDbLastDate();
// // //         await this.loadOptions();
// // //         await this.loadAll();
// // //       }
// // //     );
// // //   };

// // //   /** 모달 선택 */
// // //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// // //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// // //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// // //     this.setState(
// // //       (prev) => ({
// // //         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
// // //         itemCodeModalOpen: false,
// // //         selectedItemCode: 품목번호 || null,
// // //       }),
// // //       async () => {
// // //         await this.loadAll();
// // //       }
// // //     );
// // //   };

// // //   /* =============== 데이터 로드 =============== */
// // //   loadAll = async () => {
// // //     const { filters } = this.state;
// // //     this.setState({ loading: true, error: "" });
// // //     try {
// // //       const headers = { "Content-Type": "application/json" };
// // //       const body = JSON.stringify(this.mapToDefectReq(filters));

// // //       // 기본 KPI/추이
// // //       const [kpisRes, trendRes] = await Promise.all([
// // //         fetch(`${config.baseURLApi}/smartFactory/defect_chart/kpis`,  { method: "POST", headers, body }),
// // //         fetch(`${config.baseURLApi}/smartFactory/defect_chart/trend`, { method: "POST", headers, body }),
// // //       ]);
// // //       if (!kpisRes.ok || !trendRes.ok) throw new Error("차트 API 오류");

// // //       const kpisJson  = await kpisRes.json();
// // //       const trendJson = await trendRes.json();

// // //       const trendArr = Array.isArray(trendJson?.data) ? trendJson.data : [];

// // //       const safeKpis = {
// // //         ...this.state.kpis,
// // //         ...(kpisJson.data || {}),
// // //         defectRate: typeof kpisJson?.data?.defectRate === "number" ? kpisJson.data.defectRate : null,
// // //         scrapRate:  typeof kpisJson?.data?.scrapRate  === "number" ? kpisJson.data.scrapRate  : null,
// // //         rwkRate:    typeof kpisJson?.data?.rwkRate    === "number" ? kpisJson.data.rwkRate    : null,
// // //         defectPerHour: typeof kpisJson?.data?.defectPerHour === "number" ? kpisJson.data.defectPerHour : null,
// // //       };

// // //       // 리스트
// // //       await this.loadDefectList();

// // //       this.setState({
// // //         kpis: safeKpis,
// // //         trend: trendArr,
// // //         loading: false,
// // //       });
// // //     } catch (e) {
// // //       console.error(e);
// // //       this.setState({ error: "데이터를 불러오지 못했습니다.", loading: false });
// // //       await this.loadDefectList(); // 리스트는 시도
// // //     }
// // //   };

// // //   // 불량 리스트 로드 + 집계 생성
// // //   loadDefectList = async () => {
// // //     const { filters } = this.state;
// // //     this.setState({ defectLoading: true });

// // //     try {
// // //       const headers = { "Content-Type": "application/json" };
// // //       const baseReq = this.mapToDefectListReq(filters);

// // //       const todayIso = new Date().toLocaleDateString("sv-SE");
// // //       const bodyObj = {
// // //         ...baseReq,
// // //         end_work_date: baseReq.end_work_date || baseReq.start_work_date || todayIso,
// // //       };
// // //       if (!bodyObj.itemInfo || !String(bodyObj.itemInfo).trim()) delete bodyObj.itemInfo;

// // //       const res = await fetch(
// // //         `${config.baseURLApi}/smartFactory/defect_grid/list`,
// // //         { method: "POST", headers, body: JSON.stringify(bodyObj) }
// // //       );
// // //       if (!res.ok) throw new Error(`defect_grid/list 실패: ${res.status}`);
// // //       const json = await res.json();

// // //       const rows = Array.isArray(json?.data) ? json.data : [];
// // //       this.setState({ defectRows: rows, defectLoading: false }, () => {
// // //         this.computeAggregates();
// // //       });
// // //     } catch (e) {
// // //       console.error(e);
// // //       this.setState({ defectRows: [], defectLoading: false }, () => {
// // //         this.computeAggregates();
// // //       });
// // //     }
// // //   };

// // //   /* =============== 집계 로직 (핵심) =============== */
// // //   computeAggregates = () => {
// // //     const rows = Array.isArray(this.state.defectRows) ? this.state.defectRows : [];

// // //     // 안전 파서
// // //     const toInt = (v) => Number(v || 0);
// // //     const toDate = (v) => {
// // //       if (!v) return null;
// // //       const s = String(v);
// // //       if (s.length >= 10) return s.substring(0,10);
// // //       return s;
// // //     };

// // //     // 품번별 → 날짜세트/합계/유형별
// // //     const itemMap = {};
// // //     rows.forEach(r => {
// // //       const code = (r["자재번호"] || "").trim();
// // //       const name = (r["자재명"] || "").trim();
// // //       const type = (r["불량_유형"] || "").trim();
// // //       const dstr = toDate(r["근무일자"]);
// // //       const wait  = toInt(r["불량_판정대기"]);
// // //       const rwk   = toInt(r["불량_RWK수량"]);
// // //       const scrap = toInt(r["불량_폐기수량"]);
// // //       const defect = wait + rwk + scrap;

// // //       if (!code) return;
// // //       if (!itemMap[code]) itemMap[code] = { itemName: name, defect: 0, wait: 0, rwk: 0, scrap: 0, dates: new Set(), types: {} };

// // //       const it = itemMap[code];
// // //       it.defect += defect; it.wait += wait; it.rwk += rwk; it.scrap += scrap;
// // //       if (dstr && defect > 0) it.dates.add(dstr);

// // //       if (type) {
// // //         if (!it.types[type]) it.types[type] = { defect: 0, wait: 0, rwk: 0, scrap: 0 };
// // //         it.types[type].defect += defect;
// // //         it.types[type].wait += wait;
// // //         it.types[type].rwk += rwk;
// // //         it.types[type].scrap += scrap;
// // //       }
// // //     });

// // //     // 요약 배열
// // //     const itemSummary = Object.entries(itemMap).map(([code, v]) => {
// // //       const days = v.dates.size;
// // //       const dailyAvg = days ? (v.defect / days) : 0;
// // //       const solve = v.defect > 0 ? ((v.rwk + v.scrap) / v.defect * 100) : null;       // 해결율
// // //       const waitRatio = v.defect > 0 ? (v.wait / v.defect * 100) : null;              // 대기비중
// // //       return {
// // //         itemCode: code,
// // //         itemName: v.itemName || "",
// // //         defect: v.defect,
// // //         days,
// // //         dailyAvg: Math.round(dailyAvg * 10) / 10,
// // //         waitRatio,
// // //         solveRatio: solve,
// // //       };
// // //     }).sort((a,b)=> b.defect - a.defect);

// // //     // 품번별 상위 불량유형
// // //     const itemTopTypes = {};
// // //     Object.entries(itemMap).forEach(([code, v]) => {
// // //       const arr = Object.entries(v.types).map(([t, o]) => {
// // //         const solve = o.defect > 0 ? ((o.rwk + o.scrap) / o.defect * 100) : null;
// // //         const waitR = o.defect > 0 ? (o.wait / o.defect * 100) : null;
// // //         return { type: t, defect: o.defect, solveRatio: solve, waitRatio: waitR };
// // //       }).sort((a,b)=> b.defect - a.defect);
// // //       itemTopTypes[code] = arr.slice(0, 5);
// // //     });

// // //     this.setState({ itemSummary, itemTopTypes });
// // //   };

// // //   /* =============== 렌더링 =============== */
// // //   // 필터 바
// // //   renderFilterBar = () => {
// // //     const { filters, itemCodeModalOpen } = this.state;

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
// // //               검색 조건
// // //             </Typography>
// // //           }
// // //           action={
// // //             <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
// // //               {/* 연간 */}
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
// // //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
// // //                 {this.state.years.map((y) => (
// // //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
// // //                 ))}
// // //               </Menu>

// // //               {/* 월간 */}
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
// // //                   onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}
// // //                 >
// // //                   이번달
// // //                 </MenuItem>
// // //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// // //                     {this.state.selectedYear}년 {m}월
// // //                   </MenuItem>
// // //                 ))}
// // //               </Menu>

// // //               {/* 주간 */}
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

// // //               {/* 오늘 */}
// // //               <Button
// // //                 size="small"
// // //                 variant="outlined"
// // //                 color="success"
// // //                 onClick={this.applyToday}
// // //                 sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
// // //               >
// // //                 오늘
// // //               </Button>

// // //               {/* 기간선택 직접 입력 */}
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

// // //               {/* 확장/축소 */}
// // //               <IconButton
// // //                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
// // //                 sx={{ color: "white" }}
// // //               >
// // //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// // //               </IconButton>
// // //             </Box>
// // //           }
// // //           sx={{ backgroundColor: this.props.themeHex, color: "white", borderRadius: 1, mb: 2 }}
// // //         />

// // //         {/* 1행: 공장/공정/설비/품번/품명 */}
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
// // //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// // //                 </InputAdornment>
// // //               ),
// // //             }}
// // //             sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }}
// // //           />
// // //           <TextField
// // //             fullWidth
// // //             label="품명"
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
// // //             sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }}
// // //           />
// // //         </Box>

// // //         {/* 확장 필터 */}
// // //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// // //           <Divider sx={{ my: 2 }} />
// // //           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 2 }}>
// // //             <TextField
// // //               fullWidth
// // //               label="불량유형(부분검색)"
// // //               value={filters.defectType}
// // //               onChange={(e) => this.handleFilterChange("defectType", e.target.value)}
// // //               size="small"
// // //               variant="outlined"
// // //             />
// // //             <TextField
// // //               fullWidth
// // //               label="Top N"
// // //               type="number"
// // //               value={filters.topN ?? 10}
// // //               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
// // //               size="small"
// // //               variant="outlined"
// // //             />
// // //           </Box>
// // //         </Collapse>

// // //         {/* 버튼 */}
// // //         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
// // //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToAll} size="large" color="secondary">
// // //             필터 초기화
// // //           </Button>
// // //           <Button
// // //             variant="contained"
// // //             startIcon={<SearchIcon />}
// // //             size="large"
// // //             sx={{ backgroundColor: this.props.themeHex, "&:hover": { backgroundColor: "#f57c00" } }}
// // //             onClick={() => { this.loadOptions(); this.loadAll(); }}
// // //           >
// // //             검색
// // //           </Button>
// // //         </Box>

// // //         {/* 품목 선택 모달 */}
// // //         <InspectionItemModal
// // //           open={itemCodeModalOpen}
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

// // //   /* 상단 요약 KPI */
// // //   renderTopKpis = () => {
// // //     const { kpis } = this.state;
// // //     const cards = [
// // //       { title: "전체 불량", value: fmtInt(kpis.defect), sub: "판정대기+재작업+폐기", color: "#ff7043" },
// // //       { title: "불량률", value: kpis.defectRate == null ? "—" : fmtPct(kpis.defectRate, 2), sub: "생산 대비", color: "#ef6c00" },
// // //       { title: "해결율", value: (kpis.defect > 0 ? fmtPct(((kpis.rwk + kpis.scrap) / kpis.defect) * 100, 1) : "—"), sub: "처리(재작업+폐기)", color: "#26a69a" },
// // //     ];
// // //     return (
// // //       <Grid container spacing={2} sx={{ mb: 1 }} alignItems="stretch">
// // //         {cards.map((c, i) => (
// // //           <Grid item xs={12} sm={6} md={4} key={i} sx={{ display: 'flex' }}>
// // //             <Card className={s.kpiCard} sx={{ flex: 1 }}>
// // //               <CardContent className={s.kpiBody}>
// // //                 <Typography className={s.kpiTitle} sx={{ color: c.color, fontSize: 12, fontWeight: 800 }}>{c.title}</Typography>
// // //                 <Typography className={s.kpiValue} sx={{ color: c.color, fontSize: 26, fontWeight: 900 }}>{c.value}</Typography>
// // //                 <Typography className={s.kpiSub} sx={{ fontSize: 12 }}>{c.sub}</Typography>
// // //               </CardContent>
// // //             </Card>
// // //           </Grid>
// // //         ))}
// // //       </Grid>
// // //     );
// // //   };

// // //   /* A. 품번별 요약 */
// // //   renderItemSummary = () => {
// // //     const rows = this.state.itemSummary || [];
// // //     const download = () => {
// // //       try {
// // //         const headers = ["품번","품명","불량수량","발생일수","일평균(개/일)","대기비중(%)","해결율(%)"];
// // //         const csvRows = rows.map(r => [
// // //           r.itemCode, r.itemName,
// // //           r.defect, r.days, r.dailyAvg,
// // //           r.waitRatio == null ? "" : r.waitRatio.toFixed(1),
// // //           r.solveRatio == null ? "" : r.solveRatio.toFixed(1),
// // //         ]);
// // //         const csv = [headers.join(","), ...csvRows.map(x=>x.join(","))].join("\n");
// // //         const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // //         const url = URL.createObjectURL(blob);
// // //         const a = document.createElement("a");
// // //         a.href = url; a.download = `item_summary_${Date.now()}.csv`; a.click();
// // //         URL.revokeObjectURL(url);
// // //       } catch (e) { console.error(e); }
// // //     };
// // //     return (
// // //       <Paper className={s.section} sx={{ mb: 2 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// // //             품번별 요약
// // //           </Typography>
// // //           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
// // //             <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={download}>
// // //               CSV
// // //             </Button>
// // //           </Box>
// // //         </Box>

// // //         <TableContainer sx={{ maxHeight: 420 }}>
// // //           <Table size="small" stickyHeader>
// // //             <TableHead>
// // //               <TableRow>
// // //                 <TableCell>품번</TableCell>
// // //                 <TableCell>품명</TableCell>
// // //                 <TableCell align="right">불량수량</TableCell>
// // //                 <TableCell align="right">발생일수</TableCell>
// // //                 <TableCell align="right">일평균(개/일)</TableCell>
// // //                 <TableCell align="right">대기비중</TableCell>
// // //                 <TableCell align="right">해결율</TableCell>
// // //               </TableRow>
// // //             </TableHead>
// // //             <TableBody>
// // //               {rows.length === 0 && (
// // //                 <TableRow><TableCell colSpan={7} align="center">데이터가 없습니다.</TableCell></TableRow>
// // //               )}
// // //               {rows.map((r) => (
// // //                 <TableRow key={r.itemCode} hover onClick={() => this.setState({ selectedItemCode: r.itemCode })} sx={{ cursor: 'pointer' }}>
// // //                   <TableCell>{r.itemCode}</TableCell>
// // //                   <TableCell>{r.itemName}</TableCell>
// // //                   <TableCell align="right">{fmtInt(r.defect)}</TableCell>
// // //                   <TableCell align="right">{fmtInt(r.days)}</TableCell>
// // //                   <TableCell align="right">{r.dailyAvg}</TableCell>
// // //                   <TableCell align="right">
// // //                     <Chip size="small" color={waitColor(r.waitRatio)} variant="outlined" label={fmtPct(r.waitRatio,1)} />
// // //                   </TableCell>
// // //                   <TableCell align="right">
// // //                     <Chip size="small" color={gradeColor(r.solveRatio)} variant="outlined" label={fmtPct(r.solveRatio,1)} />
// // //                   </TableCell>
// // //                 </TableRow>
// // //               ))}
// // //             </TableBody>
// // //           </Table>
// // //         </TableContainer>

// // //         <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
// // //           <Typography variant="caption" color="text.secondary">
// // //             행을 클릭하면 아래에 그 품번의 추이가 보입니다.
// // //           </Typography>
// // //           <Typography variant="caption" color="text.secondary">총 {fmtInt(rows.length)}개 품번</Typography>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   /* B. 품번별 주요 불량(Top5) — 카드형 대시보드 */
// // //   renderItemTopTypes = () => {
// // //     const { itemSummary, itemTopTypes } = this.state;
// // //     const topItems = (itemSummary || []).slice(0, 10); // 상위 10개 품번만

// // //     return (
// // //       <Paper className={s.section} sx={{ mb: 2 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// // //             품번별로 많이 나오는 불량(Top 5)
// // //           </Typography>
// // //           <Typography variant="caption" color="text.secondary">카드를 클릭하면 아래 추이에 반영됩니다.</Typography>
// // //         </Box>

// // //         <Grid container spacing={2}>
// // //           {topItems.length === 0 && (
// // //             <Grid item xs={12}><Typography align="center">데이터가 없습니다.</Typography></Grid>
// // //           )}

// // //           {topItems.map(it => {
// // //             const arr = itemTopTypes[it.itemCode] || [];
// // //             const solve = it.solveRatio;
// // //             const waitR = it.waitRatio;

// // //             return (
// // //               <Grid item xs={12} md={6} key={it.itemCode}>
// // //                 <Card
// // //                   variant="outlined"
// // //                   onClick={() => this.setState({ selectedItemCode: it.itemCode })}
// // //                   sx={{
// // //                     borderRadius: 2,
// // //                     cursor: 'pointer',
// // //                     transition: 'transform .08s ease, box-shadow .08s ease',
// // //                     '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 18px rgba(0,0,0,.08)' }
// // //                   }}
// // //                 >
// // //                   <CardContent sx={{ pb: 1.5 }}>
// // //                     {/* 헤더 */}
// // //                     <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb: 1 }}>
// // //                       <Box>
// // //                         <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{it.itemCode}</Typography>
// // //                         <Typography variant="body2" color="text.secondary">{it.itemName || '—'}</Typography>
// // //                       </Box>
// // //                       <Stack direction="row" spacing={1} alignItems="center">
// // //                         <Chip size="small" label={`불량 ${fmtInt(it.defect)}개`} />
// // //                         <Chip size="small" variant="outlined" label={`일평균 ${it.dailyAvg}`} />
// // //                       </Stack>
// // //                     </Box>

// // //                     {/* 미니바: 해결율/대기비중 */}
// // //                     <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
// // //                       <Box sx={{ flex:1 }}>
// // //                         <Stack direction="row" justifyContent="space-between">
// // //                           <Typography variant="caption" color="text.secondary">해결율</Typography>
// // //                           <Chip size="small" color={gradeColor(solve)} variant="filled" label={fmtPct(solve)} />
// // //                         </Stack>
// // //                         <LinearProgress variant="determinate" value={Number(solve)||0} sx={{ height:8, borderRadius:6, mt:0.5 }} />
// // //                       </Box>
// // //                       <Box sx={{ flex:1 }}>
// // //                         <Stack direction="row" justifyContent="space-between">
// // //                           <Typography variant="caption" color="text.secondary">대기비중</Typography>
// // //                           <Chip size="small" color={waitColor(waitR)} variant="filled" label={fmtPct(waitR)} />
// // //                         </Stack>
// // //                         <LinearProgress variant="determinate" value={Number(waitR)||0} sx={{ height:8, borderRadius:6, mt:0.5 }} />
// // //                       </Box>
// // //                     </Stack>

// // //                     {/* 유형 표 */}
// // //                     <Table size="small" sx={{ mt: 1 }}>
// // //                       <TableHead>
// // //                         <TableRow>
// // //                           <TableCell sx={{ width:'45%' }}>불량유형</TableCell>
// // //                           <TableCell align="right">수량</TableCell>
// // //                           <TableCell align="right">해결율</TableCell>
// // //                           <TableCell align="right">대기</TableCell>
// // //                         </TableRow>
// // //                       </TableHead>
// // //                       <TableBody>
// // //                         {arr.length === 0 && (
// // //                           <TableRow><TableCell colSpan={4} align="center">—</TableCell></TableRow>
// // //                         )}
// // //                         {arr.map((t, i) => (
// // //                           <TableRow key={i}>
// // //                             <TableCell>
// // //                               <Tooltip title="클릭하면 해당 품번 추이로 이동">
// // //                                 <Chip size="small" label={t.type} variant="outlined" />
// // //                               </Tooltip>
// // //                             </TableCell>
// // //                             <TableCell align="right">{fmtInt(t.defect)}</TableCell>
// // //                             <TableCell align="right">
// // //                               <Chip size="small" color={gradeColor(t.solveRatio)} variant="outlined" label={fmtPct(t.solveRatio)} />
// // //                             </TableCell>
// // //                             <TableCell align="right">
// // //                               <Chip size="small" color={waitColor(t.waitRatio)} variant="outlined" label={fmtPct(t.waitRatio)} />
// // //                             </TableCell>
// // //                           </TableRow>
// // //                         ))}
// // //                       </TableBody>
// // //                     </Table>
// // //                   </CardContent>
// // //                   <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
// // //                     <Button size="small">추이 보기</Button>
// // //                   </CardActions>
// // //                 </Card>
// // //               </Grid>
// // //             );
// // //           })}
// // //         </Grid>
// // //       </Paper>
// // //     );
// // //   };

// // //   /* C. 선택 품번 추이 */
// // //   renderSelectedItemTrend = () => {
// // //     const code = this.state.selectedItemCode;
// // //     if (!code) return null;

// // //     const rows = this.state.defectRows.filter(r => (r["자재번호"] || "").trim() === code);
// // //     const map = {};
// // //     const toInt = (v)=>Number(v||0);
// // //     const toDate = (v)=> {
// // //       if (!v) return "";
// // //       const s = String(v);
// // //       return s.length >= 10 ? s.substring(0,10) : s;
// // //     };
// // //     rows.forEach(r=>{
// // //       const d = toDate(r["근무일자"]);
// // //       if (!d) return;
// // //       const wait = toInt(r["불량_판정대기"]);
// // //       const rwk  = toInt(r["불량_RWK수량"]);
// // //       const scrap= toInt(r["불량_폐기수량"]);
// // //       const defect = wait + rwk + scrap;
// // //       if (!map[d]) map[d] = { date:d, defect:0, solved:0, wait:0 };
// // //       map[d].defect += defect;
// // //       map[d].solved += (rwk + scrap);
// // //       map[d].wait   += wait;
// // //     });
// // //     const data = Object.values(map).sort((a,b)=> a.date.localeCompare(b.date))
// // //       .map(x=> ({ ...x, solveRate: x.defect>0 ? Math.round((x.solved/x.defect)*1000)/10 : null }));

// // //     return (
// // //       <Paper className={s.section} sx={{ mb: 2 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// // //             선택 품번 추이 — 처리 잘 되고 있나?
// // //           </Typography>
// // //           <Typography variant="caption" color="text.secondary">
// // //             품번: <b>{code}</b>
// // //           </Typography>
// // //         </Box>

// // //         <Box sx={{ height: 320 }}>
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <ComposedChart data={data}>
// // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // //               <XAxis dataKey="date" />
// // //               <YAxis yAxisId="left">
// // //                 <Label value="불량수량(개)" angle={-90} position="insideLeft" />
// // //               </YAxis>
// // //               <YAxis yAxisId="right" orientation="right" domain={[0,100]} tickFormatter={(v)=>`${v}%`}>
// // //                 <Label value="해결율(%)" angle={-90} position="insideRight" />
// // //               </YAxis>
// // //               <RTooltip formatter={(v,n)=>{
// // //                 if (n === "불량수량") return [fmtInt(v), n];
// // //                 if (n === "해결율(%)") return [`${Number(v).toFixed(1)}%`, n];
// // //                 if (n === "대기") return [fmtInt(v), n];
// // //                 return [v,n];
// // //               }} />
// // //               <Legend />
// // //               <Bar yAxisId="left" dataKey="defect" name="불량수량" fill="rgba(66,165,245,.75)" barSize={18} radius={[3,3,0,0]}>
// // //                 <LabelList dataKey="defect" content={(p)=>(<text x={p.x} y={p.y-6} textAnchor="middle" fontSize={11} fill="#546e7a">{fmtInt(p.value)}</text>)} />
// // //               </Bar>
// // //               <Line yAxisId="left" type="monotone" dataKey="wait" name="대기" stroke="#ef6c00" dot={false} />
// // //               <Line yAxisId="right" type="monotone" dataKey="solveRate" name="해결율(%)" stroke="#26a69a" dot>
// // //                 <LabelList content={(p)=> p.value==null?null:(<text x={p.x} y={p.y-8} textAnchor="middle" fontSize={10} fill="#26a69a">{`${Number(p.value).toFixed(1)}%`}</text>)} />
// // //               </Line>
// // //             </ComposedChart>
// // //           </ResponsiveContainer>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   /* 선택 기간 원본 리스트 */
// // //   renderDefectList = () => {
// // //     const { defectRows, defectLoading } = this.state;

// // //     const headers = [
// // //       { key: "근무일자", label: "근무일자" },
// // //       { key: "생산_플랜트", label: "플랜트" },
// // //       { key: "작업장", label: "작업장" },
// // //       { key: "생산_작업장", label: "라인/설비" },
// // //       { key: "자재번호", label: "자재번호" },
// // //       { key: "자재명", label: "자재명" },
// // //       { key: "불량코드", label: "불량코드" },
// // //       { key: "불량_유형", label: "불량유형" },
// // //       { key: "불량_작업자", label: "작업자" },
// // //       { key: "불량_판정대기", label: "판정대기" },
// // //       { key: "불량_RWK수량", label: "재작업" },
// // //       { key: "불량_폐기수량", label: "폐기" },
// // //       { key: "비고", label: "비고" },
// // //     ];

// // //     const toDateStr = (v) => {
// // //       if (!v) return "";
// // //       const s = String(v);
// // //       if (s.length >= 10) return s.substring(0, 10);
// // //       return s;
// // //     };

// // //     const exportCSV = () => {
// // //       try {
// // //         const cols = headers.map(h => h.label);
// // //         const rows = defectRows.map(r => headers.map(h => (r[h.key] ?? "")));
// // //         const csv = [cols.join(","), ...rows.map(row =>
// // //           row.map(v => {
// // //             const s = String(v ?? "");
// // //             if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
// // //             return s;
// // //           }).join(",")
// // //         )].join("\n");
// // //         const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // //         const url = URL.createObjectURL(blob);
// // //         const a = document.createElement("a");
// // //         a.href = url;
// // //         a.download = `defect_list_${Date.now()}.csv`;
// // //         a.click();
// // //         URL.revokeObjectURL(url);
// // //       } catch (e) {
// // //         console.error(e);
// // //       }
// // //     };

// // //     return (
// // //       <Paper className={s.section} sx={{ mt: 2 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// // //             선택 기간 원본 리스트
// // //           </Typography>
// // //           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
// // //             <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={exportCSV}>
// // //               CSV
// // //             </Button>
// // //           </Box>
// // //         </Box>

// // //         {defectLoading && <LinearProgress sx={{ mb: 1 }} />}

// // //         <TableContainer
// // //           sx={{
// // //             maxHeight: 460,
// // //             borderRadius: 1,
// // //             "& .MuiTableCell-head": {
// // //               position: "sticky", top: 0, backgroundColor: this.props.themeHex, color: "#333", zIndex: 1, fontWeight: 800,
// // //             },
// // //           }}
// // //         >
// // //           <Table size="small" stickyHeader>
// // //             <TableHead>
// // //               <TableRow>
// // //                 {headers.map(h => (
// // //                   <TableCell key={h.key} align={["판정대기","재작업","폐기"].some(x=>h.label.includes(x)) ? "right" : "left"}>
// // //                     {h.label}
// // //                   </TableCell>
// // //                 ))}
// // //               </TableRow>
// // //             </TableHead>
// // //             <TableBody>
// // //               {defectRows.length === 0 && !defectLoading && (
// // //                 <TableRow><TableCell colSpan={headers.length} align="center">데이터가 없습니다.</TableCell></TableRow>
// // //               )}
// // //               {defectRows.map((r, idx) => (
// // //                 <TableRow key={idx} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
// // //                   {headers.map(h => {
// // //                     let v = r[h.key];
// // //                     if (h.key === "근무일자") v = toDateStr(v);
// // //                     if (["불량_판정대기","불량_RWK수량","불량_폐기수량"].includes(h.key)) {
// // //                       return <TableCell key={h.key} align="right">{fmtInt(v)}</TableCell>;
// // //                     }
// // //                     return <TableCell key={h.key}>{v ?? ""}</TableCell>;
// // //                   })}
// // //                 </TableRow>
// // //               ))}
// // //             </TableBody>
// // //           </Table>
// // //         </TableContainer>

// // //         <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
// // //           <Typography variant="caption" color="text.secondary">
// // //             총 {fmtInt(defectRows.length)}건
// // //           </Typography>
// // //           <Typography variant="caption" color="text.secondary">
// // //             * “해결율”은 (재작업+폐기)/전체 불량입니다. 대기가 많으면 처리 지연으로 봅니다.
// // //           </Typography>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   render() {
// // //     const { themeHex } = this.props;
// // //     const { error, loading, filters } = this.state;

// // //     return (
// // //       <Box className={s.root}>
// // //         {/* 헤더 */}
// // //         <Box sx={{ mb: 3 }}>
// // //           <Typography
// // //             variant="h4"
// // //             gutterBottom
// // //             sx={{
// // //               color: this.props.themeHex,
// // //               fontWeight: 'bold',
// // //               display: 'flex',
// // //               alignItems: 'center',
// // //               gap: 1,
// // //             }}
// // //           >
// // //             <TrendingUp /> 불량 인사이트 (품번 중심)
// // //           </Typography>
// // //           <Typography variant="body1" color="text.secondary">
// // //             “어디서(품번) 어떤 불량이 자주 나오고, 처리(검사/재작업/폐기)가 잘 되는지”를 한눈에 봅니다.
// // //           </Typography>
// // //           {filters.partNo && (
// // //             <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
// // //               대상 품목: <b>{filters.partNo}</b> {filters.item ? `(${filters.item})` : ""}
// // //             </Typography>
// // //           )}
// // //         </Box>

// // //         {/* 필터 바 */}
// // //         {this.renderFilterBar()}

// // //         {/* 에러 */}
// // //         {error && (
// // //           <Box sx={{ mb: 2 }}>
// // //             <Paper sx={{ p: 2, borderLeft: `4px solid ${themeHex}` }}>
// // //               <Typography color="error" sx={{ mb: 1 }}>데이터를 불러오지 못했습니다.</Typography>
// // //               <Button variant="contained" onClick={() => { this.loadAll(); }} sx={{ backgroundColor: themeHex, "&:hover": { backgroundColor: "#f57c00" } }}>
// // //                 다시 시도
// // //               </Button>
// // //             </Paper>
// // //           </Box>
// // //         )}

// // //         {/* KPI 요약 */}
// // //         {this.renderTopKpis()}

// // //         {/* A. 품번별 요약 */}
// // //         {this.renderItemSummary()}

// // //         {/* B. 품번별 주요 불량 — 카드형 */}
// // //         {this.renderItemTopTypes()}

// // //         {/* C. 선택 품번 추이(처리율 포함) */}
// // //         {this.renderSelectedItemTrend()}

// // //         {/* 원본 리스트 */}
// // //         {this.renderDefectList()}

// // //         {/* 로딩 배지 */}
// // //         {loading && (
// // //           <Box sx={{ position: "fixed", bottom: 24, right: 24, background: "#fff", border: "1px solid #eee", borderRadius: 2, px: 2, py: 1, boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
// // //             <Typography sx={{ fontWeight: 700, color: themeHex }}>불러오는 중…</Typography>
// // //           </Box>
// // //         )}
// // //       </Box>
// // //     );
// // //   }
// // // }

// // // export default connect(mapStateToProps)(DefectProcessChart);


// // import React, { Component } from "react";
// // import { connect } from "react-redux";

// // import {
// //   Box, Paper, Typography, Grid, Card, CardContent, TextField, Button,
// //   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
// //   IconButton, Chip, InputAdornment, CardHeader, Divider, Collapse, Menu, MenuItem,
// //   Tooltip, LinearProgress, Link as MuiLink
// // } from "@mui/material";
// // import { Autocomplete } from "@mui/material";
// // import {
// //   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
// //   Tooltip as RTooltip, ResponsiveContainer, Line, ReferenceLine,
// //   ComposedChart, Legend, Label, LabelList, LineChart, Treemap, ScatterChart, Scatter, ZAxis, Brush
// // } from "recharts";
// // import {
// //   Search as SearchIcon,
// //   Clear as ClearIcon,
// //   ExpandMore as ExpandMoreIcon,
// //   ExpandLess as ExpandLessIcon,
// //   KeyboardArrowDown as KeyboardArrowDownIcon,
// //   TrendingUp,
// //   Insights as InsightsIcon,
// //   ArrowUpward, ArrowDownward,
// //   Download as DownloadIcon,
// //   ErrorOutline as ErrorOutlineIcon
// // } from "@mui/icons-material";
// // import { selectThemeHex, selectThemeKey } from '../../reducers/layout';

// // import s from "./DefectProcessChart.module.scss";
// // import config from "../../config";
// // import InspectionItemModal from "../common/InspectionItemModal";

// // /* ───────────────────────── 공용 유틸 ───────────────────────── */
// // const palette = ["#ff7043", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc", "#26c6da", "#ec407a", "#7e57c2", "#8d6e63", "#26a69a"];
// // const mainColor = "#ff7043";
// // const fmtInt = (v) => (Number(v) || 0).toLocaleString();
// // const fmtPct = (v, digits = 2) => `${(Number(v) || 0).toFixed(digits)}%`;

// // /** 작은 숫자 라벨 */
// // const ValueLabel = (props) => {
// //   const { x, y, value, textAnchor = "middle" } = props;
// //   if (value === null || value === undefined) return null;
// //   return (
// //     <text x={x} y={y - 6} textAnchor={textAnchor} fontSize={11} fill="#546e7a">
// //       {typeof value === "number" ? fmtInt(value) : value}
// //     </text>
// //   );
// // };
// // const PctValueLabel = (props) => {
// //   const { x, y, value, textAnchor = "middle" } = props;
// //   if (value === null || value === undefined) return null;
// //   return (
// //     <text x={x} y={y - 6} textAnchor={textAnchor} fontSize={11} fill="#546e7a">
// //       {`${Number(value).toFixed(2)}%`}
// //     </text>
// //   );
// // };

// // /* ───────────────────────── 날짜/프리셋 ───────────────────────── */
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
// //   const s = new Date(d);
// //   s.setDate(d.getDate() + diff);
// //   return new Date(s.getFullYear(), s.getMonth(), s.getDate());
// // };
// // const endOfWeek = (d) => {
// //   const s = startOfWeek(d);
// //   return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
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

// // /* ───────────────────────── 기본 필터(필터 바 유지) ───────────────────────── */
// // const getDefaultFilters = () => {
// //   const now = today0();
// //   const start = new Date(now.getFullYear(), 0, 1);
// //   return {
// //     start_date: iso(start),
// //     end_date: "", // 최신 work_date로 채움
// //     factory: "아진산업-본사(경산)",
// //     process: "프레스",
// //     equipment: "1500T(E라인)",
// //     partNo: "",
// //     item: "",
// //     // 추가 필터
// //     defectType: "",
// //     topN: 10,
// //   };
// // };

// // function mapStateToProps(state) {
// //   return {
// //     themeHex: selectThemeHex(state),
// //     themeKey: selectThemeKey(state),
// //   };
// // }

// // /* ───────────────────────── 본문 컴포넌트 ───────────────────────── */
// // class DefectProcessChart extends Component {
// //   state = {
// //     // ===== 필터 / 옵션 (필터 바는 동일) =====
// //     filters: getDefaultFilters(),
// //     factories: [],
// //     processes: [],
// //     equipments: [],
// //     optionsLoading: false,

// //     // 날짜 프리셋
// //     selectedYear: new Date().getFullYear(),
// //     selectedMonth: new Date().getMonth() + 1,
// //     yearAnchorPos: null,
// //     monthAnchorPos: null,
// //     weekAnchorPos: null,
// //     years: [],

// //     // 모달
// //     itemCodeModalOpen: false,

// //     // ===== 기본 데이터 =====
// //     kpis: { good: 0, defect: 0, wait: 0, rwk: 0, scrap: 0, throughput: 0, defectRate: null, scrapRate: null, rwkRate: null, opMinutes: 0, opHours: 0, defectPerHour: null },
// //     byType: [],
// //     trend: [],
// //     stacked: [],

// //     // ===== 인사이트 (01,02,04,05,06,07,08) =====
// //     emerging: [],
// //     emergingWindow: { recentDays: 7, prevDays: 7 },
// //     hotspot: [],
// //     recurrence: [],
// //     seasonality: [],
// //     waitAlert: { alert: false, ratio: 0, trend: [] },
// //     byTypeDelta: [],
// //     perhourUcl: { ucl: null, items: [] },

// //     // 불량 리스트
// //     defectRows: [],
// //     defectLoading: false,

// //     // ▶ Top5(품번별) + 우측 추이
// //     topByItem: [],                 // [{ itemCode, itemName, total, wait, solveRate, dailyAvg, types: [{type, qty, solveRate, waitRatio}] }]
// //     selectedTopItem: null,         // {itemCode, itemName}
// //     selectedTopTrend: [],          // [{date, defect, wait, solveRate}]
// //     topTrendLoading: false,

// //     // ===== UI =====
// //     loading: false,
// //     error: "",
// //     filterExpanded: false,
// //   };

// //   /* 공통 POST (검사 그리드 옵션/최신일자 재사용) */
// //   postGrid = async (path, body) => {
// //     const headers = { "Content-Type": "application/json" };
// //     const url = `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_grid${path}`;
// //     const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body || {}) });
// //     if (!res.ok) {
// //       const t = await res.text().catch(() => "");
// //       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// //     }
// //     const json = await res.json();
// //     return json.data || [];
// //   };

// //   mapToDefectListReq = (f) => {
// //     const todayIso = new Date().toLocaleDateString("sv-SE");
// //     const start = f.start_date || undefined;
// //     const end = f.end_date || f.start_date || todayIso;
// //     const itemInfo = f.partNo && String(f.partNo).trim() ? String(f.partNo).trim() : undefined;

// //     return {
// //       start_work_date: start,
// //       end_work_date: end,
// //       plant: f.factory || undefined,
// //       workplace: f.process || undefined,
// //       line: f.equipment || undefined,
// //       itemInfo,
// //       defectType: f.defectType || undefined,
// //     };
// //   };

// //   mapToDefectReq = (f) => {
// //     const todayIso = new Date().toLocaleDateString("sv-SE");
// //     const itemCode = (f.partNo && String(f.partNo).trim()) ? String(f.partNo).trim() : undefined;
// //     const itemName = (f.item && String(f.item).trim()) ? String(f.item).trim() : undefined;

// //     return {
// //       start_date: f.start_date || undefined,
// //       end_date: f.end_date || f.start_date || todayIso,
// //       plant: f.factory || undefined,
// //       workplace: f.process || undefined,
// //       line: f.equipment || undefined,
// //       defectType: f.defectType || undefined,
// //       topN: f.topN || 10,
// //       itemCode,
// //       itemName,
// //       itemInfo: itemCode,
// //     };
// //   };

// //   async componentDidMount() {
// //     const saved = localStorage.getItem("defectFilters");
// //     if (saved) {
// //       try {
// //         const parsed = JSON.parse(saved);
// //         this.setState({ filters: { ...this.state.filters, ...parsed } });
// //       } catch {}
// //     }
// //     await this.bootstrap();
// //   }

// //   bootstrap = async () => {
// //     await this.loadYears();
// //     await this.ensureDefaultDbLastDate();
// //     await this.loadOptions();
// //     await this.loadAll();
// //     await this.loadInsights();
// //   };

// //   loadYears = async () => {
// //     const y = new Date().getFullYear();
// //     this.setState({ years: [y, y - 1, y - 2, y - 3, y - 4], selectedYear: y });
// //   };

// //   ensureDefaultDbLastDate = async () => {
// //     const { filters } = this.state;
// //     if (filters.end_date) return;

// //     const todayIso = new Date().toLocaleDateString("sv-SE");
// //     let endDate = "";

// //     try {
// //       const lastDate = await this.postGrid("/options/latest_date", {});
// //       if (typeof lastDate === "string" && lastDate.trim()) {
// //         endDate = lastDate.trim();
// //       }
// //     } catch (e) {
// //       console.warn("최신 날짜 조회 실패, 보정값 사용:", e?.message || e);
// //     }

// //     if (!endDate) endDate = filters.start_date || todayIso;

// //     this.setState(
// //       (prev) => ({ filters: { ...prev.filters, end_date: endDate } }),
// //       () => {
// //         try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
// //       }
// //     );
// //   };

// //   loadOptions = async () => {
// //     const { filters } = this.state;
// //     this.setState({ optionsLoading: true });
// //     try {
// //       const reqBase = {
// //         start_work_date: filters.start_date || undefined,
// //         end_work_date: filters.end_date || undefined,
// //         plant: filters.factory || undefined,
// //         process: filters.process || undefined,
// //         equipment: filters.equipment || undefined,
// //       };
// //       const [factories, processes, equipments] = await Promise.all([
// //         this.postGrid("/options/plants", { start_work_date: reqBase.start_work_date, end_work_date: reqBase.end_work_date }),
// //         this.postGrid("/options/processes", { ...reqBase }),
// //         this.postGrid("/options/equipments", { ...reqBase }),
// //       ]);

// //       const fixed = { ...filters };
// //       if (fixed.factory && factories.length && !factories.includes(fixed.factory)) fixed.factory = "";
// //       if (fixed.process && processes.length && !processes.includes(fixed.process)) fixed.process = "";
// //       if (fixed.equipment && equipments.length && !equipments.includes(fixed.equipment)) fixed.equipment = "";

// //       this.setState({
// //         factories, processes, equipments, optionsLoading: false, filters: fixed,
// //       });
// //     } catch (e) {
// //       console.error(e);
// //       this.setState({ optionsLoading: false });
// //     }
// //   };

// //   handleFilterChange = async (field, value) => {
// //     this.setState(
// //       (prev) => {
// //         const f = { ...prev.filters, [field]: value };
// //         if (field === "factory") {
// //           f.process = ""; f.equipment = ""; f.partNo = ""; f.item = "";
// //         } else if (field === "process") {
// //           f.equipment = ""; f.partNo = ""; f.item = "";
// //         } else if (field === "equipment") {
// //           f.partNo = ""; f.item = "";
// //         } else if (field === "topN") {
// //           f.topN = Number(value) || 10;
// //         }
// //         return { filters: f };
// //       },
// //       async () => {
// //         try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
// //         await this.loadOptions();
// //         await this.loadAll();
// //         await this.loadInsights();
// //       }
// //     );
// //   };

// //   setDateRange = async (start, end) => {
// //     const start_date = start ? iso(start) : "";
// //     const end_date = end ? iso(end) : "";
// //     this.setState(
// //       (prev) => ({ filters: { ...prev.filters, start_date, end_date } }),
// //       async () => {
// //         try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
// //         await this.loadOptions();
// //         await this.loadAll();
// //         await this.loadInsights();
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

// //   resetToAll = async () => {
// //     const filters = getDefaultFilters();
// //     this.setState(
// //       { filters, selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1 },
// //       async () => {
// //         try { localStorage.removeItem("defectFilters"); } catch {}
// //         await this.ensureDefaultDbLastDate();
// //         await this.loadOptions();
// //         await this.loadAll();
// //         await this.loadInsights();
// //       }
// //     );
// //   };

// //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// //     this.setState(
// //       (prev) => ({
// //         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
// //         itemCodeModalOpen: false,
// //       }),
// //       async () => {
// //         await this.loadAll();
// //         await this.loadInsights();
// //       }
// //     );
// //   };

// //   safeRate = (good, defect) => {
// //     const g = Number(good) || 0;
// //     const d = Number(defect) || 0;
// //     const th = g + d;
// //     if (th <= 0 || g <= 0) return null;
// //     return Number(((d / th) * 100).toFixed(2));
// //   };

// //   movingAvg = (arr, key = "rate", w = 7) => {
// //     if (!Array.isArray(arr) || !arr.length) return [];
// //     return arr.map((_, i) => {
// //       const sliceVals = arr
// //         .slice(Math.max(0, i - w + 1), i + 1)
// //         .map(d => d[key])
// //         .filter(v => typeof v === "number");
// //       const ma = sliceVals.length
// //         ? Math.round((sliceVals.reduce((s, v) => s + v, 0) / sliceVals.length) * 100) / 100
// //         : null;
// //       return { ...arr[i], ma };
// //     });
// //   };

// //   ensureArray = (data, fallback = []) => {
// //     if (Array.isArray(data)) return data;
// //     if (data && typeof data === "object") {
// //       if (Array.isArray(data.data)) return data.data;
// //       if (Array.isArray(data.items)) return data.items;
// //       if (Array.isArray(data.rows)) return data.rows;
// //     }
// //     return fallback;
// //   };

// //   loadAll = async () => {
// //     const { filters } = this.state;
// //     this.setState({ loading: true, error: "" });
// //     try {
// //       const headers = { "Content-Type": "application/json" };
// //       const body = JSON.stringify(this.mapToDefectReq(filters));

// //       const [kpisRes, typeRes, trendRes, stackedRes] = await Promise.all([
// //         fetch(`${config.baseURLApi}/smartFactory/defect_chart/kpis`,    { method: "POST", headers, body }),
// //         fetch(`${config.baseURLApi}/smartFactory/defect_chart/by_type`, { method: "POST", headers, body }),
// //         fetch(`${config.baseURLApi}/smartFactory/defect_chart/trend`,   { method: "POST", headers, body }),
// //         fetch(`${config.baseURLApi}/smartFactory/defect_chart/stacked`, { method: "POST", headers, body }),
// //       ]);

// //       if (!kpisRes.ok || !typeRes.ok || !trendRes.ok || !stackedRes.ok) {
// //         throw new Error("기본 차트 API 호출 오류");
// //       }

// //       const kpisJson = await kpisRes.json();
// //       const typeJson = await typeRes.json();
// //       const trendJson = await trendRes.json();
// //       const stackedJson = await stackedRes.json();

// //       const trendArr = this.ensureArray(trendJson.data, []);
// //       const safeKpis = {
// //         ...this.state.kpis,
// //         ...(kpisJson.data || {}),
// //         defectRate: typeof kpisJson?.data?.defectRate === "number" ? kpisJson.data.defectRate : null,
// //         scrapRate:  typeof kpisJson?.data?.scrapRate  === "number" ? kpisJson.data.scrapRate  : null,
// //         rwkRate:    typeof kpisJson?.data?.rwkRate    === "number" ? kpisJson.data.rwkRate    : null,
// //         defectPerHour: typeof kpisJson?.data?.defectPerHour === "number" ? kpisJson.data.defectPerHour : null,
// //       };

// //       this.setState({
// //         kpis: safeKpis,
// //         byType: this.ensureArray(typeJson.data, []),
// //         trend: trendArr,
// //         stacked: this.ensureArray(stackedJson.data, []),
// //         loading: false,
// //       });

// //       await this.loadDefectList();
// //     } catch (e) {
// //       console.error(e);
// //       this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
// //       await this.loadDefectList();
// //     }
// //   };

// //   loadInsights = async () => {
// //     const { filters, emergingWindow } = this.state;
// //     const headers = { "Content-Type": "application/json" };
// //     const baseBody = this.mapToDefectReq(filters);

// //     const p1 = (async () => {
// //       try {
// //         const body = JSON.stringify({ ...baseBody, recentDays: emergingWindow.recentDays, prevDays: emergingWindow.prevDays });
// //         const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/emerging`, { method: "POST", headers, body });
// //         if (!res.ok) throw new Error("emerging fail");
// //         const j = await res.json();
// //         this.setState({ emerging: this.ensureArray(j.data, []) });
// //       } catch (e) {
// //         console.warn("emerging error:", e?.message || e);
// //         this.setState({ emerging: [] });
// //       }
// //     })();

// //     const p2 = (async () => {
// //       try {
// //         const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/hotspot`, { method: "POST", headers, body: JSON.stringify(baseBody) });
// //         if (!res.ok) throw new Error("hotspot fail");
// //         const j = await res.json();
// //         this.setState({ hotspot: this.ensureArray(j.data, []) });
// //       } catch (e) {
// //         console.warn("hotspot error:", e?.message || e);
// //         this.setState({ hotspot: [] });
// //       }
// //     })();

// //     const p4 = (async () => {
// //       try {
// //         const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/recurrence`, { method: "POST", headers, body: JSON.stringify(baseBody) });
// //         if (!res.ok) throw new Error("recurrence fail");
// //         const j = await res.json();
// //         this.setState({ recurrence: this.ensureArray(j.data, []) });
// //       } catch (e) {
// //         console.warn("recurrence error:", e?.message || e);
// //         this.setState({ recurrence: [] });
// //       }
// //     })();

// //     const p5 = (async () => {
// //       try {
// //         const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/seasonality`, { method: "POST", headers, body: JSON.stringify(baseBody) });
// //         if (!res.ok) throw new Error("seasonality fail");
// //         const j = await res.json();
// //         const arr = this.ensureArray(j.data, []);
// //         this.setState({ seasonality: arr });
// //       } catch (e) {
// //         console.warn("seasonality error:", e?.message || e);
// //         this.setState({ seasonality: [] });
// //       }
// //     })();

// //     const p6 = (async () => {
// //       try {
// //         const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/wait_alert`, { method: "POST", headers, body: JSON.stringify(baseBody) });
// //         if (!res.ok) throw new Error("wait_alert fail");
// //         const j = await res.json();
// //         const alertObj = (j && j.data && typeof j.data === "object") ? j.data : {};
// //         this.setState({
// //           waitAlert: {
// //             alert: !!alertObj.alert,
// //             ratio: typeof alertObj.ratio === "number" ? alertObj.ratio : 0,
// //             trend: this.ensureArray(alertObj.trend, []),
// //           }
// //         });
// //       } catch (e) {
// //         console.warn("wait_alert error:", e?.message || e);
// //         this.setState({ waitAlert: { alert: false, ratio: 0, trend: [] } });
// //       }
// //     })();

// //     const p7 = (async () => {
// //       try {
// //         const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/by_type_delta`, { method: "POST", headers, body: JSON.stringify(baseBody) });
// //         if (!res.ok) throw new Error("by_type_delta fail");
// //         const j = await res.json();
// //         this.setState({ byTypeDelta: this.ensureArray(j.data, []) });
// //       } catch (e) {
// //         console.warn("by_type_delta error:", e?.message || e);
// //         this.setState({ byTypeDelta: [] });
// //       }
// //     })();

// //     const p8 = (async () => {
// //       try {
// //         const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/perhour_ucl`, { method: "POST", headers, body: JSON.stringify(baseBody) });
// //         if (!res.ok) throw new Error("perhour_ucl fail");
// //         const j = await res.json();
// //         const ucl = j?.data?.ucl ?? null;
// //         const items = this.ensureArray(j?.data?.items, []);
// //         this.setState({ perhourUcl: { ucl, items } });
// //       } catch (e) {
// //         console.warn("perhour_ucl error:", e?.message || e);
// //         this.setState({ perhourUcl: { ucl: null, items: [] } });
// //       }
// //     })();

// //     await Promise.all([p1, p2, p4, p5, p6, p7, p8]);
// //   };

// //   loadDefectList = async () => {
// //     const { filters } = this.state;
// //     this.setState({ defectLoading: true });

// //     try {
// //       const headers = { "Content-Type": "application/json" };
// //       const baseReq = this.mapToDefectListReq(filters);

// //       const todayIso = new Date().toLocaleDateString("sv-SE");
// //       const bodyObj = {
// //         ...baseReq,
// //         end_work_date: baseReq.end_work_date || baseReq.start_work_date || todayIso,
// //       };
// //       if (!bodyObj.itemInfo || !String(bodyObj.itemInfo).trim()) {
// //         delete bodyObj.itemInfo;
// //       }

// //       const res = await fetch(
// //         `${config.baseURLApi}/smartFactory/defect_grid/list`,
// //         { method: "POST", headers, body: JSON.stringify(bodyObj) }
// //       );
// //       if (!res.ok) throw new Error(`defect_grid/list 실패: ${res.status}`);
// //       const json = await res.json();

// //       const rows = Array.isArray(json?.data) ? json.data : [];
// //       this.setState({ defectRows: rows, defectLoading: false }, () => {
// //         this.buildTop5FromRows(rows);
// //       });
// //     } catch (e) {
// //       console.error(e);
// //       this.setState({ defectRows: [], defectLoading: false, topByItem: [], selectedTopItem: null, selectedTopTrend: [] });
// //     }
// //   };

// //   /** ▶ 품번별 Top5 + 유형 breakdown 생성 */
// //   buildTop5FromRows = (rows) => {
// //     if (!Array.isArray(rows) || rows.length === 0) {
// //       this.setState({ topByItem: [], selectedTopItem: null, selectedTopTrend: [] });
// //       return;
// //     }

// //     // itemCode 기반 집계
// //     const map = new Map();
// //     rows.forEach(r => {
// //       const code = (r["자재번호"] || "").trim();
// //       if (!code) return;
// //       const name = (r["자재명"] || "").trim();

// //       const w = Number(r["불량_판정대기"] || 0);
// //       const rwk = Number(r["불량_RWK수량"] || 0);
// //       const scrap = Number(r["불량_폐기수량"] || 0);
// //       const defect = w + rwk + scrap;
// //       const dtype = (r["불량_유형"] || "기타").toString().trim() || "기타";

// //       if (!map.has(code)) {
// //         map.set(code, { itemCode: code, itemName: name, total: 0, wait: 0, days: new Set(), typeMap: new Map() });
// //       }
// //       const obj = map.get(code);
// //       obj.total += defect;
// //       obj.wait += w;

// //       // 일자 집계
// //       const dRaw = (r["근무일자"] || "").toString();
// //       const d =
// //         dRaw.length >= 10 ? dRaw.substring(0, 10) :
// //         dRaw.length === 8 ? `${dRaw.substring(0,4)}-${dRaw.substring(4,6)}-${dRaw.substring(6,8)}` :
// //         dRaw;
// //       if (d) obj.days.add(d);

// //       // 유형별 집계
// //       if (!obj.typeMap.has(dtype)) obj.typeMap.set(dtype, { type: dtype, qty: 0, wait: 0 });
// //       const t = obj.typeMap.get(dtype);
// //       t.qty += defect;
// //       t.wait += w;
// //     });

// //     const list = Array.from(map.values()).map(x => {
// //       const dayCnt = Math.max(1, x.days.size);
// //       const solveRate = x.total > 0 ? ((x.total - x.wait) / x.total * 100) : 0;
// //       const types = Array.from(x.typeMap.values())
// //         .map(t => ({
// //           type: t.type,
// //           qty: t.qty,
// //           solveRate: t.qty > 0 ? Math.round(((t.qty - t.wait) / t.qty * 100) * 10) / 10 : 0,
// //           waitRatio: t.qty > 0 ? Math.round((t.wait / t.qty * 100) * 10) / 10 : 0
// //         }))
// //         .sort((a,b)=> b.qty - a.qty)
// //         .slice(0,5);

// //       return {
// //         itemCode: x.itemCode,
// //         itemName: x.itemName,
// //         total: x.total,
// //         wait: x.wait,
// //         solveRate: Math.round(solveRate * 10) / 10,
// //         dailyAvg: Math.round((x.total / dayCnt) * 10) / 10,
// //         types
// //       };
// //     });

// //     list.sort((a, b) => b.total - a.total);
// //     const top5 = list.slice(0, 5);

// //     this.setState(
// //       { topByItem: top5, selectedTopItem: top5[0] || null },
// //       () => {
// //         if (top5[0]) this.loadTopTrendFor(top5[0].itemCode, top5[0].itemName);
// //         else this.setState({ selectedTopTrend: [] });
// //       }
// //     );
// //   };

// //   loadTopTrendFor = async (itemCode, itemName = "") => {
// //     const { filters } = this.state;
// //     if (!itemCode) {
// //       this.setState({ selectedTopTrend: [] });
// //       return;
// //     }

// //     this.setState({ topTrendLoading: true });
// //     try {
// //       const headers = { "Content-Type": "application/json" };
// //       const body = JSON.stringify({
// //         ...this.mapToDefectReq(filters),
// //         itemCode,
// //         itemName: undefined,
// //       });
// //       const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/trend`, { method: "POST", headers, body });
// //       if (!res.ok) throw new Error("trend by item fail");
// //       const j = await res.json();
// //       const arr = this.ensureArray(j.data, []);
// //       const trend = arr.map(r => {
// //         const defect = Number(r.defect || 0);
// //         const wait = Number(r.wait || 0);
// //         const sr = defect > 0 ? ((defect - wait) / defect * 100) : 0;
// //         return { date: r.date, defect, wait, solveRate: Math.round(sr * 10) / 10 };
// //       });
// //       this.setState({ selectedTopTrend: trend, topTrendLoading: false, selectedTopItem: { itemCode, itemName } });
// //     } catch (e) {
// //       console.warn(e);
// //       this.setState({ selectedTopTrend: [], topTrendLoading: false });
// //     }
// //   };

// //   /* =============== 필터 바 (그대로 유지) =============== */
// //   renderFilterBar = () => {
// //     const { filters, itemCodeModalOpen } = this.state;

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
// //               <SearchIcon /> 검색 조건
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
// //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
// //                 {this.state.years.map((y) => (
// //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
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
// //           sx={{ backgroundColor: this.props.themeHex, color: "white", borderRadius: 1, mb: 2 }}
// //         />

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
// //                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
// //                 </InputAdornment>
// //               ),
// //             }}
// //             sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }}
// //           />
// //           <TextField
// //             fullWidth
// //             label="품명"
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
// //             sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }}
// //           />
// //         </Box>

// //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// //           <Divider sx={{ my: 2 }} />
// //           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 2 }}>
// //             <TextField
// //               fullWidth
// //               label="불량유형(부분검색)"
// //               value={filters.defectType}
// //               onChange={(e) => this.handleFilterChange("defectType", e.target.value)}
// //               size="small"
// //               variant="outlined"
// //             />
// //             <TextField
// //               fullWidth
// //               label="Top N"
// //               type="number"
// //               value={filters.topN ?? 10}
// //               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
// //               size="small"
// //               variant="outlined"
// //             />
// //           </Box>
// //         </Collapse>

// //         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
// //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToAll} size="large" color="secondary">
// //             필터 초기화
// //           </Button>
// //           <Button
// //             variant="contained"
// //             startIcon={<SearchIcon />}
// //             size="large"
// //             sx={{ backgroundColor: this.props.themeHex, "&:hover": { backgroundColor: "#f57c00" } }}
// //             onClick={() => {
// //               this.loadOptions();
// //               this.loadAll();
// //               this.loadInsights();
// //             }}
// //           >
// //             검색
// //           </Button>
// //         </Box>

// //         <InspectionItemModal
// //           open={itemCodeModalOpen}
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

// //   /** 01~08 섹션들은 기존 그대로…(중략 아님: 아래 모두 포함) */

// //   renderEmerging = () => {
// //     const rows = this.state.emerging || [];
// //     return (
// //       <Paper className={s.section} sx={{ mb: 2 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// //             01. 떠오르는 불량유형 (최근 급증)
// //           </Typography>
// //           <Typography variant="caption" color="text.secondary">
// //             최근 {this.state.emergingWindow.recentDays}일 vs 직전 {this.state.emergingWindow.prevDays}일 비교
// //           </Typography>
// //         </Box>
// //         <TableContainer>
// //           <Table size="small">
// //             <TableHead>
// //               <TableRow>
// //                 <TableCell>불량유형</TableCell>
// //                 <TableCell align="right">최근(합)</TableCell>
// //                 <TableCell align="right">직전(합)</TableCell>
// //                 <TableCell align="right">Δ(최근-직전)</TableCell>
// //                 <TableCell align="right">기울기/MA7</TableCell>
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {rows.length === 0 && (
// //                 <TableRow><TableCell colSpan={5} align="center">신규/급증 항목이 없습니다.</TableCell></TableRow>
// //               )}
// //               {rows.map((r, i) => {
// //                 const delta = Number(r.recent || 0) - Number(r.prev || 0);
// //                 const up = delta > 0;
// //                 return (
// //                   <TableRow key={i}>
// //                     <TableCell>{r.type}</TableCell>
// //                     <TableCell align="right">{fmtInt(r.recent)}</TableCell>
// //                     <TableCell align="right">{fmtInt(r.prev)}</TableCell>
// //                     <TableCell align="right">
// //                       <Chip size="small" color={up ? "error" : "default"} variant="outlined" label={`${delta>=0?'+':''}${fmtInt(delta)}`} />
// //                     </TableCell>
// //                     <TableCell align="right">{typeof r.slope === "number" ? r.slope.toFixed(2) : "—"}</TableCell>
// //                   </TableRow>
// //                 );
// //               })}
// //             </TableBody>
// //           </Table>
// //         </TableContainer>
// //       </Paper>
// //     );
// //   };

// //   renderHotspot = () => {
// //     const rows = this.state.hotspot || [];
// //     const top = rows.slice(0, 50);
// //     return (
// //       <Paper className={s.section} sx={{ mb: 2 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// //             02. 라인 × 품번 핫스폿 (불량 집중 구간)
// //           </Typography>
// //           <Typography variant="caption" color="text.secondary">색=불량률, 높이=불량수량</Typography>
// //         </Box>
// //         <TableContainer sx={{ maxHeight: 360 }}>
// //           <Table size="small" stickyHeader>
// //             <TableHead>
// //               <TableRow>
// //                 <TableCell>라인(설비)</TableCell>
// //                 <TableCell>품번</TableCell>
// //                 <TableCell>품명</TableCell>
// //                 <TableCell align="right">불량수량</TableCell>
// //                 <TableCell align="right">불량률</TableCell>
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {top.length === 0 && (
// //                 <TableRow><TableCell colSpan={5} align="center">핫스폿이 없습니다.</TableCell></TableRow>
// //               )}
// //               {top.map((r, i) => (
// //                 <TableRow key={i}>
// //                   <TableCell>{r.line}</TableCell>
// //                   <TableCell>{r.itemCode}</TableCell>
// //                   <TableCell>{r.itemName || ""}</TableCell>
// //                   <TableCell align="right">{fmtInt(r.defect)}</TableCell>
// //                   <TableCell align="right">{fmtPct(r.rate || 0, 2)}</TableCell>
// //                 </TableRow>
// //               ))}
// //             </TableBody>
// //           </Table>
// //         </TableContainer>
// //       </Paper>
// //     );
// //   };

// //   renderRecurrence = () => {
// //     const rows = this.state.recurrence || [];
// //     return (
// //       <Paper className={s.section} sx={{ mb: 2 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// //             04. 재발 주기(Recurrence) 경고
// //           </Typography>
// //           <Typography variant="caption" color="text.secondary">최근 3회 간격 평균이 과거 평균 대비 단축 시 경고</Typography>
// //         </Box>
// //         <TableContainer>
// //           <Table size="small">
// //             <TableHead>
// //               <TableRow>
// //                 <TableCell>키(품번|유형)</TableCell>
// //                 <TableCell align="right">과거평균(일)</TableCell>
// //                 <TableCell align="right">최근평균(일)</TableCell>
// //                 <TableCell align="center">상태</TableCell>
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {rows.length === 0 && (
// //                 <TableRow><TableCell colSpan={4} align="center">재발 가속 신호가 없습니다.</TableCell></TableRow>
// //               )}
// //               {rows.map((r, i) => {
// //                 const accel = !!r.accel;
// //                 return (
// //                   <TableRow key={i}>
// //                     <TableCell>{r.key}</TableCell>
// //                     <TableCell align="right">{(r.pastAvg ?? 0).toFixed(1)}</TableCell>
// //                     <TableCell align="right">{(r.recentAvg ?? 0).toFixed(1)}</TableCell>
// //                     <TableCell align="center">
// //                       {accel ? <Chip size="small" color="error" icon={<ErrorOutlineIcon/>} label="재발 가속" /> : <Chip size="small" label="정상" />}
// //                     </TableCell>
// //                   </TableRow>
// //                 );
// //               })}
// //             </TableBody>
// //           </Table>
// //         </TableContainer>
// //       </Paper>
// //     );
// //   };

// //   renderSeasonality = () => {
// //     const season = Array.isArray(this.state.seasonality) ? this.state.seasonality : [];
// //     return (
// //       <Paper className={s.section} sx={{ mb: 2 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// //             05. 시간대/요일 시즌성
// //           </Typography>
// //           <Typography variant="caption" color="text.secondary">요일·교대·시간대별 비율 차이 관찰</Typography>
// //         </Box>
// //         <Box sx={{ height: 320 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <ComposedChart data={season}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis dataKey="bucket">
// //                 <Label value="구간" offset={-5} position="insideBottom" />
// //               </XAxis>
// //               <YAxis yAxisId="left">
// //                 <Label value="불량수량(개)" angle={-90} position="insideLeft" />
// //               </YAxis>
// //               <YAxis yAxisId="right" orientation="right" tickFormatter={(v)=>`${v}%`}>
// //                 <Label value="불량률(%)" angle={-90} position="insideRight" />
// //               </YAxis>
// //               <RTooltip formatter={(v,n)=> {
// //                 if (n === "불량수량") return [fmtInt(v), "불량수량"];
// //                 if (n === "불량률(%)") return [`${Number(v).toFixed(2)}%`, n];
// //                 return [v,n];
// //               }} />
// //               <Legend />
// //               <Bar yAxisId="left" dataKey="defect" name="불량수량" fill="rgba(66,165,245,.75)" barSize={18} radius={[3,3,0,0]}>
// //                 <LabelList content={<ValueLabel />} />
// //               </Bar>
// //               <Line yAxisId="right" type="monotone" dataKey="rate" name="불량률(%)" stroke="#ff7043" dot={false}>
// //                 <LabelList content={<PctValueLabel />} />
// //               </Line>
// //             </ComposedChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderWaitAlert = () => {
// //     const w = this.state.waitAlert || { alert: false, ratio: 0, trend: [] };
// //     const ratio = Number(w.ratio || 0);
// //     const trend = Array.isArray(w.trend) ? w.trend : [];
// //     return (
// //       <Paper className={s.section} sx={{ mb: 2 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// //             06. 판정대기 비중 경보
// //           </Typography>
// //           <Chip size="small" color={w.alert ? "error" : "default"} label={w.alert ? "경보" : "정상"} />
// //         </Box>
// //         <Grid container spacing={2}>
// //           <Grid item xs={12} md={4}>
// //             <Card variant="outlined">
// //               <CardContent>
// //                 <Typography variant="body2" color="text.secondary">현재 판정대기 비중</Typography>
// //                 <Typography variant="h4" sx={{ fontWeight: 900, color: w.alert ? "#c62828" : "#2e7d32" }}>
// //                   {fmtPct(ratio, 2)}
// //                 </Typography>
// //                 {w.alert && (
// //                   <Typography variant="caption" color="error">임계 초과. 판정 리드타임/표준작업 점검 권고</Typography>
// //                 )}
// //               </CardContent>
// //             </Card>
// //           </Grid>
// //           <Grid item xs={12} md={8}>
// //             <Box sx={{ height: 180 }}>
// //               <ResponsiveContainer width="100%" height="100%">
// //                 <ComposedChart data={trend}>
// //                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //                   <XAxis dataKey="date" />
// //                   <YAxis tickFormatter={(v)=>`${v}%`} />
// //                   <RTooltip formatter={(v)=> [`${Number(v).toFixed(2)}%`, "대기비중(%)"]} />
// //                   <Legend />
// //                   <Line type="monotone" dataKey="waitRatio" name="대기비중(%)" stroke="#ff7043" dot={false}>
// //                     <LabelList content={<PctValueLabel />} />
// //                   </Line>
// //                   <ReferenceLine y={40} stroke="#c62828" strokeDasharray="4 4" />
// //                 </ComposedChart>
// //               </ResponsiveContainer>
// //             </Box>
// //           </Grid>
// //         </Grid>
// //       </Paper>
// //     );
// //   };

// //   renderParetoDelta = () => {
// //     const rows = this.state.byTypeDelta || [];
// //     const total = rows.reduce((s,x)=> s + (x.qty || 0), 0) || 1;
// //     let cum = 0;
// //     const data = rows.map(r => {
// //       cum += (r.qty || 0);
// //       const cumRate = Math.min(100, (cum/total)*100);
// //       return { ...r, cumRate: Math.round(cumRate*100)/100 };
// //     });

// //     return (
// //       <Paper className={s.section} sx={{ mb: 2 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// //             07. 파레토(Top-N) + 기여도 Δ%p
// //           </Typography>
// //           <Typography variant="caption" color="text.secondary">전월 대비 기여도 변화</Typography>
// //         </Box>
// //         <Box sx={{ height: 320 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <ComposedChart data={data}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis dataKey="type" />
// //               <YAxis yAxisId="left">
// //                 <Label value="수량(개)" angle={-90} position="insideLeft" />
// //               </YAxis>
// //               <YAxis yAxisId="right" orientation="right" domain={[0,100]} tickFormatter={(v)=>`${v}%`}>
// //                 <Label value="누적(%)" angle={-90} position="insideRight" />
// //               </YAxis>
// //               <RTooltip formatter={(v,n,p)=>{
// //                 if (n === "수량") return [fmtInt(v), "수량"];
// //                 if (n === "누적(%)") return [`${p.payload.cumRate?.toFixed(2)}%`, "누적(%)"];
// //                 if (n === "Δ%p") return [`${Number(v).toFixed(2)}%p`, "Δ%p"];
// //                 return [v,n];
// //               }} />
// //               <Legend />
// //               <Bar yAxisId="left" dataKey="qty" name="수량" fill="rgba(66,165,245,.75)" barSize={16} radius={[3,3,0,0]}>
// //                 <LabelList content={<ValueLabel />} />
// //               </Bar>
// //               <Line yAxisId="right" type="monotone" dataKey="cumRate" name="누적(%)" stroke="#90a4ae" dot={false}>
// //                 <LabelList content={<PctValueLabel />} />
// //               </Line>
// //               <Line yAxisId="right" type="monotone" dataKey="deltaPp" name="Δ%p" stroke="#ef6c00" dot>
// //                 <LabelList content={(p)=> <text x={p.x} y={p.y-8} textAnchor="middle" fontSize={10} fill="#ef6c00">{`${Number(p.value||0).toFixed(2)}%p`}</text>} />
// //               </Line>
// //               <ReferenceLine yAxisId="right" y={80} stroke="#ff7043" strokeDasharray="4 4" />
// //             </ComposedChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderPerhourUcl = () => {
// //     const d = this.state.perhourUcl || { ucl: null, items: [] };
// //     const items = Array.isArray(d.items) ? d.items : [];
// //     const ucl = typeof d.ucl === "number" ? d.ucl : null;
// //     return (
// //       <Paper className={s.section} sx={{ mb: 2 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// //             08. Defect/Hour 관리 상한(UCL)
// //           </Typography>
// //           {ucl != null && <Chip size="small" variant="outlined" label={`UCL ${ucl}`} />}
// //         </Box>
// //         <Box sx={{ height: 320 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <ComposedChart data={items}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis dataKey="date" />
// //               <YAxis />
// //               <RTooltip />
// //               <Legend />
// //               <Line type="monotone" dataKey="perHour" name="불량/시간" stroke="#26a69a" dot>
// //                 <LabelList content={<ValueLabel />} />
// //               </Line>
// //               {ucl != null && <ReferenceLine y={ucl} stroke="#c62828" strokeDasharray="4 4" label="UCL" />}
// //             </ComposedChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   /** ▶ 새 섹션: 품번 Top5 + 선택 품번 추이(좌/우)  */
// //   renderTop5WithTrend = () => {
// //     const { themeHex } = this.props;
// //     const { topByItem, selectedTopItem, selectedTopTrend, topTrendLoading } = this.state;

// //     // 좌측 카드: 스크린샷 스타일
// //     const ItemCard = ({ it, onTrend }) => {
// //       const solved = it.solveRate;               // %
// //       const waitPct = Math.max(0, 100 - solved); // %

// //       return (
// //         <Paper
// //           sx={{
// //             p: 2,
// //             borderRadius: 2,
// //             border: "1px solid #e2e8f0",
// //             bgcolor: "#fff",
// //           }}
// //         >
// //           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: .5 }}>
// //             <Typography sx={{ fontWeight: 900, fontSize: 20 }}>{it.itemCode}</Typography>
// //             <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
// //               <Chip size="small" label={`불량 ${fmtInt(it.total)}개`} />
// //               <Chip size="small" variant="outlined" label={`일평균 ${it.dailyAvg}`} />
// //             </Box>
// //           </Box>
// //           <Typography variant="caption" color="text.secondary">—</Typography>

// //           {/* 게이지 바 */}
// //           <Box sx={{ mt: 1.5, mb: 1 }}>
// //             <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: .5 }}>
// //               <Typography variant="body2" sx={{ width: 56, color: "text.secondary" }}>해결율</Typography>
// //               <Chip size="small" sx={{ bgcolor: "#1b5e20", color: "#fff", borderRadius: 1 }} label={fmtPct(solved,1)} />
// //             </Box>
// //             <Box sx={{ height: 8, background: "#e8f5e9", borderRadius: 999, mb: 1 }}>
// //               <Box sx={{ width: `${Math.min(100, solved)}%`, height: "100%", borderRadius: 999, background: "#2e7d32" }} />
// //             </Box>

// //             <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: .5 }}>
// //               <Typography variant="body2" sx={{ width: 56, color: "text.secondary" }}>대기비중</Typography>
// //               <Chip size="small" sx={{ bgcolor: "#fbe9e7", color: "#bf360c", borderRadius: 1 }} label={fmtPct(waitPct,1)} />
// //             </Box>
// //             <Box sx={{ height: 8, background: "#fbe9e7", borderRadius: 999 }}>
// //               <Box sx={{ width: `${Math.min(100, waitPct)}%`, height: "100%", borderRadius: 999, background: "#ff7043" }} />
// //             </Box>
// //           </Box>

// //           {/* 유형 표 */}
// //           <TableContainer>
// //             <Table size="small" sx={{ "& th, & td": { borderBottom: "none" } }}>
// //               <TableHead>
// //                 <TableRow>
// //                   <TableCell sx={{ color: "#263238", fontWeight: 800 }}>불량유형</TableCell>
// //                   <TableCell align="right" sx={{ color: "#263238", fontWeight: 800 }}>수량</TableCell>
// //                   <TableCell align="center" sx={{ color: "#263238", fontWeight: 800 }}>해결율</TableCell>
// //                   <TableCell align="center" sx={{ color: "#263238", fontWeight: 800 }}>대기</TableCell>
// //                 </TableRow>
// //               </TableHead>
// //               <TableBody>
// //                 {it.types.map((t) => (
// //                   <TableRow key={t.type}>
// //                     <TableCell>
// //                       <Chip size="small" variant="outlined" label={t.type} />
// //                     </TableCell>
// //                     <TableCell align="right">{fmtInt(t.qty)}</TableCell>
// //                     <TableCell align="center">
// //                       <Chip size="small" sx={{ bgcolor: "#e8f5e9", color: "#1b5e20" }} label={fmtPct(t.solveRate,1)} />
// //                     </TableCell>
// //                     <TableCell align="center">
// //                       <Chip size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100" }} label={fmtPct(t.waitRatio,1)} />
// //                     </TableCell>
// //                   </TableRow>
// //                 ))}
// //               </TableBody>
// //             </Table>
// //           </TableContainer>

// //           <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
// //             <MuiLink component="button" variant="body2" onClick={onTrend} sx={{ color: "#2e7d32", fontWeight: 700 }}>
// //               추이 보기
// //             </MuiLink>
// //           </Box>
// //         </Paper>
// //       );
// //     };

// //     const code = selectedTopItem?.itemCode || "";

// //     return (
// //       <Paper className={s.section} sx={{ mb: 2 }}>
// //         <Box className={s.sectionHeader} sx={{ mb: 1 }}>
// //           <Typography className={s.sectionTitle} sx={{ color: themeHex, fontWeight: 800 }}>
// //             품번별로 많이 나오는 불량(Top 5) ↔ 선택 품번 추이
// //           </Typography>
// //         </Box>

// //         <Grid container spacing={2}>
// //           {/* 좌측: Top5 카드 (내부 스크롤) */}
// //           <Grid item xs={12} md={5} lg={4}>
// //             <Box
// //               sx={{
// //                 display: "flex",
// //                 flexDirection: "column",
// //                 gap: 1.2,
// //                 maxHeight: 520,
// //                 overflowY: "auto",
// //                 pr: .5,
// //                 scrollbarGutter: "stable",
// //               }}
// //             >
// //               {topByItem.length === 0 ? (
// //                 <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>데이터가 없습니다.</Paper>
// //               ) : topByItem.map((it) => (
// //                 <ItemCard
// //                   key={it.itemCode}
// //                   it={it}
// //                   onTrend={() => this.loadTopTrendFor(it.itemCode, it.itemName)}
// //                 />
// //               ))}
// //             </Box>
// //           </Grid>

// //           {/* 우측: 추이 차트 */}
// //           <Grid item xs={12} md={7} lg={8}>
// //             <Paper
// //               variant="outlined"
// //               sx={{
// //                 borderRadius: 2,
// //                 p: 1.5,
// //                 minHeight: 520,
// //                 '& .recharts-wrapper': { overflow: 'visible !important' },
// //                 '& .recharts-surface': { overflow: 'visible' },
// //               }}
// //             >
// //               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
// //                 <Typography sx={{ fontWeight: 800, color: themeHex }}>
// //                   선택 품번 추이 — {code || "—"}
// //                 </Typography>
// //                 <Typography variant="caption" color="text.secondary">
// //                   막대: 불량수량 / 주황선: 대기 / 초록선: 해결율
// //                 </Typography>
// //               </Box>

// //               <Box sx={{ height: 480 }}>
// //                 <ResponsiveContainer width="100%" height="100%">
// //                   <ComposedChart
// //                     data={selectedTopTrend}
// //                     margin={{ top: 28, right: 48, bottom: 36, left: 16 }}
// //                   >
// //                     <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //                     <XAxis dataKey="date" tickMargin={8} />
// //                     <YAxis yAxisId="left">
// //                       <Label value="불량수량(개)" angle={-90} position="insideLeft" />
// //                     </YAxis>
// //                     <YAxis
// //                       yAxisId="right"
// //                       orientation="right"
// //                       domain={[0, 100]}
// //                       tickFormatter={(v) => `${v}%`}
// //                     >
// //                       <Label value="해결율(%)" angle={-90} position="insideRight" />
// //                     </YAxis>

// //                     <RTooltip
// //                       wrapperStyle={{ zIndex: 10 }}
// //                       formatter={(v, n) => {
// //                         if (n === "불량수량") return [ (Number(v)||0).toLocaleString(), n ];
// //                         if (n === "해결율(%)") return [ `${Number(v).toFixed(1)}%`, n ];
// //                         if (n === "대기") return [ (Number(v)||0).toLocaleString(), n ];
// //                         return [v, n];
// //                       }}
// //                     />
// //                     <Legend verticalAlign="top" height={24} />

// //                     <Bar
// //                       yAxisId="left"
// //                       dataKey="defect"
// //                       name="불량수량"
// //                       fill="rgba(66,165,245,.75)"
// //                       barSize={14}
// //                       radius={[3, 3, 0, 0]}
// //                     >
// //                       <LabelList
// //                         dataKey="defect"
// //                         content={(p) => (
// //                           <text
// //                             x={p.x}
// //                             y={p.y - 6}
// //                             textAnchor="middle"
// //                             fontSize={11}
// //                             fill="#546e7a"
// //                           >
// //                             {(Number(p.value)||0).toLocaleString()}
// //                           </text>
// //                         )}
// //                       />
// //                     </Bar>

// //                     <Line yAxisId="left" type="monotone" dataKey="wait" name="대기" stroke="#ef6c00" dot={false} />
// //                     <Line
// //                       yAxisId="right"
// //                       type="monotone"
// //                       dataKey="solveRate"
// //                       name="해결율(%)"
// //                       stroke="#26a69a"
// //                       dot
// //                     >
// //                       <LabelList
// //                         content={(p) =>
// //                           p.value == null ? null : (
// //                             <text
// //                               x={p.x}
// //                               y={p.y - 10}
// //                               textAnchor="middle"
// //                               fontSize={10}
// //                               fill="#26a69a"
// //                             >
// //                               {`${Number(p.value).toFixed(1)}%`}
// //                             </text>
// //                           )
// //                         }
// //                       />
// //                     </Line>
// //                   </ComposedChart>
// //                 </ResponsiveContainer>
// //               </Box>

// //               {topTrendLoading && <LinearProgress sx={{ mt: 1 }} />}
// //             </Paper>
// //           </Grid>
// //         </Grid>
// //       </Paper>
// //     );
// //   };

// //   /** 상단 KPI, 리스트 등 기존 섹션들 */

// //   renderTopKpis = () => {
// //     const { kpis, trend } = this.state;

// //     const arr = (trend || []).map(d => ({ ...d, dObj: new Date(d.date) })).sort((a,b)=>a.dObj-b.dObj);
// //     const last7 = arr.slice(-7);
// //     const prev7 = arr.slice(-14, -7);

// //     const sum = (xs, k) => xs.reduce((s,x)=> s + (Number(x[k]) || 0), 0);
// //     const avgNum = (xs, k) => {
// //       const vals = xs.map(x => x[k]).filter(v => typeof v === "number");
// //       return vals.length ? vals.reduce((a,b)=>a+b,0) / vals.length : null;
// //     };

// //     const lastRate = avgNum(last7, "defectRate");
// //     const prevRate = avgNum(prev7, "defectRate");
// //     const deltaRate = (lastRate == null || prevRate == null) ? null : (lastRate - prevRate);

// //     const lastDef = sum(last7, "defect");
// //     const prevDef = sum(prev7, "defect");
// //     const deltaDef = lastDef - prevDef;

// //     const cards = [
// //       { title: "총 불량(기간)", value: fmtInt(kpis.defect), sub: "판정대기+RWK+폐기", color: "#ff7043" },
// //       { title: "불량률(기간)", value: kpis.defectRate == null ? "—" : fmtPct(kpis.defectRate), sub: "생산수량 대비", color: "#ef6c00" },
// //       { title: "불량/시간", value: (kpis.defectPerHour == null ? "—" : (kpis.defectPerHour || 0).toLocaleString()), sub: "건/시간", color: "#8e24aa" },
// //       { title: "폐기율", value: kpis.scrapRate == null ? "—" : fmtPct(kpis.scrapRate), sub: "생산수량 대비", color: "#1e88e5" },
// //       { title: "RWK율", value: kpis.rwkRate == null ? "—" : fmtPct(kpis.rwkRate), sub: "생산수량 대비", color: "#26a69a" },
// //     ];

// //     return (
// //       <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// //         <Grid item xs={12} md={8}>
// //           <Grid container spacing={2} alignItems="stretch">
// //             {cards.map((c, i) => (
// //               <Grid item xs={12} sm={6} md={4} key={i} sx={{ display: 'flex' }}>
// //                 <Card className={s.kpiCard} sx={{ flex: 1 }}>
// //                   <CardContent className={s.kpiBody}>
// //                     <Typography className={s.kpiTitle} sx={{ color: c.color, fontSize: 12, fontWeight: 800 }}>{c.title}</Typography>
// //                     <Typography className={s.kpiValue} sx={{ color: c.color, fontSize: 26, fontWeight: 900 }}>{c.value}</Typography>
// //                     <Typography className={s.kpiSub} sx={{ fontSize: 12 }}>{c.sub}</Typography>
// //                   </CardContent>
// //                 </Card>
// //               </Grid>
// //             ))}
// //           </Grid>
// //         </Grid>

// //         <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
// //           <Card className={s.kpiCard} sx={{ flex: 1 }}>
// //             <CardContent className={s.kpiBody}>
// //               <Typography sx={{ fontSize: 12, fontWeight: 900, color: this.props.themeHex, display: 'flex', alignItems: 'center', gap: 0.5 }}>
// //                 <InsightsIcon fontSize="small" /> 최근 7일 스냅샷
// //               </Typography>
// //               <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 0.5 }}>
// //                 <Typography color="text.secondary">불량률(평균)</Typography>
// //                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
// //                   <b>{lastRate == null ? "—" : fmtPct(lastRate)}</b>
// //                   {deltaRate != null ? (
// //                     deltaRate >= 0 ? <ArrowUpward color="error" fontSize="small" /> : <ArrowDownward color="success" fontSize="small" />
// //                   ) : null}
// //                   <Typography variant="caption" color="text.secondary">
// //                     {deltaRate == null ? '—' : `${deltaRate>=0?'+':''}${deltaRate.toFixed(2)}%p`}
// //                   </Typography>
// //                 </Box>
// //                 <Typography color="text.secondary">불량수량(합)</Typography>
// //                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
// //                   <b>{fmtInt(lastDef)}</b>
// //                   {deltaDef >= 0 ? <ArrowUpward color="error" fontSize="small" /> : <ArrowDownward color="success" fontSize="small" />}
// //                   <Typography variant="caption" color="text.secondary">
// //                     {`${deltaDef>=0?'+':''}${fmtInt(deltaDef)}`}
// //                   </Typography>
// //                 </Box>
// //               </Box>

// //               <Box sx={{ mt: 1.5, height: 60 }}>
// //                 <ResponsiveContainer width="100%" height="100%">
// //                   <LineChart data={arr.slice(-30)}>
// //                     <XAxis dataKey="date" hide />
// //                     <YAxis hide />
// //                     <RTooltip labelFormatter={(l)=>`날짜: ${l}`} formatter={(v,n)=>[n==='불량수량(개)' ? fmtInt(v) : v, n]} />
// //                     <Line type="monotone" dataKey="defect" name="불량수량(개)" stroke="#ff7043" dot={false}>
// //                       <LabelList content={<ValueLabel />} />
// //                     </Line>
// //                   </LineChart>
// //                 </ResponsiveContainer>
// //               </Box>
// //             </CardContent>
// //           </Card>
// //         </Grid>
// //       </Grid>
// //     );
// //   };

// //   renderDefectList = () => {
// //     const { defectRows, defectLoading } = this.state;

// //     const headers = [
// //       { key: "근무일자", label: "근무일자" },
// //       { key: "생산_플랜트", label: "플랜트" },
// //       { key: "작업장", label: "작업장" },
// //       { key: "생산_작업장", label: "라인/설비" },
// //       { key: "자재번호", label: "자재번호" },
// //       { key: "자재명", label: "자재명" },
// //       { key: "불량코드", label: "불량코드" },
// //       { key: "불량_유형", label: "불량유형" },
// //       { key: "불량_작업자", label: "작업자" },
// //       { key: "불량_판정대기", label: "판정대기" },
// //       { key: "불량_RWK수량", label: "RWK" },
// //       { key: "불량_폐기수량", label: "폐기" },
// //       { key: "비고", label: "비고" },
// //     ];

// //     const toDateStr = (v) => {
// //       if (!v) return "";
// //       const s = String(v);
// //       if (s.length >= 10) return s.substring(0, 10);
// //       return s;
// //     };

// //     const exportCSV = () => {
// //       try {
// //         const cols = headers.map(h => h.label);
// //         const rows = defectRows.map(r => headers.map(h => (r[h.key] ?? "")));
// //         const csv = [cols.join(","), ...rows.map(row =>
// //           row.map(v => {
// //             const s = String(v ?? "");
// //             if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
// //             return s;
// //           }).join(",")
// //         )].join("\n");
// //         const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// //         const url = URL.createObjectURL(blob);
// //         const a = document.createElement("a");
// //         a.href = url;
// //         a.download = `defect_list_${Date.now()}.csv`;
// //         a.click();
// //         URL.revokeObjectURL(url);
// //       } catch (e) {
// //         console.error(e);
// //       }
// //     };

// //     return (
// //       <Paper className={s.section} sx={{ mt: 2 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
// //             선택 기간 불량 리스트
// //           </Typography>
// //           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
// //             <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={exportCSV}>
// //               CSV 다운로드
// //             </Button>
// //           </Box>
// //         </Box>

// //         {defectLoading && <LinearProgress sx={{ mb: 1 }} />}

// //         <TableContainer
// //           sx={{
// //             maxHeight: 460,
// //             borderRadius: 1,
// //             "& .MuiTableCell-head": {
// //               position: "sticky", top: 0, backgroundColor: this.props.themeHex, color: "#333", zIndex: 1, fontWeight: 800,
// //             },
// //           }}
// //         >
// //           <Table size="small" stickyHeader>
// //             <TableHead>
// //               <TableRow>
// //                 {headers.map(h => (
// //                   <TableCell key={h.key} align={["판정대기","RWK","폐기"].some(x=>h.label.includes(x)) ? "right" : "left"}>
// //                     {h.label}
// //                   </TableCell>
// //                 ))}
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {defectRows.length === 0 && !defectLoading && (
// //                 <TableRow><TableCell colSpan={headers.length} align="center">데이터가 없습니다.</TableCell></TableRow>
// //               )}
// //               {defectRows.map((r, idx) => (
// //                 <TableRow key={idx} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
// //                   {headers.map(h => {
// //                     let v = r[h.key];
// //                     if (h.key === "근무일자") v = toDateStr(v);
// //                     if (["불량_판정대기","불량_RWK수량","불량_폐기수량"].includes(h.key)) {
// //                       return <TableCell key={h.key} align="right">{fmtInt(v)}</TableCell>;
// //                     }
// //                     return <TableCell key={h.key}>{v ?? ""}</TableCell>;
// //                   })}
// //                 </TableRow>
// //               ))}
// //             </TableBody>
// //           </Table>
// //         </TableContainer>

// //         <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
// //           <Typography variant="caption" color="text.secondary">
// //             총 {fmtInt(defectRows.length)}건
// //           </Typography>
// //           <Typography variant="caption" color="text.secondary">
// //             * 컬럼은 DB 스키마에 따라 자동 매핑됩니다.
// //           </Typography>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   render() {
// //     const { themeHex } = this.props;
// //     const { error, loading, filters } = this.state;

// //     return (
// //       <Box className={s.root}>
// //         <Box sx={{ mb: 3 }}>
// //           <Typography
// //             variant="h4"
// //             gutterBottom
// //             sx={{
// //               color: this.props.themeHex,
// //               fontWeight: 'bold',
// //               display: 'flex',
// //               alignItems: 'center',
// //               gap: 1,
// //             }}
// //           >
// //             <TrendingUp /> 불량 데이터 분석
// //           </Typography>
// //           <Typography variant="body1" color="text.secondary">
// //             생산_불량 테이블 기반의 예방형 지표를 제공합니다.
// //           </Typography>
// //           {filters.partNo && (
// //             <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
// //               대상 품목: <b>{filters.partNo}</b> {filters.item ? `(${filters.item})` : ""}
// //             </Typography>
// //           )}
// //         </Box>

// //         {this.renderFilterBar()}

// //         {error && (
// //           <Box sx={{ mb: 2 }}>
// //             <Paper sx={{ p: 2, borderLeft: `4px solid ${themeHex}` }}>
// //               <Typography color="error" sx={{ mb: 1 }}>차트 데이터를 불러오지 못했습니다.</Typography>
// //               <Button variant="contained" onClick={() => { this.loadAll(); this.loadInsights(); }} sx={{ backgroundColor: themeHex, "&:hover": { backgroundColor: "#f57c00" } }}>
// //                 다시 시도
// //               </Button>
// //             </Paper>
// //           </Box>
// //         )}

// //         {/* ▶ 좌/우 재배치 섹션 */}
// //         {this.renderTop5WithTrend()}

// //         {/* 01~08 섹션 */}
// //         {this.renderEmerging()}
// //         {this.renderHotspot()}
// //         {this.renderRecurrence()}
// //         {this.renderSeasonality()}
// //         {this.renderWaitAlert()}
// //         {this.renderParetoDelta()}
// //         {this.renderPerhourUcl()}

// //         {/* 리스트 */}
// //         {this.renderDefectList()}

// //         {loading && (
// //           <Box sx={{ position: "fixed", bottom: 24, right: 24, background: "#fff", border: "1px solid #eee", borderRadius: 2, px: 2, py: 1, boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
// //             <Typography sx={{ fontWeight: 700, color: themeHex }}>불러오는 중…</Typography>
// //           </Box>
// //         )}
// //       </Box>
// //     );
// //   }
// // }

// // export default connect(mapStateToProps)(DefectProcessChart);

// // src/pages/defect/DefectProcessChart.js
// import React, { Component } from "react";
// import { connect } from "react-redux";

// import {
//   Box, Paper, Typography, Grid, Card, CardContent, TextField, Button,
//   Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
//   IconButton, Chip, InputAdornment, CardHeader, Divider, Collapse, Menu, MenuItem,
//   Tooltip, LinearProgress, Link as MuiLink
// } from "@mui/material";
// import { Autocomplete } from "@mui/material";
// import {
//   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip as RTooltip, ResponsiveContainer, Line, ReferenceLine,
//   ComposedChart, Legend, Label, LabelList, LineChart
// } from "recharts";
// import {
//   Search as SearchIcon,
//   Clear as ClearIcon,
//   ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon,
//   KeyboardArrowDown as KeyboardArrowDownIcon,
//   TrendingUp,
//   Insights as InsightsIcon,
//   ArrowUpward, ArrowDownward,
//   Download as DownloadIcon,
//   ErrorOutline as ErrorOutlineIcon
// } from "@mui/icons-material";
// import { selectThemeHex, selectThemeKey } from '../../reducers/layout';

// import s from "./DefectProcessChart.module.scss";
// import config from "../../config";
// import InspectionItemModal from "../common/InspectionItemModal";

// /* ───────────────────────── 공용 유틸 ───────────────────────── */
// const palette = ["#42a5f5","#26a69a","#ff7043","#ab47bc","#66bb6a","#ffa726","#7e57c2","#26c6da","#8d6e63","#ec407a"];
// const mainColor = "#ff7043";
// const fmtInt = (v) => (Number(v) || 0).toLocaleString();
// const fmtPct = (v, digits = 2) => `${(Number(v) || 0).toFixed(digits)}%`;

// /** 작은 숫자 라벨 */
// const ValueLabel = (props) => {
//   const { x, y, value, textAnchor = "middle" } = props;
//   if (value === null || value === undefined) return null;
//   return (
//     <text x={x} y={y - 6} textAnchor={textAnchor} fontSize={11} fill="#546e7a">
//       {typeof value === "number" ? fmtInt(value) : value}
//     </text>
//   );
// };
// const PctValueLabel = (props) => {
//   const { x, y, value, textAnchor = "middle" } = props;
//   if (value === null || value === undefined) return null;
//   return (
//     <text x={x} y={y - 6} textAnchor={textAnchor} fontSize={11} fill="#546e7a">
//       {`${Number(value).toFixed(2)}%`}
//     </text>
//   );
// };

// /* ───────────────────────── 날짜/프리셋 ───────────────────────── */
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
//     const s = new Date(cur), e = endOfWeek(cur);
//     const clipS = new Date(Math.max(s, first));
//     const clipE = new Date(Math.min(e, last));
//     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
//     idx += 1;
//     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
//   }
//   return out;
// };

// /* ───────────────────────── 기본 필터(필터 바 유지) ───────────────────────── */
// const getDefaultFilters = () => {
//   const now = today0();
//   const start = new Date(now.getFullYear(), 0, 1);
//   return {
//     start_date: iso(start),
//     end_date: "", // 최신 work_date로 채움
//     factory: "아진산업-본사(경산)",
//     process: "프레스",
//     equipment: "1500T(E라인)",
//     partNo: "",
//     item: "",
//     // 추가 필터
//     defectType: "",
//     topN: 10,
//   };
// };

// function mapStateToProps(state) {
//   return {
//     themeHex: selectThemeHex(state),
//     themeKey: selectThemeKey(state),
//   };
// }

// /* ───────────────────────── 본문 컴포넌트 ───────────────────────── */
// class DefectProcessChart extends Component {
//   state = {
//     // ===== 필터 / 옵션 (필터 바는 동일) =====
//     filters: getDefaultFilters(),
//     factories: [],
//     processes: [],
//     equipments: [],
//     optionsLoading: false,

//     // 날짜 프리셋
//     selectedYear: new Date().getFullYear(),
//     selectedMonth: new Date().getMonth() + 1,
//     yearAnchorPos: null,
//     monthAnchorPos: null,
//     weekAnchorPos: null,
//     years: [],

//     // 모달
//     itemCodeModalOpen: false,

//     // ===== 기본 데이터 =====
//     kpis: { good: 0, defect: 0, wait: 0, rwk: 0, scrap: 0, throughput: 0, defectRate: null, scrapRate: null, rwkRate: null, opMinutes: 0, opHours: 0, defectPerHour: null },
//     byType: [],
//     trend: [],
//     stacked: [],

//     // ===== 인사이트 (04,05만 유지) =====
//     recurrence: [],
//     seasonality: [],

//     // 불량 리스트
//     defectRows: [],
//     defectLoading: false,

//     // ▶ Top5(품번별) + 우측 추이
//     topByItem: [],                 // [{ itemCode, itemName, total, wait, solveRate, dailyAvg, types: [{type, qty, solveRate, waitRatio}] }]
//     selectedTopItem: null,         // {itemCode, itemName}
//     selectedTopTrend: [],          // [{date, defect, wait, solveRate}]
//     topTrendLoading: false,

//     // ===== UI =====
//     loading: false,
//     error: "",
//     filterExpanded: false,
//   };

//   /* 공통 POST (검사 그리드 옵션/최신일자 재사용) */
//   postGrid = async (path, body) => {
//     const headers = { "Content-Type": "application/json" };
//     const url = `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_grid${path}`;
//     const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body || {}) });
//     if (!res.ok) {
//       const t = await res.text().catch(() => "");
//       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
//     }
//     const json = await res.json();
//     return json.data || [];
//   };

//   mapToDefectListReq = (f) => {
//     const todayIso = new Date().toLocaleDateString("sv-SE");
//     const start = f.start_date || undefined;
//     const end = f.end_date || f.start_date || todayIso;
//     const itemInfo = f.partNo && String(f.partNo).trim() ? String(f.partNo).trim() : undefined;

//     return {
//       start_work_date: start,
//       end_work_date: end,
//       plant: f.factory || undefined,
//       workplace: f.process || undefined,
//       line: f.equipment || undefined,
//       itemInfo,
//       defectType: f.defectType || undefined,
//     };
//   };

//   mapToDefectReq = (f) => {
//     const todayIso = new Date().toLocaleDateString("sv-SE");
//     const itemCode = (f.partNo && String(f.partNo).trim()) ? String(f.partNo).trim() : undefined;
//     const itemName = (f.item && String(f.item).trim()) ? String(f.item).trim() : undefined;

//     return {
//       start_date: f.start_date || undefined,
//       end_date: f.end_date || f.start_date || todayIso,
//       plant: f.factory || undefined,
//       workplace: f.process || undefined,
//       line: f.equipment || undefined,
//       defectType: f.defectType || undefined,
//       topN: f.topN || 10,
//       itemCode,
//       itemName,
//       itemInfo: itemCode,
//     };
//   };

//   async componentDidMount() {
//     const saved = localStorage.getItem("defectFilters");
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         this.setState({ filters: { ...this.state.filters, ...parsed } });
//       } catch {}
//     }
//     await this.bootstrap();
//   }

//   bootstrap = async () => {
//     await this.loadYears();
//     await this.ensureDefaultDbLastDate();
//     await this.loadOptions();
//     await this.loadAll();
//     await this.loadInsights();
//   };

//   loadYears = async () => {
//     const y = new Date().getFullYear();
//     this.setState({ years: [y, y - 1, y - 2, y - 3, y - 4], selectedYear: y });
//   };

//   ensureDefaultDbLastDate = async () => {
//     const { filters } = this.state;
//     if (filters.end_date) return;

//     const todayIso = new Date().toLocaleDateString("sv-SE");
//     let endDate = "";

//     try {
//       const lastDate = await this.postGrid("/options/latest_date", {});
//       if (typeof lastDate === "string" && lastDate.trim()) {
//         endDate = lastDate.trim();
//       }
//     } catch (e) {
//       console.warn("최신 날짜 조회 실패, 보정값 사용:", e?.message || e);
//     }

//     if (!endDate) endDate = filters.start_date || todayIso;

//     this.setState(
//       (prev) => ({ filters: { ...prev.filters, end_date: endDate } }),
//       () => {
//         try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
//       }
//     );
//   };

//   loadOptions = async () => {
//     const { filters } = this.state;
//     this.setState({ optionsLoading: true });
//     try {
//       const reqBase = {
//         start_work_date: filters.start_date || undefined,
//         end_work_date: filters.end_date || undefined,
//         plant: filters.factory || undefined,
//         process: filters.process || undefined,
//         equipment: filters.equipment || undefined,
//       };
//       const [factories, processes, equipments] = await Promise.all([
//         this.postGrid("/options/plants", { start_work_date: reqBase.start_work_date, end_work_date: reqBase.end_work_date }),
//         this.postGrid("/options/processes", { ...reqBase }),
//         this.postGrid("/options/equipments", { ...reqBase }),
//       ]);

//       const fixed = { ...filters };
//       if (fixed.factory && factories.length && !factories.includes(fixed.factory)) fixed.factory = "";
//       if (fixed.process && processes.length && !processes.includes(fixed.process)) fixed.process = "";
//       if (fixed.equipment && equipments.length && !equipments.includes(fixed.equipment)) fixed.equipment = "";

//       this.setState({
//         factories, processes, equipments, optionsLoading: false, filters: fixed,
//       });
//     } catch (e) {
//       console.error(e);
//       this.setState({ optionsLoading: false });
//     }
//   };

//   handleFilterChange = async (field, value) => {
//     this.setState(
//       (prev) => {
//         const f = { ...prev.filters, [field]: value };
//         if (field === "factory") {
//           f.process = ""; f.equipment = ""; f.partNo = ""; f.item = "";
//         } else if (field === "process") {
//           f.equipment = ""; f.partNo = ""; f.item = "";
//         } else if (field === "equipment") {
//           f.partNo = ""; f.item = "";
//         } else if (field === "topN") {
//           f.topN = Number(value) || 10;
//         }
//         return { filters: f };
//       },
//       async () => {
//         try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
//         await this.loadOptions();
//         await this.loadAll();
//         await this.loadInsights();
//       }
//     );
//   };

//   setDateRange = async (start, end) => {
//     const start_date = start ? iso(start) : "";
//     const end_date = end ? iso(end) : "";
//     this.setState(
//       (prev) => ({ filters: { ...prev.filters, start_date, end_date } }),
//       async () => {
//         try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
//         await this.loadOptions();
//         await this.loadAll();
//         await this.loadInsights();
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

//   resetToAll = async () => {
//     const filters = getDefaultFilters();
//     this.setState(
//       { filters, selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1 },
//       async () => {
//         try { localStorage.removeItem("defectFilters"); } catch {}
//         await this.ensureDefaultDbLastDate();
//         await this.loadOptions();
//         await this.loadAll();
//         await this.loadInsights();
//       }
//     );
//   };

//   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
//   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
//   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
//     this.setState(
//       (prev) => ({
//         filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
//         itemCodeModalOpen: false,
//       }),
//       async () => {
//         await this.loadAll();
//         await this.loadInsights();
//       }
//     );
//   };

//   safeRate = (good, defect) => {
//     const g = Number(good) || 0;
//     const d = Number(defect) || 0;
//     const th = g + d;
//     if (th <= 0 || g <= 0) return null;
//     return Number(((d / th) * 100).toFixed(2));
//   };

//   movingAvg = (arr, key = "rate", w = 7) => {
//     if (!Array.isArray(arr) || !arr.length) return [];
//     return arr.map((_, i) => {
//       const sliceVals = arr
//         .slice(Math.max(0, i - w + 1), i + 1)
//         .map(d => d[key])
//         .filter(v => typeof v === "number");
//       const ma = sliceVals.length
//         ? Math.round((sliceVals.reduce((s, v) => s + v, 0) / sliceVals.length) * 100) / 100
//         : null;
//       return { ...arr[i], ma };
//     });
//   };

//   ensureArray = (data, fallback = []) => {
//     if (Array.isArray(data)) return data;
//     if (data && typeof data === "object") {
//       if (Array.isArray(data.data)) return data.data;
//       if (Array.isArray(data.items)) return data.items;
//       if (Array.isArray(data.rows)) return data.rows;
//     }
//     return fallback;
//   };

//   loadAll = async () => {
//     const { filters } = this.state;
//     this.setState({ loading: true, error: "" });
//     try {
//       const headers = { "Content-Type": "application/json" };
//       const body = JSON.stringify(this.mapToDefectReq(filters));

//       const [kpisRes, typeRes, trendRes, stackedRes] = await Promise.all([
//         fetch(`${config.baseURLApi}/smartFactory/defect_chart/kpis`,    { method: "POST", headers, body }),
//         fetch(`${config.baseURLApi}/smartFactory/defect_chart/by_type`, { method: "POST", headers, body }),
//         fetch(`${config.baseURLApi}/smartFactory/defect_chart/trend`,   { method: "POST", headers, body }),
//         fetch(`${config.baseURLApi}/smartFactory/defect_chart/stacked`, { method: "POST", headers, body }),
//       ]);

//       if (!kpisRes.ok || !typeRes.ok || !trendRes.ok || !stackedRes.ok) {
//         throw new Error("기본 차트 API 호출 오류");
//       }

//       const kpisJson = await kpisRes.json();
//       const typeJson = await typeRes.json();
//       const trendJson = await trendRes.json();
//       const stackedJson = await stackedRes.json();

//       const trendArr = this.ensureArray(trendJson.data, []);
//       const safeKpis = {
//         ...this.state.kpis,
//         ...(kpisJson.data || {}),
//         defectRate: typeof kpisJson?.data?.defectRate === "number" ? kpisJson.data.defectRate : null,
//         scrapRate:  typeof kpisJson?.data?.scrapRate  === "number" ? kpisJson.data.scrapRate  : null,
//         rwkRate:    typeof kpisJson?.data?.rwkRate    === "number" ? kpisJson.data.rwkRate    : null,
//         defectPerHour: typeof kpisJson?.data?.defectPerHour === "number" ? kpisJson.data.defectPerHour : null,
//       };

//       this.setState({
//         kpis: safeKpis,
//         byType: this.ensureArray(typeJson.data, []),
//         trend: trendArr,
//         stacked: this.ensureArray(stackedJson.data, []),
//         loading: false,
//       });

//       await this.loadDefectList();
//     } catch (e) {
//       console.error(e);
//       this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
//       await this.loadDefectList();
//     }
//   };

//   /** 04, 05만 유지 */
//   loadInsights = async () => {
//     const { filters } = this.state;
//     const headers = { "Content-Type": "application/json" };
//     const baseBody = this.mapToDefectReq(filters);

//     const p4 = (async () => {
//       try {
//         const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/recurrence`, { method: "POST", headers, body: JSON.stringify(baseBody) });
//         if (!res.ok) throw new Error("recurrence fail");
//         const j = await res.json();
//         this.setState({ recurrence: this.ensureArray(j.data, []) });
//       } catch (e) {
//         console.warn("recurrence error:", e?.message || e);
//         this.setState({ recurrence: [] });
//       }
//     })();

//     const p5 = (async () => {
//       try {
//         const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/seasonality`, { method: "POST", headers, body: JSON.stringify(baseBody) });
//         if (!res.ok) throw new Error("seasonality fail");
//         const j = await res.json();
//         const arr = this.ensureArray(j.data, []);
//         this.setState({ seasonality: arr });
//       } catch (e) {
//         console.warn("seasonality error:", e?.message || e);
//         this.setState({ seasonality: [] });
//       }
//     })();

//     await Promise.all([p4, p5]);
//   };

//   loadDefectList = async () => {
//     const { filters } = this.state;
//     this.setState({ defectLoading: true });

//     try {
//       const headers = { "Content-Type": "application/json" };
//       const baseReq = this.mapToDefectListReq(filters);

//       const todayIso = new Date().toLocaleDateString("sv-SE");
//       const bodyObj = {
//         ...baseReq,
//         end_work_date: baseReq.end_work_date || baseReq.start_work_date || todayIso,
//       };
//       if (!bodyObj.itemInfo || !String(bodyObj.itemInfo).trim()) {
//         delete bodyObj.itemInfo;
//       }

//       const res = await fetch(
//         `${config.baseURLApi}/smartFactory/defect_grid/list`,
//         { method: "POST", headers, body: JSON.stringify(bodyObj) }
//       );
//       if (!res.ok) throw new Error(`defect_grid/list 실패: ${res.status}`);
//       const json = await res.json();

//       const rows = Array.isArray(json?.data) ? json.data : [];
//       this.setState({ defectRows: rows, defectLoading: false }, () => {
//         this.buildTop5FromRows(rows);
//       });
//     } catch (e) {
//       console.error(e);
//       this.setState({ defectRows: [], defectLoading: false, topByItem: [], selectedTopItem: null, selectedTopTrend: [] });
//     }
//   };

//   /** ▶ 품번별 Top5 + 유형 breakdown 생성 */
//   buildTop5FromRows = (rows) => {
//     if (!Array.isArray(rows) || rows.length === 0) {
//       this.setState({ topByItem: [], selectedTopItem: null, selectedTopTrend: [] });
//       return;
//     }

//     // itemCode 기반 집계
//     const map = new Map();
//     rows.forEach(r => {
//       const code = (r["자재번호"] || "").trim();
//       if (!code) return;
//       const name = (r["자재명"] || "").trim();

//       const w = Number(r["불량_판정대기"] || 0);
//       const rwk = Number(r["불량_RWK수량"] || 0);
//       const scrap = Number(r["불량_폐기수량"] || 0);
//       const defect = w + rwk + scrap;
//       const dtype = (r["불량_유형"] || "기타").toString().trim() || "기타";

//       if (!map.has(code)) {
//         map.set(code, { itemCode: code, itemName: name, total: 0, wait: 0, days: new Set(), typeMap: new Map() });
//       }
//       const obj = map.get(code);
//       obj.total += defect;
//       obj.wait += w;

//       // 일자 집계
//       const dRaw = (r["근무일자"] || "").toString();
//       const d =
//         dRaw.length >= 10 ? dRaw.substring(0, 10) :
//         dRaw.length === 8 ? `${dRaw.substring(0,4)}-${dRaw.substring(4,6)}-${dRaw.substring(6,8)}` :
//         dRaw;
//       if (d) obj.days.add(d);

//       // 유형별 집계
//       if (!obj.typeMap.has(dtype)) obj.typeMap.set(dtype, { type: dtype, qty: 0, wait: 0 });
//       const t = obj.typeMap.get(dtype);
//       t.qty += defect;
//       t.wait += w;
//     });

//     const list = Array.from(map.values()).map(x => {
//       const dayCnt = Math.max(1, x.days.size);
//       const solveRate = x.total > 0 ? ((x.total - x.wait) / x.total * 100) : 0;
//       const types = Array.from(x.typeMap.values())
//         .map(t => ({
//           type: t.type,
//           qty: t.qty,
//           solveRate: t.qty > 0 ? Math.round(((t.qty - t.wait) / t.qty * 100) * 10) / 10 : 0,
//           waitRatio: t.qty > 0 ? Math.round((t.wait / t.qty * 100) * 10) / 10 : 0
//         }))
//         .sort((a,b)=> b.qty - a.qty)
//         .slice(0,5);

//       return {
//         itemCode: x.itemCode,
//         itemName: x.itemName,
//         total: x.total,
//         wait: x.wait,
//         solveRate: Math.round(solveRate * 10) / 10,
//         dailyAvg: Math.round((x.total / dayCnt) * 10) / 10,
//         types
//       };
//     });

//     list.sort((a, b) => b.total - a.total);
//     const top5 = list.slice(0, 5);

//     this.setState(
//       { topByItem: top5, selectedTopItem: top5[0] || null },
//       () => {
//         if (top5[0]) this.loadTopTrendFor(top5[0].itemCode, top5[0].itemName);
//         else this.setState({ selectedTopTrend: [] });
//       }
//     );
//   };

//   loadTopTrendFor = async (itemCode, itemName = "") => {
//     const { filters } = this.state;
//     if (!itemCode) {
//       this.setState({ selectedTopTrend: [] });
//       return;
//     }

//     this.setState({ topTrendLoading: true });
//     try {
//       const headers = { "Content-Type": "application/json" };
//       const body = JSON.stringify({
//         ...this.mapToDefectReq(filters),
//         itemCode,
//         itemName: undefined,
//       });
//       const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/trend`, { method: "POST", headers, body });
//       if (!res.ok) throw new Error("trend by item fail");
//       const j = await res.json();
//       const arr = this.ensureArray(j.data, []);
//       const trend = arr.map(r => {
//         const defect = Number(r.defect || 0);
//         const wait = Number(r.wait || 0);
//         const sr = defect > 0 ? ((defect - wait) / defect * 100) : 0;
//         return { date: r.date, defect, wait, solveRate: Math.round(sr * 10) / 10 };
//       });
//       this.setState({ selectedTopTrend: trend, topTrendLoading: false, selectedTopItem: { itemCode, itemName } });
//     } catch (e) {
//       console.warn(e);
//       this.setState({ selectedTopTrend: [], topTrendLoading: false });
//     }
//   };

//   /* =============== 필터 바 (그대로 유지) =============== */
//   renderFilterBar = () => {
//     const { filters, itemCodeModalOpen } = this.state;

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
//               <SearchIcon /> 검색 조건
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
//                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
//                 {this.state.years.map((y) => (
//                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
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
//           sx={{ backgroundColor: this.props.themeHex, color: "white", borderRadius: 1, mb: 2 }}
//         />

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
//                   <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }}
//           />
//           <TextField
//             fullWidth
//             label="품명"
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
//             sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }}
//           />
//         </Box>

//         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
//           <Divider sx={{ my: 2 }} />
//           <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 2 }}>
//             <TextField
//               fullWidth
//               label="불량유형(부분검색)"
//               value={filters.defectType}
//               onChange={(e) => this.handleFilterChange("defectType", e.target.value)}
//               size="small"
//               variant="outlined"
//             />
//             <TextField
//               fullWidth
//               label="Top N"
//               type="number"
//               value={filters.topN ?? 10}
//               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
//               size="small"
//               variant="outlined"
//             />
//           </Box>
//         </Collapse>

//         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
//           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToAll} size="large" color="secondary">
//             필터 초기화
//           </Button>
//           <Button
//             variant="contained"
//             startIcon={<SearchIcon />}
//             size="large"
//             sx={{ backgroundColor: this.props.themeHex, "&:hover": { backgroundColor: "#f57c00" } }}
//             onClick={() => {
//               this.loadOptions();
//               this.loadAll();
//               this.loadInsights();
//             }}
//           >
//             검색
//           </Button>
//         </Box>

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

//   /** ▶ 새 섹션: 불량유형 도넛 차트 */
//   renderTypeDonut = () => {
//     const { themeHex } = this.props;
//     const rows = Array.isArray(this.state.byType) ? this.state.byType.slice() : [];

//     // 수량 0 제거, 상위 12개만
//     const data = rows
//       .map(r => ({ name: r.type || r.불량유형 || "기타", value: Number(r.qty ?? r.count ?? r.수량 ?? 0) }))
//       .filter(d => d.value > 0)
//       .sort((a,b)=> b.value - a.value)
//       .slice(0, 12);

//     const total = data.reduce((s,x)=>s+x.value,0) || 1;
//     const withPct = data.map((d,i)=> ({ ...d, pct: (d.value/total)*100, color: palette[i % palette.length] }));

//     return (
//       <Paper className={s.section} sx={{ mb: 2 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: themeHex, fontWeight: 800 }}>
//             불량유형 분포 (도넛)
//           </Typography>
//         </Box>
//         <Grid container spacing={2} alignItems="stretch">
//           <Grid item xs={12} md={6} sx={{ height: 360 }}>
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <RTooltip formatter={(v,n,p)=>[`${fmtInt(v)} (${p.payload.pct.toFixed(1)}%)`, n]} />
//                 <Pie
//                   data={withPct}
//                   dataKey="value"
//                   nameKey="name"
//                   innerRadius="55%"
//                   outerRadius="80%"
//                   stroke="#fff"
//                   strokeWidth={2}
//                   paddingAngle={2}
//                   label={(p)=> `${p.name} ${p.payload.pct.toFixed(1)}%`}
//                   labelLine={false}
//                 >
//                   {withPct.map((d,i)=> <Cell key={d.name} fill={d.color} />)}
//                 </Pie>
//               </PieChart>
//             </ResponsiveContainer>
//           </Grid>
//           <Grid item xs={12} md={6}>
//             <TableContainer sx={{ maxHeight: 360 }}>
//               <Table size="small" stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>불량유형</TableCell>
//                     <TableCell align="right">수량</TableCell>
//                     <TableCell align="right">비중</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {withPct.length === 0 && (
//                     <TableRow><TableCell colSpan={3} align="center">데이터가 없습니다.</TableCell></TableRow>
//                   )}
//                   {withPct.map((d)=> (
//                     <TableRow key={d.name}>
//                       <TableCell>
//                         <Box sx={{ display:'inline-flex', alignItems:'center', gap:1 }}>
//                           <Box sx={{ width:10, height:10, borderRadius:'50%', bgcolor:d.color }} />
//                           {d.name}
//                         </Box>
//                       </TableCell>
//                       <TableCell align="right">{fmtInt(d.value)}</TableCell>
//                       <TableCell align="right">{d.pct.toFixed(1)}%</TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//           </Grid>
//         </Grid>
//       </Paper>
//     );
//   };

//   /** ▶ 새 섹션: 품번 Top5 + 선택 품번 추이(좌/우)  */
//   renderTop5WithTrend = () => {
//     const { themeHex } = this.props;
//     const { topByItem, selectedTopItem, selectedTopTrend, topTrendLoading } = this.state;

//     // 좌측 카드
//     const ItemCard = ({ it, onTrend }) => {
//       const solved = it.solveRate;               // %
//       const waitPct = Math.max(0, 100 - solved); // %

//       return (
//         <Paper
//           sx={{
//             p: 2,
//             borderRadius: 2,
//             border: "1px solid #e2e8f0",
//             bgcolor: "#fff",
//           }}
//         >
//           <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: .5 }}>
//             <Typography sx={{ fontWeight: 900, fontSize: 20 }}>{it.itemCode}</Typography>
//             <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
//               <Chip size="small" label={`불량 ${fmtInt(it.total)}개`} />
//               <Chip size="small" variant="outlined" label={`일평균 ${it.dailyAvg}`} />
//             </Box>
//           </Box>
//           <Typography variant="caption" color="text.secondary">—</Typography>

//           {/* 게이지 바 */}
//           <Box sx={{ mt: 1.5, mb: 1 }}>
//             <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: .5 }}>
//               <Typography variant="body2" sx={{ width: 56, color: "text.secondary" }}>해결율</Typography>
//               <Chip size="small" sx={{ bgcolor: "#1b5e20", color: "#fff", borderRadius: 1 }} label={fmtPct(solved,1)} />
//             </Box>
//             <Box sx={{ height: 8, background: "#e8f5e9", borderRadius: 999, mb: 1 }}>
//               <Box sx={{ width: `${Math.min(100, solved)}%`, height: "100%", borderRadius: 999, background: "#2e7d32" }} />
//             </Box>

//             <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: .5 }}>
//               <Typography variant="body2" sx={{ width: 56, color: "text.secondary" }}>대기비중</Typography>
//               <Chip size="small" sx={{ bgcolor: "#fbe9e7", color: "#bf360c", borderRadius: 1 }} label={fmtPct(waitPct,1)} />
//             </Box>
//             <Box sx={{ height: 8, background: "#fbe9e7", borderRadius: 999 }}>
//               <Box sx={{ width: `${Math.min(100, waitPct)}%`, height: "100%", borderRadius: 999, background: "#ff7043" }} />
//             </Box>
//           </Box>

//           {/* 유형 표 */}
//           <TableContainer>
//             <Table size="small" sx={{ "& th, & td": { borderBottom: "none" } }}>
//               <TableHead>
//                 <TableRow>
//                   <TableCell sx={{ color: "#263238", fontWeight: 800 }}>불량유형</TableCell>
//                   <TableCell align="right" sx={{ color: "#263238", fontWeight: 800 }}>수량</TableCell>
//                   <TableCell align="center" sx={{ color: "#263238", fontWeight: 800 }}>해결율</TableCell>
//                   <TableCell align="center" sx={{ color: "#263238", fontWeight: 800 }}>대기</TableCell>
//                 </TableRow>
//               </TableHead>
//               <TableBody>
//                 {it.types.map((t) => (
//                   <TableRow key={t.type}>
//                     <TableCell>
//                       <Chip size="small" variant="outlined" label={t.type} />
//                     </TableCell>
//                     <TableCell align="right">{fmtInt(t.qty)}</TableCell>
//                     <TableCell align="center">
//                       <Chip size="small" sx={{ bgcolor: "#e8f5e9", color: "#1b5e20" }} label={fmtPct(t.solveRate,1)} />
//                     </TableCell>
//                     <TableCell align="center">
//                       <Chip size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100" }} label={fmtPct(t.waitRatio,1)} />
//                     </TableCell>
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </TableContainer>

//           <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
//             <MuiLink component="button" variant="body2" onClick={onTrend} sx={{ color: "#2e7d32", fontWeight: 700 }}>
//               추이 보기
//             </MuiLink>
//           </Box>
//         </Paper>
//       );
//     };

//     const code = selectedTopItem?.itemCode || "";

//     return (
//       <Paper className={s.section} sx={{ mb: 2 }}>
//         <Box className={s.sectionHeader} sx={{ mb: 1 }}>
//           <Typography className={s.sectionTitle} sx={{ color: themeHex, fontWeight: 800 }}>
//             품번별로 많이 나오는 불량(Top 5) ↔ 선택 품번 추이
//           </Typography>
//         </Box>

//         <Grid container spacing={2}>
//           {/* 좌측: Top5 카드 (내부 스크롤) */}
//           <Grid item xs={12} md={5} lg={4}>
//             <Box
//               sx={{
//                 display: "flex",
//                 flexDirection: "column",
//                 gap: 1.2,
//                 maxHeight: 520,
//                 overflowY: "auto",
//                 pr: .5,
//                 scrollbarGutter: "stable",
//               }}
//             >
//               {topByItem.length === 0 ? (
//                 <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>데이터가 없습니다.</Paper>
//               ) : topByItem.map((it) => (
//                 <ItemCard
//                   key={it.itemCode}
//                   it={it}
//                   onTrend={() => this.loadTopTrendFor(it.itemCode, it.itemName)}
//                 />
//               ))}
//             </Box>
//           </Grid>

//           {/* 우측: 추이 차트 */}
//           <Grid item xs={12} md={7} lg={8}>
//             <Paper
//               variant="outlined"
//               sx={{
//                 borderRadius: 2,
//                 p: 1.5,
//                 minHeight: 520,
//                 '& .recharts-wrapper': { overflow: 'visible !important' },
//                 '& .recharts-surface': { overflow: 'visible' },
//               }}
//             >
//               <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
//                 <Typography sx={{ fontWeight: 800, color: themeHex }}>
//                   선택 품번 추이 — {code || "—"}
//                 </Typography>
//                 <Typography variant="caption" color="text.secondary">
//                   막대: 불량수량 / 주황선: 대기 / 초록선: 해결율
//                 </Typography>
//               </Box>

//               <Box sx={{ height: 480 }}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <ComposedChart
//                     data={selectedTopTrend}
//                     margin={{ top: 28, right: 48, bottom: 36, left: 16 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                     <XAxis dataKey="date" tickMargin={8} />
//                     <YAxis yAxisId="left">
//                       <Label value="불량수량(개)" angle={-90} position="insideLeft" />
//                     </YAxis>
//                     <YAxis
//                       yAxisId="right"
//                       orientation="right"
//                       domain={[0, 100]}
//                       tickFormatter={(v) => `${v}%`}
//                     >
//                       <Label value="해결율(%)" angle={-90} position="insideRight" />
//                     </YAxis>

//                     <RTooltip
//                       wrapperStyle={{ zIndex: 10 }}
//                       formatter={(v, n) => {
//                         if (n === "불량수량") return [ (Number(v)||0).toLocaleString(), n ];
//                         if (n === "해결율(%)") return [ `${Number(v).toFixed(1)}%`, n ];
//                         if (n === "대기") return [ (Number(v)||0).toLocaleString(), n ];
//                         return [v, n];
//                       }}
//                     />
//                     <Legend verticalAlign="top" height={24} />

//                     <Bar
//                       yAxisId="left"
//                       dataKey="defect"
//                       name="불량수량"
//                       fill="rgba(66,165,245,.75)"
//                       barSize={14}
//                       radius={[3, 3, 0, 0]}
//                     >
//                       <LabelList
//                         dataKey="defect"
//                         content={(p) => (
//                           <text
//                             x={p.x}
//                             y={p.y - 6}
//                             textAnchor="middle"
//                             fontSize={11}
//                             fill="#546e7a"
//                           >
//                             {(Number(p.value)||0).toLocaleString()}
//                           </text>
//                         )}
//                       />
//                     </Bar>

//                     <Line yAxisId="left" type="monotone" dataKey="wait" name="대기" stroke="#ef6c00" dot={false} />
//                     <Line
//                       yAxisId="right"
//                       type="monotone"
//                       dataKey="solveRate"
//                       name="해결율(%)"
//                       stroke="#26a69a"
//                       dot
//                     >
//                       <LabelList
//                         content={(p) =>
//                           p.value == null ? null : (
//                             <text
//                               x={p.x}
//                               y={p.y - 10}
//                               textAnchor="middle"
//                               fontSize={10}
//                               fill="#26a69a"
//                             >
//                               {`${Number(p.value).toFixed(1)}%`}
//                             </text>
//                           )
//                         }
//                       />
//                     </Line>
//                   </ComposedChart>
//                 </ResponsiveContainer>
//               </Box>

//               {topTrendLoading && <LinearProgress sx={{ mt: 1 }} />}
//             </Paper>
//           </Grid>
//         </Grid>
//       </Paper>
//     );
//   };

//   /** 상단 KPI (유지) */
//   renderTopKpis = () => {
//     const { kpis, trend } = this.state;

//     const arr = (trend || []).map(d => ({ ...d, dObj: new Date(d.date) })).sort((a,b)=>a.dObj-b.dObj);
//     const last7 = arr.slice(-7);
//     const prev7 = arr.slice(-14, -7);

//     const sum = (xs, k) => xs.reduce((s,x)=> s + (Number(x[k]) || 0), 0);
//     const avgNum = (xs, k) => {
//       const vals = xs.map(x => x[k]).filter(v => typeof v === "number");
//       return vals.length ? vals.reduce((a,b)=>a+b,0) / vals.length : null;
//     };

//     const lastRate = avgNum(last7, "defectRate");
//     const prevRate = avgNum(prev7, "defectRate");
//     const deltaRate = (lastRate == null || prevRate == null) ? null : (lastRate - prevRate);

//     const lastDef = sum(last7, "defect");
//     const prevDef = sum(prev7, "defect");
//     const deltaDef = lastDef - prevDef;

//     const cards = [
//       { title: "총 불량(기간)", value: fmtInt(kpis.defect), sub: "판정대기+RWK+폐기", color: "#ff7043" },
//       { title: "불량률(기간)", value: kpis.defectRate == null ? "—" : fmtPct(kpis.defectRate), sub: "생산수량 대비", color: "#ef6c00" },
//       { title: "불량/시간", value: (kpis.defectPerHour == null ? "—" : (kpis.defectPerHour || 0).toLocaleString()), sub: "건/시간", color: "#8e24aa" },
//       { title: "폐기율", value: kpis.scrapRate == null ? "—" : fmtPct(kpis.scrapRate), sub: "생산수량 대비", color: "#1e88e5" },
//       { title: "RWK율", value: kpis.rwkRate == null ? "—" : fmtPct(kpis.rwkRate), sub: "생산수량 대비", color: "#26a69a" },
//     ];

//     return (
//       <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
//         <Grid item xs={12} md={8}>
//           <Grid container spacing={2} alignItems="stretch">
//             {cards.map((c, i) => (
//               <Grid item xs={12} sm={6} md={4} key={i} sx={{ display: 'flex' }}>
//                 <Card className={s.kpiCard} sx={{ flex: 1 }}>
//                   <CardContent className={s.kpiBody}>
//                     <Typography className={s.kpiTitle} sx={{ color: c.color, fontSize: 12, fontWeight: 800 }}>{c.title}</Typography>
//                     <Typography className={s.kpiValue} sx={{ color: c.color, fontSize: 26, fontWeight: 900 }}>{c.value}</Typography>
//                     <Typography className={s.kpiSub} sx={{ fontSize: 12 }}>{c.sub}</Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             ))}
//           </Grid>
//         </Grid>

//         <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
//           <Card className={s.kpiCard} sx={{ flex: 1 }}>
//             <CardContent className={s.kpiBody}>
//               <Typography sx={{ fontSize: 12, fontWeight: 900, color: this.props.themeHex, display: 'flex', alignItems: 'center', gap: 0.5 }}>
//                 <InsightsIcon fontSize="small" /> 최근 7일 스냅샷
//               </Typography>
//               <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 0.5 }}>
//                 <Typography color="text.secondary">불량률(평균)</Typography>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
//                   <b>{lastRate == null ? "—" : fmtPct(lastRate)}</b>
//                   {deltaRate != null ? (
//                     deltaRate >= 0 ? <ArrowUpward color="error" fontSize="small" /> : <ArrowDownward color="success" fontSize="small" />
//                   ) : null}
//                   <Typography variant="caption" color="text.secondary">
//                     {deltaRate == null ? '—' : `${deltaRate>=0?'+':''}${deltaRate.toFixed(2)}%p`}
//                   </Typography>
//                 </Box>
//                 <Typography color="text.secondary">불량수량(합)</Typography>
//                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
//                   <b>{fmtInt(lastDef)}</b>
//                   {deltaDef >= 0 ? <ArrowUpward color="error" fontSize="small" /> : <ArrowDownward color="success" fontSize="small" />}
//                   <Typography variant="caption" color="text.secondary">
//                     {`${deltaDef>=0?'+':''}${fmtInt(deltaDef)}`}
//                   </Typography>
//                 </Box>
//               </Box>

//               <Box sx={{ mt: 1.5, height: 60 }}>
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={arr.slice(-30)}>
//                     <XAxis dataKey="date" hide />
//                     <YAxis hide />
//                     <RTooltip labelFormatter={(l)=>`날짜: ${l}`} formatter={(v,n)=>[n==='불량수량(개)' ? fmtInt(v) : v, n]} />
//                     <Line type="monotone" dataKey="defect" name="불량수량(개)" stroke="#ff7043" dot={false}>
//                       <LabelList content={<ValueLabel />} />
//                     </Line>
//                   </LineChart>
//                 </ResponsiveContainer>
//               </Box>
//             </CardContent>
//           </Card>
//         </Grid>
//       </Grid>
//     );
//   };

//   renderRecurrence = () => {
//     const rows = this.state.recurrence || [];
//     return (
//       <Paper className={s.section} sx={{ mb: 2 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
//             04. 재발 주기(Recurrence) 경고
//           </Typography>
//           <Typography variant="caption" color="text.secondary">최근 3회 간격 평균이 과거 평균 대비 단축 시 경고</Typography>
//         </Box>
//         <TableContainer>
//           <Table size="small">
//             <TableHead>
//               <TableRow>
//                 <TableCell>키(품번|유형)</TableCell>
//                 <TableCell align="right">과거평균(일)</TableCell>
//                 <TableCell align="right">최근평균(일)</TableCell>
//                 <TableCell align="center">상태</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {rows.length === 0 && (
//                 <TableRow><TableCell colSpan={4} align="center">재발 가속 신호가 없습니다.</TableCell></TableRow>
//               )}
//               {rows.map((r, i) => {
//                 const accel = !!r.accel;
//                 return (
//                   <TableRow key={i}>
//                     <TableCell>{r.key}</TableCell>
//                     <TableCell align="right">{(r.pastAvg ?? 0).toFixed(1)}</TableCell>
//                     <TableCell align="right">{(r.recentAvg ?? 0).toFixed(1)}</TableCell>
//                     <TableCell align="center">
//                       {accel ? <Chip size="small" color="error" icon={<ErrorOutlineIcon/>} label="재발 가속" /> : <Chip size="small" label="정상" />}
//                     </TableCell>
//                   </TableRow>
//                 );
//               })}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>
//     );
//   };

//   renderSeasonality = () => {
//     const season = Array.isArray(this.state.seasonality) ? this.state.seasonality : [];
//     return (
//       <Paper className={s.section} sx={{ mb: 2 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
//             05. 시간대/요일 시즌성
//           </Typography>
//           <Typography variant="caption" color="text.secondary">요일·교대·시간대별 비율 차이 관찰</Typography>
//         </Box>
//         <Box sx={{ height: 320 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <ComposedChart data={season}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="bucket">
//                 <Label value="구간" offset={-5} position="insideBottom" />
//               </XAxis>
//               <YAxis yAxisId="left">
//                 <Label value="불량수량(개)" angle={-90} position="insideLeft" />
//               </YAxis>
//               <YAxis yAxisId="right" orientation="right" tickFormatter={(v)=>`${v}%`}>
//                 <Label value="불량률(%)" angle={-90} position="insideRight" />
//               </YAxis>
//               <RTooltip formatter={(v,n)=> {
//                 if (n === "불량수량") return [fmtInt(v), "불량수량"];
//                 if (n === "불량률(%)") return [`${Number(v).toFixed(2)}%`, n];
//                 return [v,n];
//               }} />
//               <Legend />
//               <Bar yAxisId="left" dataKey="defect" name="불량수량" fill="rgba(66,165,245,.75)" barSize={18} radius={[3,3,0,0]}>
//                 <LabelList content={<ValueLabel />} />
//               </Bar>
//               <Line yAxisId="right" type="monotone" dataKey="rate" name="불량률(%)" stroke="#ff7043" dot={false}>
//                 <LabelList content={<PctValueLabel />} />
//               </Line>
//             </ComposedChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>
//     );
//   };

//   renderDefectList = () => {
//     const { defectRows, defectLoading } = this.state;

//     const headers = [
//       { key: "근무일자", label: "근무일자" },
//       { key: "생산_플랜트", label: "플랜트" },
//       { key: "작업장", label: "작업장" },
//       { key: "생산_작업장", label: "라인/설비" },
//       { key: "자재번호", label: "자재번호" },
//       { key: "자재명", label: "자재명" },
//       { key: "불량코드", label: "불량코드" },
//       { key: "불량_유형", label: "불량유형" },
//       { key: "불량_작업자", label: "작업자" },
//       { key: "불량_판정대기", label: "판정대기" },
//       { key: "불량_RWK수량", label: "RWK" },
//       { key: "불량_폐기수량", label: "폐기" },
//       { key: "비고", label: "비고" },
//     ];

//     const toDateStr = (v) => {
//       if (!v) return "";
//       const s = String(v);
//       if (s.length >= 10) return s.substring(0, 10);
//       return s;
//     };

//     const exportCSV = () => {
//       try {
//         const cols = headers.map(h => h.label);
//         const rows = defectRows.map(r => headers.map(h => (r[h.key] ?? "")));
//         const csv = [cols.join(","), ...rows.map(row =>
//           row.map(v => {
//             const s = String(v ?? "");
//             if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
//             return s;
//           }).join(",")
//         )].join("\n");
//         const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//         const url = URL.createObjectURL(blob);
//         const a = document.createElement("a");
//         a.href = url;
//         a.download = `defect_list_${Date.now()}.csv`;
//         a.click();
//         URL.revokeObjectURL(url);
//       } catch (e) {
//         console.error(e);
//       }
//     };

//     return (
//       <Paper className={s.section} sx={{ mt: 2 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
//             선택 기간 불량 리스트
//           </Typography>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
//             <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={exportCSV}>
//               CSV 다운로드
//             </Button>
//           </Box>
//         </Box>

//         {defectLoading && <LinearProgress sx={{ mb: 1 }} />}

//         <TableContainer
//           sx={{
//             maxHeight: 460,
//             borderRadius: 1,
//             "& .MuiTableCell-head": {
//               position: "sticky", top: 0, backgroundColor: this.props.themeHex, color: "#333", zIndex: 1, fontWeight: 800,
//             },
//           }}
//         >
//           <Table size="small" stickyHeader>
//             <TableHead>
//               <TableRow>
//                 {headers.map(h => (
//                   <TableCell key={h.key} align={["판정대기","RWK","폐기"].some(x=>h.label.includes(x)) ? "right" : "left"}>
//                     {h.label}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {defectRows.length === 0 && !defectLoading && (
//                 <TableRow><TableCell colSpan={headers.length} align="center">데이터가 없습니다.</TableCell></TableRow>
//               )}
//               {defectRows.map((r, idx) => (
//                 <TableRow key={idx} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
//                   {headers.map(h => {
//                     let v = r[h.key];
//                     if (h.key === "근무일자") v = toDateStr(v);
//                     if (["불량_판정대기","불량_RWK수량","불량_폐기수량"].includes(h.key)) {
//                       return <TableCell key={h.key} align="right">{fmtInt(v)}</TableCell>;
//                     }
//                     return <TableCell key={h.key}>{v ?? ""}</TableCell>;
//                   })}
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>

//         <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
//           <Typography variant="caption" color="text.secondary">
//             총 {fmtInt(defectRows.length)}건
//           </Typography>
//           <Typography variant="caption" color="text.secondary">
//             * 컬럼은 DB 스키마에 따라 자동 매핑됩니다.
//           </Typography>
//         </Box>
//       </Paper>
//     );
//   };

//   render() {
//     const { themeHex } = this.props;
//     const { error, loading, filters } = this.state;

//     return (
//       <Box className={s.root}>
//         <Box sx={{ mb: 3 }}>
//           <Typography
//             variant="h4"
//             gutterBottom
//             sx={{
//               color: this.props.themeHex,
//               fontWeight: 'bold',
//               display: 'flex',
//               alignItems: 'center',
//               gap: 1,
//             }}
//           >
//             <TrendingUp /> 불량 데이터 분석
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             생산_불량 테이블 기반의 예방형 지표를 제공합니다.
//           </Typography>
//           {filters.partNo && (
//             <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
//               대상 품목: <b>{filters.partNo}</b> {filters.item ? `(${filters.item})` : ""}
//             </Typography>
//           )}
//         </Box>

//         {this.renderFilterBar()}

//         {error && (
//           <Box sx={{ mb: 2 }}>
//             <Paper sx={{ p: 2, borderLeft: `4px solid ${themeHex}` }}>
//               <Typography color="error" sx={{ mb: 1 }}>차트 데이터를 불러오지 못했습니다.</Typography>
//               <Button variant="contained" onClick={() => { this.loadAll(); this.loadInsights(); }} sx={{ backgroundColor: themeHex, "&:hover": { backgroundColor: "#f57c00" } }}>
//                 다시 시도
//               </Button>
//             </Paper>
//           </Box>
//         )}

//         {/* KPI (선택) */}
//         {this.renderTopKpis()}

//         {/* ▶ Top5(좌) + 선택 품번 추이(우) */}
//         {this.renderTop5WithTrend()}

//         {/* ▶ 불량유형 도넛 */}
//         {this.renderTypeDonut()}

//         {/* 04~05만 유지 */}
//         {this.renderRecurrence()}
//         {this.renderSeasonality()}

//         {/* 리스트 */}
//         {this.renderDefectList()}

//         {loading && (
//           <Box sx={{ position: "fixed", bottom: 24, right: 24, background: "#fff", border: "1px solid #eee", borderRadius: 2, px: 2, py: 1, boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
//             <Typography sx={{ fontWeight: 700, color: themeHex }}>불러오는 중…</Typography>
//           </Box>
//         )}
//       </Box>
//     );
//   }
// }

// export default connect(mapStateToProps)(DefectProcessChart);


// src/pages/defect/DefectProcessChart.js
import React, { Component } from "react";
import { connect } from "react-redux";

import {
  Box, Paper, Typography, Grid, Card, CardContent, TextField, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  IconButton, Chip, InputAdornment, CardHeader, Divider, Collapse, Menu, MenuItem,
  Tooltip, LinearProgress, Link as MuiLink
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Line, ReferenceLine,
  ComposedChart, Legend, Label, LabelList, LineChart
} from "recharts";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  TrendingUp,
  Insights as InsightsIcon,
  ArrowUpward, ArrowDownward,
  Download as DownloadIcon,
  ErrorOutline as ErrorOutlineIcon
} from "@mui/icons-material";
import { selectThemeHex, selectThemeKey } from '../../reducers/layout';

import s from "./DefectProcessChart.module.scss";
import config from "../../config";
import InspectionItemModal from "../common/InspectionItemModal";

/* ───────────────────────── 공용 유틸 ───────────────────────── */
const palette = ["#42a5f5","#26a69a","#ff7043","#ab47bc","#66bb6a","#ffa726","#7e57c2","#26c6da","#8d6e63","#ec407a"];
const mainColor = "#ff7043";
const fmtInt = (v) => (Number(v) || 0).toLocaleString();
const fmtPct = (v, digits = 2) => `${(Number(v) || 0).toFixed(digits)}%`;

/** 작은 숫자 라벨 */
const ValueLabel = (props) => {
  const { x, y, value, textAnchor = "middle" } = props;
  if (value === null || value === undefined) return null;
  return (
    <text x={x} y={y - 6} textAnchor={textAnchor} fontSize={11} fill="#546e7a">
      {typeof value === "number" ? fmtInt(value) : value}
    </text>
  );
};
const PctValueLabel = (props) => {
  const { x, y, value, textAnchor = "middle" } = props;
  if (value === null || value === undefined) return null;
  return (
    <text x={x} y={y - 6} textAnchor={textAnchor} fontSize={11} fill="#546e7a">
      {`${Number(value).toFixed(2)}%`}
    </text>
  );
};

/* ───────────────────────── 날짜/프리셋 ───────────────────────── */
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
    const s = new Date(cur), e = endOfWeek(cur);
    const clipS = new Date(Math.max(s, first));
    const clipE = new Date(Math.min(e, last));
    out.push({ label: `${idx}주차`, start: clipS, end: clipE });
    idx += 1;
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
  }
  return out;
};

/* ───────────────────────── 기본 필터(필터 바 유지) ───────────────────────── */
const getDefaultFilters = () => {
  const now = today0();
  const start = new Date(now.getFullYear(), 0, 1);
  return {
    start_date: iso(start),
    end_date: "", // 최신 work_date로 채움
    factory: "아진산업-본사(경산)",
    process: "프레스",
    equipment: "1500T(E라인)",
    partNo: "",
    item: "",
    // 추가 필터
    defectType: "",
    topN: 10,
  };
};

function mapStateToProps(state) {
  return {
    themeHex: selectThemeHex(state),
    themeKey: selectThemeKey(state),
  };
}

/* ───────────────────────── 본문 컴포넌트 ───────────────────────── */
class DefectProcessChart extends Component {
  state = {
    // ===== 필터 / 옵션 (필터 바는 동일) =====
    filters: getDefaultFilters(),
    factories: [],
    processes: [],
    equipments: [],
    optionsLoading: false,

    // 날짜 프리셋
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    yearAnchorPos: null,
    monthAnchorPos: null,
    weekAnchorPos: null,
    years: [],

    // 모달
    itemCodeModalOpen: false,

    // ===== 기본 데이터 =====
    kpis: { good: 0, defect: 0, wait: 0, rwk: 0, scrap: 0, throughput: 0, defectRate: null, scrapRate: null, rwkRate: null, opMinutes: 0, opHours: 0, defectPerHour: null },
    byType: [],
    trend: [],
    stacked: [],

    // ===== 인사이트 (04,05만 유지) =====
    recurrence: [],
    seasonality: [],

    // 불량 리스트
    defectRows: [],
    defectLoading: false,

    // ▶ Top5(품번별) + 우측 추이
    topByItem: [],                 // [{ itemCode, itemName, total, wait, solveRate, dailyAvg, types: [{type, qty, solveRate, waitRatio}] }]
    selectedTopItem: null,         // {itemCode, itemName}
    selectedTopTrend: [],          // [{date, defect, wait, solveRate}]
    topTrendLoading: false,

    // ===== UI =====
    loading: false,
    error: "",
    filterExpanded: false,
  };

  /* 공통 POST (검사 그리드 옵션/최신일자 재사용) */
  postGrid = async (path, body) => {
    const headers = { "Content-Type": "application/json" };
    const url = `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/inspection_grid${path}`;
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body || {}) });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
    }
    const json = await res.json();
    return json.data || [];
  };

  mapToDefectListReq = (f) => {
    const todayIso = new Date().toLocaleDateString("sv-SE");
    const start = f.start_date || undefined;
    const end = f.end_date || f.start_date || todayIso;
    const itemInfo = f.partNo && String(f.partNo).trim() ? String(f.partNo).trim() : undefined;

    return {
      start_work_date: start,
      end_work_date: end,
      plant: f.factory || undefined,
      workplace: f.process || undefined,
      line: f.equipment || undefined,
      itemInfo,
      defectType: f.defectType || undefined,
    };
  };

  mapToDefectReq = (f) => {
    const todayIso = new Date().toLocaleDateString("sv-SE");
    const itemCode = (f.partNo && String(f.partNo).trim()) ? String(f.partNo).trim() : undefined;
    const itemName = (f.item && String(f.item).trim()) ? String(f.item).trim() : undefined;

    return {
      start_date: f.start_date || undefined,
      end_date: f.end_date || f.start_date || todayIso,
      plant: f.factory || undefined,
      workplace: f.process || undefined,
      line: f.equipment || undefined,
      defectType: f.defectType || undefined,
      topN: f.topN || 10,
      itemCode,
      itemName,
      itemInfo: itemCode,
    };
  };

  async componentDidMount() {
    const saved = localStorage.getItem("defectFilters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.setState({ filters: { ...this.state.filters, ...parsed } });
      } catch {}
    }
    await this.bootstrap();
  }

  bootstrap = async () => {
    await this.loadYears();
    await this.ensureDefaultDbLastDate();
    await this.loadOptions();
    await this.loadAll();
    await this.loadInsights();
  };

  loadYears = async () => {
    const y = new Date().getFullYear();
    this.setState({ years: [y, y - 1, y - 2, y - 3, y - 4], selectedYear: y });
  };

  ensureDefaultDbLastDate = async () => {
    const { filters } = this.state;
    if (filters.end_date) return;

    const todayIso = new Date().toLocaleDateString("sv-SE");
    let endDate = "";

    try {
      const lastDate = await this.postGrid("/options/latest_date", {});
      if (typeof lastDate === "string" && lastDate.trim()) {
        endDate = lastDate.trim();
      }
    } catch (e) {
      console.warn("최신 날짜 조회 실패, 보정값 사용:", e?.message || e);
    }

    if (!endDate) endDate = filters.start_date || todayIso;

    this.setState(
      (prev) => ({ filters: { ...prev.filters, end_date: endDate } }),
      () => {
        try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
      }
    );
  };

  loadOptions = async () => {
    const { filters } = this.state;
    this.setState({ optionsLoading: true });
    try {
      const reqBase = {
        start_work_date: filters.start_date || undefined,
        end_work_date: filters.end_date || undefined,
        plant: filters.factory || undefined,
        process: filters.process || undefined,
        equipment: filters.equipment || undefined,
      };
      const [factories, processes, equipments] = await Promise.all([
        this.postGrid("/options/plants", { start_work_date: reqBase.start_work_date, end_work_date: reqBase.end_work_date }),
        this.postGrid("/options/processes", { ...reqBase }),
        this.postGrid("/options/equipments", { ...reqBase }),
      ]);

      const fixed = { ...filters };
      if (fixed.factory && factories.length && !factories.includes(fixed.factory)) fixed.factory = "";
      if (fixed.process && processes.length && !processes.includes(fixed.process)) fixed.process = "";
      if (fixed.equipment && equipments.length && !equipments.includes(fixed.equipment)) fixed.equipment = "";

      this.setState({
        factories, processes, equipments, optionsLoading: false, filters: fixed,
      });
    } catch (e) {
      console.error(e);
      this.setState({ optionsLoading: false });
    }
  };

  handleFilterChange = async (field, value) => {
    this.setState(
      (prev) => {
        const f = { ...prev.filters, [field]: value };
        if (field === "factory") {
          f.process = ""; f.equipment = ""; f.partNo = ""; f.item = "";
        } else if (field === "process") {
          f.equipment = ""; f.partNo = ""; f.item = "";
        } else if (field === "equipment") {
          f.partNo = ""; f.item = "";
        } else if (field === "topN") {
          f.topN = Number(value) || 10;
        }
        return { filters: f };
      },
      async () => {
        try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
        await this.loadOptions();
        await this.loadAll();
        await this.loadInsights();
      }
    );
  };

  setDateRange = async (start, end) => {
    const start_date = start ? iso(start) : "";
    const end_date = end ? iso(end) : "";
    this.setState(
      (prev) => ({ filters: { ...prev.filters, start_date, end_date } }),
      async () => {
        try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
        await this.loadOptions();
        await this.loadAll();
        await this.loadInsights();
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

  resetToAll = async () => {
    const filters = getDefaultFilters();
    this.setState(
      { filters, selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1 },
      async () => {
        try { localStorage.removeItem("defectFilters"); } catch {}
        await this.ensureDefaultDbLastDate();
        await this.loadOptions();
        await this.loadAll();
        await this.loadInsights();
      }
    );
  };

  openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
  closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
  handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
    this.setState(
      (prev) => ({
        filters: { ...prev.filters, partNo: 품목번호 || "", item: 품목명 || "" },
        itemCodeModalOpen: false,
      }),
      async () => {
        await this.loadAll();
        await this.loadInsights();
      }
    );
  };

  safeRate = (good, defect) => {
    const g = Number(good) || 0;
    const d = Number(defect) || 0;
    const th = g + d;
    if (th <= 0 || g <= 0) return null;
    return Number(((d / th) * 100).toFixed(2));
  };

  movingAvg = (arr, key = "rate", w = 7) => {
    if (!Array.isArray(arr) || !arr.length) return [];
    return arr.map((_, i) => {
      const sliceVals = arr
        .slice(Math.max(0, i - w + 1), i + 1)
        .map(d => d[key])
        .filter(v => typeof v === "number");
      const ma = sliceVals.length
        ? Math.round((sliceVals.reduce((s, v) => s + v, 0) / sliceVals.length) * 100) / 100
        : null;
      return { ...arr[i], ma };
    });
  };

  ensureArray = (data, fallback = []) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === "object") {
      if (Array.isArray(data.data)) return data.data;
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.rows)) return data.rows;
    }
    return fallback;
  };

  loadAll = async () => {
    const { filters } = this.state;
    this.setState({ loading: true, error: "" });
    try {
      const headers = { "Content-Type": "application/json" };
      const body = JSON.stringify(this.mapToDefectReq(filters));

      const [kpisRes, typeRes, trendRes, stackedRes] = await Promise.all([
        fetch(`${config.baseURLApi}/smartFactory/defect_chart/kpis`,    { method: "POST", headers, body }),
        fetch(`${config.baseURLApi}/smartFactory/defect_chart/by_type`, { method: "POST", headers, body }),
        fetch(`${config.baseURLApi}/smartFactory/defect_chart/trend`,   { method: "POST", headers, body }),
        fetch(`${config.baseURLApi}/smartFactory/defect_chart/stacked`, { method: "POST", headers, body }),
      ]);

      if (!kpisRes.ok || !typeRes.ok || !trendRes.ok || !stackedRes.ok) {
        throw new Error("기본 차트 API 호출 오류");
      }

      const kpisJson = await kpisRes.json();
      const typeJson = await typeRes.json();
      const trendJson = await trendRes.json();
      const stackedJson = await stackedRes.json();

      const trendArr = this.ensureArray(trendJson.data, []);
      const safeKpis = {
        ...this.state.kpis,
        ...(kpisJson.data || {}),
        defectRate: typeof kpisJson?.data?.defectRate === "number" ? kpisJson.data.defectRate : null,
        scrapRate:  typeof kpisJson?.data?.scrapRate  === "number" ? kpisJson.data.scrapRate  : null,
        rwkRate:    typeof kpisJson?.data?.rwkRate    === "number" ? kpisJson.data.rwkRate    : null,
        defectPerHour: typeof kpisJson?.data?.defectPerHour === "number" ? kpisJson.data.defectPerHour : null,
      };

      this.setState({
        kpis: safeKpis,
        byType: this.ensureArray(typeJson.data, []),
        trend: trendArr,
        stacked: this.ensureArray(stackedJson.data, []),
        loading: false,
      });

      await this.loadDefectList();
    } catch (e) {
      console.error(e);
      this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
      await this.loadDefectList();
    }
  };

  /** 04, 05만 유지 */
  loadInsights = async () => {
    const { filters } = this.state;
    const headers = { "Content-Type": "application/json" };
    const baseBody = this.mapToDefectReq(filters);

    const p4 = (async () => {
      try {
        const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/recurrence`, { method: "POST", headers, body: JSON.stringify(baseBody) });
        if (!res.ok) throw new Error("recurrence fail");
        const j = await res.json();
        this.setState({ recurrence: this.ensureArray(j.data, []) });
      } catch (e) {
        console.warn("recurrence error:", e?.message || e);
        this.setState({ recurrence: [] });
      }
    })();

    const p5 = (async () => {
      try {
        const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/seasonality`, { method: "POST", headers, body: JSON.stringify(baseBody) });
        if (!res.ok) throw new Error("seasonality fail");
        const j = await res.json();
        const arr = this.ensureArray(j.data, []);
        this.setState({ seasonality: arr });
      } catch (e) {
        console.warn("seasonality error:", e?.message || e);
        this.setState({ seasonality: [] });
      }
    })();

    await Promise.all([p4, p5]);
  };

  loadDefectList = async () => {
    const { filters } = this.state;
    this.setState({ defectLoading: true });

    try {
      const headers = { "Content-Type": "application/json" };
      const baseReq = this.mapToDefectListReq(filters);

      const todayIso = new Date().toLocaleDateString("sv-SE");
      const bodyObj = {
        ...baseReq,
        end_work_date: baseReq.end_work_date || baseReq.start_work_date || todayIso,
      };
      if (!bodyObj.itemInfo || !String(bodyObj.itemInfo).trim()) {
        delete bodyObj.itemInfo;
      }

      const res = await fetch(
        `${config.baseURLApi}/smartFactory/defect_grid/list`,
        { method: "POST", headers, body: JSON.stringify(bodyObj) }
      );
      if (!res.ok) throw new Error(`defect_grid/list 실패: ${res.status}`);
      const json = await res.json();

      const rows = Array.isArray(json?.data) ? json.data : [];
      this.setState({ defectRows: rows, defectLoading: false }, () => {
        this.buildTop5FromRows(rows);
      });
    } catch (e) {
      console.error(e);
      this.setState({ defectRows: [], defectLoading: false, topByItem: [], selectedTopItem: null, selectedTopTrend: [] });
    }
  };

  /** ▶ 품번별 Top5 + 유형 breakdown 생성 */
  buildTop5FromRows = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) {
      this.setState({ topByItem: [], selectedTopItem: null, selectedTopTrend: [] });
      return;
    }

    // itemCode 기반 집계
    const map = new Map();
    rows.forEach(r => {
      const code = (r["자재번호"] || "").trim();
      if (!code) return;
      const name = (r["자재명"] || "").trim();

      const w = Number(r["불량_판정대기"] || 0);
      const rwk = Number(r["불량_RWK수량"] || 0);
      const scrap = Number(r["불량_폐기수량"] || 0);
      const defect = w + rwk + scrap;
      const dtype = (r["불량_유형"] || "기타").toString().trim() || "기타";

      if (!map.has(code)) {
        map.set(code, { itemCode: code, itemName: name, total: 0, wait: 0, days: new Set(), typeMap: new Map() });
      }
      const obj = map.get(code);
      obj.total += defect;
      obj.wait += w;

      // 일자 집계
      const dRaw = (r["근무일자"] || "").toString();
      const d =
        dRaw.length >= 10 ? dRaw.substring(0, 10) :
        dRaw.length === 8 ? `${dRaw.substring(0,4)}-${dRaw.substring(4,6)}-${dRaw.substring(6,8)}` :
        dRaw;
      if (d) obj.days.add(d);

      // 유형별 집계
      if (!obj.typeMap.has(dtype)) obj.typeMap.set(dtype, { type: dtype, qty: 0, wait: 0 });
      const t = obj.typeMap.get(dtype);
      t.qty += defect;
      t.wait += w;
    });

    const list = Array.from(map.values()).map(x => {
      const dayCnt = Math.max(1, x.days.size);
      const solveRate = x.total > 0 ? ((x.total - x.wait) / x.total * 100) : 0;
      const types = Array.from(x.typeMap.values())
        .map(t => ({
          type: t.type,
          qty: t.qty,
          solveRate: t.qty > 0 ? Math.round(((t.qty - t.wait) / t.qty * 100) * 10) / 10 : 0,
          waitRatio: t.qty > 0 ? Math.round((t.wait / t.qty * 100) * 10) / 10 : 0
        }))
        .sort((a,b)=> b.qty - a.qty)
        .slice(0,5);

      return {
        itemCode: x.itemCode,
        itemName: x.itemName,
        total: x.total,
        wait: x.wait,
        solveRate: Math.round(solveRate * 10) / 10,
        dailyAvg: Math.round((x.total / dayCnt) * 10) / 10,
        types
      };
    });

    list.sort((a, b) => b.total - a.total);
    const top5 = list.slice(0, 5);

    this.setState(
      { topByItem: top5, selectedTopItem: top5[0] || null },
      () => {
        if (top5[0]) this.loadTopTrendFor(top5[0].itemCode, top5[0].itemName);
        else this.setState({ selectedTopTrend: [] });
      }
    );
  };

  loadTopTrendFor = async (itemCode, itemName = "") => {
    const { filters } = this.state;
    if (!itemCode) {
      this.setState({ selectedTopTrend: [] });
      return;
    }

    this.setState({ topTrendLoading: true });
    try {
      const headers = { "Content-Type": "application/json" };
      const body = JSON.stringify({
        ...this.mapToDefectReq(filters),
        itemCode,
        itemName: undefined,
      });
      const res = await fetch(`${config.baseURLApi}/smartFactory/defect_chart/trend`, { method: "POST", headers, body });
      if (!res.ok) throw new Error("trend by item fail");
      const j = await res.json();
      const arr = this.ensureArray(j.data, []);
      const trend = arr.map(r => {
        const defect = Number(r.defect || 0);
        const wait = Number(r.wait || 0);
        const sr = defect > 0 ? ((defect - wait) / defect * 100) : 0;
        return { date: r.date, defect, wait, solveRate: Math.round(sr * 10) / 10 };
      });
      this.setState({ selectedTopTrend: trend, topTrendLoading: false, selectedTopItem: { itemCode, itemName } });
    } catch (e) {
      console.warn(e);
      this.setState({ selectedTopTrend: [], topTrendLoading: false });
    }
  };

  /* =============== 필터 바 (그대로 유지) =============== */
  renderFilterBar = () => {
    const { filters, itemCodeModalOpen } = this.state;

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
              <SearchIcon /> 검색 조건
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
                <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
                {this.state.years.map((y) => (
                  <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
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
          sx={{ backgroundColor: this.props.themeHex, color: "white", borderRadius: 1, mb: 2 }}
        />

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
                  <KeyboardArrowDownIcon sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
            sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }}
          />
          <TextField
            fullWidth
            label="품명"
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
            sx={{ "& .MuiInputBase-root": { cursor: "pointer", "&:hover": { backgroundColor: "#f5f5f5" } } }}
          />
        </Box>

        <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 2 }}>
            <TextField
              fullWidth
              label="불량유형(부분검색)"
              value={filters.defectType}
              onChange={(e) => this.handleFilterChange("defectType", e.target.value)}
              size="small"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Top N"
              type="number"
              value={filters.topN ?? 10}
              onChange={(e) => this.handleFilterChange("topN", e.target.value)}
              size="small"
              variant="outlined"
            />
          </Box>
        </Collapse>

        <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToAll} size="large" color="secondary">
            필터 초기화
          </Button>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            size="large"
            sx={{ backgroundColor: this.props.themeHex, "&:hover": { backgroundColor: "#f57c00" } }}
            onClick={() => {
              this.loadOptions();
              this.loadAll();
              this.loadInsights();
            }}
          >
            검색
          </Button>
        </Box>

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

  /** ▶ 새 섹션: 불량유형 도넛 차트 */
  renderTypeDonut = () => {
    const { themeHex } = this.props;
    const rows = Array.isArray(this.state.byType) ? this.state.byType.slice() : [];

    // 수량 0 제거, 상위 12개만
    const data = rows
      .map(r => ({ name: r.type || r.불량유형 || "기타", value: Number(r.qty ?? r.count ?? r.수량 ?? 0) }))
      .filter(d => d.value > 0)
      .sort((a,b)=> b.value - a.value)
      .slice(0, 12);

    const total = data.reduce((s,x)=>s+x.value,0) || 1;
    const withPct = data.map((d,i)=> ({ ...d, pct: (d.value/total)*100, color: palette[i % palette.length] }));

    return (
      <Paper className={s.section} sx={{ mb: 2 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: themeHex, fontWeight: 800 }}>
            불량유형 분포 (도넛)
          </Typography>
        </Box>
        <Grid container spacing={2} alignItems="stretch">
          <Grid item xs={12} md={6} sx={{ height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <RTooltip formatter={(v,n,p)=>[`${fmtInt(v)} (${p.payload.pct.toFixed(1)}%)`, n]} />
                <Pie
                  data={withPct}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="55%"
                  outerRadius="80%"
                  stroke="#fff"
                  strokeWidth={2}
                  paddingAngle={2}
                  label={(p)=> `${p.name} ${p.payload.pct.toFixed(1)}%`}
                  labelLine={false}
                >
                  {withPct.map((d,i)=> <Cell key={d.name} fill={d.color} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </Grid>
          <Grid item xs={12} md={6}>
            <TableContainer sx={{ maxHeight: 360 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>불량유형</TableCell>
                    <TableCell align="right">수량</TableCell>
                    <TableCell align="right">비중</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {withPct.length === 0 && (
                    <TableRow><TableCell colSpan={3} align="center">데이터가 없습니다.</TableCell></TableRow>
                  )}
                  {withPct.map((d)=> (
                    <TableRow key={d.name}>
                      <TableCell>
                        <Box sx={{ display:'inline-flex', alignItems:'center', gap:1 }}>
                          <Box sx={{ width:10, height:10, borderRadius:'50%', bgcolor:d.color }} />
                          {d.name}
                        </Box>
                      </TableCell>
                      <TableCell align="right">{fmtInt(d.value)}</TableCell>
                      <TableCell align="right">{d.pct.toFixed(1)}%</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  /** ▶ 새 섹션: 품번 Top5 + 선택 품번 추이(좌/우)  */
  renderTop5WithTrend = () => {
    const { themeHex } = this.props;
    const { topByItem, selectedTopItem, selectedTopTrend, topTrendLoading } = this.state;

    // 좌측 카드
    const ItemCard = ({ it, onTrend }) => {
      const solved = it.solveRate;               // %
      const waitPct = Math.max(0, 100 - solved); // %

      return (
        <Paper
          sx={{
            p: 2,
            borderRadius: 2,
            border: "1px solid #e2e8f0",
            bgcolor: "#fff",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: .5 }}>
            <Typography sx={{ fontWeight: 900, fontSize: 20 }}>{it.itemCode}</Typography>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Chip size="small" label={`불량 ${fmtInt(it.total)}개`} />
              <Chip size="small" variant="outlined" label={`일평균 ${it.dailyAvg}`} />
            </Box>
          </Box>
          <Typography variant="caption" color="text.secondary">—</Typography>

          {/* 게이지 바 */}
          <Box sx={{ mt: 1.5, mb: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: .5 }}>
              <Typography variant="body2" sx={{ width: 56, color: "text.secondary" }}>해결율</Typography>
              <Chip size="small" sx={{ bgcolor: "#1b5e20", color: "#fff", borderRadius: 1 }} label={fmtPct(solved,1)} />
            </Box>
            <Box sx={{ height: 8, background: "#e8f5e9", borderRadius: 999, mb: 1 }}>
              <Box sx={{ width: `${Math.min(100, solved)}%`, height: "100%", borderRadius: 999, background: "#2e7d32" }} />
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: .5 }}>
              <Typography variant="body2" sx={{ width: 56, color: "text.secondary" }}>대기비중</Typography>
              <Chip size="small" sx={{ bgcolor: "#fbe9e7", color: "#bf360c", borderRadius: 1 }} label={fmtPct(waitPct,1)} />
            </Box>
            <Box sx={{ height: 8, background: "#fbe9e7", borderRadius: 999 }}>
              <Box sx={{ width: `${Math.min(100, waitPct)}%`, height: "100%", borderRadius: 999, background: "#ff7043" }} />
            </Box>
          </Box>

          {/* 유형 표 */}
          <TableContainer>
            <Table size="small" sx={{ "& th, & td": { borderBottom: "none" } }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: "#263238", fontWeight: 800 }}>불량유형</TableCell>
                  <TableCell align="right" sx={{ color: "#263238", fontWeight: 800 }}>수량</TableCell>
                  <TableCell align="center" sx={{ color: "#263238", fontWeight: 800 }}>해결율</TableCell>
                  <TableCell align="center" sx={{ color: "#263238", fontWeight: 800 }}>대기</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {it.types.map((t) => (
                  <TableRow key={t.type}>
                    <TableCell>
                      <Chip size="small" variant="outlined" label={t.type} />
                    </TableCell>
                    <TableCell align="right">{fmtInt(t.qty)}</TableCell>
                    <TableCell align="center">
                      <Chip size="small" sx={{ bgcolor: "#e8f5e9", color: "#1b5e20" }} label={fmtPct(t.solveRate,1)} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip size="small" sx={{ bgcolor: "#fff3e0", color: "#e65100" }} label={fmtPct(t.waitRatio,1)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
            <MuiLink component="button" variant="body2" onClick={onTrend} sx={{ color: "#2e7d32", fontWeight: 700 }}>
              추이 보기
            </MuiLink>
          </Box>
        </Paper>
      );
    };

    const code = selectedTopItem?.itemCode || "";

    return (
      <Paper className={s.section} sx={{ mb: 2 }}>
        <Box className={s.sectionHeader} sx={{ mb: 1 }}>
          <Typography className={s.sectionTitle} sx={{ color: themeHex, fontWeight: 800 }}>
            품번별 불량 내역
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* 좌측: Top5 카드 (내부 스크롤) */}
          <Grid item xs={12} md={5} lg={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.2,
                maxHeight: 520,
                overflowY: "auto",
                pr: .5,
                scrollbarGutter: "stable",
              }}
            >
              {topByItem.length === 0 ? (
                <Paper sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>데이터가 없습니다.</Paper>
              ) : topByItem.map((it) => (
                <ItemCard
                  key={it.itemCode}
                  it={it}
                  onTrend={() => this.loadTopTrendFor(it.itemCode, it.itemName)}
                />
              ))}
            </Box>
          </Grid>

          {/* 우측: 추이 차트 */}
          <Grid item xs={12} md={7} lg={8}>
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                p: 1.5,
                minHeight: 520,
                '& .recharts-wrapper': { overflow: 'visible !important' },
                '& .recharts-surface': { overflow: 'visible' },
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontWeight: 800, color: themeHex }}>
                  선택 품번 추이 — {code || "—"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  막대: 불량수량 / 주황선: 대기 / 초록선: 해결율
                </Typography>
              </Box>

              <Box sx={{ height: 480 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={selectedTopTrend}
                    margin={{ top: 28, right: 48, bottom: 36, left: 16 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tickMargin={8} />
                    <YAxis yAxisId="left">
                      <Label value="불량수량(개)" angle={-90} position="insideLeft" />
                    </YAxis>
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                    >
                      <Label value="해결율(%)" angle={-90} position="insideRight" />
                    </YAxis>

                    <RTooltip
                      wrapperStyle={{ zIndex: 10 }}
                      formatter={(v, n) => {
                        if (n === "불량수량") return [ (Number(v)||0).toLocaleString(), n ];
                        if (n === "해결율(%)") return [ `${Number(v).toFixed(1)}%`, n ];
                        if (n === "대기") return [ (Number(v)||0).toLocaleString(), n ];
                        return [v, n];
                      }}
                    />
                    <Legend verticalAlign="top" height={24} />

                    <Bar
                      yAxisId="left"
                      dataKey="defect"
                      name="불량수량"
                      fill="rgba(66,165,245,.75)"
                      barSize={14}
                      radius={[3, 3, 0, 0]}
                    >
                      <LabelList
                        dataKey="defect"
                        content={(p) => (
                          <text
                            x={p.x}
                            y={p.y - 6}
                            textAnchor="middle"
                            fontSize={11}
                            fill="#546e7a"
                          >
                            {(Number(p.value)||0).toLocaleString()}
                          </text>
                        )}
                      />
                    </Bar>

                    <Line yAxisId="left" type="monotone" dataKey="wait" name="대기" stroke="#ef6c00" dot={false} />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="solveRate"
                      name="해결율(%)"
                      stroke="#26a69a"
                      dot
                    >
                      <LabelList
                        content={(p) =>
                          p.value == null ? null : (
                            <text
                              x={p.x}
                              y={p.y - 10}
                              textAnchor="middle"
                              fontSize={10}
                              fill="#26a69a"
                            >
                              {`${Number(p.value).toFixed(1)}%`}
                            </text>
                          )
                        }
                      />
                    </Line>
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>

              {topTrendLoading && <LinearProgress sx={{ mt: 1 }} />}
            </Paper>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  /** 상단 KPI (유지) */
  renderTopKpis = () => {
    const { kpis, trend } = this.state;

    // ── 하드코딩: 100% 불량률은 숨김 처리용(평균/증감 계산에서도 제외)
    const arr = (trend || [])
      .map(d => ({
        ...d,
        dObj: new Date(d.date),
        defectRate: (typeof d.defectRate === "number" && d.defectRate < 100) ? d.defectRate : null
      }))
      .sort((a,b)=>a.dObj-b.dObj);

    const last7 = arr.slice(-7);
    const prev7 = arr.slice(-14, -7);

    const sum = (xs, k) => xs.reduce((s,x)=> s + (Number(x[k]) || 0), 0);
    const avgNum = (xs, k) => {
      const vals = xs.map(x => x[k]).filter(v => typeof v === "number");
      return vals.length ? vals.reduce((a,b)=>a+b,0) / vals.length : null;
    };

    const lastRate = avgNum(last7, "defectRate");
    const prevRate = avgNum(prev7, "defectRate");
    const deltaRate = (lastRate == null || prevRate == null) ? null : (lastRate - prevRate);

    const lastDef = sum(last7, "defect");
    const prevDef = sum(prev7, "defect");
    const deltaDef = lastDef - prevDef;

    // ── 하드코딩: KPI 카드 표시용 값에서 100% 불량률 숨김
    const displayDefectRate = (kpis.defectRate != null && kpis.defectRate < 100)
      ? fmtPct(kpis.defectRate)
      : "0.00%";

    const cards = [
      { title: "총 불량(기간)", value: fmtInt(kpis.defect), sub: "판정대기+RWK+폐기", color: "#ff7043" },
      { title: "불량률(기간)", value: displayDefectRate, sub: "생산수량 대비", color: "#ef6c00" },
      { title: "불량/시간", value: (kpis.defectPerHour == null ? "—" : (kpis.defectPerHour || 0).toLocaleString()), sub: "건/시간", color: "#8e24aa" },
    ];

    return (
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
        <Grid item xs={12} md={8}>
          <Grid container spacing={2} alignItems="stretch">
            {cards.map((c, i) => (
              <Grid item xs={12} sm={6} md={4} key={i} sx={{ display: 'flex' }}>
                <Card className={s.kpiCard} sx={{ flex: 1 }}>
                  <CardContent className={s.kpiBody}>
                    <Typography className={s.kpiTitle} sx={{ color: c.color, fontSize: 12, fontWeight: 800 }}>{c.title}</Typography>
                    <Typography className={s.kpiValue} sx={{ color: c.color, fontSize: 26, fontWeight: 900 }}>{c.value}</Typography>
                    <Typography className={s.kpiSub} sx={{ fontSize: 12 }}>{c.sub}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
          <Card className={s.kpiCard} sx={{ flex: 1 }}>
            <CardContent className={s.kpiBody}>
              <Typography sx={{ fontSize: 12, fontWeight: 900, color: this.props.themeHex, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <InsightsIcon fontSize="small" /> 최근 7일 스냅샷
              </Typography>
              <Box sx={{ mt: 1.5, display: 'grid', gridTemplateColumns: '1fr auto', rowGap: 0.5 }}>
                <Typography color="text.secondary">불량률(평균)</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                  <b>{lastRate == null ? "0.00%" : fmtPct(lastRate)}</b>
                  {deltaRate != null ? (
                    deltaRate >= 0 ? <ArrowUpward color="error" fontSize="small" /> : <ArrowDownward color="success" fontSize="small" />
                  ) : null}
                  <Typography variant="caption" color="text.secondary">
                    {deltaRate == null ? '0.00%' : `${deltaRate>=0?'+':''}${deltaRate.toFixed(2)}%p`}
                  </Typography>
                </Box>
                <Typography color="text.secondary">불량수량(합)</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-end' }}>
                  <b>{fmtInt(lastDef)}</b>
                  {deltaDef >= 0 ? <ArrowUpward color="error" fontSize="small" /> : <ArrowDownward color="success" fontSize="small" />}
                  <Typography variant="caption" color="text.secondary">
                    {`${deltaDef>=0?'+':''}${fmtInt(deltaDef)}`}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mt: 1.5, height: 60 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={arr.slice(-30)}>
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <RTooltip labelFormatter={(l)=>`날짜: ${l}`} formatter={(v,n)=>[n==='불량수량(개)' ? fmtInt(v) : v, n]} />
                    <Line type="monotone" dataKey="defect" name="불량수량(개)" stroke="#ff7043" dot={false}>
                      <LabelList content={<ValueLabel />} />
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  renderRecurrence = () => {
    const rows = this.state.recurrence || [];
    return (
      <Paper className={s.section} sx={{ mb: 2 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
            04. 재발 주기(Recurrence) 경고
          </Typography>
          <Typography variant="caption" color="text.secondary">최근 3회 간격 평균이 과거 평균 대비 단축 시 경고</Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>키(품번|유형)</TableCell>
                <TableCell align="right">과거평균(일)</TableCell>
                <TableCell align="right">최근평균(일)</TableCell>
                <TableCell align="center">상태</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={4} align="center">재발 가속 신호가 없습니다.</TableCell></TableRow>
              )}
              {rows.map((r, i) => {
                const accel = !!r.accel;
                return (
                  <TableRow key={i}>
                    <TableCell>{r.key}</TableCell>
                    <TableCell align="right">{(r.pastAvg ?? 0).toFixed(1)}</TableCell>
                    <TableCell align="right">{(r.recentAvg ?? 0).toFixed(1)}</TableCell>
                    <TableCell align="center">
                      {accel ? <Chip size="small" color="error" icon={<ErrorOutlineIcon/>} label="재발 가속" /> : <Chip size="small" label="정상" />}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  renderSeasonality = () => {
    const season = Array.isArray(this.state.seasonality) ? this.state.seasonality : [];
    return (
      <Paper className={s.section} sx={{ mb: 2 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
            05. 시간대/요일 시즌성
          </Typography>
          <Typography variant="caption" color="text.secondary">요일·교대·시간대별 비율 차이 관찰</Typography>
        </Box>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={season}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="bucket">
                <Label value="구간" offset={-5} position="insideBottom" />
              </XAxis>
              <YAxis yAxisId="left">
                <Label value="불량수량(개)" angle={-90} position="insideLeft" />
              </YAxis>
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v)=>`${v}%`}>
                <Label value="불량률(%)" angle={-90} position="insideRight" />
              </YAxis>
              <RTooltip formatter={(v,n)=> {
                if (n === "불량수량") return [fmtInt(v), "불량수량"];
                if (n === "불량률(%)") return [`${Number(v).toFixed(2)}%`, n];
                return [v,n];
              }} />
              <Legend />
              <Bar yAxisId="left" dataKey="defect" name="불량수량" fill="rgba(66,165,245,.75)" barSize={18} radius={[3,3,0,0]}>
                <LabelList content={<ValueLabel />} />
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="rate" name="불량률(%)" stroke="#ff7043" dot={false}>
                <LabelList content={<PctValueLabel />} />
              </Line>
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    );
  };

  renderDefectList = () => {
    const { defectRows, defectLoading } = this.state;

    const headers = [
      { key: "근무일자", label: "근무일자" },
      { key: "생산_플랜트", label: "플랜트" },
      { key: "작업장", label: "작업장" },
      { key: "생산_작업장", label: "라인/설비" },
      { key: "자재번호", label: "자재번호" },
      { key: "자재명", label: "자재명" },
      { key: "불량코드", label: "불량코드" },
      { key: "불량_유형", label: "불량유형" },
      { key: "불량_작업자", label: "작업자" },
      { key: "불량_판정대기", label: "판정대기" },
      { key: "불량_RWK수량", label: "RWK" },
      { key: "불량_폐기수량", label: "폐기" },
      { key: "비고", label: "비고" },
    ];

    const toDateStr = (v) => {
      if (!v) return "";
      const s = String(v);
      if (s.length >= 10) return s.substring(0, 10);
      return s;
    };

    const exportCSV = () => {
      try {
        const cols = headers.map(h => h.label);
        const rows = defectRows.map(r => headers.map(h => (r[h.key] ?? "")));
        const csv = [cols.join(","), ...rows.map(row =>
          row.map(v => {
            const s = String(v ?? "");
            if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
            return s;
          }).join(",")
        )].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `defect_list_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (e) {
        console.error(e);
      }
    };

    return (
      <Paper className={s.section} sx={{ mt: 2 }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
            선택 기간 불량 리스트
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button size="small" variant="outlined" startIcon={<DownloadIcon />} onClick={exportCSV}>
              CSV 다운로드
            </Button>
          </Box>
        </Box>

        {defectLoading && <LinearProgress sx={{ mb: 1 }} />}

        <TableContainer
          sx={{
            maxHeight: 460,
            borderRadius: 1,
            "& .MuiTableCell-head": {
              position: "sticky", top: 0, backgroundColor: this.props.themeHex, color: "#333", zIndex: 1, fontWeight: 800,
            },
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {headers.map(h => (
                  <TableCell key={h.key} align={["판정대기","RWK","폐기"].some(x=>h.label.includes(x)) ? "right" : "left"}>
                    {h.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {defectRows.length === 0 && !defectLoading && (
                <TableRow><TableCell colSpan={headers.length} align="center">데이터가 없습니다.</TableCell></TableRow>
              )}
              {defectRows.map((r, idx) => (
                <TableRow key={idx} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
                  {headers.map(h => {
                    let v = r[h.key];
                    if (h.key === "근무일자") v = toDateStr(v);
                    if (["불량_판정대기","불량_RWK수량","불량_폐기수량"].includes(h.key)) {
                      return <TableCell key={h.key} align="right">{fmtInt(v)}</TableCell>;
                    }
                    return <TableCell key={h.key}>{v ?? ""}</TableCell>;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="caption" color="text.secondary">
            총 {fmtInt(defectRows.length)}건
          </Typography>
          <Typography variant="caption" color="text.secondary">
            * 컬럼은 DB 스키마에 따라 자동 매핑됩니다.
          </Typography>
        </Box>
      </Paper>
    );
  };

  render() {
    const { themeHex } = this.props;
    const { error, loading, filters } = this.state;

    return (
      <Box className={s.root}>
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: this.props.themeHex,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <TrendingUp /> 불량 데이터 분석
          </Typography>
          <Typography variant="body1" color="text.secondary">
            생산_불량 테이블 기반의 예방형 지표를 제공합니다.
          </Typography>
          {filters.partNo && (
            <Typography variant="subtitle2" sx={{ mt: 0.5 }}>
              대상 품목: <b>{filters.partNo}</b> {filters.item ? `(${filters.item})` : ""}
            </Typography>
          )}
        </Box>

        {this.renderFilterBar()}

        {error && (
          <Box sx={{ mb: 2 }}>
            <Paper sx={{ p: 2, borderLeft: `4px solid ${themeHex}` }}>
              <Typography color="error" sx={{ mb: 1 }}>차트 데이터를 불러오지 못했습니다.</Typography>
              <Button variant="contained" onClick={() => { this.loadAll(); this.loadInsights(); }} sx={{ backgroundColor: themeHex, "&:hover": { backgroundColor: "#f57c00" } }}>
                다시 시도
              </Button>
            </Paper>
          </Box>
        )}

        {/* KPI (선택) */}
        {this.renderTopKpis()}

        {/* ▶ Top5(좌) + 선택 품번 추이(우) */}
        {this.renderTop5WithTrend()}

        {/* ▶ 불량유형 도넛 */}
        {this.renderTypeDonut()}

        {/* 04~05만 유지 */}
        {this.renderRecurrence()}
        {this.renderSeasonality()}

        {/* 리스트 */}
        {this.renderDefectList()}

        {loading && (
          <Box sx={{ position: "fixed", bottom: 24, right: 24, background: "#fff", border: "1px solid #eee", borderRadius: 2, px: 2, py: 1, boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
            <Typography sx={{ fontWeight: 700, color: themeHex }}>불러오는 중…</Typography>
          </Box>
        )}
      </Box>
    );
  }
}

export default connect(mapStateToProps)(DefectProcessChart);
