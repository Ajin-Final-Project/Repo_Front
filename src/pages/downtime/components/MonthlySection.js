// MonthlySection.jsx
import React from "react";
import { Box, Typography, Divider } from "@mui/material";

// BarChart 모드
import { BarChart as MuiBarChart } from "@mui/x-charts/BarChart";

// v8 조합 모드(옵션)
import { ChartContainer, BarPlot, ChartsXAxis, ChartsYAxis } from "@mui/x-charts";

// 툴팁
import { ChartsTooltip, ChartsTooltipContainer, useItemTooltip } from "@mui/x-charts/ChartsTooltip";
import { BarChart as BarChartIcon } from "@mui/icons-material";

/* ───────── 공통 유틸 ───────── */
const num = (v) => Number(v ?? 0);
const makeSafeFmtNum = (fmt) => (v) => (fmt ? fmt(num(v)) : num(v).toLocaleString());
const makeSafeFmtMonth = (fmt) => (ym, ctx) => (fmt ? fmt(ym, ctx) : ym);

// TOP3 내용부(툴팁) 팩토리
function makeMonthlyTooltipContent({ chartMonths, seriesData, monthTop3Map, safeFmtNum, safeFmtMonth }) {
  return function MonthlyTooltipContent() {
    const { identifier, label, value } = useItemTooltip() || {};
    const dataIndex = identifier?.dataIndex ?? null;
    if (dataIndex == null) return null;

    const ym = chartMonths?.[dataIndex];
    const tops = monthTop3Map?.[ym] || [];
    const header = safeFmtMonth(ym, { location: "tooltip" }) || label || ym;
    const total = value ?? seriesData?.[dataIndex] ?? 0;

    return (
      <Box sx={{
        bgcolor: "rgba(255,255,255,0.96)", backdropFilter: "saturate(160%) blur(6px)",
        border: 1, borderColor: "divider", borderRadius: 1.5, boxShadow: 6,
        p: 1.25, minWidth: 220, maxWidth: 320, pointerEvents: "none", fontVariantNumeric: "tabular-nums",
      }}>
        <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mb: 0.25 }}>{header}</Typography>
        <Typography variant="body1" sx={{ fontWeight: 800, mb: 0.5, lineHeight: 1.2 }}>
          총 비가동: <Box component="span" sx={{ fontWeight: 900 }}>{safeFmtNum(total)}</Box>분
        </Typography>
        <Divider sx={{ my: 0.75, borderColor: "rgba(0,0,0,0.08)" }} />
        <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mb: 0.25 }}>최다 비가동 TOP 3</Typography>
        {tops.length ? (
          <Box sx={{ display: "grid", rowGap: 0.25 }}>
            {tops.map((t, i) => (
              <Box key={`${ym}-${i}-${t.name}`} sx={{
                display: "grid", gridTemplateColumns: "16px 1fr auto", alignItems: "center", columnGap: 1, py: 0.25,
              }}>
                <Typography variant="body2" sx={{ opacity: 0.6 }}>{i + 1}.</Typography>
                <Typography variant="body2" title={t.name} sx={{
                  fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                }}>{t.name}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.75, pl: 1, textAlign: "right" }}>
                  {safeFmtNum(t.minutes)}분
                </Typography>
              </Box>
            ))}
          </Box>
        ) : (
          <Typography variant="caption" sx={{ opacity: 0.6 }}>해당 월의 TOP 데이터 없음</Typography>
        )}
      </Box>
    );
  };
}

/* ───────── 간단 프레임 (부모가 Paper 감쌈) ───────── */
function ChartFrame({ titleColor, chartItemCode, children }) {
  return (
    <Box sx={{ p: 1, mb: 1 }}>
      <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: titleColor, mb: 2 }}>
        <BarChartIcon /> {`${chartItemCode || "-"} · 월별 비가동 합계`}
      </Typography>
      {children}
    </Box>
  );
}

/* ───────── ① 기본: BarChart 모드 (권장) ───────── */
export default function MonthlySection({
  chartMonths, chartSeries, chartItemCode, monthTop3Map = {},
  themeHex = "#f6a04d", monthValueFormatter, fmtNumber,
}) {
  const safeFmtNum = makeSafeFmtNum(fmtNumber);
  const safeFmtMonth = makeSafeFmtMonth(monthValueFormatter);
  const seriesData = chartSeries?.[0]?.data ?? [];
  if (!chartItemCode) return <Typography sx={{ textAlign: "center"}}>품번을 선택해주세요</Typography>;

  // 부모에서 로딩/에러를 가림 → 여기선 ‘데이터 유무’만 판단
  const hasData = (chartMonths?.length ?? 0) > 0 && (seriesData?.length ?? 0) > 0;

  // 라벨 잘림 방지: 상단 여유
  const yMax = Math.max(...seriesData.map((v) => num(v)), 0);
  const yMaxWithHeadroom = Number.isFinite(yMax) && yMax > 0 ? yMax * 1.1 + 1 : 10;

  const MonthlyTooltipContent = makeMonthlyTooltipContent({
    chartMonths, seriesData, monthTop3Map, safeFmtNum, safeFmtMonth,
  });

  const MonthlyTooltip = () => (
    <ChartsTooltipContainer
      trigger="item" disablePortal
      modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
      sx={{ "& .MuiChartsTooltip-root": { p: 0 } }}
    >
      <MonthlyTooltipContent />
    </ChartsTooltipContainer>
  );

  return (
    <ChartFrame titleColor={themeHex} chartItemCode={chartItemCode}>
      {hasData ? (
        <MuiBarChart
          xAxis={[{
            id: "months", scaleType: "band", data: chartMonths,
            label: "월", valueFormatter: (v) => safeFmtMonth(v), tickLabelInterval: () => true,
          }]}
          yAxis={[{ label: "비가동(분)", max: yMaxWithHeadroom }]}
          series={[{
            label: "비가동(분)",
            data: seriesData,
            valueFormatter: (v) => `${safeFmtNum(v)}분`,
            color: themeHex,
          }]}
          barLabel={(item) => `${safeFmtNum(item.value)}분`}
          barLabelStyle={{ fontSize: 14, fontWeight: 700, fill: "#333", textAnchor: "middle" }}
          barLabelPosition="end"
          height={420}
          margin={{ top: 56, right: 24, bottom: 64, left: 64 }}
          borderRadius={8}
          slots={{ tooltip: MonthlyTooltip }}
          slotProps={{ tooltip: { trigger: "item" } }}
        />
      ) : (
        <Box sx={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary" }}>
          표시할 데이터가 없습니다.
        </Box>
      )}
    </ChartFrame>
  );
}

/* ───────── ② 선택: v8 조합 모드 ───────── */
export function MonthlySectionV8({
  chartMonths, chartSeries, chartItemCode, monthTop3Map = {},
  themeHex = "#f6a04d", monthValueFormatter, fmtNumber,
}) {
  const safeFmtNum = makeSafeFmtNum(fmtNumber);
  const safeFmtMonth = makeSafeFmtMonth(monthValueFormatter);
  const seriesData = chartSeries?.[0]?.data ?? [];
  if (!chartItemCode) return <Typography>품번을 선택해주세요</Typography>;

  const hasData = (chartMonths?.length ?? 0) > 0 && (seriesData?.length ?? 0) > 0;

  const yMax = Math.max(...seriesData.map((v) => num(v)), 0);
  const yMaxWithHeadroom = Number.isFinite(yMax) && yMax > 0 ? yMax * 1.1 + 1 : 10;

  const MonthlyTooltipContent = makeMonthlyTooltipContent({
    chartMonths, seriesData, monthTop3Map, safeFmtNum, safeFmtMonth,
  });

  // 막대 바깥 라벨
  const OutsideBarLabel = (props) => {
    const { x, y, width, dataIndex } = props;
    const v = num(seriesData?.[dataIndex]);
    const labelX = x + (width ?? 0) / 2;
    const labelY = Math.max((y ?? 0) - 6, 12);
    return (
      <text x={labelX} y={labelY} textAnchor="middle" fontSize={14} fontWeight={700} fill="#333">
        {safeFmtNum(v)}분
      </text>
    );
  };

  return (
    <ChartFrame titleColor={themeHex} chartItemCode={chartItemCode}>
      {hasData ? (
        <ChartContainer
          xAxis={[{
            id: "months", scaleType: "band", data: chartMonths,
            label: "월", valueFormatter: (v) => safeFmtMonth(v), tickLabelInterval: () => true,
          }]}
          yAxis={[{ label: "비가동(분)", max: yMaxWithHeadroom }]}
          series={[{
            type: "bar", id: "minutes", label: "비가동(분)", data: seriesData,
            color: themeHex, valueFormatter: (v) => `${safeFmtNum(v)}분`, borderRadius: 8,
          }]}
          height={420}
          margin={{ top: 56, right: 24, bottom: 64, left: 64 }}
        >
          <BarPlot barLabel="value" slots={{ barLabel: OutsideBarLabel }} />
          <ChartsXAxis />
          <ChartsYAxis />
          <ChartsTooltip
            trigger="item"
            slots={{ itemContent: MonthlyTooltipContent }}
            slotProps={{ popper: { modifiers: [{ name: "offset", options: { offset: [0, 8] } }] } }}
          />
        </ChartContainer>
      ) : (
        <Box sx={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary" }}>
          표시할 데이터가 없습니다.
        </Box>
      )}
    </ChartFrame>
  );
}
