import React, { useState, useEffect } from "react";
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
import styles from "./ProductForecast.module.scss";

export default function ProductForecast() {
  const [selectedSku, setSelectedSku] = useState("SKU1");
  const [hourlyData, setHourlyData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [loading, setLoading] = useState(false);

  // ✅ 초 → HH:MM 변환 함수
  const secondsToHHMM = (sec) => {
    if (sec === null || sec === undefined) return "";
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  // ✅ 시간별/일별 데이터 API 호출
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 시간별
        const hourlyRes = await fetch("http://localhost:8000/smartFactory/forecast/hourly", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku: selectedSku }),
        });
        const hourlyJson = await hourlyRes.json();

        // 일별
        const dailyRes = await fetch("http://localhost:8000/smartFactory/forecast/daily", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sku: selectedSku }),
        });
        const dailyJson = await dailyRes.json();

        setHourlyData(hourlyJson.data || []);
        setDailyData(dailyJson.data || []);
      } catch (err) {
        console.error("❌ 데이터 가져오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSku]);

  // ✅ recharts용 데이터 변환
  const timeData = hourlyData.map((d) => ({
    time: `${secondsToHHMM(d.slot_start)}~${secondsToHHMM(d.slot_end)}`,
    actual: d.actual,
    predicted: d.prediction,
  }));

  const visibleTimeData = timeData;

  const visibleDailyData = dailyData.map((d) => ({
    date: d.date,
    actual: d.actual,
    predicted: d.pred,
  }));

  // ✅ DataGrid 행 데이터 (실수는 소수점 2자리, 실적은 정수)
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

  // ✅ 공정 단계별 현황 (평균값 → % 표시)
  const avgUtil = {
    blanking: ((hourlyData.reduce((a, b) => a + (b.blanking_util || 0), 0) / (hourlyData.length || 1)) * 100).toFixed(2),
    press: ((hourlyData.reduce((a, b) => a + (b.press_util || 0), 0) / (hourlyData.length || 1)) * 100).toFixed(2),
    assembly: ((hourlyData.reduce((a, b) => a + (b.assembly_util || 0), 0) / (hourlyData.length || 1)) * 100).toFixed(2),
  };

  // ✅ KPI 지표 (마지막 row 사용, % 변환)
  const lastRow = hourlyData[hourlyData.length - 1] || {};
  const kpi = {
    uph: lastRow.uph?.toFixed(2) || "-",
    actual: lastRow.actual ? Math.round(lastRow.actual) : "-", // 정수
    uphAchievement: lastRow.uph_achievement_pct ? (lastRow.uph_achievement_pct * 100).toFixed(2) : "-",
    target: lastRow.daily_target || "-",
    cumActual: lastRow.cum_actual_today ? Math.round(lastRow.cum_actual_today) : "-", // 정수
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

  // ✅ 교대별 데이터 매칭 (slot_start/slot_end 초단위를 HH:MM으로 변환 후 비교)
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

  return (
    <Box className={styles.pageWrapper}>
      {/* 상단 제목 */}
      <Box display="flex" justifyContent="space-between" alignItems="center" marginBottom={2}>
        <Typography variant="h4" fontWeight="bold">
          생산량 예측
        </Typography>
      </Box>

      {/* SKU 선택 */}
      <Box display="flex" justifyContent="flex-start" alignItems="center" marginBottom={3}>
        <Typography variant="h6" style={{ marginRight: 12 }}>
          분석 대상 SKU 선택
        </Typography>
        <FormControl size="medium">
          <Select
            value={selectedSku}
            onChange={(e) => setSelectedSku(e.target.value)}
            style={{ minWidth: 160, fontWeight: "bold" }}
          >
            <MenuItem value="SKU1">SKU1</MenuItem>
            <MenuItem value="SKU2">SKU2</MenuItem>
            <MenuItem value="SKU3">SKU3</MenuItem>
            <MenuItem value="SKU4">SKU4</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* 1) 공정 단계별 현황 */}
      <Card className={styles.sectionCard}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            공정 단계별 현황
          </Typography>
          <Grid container spacing={2} marginTop={1}>
            <Grid item xs={4}>
              <Box className={styles.infoBox}>
                <Typography variant="subtitle2">블랭킹 가동률</Typography>
                <Typography variant="h6" fontWeight="bold">{avgUtil.blanking}%</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box className={styles.infoBox}>
                <Typography variant="subtitle2">프레스 가동률</Typography>
                <Typography variant="h6" fontWeight="bold">{avgUtil.press}%</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box className={styles.infoBox}>
                <Typography variant="subtitle2">조립셀 가동률</Typography>
                <Typography variant="h6" fontWeight="bold">{avgUtil.assembly}%</Typography>
              </Box>
            </Grid>
          </Grid>
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
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ marginBottom: 10 }} />
                    <Line type="monotone" dataKey="actual" stroke="#82ca9d" name="실제" />
                    <Scatter dataKey="predicted" fill="#ff7300" name="예측" />
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
                      <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
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
                      <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
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

      {/* 3) 교대별 생산량 */}
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

      {/* 4) 일자별 생산량 */}
      <Card className={styles.sectionCard}>
        <CardContent>
          <Typography variant="h6" gutterBottom>일자별 실제 vs 예측</Typography>
          <Box display="flex" justifyContent="center">
            <div style={{ width: "80%", height: 400 }}>
              <ResponsiveContainer>
                <ComposedChart data={visibleDailyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend verticalAlign="top" align="right" wrapperStyle={{ marginBottom: 10 }} />
                  <Line type="monotone" dataKey="predicted" stroke="#ff7300" strokeWidth={3} name="예측" />
                  <Area type="monotone" dataKey="actual" fill="rgba(130, 202, 157, 0.7)" stroke="#82ca9d" name="실제" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Box>
          <div style={{ height: 400, width: "100%", marginTop: 16 }}>
            <DataGrid rows={tableRows} columns={tableColumns} pageSize={5} autoHeight />
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
