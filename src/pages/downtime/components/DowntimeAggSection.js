// components/DowntimeAggSection.jsx
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
} from "@mui/material";

/**
 * 스타일은 FacilityItemDowntimeAggSection 그대로,
 * 동작은 공통(행 클릭 → onSelect 호출, 예상시간만 표시)
 */
export default function DowntimeAggSection({
  mode = "ITEM",                 // "ITEM" | "LINE" (표시용)
  title = "비가동 목록",
  subtitle = "",
  data = [],
  loading = false,
  error = null,
  onRetry,
  onSelect,
  themeHex = "#1976d2",
}) {
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
        height: 500, // 좌/우 패널 높이 통일
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 800 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: "white", opacity: 0.9 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        }
        sx={{ backgroundColor: themeHex, color: "white", py: 1.5, flexShrink: 0 }}
      />

      {loading ? (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 0 }}>
          <CircularProgress sx={{ color: themeHex }} size={56} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0, overflow: "auto" }}>
          <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>
          {onRetry && (
            <Button variant="contained" onClick={onRetry} sx={{ backgroundColor: themeHex }}>
              다시 시도
            </Button>
          )}
        </Box>
      ) : rows.length === 0 ? (
        <Box sx={{ p: 3, flex: 1, minHeight: 0, overflow: "auto" }}>
          <Typography color="text.secondary">표시할 비가동 데이터가 없습니다.</Typography>
        </Box>
      ) : (
        <Box sx={{ px: 2, pb: 2, flex: 1, minHeight: 0, overflow: "auto" /* 본문만 스크롤 */ }}>
          <Table
            size="medium"
            aria-label="비가동명 및 조치예상 시간"
            sx={{
              borderCollapse: "separate",
              borderSpacing: "0 8px",
              "& thead th": { fontWeight: 700, color: "text.secondary", position: "sticky", top: 0, background: "background.paper", zIndex: 1 },
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
                  조치예상 시간(분/건)
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => {
                const isSelected = selected === r.downtimeName;
                return (
                  <TableRow
                    key={r.id ?? r.downtimeName}
                    onClick={() => handleRowClick({ downtimeName: r.downtimeName, expectedMinutes: r.expectedMinutes })}
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
                      <Typography fontWeight={700}>{fmt(r.expectedMinutes)}</Typography>
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
