// KpiSection.jsx
import React from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Skeleton,
  Alert,
  Divider,
  Stack,
  Chip,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

// 아이콘
import AccessTimeIcon from "@mui/icons-material/AccessTime";             // 총 비가동
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered"; // 건수
import TimerIcon from "@mui/icons-material/Timer";                       // 평균 비가동
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";           // TOP 3
import DateRangeIcon from "@mui/icons-material/DateRange";               // 기간

/**
 * props:
 * - themeHex: string
 * - kpiSummary: { total, count, avg, topName, topValue, topList? }
 * - loading: { summary?: boolean }
 * - error:   { summary?: string|null }
 * - fmtNumber(n): (number) => string
 * - fmtMinutes(n): (number) => string
 * - pageLoading?: boolean
 * - pageError?: string|null
 * - periodStart?: string (YYYY-MM-DD)
 * - periodEnd?: string   (YYYY-MM-DD)
 */
export default function KpiSection({
  themeHex = "#ff8f00",
  kpiSummary = { total: 0, count: 0, avg: 0, topName: "-", topValue: 0, topList: [] },
  loading = {},
  error = {},
  fmtNumber = (n) => String(n ?? 0),
  fmtMinutes = (n) => `${n ?? 0}`,
  pageLoading = false,
  pageError = null,
  periodStart = "",
  periodEnd = "",
}) {
  const isLoading = Boolean(pageLoading || loading.summary);
  const errMsg = pageError || error.summary || null;

  const topList = Array.isArray(kpiSummary?.topList) ? kpiSummary.topList : [];
  const top3 = topList.slice(0, 3);

  const CARD_MIN_H = 140;

  const IconWrap = ({ children }) => (
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: (t) => alpha(themeHex, 0.12),
        color: themeHex,
        flexShrink: 0,
      }}
    >
      {children}
    </Box>
  );

  // ✅ 세로·가로 모두 가운데 정렬 + “아이콘 / 제목 / 값” 각각 한 줄
  const StatCard = ({ icon, title, value, subtitle }) => (
    <Card
      elevation={2}
      sx={{
        borderTop: `4px solid ${themeHex}`,
        borderRadius: 2,
        minHeight: CARD_MIN_H,
        height: "100%",
        "&:hover": { transform: "translateY(-2px)", transition: "all 0.2s ease-in-out" },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "100%",
          gap: 0.75,
        }}
      >
        {/* 1) 아이콘 (한 줄) */}
        <IconWrap>{icon}</IconWrap>

        {/* 2) 제목 (한 줄) */}
        <Typography variant="overline" sx={{ opacity: 0.8 }}>
          {title}
        </Typography>

        {/* 3) 값 (한 줄) */}
        {isLoading ? (
          <Skeleton variant="text" width={120} height={38} />
        ) : (
          <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
            {value}
          </Typography>
        )}

        {/* (선택) 보조설명 — 아래 한 줄 */}
        {subtitle ? (
          isLoading ? (
            <Skeleton variant="text" width={160} />
          ) : (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {subtitle}
            </Typography>
          )
        ) : null}
      </CardContent>
    </Card>
  );

  // ✅ TOP 3 (비가동명만) — 레이아웃 유지
  const TopListCard = () => (
    <Card
      elevation={2}
      sx={{
        borderTop: `4px solid ${themeHex}`,
        borderRadius: 2,
        minHeight: CARD_MIN_H,
        height: "100%",
        "&:hover": { transform: "translateY(-2px)", transition: "all 0.2s ease-in-out" },
      }}
    >
      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "100%",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", mb: 1 }}>
          <IconWrap>
            <EmojiEventsIcon fontSize="small" />
          </IconWrap>
          <Typography variant="overline" sx={{ opacity: 0.8, ml: 1 }}>
            최다 비가동 TOP 3
          </Typography>
        </Box>

        {isLoading ? (
          <Box sx={{ mt: 0.5, width: "100%" }}>
            <Skeleton variant="text" width="90%" sx={{ mx: "auto" }} />
            <Skeleton variant="text" width="85%" sx={{ mx: "auto" }} />
            <Skeleton variant="text" width="80%" sx={{ mx: "auto" }} />
          </Box>
        ) : top3.length ? (
          <Stack spacing={1} sx={{ mt: 0.5, alignItems: "center", width: "100%" }}>
            {top3.map((it, idx) => {
              const name = String(it?.name ?? "-");
              return (
                <Box
                  key={`${name}-${idx}`}
                  sx={{
                    display: "flex",
                    gap: 1,
                    alignItems: "center",
                    justifyContent: "center",
                    py: 0.25,
                    maxWidth: "100%",
                  }}
                >
                  <Typography variant="body2" sx={{ width: 18, textAlign: "right", flex: "0 0 auto" }}>
                    {idx + 1}.
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 220,
                    }}
                    title={name}
                  >
                    {name}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <Box sx={{ mt: 0.5 }}>
            <Typography variant="body2">{kpiSummary?.topName ?? "-"}</Typography>
            <Divider sx={{ my: 1 }} />
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              집계된 TOP 리스트가 없거나 필터 결과가 없습니다.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );

  // 기간 표시(한 곳에서만)
  const PeriodBar = () => (
    <Box sx={{ display: "flex", mb: 3 }}>
      <Chip
        icon={<DateRangeIcon />}
        variant="outlined"
        label={
          isLoading
            ? "기간 계산 중…"
            : periodStart && periodEnd
            ? `기간: ${periodStart} ~ ${periodEnd}`
            : "기간: 전체"
        }
        sx={{
          borderColor: themeHex,
          color: "text.primary",
          "& .MuiChip-icon": { color: themeHex },
        }}
      />
    </Box>
  );

  return (
    <Box sx={{ mb: 3 }}>
      {errMsg ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errMsg}
        </Alert>
      ) : null}

      <PeriodBar />

      <Grid container spacing={2}>
        {/* 총 비가동 */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<AccessTimeIcon fontSize="small" />}
            title="총 비가동"
            value={isLoading ? "—" : `${fmtMinutes(Number(kpiSummary?.total ??  0))}시`}
          />
        </Grid>

        {/* 건수 */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<FormatListNumberedIcon fontSize="small" />}
            title="건수"
            value={isLoading ? "—" : fmtNumber(Number(kpiSummary?.count ?? 0))}
          />
        </Grid>

        {/* 평균 비가동(건당) */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TimerIcon fontSize="small" />}
            title="평균 비가동(건당)"
            value={isLoading ? "—" : `${fmtMinutes(Number(kpiSummary?.avg ?? 0))}분`}
          />
        </Grid>

        {/* TOP 3 */}
        <Grid item xs={12} sm={6} md={3}>
          <TopListCard />
        </Grid>
      </Grid>

      {isLoading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, opacity: 0.7, justifyContent: "center" }}>
          <CircularProgress size={18} />
          <Typography variant="caption">KPI를 불러오는 중…</Typography>
        </Box>
      ) : null}
    </Box>
  );
}
