// src/pages/DowntimeChart/components/FacilityItemDowntimeAggSection.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Button,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Tooltip,
  Chip,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  DensitySmall as DensitySmallIcon,
  DensityMedium as DensityMediumIcon,
} from "@mui/icons-material";

export default function FacilityItemDowntimeAggSection({
  data = [],
  loading = false,
  error = null,
  onRetry,
  themeHex = "#1976d2",
  onChangeExpected,
}) {
  // ── 상태
  const [localOverrides, setLocalOverrides] = useState({});
  const [editing, setEditing] = useState(null); // 현재 편집중인 downtimeName
  const [editValue, setEditValue] = useState("");
  const [q, setQ] = useState(""); // 검색어
  const [sortKey, setSortKey] = useState("severity"); // severity | count | expected | name
  const [density, setDensity] = useState("standard"); // compact | standard

  // ── 데이터 머지 + 계산
  const merged = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    return arr.map((r) => {
      const override = localOverrides[r.downtimeName];
      const expected = override !== undefined && override !== null
        ? Number(override)
        : Number(r.expectedMinutes || 0);
      const count = Number(r.count || 0);
      const severity = count * expected; // 핵심: 심각도(총 분)
      return { ...r, displayMinutes: expected, count, severity };
    });
  }, [data, localOverrides]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return merged;
    return merged.filter((r) => (r.downtimeName || "").toLowerCase().includes(kw));
  }, [merged, q]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const collator = new Intl.Collator("ko-KR");
    arr.sort((a, b) => {
      switch (sortKey) {
        case "count": return b.count - a.count;
        case "expected": return b.displayMinutes - a.displayMinutes;
        case "name": return collator.compare(a.downtimeName || "", b.downtimeName || "");
        case "severity":
        default: return b.severity - a.severity;
      }
    });
    return arr;
  }, [filtered, sortKey]);

  const totals = useMemo(() => {
    const totalCount = sorted.reduce((s, r) => s + r.count, 0);
    const totalMinutes = sorted.reduce((s, r) => s + r.severity, 0);
    return { totalCount, totalMinutes };
  }, [sorted]);

  // Pareto (80%) 계산
  const paretoInfo = useMemo(() => {
    if (sorted.length === 0) return { topCount: 0, ratio: 0, isParetoSet: new Set() };
    const total = sorted.reduce((s, r) => s + r.severity, 0);
    if (total <= 0) return { topCount: 0, ratio: 0, isParetoSet: new Set() };

    let cum = 0;
    let idx = 0;
    const isParetoSet = new Set();
    while (idx < sorted.length && cum / total < 0.8) {
      cum += sorted[idx].severity;
      isParetoSet.add(sorted[idx].downtimeName);
      idx += 1;
    }
    return { topCount: idx, ratio: Math.min(100, Math.round((cum / total) * 100)), isParetoSet };
  }, [sorted]);

  // ── 상태별 렌더
  if (loading) {
    return (
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2, minHeight: 220, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress size={60} sx={{ color: themeHex }} />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        {onRetry && (
          <Button variant="contained" onClick={onRetry} startIcon={<RefreshIcon />} sx={{ backgroundColor: themeHex }}>
            다시 시도
          </Button>
        )}
      </Paper>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
      {/* 헤더 & 컨트롤 */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          설비 기준 · 제품별 비가동 발생 현황 & 예상 조치시간
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <TextField
            size="small"
            placeholder="비가동명 검색"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            size="small"
            select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            label="정렬"
            sx={{ minWidth: 130 }}
          >
            <MenuItem value="severity">심각도(총 분)</MenuItem>
            <MenuItem value="count">발생건수</MenuItem>
            <MenuItem value="expected">예상분/건</MenuItem>
            <MenuItem value="name">가나다</MenuItem>
          </TextField>

          <ToggleButtonGroup
            value={density}
            exclusive
            onChange={(_, v) => v && setDensity(v)}
            size="small"
          >
            <ToggleButton value="compact" aria-label="콤팩트">
              <DensitySmallIcon fontSize="small" />
            </ToggleButton>
            <ToggleButton value="standard" aria-label="표준">
              <DensityMediumIcon fontSize="small" />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* KPI 요약 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 1.5,
          mb: 2,
        }}
      >
        <KpiCard
          title="총 발생건수"
          value={`${totals.totalCount.toLocaleString("ko-KR")}건`}
          themeHex={themeHex}
        />
        <KpiCard
          title="총 예상 소요시간"
          value={`${totals.totalMinutes.toLocaleString("ko-KR")}분`}
          subtitle="(발생건수 × 예상분/건)"
          themeHex={themeHex}
        />
        <KpiCard
          title="Pareto 80% 누적"
          value={`${paretoInfo.ratio}%`}
          subtitle={`상위 ${paretoInfo.topCount}개 항목이 커버`}
          themeHex={themeHex}
        />
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* 본문 그리드 */}
      {sorted.length === 0 ? (
        <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
          표시할 데이터가 없습니다.
          {onRetry && (
            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRetry}>
                다시 불러오기
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Grid container spacing={density === "compact" ? 1 : 1.5}>
          {sorted.map((row, idx) => {
            const isEditing = editing === row.downtimeName;
            const total = totals.totalMinutes || 1;
            const share = Math.max(0, Math.round((row.severity / total) * 100));
            const medalColor =
              idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : null;
            const isPareto = paretoInfo.isParetoSet.has(row.downtimeName);

            return (
              <Grid
                item
                key={row.id ?? row.downtimeName ?? idx}
                xs={12}
                sm={6}
                md={4}
                lg={3}
                xl={density === "compact" ? 2 : 3}
              >
                <Box
                  sx={{
                    p: density === "compact" ? 1.25 : 1.75,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    display: "flex",
                    flexDirection: "column",
                    gap: density === "compact" ? 1 : 1.25,
                    height: "100%",
                    position: "relative",
                    overflow: "hidden",
                    "&:hover": {
                      boxShadow: 3,
                      transform: "translateY(-1px)",
                      transition: "all .15s ease",
                    },
                    // 좌측 강조 바
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: themeHex,
                      opacity: 0.8,
                    },
                  }}
                >
                  {/* 상단 라벨 영역 */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    {/* 랭크/메달 */}
                    <Box
                      sx={{
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        bgcolor: medalColor ? medalColor : "action.hover",
                        color: medalColor ? "#222" : "text.secondary",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                      aria-label={`순위 ${idx + 1}`}
                      title={`순위 ${idx + 1}`}
                    >
                      {idx + 1}
                    </Box>

                    <Tooltip title={row.downtimeName}>
                      <Typography
                        variant={density === "compact" ? "subtitle2" : "subtitle1"}
                        sx={{
                          fontWeight: 700,
                          lineHeight: 1.2,
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.downtimeName}
                      </Typography>
                    </Tooltip>

                    {isPareto && (
                      <Chip
                        size="small"
                        label="Pareto 80%"
                        sx={{ bgcolor: "warning.light", color: "warning.contrastText" }}
                      />
                    )}
                  </Box>

                  {/* 핵심 수식 라인 */}
                  <Typography variant="body2" color="text.secondary">
                    발생 <b>{row.count.toLocaleString("ko-KR")}</b>건 × 예상{" "}
                    <b>{row.displayMinutes.toLocaleString("ko-KR")}분/건</b> = 총{" "}
                    <b>{row.severity.toLocaleString("ko-KR")}분</b>
                  </Typography>

                  {/* 진행바: 전체 대비 해당 항목 기여도 */}
                  <Box>
                    <LinearProgress
                      variant="determinate"
                      value={share}
                      sx={{
                        height: 8,
                        borderRadius: 8,
                        bgcolor: "action.hover",
                        "& .MuiLinearProgress-bar": {
                          background: themeHex,
                          opacity: 0.5,
                        },
                      }}
                      aria-label={`전체 대비 ${share}%`}
                    />
                    <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        전체 대비
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {share}%
                      </Typography>
                    </Box>
                  </Box>

                  {/* 예상시간 편집 */}
                  <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                    {!isEditing ? (
                      <>
                        <Typography variant="body2">
                          예상{" "}
                          <b>{Number(row.displayMinutes || 0).toLocaleString("ko-KR")}분/건</b>
                        </Typography>
                        <Tooltip title="예상시간 수정">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setEditing(row.downtimeName);
                              setEditValue(String(row.displayMinutes || 0));
                            }}
                            aria-label="예상시간 수정"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, width: "100%" }}>
                        <TextField
                          size="small"
                          type="number"
                          label="예상분/건"
                          sx={{ width: 130 }}
                          value={editValue}
                          autoFocus
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") commitEdit(row.downtimeName, editValue);
                            else if (e.key === "Escape") setEditing(null);
                          }}
                          inputProps={{ min: 0 }}
                        />
                        <Tooltip title="저장(Enter)">
                          <IconButton
                            color="primary"
                            size="small"
                            onClick={() => commitEdit(row.downtimeName, editValue)}
                            aria-label="저장"
                          >
                            <CheckIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="취소(Esc)">
                          <IconButton size="small" onClick={() => setEditing(null)} aria-label="취소">
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Paper>
  );

  function commitEdit(name, value) {
    const minutes = Math.max(0, Math.round(Number(value || 0)));
    setLocalOverrides((prev) => ({ ...prev, [name]: minutes }));
    setEditing(null);
    if (typeof onChangeExpected === "function") {
      onChangeExpected(name, minutes);
    }
  }
}

// ── 작은 KPI 카드 컴포넌트
function KpiCard({ title, value, subtitle, themeHex }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        position: "relative",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          right: -24,
          top: -24,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: themeHex,
          opacity: 0.08,
        },
      }}
    >
      <Typography variant="overline" sx={{ color: "text.secondary", letterSpacing: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 800 }}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}
