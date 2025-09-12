// src/pages/DowntimeChart/components/FacilityLineDowntimeAggSection.jsx
import React, { useMemo, useState, useEffect } from "react";
import {
  Paper,
  CardHeader,
  Box,
  Typography,
  IconButton,
  Tooltip,
  LinearProgress,
  Alert,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TextField,
  Button,
  Stack,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  MenuItem,
  InputAdornment,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import SouthIcon from "@mui/icons-material/South";
import NorthIcon from "@mui/icons-material/North";
import MilitaryTechIcon from "@mui/icons-material/MilitaryTech";
import DensitySmallIcon from "@mui/icons-material/DensitySmall";
import DensityMediumIcon from "@mui/icons-material/DensityMedium";

/**
 * FacilityLineDowntimeAggSection
 * 라인 기준 · 비가동명 집계(건수, 예상 조치시간)를 보여주는 섹션 컴포넌트
 *
 * props
 *  - data: Array<{ id?, line?, downtimeName, count, expectedMinutes }>
 *  - loading: boolean
 *  - error: string | null
 *  - onRetry: () => void
 *  - themeHex: string
 *  - onChangeExpected?: (downtimeName: string, minutes: number, line?: string) => void
 */
export default function FacilityLineDowntimeAggSection({
  data,
  loading,
  error,
  onRetry,
  themeHex = "#1976d2",
  onChangeExpected,
}) {
  const rows = Array.isArray(data) ? data : [];

  // ── 라인 목록
  const lines = useMemo(() => {
    const set = new Set(rows.map((r) => r.line).filter(Boolean));
    return set.size ? Array.from(set).sort() : ["전체"];
  }, [rows]);

  const [activeLine, setActiveLine] = useState(lines[0] ?? "전체");

  // 라인 변경 보정
  useEffect(() => {
    if (!lines.includes(activeLine)) {
      setActiveLine(lines[0] ?? "전체");
    }
  }, [lines, activeLine]);

  // ── 툴바 상태
  const [q, setQ] = useState("");                 // 검색어
  const [sortKey, setSortKey] = useState("severity"); // severity | count | expected | name
  const [order, setOrder] = useState("desc");     // asc | desc
  const [density, setDensity] = useState("standard"); // compact | standard

  // ── 필터/정렬
  const prepped = useMemo(() => {
    // severity(총 시간)= count * expected
    return rows.map((r) => {
      const count = toNum(r.count);
      const expected = toNum(r.expectedMinutes);
      return {
        ...r,
        count,
        expectedMinutes: expected,
        severity: count * expected,
      };
    });
  }, [rows]);

  const filteredByLine = useMemo(() => {
    if (!prepped.length) return [];
    if (lines.length === 1 && lines[0] === "전체") return prepped;
    return prepped.filter((r) => r.line === activeLine);
  }, [prepped, lines, activeLine]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return filteredByLine;
    return filteredByLine.filter((r) =>
      (r.downtimeName || "").toLowerCase().includes(kw)
    );
  }, [filteredByLine, q]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const collator = new Intl.Collator("ko-KR");
    arr.sort((a, b) => {
      const dir = order === "asc" ? 1 : -1;
      switch (sortKey) {
        case "count":
          return (a.count - b.count) * dir;
        case "expected":
          return (a.expectedMinutes - b.expectedMinutes) * dir;
        case "name":
          return collator.compare(a.downtimeName || "", b.downtimeName || "") * dir;
        case "severity":
        default:
          return (a.severity - b.severity) * dir;
      }
    });
    // 내림차순 기본
    return arr;
  }, [filtered, sortKey, order]);

  // ── KPI & Pareto
  const kpi = useMemo(() => {
    const totalCount = sorted.reduce((s, r) => s + r.count, 0);
    const totalMinutes = sorted.reduce((s, r) => s + r.severity, 0);

    // Pareto 80%
    let cum = 0;
    let idx = 0;
    const isParetoSet = new Set();
    while (idx < sorted.length && totalMinutes > 0 && cum / totalMinutes < 0.8) {
      cum += sorted[idx].severity;
      isParetoSet.add(sorted[idx].downtimeName + "@" + (sorted[idx].line ?? ""));
      idx += 1;
    }
    const paretoRatio = totalMinutes > 0 ? Math.min(100, Math.round((cum / totalMinutes) * 100)) : 0;

    return { totalCount, totalMinutes, paretoTopN: idx, paretoRatio, isParetoSet };
  }, [sorted]);

  // ── 라인 칩 요약(건수)
  const lineCounts = useMemo(() => {
    const m = new Map();
    for (const r of prepped) {
      const key = r.line ?? "전체";
      m.set(key, (m.get(key) || 0) + r.count);
    }
    return m;
  }, [prepped]);

  const totalCountAll = useMemo(
    () => rows.reduce((s, r) => s + toNum(r.count), 0),
    [rows]
  );

  return (
    <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              설비 기준 · 라인별 비가동 발생 현황 & 예상 조치시간
            </Typography>
            <Chip
              size="small"
              label={`총 ${fmt(totalCountAll)}건`}
              sx={{ bgcolor: alpha(themeHex, 0.12), color: themeHex, fontWeight: 700 }}
            />
          </Box>
        }
        action={
          <Tooltip title="다시 불러오기">
            <span>
              <IconButton onClick={onRetry} disabled={loading} sx={{ color: themeHex }}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        }
        sx={{ pb: 1 }}
      />

      {/* 라인 선택 칩 */}
      {!(lines.length === 1 && lines[0] === "전체") && (
        <Stack direction="row" spacing={1} sx={{ px: 2, pb: 1, flexWrap: "wrap" }}>
          {lines.map((ln) => (
            <Chip
              key={ln}
              label={`${ln} · ${fmt(lineCounts.get(ln) || 0)}건`}
              onClick={() => setActiveLine(ln)}
              sx={{
                borderRadius: 2,
                fontWeight: activeLine === ln ? 800 : 500,
                bgcolor: activeLine === ln ? themeHex : alpha(themeHex, 0.08),
                color: activeLine === ln ? "white" : themeHex,
              }}
            />
          ))}
        </Stack>
      )}

      {/* KPI 3종 */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0,1fr))",
          gap: 1.25,
          px: 2,
          pb: 1.25,
          mt: 0.5,
        }}
      >
        <KpiCard themeHex={themeHex} title="필터 적용 · 총 발생건수" value={`${fmt(kpi.totalCount)}건`} />
        <KpiCard themeHex={themeHex} title="필터 적용 · 총 예상 소요시간" value={`${fmt(kpi.totalMinutes)}분`} subtitle="(건수 × 예상분/건)" />
        <KpiCard
          themeHex={themeHex}
          title="Pareto 80%"
          value={`${kpi.paretoRatio}%`}
          subtitle={`상위 ${kpi.paretoTopN}개 항목이 커버`}
        />
      </Box>

      {/* 툴바: 검색/정렬/밀도/CSV */}
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          gap: 1,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
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
          sx={{ minWidth: 220 }}
        />

        <TextField
          size="small"
          select
          label="정렬"
          value={sortKey}
          onChange={(e) => setSortKey(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="severity">심각도(총 시간)</MenuItem>
          <MenuItem value="count">건수</MenuItem>
          <MenuItem value="expected">예상분/건</MenuItem>
          <MenuItem value="name">가나다</MenuItem>
        </TextField>

        <ToggleButtonGroup
          value={order}
          exclusive
          onChange={(_, v) => v && setOrder(v)}
          size="small"
        >
          <ToggleButton value="desc" aria-label="내림차순">
            <SouthIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="asc" aria-label="오름차순">
            <NorthIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

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

        <Box sx={{ flex: 1 }} />

        <Button
          size="small"
          variant="outlined"
          onClick={() => exportCsv(sorted, activeLine)}
        >
          CSV 내보내기
        </Button>
      </Box>

      {loading && (
        <Box sx={{ px: 2, py: 1 }}>
          <LinearProgress sx={{ "& .MuiLinearProgress-bar": { bgcolor: themeHex } }} />
        </Box>
      )}

      {error && (
        <Box sx={{ px: 2, py: 1 }}>
          <Alert severity="error" sx={{ mb: 1 }}>{error}</Alert>
          {onRetry && (
            <Button variant="contained" onClick={onRetry} sx={{ backgroundColor: themeHex }}>
              다시 시도
            </Button>
          )}
        </Box>
      )}

      {!error && (
        <>
          <Divider sx={{ my: 1 }} />
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size={density === "compact" ? "small" : "medium"} stickyHeader>
              <TableHead>
                <TableRow>
                  {!(lines.length === 1 && lines[0] === "전체") && (
                    <TableCell sx={{ fontWeight: 700, width: 120 }}>라인</TableCell>
                  )}
                  <TableCell sx={{ fontWeight: 700, minWidth: 200 }}>비가동명</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, width: 120 }}>건수</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, width: 160 }}>예상분/건</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, width: 140 }}>총 시간(분)</TableCell>
                  <TableCell sx={{ fontWeight: 700, width: 210 }}>기여도</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sorted.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                      표시할 데이터가 없습니다.
                    </TableCell>
                  </TableRow>
                ) : (
                  sorted.map((r, idx) => (
                    <Row
                      key={r.id ?? `${r.line ?? "ALL"}-${r.downtimeName}`}
                      row={r}
                      idx={idx}
                      showLineColumn={!(lines.length === 1 && lines[0] === "전체")}
                      themeHex={themeHex}
                      totals={kpi}
                      density={density}
                      onChangeExpected={onChangeExpected}
                    />
                  ))
                )}

                {/* 합계 행 */}
                {sorted.length > 0 && (
                  <TableRow>
                    {!(lines.length === 1 && lines[0] === "전체") && <TableCell />}
                    <TableCell sx={{ fontWeight: 700 }}>합계</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(kpi.totalCount)}</TableCell>
                    <TableCell />
                    <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(kpi.totalMinutes)}</TableCell>
                    <TableCell />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Paper>
  );

  // ── 유틸
  function exportCsv(arr, ln) {
    const header = ["line", "downtimeName", "count", "expectedMinutes", "severity(totalMinutes)", "share(%)"];
    const total = arr.reduce((s, r) => s + r.severity, 0) || 1;
    const rows = arr.map((r) => [
      r.line ?? "",
      safeCsv(r.downtimeName),
      r.count,
      r.expectedMinutes,
      r.severity,
      Math.round((r.severity / total) * 100),
    ]);
    const csv = [header, ...rows].map((a) => a.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `라인별_비가동_${ln}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

function Row({ row, idx, showLineColumn, themeHex, totals, density, onChangeExpected }) {
  // 로컬 편집
  const [val, setVal] = useState(toInt(row.expectedMinutes));
  const [dirty, setDirty] = useState(false);

  // Pareto 80% 포함 여부 키
  const paretoKey = row.downtimeName + "@" + (row.line ?? "");
  const isPareto = totals.isParetoSet.has(paretoKey);

  const commit = () => {
    const minutes = clampNonNegInt(val);
    setVal(minutes);
    setDirty(false);
    if (typeof onChangeExpected === "function") {
      try {
        if (onChangeExpected.length >= 3) onChangeExpected(row.downtimeName, minutes, row.line);
        else onChangeExpected(row.downtimeName, minutes);
      } catch {}
    }
  };

  const totalMinutes = totals.totalMinutes || 1;
  const severity = toNum(row.count) * toNum(val);
  const share = Math.round((severity / totalMinutes) * 100);

  // Top3 메달 색
  const medalColor = idx === 0 ? "#FFD700" : idx === 1 ? "#C0C0C0" : idx === 2 ? "#CD7F32" : undefined;

  return (
    <TableRow
      hover
      sx={{
        position: "relative",
        ...(isPareto && {
          backgroundColor: alpha(themeHex, 0.06),
        }),
        "&:hover": { backgroundColor: isPareto ? alpha(themeHex, 0.1) : "action.hover" },
      }}
    >
      {showLineColumn && (
        <TableCell sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
          {row.line ?? "-"}
        </TableCell>
      )}

      <TableCell sx={{ minWidth: 200, fontWeight: 600, display: "flex", alignItems: "center", gap: 0.75 }}>
        {/* Top3 메달 */}
        {idx < 3 && (
          <Tooltip title={`Top ${idx + 1}`}>
            <MilitaryTechIcon sx={{ color: medalColor, fontSize: 18 }} />
          </Tooltip>
        )}
        <Tooltip title={row.downtimeName}>
          <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {row.downtimeName}
          </Box>
        </Tooltip>
        {isPareto && (
          <Chip size="small" label="Pareto 80%" sx={{ bgcolor: "warning.light", color: "warning.contrastText", height: 20 }} />
        )}
      </TableCell>

      <TableCell align="right" sx={{ fontWeight: 700 }}>{fmt(row.count)}</TableCell>

      <TableCell align="right">
        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
          <TextField
            size="small"
            type="number"
            inputProps={{ min: 0 }}
            value={val}
            onChange={(e) => { setVal(e.target.value); setDirty(true); }}
            onBlur={commit}
            onKeyDown={(e) => { if (e.key === "Enter") commit(); if (e.key === "Escape") { setVal(toInt(row.expectedMinutes)); setDirty(false); } }}
            sx={{ width: 120 }}
            label={density === "compact" ? undefined : "예상분/건"}
          />
          {dirty && (
            <Button size="small" variant="contained" onClick={commit} sx={{ backgroundColor: themeHex }}>
              적용
            </Button>
          )}
        </Stack>
      </TableCell>

      <TableCell align="right" sx={{ fontWeight: 700 }}>
        {fmt(severity)}
      </TableCell>

      <TableCell>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box sx={{ flex: 1 }}>
            <LinearProgress
              variant="determinate"
              value={share}
              sx={{
                height: 8,
                borderRadius: 8,
                bgcolor: "action.hover",
                "& .MuiLinearProgress-bar": {
                  background: themeHex,
                  opacity: 0.6,
                },
              }}
            />
          </Box>
          <Typography variant="body2" sx={{ width: 40, textAlign: "right", fontWeight: 700 }}>
            {share}%
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}

// ── 소형 KPI 카드
function KpiCard({ title, value, subtitle, themeHex }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
        position: "relative",
        overflow: "hidden",
        "&::after": {
          content: '""',
          position: "absolute",
          right: -20,
          top: -20,
          width: 72,
          height: 72,
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

// ── 유틸
function toNum(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x : 0;
}
function toInt(n) {
  return Math.round(Math.max(0, toNum(n)));
}
function clampNonNegInt(v) {
  return Math.max(0, Math.round(Number(v) || 0));
}
function fmt(n) {
  return toNum(n).toLocaleString("ko-KR");
}
function safeCsv(s) {
  const t = String(s ?? "");
  if (t.includes(",") || t.includes('"')) return `"${t.replace(/"/g, '""')}"`;
  return t;
}
