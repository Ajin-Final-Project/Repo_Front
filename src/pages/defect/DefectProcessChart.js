// import React, { Component } from "react";
// import { connect } from "react-redux";

// import {
//   Box, Paper, Typography, Grid, Card, CardContent, TextField,
//   FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell,
//   TableContainer, TableHead, TableRow, IconButton, Tooltip, Chip, InputAdornment,
//   FormControlLabel, Switch
// } from "@mui/material";
// import {
//   PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
//   Tooltip as RTooltip, ResponsiveContainer, Area, Line, ReferenceLine,
//   ComposedChart, Legend, ReferenceArea
// } from "recharts";
// import {
//   Search as SearchIcon,
//   Refresh as RefreshIcon,
//   ArrowUpward, ArrowDownward,
//   BugReport as BugIcon,
//   FileDownload as DownloadIcon,
//   PieChart as PieChartIcon,
//   BarChart as BarChartIcon,
// } from "@mui/icons-material";
// import { selectThemeHex, selectThemeKey } from '../../reducers/layout'; // 리덕스에서 색상 상태 불러옴

// import s from "./DefectProcessChart.module.scss";
// import config from "../../config";

// const palette = ["#ff7043", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc", "#26c6da", "#ec407a", "#7e57c2", "#8d6e63", "#26a69a"];
// const mainColor = "#ff7043"; //#ffb300

// // 숫자/퍼센트 표기 헬퍼
// const fmtInt = (v) => (Number(v) || 0).toLocaleString();
// const fmtPct = (v, digits = 2) => `${(Number(v) || 0).toFixed(digits)}%`;

// function mapStateToProps(state) {
//   return {
//     themeHex: selectThemeHex(state),
//     themeKey: selectThemeKey(state), 
//   };
// }

// class DefectProcessChart extends Component {
//   state = {
//     // 필터
//     filters: {
//       start_date: new Date(new Date().getFullYear(), 0, 1).toLocaleDateString("sv-SE"),
//       end_date: new Date().toLocaleDateString("sv-SE"),
//       workplace: "",
//       carModel: "",
//       orderType: "",
//       defectCode: "",
//       defectType: "",
//       worker: "",
//       topN: 10,
//     },
//     // 데이터
//     kpis: { good: 0, defect: 0, wait: 0, rwk: 0, scrap: 0, throughput: 0, defectRate: 0, scrapRate: 0, rwkRate: 0 },
//     byType: [],
//     trend: [],
//     stacked: [],
//     // UI
//     loading: false,
//     error: "",
//     // KPI 증감(최근 7일 vs 직전 7일)
//     delta: { defectRate: 0, monthlyDefect: 0, weeklyDefect: 0 },
//     // 트렌드 옵션
//     showDefectBars: false, // ← 기본 비표시
//   };

//   componentDidMount() {
//     const saved = localStorage.getItem("defectFilters");
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         this.setState({ filters: { ...this.state.filters, ...parsed } }, this.loadAll);
//         return;
//       } catch {}
//     }
//     this.loadAll();
//   }

//   handleFilterChange = (field, value) => {
//     this.setState(prev => {
//       const filters = { ...prev.filters, [field]: value };
//       localStorage.setItem("defectFilters", JSON.stringify(filters));
//       return { filters };
//     });
//   };

//   // KPI 증감 계산 (최근7일/직전7일, 월/주 불량률 근사)
//   computeDelta = (trend) => {
//     if (!Array.isArray(trend) || trend.length === 0) {
//       return { defectRate: 0, monthlyDefect: 0, weeklyDefect: 0 };
//     }
//     const parse = (d) => ({
//       defect: d.defect || 0,
//       th: (d.good || 0) + (d.defect || 0),
//       rate: d.defectRate || 0,
//       date: new Date(d.date),
//     });

//     const arr = trend.map(parse).sort((a, b) => a.date - b.date);

//     const last7 = arr.slice(-7);
//     const prev7 = arr.slice(-14, -7);

//     const avg = (xs, key) => xs.length ? xs.reduce((s, x) => s + x[key], 0) / xs.length : 0;
//     const sum = (xs, key) => xs.reduce((s, x) => s + x[key], 0);

//     const lastRate = avg(last7, "rate");
//     const prevRate = avg(prev7, "rate");
//     const deltaRate = prev7.length ? ((lastRate - prevRate) / (prevRate || 1)) * 100 : 0;

//     const last30 = arr.slice(-30);
//     const last7sum = sum(last7, "defect");
//     const last30sum = sum(last30, "defect");

//     return {
//       defectRate: Math.round(deltaRate * 10) / 10,
//       weeklyDefect: last7sum,
//       monthlyDefect: last30sum,
//     };
//   };

//   // 7일 이동평균 계산
//   movingAvg = (arr, key = "defectRate", w = 7) => {
//     if (!Array.isArray(arr) || !arr.length) return [];
//     const vals = arr.map(d => d[key] || 0);
//     const out = [];
//     for (let i = 0; i < vals.length; i++) {
//       const from = Math.max(0, i - w + 1);
//       const slice = vals.slice(from, i + 1);
//       const avg = slice.reduce((s, v) => s + v, 0) / slice.length;
//       out.push({ ...arr[i], ma: Math.round(avg * 100) / 100 });
//     }
//     return out;
//   };

//   loadAll = async () => {
//     const { filters } = this.state;
//     this.setState({ loading: true, error: "" });
//     try {
//       const headers = { "Content-Type": "application/json" };
//       const body = JSON.stringify(filters);

//       const [kpisRes, typeRes, trendRes, stackedRes] = await Promise.all([
//         fetch(`${config.baseURLApi}/smartFactory/defect_chart/kpis`,    { method: "POST", headers, body }),
//         fetch(`${config.baseURLApi}/smartFactory/defect_chart/by_type`, { method: "POST", headers, body }),
//         fetch(`${config.baseURLApi}/smartFactory/defect_chart/trend`,   { method: "POST", headers, body }),
//         fetch(`${config.baseURLApi}/smartFactory/defect_chart/stacked`, { method: "POST", headers, body }),
//       ]);

//       if (!kpisRes.ok || !typeRes.ok || !trendRes.ok || !stackedRes.ok) {
//         throw new Error("API 호출 중 오류");
//       }

//       const kpisJson = await kpisRes.json();
//       const typeJson = await typeRes.json();
//       const trendJson = await trendRes.json();
//       const stackedJson = await stackedRes.json();

//       const trendArr = Array.isArray(trendJson.data) ? trendJson.data : [];

//       this.setState({
//         kpis: kpisJson.data || this.state.kpis,
//         byType: Array.isArray(typeJson.data) ? typeJson.data : [],
//         trend: trendArr,
//         stacked: Array.isArray(stackedJson.data) ? stackedJson.data : [],
//         delta: this.computeDelta(trendArr),
//         loading: false,
//       });
//     } catch (e) {
//       console.error(e);
//       this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
//     }
//   };

//   // CSV 내보내기(파레토 + 추이)
//   exportCsv = () => {
//     const { byType, trend } = this.state;
//     const rows = [
//       ["[Pareto] type", "qty"],
//       ...byType.map(r => [r.type, r.qty]),
//       [],
//       ["[Trend] date", "good", "defect", "wait", "rwk", "scrap", "defectRate(%)"],
//       ...trend.map(d => [d.date, d.good, d.defect, d.wait, d.rwk, d.scrap, (Number(d.defectRate) || 0).toFixed(2)]),
//     ];
//     const csv = rows.map(r => r.join(",")).join("\n");
//     const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = `defect_charts_${Date.now()}.csv`;
//     a.click();
//     URL.revokeObjectURL(url);
//   };

//   // ───────────────────────────── Renderers ─────────────────────────────

//   renderTopBar = (themeHex) => {
//     const { filters, loading } = this.state;
//     return (
//       <Box className={s.topbar}>
//         <Box className={s.titleWrap}>
//           <Typography variant="caption" className={s.breadcrumb} sx={{ fontWeight: 700 }}>
//             프레스
//           </Typography>
//           <Typography variant="h5" className={s.pageTitle}>
//             <Box component="span" sx={{ fontWeight: 900, color: themeHex}}>기간별 생산 및 불량률 현황 리포트</Box>
//           </Typography>
//           <Typography variant="body2" className={s.pageDesc} sx={{ fontWeight: 400 }}>
//             생산 성과 및 품질 지표에 대한 상세 분석 리포트
//           </Typography>
//         </Box>

//         <Box className={s.tools}>
//           <TextField
//             size="small"
//             placeholder="불량유형 검색"
//             value={this.state.filters.defectType}
//             onChange={(e) => this.handleFilterChange("defectType", e.target.value)}
//             InputProps={{
//               startAdornment: (
//                 <InputAdornment position="start">
//                   <SearchIcon fontSize="small" sx={{ opacity: 0.6 }} />
//                 </InputAdornment>
//               ),
//             }}
//           />
//           <TextField
//             label="시작일" type="date" size="small" InputLabelProps={{ shrink: true }}
//             value={this.state.filters.start_date} onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
//           />
//           <TextField
//             label="종료일" type="date" size="small" InputLabelProps={{ shrink: true }}
//             value={this.state.filters.end_date} onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
//           />
//           <FormControl size="small" sx={{ minWidth: 100 }}>
//             <InputLabel id="topn">Top N</InputLabel>
//             <Select labelId="topn" label="Top N" value={this.state.filters.topN}
//                     onChange={(e) => this.handleFilterChange("topN", e.target.value)}>
//               {[5, 10, 15, 20].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
//             </Select>
//           </FormControl>

//           <Tooltip title="새로고침">
//             <span>
//               <IconButton onClick={this.loadAll} disabled={loading} sx={{ color: mainColor }}>
//                 <RefreshIcon />
//               </IconButton>
//             </span>
//           </Tooltip>

//           <Tooltip title="CSV 내보내기">
//             <IconButton onClick={this.exportCsv} sx={{ color: "#607d8b" }}>
//               <DownloadIcon />
//             </IconButton>
//           </Tooltip>
//         </Box>
//       </Box>
//     );
//   };

//   Delta = ({ value }) => {
//     const pos = value >= 0;
//     return (
//       <Box className={pos ? s.deltaUp : s.deltaDown}>
//         {pos ? <ArrowUpward fontSize="inherit" /> : <ArrowDownward fontSize="inherit" />}
//         <span>{Math.abs(value)}%</span>
//       </Box>
//     );
//   };

//   renderKpis = () => {
//     const { kpis, delta } = this.state;
//     const cards = [
//       { title: "과주행 금형(최근 7일)", value: fmtInt(delta.weeklyDefect), sub: "주간 불량 건수", color: "#43a047", delta: delta.defectRate },
//       { title: "월간 불량합", value: fmtInt(delta.monthlyDefect), sub: "최근 30일", color: "#1e88e5", delta: 0 },
//       { title: "주간 불량률", value: fmtPct(kpis.defectRate), sub: "Throughput 대비", color: "#ff7043", delta: delta.defectRate },
//       { title: "폐기율", value: fmtPct(kpis.scrapRate), sub: "Scrap / Throughput", color: "#8e24aa", delta: 0 },
//     ];
//     return (
//       <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
//         {cards.map((c, i) => (
//           <Grid item xs={12} sm={6} md={3} key={i} sx={{ display: 'flex' }}>
//             <Card className={s.kpiCard} sx={{ flex: 1, height: '100%' }}>
//               <CardContent
//                 className={s.kpiBody}
//                 sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
//               >
//                 <Typography className={s.kpiTitle} sx={{ color: c.color, fontSize: 13, fontWeight: 800 }}>
//                   {c.title}
//                 </Typography>
//                 <Typography className={s.kpiValue} sx={{ color: c.color, fontSize: 28, fontWeight: 900 }}>
//                   {c.value}
//                 </Typography>
//                 <Box className={s.kpiFoot}>
//                   <Typography className={s.kpiSub} sx={{ fontSize: 12, fontWeight: 500 }}>
//                     {c.sub}
//                   </Typography>
//                   {i !== 1 && <this.Delta value={c.delta} />}
//                 </Box>
//               </CardContent>
//             </Card>
//           </Grid>
//         ))}
//       </Grid>
//     );
//   };

//   renderDonut = (themeHex) => {
//     const { kpis } = this.state;
//     const data = [
//       { name: "판정대기", value: kpis.wait || 0, color: "#26c6da"},
//       { name: "RWK", value: kpis.rwk || 0, color: "#42a5f5" },
//       { name: "폐기", value: kpis.scrap || 0, color: "#ab47bc" },
//     ];
//     const total = data.reduce((s, d) => s + d.value, 0);

//     return (
//       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: themeHex, fontWeight: 800 }}>
//             <PieChartIcon /> 주요 불량 구성
//           </Typography>
//         </Box>

//         <Box sx={{ flex: 1, minHeight: 280, position: "relative" }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <PieChart>
//               <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
//                 {data.map((d, i) => <Cell key={i} fill={d.color} />)}
//               </Pie>
//               <RTooltip formatter={(v, n) => [`${fmtInt(v)} (${fmtPct((v / (total || 1)) * 100, 0)})`, n]} />
//             </PieChart>
//           </ResponsiveContainer>

//           {/* 중앙 합계 라벨 */}
//           <Box sx={{
//             position: "absolute", inset: 0, display: "flex", alignItems: "center",
//             justifyContent: "center", flexDirection: "column", pointerEvents: "none"
//           }}>
//             <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 불량</Typography>
//             <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#263238" }}>
//               {fmtInt(total)}
//             </Typography>
//           </Box>
//         </Box>

//         <Box className={s.legendRow}>
//           {data.map((d, i) => (
//             <span key={i} className={s.legendItem}>
//               <span className={s.legendDot} style={{ background: d.color }} />
//               {d.name} <b>{fmtInt(d.value)}</b>
//             </span>
//           ))}
//         </Box>
//       </Paper>
//     );
//   };

//   renderPareto = (themeHex) => {
//     const { byType } = this.state;
//     const total = byType.reduce((s, x) => s + (x.qty || 0), 0) || 1;
//     let cum = 0;
//     const data = byType.map(d => {
//       cum += d.qty || 0;
//       const rate = Math.min(100, (cum / total) * 100); // 100% 초과 방지
//       return { ...d, cumRate: Math.round(rate * 100) / 100 };
//     });

//     return (
//       <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: themeHex, fontWeight: 800}}>
//             <BarChartIcon /> 불량유형 파레토
//           </Typography>
//         </Box>

//         <Box sx={{ flex: 1, minHeight: 280 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={data}>
//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="type" axisLine={false} tickLine={false} />
//               <YAxis yAxisId="left" axisLine={false} tickLine={false} />
//               <YAxis
//                 yAxisId="right"
//                 orientation="right"
//                 axisLine={false}
//                 tickLine={false}
//                 tickFormatter={(v) => fmtPct(v, 0)}
//                 domain={[0, 100]}
//               />
//               <RTooltip
//                 formatter={(value, name, { payload }) => {
//                   if (name === "수량") return [fmtInt(value), "수량"];
//                   if (name === "누적(%)") return [fmtPct(payload.cumRate, 2), "누적(%)"];
//                   return [value, name];
//                 }}
//               />
//               <Bar yAxisId="left" dataKey="qty" name="수량" radius={[4, 4, 0, 0]}>
//                 {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
//               </Bar>
//               <Line yAxisId="right" type="monotone" dataKey="cumRate" name="누적(%)" stroke="#90a4ae" dot={false} />
//               {/* 80% 기준선 */}
//               <ReferenceLine yAxisId="right" y={80} stroke="#ff7043" strokeDasharray="4 4" />
//             </BarChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>
//     );
//   };

//   // ── 실시간 불량 모니터링(추이): ComposedChart + 최근 7일 하이라이트/목표선/정규화 막대 ──
//   renderTrend = (themeHex) => {
//     const { trend, showDefectBars } = this.state;
//     const ma = this.movingAvg(trend, "defectRate", 7);
//     const data = ma.map(d => {
//       const good = d.good || 0;
//       const defect = d.defect || 0;
//       const total = good + defect;
//       const defectPct = total ? (defect / total) * 100 : 0; // ← 퍼센트 축으로 정규화
//       return {
//         ...d,
//         rate: d.defectRate || 0,
//         defect,
//         defectPct,
//       };
//     });

//     const x1 = data.length > 7 ? data[data.length - 7].date : null;
//     const x2 = data.length ? data[data.length - 1].date : null;
//     const target = 1.0; // 목표 불량률(%)

//     return (
//       <Paper className={s.section}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx={{ color: themeHex, fontWeight: 800 }}>
//             <BugIcon /> 실시간 불량 모니터링(추이)
//           </Typography>

//           {/* 우측 옵션: 불량수량 막대 표시 */}
//           <FormControlLabel
//             control={
//               <Switch
//                 size="small"
//                 checked={showDefectBars}
//                 onChange={(e) => this.setState({ showDefectBars: e.target.checked })}
//               />
//             }
//             label="불량수량 표시"
//           />
//         </Box>

//         <Box sx={{ height: 320 }}>
//           <ResponsiveContainer width="100%" height="100%">
//             <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barCategoryGap="55%">
//               <defs>
//                 <linearGradient id="defectRateFill" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor="#ff7043" stopOpacity={0.32} />
//                   <stop offset="100%" stopColor="#ff7043" stopOpacity={0.04} />
//                 </linearGradient>
//               </defs>

//               <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
//               <XAxis dataKey="date" />
//               {/* 왼쪽: % 축 (불량률 및 정규화 막대 함께 사용) */}
//               <YAxis yAxisId="left" tickFormatter={(v) => `${v}%`} />

//               <RTooltip
//                 formatter={(v, n, ctx) => {
//                   if (n === "불량률(%)" || n === "7일 평균(%)") return [`${Number(v).toFixed(2)}%`, n];
//                   if (n === "불량수량(%)") {
//                     const raw = ctx?.payload?.defect ?? 0;
//                     return [`${fmtInt(raw)}건 (${fmtPct(v, 2)})`, n];
//                   }
//                   return [v, n];
//                 }}
//                 labelFormatter={(label) => `날짜: ${label}`}
//               />
//               <Legend
//                 verticalAlign="top"
//                 height={28}
//                 iconType="circle"
//                 iconSize={14}
//                 wrapperStyle={{ fontWeight: 700, letterSpacing: ".2px" }}
//                 formatter={(value) => <span style={{ fontWeight: 700 }}>{value}</span>}
//               />

//               {/* 최근 7일 하이라이트(옅게) */}
//               {x1 && x2 && (
//                 <ReferenceArea x1={x1} x2={x2} yAxisId="left" fill="#ff7043" fillOpacity={0.05} />
//               )}

//               {/* 목표선(%) */}
//               <ReferenceLine yAxisId="left" y={target} stroke="#90a4ae" strokeDasharray="5 5" />

//               {/* 선택 시에만 정규화 막대 표시 */}
//               {showDefectBars && (
//                 <Bar
//                   yAxisId="left"
//                   dataKey="defectPct"
//                   name="불량수량(%)"
//                   fill="rgba(255,193,7,.45)"
//                   stroke="none"
//                   barSize={10}
//                   radius={[3,3,0,0]}
//                 />
//               )}

//               <Area yAxisId="left" type="monotone" dataKey="rate" name="불량률(%)" stroke="#ff7043" fill="url(#defectRateFill)" />
//               <Line yAxisId="left" type="monotone" dataKey="ma" name="7일 평균(%)" stroke="#42a5f5" dot={false} />
//             </ComposedChart>
//           </ResponsiveContainer>
//         </Box>
//       </Paper>
//     );
//   };

//   // 불량률 Chip (색상/증감)
//   RateChip = ({ value, delta }) => {
//     const v = typeof value === "number" ? value : Number(value) || 0;
//     const d = typeof delta === "number" ? delta : Number(delta) || 0;
//     const color = v >= 1 ? "error" : v >= 0.5 ? "warning" : "success";
//     const arrow = d > 0 ? "↑" : d < 0 ? "↓" : "→";
//     return <Chip size="small" color={color} variant="outlined" label={`${v.toFixed(2)}% ${arrow}`} sx={{ fontWeight: 700 }} />;
//   };

//   // ── 최근 7일 표: sticky header + 증감 Chip ──
//   renderDailyTable = (themeHex) => {
//     const { trend } = this.state;
//     const last8 = trend.slice(-8); // 증감계산용 +1
//     const withDelta = last8.map((r, i) => ({
//       ...r,
//       delta: i === 0 ? 0 : (r.defectRate || 0) - (last8[i - 1].defectRate || 0),
//     }));
//     const rows = withDelta.slice(1).reverse(); // 최근이 위로

//     return (
//       <Paper className={s.section}>
//         <Box className={s.sectionHeader}>
//           <Typography className={s.sectionTitle} sx = {{ fontWeight: 800 }}>최근 7일 일자별 요약</Typography>
//         </Box>
//         <TableContainer
//           sx={{
//             maxHeight: 380,
//             borderRadius: 1,
//             "& .MuiTableCell-head": {
//               position: "sticky",
//               top: 0,
//               backgroundColor: themeHex,   // 헤더 배경색
//               color: "#333",              // 헤더 글자색
//               zIndex: 1,
//               fontWeight: 800,
//             },
//           }}
//         >
//           <Table size="small" stickyHeader>
//             <TableHead>
//               <TableRow>
//                 <TableCell>근무일자</TableCell>
//                 <TableCell align="right">양품수량</TableCell>
//                 <TableCell align="right">판정대기</TableCell>
//                 <TableCell align="right">RWK</TableCell>
//                 <TableCell align="right">폐기</TableCell>
//                 <TableCell align="right">불량수량</TableCell>
//                 <TableCell align="center">불량률(%)·증감</TableCell>
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {rows.map((r, i) => (
//                 <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
//                   <TableCell>{r.date}</TableCell>
//                   <TableCell align="right">{fmtInt(r.good)}</TableCell>
//                   <TableCell align="right">{fmtInt(r.wait)}</TableCell>
//                   <TableCell align="right">{fmtInt(r.rwk)}</TableCell>
//                   <TableCell align="right">{fmtInt(r.scrap)}</TableCell>
//                   <TableCell align="right">{fmtInt(r.defect)}</TableCell>
//                   <TableCell align="center">
//                     <this.RateChip value={r.defectRate || 0} delta={r.delta || 0} />
//                   </TableCell>
//                 </TableRow>
//               ))}
//               {rows.length === 0 && (
//                 <TableRow>
//                   <TableCell colSpan={7} align="center">데이터가 없습니다.</TableCell>
//                 </TableRow>
//               )}
//             </TableBody>
//           </Table>
//         </TableContainer>
//       </Paper>
//     );
//   };

//   render() {
//     const { themeHex } = this.props;

//     return (
//       <Box className={s.root}>
//         {this.renderTopBar(themeHex)}
//         {this.renderKpis()}

//         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
//           <Grid item xs={12} md={5} sx={{ display: 'flex' }}>{this.renderDonut(themeHex)}</Grid>
//           <Grid item xs={12} md={7} sx={{ display: 'flex' }}>{this.renderPareto(themeHex)}</Grid>
//         </Grid>

//         <Box sx={{ mb: 2 }}>{this.renderTrend(themeHex)}</Box>
//         {this.renderDailyTable(themeHex)}
//       </Box>
//     );
//   }
// }

// export default connect(mapStateToProps)(DefectProcessChart);

import React, { Component } from "react";
import { connect } from "react-redux";

import {
  Box, Paper, Typography, Grid, Card, CardContent, TextField, Button,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Chip, InputAdornment,
  FormControlLabel, Switch, CardHeader, Divider, Collapse, Menu
} from "@mui/material";
import { Autocomplete } from "@mui/material";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RTooltip, ResponsiveContainer, Area, Line, ReferenceLine,
  ComposedChart, Legend, ReferenceArea
} from "recharts";
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ArrowUpward, ArrowDownward,
  BugReport as BugIcon,
  FileDownload as DownloadIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  TrendingUp,
} from "@mui/icons-material";
import { selectThemeHex, selectThemeKey } from '../../reducers/layout';

import s from "./DefectProcessChart.module.scss";
import config from "../../config";
import InspectionItemModal from "../common/InspectionItemModal";

const palette = ["#ff7043", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc", "#26c6da", "#ec407a", "#7e57c2", "#8d6e63", "#26a69a"];
const mainColor = "#ff7043";

// 숫자/퍼센트 표기 헬퍼
const fmtInt = (v) => (Number(v) || 0).toLocaleString();
const fmtPct = (v, digits = 2) => `${(Number(v) || 0).toFixed(digits)}%`;

function mapStateToProps(state) {
  return {
    themeHex: selectThemeHex(state),
    themeKey: selectThemeKey(state),
  };
}

/** ---------- 날짜/프리셋 helpers (검사 그리드와 동일) ---------- */
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

// ▶ 기본 필터 (그리드와 동일 기본값 + 불량차트 전용 필드 포함)
const getDefaultFilters = () => {
  const now = today0();
  const start = new Date(now.getFullYear(), 0, 1);
  return {
    // 공통(그리드와 동일 네이밍)
    start_date: iso(start),
    end_date: "", // 최신 work_date로 채움
    factory: "아진산업-본사(경산)",
    process: "프레스",
    equipment: "1500T(E라인)",
    partNo: "",
    item: "",
    // 불량차트 전용
    defectType: "",
    topN: 10,
  };
};

class DefectProcessChart extends Component {
  state = {
    // ===== 필터 / 옵션 =====
    filters: getDefaultFilters(),
    factories: [],
    processes: [],
    equipments: [],
    optionsLoading: false,

    // 프리셋 상태/앵커
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    yearAnchorPos: null,
    monthAnchorPos: null,
    weekAnchorPos: null,
    years: [],

    // 모달
    itemCodeModalOpen: false,

    // ===== 데이터 =====
    kpis: { good: 0, defect: 0, wait: 0, rwk: 0, scrap: 0, throughput: 0, defectRate: 0, scrapRate: 0, rwkRate: 0 },
    byType: [],
    trend: [],
    stacked: [],

    // ===== UI =====
    loading: false,
    error: "",
    delta: { defectRate: 0, monthlyDefect: 0, weeklyDefect: 0 },
    showDefectBars: false,
  };

  /** 공통 POST (검사 그리드 옵션/최신일자 재사용) */
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

  /** 차트 API 바디 매핑 */
  mapToDefectReq = (f) => ({
    start_date: f.start_date || undefined,
    end_date: f.end_date || undefined,
    // 불량테이블의 '작업장'은 UI의 "작업장(공정)"과 1:1 매핑
    workplace: f.process || undefined,
    defectType: f.defectType || undefined,
    itemCode: f.partNo || undefined,
    itemName: f.item || undefined,
    topN: f.topN || 10,
  });

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

  /** 초기 부트스트랩 */
  bootstrap = async () => {
    await this.loadYears();
    await this.ensureDefaultDbLastDate(); // end_date 비어있으면 최신일자 세팅
    await this.loadOptions();
    await this.loadAll();
  };

  loadYears = async () => {
    const y = new Date().getFullYear();
    this.setState({ years: [y, y - 1, y - 2, y - 3, y - 4], selectedYear: y });
  };

  /** DB 최신 work_date(YYYY-MM-DD)로 end_date 채우기 */
  ensureDefaultDbLastDate = async () => {
    const { filters } = this.state;
    if (filters.end_date) return;
    try {
      const lastDate = await this.postGrid("/options/latest_date", {}); // 전역 최신일자
      if (lastDate) {
        this.setState(
          (prev) => ({ filters: { ...prev.filters, end_date: lastDate } }),
          () => localStorage.setItem("defectFilters", JSON.stringify(this.state.filters))
        );
      }
    } catch (e) {
      console.error("최신 날짜 조회 실패", e);
    }
  };

  /** 옵션 로드(검사 그리드 옵션 API 재사용) */
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

      // 선택값 유효성 보정
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

  /** 필터 변경 (캐스케이드 적용 + 자동 옵션/차트 갱신) */
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
      }
    );
  };

  /** 날짜 프리셋/범위 */
  setDateRange = async (start, end) => {
    const start_date = start ? iso(start) : "";
    const end_date = end ? iso(end) : "";
    this.setState(
      (prev) => ({ filters: { ...prev.filters, start_date, end_date } }),
      async () => {
        try { localStorage.setItem("defectFilters", JSON.stringify(this.state.filters)); } catch {}
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

  /** 전체 초기화(그리드와 동일 플로우) */
  resetToAll = async () => {
    const filters = getDefaultFilters();
    this.setState(
      { filters, selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1 },
      async () => {
        try { localStorage.removeItem("defectFilters"); } catch {}
        await this.ensureDefaultDbLastDate();
        await this.loadOptions();
        await this.loadAll();
      }
    );
  };

  /** 모달 열기/선택 */
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
      }
    );
  };

  // KPI 증감 계산 (최근7일/직전7일)
  computeDelta = (trend) => {
    if (!Array.isArray(trend) || trend.length === 0) {
      return { defectRate: 0, monthlyDefect: 0, weeklyDefect: 0 };
    }
    const parse = (d) => ({
      defect: d.defect || 0,
      th: (d.good || 0) + (d.defect || 0),
      rate: d.defectRate || 0,
      date: new Date(d.date),
    });

    const arr = trend.map(parse).sort((a, b) => a.date - b.date);
    const last7 = arr.slice(-7);
    const prev7 = arr.slice(-14, -7);

    const avg = (xs, key) => xs.length ? xs.reduce((s, x) => s + x[key], 0) / xs.length : 0;
    const sum = (xs, key) => xs.reduce((s, x) => s + x[key], 0);

    const lastRate = avg(last7, "rate");
    const prevRate = avg(prev7, "rate");
    const deltaRate = prev7.length ? ((lastRate - prevRate) / (prevRate || 1)) * 100 : 0;

    const last30 = arr.slice(-30);
    const last7sum = sum(last7, "defect");
    const last30sum = sum(last30, "defect");

    return {
      defectRate: Math.round(deltaRate * 10) / 10,
      weeklyDefect: last7sum,
      monthlyDefect: last30sum,
    };
  };

  // 7일 이동평균
  movingAvg = (arr, key = "defectRate", w = 7) => {
    if (!Array.isArray(arr) || !arr.length) return [];
    const vals = arr.map(d => d[key] || 0);
    const out = [];
    for (let i = 0; i < vals.length; i++) {
      const from = Math.max(0, i - w + 1);
      const slice = vals.slice(from, i + 1);
      const avg = slice.reduce((s, v) => s + v, 0) / slice.length;
      out.push({ ...arr[i], ma: Math.round(avg * 100) / 100 });
    }
    return out;
  };

  /** 차트 데이터 로드 */
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
        throw new Error("API 호출 중 오류");
      }

      const kpisJson = await kpisRes.json();
      const typeJson = await typeRes.json();
      const trendJson = await trendRes.json();
      const stackedJson = await stackedRes.json();

      const trendArr = Array.isArray(trendJson.data) ? trendJson.data : [];

      this.setState({
        kpis: kpisJson.data || this.state.kpis,
        byType: Array.isArray(typeJson.data) ? typeJson.data : [],
        trend: trendArr,
        stacked: Array.isArray(stackedJson.data) ? stackedJson.data : [],
        delta: this.computeDelta(trendArr),
        loading: false,
      });
    } catch (e) {
      console.error(e);
      this.setState({ error: "차트 데이터를 불러오지 못했습니다.", loading: false });
    }
  };

    /** ---------- 검사 그리드 동일 스타일의 필터바 ---------- */
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

              {/* 기간선택 직접 입력 */}
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
          sx={{ backgroundColor: this.props.themeHex, color: "white", borderRadius: 1, mb: 2 }}
        />

        {/* 1행: 공장/공정/설비/품번/품명 */}
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

        {/* 확장 필터 — 불량유형 + TopN */}
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

        {/* 버튼 */}
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
            }}
          >
            검색
          </Button>
        </Box>

        {/* 품목 선택 모달 */}
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


  // ───────────────────────────── 기존 차트/카드 렌더러들 그대로 ─────────────────────────────
  Delta = ({ value }) => {
    const pos = value >= 0;
    return (
      <Box className={pos ? s.deltaUp : s.deltaDown}>
        {pos ? <ArrowUpward fontSize="inherit" /> : <ArrowDownward fontSize="inherit" />}
        <span>{Math.abs(value)}%</span>
      </Box>
    );
  };

  renderKpis = () => {
    const { kpis, delta } = this.state;
    const cards = [
      { title: "과주행 금형(최근 7일)", value: fmtInt(delta.weeklyDefect), sub: "주간 불량 건수", color: "#43a047", delta: delta.defectRate },
      { title: "월간 불량합", value: fmtInt(delta.monthlyDefect), sub: "최근 30일", color: "#1e88e5", delta: 0 },
      { title: "주간 불량률", value: fmtPct(kpis.defectRate), sub: "Throughput 대비", color: "#ff7043", delta: delta.defectRate },
      { title: "폐기율", value: fmtPct(kpis.scrapRate), sub: "Scrap / Throughput", color: "#8e24aa", delta: 0 },
    ];
    return (
      <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
        {cards.map((c, i) => (
          <Grid item xs={12} sm={6} md={3} key={i} sx={{ display: 'flex' }}>
            <Card className={s.kpiCard} sx={{ flex: 1, height: '100%' }}>
              <CardContent className={s.kpiBody} sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <Typography className={s.kpiTitle} sx={{ color: c.color, fontSize: 13, fontWeight: 800 }}>
                  {c.title}
                </Typography>
                <Typography className={s.kpiValue} sx={{ color: c.color, fontSize: 28, fontWeight: 900 }}>
                  {c.value}
                </Typography>
                <Box className={s.kpiFoot}>
                  <Typography className={s.kpiSub} sx={{ fontSize: 12, fontWeight: 500 }}>
                    {c.sub}
                  </Typography>
                  {i !== 1 && <this.Delta value={c.delta} />}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  renderDonut = (themeHex) => {
    const { kpis } = this.state;
    const data = [
      { name: "판정대기", value: kpis.wait || 0, color: "#26c6da"},
      { name: "RWK", value: kpis.rwk || 0, color: "#42a5f5" },
      { name: "폐기", value: kpis.scrap || 0, color: "#ab47bc" },
    ];
    const total = data.reduce((s, d) => s + d.value, 0);

    return (
      <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: themeHex, fontWeight: 800 }}>
            <PieChartIcon /> 주요 불량 구성
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 280, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={2}>
                {data.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Pie>
              <RTooltip formatter={(v, n) => [`${fmtInt(v)} (${fmtPct((v / (total || 1)) * 100, 0)})`, n]} />
            </PieChart>
          </ResponsiveContainer>

        {/* 중앙 합계 라벨 */}
          <Box sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", pointerEvents: "none" }}>
            <Typography sx={{ fontSize: 12, color: "#90a4ae" }}>총 불량</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#263238" }}>
              {fmtInt(total)}
            </Typography>
          </Box>
        </Box>

        <Box className={s.legendRow}>
          {data.map((d, i) => (
            <span key={i} className={s.legendItem}>
              <span className={s.legendDot} style={{ background: d.color }} />
              {d.name} <b>{fmtInt(d.value)}</b>
            </span>
          ))}
        </Box>
      </Paper>
    );
  };

  renderPareto = (themeHex) => {
    const { byType } = this.state;
    const total = byType.reduce((s, x) => s + (x.qty || 0), 0) || 1;
    let cum = 0;
    const data = byType.map(d => {
      cum += d.qty || 0;
      const rate = Math.min(100, (cum / total) * 100);
      return { ...d, cumRate: Math.round(rate * 100) / 100 };
    });

    return (
      <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: themeHex, fontWeight: 800}}>
            <BarChartIcon /> 불량유형 파레토
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="type" axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" axisLine={false} tickLine={false} />
              <YAxis
                yAxisId="right"
                orientation="right"
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => fmtPct(v, 0)}
                domain={[0, 100]}
              />
              <RTooltip
                formatter={(value, name, { payload }) => {
                  if (name === "수량") return [fmtInt(value), "수량"];
                  if (name === "누적(%)") return [fmtPct(payload.cumRate, 2), "누적(%)"];
                  return [value, name];
                }}
              />
              <Bar yAxisId="left" dataKey="qty" name="수량" radius={[4, 4, 0, 0]}>
                {data.map((_, i) => <Cell key={i} fill={palette[i % palette.length]} />)}
              </Bar>
              <Line yAxisId="right" type="monotone" dataKey="cumRate" name="누적(%)" stroke="#90a4ae" dot={false} />
              <ReferenceLine yAxisId="right" y={80} stroke="#ff7043" strokeDasharray="4 4" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    );
  };

  renderTrend = (themeHex) => {
    const { trend, showDefectBars } = this.state;
    const ma = this.movingAvg(trend, "defectRate", 7);
    const data = ma.map(d => {
      const good = d.good || 0;
      const defect = d.defect || 0;
      const total = good + defect;
      const defectPct = total ? (defect / total) * 100 : 0;
      return { ...d, rate: d.defectRate || 0, defect, defectPct };
    });

    const x1 = data.length > 7 ? data[data.length - 7].date : null;
    const x2 = data.length ? data[data.length - 1].date : null;
    const target = 1.0;

    return (
      <Paper className={s.section}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: themeHex, fontWeight: 800 }}>
            <BugIcon /> 실시간 불량 모니터링(추이)
          </Typography>
          <FormControlLabel
            control={<Switch size="small" checked={showDefectBars} onChange={(e) => this.setState({ showDefectBars: e.target.checked })} />}
            label="불량수량 표시"
          />
        </Box>

        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }} barCategoryGap="55%">
              <defs>
                <linearGradient id="defectRateFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff7043" stopOpacity={0.32} />
                  <stop offset="100%" stopColor="#ff7043" stopOpacity={0.04} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" tickFormatter={(v) => `${v}%`} />
              <RTooltip
                formatter={(v, n, ctx) => {
                  if (n === "불량률(%)" || n === "7일 평균(%)") return [`${Number(v).toFixed(2)}%`, n];
                  if (n === "불량수량(%)") {
                    const raw = ctx?.payload?.defect ?? 0;
                    return [`${fmtInt(raw)}건 (${fmtPct(v, 2)})`, n];
                  }
                  return [v, n];
                }}
                labelFormatter={(label) => `날짜: ${label}`}
              />
              <Legend verticalAlign="top" height={28} iconType="circle" iconSize={14}
                      wrapperStyle={{ fontWeight: 700, letterSpacing: ".2px" }}
                      formatter={(value) => <span style={{ fontWeight: 700 }}>{value}</span>} />

              {x1 && x2 && <ReferenceArea x1={x1} x2={x2} yAxisId="left" fill="#ff7043" fillOpacity={0.05} />}
              <ReferenceLine yAxisId="left" y={target} stroke="#90a4ae" strokeDasharray="5 5" />

              {showDefectBars && (
                <Bar yAxisId="left" dataKey="defectPct" name="불량수량(%)" fill="rgba(255,193,7,.45)" stroke="none" barSize={10} radius={[3,3,0,0]} />
              )}

              <Area yAxisId="left" type="monotone" dataKey="rate" name="불량률(%)" stroke="#ff7043" fill="url(#defectRateFill)" />
              <Line yAxisId="left" type="monotone" dataKey="ma" name="7일 평균(%)" stroke="#42a5f5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    );
  };

  RateChip = ({ value, delta }) => {
    const v = typeof value === "number" ? value : Number(value) || 0;
    const d = typeof delta === "number" ? delta : Number(delta) || 0;
    const color = v >= 1 ? "error" : v >= 0.5 ? "warning" : "success";
    const arrow = d > 0 ? "↑" : d < 0 ? "↓" : "→";
    return <Chip size="small" color={color} variant="outlined" label={`${v.toFixed(2)}% ${arrow}`} sx={{ fontWeight: 700 }} />;
  };

  renderDailyTable = (themeHex) => {
    const { trend } = this.state;
    const last8 = trend.slice(-8);
    const withDelta = last8.map((r, i) => ({ ...r, delta: i === 0 ? 0 : (r.defectRate || 0) - (last8[i - 1].defectRate || 0) }));
    const rows = withDelta.slice(1).reverse();

    return (
      <Paper className={s.section}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ fontWeight: 800 }}>최근 7일 일자별 요약</Typography>
        </Box>
        <TableContainer
          sx={{
            maxHeight: 380,
            borderRadius: 1,
            "& .MuiTableCell-head": {
              position: "sticky", top: 0, backgroundColor: themeHex, color: "#333", zIndex: 1, fontWeight: 800,
            },
          }}
        >
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>근무일자</TableCell>
                <TableCell align="right">양품수량</TableCell>
                <TableCell align="right">판정대기</TableCell>
                <TableCell align="right">RWK</TableCell>
                <TableCell align="right">폐기</TableCell>
                <TableCell align="right">불량수량</TableCell>
                <TableCell align="center">불량률(%)·증감</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r, i) => (
                <TableRow key={i} sx={{ "&:nth-of-type(odd)": { backgroundColor: "#fcfcfc" } }}>
                  <TableCell>{r.date}</TableCell>
                  <TableCell align="right">{fmtInt(r.good)}</TableCell>
                  <TableCell align="right">{fmtInt(r.wait)}</TableCell>
                  <TableCell align="right">{fmtInt(r.rwk)}</TableCell>
                  <TableCell align="right">{fmtInt(r.scrap)}</TableCell>
                  <TableCell align="right">{fmtInt(r.defect)}</TableCell>
                  <TableCell align="center"><this.RateChip value={r.defectRate || 0} delta={r.delta || 0} /></TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow><TableCell colSpan={7} align="center">데이터가 없습니다.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  };

  render() {
    const { themeHex } = this.props;
    const { error, loading } = this.state;

    return (
      <Box className={s.root}>

        {/* 헤더 섹션 */}
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
            <TrendingUp /> 불량 데이터 차트
          </Typography>
          <Typography variant="body1" color="text.secondary">
            불량 현황을 차트와 표로 한눈에 파악할 수 있습니다.
          </Typography>
        </Box>

        {/* ▶ 검사내역 그리드와 동일한 필터바 */}
        {this.renderFilterBar()}

        {/* 에러 표시 */}
        {error && (
          <Box sx={{ mb: 2 }}>
            <Paper sx={{ p: 2, borderLeft: `4px solid ${themeHex}` }}>
              <Typography color="error" sx={{ mb: 1 }}>차트 데이터를 불러오지 못했습니다.</Typography>
              <Button variant="contained" onClick={this.loadAll} sx={{ backgroundColor: themeHex, "&:hover": { backgroundColor: "#f57c00" } }}>
                다시 시도
              </Button>
            </Paper>
          </Box>
        )}

        {/* KPI + 차트들 */}
        {this.renderKpis()}
        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>{this.renderDonut(themeHex)}</Grid>
          <Grid item xs={12} md={7} sx={{ display: 'flex' }}>{this.renderPareto(themeHex)}</Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>{this.renderTrend(themeHex)}</Box>
        {this.renderDailyTable(themeHex)}

        {/* 로딩 스피너(상단 고정용 간단 표시) */}
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
