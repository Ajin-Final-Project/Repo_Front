// DowntimeChart.js
import React, { Component } from "react";
import { connect } from "react-redux";
import TitleSection from "./components/TitleSection";
import KpiSection from "./components/KpiSection";
import MonthlySection from "./components/MonthlySection";
import PieAndNotesSection from "./components/PieAndNotesSection";
import { RightDetailSection } from "./components/FacilityItemDowntimeAggSection";
import DowntimeAggSection from "./components/DowntimeAggSection";
import s from "./DowntimeChart.module.scss";
import { selectThemeHex } from "../../reducers/layout";
import config from "../../config";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  CardHeader,
  IconButton,
  Divider,
  Collapse,
  MenuItem,
  Menu,
  CircularProgress,
  Alert,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";
import { alpha } from "@mui/material/styles";

import ItemCodeModal from "../common/ItemCodeModal";

class DowntimeChart extends Component {
  constructor(props) {
    super(props);

    const DEFAULT_END = "2025-06-30";
    const start_work_date = "2025-01-01";

    this.PIE_TOP_N = 5;
    this.PIE_WITH_OTHERS = true;
    this.API = (path) => `${config.baseURLApi}/smartFactory${path}`;
    this.ctrl = {
      summary: null, monthly: null, pie: null, notes: null, codes: null,
      facilityItemDowntimeAgg: null, FacilityLineDowntimeAgg: null, causeDetail: null,
    };

    this.state = {
      // 모드: ITEM(품번별) / LINE(라인 종합)
      scopeMode: "ITEM",

      pageLoading: true,
      pageError: null,
      loading: {
        summary: false, monthly: false, pie: false, notes: false, codes: false,
        facilityItemDowntimeAgg: false, FacilityLineDowntimeAgg: false, causeDetail: false,
      },
      error: {
        summary: null, monthly: null, pie: null, notes: null, codes: null,
        facilityItemDowntimeAgg: null, FacilityLineDowntimeAgg: null, causeDetail: null,
      },

      kpiFilters: { start_work_date, end_work_date: DEFAULT_END, press: "1500T" },
      kpiSummary: { total: 0, count: 0, avg: 0, topName: "-", topValue: 0, topList: [] },

      // 전역 검색 필터(단일 소스)
      uiFilters: {
        start_work_date, end_work_date: DEFAULT_END,
        plant: "아진산업-경산(본사)", worker: "프레스", line: "1500T",
        itemCode: "", itemName: "",
        carModel: "", downtimeCode: "", downtimeName: "", downtimeMinutes: "",
        note: "", shift: "", productName: "", itemType: "", categoryMain: "", categorySub: "",
      },

      filterExpanded: false,
      itemCodeModalOpen: false,

      itemCodeOptions: [],
      chartItemCode: "",

      chartMonths: [],
      chartSeries: [{ label: "비가동(분)", data: [] }],
      chartMonthTop3Map: {},
      pieData: [],
      topNotes: [],

      // 좌/우 섹션 데이터
      facilityItemDowntimeAgg: [],
      facilityLineDowntimeAgg: [],

      // 우측 상세
      selectedCause: null,
      rightDetail: null,

      // === 연간/월간/주간/오늘용 상태 ===
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      yearAnchorPos: null,
      monthAnchorPos: null,
      weekAnchorPos: null,
      years: [],
    };
  }

  // ------------ helpers ------------
  isLineMode = () => this.state.scopeMode === "LINE";
  hasValidItemCode = () => !!(this.state.chartItemCode && String(this.state.chartItemCode).trim());

  abortPrev = (key) => {
    try { this.ctrl[key]?.abort(); } catch {}
    this.ctrl[key] = new AbortController();
    return this.ctrl[key].signal;
  };

  setLoading = (k, v) => this.setState((s) => ({ loading: { ...s.loading, [k]: v } }));
  setError   = (k, v) => this.setState((s) => ({ error:   { ...s.error,   [k]: v } }));

  fmtNumber  = (n) => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(n ?? 0);
  fmtMinutes = (n) => this.fmtNumber(Math.round(n ?? 0));
  monthKeyToLabel = (ym) => `${Number(String(ym).split("-")[1] || 0)}월`;

  parseDate = (raw) => {
    if (!raw) return null;
    let s = String(raw).split("T")[0].replace(/[./]/g, "-");
    const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) s = `${m[1]}-${String(m[2]).padStart(2, "0")}-${m[3]}`;
    const d = new Date(`${s}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  };
  ensureValidRange = (f) => {
    const sd = this.parseDate(f.start_work_date);
    const ed = this.parseDate(f.end_work_date);
    if (sd && ed && sd > ed) return { ...f, end_work_date: f.start_work_date };
    return f;
  };
  toYMD = (d) => (d ? (d instanceof Date ? d : new Date(d)).toLocaleDateString("sv-SE") : "");
  iso = (d) => (d instanceof Date ? d.toLocaleDateString("sv-SE") : this.toYMD(d));

  // Promise 기반 setState 유틸(await 사용)
  setStateAsync = (updater) => new Promise((resolve) => this.setState(updater, resolve));

  // === 연/월/주 계산 & 앵커 ===
  today0 = () => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  };
  lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

  getAnchorPos = (el) => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
  };

  startOfWeek = (d) => {
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // 월요일 시작
    const s = new Date(d);
    s.setDate(d.getDate() + diff);
    return new Date(s.getFullYear(), s.getMonth(), s.getDate());
  };
  endOfWeek = (d) => {
    const s = this.startOfWeek(d);
    return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
  };
  getWeeksOfMonth = (year, month) => {
    const first = new Date(year, month - 1, 1);
    const last = this.lastOfMonth(first);
    let cur = this.startOfWeek(first);
    const out = [];
    let idx = 1;
    while (cur <= last) {
      const s = new Date(cur), e = this.endOfWeek(cur);
      const clipS = new Date(Math.max(s, first));
      const clipE = new Date(Math.min(e, last));
      out.push({ label: `${idx}주차`, start: clipS, end: clipE });
      idx += 1;
      cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
    }
    return out;
  };

  setDateRange = (start, end) => {
    const start_work_date = this.iso(start);
    const end_work_date = this.iso(end);
    this.setState((s) => ({
      uiFilters: this.ensureValidRange({ ...s.uiFilters, start_work_date, end_work_date }),
    }));
  };
  applyToday = () => {
    const t = this.today0();
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
    const e = this.lastOfMonth(s);
    this.setState({ monthAnchorPos: null, selectedMonth: m });
    this.setDateRange(s, e);
  };
  selectWeek = (w) => {
    this.setState({ weekAnchorPos: null });
    this.setDateRange(w.start, w.end);
  };

  loadYears = async () => {
    // 서버 연도 API가 없으므로 안전한 fallback(현재연도~최근 5년)
    const y = new Date().getFullYear();
    const years = [y, y - 1, y - 2, y - 3, y - 4];
    this.setState({ years, selectedYear: y });
  };

  // ------------ lifecycle ------------
  async componentDidMount() {
    const { uiFilters } = this.state;
    try {
      await this.loadYears(); // 연도 메뉴용

      // 품번 목록만 미리 로드(자동 선택 X)
      await this.fetchItemCodes({
        press: uiFilters.line,
        start_work_date: uiFilters.start_work_date,
        end_work_date: uiFilters.end_work_date,
      });

      // 초기엔 KPI + 라인 종합만
      await this.setStateAsync({
        chartItemCode: "",
        uiFilters: { ...uiFilters, itemCode: "", itemName: "" },
        kpiFilters: { ...this.state.kpiFilters, press: uiFilters.line },
      });

      await Promise.all([this.fetchSummary(), this.fetchFacilityLineDowntimeAgg()]);
    } catch (e) {
      this.setState({ pageError: "데이터를 불러오는 중 오류가 발생했습니다." });
    } finally {
      this.setState({ pageLoading: false });
    }
  }

  // ------------ API ------------
  async fetchJson(url, options, key) {
    const res = await fetch(url, options);
    if (!res.ok) throw new Error(`${key || "API"} 실패: HTTP ${res.status} ${await res.text().catch(() => "")}`);
    return res.json();
  }

  fetchItemCodes = async (override = {}) => {
    const filters = { ...this.state.kpiFilters, ...override };
    this.setLoading("codes", true); this.setError("codes", null);
    try {
      const qs = new URLSearchParams({
        workplace: filters.press || "",
        start_work_date: filters.start_work_date || "",
        end_work_date: filters.end_work_date || "",
      }).toString();
      const signal = this.abortPrev("codes");
      const json = await this.fetchJson(this.API(`/downtime_chart/item-codes?${qs}`), { signal }, "자재코드");
      const arr = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];
      const codes = (arr || []).filter(Boolean);
      this.setState({ itemCodeOptions: codes });
      return codes;
    } catch (e) {
      this.setError("codes", e.message || "자재번호 목록 조회 실패");
      this.setState({ itemCodeOptions: [] });
      return [];
    } finally {
      this.setLoading("codes", false);
    }
  };

  fetchSummary = async () => {
    const { kpiFilters } = this.state;
    this.setLoading("summary", true); this.setError("summary", null);
    try {
      const signal = this.abortPrev("summary");
      const payload = { start_work_date: kpiFilters.start_work_date, end_work_date: kpiFilters.end_work_date, workplace: kpiFilters.press };
      const json = await this.fetchJson(this.API("/downtime_chart/summary?top=3"), {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal, body: JSON.stringify(payload),
      }, "summary");
      const j = json?.data || json;
      const topList = Array.isArray(j?.topList)
        ? j.topList.map(it=>({name:String(it?.name ?? it?.label ?? "-"), minutes:Number(it?.minutes ?? it?.topValue ?? 0)}))
        : [];
      const fallback = { name: String(j?.topName ?? "-"), minutes: Number(j?.topValue ?? 0) };
      const finalTopList = topList.length ? topList : (fallback.name !== "-" || fallback.minutes > 0) ? [fallback] : [];
      this.setState({
        kpiSummary: {
          total: Number(j?.total ?? 0), count: Number(j?.count ?? 0), avg: Number(j?.avg ?? 0),
          topName: String(j?.topName ?? (finalTopList[0]?.name ?? "-")), topValue: Number(j?.topValue ?? (finalTopList[0]?.minutes ?? 0)), topList: finalTopList,
        },
      });
    } catch (e) {
      this.setError("summary", e.message || "KPI 요약 조회 실패"); throw e;
    } finally { this.setLoading("summary", false); }
  };

  fetchMonthly = async () => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!this.hasValidItemCode()) {
      this.setState({ chartMonths: [], chartSeries: [{ label: "비가동(분)", data: [] }], chartMonthTop3Map: {} });
      return;
    }
    this.setLoading("monthly", true); this.setError("monthly", null);
    try {
      const signal = this.abortPrev("monthly");
      const payload = { start_work_date: kpiFilters.start_work_date, end_work_date: kpiFilters.end_work_date, workplace: kpiFilters.press, itemCode: String(chartItemCode).trim() };
      const json = await this.fetchJson(this.API("/downtime_chart/monthly"), {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal, body: JSON.stringify(payload),
      }, "monthly");
      const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      const totals = {}; const topMap = {};
      for (const r of rows) {
        const ym = String(r.ym); const minutes = Number(r.minutes ?? 0);
        if (Array.isArray(r.top)) { totals[ym] = minutes; topMap[ym] = r.top.map(t=>({ name:String(t?.name ?? t?.label ?? "-"), minutes:Number(t?.minutes ?? 0) })); }
        else if (r.name !== undefined) { totals[ym] = (totals[ym] ?? 0) + minutes; }
        else { totals[ym] = minutes; }
      }
      const months = Object.keys(totals).sort();
      this.setState({ chartMonths: months, chartSeries: [{ label: "비가동(분)", data: months.map(m=>totals[m]) }], chartMonthTop3Map: topMap });
    } catch (e) {
      this.setError("monthly", e.message || "월별 합계 조회 실패");
      this.setState({ chartMonths: [], chartSeries: [{ label: "비가동(분)", data: [] }], chartMonthTop3Map: {} });
      throw e;
    } finally { this.setLoading("monthly", false); }
  };

  fetchPie = async () => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!this.hasValidItemCode()) { this.setState({ pieData: [] }); return; }
    this.setLoading("pie", true); this.setError("pie", null);
    try {
      const signal = this.abortPrev("pie");
      const payload = {
        start_work_date: kpiFilters.start_work_date,
        end_work_date: kpiFilters.end_work_date,
        workplace: kpiFilters.press,
        itemCode: String(chartItemCode).trim(),
        top: this.PIE_TOP_N,
        withOthers: this.PIE_WITH_OTHERS
      };
      const json = await this.fetchJson(this.API("/downtime_chart/pie"), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        signal,
        body: JSON.stringify(payload),
      }, "pie");

      const arr = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      const sorted = arr.slice().sort((a, b) => (b.minutes || 0) - (a.minutes || 0));
      let data;

      if (this.PIE_WITH_OTHERS && sorted.length >= this.PIE_TOP_N) {
        const topCount = this.PIE_TOP_N - 1;
        const top = sorted.slice(0, topCount);
        const others = sorted.slice(topCount).reduce((s, x) => s + (x.minutes || 0), 0);
        data = top.map((r, i) => ({
          id: i, label: r.label || "(없음)", value: Number(r.minutes || 0),
        }));
        if (others > 0) data.push({ id: data.length, label: "기타", value: others });
      } else {
        data = sorted.slice(0, this.PIE_TOP_N).map((r, i) => ({
          id: i, label: r.label || "(없음)", value: Number(r.minutes || 0),
        }));
      }

      this.setState({ pieData: data });
    } catch (e) {
      this.setError("pie", e.message || "파이 데이터 조회 실패");
      this.setState({ pieData: [] });
      throw e;
    } finally {
      this.setLoading("pie", false);
    }
  };

  fetchTopNotes = async () => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!this.hasValidItemCode()) { this.setState({ topNotes: [] }); return; }
    this.setLoading("notes", true); this.setError("notes", null);
    try {
      const signal = this.abortPrev("notes");
      const payload = { start_work_date: kpiFilters.start_work_date, end_work_date: kpiFilters.end_work_date, workplace: kpiFilters.press, itemCode: String(chartItemCode).trim(), limit: 10 };
      const json = await this.fetchJson(this.API("/downtime_chart/top-notes"), {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal, body: JSON.stringify(payload),
      }, "top-notes");
      const arr = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      this.setState({ topNotes: arr.map(x=>({ text:String(x.text||""), count:Number(x.count||0), minutes:Number(x.minutes||0) })) });
    } catch (e) {
      this.setError("notes", e.message || "비고 Top 조회 실패"); this.setState({ topNotes: [] }); throw e;
    } finally { this.setLoading("notes", false); }
  };

  fetchFacilityItemDowntimeAgg = async () => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!this.hasValidItemCode()) { this.setState({ facilityItemDowntimeAgg: [] }); return; }
    this.setLoading("facilityItemDowntimeAgg", true); this.setError("facilityItemDowntimeAgg", null);
    try {
      const signal = this.abortPrev("facilityItemDowntimeAgg");
      const payload = { start_work_date: kpiFilters.start_work_date, end_work_date: kpiFilters.end_work_date, workplace: kpiFilters.press, itemCode: String(chartItemCode).trim() };
      const json = await this.fetchJson(this.API("/downtime_chart/facility-item-downtime-agg"), {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal, body: JSON.stringify(payload),
      }, "facilityItemDowntimeAgg");
      const raw = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      this.setState({
        facilityItemDowntimeAgg: raw.map((r,i)=>({
          id: i+1,
          downtimeName: r.downtime_name ?? r.downtimeName ?? "-",
          expectedMinutes: Number(r.expected_minutes ?? r.expectedMinutes ?? 0),
        }))
      });
    } catch (e) {
      this.setError("facilityItemDowntimeAgg", e.message || "facilityItemDowntimeAgg 조회 실패"); this.setState({ facilityItemDowntimeAgg: [] });
    } finally { this.setLoading("facilityItemDowntimeAgg", false); }
  };

  fetchFacilityLineDowntimeAgg = async () => {
    const { kpiFilters } = this.state;
    this.setLoading("FacilityLineDowntimeAgg", true); this.setError("FacilityLineDowntimeAgg", null);
    try {
      const signal = this.abortPrev("FacilityLineDowntimeAgg");
      const payload = { start_work_date: kpiFilters.start_work_date, end_work_date: kpiFilters.end_work_date, workplace: kpiFilters.press };
      const json = await this.fetchJson(this.API("/downtime_chart/facility-line-downtime-agg"), {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal, body: JSON.stringify(payload),
      }, "FacilityLineDowntimeAgg");
      const raw = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      this.setState({
        facilityLineDowntimeAgg: raw.map((r,i)=>({
          id: i+1,
          downtimeName: r.downtime_name ?? r.downtimeName ?? "-",
          expectedMinutes: Number(r.expected_minutes ?? r.expectedMinutes ?? 0),
        }))
      });
    } catch (e) {
      this.setError("FacilityLineDowntimeAgg", e.message || "FacilityLineDowntimeAgg 조회 실패"); this.setState({ facilityLineDowntimeAgg: [] });
    } finally { this.setLoading("FacilityLineDowntimeAgg", false); }
  };

  fetchCauseDetail = async (causeName) => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!causeName) return;
    if (!this.isLineMode() && !this.hasValidItemCode()) return;

    this.setLoading("causeDetail", true); this.setError("causeDetail", null);
    try {
      const signal = this.abortPrev("causeDetail");
      const qs = new URLSearchParams({ cause_name: causeName, top: 8 }).toString();
      const payload = {
        start_work_date: kpiFilters.start_work_date,
        end_work_date: kpiFilters.end_work_date,
        workplace: kpiFilters.press,
        ...(this.isLineMode() ? {} : { itemCode: String(chartItemCode).trim() }),
      };
      const json = await this.fetchJson(this.API(`/downtime_chart/cause-detail?${qs}`), {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, signal, body: JSON.stringify(payload),
      }, "cause-detail");
      this.setState({ rightDetail: json?.data || json });
    } catch (e) {
      this.setError("causeDetail", e.message || "비가동 상세 조회 실패"); this.setState({ rightDetail: null });
    } finally { this.setLoading("causeDetail", false); }
  };

  fetchAllSections = async () => {
    this.setState({ pageError: null, selectedCause: null, rightDetail: null });
    try {
      await Promise.all([
        this.fetchSummary(),
        this.fetchMonthly(),
        this.fetchPie(),
        this.fetchTopNotes(),
        this.fetchFacilityItemDowntimeAgg(),
        this.fetchFacilityLineDowntimeAgg(),
      ]);
    } catch {
      this.setState({ pageError: "데이터를 불러오는 중 오류가 발생했습니다." });
    }
  };

  // ------------ handlers ------------
  openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
  closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });

  handleItemCodeSelect = async ({ 품목번호, 품목명 }) => {
    await this.setStateAsync((prev) => ({
      uiFilters: { ...prev.uiFilters, itemCode: 품목번호 || "", itemName: 품목명 || "" },
      chartItemCode: 품목번호 || "",
      itemCodeModalOpen: false,
      selectedCause: null, rightDetail: null,
    }));
    if (!this.isLineMode()) {
      await this.fetchFacilityItemDowntimeAgg();
    }
  };

  clearDetailItem = async () => {
    await this.setStateAsync((s) => ({
      uiFilters: { ...s.uiFilters, itemCode: "", itemName: "" },
      chartItemCode: "", selectedCause: null, rightDetail: null, facilityItemDowntimeAgg: [],
    }));
  };

  handleFilterChange = async (key, value) => {
    const next = { ...this.state.uiFilters, [key]: value };
    if (key === "start_work_date" || key === "end_work_date") {
      const fixed = this.ensureValidRange({ start_work_date: next.start_work_date, end_work_date: next.end_work_date });
      next.start_work_date = fixed.start_work_date; next.end_work_date = fixed.end_work_date;
    }
    await this.setStateAsync({ uiFilters: next });
    if (["line", "start_work_date", "end_work_date"].includes(key)) {
      this.fetchItemCodes({ press: next.line, start_work_date: next.start_work_date, end_work_date: next.end_work_date });
    }
  };

  clearFilters = async () => {
    const defaults = {
      start_work_date: this.state.kpiFilters.start_work_date,
      end_work_date: this.state.kpiFilters.end_work_date,
      plant: "아진산업-경산(본사)", worker: "프레스", line: "1500T",
      itemCode: "", itemName: "", carModel: "", downtimeCode: "", downtimeName: "",
      downtimeMinutes: "", note: "", shift: "", productName: "", itemType: "", categoryMain: "", categorySub: "",
    };
    await this.setStateAsync({
      uiFilters: defaults,
      chartItemCode: "", chartMonths: [], chartSeries: [{ label: "비가동(분)", data: [] }], chartMonthTop3Map: {},
      pieData: [], topNotes: [], selectedCause: null, rightDetail: null, facilityItemDowntimeAgg: [],
    });
    this.fetchItemCodes({ press: defaults.line, start_work_date: defaults.start_work_date, end_work_date: defaults.end_work_date });
  };

  handleSearch = async () => {
    const { uiFilters } = this.state;
    const finalItem = uiFilters.itemCode || "";
    await this.setStateAsync({
      kpiFilters: { start_work_date: uiFilters.start_work_date, end_work_date: uiFilters.end_work_date, press: uiFilters.line },
      chartItemCode: finalItem, selectedCause: null, rightDetail: null,
    });
    if (finalItem) {
      await this.fetchAllSections();
    } else {
      await this.fetchSummary();
      this.setState({
        chartMonths: [], chartSeries: [{ label: "비가동(분)", data: [] }], chartMonthTop3Map: {},
        pieData: [], topNotes: [], facilityItemDowntimeAgg: [],
      });
      await this.fetchFacilityLineDowntimeAgg();
    }
  };

  toggleFilterExpansion = () => this.setState((p) => ({ filterExpanded: !p.filterExpanded }));

  handleCauseSelect = ({ downtimeName }) => {
    this.setState({ selectedCause: downtimeName, rightDetail: null }, () => this.fetchCauseDetail(downtimeName));
  };

  handleQuickLineChange = async (_, line) => {
    if (!line) return;
    await this.setStateAsync((s) => ({
      uiFilters: { ...s.uiFilters, line },
      kpiFilters: { ...s.kpiFilters, press: line },
      selectedCause: null, rightDetail: null,
    }));
    if (this.isLineMode()) await this.fetchFacilityLineDowntimeAgg();
    else await this.fetchFacilityItemDowntimeAgg();
  };

  handleScopeModeChange = async (_, mode) => {
    if (!mode) return;
    await this.setStateAsync({ scopeMode: mode, selectedCause: null, rightDetail: null });
    if (mode === "LINE") await this.fetchFacilityLineDowntimeAgg();
    else await this.fetchFacilityItemDowntimeAgg();
  };

  // ------------ render ------------
  render() {
    const { themeHex } = this.props;
    const {
      scopeMode, uiFilters, kpiSummary, loading, error, pageLoading, pageError,
      chartMonths, chartSeries, chartMonthTop3Map, pieData, topNotes,
      itemCodeModalOpen, chartItemCode, selectedCause, rightDetail,
      filterExpanded,

      // 연/월/주 UI용
      yearAnchorPos, monthAnchorPos, weekAnchorPos, years, selectedYear, selectedMonth,
    } = this.state;

    // 주차 메뉴용 계산
    const now = this.today0();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const thisWeek = { start: this.startOfWeek(now), end: this.endOfWeek(now) };
    const weeks = this.getWeeksOfMonth(selectedYear, selectedMonth);

    return (
      <div className={s.root}>
        <TitleSection themeHex={themeHex} sx={{ p: 3 }} />

        {/* 검색 조건 */}
        <Box sx={{ mb: 3 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
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
                    endIcon={<ExpandMoreIcon />}
                    onClick={(e) => this.setState({ yearAnchorPos: this.getAnchorPos(e.currentTarget) })}
                    sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
                  >
                    연간
                  </Button>
                  <Menu
                    open={!!yearAnchorPos}
                    onClose={() => this.setState({ yearAnchorPos: null })}
                    anchorReference="anchorPosition"
                    anchorPosition={yearAnchorPos || { top: 0, left: 0 }}
                  >
                    <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
                    {years.map((y) => (
                      <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
                    ))}
                  </Menu>

                  {/* 월간 */}
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<ExpandMoreIcon />}
                    onClick={(e) => this.setState({ monthAnchorPos: this.getAnchorPos(e.currentTarget) })}
                    sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
                  >
                    월간
                  </Button>
                  <Menu
                    open={!!monthAnchorPos}
                    onClose={() => this.setState({ monthAnchorPos: null })}
                    anchorReference="anchorPosition"
                    anchorPosition={monthAnchorPos || { top: 0, left: 0 }}
                  >
                    <MenuItem
                      dense
                      onClick={() => this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth))}
                    >
                      이번달
                    </MenuItem>
                    {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                      <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
                        {selectedYear}년 {m}월
                      </MenuItem>
                    ))}
                  </Menu>

                  {/* 주간 */}
                  <Button
                    size="small"
                    variant="outlined"
                    endIcon={<ExpandMoreIcon />}
                    onClick={(e) => this.setState({ weekAnchorPos: this.getAnchorPos(e.currentTarget) })}
                    sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
                  >
                    주간
                  </Button>
                  <Menu
                    open={!!weekAnchorPos}
                    onClose={() => this.setState({ weekAnchorPos: null })}
                    anchorReference="anchorPosition"
                    anchorPosition={weekAnchorPos || { top: 0, left: 0 }}
                  >
                    <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
                      이번주 ({this.iso(thisWeek.start)}~{this.iso(thisWeek.end)})
                    </MenuItem>
                    {weeks.map((w, i) => (
                      <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
                        {selectedYear}년 {selectedMonth}월 {w.label} ({this.iso(w.start)}~{this.iso(w.end)})
                      </MenuItem>
                    ))}
                  </Menu>

                  {/* 오늘 */}
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={this.applyToday}
                    sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
                  >
                    오늘
                  </Button>

                  {/* 구분자 & 기간선택 */}
                  <Typography sx={{ color: "white", opacity: 0.8, mx: 0.5 }}>|</Typography>
                  <Typography sx={{ color: "white" }}>기간선택</Typography>
                  <TextField
                    type="date"
                    value={uiFilters.start_work_date || ""}
                    onChange={(e) => this.handleFilterChange("start_work_date", e.target.value)}
                    size="small"
                    variant="outlined"
                    sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
                  />
                  <Typography sx={{ color: "white" }}>~</Typography>
                  <TextField
                    type="date"
                    value={uiFilters.end_work_date || ""}
                    onChange={(e) => this.handleFilterChange("end_work_date", e.target.value)}
                    size="small"
                    variant="outlined"
                    sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
                  />

                  {/* 확장/축소 */}
                  <IconButton onClick={this.toggleFilterExpansion} sx={{ color: "white" }}>
                    {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              }
              sx={{ backgroundColor: themeHex, color: "white", borderRadius: 1, mb: 2 }}
            />

            {/* 폼/필터 UI */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <TextField select fullWidth label="공장" size="small"
                  value={uiFilters.plant??""} onChange={(e)=>this.handleFilterChange("plant", e.target.value)}>
                  <MenuItem value="아진산업-경산(본사)">아진산업-경산(본사)</MenuItem>
                  <MenuItem value="아진산업-1공장(경산)">아진산업-1공장(경산)</MenuItem>
                  <MenuItem value="아진산업-구어공장(경주)">아진산업-구어공장(경주)</MenuItem>
                  <MenuItem value="아진산업-하양공장(예정)">아진산업-하양공장(예정)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField select fullWidth label="작업장" size="small"
                  value={uiFilters.worker??"프레스"} onChange={(e)=>this.handleFilterChange("worker", e.target.value)}>
                  <MenuItem value="프레스">프레스</MenuItem>
                  <MenuItem value="금형">금형</MenuItem>
                  <MenuItem value="블랭크">블랭크</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select fullWidth label="라인" size="small"
                  value={uiFilters.line??"1500T"} onChange={(e)=>this.handleFilterChange("line", e.target.value)}>
                  <MenuItem value="1500T">1500T(E라인)</MenuItem>
                  <MenuItem value="1200T">1200T(D라인)</MenuItem>
                  <MenuItem value="1000T">1000T(F라인)</MenuItem>
                  <MenuItem value="1000T-PRO">1000T-PRO(G라인)</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <TextField fullWidth label="품번" size="small" value={uiFilters.itemCode||""}
                  onClick={this.openItemCodeModal}
                  InputProps={{ readOnly:true, style:{cursor:"pointer"}, endAdornment:(<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color:"text.secondary" }}/></InputAdornment>) }}
                  sx={{ "& .MuiInputBase-root":{ cursor:"pointer", "&:hover":{ backgroundColor:"#f5f5f5" } } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="품목명" size="small" value={uiFilters.itemName||""}
                  onClick={this.openItemCodeModal}
                  InputProps={{ readOnly:true, style:{cursor:"pointer"}, endAdornment:(<InputAdornment position="end"><KeyboardArrowDownIcon sx={{ color:"text.secondary" }}/></InputAdornment>) }}
                  sx={{ "& .MuiInputBase-root":{ cursor:"pointer", "&:hover":{ backgroundColor:"#f5f5f5" } } }}
                />
              </Grid>
            </Grid>

            <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="차종" value={uiFilters.carModel} onChange={(e)=>this.handleFilterChange("carModel", e.target.value)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="비가동코드" value={uiFilters.downtimeCode} onChange={(e)=>this.handleFilterChange("downtimeCode", e.target.value)} InputProps={{ startAdornment:(<InputAdornment position="start"><SearchIcon/></InputAdornment>) }} /></Grid>
                <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="비가동명" value={uiFilters.downtimeName} onChange={(e)=>this.handleFilterChange("downtimeName", e.target.value)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" type="number" label="비가동(분)" value={uiFilters.downtimeMinutes??""} onChange={(e)=>this.handleFilterChange("downtimeMinutes", e.target.value)} /></Grid>
                <Grid item xs={12} sm={12} md={6}><TextField fullWidth size="small" label="비고" value={uiFilters.note} onChange={(e)=>this.handleFilterChange("note", e.target.value)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="주야구분" value={uiFilters.shift} onChange={(e)=>this.handleFilterChange("shift", e.target.value)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="품명" value={uiFilters.productName} onChange={(e)=>this.handleFilterChange("productName", e.target.value)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="품목구분" value={uiFilters.itemType} onChange={(e)=>this.handleFilterChange("itemType", e.target.value)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="대분류" value={uiFilters.categoryMain} onChange={(e)=>this.handleFilterChange("categoryMain", e.target.value)} /></Grid>
                <Grid item xs={12} sm={6} md={3}><TextField fullWidth size="small" label="소분류" value={uiFilters.categorySub} onChange={(e)=>this.handleFilterChange("categorySub", e.target.value)} /></Grid>
              </Grid>
            </Collapse>

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.clearFilters} size="large" color="secondary">필터 초기화</Button>
                <Button variant="contained" startIcon={<SearchIcon />} onClick={this.handleSearch} size="large" sx={{ backgroundColor: themeHex, "&:hover": { backgroundColor: "#ffc285ff" } }}>검색</Button>
              </Box>
            </Grid>
          </Paper>
        </Box>

        {/* KPI */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          {(pageLoading || loading.summary) ? (
            <Box sx={{ height: 180, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={60} sx={{ color: themeHex }} />
            </Box>
          ) : (error.summary || pageError) ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>{error.summary || pageError}</Alert>
              <Button variant="contained" onClick={this.fetchSummary} sx={{ backgroundColor: themeHex }}>다시 시도</Button>
            </Box>
          ) : (
            <KpiSection themeHex={themeHex} kpiSummary={kpiSummary} fmtNumber={this.fmtNumber} fmtMinutes={this.fmtMinutes}
              periodStart={this.state.kpiFilters.start_work_date} periodEnd={this.state.kpiFilters.end_work_date} />
          )}
        </Paper>

        {/* 월별 */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          {loading.monthly ? (
            <Box sx={{ height: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={60} sx={{ color: themeHex }} />
            </Box>
          ) : error.monthly ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>{error.monthly}</Alert>
              <Button variant="contained" onClick={this.fetchMonthly} sx={{ backgroundColor: themeHex }}>다시 시도</Button>
            </Box>
          ) : (
            <MonthlySection chartMonths={chartMonths} chartSeries={chartSeries} chartItemCode={chartItemCode}
              monthTop3Map={chartMonthTop3Map} themeHex={themeHex} monthValueFormatter={this.monthKeyToLabel} fmtNumber={this.fmtNumber} />
          )}
        </Paper>

        {/* 파이 + 비고 */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          {(loading.pie || loading.notes) ? (
            <Box sx={{ minHeight: 320, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={60} sx={{ color: themeHex }} />
            </Box>
          ) : (error.pie || error.notes) ? (
            <Box sx={{ p: 2 }}>
              <Alert severity="error" sx={{ mb: 2 }}>{error.pie || error.notes}</Alert>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button variant="contained" onClick={this.fetchPie} sx={{ backgroundColor: themeHex }}>파이 다시 시도</Button>
                <Button variant="contained" onClick={this.fetchTopNotes} sx={{ backgroundColor: themeHex }}>비고 다시 시도</Button>
              </Box>
            </Box>
          ) : (
            <PieAndNotesSection pieData={pieData} topNotes={topNotes} chartItemCode={chartItemCode} />
          )}
        </Paper>

        {/* 품번 선택 모달 */}
        <ItemCodeModal
          open={itemCodeModalOpen} onClose={this.closeItemCodeModal} onSelect={this.handleItemCodeSelect}
          selectedItemCode={uiFilters.itemCode} plant={uiFilters.plant} worker={uiFilters.worker} line={uiFilters.line}
          start_work_date={uiFilters.start_work_date} end_work_date={uiFilters.end_work_date}
        />

        {/* 마스터–디테일 */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{display: "flex", alignItems: "center", fontSize: "24px", fontWeight: "600"}}>설비 비가동 현황</span>
              <Paper
                elevation={0}
                variant="outlined"
                sx={{
                  px: 1,
                  py: 0.5,
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.75,
                  backdropFilter: "saturate(160%) blur(8px)",
                  backgroundColor: "rgba(255,255,255,0.75)",
                  borderColor: alpha(this.props.themeHex, 0.2),
                }}
              >
                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={this.state.scopeMode}
                  onChange={this.handleScopeModeChange}
                  sx={{
                    "& .MuiToggleButton-root": {
                      border: 0,
                      px: 1.2,
                      height: 32,
                      lineHeight: "32px",
                      borderRadius: 999,
                      textTransform: "none",
                    },
                    "& .Mui-selected": {
                      color: "#fff",
                      backgroundColor: this.props.themeHex,
                      "&:hover": { backgroundColor: this.props.themeHex },
                    },
                  }}
                >
                  <ToggleButton value="LINE">라인 종합</ToggleButton>
                  <ToggleButton value="ITEM">품번별</ToggleButton>
                </ToggleButtonGroup>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.25, borderColor: alpha(this.props.themeHex, 0.18) }} />

                <ToggleButtonGroup
                  size="small"
                  exclusive
                  value={this.state.uiFilters.line}
                  onChange={this.handleQuickLineChange}
                  sx={{
                    "& .MuiToggleButton-root": {
                      border: 0,
                      px: 1.1,
                      height: 32,
                      lineHeight: "32px",
                      borderRadius: 999,
                      textTransform: "none",
                    },
                    "& .Mui-selected": {
                      color: "#fff",
                      backgroundColor: this.props.themeHex,
                      "&:hover": { backgroundColor: this.props.themeHex },
                    },
                  }}
                >
                  <ToggleButton value="1500T">1500T</ToggleButton>
                  <ToggleButton value="1200T">1200T</ToggleButton>
                  <ToggleButton value="1000T">1000T</ToggleButton>
                  <ToggleButton value="1000T-PRO">1000T-PRO</ToggleButton>
                </ToggleButtonGroup>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.25, borderColor: alpha(this.props.themeHex, 0.18) }} />

                <Chip
                  size="small"
                  label={
                    this.isLineMode()
                      ? "품번 선택 (라인 모드)"
                      : (this.state.uiFilters.itemCode
                          ? `${this.state.uiFilters.itemCode} · ${this.state.uiFilters.itemName || ""}`
                          : "품번 선택")
                  }
                  onClick={this.isLineMode() ? undefined : this.openItemCodeModal}
                  onDelete={
                    this.isLineMode()
                      ? undefined
                      : (this.state.uiFilters.itemCode ? this.clearDetailItem : undefined)
                  }
                  variant="outlined"
                  sx={{
                    height: 32,
                    borderRadius: 999,
                    fontWeight: 600,
                    borderColor: alpha(this.props.themeHex, 0.28),
                    backgroundColor: this.isLineMode()
                      ? "rgba(0,0,0,0.04)"
                      : alpha(this.props.themeHex, 0.08),
                    color: this.isLineMode() ? "text.secondary" : "inherit",
                    "& .MuiChip-deleteIcon": { color: alpha(this.props.themeHex, 0.8) },
                  }}
                />
              </Paper>
            </Box>
          </Grid>

          {/* 좌/우 섹션 */}
          <Grid item xs={12} md={5} sx={{ display: "flex", flexDirection: "column" }}>
            <DowntimeAggSection
              mode={this.isLineMode() ? "LINE" : "ITEM"}
              title="비가동 목록"
              subtitle={
                this.isLineMode()
                  ? `${this.state.uiFilters.line} 라인`
                  : (this.state.uiFilters.itemCode
                      ? `${this.state.uiFilters.itemCode} · ${this.state.uiFilters.itemName || ""}`
                      : "품번 미선택")
              }
              data={this.isLineMode() ? this.state.facilityLineDowntimeAgg : this.state.facilityItemDowntimeAgg}
              loading={this.isLineMode() ? this.state.loading.FacilityLineDowntimeAgg : this.state.loading.facilityItemDowntimeAgg}
              error={this.isLineMode() ? this.state.error.FacilityLineDowntimeAgg : this.state.error.facilityItemDowntimeAgg}
              onRetry={this.isLineMode() ? this.fetchFacilityLineDowntimeAgg : this.fetchFacilityItemDowntimeAgg}
              onSelect={this.handleCauseSelect}
              themeHex={this.props.themeHex}
            />
          </Grid>

          <Grid item xs={12} md={7} sx={{ display: "flex", flexDirection: "column" }}>
            <RightDetailSection
              causeName={selectedCause}
              data={rightDetail}
              loading={this.state.loading.causeDetail}
              error={this.state.error.causeDetail}
              onRetry={() => this.fetchCauseDetail(selectedCause)}
              themeHex={this.props.themeHex}
            />
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default connect((state) => ({ themeHex: selectThemeHex(state) }))(DowntimeChart);
