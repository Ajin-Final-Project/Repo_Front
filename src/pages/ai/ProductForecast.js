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

// ========== Mock Data ==========
const timeData = [
  { time: "07:50~08:50", actual: 800, predicted: 820 },
  { time: "08:50~10:00", actual: 760, predicted: 780 },
  { time: "10:00~11:10", actual: 850, predicted: 860 },
  { time: "11:10~12:20", actual: 900, predicted: 890 },
  { time: "12:20~13:30", actual: 750, predicted: 770 },
];

const shiftDataDay = [
  ["07:50 – 08:50", 800],
  ["08:50 – 10:00", 760],
  ["10:00 – 11:00", 850],
  ["11:00 – 12:40", 850],
  ["12:40 – 13:40", 840],
  ["13:40 – 14:50", 830],
  ["14:50 – 15:50", 780],
  ["15:50 – 17:10", 790],
  ["17:10 – 18:10", 800],
  ["18:10 – 19:10", 810],
  ["19:10 – 20:40", 790],
];
const shiftDataNight = [
  ["20:40 – 21:40", 850],
  ["21:40 – 22:40", 860],
  ["22:40 – 23:40", 850],
  ["23:40 – 00:30", 870],
  ["00:30 – 01:30", 800],
  ["01:30 – 02:30", 790],
  ["02:30 – 03:30", 810],
  ["03:30 – 05:00", 820],
  ["05:00 – 06:00", 830],
  ["06:00 – 07:00", 800],
  ["07:00 – 07:50", 760],
];

const dailyData = [
  { date: "25.06.27", predicted: 12000, actual: 11900 },
  { date: "25.06.28", predicted: 13500, actual: 13560 },
  { date: "25.06.29", predicted: 13580, actual: 13470 },
  { date: "25.06.30", predicted: 13000, actual: 11900 },
];

const tableRows = [
  { id: 1, type: "과거", date: "25.06.27", predicted: 12000, actual: 11900, diff: -100, absDiff: 100, acc: "97%", uph: 700 },
  { id: 2, type: "과거", date: "25.06.28", predicted: 13500, actual: 13560, diff: +60, absDiff: 60, acc: "98%", uph: 800 },
  { id: 3, type: "과거", date: "25.06.29", predicted: 13580, actual: 13470, diff: -110, absDiff: 110, acc: "97%", uph: 600 },
  { id: 4, type: "현재", date: "25.06.30", predicted: 13000, actual: 11900, diff: -100, absDiff: 100, acc: "97%", uph: 700 },
];

const tableColumns = [
  { field: "type", headerName: "구분", flex: 1 },
  { field: "date", headerName: "날짜", flex: 1 },
  { field: "predicted", headerName: "예측 생산량", flex: 1 },
  { field: "actual", headerName: "실제 생산량", flex: 1 },
  { field: "diff", headerName: "오차", flex: 1 },
  { field: "absDiff", headerName: "절대오차", flex: 1 },
  { field: "acc", headerName: "예측 정확도", flex: 1 },
  { field: "uph", headerName: "시간당 생산량", flex: 1 },
];

export default function ProductForecast() {
  const [selectedSku, setSelectedSku] = useState("SKU1");

  // ✅ 시간별 그래프 애니메이션
  const [visibleCount, setVisibleCount] = useState(1);
  useEffect(() => {
    if (visibleCount < timeData.length) {
      const timer = setTimeout(() => setVisibleCount(visibleCount + 1), 1200);
      return () => clearTimeout(timer);
    }
  }, [visibleCount]);
  const visibleTimeData = timeData.map((d, i) =>
    i < visibleCount ? d : { ...d, actual: null, predicted: null }
  );

  // ✅ 일자별 그래프 애니메이션
  const [visibleDailyCount, setVisibleDailyCount] = useState(1);
  useEffect(() => {
    if (visibleDailyCount < dailyData.length) {
      const timer = setTimeout(() => setVisibleDailyCount(visibleDailyCount + 1), 2500);
      return () => clearTimeout(timer);
    }
  }, [visibleDailyCount]);
  const visibleDailyData = dailyData.map((d, i) =>
    i < visibleDailyCount ? d : { ...d, actual: null, predicted: null }
  );

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
          <Typography variant="h6" gutterBottom>공정 단계별 현황</Typography>
          <Grid container spacing={2} marginTop={1}>
            <Grid item xs={4}>
              <Box className={styles.infoBox}>
                <Typography variant="subtitle2">블랭킹 가동률</Typography>
                <Typography variant="h6" fontWeight="bold">75.5%</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box className={styles.infoBox}>
                <Typography variant="subtitle2">프레스 가동률</Typography>
                <Typography variant="h6" fontWeight="bold">75.1%</Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box className={styles.infoBox}>
                <Typography variant="subtitle2">조립셀 가동률</Typography>
                <Typography variant="h6" fontWeight="bold">80.1%</Typography>
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
              <Typography variant="h6" gutterBottom>시간별 실제 vs 예측</Typography>
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
              <Typography variant="h6" gutterBottom>KPI 지표</Typography>
              <Grid container spacing={2} sx={{ height: "100%" }}>
                {/* SKU별 시간별 */}
                <Grid item xs={6} sx={{ display: "flex", height: "100%" }}>
                  <Card className={styles.kpiInnerCard}>
                    <CardContent className={styles.kpiInnerContent}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        SKU별 시간별
                      </Typography>
                      <Typography variant="body1">정미 UPH: <b>963</b></Typography>
                      <Typography variant="body1">실적 UPH: <b>876</b></Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                        달성률 91.0%
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
                      <Typography variant="body1">목표 생산량: <b>23,100</b></Typography>
                      <Typography variant="body1">누적 생산량: <b>20,832</b></Typography>
                      <Typography variant="h6" fontWeight="bold" color="success.main" sx={{ mt: 1 }}>
                        달성률 90.1%
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
                {shiftDataDay.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row[0]}</TableCell>
                    <TableCell>{row[1]}</TableCell>
                    <TableCell>{shiftDataNight[idx]?.[0] || ""}</TableCell>
                    <TableCell>{shiftDataNight[idx]?.[1] || ""}</TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell sx={{ fontWeight: "bold" }}>주간 총생산량</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>{shiftDataDay.reduce((a, b) => a + b[1], 0)}</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>야간 총생산량</TableCell>
                  <TableCell sx={{ fontWeight: "bold" }}>{shiftDataNight.reduce((a, b) => a + b[1], 0)}</TableCell>
                </TableRow>
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
