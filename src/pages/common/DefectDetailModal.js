import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, CircularProgress, Box
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import config from "../../config";

export default function DefectDetailModal({ open, onClose, filters }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const body = useMemo(() => ({
    startDate:  filters?.start_date || null,
    endDate:    filters?.end_date   || null,
    factory:    filters?.factory    || "",
    process:    filters?.process    || "",
    equipment:  filters?.equipment  || "",
    partNo:     filters?.partNo     || "",
    item:       filters?.item       || "",
    limit: 500, offset: 0,
  }), [filters]);

  const fetchData = async () => {
    setLoading(true); setErr("");
    try {
      const res = await fetch(
        `${(config.baseURLApi || "").replace(/\/$/, "")}/smartFactory/defect_modal/list`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || res.statusText);
      setRows((json?.data || []).map((r, i) => ({ id: i + 1, ...r })));
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, body.startDate, body.endDate, body.factory, body.process, body.equipment, body.partNo, body.item]);

  const cols = [
    { field: "workDate",   headerName: "근무일자", width: 110 },
    { field: "process",    headerName: "작업장",  width: 110 },
    { field: "equipment",  headerName: "설비",    width: 120 },
    { field: "partNo",     headerName: "품번",    width: 140 },
    { field: "item",       headerName: "품명",    width: 220 },
    { field: "defectType", headerName: "불량유형", width: 160 },
    { field: "defectQty",  headerName: "불량수량", type: "number", width: 110 },
    { field: "goodQty",    headerName: "양품수량", type: "number", width: 110 },
    { field: "workType",   headerName: "작업구분", width: 110 },
    { field: "inspType",   headerName: "검사구분", width: 110 },
    { field: "note",       headerName: "비고",     width: 200 },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>불량 내역 (불량수량 및 유형)</DialogTitle>
      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : err ? (
          <Box sx={{ color: "error.main", py: 2 }}>{err}</Box>
        ) : (
          <div style={{ height: 520, width: "100%" }}>
            <DataGrid
              density="compact"
              rows={rows}
              columns={cols}
              pageSizeOptions={[25, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            />
          </div>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
