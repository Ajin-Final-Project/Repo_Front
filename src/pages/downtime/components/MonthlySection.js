import React from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider,
} from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import {
  ChartsTooltipContainer,
  useItemTooltip,
} from "@mui/x-charts/ChartsTooltip";
import { BarChart as BarChartIcon } from "@mui/icons-material";

/**
 * 월별 비가동 합계 섹션
 * - @mui/x-charts v8 기준
 * - 툴팁 전체를 커스텀 컴포넌트로 교체(slots.tooltip)
 */
export default function MonthlySection({
  chartMonths,            // ['2025-01','2025-02', ...]  ← 내부 데이터는 YYYY-MM 유지
  chartSeries,            // [{ label:'비가동(분)', data:[176,418,239,...] }]
  chartItemCode,          // 품목코드 표시용
  monthTop3Map = {},      // { 'YYYY-MM': [{ name, minutes }, ...] }
  loading,
  error,
  themeHex,
  monthValueFormatter,    // (ym) => '1월' 처럼 보이게만 변환 (내부 키는 YYYY-MM)
  fmtNumber,              // 숫자 포매터 (예: 12345 -> 12,345)
}) {
  const safeFmtNum = (v) => (fmtNumber ? fmtNumber(v) : v);
  const safeFmtMonth = (ym, ctx) =>
    monthValueFormatter ? monthValueFormatter(ym, ctx) : ym;

  /**
   * v8 커스텀 툴팁
   * - useItemTooltip() 로 현재 hover 중인 아이템(dataIndex, label, value 등) 접근
   * - ChartsTooltipContainer 로 Popper/위치/열림상태 제어
   * - 카드형 스타일로 가독성 개선
   */

    if (!chartItemCode) {
        return <Typography>품번을 선택해주세요</Typography>;
    }

  const MonthlyTooltip = () => {
    const { identifier, label, value } = useItemTooltip() || {};
    const dataIndex = identifier?.dataIndex ?? null;
    if (dataIndex == null) return null;

    const ym = chartMonths?.[dataIndex];               // 'YYYY-MM'
    const tops = monthTop3Map?.[ym] || [];

    const header = safeFmtMonth(ym, { location: "tooltip" }) || label || ym;

    return (
      <ChartsTooltipContainer
        trigger="item"
        disablePortal
        // Popper 오프셋(버전에 따라 무시될 수 있지만 문제 없음)
        modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
        sx={{ "& .MuiChartsTooltip-root": { p: 0 } }}
      >
        <Box
          sx={{
            bgcolor: "rgba(255,255,255,0.96)",
            backdropFilter: "saturate(160%) blur(6px)",
            border: 1,
            borderColor: "divider",
            borderRadius: 1.5,
            boxShadow: 6,
            p: 1.25,
            minWidth: 220,
            maxWidth: 320,
            pointerEvents: "none",              // 마우스 떨림 방지
            fontVariantNumeric: "tabular-nums", // 숫자 자간 고정
          }}
        >
          {/* 상단: 월 표시 */}
          <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mb: 0.25 }}>
            {header}
          </Typography>

          {/* 총 비가동 */}
          <Typography variant="body1" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.2 }}>
            총 비가동: <Box component="span" sx={{ fontWeight: 900 }}>
              {safeFmtNum(value ?? 0)}
            </Box>분
          </Typography>

          <Divider sx={{ my: 0.75, borderColor: "rgba(0,0,0,0.08)" }} />

          <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mb: 0.25 }}>
            최다 비가동 TOP 3
          </Typography>

          {tops.length ? (
            <Box sx={{ display: "grid", rowGap: 0.25 }}>
              {tops.map((t, i) => (
                <Box
                  key={`${ym}-${i}-${t.name}`}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "16px 1fr auto", // 번호 · 이름 · 분
                    alignItems: "center",
                    columnGap: 1,
                    py: 0.25,
                  }}
                >
                  <Typography variant="body2" sx={{ opacity: 0.6 }}>
                    {i + 1}.
                  </Typography>

                  <Typography
                    variant="body2"
                    title={t.name}
                    sx={{
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t.name}
                  </Typography>

                  <Typography variant="body2" sx={{ opacity: 0.75, pl: 1, textAlign: "right" }}>
                    {safeFmtNum(t.minutes)}분
                  </Typography>
                </Box>
              ))}
            </Box>
          ) : (
            <Typography variant="caption" sx={{ opacity: 0.6 }}>
              해당 월의 TOP 데이터 없음
            </Typography>
          )}
        </Box>
      </ChartsTooltipContainer>
    );
  };

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: "16px" }}>
      <Typography
        variant="h6"
        sx={{ display: "flex", alignItems: "center", gap: 1, color: themeHex, mb: 2 }}
      >
        <BarChartIcon /> {`${chartItemCode || "-"} · 월별 비가동 합계`}
      </Typography>

      {!loading?.monthly && !error?.monthly && (chartMonths?.length ?? 0) > 0 ? (
        <BarChart
  xAxis={[
    {
      id: "months",
      scaleType: "band",
      data: chartMonths,
      label: "월",
      valueFormatter: (v) => safeFmtMonth(v),
      tickLabelInterval: () => true,
    },
  ]}
  yAxis={[{ label: "비가동(분)" }]}
  series={[
    {
      label: "비가동(분)",
      data: chartSeries?.[0]?.data ?? [],
      valueFormatter: (v) => `${safeFmtNum(v)}분`,
      color: themeHex,
    },
  ]}
  // ✅ 막대 위에 수치 표시
  barLabel={(item) => `${safeFmtNum(item.value)}분`}
  barLabelStyle={{
    fontSize: 14,
    fontWeight: 700,
    fill: "#333",
    textAnchor: "middle",
    dominantBaseline: "auto", // 꼭대기 위에 오도록
  }}
  barLabelPosition="end"   // ⬅️ 이게 핵심: 꼭대기 바깥에 표시
  height={420}
  margin={{ top: 40, right: 24, bottom: 64, left: 64 }} // top 여백 살짝 늘림
  borderRadius={8}
  slots={{ tooltip: MonthlyTooltip }}
  slotProps={{ tooltip: { trigger: "item" } }}
/>

      ) : (
        <Box
          sx={{
            height: 220,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "text.secondary",
            gap: 1,
          }}
        >
          {loading?.monthly ? (
            <>
              <CircularProgress size={18} /> 월별 합계 로딩…
            </>
          ) : (
            "표시할 데이터가 없습니다."
          )}
        </Box>
      )}

      {error?.monthly && (
        <Typography color="error" sx={{ mt: 1 }}>
          {error.monthly}
        </Typography>
      )}
    </Paper>
  );
}
