import React from "react";
import { Box, Grid, Paper, Typography, CircularProgress } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TimelineIcon from "@mui/icons-material/Timeline";
import BuildIcon from "@mui/icons-material/Build";

export default function KpiSection({
    themeHex, kpiSummary, loading, error, fmtNumber, fmtMinutes, pageLoading, pageError
}) {
    return (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ display:'flex', alignItems:'center', gap:1, color: themeHex, mb:2 }}>
            비가동 현황 지표
        </Typography>

        {pageLoading ? (
            <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height: 120 }}>
            <CircularProgress />
            </Box>
        ) : pageError ? (
            <Typography color="error" sx={{ textAlign:'center', py:2 }}>{pageError}</Typography>
        ) : (
            <Grid container spacing={2}>
            {[
                { label: '총 비가동(분)', value: fmtMinutes(kpiSummary.total), icon: <AccessTimeIcon color="warning" /> },
                { label: '건수', value: `${fmtNumber(kpiSummary.count)}건`, icon: <AssignmentIcon color="primary" /> },
                { label: '1건 평균(분)', value: fmtMinutes(kpiSummary.avg), icon: <TimelineIcon color="success" /> },
                { label: '최다 비가동명', value: kpiSummary.topName, icon: <BuildIcon color="error" /> },
            ].map((kpi, i) => (
                <Grid item xs={12} sm={6} md={3} key={i}>
                <Paper sx={{ p:2, borderRadius:"16px", textAlign:"center", height:160, display:"flex", flexDirection:"column", justifyContent:"center" }}>
                    <Box sx={{ display:'flex', justifyContent:'center', mb:1 }}>{kpi.icon}</Box>
                    <Typography variant="overline" sx={{fontSize:'13px', fontWeight:'bold'}}>{kpi.label}</Typography>
                    <Typography variant="h4" sx={{ mt:.5, fontWeight:'bold' }}>{kpi.value}</Typography>
                </Paper>
                </Grid>
            ))}
            </Grid>
        )}

        {loading.summary && <Box sx={{ mt:2, display:'flex', alignItems:'center', gap:1 }}><CircularProgress size={18}/> 지표 로딩…</Box>}
        {error.summary && <Typography color="error" sx={{ mt: 1 }}>{error.summary}</Typography>}
        </Paper>
    );
}
