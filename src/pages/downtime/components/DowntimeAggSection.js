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
  ListItem
} from "@mui/material";

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
              <Typography variant="body2" sx={{ color: "white", opacity: 0.9 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        }
        sx={{
          backgroundColor: themeHex,
          color: "white",
          py: 1.5,
          flexShrink: 0,
          position: "relative",   // ✅ 겹침 방지
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
          <CircularProgress sx={{ color: themeHex }} size={56} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, flex: 1, minHeight: 0 }}>
          <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>
          {onRetry && (
            <Button
              variant="contained"
              onClick={onRetry}
              sx={{ backgroundColor: themeHex }}
            >
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
              비가동 목록 안내
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              품번을 선택하면 아래와 같이 <strong>세부 비가동 항목과 예상 소요 시간</strong>이 표시됩니다.
            </Typography>

            <List dense sx={{ display: "inline-block", textAlign: "left", mt: 1 }}>
              <ListItem disableGutters>
                • 각 비가동명별 예상 소요 시간(건당)
              </ListItem>
              <ListItem disableGutters>
                • 비가동 항목 클릭 시 상세 내역 확인 가능
              </ListItem>
            </List>

            <Typography variant="body2" sx={{ mt: 2 }}>
              상단/좌측의 품번 선택 영역에서 원하는 품번을 먼저 선택해 주세요.
            </Typography>
          </Paper>
        </Box>
      ) : rows.length === 0 ? (   // ✅ 데이터 없을 때
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
          <Typography color="text.secondary">
            표시할 비가동 데이터가 없습니다.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ px: 2, pb: 2, flex: 1, minHeight: 0 }}>
          {/* ✅ 테이블 스크롤 전용 컨테이너 */}
          <TableContainer sx={{ maxHeight: "100%", overflow: "auto", borderRadius: 1 }}>
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
                  // backgroundColor: "background.paper",
                  "&:hover": { backgroundColor: "action.hover" },
                },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ pl: 2.5 }}>비가동명</TableCell>
                  <TableCell align="right" sx={{ pr: 2.5 }}>
                    예상 소요 시간(건당)
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
                        outline: isSelected ? `1px solid ${themeHex}` : "none",
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
                        <Typography fontWeight={700}>{toDur(r.expectedMinutes)}</Typography>
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
