// // // // import React, { Component } from "react";
// // // // import {
// // // //   Box, Paper, Typography, Grid, Card, CardContent,
// // // //   FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell,
// // // //   TableContainer, TableHead, TableRow, IconButton, Tooltip,
// // // //   FormControlLabel, Switch, Button, CircularProgress, TextField
// // // // } from "@mui/material";
// // // // import {
// // // //   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
// // // //   Tooltip as RTooltip, ResponsiveContainer, Area, Line, ReferenceLine,
// // // //   ComposedChart, Legend
// // // // } from "recharts";
// // // // import {
// // // //   Search as SearchIcon,
// // // //   FileDownload as DownloadIcon,
// // // //   PieChart as PieChartIcon,
// // // //   BarChart as BarChartIcon,
// // // //   RestartAlt as ResetIcon,
// // // // } from "@mui/icons-material";
// // // // import s from "./InspectionSystemChart.module.scss";
// // // // import config from "../../config";

// // // // const palette = ["#ff7043", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc", "#26c6da", "#ec407a", "#7e57c2", "#8d6e63", "#26a69a"];
// // // // const mainColor = "#1e88e5";

// // // // // formatting helpers
// // // // const fmtNum = (v, d = null) => {
// // // //   const n = Number(v) || 0;
// // // //   return d === null
// // // //     ? n.toLocaleString()
// // // //     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// // // // };
// // // // const fmtInt = (v) => fmtNum(v, 0);

// // // // // 주차 키 계산
// // // // const wkKey = (ds) => {
// // // //   const d = new Date(ds);
// // // //   if (Number.isNaN(d.getTime())) return ds;
// // // //   const jan1 = new Date(d.getFullYear(), 0, 1);
// // // //   const days = Math.floor((d - jan1) / 86400000);
// // // //   const w = Math.ceil((days + jan1.getDay() + 1) / 7);
// // // //   return `${d.getFullYear()}-W${String(w).padStart(2, "0")}`;
// // // // };
// // // // const aggregateWeekly = (rows, keys) => {
// // // //   const m = new Map();
// // // //   rows.forEach(r => {
// // // //     const k = wkKey(r.date);
// // // //     const base = m.get(k) || { date: k };
// // // //     keys.forEach(key => base[key] = (base[key] || 0) + (r[key] || 0));
// // // //     m.set(k, base);
// // // //   });
// // // //   return [...m.values()];
// // // // };

// // // // // 기본 TopN=5
// // // // const getDefaultFilters = () => ({
// // // //   start_date: new Date(new Date().getFullYear(), 0, 1).toLocaleDateString("sv-SE"),
// // // //   end_date: new Date().toLocaleDateString("sv-SE"),
// // // //   factory: "",
// // // //   process: "",
// // // //   partNo: "",
// // // //   workType: "",
// // // //   inspType: "",
// // // //   item: "",
// // // //   topN: 5,
// // // // });

// // // // class InspectionSystemChart extends Component {
// // // //   state = {
// // // //     filters: getDefaultFilters(),
// // // //     // backend data
// // // //     kpis: { total: 0, partKinds: 0, itemKinds: 0, dailyAvg: 0, prodSum: 0, intensityPerK: 0, byInspType: [], byWorkType: [] },
// // // //     byItem: [],
// // // //     trend: [],
// // // //     stacked: [],
// // // //     byPart: [],
// // // //     byProcess: [],
// // // //     machines: [],
// // // //     throughput: [],
// // // //     shift: [],
// // // //     momentum: [],
// // // //     // 인사이트
// // // //     weekdayProfile: [],
// // // //     machIntensity: [],
// // // //     machShiftImbalance: [],
// // // //     anomalyDays: [],
// // // //     // 드롭다운 옵션
// // // //     factories: [],
// // // //     processes: [],
// // // //     parts: [],
// // // //     items: [],
// // // //     optionsLoading: false,
// // // //     // ui
// // // //     loading: false,
// // // //     error: "",
// // // //     showStacked: true,
// // // //     // ✅ 차트별 독립 주간 토글
// // // //     showWeeklyTrend: false,
// // // //     showWeeklyThroughput: false,
// // // //     showWeeklyShift: false,
// // // //   };

// // // //   componentDidMount() {
// // // //     const saved = localStorage.getItem("inspectionFilters");
// // // //     if (saved) {
// // // //       try {
// // // //         const parsed = JSON.parse(saved);
// // // //         this.setState({ filters: { ...this.state.filters, ...parsed } }, async () => {
// // // //           await this.loadOptions();
// // // //           this.loadAll();
// // // //         });
// // // //         return;
// // // //       } catch {}
// // // //     }
// // // //     this.loadOptions().then(this.loadAll);
// // // //   }

// // // //   // 공통 POST
// // // //   post = async (path, body) => {
// // // //     const headers = { "Content-Type": "application/json" };
// // // //     const res = await fetch(`${config.baseURLApi}/smartFactory/inspection_chart${path}`, {
// // // //       method: "POST", headers, body: JSON.stringify(body)
// // // //     });
// // // //     if (!res.ok) throw new Error(path + " 호출 실패");
// // // //     const json = await res.json();
// // // //     return json.data || [];
// // // //   };

// // // //   // 드롭다운 옵션 로딩
// // // //   loadOptions = async () => {
// // // //     const { filters } = this.state;
// // // //     this.setState({ optionsLoading: true });
// // // //     try {
// // // //       const [factories, processes, parts, items] = await Promise.all([
// // // //         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
// // // //         this.post("/options/processes", { ...filters }),
// // // //         this.post("/options/parts",     { ...filters }),
// // // //         this.post("/options/items",     { ...filters }),
// // // //       ]);
// // // //       this.setState({ factories, processes, parts, items, optionsLoading: false });
// // // //     } catch (e) {
// // // //       console.error(e);
// // // //       this.setState({ optionsLoading: false });
// // // //     }
// // // //   };

// // // //   // 필터 변경
// // // //   handleFilterChange = async (field, value) => {
// // // //     this.setState(prev => {
// // // //       const f = { ...prev.filters, [field]: value };
// // // //       if (field === "factory") { f.process = ""; f.partNo = ""; f.item = ""; }
// // // //       if (field === "process") { f.partNo = ""; f.item = ""; }
// // // //       if (field === "partNo")  { f.item = ""; }
// // // //       return { filters: f };
// // // //     }, async () => {
// // // //       if (["start_date","end_date","factory","process","partNo","workType","inspType"].includes(field)) {
// // // //         await this.loadOptions();
// // // //       }
// // // //     });
// // // //   };

// // // //   loadAll = async () => {
// // // //     const { filters } = this.state;
// // // //     try { localStorage.setItem("inspectionFilters", JSON.stringify(filters)); } catch {}

// // // //     this.setState({ loading: true, error: "" });
// // // //     try {
// // // //       const [
// // // //         kpis, byItem, trend, stacked,
// // // //         byPart, byProcess, machines, throughput, shift, momentum,
// // // //         weekdayProfile, machIntensity, machShiftImbalance, anomalyDays
// // // //       ] = await Promise.all([
// // // //         this.post("/kpis",                     filters),
// // // //         this.post("/by_item",                  filters),
// // // //         this.post("/trend",                    filters),
// // // //         this.post("/stacked",                  filters),
// // // //         this.post("/by_part",                  filters),
// // // //         this.post("/by_process",               filters),
// // // //         this.post("/by_machine",               filters),
// // // //         this.post("/throughput",               filters),
// // // //         this.post("/shift",                    filters),
// // // //         this.post("/momentum",                 filters),
// // // //         this.post("/weekday_profile",          filters),
// // // //         this.post("/intensity_by_machine",     filters),
// // // //         this.post("/shift_imbalance_machine",  filters),
// // // //         this.post("/anomaly_days",             filters),
// // // //       ]);

// // // //       this.setState({
// // // //         kpis, byItem, trend, stacked, byPart, byProcess, machines, throughput, shift, momentum,
// // // //         weekdayProfile, machIntensity, machShiftImbalance, anomalyDays,
// // // //         loading: false
// // // //       });
// // // //     } catch (e) {
// // // //       console.error(e);
// // // //       this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
// // // //     }
// // // //   };

// // // //   resetFilters = () => {
// // // //     const defaults = getDefaultFilters();
// // // //     this.setState({ filters: defaults }, async () => {
// // // //       try { localStorage.removeItem("inspectionFilters"); } catch {}
// // // //       await this.loadOptions();
// // // //       this.loadAll();
// // // //     });
// // // //   };

// // // //   exportCsv = () => {
// // // //     const { byItem, trend, byPart, byProcess, machines, throughput } = this.state;
// // // //     const rows = [
// // // //       ["[Pareto] item", "qty"],
// // // //       ...byItem.map(r => [r.item, r.qty]),
// // // //       [],
// // // //       ["[Trend] date", "count"],
// // // //       ...trend.map(d => [d.date, d.count]),
// // // //       [],
// // // //       ["[Top Part] partNo", "qty"],
// // // //       ...byPart.map(d => [d.partNo, d.qty]),
// // // //       [],
// // // //       ["[Top Process] process", "qty"],
// // // //       ...byProcess.map(d => [d.proc, d.qty]),
// // // //       [],
// // // //       ["[Top Machine] machine", "qty"],
// // // //       ...machines.map(d => [d.machine, d.qty]),
// // // //       [],
// // // //       ["[Throughput] date", "prod", "count", "intensity_per_1k"],
// // // //       ...throughput.map(d => [d.date, d.prod, d.count, d.intensity]),
// // // //     ];
// // // //     const csv = rows.map(r => r.join(",")).join("\n");
// // // //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // // //     const url = URL.createObjectURL(blob);
// // // //     const a = document.createElement("a");
// // // //     a.href = url;
// // // //     a.download = `inspection_charts_${Date.now()}.csv`;
// // // //     a.click();
// // // //     URL.revokeObjectURL(url);
// // // //   };

// // // //   // ===== tick formatter =====
// // // //   formatTick = (v, weekly) => {
// // // //     const s = String(v || "");
// // // //     if (weekly) {
// // // //       const wk = s.split("-W")[1] || s;
// // // //       return `W${wk}`;          // 주간일 땐 W번호만
// // // //     }
// // // //     return s.length >= 10 ? s.slice(5) : s; // 일간일 땐 MM-DD
// // // //   };

// // // //   // ===== Renderers =====

// // // //   renderTopBar = () => {
// // // //     const { loading, optionsLoading } = this.state;
// // // //     const busy = loading || optionsLoading;

// // // //     const renderSelect = (label, field, options, widthClass = "field") => (
// // // //       <FormControl size="small" className={s[widthClass]}>
// // // //         <InputLabel id={`${field}-lbl`}>{label}</InputLabel>
// // // //         <Select
// // // //           labelId={`${field}-lbl`}
// // // //           label={label}
// // // //           value={this.state.filters[field]}
// // // //           onChange={(e) => this.handleFilterChange(field, e.target.value)}
// // // //           MenuProps={{ PaperProps: { style: { maxHeight: 360 } } }}
// // // //         >
// // // //           <MenuItem value=""><em>전체</em></MenuItem>
// // // //           {options.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
// // // //         </Select>
// // // //       </FormControl>
// // // //     );

// // // //     return (
// // // //       <Box className={s.topbar}>
// // // //         <Box className={s.titleWrap}>
// // // //           <Typography variant="caption" className={s.breadcrumb} sx={{ fontWeight: 700 }}>
// // // //             검사시스템
// // // //           </Typography>
// // // //           <Typography variant="h5" className={s.pageTitle}>
// // // //             <Box component="span" sx={{ fontWeight: 900 }}>기간별 검사/생산 인사이트</Box>
// // // //           </Typography>
// // // //           <Typography variant="body2" className={s.pageDesc} sx={{ fontWeight: 400 }}>
// // // //             그리드 없이도 바로 보이는 <b>Top5·추이·스파이크·집중/불균형</b>.
// // // //           </Typography>
// // // //         </Box>

// // // //         {/* 필터 */}
// // // //         <Box className={s.tools}>
// // // //           {renderSelect("공장",   "factory", this.state.factories)}
// // // //           {renderSelect("공정",   "process", this.state.processes)}
// // // //           {renderSelect("품번",   "partNo",  this.state.parts)}
// // // //           {renderSelect("검사항목","item",   this.state.items)}
// // // //           <span className={s.rowBreak} />

// // // //           {/* ✅ 기간: TextField(type="date")로 통일 */}
// // // //           <TextField
// // // //             size="small"
// // // //             className={s.dateField}
// // // //             label="시작일"
// // // //             type="date"
// // // //             value={this.state.filters.start_date}
// // // //             onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// // // //             InputLabelProps={{ shrink: true }}
// // // //           />
// // // //           <TextField
// // // //             size="small"
// // // //             className={s.dateField}
// // // //             label="종료일"
// // // //             type="date"
// // // //             value={this.state.filters.end_date}
// // // //             onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// // // //             InputLabelProps={{ shrink: true }}
// // // //           />

// // // //           {/* 고정 드롭다운 */}
// // // //           <FormControl size="small" className={s.field}>
// // // //             <InputLabel id="inspType">검사구분</InputLabel>
// // // //             <Select labelId="inspType" label="검사구분" value={this.state.filters.inspType}
// // // //               onChange={(e) => this.handleFilterChange("inspType", e.target.value)}>
// // // //               <MenuItem value=""><em>전체</em></MenuItem>
// // // //               <MenuItem value="자동검사">자동검사</MenuItem>
// // // //               <MenuItem value="자주검사">자주검사</MenuItem>
// // // //             </Select>
// // // //           </FormControl>

// // // //           <FormControl size="small" className={s.field}>
// // // //             <InputLabel id="workType">작업구분</InputLabel>
// // // //             <Select labelId="workType" label="작업구분" value={this.state.filters.workType}
// // // //               onChange={(e) => this.handleFilterChange("workType", e.target.value)}>
// // // //               <MenuItem value=""><em>전체</em></MenuItem>
// // // //               <MenuItem value="초품">초품</MenuItem>
// // // //               <MenuItem value="중품">중품</MenuItem>
// // // //               <MenuItem value="종품">종품</MenuItem>
// // // //             </Select>
// // // //           </FormControl>

// // // //           <FormControl size="small" className={s.fieldSmall}>
// // // //             <InputLabel id="topn">Top N</InputLabel>
// // // //             <Select labelId="topn" label="Top N" value={this.state.filters.topN}
// // // //               onChange={(e) => this.handleFilterChange("topN", e.target.value)}>
// // // //                 {[5, 10, 15, 20].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
// // // //             </Select>
// // // //           </FormControl>

// // // //           <Box className={s.buttonGroup}>
// // // //             <Button variant="contained" color="warning" size="small"
// // // //               startIcon={busy ? <CircularProgress size={14}/> : <SearchIcon />}
// // // //               onClick={this.loadAll} disabled={busy} sx={{ fontWeight: 700 }}>
// // // //               검색
// // // //             </Button>
// // // //             <Button variant="outlined" color="inherit" size="small" startIcon={<ResetIcon />} onClick={this.resetFilters} disabled={busy}>
// // // //               초기화
// // // //             </Button>
// // // //             <Tooltip title="CSV 내보내기">
// // // //               <IconButton onClick={this.exportCsv} sx={{ color: "#607d8b" }} disabled={busy}>
// // // //                 <DownloadIcon />
// // // //               </IconButton>
// // // //             </Tooltip>
// // // //           </Box>
// // // //         </Box>
// // // //       </Box>
// // // //     );
// // // //   };

// // // //   KPI = ({ title, value, color, sub }) => (
// // // //     <Card className={s.kpiCard} sx={{ flex: 1, height: '100%' }}>
// // // //       <CardContent className={s.kpiBody}>
// // // //         <Typography className={s.kpiTitle} sx={{ color, fontSize: 13, fontWeight: 800 }}>{title}</Typography>
// // // //         <Typography className={s.kpiValue} sx={{ color, fontSize: 28, fontWeight: 900 }}>{value}</Typography>
// // // //         <Box className={s.kpiFoot}>
// // // //           <Typography className={s.kpiSub} sx={{ fontSize: 12, fontWeight: 500 }}>{sub}</Typography>
// // // //         </Box>
// // // //       </CardContent>
// // // //     </Card>
// // // //   );

// // // //   renderKpis = () => {
// // // //     const { kpis } = this.state;
// // // //     const cards = [
// // // //       { title: "총 검사건수", value: fmtInt(kpis.total), sub: "필터 조건 내", color: "#1e88e5" },
// // // //       { title: "품번 종류", value: fmtInt(kpis.partKinds), sub: "고유 품번 수", color: "#43a047" },
// // // //       { title: "검사항목 종류", value: fmtInt(kpis.itemKinds), sub: "고유 항목 수", color: "#8e24aa" },
// // // //       { title: "일 평균 검사", value: fmtNum(kpis.dailyAvg, 2), sub: "보고일 기준", color: "#ff7043" },
// // // //       { title: "총 생산수량", value: fmtNum(kpis.prodSum, 0), sub: "해당 기간 합계", color: "#00897b" },
// // // //       { title: "검사강도(1k 생산당)", value: fmtNum(kpis.intensityPerK, 2), sub: "검사건수 / (생산/1000)", color: "#6d4c41" },
// // // //     ];
// // // //     return (
// // // //       <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // // //         {cards.map((c, i) => (
// // // //           <Grid item xs={12} sm={6} md={3} lg={2} key={i} sx={{ display: 'flex' }}>
// // // //             <this.KPI {...c} />
// // // //           </Grid>
// // // //         ))}
// // // //       </Grid>
// // // //     );
// // // //   };

// // // //   renderDonut = () => {
// // // //     const { kpis } = this.state;
// // // //     const data = (kpis.byInspType || []).map((d, i) => ({ name: d.type || "미지정", value: d.qty || 0, color: palette[i % palette.length] }));
// // // //     const total = data.reduce((s, d) => s + d.value, 0);

// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             <PieChartIcon /> 검사구분 분포
// // // //           </Typography>
// // // //         </Box>
// // // //         <Box sx={{ flex: 1, minHeight: 280, position: "relative" }}>
// // // //           <ResponsiveContainer width="100%" height="100%">
// // // //             <PieChart>
// // // //               <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
// // // //                 {data.map((d, i) => <Cell key={i} fill={d.color} />)}
// // // //               </Pie>
// // // //               <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
// // // //             </PieChart>
// // // //           </ResponsiveContainer>
// // // //           <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", pointerEvents: "none" }}>
// // // //             <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
// // // //             <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#263238" }}>{fmtInt(total)}</Typography>
// // // //           </Box>
// // // //         </Box>
// // // //         {/* 범례 */}
// // // //         <Box className={s.legendRow}>
// // // //           {data.map(d => (
// // // //             <span key={d.name} className={s.legendItem}>
// // // //               <span className={s.legendDot} style={{ background: d.color }} />
// // // //               {d.name}
// // // //             </span>
// // // //           ))}
// // // //         </Box>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   renderPareto = () => {
// // // //     const { byItem } = this.state;
// // // //     const total = byItem.reduce((s, x) => s + (x.qty || 0), 0) || 1;
// // // //     let cum = 0;
// // // //     const data = byItem.map(d => {
// // // //       cum += d.qty || 0;
// // // //       const rate = Math.min(100, (cum / total) * 100);
// // // //       return { ...d, cumRate: Math.round(rate * 100) / 100 };
// // // //     });

// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             <BarChartIcon /> 검사항목 파레토
// // // //           </Typography>
// // // //         </Box>
// // // //         <Box sx={{ flex: 1, minHeight: 280 }}>
// // // //           <ResponsiveContainer width="100%" height="100%">
// // // //             <BarChart data={data}>
// // // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // // //               <XAxis dataKey="item" axisLine={false} tickLine={false} />
// // // //               <YAxis yAxisId="left" axisLine={false} tickLine={false} />
// // // //               <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
// // // //               <Legend />
// // // //               <RTooltip formatter={(v, name, { payload }) => {
// // // //                   if (name === "수량") return [fmtInt(v), "수량"];
// // // //                   if (name === "누적(%)") return [`${(payload.cumRate ?? 0).toFixed(2)}%`, "누적(%)"];
// // // //                   return [v, name];
// // // //                 }}
// // // //               />
// // // //               <Bar yAxisId="left" dataKey="qty" name="수량" radius={[4, 4, 0, 0]}>
// // // //                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // // //               </Bar>
// // // //               <Line yAxisId="right" type="monotone" dataKey="cumRate" name="누적(%)" stroke="#90a4ae" dot={false} />
// // // //               <ReferenceLine yAxisId="right" y={80} stroke={mainColor} strokeDasharray="4 4" />
// // // //             </BarChart>
// // // //           </ResponsiveContainer>
// // // //         </Box>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   renderTrend = () => {
// // // //     const { trend, stacked, showStacked, showWeeklyTrend } = this.state;

// // // //     const map = new Map();
// // // //     trend.forEach(r => map.set(r.date, { ...r }));
// // // //     stacked.forEach(r => {
// // // //       const base = map.get(r.date) || { date: r.date, count: 0 };
// // // //       map.set(r.date, { ...base, auto: r.auto, self: r.self, other: r.other });
// // // //     });
// // // //     const mergedDaily = Array.from(map.values()).sort((a,b) => (a.date > b.date ? 1 : -1));
// // // //     const merged = showWeeklyTrend ? aggregateWeekly(mergedDaily, ["count","auto","self","other"]) : mergedDaily;

// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             검사 건수 추이
// // // //           </Typography>
// // // //           <Box>
// // // //             <FormControlLabel
// // // //               control={<Switch size="small" checked={showWeeklyTrend} onChange={(e) => this.setState({ showWeeklyTrend: e.target.checked })} />}
// // // //               label="주간 합계 보기"
// // // //             />
// // // //             <FormControlLabel
// // // //               control={<Switch size="small" checked={showStacked} onChange={(e) => this.setState({ showStacked: e.target.checked })} />}
// // // //               label="검사구분 같이 보기"
// // // //             />
// // // //           </Box>
// // // //         </Box>

// // // //         <Box sx={{ height: 320 }}>
// // // //           <ResponsiveContainer width="100%" height="100%">
// // // //             <ComposedChart data={merged} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
// // // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // // //               <XAxis
// // // //                 dataKey="date"
// // // //                 interval="preserveStartEnd"
// // // //                 minTickGap={28}
// // // //                 tickMargin={10}
// // // //                 tick={{ fontSize: 11 }}
// // // //                 tickFormatter={(v) => this.formatTick(v, showWeeklyTrend)}
// // // //               />
// // // //               <YAxis yAxisId="left" />
// // // //               <RTooltip />
// // // //               <Legend verticalAlign="top" height={32}
// // // //                       iconType="circle" iconSize={14}
// // // //                       wrapperStyle={{ fontWeight: 700, letterSpacing: ".2px" }}
// // // //                       formatter={(value) => <span style={{ fontWeight: 700 }}>{value}</span>} />
// // // //               <Area yAxisId="left" type="monotone" dataKey="count" name="검사건수" stroke={mainColor} fill="rgba(30,136,229,.15)" />
// // // //               {showStacked && (
// // // //                 <>
// // // //                   <Bar dataKey="auto" name="자동검사" yAxisId="left" fill="rgba(255,112,67,.55)" barSize={10} />
// // // //                   <Bar dataKey="self" name="자주검사" yAxisId="left" fill="rgba(66,165,245,.55)" barSize={10} />
// // // //                   <Bar dataKey="other" name="기타" yAxisId="left" fill="rgba(171,71,188,.55)" barSize={10} />
// // // //                 </>
// // // //               )}
// // // //             </ComposedChart>
// // // //           </ResponsiveContainer>
// // // //         </Box>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   renderThroughput = () => {
// // // //     const { throughput, showWeeklyThroughput } = this.state;
// // // //     const thr = showWeeklyThroughput ? aggregateWeekly(throughput, ["prod","count"]) : throughput;
// // // //     const thrReady = thr.map(r => ({ ...r, intensity: r.prod > 0 ? +(r.count/(r.prod/1000)).toFixed(3) : 0 }));

// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             생산-검사 스루풋 & 정규화(1k 생산당)
// // // //           </Typography>
// // // //           <FormControlLabel
// // // //             control={<Switch size="small" checked={showWeeklyThroughput} onChange={(e)=>this.setState({ showWeeklyThroughput: e.target.checked })} />}
// // // //             label="주간 합계 보기"
// // // //           />
// // // //         </Box>
// // // //         <Box sx={{ height: 320 }}>
// // // //           <ResponsiveContainer width="100%" height="100%">
// // // //             <ComposedChart data={thrReady} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
// // // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // // //               <XAxis
// // // //                 dataKey="date"
// // // //                 interval="preserveStartEnd"
// // // //                 minTickGap={28}
// // // //                 tickMargin={10}
// // // //                 tick={{ fontSize: 11 }}
// // // //                 tickFormatter={(v) => this.formatTick(v, showWeeklyThroughput)}
// // // //               />
// // // //               <YAxis yAxisId="left" />
// // // //               <YAxis yAxisId="right" orientation="right" />
// // // //               <Legend verticalAlign="top" height={32} />
// // // //               <RTooltip formatter={(v, n) => {
// // // //                 if (n === "생산합") return [fmtInt(v), "생산합"];
// // // //                 if (n === "검사건수") return [fmtInt(v), "검사건수"];
// // // //                 if (n === "정규화강도") return [fmtNum(v,3), "정규화강도(1k당)"];
// // // //                 return [v, n];
// // // //               }}/>
// // // //               <Bar  yAxisId="left"  dataKey="prod"       name="생산합"      fill="rgba(76,175,80,.55)"  barSize={12} />
// // // //               <Line yAxisId="left"  type="monotone"      dataKey="count"     name="검사건수"    stroke="#1565c0" dot={false} />
// // // //               <Line yAxisId="right" type="monotone"      dataKey="intensity"  name="정규화강도"  stroke="#6d4c41" dot={false} />
// // // //             </ComposedChart>
// // // //           </ResponsiveContainer>
// // // //         </Box>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   // TopN
// // // //   renderTopPart = () => {
// // // //     const { byPart } = this.state;
// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex: 1 }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             품번 Top {this.state.filters.topN}
// // // //           </Typography>
// // // //         </Box>
// // // //         <Box sx={{ height: 280 }}>
// // // //           <ResponsiveContainer width="100%" height="100%">
// // // //             <BarChart data={byPart} layout="vertical" margin={{ left: 40 }}>
// // // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // // //               <XAxis type="number" />
// // // //               <YAxis type="category" dataKey="partNo" width={160} />
// // // //               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
// // // //               <Bar dataKey="qty" name="검사건수">
// // // //                 {byPart.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // // //               </Bar>
// // // //             </BarChart>
// // // //           </ResponsiveContainer>
// // // //         </Box>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   renderTopProcess = () => {
// // // //     const { byProcess } = this.state;
// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex: 1 }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             공정 Top {this.state.filters.topN}
// // // //           </Typography>
// // // //         </Box>
// // // //         <Box sx={{ height: 280 }}>
// // // //           <ResponsiveContainer width="100%" height="100%">
// // // //             <BarChart data={byProcess}>
// // // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // // //               <XAxis dataKey="proc" />
// // // //               <YAxis />
// // // //               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
// // // //               <Bar dataKey="qty" name="검사건수">
// // // //                 {byProcess.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // // //               </Bar>
// // // //             </BarChart>
// // // //           </ResponsiveContainer>
// // // //         </Box>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   renderTopMachine = () => {
// // // //     const { machines } = this.state;
// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex: 1 }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             설비 Top {this.state.filters.topN}
// // // //           </Typography>
// // // //         </Box>
// // // //         <Box sx={{ height: 280 }}>
// // // //           <ResponsiveContainer width="100%" height="100%">
// // // //             <BarChart data={machines} layout="vertical" margin={{ left: 40 }}>
// // // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // // //               <XAxis type="number" />
// // // //               <YAxis type="category" dataKey="machine" width={160} />
// // // //               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
// // // //               <Bar dataKey="qty" name="검사건수">
// // // //                 {machines.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // // //               </Bar>
// // // //             </BarChart>
// // // //           </ResponsiveContainer>
// // // //         </Box>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   // 주/야 & 도넛
// // // //   renderShift = () => {
// // // //     const { shift, showWeeklyShift } = this.state;
// // // //     const shiftData = showWeeklyShift ? aggregateWeekly(shift, ["day","night"]) : shift;
// // // //     const totalDay = shift.reduce((s, r) => s + (r.day || 0), 0);
// // // //     const totalNight = shift.reduce((s, r) => s + (r.night || 0), 0);
// // // //     const donut = [
// // // //       { name: "주간", value: totalDay, color: "#42a5f5" },
// // // //       { name: "야간", value: totalNight, color: "#ab47bc" },
// // // //     ];

// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             주/야 구분 추이 & 분포
// // // //           </Typography>
// // // //           <FormControlLabel
// // // //             control={<Switch size="small" checked={showWeeklyShift} onChange={(e)=>this.setState({ showWeeklyShift: e.target.checked })} />}
// // // //             label="주간 합계 보기"
// // // //           />
// // // //         </Box>

// // // //         <Grid container spacing={2}>
// // // //           <Grid item xs={12} md={8}>
// // // //             <Box sx={{ height: 280 }}>
// // // //               <ResponsiveContainer width="100%" height="100%">
// // // //                 <ComposedChart data={shiftData} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
// // // //                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // // //                   <XAxis
// // // //                     dataKey="date"
// // // //                     interval="preserveStartEnd"
// // // //                     minTickGap={28}
// // // //                     tickMargin={10}
// // // //                     tick={{ fontSize: 11 }}
// // // //                     tickFormatter={(v) => this.formatTick(v, showWeeklyShift)}
// // // //                   />
// // // //                   <YAxis />
// // // //                   <Legend verticalAlign="top" height={32} />
// // // //                   <RTooltip />
// // // //                   <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" barSize={10} />
// // // //                   <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" barSize={10} />
// // // //                 </ComposedChart>
// // // //               </ResponsiveContainer>
// // // //             </Box>
// // // //           </Grid>
// // // //           <Grid item xs={12} md={4}>
// // // //             <Box sx={{ height: 280, position: "relative" }}>
// // // //               <ResponsiveContainer width="100%" height="100%">
// // // //                 <PieChart>
// // // //                   <Pie data={donut} innerRadius={55} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={2}>
// // // //                     {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
// // // //                   </Pie>
// // // //                   <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
// // // //                 </PieChart>
// // // //               </ResponsiveContainer>
// // // //               <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", pointerEvents: "none" }}>
// // // //                 <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
// // // //                 <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#263238" }}>{fmtInt(totalDay + totalNight)}</Typography>
// // // //               </Box>
// // // //             </Box>
// // // //           </Grid>
// // // //         </Grid>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   // 요일 패턴
// // // //   renderWeekdayProfile = () => {
// // // //     const labels = {1:"일",2:"월",3:"화",4:"수",5:"목",6:"금",7:"토"};
// // // //     const data = (this.state.weekdayProfile || []).map(r => ({
// // // //       name: labels[r.dow] || r.dow, day: r.day, night: r.night, total: r.total
// // // //     }));
// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex:1 }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             요일 패턴(주/야)
// // // //           </Typography>
// // // //         </Box>
// // // //         <Box sx={{ height: 280 }}>
// // // //           <ResponsiveContainer width="100%" height="100%">
// // // //             <ComposedChart data={data}>
// // // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // // //               <XAxis dataKey="name" />
// // // //               <YAxis />
// // // //               <Legend />
// // // //               <RTooltip />
// // // //               <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" />
// // // //               <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" />
// // // //               <Line type="monotone" dataKey="total" name="총계" stroke="#263238" dot={false} />
// // // //             </ComposedChart>
// // // //           </ResponsiveContainer>
// // // //         </Box>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   // 설비별 검사강도
// // // //   renderMachIntensity = () => {
// // // //     const data = this.state.machIntensity;
// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex:1 }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             설비별 검사강도(1k 생산당)
// // // //           </Typography>
// // // //         </Box>
// // // //         <Box sx={{ height: 280 }}>
// // // //           <ResponsiveContainer width="100%" height="100%">
// // // //             <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
// // // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // // //               <XAxis type="number" />
// // // //               <YAxis type="category" dataKey="machine" width={160} />
// // // //               <Legend />
// // // //               <RTooltip formatter={(v, n) => (
// // // //                 n === "검사강도" ? [fmtNum(v,3), "검사강도(1k)"] : [fmtInt(v), n]
// // // //               )} />
// // // //               <Bar dataKey="intensity" name="검사강도">
// // // //                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // // //               </Bar>
// // // //             </BarChart>
// // // //           </ResponsiveContainer>
// // // //         </Box>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   // 설비별 주/야 불균형
// // // //   renderMachShiftImbalance = () => {
// // // //     const data = this.state.machShiftImbalance;
// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex:1 }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // // //             설비별 주/야 불균형 Top {this.state.filters.topN}
// // // //           </Typography>
// // // //         </Box>
// // // //         <Box sx={{ height: 280 }}>
// // // //           <ResponsiveContainer width="100%" height="100%">
// // // //             <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
// // // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // // //               <XAxis type="number" />
// // // //               <YAxis type="category" dataKey="machine" width={160} />
// // // //               <Legend />
// // // //               <RTooltip formatter={(v, n) => {
// // // //                 if (n === "불균형") return [`${fmtNum(v*100,1)}%`, "불균형(|주-야|/총)"];
// // // //                 if (n === "야/주 비율") return [v, "야/주 비율"];
// // // //                 return [fmtInt(v), n];
// // // //               }} />
// // // //               <Bar dataKey="imbalance" name="불균형">
// // // //                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // // //               </Bar>
// // // //             </BarChart>
// // // //           </ResponsiveContainer>
// // // //         </Box>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   // 일간 이상치
// // // //   renderAnomalyTable = () => {
// // // //     const rows = this.state.anomalyDays || [];
// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex:1, display:'flex', flexDirection:'column' }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ fontWeight: 800 }}>
// // // //             일간 스파이크 알림 (z≥2.0)
// // // //           </Typography>
// // // //         </Box>
// // // //         <TableContainer sx={{
// // // //           maxHeight: 340, borderRadius: 1,
// // // //           "& .MuiTableCell-head": { position:"sticky", top:0, backgroundColor: mainColor, color:"#fff", zIndex:1, fontWeight:800 },
// // // //         }}>
// // // //           <Table size="small" stickyHeader>
// // // //             <TableHead>
// // // //               <TableRow>
// // // //                 <TableCell>일자</TableCell>
// // // //                 <TableCell align="right">검사건수</TableCell>
// // // //                 <TableCell align="right">평균</TableCell>
// // // //                 <TableCell align="right">표준편차</TableCell>
// // // //                 <TableCell align="right">z-score</TableCell>
// // // //               </TableRow>
// // // //             </TableHead>
// // // //             <TableBody>
// // // //               {rows.map((r,i)=>(
// // // //                 <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
// // // //                   <TableCell>{r.date}</TableCell>
// // // //                   <TableCell align="right">{fmtInt(r.count)}</TableCell>
// // // //                   <TableCell align="right">{fmtNum(r.avg,2)}</TableCell>
// // // //                   <TableCell align="right">{fmtNum(r.std,2)}</TableCell>
// // // //                   <TableCell align="right" style={{ fontWeight:900, color:"#d84315" }}>{fmtNum(r.z,2)}</TableCell>
// // // //                 </TableRow>
// // // //               ))}
// // // //               {rows.length===0 && <TableRow><TableCell colSpan={5} align="center">이상치가 없습니다.</TableCell></TableRow>}
// // // //             </TableBody>
// // // //           </Table>
// // // //         </TableContainer>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   renderDailyTable = () => {
// // // //     const map = new Map();
// // // //     this.state.trend.forEach(r => map.set(r.date, { date: r.date, count: r.count }));
// // // //     this.state.stacked.forEach(r => {
// // // //       const row = map.get(r.date) || { date: r.date, count: 0 };
// // // //       map.set(r.date, { ...row, auto: r.auto, self: r.self, other: r.other });
// // // //     });
// // // //     const all = Array.from(map.values()).sort((a,b) => (a.date > b.date ? 1 : -1));
// // // //     const rows = all.slice(-7).reverse();

// // // //     return (
// // // //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// // // //         <Box className={s.sectionHeader}>
// // // //           <Typography className={s.sectionTitle} sx={{ fontWeight: 800 }}>최근 7일 일자별 요약</Typography>
// // // //         </Box>
// // // //         <TableContainer
// // // //           sx={{
// // // //             maxHeight: 380, borderRadius: 1,
// // // //             "& .MuiTableCell-head": { position: "sticky", top: 0, backgroundColor: mainColor, color: "#fff", zIndex: 1, fontWeight: 800 },
// // // //           }}
// // // //         >
// // // //           <Table size="small" stickyHeader>
// // // //             <TableHead>
// // // //               <TableRow>
// // // //                 <TableCell>보고일</TableCell>
// // // //                 <TableCell align="right">총 검사</TableCell>
// // // //                 <TableCell align="right">자동검사</TableCell>
// // // //                 <TableCell align="right">자주검사</TableCell>
// // // //                 <TableCell align="right">기타</TableCell>
// // // //               </TableRow>
// // // //             </TableHead>
// // // //             <TableBody>
// // // //               {rows.map((r, i) => (
// // // //                 <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
// // // //                   <TableCell>{r.date}</TableCell>
// // // //                   <TableCell align="right">{fmtInt(r.count)}</TableCell>
// // // //                   <TableCell align="right">{fmtInt(r.auto || 0)}</TableCell>
// // // //                   <TableCell align="right">{fmtInt(r.self || 0)}</TableCell>
// // // //                   <TableCell align="right">{fmtInt(r.other || 0)}</TableCell>
// // // //                 </TableRow>
// // // //               ))}
// // // //               {rows.length === 0 && (
// // // //                 <TableRow><TableCell colSpan={5} align="center">데이터가 없습니다.</TableCell></TableRow>
// // // //               )}
// // // //             </TableBody>
// // // //           </Table>
// // // //         </TableContainer>
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   render() {
// // // //     return (
// // // //       <Box className={s.root}>
// // // //         {this.renderTopBar()}
// // // //         {this.renderKpis()}

// // // //         {/* 1행: 검사구분 도넛 / 파레토 */}
// // // //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // // //           <Grid item xs={12} md={5} sx={{ display: 'flex', minWidth: 0  }}>{this.renderDonut()}</Grid>
// // // //           <Grid item xs={12} md={7} sx={{ display: 'flex', minWidth: 0  }}>{this.renderPareto()}</Grid>
// // // //         </Grid>

// // // //         {/* 2행: 검사 추이 / 스루풋 */}
// // // //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // // //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTrend()}</Grid>
// // // //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderThroughput()}</Grid>
// // // //         </Grid>

// // // //         {/* 3행: 품번 / 공정 / 설비 TopN */}
// // // //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // // //           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopPart()}</Grid>
// // // //           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopProcess()}</Grid>
// // // //           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopMachine()}</Grid>
// // // //         </Grid>

// // // //         {/* 4행: 주/야 / 스파이크 */}
// // // //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // // //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderShift()}</Grid>
// // // //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderAnomalyTable()}</Grid>
// // // //         </Grid>

// // // //         {/* 5행: 요일 / 설비강도 / 설비 불균형 */}
// // // //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // // //           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderWeekdayProfile()}</Grid>
// // // //           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderMachIntensity()}</Grid>
// // // //           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderMachShiftImbalance()}</Grid>
// // // //         </Grid>

// // // //         {this.renderDailyTable()}
// // // //       </Box>
// // // //     );
// // // //   }
// // // // }

// // // // export default InspectionSystemChart;

// // // import React, { Component } from "react";
// // // import {
// // //   Box, Paper, Typography, Grid, Card, CardContent,
// // //   FormControl, InputLabel, Select, Menu, MenuItem, Table, TableBody, TableCell,
// // //   TableContainer, TableHead, TableRow, IconButton, Tooltip,
// // //   FormControlLabel, Switch, TextField, Button, Popover
// // // } from "@mui/material";
// // // import {
// // //   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
// // //   Tooltip as RTooltip, ResponsiveContainer, Area, Line, ReferenceLine,
// // //   ComposedChart, Legend
// // // } from "recharts";
// // // import {
// // //   FileDownload as DownloadIcon,
// // //   PieChart as PieChartIcon,
// // //   BarChart as BarChartIcon,
// // //   RestartAlt as ResetIcon,
// // //   ArrowDropDown as ArrowDropDownIcon
// // // } from "@mui/icons-material";
// // // import s from "./InspectionSystemChart.module.scss";
// // // import config from "../../config";

// // // /** ---------- helpers ---------- */
// // // const palette = [
// // //   "#ff7043", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc",
// // //   "#26c6da", "#ec407a", "#7e57c2", "#8d6e63", "#26a69a"
// // // ];
// // // const mainColor = "#1e88e5";

// // // const fmtNum = (v, d = null) => {
// // //   const n = Number(v) || 0;
// // //   return d === null
// // //     ? n.toLocaleString()
// // //     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// // // };
// // // const fmtInt = (v) => fmtNum(v, 0);

// // // const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
// // // const today0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
// // // const lastOfMonth  = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // // 주차 키
// // // const wkKey = (ds) => {
// // //   const d = new Date(ds);
// // //   if (Number.isNaN(d.getTime())) return ds;
// // //   const jan1 = new Date(d.getFullYear(), 0, 1);
// // //   const days = Math.floor((d - jan1) / 86400000);
// // //   const w = Math.ceil((days + jan1.getDay() + 1) / 7);
// // //   return `${d.getFullYear()}-W${String(w).padStart(2, "0")}`;
// // // };
// // // const aggregateWeekly = (rows, keys) => {
// // //   const m = new Map();
// // //   rows.forEach(r => {
// // //     const k = wkKey(r.date);
// // //     const base = m.get(k) || { date: k };
// // //     keys.forEach(key => base[key] = (base[key] || 0) + (r[key] || 0));
// // //     m.set(k, base);
// // //   });
// // //   return [...m.values()];
// // // };

// // // const getDefaultFilters = () => {
// // //   const y = new Date().getFullYear();
// // //   return {
// // //     // 디폴트: 올해 전체
// // //     start_date: iso(new Date(y, 0, 1)),
// // //     end_date: iso(new Date(y, 11, 31)),
// // //     factory: "",
// // //     process: "",
// // //     partNo: "",
// // //     workType: "",
// // //     inspType: "",
// // //     item: "",
// // //     topN: 5,
// // //   };
// // // };

// // // /** 버튼 기준 화면 좌표 계산 → Popover/Menu에 anchorPosition으로 전달 */
// // // const getAnchorPos = (el) => {
// // //   if (!el) return null;
// // //   const r = el.getBoundingClientRect();
// // //   return {
// // //     top: Math.round(r.bottom + window.scrollY),
// // //     left: Math.round(r.left + window.scrollX),
// // //   };
// // // };

// // // /** ---------- Component ---------- */
// // // class InspectionSystemChart extends Component {
// // //   state = {
// // //     filters: getDefaultFilters(),
// // //     // data
// // //     kpis: { total: 0, partKinds: 0, itemKinds: 0, dailyAvg: 0, prodSum: 0, intensityPerK: 0, byInspType: [], byWorkType: [] },
// // //     byItem: [], trend: [], stacked: [], byPart: [], byProcess: [], machines: [],
// // //     throughput: [], shift: [], momentum: [],
// // //     weekdayProfile: [], machIntensity: [], machShiftImbalance: [], anomalyDays: [],
// // //     // options
// // //     factories: [], processes: [], parts: [], items: [], optionsLoading: false,
// // //     years: [],
// // //     // ui
// // //     loading: false, error: "", showStacked: true,
// // //     showWeeklyTrend: false, showWeeklyThroughput: false, showWeeklyShift: false,
// // //     // 프리셋 상태
// // //     selectedYear: new Date().getFullYear(),
// // //     // 드롭다운 위치(좌표 고정)
// // //     yearAnchorPos: null,
// // //     monthAnchorPos: null,
// // //     customAnchorPos: null,
// // //   };

// // //   componentDidMount() {
// // //     const saved = localStorage.getItem("inspectionFilters");
// // //     if (saved) {
// // //       try { this.setState({ filters: { ...getDefaultFilters(), ...JSON.parse(saved) } }); } catch {}
// // //     }
// // //     this.bootstrap();
// // //   }

// // //   bootstrap = async () => {
// // //     await this.loadOptions();
// // //     await this.loadYears();
// // //     this.loadAll();
// // //   };

// // //   /** --------- API ---------- */
// // //   post = async (path, body) => {
// // //     const headers = { "Content-Type": "application/json" };
// // //     const res = await fetch(`${config.baseURLApi}/smartFactory/inspection_chart${path}`, {
// // //       method: "POST", headers, body: JSON.stringify(body)
// // //     });
// // //     if (!res.ok) throw new Error(path + " 호출 실패");
// // //     const json = await res.json();
// // //     return json.data || [];
// // //   };

// // //   loadOptions = async () => {
// // //     const { filters } = this.state;
// // //     this.setState({ optionsLoading: true });
// // //     try {
// // //       const [factories, processes, parts, items] = await Promise.all([
// // //         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
// // //         this.post("/options/processes", { ...filters }),
// // //         this.post("/options/parts",     { ...filters }),
// // //         this.post("/options/items",     { ...filters }),
// // //       ]);
// // //       this.setState({ factories, processes, parts, items, optionsLoading: false });
// // //     } catch (e) {
// // //       console.error(e);
// // //       this.setState({ optionsLoading: false });
// // //     }
// // //   };

// // //   /** 연간 드롭다운용: 서버에서 연도 목록을 받되, 실패 시 fallback(현재년~-4년) */
// // //   loadYears = async () => {
// // //     try {
// // //       const raw = await this.post("/options/years", { ...this.state.filters });
// // //       let years = Array.isArray(raw) ? raw.map(y => Number(y)).filter(Boolean) : [];
// // //       if (!years.length) throw new Error("no years");
// // //       years.sort((a,b) => b - a);
// // //       this.setState({ years, selectedYear: years[0] });
// // //     } catch {
// // //       const y = new Date().getFullYear();
// // //       const years = [y, y-1, y-2, y-3, y-4];
// // //       this.setState({ years, selectedYear: y });
// // //     }
// // //   };

// // //   /** 공통 필터 변경 */
// // //   handleFilterChange = async (field, value) => {
// // //     this.setState(prev => {
// // //       const f = { ...prev.filters, [field]: value };
// // //       if (field === "factory") { f.process = ""; f.partNo = ""; f.item = ""; }
// // //       if (field === "process") { f.partNo = ""; f.item = ""; }
// // //       if (field === "partNo")  { f.item = ""; }
// // //       return { filters: f };
// // //     }, async () => {
// // //       if (["start_date","end_date","factory","process","partNo","workType","inspType"].includes(field)) {
// // //         await this.loadOptions();
// // //         if (field === "start_date" || field === "end_date") this.loadAll();
// // //       }
// // //     });
// // //   };

// // //   /** 날짜범위 즉시 적용 */
// // //   setDateRange = async (start, end) => {
// // //     const start_date = iso(start);
// // //     const end_date   = iso(end);
// // //     this.setState(prev => ({ filters: { ...prev.filters, start_date, end_date } }), async () => {
// // //       try { localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters)); } catch {}
// // //       await this.loadOptions();
// // //       this.loadAll();
// // //     });
// // //   };

// // //   /** 프리셋 액션 */
// // //   applyToday = () => {
// // //     const t = today0();
// // //     this.setDateRange(t, t);
// // //   };
// // //   selectMonth = (m) => {
// // //     const y = this.state.selectedYear;
// // //     const s = new Date(y, m - 1, 1);
// // //     const e = lastOfMonth(s);
// // //     this.setDateRange(s, e);
// // //     this.setState({ monthAnchorPos: null });
// // //   };
// // //   selectYear = (y) => {
// // //     const s = new Date(y, 0, 1);
// // //     const e = new Date(y, 11, 31);
// // //     this.setState({ selectedYear: y }, () => this.setDateRange(s, e));
// // //     this.setState({ yearAnchorPos: null });
// // //   };

// // //   /** 초기화: 올해 전체 + 필터 초기값 */
// // //   resetToThisYear = async () => {
// // //     const y = new Date().getFullYear();
// // //     const filters = { ...getDefaultFilters() };
// // //     this.setState({ filters, selectedYear: y }, async () => {
// // //       try { localStorage.removeItem("inspectionFilters"); } catch {}
// // //       await this.loadOptions();
// // //       this.loadAll();
// // //     });
// // //   };

// // //   /** 데이터 로드 */
// // //   loadAll = async () => {
// // //     const { filters } = this.state;
// // //     try { localStorage.setItem("inspectionFilters", JSON.stringify(filters)); } catch {}
// // //     this.setState({ loading: true, error: "" });
// // //     try {
// // //       const [
// // //         kpis, byItem, trend, stacked,
// // //         byPart, byProcess, machines, throughput, shift, momentum,
// // //         weekdayProfile, machIntensity, machShiftImbalance, anomalyDays
// // //       ] = await Promise.all([
// // //         this.post("/kpis",                     filters),
// // //         this.post("/by_item",                  filters),
// // //         this.post("/trend",                    filters),
// // //         this.post("/stacked",                  filters),
// // //         this.post("/by_part",                  filters),
// // //         this.post("/by_process",               filters),
// // //         this.post("/by_machine",               filters),
// // //         this.post("/throughput",               filters),
// // //         this.post("/shift",                    filters),
// // //         this.post("/momentum",                 filters),
// // //         this.post("/weekday_profile",          filters),
// // //         this.post("/intensity_by_machine",     filters),
// // //         this.post("/shift_imbalance_machine",  filters),
// // //         this.post("/anomaly_days",             filters),
// // //       ]);

// // //       this.setState({
// // //         kpis, byItem, trend, stacked, byPart, byProcess, machines, throughput, shift, momentum,
// // //         weekdayProfile, machIntensity, machShiftImbalance, anomalyDays,
// // //         loading: false
// // //       });
// // //     } catch (e) {
// // //       console.error(e);
// // //       this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
// // //     }
// // //   };

// // //   exportCsv = () => {
// // //     const { byItem, trend, byPart, byProcess, machines, throughput } = this.state;
// // //     const rows = [
// // //       ["[Pareto] item", "qty"], ...byItem.map(r => [r.item, r.qty]), [],
// // //       ["[Trend] date", "count"], ...trend.map(d => [d.date, d.count]), [],
// // //       ["[Top Part] partNo", "qty"], ...byPart.map(d => [d.partNo, d.qty]), [],
// // //       ["[Top Process] process", "qty"], ...byProcess.map(d => [d.proc, d.qty]), [],
// // //       ["[Top Machine] machine", "qty"], ...machines.map(d => [d.machine, d.qty]), [],
// // //       ["[Throughput] date", "prod", "count", "intensity_per_1k"], ...throughput.map(d => [d.date, d.prod, d.count, d.intensity]),
// // //     ];
// // //     const csv = rows.map(r => r.join(",")).join("\n");
// // //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// // //     const url = URL.createObjectURL(blob);
// // //     const a = document.createElement("a");
// // //     a.href = url; a.download = `inspection_charts_${Date.now()}.csv`; a.click();
// // //     URL.revokeObjectURL(url);
// // //   };

// // //   /** ----- tick formatter ----- */
// // //   formatTick = (v, weekly) => {
// // //     const s = String(v || "");
// // //     if (weekly) {
// // //       const wk = s.split("-W")[1] || s;
// // //       return `W${wk}`;
// // //     }
// // //     return s.length >= 10 ? s.slice(5) : s;
// // //   };

// // //   /** ---------- top bar ---------- */
// // //   renderTopBar = () => {
// // //     const { optionsLoading, loading } = this.state;
// // //     const busy = optionsLoading || loading;

// // //     const renderSelect = (label, field, options, widthClass = "field") => (
// // //       <FormControl size="small" className={s[widthClass]}>
// // //         <InputLabel id={`${field}-lbl`}>{label}</InputLabel>
// // //         <Select
// // //           labelId={`${field}-lbl`}
// // //           label={label}
// // //           value={this.state.filters[field]}
// // //           onChange={(e) => this.handleFilterChange(field, e.target.value)}
// // //           MenuProps={{ PaperProps: { style: { maxHeight: 360 } } }}
// // //         >
// // //           <MenuItem value=""><em>전체</em></MenuItem>
// // //           {options.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
// // //         </Select>
// // //       </FormControl>
// // //     );

// // //     /** 활성 프리셋 표시 */
// // //     const { start_date, end_date } = this.state.filters;
// // //     const sd = new Date(start_date), ed = new Date(end_date), t = today0();
// // //     const isToday = sd.getTime() === t.getTime() && ed.getTime() === t.getTime();
// // //     const isYear  = sd.getFullYear() === ed.getFullYear()
// // //                  && sd.getMonth() === 0 && sd.getDate() === 1
// // //                  && ed.getMonth() === 11 && ed.getDate() === 31;
// // //     const isMonth = sd.getFullYear() === ed.getFullYear()
// // //                  && sd.getMonth() === ed.getMonth()
// // //                  && sd.getDate() === 1
// // //                  && ed.getDate() === lastOfMonth(sd).getDate();

// // //     const PresetBtn = ({ active, onClick, children, endIcon }) => (
// // //       <Button
// // //         size="small"
// // //         variant={active ? "contained" : "outlined"}
// // //         onClick={onClick}
// // //         endIcon={endIcon}
// // //         className={s.presetBtn}
// // //         disabled={busy}
// // //       >
// // //         {children}
// // //       </Button>
// // //     );

// // //     return (
// // //       <Box className={s.topbar}>
// // //         <Box className={s.titleWrap}>
// // //           <Typography variant="caption" className={s.breadcrumb} sx={{ fontWeight: 700 }}>
// // //             검사시스템
// // //           </Typography>
// // //           <Typography variant="h5" className={s.pageTitle}>
// // //             <Box component="span" sx={{ fontWeight: 900 }}>기간별 검사/생산 인사이트</Box>
// // //           </Typography>
// // //           <Typography variant="body2" className={s.pageDesc} sx={{ fontWeight: 400 }}>
// // //             그리드 없이도 바로 보이는 <b>Top5·추이·스파이크·집중/불균형</b>.
// // //           </Typography>
// // //         </Box>

// // //         {/* 필터 */}
// // //         <Box className={s.tools}>
// // //           {renderSelect("공장",   "factory", this.state.factories)}
// // //           {renderSelect("공정",   "process", this.state.processes)}
// // //           {renderSelect("품번",   "partNo",  this.state.parts)}
// // //           {renderSelect("검사항목","item",   this.state.items)}
// // //           <span className={s.rowBreak} />

// // //           {/* 기간 직접입력(보조) */}
// // //           <TextField
// // //             size="small"
// // //             className={s.dateField}
// // //             label="시작일"
// // //             type="date"
// // //             value={this.state.filters.start_date}
// // //             onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// // //             InputLabelProps={{ shrink: true }}
// // //           />
// // //           <TextField
// // //             size="small"
// // //             className={s.dateField}
// // //             label="종료일"
// // //             type="date"
// // //             value={this.state.filters.end_date}
// // //             onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// // //             InputLabelProps={{ shrink: true }}
// // //           />

// // //           {/* 고정 드롭다운 */}
// // //           <FormControl size="small" className={s.field}>
// // //             <InputLabel id="inspType">검사구분</InputLabel>
// // //             <Select
// // //               labelId="inspType"
// // //               label="검사구분"
// // //               value={this.state.filters.inspType}
// // //               onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
// // //             >
// // //               <MenuItem value=""><em>전체</em></MenuItem>
// // //               <MenuItem value="자동검사">자동검사</MenuItem>
// // //               <MenuItem value="자주검사">자주검사</MenuItem>
// // //             </Select>
// // //           </FormControl>

// // //           <FormControl size="small" className={s.field}>
// // //             <InputLabel id="workType">작업구분</InputLabel>
// // //             <Select
// // //               labelId="workType"
// // //               label="작업구분"
// // //               value={this.state.filters.workType}
// // //               onChange={(e) => this.handleFilterChange("workType", e.target.value)}
// // //             >
// // //               <MenuItem value=""><em>전체</em></MenuItem>
// // //               <MenuItem value="초품">초품</MenuItem>
// // //               <MenuItem value="중품">중품</MenuItem>
// // //               <MenuItem value="종품">종품</MenuItem>
// // //             </Select>
// // //           </FormControl>

// // //           <FormControl size="small" className={s.fieldSmall}>
// // //             <InputLabel id="topn">Top N</InputLabel>
// // //             <Select
// // //               labelId="topn"
// // //               label="Top N"
// // //               value={this.state.filters.topN}
// // //               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
// // //             >
// // //               {[5, 10, 15, 20].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
// // //             </Select>
// // //           </FormControl>

// // //           {/* 오른쪽 컨트롤: 연간/월간/오늘/직접입력 + 초기화 + CSV */}
// // //           <Box className={s.rightControls}>

// // //             {/* 연간: 좌표 고정 메뉴 */}
// // //             <PresetBtn
// // //               active={isYear}
// // //               onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// // //               endIcon={<ArrowDropDownIcon />}
// // //             >
// // //               연간
// // //             </PresetBtn>
// // //             <Menu
// // //               open={!!this.state.yearAnchorPos}
// // //               onClose={() => this.setState({ yearAnchorPos: null })}
// // //               anchorReference="anchorPosition"
// // //               anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// // //               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
// // //               transformOrigin={{ vertical: "top", horizontal: "left" }}
// // //               PaperProps={{ className: s.menuPaper }}
// // //             >
// // //               {this.state.years.map((y) => (
// // //                 <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
// // //                   {y}년
// // //                 </MenuItem>
// // //               ))}
// // //             </Menu>

// // //             {/* 월간: 선택된 연도 기준 */}
// // //             <PresetBtn
// // //               active={isMonth}
// // //               onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// // //               endIcon={<ArrowDropDownIcon />}
// // //             >
// // //               월간
// // //             </PresetBtn>
// // //             <Menu
// // //               open={!!this.state.monthAnchorPos}
// // //               onClose={() => this.setState({ monthAnchorPos: null })}
// // //               anchorReference="anchorPosition"
// // //               anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// // //               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
// // //               transformOrigin={{ vertical: "top", horizontal: "left" }}
// // //               PaperProps={{ className: s.menuPaper }}
// // //             >
// // //               {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // //                 <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// // //                   {this.state.selectedYear}년 {m}월
// // //                 </MenuItem>
// // //               ))}
// // //             </Menu>

// // //             {/* 오늘 */}
// // //             <PresetBtn active={isToday} onClick={this.applyToday}>오늘</PresetBtn>

// // //             {/* 직접입력: 좌표 고정 팝오버 */}
// // //             <PresetBtn
// // //               active={!(isToday || isMonth || isYear)}
// // //               onClick={(e) => this.setState({ customAnchorPos: getAnchorPos(e.currentTarget) })}
// // //               endIcon={<ArrowDropDownIcon />}
// // //             >
// // //               직접입력
// // //             </PresetBtn>
// // //             <Popover
// // //               open={!!this.state.customAnchorPos}
// // //               onClose={() => this.setState({ customAnchorPos: null })}
// // //               anchorReference="anchorPosition"
// // //               anchorPosition={this.state.customAnchorPos || { top: 0, left: 0 }}
// // //               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
// // //               transformOrigin={{ vertical: "top", horizontal: "left" }}
// // //               PaperProps={{ className: s.customPaper }}
// // //             >
// // //               <Box className={s.customRow}>
// // //                 <TextField
// // //                   size="small"
// // //                   fullWidth
// // //                   label="시작일"
// // //                   type="date"
// // //                   value={this.state.filters.start_date}
// // //                   onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// // //                   InputLabelProps={{ shrink: true }}
// // //                 />
// // //               </Box>
// // //               <Box className={s.customRow}>
// // //                 <TextField
// // //                   size="small"
// // //                   fullWidth
// // //                   label="종료일"
// // //                   type="date"
// // //                   value={this.state.filters.end_date}
// // //                   onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// // //                   InputLabelProps={{ shrink: true }}
// // //                 />
// // //               </Box>
// // //             </Popover>

// // //             {/* 초기화(올해 전체) */}
// // //             <Button
// // //               size="small"
// // //               variant="outlined"
// // //               startIcon={<ResetIcon />}
// // //               className={s.presetBtn}
// // //               onClick={this.resetToThisYear}
// // //               disabled={busy}
// // //             >
// // //               초기화
// // //             </Button>

// // //             {/* CSV 내보내기 */}
// // //             <Tooltip title="CSV 내보내기">
// // //               <IconButton onClick={this.exportCsv} sx={{ color: "#607d8b" }} disabled={busy}>
// // //                 <DownloadIcon />
// // //               </IconButton>
// // //             </Tooltip>
// // //           </Box>
// // //         </Box>
// // //       </Box>
// // //     );
// // //   };

// // //   /** ---------- cards & charts ---------- */
// // //   KPI = ({ title, value, color, sub }) => (
// // //     <Card className={s.kpiCard} sx={{ flex: 1, height: '100%' }}>
// // //       <CardContent className={s.kpiBody}>
// // //         <Typography className={s.kpiTitle} sx={{ color, fontSize: 13, fontWeight: 800 }}>{title}</Typography>
// // //         <Typography className={s.kpiValue} sx={{ color, fontSize: 28, fontWeight: 900 }}>{value}</Typography>
// // //         <Box className={s.kpiFoot}>
// // //           <Typography className={s.kpiSub} sx={{ fontSize: 12, fontWeight: 500 }}>{sub}</Typography>
// // //         </Box>
// // //       </CardContent>
// // //     </Card>
// // //   );

// // //   renderKpis = () => {
// // //     const { kpis } = this.state;
// // //     const cards = [
// // //       { title: "총 검사건수", value: fmtInt(kpis.total), sub: "필터 조건 내", color: "#1e88e5" },
// // //       { title: "품번 종류", value: fmtInt(kpis.partKinds), sub: "고유 품번 수", color: "#43a047" },
// // //       { title: "검사항목 종류", value: fmtInt(kpis.itemKinds), sub: "고유 항목 수", color: "#8e24aa" },
// // //       { title: "일 평균 검사", value: fmtNum(kpis.dailyAvg, 2), sub: "보고일 기준", color: "#ff7043" },
// // //       { title: "총 생산수량", value: fmtNum(kpis.prodSum, 0), sub: "해당 기간 합계", color: "#00897b" },
// // //       { title: "검사강도(1k 생산당)", value: fmtNum(kpis.intensityPerK, 2), sub: "검사건수 / (생산/1000)", color: "#6d4c41" },
// // //     ];
// // //     return (
// // //       <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // //         {cards.map((c, i) => (
// // //           <Grid item xs={12} sm={6} md={3} lg={2} key={i} sx={{ display: 'flex' }}>
// // //             <this.KPI {...c} />
// // //           </Grid>
// // //         ))}
// // //       </Grid>
// // //     );
// // //   };

// // //   renderDonut = () => {
// // //     const { kpis } = this.state;
// // //     const data = (kpis.byInspType || []).map((d, i) => ({ name: d.type || "미지정", value: d.qty || 0, color: palette[i % palette.length] }));
// // //     const total = data.reduce((s, d) => s + d.value, 0);
// // //     return (
// // //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             <PieChartIcon /> 검사구분 분포
// // //           </Typography>
// // //         </Box>
// // //         <Box sx={{ flex: 1, minHeight: 280, position: "relative" }}>
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <PieChart>
// // //               <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
// // //                 {data.map((d, i) => <Cell key={i} fill={d.color} />)}
// // //               </Pie>
// // //               <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
// // //             </PieChart>
// // //           </ResponsiveContainer>
// // //           <Box className={s.donutCenter}>
// // //             <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
// // //             <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#263238" }}>{fmtInt(total)}</Typography>
// // //           </Box>
// // //         </Box>
// // //         <Box className={s.legendRow}>
// // //           {data.map(d => (
// // //             <span key={d.name} className={s.legendItem}>
// // //               <span className={s.legendDot} style={{ background: d.color }} />
// // //               {d.name}
// // //             </span>
// // //           ))}
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderPareto = () => {
// // //     const { byItem } = this.state;
// // //     const total = byItem.reduce((s, x) => s + (x.qty || 0), 0) || 1;
// // //     let cum = 0;
// // //     const data = byItem.map(d => { cum += d.qty || 0; const rate = Math.min(100, (cum / total) * 100); return { ...d, cumRate: Math.round(rate * 100) / 100 }; });
// // //     return (
// // //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             <BarChartIcon /> 검사항목 파레토
// // //           </Typography>
// // //         </Box>
// // //         <Box sx={{ flex: 1, minHeight: 280 }}>
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <BarChart data={data}>
// // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // //               <XAxis dataKey="item" axisLine={false} tickLine={false} />
// // //               <YAxis yAxisId="left" axisLine={false} tickLine={false} />
// // //               <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
// // //               <Legend />
// // //               <RTooltip formatter={(v, name, { payload }) => {
// // //                 if (name === "수량") return [fmtInt(v), "수량"];
// // //                 if (name === "누적(%)") return [`${(payload.cumRate ?? 0).toFixed(2)}%`, "누적(%)"];
// // //                 return [v, name];
// // //               }}/>
// // //               <Bar yAxisId="left" dataKey="qty" name="수량" radius={[4, 4, 0, 0]}>
// // //                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // //               </Bar>
// // //               <Line yAxisId="right" type="monotone" dataKey="cumRate" name="누적(%)" stroke="#90a4ae" dot={false} />
// // //               <ReferenceLine yAxisId="right" y={80} stroke={mainColor} strokeDasharray="4 4" />
// // //             </BarChart>
// // //           </ResponsiveContainer>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderTrend = () => {
// // //     const { trend, stacked, showStacked, showWeeklyTrend } = this.state;
// // //     const map = new Map();
// // //     trend.forEach(r => map.set(r.date, { ...r }));
// // //     stacked.forEach(r => { const base = map.get(r.date) || { date: r.date, count: 0 }; map.set(r.date, { ...base, auto: r.auto, self: r.self, other: r.other }); });
// // //     const mergedDaily = Array.from(map.values()).sort((a,b) => (a.date > b.date ? 1 : -1));
// // //     const merged = showWeeklyTrend ? aggregateWeekly(mergedDaily, ["count","auto","self","other"]) : mergedDaily;
// // //     return (
// // //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             검사 건수 추이
// // //           </Typography>
// // //           <Box>
// // //             <FormControlLabel
// // //               control={<Switch size="small" checked={showWeeklyTrend} onChange={(e) => this.setState({ showWeeklyTrend: e.target.checked })} />}
// // //               label="주간 합계 보기"
// // //             />
// // //             <FormControlLabel
// // //               control={<Switch size="small" checked={showStacked} onChange={(e) => this.setState({ showStacked: e.target.checked })} />}
// // //               label="검사구분 같이 보기"
// // //             />
// // //           </Box>
// // //         </Box>
// // //         <Box sx={{ height: 320 }}>
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <ComposedChart data={merged} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
// // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // //               <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }} tickFormatter={(v) => this.formatTick(v, showWeeklyTrend)} />
// // //               <YAxis yAxisId="left" />
// // //               <RTooltip />
// // //               <Legend verticalAlign="top" height={32} iconType="circle" iconSize={14}
// // //                       wrapperStyle={{ fontWeight: 700, letterSpacing: ".2px" }}
// // //                       formatter={(value) => <span style={{ fontWeight: 700 }}>{value}</span>} />
// // //               <Area yAxisId="left" type="monotone" dataKey="count" name="검사건수" stroke={mainColor} fill="rgba(30,136,229,.15)" />
// // //               {showStacked && (
// // //                 <>
// // //                   <Bar dataKey="auto" name="자동검사" yAxisId="left" fill="rgba(255,112,67,.55)" barSize={10} />
// // //                   <Bar dataKey="self" name="자주검사" yAxisId="left" fill="rgba(66,165,245,.55)" barSize={10} />
// // //                   <Bar dataKey="other" name="기타" yAxisId="left" fill="rgba(171,71,188,.55)" barSize={10} />
// // //                 </>
// // //               )}
// // //             </ComposedChart>
// // //           </ResponsiveContainer>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderThroughput = () => {
// // //     const { throughput, showWeeklyThroughput } = this.state;
// // //     const thr = showWeeklyThroughput ? aggregateWeekly(throughput, ["prod","count"]) : throughput;
// // //     const thrReady = thr.map(r => ({ ...r, intensity: r.prod > 0 ? +(r.count/(r.prod/1000)).toFixed(3) : 0 }));
// // //     return (
// // //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             생산-검사 스루풋 & 정규화(1k 생산당)
// // //           </Typography>
// // //           <FormControlLabel
// // //             control={<Switch size="small" checked={showWeeklyThroughput} onChange={(e)=>this.setState({ showWeeklyThroughput: e.target.checked })} />}
// // //             label="주간 합계 보기"
// // //           />
// // //         </Box>
// // //         <Box sx={{ height: 320 }}>
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <ComposedChart data={thrReady} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
// // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // //               <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }} tickFormatter={(v) => this.formatTick(v, showWeeklyThroughput)} />
// // //               <YAxis yAxisId="left" />
// // //               <YAxis yAxisId="right" orientation="right" />
// // //               <Legend verticalAlign="top" height={32} />
// // //               <RTooltip formatter={(v, n) => {
// // //                 if (n === "생산합") return [fmtInt(v), "생산합"];
// // //                 if (n === "검사건수") return [fmtInt(v), "검사건수"];
// // //                 if (n === "정규화강도") return [fmtNum(v,3), "정규화강도(1k당)"];
// // //                 return [v, n];
// // //               }}/>
// // //               <Bar  yAxisId="left"  dataKey="prod"       name="생산합"      fill="rgba(76,175,80,.55)"  barSize={12} />
// // //               <Line yAxisId="left"  type="monotone"      dataKey="count"     name="검사건수"    stroke="#1565c0" dot={false} />
// // //               <Line yAxisId="right" type="monotone"      dataKey="intensity"  name="정규화강도"  stroke="#6d4c41" dot={false} />
// // //             </ComposedChart>
// // //           </ResponsiveContainer>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderTopPart = () => {
// // //     const { byPart } = this.state;
// // //     return (
// // //       <Paper className={s.section} sx={{ flex: 1 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             품번 Top {this.state.filters.topN}
// // //           </Typography>
// // //         </Box>
// // //         <Box sx={{ height: 280 }}>
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <BarChart data={byPart} layout="vertical" margin={{ left: 40 }}>
// // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // //               <XAxis type="number" />
// // //               <YAxis type="category" dataKey="partNo" width={160} />
// // //               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
// // //               <Bar dataKey="qty" name="검사건수">
// // //                 {byPart.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // //               </Bar>
// // //             </BarChart>
// // //           </ResponsiveContainer>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderTopProcess = () => {
// // //     const { byProcess } = this.state;
// // //     return (
// // //       <Paper className={s.section} sx={{ flex: 1 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             공정 Top {this.state.filters.topN}
// // //           </Typography>
// // //         </Box>
// // //         <Box sx={{ height: 280 }}>
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <BarChart data={byProcess}>
// // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // //               <XAxis dataKey="proc" />
// // //               <YAxis />
// // //               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
// // //               <Bar dataKey="qty" name="검사건수">
// // //                 {byProcess.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // //               </Bar>
// // //             </BarChart>
// // //           </ResponsiveContainer>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderTopMachine = () => {
// // //     const { machines } = this.state;
// // //     return (
// // //       <Paper className={s.section} sx={{ flex: 1 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             설비 Top {this.state.filters.topN}
// // //           </Typography>
// // //         </Box>
// // //         <Box sx={{ height: 280 }}>
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <BarChart data={machines} layout="vertical" margin={{ left: 40 }}>
// // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // //               <XAxis type="number" />
// // //               <YAxis type="category" dataKey="machine" width={160} />
// // //               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
// // //               <Bar dataKey="qty" name="검사건수">
// // //                 {machines.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // //               </Bar>
// // //             </BarChart>
// // //           </ResponsiveContainer>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderShift = () => {
// // //     const { shift, showWeeklyShift } = this.state;
// // //     const shiftData = showWeeklyShift ? aggregateWeekly(shift, ["day","night"]) : shift;
// // //     const totalDay = shift.reduce((s, r) => s + (r.day || 0), 0);
// // //     const totalNight = shift.reduce((s, r) => s + (r.night || 0), 0);
// // //     const donut = [{ name: "주간", value: totalDay, color: "#42a5f5" }, { name: "야간", value: totalNight, color: "#ab47bc" }];

// // //     return (
// // //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             주/야 구분 추이 & 분포
// // //           </Typography>
// // //           <FormControlLabel
// // //             control={<Switch size="small" checked={showWeeklyShift} onChange={(e)=>this.setState({ showWeeklyShift: e.target.checked })} />}
// // //             label="주간 합계 보기"
// // //           />
// // //         </Box>

// // //         <Grid container spacing={2}>
// // //           <Grid item xs={12} md={8}>
// // //             <Box sx={{ height: 280 }}>
// // //               <ResponsiveContainer width="100%" height="100%">
// // //                 <ComposedChart data={shiftData} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
// // //                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // //                   <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }}
// // //                          tickFormatter={(v) => this.formatTick(v, showWeeklyShift)} />
// // //                   <YAxis />
// // //                   <Legend verticalAlign="top" height={32} />
// // //                   <RTooltip />
// // //                   <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" barSize={10} />
// // //                   <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" barSize={10} />
// // //                 </ComposedChart>
// // //               </ResponsiveContainer>
// // //             </Box>
// // //           </Grid>
// // //           <Grid item xs={12} md={4}>
// // //             <Box sx={{ height: 280, position: "relative" }}>
// // //               <ResponsiveContainer width="100%" height="100%">
// // //                 <PieChart>
// // //                   <Pie data={donut} innerRadius={55} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={2}>
// // //                     {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
// // //                   </Pie>
// // //                   <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
// // //                 </PieChart>
// // //               </ResponsiveContainer>
// // //               <Box className={s.donutCenter}>
// // //                 <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
// // //                 <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#263238" }}>{fmtInt(totalDay + totalNight)}</Typography>
// // //               </Box>
// // //             </Box>
// // //           </Grid>
// // //         </Grid>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderWeekdayProfile = () => {
// // //     const labels = {1:"일",2:"월",3:"화",4:"수",5:"목",6:"금",7:"토"};
// // //     const data = (this.state.weekdayProfile || []).map(r => ({ name: labels[r.dow] || r.dow, day: r.day, night: r.night, total: r.total }));
// // //     return (
// // //       <Paper className={s.section} sx={{ flex:1 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             요일 패턴(주/야)
// // //           </Typography>
// // //         </Box>
// // //         <Box sx={{ height: 280 }}>
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <ComposedChart data={data}>
// // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // //               <XAxis dataKey="name" />
// // //               <YAxis />
// // //               <Legend />
// // //               <RTooltip />
// // //               <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" />
// // //               <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" />
// // //               <Line type="monotone" dataKey="total" name="총계" stroke="#263238" dot={false} />
// // //             </ComposedChart>
// // //           </ResponsiveContainer>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderMachIntensity = () => {
// // //     const data = this.state.machIntensity;
// // //     return (
// // //       <Paper className={s.section} sx={{ flex:1 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             설비별 검사강도(1k 생산당)
// // //           </Typography>
// // //         </Box>
// // //         <Box sx={{ height: 280 }}>
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
// // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // //               <XAxis type="number" />
// // //               <YAxis type="category" dataKey="machine" width={160} />
// // //               <Legend />
// // //               <RTooltip formatter={(v, n) => (n === "검사강도" ? [fmtNum(v,3), "검사강도(1k)"] : [fmtInt(v), n])} />
// // //               <Bar dataKey="intensity" name="검사강도">
// // //                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // //               </Bar>
// // //             </BarChart>
// // //           </ResponsiveContainer>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderMachShiftImbalance = () => {
// // //     const data = this.state.machShiftImbalance;
// // //     return (
// // //       <Paper className={s.section} sx={{ flex:1 }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// // //             설비별 주/야 불균형 Top {this.state.filters.topN}
// // //           </Typography>
// // //         </Box>
// // //         <Box sx={{ height: 280 }}>
// // //           <ResponsiveContainer width="100%" height="100%">
// // //             <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
// // //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// // //               <XAxis type="number" />
// // //               <YAxis type="category" dataKey="machine" width={160} />
// // //               <Legend />
// // //               <RTooltip formatter={(v, n) => {
// // //                 if (n === "불균형") return [`${fmtNum(v*100,1)}%`, "불균형(|주-야|/총)"];
// // //                 if (n === "야/주 비율") return [v, "야/주 비율"];
// // //                 return [fmtInt(v), n];
// // //               }} />
// // //               <Bar dataKey="imbalance" name="불균형">
// // //                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// // //               </Bar>
// // //             </BarChart>
// // //           </ResponsiveContainer>
// // //         </Box>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderAnomalyTable = () => {
// // //     const rows = this.state.anomalyDays || [];
// // //     return (
// // //       <Paper className={s.section} sx={{ flex:1, display:'flex', flexDirection:'column' }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ fontWeight: 800 }}>
// // //             일간 스파이크 알림 (z≥2.0)
// // //           </Typography>
// // //         </Box>
// // //         <TableContainer sx={{
// // //           maxHeight: 340, borderRadius: 1,
// // //           "& .MuiTableCell-head": { position:"sticky", top:0, backgroundColor: mainColor, color:"#fff", zIndex:1, fontWeight:800 },
// // //         }}>
// // //           <Table size="small" stickyHeader>
// // //             <TableHead>
// // //               <TableRow>
// // //                 <TableCell>일자</TableCell>
// // //                 <TableCell align="right">검사건수</TableCell>
// // //                 <TableCell align="right">평균</TableCell>
// // //                 <TableCell align="right">표준편차</TableCell>
// // //                 <TableCell align="right">z-score</TableCell>
// // //               </TableRow>
// // //             </TableHead>
// // //             <TableBody>
// // //               {rows.map((r,i)=>(
// // //                 <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
// // //                   <TableCell>{r.date}</TableCell>
// // //                   <TableCell align="right">{fmtInt(r.count)}</TableCell>
// // //                   <TableCell align="right">{fmtNum(r.avg,2)}</TableCell>
// // //                   <TableCell align="right">{fmtNum(r.std,2)}</TableCell>
// // //                   <TableCell align="right" style={{ fontWeight:900, color:"#d84315" }}>{fmtNum(r.z,2)}</TableCell>
// // //                 </TableRow>
// // //               ))}
// // //               {rows.length===0 && <TableRow><TableCell colSpan={5} align="center">이상치가 없습니다.</TableCell></TableRow>}
// // //             </TableBody>
// // //           </Table>
// // //         </TableContainer>
// // //       </Paper>
// // //     );
// // //   };

// // //   renderDailyTable = () => {
// // //     const map = new Map();
// // //     this.state.trend.forEach(r => map.set(r.date, { date: r.date, count: r.count }));
// // //     this.state.stacked.forEach(r => {
// // //       const row = map.get(r.date) || { date: r.date, count: 0 };
// // //       map.set(r.date, { ...row, auto: r.auto, self: r.self, other: r.other });
// // //     });
// // //     const all = Array.from(map.values()).sort((a,b) => (a.date > b.date ? 1 : -1));
// // //     const rows = all.slice(-7).reverse();

// // //     return (
// // //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// // //         <Box className={s.sectionHeader}>
// // //           <Typography className={s.sectionTitle} sx={{ fontWeight: 800 }}>최근 7일 일자별 요약</Typography>
// // //         </Box>
// // //         <TableContainer
// // //           sx={{
// // //             maxHeight: 380, borderRadius: 1,
// // //             "& .MuiTableCell-head": { position: "sticky", top: 0, backgroundColor: mainColor, color: "#fff", zIndex: 1, fontWeight: 800 },
// // //           }}
// // //         >
// // //           <Table size="small" stickyHeader>
// // //             <TableHead>
// // //               <TableRow>
// // //                 <TableCell>보고일</TableCell>
// // //                 <TableCell align="right">총 검사</TableCell>
// // //                 <TableCell align="right">자동검사</TableCell>
// // //                 <TableCell align="right">자주검사</TableCell>
// // //                 <TableCell align="right">기타</TableCell>
// // //               </TableRow>
// // //             </TableHead>
// // //             <TableBody>
// // //               {rows.map((r, i) => (
// // //                 <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
// // //                   <TableCell>{r.date}</TableCell>
// // //                   <TableCell align="right">{fmtInt(r.count)}</TableCell>
// // //                   <TableCell align="right">{fmtInt(r.auto || 0)}</TableCell>
// // //                   <TableCell align="right">{fmtInt(r.self || 0)}</TableCell>
// // //                   <TableCell align="right">{fmtInt(r.other || 0)}</TableCell>
// // //                 </TableRow>
// // //               ))}
// // //               {rows.length === 0 && (
// // //                 <TableRow><TableCell colSpan={5} align="center">데이터가 없습니다.</TableCell></TableRow>
// // //               )}
// // //             </TableBody>
// // //           </Table>
// // //         </TableContainer>
// // //       </Paper>
// // //     );
// // //   };

// // //   render() {
// // //     return (
// // //       <Box className={s.root}>
// // //         {this.renderTopBar()}
// // //         {this.renderKpis()}

// // //         {/* 1행: 검사구분 도넛 / 파레토 */}
// // //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // //           <Grid item xs={12} md={5} sx={{ display: 'flex', minWidth: 0  }}>{this.renderDonut()}</Grid>
// // //           <Grid item xs={12} md={7} sx={{ display: 'flex', minWidth: 0  }}>{this.renderPareto()}</Grid>
// // //         </Grid>

// // //         {/* 2행: 검사 추이 / 스루풋 */}
// // //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTrend()}</Grid>
// // //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderThroughput()}</Grid>
// // //         </Grid>

// // //         {/* 3행: 품번 / 공정 / 설비 TopN */}
// // //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // //           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopPart()}</Grid>
// // //           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopProcess()}</Grid>
// // //           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopMachine()}</Grid>
// // //         </Grid>

// // //         {/* 4행: 주/야 / 스파이크 */}
// // //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderShift()}</Grid>
// // //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderAnomalyTable()}</Grid>
// // //         </Grid>

// // //         {/* 5행: 요일 / 설비강도 / 설비 불균형 */}
// // //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// // //           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderWeekdayProfile()}</Grid>
// // //           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderMachIntensity()}</Grid>
// // //           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderMachShiftImbalance()}</Grid>
// // //         </Grid>

// // //         {this.renderDailyTable()}
// // //       </Box>
// // //     );
// // //   }
// // // }

// // // export default InspectionSystemChart;

// // import React, { Component } from "react";
// // import {
// //   Box, Paper, Typography, Grid, Card, CardContent,
// //   FormControl, InputLabel, Select, Menu, MenuItem, Table, TableBody, TableCell,
// //   TableContainer, TableHead, TableRow, IconButton, Tooltip,
// //   FormControlLabel, Switch, TextField, Button, Popover
// // } from "@mui/material";
// // import {
// //   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
// //   Tooltip as RTooltip, ResponsiveContainer, Area, Line, ReferenceLine,
// //   ComposedChart, Legend
// // } from "recharts";
// // import {
// //   FileDownload as DownloadIcon,
// //   PieChart as PieChartIcon,
// //   BarChart as BarChartIcon,
// //   RestartAlt as ResetIcon,
// //   ArrowDropDown as ArrowDropDownIcon
// // } from "@mui/icons-material";
// // import s from "./InspectionSystemChart.module.scss";
// // import config from "../../config";

// // /** ---------- helpers ---------- */
// // const palette = [
// //   "#ff7043", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc",
// //   "#26c6da", "#ec407a", "#7e57c2", "#8d6e63", "#26a69a"
// // ];
// // const mainColor = "#1e88e5";

// // const fmtNum = (v, d = null) => {
// //   const n = Number(v) || 0;
// //   return d === null
// //     ? n.toLocaleString()
// //     : n.toLocaleString(undefined, { minimumFractionDigits: d, maximumFractionDigits: d });
// // };
// // const fmtInt = (v) => fmtNum(v, 0);

// // const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
// // const today0 = () => { const t = new Date(); return new Date(t.getFullYear(), t.getMonth(), t.getDate()); };
// // const lastOfMonth  = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // 주차 키
// // const wkKey = (ds) => {
// //   const d = new Date(ds);
// //   if (Number.isNaN(d.getTime())) return ds;
// //   const jan1 = new Date(d.getFullYear(), 0, 1);
// //   const days = Math.floor((d - jan1) / 86400000);
// //   const w = Math.ceil((days + jan1.getDay() + 1) / 7);
// //   return `${d.getFullYear()}-W${String(w).padStart(2, "0")}`;
// // };
// // const aggregateWeekly = (rows, keys) => {
// //   const m = new Map();
// //   rows.forEach(r => {
// //     const k = wkKey(r.date);
// //     const base = m.get(k) || { date: k };
// //     keys.forEach(key => base[key] = (base[key] || 0) + (r[key] || 0));
// //     m.set(k, base);
// //   });
// //   return [...m.values()];
// // };

// // const getDefaultFilters = () => {
// //   const y = new Date().getFullYear();
// //   return {
// //     // 디폴트: 올해 전체
// //     start_date: iso(new Date(y, 0, 1)),
// //     end_date: iso(new Date(y, 11, 31)),
// //     factory: "",
// //     process: "",
// //     partNo: "",
// //     workType: "",
// //     inspType: "",
// //     item: "",
// //     topN: 5,
// //   };
// // };

// // /** 버튼 기준 화면 좌표 계산 → Popover/Menu에 anchorPosition으로 전달 */
// // const getAnchorPos = (el) => {
// //   if (!el) return null;
// //   const r = el.getBoundingClientRect();
// //   return {
// //     top: Math.round(r.bottom + window.scrollY),
// //     left: Math.round(r.left + window.scrollX),
// //   };
// // };

// // /** ---------- Component ---------- */
// // class InspectionSystemChart extends Component {
// //   state = {
// //     filters: getDefaultFilters(),
// //     // data
// //     kpis: { total: 0, partKinds: 0, itemKinds: 0, dailyAvg: 0, prodSum: 0, intensityPerK: 0, byInspType: [], byWorkType: [] },
// //     byItem: [], trend: [], stacked: [], byPart: [], byProcess: [], machines: [],
// //     throughput: [], shift: [], momentum: [],
// //     weekdayProfile: [], machIntensity: [], machShiftImbalance: [], anomalyDays: [],
// //     // options
// //     factories: [], processes: [], parts: [], items: [], optionsLoading: false,
// //     years: [],
// //     // ui
// //     loading: false, error: "", showStacked: true,
// //     showWeeklyTrend: false, showWeeklyThroughput: false, showWeeklyShift: false,
// //     // 프리셋 상태
// //     selectedYear: new Date().getFullYear(),
// //     // 드롭다운 위치(좌표 고정)
// //     yearAnchorPos: null,
// //     monthAnchorPos: null,
// //     customAnchorPos: null,
// //   };

// //   componentDidMount() {
// //     const saved = localStorage.getItem("inspectionFilters");
// //     if (saved) {
// //       try { this.setState({ filters: { ...getDefaultFilters(), ...JSON.parse(saved) } }); } catch {}
// //     }
// //     this.bootstrap();
// //   }

// //   bootstrap = async () => {
// //     await this.loadOptions();
// //     await this.loadYears();
// //     this.loadAll();
// //   };

// //   /** --------- API ---------- */
// //   post = async (path, body) => {
// //     const headers = { "Content-Type": "application/json" };
// //     const res = await fetch(`${config.baseURLApi}/smartFactory/inspection_chart${path}`, {
// //       method: "POST", headers, body: JSON.stringify(body)
// //     });
// //     if (!res.ok) throw new Error(path + " 호출 실패");
// //     const json = await res.json();
// //     return json.data || [];
// //   };

// //   loadOptions = async () => {
// //     const { filters } = this.state;
// //     this.setState({ optionsLoading: true });
// //     try {
// //       const [factories, processes, parts, items] = await Promise.all([
// //         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
// //         this.post("/options/processes", { ...filters }),
// //         this.post("/options/parts",     { ...filters }),
// //         this.post("/options/items",     { ...filters }),
// //       ]);
// //       this.setState({ factories, processes, parts, items, optionsLoading: false });
// //     } catch (e) {
// //       console.error(e);
// //       this.setState({ optionsLoading: false });
// //     }
// //   };

// //   /** 연간 드롭다운용: 서버에서 연도 목록을 받되, 실패 시 fallback(현재년~-4년) */
// //   loadYears = async () => {
// //     try {
// //       const raw = await this.post("/options/years", { ...this.state.filters });
// //       let years = Array.isArray(raw) ? raw.map(y => Number(y)).filter(Boolean) : [];
// //       if (!years.length) throw new Error("no years");
// //       years.sort((a,b) => b - a);
// //       this.setState({ years, selectedYear: years[0] });
// //     } catch {
// //       const y = new Date().getFullYear();
// //       const years = [y, y-1, y-2, y-3, y-4];
// //       this.setState({ years, selectedYear: y });
// //     }
// //   };

// //   /** 공통 필터 변경 */
// //   handleFilterChange = async (field, value) => {
// //     this.setState(prev => {
// //       const f = { ...prev.filters, [field]: value };
// //       if (field === "factory") { f.process = ""; f.partNo = ""; f.item = ""; }
// //       if (field === "process") { f.partNo = ""; f.item = ""; }
// //       if (field === "partNo")  { f.item = ""; }
// //       return { filters: f };
// //     }, async () => {
// //       if (["start_date","end_date","factory","process","partNo","workType","inspType"].includes(field)) {
// //         await this.loadOptions();
// //         if (field === "start_date" || field === "end_date") this.loadAll();
// //       }
// //     });
// //   };

// //   /** 날짜범위 즉시 적용 */
// //   setDateRange = async (start, end) => {
// //     const start_date = iso(start);
// //     const end_date   = iso(end);
// //     this.setState(prev => ({ filters: { ...prev.filters, start_date, end_date } }), async () => {
// //       try { localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters)); } catch {}
// //       await this.loadOptions();
// //       this.loadAll();
// //     });
// //   };

// //   /** 프리셋 액션 */
// //   applyToday = () => {
// //     const t = today0();
// //     this.setDateRange(t, t);
// //   };
// //   selectMonth = (m) => {
// //     const y = this.state.selectedYear;
// //     const s = new Date(y, m - 1, 1);
// //     const e = lastOfMonth(s);
// //     this.setDateRange(s, e);
// //     this.setState({ monthAnchorPos: null });
// //   };
// //   selectYear = (y) => {
// //     const s = new Date(y, 0, 1);
// //     const e = new Date(y, 11, 31);
// //     this.setState({ selectedYear: y }, () => this.setDateRange(s, e));
// //     this.setState({ yearAnchorPos: null });
// //   };

// //   /** 초기화: 올해 전체 + 필터 초기값 */
// //   resetToThisYear = async () => {
// //     const y = new Date().getFullYear();
// //     const filters = { ...getDefaultFilters() };
// //     this.setState({ filters, selectedYear: y }, async () => {
// //       try { localStorage.removeItem("inspectionFilters"); } catch {}
// //       await this.loadOptions();
// //       this.loadAll();
// //     });
// //   };

// //   /** 데이터 로드 (✅ 통합 호출) */
// //   loadAll = async () => {
// //     const { filters } = this.state;
// //     try { localStorage.setItem("inspectionFilters", JSON.stringify(filters)); } catch {}
// //     this.setState({ loading: true, error: "" });
// //     try {
// //       const dashboard = await this.post("/dashboard", filters);
// //       // 통합 응답에서 각 데이터 분해
// //       this.setState({
// //         kpis:                   dashboard.kpis || {},
// //         byItem:                 dashboard.byItem || [],
// //         trend:                  dashboard.trend || [],
// //         stacked:                dashboard.stacked || [],
// //         byPart:                 dashboard.byPart || [],
// //         byProcess:              dashboard.byProcess || [],
// //         machines:               dashboard.machines || [],
// //         throughput:             dashboard.throughput || [],
// //         shift:                  dashboard.shift || [],
// //         momentum:               dashboard.momentum || [],
// //         weekdayProfile:         dashboard.weekdayProfile || [],
// //         machIntensity:          dashboard.machIntensity || [],
// //         machShiftImbalance:     dashboard.machShiftImbalance || [],
// //         anomalyDays:            dashboard.anomalyDays || [],
// //         loading: false
// //       });
// //     } catch (e) {
// //       console.error(e);
// //       this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
// //     }
// //   };

// //   exportCsv = () => {
// //     const { byItem, trend, byPart, byProcess, machines, throughput } = this.state;
// //     const rows = [
// //       ["[Pareto] item", "qty"], ...byItem.map(r => [r.item, r.qty]), [],
// //       ["[Trend] date", "count"], ...trend.map(d => [d.date, d.count]), [],
// //       ["[Top Part] partNo", "qty"], ...byPart.map(d => [d.partNo, d.qty]), [],
// //       ["[Top Process] process", "qty"], ...byProcess.map(d => [d.proc, d.qty]), [],
// //       ["[Top Machine] machine", "qty"], ...machines.map(d => [d.machine, d.qty]), [],
// //       ["[Throughput] date", "prod", "count", "intensity_per_1k"], ...throughput.map(d => [d.date, d.prod, d.count, d.intensity]),
// //     ];
// //     const csv = rows.map(r => r.join(",")).join("\n");
// //     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
// //     const url = URL.createObjectURL(blob);
// //     const a = document.createElement("a");
// //     a.href = url; a.download = `inspection_charts_${Date.now()}.csv`; a.click();
// //     URL.revokeObjectURL(url);
// //   };

// //   /** ----- tick formatter ----- */
// //   formatTick = (v, weekly) => {
// //     const s = String(v || "");
// //     if (weekly) {
// //       const wk = s.split("-W")[1] || s;
// //       return `W${wk}`;
// //     }
// //     return s.length >= 10 ? s.slice(5) : s;
// //   };

// //   /** ---------- top bar ---------- */
// //   renderTopBar = () => {
// //     const { optionsLoading, loading } = this.state;
// //     const busy = optionsLoading || loading;

// //     const renderSelect = (label, field, options, widthClass = "field") => (
// //       <FormControl size="small" className={s[widthClass]}>
// //         <InputLabel id={`${field}-lbl`}>{label}</InputLabel>
// //         <Select
// //           labelId={`${field}-lbl`}
// //           label={label}
// //           value={this.state.filters[field]}
// //           onChange={(e) => this.handleFilterChange(field, e.target.value)}
// //           MenuProps={{ PaperProps: { style: { maxHeight: 360 } } }}
// //         >
// //           <MenuItem value=""><em>전체</em></MenuItem>
// //           {options.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
// //         </Select>
// //       </FormControl>
// //     );

// //     /** 활성 프리셋 표시 */
// //     const { start_date, end_date } = this.state.filters;
// //     const sd = new Date(start_date), ed = new Date(end_date), t = today0();
// //     const isToday = sd.getTime() === t.getTime() && ed.getTime() === t.getTime();
// //     const isYear  = sd.getFullYear() === ed.getFullYear()
// //                  && sd.getMonth() === 0 && sd.getDate() === 1
// //                  && ed.getMonth() === 11 && ed.getDate() === 31;
// //     const isMonth = sd.getFullYear() === ed.getFullYear()
// //                  && sd.getMonth() === ed.getMonth()
// //                  && sd.getDate() === 1
// //                  && ed.getDate() === lastOfMonth(sd).getDate();

// //     const PresetBtn = ({ active, onClick, children, endIcon }) => (
// //       <Button
// //         size="small"
// //         variant={active ? "contained" : "outlined"}
// //         onClick={onClick}
// //         endIcon={endIcon}
// //         className={s.presetBtn}
// //         disabled={busy}
// //       >
// //         {children}
// //       </Button>
// //     );

// //     return (
// //       <Box className={s.topbar}>
// //         <Box className={s.titleWrap}>
// //           <Typography variant="caption" className={s.breadcrumb} sx={{ fontWeight: 700 }}>
// //             검사시스템
// //           </Typography>
// //           <Typography variant="h5" className={s.pageTitle}>
// //             <Box component="span" sx={{ fontWeight: 900 }}>기간별 검사/생산 인사이트</Box>
// //           </Typography>
// //           <Typography variant="body2" className={s.pageDesc} sx={{ fontWeight: 400 }}>
// //             그리드 없이도 바로 보이는 <b>Top5·추이·스파이크·집중/불균형</b>.
// //           </Typography>
// //         </Box>

// //         {/* 필터 */}
// //         <Box className={s.tools}>
// //           {renderSelect("공장",   "factory", this.state.factories)}
// //           {renderSelect("공정",   "process", this.state.processes)}
// //           {renderSelect("품번",   "partNo",  this.state.parts)}
// //           {renderSelect("검사항목","item",   this.state.items)}
// //           <span className={s.rowBreak} />

// //           {/* 기간 직접입력(보조) */}
// //           <TextField
// //             size="small"
// //             className={s.dateField}
// //             label="시작일"
// //             type="date"
// //             value={this.state.filters.start_date}
// //             onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// //             InputLabelProps={{ shrink: true }}
// //           />
// //           <TextField
// //             size="small"
// //             className={s.dateField}
// //             label="종료일"
// //             type="date"
// //             value={this.state.filters.end_date}
// //             onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// //             InputLabelProps={{ shrink: true }}
// //           />

// //           {/* 고정 드롭다운 */}
// //           <FormControl size="small" className={s.field}>
// //             <InputLabel id="inspType">검사구분</InputLabel>
// //             <Select
// //               labelId="inspType"
// //               label="검사구분"
// //               value={this.state.filters.inspType}
// //               onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
// //             >
// //               <MenuItem value=""><em>전체</em></MenuItem>
// //               <MenuItem value="자동검사">자동검사</MenuItem>
// //               <MenuItem value="자주검사">자주검사</MenuItem>
// //             </Select>
// //           </FormControl>

// //           <FormControl size="small" className={s.field}>
// //             <InputLabel id="workType">작업구분</InputLabel>
// //             <Select
// //               labelId="workType"
// //               label="작업구분"
// //               value={this.state.filters.workType}
// //               onChange={(e) => this.handleFilterChange("workType", e.target.value)}
// //             >
// //               <MenuItem value=""><em>전체</em></MenuItem>
// //               <MenuItem value="초품">초품</MenuItem>
// //               <MenuItem value="중품">중품</MenuItem>
// //               <MenuItem value="종품">종품</MenuItem>
// //             </Select>
// //           </FormControl>

// //           {/* <FormControl size="small" className={s.fieldSmall}>
// //             <InputLabel id="topn">Top N</InputLabel>
// //             <Select
// //               labelId="topn"
// //               label="Top N"
// //               value={this.state.filters.topN}
// //               onChange={(e) => this.handleFilterChange("topN", e.target.value)}
// //             >
// //               {[5, 10, 15, 20].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
// //             </Select>
// //           </FormControl> */}

// //           {/* 오른쪽 컨트롤: 연간/월간/오늘/직접입력 + 초기화 + CSV */}
// //           <Box className={s.rightControls}>

// //             {/* 연간: 좌표 고정 메뉴 */}
// //             <PresetBtn
// //               active={isYear}
// //               onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// //               endIcon={<ArrowDropDownIcon />}
// //             >
// //               연간
// //             </PresetBtn>
// //             <Menu
// //               open={!!this.state.yearAnchorPos}
// //               onClose={() => this.setState({ yearAnchorPos: null })}
// //               anchorReference="anchorPosition"
// //               anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// //               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
// //               transformOrigin={{ vertical: "top", horizontal: "left" }}
// //               PaperProps={{ className: s.menuPaper }}
// //             >
// //               {this.state.years.map((y) => (
// //                 <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
// //                   {y}년
// //                 </MenuItem>
// //               ))}
// //             </Menu>

// //             {/* 월간: 선택된 연도 기준 */}
// //             <PresetBtn
// //               active={isMonth}
// //               onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// //               endIcon={<ArrowDropDownIcon />}
// //             >
// //               월간
// //             </PresetBtn>
// //             <Menu
// //               open={!!this.state.monthAnchorPos}
// //               onClose={() => this.setState({ monthAnchorPos: null })}
// //               anchorReference="anchorPosition"
// //               anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// //               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
// //               transformOrigin={{ vertical: "top", horizontal: "left" }}
// //               PaperProps={{ className: s.menuPaper }}
// //             >
// //               {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// //                 <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// //                   {this.state.selectedYear}년 {m}월
// //                 </MenuItem>
// //               ))}
// //             </Menu>

// //             {/* 오늘 */}
// //             <PresetBtn active={isToday} onClick={this.applyToday}>오늘</PresetBtn>

// //             {/* 직접입력: 좌표 고정 팝오버 */}
// //             <PresetBtn
// //               active={!(isToday || isMonth || isYear)}
// //               onClick={(e) => this.setState({ customAnchorPos: getAnchorPos(e.currentTarget) })}
// //               endIcon={<ArrowDropDownIcon />}
// //             >
// //               직접입력
// //             </PresetBtn>
// //             <Popover
// //               open={!!this.state.customAnchorPos}
// //               onClose={() => this.setState({ customAnchorPos: null })}
// //               anchorReference="anchorPosition"
// //               anchorPosition={this.state.customAnchorPos || { top: 0, left: 0 }}
// //               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
// //               transformOrigin={{ vertical: "top", horizontal: "left" }}
// //               PaperProps={{ className: s.customPaper }}
// //             >
// //               <Box className={s.customRow}>
// //                 <TextField
// //                   size="small"
// //                   fullWidth
// //                   label="시작일"
// //                   type="date"
// //                   value={this.state.filters.start_date}
// //                   onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
// //                   InputLabelProps={{ shrink: true }}
// //                 />
// //               </Box>
// //               <Box className={s.customRow}>
// //                 <TextField
// //                   size="small"
// //                   fullWidth
// //                   label="종료일"
// //                   type="date"
// //                   value={this.state.filters.end_date}
// //                   onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
// //                   InputLabelProps={{ shrink: true }}
// //                 />
// //               </Box>
// //             </Popover>

// //             {/* 초기화(올해 전체) */}
// //             <Button
// //               size="small"
// //               variant="outlined"
// //               startIcon={<ResetIcon />}
// //               className={s.presetBtn}
// //               onClick={this.resetToThisYear}
// //               disabled={busy}
// //             >
// //               초기화
// //             </Button>

// //             {/* CSV 내보내기 */}
// //             <Tooltip title="CSV 내보내기">
// //               <IconButton onClick={this.exportCsv} sx={{ color: "#607d8b" }} disabled={busy}>
// //                 <DownloadIcon />
// //               </IconButton>
// //             </Tooltip>
// //           </Box>
// //         </Box>
// //       </Box>
// //     );
// //   };

// //   /** ---------- cards & charts ---------- */
// //   KPI = ({ title, value, color, sub }) => (
// //     <Card className={s.kpiCard} sx={{ flex: 1, height: '100%' }}>
// //       <CardContent className={s.kpiBody}>
// //         <Typography className={s.kpiTitle} sx={{ color, fontSize: 13, fontWeight: 800 }}>{title}</Typography>
// //         <Typography className={s.kpiValue} sx={{ color, fontSize: 28, fontWeight: 900 }}>{value}</Typography>
// //         <Box className={s.kpiFoot}>
// //           <Typography className={s.kpiSub} sx={{ fontSize: 12, fontWeight: 500 }}>{sub}</Typography>
// //         </Box>
// //       </CardContent>
// //     </Card>
// //   );

// //   renderKpis = () => {
// //     const { kpis } = this.state;
// //     const cards = [
// //       { title: "총 검사건수", value: fmtInt(kpis.total), sub: "필터 조건 내", color: "#1e88e5" },
// //       { title: "품번 종류", value: fmtInt(kpis.partKinds), sub: "고유 품번 수", color: "#43a047" },
// //       { title: "검사항목 종류", value: fmtInt(kpis.itemKinds), sub: "고유 항목 수", color: "#8e24aa" },
// //       { title: "일 평균 검사", value: fmtNum(kpis.dailyAvg, 2), sub: "보고일 기준", color: "#ff7043" },
// //       { title: "총 생산수량", value: fmtNum(kpis.prodSum, 0), sub: "해당 기간 합계", color: "#00897b" },
// //       { title: "검사강도(1k 생산당)", value: fmtNum(kpis.intensityPerK, 2), sub: "검사건수 / (생산/1000)", color: "#6d4c41" },
// //     ];
// //     return (
// //       <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// //         {cards.map((c, i) => (
// //           <Grid item xs={12} sm={6} md={3} lg={2} key={i} sx={{ display: 'flex' }}>
// //             <this.KPI {...c} />
// //           </Grid>
// //         ))}
// //       </Grid>
// //     );
// //   };

// //   renderDonut = () => {
// //     const { kpis } = this.state;
// //     const data = (kpis.byInspType || []).map((d, i) => ({ name: d.type || "미지정", value: d.qty || 0, color: palette[i % palette.length] }));
// //     const total = data.reduce((s, d) => s + d.value, 0);
// //     return (
// //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             <PieChartIcon /> 검사구분 분포
// //           </Typography>
// //         </Box>
// //         <Box sx={{ flex: 1, minHeight: 280, position: "relative" }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <PieChart>
// //               <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
// //                 {data.map((d, i) => <Cell key={i} fill={d.color} />)}
// //               </Pie>
// //               <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
// //             </PieChart>
// //           </ResponsiveContainer>
// //           <Box className={s.donutCenter}>
// //             <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
// //             <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#263238" }}>{fmtInt(total)}</Typography>
// //           </Box>
// //         </Box>
// //         <Box className={s.legendRow}>
// //           {data.map(d => (
// //             <span key={d.name} className={s.legendItem}>
// //               <span className={s.legendDot} style={{ background: d.color }} />
// //               {d.name}
// //             </span>
// //           ))}
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderPareto = () => {
// //     const { byItem } = this.state;
// //     const total = byItem.reduce((s, x) => s + (x.qty || 0), 0) || 1;
// //     let cum = 0;
// //     const data = byItem.map(d => { cum += d.qty || 0; const rate = Math.min(100, (cum / total) * 100); return { ...d, cumRate: Math.round(rate * 100) / 100 }; });
// //     return (
// //       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             <BarChartIcon /> 검사항목 파레토
// //           </Typography>
// //         </Box>
// //         <Box sx={{ flex: 1, minHeight: 280 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <BarChart data={data}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis dataKey="item" axisLine={false} tickLine={false} />
// //               <YAxis yAxisId="left" axisLine={false} tickLine={false} />
// //               <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
// //               <Legend />
// //               <RTooltip formatter={(v, name, { payload }) => {
// //                 if (name === "수량") return [fmtInt(v), "수량"];
// //                 if (name === "누적(%)") return [`${(payload.cumRate ?? 0).toFixed(2)}%`, "누적(%)"];
// //                 return [v, name];
// //               }}/>
// //               <Bar yAxisId="left" dataKey="qty" name="수량" radius={[4, 4, 0, 0]}>
// //                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// //               </Bar>
// //               <Line yAxisId="right" type="monotone" dataKey="cumRate" name="누적(%)" stroke="#90a4ae" dot={false} />
// //               <ReferenceLine yAxisId="right" y={80} stroke={mainColor} strokeDasharray="4 4" />
// //             </BarChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderTrend = () => {
// //     const { trend, stacked, showStacked, showWeeklyTrend } = this.state;
// //     const map = new Map();
// //     trend.forEach(r => map.set(r.date, { ...r }));
// //     stacked.forEach(r => { const base = map.get(r.date) || { date: r.date, count: 0 }; map.set(r.date, { ...base, auto: r.auto, self: r.self, other: r.other }); });
// //     const mergedDaily = Array.from(map.values()).sort((a,b) => (a.date > b.date ? 1 : -1));
// //     const merged = showWeeklyTrend ? aggregateWeekly(mergedDaily, ["count","auto","self","other"]) : mergedDaily;
// //     return (
// //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             검사 건수 추이
// //           </Typography>
// //           <Box>
// //             <FormControlLabel
// //               control={<Switch size="small" checked={showWeeklyTrend} onChange={(e) => this.setState({ showWeeklyTrend: e.target.checked })} />}
// //               label="주간 합계 보기"
// //             />
// //             <FormControlLabel
// //               control={<Switch size="small" checked={showStacked} onChange={(e) => this.setState({ showStacked: e.target.checked })} />}
// //               label="검사구분 같이 보기"
// //             />
// //           </Box>
// //         </Box>
// //         <Box sx={{ height: 320 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <ComposedChart data={merged} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }} tickFormatter={(v) => this.formatTick(v, showWeeklyTrend)} />
// //               <YAxis yAxisId="left" />
// //               <RTooltip />
// //               <Legend verticalAlign="top" height={32} iconType="circle" iconSize={14}
// //                       wrapperStyle={{ fontWeight: 700, letterSpacing: ".2px" }}
// //                       formatter={(value) => <span style={{ fontWeight: 700 }}>{value}</span>} />
// //               <Area yAxisId="left" type="monotone" dataKey="count" name="검사건수" stroke={mainColor} fill="rgba(30,136,229,.15)" />
// //               {showStacked && (
// //                 <>
// //                   <Bar dataKey="auto" name="자동검사" yAxisId="left" fill="rgba(255,112,67,.55)" barSize={10} />
// //                   <Bar dataKey="self" name="자주검사" yAxisId="left" fill="rgba(66,165,245,.55)" barSize={10} />
// //                   <Bar dataKey="other" name="기타" yAxisId="left" fill="rgba(171,71,188,.55)" barSize={10} />
// //                 </>
// //               )}
// //             </ComposedChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderThroughput = () => {
// //     const { throughput, showWeeklyThroughput } = this.state;
// //     const thr = showWeeklyThroughput ? aggregateWeekly(throughput, ["prod","count"]) : throughput;
// //     const thrReady = thr.map(r => ({ ...r, intensity: r.prod > 0 ? +(r.count/(r.prod/1000)).toFixed(3) : 0 }));
// //     return (
// //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             생산-검사 스루풋 & 정규화(1k 생산당)
// //           </Typography>
// //           <FormControlLabel
// //             control={<Switch size="small" checked={showWeeklyThroughput} onChange={(e)=>this.setState({ showWeeklyThroughput: e.target.checked })} />}
// //             label="주간 합계 보기"
// //           />
// //         </Box>
// //         <Box sx={{ height: 320 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <ComposedChart data={thrReady} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }} tickFormatter={(v) => this.formatTick(v, showWeeklyThroughput)} />
// //               <YAxis yAxisId="left" />
// //               <YAxis yAxisId="right" orientation="right" />
// //               <Legend verticalAlign="top" height={32} />
// //               <RTooltip formatter={(v, n) => {
// //                 if (n === "생산합") return [fmtInt(v), "생산합"];
// //                 if (n === "검사건수") return [fmtInt(v), "검사건수"];
// //                 if (n === "정규화강도") return [fmtNum(v,3), "정규화강도(1k당)"];
// //                 return [v, n];
// //               }}/>
// //               <Bar  yAxisId="left"  dataKey="prod"       name="생산합"      fill="rgba(76,175,80,.55)"  barSize={12} />
// //               <Line yAxisId="left"  type="monotone"      dataKey="count"     name="검사건수"    stroke="#1565c0" dot={false} />
// //               <Line yAxisId="right" type="monotone"      dataKey="intensity"  name="정규화강도"  stroke="#6d4c41" dot={false} />
// //             </ComposedChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderTopPart = () => {
// //     const { byPart } = this.state;
// //     return (
// //       <Paper className={s.section} sx={{ flex: 1 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             품번 Top {this.state.filters.topN}
// //           </Typography>
// //         </Box>
// //         <Box sx={{ height: 280 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <BarChart data={byPart} layout="vertical" margin={{ left: 40 }}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis type="number" />
// //               <YAxis type="category" dataKey="partNo" width={160} />
// //               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
// //               <Bar dataKey="qty" name="검사건수">
// //                 {byPart.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// //               </Bar>
// //             </BarChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderTopProcess = () => {
// //     const { byProcess } = this.state;
// //     return (
// //       <Paper className={s.section} sx={{ flex: 1 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             공정 Top {this.state.filters.topN}
// //           </Typography>
// //         </Box>
// //         <Box sx={{ height: 280 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <BarChart data={byProcess}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis dataKey="proc" />
// //               <YAxis />
// //               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
// //               <Bar dataKey="qty" name="검사건수">
// //                 {byProcess.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// //               </Bar>
// //             </BarChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderTopMachine = () => {
// //     const { machines } = this.state;
// //     return (
// //       <Paper className={s.section} sx={{ flex: 1 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             설비 Top {this.state.filters.topN}
// //           </Typography>
// //         </Box>
// //         <Box sx={{ height: 280 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <BarChart data={machines} layout="vertical" margin={{ left: 40 }}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis type="number" />
// //               <YAxis type="category" dataKey="machine" width={160} />
// //               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
// //               <Bar dataKey="qty" name="검사건수">
// //                 {machines.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// //               </Bar>
// //             </BarChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderShift = () => {
// //     const { shift, showWeeklyShift } = this.state;
// //     const shiftData = showWeeklyShift ? aggregateWeekly(shift, ["day","night"]) : shift;
// //     const totalDay = shift.reduce((s, r) => s + (r.day || 0), 0);
// //     const totalNight = shift.reduce((s, r) => s + (r.night || 0), 0);
// //     const donut = [{ name: "주간", value: totalDay, color: "#42a5f5" }, { name: "야간", value: totalNight, color: "#ab47bc" }];

// //     return (
// //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             주/야 구분 추이 & 분포
// //           </Typography>
// //           <FormControlLabel
// //             control={<Switch size="small" checked={showWeeklyShift} onChange={(e)=>this.setState({ showWeeklyShift: e.target.checked })} />}
// //             label="주간 합계 보기"
// //           />
// //         </Box>

// //         <Grid container spacing={2}>
// //           <Grid item xs={12} md={8}>
// //             <Box sx={{ height: 280 }}>
// //               <ResponsiveContainer width="100%" height="100%">
// //                 <ComposedChart data={shiftData} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
// //                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //                   <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }}
// //                          tickFormatter={(v) => this.formatTick(v, showWeeklyShift)} />
// //                   <YAxis />
// //                   <Legend verticalAlign="top" height={32} />
// //                   <RTooltip />
// //                   <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" barSize={10} />
// //                   <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" barSize={10} />
// //                 </ComposedChart>
// //               </ResponsiveContainer>
// //             </Box>
// //           </Grid>
// //           <Grid item xs={12} md={4}>
// //             <Box sx={{ height: 280, position: "relative" }}>
// //               <ResponsiveContainer width="100%" height="100%">
// //                 <PieChart>
// //                   <Pie data={donut} innerRadius={55} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={2}>
// //                     {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
// //                   </Pie>
// //                   <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
// //                 </PieChart>
// //               </ResponsiveContainer>
// //               <Box className={s.donutCenter}>
// //                 <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
// //                 <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#263238" }}>{fmtInt(totalDay + totalNight)}</Typography>
// //               </Box>
// //             </Box>
// //           </Grid>
// //         </Grid>
// //       </Paper>
// //     );
// //   };

// //   renderWeekdayProfile = () => {
// //     const labels = {1:"일",2:"월",3:"화",4:"수",5:"목",6:"금",7:"토"};
// //     const data = (this.state.weekdayProfile || []).map(r => ({ name: labels[r.dow] || r.dow, day: r.day, night: r.night, total: r.total }));
// //     return (
// //       <Paper className={s.section} sx={{ flex:1 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             요일 패턴(주/야)
// //           </Typography>
// //         </Box>
// //         <Box sx={{ height: 280 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <ComposedChart data={data}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis dataKey="name" />
// //               <YAxis />
// //               <Legend />
// //               <RTooltip />
// //               <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" />
// //               <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" />
// //               <Line type="monotone" dataKey="total" name="총계" stroke="#263238" dot={false} />
// //             </ComposedChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderMachIntensity = () => {
// //     const data = this.state.machIntensity;
// //     return (
// //       <Paper className={s.section} sx={{ flex:1 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             설비별 검사강도(1k 생산당)
// //           </Typography>
// //         </Box>
// //         <Box sx={{ height: 280 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis type="number" />
// //               <YAxis type="category" dataKey="machine" width={160} />
// //               <Legend />
// //               <RTooltip formatter={(v, n) => (n === "검사강도" ? [fmtNum(v,3), "검사강도(1k)"] : [fmtInt(v), n])} />
// //               <Bar dataKey="intensity" name="검사강도">
// //                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// //               </Bar>
// //             </BarChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderMachShiftImbalance = () => {
// //     const data = this.state.machShiftImbalance;
// //     return (
// //       <Paper className={s.section} sx={{ flex:1 }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
// //             설비별 주/야 불균형 Top {this.state.filters.topN}
// //           </Typography>
// //         </Box>
// //         <Box sx={{ height: 280 }}>
// //           <ResponsiveContainer width="100%" height="100%">
// //             <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
// //               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
// //               <XAxis type="number" />
// //               <YAxis type="category" dataKey="machine" width={160} />
// //               <Legend />
// //               <RTooltip formatter={(v, n) => {
// //                 if (n === "불균형") return [`${fmtNum(v*100,1)}%`, "불균형(|주-야|/총)"];
// //                 if (n === "야/주 비율") return [v, "야/주 비율"];
// //                 return [fmtInt(v), n];
// //               }} />
// //               <Bar dataKey="imbalance" name="불균형">
// //                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
// //               </Bar>
// //             </BarChart>
// //           </ResponsiveContainer>
// //         </Box>
// //       </Paper>
// //     );
// //   };

// //   renderAnomalyTable = () => {
// //     const rows = this.state.anomalyDays || [];
// //     return (
// //       <Paper className={s.section} sx={{ flex:1, display:'flex', flexDirection:'column' }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ fontWeight: 800 }}>
// //             일간 스파이크 알림 (z≥2.0)
// //           </Typography>
// //         </Box>
// //         <TableContainer sx={{
// //           maxHeight: 340, borderRadius: 1,
// //           "& .MuiTableCell-head": { position:"sticky", top:0, backgroundColor: mainColor, color:"#fff", zIndex:1, fontWeight:800 },
// //         }}>
// //           <Table size="small" stickyHeader>
// //             <TableHead>
// //               <TableRow>
// //                 <TableCell>일자</TableCell>
// //                 <TableCell align="right">검사건수</TableCell>
// //                 <TableCell align="right">평균</TableCell>
// //                 <TableCell align="right">표준편차</TableCell>
// //                 <TableCell align="right">z-score</TableCell>
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {rows.map((r,i)=>(
// //                 <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
// //                   <TableCell>{r.date}</TableCell>
// //                   <TableCell align="right">{fmtInt(r.count)}</TableCell>
// //                   <TableCell align="right">{fmtNum(r.avg,2)}</TableCell>
// //                   <TableCell align="right">{fmtNum(r.std,2)}</TableCell>
// //                   <TableCell align="right" style={{ fontWeight:900, color:"#d84315" }}>{fmtNum(r.z,2)}</TableCell>
// //                 </TableRow>
// //               ))}
// //               {rows.length===0 && <TableRow><TableCell colSpan={5} align="center">이상치가 없습니다.</TableCell></TableRow>}
// //             </TableBody>
// //           </Table>
// //         </TableContainer>
// //       </Paper>
// //     );
// //   };

// //   renderDailyTable = () => {
// //     const map = new Map();
// //     this.state.trend.forEach(r => map.set(r.date, { date: r.date, count: r.count }));
// //     this.state.stacked.forEach(r => {
// //       const row = map.get(r.date) || { date: r.date, count: 0 };
// //       map.set(r.date, { ...row, auto: r.auto, self: r.self, other: r.other });
// //     });
// //     const all = Array.from(map.values()).sort((a,b) => (a.date > b.date ? 1 : -1));
// //     const rows = all.slice(-7).reverse();

// //     return (
// //       <Paper className={s.section} sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
// //         <Box className={s.sectionHeader}>
// //           <Typography className={s.sectionTitle} sx={{ fontWeight: 800 }}>최근 7일 일자별 요약</Typography>
// //         </Box>
// //         <TableContainer
// //           sx={{
// //             maxHeight: 380, borderRadius: 1,
// //             "& .MuiTableCell-head": { position: "sticky", top: 0, backgroundColor: mainColor, color: "#fff", zIndex: 1, fontWeight: 800 },
// //           }}
// //         >
// //           <Table size="small" stickyHeader>
// //             <TableHead>
// //               <TableRow>
// //                 <TableCell>보고일</TableCell>
// //                 <TableCell align="right">총 검사</TableCell>
// //                 <TableCell align="right">자동검사</TableCell>
// //                 <TableCell align="right">자주검사</TableCell>
// //                 <TableCell align="right">기타</TableCell>
// //               </TableRow>
// //             </TableHead>
// //             <TableBody>
// //               {rows.map((r, i) => (
// //                 <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
// //                   <TableCell>{r.date}</TableCell>
// //                   <TableCell align="right">{fmtInt(r.count)}</TableCell>
// //                   <TableCell align="right">{fmtInt(r.auto || 0)}</TableCell>
// //                   <TableCell align="right">{fmtInt(r.self || 0)}</TableCell>
// //                   <TableCell align="right">{fmtInt(r.other || 0)}</TableCell>
// //                 </TableRow>
// //               ))}
// //               {rows.length === 0 && (
// //                 <TableRow><TableCell colSpan={5} align="center">데이터가 없습니다.</TableCell></TableRow>
// //               )}
// //             </TableBody>
// //           </Table>
// //         </TableContainer>
// //       </Paper>
// //     );
// //   };

// //   render() {
// //     return (
// //       <Box className={s.root}>
// //         {this.renderTopBar()}
// //         {this.renderKpis()}

// //         {/* 1행: 검사구분 도넛 / 파레토 */}
// //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// //           <Grid item xs={12} md={5} sx={{ display: 'flex', minWidth: 0  }}>{this.renderDonut()}</Grid>
// //           <Grid item xs={12} md={7} sx={{ display: 'flex', minWidth: 0  }}>{this.renderPareto()}</Grid>
// //         </Grid>

// //         {/* 2행: 검사 추이 / 스루풋 */}
// //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTrend()}</Grid>
// //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderThroughput()}</Grid>
// //         </Grid>

// //         {/* 3행: 품번 / 공정 / 설비 TopN */}
// //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// //           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopPart()}</Grid>
// //           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopProcess()}</Grid>
// //           <Grid item xs={12} md={4} sx={{ display: 'flex', minWidth: 0  }}>{this.renderTopMachine()}</Grid>
// //         </Grid>

// //         {/* 4행: 주/야 / 스파이크 */}
// //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderShift()}</Grid>
// //           <Grid item xs={12} md={6} sx={{ display: 'flex', minWidth: 0  }}>{this.renderAnomalyTable()}</Grid>
// //         </Grid>

// //         {/* 5행: 요일 / 설비강도 / 설비 불균형 */}
// //         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
// //           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderWeekdayProfile()}</Grid>
// //           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderMachIntensity()}</Grid>
// //           <Grid item xs={12} md={4} sx={{ display:'flex', minWidth:0 }}>{this.renderMachShiftImbalance()}</Grid>
// //         </Grid>

// //         {this.renderDailyTable()}
// //       </Box>
// //     );
// //   }
// // }

// // export default InspectionSystemChart;

// // 검사 시스템 차트 로딩 오류 해결(구현완료)
// import React, { Component } from "react";
// import {
//   Box, Paper, Typography, Grid, Card, CardContent,
//   FormControl, InputLabel, Select, Menu, MenuItem, Table, TableBody, TableCell,
//   TableContainer, TableHead, TableRow, IconButton, Tooltip,
//   FormControlLabel, Switch, TextField, Button, Popover
// } from "@mui/material";
// import {
//   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip as RTooltip, ResponsiveContainer, Area, Line, ReferenceLine,
//   ComposedChart, Legend
// } from "recharts";
// import {
//   FileDownload as DownloadIcon,
//   PieChart as PieChartIcon,
//   BarChart as BarChartIcon,
//   RestartAlt as ResetIcon,
//   ArrowDropDown as ArrowDropDownIcon
// } from "@mui/icons-material";
// import s from "./InspectionSystemChart.module.scss";
// import config from "../../config";

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

// // 주차 키
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

// const getDefaultFilters = () => {
//   const y = new Date().getFullYear();
//   return {
//     // 디폴트: 올해 전체
//     start_date: iso(new Date(y, 0, 1)),
//     end_date: iso(new Date(y, 11, 31)),
//     factory: "",
//     process: "",
//     partNo: "",
//     workType: "",
//     inspType: "",
//     item: "",
//     topN: 5,
//   };
// };

// /** 버튼 기준 화면 좌표 계산 → Popover/Menu에 anchorPosition으로 전달 */
// const getAnchorPos = (el) => {
//   if (!el) return null;
//   const r = el.getBoundingClientRect();
//   return {
//     top: Math.round(r.bottom + window.scrollY),
//     left: Math.round(r.left + window.scrollX),
//   };
// };

// /** ---------- 주간 계산 helpers ---------- */
// // 월요일 시작 주간
// const startOfWeek = (d) => {
//   const day = d.getDay(); // 0=일,1=월...
//   const diff = (day === 0 ? -6 : 1) - day; // 월요일까지 보정
//   const s = new Date(d);
//   s.setDate(d.getDate() + diff);
//   return new Date(s.getFullYear(), s.getMonth(), s.getDate());
// };
// const endOfWeek = (d) => {
//   const s = startOfWeek(d);
//   return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
// };
// // 선택된 연/월의 주차 배열 [{label, start, end}]
// const getWeeksOfMonth = (year, month) => {
//   const first = new Date(year, month - 1, 1);
//   const last  = lastOfMonth(first);
//   let cur = startOfWeek(first);
//   const out = [];
//   let idx = 1;
//   while (cur <= last) {
//     const s = new Date(cur);
//     const e = endOfWeek(cur);
//     // 월 경계로 clip
//     const clipS = new Date(Math.max(s, first));
//     const clipE = new Date(Math.min(e, last));
//     out.push({
//       label: `${idx}주차`,
//       start: clipS,
//       end: clipE,
//     });
//     idx += 1;
//     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
//   }
//   return out;
// };

// /** ---------- Component ---------- */
// class InspectionSystemChart extends Component {
//   state = {
//     filters: getDefaultFilters(),
//     // data
//     kpis: { total: 0, partKinds: 0, itemKinds: 0, dailyAvg: 0, prodSum: 0, intensityPerK: 0, byInspType: [], byWorkType: [] },
//     byItem: [], trend: [], stacked: [], byPart: [], byProcess: [], machines: [],
//     throughput: [], shift: [], momentum: [],
//     weekdayProfile: [], machIntensity: [], machShiftImbalance: [], anomalyDays: [],
//     // options
//     factories: [], processes: [], parts: [], items: [], optionsLoading: false,
//     years: [],
//     // ui
//     loading: false, error: "", showStacked: true,
//     showWeeklyTrend: false, showWeeklyThroughput: false, showWeeklyShift: false,
//     // 프리셋 상태
//     selectedYear: new Date().getFullYear(),
//     selectedMonth: new Date().getMonth() + 1,   // ✅ 주간 드롭다운 기준 월
//     // 드롭다운 위치(좌표 고정)
//     yearAnchorPos: null,
//     monthAnchorPos: null,
//     weekAnchorPos: null,                         // ✅ 주간 드롭다운 위치
//     customAnchorPos: null,
//   };

//   componentDidMount() {
//     const saved = localStorage.getItem("inspectionFilters");
//     if (saved) {
//       try { this.setState({ filters: { ...getDefaultFilters(), ...JSON.parse(saved) } }); } catch {}
//     }
//     this.bootstrap();
//   }

//   bootstrap = async () => {
//     await this.loadOptions();
//     await this.loadYears();
//     this.loadAll();
//   };

//   /** --------- API ---------- */
//   post = async (path, body) => {
//     const headers = { "Content-Type": "application/json" };
//     const res = await fetch(`${config.baseURLApi}/smartFactory/inspection_chart${path}`, {
//       method: "POST", headers, body: JSON.stringify(body)
//     });
//     if (!res.ok) throw new Error(path + " 호출 실패");
//     const json = await res.json();
//     return json.data || [];
//   };

//   loadOptions = async () => {
//     const { filters } = this.state;
//     this.setState({ optionsLoading: true });
//     try {
//       const [factories, processes, parts, items] = await Promise.all([
//         this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
//         this.post("/options/processes", { ...filters }),
//         this.post("/options/parts",     { ...filters }),
//         this.post("/options/items",     { ...filters }),
//       ]);
//       this.setState({ factories, processes, parts, items, optionsLoading: false });
//     } catch (e) {
//       console.error(e);
//       this.setState({ optionsLoading: false });
//     }
//   };

//   /** 연간 드롭다운용: 서버에서 연도 목록을 받되, 실패 시 fallback(현재년~-4년) */
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

//   /** 공통 필터 변경 */
//   handleFilterChange = async (field, value) => {
//     this.setState(prev => {
//       const f = { ...prev.filters, [field]: value };
//       if (field === "factory") { f.process = ""; f.partNo = ""; f.item = ""; }
//       if (field === "process") { f.partNo = ""; f.item = ""; }
//       if (field === "partNo")  { f.item = ""; }
//       return { filters: f };
//     }, async () => {
//       // 옵션은 항상 갱신(선택에 따라 다음 셀렉트 옵션이 바뀌므로)
//       await this.loadOptions();

//       // ✅ 어떤 항목이든 바뀌면 즉시 대시보드 재조회
//       await this.loadAll();

//       // if (["start_date","end_date","factory","process","partNo","workType","inspType"].includes(field)) {
//       //   await this.loadOptions();
//       //   if (field === "start_date" || field === "end_date") this.loadAll();
//       // }
//     });
//   };

//   /** 날짜범위 즉시 적용 */
//   setDateRange = async (start, end) => {
//     const start_date = iso(start);
//     const end_date   = iso(end);
//     this.setState(prev => ({ filters: { ...prev.filters, start_date, end_date } }), async () => {
//       try { localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters)); } catch {}
//       await this.loadOptions();
//       this.loadAll();
//     });
//   };

//   /** 프리셋 액션 */
//   applyToday = () => {
//     const t = today0();
//     this.setDateRange(t, t);
//   };
//   selectMonth = (m) => {
//     const y = this.state.selectedYear;
//     const s = new Date(y, m - 1, 1);
//     const e = lastOfMonth(s);
//     this.setDateRange(s, e);
//     this.setState({ monthAnchorPos: null, selectedMonth: m }); // ✅ 월 선택 시 저장
//   };
//   selectYear = (y) => {
//     const s = new Date(y, 0, 1);
//     const e = new Date(y, 11, 31);
//     this.setState({ selectedYear: y }, () => this.setDateRange(s, e));
//     this.setState({ yearAnchorPos: null });
//   };
//   /** 주간 선택 */
//   selectWeek = (w) => {
//     this.setDateRange(w.start, w.end);
//     this.setState({ weekAnchorPos: null });
//   };

//   /** 초기화: 올해 전체 + 필터 초기값 */
//   resetToThisYear = async () => {
//     const y = new Date().getFullYear();
//     const filters = { ...getDefaultFilters() };
//     this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth()+1 }, async () => {
//       try { localStorage.removeItem("inspectionFilters"); } catch {}
//       await this.loadOptions();
//       this.loadAll();
//     });
//   };

//   /** 데이터 로드 (✅ 통합 호출) */
//   loadAll = async () => {
//     const { filters } = this.state;
//     try { localStorage.setItem("inspectionFilters", JSON.stringify(filters)); } catch {}
//     this.setState({ loading: true, error: "" });
//     try {
//       const dashboard = await this.post("/dashboard", filters);
//       // 통합 응답에서 각 데이터 분해
//       this.setState({
//         kpis:                   dashboard.kpis || {},
//         byItem:                 dashboard.byItem || [],
//         trend:                  dashboard.trend || [],
//         stacked:                dashboard.stacked || [],
//         byPart:                 dashboard.byPart || [],
//         byProcess:              dashboard.byProcess || [],
//         machines:               dashboard.machines || [],
//         throughput:             dashboard.throughput || [],
//         shift:                  dashboard.shift || [],
//         momentum:               dashboard.momentum || [],
//         weekdayProfile:         dashboard.weekdayProfile || [],
//         machIntensity:          dashboard.machIntensity || [],
//         machShiftImbalance:     dashboard.machShiftImbalance || [],
//         anomalyDays:            dashboard.anomalyDays || [],
//         loading: false
//       });
//     } catch (e) {
//       console.error(e);
//       this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
//     }
//   };

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

//   /** ----- tick formatter ----- */
//   formatTick = (v, weekly) => {
//     const s = String(v || "");
//     if (weekly) {
//       const wk = s.split("-W")[1] || s;
//       return `W${wk}`;
//     }
//     return s.length >= 10 ? s.slice(5) : s;
//   };

//   /** ---------- top bar ---------- */
//   renderTopBar = () => {
//     const now = today0();
//     const thisYear  = now.getFullYear();
//     const thisMonth = now.getMonth() + 1;
//     const thisWeek  = { start: startOfWeek(now), end: endOfWeek(now) };
//     const { optionsLoading, loading } = this.state;
//     const busy = optionsLoading || loading;

//     const renderSelect = (label, field, options, widthClass = "field") => (
//       <FormControl size="small" className={s[widthClass]}>
//         <InputLabel id={`${field}-lbl`}>{label}</InputLabel>
//         <Select
//           labelId={`${field}-lbl`}
//           label={label}
//           value={this.state.filters[field]}
//           onChange={(e) => this.handleFilterChange(field, e.target.value)}
//           MenuProps={{ PaperProps: { style: { maxHeight: 360 } } }}
//         >
//           <MenuItem value=""><em>전체</em></MenuItem>
//           {options.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
//         </Select>
//       </FormControl>
//     );

//     /** 활성 프리셋 표시 */
//     const { start_date, end_date } = this.state.filters;
//     const sd = new Date(start_date), ed = new Date(end_date), t = today0();
//     const isToday = sd.getTime() === t.getTime() && ed.getTime() === t.getTime();
//     const isYear  = sd.getFullYear() === ed.getFullYear()
//                  && sd.getMonth() === 0 && sd.getDate() === 1
//                  && ed.getMonth() === 11 && ed.getDate() === 31;
//     const isMonth = sd.getFullYear() === ed.getFullYear()
//                  && sd.getMonth() === ed.getMonth()
//                  && sd.getDate() === 1
//                  && ed.getDate() === lastOfMonth(sd).getDate();

//     const PresetBtn = ({ active, onClick, children, endIcon }) => (
//       <Button
//         size="small"
//         variant={active ? "contained" : "outlined"}
//         onClick={onClick}
//         endIcon={endIcon}
//         className={s.presetBtn}
//         disabled={busy}
//       >
//         {children}
//       </Button>
//     );

//     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

//     return (
//       <Box className={s.topbar}>
//         <Box className={s.titleWrap}>
//           <Typography variant="caption" className={s.breadcrumb} sx={{ fontWeight: 700 }}>
//             검사시스템
//           </Typography>
//           <Typography variant="h5" className={s.pageTitle}>
//             <Box component="span" sx={{ fontWeight: 900 }}>기간별 검사/생산 인사이트</Box>
//           </Typography>
//           <Typography variant="body2" className={s.pageDesc} sx={{ fontWeight: 400 }}>
//             그리드 없이도 바로 보이는 <b>Top5·추이·스파이크·집중/불균형</b>.
//           </Typography>
//         </Box>

//         {/* 필터 */}
//         <Box className={s.tools}>
//           {renderSelect("공장",   "factory", this.state.factories)}
//           {renderSelect("공정",   "process", this.state.processes)}
//           {renderSelect("품번",   "partNo",  this.state.parts)}
//           {renderSelect("검사항목","item",   this.state.items)}
//           <span className={s.rowBreak} />

//           {/* 기간 직접입력(보조) */}
//           <TextField
//             size="small"
//             className={s.dateField}
//             label="시작일"
//             type="date"
//             value={this.state.filters.start_date}
//             onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
//             InputLabelProps={{ shrink: true }}
//           />
//           <TextField
//             size="small"
//             className={s.dateField}
//             label="종료일"
//             type="date"
//             value={this.state.filters.end_date}
//             onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
//             InputLabelProps={{ shrink: true }}
//           />

//           {/* 고정 드롭다운 */}
//           <FormControl size="small" className={s.field}>
//             <InputLabel id="inspType">검사구분</InputLabel>
//             <Select
//               labelId="inspType"
//               label="검사구분"
//               value={this.state.filters.inspType}
//               onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
//             >
//               <MenuItem value=""><em>전체</em></MenuItem>
//               <MenuItem value="자동검사">자동검사</MenuItem>
//               <MenuItem value="자주검사">자주검사</MenuItem>
//             </Select>
//           </FormControl>

//           <FormControl size="small" className={s.field}>
//             <InputLabel id="workType">작업구분</InputLabel>
//             <Select
//               labelId="workType"
//               label="작업구분"
//               value={this.state.filters.workType}
//               onChange={(e) => this.handleFilterChange("workType", e.target.value)}
//             >
//               <MenuItem value=""><em>전체</em></MenuItem>
//               <MenuItem value="초품">초품</MenuItem>
//               <MenuItem value="중품">중품</MenuItem>
//               <MenuItem value="종품">종품</MenuItem>
//             </Select>
//           </FormControl>

//           {/* 오른쪽 컨트롤: 연간/월간/주간/오늘/직접입력 + 초기화 + CSV */}
//           <Box className={s.rightControls}>

//             {/* 연간: 좌표 고정 메뉴 */}
//             <PresetBtn
//               active={isYear}
//               onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
//               endIcon={<ArrowDropDownIcon />}
//             >
//               연간
//             </PresetBtn>
//             <Menu
//               open={!!this.state.yearAnchorPos}
//               onClose={() => this.setState({ yearAnchorPos: null })}
//               anchorReference="anchorPosition"
//               anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
//               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//               transformOrigin={{ vertical: "top", horizontal: "left" }}
//               PaperProps={{ className: s.menuPaper }}
//             >
//               {/* ✅ 올해 */}
//               <MenuItem dense onClick={() => this.selectYear(thisYear)}>
//                 올해
//               </MenuItem>
//               {/* 나머지 연도들 */}
//               {this.state.years.map((y) => (
//                 <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
//                   {y}년
//                 </MenuItem>
//               ))}
//             </Menu>

//             {/* 월간: 선택된 연도 기준 */}
//             <PresetBtn
//               active={isMonth}
//               onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
//               endIcon={<ArrowDropDownIcon />}
//             >
//               월간
//             </PresetBtn>
//             <Menu
//               open={!!this.state.monthAnchorPos}
//               onClose={() => this.setState({ monthAnchorPos: null })}
//               anchorReference="anchorPosition"
//               anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
//               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//               transformOrigin={{ vertical: "top", horizontal: "left" }}
//               PaperProps={{ className: s.menuPaper }}
//             >
//               {/* ✅ 이번달 */}
//               <MenuItem
//                 dense
//                 onClick={() => {
//                   this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth));
//                 }}
//               >
//                 이번달
//               </MenuItem>

//               {/* 선택된 연도 기준 월 목록 */}
//               {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
//                 <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
//                   {this.state.selectedYear}년 {m}월
//                 </MenuItem>
//               ))}
//             </Menu>


//             {/* ✅ 주간: 현재 선택된 연/월 기준 주차 */}
//             <PresetBtn
//               active={false}
//               onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
//               endIcon={<ArrowDropDownIcon />}>
//               주간
//             </PresetBtn>
//             <Menu
//               open={!!this.state.weekAnchorPos}
//               onClose={() => this.setState({ weekAnchorPos: null })}
//               anchorReference="anchorPosition"
//               anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
//               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//               transformOrigin={{ vertical: "top", horizontal: "left" }}
//               PaperProps={{ className: s.menuPaper }}
//             >
//               {/* ✅ 이번주 */}
//               <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
//                 이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
//               </MenuItem>

//               {/* 선택된 연/월 기준 주차 목록 */}
//               {weeks.map((w, i) => (
//                 <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
//                   {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label}
//                   &nbsp;({iso(w.start)}~{iso(w.end)})
//                 </MenuItem>
//               ))}
//             </Menu>


//             {/* 오늘 */}
//             <PresetBtn active={isToday} onClick={this.applyToday}>오늘</PresetBtn>

//             {/* 직접입력: 좌표 고정 팝오버 */}
//             <PresetBtn
//               active={!(isToday || isMonth || isYear)}
//               onClick={(e) => this.setState({ customAnchorPos: getAnchorPos(e.currentTarget) })}
//               endIcon={<ArrowDropDownIcon />}
//             >
//               직접입력
//             </PresetBtn>
//             <Popover
//               open={!!this.state.customAnchorPos}
//               onClose={() => this.setState({ customAnchorPos: null })}
//               anchorReference="anchorPosition"
//               anchorPosition={this.state.customAnchorPos || { top: 0, left: 0 }}
//               anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
//               transformOrigin={{ vertical: "top", horizontal: "left" }}
//               PaperProps={{ className: s.customPaper }}
//             >
//               <Box className={s.customRow}>
//                 <TextField
//                   size="small"
//                   fullWidth
//                   label="시작일"
//                   type="date"
//                   value={this.state.filters.start_date}
//                   onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
//                   InputLabelProps={{ shrink: true }}
//                 />
//               </Box>
//               <Box className={s.customRow}>
//                 <TextField
//                   size="small"
//                   fullWidth
//                   label="종료일"
//                   type="date"
//                   value={this.state.filters.end_date}
//                   onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
//                   InputLabelProps={{ shrink: true }}
//                 />
//               </Box>
//             </Popover>

//             {/* 초기화(올해 전체) */}
//             <Button
//               size="small"
//               variant="outlined"
//               startIcon={<ResetIcon />}
//               className={s.presetBtn}
//               onClick={this.resetToThisYear}
//               disabled={busy}
//             >
//               초기화
//             </Button>

//             {/* CSV 내보내기 */}
//             <Tooltip title="CSV 내보내기">
//               <IconButton onClick={this.exportCsv} sx={{ color: "#607d8b" }} disabled={busy}>
//                 <DownloadIcon />
//               </IconButton>
//             </Tooltip>
//           </Box>
//         </Box>
//       </Box>
//     );
//   };

//   /** ---------- cards & charts ---------- */
//   KPI = ({ title, value, color, sub }) => (
//     <Card className={s.kpiCard} sx={{ flex: 1, height: '100%' }}>
//       <CardContent className={s.kpiBody}>
//         <Typography className={s.kpiTitle} sx={{ color, fontSize: 13, fontWeight: 800 }}>{title}</Typography>
//         <Typography className={s.kpiValue} sx={{ color, fontSize: 28, fontWeight: 900 }}>{value}</Typography>
//         <Box className={s.kpiFoot}>
//           <Typography className={s.kpiSub} sx={{ fontSize: 12, fontWeight: 500 }}>{sub}</Typography>
//         </Box>
//       </CardContent>
//     </Card>
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
//     const { kpis } = this.state;
//     const data = (kpis.byInspType || []).map((d, i) => ({ name: d.type || "미지정", value: d.qty || 0, color: palette[i % palette.length] }));
//     const total = data.reduce((s, d) => s + d.value, 0);
//     return (
//       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             <PieChartIcon /> 검사구분 분포
//           </Typography>
//         </Box>
//         <Box sx={{ flex: 1, minHeight: 280, position: "relative" }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <PieChart>
//               <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
//                 {data.map((d, i) => <Cell key={i} fill={d.color} />)}
//               </Pie>
//               <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
//             </PieChart>
//           </ResponsiveContainer>
//           <Box className={s.donutCenter}>
//             <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
//             <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#263238" }}>{fmtInt(total)}</Typography>
//           </Box>
//         </Box>
//         <Box className={s.legendRow}>
//           {data.map(d => (
//             <span key={d.name} className={s.legendItem}>
//               <span className={s.legendDot} style={{ background: d.color }} />
//               {d.name}
//             </span>
//           ))}
//         </Box>
//       </Paper>
//     );
//   };

//   renderPareto = () => {
//     const { byItem } = this.state;
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
//         <Box sx={{ flex: 1, minHeight: 280 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="item" axisLine={false} tickLine={false} />
//               <YAxis yAxisId="left" axisLine={false} tickLine={false} />
//               <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
//               <Legend />
//               <RTooltip formatter={(v, name, { payload }) => {
//                 if (name === "수량") return [fmtInt(v), "수량"];
//                 if (name === "누적(%)") return [`${(payload.cumRate ?? 0).toFixed(2)}%`, "누적(%)"];
//                 return [v, name];
//               }}/>
//               <Bar yAxisId="left" dataKey="qty" name="수량" radius={[4, 4, 0, 0]}>
//                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//               </Bar>
//               <Line yAxisId="right" type="monotone" dataKey="cumRate" name="누적(%)" stroke="#90a4ae" dot={false} />
//               <ReferenceLine yAxisId="right" y={80} stroke={mainColor} strokeDasharray="4 4" />
//             </BarChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>
//     );
//   };

//   renderTrend = () => {
//     const { trend, stacked, showStacked, showWeeklyTrend } = this.state;
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
//         <Box sx={{ height: 320 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <ComposedChart data={merged} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }} tickFormatter={(v) => this.formatTick(v, showWeeklyTrend)} />
//               <YAxis yAxisId="left" />
//               <RTooltip />
//               <Legend verticalAlign="top" height={32} iconType="circle" iconSize={14}
//                       wrapperStyle={{ fontWeight: 700, letterSpacing: ".2px" }}
//                       formatter={(value) => <span style={{ fontWeight: 700 }}>{value}</span>} />
//               <Area yAxisId="left" type="monotone" dataKey="count" name="검사건수" stroke={mainColor} fill="rgba(30,136,229,.15)" />
//               {showStacked && (
//                 <>
//                   <Bar dataKey="auto" name="자동검사" yAxisId="left" fill="rgba(255,112,67,.55)" barSize={10} />
//                   <Bar dataKey="self" name="자주검사" yAxisId="left" fill="rgba(66,165,245,.55)" barSize={10} />
//                   <Bar dataKey="other" name="기타" yAxisId="left" fill="rgba(171,71,188,.55)" barSize={10} />
//                 </>
//               )}
//             </ComposedChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>
//     );
//   };

//   renderThroughput = () => {
//     const { throughput, showWeeklyThroughput } = this.state;
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
//         <Box sx={{ height: 320 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <ComposedChart data={thrReady} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }} tickFormatter={(v) => this.formatTick(v, showWeeklyThroughput)} />
//               <YAxis yAxisId="left" />
//               <YAxis yAxisId="right" orientation="right" />
//               <Legend verticalAlign="top" height={32} />
//               <RTooltip formatter={(v, n) => {
//                 if (n === "생산합") return [fmtInt(v), "생산합"];
//                 if (n === "검사건수") return [fmtInt(v), "검사건수"];
//                 if (n === "정규화강도") return [fmtNum(v,3), "정규화강도(1k당)"];
//                 return [v, n];
//               }}/>
//               <Bar  yAxisId="left"  dataKey="prod"       name="생산합"      fill="rgba(76,175,80,.55)"  barSize={12} />
//               <Line yAxisId="left"  type="monotone"      dataKey="count"     name="검사건수"    stroke="#1565c0" dot={false} />
//               <Line yAxisId="right" type="monotone"      dataKey="intensity"  name="정규화강도"  stroke="#6d4c41" dot={false} />
//             </ComposedChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>
//     );
//   };

//   renderTopPart = () => {
//     const { byPart } = this.state;
//     return (
//       <Paper className={s.section} sx={{ flex: 1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             품번 Top {this.state.filters.topN}
//           </Typography>
//         </Box>
//         <Box sx={{ height: 280 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={byPart} layout="vertical" margin={{ left: 40 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis type="number" />
//               <YAxis type="category" dataKey="partNo" width={160} />
//               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
//               <Bar dataKey="qty" name="검사건수">
//                 {byPart.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>
//     );
//   };

//   renderTopProcess = () => {
//     const { byProcess } = this.state;
//     return (
//       <Paper className={s.section} sx={{ flex: 1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             공정 Top {this.state.filters.topN}
//           </Typography>
//         </Box>
//         <Box sx={{ height: 280 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={byProcess}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="proc" />
//               <YAxis />
//               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
//               <Bar dataKey="qty" name="검사건수">
//                 {byProcess.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>
//     );
//   };

//   renderTopMachine = () => {
//     const { machines } = this.state;
//     return (
//       <Paper className={s.section} sx={{ flex: 1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             설비 Top {this.state.filters.topN}
//           </Typography>
//         </Box>
//         <Box sx={{ height: 280 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={machines} layout="vertical" margin={{ left: 40 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis type="number" />
//               <YAxis type="category" dataKey="machine" width={160} />
//               <RTooltip formatter={(v) => [fmtInt(v), "검사건수"]} />
//               <Bar dataKey="qty" name="검사건수">
//                 {machines.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>
//     );
//   };

//   renderShift = () => {
//     const { shift, showWeeklyShift } = this.state;
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

//         <Grid container spacing={2}>
//           <Grid item xs={12} md={8}>
//             <Box sx={{ height: 280 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <ComposedChart data={shiftData} margin={{ top: 48, right: 16, left: 0, bottom: 32 }}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//                   <XAxis dataKey="date" interval="preserveStartEnd" minTickGap={28} tickMargin={10} tick={{ fontSize: 11 }}
//                          tickFormatter={(v) => this.formatTick(v, showWeeklyShift)} />
//                   <YAxis />
//                   <Legend verticalAlign="top" height={32} />
//                   <RTooltip />
//                   <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" barSize={10} />
//                   <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" barSize={10} />
//                 </ComposedChart>
//               </ResponsiveContainer>
//             </Box>
//           </Grid>
//           <Grid item xs={12} md={4}>
//             <Box sx={{ height: 280, position: "relative" }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <PieChart>
//                   <Pie data={donut} innerRadius={55} outerRadius={80} dataKey="value" nameKey="name" paddingAngle={2}>
//                     {donut.map((d, i) => <Cell key={i} fill={d.color} />)}
//                   </Pie>
//                   <RTooltip formatter={(v, n) => [`${fmtInt(v)}건`, n]} />
//                 </PieChart>
//               </ResponsiveContainer>
//               <Box className={s.donutCenter}>
//                 <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 검사</Typography>
//                 <Typography sx={{ fontSize: 20, fontWeight: 800, color: "#263238" }}>{fmtInt(totalDay + totalNight)}</Typography>
//               </Box>
//             </Box>
//           </Grid>
//         </Grid>
//       </Paper>
//     );
//   };

//   renderWeekdayProfile = () => {
//     const labels = {1:"일",2:"월",3:"화",4:"수",5:"목",6:"금",7:"토"};
//     const data = (this.state.weekdayProfile || []).map(r => ({ name: labels[r.dow] || r.dow, day: r.day, night: r.night, total: r.total }));
//     return (
//       <Paper className={s.section} sx={{ flex:1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             요일 패턴(주/야)
//           </Typography>
//         </Box>
//         <Box sx={{ height: 280 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <ComposedChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="name" />
//               <YAxis />
//               <Legend />
//               <RTooltip />
//               <Bar dataKey="day" name="주간" fill="rgba(66,165,245,.65)" />
//               <Bar dataKey="night" name="야간" fill="rgba(171,71,188,.65)" />
//               <Line type="monotone" dataKey="total" name="총계" stroke="#263238" dot={false} />
//             </ComposedChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>
//     );
//   };

//   renderMachIntensity = () => {
//     const data = this.state.machIntensity;
//     return (
//       <Paper className={s.section} sx={{ flex:1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             설비별 검사강도(1k 생산당)
//           </Typography>
//         </Box>
//         <Box sx={{ height: 280 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis type="number" />
//               <YAxis type="category" dataKey="machine" width={160} />
//               <Legend />
//               <RTooltip formatter={(v, n) => (n === "검사강도" ? [fmtNum(v,3), "검사강도(1k)"] : [fmtInt(v), n])} />
//               <Bar dataKey="intensity" name="검사강도">
//                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>
//     );
//   };

//   renderMachShiftImbalance = () => {
//     const data = this.state.machShiftImbalance;
//     return (
//       <Paper className={s.section} sx={{ flex:1 }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
//             설비별 주/야 불균형 Top {this.state.filters.topN}
//           </Typography>
//         </Box>
//         <Box sx={{ height: 280 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={data} layout="vertical" margin={{ left: 60 }}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis type="number" />
//               <YAxis type="category" dataKey="machine" width={160} />
//               <Legend />
//               <RTooltip formatter={(v, n) => {
//                 if (n === "불균형") return [`${fmtNum(v*100,1)}%`, "불균형(|주-야|/총)"];
//                 if (n === "야/주 비율") return [v, "야/주 비율"];
//                 return [fmtInt(v), n];
//               }} />
//               <Bar dataKey="imbalance" name="불균형">
//                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//               </Bar>
//             </BarChart>
//           </ResponsiveContainer>
//         </Box>
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
//         <TableContainer sx={{
//           maxHeight: 340, borderRadius: 1,
//           "& .MuiTableCell-head": { position:"sticky", top:0, backgroundColor: mainColor, color:"#fff", zIndex:1, fontWeight:800 },
//         }}>
//           <Table size="small" stickyHeader>
//             <TableHead>
//               <TableRow>
//                 <TableCell>일자</TableCell>
//                 <TableCell align="right">검사건수</TableCell>
//                 <TableCell align="right">평균</TableCell>
//                 <TableCell align="right">표준편차</TableCell>
//                 <TableCell align="right">z-score</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {rows.map((r,i)=>(
//                 <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
//                   <TableCell>{r.date}</TableCell>
//                   <TableCell align="right">{fmtInt(r.count)}</TableCell>
//                   <TableCell align="right">{fmtNum(r.avg,2)}</TableCell>
//                   <TableCell align="right">{fmtNum(r.std,2)}</TableCell>
//                   <TableCell align="right" style={{ fontWeight:900, color:"#d84315" }}>{fmtNum(r.z,2)}</TableCell>
//                 </TableRow>
//               ))}
//               {rows.length===0 && <TableRow><TableCell colSpan={5} align="center">이상치가 없습니다.</TableCell></TableRow>}
//             </TableBody>
//           </Table>
//         </TableContainer>
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
//         <TableContainer
//           sx={{
//             maxHeight: 380, borderRadius: 1,
//             "& .MuiTableCell-head": { position: "sticky", top: 0, backgroundColor: mainColor, color: "#fff", zIndex: 1, fontWeight: 800 },
//           }}
//         >
//           <Table size="small" stickyHeader>
//             <TableHead>
//               <TableRow>
//                 <TableCell>보고일</TableCell>
//                 <TableCell align="right">총 검사</TableCell>
//                 <TableCell align="right">자동검사</TableCell>
//                 <TableCell align="right">자주검사</TableCell>
//                 <TableCell align="right">기타</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {rows.map((r, i) => (
//                 <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
//                   <TableCell>{r.date}</TableCell>
//                   <TableCell align="right">{fmtInt(r.count)}</TableCell>
//                   <TableCell align="right">{fmtInt(r.auto || 0)}</TableCell>
//                   <TableCell align="right">{fmtInt(r.self || 0)}</TableCell>
//                   <TableCell align="right">{fmtInt(r.other || 0)}</TableCell>
//                 </TableRow>
//               ))}
//               {rows.length === 0 && (
//                 <TableRow><TableCell colSpan={5} align="center">데이터가 없습니다.</TableCell></TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>
//     );
//   };

//   render() {
//     return (
//       <Box className={s.root}>
//         {this.renderTopBar()}
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

//         {this.renderDailyTable()}
//       </Box>
//     );
//   }
// }

// export default InspectionSystemChart;

// ----------------------------------------------------------------------------------------------------------

// [차트별 로딩 구현 완료]
import React, { Component } from "react";
import {
  Box, Paper, Typography, Grid, Card, CardContent,
  FormControl, InputLabel, Select, Menu, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip,
  FormControlLabel, Switch, TextField, Button, Popover,
  CircularProgress,                             // ✅ 추가
} from "@mui/material";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Area, Line, ReferenceLine,
  ComposedChart, Legend
} from "recharts";
import {
  FileDownload as DownloadIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  RestartAlt as ResetIcon,
  ArrowDropDown as ArrowDropDownIcon
} from "@mui/icons-material";
import s from "./InspectionSystemChart.module.scss";
import config from "../../config";

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

// 주차 키
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

const getDefaultFilters = () => {
  const y = new Date().getFullYear();
  return {
    // 디폴트: 올해 전체
    start_date: iso(new Date(y, 0, 1)),
    end_date: iso(new Date(y, 11, 31)),
    factory: "",
    process: "",
    partNo: "",
    workType: "",
    inspType: "",
    item: "",
    topN: 5,
  };
};

/** 버튼 기준 화면 좌표 계산 → Popover/Menu에 anchorPosition으로 전달 */
const getAnchorPos = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return {
    top: Math.round(r.bottom + window.scrollY),
    left: Math.round(r.left + window.scrollX),
  };
};

/** ---------- 주간 계산 helpers ---------- */
// 월요일 시작 주간
const startOfWeek = (d) => {
  const day = d.getDay(); // 0=일,1=월...
  const diff = (day === 0 ? -6 : 1) - day; // 월요일까지 보정
  const s = new Date(d);
  s.setDate(d.getDate() + diff);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate());
};
const endOfWeek = (d) => {
  const s = startOfWeek(d);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
};
// 선택된 연/월의 주차 배열 [{label, start, end}]
const getWeeksOfMonth = (year, month) => {
  const first = new Date(year, month - 1, 1);
  const last  = lastOfMonth(first);
  let cur = startOfWeek(first);
  const out = [];
  let idx = 1;
  while (cur <= last) {
    const s = new Date(cur);
    const e = endOfWeek(cur);
    // 월 경계로 clip
    const clipS = new Date(Math.max(s, first));
    const clipE = new Date(Math.min(e, last));
    out.push({
      label: `${idx}주차`,
      start: clipS,
      end: clipE,
    });
    idx += 1;
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
  }
  return out;
};

/** ---------- Component ---------- */
class InspectionSystemChart extends Component {
  state = {
    filters: getDefaultFilters(),
    // data
    kpis: { total: 0, partKinds: 0, itemKinds: 0, dailyAvg: 0, prodSum: 0, intensityPerK: 0, byInspType: [], byWorkType: [] },
    byItem: [], trend: [], stacked: [], byPart: [], byProcess: [], machines: [],
    throughput: [], shift: [], momentum: [],
    weekdayProfile: [], machIntensity: [], machShiftImbalance: [], anomalyDays: [],
    // options
    factories: [], processes: [], parts: [], items: [], optionsLoading: false,
    years: [],
    // ui
    loading: false, error: "", showStacked: true,
    showWeeklyTrend: false, showWeeklyThroughput: false, showWeeklyShift: false,
    // 프리셋 상태
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,   // ✅ 주간 드롭다운 기준 월
    // 드롭다운 위치(좌표 고정)
    yearAnchorPos: null,
    monthAnchorPos: null,
    weekAnchorPos: null,                         // ✅ 주간 드롭다운 위치
    customAnchorPos: null,
  };

  componentDidMount() {
    const saved = localStorage.getItem("inspectionFilters");
    if (saved) {
      try { this.setState({ filters: { ...getDefaultFilters(), ...JSON.parse(saved) } }); } catch {}
    }
    this.bootstrap();
  }

  bootstrap = async () => {
    await this.loadOptions();
    await this.loadYears();
    this.loadAll();
  };

  /** --------- API ---------- */
  post = async (path, body) => {
    const headers = { "Content-Type": "application/json" };
    const res = await fetch(`${config.baseURLApi}/smartFactory/inspection_chart${path}`, {
      method: "POST", headers, body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(path + " 호출 실패");
    const json = await res.json();
    return json.data || [];
  };

  loadOptions = async () => {
    const { filters } = this.state;
    this.setState({ optionsLoading: true });
    try {
      const [factories, processes, parts, items] = await Promise.all([
        this.post("/options/factories", { start_date: filters.start_date, end_date: filters.end_date }),
        this.post("/options/processes", { ...filters }),
        this.post("/options/parts",     { ...filters }),
        this.post("/options/items",     { ...filters }),
      ]);
      this.setState({ factories, processes, parts, items, optionsLoading: false });
    } catch (e) {
      console.error(e);
      this.setState({ optionsLoading: false });
    }
  };

  /** 연간 드롭다운용: 서버에서 연도 목록을 받되, 실패 시 fallback(현재년~-4년) */
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

  /** 공통 필터 변경 */
  handleFilterChange = async (field, value) => {
    this.setState(prev => {
      const f = { ...prev.filters, [field]: value };
      if (field === "factory") { f.process = ""; f.partNo = ""; f.item = ""; }
      if (field === "process") { f.partNo = ""; f.item = ""; }
      if (field === "partNo")  { f.item = ""; }
      return { filters: f };
    }, async () => {
      // 옵션은 항상 갱신(선택에 따라 다음 셀렉트 옵션이 바뀌므로)
      await this.loadOptions();

      // ✅ 어떤 항목이든 바뀌면 즉시 대시보드 재조회
      await this.loadAll();

      // if (["start_date","end_date","factory","process","partNo","workType","inspType"].includes(field)) {
      //   await this.loadOptions();
      //   if (field === "start_date" || field === "end_date") this.loadAll();
      // }
    });
  };

  /** 날짜범위 즉시 적용 */
  setDateRange = async (start, end) => {
    const start_date = iso(start);
    const end_date   = iso(end);
    this.setState(prev => ({ filters: { ...prev.filters, start_date, end_date } }), async () => {
      try { localStorage.setItem("inspectionFilters", JSON.stringify(this.state.filters)); } catch {}
      await this.loadOptions();
      this.loadAll();
    });
  };

  /** 프리셋 액션 */
  applyToday = () => {
    const t = today0();
    this.setDateRange(t, t);
  };
  selectMonth = (m) => {
    const y = this.state.selectedYear;
    const s = new Date(y, m - 1, 1);
    const e = lastOfMonth(s);
    this.setDateRange(s, e);
    this.setState({ monthAnchorPos: null, selectedMonth: m }); // ✅ 월 선택 시 저장
  };
  selectYear = (y) => {
    const s = new Date(y, 0, 1);
    const e = new Date(y, 11, 31);
    this.setState({ selectedYear: y }, () => this.setDateRange(s, e));
    this.setState({ yearAnchorPos: null });
  };
  /** 주간 선택 */
  selectWeek = (w) => {
    this.setDateRange(w.start, w.end);
    this.setState({ weekAnchorPos: null });
  };

  /** 초기화: 올해 전체 + 필터 초기값 */
  resetToThisYear = async () => {
    const y = new Date().getFullYear();
    const filters = { ...getDefaultFilters() };
    this.setState({ filters, selectedYear: y, selectedMonth: new Date().getMonth()+1 }, async () => {
      try { localStorage.removeItem("inspectionFilters"); } catch {}
      await this.loadOptions();
      this.loadAll();
    });
  };

  /** 데이터 로드 (✅ 통합 호출) */
  loadAll = async () => {
    const { filters } = this.state;
    try { localStorage.setItem("inspectionFilters", JSON.stringify(filters)); } catch {}
    this.setState({ loading: true, error: "" });
    try {
      const dashboard = await this.post("/dashboard", filters);
      // 통합 응답에서 각 데이터 분해
      this.setState({
        kpis:                   dashboard.kpis || {},
        byItem:                 dashboard.byItem || [],
        trend:                  dashboard.trend || [],
        stacked:                dashboard.stacked || [],
        byPart:                 dashboard.byPart || [],
        byProcess:              dashboard.byProcess || [],
        machines:               dashboard.machines || [],
        throughput:             dashboard.throughput || [],
        shift:                  dashboard.shift || [],
        momentum:               dashboard.momentum || [],
        weekdayProfile:         dashboard.weekdayProfile || [],
        machIntensity:          dashboard.machIntensity || [],
        machShiftImbalance:     dashboard.machShiftImbalance || [],
        anomalyDays:            dashboard.anomalyDays || [],
        loading: false
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
    }
  };

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

  /** ----- tick formatter ----- */
  formatTick = (v, weekly) => {
    const s = String(v || "");
    if (weekly) {
      const wk = s.split("-W")[1] || s;
      return `W${wk}`;
    }
    return s.length >= 10 ? s.slice(5) : s;
  };

  /** ---------- top bar ---------- */
  renderTopBar = () => {
    const now = today0();
    const thisYear  = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const thisWeek  = { start: startOfWeek(now), end: endOfWeek(now) };

    const { optionsLoading, loading } = this.state;
    const busy = optionsLoading || loading;

    const renderSelect = (label, field, options, widthClass = "field") => (
      <FormControl size="small" className={s[widthClass]}>
        <InputLabel id={`${field}-lbl`}>{label}</InputLabel>
        <Select
          labelId={`${field}-lbl`}
          label={label}
          value={this.state.filters[field]}
          onChange={(e) => this.handleFilterChange(field, e.target.value)}
          MenuProps={{ PaperProps: { style: { maxHeight: 360 } } }}
        >
          <MenuItem value=""><em>전체</em></MenuItem>
          {options.map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}
        </Select>
      </FormControl>
    );

    /** 활성 프리셋 표시 */
    const { start_date, end_date } = this.state.filters;
    const sd = new Date(start_date), ed = new Date(end_date), t = today0();
    const isToday = sd.getTime() === t.getTime() && ed.getTime() === t.getTime();
    const isYear  = sd.getFullYear() === ed.getFullYear()
                 && sd.getMonth() === 0 && sd.getDate() === 1
                 && ed.getMonth() === 11 && ed.getDate() === 31;
    const isMonth = sd.getFullYear() === ed.getFullYear()
                 && sd.getMonth() === ed.getMonth()
                 && sd.getDate() === 1
                 && ed.getDate() === lastOfMonth(sd).getDate();

    const PresetBtn = ({ active, onClick, children, endIcon }) => (
      <Button
        size="small"
        variant={active ? "contained" : "outlined"}
        onClick={onClick}
        endIcon={endIcon}
        className={s.presetBtn}
        disabled={busy}
      >
        {children}
      </Button>
    );

    const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

    return (
      <Box className={s.topbar}>
        <Box className={s.titleWrap}>
          <Typography variant="caption" className={s.breadcrumb} sx={{ fontWeight: 700 }}>
            검사시스템
          </Typography>
          <Typography variant="h5" className={s.pageTitle}>
            <Box component="span" sx={{ fontWeight: 900 }}>기간별 검사/생산 인사이트</Box>
          </Typography>
          <Typography variant="body2" className={s.pageDesc} sx={{ fontWeight: 400 }}>
            그리드 없이도 바로 보이는 <b>Top5·추이·스파이크·집중/불균형</b>.
          </Typography>
        </Box>

        {/* 필터 */}
        <Box className={s.tools}>
          {renderSelect("공장",   "factory", this.state.factories)}
          {renderSelect("공정",   "process", this.state.processes)}
          {renderSelect("품번",   "partNo",  this.state.parts)}
          {renderSelect("검사항목","item",   this.state.items)}
          <span className={s.rowBreak} />

          {/* 기간 직접입력(보조) */}
          <TextField
            size="small"
            className={s.dateField}
            label="시작일"
            type="date"
            value={this.state.filters.start_date}
            onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            size="small"
            className={s.dateField}
            label="종료일"
            type="date"
            value={this.state.filters.end_date}
            onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          {/* 고정 드롭다운 */}
          <FormControl size="small" className={s.field}>
            <InputLabel id="inspType">검사구분</InputLabel>
            <Select
              labelId="inspType"
              label="검사구분"
              value={this.state.filters.inspType}
              onChange={(e) => this.handleFilterChange("inspType", e.target.value)}
            >
              <MenuItem value=""><em>전체</em></MenuItem>
              <MenuItem value="자동검사">자동검사</MenuItem>
              <MenuItem value="자주검사">자주검사</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" className={s.field}>
            <InputLabel id="workType">작업구분</InputLabel>
            <Select
              labelId="workType"
              label="작업구분"
              value={this.state.filters.workType}
              onChange={(e) => this.handleFilterChange("workType", e.target.value)}
            >
              <MenuItem value=""><em>전체</em></MenuItem>
              <MenuItem value="초품">초품</MenuItem>
              <MenuItem value="중품">중품</MenuItem>
              <MenuItem value="종품">종품</MenuItem>
            </Select>
          </FormControl>

          {/* 오른쪽 컨트롤: 연간/월간/주간/오늘/직접입력 + 초기화 + CSV */}
          <Box className={s.rightControls}>

            {/* 연간: 좌표 고정 메뉴 */}
            <PresetBtn
              active={isYear}
              onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
              endIcon={<ArrowDropDownIcon />}
            >
              연간
            </PresetBtn>
            <Menu
              open={!!this.state.yearAnchorPos}
              onClose={() => this.setState({ yearAnchorPos: null })}
              anchorReference="anchorPosition"
              anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              PaperProps={{ className: s.menuPaper }}
            >
              {/* ✅ 올해 */}
              <MenuItem dense onClick={() => this.selectYear(thisYear)}>
                올해
              </MenuItem>
              {/* 나머지 연도들 */}
              {this.state.years.map((y) => (
                <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
                  {y}년
                </MenuItem>
              ))}
            </Menu>

            {/* 월간: 선택된 연도 기준 */}
            <PresetBtn
              active={isMonth}
              onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
              endIcon={<ArrowDropDownIcon />}
            >
              월간
            </PresetBtn>
            <Menu
              open={!!this.state.monthAnchorPos}
              onClose={() => this.setState({ monthAnchorPos: null })}
              anchorReference="anchorPosition"
              anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              PaperProps={{ className: s.menuPaper }}
            >
              {/* ✅ 이번달 */}
              <MenuItem
                dense
                onClick={() => {
                  this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth));
                }}
              >
                이번달
              </MenuItem>

              {/* 선택된 연도 기준 월 목록 */}
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
                  {this.state.selectedYear}년 {m}월
                </MenuItem>
              ))}
            </Menu>


            {/* ✅ 주간: 현재 선택된 연/월 기준 주차 */}
            <PresetBtn
              active={false}
              onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
              endIcon={<ArrowDropDownIcon />}>
              주간
            </PresetBtn>
            <Menu
              open={!!this.state.weekAnchorPos}
              onClose={() => this.setState({ weekAnchorPos: null })}
              anchorReference="anchorPosition"
              anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              PaperProps={{ className: s.menuPaper }}
            >
              {/* ✅ 이번주 */}
              <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
                이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
              </MenuItem>

              {/* 선택된 연/월 기준 주차 목록 */}
              {weeks.map((w, i) => (
                <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
                  {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label}
                  &nbsp;({iso(w.start)}~{iso(w.end)})
                </MenuItem>
              ))}
            </Menu>


            {/* 오늘 */}
            <PresetBtn active={isToday} onClick={this.applyToday}>오늘</PresetBtn>

            {/* 직접입력: 좌표 고정 팝오버 */}
            <PresetBtn
              active={!(isToday || isMonth || isYear)}
              onClick={(e) => this.setState({ customAnchorPos: getAnchorPos(e.currentTarget) })}
              endIcon={<ArrowDropDownIcon />}
            >
              직접입력
            </PresetBtn>
            <Popover
              open={!!this.state.customAnchorPos}
              onClose={() => this.setState({ customAnchorPos: null })}
              anchorReference="anchorPosition"
              anchorPosition={this.state.customAnchorPos || { top: 0, left: 0 }}
              anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
              transformOrigin={{ vertical: "top", horizontal: "left" }}
              PaperProps={{ className: s.customPaper }}
            >
              <Box className={s.customRow}>
                <TextField
                  size="small"
                  fullWidth
                  label="시작일"
                  type="date"
                  value={this.state.filters.start_date}
                  onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
              <Box className={s.customRow}>
                <TextField
                  size="small"
                  fullWidth
                  label="종료일"
                  type="date"
                  value={this.state.filters.end_date}
                  onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            </Popover>

            {/* 초기화(올해 전체) */}
            <Button
              size="small"
              variant="outlined"
              startIcon={<ResetIcon />}
              className={s.presetBtn}
              onClick={this.resetToThisYear}
              disabled={busy}
            >
              초기화
            </Button>

            {/* CSV 내보내기 */}
            <Tooltip title="CSV 내보내기">
              <IconButton onClick={this.exportCsv} sx={{ color: "#607d8b" }} disabled={busy}>
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>
    );
  };

  /** ---------- cards & charts ---------- */
  KPI = ({ title, value, color, sub }) => (
    <Card className={s.kpiCard} sx={{ flex: 1, height: '100%' }}>
      <CardContent className={s.kpiBody}>
        <Typography className={s.kpiTitle} sx={{ color, fontSize: 13, fontWeight: 800 }}>{title}</Typography>
        <Typography className={s.kpiValue} sx={{ color, fontSize: 28, fontWeight: 900 }}>{value}</Typography>
        <Box className={s.kpiFoot}>
          <Typography className={s.kpiSub} sx={{ fontSize: 12, fontWeight: 500 }}>{sub}</Typography>
        </Box>
      </CardContent>
    </Card>
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

        {/* ✅ 로딩 처리 */}
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

        {/* ✅ 로딩 처리 */}
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

        {/* ✅ 로딩 처리 */}
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

        {/* ✅ 로딩 처리 */}
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

        {/* ✅ 로딩 처리 */}
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

        {/* ✅ 로딩 처리 */}
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

        {/* ✅ 로딩 처리 */}
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

        {/* ✅ 로딩 처리 */}
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

        {/* ✅ 로딩 처리 */}
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

        {/* ✅ 로딩 처리 */}
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

        {/* ✅ 로딩 처리 */}
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
        <TableContainer sx={{
          maxHeight: 340, borderRadius: 1,
          "& .MuiTableCell-head": { position:"sticky", top:0, backgroundColor: mainColor, color:"#fff", zIndex:1, fontWeight:800 },
        }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>일자</TableCell>
                <TableCell align="right">검사건수</TableCell>
                <TableCell align="right">평균</TableCell>
                <TableCell align="right">표준편차</TableCell>
                <TableCell align="right">z-score</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r,i)=>(
                <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell align="right">{fmtInt(r.count)}</TableCell>
                  <TableCell align="right">{fmtNum(r.avg,2)}</TableCell>
                  <TableCell align="right">{fmtNum(r.std,2)}</TableCell>
                  <TableCell align="right" style={{ fontWeight:900, color:"#d84315" }}>{fmtNum(r.z,2)}</TableCell>
                </TableRow>
              ))}
              {rows.length===0 && <TableRow><TableCell colSpan={5} align="center">이상치가 없습니다.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
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
        <TableContainer
          sx={{
            maxHeight: 380, borderRadius: 1,
            "& .MuiTableCell-head": { position: "sticky", top: 0, backgroundColor: mainColor, color: "#fff", zIndex: 1, fontWeight: 800 },
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>보고일</TableCell>
                <TableCell align="right">총 검사</TableCell>
                <TableCell align="right">자동검사</TableCell>
                <TableCell align="right">자주검사</TableCell>
                <TableCell align="right">기타</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell align="right">{fmtInt(r.count)}</TableCell>
                  <TableCell align="right">{fmtInt(r.auto || 0)}</TableCell>
                  <TableCell align="right">{fmtInt(r.self || 0)}</TableCell>
                  <TableCell align="right">{fmtInt(r.other || 0)}</TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={5} align="center">데이터가 없습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  render() {
    return (
      <Box className={s.root}>
        {this.renderTopBar()}
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

        {this.renderDailyTable()}
      </Box>
    );
  }
}

export default InspectionSystemChart;
