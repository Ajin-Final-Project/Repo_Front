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
  TableContainer,
  List,
  ListItem,
  TableSortLabel,
  useTheme,
} from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

/* 기본 포맷터 */
const formatDurationKo = (min) => {
  const n = Math.max(0, Math.floor(Number(min ?? 0)));
  const h = Math.floor(n / 60);
  const m = n % 60;
  if (h > 0) return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
  return `${m}분`;
};

export default function DowntimeAggSection({
  chartItemCode,
  mode = "ITEM",
  title = "비가동 목록",
  subtitle = "",
  data = [],
  loading = false,
  error = null,
  onRetry,
  onSelect,
  themeHex = "#1976d2",
  fmtDuration,
}) {
  const theme = useTheme();
  const accent =
    themeHex && typeof themeHex === "string" ? themeHex : theme.palette.primary.main;

  const toDur = (v) =>
    typeof fmtDuration === "function" ? fmtDuration(v) : formatDurationKo(v);

  const [selected, setSelected] = useState(null);
  const [sortBy, setSortBy] = useState("expectedMinutes"); // 'expectedMinutes' | 'downtimeName'
  const [sortDir, setSortDir] = useState("desc"); // 'asc' | 'desc'

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir(key === "downtimeName" ? "asc" : "desc");
    }
  };

  const sortedRows = useMemo(() => {
    const copy = Array.isArray(data) ? [...data] : [];
    copy.sort((a, b) => {
      const aVal =
        sortBy === "expectedMinutes"
          ? Number(a.expectedMinutes || 0)
          : String(a.downtimeName ?? "");
      const bVal =
        sortBy === "expectedMinutes"
          ? Number(b.expectedMinutes || 0)
          : String(b.downtimeName ?? "");

      let cmp = 0;
      if (typeof aVal === "number" && typeof bVal === "number") {
        cmp = aVal - bVal;
      } else {
        cmp = String(aVal).localeCompare(String(bVal), "ko");
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [data, sortBy, sortDir]);

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
        height: 500,
      }}
    >
      <CardHeader
        title={
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
            <Typography variant="h6" sx={{ color: "white", fontWeight: 800 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography
                variant="body2"
                sx={{ color: "white", opacity: 0.9, display: { xs: "none", sm: "inline" } }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
        }
        sx={{
          backgroundColor: accent,
          color: "white",
          py: 1.5,
          flexShrink: 0,
          position: "relative",
          zIndex: 2,
        }}
      />

      {loading ? (
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 0,
          }}
        >
          <CircularProgress sx={{ color: accent }} size={56} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {error}
          </Alert>
          {onRetry && (
            <Button variant="contained" onClick={onRetry} sx={{ backgroundColor: accent }}>
              다시 시도
            </Button>
          )}
        </Box>
      ) : !chartItemCode ? (
        // ✅ 품번 미선택 시 안내문구
        <Box sx={{ width: "100%", height: "100%", p: 2 }}>
          <Paper
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              p: { xs: 3, sm: 4 },
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
              비가동 목록 안내
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              품번을 선택하면 아래와 같이 <strong>세부 비가동 항목과 예상 소요 시간</strong>이 표시됩니다.
            </Typography>

            <List dense sx={{ display: "inline-block", textAlign: "left", mt: 1 }}>
              <ListItem disableGutters>• 각 비가동명별 예상 소요 시간(건당)</ListItem>
              <ListItem disableGutters>• 비가동 항목 클릭 시 상세 내역 확인 가능</ListItem>
            </List>

            <Typography variant="body2" sx={{ mt: 2 }}>
              상단/좌측의 품번 선택 영역에서 원하는 품번을 먼저 선택해 주세요.
            </Typography>
          </Paper>
        </Box>
      ) : sortedRows.length === 0 ? (
        // ✅ 데이터 없을 때
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            p: 3,
            flex: 1,
            minHeight: 0,
          }}
        >
          <Typography color="text.secondary">표시할 비가동 데이터가 없습니다.</Typography>
        </Box>
      ) : (
        <Box sx={{ px: 2, pb: 2, flex: 1, minHeight: 0 }}>
          {/* ✅ 테이블 스크롤 전용 컨테이너 + 커스텀 스크롤바 */}
          <TableContainer
            sx={{
              maxHeight: "100%",
              overflow: "auto",
              borderRadius: 1,
              "&::-webkit-scrollbar": { width: 8, height: 8 },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(0,0,0,0.24)",
                borderRadius: 8,
              },
              "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0,0,0,0.24) transparent",
            }}
          >
            <Table
              stickyHeader
              size="medium"
              aria-label="비가동명 및 조치예상 시간"
              sx={{
                borderCollapse: "separate",
                borderSpacing: "0 8px",
                "& .MuiTableCell-stickyHeader": {
                  fontWeight: 700,
                  color: "text.secondary",
                  bgcolor: "background.paper",
                },
                "& tbody tr": {
                  cursor: "pointer",
                  "&:hover": { backgroundColor: "action.hover" },
                },
                "& td, & th": {
                  py: { xs: 1, sm: 1.25 },
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: { xs: 1.5, sm: 2.5 } }}>
                    <TableSortLabel
                      active={sortBy === "downtimeName"}
                      direction={sortBy === "downtimeName" ? sortDir : "asc"}
                      onClick={() => handleSort("downtimeName")}
                    >
                      비가동명
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right" sx={{ pr: { xs: 1.5, sm: 2.5 }, whiteSpace: "nowrap" }}>
                    <TableSortLabel
                      active={sortBy === "expectedMinutes"}
                      direction={sortBy === "expectedMinutes" ? sortDir : "desc"}
                      onClick={() => handleSort("expectedMinutes")}
                    >
                      예상 소요 시간(건당)
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {sortedRows.map((r) => {
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
                        "& td": { borderBottom: "none" },
                        outline: isSelected ? `1px solid ${accent}` : "none",
                        outlineOffset: -1,
                        borderRadius: 2,
                        backgroundColor: isSelected ? "action.selected" : "transparent",
                        transition: "background-color 120ms ease, outline-color 120ms ease",
                      }}
                    >
                      <TableCell sx={{ pl: { xs: 1.5, sm: 2.5 } }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Box
                            sx={{
                              width: 6,
                              height: 22,
                              borderRadius: 1,
                              mr: 0.5,
                              bgcolor: isSelected ? accent : "transparent",
                              transition: "background-color 120ms ease",
                            }}
                          />
                          <Typography
                            fontWeight={600}
                            noWrap
                            title={r.downtimeName}
                            sx={{ flex: "1 1 auto", fontSize: { xs: 14, sm: 15 } }}
                          >
                            {r.downtimeName ?? "-"}
                          </Typography>
                          {/* {isSelected && (
                            <CheckCircleOutlineIcon
                              sx={{ fontSize: 18, color: accent, ml: 0.5, flexShrink: 0 }}
                            />
                          )} */}
                        </Box>
                      </TableCell>

                      <TableCell align="right" sx={{ pr: { xs: 1.5, sm: 2.5 } }}>
                        <Typography fontWeight={700} sx={{ fontVariantNumeric: "tabular-nums" }}>
                          {toDur(r.expectedMinutes)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Paper>
  );
}
