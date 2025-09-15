import React, { useState, useEffect, useCallback, useMemo } from "react";
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
  Bar,
} from "recharts";
import { DataGrid } from "@mui/x-data-grid";
import {
  Search as SearchIcon,
  TrendingUp,
  AdsClick,
  CheckCircleOutline,
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
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [currentTimeSlot, setCurrentTimeSlot] = useState(null); // 현재 시간대
  const [autoCycle, setAutoCycle] = useState(false);

  // ✅ 로딩/에러 상태
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [loading, setLoading] = useState({ hourly:null, daily: false });
  const [error, setError] = useState({ hourly: null, daily: null });

  // ✅ 검색 필터 상태
  const [quickRange] = useState("day");
  const [filters, setFilters] = useState({
    date: "2025-06-27",
  });

  // ✅ 초 → HH:MM 변환
  const secondsToHHMM = (sec) => {
    if (sec == null || isNaN(sec) || sec === undefined) {
      console.warn(`Invalid seconds value: ${sec}`);
      return null;
    }
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
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

  const allShiftTimes = [...dayShiftTimes, ...nightShiftTimes];

  // ✅ 현재 시간 기반 초기 시간대 설정
  useEffect(() => {
    if (!selectedTimeSlot || !currentTimeSlot) {
      const now = new Date(); // 현재 시간: 2025-09-15 13:25 KST
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;
      const currentSlot = allShiftTimes.find(([start, end]) => {
        return currentTime >= start && currentTime <= end;
      });
      const initialSlot = currentSlot
        ? `${currentSlot[0]}~${currentSlot[1]}`
        : "12:40~13:40"; // 폴백
      setSelectedTimeSlot(initialSlot);
      setCurrentTimeSlot(initialSlot);
      console.log(`Initial Time Slot: ${initialSlot}, Current Time Slot: ${initialSlot}`);
    }
  }, [selectedTimeSlot, currentTimeSlot]);

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
      const data = Array.isArray(json?.data) ? json.data : [];
      setHourlyData(data);
      console.log("Hourly Data Fetched:", data);
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
      const baseDate = new Date(filters.date);
      const startDate = new Date(baseDate);
      startDate.setDate(baseDate.getDate() - 6);
      const endDate = new Date(baseDate);
      endDate.setDate(baseDate.getDate() + 1);

      const startStr = startDate.toISOString().slice(0, 10);
      const endStr = endDate.toISOString().slice(0, 10);

      const json = await fetchJson(
        API("/forecast/daily"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sku: selectedSku,
            start_work_date: startStr,
            end_work_date: endStr,
          }),
        },
        "daily-forecast"
      );

      const filled = [];
      let cur = new Date(startDate);
      while (cur <= endDate) {
        const curStr = cur.toISOString().slice(0, 10);
        const found = Array.isArray(json?.data)
          ? json.data.find((d) => d.date === curStr)
          : null;
        filled.push(
          found
            ? {
                date: curStr,
                pred: found.pred ?? null,
                actual: found.actual ?? null,
                error: found.error ?? null,
                abs_error: found.abs_error ?? null,
                pct_error: found.pct_error ?? null,
                hourly_avg: found.hourly_avg ?? null,
              }
            : {
                date: curStr,
                pred: null,
                actual: null,
                error: null,
                abs_error: null,
                pct_error: null,
                hourly_avg: null,
              }
        );
        cur.setDate(cur.getDate() + 1);
      }
      setDailyData(filled);
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

  // ✅ 시간대 선택 및 자동 순환
  const getTimeSlotIndex = (timeSlot) => {
    const index = allShiftTimes.findIndex(([start, end]) => `${start}~${end}` === timeSlot);
    console.log(`Current Time Slot: ${timeSlot}, Index: ${index}`);
    return index;
  };

  const handleNextTimeSlot = () => {
    const currentIndex = getTimeSlotIndex(selectedTimeSlot);
    const nextIndex = (currentIndex + 1) % allShiftTimes.length;
    const newTimeSlot = `${allShiftTimes[nextIndex][0]}~${allShiftTimes[nextIndex][1]}`;
    setSelectedTimeSlot(newTimeSlot);
    console.log(`Moved to Next Time Slot: ${newTimeSlot}`);
  };

  // ✅ 자동 순환 효과
  useEffect(() => {
    let interval;
    if (autoCycle) {
      interval = setInterval(() => {
        handleNextTimeSlot();
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [autoCycle, selectedTimeSlot]);

  // ✅ 시간대 선택 핸들러
  const handleTimeSlotChange = (event) => {
    const newTimeSlot = event.target.value;
    setSelectedTimeSlot(newTimeSlot);
    console.log(`Selected Time Slot: ${newTimeSlot}`);
  };

  // ✅ 시간 문자열을 시간 값으로 변환
  const timeToMinutes = (timeStr, isNight = false) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(":").map(Number);
    let totalMinutes = hours * 60 + minutes;
    // 야간 시간대 중 00:30~07:50만 다음 날로 간주, 24시간 추가
    if (isNight && hours < 8) {
      totalMinutes += 24 * 60;
    }
    return totalMinutes;
  };

  // ✅ 전체 시간대 기준으로 그래프용 데이터 구성
  const visibleTimeData = useMemo(() => {
    if (!selectedTimeSlot) return [];

    const selectedIndex = allShiftTimes.findIndex(
      ([start, end]) => `${start}~${end}` === selectedTimeSlot
    );
    if (selectedIndex === -1) return [];

    // selectedTimeSlot이 주간인지 야간인지 판단
    const isSelectedDayShift = dayShiftTimes.some(([start, end]) => `${start}~${end}` === selectedTimeSlot);
    const isSelectedNightShift = nightShiftTimes.some(([start, end]) => `${start}~${end}` === selectedTimeSlot);

    // 주간 선택 시 야간 제외, 야간 선택 시 모든 시간대 포함
    const filteredShiftTimes = isSelectedDayShift
      ? allShiftTimes.slice(0, dayShiftTimes.length)
      : allShiftTimes.slice(0, selectedIndex + 1);

    const data = filteredShiftTimes.map(([start, end], idx) => {
      const isNight = idx >= dayShiftTimes.length;
      const found = hourlyData.find((d) => {
        const startTime = secondsToHHMM(d.slot_start);
        const endTime = secondsToHHMM(d.slot_end);
        if (!startTime || !endTime) {
          console.warn(`Invalid time slot in hourlyData:`, d);
          return false;
        }
        return startTime === start && endTime === end;
      });
      const isLast = start === "07:00" && end === "07:50";
      const isSelected = `${start}~${end}` === selectedTimeSlot;
      const currentStartMinutes = timeToMinutes(start, isNight);
      const selectedStartMinutes = timeToMinutes(selectedTimeSlot.split("~")[0], isSelectedNightShift);

      let isAtOrAfterSelected = false;
      if (isSelectedDayShift && isNight) {
        isAtOrAfterSelected = true;
      } else if (!isSelectedDayShift && !isNight) {
        isAtOrAfterSelected = false;
      } else {
        isAtOrAfterSelected = currentStartMinutes >= selectedStartMinutes;
      }

      const actualValue = isLast || isAtOrAfterSelected
        ? null
        : (found && found.actual != null ? found.actual : null);

      console.log(
        `Time Slot: ${start}~${end}, isNight: ${isNight}, isSelectedDayShift: ${isSelectedDayShift}, ` +
        `currentStartMinutes: ${currentStartMinutes}, selectedStartMinutes: ${selectedStartMinutes}, ` +
        `isAtOrAfterSelected: ${isAtOrAfterSelected}, isSelected: ${isSelected}, actual: ${actualValue}, predicted: ${found?.prediction}`
      );

      return {
        time: `${start}~${end}`,
        actual: actualValue,
        predicted: found && found.prediction != null ? found.prediction : null,
        isSelected,
      };
    }).filter((item) => item.time && item.time !== "null~null");

    return data;
  }, [hourlyData, selectedTimeSlot]);



  // ✅ Y축 범위 계산
  const allValues = visibleTimeData.flatMap((d) => [d.actual, d.predicted].filter((v) => v != null));
  const minVal = allValues.length ? Math.min(...allValues) : 0;
  const maxVal = allValues.length ? Math.max(...allValues) : 100;
  const margin = (maxVal - minVal);
  const yMin = Math.max(0, minVal - margin);
  const yMax = maxVal + margin;

  // ✅ 일별 그래프 데이터
  const baseDate = filters.date;
  const allDailyData = dailyData.map((d) => ({
    date: d.date,
    actual: d.date <= baseDate ? d.actual : null,
    predicted: d.pred,
  }));

  // ✅ DataGrid 행 데이터
  let tableRows = dailyData.map((d, idx) => {
    const isFuture = d.date > baseDate;
    let label = "과거";
    if (d.date === baseDate) label = "오늘";
    if (d.date > baseDate) label = "내일";

    return {
      id: idx + 1,
      type: label,
      date: d.date,
      predicted: d.pred != null ? Number(d.pred).toFixed(2) : "-",
      actual: isFuture ? "-" : (d.actual != null ? Math.round(d.actual) : "-"),
      diff: isFuture ? "-" : (d.error != null ? Number(d.error).toFixed(2) : "-"),
      acc: isFuture ? "-" : (d.pct_error != null ? `${(100 - d.pct_error).toFixed(2)}%` : "-"),
      uph: isFuture ? "-" : (d.hourly_avg != null ? Number(d.hourly_avg).toFixed(2) : "-"),
    };
  });

  // ✅ 미래 > 오늘 > 과거 순으로 정렬
  tableRows = tableRows.sort((a, b) => {
    if (a.date > baseDate && b.date <= baseDate) return -1;
    if (a.date === baseDate && b.date < baseDate) return -1;
    if (a.date < baseDate && b.date >= baseDate) return 1;
    return a.date.localeCompare(b.date);
  });

  // ✅ DataGrid 컬럼 정의
  const tableColumns = [
    { field: "type", headerName: "구분", flex: 1 },
    { field: "date", headerName: "날짜", flex: 1 },
    { field: "predicted", headerName: "예측 생산량", flex: 1 },
    { field: "actual", headerName: "실제 생산량", flex: 1 },
    { field: "diff", headerName: "오차", flex: 1 },
    { field: "acc", headerName: "예측 정확도", flex: 1 },
    { field: "uph", headerName: "시간당 생산량", flex: 1 },
  ];

  // ✅ 공정 단계별 현황
  const selectedSlot = hourlyData.find(
    (d) => {
      const start = secondsToHHMM(d.slot_start);
      const end = secondsToHHMM(d.slot_end);
      const matches = start === selectedTimeSlot?.split("~")[0] && end === selectedTimeSlot?.split("~")[1];
      console.log(`Checking slot: ${start}~${end}, Matches: ${matches}`);
      return matches;
    }
  );

  const avgUtil = selectedSlot
    ? {
        blanking: ((selectedSlot.blanking_util || 0) * 100).toFixed(2),
        press: ((selectedSlot.press_util || 0) * 100).toFixed(2),
        assembly: ((selectedSlot.assembly_util || 0) * 100).toFixed(2),
      }
    : {
        blanking: ((hourlyData.reduce((a, b) => a + (b.blanking_util || 0), 0) / (hourlyData.length || 1)) * 100).toFixed(2),
        press: ((hourlyData.reduce((a, b) => a + (b.press_util || 0), 0) / (hourlyData.length || 1)) * 100).toFixed(2),
        assembly: ((hourlyData.reduce((a, b) => a + (b.assembly_util || 0), 0) / (hourlyData.length || 1)) * 100).toFixed(2),
      };

  // ✅ KPI 지표
  const kpi = {
    uph: selectedSlot?.uph?.toFixed(2) || "-",
    actual: selectedSlot?.actual ? Math.round(selectedSlot.actual) : "-",
    uphAchievement: selectedSlot?.uph_achievement_pct ? (selectedSlot.uph_achievement_pct * 100).toFixed(2) : "-",
    target: selectedSlot?.daily_target || "-",
    cumActual: selectedSlot?.cum_actual_today ? Math.round(selectedSlot.cum_actual_today) : "-",
    achievement: selectedSlot?.current_achievement_pct ? (selectedSlot.current_achievement_pct * 100).toFixed(2) : "-",
  };

  // ✅ 교대별 데이터 (동적 렌더링)
  const getShiftData = (timeRanges, isNight = false) => {
    const selectedStartTime = selectedTimeSlot ? selectedTimeSlot.split("~")[0] : null;
    const isSelectedNightShift = selectedTimeSlot
      ? nightShiftTimes.some(([start, end]) => `${start}~${end}` === selectedTimeSlot)
      : false;
    const selectedStartMinutes = selectedStartTime
      ? timeToMinutes(selectedStartTime, isSelectedNightShift)
      : Infinity;

    // selectedTimeSlot이 주간인지 야간인지 판단
    const isSelectedDayShift = selectedTimeSlot
      ? dayShiftTimes.some(([start, end]) => `${start}~${end}` === selectedTimeSlot)
      : true;

    return timeRanges.map(([start, end], idx) => {
      const found = hourlyData.find(
        (d) =>
          secondsToHHMM(d.slot_start) === start &&
          secondsToHHMM(d.slot_end) === end
      );
      const isLastNight = isNight && start === "07:00" && end === "07:50";
      const currentStartMinutesForSlot = timeToMinutes(start, isNight);
      let isAtOrAfterSelected = false;

      if (isSelectedDayShift && isNight) {
        // 선택된 시간대가 주간이고 현재 처리 중인 시간대가 야간이면 모두 미래 시간대
        isAtOrAfterSelected = true;
      } else if (!isSelectedDayShift && !isNight) {
        // 선택된 시간대가 야간이고 현재 처리 중인 시간대가 주간이면 모두 과거 시간대
        isAtOrAfterSelected = false;
      } else {
        // 동일 교대(주간-주간 또는 야간-야간) 내에서 시간 비교
        isAtOrAfterSelected = selectedStartTime && currentStartMinutesForSlot >= selectedStartMinutes;
      }

      const isSelected = `${start}~${end}` === selectedTimeSlot;
      const actualValue = isLastNight || isAtOrAfterSelected
        ? "-"
        : (found && found.actual != null ? Math.round(found.actual) : "-");

      console.log(
        `Shift: ${start}~${end}, isNight: ${isNight}, isSelectedDayShift: ${isSelectedDayShift}, ` +
        `currentStartMinutes: ${currentStartMinutesForSlot}, selectedStartMinutes: ${selectedStartMinutes}, ` +
        `isAtOrAfterSelected: ${isAtOrAfterSelected}, isSelected: ${isSelected}, actual: ${actualValue}`
      );

      return {
        start,
        end,
        actual: actualValue,
        isSelected,
      };
    });
  };



  const dayShift = useMemo(() => getShiftData(dayShiftTimes), [hourlyData, selectedTimeSlot, currentTimeSlot]);
  const nightShift = useMemo(() => getShiftData(nightShiftTimes, true), [hourlyData, selectedTimeSlot, currentTimeSlot]);

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

      {/* 검색 필터 + 시간대 선택 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <CardHeader
          title={
            <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
              <SearchIcon /> 검색 조건
            </Typography>
          }
          sx={{ backgroundColor: themeHex, color: "white", borderRadius: 1, mb: 2 }}
        />
        <Grid container spacing={2} alignItems="center">
          <Grid item>
            <Button
              size="small"
              variant="contained"
              sx={{ backgroundColor: themeHex, "&:hover": { backgroundColor: themeHex } }}
            >
              주간
            </Button>
          </Grid>
          <Grid item>
            <Typography sx={{ mr: 1 }}>기준일 선택</Typography>
          </Grid>
          <Grid item>
            <TextField
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              size="small"
              variant="outlined"
              sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 160 }}
            />
          </Grid>
          <Grid item>
            <Typography sx={{ ml: 2 }}>분석 대상 SKU</Typography>
          </Grid>
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 120, backgroundColor: "white", borderRadius: 1 }}>
              <Select value={selectedSku} onChange={(e) => setSelectedSku(e.target.value)} sx={{ fontWeight: "bold" }}>
                <MenuItem value="SKU1">SKU1</MenuItem>
                <MenuItem value="SKU2">SKU2</MenuItem>
                <MenuItem value="SKU3">SKU3</MenuItem>
                <MenuItem value="SKU4">SKU4</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Typography sx={{ ml: 2 }}>시간대 선택</Typography>
          </Grid>
          <Grid item>
            <FormControl size="small" sx={{ minWidth: 120, backgroundColor: "white", borderRadius: 1 }}>
              <Select value={selectedTimeSlot || ""} onChange={handleTimeSlotChange} sx={{ fontWeight: "bold" }}>
                {allShiftTimes.map(([start, end], idx) => (
                  <MenuItem key={idx} value={`${start}~${end}`}>
                    {start}~{end}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item>
            <Button
              size="small"
              variant="contained"
              onClick={() => setAutoCycle(!autoCycle)}
              sx={{ backgroundColor: autoCycle ? "#d32f2f" : themeHex, "&:hover": { backgroundColor: autoCycle ? "#b71c1c" : themeHex } }}
            >
              {autoCycle ? "자동 순환 끄기" : "자동 순환 켜기"}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* 1) 일자별 생산량 */}
      <Card className={styles.sectionCard}>
        <CardContent>
          <Typography variant="h6" gutterBottom>일자별 실제 vs 예측</Typography>
          {loading.daily ? (
            <Box sx={{ height: 530, display: "flex", justifyContent: "center", alignItems: "center" }}>
              <CircularProgress size={60} sx={{ color: themeHex }} />
            </Box>
          ) : error.daily ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error">{error.daily}</Typography>
              <Button onClick={fetchDaily} sx={{ mt: 2, backgroundColor: themeHex }} variant="contained">
                다시 시도
              </Button>
            </Box>
          ) : (
            <>
              <Box display="flex" justifyContent="center">
                <div style={{ width: "80%", height: 530 }}>

                  <ResponsiveContainer>
                    <ComposedChart data={allDailyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={["dataMin - 10", "dataMax + 10"]} />
                      <Tooltip formatter={(value, name) => [Number(value).toFixed(2), name]} />
                      <Legend verticalAlign="top" align="right" wrapperStyle={{ marginBottom: 10 }} />



                      {/* ✅ 실제: 막대 먼저 */}
                      <Bar
                        dataKey="actual"
                        fill={themeHex}
                        name="실제"
                        barSize={40}
                        isAnimationActive={true}
                        animationDuration={2000}
                        animationBegin={800}
                      />

                      {/* ✅ 예측: 선 나중에 (항상 위에 보임) */}
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#1E3A8A"
                        strokeWidth={3}
                        name="예측"
                        connectNulls={false}
                        dot={{ fill: "#1E3A8A", r: 5 }}
                        isAnimationActive={true}
                        animationDuration={2000}
                        animationBegin={0}
                      />


                      
                    </ComposedChart>
                  </ResponsiveContainer>





                </div>
              </Box>
              <div style={{ height: 530, width: "100%", marginTop: 16 }}>

                <DataGrid
                  rows={tableRows}
                  columns={tableColumns}
                  autoHeight
                  initialState={{
                    pagination: {
                      paginationModel: { pageSize: 10 },
                    },
                  }}
                  pageSizeOptions={[5, 10, 20]}
                  getRowClassName={(params) =>
                    params.row.type === "내일" ? "highlightTomorrow" : ""
                  }
                  sx={{
                    "& .highlightTomorrow": {
                      backgroundColor: `${themeHex}20`,
                      fontWeight: "bold",
                      color: "black",
                    },
                  }}
                />

              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 2) 시간별 생산량 (그래프 + KPI 영역) */}
      <Grid container spacing={2} marginTop={2} marginBottom={3} alignItems="stretch">
        <Grid item xs={12} md={8}>
          <Card className={styles.sectionCard} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                시간별 실제 vs 예측 (현재: {selectedTimeSlot})
              </Typography>
              {loading.hourly ? (
                <Box sx={{ height: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
                  <CircularProgress size={60} sx={{ color: themeHex }} />
                </Box>
              ) : error.hourly ? (
                <Box sx={{ p: 2 }}>
                  <Typography color="error">{error.hourly}</Typography>
                  <Button onClick={fetchHourly} sx={{ mt: 2, backgroundColor: themeHex }} variant="contained">
                    다시 시도
                  </Button>
                </Box>
              ) : (
                <>
                  {visibleTimeData.length === 0 && !loading.hourly && !error.hourly ? (
                    <Typography variant="body1" color="text.secondary">
                      표시할 시간별 데이터가 없습니다.
                    </Typography>
                  ) : (
                    <div style={{ width: "100%", height: 300 }}>
                      <ResponsiveContainer>
                        <ComposedChart data={visibleTimeData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="time" />
                          <YAxis domain={[yMin, yMax]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Legend verticalAlign="top" align="right" wrapperStyle={{ marginBottom: 10 }} />
                          <Line
                            type="monotone"
                            dataKey="actual"
                            stroke={themeHex}
                            strokeWidth={3}
                            name="실제"
                            dot={(props) => {
                              if (!props.payload.actual) return null;
                              if (props.payload.isSelected) {
                                return (
                                  <circle
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={8}
                                    fill={themeHex}
                                    stroke="#fff"
                                    strokeWidth={2}
                                  />
                                );
                              }
                              return <circle cx={props.cx} cy={props.cy} r={4} fill={themeHex} />;
                            }}
                          />
                          <Scatter
                            dataKey="predicted"
                            name="예측"
                            shape={(props) => {
                              if (!props.payload.predicted) return null;
                              if (props.payload.isSelected) {
                                return (
                                  <circle
                                    cx={props.cx}
                                    cy={props.cy}
                                    r={8}
                                    fill="#1E3A8A"
                                    stroke="#fff"
                                    strokeWidth={2}
                                  />
                                );
                              }
                              return <circle cx={props.cx} cy={props.cy} r={5} fill="#1E3A8A" />;
                            }}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card className={styles.sectionCard} sx={{ backgroundColor: "#f9fafb", height: "100%" }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TrendingUp sx={{ color: themeHex }} /> KPI 지표
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                기준 시간: {selectedTimeSlot}
              </Typography>
              {selectedSlot ? (
                <Grid container spacing={2} sx={{ flex: 1, minHeight: 280 }}>
                  <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
                    <Card className={styles.kpiInnerCard} sx={{ border: `1px solid ${themeHex}`, borderRadius: 2, height: "100%", width: "100%", backgroundColor: "#fafbfc" }}>
                      <CardContent className={styles.kpiInnerContent} sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", p: 2.5 }}>
                        <div>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
                            SKU별 시간별
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                            <AdsClick sx={{ color: "#1E3A8A" }} />
                            <Typography variant="body2">정미 UPH: <b>{kpi.uph !== "-" ? kpi.uph : "데이터 없음"}</b></Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
                            <CheckCircleOutline sx={{ color: "#1E3A8A" }} />
                            <Typography variant="body2">실적 UPH: <b>{kpi.actual !== "-" ? kpi.actual : "데이터 없음"}</b></Typography>
                          </Box>
                        </div>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color="#1E3A8A"
                          sx={{
                            mt: "auto",
                            p: 2.5,
                            backgroundColor: kpi.uphAchievement !== "-" ? "rgba(30, 58, 138, 0.1)" : "#f5f5f5",
                            borderRadius: 1,
                            textAlign: "center",
                          }}
                        >
                          달성률 {kpi.uphAchievement !== "-" ? `${kpi.uphAchievement}%` : "N/A"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} sx={{ display: "flex" }}>
                    <Card className={styles.kpiInnerCard} sx={{ border: `1px solid ${themeHex}`, borderRadius: 2, height: "100%", width: "100%", backgroundColor: "#fafbfc" }}>
                      <CardContent className={styles.kpiInnerContent} sx={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", p: 2.5 }}>
                        <div>
                          <Typography variant="subtitle2" color="textSecondary" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
                            SKU별 누적
                          </Typography>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 2 }}>
                            <AdsClick sx={{ color: "#1E3A8A" }} />
                            <Typography variant="body2">목표 생산량: <b>{kpi.target !== "-" ? kpi.target : "데이터 없음"}</b></Typography>
                          </Box>
                          <Box display="flex" alignItems="center" gap={1} sx={{ mb: 3 }}>
                            <CheckCircleOutline sx={{ color: "#1E3A8A" }} />
                            <Typography variant="body2">누적 생산량: <b>{kpi.cumActual !== "-" ? kpi.cumActual : "데이터 없음"}</b></Typography>
                          </Box>
                        </div>
                        <Typography
                          variant="h5"
                          fontWeight="bold"
                          color="#1E3A8A"
                          sx={{
                            mt: "auto",
                            p: 2.5,
                            backgroundColor: kpi.achievement !== "-" ? "rgba(30, 58, 138, 0.1)" : "#f5f5f5",
                            borderRadius: 1,
                            textAlign: "center",
                          }}
                        >
                          달성률 {kpi.achievement !== "-" ? `${kpi.achievement}%` : "N/A"}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary">
                  선택된 시간대({selectedTimeSlot})에 대한 KPI 데이터가 없습니다.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* 3) 공정 단계별 현황 */}
      <Card className={styles.sectionCard}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            공정 단계별 현황 (시간대: {selectedTimeSlot})
          </Typography>
          {selectedSlot ? (
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
          ) : (
            <Typography variant="body1" color="text.secondary">
              선택된 시간대({selectedTimeSlot})에 대한 가동률 데이터가 없습니다. 평균 가동률 표시: 블랭킹 {avgUtil.blanking}%, 프레스 {avgUtil.press}%, 조립셀 {avgUtil.assembly}%
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* 4) 교대별 생산량 */}
      <Card className={styles.sectionCard}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <TrendingUp sx={{ color: themeHex }} /> 교대별 생산량 (현재: {selectedTimeSlot})
          </Typography>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <TableContainer component={Paper}>
              <Table sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" colSpan={2} sx={{ backgroundColor: "#f5f5f520", fontWeight: "bold", borderRight: `2px solid ${themeHex}` }}>
                      🌞 주간근무
                    </TableCell>
                    <TableCell align="center" colSpan={2} sx={{ backgroundColor: "#f5f5f520", fontWeight: "bold" }}>
                      🌙 야간근무
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell sx={{ width: "25%" }}>시간</TableCell>
                    <TableCell sx={{ width: "25%", borderRight: `2px solid ${themeHex}` }}>실적</TableCell>
                    <TableCell sx={{ width: "25%" }}>시간</TableCell>
                    <TableCell sx={{ width: "25%" }}>실적</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dayShift.map((d, idx) => (
                    <TableRow key={idx}>
                      <TableCell
                        sx={d.isSelected ? { backgroundColor: `${themeHex}40`, fontWeight: "bold", color: "black", border: `2px solid ${themeHex}` } : {}}
                      >
                        {d.start} – {d.end}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderRight: `2px solid ${themeHex}`,
                          ...(d.isSelected && {
                            backgroundColor: `${themeHex}40`,
                            fontWeight: "bold",
                            color: "black",
                            border: `2px solid ${themeHex}`,
                          }),
                        }}
                      >
                        {d.actual !== "-" ? d.actual : "데이터 없음"}
                      </TableCell>
                      <TableCell
                        sx={nightShift[idx]?.isSelected ? { backgroundColor: `${themeHex}40`, fontWeight: "bold", color: themeHex, border: `2px solid ${themeHex}` } : {}}
                      >
                        {nightShift[idx]?.start} – {nightShift[idx]?.end}
                      </TableCell>
                      <TableCell
                        sx={nightShift[idx]?.isSelected ? { backgroundColor: `${themeHex}40`, fontWeight: "bold", color: themeHex, border: `2px solid ${themeHex}` } : {}}
                      >
                        {nightShift[idx]?.actual !== "-" ? nightShift[idx].actual : "데이터 없음"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  주간근무
                </Typography>
                {dayShift.map((d, idx) => (
                  <Card
                    key={idx}
                    sx={{
                      mb: 1,
                      p: 2,
                      backgroundColor: d.isSelected ? `${themeHex}40` : "#f9fafb",
                      ...(d.isSelected && { border: `2px solid ${themeHex}`, fontWeight: "bold" }),
                    }}
                  >
                    <Typography variant="body2">시간: {d.start} – {d.end}</Typography>
                    <Typography variant="body2">실적: {d.actual !== "-" ? d.actual : "데이터 없음"}</Typography>
                  </Card>
                ))}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                  야간근무
                </Typography>
                {nightShift.map((d, idx) => (
                  <Card
                    key={idx}
                    sx={{
                      mb: 1,
                      p: 2,
                      backgroundColor: d.isSelected ? `${themeHex}40` : "#f9fafb",
                      ...(d.isSelected && { border: `2px solid ${themeHex}`, fontWeight: "bold" }),
                    }}
                  >
                    <Typography variant="body2">시간: {d.start} – {d.end}</Typography>
                    <Typography variant="body2">실적: {d.actual !== "-" ? d.actual : "데이터 없음"}</Typography>
                  </Card>
                ))}
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}