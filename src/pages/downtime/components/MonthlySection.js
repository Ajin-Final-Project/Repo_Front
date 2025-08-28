import React from "react";
import { Box, Typography, Paper, CircularProgress } from "@mui/material";
import { BarChart } from "@mui/x-charts/BarChart";
import { BarChart as BarChartIcon } from "@mui/icons-material";

export default function MonthlySection({
    chartMonths,
    chartSeries,
    loading,
    error,
    themeHex,
    monthValueFormatter,
    fmtNumber,
}) {
    return (
        <Paper sx={{ p: 3, mb: 3, borderRadius: "16px" }}>
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: themeHex, mb: 2 }}>
            <BarChartIcon /> 자재별 월간 비가동
        </Typography>

        {(!loading.monthly && !error.monthly && chartMonths.length > 0) ? (
            <BarChart
            xAxis={[{
                id: "months", scaleType: "band", data: chartMonths,
                label: "월", valueFormatter: monthValueFormatter, tickLabelInterval: () => true,
            }]}
            yAxis={[{ label: "비가동(분)" }]}
            series={[{
                label: "비가동(분)",
                data: chartSeries[0].data,
                valueFormatter: (v) => `${fmtNumber(v)}분`,
                color: themeHex,
            }]}
            barLabel={(item) => `${fmtNumber(item.value)}분`}
            height={420}
            margin={{ top: 24, right: 24, bottom: 64, left: 64 }}
            borderRadius={8}
            slotProps={{ legend: { hidden: true } }}
            />
        ) : (
            <Box sx={{ height: 220, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary", gap: 1 }}>
            {loading.monthly ? (<><CircularProgress size={18}/> 월별 합계 로딩…</>) : "표시할 데이터가 없습니다."}
            </Box>
        )}

        {error.monthly && <Typography color="error" sx={{ mt: 1 }}>{error.monthly}</Typography>}
        </Paper>
    );
}
