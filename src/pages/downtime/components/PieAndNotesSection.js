import React from "react";
import { Box, Typography, Paper, Grid, List, ListItem, Stack, Chip, CircularProgress } from "@mui/material";
import { PieChart } from "@mui/x-charts/PieChart";

export default function PieAndNotesSection({
    chartItemCode,
    pieData,
    topNotes,
    loading,
    error,
}) {
    return (
        <Grid container spacing={2} sx={{ mb: 2, mt: 1 }}>
        {/* 파이 차트 */}
        <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: "16px", height: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {chartItemCode || "-"} · 비가동명 비중
            </Typography>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
                {pieData?.length ? (
                <PieChart
                    series={[{
                    data: pieData,
                    arcLabel: (it) => it.label,
                    arcLabelMinAngle: 12,
                    innerRadius: 40,
                    paddingAngle: 2,
                    }]}
                    height={300}
                    slotProps={{ legend: { direction: "column", position: { vertical: "middle", horizontal: "right" } } }}
                />
                ) : (
                <Box sx={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary", gap: 1 }}>
                    {loading.pie ? (<><CircularProgress size={18} /> 파이 데이터 로딩…</>) : "해당 자재번호의 비가동명 데이터가 없습니다."}
                </Box>
                )}
            </Box>
            {error.pie && <Typography color="error">{error.pie}</Typography>}
            </Paper>
        </Grid>

        {/* 비고 Top */}
        <Grid item xs={12} md={6}>
            <Paper sx={{ p: 2, borderRadius: "16px", height: "100%" }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                {chartItemCode || "-"} · 가장 많이 등장한 비고
            </Typography>
            {topNotes.length ? (
                <List dense>
                {topNotes.map((n, i) => (
                    <ListItem key={i} disableGutters sx={{ "&:hover": { backgroundColor: "#f5f5f5", cursor: "pointer" } }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", width: "100%", p: 0.5, borderBottom: "1px solid #f0f0f0" }}>
                        <Box sx={{ fontSize: "0.85rem", fontWeight: 500 }}>{i + 1}. {n.text}</Box>
                        <Stack direction="row" spacing={1}>
                        <Chip size="small" label={`${n.count}건`}   sx={{ backgroundColor: "#e3f2fd", color: "#1976d2", fontWeight: 600 }} />
                        <Chip size="small" label={`${n.minutes}분`} sx={{ backgroundColor: "#fce4ec", color: "#d81b60", fontWeight: 600 }} />
                        </Stack>
                    </Box>
                    </ListItem>
                ))}
                </List>
            ) : (
                <Box sx={{ minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center", color: "text.secondary", gap: 1 }}>
                {loading.notes ? (<><CircularProgress size={18} /> 비고 데이터 로딩…</>) : "반복적으로 등장한 비고가 없습니다."}
                </Box>
            )}
            {error.notes && <Typography color="error">{error.notes}</Typography>}
            </Paper>
        </Grid>
        </Grid>
    );
}
