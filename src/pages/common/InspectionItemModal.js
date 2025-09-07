import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Box, Typography, CircularProgress, Alert,
  InputAdornment, Chip, IconButton, Paper, Divider
} from '@mui/material';
import {
  Search as SearchIcon, Clear as ClearIcon, Inventory as InventoryIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import config from '../../config';

class InspectionItemModal extends Component {
  state = { searchTerm: '', items: [], loading: false, error: null };
  aborter = null;

  componentDidUpdate(prevProps) {
    // 모달 오픈 시 또는 상위 필터 변경 시 재조회
    if (this.props.open && this.props.open !== prevProps.open) this.fetchItems();
    if (
      this.props.open &&
      (prevProps.plant !== this.props.plant ||
        prevProps.worker !== this.props.worker ||
        prevProps.line !== this.props.line ||
        prevProps.startDate !== this.props.startDate ||
        prevProps.endDate !== this.props.endDate)
    ) {
      this.fetchItems(this.state.searchTerm);
    }
  }

  fetchItems = async (search = '') => {
    const { plant, worker, line, startDate, endDate } = this.props;

    // 이전 요청 취소
    if (this.aborter) this.aborter.abort();
    this.aborter = new AbortController();

    this.setState({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseURLApi}/smartFactory/inspection_modal/item_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: this.aborter.signal,
        body: JSON.stringify({
          q: search || '',
          plant: plant || '',
          worker: worker || '',      // 서버에서 i.process로 매핑
          line: line || '',          // 서버에서 i.equipment로 매핑
          startDate: startDate || '',   // ← 선택한 기간 전달
          endDate: endDate || '',     // ← 선택한 기간 전달
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];
      const items = data.map((item, idx) => ({
        id: `${item.품목번호 ?? ''}-${idx}`,
        No: `${idx + 1}`,
        품목번호: item.품목번호 ?? '',
        품목명: item.품목명 ?? '',
      }));
      this.setState({ items });
    } catch (e) {
      if (e.name === 'AbortError') return; // 취소는 무시
      console.error('검사 품목 모달 로드 오류:', e);
      this.setState({ error: '검사 품목 데이터를 불러오는 중 오류가 발생했습니다.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleSearch = () => this.fetchItems(this.state.searchTerm);
  clearSearch = () => this.setState({ searchTerm: '' }, () => this.fetchItems(''));
  handleItemSelect = (row) => {
    const { onSelect, onClose } = this.props;
    onSelect?.({ 품목번호: row.품목번호, 품목명: row.품목명 });
    onClose?.();
  };

  render() {
    const { open, onClose, selectedItemCode, plant, worker, line } = this.props;
    const { searchTerm, items, loading, error } = this.state;

    const columns = [
      { field: 'No', headerName: 'No', width: 60, headerClassName: 'custom-header', cellClassName: 'custom-cell',
        renderCell: (p) => (
          <Box sx={{ fontWeight: 500, color: '#1976d2', fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {p.value}
          </Box>
        )
      },
      { field: '품목번호', headerName: '품목번호', width: 250, headerClassName: 'custom-header', cellClassName: 'custom-cell',
        renderCell: (p) => (
          <Box sx={{ fontWeight: 500, color: '#1976d2', fontFamily: 'monospace', fontSize: '0.875rem' }}>
            {p.value}
          </Box>
        )
      },
      { field: '품목명', headerName: '품목명', width: 250, headerClassName: 'custom-header', cellClassName: 'custom-cell',
        renderCell: (p) => (
          <Box sx={{ color: '#424242', fontSize: '0.875rem' }}>
            {p.value}
          </Box>
        )
      },
    ];

    return (
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            height: '85vh',
            maxHeight: '700px',
            borderRadius: '16px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            background: 'linear-gradient(135deg, #ff8f00 0%, #f57c00 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            py: 2.5,
            px: 3,
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '1px',
              background: 'rgba(255,255,255,0.2)',
            },
          }}
        >
          <InventoryIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              검사 품목 코드 선택
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 300 }}>
              검색하여 원하는 품목을 선택하세요
            </Typography>

            {(plant || worker || line) && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {plant && (
                  <Chip
                    label={`공장: ${plant}`}
                    size="small"
                    variant="outlined"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: '0.75rem' }}
                  />
                )}
                {worker && (
                  <Chip
                    label={`공정: ${worker}`}
                    size="small"
                    variant="outlined"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: '0.75rem' }}
                  />
                )}
                {line && (
                  <Chip
                    label={`설비: ${line}`}
                    size="small"
                    variant="outlined"
                    sx={{ backgroundColor: 'rgba(255,255,255,0.2)', borderColor: 'rgba(255,255,255,0.3)', color: 'white', fontSize: '0.75rem' }}
                  />
                )}
              </Box>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Paper elevation={0} sx={{ p: 2, backgroundColor: '#f8f9fa', borderRadius: '12px', border: '1px solid #e9ecef' }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label="품목 검색(품번/품명)"
                  value={searchTerm}
                  onChange={(e) => this.setState({ searchTerm: e.target.value })}
                  placeholder="품목번호 또는 품목명으로 검색"
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                      backgroundColor: 'white',
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#ff8f00' },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#ff8f00', borderWidth: '2px' },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#ff8f00' }} />
                      </InputAdornment>
                    ),
                    endAdornment: !!searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={this.clearSearch}
                          sx={{ color: '#6c757d', '&:hover': { backgroundColor: 'rgba(255, 143, 0, 0.1)' } }}
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && this.handleSearch()}
                />
                <Button
                  variant="contained"
                  onClick={this.handleSearch}
                  sx={{
                    background: 'linear-gradient(135deg, #ff8f00 0%, #f57c00 100%)',
                    borderRadius: '8px',
                    px: 3,
                    py: 1,
                    textTransform: 'none',
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(255, 143, 0, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #f57c00 0%, #ef6c00 100%)',
                      boxShadow: '0 6px 16px rgba(255, 143, 0, 0.4)',
                    },
                  }}
                >
                  검색
                </Button>
              </Box>

              {selectedItemCode && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                    현재 선택된 품목번호:
                  </Typography>
                  <Chip
                    label={selectedItemCode}
                    color="primary"
                    variant="outlined"
                    size="small"
                    sx={{ borderColor: '#ff8f00', color: '#ff8f00', fontWeight: 600, '& .MuiChip-label': { px: 1.5 } }}
                  />
                </Box>
              )}
            </Paper>
          </Box>

          <Divider sx={{ mx: 3, opacity: 0.6 }} />

          <Box sx={{ height: 'calc(100% - 140px)', width: '100%', px: 3, pb: 2 }}>
            {loading && (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: 200, gap: 2 }}>
                <CircularProgress size={50} sx={{ color: '#ff8f00', '& .MuiCircularProgress-circle': { strokeLinecap: 'round' } }} />
                <Typography variant="body2" color="text.secondary">품목 데이터를 불러오는 중...</Typography>
              </Box>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: '8px', '& .MuiAlert-icon': { color: '#d32f2f' } }}>
                {error}
              </Alert>
            )}

            {!loading && !error && (
              <DataGrid
                rows={items}
                columns={columns}
                pagination
                paginationMode="client"
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                onRowClick={(p) => this.handleItemSelect(p.row)}
                disableRowSelectionOnClick
                density="compact"
                sx={{
                  border: 'none',
                  '& .custom-header': {
                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                    color: '#495057',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    borderBottom: '2px solid #dee2e6',
                    '&:first-of-type': { borderTopLeftRadius: '8px' },
                    '&:last-of-type': { borderTopRightRadius: '8px' },
                  },
                  '& .custom-cell': {
                    borderBottom: '1px solid #f1f3f4',
                    padding: '8px 16px',
                  },
                  '& .MuiDataGrid-row': {
                    '&:hover': { backgroundColor: 'rgba(255, 143, 0, 0.05)', cursor: 'pointer', transition: 'background-color 0.2s ease' },
                    '&:nth-of-type(even)': { backgroundColor: '#fafbfc' },
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid #e9ecef',
                    backgroundColor: '#f8f9fa',
                  },
                }}
              />
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2 }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: '8px',
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#dee2e6',
              color: '#6c757d',
              '&:hover': { borderColor: '#ff8f00', color: '#ff8f00', backgroundColor: 'rgba(255, 143, 0, 0.05)' },
            }}
          >
            취소
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

InspectionItemModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onSelect: PropTypes.func,
  selectedItemCode: PropTypes.string,
  plant: PropTypes.string,
  worker: PropTypes.string,   // (= process)
  line: PropTypes.string,     // (= equipment)
  startDate: PropTypes.string,
  endDate: PropTypes.string,
};

export default InspectionItemModal;
