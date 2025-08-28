import React, { Component } from "react";
import { connect } from "react-redux";
import TitleSection from "./components/TitleSection";
import FilterPanel from "./components/FilterPanel";
import KpiSection from "./components/KpiSection";
import MonthlySection from "./components/MonthlySection";
import PieAndNotesSection from "./components/PieAndNotesSection";
import s from "./DowntimeChart.module.scss";
import { selectThemeHex, selectThemeKey } from "../../reducers/layout";
import config from "../../config";

class DowntimeChart extends Component {
  constructor(props) {
    super(props);

    const DEFAULT_END = "2025-06-30";
    const jan1 = "2024-01-01";

    this.DEFAULT_END = DEFAULT_END;
    this.PIE_TOP_N = 5;
    this.PIE_WITH_OTHERS = true;
    this.API = (path) => `${config.baseURLApi}/smartFactory${path}`;
    this.ctrl = { summary:null, monthly:null, pie:null, notes:null, codes:null };

    // ✅ "적용된 필터" (API에 실제로 쓰는 값)
    this.state = {
      pageLoading: false,
      pageError: null,
      loading: { summary:false, monthly:false, pie:false, notes:false, codes:false },
      error:   { summary:null,  monthly:null,  pie:null,  notes:null,  codes:null  },

      // 서버 호출용 필터 (press 는 라인 값과 동일)
      kpiFilters: { start_work_date: jan1, end_work_date: DEFAULT_END, press: "1500T" },
      kpiSummary: { total: 0, count: 0, avg: 0, topName: "-", topValue: 0 },

      // ✅ "UI 선택값" (검색 전 임시로 담아두는 값)
      uiFilters: {
        plant: "본사",
        workplace: "프레스",
        line: "1500T", // 1500T(E라인)
        itemCode: "",
        start_work_date: jan1,
        end_work_date: DEFAULT_END,
      },

      itemCodeOptions: [],
      chartItemCode: "",  // 적용된 품번
      chartMonths: [],
      chartSeries: [{ label: "비가동(분)", data: [] }],
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
    // 초기 로딩: 현재 uiFilters 기준으로 품번 목록을 불러와서 기본 품번 선택 후 전체 조회
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
        pieData: [],
        topNotes: [],
      });
      return;
    }

    const preferred = "64312-JI000";
    const defaultCode = codes.includes(preferred) ? preferred : codes[0];

    await this.setStateAsync({
      chartItemCode: defaultCode,
      uiFilters: { ...uiFilters, itemCode: defaultCode },
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
    try { this.ctrl[key]?.abort(); } catch (e) {}
    this.ctrl[key] = new AbortController();
    return this.ctrl[key].signal;
  };

  setLoading = (key, v) => this.setState((s) => ({ loading: { ...s.loading, [key]: v } }));
  setError   = (key, v) => this.setState((s) => ({ error:   { ...s.error,   [key]: v } }));

  parseDate = (raw) => {
    if (!raw) return null;
    let s = String(raw).split("T")[0].replace(/[./]/g, "-");
    const m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (m) s = `${m[1]}-${String(m[2]).padStart(2,"0")}-${String(m[3]).padStart(2,"0")}`;
    const d = new Date(`${s}T00:00:00`);
    return isNaN(d) ? null : d;
  };
  ensureValidRange = (f) => {
    const sd = this.parseDate(f.start_work_date);
    const ed = this.parseDate(f.end_work_date);
    if (sd && ed && sd > ed) return { ...f, end_work_date: f.start_work_date };
    return f;
  };

  fmtNumber  = (n) => new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(n ?? 0);
  fmtMinutes = (n) => `${this.fmtNumber(Math.round(n ?? 0))}분`;

  monthKeyToLabel = (ym) => {
    const mm = Number(String(ym).split("-")[1] || 0);
    return `${mm}월`;
  };

  normalizeSummary = (json) => ({
    total: Number(json?.total ?? 0),
    count: Number(json?.count ?? 0),
    avg:   Number(json?.avg ?? 0),
    topName: String(json?.topName ?? "-"),
    topValue: Number(json?.topValue ?? 0),
  });
  normalizeMonthly = (arr) => {
    const months = (arr || []).map(r => String(r.ym)).sort();
    const data   = months.map(m => Number(arr.find(x => x.ym === m)?.minutes ?? 0));
    return { months, data };
  };
  normalizePie = (arr) => {
    const sorted = (arr || []).slice().sort((a,b) => (b.minutes||0) - (a.minutes||0));
    if (this.PIE_WITH_OTHERS) {
      if (sorted.length >= this.PIE_TOP_N) {
        const topCount = this.PIE_TOP_N - 1;
        const top = sorted.slice(0, topCount);
        const othersSum = sorted.slice(topCount).reduce((s,x)=>s+(x.minutes||0),0);
        if (othersSum > 0) {
          const dataTop = top.map((r,i)=>({ id:i, label:r.label || "(없음)", value:Number(r.minutes||0) }));
          dataTop.push({ id:dataTop.length, label:"기타", value:othersSum });
          return dataTop;
        }
        return sorted.slice(0,this.PIE_TOP_N).map((r,i)=>({ id:i, label:r.label||"(없음)", value:Number(r.minutes||0) }));
      }
      return sorted.map((r,i)=>({ id:i, label:r.label||"(없음)", value:Number(r.minutes||0) }));
    }
    return sorted.slice(0,this.PIE_TOP_N).map((r,i)=>({ id:i, label:r.label||"(없음)", value:Number(r.minutes||0) }));
  };
  normalizeTopNotes = (arr) => (arr||[]).map(x => ({
    text: String(x.text || ""), count: Number(x.count || 0), minutes: Number(x.minutes || 0)
  }));

  setStateAsync = (st) => new Promise((res)=>this.setState(st, res));

  // ---------- API ----------
  async fetchJson(url, options, key) {
    const res = await fetch(url, options);
    if (!res.ok) {
      const txt = await res.text().catch(()=> "");
      throw new Error(`${key || "API"} 실패: HTTP ${res.status} ${txt}`);
    }
    return res.json();
  }

  // 품번 목록 (override로 press/기간 미리보기 지원)
  fetchItemCodes = async (override = {}) => {
    const filters = { ...this.state.kpiFilters, ...override };
    this.setLoading("codes", true); this.setError("codes", null);
    try {
      const qs = new URLSearchParams({
        workplace:       filters.press || "",
        start_work_date: filters.start_work_date || "",
        end_work_date:   filters.end_work_date || "",
      }).toString();
      const signal = this.abortPrev("codes");
      const json = await this.fetchJson(this.API(`/downtime_chart/item-codes?${qs}`), { signal }, "자재코드");

      const arr = Array.isArray(json) ? json : (Array.isArray(json?.data) ? json.data : []);
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
    this.setLoading("summary", true); this.setError("summary", null);
    try {
      const signal = this.abortPrev("summary");
      const payload = {
        start_work_date: kpiFilters.start_work_date,
        end_work_date:   kpiFilters.end_work_date,
        workplace:       kpiFilters.press,
      };
      const json = await this.fetchJson(this.API("/downtime_chart/summary"), {
        method: "POST",
        headers: { "Content-Type":"application/json", Accept:"application/json" },
        signal,
        body: JSON.stringify(payload),
      }, "summary");
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
      this.setState({ chartMonths: [], chartSeries:[{ label:"비가동(분)", data:[] }] });
      return;
    }
    this.setLoading("monthly", true); this.setError("monthly", null);
    try {
      const signal = this.abortPrev("monthly");
      const payload = {
        start_work_date: kpiFilters.start_work_date,
        end_work_date:   kpiFilters.end_work_date,
        workplace:       kpiFilters.press,
        itemCode:        String(chartItemCode).trim(),
      };
      const json = await this.fetchJson(this.API("/downtime_chart/monthly"), {
        method: "POST",
        headers: { "Content-Type":"application/json", Accept:"application/json" },
        signal,
        body: JSON.stringify(payload),
      }, "monthly");

      const rows = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
      const { months, data } = this.normalizeMonthly(rows);
      this.setState({ chartMonths: months, chartSeries: [{ label:"비가동(분)", data }] });
    } catch (e) {
      console.error("[fetchMonthly]", e);
      this.setError("monthly", e.message || "월별 합계 조회 실패");
      this.setState({ chartMonths: [], chartSeries:[{ label:"비가동(분)", data:[] }] });
      throw e;
    } finally {
      this.setLoading("monthly", false);
    }
  };

  fetchPie = async () => {
    const { kpiFilters, chartItemCode } = this.state;
    if (!this.hasValidItemCode()) { this.setState({ pieData: [] }); return; }
    this.setLoading("pie", true); this.setError("pie", null);
    try {
      const signal = this.abortPrev("pie");
      const payload = {
        start_work_date: kpiFilters.start_work_date,
        end_work_date:   kpiFilters.end_work_date,
        workplace:       kpiFilters.press,
        itemCode:        String(chartItemCode).trim(),
        top:             this.PIE_TOP_N,
        withOthers:      this.PIE_WITH_OTHERS,
      };
      const json = await this.fetchJson(this.API("/downtime_chart/pie"), {
        method: "POST",
        headers: { "Content-Type":"application/json", Accept:"application/json" },
        signal,
        body: JSON.stringify(payload),
      }, "pie");

      const rows = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
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
    if (!this.hasValidItemCode()) { this.setState({ topNotes: [] }); return; }
    this.setLoading("notes", true); this.setError("notes", null);
    try {
      const signal = this.abortPrev("notes");
      const payload = {
        start_work_date: kpiFilters.start_work_date,
        end_work_date:   kpiFilters.end_work_date,
        workplace:       kpiFilters.press,
        itemCode:        String(chartItemCode).trim(),
        limit: 10,
      };
      const json = await this.fetchJson(this.API("/downtime_chart/top-notes"), {
        method: "POST",
        headers: { "Content-Type":"application/json", Accept:"application/json" },
        signal,
        body: JSON.stringify(payload),
      }, "top-notes");

      const rows = Array.isArray(json?.data) ? json.data : (Array.isArray(json) ? json : []);
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
      await Promise.all([ this.fetchSummary(), this.fetchMonthly(), this.fetchPie(), this.fetchTopNotes() ]);
    } catch (error) {
      this.setState({ pageError: "데이터를 불러오는 중 오류가 발생했습니다." });
    } finally {
      this.setState({ pageLoading: false });
    }
  };

  // ---------- handlers (FilterPanel 전용) ----------
  handleFilterChange = async (key, value) => {
    const next = { ...this.state.uiFilters, [key]: value };

    // 기간 유효성 보정
    if (key === "start_work_date" || key === "end_work_date") {
      const fixed = this.ensureValidRange({
        start_work_date: next.start_work_date,
        end_work_date: next.end_work_date
      });
      next.start_work_date = fixed.start_work_date;
      next.end_work_date = fixed.end_work_date;
    }

    await this.setStateAsync({ uiFilters: next });

    // 라인/기간이 바뀌면 품번 목록을 미리 갱신 (Autocomplete 옵션 최신화)
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
      plant: "본사",
      workplace: "프레스",
      line: "1500T",
      itemCode: "",
      start_work_date: this.state.kpiFilters.start_work_date,
      end_work_date: this.state.kpiFilters.end_work_date,
    };
    await this.setStateAsync({ uiFilters: defaults });
    // 옵션 갱신
    this.fetchItemCodes({
      press: defaults.line,
      start_work_date: defaults.start_work_date,
      end_work_date: defaults.end_work_date,
    });
  };

  handleSearch = async () => {
    const { uiFilters, itemCodeOptions } = this.state;

    // 품번이 비었으면 옵션 첫번째로 보정 (가능할 때만)
    let finalItem = uiFilters.itemCode;
    if (!finalItem && itemCodeOptions.length > 0) {
      finalItem = itemCodeOptions[0];
    }

    await this.setStateAsync({
      kpiFilters: {
        start_work_date: uiFilters.start_work_date,
        end_work_date: uiFilters.end_work_date,
        press: uiFilters.line, // 서버 workplace ← 라인 값 사용
      },
      chartItemCode: finalItem || "", // 없으면 빈값으로 (fetch* 가 가드)
    });

    this.fetchAllSections();
  };

  // ---------- render ----------
  render() {
    const { themeHex } = this.props;
    const {
      uiFilters, kpiSummary, loading, error,
      chartMonths, chartSeries, pieData, topNotes,
      itemCodeOptions, pageLoading, pageError,
    } = this.state;

    return (
      <div className={s.root}>
        <TitleSection themeHex={themeHex} />

        {/* ✅ 중앙 필터 패널 */}
        <FilterPanel
          themeHex={themeHex}
          filters={uiFilters}
          itemCodeOptions={itemCodeOptions}
          onChange={this.handleFilterChange}
          onClear={this.clearFilters}
          onSearch={this.handleSearch}
          loadingCodes={loading.codes}
        />

        {/* KPI 카드만 표시 (필터는 위 패널에서 관리) */}
        <KpiSection
          themeHex={themeHex}
          kpiSummary={kpiSummary}
          loading={loading}
          error={error}
          fmtNumber={this.fmtNumber}
          fmtMinutes={this.fmtMinutes}
          pageLoading={pageLoading}
          pageError={pageError}
        />

        {/* 월별 차트 */}
        <MonthlySection
          chartMonths={chartMonths}
          chartSeries={chartSeries}
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
          chartItemCode={this.state.chartItemCode}
        />
      </div>
    );
  }
}

export default connect((state) => ({
  themeHex: selectThemeHex(state),
  themeKey: selectThemeKey(state),
}))(DowntimeChart);