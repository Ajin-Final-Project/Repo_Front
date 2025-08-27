import React, { useState } from "react";
import {
  Paper, Grid, TextField, MenuItem, Typography, Box, Button,
  IconButton, CardHeader, Collapse, Divider, InputAdornment, CircularProgress
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import Autocomplete from "@mui/material/Autocomplete";

const PLANT_OPTIONS = ["본사"];
const WORKPLACE_OPTIONS = ["프레스"];
const LINE_OPTIONS = [
  { value: "1500T", label: "1500T (E라인)" },
  { value: "1200T", label: "1200T (D라인)" },
  { value: "1000T", label: "1000T (F라인)" },
  { value: "1000T PRO", label: "1000T PRO (G라인)" },
];

export default function FilterPanel({
  themeHex,
  filters,
  itemCodeOptions,
  onChange,
  onClear,
  onSearch,
  loadingCodes,
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
      <CardHeader
        title={
          <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}>
            <SearchIcon /> 검색 조건
          </Typography>
        }
        action={
          <IconButton onClick={() => setExpanded((v) => !v)} sx={{ color: "white" }}>
            {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        }
        sx={{ backgroundColor: "#ff8f00", color: "white", borderRadius: 1, mb: 2 }}
      />

      {/* 기본 필터 */}
      <Grid container spacing={2}>
        {/* 기간 */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth label="시작일" type="date" size="small"
            value={filters.start_work_date}
            onChange={(e) => onChange("start_work_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth label="종료일" type="date" size="small"
            value={filters.end_work_date}
            onChange={(e) => onChange("end_work_date", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        {/* 공장명 */}
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            select fullWidth label="공장명" size="small"
            value={filters.plant}
            onChange={(e) => onChange("plant", e.target.value)}
          >
            {PLANT_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* 작업장 */}
        <Grid item xs={12} sm={6} md={2.5}>
          <TextField
            select fullWidth label="작업장" size="small"
            value={filters.workplace}
            onChange={(e) => onChange("workplace", e.target.value)}
          >
            {WORKPLACE_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>{opt}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* 라인 */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select fullWidth label="라인" size="small"
            value={filters.line}
            onChange={(e) => onChange("line", e.target.value)}
          >
            {LINE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* 품번(자재번호) Autocomplete */}
        <Grid item xs={12} sm={6} md={5}>
          <Autocomplete
            freeSolo autoHighlight openOnFocus
            disableClearable clearOnEscape clearOnBlur={false} selectOnFocus handleHomeEndKeys
            options={itemCodeOptions}
            filterOptions={(x)=>x}
            inputValue={filters.itemCode}
            onInputChange={(e, value)=> onChange("itemCode", value)}
            onChange={(e, value)=> onChange("itemCode", value)}
            renderInput={(params)=>(
              <TextField
                {...params} fullWidth size="small" label="품번(자재번호)"
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                  ),
                  endAdornment: (
                    <>
                      {loadingCodes && <CircularProgress size={16} sx={{ mr: 1 }} />}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
            noOptionsText={filters.itemCode ? "일치하는 품번이 없습니다" : "품번을 입력하세요"}
          />
        </Grid>
      </Grid>

      {/* 확장 필터 (필요 시 확장해서 추가 가능) */}
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ color: "text.secondary" }}>추가 조건을 여기에 확장해 넣을 수 있습니다.</Box>
      </Collapse>

      {/* 버튼 */}
      <Grid item xs={12} sx={{ mt: 2 }}>
        <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button
            variant="outlined" startIcon={<ClearIcon />} onClick={onClear}
            size="large" color="secondary"
          >
            필터 초기화
          </Button>
          <Button
            variant="contained" startIcon={<SearchIcon />} onClick={onSearch} size="large"
            sx={{ backgroundColor: "#ff8f00", "&:hover": { backgroundColor: "#f57c00" } }}
          >
            검색
          </Button>
        </Box>
      </Grid>
    </Paper>
  );
}
