import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  CardHeader,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Button,
  LinearProgress,
  Chip,
  Divider,
  Stack,
  Tooltip,
  Grid,
  List,
  ListItem
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";

/* 공통 폴백 포맷터 (프롭으로 안 오면 사용) */
const formatDurationKo = (min) => {
  const n = Math.max(0, Math.floor(Number(min ?? 0)));
  const h = Math.floor(n / 60);
  const m = n % 60;
  if (h > 0) return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
  return `${m}분`;
};

/** -------------------------------- 좌측 패널 (고정 높이 500px + 내부 스크롤) -------------------------------- */
export default function FacilityItemDowntimeAggSection({
  data = [],
  loading = false,
  error = null,
  onRetry,
  themeHex = "#1976d2",
  onSelect,
  fmtDuration, // ✅ 규칙 포맷터
}) {
  const toDur = (v) =>
    typeof fmtDuration === "function" ? fmtDuration(v) : formatDurationKo(v);

  const [selected, setSelected] = useState(null);

  const rows = useMemo(() => {
    const copy = Array.isArray(data) ? [...data] : [];
    copy.sort(
      (a, b) =>
        (b.expectedMinutes || 0) - (a.expectedMinutes || 0) ||
        String(a.downtimeName).localeCompare(String(b.downtimeName))
    );
    return copy;
  }, [data]);

  const fmt = (n) =>
    new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(n ?? 0);

  const handleRowClick = (row) => {
    setSelected(row.downtimeName);
    if (typeof onSelect === "function") onSelect(row);
  };

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        mb: 3,
        display: "flex",
        flexDirection: "column",
        height: 500, // ✅ 고정 높이
      }}
    >
      <CardHeader
        title={
          <Typography
            variant="h6"
            sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}
          >
            비가동 목록
          </Typography>
        }
        sx={{ backgroundColor: themeHex, color: "white", py: 1.5, flexShrink: 0 }}
      />

      {loading ? (
        <Box
          sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}
        >
          <CircularProgress sx={{ color: themeHex }} size={56} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0, overflow: "auto" }}>
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
          {onRetry && (
            <Button variant="contained" onClick={onRetry} sx={{ backgroundColor: themeHex }}>
              다시 시도
            </Button>
          )}
        </Box>
      ) : rows.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 3,
            flex: 1,
            minHeight: 0,
            overflow: "auto",
          }}
        >
          <Typography color="text.secondary">
            표시할 비가동 데이터가 없습니다.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ px: 2, pb: 2, flex: 1, minHeight: 0, overflow: "auto" }}>
          <Table
            size="medium"
            aria-label="비가동명 및 조치예상 시간"
            sx={{
              borderCollapse: "separate",
              borderSpacing: "0 8px",
              "& thead th": {
                fontWeight: 700,
                color: "text.secondary",
                position: "sticky",
                top: 0,
                background: "background.paper",
                zIndex: 1,
              },
              "& tbody tr": {
                cursor: "pointer",
                backgroundColor: "background.paper",
                "&:hover": { backgroundColor: "action.hover" },
              },
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ pl: 2.5 }}>비가동명</TableCell>
                <TableCell align="right" sx={{ pr: 2.5 }}>
                  조치예상 시간{/* (건당) */}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const isSelected = selected === r.downtimeName;
                return (
                  <TableRow
                    key={r.id ?? r.downtimeName}
                    onClick={() =>
                      handleRowClick({
                        downtimeName: r.downtimeName,
                        expectedMinutes: r.expectedMinutes,
                      })
                    }
                    selected={isSelected}
                    sx={{
                      "& td": { borderBottom: "none", py: 1.25 },
                      outline: isSelected ? `2px solid ${themeHex}` : "none",
                      outlineOffset: -1,
                      borderRadius: 2,
                    }}
                  >
                    <TableCell sx={{ pl: 2.5 }}>
                      <Typography fontWeight={600} noWrap title={r.downtimeName}>
                        {r.downtimeName ?? "-"}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" sx={{ pr: 2.5 }}>
                      {/* ✅ 시간/분 규칙 적용 */}
                      <Typography fontWeight={700}>
                        {toDur(r.expectedMinutes)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
    </Paper>
  );
}

/** -------------------------------- 우측 패널 (고정 높이 500px + 내부 스크롤) -------------------------------- */
export function RightDetailSection({
  chartItemCode,
  causeName,
  data,
  loading = false,
  error = null,
  onRetry,
  themeHex = "#1976d2",
  /** 라벨 고정폭(px) – 길어도 바 시작점이 동일 */
  labelColumnWidth = 220,
  fmtDuration, // ✅ 규칙 포맷터
}) {
  const toDur = (v) =>
    typeof fmtDuration === "function" ? fmtDuration(v) : formatDurationKo(v);

  const fmt = (n) =>
    new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 }).format(n ?? 0);

  const share = Number(data?.share_pct ?? 0);
  const ave = data?.actual_vs_expected ?? null;
  const dist = Array.isArray(data?.actual_action_dist)
    ? data.actual_action_dist
    : [];
  const counts = data?.counts ?? { cause: 0, total: 0 };

  const diff = Number(ave?.diff_min ?? 0);
  const diffIsPlus = diff > 0;
  const diffIcon = diffIsPlus ? (
    <TrendingUpIcon fontSize="small" />
  ) : (
    <TrendingDownIcon fontSize="small" />
  );

  const progressBase = () => ({
    height: 12,
    borderRadius: 8,
    backgroundColor: alpha(themeHex, 0.12),
    "& .MuiLinearProgress-bar": {
      borderRadius: 8,
      backgroundColor: themeHex,
    },
  });

  const SectionTitle = ({ icon, children, hint }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
      <Box
        sx={{
          p: 0.75,
          borderRadius: 1.5,
          bgcolor: alpha(themeHex, 0.1),
          color: themeHex,
          display: "inline-flex",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
        {children}
      </Typography>
      {hint && (
        <Tooltip title={hint} arrow>
          <InfoOutlinedIcon sx={{ fontSize: 18, color: "text.disabled" }} />
        </Tooltip>
      )}
    </Box>
  );

  const KpiCard = ({ icon, label, value }) => (
    <Paper
      variant="outlined"
      sx={{
        p: 1.25,
        borderRadius: 2,
        display: "flex",
        alignItems: "center",
        gap: 1.25,
        borderColor: alpha(themeHex, 0.2),
      }}
    >
      <Box
        sx={{
          p: 0.75,
          borderRadius: 1.5,
          bgcolor: alpha(themeHex, 0.08),
          color: themeHex,
          display: "inline-flex",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  );

  return (
    <Paper
      elevation={3}
      sx={{
        borderRadius: 2,
        overflow: "hidden",
        mb: 3,
        display: "flex",
        flexDirection: "column",
        height: 500, // ✅ 고정 높이
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 800 }}>
              {causeName ? `비가동 상세 — ${causeName}` : "비가동 상세"}
            </Typography>
            {/* {causeName && (
              <Chip
                size="small"
                label="선택됨"
                sx={{
                  color: themeHex,
                  bgcolor: "white",
                  fontWeight: 700,
                  height: 22,
                }}
              />
            )} */}
          </Box>
        }
        sx={{ backgroundColor: themeHex, color: "white", py: 1.5, flexShrink: 0 }}
      />

      {/* 상태 처리 */}
      {loading ? (
        <Box
          sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}
        >
          <CircularProgress sx={{ color: themeHex }} size={56} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0, overflow: "auto" }}>
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
          {onRetry && (
            <Button variant="contained" onClick={onRetry} sx={{ backgroundColor: themeHex }}>
              다시 시도
            </Button>
          )}
        </Box>
      ) : !chartItemCode ? (   // ✅ 품번 미선택 시 안내문구
        <Box sx={{ width: "100%", height: "100%", p: 2 }}>
          <Paper
            sx={{
              display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column",
              p: 4,
              width: "100%",
              height: "100%",
              borderRadius: "16px",
              textAlign: "center",
              color: "text.secondary",
              bgcolor: "background.default",
              border: "1px dashed",
              borderColor: "divider",
            }}
          >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            비가동 상세 안내
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            품번을 선택하면 아래와 같이 <strong>해당 품번의 비가동 상세 내역</strong>이 표시됩니다.
          </Typography>

          <List dense sx={{ display: "inline-block", textAlign: "left", mt: 1 }}>
            <ListItem disableGutters>• 전체 발생 건수 대비 비율</ListItem>
            <ListItem disableGutters>• 총 실제/예상 비가동 시간</ListItem>
            <ListItem disableGutters>• 실제 – 예상 차이</ListItem>
            <ListItem disableGutters>• 조치 분포 내역</ListItem>
          </List>

          <Typography variant="body2" sx={{ mt: 2 }}>
            상단/좌측의 품번 선택 영역에서 원하는 품번을 먼저 선택해 주세요.
          </Typography>
          </Paper>
        </Box>
      ): !causeName ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 3,
            flex: 1,
            minHeight: 0,
            overflow: "auto",
          }}
        >
          <Typography color="text.secondary">
            왼쪽에서 비가동명을 선택하면 상세가 표시됩니다.
          </Typography>
        </Box>
      ) : !data ? (
        <Box sx={{ p: 3, flex: 1, minHeight: 0, overflow: "auto" }}>
          <Typography color="text.secondary">데이터를 불러오는 중입니다…</Typography>
        </Box>
      ) : (
        /* ✅ 본문만 스크롤 (높이는 500px 안에서 자동) */
        <Box sx={{ p: 2.5, flex: 1, minHeight: 0, overflow: "auto" }}>
          {/* 섹션 1: 전체 비중 + KPI 카드 */}
          <SectionTitle
            icon={<QueryStatsIcon fontSize="small" />}
            hint="선택한 비가동이 전체 발생 건수에서 차지하는 비율"
          >
            전체 발생건수 대비 비율
          </SectionTitle>

          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
            <Box sx={{ minWidth: 92 }}>
              <Typography variant="h4" sx={{ fontWeight: 900, lineHeight: 1 }}>
                {share.toFixed(2)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {fmt(counts.cause)} / {fmt(counts.total)} 건
              </Typography>
            </Box>
            <Box sx={{ flex: 1 }}>
              <LinearProgress
                variant="determinate"
                value={Math.max(0, Math.min(100, share))}
                sx={progressBase()}
              />
            </Box>
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Grid container spacing={1.25} sx={{ mb: 2 }}>
            <Grid item xs={6} sm={3}>
              <KpiCard
                icon={<AccessTimeIcon fontSize="small" />}
                label="총 실제 비가동"
                value={toDur(ave?.actual_total_min || 0)} // ✅
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard
                icon={<AccessTimeIcon fontSize="small" />}
                label="총 예상 비가동"
                value={toDur(ave?.expected_total_min || 0)} // ✅
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard
                icon={<CompareArrowsIcon fontSize="small" />}
                label="실제 - 예상 차이"
                value={toDur(diff)} // ✅
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <KpiCard
                icon={<ListAltIcon fontSize="small" />}
                label="건당 예상 시간"
                value={toDur(ave?.expected_min_per_event || 0)} // ✅
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* 섹션 3: 실제 조치 분포 — 라벨 고정폭으로 바 길이/시작점 고정 */}
          <SectionTitle
            icon={<ListAltIcon fontSize="small" />}
            hint="비고(조치) 카테고리별 건수와 소요 시간 분포"
          >
            실제 조치 내역 분포
          </SectionTitle>

          {dist.length === 0 ? (
            <Typography color="text.secondary">표시할 조치 분포가 없습니다.</Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
              {(() => {
                const maxMinutes = Math.max(
                  ...dist.map((d) => Number(d.minutes || 0)),
                  1
                );
                return dist.map((r, idx) => {
                  const minutes = Number(r.minutes || 0);
                  const pct = Math.round((minutes / maxMinutes) * 100);
                  return (
                    <Box
                      key={`${r.label}-${idx}`}
                      sx={{
                        display: "grid",
                        gridTemplateColumns: `${labelColumnWidth}px minmax(160px, 550px) 50px 100px`,
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <Tooltip title={r.label} arrow>
                        <Typography
                          noWrap
                          sx={{
                            fontWeight: 600,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {r.label}
                        </Typography>
                      </Tooltip>

                      <LinearProgress
                        variant="determinate"
                        value={pct}
                        sx={{
                          width: "100%",
                          maxWidth: 600,
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(themeHex, 0.12),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            backgroundColor: themeHex,
                          },
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${r.count} 건`}
                        sx={{ bgcolor: alpha(themeHex, 0.08), color: themeHex }}
                      />
                      {/* ✅ 시간/분 규칙 적용 */}
                      <Typography fontWeight={700}>{toDur(minutes)}</Typography>
                    </Box>
                  );
                });
              })()}
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
}
