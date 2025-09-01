// DowntimeChart.js 
import React, { Component } from "react";
import { connect } from "react-redux";
import TitleSection from "./components/TitleSection";
import KpiSection from "./components/KpiSection";
import MonthlySection from "./components/MonthlySection";
import PieAndNotesSection from "./components/PieAndNotesSection";
import s from "./DowntimeChart.module.scss";
import { selectThemeHex, selectThemeKey } from "../../reducers/layout";
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
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from "@mui/icons-material";

// ✅ 품목코드 선택 모달
import ItemCodeModal from "../common/ItemCodeModal";

class DowntimeChart extends Component {
  constructor(props) {
    super(props);

    const DEFAULT_END = "2025-06-30";
    const start_work_date = "2025-01-01";

    this.DEFAULT_END = DEFAULT_END;
    this.PIE_TOP_N = 5;
    this.PIE_WITH_OTHERS = true;
    this.API = (path) => `${config.baseURLApi}/smartFactory${path}`;
    this.ctrl = { summary: null, monthly: null, pie: null, notes: null, codes: null };

    this.state = {
      pageLoading: false,
      pageError: null,
      loading: { summary: false, monthly: false, pie: false, notes: false, codes: false },
      error: { summary: null, monthly: null, pie: null, notes: null, codes: null },

      kpiFilters: { start_work_date: start_work_date, end_work_date: DEFAULT_END, press: "1500T" },
      kpiSummary: { total: 0, count: 0, avg: 0, topName: "-", topValue: 0, topList: [] },

      // ✅ DowntimeGrid와 동일한 UI 필터
      uiFilters: {
        start_work_date,
        end_work_date: DEFAULT_END,
        plant: "아진산업-경산(본사)",
        worker: "프레스",
        line: "1500T",
        itemCode: "",
        itemName: "",
        carModel: "",
        downtimeCode: "",
        downtimeName: "",
        downtimeMinutes: "",
        note: "",
        shift: "",
        productName: "",
        itemType: "",
        categoryMain: "",
        categorySub: "",
      },

      // 필터 UI 상태
      quickRange: null,
      filterExpanded: false,
      itemCodeModalOpen: false,

      // 차트 데이터 관련
      itemCodeOptions: [],
      chartItemCode: "",
      chartMonths: [],
      chartSeries: [{ label: "비가동(분)", data: [] }],
      // ✅ 추가: 월별 TOP3 매핑
      chartMonthTop3Map: {},
      pieData: [],
      topNotes: [],
    };
  }

  // ---------- guards ----------
  hasValidItemCode = () => {
    const { chartItemCode } = this.state;
    return !!(chartItemCode && String(chartItemCode).trim());
  };

  // ---------- lifecycle ----------
  async componentDidMount() {
    const { uiFilters } = this.state;
    const codes = await this.fetchItemCodes({
      press: uiFilters.line,
      start_work_date: uiFilters.start_work_date,
      end_work_date: uiFilters.end_work_date,
    });

    if (!codes || codes.length === 0) {
      console.warn("⚠️ 자재번호가 없습니다. 초기 로드를 건너뜁니다.");
      this.setState({
        chartItemCode: "",
        itemCodeOptions: [],
        chartMonths: [],
        chartSeries: [{ label: "비가동(분)", data: [] }],
        chartMonthTop3Map: {}, // ✅ 초기화
        pieData: [],
        topNotes: [],
      });
      return;
    }

    const preferred = "64312-S8000";
    const defaultCode = codes.includes(preferred) ? preferred : codes[0];
    const preferredName = "PNL-DASH";
    const defaultName = preferred === defaultCode ? preferredName : "";

    await this.setStateAsync({
      chartItemCode: defaultCode,
      uiFilters: { ...uiFilters, itemCode: defaultCode, itemName: defaultName },
      kpiFilters: {
        start_work_date: uiFilters.start_work_date,
        end_work_date: uiFilters.end_work_date,
        press: uiFilters.line,
      },
    });

    this.fetchAllSections();
  }

  // ---------- utils ----------
  abortPrev = (key) => {
    try {
      this.ctrl[key]?.abort();
    } catch {}
    this.ctrl[key] = new AbortController();
    return this.ctrl[key].signal;
  };

  setLoading = (key, v) => this.setState((s) => ({ loading: { ...s.loading, [key]: v } }));
  setError = (key, v) => this.setState((s) => ({ error: { ...s.error, [key]: v } }));

  parseDate = (raw) => {
    if (!raw) return null;
    let s = String(raw).split("T")[0].replace(/[./]/g, "-");
    const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) s = `${m[1]}-${String(m[2]).padStart(2, "0")}-${m[3].padStart(2, "0")}`;
    const d = new Date(`${s}T00:00:00`);
    return isNaN(d.getTime()) ? null : d;
  };

  ensureValidRange = (f) => {
    const sd = this.parseDate(f.start_work_date);
    const ed = this.parseDate(f.end_work_date);
    if (sd && ed && sd > ed) return { ...f, end_work_date: f.start_work_date };
    return f;
  };

  fmtNumber = (n) => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(n ?? 0);
  fmtMinutes = (n) => `${this.fmtNumber(Math.round(n ?? 0))}`;

  monthKeyToLabel = (ym) => {
    const mm = Number(String(ym).split("-")[1] || 0);
    return `${mm}월`;
  };

  toYMD = (d) => {
    if (!d) return "";
    const dt = d instanceof Date ? d : new Date(d);
    return dt.toLocaleDateString("sv-SE"); // YYYY-MM-DD
  };

  // ✅ 빠른 기간
  setQuickRange = (type) => {
    const now = new Date();
    const today = this.toYMD(now);
    let start = today;
    let end = today;

    if (type === "today") {
      start = today; end = today;
    } else if (type === "week") {
      const d = new Date(now);
      const day = d.getDay();
      const diffToMonday = (day + 6) % 7;
      d.setDate(d.getDate() - diffToMonday);
      start = this.toYMD(d); end = today;
    } else if (type === "month") {
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      start = this.toYMD(d); end = today;
    } else if (type === "year") {
      const d = new Date(now.getFullYear(), 0, 1);
      start = this.toYMD(d); end = today;
    }

    this.setState((prev) => ({
      quickRange: type,
      uiFilters: { ...prev.uiFilters, start_work_date: start, end_work_date: end },
    }));

    const next = { ...this.state.uiFilters, start_work_date: start, end_work_date: end };
    this.fetchItemCodes({
      press: next.line,
      start_work_date: next.start_work_date,
      end_work_date: next.end_work_date,
    });
  };

  // ---------- 정규화 ----------
  normalizeSummary = (json) => {
    const topListRaw = Array.isArray(json?.topList) ? json.topList : [];
    const safeTopList = topListRaw.map((it) => ({
      name: String(it?.name ?? it?.label ?? "-"),
      minutes: Number(it?.minutes ?? it?.topValue ?? 0),
    }));
    const fallback = { name: String(json?.topName ?? "-"), minutes: Number(json?.topValue ?? 0) };
    const finalTopList =
      safeTopList.length ? safeTopList : fallback.name !== "-" || fallback.minutes > 0 ? [fallback] : [];

    return {
      total: Number(json?.total ?? 0),
      count: Number(json?.count ?? 0),
      avg: Number(json?.avg ?? 0),
      topName: String(json?.topName ?? (finalTopList[0]?.name ?? "-")),
      topValue: Number(json?.topValue ?? (finalTopList[0]?.minutes ?? 0)),
      topList: finalTopList,
    };
  };

  // ✅ 월별 합계 + (있다면) TOP3까지 수용
  normalizeMonthly = (arr) => {
    // arr 가능성:
    //  A) [{ym, minutes, top:[{name, minutes}...]}]  ← 확장된 백엔드
    //  B) [{ym, minutes}]                            ← 기존 백엔드
    //  C) (구버전 일부) [{ym, name, minutes}]       ← 월·비가동명별 행
    const totals = {};
    const topMap = {};

    for (const r of arr || []) {
      const ym = String(r.ym);
      const minutes = Number(r.minutes ?? 0);

      if (Array.isArray(r.top)) {
        totals[ym] = minutes;
        topMap[ym] = r.top.map((t) => ({
          name: String(t?.name ?? t?.label ?? "-"),
          minutes: Number(t?.minutes ?? 0),
        }));
      } else if (r.name !== undefined) {
        // 월·비가동명별 행일 경우 총합을 누적
        totals[ym] = (totals[ym] ?? 0) + minutes;
      } else {
        // 단순 월별 합계 행
        totals[ym] = minutes;
      }
    }

    const months = Object.keys(totals).sort();
    const data = months.map((m) => totals[m]);
    return { months, data, topMap }; // ✅ topMap 동반 반환
  };

  normalizePie = (arr) => {
    const sorted = (arr || []).slice().sort((a, b) => (b.minutes || 0) - (a.minutes || 0));
    if (this.PIE_WITH_OTHERS) {
      if (sorted.length >= this.PIE_TOP_N) {
        const topCount = this.PIE_TOP_N - 1;
        const top = sorted.slice(0, topCount);
        const othersSum = sorted.slice(topCount).reduce((s, x) => s + (x.minutes || 0), 0);
        if (othersSum > 0) {
          const dataTop = top.map((r, i) => ({ id: i, label: r.label || "(없음)", value: Number(r.minutes || 0) }));
          dataTop.push({ id: dataTop.length, label: "기타", value: othersSum });
          return dataTop;
        }
        return sorted.slice(0, this.PIE_TOP_N).map((r, i) => ({ id: i, label: r.label || "(없음)", value: Number(r.minutes || 0) }));
      }
      return sorted.map((r, i) => ({ id: i, label: r.label || "(없음)", value: Number(r.minutes || 0) }));
    }
    return sorted.slice(0, this.PIE_TOP_N).map((r, i) => ({ id: i, label: r.label || "(없음)", value: Number(r.minutes || 0) }));
  };

  normalizeTopNotes = (arr) =>
    (arr || []).map((x) => ({
      text: String(x.text || ""),
      count: Number(x.count || 0),
      minutes: Number(x.minutes || 0),
    }));

  setStateAsync = (st) => new Promise((res) => this.setState(st, res));

  // ---------- API ----------
  async fetchJson(url, options, key) {
    const res = await fetch(url, options);
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`${key || "API"} 실패: HTTP ${res.status} ${txt}`);
    }
    return res.json();
  }

  // 품번 목록
  fetchItemCodes = async (override = {}) => {
    const filters = { ...this.state.kpiFilters, ...override };
    this.setLoading("codes", true);
    this.setError("codes", null);
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
      console.error("[fetchItemCodes]", e);
      this.setError("codes", e.message || "자재번호 목록 조회 실패");
      this.setState({ itemCodeOptions: [] });
      return [];
    } finally {
      this.setLoading("codes", false);
    }
  };

  fetchSummary = async () => {
    const { kpiFilters } = this.state;
    this.setLoading("summary", true);
    this.setError("summary", null);
    try {
      const signal = this.abortPrev("summary");
      const payload = {
        start_work_date: kpiFilters.start_work_date,
        end_work_date: kpiFilters.end_work_date,
        workplace: kpiFilters.press,
      };
      const json = await this.fetchJson(
        this.API("/downtime_chart/summary?top=3"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          signal,
          body: JSON.stringify(payload),
        },
        "summary"
      );
      const payloadOut = json?.data || json;
      this.setState({ kpiSummary: this.normalizeSummary(payloadOut) });
    } catch (e) {
      console.error("[fetchSummary]", e);
      this.setError("summary", e.message || "KPI 요약 조회 실패");
      throw e;
    } finally {
      this.setLoading("summary", false);
    }
  };

  fetchMonthly = async () => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!this.hasValidItemCode()) {
      this.setState({
        chartMonths: [],
        chartSeries: [{ label: "비가동(분)", data: [] }],
        chartMonthTop3Map: {}, // ✅ 초기화
      });
      return;
    }
    this.setLoading("monthly", true);
    this.setError("monthly", null);
    try {
      const signal = this.abortPrev("monthly");
      const payload = {
        start_work_date: kpiFilters.start_work_date,
        end_work_date: kpiFilters.end_work_date,
        workplace: kpiFilters.press,
        itemCode: String(chartItemCode).trim(),
      };
      const json = await this.fetchJson(
        this.API("/downtime_chart/monthly"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          signal,
          body: JSON.stringify(payload),
        },
        "monthly"
      );

      const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      const { months, data, topMap } = this.normalizeMonthly(rows); // ✅ topMap 포함
      this.setState({
        chartMonths: months,
        chartSeries: [{ label: "비가동(분)", data }],
        chartMonthTop3Map: topMap || {}, // ✅ 저장
      });
    } catch (e) {
      console.error("[fetchMonthly]", e);
      this.setError("monthly", e.message || "월별 합계 조회 실패");
      this.setState({
        chartMonths: [],
        chartSeries: [{ label: "비가동(분)", data: [] }],
        chartMonthTop3Map: {},
      });
      throw e;
    } finally {
      this.setLoading("monthly", false);
    }
  };

  fetchPie = async () => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!this.hasValidItemCode()) {
      this.setState({ pieData: [] });
      return;
    }
    this.setLoading("pie", true);
    this.setError("pie", null);
    try {
      const signal = this.abortPrev("pie");
      const payload = {
        start_work_date: kpiFilters.start_work_date,
        end_work_date: kpiFilters.end_work_date,
        workplace: kpiFilters.press,
        itemCode: String(chartItemCode).trim(),
        top: this.PIE_TOP_N,
        withOthers: this.PIE_WITH_OTHERS,
      };
      const json = await this.fetchJson(
        this.API("/downtime_chart/pie"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          signal,
          body: JSON.stringify(payload),
        },
        "pie"
      );

      const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      this.setState({ pieData: this.normalizePie(rows) });
    } catch (e) {
      console.error("[fetchPie]", e);
      this.setError("pie", e.message || "파이 데이터 조회 실패");
      this.setState({ pieData: [] });
      throw e;
    } finally {
      this.setLoading("pie", false);
    }
  };

  fetchTopNotes = async () => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!this.hasValidItemCode()) {
      this.setState({ topNotes: [] });
      return;
    }
    this.setLoading("notes", true);
    this.setError("notes", null);
    try {
      const signal = this.abortPrev("notes");
      const payload = {
        start_work_date: kpiFilters.start_work_date,
        end_work_date: kpiFilters.end_work_date,
        workplace: kpiFilters.press,
        itemCode: String(chartItemCode).trim(),
        limit: 10,
      };
      const json = await this.fetchJson(
        this.API("/downtime_chart/top-notes"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          signal,
          body: JSON.stringify(payload),
        },
        "top-notes"
      );

      const rows = Array.isArray(json?.data) ? json.data : Array.isArray(json) ? json : [];
      this.setState({ topNotes: this.normalizeTopNotes(rows) });
    } catch (e) {
      console.error("[fetchTopNotes]", e);
      this.setError("notes", e.message || "비고 Top 조회 실패");
      this.setState({ topNotes: [] });
      throw e;
    } finally {
      this.setLoading("notes", false);
    }
  };

  fetchAllSections = async () => {
    this.setState({ pageLoading: true, pageError: null });
    try {
      await Promise.all([this.fetchSummary(), this.fetchMonthly(), this.fetchPie(), this.fetchTopNotes()]);
    } catch {
      this.setState({ pageError: "데이터를 불러오는 중 오류가 발생했습니다." });
    } finally {
      this.setState({ pageLoading: false });
    }
  };

  // ---------- 모달 ----------
  openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
  closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
  handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
    this.setState((prev) => ({
      uiFilters: { ...prev.uiFilters, itemCode: 품목번호 || "", itemName: 품목명 || "" },
      itemCodeModalOpen: false,
    }));
  };

  // ---------- handlers ----------
  handleFilterChange = async (key, value) => {
    const next = { ...this.state.uiFilters, [key]: value };

    if (key === "start_work_date" || key === "end_work_date") {
      const fixed = this.ensureValidRange({
        start_work_date: next.start_work_date,
        end_work_date: next.end_work_date,
      });
      next.start_work_date = fixed.start_work_date;
      next.end_work_date = fixed.end_work_date;
    }

    await this.setStateAsync({ uiFilters: next });

    if (["line", "start_work_date", "end_work_date"].includes(key)) {
      this.fetchItemCodes({
        press: next.line,
        start_work_date: next.start_work_date,
        end_work_date: next.end_work_date,
      });
    }
  };

  clearFilters = async () => {
    const defaults = {
      start_work_date: this.state.kpiFilters.start_work_date,
      end_work_date: this.state.kpiFilters.end_work_date,
      plant: "아진산업-경산(본사)",
      worker: "프레스",
      line: "1500T",
      itemCode: "",
      itemName: "",
      carModel: "",
      downtimeCode: "",
      downtimeName: "",
      downtimeMinutes: "",
      note: "",
      shift: "",
      productName: "",
      itemType: "",
      categoryMain: "",
      categorySub: "",
    };
    await this.setStateAsync({
      uiFilters: defaults,
      quickRange: null,
      chartItemCode: "", // ✅ 품번 초기화
      // ✅ 차트/파이/비고 데이터도 즉시 비움
      chartMonths: [],
      chartSeries: [{ label: "비가동(분)", data: [] }],
      chartMonthTop3Map: {},
      pieData: [],
      topNotes: [],
    });

    // 품번 리스트는 갱신하되 자동 선택은 하지 않음
    this.fetchItemCodes({
      press: defaults.line,
      start_work_date: defaults.start_work_date,
      end_work_date: defaults.end_work_date,
    });
  };

  handleSearch = async () => {
    const { uiFilters } = this.state;

    let finalItem = uiFilters.itemCode;
    if (!finalItem) {
      finalItem = ""; // ✅ 품번 없으면 빈 값 유지
    }

    await this.setStateAsync({
      kpiFilters: {
        start_work_date: uiFilters.start_work_date,
        end_work_date: uiFilters.end_work_date,
        press: uiFilters.line,
      },
      chartItemCode: finalItem,
    });

    if (finalItem) {
      // ✅ 품번 있을 때만 전체 섹션 로드
      this.fetchAllSections();
    } else {
      // ✅ 품번 없으면 KPI만 새로고침 + 나머지는 비움
      await this.fetchSummary();
      this.setState({
        chartMonths: [],
        chartSeries: [{ label: "비가동(분)", data: [] }],
        chartMonthTop3Map: {},
        pieData: [],
        topNotes: [],
      });
    }
  };

  toggleFilterExpansion = () => this.setState((p) => ({ filterExpanded: !p.filterExpanded }));

  // ---------- render ----------
  render() {
    const { themeHex } = this.props;
    const {
      uiFilters,
      kpiSummary,
      loading,
      error,
      chartMonths,
      chartSeries,
      chartMonthTop3Map, // ✅
      pieData,
      topNotes,
      pageLoading,
      pageError,
      quickRange,
      filterExpanded,
      itemCodeModalOpen,
      chartItemCode,
    } = this.state;

    return (
      <div className={s.root}>
        <TitleSection themeHex={themeHex} sx={{ p: 3 }} />

        {/* 검색 조건 */}
        <Box sx={{ mb: 3 }}>
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <CardHeader
              title={
                <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
                  <FilterIcon />
                  검색 조건
                </Typography>
              }
              action={
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      variant={quickRange === "today" ? "contained" : "outlined"}
                      onClick={() => this.setQuickRange("today")}
                      sx={{
                        borderColor: "white",
                        color: "white",
                        "&.MuiButton-contained": { backgroundColor: "white", color: themeHex },
                      }}
                    >
                      금일
                    </Button>
                    <Button
                      size="small"
                      variant={quickRange === "week" ? "contained" : "outlined"}
                      onClick={() => this.setQuickRange("week")}
                      sx={{
                        borderColor: "white",
                        color: "white",
                        "&.MuiButton-contained": { backgroundColor: "white", color: themeHex },
                      }}
                    >
                      주간
                    </Button>
                    <Button
                      size="small"
                      variant={quickRange === "month" ? "contained" : "outlined"}
                      onClick={() => this.setQuickRange("month")}
                      sx={{
                        borderColor: "white",
                        color: "white",
                        "&.MuiButton-contained": { backgroundColor: "white", color: themeHex },
                      }}
                    >
                      월간
                    </Button>
                    <Button
                      size="small"
                      variant={quickRange === "year" ? "contained" : "outlined"}
                      onClick={() => this.setQuickRange("year")}
                      sx={{
                        borderColor: "white",
                        color: "white",
                        "&.MuiButton-contained": { backgroundColor: "white", color: themeHex },
                      }}
                    >
                      년간
                    </Button>
                  </Box>

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

                  <IconButton onClick={this.toggleFilterExpansion} sx={{ color: "white" }}>
                    {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>
              }
              sx={{ backgroundColor: themeHex, color: "white", borderRadius: 1, mb: 2 }}
            />

            {/* 기본 필터 */}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  fullWidth
                  label="공장"
                  value={uiFilters.plant ?? ""}
                  onChange={(e) => this.handleFilterChange("plant", e.target.value)}
                  size="small"
                  variant="outlined"
                  SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 280 } } } }}
                >
                  <MenuItem value="아진산업-경산(본사)">아진산업-경산(본사)</MenuItem>
                  <MenuItem value="아진산업-1공장(경산)">아진산업-1공장(경산)</MenuItem>
                  <MenuItem value="아진산업-구어공장(경주)">아진산업-구어공장(경주)</MenuItem>
                  <MenuItem value="아진산업-하양공장(예정)">아진산업-하양공장(예정)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  select
                  fullWidth
                  label="작업장"
                  value={uiFilters.worker ?? "프레스"}
                  onChange={(e) => this.handleFilterChange("worker", e.target.value)}
                  size="small"
                  variant="outlined"
                >
                  <MenuItem value="프레스">프레스</MenuItem>
                  <MenuItem value="금형">금형</MenuItem>
                  <MenuItem value="블랭크">블랭크</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="라인"
                  value={uiFilters.line ?? "1500T"}
                  onChange={(e) => this.handleFilterChange("line", e.target.value)}
                  size="small"
                  variant="outlined"
                >
                  <MenuItem value="1500T">1500T(E라인)</MenuItem>
                  <MenuItem value="1200T">1200T(D라인)</MenuItem>
                  <MenuItem value="1000T">1000T(F라인)</MenuItem>
                  <MenuItem value="1000T-PRO">1000T-PRO(G라인)</MenuItem>
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6} md={2}>
                <TextField
                  fullWidth
                  label="품목코드"
                  value={uiFilters.itemCode || ""}
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
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="품목명"
                  value={uiFilters.itemName || ""}
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
              </Grid>
            </Grid>

            {/* 확장 필터 */}
            <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="차종"
                    value={uiFilters.carModel}
                    onChange={(e) => this.handleFilterChange("carModel", e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="비가동코드"
                    value={uiFilters.downtimeCode}
                    onChange={(e) => this.handleFilterChange("downtimeCode", e.target.value)}
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="비가동명"
                    value={uiFilters.downtimeName}
                    onChange={(e) => this.handleFilterChange("downtimeName", e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="비가동(분)"
                    type="number"
                    value={uiFilters.downtimeMinutes ?? ""}
                    onChange={(e) => this.handleFilterChange("downtimeMinutes", e.target.value)}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={12} md={6}>
                  <TextField
                    fullWidth
                    label="비고"
                    value={uiFilters.note}
                    onChange={(e) => this.handleFilterChange("note", e.target.value)}
                    size="small"
                  />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="주야구분"
                    value={uiFilters.shift}
                    onChange={(e) => this.handleFilterChange("shift", e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="품명"
                    value={uiFilters.productName}
                    onChange={(e) => this.handleFilterChange("productName", e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="품목구분"
                    value={uiFilters.itemType}
                    onChange={(e) => this.handleFilterChange("itemType", e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="대분류"
                    value={uiFilters.categoryMain}
                    onChange={(e) => this.handleFilterChange("categoryMain", e.target.value)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="소분류"
                    value={uiFilters.categorySub}
                    onChange={(e) => this.handleFilterChange("categorySub", e.target.value)}
                    size="small"
                  />
                </Grid>
              </Grid>
            </Collapse>

            {/* 버튼 */}
            <Grid item xs={12} sx={{ mt: 2 }}>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
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
                  onClick={this.handleSearch}
                  size="large"
                  sx={{ backgroundColor: themeHex, "&:hover": { backgroundColor: "#ffc285ff" } }}
                >
                  검색
                </Button>
              </Box>
            </Grid>
          </Paper>
        </Box>

        {/* KPI 카드 */}
        <KpiSection
          themeHex={themeHex}
          kpiSummary={kpiSummary}
          loading={loading}
          error={error}
          fmtNumber={this.fmtNumber}
          fmtMinutes={this.fmtMinutes}
          pageLoading={pageLoading}
          pageError={pageError}
          periodStart={this.state.kpiFilters.start_work_date}
          periodEnd={this.state.kpiFilters.end_work_date}
        />

        {/* 월별 차트 */}
        <MonthlySection
          chartMonths={chartMonths}
          chartSeries={chartSeries}
          chartItemCode={chartItemCode}
          monthTop3Map={chartMonthTop3Map}
          loading={loading}
          error={error}
          themeHex={themeHex}
          monthValueFormatter={this.monthKeyToLabel}
          fmtNumber={this.fmtNumber}
        />

        {/* 파이 + 비고 */}
        <PieAndNotesSection
          pieData={pieData}
          topNotes={topNotes}
          loading={loading}
          error={error}
          chartItemCode={chartItemCode}
        />

        {/* 품목코드 선택 모달 */}
        <ItemCodeModal
          open={itemCodeModalOpen}
          onClose={this.closeItemCodeModal}
          onSelect={this.handleItemCodeSelect}
          selectedItemCode={uiFilters.itemCode}
          plant={uiFilters.plant}
          worker={uiFilters.worker}
          line={uiFilters.line} 
          workplace={uiFilters.line}
          start_work_date={uiFilters.start_work_date}
          end_work_date={uiFilters.end_work_date}
        />
      </div>
    );
  }
}

export default connect((state) => ({
  themeHex: selectThemeHex(state),
  themeKey: selectThemeKey(state),
}))(DowntimeChart);