import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectThemeHex } from "../../reducers/layout";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  FormControl,
  Button,
  TextField,
  CardHeader,
  IconButton,
  CircularProgress,
} from "@mui/material";
import {
  ComposedChart,
  Line,
  Scatter,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Area,
  ResponsiveContainer,
} from "recharts";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import styles from "./ProductForecast.module.scss";
import config from "../../config";


// ✅ fetchJson 유틸
const fetchJson = async (url, options = {}, key = "API") => {
  const res = await fetch(url, options);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${key} 실패: HTTP ${res.status} ${txt}`);
  }
  return res.json();
};

const API = (path) => `${config.baseURLApi}/smartFactory${path}`;

// ✅ CustomTooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const showLabel = label && label !== "NaN" && label !== "NaN~NaN" && label !== "-";
    return (
      <div style={{ background: "white", border: "1px solid #ccc", padding: "8px" }}>
        {showLabel && <div><b>시간:</b> {label}</div>}
        {payload.map((entry, index) => (
          <div key={index}>
            {entry.name}: {Number(entry.value).toFixed(2)}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function ProductForecast() {
  // ✅ Redux에서 themeHex 가져오기
  const themeHex = useSelector(selectThemeHex);

  const [selectedSku, setSelectedSku] = useState("SKU1");
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);

  // ✅ 로딩/에러 상태
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [loading, setLoading] = useState({ hourly: false, daily: false });
  const [error, setError] = useState({ hourly: null, daily: null });

  // ✅ 검색 필터 상태
  const [quickRange, setQuickRange] = useState("month");
  const [filters, setFilters] = useState({
    start_work_date: "2024-01-01",
    end_work_date: "2025-06-30",
  });
  
  
  
  
  
  // const [filterExpanded, setFilterExpanded] = useState(false);

  // // ✅ 초 → HH:MM 변환 함수
  // const secondsToHHMM = (sec) => {
  //   if (sec === null || sec === undefined) return "";
  //   const h = Math.floor(sec / 3600);
  //   const m = Math.floor((sec % 3600) / 60);
  //   return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  // };

  // // ✅ 시간별/일별 데이터 API 호출
  // useEffect(() => {
  //   const fetchData = async () => {
  //     setLoading(true);
  //     try {
  //       const hourlyRes = await fetch("http://localhost:8000/smartFactory/forecast/hourly", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ sku: selectedSku }),
  //       });
  //       const hourlyJson = await hourlyRes.json();

  //       const dailyRes = await fetch("http://localhost:8000/smartFactory/forecast/daily", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ sku: selectedSku }),
  //       });
  //       const dailyJson = await dailyRes.json();

  //       setHourlyData(hourlyJson.data || []);
  //       setDailyData(dailyJson.data || []);
  //     } catch (err) {
  //       console.error("❌ 데이터 가져오기 실패:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, [selectedSku]);










  // ✅ fetchHourly
  const fetchHourly = async () => {
    setLoading((s) => ({ ...s, hourly: true }));
    setError((s) => ({ ...s, hourly: null }));
    try {
      const json = await fetchJson(
        API("/forecast/hourly"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku: selectedSku }),
        },
        "hourly-forecast"
      );
      setHourlyData(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      setError((s) => ({ ...s, hourly: e.message || "시간별 데이터 조회 실패" }));
      setHourlyData([]);
    } finally {
      setLoading((s) => ({ ...s, hourly: false }));
    }
  };

  // ✅ fetchDaily
  const fetchDaily = async () => {
    setLoading((s) => ({ ...s, daily: true }));
    setError((s) => ({ ...s, daily: null }));
    try {
      const json = await fetchJson(
        API("/forecast/daily"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku: selectedSku }),
        },
        "daily-forecast"
      );
      setDailyData(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      setError((s) => ({ ...s, daily: e.message || "일별 데이터 조회 실패" }));
      setDailyData([]);
    } finally {
      setLoading((s) => ({ ...s, daily: false }));
    }
  };

  // ✅ fetchAll
  const fetchAll = useCallback(async () => {
    setPageError(null);
    setPageLoading(true);
    try {
      await Promise.all([fetchHourly(), fetchDaily()]);
    } catch {
      setPageError("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setPageLoading(false);
    }
  }, [selectedSku, filters]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ✅ 초 → HH:MM 변환
  const secondsToHHMM = (sec) => {
    if (sec === null || sec === undefined) return "";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };








  // ✅ recharts용 데이터 변환 (문자열 보장)
  const timeData = hourlyData.map((d) => {
    const start = secondsToHHMM(d.slot_start);
    const end = secondsToHHMM(d.slot_end);
    return {
      time: start && end ? `${start}~${end}` : "-",
      actual: d.actual,
      predicted: d.prediction,
    };
  });
  const visibleTimeData = timeData;

  const visibleDailyData = dailyData.map((d) => ({
    date: d.date,
    actual: d.actual,
    predicted: d.pred,
  }));

  // ✅ DataGrid 행 데이터
  const tableRows = dailyData.map((d, idx) => ({
    id: idx + 1,
    date: d.date,
    predicted: d.pred ? Number(d.pred).toFixed(2) : "-",
    actual: d.actual ? Math.round(d.actual) : "-",
    diff: d.error ? Number(d.error).toFixed(2) : "-",
    absDiff: d.abs_error ? Number(d.abs_error).toFixed(2) : "-",
    acc: d.pct_error ? `${(100 - d.pct_error).toFixed(2)}%` : "-",
    uph: d.hourly_avg ? Number(d.hourly_avg).toFixed(2) : "-",
  }));

  const tableColumns = [
    { field: "date", headerName: "날짜", flex: 1 },
    { field: "predicted", headerName: "예측 생산량", flex: 1 },
    { field: "actual", headerName: "실제 생산량", flex: 1 },
    { field: "diff", headerName: "오차", flex: 1 },
    { field: "absDiff", headerName: "절대오차", flex: 1 },
    { field: "acc", headerName: "예측 정확도", flex: 1 },
    { field: "uph", headerName: "시간당 생산량", flex: 1 },
  ];














  // ✅ 공정 단계별 현황
  const avgUtil = {
    blanking: ((hourlyData.reduce((a, b) => a + (b.blanking_util || 0), 0) / (hourlyData.length || 1)) * 100).toFixed(2),
    press: ((hourlyData.reduce((a, b) => a + (b.press_util || 0), 0) / (hourlyData.length || 1)) * 100).toFixed(2),
    assembly: ((hourlyData.reduce((a, b) => a + (b.assembly_util || 0), 0) / (hourlyData.length || 1)) * 100).toFixed(2),
  };

  // ✅ KPI 지표
  const lastRow = hourlyData[hourlyData.length - 1] || {};
  const kpi = {
    uph: lastRow.uph?.toFixed(2) || "-",
    actual: lastRow.actual ? Math.round(lastRow.actual) : "-",
    uphAchievement: lastRow.uph_achievement_pct ? (lastRow.uph_achievement_pct * 100).toFixed(2) : "-",
    target: lastRow.daily_target || "-",
    cumActual: lastRow.cum_actual_today ? Math.round(lastRow.cum_actual_today) : "-",
    achievement: lastRow.current_achievement_pct ? (lastRow.current_achievement_pct * 100).toFixed(2) : "-",
  };

  // ✅ 교대별 시간대 고정
  const dayShiftTimes = [
    ["07:50", "08:50"],
    ["08:50", "10:00"],
    ["10:00", "11:00"],
    ["11:00", "12:40"],
    ["12:40", "13:40"],
    ["13:40", "14:50"],
    ["14:50", "15:50"],
    ["15:50", "17:10"],
    ["17:10", "18:10"],
    ["18:10", "19:10"],
    ["19:10", "20:40"],
  ];

  const nightShiftTimes = [
    ["20:40", "21:40"],
    ["21:40", "22:40"],
    ["22:40", "23:40"],
    ["23:40", "00:30"],
    ["00:30", "01:30"],
    ["01:30", "02:30"],
    ["02:30", "03:30"],
    ["03:30", "05:00"],
    ["05:00", "06:00"],
    ["06:00", "07:00"],
    ["07:00", "07:50"],
  ];

  const getShiftData = (timeRanges) =>
    timeRanges.map(([start, end]) => {
      const found = hourlyData.find(
        (d) =>
          secondsToHHMM(d.slot_start) === start &&
          secondsToHHMM(d.slot_end) === end
      );
      return {
        start,
        end,
        actual: found ? Math.round(found.actual || 0) : "",
      };
    });

  const dayShift = getShiftData(dayShiftTimes);
  const nightShift = getShiftData(nightShiftTimes);

  // ✅ 필터 값 변경 핸들러
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };








  // ✅ 조건부 렌더링
  if (pageLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress size={60} sx={{ color: themeHex }} />
      </Box>
    );
  }
  if (pageError || error.hourly || error.daily) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">
          ❌ {pageError || error.hourly || error.daily}
        </Typography>
        <Button onClick={fetchAll} sx={{ mt: 2, backgroundColor: themeHex }} variant="contained">
          다시 시도
        </Button>
      </Box>
    );
  }







  return (
    <Box className={styles.pageWrapper}>
      {/* ✅ 상단 제목 + 설명 */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", color: themeHex }}
        >
          생산량 예측
        </Typography>
        <Typography variant="body1" color="text.secondary">
          생산 예측 결과를 시각화하여 계획과 실적을 쉽게 비교할 수 있습니다.
        </Typography>
      </Box>

      {/* 검색 필터 섹션 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        {/* 헤더 */}
        <CardHeader
          title={
            <Typography
              variant="h6"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                color: "white",
              }}
            >
              <SearchIcon />
              검색 조건
            </Typography>
          }
          sx={{
            backgroundColor: themeHex,
            color: "white",
            borderRadius: 1,
            mb: 2,
          }}
        />

        {/* 바디 (주간/월간 + 기간선택 + SKU 선택) */}
        <Grid container spacing={2} alignItems="center">
          {/* 주간/월간 버튼 */}
          <Grid item>
            <Box sx={{ display: "flex", gap: 1 }}>
              {["week", "month"].map((range) => (
                <Button
                  key={range}
                  size="small"
                  variant={quickRange === range ? "contained" : "outlined"}
                  onClick={() => setQuickRange(range)}
                  sx={{
                    borderColor: themeHex,
                    color: quickRange === range ? "white" : themeHex,
                    backgroundColor: quickRange === range ? themeHex : "transparent",
                    "&:hover": {
                      backgroundColor:
                        quickRange === range ? themeHex : "rgba(255,143,0,0.08)",
                    },
                  }}
                >
                  {range === "week" ? "주간" : "월간"}
                </Button>
              ))}
            </Box>
          </Grid>

          {/* 기간선택 */}
          <Grid item>
            <Typography sx={{ mr: 1 }}>기간선택</Typography>
          </Grid>
          <Grid item>
            <TextField
              type="date"
              value={filters.start_work_date}
              onChange={(e) => handleFilterChange("start_work_date", e.target.value)}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
            />
          </Grid>
          <Grid item>
            <Typography>~</Typography>
          </Grid>
          <Grid item>
            <TextField
              type="date"
              value={filters.end_work_date}
              onChange={(e) => handleFilterChange("end_work_date", e.target.value)}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 150 }}
            />
          </Grid>

          {/* SKU 선택 */}
          <Grid item>
            <Typography sx={{ ml: 2 }}>분석 대상 SKU</Typography>
          </Grid>
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 120, backgroundColor: "white", borderRadius: 1 }}>
              <Select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                sx={{ fontWeight: "bold" }}
              >
                <MenuItem value="SKU1">SKU1</MenuItem>
                <MenuItem value="SKU2">SKU2</MenuItem>
                <MenuItem value="SKU3">SKU3</MenuItem>
                <MenuItem value="SKU4">SKU4</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>


      {/* 1) 일자별 생산량 */}
      <Card className={styles.sectionCard}>
        <CardContent>
          <Typography variant="h6" gutterBottom>일자별 실제 vs 예측</Typography>
          <Box display="flex" justifyContent="center">
            <div style={{ width: "80%", height: 400 }}>
              <ResponsiveContainer>
                <ComposedChart data={visibleDailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip
                    formatter={(value, name) => [Number(value).toFixed(2), name]}  // ✅ 소수점 2자리
                  />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ marginBottom: 10 }} />
                  <Line type="monotone" dataKey="predicted" stroke="#1E3A8A" strokeWidth={3} name="예측" />
                  <Area type="monotone" dataKey="actual" fill={themeHex} stroke={themeHex} name="실제" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Box>
          <div style={{ height: 400, width: "100%", marginTop: 16 }}>
            <DataGrid rows={tableRows} columns={tableColumns} pageSize={5} autoHeight />
          </div>
        </CardContent>
      </Card>

      {/* 2) 시간별 생산량 (그래프 + KPI 영역) */}
      <Grid container spacing={2} marginTop={2} marginBottom={3}>
        {/* 좌측 그래프 */}
        <Grid item xs={12} md={8}>
          <Card className={styles.sectionCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                시간별 실제 vs 예측
              </Typography>
              <div style={{ width: "100%", height: 300 }}>
                <ResponsiveContainer>
                  <ComposedChart data={visibleTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis domain={['dataMin - 10', 'dataMax + 10']} />
                    <Tooltip content={<CustomTooltip />} />   {/* ✅ 커스텀 Tooltip */}
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ marginBottom: 10 }} />
                    <Line type="monotone" dataKey="actual" stroke={themeHex} strokeWidth={3} name="실제" />
                    <Scatter dataKey="predicted" fill="#1E3A8A" name="예측" />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* 우측 KPI 그룹 */}
        <Grid item xs={12} md={4}>
          <Card className={styles.sectionCard}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                KPI 지표
              </Typography>
              <Grid container spacing={2} sx={{ height: "100%" }}>
                {/* SKU별 시간별 */}
                <Grid item xs={6} sx={{ display: "flex", height: "100%" }}>
                  <Card className={styles.kpiInnerCard}>
                    <CardContent className={styles.kpiInnerContent}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        SKU별 시간별
                      </Typography>
                      <Typography variant="body1">정미 UPH: <b>{kpi.uph}</b></Typography>
                      <Typography variant="body1">실적 UPH: <b>{kpi.actual}</b></Typography>
                      <Typography variant="h6" fontWeight="bold" color="#1E3A8A" sx={{ mt: 1 }}>
                        달성률 {kpi.uphAchievement}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                {/* SKU별 누적 */}
                <Grid item xs={6} sx={{ display: "flex", height: "100%" }}>
                  <Card className={styles.kpiInnerCard}>
                    <CardContent className={styles.kpiInnerContent}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        SKU별 누적
                      </Typography>
                      <Typography variant="body1">목표 생산량: <b>{kpi.target}</b></Typography>
                      <Typography variant="body1">누적 생산량: <b>{kpi.cumActual}</b></Typography>
                      <Typography variant="h6" fontWeight="bold" color="#1E3A8A" sx={{ mt: 1 }}>
                        달성률 {kpi.achievement}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3) 공정 단계별 현황 */}
      <Card className={styles.sectionCard}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            공정 단계별 현황
          </Typography>
          <Grid container spacing={2} marginTop={1}>
            <Grid item xs={4}>
                <Box className={styles.infoBox} sx={{ backgroundColor: themeHex }}>
                    <Typography variant="subtitle2">블랭킹 가동률</Typography>
                    <Typography variant="h6" fontWeight="bold">{avgUtil.blanking}%</Typography>
                </Box>
            </Grid>
            <Grid item xs={4}>
                <Box className={styles.infoBox} sx={{ backgroundColor: themeHex }}>
                    <Typography variant="subtitle2">프레스 가동률</Typography>
                    <Typography variant="h6" fontWeight="bold">{avgUtil.press}%</Typography>
                </Box>
            </Grid>
            <Grid item xs={4}>
                <Box className={styles.infoBox} sx={{ backgroundColor: themeHex }}>
                    <Typography variant="subtitle2">조립셀 가동률</Typography>
                    <Typography variant="h6" fontWeight="bold">{avgUtil.assembly}%</Typography>
                </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* 4) 교대별 생산량 */}
      <Card className={styles.sectionCard}>
        <CardContent>
          <Typography variant="h6">교대별 생산량</Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell align="center" colSpan={2}>주간근무</TableCell>
                  <TableCell align="center" colSpan={2}>야간근무</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>시간</TableCell>
                  <TableCell>실적</TableCell>
                  <TableCell>시간</TableCell>
                  <TableCell>실적</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dayShift.map((d, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{d.start} – {d.end}</TableCell>
                    <TableCell>{d.actual}</TableCell>
                    <TableCell>{nightShift[idx].start} – {nightShift[idx].end}</TableCell>
                    <TableCell>{nightShift[idx].actual}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
