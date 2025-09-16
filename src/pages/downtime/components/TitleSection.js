import React from "react";

import {
    Box,
    Typography,
} from '@mui/material';

import {
    TrendingUp as TrendingUpIcon
} from '@mui/icons-material';

import s from "../DowntimeChart.module.scss";


export default function TitleSection({ themeHex }) {
    return (
        <Box sx={{ mb: 3 }}>
            <Typography
                variant="h4"
                gutterBottom
                sx={{
                color: themeHex,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                }}
            >
                <TrendingUpIcon sx={{color: themeHex}} />
                비가동 데이터 분석
            </Typography>
            <Typography variant="body1" color="text.secondary">
                비가동 현황을 상세하게 조회하고 관리할 수 있습니다.
            </Typography>
        </Box>
    );
}