// src/pages/common/InspectionSelectModal.js
import React, { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, Chip, InputAdornment, IconButton
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { Search as SearchIcon, Clear as ClearIcon, FactCheck as FactCheckIcon } from '@mui/icons-material';
import config from '../../config';

export default function InspectionSelectModal({
  open, onClose, onSelect,
  plant, process, equipment,   // 생산내역 기준 필터
  startDate, endDate           // 기간(보고일)
}) {
  const [q, setQ] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRows = async (query='') => {
    setLoading(true);
    try {
      const res = await fetch(`${config.baseURLApi}/smartFactory/inspection_modal/list`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({
          q: query,
          plant, process, equipment,
          start_date: startDate || null,
          end_date: endDate || null,
        }),
      });
      const json = await res.json();
      setRows(Array.isArray(json?.data) ? json.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (open) fetchRows(''); }, [open, plant, process, equipment, startDate, endDate]);

  const cols = [
    { field:'plant', headerName:'공장', width:120 },
    { field:'process', headerName:'공정', width:120 },
    { field:'equipment', headerName:'설비', width:120 },
    { field:'itemNumber', headerName:'품번', width:160 },
    { field:'itemName', headerName:'품명', width:220 },
    { field:'inspectionType', headerName:'검사구분', width:100 },
    { field:'reportDate', headerName:'보고일', width:120, valueGetter:(p)=> p.value ? new Date(p.value) : null, type:'date' },
    { field:'inspectionItemName', headerName:'검사항목명', width:180 },
    { field:'inspectionDetails', headerName:'검사내용', width:260 },
    { field:'productionQty', headerName:'생산수량', width:110, type:'number' },
  ];

  const handlePick = (row) => {
    // 필요한 키만 부모로 전달 (예: 품번/보고일/검사항목명/생산수량 등)
    onSelect?.(row);
    onClose?.();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth PaperProps={{ sx:{ height:'85vh', borderRadius:2 } }}>
      <DialogTitle sx={{ display:'flex', alignItems:'center', gap:1 }}>
        <FactCheckIcon/> 검사 데이터 선택
        <Box sx={{ ml:2, display:'flex', gap:1 }}>
          {plant && <Chip label={`공장: ${plant}`} size="small" />}
          {process && <Chip label={`공정: ${process}`} size="small" />}
          {equipment && <Chip label={`설비: ${equipment}`} size="small" />}
          {(startDate||endDate) && <Chip label={`기간: ${startDate || '...'} ~ ${endDate || '...'}`} size="small" />}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p:2 }}>
        <Box sx={{ display:'flex', gap:1.5, mb:1.5 }}>
          <TextField
            fullWidth placeholder="품번/품명/검사항목/검사내용 검색"
            value={q} onChange={(e)=>setQ(e.target.value)} size="small"
            InputProps={{
              startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment>,
              endAdornment: q && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={()=>{ setQ(''); fetchRows(''); }}>
                    <ClearIcon fontSize="small"/>
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyDown={(e)=> e.key==='Enter' && fetchRows(q)}
          />
          <Button variant="contained" onClick={()=>fetchRows(q)} sx={{ whiteSpace:'nowrap' }}>검색</Button>
        </Box>

        <div style={{ height:'65vh', width:'100%' }}>
          <DataGrid
            rows={rows}
            columns={cols}
            loading={loading}
            pageSizeOptions={[10,25,50]}
            initialState={{ pagination:{ paginationModel:{ page:0, pageSize:10 } } }}
            disableRowSelectionOnClick
            onRowDoubleClick={(p)=>handlePick(p.row)}
          />
          <Typography variant="caption" color="text.secondary">
            더블클릭하면 선택됩니다.
          </Typography>
        </div>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
