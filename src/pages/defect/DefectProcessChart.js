// import React, { Component } from "react";
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
// import s from "./DefectProcessChart.module.scss";
// import config from "../../config";

// const palette = ["#ff7043", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc", "#26c6da", "#ec407a", "#7e57c2", "#8d6e63", "#26a69a"];
// const mainColor = "#ff7043"; //#ffb300

// // 숫자/퍼센트 표기 헬퍼
// const fmtInt = (v) => (Number(v) || 0).toLocaleString();
// const fmtPct = (v, digits = 2) => `${(Number(v) || 0).toFixed(digits)}%`;

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

//   renderTopBar = () => {
//     const { filters, loading } = this.state;
//     return (
//       <Box className={s.topbar}>
//         <Box className={s.titleWrap}>
//           <Typography variant="caption" className={s.breadcrumb} sx={{ fontWeight: 700 }}>
//             프레스
//           </Typography>
//           <Typography variant="h5" className={s.pageTitle}>
//             <Box component="span" sx={{ fontWeight: 900 }}>기간별 생산 및 불량률 현황 리포트</Box>
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

//   renderDonut = () => {
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
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
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

//   renderPareto = () => {
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
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800}}>
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
//   renderTrend = () => {
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
//           <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
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
//   renderDailyTable = () => {
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
//               backgroundColor: mainColor,   // 헤더 배경색
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
//     return (
//       <Box className={s.root}>
//         {this.renderTopBar()}
//         {this.renderKpis()}

//         <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
//           <Grid item xs={12} md={5} sx={{ display: 'flex' }}>{this.renderDonut()}</Grid>
//           <Grid item xs={12} md={7} sx={{ display: 'flex' }}>{this.renderPareto()}</Grid>
//         </Grid>

//         <Box sx={{ mb: 2 }}>{this.renderTrend()}</Box>
//         {this.renderDailyTable()}
//       </Box>
//     );
//   }
// }

// export default DefectProcessChart;

import React, { Component } from "react";
import {
  Box, Paper, Typography, Grid, Card, CardContent, TextField,
  FormControl, InputLabel, Select, MenuItem, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Tooltip, Chip, InputAdornment,
  FormControlLabel, Switch, Button
} from "@mui/material";
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
  RestartAlt as ResetIcon,
} from "@mui/icons-material";
import s from "./DefectProcessChart.module.scss";
import config from "../../config";

const palette = ["#ff7043", "#ffa726", "#66bb6a", "#42a5f5", "#ab47bc", "#26c6da", "#ec407a", "#7e57c2", "#8d6e63", "#26a69a"];
const mainColor = "#ff7043"; //#ffb300

// 숫자/퍼센트 표기 헬퍼
const fmtInt = (v) => (Number(v) || 0).toLocaleString();
const fmtPct = (v, digits = 2) => `${(Number(v) || 0).toFixed(digits)}%`;

// ✅ 필터 기본값 헬퍼
const getDefaultFilters = () => ({
  start_date: new Date(new Date().getFullYear(), 0, 1).toLocaleDateString("sv-SE"),
  end_date: new Date().toLocaleDateString("sv-SE"),
  workplace: "",
  carModel: "",
  orderType: "",
  defectCode: "",
  defectType: "",
  worker: "",
  topN: 10,
});

class DefectProcessChart extends Component {
  state = {
    // 필터
    filters: getDefaultFilters(),
    // 데이터
    kpis: { good: 0, defect: 0, wait: 0, rwk: 0, scrap: 0, throughput: 0, defectRate: 0, scrapRate: 0, rwkRate: 0 },
    byType: [],
    trend: [],
    stacked: [],
    // UI
    loading: false,
    error: "",
    // KPI 증감(최근 7일 vs 직전 7일)
    delta: { defectRate: 0, monthlyDefect: 0, weeklyDefect: 0 },
    // 트렌드 옵션
    showDefectBars: false, // ← 기본 비표시
  };

  componentDidMount() {
    const saved = localStorage.getItem("defectFilters");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.setState({ filters: { ...this.state.filters, ...parsed } }, this.loadAll);
        return;
      } catch {}
    }
    this.loadAll();
  }

  handleFilterChange = (field, value) => {
    // ⚠️ 즉시 저장하지 않고 상태만 변경 (저장은 검색 시점에)
    this.setState(prev => {
      const filters = { ...prev.filters, [field]: value };
      return { filters };
    });
  };

  // KPI 증감 계산 (최근7일/직전7일, 월/주 불량률 근사)
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

  // 7일 이동평균 계산
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

  // ✅ 검색 실행 (이 시점에만 로컬스토리지 저장)
  loadAll = async () => {
    const { filters } = this.state;
    // 저장 타이밍: 검색 버튼 클릭 또는 최초 로드 시
    try { localStorage.setItem("defectFilters", JSON.stringify(filters)); } catch {}

    this.setState({ loading: true, error: "" });
    try {
      const headers = { "Content-Type": "application/json" };
      const body = JSON.stringify(filters);

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

  // ✅ 초기화(필터 기본값 + 로컬스토리지 삭제 + 즉시 재조회)
  resetFilters = () => {
    const defaults = getDefaultFilters();
    this.setState({ filters: defaults }, () => {
      try { localStorage.removeItem("defectFilters"); } catch {}
      this.loadAll();
    });
  };

  // CSV 내보내기(파레토 + 추이)
  exportCsv = () => {
    const { byType, trend } = this.state;
    const rows = [
      ["[Pareto] type", "qty"],
      ...byType.map(r => [r.type, r.qty]),
      [],
      ["[Trend] date", "good", "defect", "wait", "rwk", "scrap", "defectRate(%)"],
      ...trend.map(d => [d.date, d.good, d.defect, d.wait, d.rwk, d.scrap, (Number(d.defectRate) || 0).toFixed(2)]),
    ];
    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `defect_charts_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ───────────────────────────── Renderers ─────────────────────────────

  renderTopBar = () => {
    const { loading } = this.state;
    return (
      <Box className={s.topbar}>
        <Box className={s.titleWrap}>
          <Typography variant="caption" className={s.breadcrumb} sx={{ fontWeight: 700 }}>
            프레스
          </Typography>
          <Typography variant="h5" className={s.pageTitle}>
            <Box component="span" sx={{ fontWeight: 900 }}>기간별 생산 및 불량률 현황 리포트</Box>
          </Typography>
          <Typography variant="body2" className={s.pageDesc} sx={{ fontWeight: 400 }}>
            생산 성과 및 품질 지표에 대한 상세 분석 리포트
          </Typography>
        </Box>

        <Box className={s.tools}>
          <TextField
            size="small"
            placeholder="불량유형 검색"
            value={this.state.filters.defectType}
            onChange={(e) => this.handleFilterChange("defectType", e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ opacity: 0.6 }} />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            label="시작일" type="date" size="small" InputLabelProps={{ shrink: true }}
            value={this.state.filters.start_date} onChange={(e) => this.handleFilterChange("start_date", e.target.value)}
          />
          <TextField
            label="종료일" type="date" size="small" InputLabelProps={{ shrink: true }}
            value={this.state.filters.end_date} onChange={(e) => this.handleFilterChange("end_date", e.target.value)}
          />
          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel id="topn">Top N</InputLabel>
            <Select labelId="topn" label="Top N" value={this.state.filters.topN}
                    onChange={(e) => this.handleFilterChange("topN", e.target.value)}>
              {[5, 10, 15, 20].map(n => <MenuItem key={n} value={n}>{n}</MenuItem>)}
            </Select>
          </FormControl>

          {/* 검색 버튼 */}
          <Button
            variant="contained"
            color="warning"
            size="small"
            startIcon={<SearchIcon />}
            onClick={this.loadAll}
            disabled={loading}
          >
            검색
          </Button>

          {/* 초기화 버튼 */}
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ResetIcon />}
            onClick={this.resetFilters}
            disabled={loading}
          >
            초기화
          </Button>

          {/* CSV 내보내기 */}
          <Tooltip title="CSV 내보내기">
            <IconButton onClick={this.exportCsv} sx={{ color: "#607d8b" }}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    );
  };

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
              <CardContent
                className={s.kpiBody}
                sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
              >
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

  renderDonut = () => {
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
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
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
          <Box sx={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center",
            justifyContent: "center", flexDirection: "column", pointerEvents: "none"
          }}>
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

  renderPareto = () => {
    const { byType } = this.state;
    const total = byType.reduce((s, x) => s + (x.qty || 0), 0) || 1;
    let cum = 0;
    const data = byType.map(d => {
      cum += d.qty || 0;
      const rate = Math.min(100, (cum / total) * 100); // 100% 초과 방지
      return { ...d, cumRate: Math.round(rate * 100) / 100 };
    });

    return (
      <Paper className={s.section} sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800}}>
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
              {/* 80% 기준선 */}
              <ReferenceLine yAxisId="right" y={80} stroke="#ff7043" strokeDasharray="4 4" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    );
  };

  // ── 실시간 불량 모니터링(추이): ComposedChart + 최근 7일 하이라이트/목표선/정규화 막대 ──
  renderTrend = () => {
    const { trend, showDefectBars } = this.state;
    const ma = this.movingAvg(trend, "defectRate", 7);
    const data = ma.map(d => {
      const good = d.good || 0;
      const defect = d.defect || 0;
      const total = good + defect;
      const defectPct = total ? (defect / total) * 100 : 0; // ← 퍼센트 축으로 정규화
      return {
        ...d,
        rate: d.defectRate || 0,
        defect,
        defectPct,
      };
    });

    const x1 = data.length > 7 ? data[data.length - 7].date : null;
    const x2 = data.length ? data[data.length - 1].date : null;
    const target = 1.0; // 목표 불량률(%)

    return (
      <Paper className={s.section}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx={{ color: mainColor, fontWeight: 800 }}>
            <BugIcon /> 실시간 불량 모니터링(추이)
          </Typography>

          {/* 우측 옵션: 불량수량 막대 표시 */}
          <FormControlLabel
            control={
              <Switch
                size="small"
                checked={showDefectBars}
                onChange={(e) => this.setState({ showDefectBars: e.target.checked })}
              />
            }
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
              {/* 왼쪽: % 축 (불량률 및 정규화 막대 함께 사용) */}
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
              <Legend
                verticalAlign="top"
                height={28}
                iconType="circle"
                iconSize={14}
                wrapperStyle={{ fontWeight: 700, letterSpacing: ".2px" }}
                formatter={(value) => <span style={{ fontWeight: 700 }}>{value}</span>}
              />

              {/* 최근 7일 하이라이트(옅게) */}
              {x1 && x2 && (
                <ReferenceArea x1={x1} x2={x2} yAxisId="left" fill="#ff7043" fillOpacity={0.05} />
              )}

              {/* 목표선(%) */}
              <ReferenceLine yAxisId="left" y={target} stroke="#90a4ae" strokeDasharray="5 5" />

              {/* 선택 시에만 정규화 막대 표시 */}
              {showDefectBars && (
                <Bar
                  yAxisId="left"
                  dataKey="defectPct"
                  name="불량수량(%)"
                  fill="rgba(255,193,7,.45)"
                  stroke="none"
                  barSize={10}
                  radius={[3,3,0,0]}
                />
              )}

              <Area yAxisId="left" type="monotone" dataKey="rate" name="불량률(%)" stroke="#ff7043" fill="url(#defectRateFill)" />
              <Line yAxisId="left" type="monotone" dataKey="ma" name="7일 평균(%)" stroke="#42a5f5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </Box>
      </Paper>
    );
  };

  // 불량률 Chip (색상/증감)
  RateChip = ({ value, delta }) => {
    const v = typeof value === "number" ? value : Number(value) || 0;
    const d = typeof delta === "number" ? delta : Number(delta) || 0;
    const color = v >= 1 ? "error" : v >= 0.5 ? "warning" : "success";
    const arrow = d > 0 ? "↑" : d < 0 ? "↓" : "→";
    return <Chip size="small" color={color} variant="outlined" label={`${v.toFixed(2)}% ${arrow}`} sx={{ fontWeight: 700 }} />;
  };

  // ── 최근 7일 표: sticky header + 증감 Chip ──
  renderDailyTable = () => {
    const { trend } = this.state;
    const last8 = trend.slice(-8); // 증감계산용 +1
    const withDelta = last8.map((r, i) => ({
      ...r,
      delta: i === 0 ? 0 : (r.defectRate || 0) - (last8[i - 1].defectRate || 0),
    }));
    const rows = withDelta.slice(1).reverse(); // 최근이 위로

    return (
      <Paper className={s.section}>
        <Box className={s.sectionHeader}>
          <Typography className={s.sectionTitle} sx = {{ fontWeight: 800 }}>최근 7일 일자별 요약</Typography>
        </Box>
        <TableContainer
          sx={{
            maxHeight: 380,
            borderRadius: 1,
            "& .MuiTableCell-head": {
              position: "sticky",
              top: 0,
              backgroundColor: mainColor,   // 헤더 배경색
              color: "#333",                 // 헤더 글자색 (필요하면 #fff 로)
              zIndex: 1,
              fontWeight: 800,
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
                  <TableCell align="center">
                    <this.RateChip value={r.defectRate || 0} delta={r.delta || 0} />
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">데이터가 없습니다.</TableCell>
                </TableRow>
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

        <Grid container spacing={2} sx={{ mb: 2 }} alignItems="stretch">
          <Grid item xs={12} md={5} sx={{ display: 'flex' }}>{this.renderDonut()}</Grid>
          <Grid item xs={12} md={7} sx={{ display: 'flex' }}>{this.renderPareto()}</Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>{this.renderTrend()}</Box>
        {this.renderDailyTable()}
      </Box>
    );
  }
}

export default DefectProcessChart;
