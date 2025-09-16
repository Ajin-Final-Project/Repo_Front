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
} from "@mui/material";
import { ResponsivePie } from "@nivo/pie";
import { legendClasses } from "@mui/x-charts/ChartsLegend";

export default function PieAndNotesSection({
  pieData,
  topNotes,
  chartItemCode,
  fmtDuration, // ====> 반드시 넘겨받아 사용
}) {
  // 총합/퍼센트
  const hasPie = Array.isArray(pieData) && pieData.length > 0;
  const total = hasPie
    ? pieData.reduce((s, d) => s + Number(d.value ?? d.minutes ?? 0), 0)
    : 0;
  const pct = (v) => (total ? (v / total) * 100 : 0);
  const fmtNum = (n) => Number(n ?? 0).toLocaleString();

  // 🎨 색상 팔레트
  const COLORS = ["#3f51b5", "#ff9800", "#f44336", "#03a9f4", "#4caf50"];

  // ✅ label 안전 매핑(+ duration 원본 보존)
  const normalizedPie = hasPie
    ? pieData.map((d, i) => ({
        id: d.id ?? i,
        value: Number(d.value ?? d.minutes ?? 0),
        label: d.label ?? d.name ?? d.downtimeName ?? d.code ?? "기타",
        color: d.color ?? COLORS[i % COLORS.length],
        duration: d.duration, // 서버가 주면 사용 가능
      }))
    : [];

  const shorten = (s) => (String(s).length > 7 ? `${String(s).slice(0, 7)}…` : s);

  // 품번 미선택시 안내 문구
  if (!chartItemCode) {
    return (
      <Paper
        sx={{
          p: 4,
          borderRadius: "16px",
          textAlign: "center",
          color: "text.secondary",
          bgcolor: "background.default",
          border: "1px dashed",
          borderColor: "divider",
        }}
      >
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          비가동 분석
        </Typography>

        <Typography variant="body1" sx={{ mb: 1 }}>
          품번을 선택하면 아래 내용이 표시됩니다.
        </Typography>

        <List dense sx={{ display: "inline-block", textAlign: "left", mt: 1 }}>
          <ListItem disableGutters>
            • 비가동명 비중 <strong>(파이 차트)</strong>
          </ListItem>
          <ListItem disableGutters>
            • 가장 많이 등장한 비고 <strong>(건수/시간)</strong>
          </ListItem>
        </List>

        <Typography variant="body2" sx={{ mt: 2 }}>
          상단/좌측의 품번 선택 영역에서 원하는 품번을 선택해 주세요.
        </Typography>
      </Paper>
    );
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

          <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", width: "100%" }}>
  {hasPie ? (
<Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 320, width: "100%" }}>
  <ResponsivePie
    data={normalizedPie.map(d => ({
      id: d.label,
      label: d.label,
      value: d.value,
      color: d.color,
    }))}
    margin={{ top: 30, right: 100, bottom: 10, left: 40 }}   // 👉 오른쪽 여백 늘림
    innerRadius={0.6}
    padAngle={1}
    cornerRadius={2}
    activeOuterRadiusOffset={6}
    colors={{ datum: "data.color" }}
    // 내부 라벨은 끄고, 바깥 라벨 + 리더라인 사용
    enableArcLabels={false}
    enableArcLinkLabels={true}
    arcLinkLabel={d => `${shorten(d.label)} ${pct(d.value).toFixed(1)}%`}
    arcLinkLabelsSkipAngle={8}     // 작으면 자동 스킵 → 겹침 방지
    arcLinkLabelsOffset={6}
    arcLinkLabelsDiagonalLength={14}
    arcLinkLabelsStraightLength={10}
    arcLinkLabelsThickness={1}
    arcLinkLabelsTextColor="#333"
    // 툴팁: 시간 + %
    tooltip={({ datum }) => (
      <div style={{ padding: 8, background: "#fff", border: "1px solid #ddd" }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{datum.label}</div>
        <div>
          {fmtDuration(Number(datum.value))} · {pct(Number(datum.value)).toFixed(1)}%
        </div>
      </div>
    )}
    legends={[
      {
        anchor: "right",        // 👉 오른쪽 배치
        direction: "column",    // 👉 세로 나열
        translateX: 80,         // 👉 차트와 범례 간격
        itemWidth: 100,
        itemHeight: 20,
        symbolSize: 14,
        symbolShape: "circle",
      },
    ]}
  />
</Box>

  ) : (
    <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary" }}>
      해당 자재번호의 비가동명 데이터가 없습니다.
    </Box>
  )}
</Box>
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
            textAlign: "center",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {chartItemCode || "-"} · 가장 많이 등장한 비고
          </Typography>

          {topNotes?.length ? (
            <List dense sx={{ maxWidth: "100%" }}>
              {topNotes.map((n, i) => {
                const minutes = Number(n.minutes ?? 0);
                return (
                  <ListItem
                    key={i}
                    disableGutters
                    sx={{ "&:hover": { backgroundColor: "#f5f5f5", cursor: "pointer" } }}
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
                          sx={{ backgroundColor: "#e3f2fd", color: "#1976d2", fontWeight: 600 }}
                        />
                        <Chip
                          size="small"
                          // ▼▼▼ ‘분’ 고정 문구 제거, 규칙 함수 적용
                          label={fmtDuration(minutes)}
                          sx={{ backgroundColor: "#fce4ec", color: "#d81b60", fontWeight: 600 }}
                        />
                      </Stack>
                    </Box>
                  </ListItem>
                );
              })}
            </List>
          ) : (
            <Box
              sx={{
                minHeight: 120,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "text.secondary",
              }}
            >
              반복적으로 등장한 비고가 없습니다.
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );
}
