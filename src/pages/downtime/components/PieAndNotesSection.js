import React from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  List,
  ListItem,
  Stack,
  Chip,
  CircularProgress,
} from "@mui/material";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart";
import { legendClasses } from '@mui/x-charts/ChartsLegend'; 

export default function PieAndNotesSection({
  chartItemCode,
  pieData,
  topNotes,
  loading,
  error,
}) {
  // 총합/퍼센트
  const hasPie = Array.isArray(pieData) && pieData.length > 0;
  const total = hasPie
    ? pieData.reduce((s, d) => s + Number(d.value ?? d.minutes ?? 0), 0)
    : 0;
  const pct = (v) => (total ? (v / total) * 100 : 0);
  const fmtNum = (n) => Number(n ?? 0).toLocaleString();

  // 🎨 색상 팔레트
  const COLORS = [
    "#3f51b5", // 금형교환 (파랑)
    "#ff9800", // 진공에러 (주황)
    "#f44336", // 비가동 (빨강)
    "#03a9f4", // 겹힘, 접힘 (하늘색)
    "#4caf50", // 기타 (초록)
  ];

  // ✅ label 안전 매핑 (name/downtimeName 등 들어와도 처리)
  const normalizedPie = hasPie
    ? pieData.map((d, i) => ({
        id: d.id ?? i,
        value: Number(d.value ?? d.minutes ?? 0),
        label: d.label ?? d.name ?? d.downtimeName ?? d.code ?? "기타",
        color: d.color ?? COLORS[i % COLORS.length], // 색상 자동 할당
      }))
    : [];

  // 길면 잘라 표시 (툴팁에서 전체 표시됨)
  const shorten = (s) =>
    String(s).length > 7 ? `${String(s).slice(0, 7)}…` : s;


    if (!chartItemCode) {
        return <Typography>품번을 선택해주세요</Typography>;
    }


  return (
    <Grid container spacing={2}>
      {/* 파이 차트 */}
      <Grid item xs={12} md={6}>
        <Paper
          sx={{
            p: 2,
            borderRadius: "16px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {chartItemCode || "-"} · 비가동명 비중
          </Typography>

          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
            }}
          >
            {hasPie ? (
              <PieChart
                height={300}
                series={[
                  {
                    data: normalizedPie, // [{ id, value, label, color }]
                    // ⬇️ 라벨: "비가동명\n퍼센트"
                    arcLabel: (it) => `${shorten(it.label)}\n${pct(it.value).toFixed(1)}%`,
                    arcLabelMinAngle: 10,
                    arcLabelRadius: 90,
                    innerRadius: 40,
                    paddingAngle: 2,
                    valueFormatter: (it) =>
                      `${fmtNum(it.value)}분 (${pct(it.value).toFixed(1)}%)`,
                  },
                ]}
                // ✅ slotProps는 PieChart 레벨에 둠 (series 밖)
                slotProps={{
                  legend: {
                    // 필요 시 'row' | 'column'
                    direction: 'row',
                    sx: {
                      gap: '16px',
                      // 색 점 크기
                      [`& .${legendClasses.mark}`]: {
                        width: 15,
                        height: 15,
                      },
                      // 항목 간 간격
                      '& .MuiChartsLegend-series': {
                        gap: '8px',
                      },
                    },
                  },
                }}
                sx={{
                  // 파이 라벨 스타일
                  [`& .${pieArcLabelClasses.root}`]: {
                    fill: '#fff',
                    fontSize: 12,
                    fontWeight: 700,
                    paintOrder: 'stroke',
                    strokeWidth: 2,
                    whiteSpace: 'pre-wrap', 
                  },
                }}
              />


            ) : (
              <Box
                sx={{
                  height: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                  gap: 1,
                }}
              >
                {loading?.pie ? (
                  <>
                    <CircularProgress size={18} /> 파이 데이터 로딩…
                  </>
                ) : (
                  "해당 자재번호의 비가동명 데이터가 없습니다."
                )}
              </Box>
            )}
          </Box>

          {error?.pie && <Typography color="error">{error.pie}</Typography>}
        </Paper>
      </Grid>

      {/* 비고 Top */}
      <Grid item xs={12} md={6}>
        <Paper 
          sx={{ 
              display: "flex", 
              flexDirection: "column",
              justifyContent: "center",
              alignContent: "center", 
              p: 2, 
              borderRadius: "16px", 
              height: "100%", 
              textAlign: "center"
            }}
          >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {chartItemCode || "-"} · 가장 많이 등장한 비고
          </Typography>

          {topNotes?.length ? (
            <List dense sx={{ maxWidth: "100%" }}>
              {topNotes.map((n, i) => (
                <ListItem
                  key={i}
                  disableGutters
                  sx={{
                    "&:hover": { backgroundColor: "#f5f5f5", cursor: "pointer" },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                      p: 0.5,
                      borderBottom: "1px solid #f0f0f0",
                    }}
                  >
                    <Box sx={{ fontSize: "0.85rem", fontWeight: 500 }}>
                      {i + 1}. {n.text}
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        size="small"
                        label={`${fmtNum(n.count)}건`}
                        sx={{
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          fontWeight: 600,
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${fmtNum(n.minutes)}분`}
                        sx={{
                          backgroundColor: "#fce4ec",
                          color: "#d81b60",
                          fontWeight: 600,
                        }}
                      />
                    </Stack>
                  </Box>
                </ListItem>
              ))}
            </List>
          ) : (
            <Box
              sx={{
                minHeight: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
                gap: 1,
              }}
            >
              {loading?.notes ? (
                <>
                  <CircularProgress size={18} /> 비고 데이터 로딩…
                </>
              ) : (
                "반복적으로 등장한 비고가 없습니다."
              )}
            </Box>
          )}

          {error?.notes && (
            <Typography color="error">{error.notes}</Typography>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
