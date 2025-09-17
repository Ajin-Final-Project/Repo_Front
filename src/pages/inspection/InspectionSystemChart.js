// // src/pages/inspection/InspectionSystemChart.js
// import React, { Component } from "react";
// import config from "../../config";

// import { connect } from "react-redux";
// import { selectThemeHex } from "../../reducers/layout";

// // 불량 테이블 조회 모달
// import DefectDetailModal from "../common/DefectDetailModal";
// import { ReportProblem as ReportProblemIcon } from "@mui/icons-material";

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
//   Tooltip,
//   Fab,
// } from "@mui/material";
// import { Autocomplete } from "@mui/material";

// import {
//   Search as SearchIcon,
//   Clear as ClearIcon,
//   ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon,
//   KeyboardArrowDown as KeyboardArrowDownIcon,
//   TrendingUp,
//   ChevronLeft as ChevronLeftIcon,
//   ChevronRight as ChevronRightIcon,
// } from "@mui/icons-material";

// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip as RTooltip,
//   LabelList,
//   ReferenceArea,
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

// function mapStateToProps(state) {
//   return {
//     themeHex: selectThemeHex(state),
//   };
// }

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

// /** ✅ 차트 가로 스크롤 설정: 날짜 5개씩 보이게 */
// const DAY_WINDOW = 5; // 한 번에 보여줄 '보고일' 개수
// const TICK_WIDTH = 40; // X축 포인트(=Xn/주야 1개)의 픽셀 폭

// /** ===== 스펙(허용 범위) 파서 ===== */
// const toNum = (s) => (s == null ? NaN : Number(String(s).replace(/,/g, "")));

// // HTML 엔티티(+/− 등) 정리
// const decodeEntities = (txt) =>
//   String(txt || "")
//     .replace(/&#43;|&plus;/gi, "+")
//     .replace(/&#8722;|&minus;/gi, "-")
//     .replace(/&nbsp;/gi, " ");

// /**
//  * 스펙 텍스트에서 [low, high] 범위를 추출.
//  * 지원 패턴:
//  *  - "기준 ± 공차"        → 예: "9.0 ±0.2"
//  *  - "저~고"              → 예: "8.8~9.2"
//  *  - "Ø기준,(0,+0.2) 이내" → 예: "Φ9.0 (0, +0.2mm 이내)"  → [center+0, center+0.2]
//  *  - "Ø기준, +0.2mm 이내" → 예: "ø13.5, +0.2mm 이내"     → [center, center+0.2]
//  */
// const parseSpecRange = (specText) => {
//   const t = decodeEntities((specText || "").replace(/\s+/g, " ").trim());

//   // 1) center ± tol
//   let m = t.match(/([-+]?\d+(?:\.\d+)?)\s*±\s*([-+]?\d+(?:\.\d+)?)/i);
//   if (m) {
//     const center = toNum(m[1]);
//     const tol = toNum(m[2]);
//     if (!Number.isNaN(center) && !Number.isNaN(tol)) {
//       return { low: center - tol, high: center + tol, label: `${fmtNum(center, 3)} ± ${fmtNum(tol, 3)}` };
//     }
//   }

//   // 2) explicit range: a ~ b
//   m = t.match(/([-+]?\d+(?:\.\d+)?)\s*(?:~|-|to)\s*([-+]?\d+(?:\.\d+)?)/i);
//   if (m) {
//     const a = toNum(m[1]);
//     const b = toNum(m[2]);
//     if (!Number.isNaN(a) && !Number.isNaN(b)) {
//       const low = Math.min(a, b),
//         high = Math.max(a, b);
//       return { low, high, label: `${fmtNum(low, 3)} ~ ${fmtNum(high, 3)}` };
//     }
//   }

//   // 3) unilateral in parentheses: "Φ9.0 (0, +0.2mm 이내)" → [center + 0, center + 0.2]
//   m = t.match(/(?:ø|Ø|Φ)?\s*([-+]?\d+(?:\.\d+)?)\s*\(\s*([-+]?\d+(?:\.\d+)?)\s*,\s*\+?([-+]?\d+(?:\.\d+)?)\s*.*?\)/i);
//   if (m) {
//     const center = toNum(m[1]);
//     const loOff = toNum(m[2]);
//     const hiOff = toNum(m[3]);
//     if (!Number.isNaN(center) && !Number.isNaN(loOff) && !Number.isNaN(hiOff)) {
//       const low = center + loOff;
//       const high = center + hiOff;
//       const l = Math.min(low, high),
//         h = Math.max(low, high);
//       return { low: l, high: h, label: `${fmtNum(l, 3)} ~ ${fmtNum(h, 3)}` };
//     }
//   }

//   // 4) plus-only tolerance text: "ø13.5, +0.2mm 이내" → [center, center+tol]
//   m = t.match(/(?:ø|Ø|Φ)?\s*([-+]?\d+(?:\.\d+)?)[^0-9+.-]+?\+?\s*([-+]?\d+(?:\.\d+)?)\s*mm\s*이내/i);
//   if (m) {
//     const center = toNum(m[1]);
//     const tol = toNum(m[2]);
//     if (!Number.isNaN(center) && !Number.isNaN(tol)) {
//       const low = center;
//       const high = center + tol;
//       return { low, high, label: `${fmtNum(low, 3)} ~ ${fmtNum(high, 3)}` };
//     }
//   }

//   // 5) 하위 호환 패턴
//   m = t.match(/(?:ø|Ø|Φ)?\s*([-+]?\d+(?:\.\d+)?)\D+\+?([-+]?\d+(?:\.\d+)?)/i);
//   if (m) {
//     const center = toNum(m[1]);
//     const tol = toNum(m[2]);
//     if (!Number.isNaN(center) && !Number.isNaN(tol)) {
//       const low = center;
//       const high = center + tol;
//       return { low, high, label: `${fmtNum(low, 3)} ~ ${fmtNum(high, 3)}` };
//     }
//   }

//   return null;
// };

// /** 🔕 타임라인 제외 키워드 */
// const SKIP_TIMELINE_KEYWORDS = ["외관", "금형상태", "클린부품", "무명 항목"];

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

//     // 숫자형 추이 (사용 안 함)
//     numTrend: { dates: [], series: [] },

//     // 옵션
//     factories: [],
//     processes: [],
//     equipments: [],
//     parts: [],
//     items: [],
//     optionsLoading: false,

//     // UI 로딩 플래그(분리)
//     loadingDaily: false,
//     loadingTrend: false,
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
//     defectModalOpen: false,

//     // 동적 "검사내용" 폭(px)
//     specColWidth: COL_W.specBase,

//     // ✅ 높이 동기화 상태
//     dayPanelHeight: undefined,
//     leftPanelHeight: undefined,

//     // ✅ 차트 뷰포트(스크롤 컨테이너) 실제 가로폭
//     chartViewportWidth: 0,

//     // ✅ 보고일 패널 접힘 여부
//     dayPanelCollapsed: false,
//   };

//   _hadSavedFilters = false;
//   _runId = 0;
//   _pendingTimer = null;
//   _controllers = new Set();

//   _dailyCache = new Lru(6);
//   _trendCache = new Lru(6);
//   _optionsCache = new Lru(6);

//   // --- 측정/리사이즈 옵저버 ---
//   _measureCtx = null;
//   _chartViewportEl = null;
//   _chartRO = null;
//   _roTimer = null; // ← 디바운스 타이머

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

//   /** ✅ 높이 측정 refs */
//   tableCardRef = React.createRef();
//   leftPanelRef = React.createRef();

//   /** ✅ 차트 뷰포트 ref 콜백 + ResizeObserver */
//   setChartViewportRef = (el) => {
//     if (this._chartViewportEl === el) return;
//     if (this._chartRO && this._chartViewportEl) {
//       try {
//         this._chartRO.unobserve(this._chartViewportEl);
//       } catch {}
//     }
//     this._chartViewportEl = el;

//     if (el && typeof ResizeObserver !== "undefined") {
//       if (!this._chartRO) {
//         this._chartRO = new ResizeObserver(() => this.updateChartViewportWidthDebounced());
//       }
//       this._chartRO.observe(el);
//       this.updateChartViewportWidth();
//     }
//   };

//   updateChartViewportWidth = () => {
//     const w = this._chartViewportEl ? this._chartViewportEl.clientWidth : 0;
//     if (w && w !== this.state.chartViewportWidth) {
//       this.setState({ chartViewportWidth: w });
//     }
//   };

//   updateChartViewportWidthDebounced = () => {
//     if (this._roTimer) clearTimeout(this._roTimer);
//     this._roTimer = setTimeout(this.updateChartViewportWidth, 120);
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

//     requestAnimationFrame(this.updateLeftPanelHeight);

//     this.bootstrap({ forceLatestMonth: !this._hadSavedFilters });

//     window.addEventListener("resize", this.updateDayPanelHeight);
//     window.addEventListener("resize", this.updateLeftPanelHeight);
//     window.addEventListener("resize", this.updateChartViewportWidthDebounced);
//   }

//   componentWillUnmount() {
//     window.removeEventListener("resize", this.updateDayPanelHeight);
//     window.removeEventListener("resize", this.updateLeftPanelHeight);
//     window.removeEventListener("resize", this.updateChartViewportWidthDebounced);
//     if (this._chartRO) {
//       try {
//         this._chartRO.disconnect();
//       } catch {}
//       this._chartRO = null;
//     }
//     if (this._roTimer) clearTimeout(this._roTimer);
//   }

//   componentDidUpdate(_, prevState) {
//     if (this.state.selectedDay !== prevState.selectedDay) {
//       const rows = this.state.dailyTables?.[this.state.selectedDay] || [];
//       const w = this.computeSpecWidthFromRows(rows);
//       if (w !== this.state.specColWidth) this.setState({ specColWidth: w });
//     }

//     if (
//       this.state.loadingDaily !== prevState.loadingDaily ||
//       this.state.selectedDay !== prevState.selectedDay ||
//       this.state.specColWidth !== prevState.specColWidth
//     ) {
//       requestAnimationFrame(this.updateDayPanelHeight);
//       requestAnimationFrame(this.updateLeftPanelHeight);
//     }
//   }

//   updateDayPanelHeight = () => {
//     const el = this.tableCardRef?.current;
//     if (!el) return;
//     const h = el.offsetHeight || 0;
//     if (!h) return;
//     const next = Math.max(280, h);
//     if (this.state.dayPanelHeight !== next) {
//       this.setState({ dayPanelHeight: next });
//     }
//   };

//   updateLeftPanelHeight = () => {
//     const el = this.leftPanelRef?.current;
//     if (!el) return;
//     const h = el.offsetHeight || 0;
//     if (!h) return;
//     const next = Math.max(280, h);
//     if (this.state.leftPanelHeight !== next) {
//       this.setState({ leftPanelHeight: next });
//     }
//   };

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

//       const exact = rows.find((r) => norm(readPn(r)) === pn);
//       const nm = norm(exact ? readNm(exact) : rows.length ? readNm(rows[0]) : "");
//       if (nm && nm !== pn) return nm;
//       return "";
//     } catch {
//       return "";
//     }
//   };

//   /** ✅ DB 최신 보고일의 "달"을 기본 기간으로 세팅 */
//   setDefaultToLatestMonthViaEndpoint = async (force = false) => {
//     try {
//       if (!force && this._hadSavedFilters) return false;

//       const { filters } = this.state;
//       const payload = {
//         factory: filters.factory,
//         process: filters.process,
//         equipment: filters.equipment,
//         partNo: "",
//         item: "",
//         inspectItem: "",
//         inspType: filters.inspType,
//         workType: filters.workType,
//         shiftType: filters.shiftType,
//       };
//       const data = await this.post("/options/latest_month", payload);
//       const start = data?.start,
//         end = data?.end,
//         year = data?.year,
//         month = data?.month;

//       if (start && end) {
//         await new Promise((resolve) => {
//           this.setState(
//             (prev) => ({
//               selectedYear: year || prev.selectedYear,
//               selectedMonth: month || prev.selectedMonth,
//               filters: { ...prev.filters, start_date: start, end_date: end },
//             }),
//             () => {
//               try {
//                 localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
//               } catch {}
//               resolve();
//             }
//           );
//         });
//         return true;
//       }
//       return false;
//     } catch (e) {
//       console.warn("setDefaultToLatestMonthViaEndpoint failed:", e);
//       return false;
//     }
//   };

//   bootstrap = async ({ forceLatestMonth = false } = {}) => {
//     await this.loadYears();
//     // 초기 진입 시(저장된 필터 없음)엔 최신월 강제 적용, 저장된 필터가 있으면 존중
//     await this.setDefaultToLatestMonthViaEndpoint(forceLatestMonth);
//     await this.loadOptions();
//     await this.loadAll();
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
//         filters: { ...prev.filters, start_date, end_date },
//       }),
//       async () => {
//         try {
//           localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters));
//         } catch {}
//         await this.loadOptions();
//         await this.loadAll();
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

//     await new Promise((resolve) => {
//       this.setState(
//         {
//           filters: { ...base },
//           selectedYear: new Date().getFullYear(),
//           selectedMonth: new Date().getMonth() + 1,
//         },
//         () => {
//           try {
//             localStorage.removeItem("inspectionFilters");
//           } catch {}
//           this._hadSavedFilters = false;
//           resolve();
//         }
//       );
//     });

//     await this.loadOptions();
//     await this.setDefaultToLatestMonthViaEndpoint(true);
//     await this.loadAll();
//   };

//   /** 데이터 로드 (캐시 + 단계적 로딩: daily 먼저) */
//   loadAll = async () => {
//     const runId = ++this._runId;
//     this._abortAll();

//     const { filters } = this.state;
//     try {
//       localStorage.setItem("inspectionFilters", JSON.stringify(filters));
//     } catch {}

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

//     this.setState({ numTrend: { dates: [], series: [] }, loadingTrend: false }, () => {
//       this.updateDayPanelHeight();
//       this.updateLeftPanelHeight();
//       this.updateChartViewportWidth();
//     });
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

//   /** partNo → item(품명) 추론 */
//   getItemNameFromOptions = (partNo, parts = this.state.parts, items = this.state.items) => {
//     const pn = norm(partNo);
//     if (!pn) return "";
//     const readPn = (o) =>
//       typeof o === "string"
//         ? o
//         : o?.partNo ??
//           o?.품목번호 ??
//           o?.code ??
//           o?.value ??
//           o?.id ??
//           o?.PART_NO ??
//           o?.PartNo ??
//           o?.품번 ??
//           o?.itemCode;
//     const readNm = (o) =>
//       typeof o === "string"
//         ? o
//         : o?.item ??
//           o?.itemName ??
//           o?.품목명 ??
//           o?.name ??
//           o?.label ??
//           o?.ITEM_NM ??
//           o?.ItemName ??
//           o?.품명 ??
//           o?.part_nm;

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
//       row?.item,
//       row?.itemName,
//       row?.partName,
//       row?.품목명,
//       row?.item_label,
//       row?.name,
//       row?.label,
//       row?.품명,
//       row?.part_nm,
//     ]
//       .map(norm)
//       .filter((v) => v && v !== pn && v !== "-");
//     if (cands.length) return cands[0];
//     return this.getItemNameFromOptions(pn);
//   };

//   /** 보고일 클릭 → 설비/품번 반영 */
//   handleDayClick = async (row) => {
//     const { d, equipment, partNo } = row || {};
//     const { filters } = this.state;

//     if ((equipment || filters.equipment) === filters.equipment && (partNo || "") === (filters.partNo || "")) {
//       this.setState({ selectedDay: d }, () => {
//         this.updateLeftPanelHeight();
//         this.updateDayPanelHeight();
//       });
//       return;
//     }

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
//         await this.loadOptions();

//         const curPn = norm(this.state.filters.partNo);
//         const curItem = norm(this.state.filters.item);
//         if (curPn && (!curItem || curItem === "-" || curItem === curPn)) {
//           const modalName = await this.fetchItemFromModal(curPn);
//           if (modalName) {
//             this.setState((prev) => ({ filters: { ...prev.filters, item: modalName } }));
//           } else {
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

//   /** 보고일 패널 토글 */
//   toggleDayPanel = () => {
//     this.setState((prev) => ({ dayPanelCollapsed: !prev.dayPanelCollapsed }));
//   };
//   openDayPanel = () => {
//     this.setState({ dayPanelCollapsed: false });
//   };
//   closeDayPanel = () => {
//     this.setState({ dayPanelCollapsed: true });
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
//           sx={{ backgroundColor: this.props.themeHex, color: "white", borderRadius: 1, mb: 2 }}
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

//         <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end", flexWrap: "wrap" }}>
//           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
//             필터 초기화
//           </Button>
//           <Button
//             variant="contained"
//             startIcon={<SearchIcon />}
//             size="large"
//             sx={{ backgroundColor: this.props.themeHex, "&:hover": { backgroundColor: "#f57c00" } }}
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
//             startIcon={<ReportProblemIcon />}
//             size="large"
//             onClick={() => this.setState({ defectModalOpen: true })}
//             disabled={!this.state.filters.start_date || !this.state.filters.end_date}
//           >
//             불량 내역
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
//       leftPanelHeight,
//     } = this.state;

//     if (!filters.partNo) {
//       return (
//         <Paper
//           className={s.section}
//           sx={{
//             flex: 1,
//             display: "flex",
//             flexDirection: "column",
//             height: leftPanelHeight || 480,
//           }}
//         >
//           <Box className={s.sectionHeader}>
//             <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
//               검사이력현황
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
//       <Paper
//         className={s.section}
//         sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}
//         ref={this.tableCardRef}
//       >
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
//             검사이력현황
//           </Typography>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
//             <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
//             <Chip size="small" label={partText} />
//             {itemText && <Chip size="small" variant="outlined" label={itemText} />}
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
//             <CircularProgress size={60} sx={{ color: this.props.themeHex }} />
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

//   /** ✅ Y축 도메인 계산 */
//   getPaddedYDomain = (rows, keys, padRatio = 0.1, extraNumbers = []) => {
//     try {
//       const vals = [];
//       (rows || []).forEach((row) =>
//         (keys || []).forEach((k) => {
//           const v = row?.[k];
//           if (v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v))) vals.push(Number(v));
//         })
//       );
//       (extraNumbers || []).forEach((n) => {
//         if (n !== null && n !== undefined && !Number.isNaN(Number(n))) vals.push(Number(n));
//       });
//       if (!vals.length) return ["auto", "auto"];
//       let min = Math.min(...vals);
//       let max = Math.max(...vals);
//       if (min === max) {
//         const d = Math.max(1, Math.abs(min) * 0.05);
//         min -= d;
//         max += d;
//       }
//       const pad = (max - min) * padRatio;
//       return [min - pad, max + pad];
//     } catch {
//       return ["auto", "auto"];
//     }
//   };

//   /** ✅ Y축 tick 생성 */
//   makeTicksByStep = (domain, step = 0.1) => {
//     if (!Array.isArray(domain) || domain.some((v) => v === "auto")) return undefined;
//     let [min, max] = domain;
//     if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;

//     const start = Math.floor(min / step) * step;
//     const end = Math.ceil(max / step) * step;

//     const ticks = [];
//     const MAX_TICKS = 200;
//     for (let v = start, i = 0; v <= end + 1e-9 && i < MAX_TICKS; v += step, i += 1) {
//       ticks.push(Number(v.toFixed(3)));
//     }
//     return ticks.length ? ticks : undefined;
//   };

//   /** 기간 전체 — 검사내용별 연속 Xn 타임라인 */
//   buildConcatXnSeriesPerSpec = () => {
//     const { dailyDays, dailyTables, dailyCols, dailyShifts } = this.state;
//     if (!dailyDays?.length || !dailyCols?.length) return [];

//     const orderedShifts = ["주간", "야간"].filter((s) =>
//       (dailyShifts && dailyShifts.length ? dailyShifts : ["주간", "야간"]).includes(s)
//     );

//     const labelOf = (r) => {
//       const name = r?.["검사항목명"] ?? "";
//       const spec = r?.["검사내용"] ?? "";
//       return spec ? `[${name}] ${spec}` : name || "(무명 항목)";
//     };

//     const byDate = {};
//     dailyDays.forEach((d) => {
//       const m = new Map();
//       (dailyTables?.[d] || []).forEach((r) => m.set(labelOf(r), r));
//       byDate[d] = m;
//     });

//     const allLabels = new Set();
//     Object.values(byDate).forEach((m) => m.forEach((_, k) => allLabels.add(k)));

//     const out = [];
//     allLabels.forEach((label) => {
//       let idx = 0;
//       const rows = [];

//       let specText = "";
//       for (const d of dailyDays) {
//         const r = byDate[d].get(label);
//         if (r && r["검사내용"]) {
//           specText = r["검사내용"];
//           break;
//         }
//       }

//       dailyDays.forEach((d) => {
//         const r = byDate[d].get(label);

//         orderedShifts.forEach((s) => {
//           this.state.dailyCols.forEach((c) => {
//             const v = r?.[s]?.[c];
//             if (v !== null && v !== undefined && v !== "") {
//               idx += 1;
//               rows.push({
//                 idx,
//                 tick: `${d} ${c} ${s}`,
//                 day: d,
//                 xn: c,
//                 shift: s,
//                 y: Number(v),
//               });
//             }
//           });
//         });
//       });

//       out.push({ label, data: rows, specText });
//     });

//     return out;
//   };

//   getShiftShort = (s) => {
//     if (!s) return "";
//     if (String(s).includes("주")) return "주";
//     if (String(s).includes("야")) return "야";
//     return String(s);
//   };

//   renderConcatXnPerSpec = () => {
//     const { filters, loadingDaily } = this.state;
//     if (!filters.partNo) return null;

//     const partText = filters.partNo ? filters.partNo : "전체 품번";
//     const itemText = filters.item || "";
//     const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

//     const rawCards = this.buildConcatXnSeriesPerSpec();

//     const cards = rawCards.filter(({ label, data }) => {
//       if (!Array.isArray(data) || data.length === 0) return false;
//       const t = String(label || "");
//       return !SKIP_TIMELINE_KEYWORDS.some((kw) => t.includes(kw));
//     });

//     if (!loadingDaily && cards.length === 0) return null;

//     return (
//       <Paper className={`${s.section} ${s.fullRow}`} sx={{ mt: 2, minWidth: 0 }}>
//         <Box className={s.sectionHeader} sx={{ alignItems: "center" }}>
//           <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
//             기간 전체 · 검사내용별 연속 Xn 타임라인
//           </Typography>
//         </Box>

//         {loadingDaily ? (
//           <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 240 }}>
//             <CircularProgress size={44} sx={{ color: this.props.themeHex }} />
//           </Box>
//         ) : (
//           <Box sx={{ display: "flex", flexDirection: "column", gap: 16 }}>
//             {cards.map(({ label, data, specText }, i) => {
//               const viewportW = Math.max(0, this.state.chartViewportWidth || 0);

//               const shifts = Math.max(1, this.state.dailyShifts?.length || 0);
//               const xns = Math.max(1, this.state.dailyCols?.length || 0);
//               const pointsPerDay = shifts * xns;

//               const minVisibleWidth = Math.max(viewportW, DAY_WINDOW * pointsPerDay * TICK_WIDTH);
//               const neededContentWidth = data.length * TICK_WIDTH;
//               const fullWidth = Math.max(minVisibleWidth, neededContentWidth);

//               const dayTicks = [];
//               let lastDay = null;
//               for (const p of data) {
//                 if (p.day !== lastDay) {
//                   dayTicks.push(p.idx);
//                   lastDay = p.day;
//                 }
//               }

//               const specRange = parseSpecRange(specText);
//               const yDomain = this.getPaddedYDomain(data, ["y"], 0.1, specRange ? [specRange.low, specRange.high] : []);

//               return (
//                 <Paper key={i} elevation={1} sx={{ p: 2, borderRadius: 2, width: "100%" }}>
//                   <Box
//                     sx={{
//                       display: "flex",
//                       alignItems: "center",
//                       justifyContent: "space-between",
//                       gap: 1,
//                       mb: 0.5,
//                       flexWrap: "wrap",
//                     }}
//                   >
//                     <Typography
//                       variant="subtitle2"
//                       sx={{ fontWeight: 800, color: "#546e7a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
//                       title={label}
//                     >
//                       {label}
//                     </Typography>

//                     <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
//                       <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
//                       <Chip size="small" label={partText} />
//                       {itemText && <Chip size="small" variant="outlined" label={itemText} />}
//                       <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
//                       <Chip size="small" label={rangeText} />
//                     </Box>
//                   </Box>

//                   <Box sx={{ width: "100%", overflowX: "auto", overflowY: "hidden" }} ref={i === 0 ? this.setChartViewportRef : undefined}>
//                     <Box sx={{ width: `${fullWidth}px`, height: 300 }}>
//                       <LineChart width={fullWidth} height={300} data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
//                         <CartesianGrid strokeDasharray="3 3" />
//                         {specRange && Number.isFinite(specRange.low) && Number.isFinite(specRange.high) && (
//                           <ReferenceArea y1={specRange.low} y2={specRange.high} fill="#bbdefb" fillOpacity={0.35} stroke={null} />
//                         )}

//                         <XAxis
//                           dataKey="idx"
//                           ticks={dayTicks}
//                           interval={0}
//                           tickLine
//                           tickMargin={8}
//                           tickFormatter={(v) => {
//                             const item = data[v - 1];
//                             return item?.day ? item.day.slice(5) : "";
//                           }}
//                         />
//                         <YAxis domain={yDomain} ticks={this.makeTicksByStep(yDomain, 0.1)} allowDataOverflow tickFormatter={(v) => fmtNum(v, 1)} />

//                         <RTooltip
//                           formatter={(value) => fmtNum(value, 3)}
//                           labelFormatter={(v) => {
//                             const item = data.find((d) => d.idx === v);
//                             return item ? item.tick : v;
//                           }}
//                         />
//                         <Line
//                           type="monotone"
//                           dataKey="y"
//                           name="값"
//                           dot={{ r: 3 }}
//                           activeDot={{ r: 6 }}
//                           strokeWidth={2}
//                           connectNulls
//                           isAnimationActive={false}
//                         >
//                           <LabelList
//                             dataKey="y"
//                             isAnimationActive={false}
//                             content={(props) => {
//                               const { x, y, value } = props;
//                               if (value == null || Number.isNaN(Number(value))) return null;
//                               return (
//                                 <text x={x} y={y - 8} textAnchor="middle" fontSize="11" fill="#555">
//                                   {fmtNum(value, 3)}
//                                 </text>
//                               );
//                             }}
//                           />
//                         </Line>
//                       </LineChart>
//                     </Box>
//                   </Box>

//                   <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5, flexWrap: "wrap", gap: 1 }}>
//                     {specRange && (
//                       <Typography variant="caption" sx={{ color: "#1565c0", fontWeight: 700 }}>
//                         허용범위: {fmtNum(specRange.low, 3)} ~ {fmtNum(specRange.high, 3)}
//                       </Typography>
//                     )}
//                   </Box>
//                 </Paper>
//               );
//             })}
//           </Box>
//         )}
//       </Paper>
//     );
//   };

//   render() {
//     const { error, dailyList, selectedDay, loadingDaily, dayPanelHeight, dayPanelCollapsed } = this.state;

//     return (
//       <Box className={s.root}>
//         {/* 헤더 섹션 */}
//         <Box sx={{ mb: 3 }}>
//           <Typography
//             variant="h4"
//             gutterBottom
//             sx={{
//               color: this.props.themeHex,
//               fontWeight: "bold",
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//             }}
//           >
//             <TrendingUp /> 검사 데이터 차트
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             검사 결과를 차트와 표로 한눈에 파악할 수 있습니다.
//           </Typography>
//         </Box>

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
//               sx={{ backgroundColor: this.props.themeHex, "&:hover": { backgroundColor: "#f57c00" } }}
//             >
//               다시 시도
//             </Button>
//           </Box>
//         )}

//         {/* 본문: 좌측 날짜 목록 + 우측 표, 그리고 전체폭 타임라인 */}
//         <Box
//           className={s.dailyLayout}
//           sx={{
//             // 접힘 상태에선 '버튼 전용 컬럼(56px) + 본문 minmax(0,1fr)' 로 설정해 오버플로 방지
//             gridTemplateColumns: dayPanelCollapsed ? "56px minmax(0, 1fr)" : undefined,
//           }}
//         >
//           {/* 접히지 않았을 땐 좌측 '보고일' 패널이 자리 차지 */}
//           {!dayPanelCollapsed && (
//             <Paper
//               className={s.dayPanel}
//               ref={this.leftPanelRef}
//               sx={{
//                 height: dayPanelHeight || "auto",
//                 minHeight: 400,
//               }}
//             >
//               <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
//                 <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a" }}>보고일</Typography>
//                 <Tooltip title="보고일 닫기">
//                   <IconButton size="small" onClick={this.closeDayPanel}>
//                     <ChevronLeftIcon fontSize="small" />
//                   </IconButton>
//                 </Tooltip>
//               </Box>

//               <Box className={s.dayList}>
//                 <div className={s.dayListHead}>
//                   <span>보고일</span>
//                   <span>설비</span>
//                   <span>품번</span>
//                 </div>
//                 <div className={s.dayListBody}>
//                   {loadingDaily ? (
//                     <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6, color: "#90a4ae" }}>
//                       <CircularProgress size={28} sx={{ mr: 1, color: this.props.themeHex }} />
//                       로딩 중...
//                     </Box>
//                   ) : dailyList.length > 0 ? (
//                     dailyList.map((row) => (
//                       <div
//                         key={row.d}
//                         className={`${s.dayRow} ${selectedDay === row.d ? s.active : ""}`}
//                         onClick={() => this.handleDayClick(row)}
//                         title="클릭 시 상단 설비/품번/품명이 자동 반영됩니다"
//                       >
//                         <span>{row.d}</span>
//                         <span>{row.equipment || "-"}</span>
//                         <span>{row.partNo || "-"}</span>
//                       </div>
//                     ))
//                   ) : (
//                     <div className={s.dayEmpty}>기간/필터 조건에 해당하는 결과가 없습니다.</div>
//                   )}
//                 </div>
//               </Box>
//             </Paper>
//           )}

//           {/* 접힌 상태: 왼쪽에 56px 고정 컬럼을 실제로 차지하며 버튼 표시(겹치지 않음) */}
//           {dayPanelCollapsed && (
//             <Box
//               sx={{
//                 width: 56,
//                 display: "flex",
//                 alignItems: "flex-start",
//                 justifyContent: "center",
//                 pt: 1,
//               }}
//             >
//               <Tooltip title="보고일 열기">
//                 <Fab
//                   size="small"
//                   color="inherit"
//                   onClick={this.openDayPanel}
//                   sx={{
//                     bgcolor: this.props.themeHex,
//                     color: '#fff',
//                     '&:hover': { bgcolor: this.props.themeHex },
//                     '&:active': { bgcolor: this.props.themeHex },
//                   }}
//                 >
//                   <ChevronRightIcon />
//                 </Fab>
//               </Tooltip>

//             </Box>
//           )}

//           <Box
//             className={s.rightArea}
//             sx={{
//               gridColumn: dayPanelCollapsed ? "2 / -1" : undefined,
//               minWidth: 0, // ⬅️ grid 아이템이 내용폭만큼 늘어나지 않도록
//             }}
//           >
//             {this.renderDailyTable()}
//           </Box>

//           {/* ✅ 화면 가로 전체(두 컬럼 span) 타임라인 */}
//           {this.renderConcatXnPerSpec()}
//         </Box>

//         <DefectDetailModal
//           open={this.state.defectModalOpen}
//           onClose={() => this.setState({ defectModalOpen: false })}
//           filters={this.state.filters}
//         />
//       </Box>
//     );
//   }
// }

// export default connect(mapStateToProps)(InspectionSystemChart);


// src/pages/inspection/InspectionSystemChart.js
import React, { Component } from "react";
import config from "../../config";

import { connect } from "react-redux";
import { selectThemeHex } from "../../reducers/layout";

// 불량 테이블 조회 모달
import DefectDetailModal from "../common/DefectDetailModal";
import { ReportProblem as ReportProblemIcon } from "@mui/icons-material";

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
  Tooltip,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Autocomplete } from "@mui/material";

import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  TrendingUp,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Close as CloseIcon,
} from "@mui/icons-material";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  LabelList,
  ReferenceArea,
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

function mapStateToProps(state) {
  return {
    themeHex: selectThemeHex(state),
  };
}

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

/** ✅ 차트 가로 스크롤 설정: 날짜 5개씩 보이게 */
const DAY_WINDOW = 5; // 한 번에 보여줄 '보고일' 개수
const TICK_WIDTH = 40; // X축 포인트(=Xn/주야 1개)의 픽셀 폭

/** ===== 스펙(허용 범위) 파서 ===== */
const toNum = (s) => (s == null ? NaN : Number(String(s).replace(/,/g, "")));

// HTML 엔티티(+/− 등) 정리
const decodeEntities = (txt) =>
  String(txt || "")
    .replace(/&#43;|&plus;/gi, "+")
    .replace(/&#8722;|&minus;/gi, "-")
    .replace(/&nbsp;/gi, " ");

/**
 * 스펙 텍스트에서 [low, high] 범위를 추출.
 * 지원 패턴:
 *  - "기준 ± 공차"        → 예: "9.0 ±0.2"
 *  - "저~고"              → 예: "8.8~9.2"
 *  - "Ø기준,(0,+0.2) 이내" → 예: "Φ9.0 (0, +0.2mm 이내)"  → [center+0, center+0.2]
 *  - "Ø기준, +0.2mm 이내" → 예: "ø13.5, +0.2mm 이내"     → [center, center+0.2]
 */
const parseSpecRange = (specText) => {
  const t = decodeEntities((specText || "").replace(/\s+/g, " ").trim());

  // 1) center ± tol
  let m = t.match(/([-+]?\d+(?:\.\d+)?)\s*±\s*([-+]?\d+(?:\.\d+)?)/i);
  if (m) {
    const center = toNum(m[1]);
    const tol = toNum(m[2]);
    if (!Number.isNaN(center) && !Number.isNaN(tol)) {
      return { low: center - tol, high: center + tol, label: `${fmtNum(center, 3)} ± ${fmtNum(tol, 3)}` };
    }
  }

  // 2) explicit range: a ~ b
  m = t.match(/([-+]?\d+(?:\.\d+)?)\s*(?:~|-|to)\s*([-+]?\d+(?:\.\d+)?)/i);
  if (m) {
    const a = toNum(m[1]);
    const b = toNum(m[2]);
    if (!Number.isNaN(a) && !Number.isNaN(b)) {
      const low = Math.min(a, b),
        high = Math.max(a, b);
      return { low, high, label: `${fmtNum(low, 3)} ~ ${fmtNum(high, 3)}` };
    }
  }

  // 3) unilateral in parentheses: "Φ9.0 (0, +0.2mm 이내)" → [center + 0, center + 0.2]
  m = t.match(/(?:ø|Ø|Φ)?\s*([-+]?\d+(?:\.\d+)?)\s*\(\s*([-+]?\d+(?:\.\d+)?)\s*,\s*\+?([-+]?\d+(?:\.\d+)?)\s*.*?\)/i);
  if (m) {
    const center = toNum(m[1]);
    const loOff = toNum(m[2]);
    const hiOff = toNum(m[3]);
    if (!Number.isNaN(center) && !Number.isNaN(loOff) && !Number.isNaN(hiOff)) {
      const low = center + loOff;
      const high = center + hiOff;
      const l = Math.min(low, high),
        h = Math.max(low, high);
      return { low: l, high: h, label: `${fmtNum(l, 3)} ~ ${fmtNum(h, 3)}` };
    }
  }

  // 4) plus-only tolerance text: "ø13.5, +0.2mm 이내" → [center, center+tol]
  m = t.match(/(?:ø|Ø|Φ)?\s*([-+]?\d+(?:\.\d+)?)[^0-9+.-]+?\+?\s*([-+]?\d+(?:\.\d+)?)\s*mm\s*이내/i);
  if (m) {
    const center = toNum(m[1]);
    const tol = toNum(m[2]);
    if (!Number.isNaN(center) && !Number.isNaN(tol)) {
      const low = center;
      const high = center + tol;
      return { low, high, label: `${fmtNum(low, 3)} ~ ${fmtNum(high, 3)}` };
    }
  }

  // 5) 하위 호환 패턴
  m = t.match(/(?:ø|Ø|Φ)?\s*([-+]?\d+(?:\.\d+)?)\D+\+?([-+]?\d+(?:\.\d+)?)/i);
  if (m) {
    const center = toNum(m[1]);
    const tol = toNum(m[2]);
    if (!Number.isNaN(center) && !Number.isNaN(tol)) {
      const low = center;
      const high = center + tol;
      return { low, high, label: `${fmtNum(low, 3)} ~ ${fmtNum(high, 3)}` };
    }
  }

  return null;
};

/** 🔕 타임라인 제외 키워드 */
const SKIP_TIMELINE_KEYWORDS = ["외관", "금형상태", "클린부품", "무명 항목"];

// 한 행에서 타임라인 라벨 만들기
const labelOfRow = (r) => {
  const name = r?.["검사항목명"] ?? "";
  const spec = r?.["검사내용"] ?? "";
  return spec ? `[${name}] ${spec}` : name || "(무명 항목)";
};

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

    // 숫자형 추이 (사용 안 함)
    numTrend: { dates: [], series: [] },

    // 옵션
    factories: [],
    processes: [],
    equipments: [],
    parts: [],
    items: [],
    optionsLoading: false,

    // UI 로딩 플래그(분리)
    loadingDaily: false,
    loadingTrend: false,
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
    defectModalOpen: false,

    // 동적 "검사내용" 폭(px)
    specColWidth: COL_W.specBase,

    // ✅ 높이 동기화 상태
    dayPanelHeight: undefined,
    leftPanelHeight: undefined,

    // ✅ 차트 뷰포트(스크롤 컨테이너) 실제 가로폭
    chartViewportWidth: 0,

    // ✅ 보고일 패널 접힘 여부
    dayPanelCollapsed: false,

    // ✅ 행 클릭 모달(검사내용별 연속 Xn)
    specModalOpen: false,
    specModalLabel: "",
    specModalData: [],
    specModalSpecText: "",
  };

  _hadSavedFilters = false;
  _runId = 0;
  _pendingTimer = null;
  _controllers = new Set();

  _dailyCache = new Lru(6);
  _trendCache = new Lru(6);
  _optionsCache = new Lru(6);

  // --- 측정/리사이즈 옵저버 ---
  _measureCtx = null;
  _chartViewportEl = null;
  _chartRO = null;
  _roTimer = null; // ← 디바운스 타이머

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

  /** ✅ 높이 측정 refs */
  tableCardRef = React.createRef();
  leftPanelRef = React.createRef();

  /** ✅ 차트 뷰포트 ref 콜백 + ResizeObserver */
  setChartViewportRef = (el) => {
    if (this._chartViewportEl === el) return;
    if (this._chartRO && this._chartViewportEl) {
      try {
        this._chartRO.unobserve(this._chartViewportEl);
      } catch {}
    }
    this._chartViewportEl = el;

    if (el && typeof ResizeObserver !== "undefined") {
      if (!this._chartRO) {
        this._chartRO = new ResizeObserver(() => this.updateChartViewportWidthDebounced());
      }
      this._chartRO.observe(el);
      this.updateChartViewportWidth();
    }
  };

  updateChartViewportWidth = () => {
    const w = this._chartViewportEl ? this._chartViewportEl.clientWidth : 0;
    if (w && w !== this.state.chartViewportWidth) {
      this.setState({ chartViewportWidth: w });
    }
  };

  updateChartViewportWidthDebounced = () => {
    if (this._roTimer) clearTimeout(this._roTimer);
    this._roTimer = setTimeout(this.updateChartViewportWidth, 120);
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

    requestAnimationFrame(this.updateLeftPanelHeight);

    this.bootstrap({ forceLatestMonth: !this._hadSavedFilters });

    window.addEventListener("resize", this.updateDayPanelHeight);
    window.addEventListener("resize", this.updateLeftPanelHeight);
    window.addEventListener("resize", this.updateChartViewportWidthDebounced);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDayPanelHeight);
    window.removeEventListener("resize", this.updateLeftPanelHeight);
    window.removeEventListener("resize", this.updateChartViewportWidthDebounced);
    if (this._chartRO) {
      try {
        this._chartRO.disconnect();
      } catch {}
      this._chartRO = null;
    }
    if (this._roTimer) clearTimeout(this._roTimer);
  }

  componentDidUpdate(_, prevState) {
    if (this.state.selectedDay !== prevState.selectedDay) {
      const rows = this.state.dailyTables?.[this.state.selectedDay] || [];
      const w = this.computeSpecWidthFromRows(rows);
      if (w !== this.state.specColWidth) this.setState({ specColWidth: w });
    }

    if (
      this.state.loadingDaily !== prevState.loadingDaily ||
      this.state.selectedDay !== prevState.selectedDay ||
      this.state.specColWidth !== prevState.specColWidth
    ) {
      requestAnimationFrame(this.updateDayPanelHeight);
      requestAnimationFrame(this.updateLeftPanelHeight);
    }
  }

  updateDayPanelHeight = () => {
    const el = this.tableCardRef?.current;
    if (!el) return;
    const h = el.offsetHeight || 0;
    if (!h) return;
    const next = Math.max(280, h);
    if (this.state.dayPanelHeight !== next) {
      this.setState({ dayPanelHeight: next });
    }
  };

  updateLeftPanelHeight = () => {
    const el = this.leftPanelRef?.current;
    if (!el) return;
    const h = el.offsetHeight || 0;
    if (!h) return;
    const next = Math.max(280, h);
    if (this.state.leftPanelHeight !== next) {
      this.setState({ leftPanelHeight: next });
    }
  };

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

      const exact = rows.find((r) => norm(readPn(r)) === pn);
      const nm = norm(exact ? readNm(exact) : rows.length ? readNm(rows[0]) : "");
      if (nm && nm !== pn) return nm;
      return "";
    } catch {
      return "";
    }
  };

  /** ✅ DB 최신 보고일의 "달"을 기본 기간으로 세팅 */
  setDefaultToLatestMonthViaEndpoint = async (force = false) => {
    try {
      if (!force && this._hadSavedFilters) return false;

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
      const start = data?.start,
        end = data?.end,
        year = data?.year,
        month = data?.month;

      if (start && end) {
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
      return false;
    }
  };

  bootstrap = async ({ forceLatestMonth = false } = {}) => {
    await this.loadYears();
    // 초기 진입 시(저장된 필터 없음)엔 최신월 강제 적용, 저장된 필터가 있으면 존중
    await this.setDefaultToLatestMonthViaEndpoint(forceLatestMonth);
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
          this._hadSavedFilters = false;
          resolve();
        }
      );
    });

    await this.loadOptions();
    await this.setDefaultToLatestMonthViaEndpoint(true);
    await this.loadAll();
  };

  /** 데이터 로드 (캐시 + 단계적 로딩: daily 먼저) */
  loadAll = async () => {
    const runId = ++this._runId;
    this._abortAll();

    const { filters } = this.state;
    try {
      localStorage.setItem("inspectionFilters", JSON.stringify(filters));
    } catch {}

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

    this.setState({ numTrend: { dates: [], series: [] }, loadingTrend: false }, () => {
      this.updateDayPanelHeight();
      this.updateLeftPanelHeight();
      this.updateChartViewportWidth();
    });
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

  /** partNo → item(품명) 추론 */
  getItemNameFromOptions = (partNo, parts = this.state.parts, items = this.state.items) => {
    const pn = norm(partNo);
    if (!pn) return "";
    const readPn = (o) =>
      typeof o === "string"
        ? o
        : o?.partNo ??
          o?.품목번호 ??
          o?.code ??
          o?.value ??
          o?.id ??
          o?.PART_NO ??
          o?.PartNo ??
          o?.품번 ??
          o?.itemCode;
    const readNm = (o) =>
      typeof o === "string"
        ? o
        : o?.item ??
          o?.itemName ??
          o?.품목명 ??
          o?.name ??
          o?.label ??
          o?.ITEM_NM ??
          o?.ItemName ??
          o?.품명 ??
          o?.part_nm;

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
      row?.item,
      row?.itemName,
      row?.partName,
      row?.품목명,
      row?.item_label,
      row?.name,
      row?.label,
      row?.품명,
      row?.part_nm,
    ]
      .map(norm)
      .filter((v) => v && v !== pn && v !== "-");
    if (cands.length) return cands[0];
    return this.getItemNameFromOptions(pn);
  };

  /** 보고일 클릭 → 설비/품번 반영 */
  handleDayClick = async (row) => {
    const { d, equipment, partNo } = row || {};
    const { filters } = this.state;

    if ((equipment || filters.equipment) === filters.equipment && (partNo || "") === (filters.partNo || "")) {
      this.setState({ selectedDay: d }, () => {
        this.updateLeftPanelHeight();
        this.updateDayPanelHeight();
      });
      return;
    }

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
        await this.loadOptions();

        const curPn = norm(this.state.filters.partNo);
        const curItem = norm(this.state.filters.item);
        if (curPn && (!curItem || curItem === "-" || curItem === curPn)) {
          const modalName = await this.fetchItemFromModal(curPn);
          if (modalName) {
            this.setState((prev) => ({ filters: { ...prev.filters, item: modalName } }));
          } else {
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

  /** 보고일 패널 토글 */
  toggleDayPanel = () => {
    this.setState((prev) => ({ dayPanelCollapsed: !prev.dayPanelCollapsed }));
  };
  openDayPanel = () => {
    this.setState({ dayPanelCollapsed: false });
  };
  closeDayPanel = () => {
    this.setState({ dayPanelCollapsed: true });
  };

  /** 특정 라벨(= 한 검사내용)에 대한 연속 Xn 타임라인 생성 */
  buildConcatXnForLabel = (label) => {
    const { dailyDays, dailyTables, dailyCols, dailyShifts } = this.state;
    if (!dailyDays?.length || !dailyCols?.length || !label) return [];

    const orderedShifts = ["주간", "야간"].filter((s) =>
      (dailyShifts && dailyShifts.length ? dailyShifts : ["주간", "야간"]).includes(s)
    );

    let idx = 0;
    const rows = [];

    dailyDays.forEach((d) => {
      const found = (dailyTables?.[d] || []).find((r) => labelOfRow(r) === label);
      orderedShifts.forEach((s) => {
        dailyCols.forEach((c) => {
          const v = found?.[s]?.[c];
          if (v !== null && v !== undefined && v !== "") {
            idx += 1;
            rows.push({
              idx,
              tick: `${d} ${c} ${s}`,
              day: d,
              xn: c,
              shift: s,
              y: Number(v),
            });
          }
        });
      });
    });

    return rows;
  };

  /** 표의 한 행 클릭 → 모달 열기 */
  handleRowClickOpenModal = (row) => {
    const label = labelOfRow(row);
    if (SKIP_TIMELINE_KEYWORDS.some((kw) => String(label).includes(kw))) return;

    const data = this.buildConcatXnForLabel(label);
    const specText = row?.["검사내용"] ?? "";
    this.setState({
      specModalOpen: true,
      specModalLabel: label,
      specModalData: data,
      specModalSpecText: specText,
    });
  };

  closeSpecModal = () => this.setState({ specModalOpen: false });

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
          sx={{ backgroundColor: this.props.themeHex, color: "white", borderRadius: 1, mb: 2 }}
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

        <Box sx={{ mt: 2, display: "flex", gap: 2, justifyContent: "flex-end", flexWrap: "wrap" }}>
          <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToThisYear} size="large" color="secondary">
            필터 초기화
          </Button>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            size="large"
            sx={{ backgroundColor: this.props.themeHex, "&:hover": { backgroundColor: "#f57c00" } }}
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
            startIcon={<ReportProblemIcon />}
            size="large"
            onClick={() => this.setState({ defectModalOpen: true })}
            disabled={!this.state.filters.start_date || !this.state.filters.end_date}
          >
            불량 내역
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
      leftPanelHeight,
    } = this.state;

    if (!filters.partNo) {
      return (
        <Paper
          className={s.section}
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: leftPanelHeight || 480,
          }}
        >
          <Box className={s.sectionHeader}>
            <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
              검사이력현황
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
      <Paper
        className={s.section}
        sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden" }}
        ref={this.tableCardRef}
      >
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
            검사이력현황
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
            <Chip size="small" label={partText} />
            {itemText && <Chip size="small" variant="outlined" label={itemText} />}
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
            <CircularProgress size={60} sx={{ color: this.props.themeHex }} />
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
                  <tr
                    key={idx}
                    onClick={() => this.handleRowClickOpenModal(r)}
                    style={{ cursor: "pointer" }}
                    title="클릭하면 해당 검사내용의 연속 Xn 타임라인을 봅니다"
                  >
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

  /** ✅ Y축 도메인 계산 */
  getPaddedYDomain = (rows, keys, padRatio = 0.1, extraNumbers = []) => {
    try {
      const vals = [];
      (rows || []).forEach((row) =>
        (keys || []).forEach((k) => {
          const v = row?.[k];
          if (v !== null && v !== undefined && v !== "" && !Number.isNaN(Number(v))) vals.push(Number(v));
        })
      );
      (extraNumbers || []).forEach((n) => {
        if (n !== null && n !== undefined && !Number.isNaN(Number(n))) vals.push(Number(n));
      });
      if (!vals.length) return ["auto", "auto"];
      let min = Math.min(...vals);
      let max = Math.max(...vals);
      if (min === max) {
        const d = Math.max(1, Math.abs(min) * 0.05);
        min -= d;
        max += d;
      }
      const pad = (max - min) * padRatio;
      return [min - pad, max + pad];
    } catch {
      return ["auto", "auto"];
    }
  };

  /** ✅ Y축 tick 생성 */
  makeTicksByStep = (domain, step = 0.1) => {
    if (!Array.isArray(domain) || domain.some((v) => v === "auto")) return undefined;
    let [min, max] = domain;
    if (!Number.isFinite(min) || !Number.isFinite(max)) return undefined;

    const start = Math.floor(min / step) * step;
    const end = Math.ceil(max / step) * step;

    const ticks = [];
    const MAX_TICKS = 200;
    for (let v = start, i = 0; v <= end + 1e-9 && i < MAX_TICKS; v += step, i += 1) {
      ticks.push(Number(v.toFixed(3)));
    }
    return ticks.length ? ticks : undefined;
  };

  /** 기간 전체 — 검사내용별 연속 Xn 타임라인 */
  buildConcatXnSeriesPerSpec = () => {
    const { dailyDays, dailyTables, dailyCols, dailyShifts } = this.state;
    if (!dailyDays?.length || !dailyCols?.length) return [];

    const orderedShifts = ["주간", "야간"].filter((s) =>
      (dailyShifts && dailyShifts.length ? dailyShifts : ["주간", "야간"]).includes(s)
    );

    const labelOf = (r) => {
      const name = r?.["검사항목명"] ?? "";
      const spec = r?.["검사내용"] ?? "";
      return spec ? `[${name}] ${spec}` : name || "(무명 항목)";
    };

    const byDate = {};
    dailyDays.forEach((d) => {
      const m = new Map();
      (dailyTables?.[d] || []).forEach((r) => m.set(labelOf(r), r));
      byDate[d] = m;
    });

    const allLabels = new Set();
    Object.values(byDate).forEach((m) => m.forEach((_, k) => allLabels.add(k)));

    const out = [];
    allLabels.forEach((label) => {
      let idx = 0;
      const rows = [];

      let specText = "";
      for (const d of dailyDays) {
        const r = byDate[d].get(label);
        if (r && r["검사내용"]) {
          specText = r["검사내용"];
          break;
        }
      }

      dailyDays.forEach((d) => {
        const r = byDate[d].get(label);

        orderedShifts.forEach((s) => {
          this.state.dailyCols.forEach((c) => {
            const v = r?.[s]?.[c];
            if (v !== null && v !== undefined && v !== "") {
              idx += 1;
              rows.push({
                idx,
                tick: `${d} ${c} ${s}`,
                day: d,
                xn: c,
                shift: s,
                y: Number(v),
              });
            }
          });
        });
      });

      out.push({ label, data: rows, specText });
    });

    return out;
  };

  getShiftShort = (s) => {
    if (!s) return "";
    if (String(s).includes("주")) return "주";
    if (String(s).includes("야")) return "야";
    return String(s);
  };

  renderConcatXnPerSpec = () => {
    const { filters, loadingDaily } = this.state;
    if (!filters.partNo) return null;

    const partText = filters.partNo ? filters.partNo : "전체 품번";
    const itemText = filters.item || "";
    const rangeText = `${filters.start_date || "-"} ~ ${filters.end_date || "-"}`;

    const rawCards = this.buildConcatXnSeriesPerSpec();

    const cards = rawCards.filter(({ label, data }) => {
      if (!Array.isArray(data) || data.length === 0) return false;
      const t = String(label || "");
      return !SKIP_TIMELINE_KEYWORDS.some((kw) => t.includes(kw));
    });

    if (!loadingDaily && cards.length === 0) return null;

    return (
      <Paper className={`${s.section} ${s.fullRow}`} sx={{ mt: 2, minWidth: 0 }}>
        <Box className={s.sectionHeader} sx={{ alignItems: "center" }}>
          <Typography className={s.sectionTitle} sx={{ color: this.props.themeHex, fontWeight: 800 }}>
            기간 전체 · 검사내용별 연속 Xn 타임라인
          </Typography>
        </Box>

        {loadingDaily ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 240 }}>
            <CircularProgress size={44} sx={{ color: this.props.themeHex }} />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {cards.map(({ label, data, specText }, i) => {
              const viewportW = Math.max(0, this.state.chartViewportWidth || 0);

              const shifts = Math.max(1, this.state.dailyShifts?.length || 0);
              const xns = Math.max(1, this.state.dailyCols?.length || 0);
              const pointsPerDay = shifts * xns;

              const minVisibleWidth = Math.max(viewportW, DAY_WINDOW * pointsPerDay * TICK_WIDTH);
              const neededContentWidth = data.length * TICK_WIDTH;
              const fullWidth = Math.max(minVisibleWidth, neededContentWidth);

              const dayTicks = [];
              let lastDay = null;
              for (const p of data) {
                if (p.day !== lastDay) {
                  dayTicks.push(p.idx);
                  lastDay = p.day;
                }
              }

              const specRange = parseSpecRange(specText);
              const yDomain = this.getPaddedYDomain(data, ["y"], 0.1, specRange ? [specRange.low, specRange.high] : []);

              return (
                <Paper key={i} elevation={1} sx={{ p: 2, borderRadius: 2, width: "100%" }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 1,
                      mb: 0.5,
                      flexWrap: "wrap",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 800, color: "#546e7a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                      title={label}
                    >
                      {label}
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12 }}>품번</Typography>
                      <Chip size="small" label={partText} />
                      {itemText && <Chip size="small" variant="outlined" label={itemText} />}
                      <Typography sx={{ color: "#607d8b", fontWeight: 800, fontSize: 12, ml: 1 }}>기간</Typography>
                      <Chip size="small" label={rangeText} />
                    </Box>
                  </Box>

                  <Box sx={{ width: "100%", overflowX: "auto", overflowY: "hidden" }} ref={i === 0 ? this.setChartViewportRef : undefined}>
                    <Box sx={{ width: `${fullWidth}px`, height: 300 }}>
                      <LineChart width={fullWidth} height={300} data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        {specRange && Number.isFinite(specRange.low) && Number.isFinite(specRange.high) && (
                          <ReferenceArea y1={specRange.low} y2={specRange.high} fill="#bbdefb" fillOpacity={0.35} stroke={null} />
                        )}

                        <XAxis
                          dataKey="idx"
                          ticks={dayTicks}
                          interval={0}
                          tickLine
                          tickMargin={8}
                          tickFormatter={(v) => {
                            const item = data[v - 1];
                            return item?.day ? item.day.slice(5) : "";
                          }}
                        />
                        <YAxis domain={yDomain} ticks={this.makeTicksByStep(yDomain, 0.1)} allowDataOverflow tickFormatter={(v) => fmtNum(v, 1)} />

                        <RTooltip
                          formatter={(value) => fmtNum(value, 3)}
                          labelFormatter={(v) => {
                            const item = data.find((d) => d.idx === v);
                            return item ? item.tick : v;
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="y"
                          name="값"
                          dot={{ r: 3 }}
                          activeDot={{ r: 6 }}
                          strokeWidth={2}
                          connectNulls
                          isAnimationActive={false}
                        >
                          <LabelList
                            dataKey="y"
                            isAnimationActive={false}
                            content={(props) => {
                              const { x, y, value } = props;
                              if (value == null || Number.isNaN(Number(value))) return null;
                              return (
                                <text x={x} y={y - 8} textAnchor="middle" fontSize="11" fill="#555">
                                  {fmtNum(value, 3)}
                                </text>
                              );
                            }}
                          />
                        </Line>
                      </LineChart>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 0.5, flexWrap: "wrap", gap: 1 }}>
                    {specRange && (
                      <Typography variant="caption" sx={{ color: "#1565c0", fontWeight: 700 }}>
                        허용범위: {fmtNum(specRange.low, 3)} ~ {fmtNum(specRange.high, 3)}
                      </Typography>
                    )}
                  </Box>
                </Paper>
              );
            })}
          </Box>
        )}
      </Paper>
    );
  };

  renderSpecTimelineModal = () => {
    const { specModalOpen, specModalLabel, specModalData, specModalSpecText } = this.state;

    const dayTicks = [];
    let lastDay = null;
    for (const p of specModalData || []) {
      if (p.day !== lastDay) {
        dayTicks.push(p.idx);
        lastDay = p.day;
      }
    }
    const specRange = parseSpecRange(specModalSpecText);
    const yDomain = this.getPaddedYDomain(specModalData, ["y"], 0.1, specRange ? [specRange.low, specRange.high] : []);
    const fullWidth = Math.max(800, (specModalData?.length || 0) * TICK_WIDTH);

    return (
      <Dialog open={specModalOpen} onClose={this.closeSpecModal} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {specModalLabel || "연속 Xn 타임라인"}
          <IconButton onClick={this.closeSpecModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ pb: 2 }}>
          {specModalSpecText && (
            <Typography variant="body2" sx={{ color: "#546e7a", mb: 1 }}>
              검사내용: {specModalSpecText}
            </Typography>
          )}
          <Box sx={{ width: "100%", overflowX: "auto", overflowY: "hidden" }}>
            {specModalData?.length ? (
              <Box sx={{ width: `${fullWidth}px`, height: 340 }}>
                <LineChart width={fullWidth} height={320} data={specModalData} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  {specRange && Number.isFinite(specRange.low) && Number.isFinite(specRange.high) && (
                    <ReferenceArea y1={specRange.low} y2={specRange.high} fill="#bbdefb" fillOpacity={0.35} stroke={null} />
                  )}
                  <XAxis
                    dataKey="idx"
                    ticks={dayTicks}
                    interval={0}
                    tickLine
                    tickMargin={8}
                    tickFormatter={(v) => {
                      const item = specModalData[v - 1];
                      return item?.day ? item.day.slice(5) : "";
                    }}
                  />
                  <YAxis domain={yDomain} ticks={this.makeTicksByStep(yDomain, 0.1)} allowDataOverflow tickFormatter={(v) => fmtNum(v, 1)} />
                  <RTooltip
                    formatter={(value) => fmtNum(value, 3)}
                    labelFormatter={(v) => {
                      const item = specModalData.find((d) => d.idx === v);
                      return item ? item.tick : v;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="y"
                    name="값"
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                    connectNulls
                    isAnimationActive={false}
                  >
                    <LabelList
                      dataKey="y"
                      isAnimationActive={false}
                      content={(props) => {
                        const { x, y, value } = props;
                        if (value == null || Number.isNaN(Number(value))) return null;
                        return (
                          <text x={x} y={y - 8} textAnchor="middle" fontSize="11" fill="#555">
                            {fmtNum(value, 3)}
                          </text>
                        );
                      }}
                    />
                  </Line>
                </LineChart>
              </Box>
            ) : (
              <Box sx={{ py: 6, textAlign: "center", color: "#90a4ae", fontWeight: 700 }}>표시할 데이터가 없습니다.</Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={this.closeSpecModal}>닫기</Button>
        </DialogActions>
      </Dialog>
    );
  };

  render() {
    const { error, dailyList, selectedDay, loadingDaily, dayPanelHeight, dayPanelCollapsed } = this.state;

    return (
      <Box className={s.root}>
        {/* 헤더 섹션 */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: this.props.themeHex,
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <TrendingUp /> 검사 데이터 차트
          </Typography>
          <Typography variant="body1" color="text.secondary">
            검사 결과를 차트와 표로 한눈에 파악할 수 있습니다.
          </Typography>
        </Box>

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
              sx={{ backgroundColor: this.props.themeHex, "&:hover": { backgroundColor: "#f57c00" } }}
            >
              다시 시도
            </Button>
          </Box>
        )}

        {/* 본문: 좌측 날짜 목록 + 우측 표, 그리고 전체폭 타임라인 */}
        <Box
          className={s.dailyLayout}
          sx={{
            // 접힘 상태에선 '버튼 전용 컬럼(56px) + 본문 minmax(0,1fr)' 로 설정해 오버플로 방지
            gridTemplateColumns: dayPanelCollapsed ? "56px minmax(0, 1fr)" : undefined,
          }}
        >
          {/* 접히지 않았을 땐 좌측 '보고일' 패널이 자리 차지 */}
          {!dayPanelCollapsed && (
            <Paper
              className={s.dayPanel}
              ref={this.leftPanelRef}
              sx={{
                height: dayPanelHeight || "auto",
                minHeight: 400,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                <Typography sx={{ fontWeight: 900, fontSize: 14, color: "#546e7a" }}>보고일</Typography>
                <Tooltip title="보고일 닫기">
                  <IconButton size="small" onClick={this.closeDayPanel}>
                    <ChevronLeftIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>

              <Box className={s.dayList}>
                <div className={s.dayListHead}>
                  <span>보고일</span>
                  <span>설비</span>
                  <span>품번</span>
                </div>
                <div className={s.dayListBody}>
                  {loadingDaily ? (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6, color: "#90a4ae" }}>
                      <CircularProgress size={28} sx={{ mr: 1, color: this.props.themeHex }} />
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
          )}

          {/* 접힌 상태: 왼쪽에 56px 고정 컬럼을 실제로 차지하며 버튼 표시(겹치지 않음) */}
          {dayPanelCollapsed && (
            <Box
              sx={{
                width: 56,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "center",
                pt: 1,
              }}
            >
              <Tooltip title="보고일 열기">
                <Fab
                  size="small"
                  color="inherit"
                  onClick={this.openDayPanel}
                  sx={{
                    bgcolor: this.props.themeHex,
                    color: '#fff',
                    '&:hover': { bgcolor: this.props.themeHex },
                    '&:active': { bgcolor: this.props.themeHex },
                  }}
                >
                  <ChevronRightIcon />
                </Fab>
              </Tooltip>

            </Box>
          )}

          <Box
            className={s.rightArea}
            sx={{
              gridColumn: dayPanelCollapsed ? "2 / -1" : undefined,
              minWidth: 0, // ⬅️ grid 아이템이 내용폭만큼 늘어나지 않도록
            }}
          >
            {this.renderDailyTable()}
          </Box>

          {/* ✅ 화면 가로 전체(두 컬럼 span) 타임라인 */}
          {this.renderConcatXnPerSpec()}
        </Box>

        {this.renderSpecTimelineModal()}

        <DefectDetailModal
          open={this.state.defectModalOpen}
          onClose={() => this.setState({ defectModalOpen: false })}
          filters={this.state.filters}
        />
      </Box>
    );
  }
}

export default connect(mapStateToProps)(InspectionSystemChart);
