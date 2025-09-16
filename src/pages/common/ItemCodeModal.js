// src/components/modals/ItemCodeModal.jsx
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  InputAdornment,
  Chip,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon, Inventory as InventoryIcon } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import config from '../../config';
import { selectThemeHex, selectThemeKey } from '../../reducers/layout';

class ItemCodeModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      items: [],
      loading: false,
      error: null,
    };
  }

  componentDidUpdate(prevProps) {
    // 모달이 열릴 때마다 최초 로드/리로드
    if (this.props.open && this.props.open !== prevProps.open) {
      this.fetchItems();
    }
    
    // 필터 값이 변경되었을 때도 데이터를 다시 로드
    if (this.props.open && (
      prevProps.plant !== this.props.plant ||
      prevProps.worker !== this.props.worker ||
      prevProps.line !== this.props.line
    )) {
      this.fetchItems();
    }
  }

  fetchItems = async (search = '') => {
    const { plant, worker, line } = this.props;
    
    this.setState({ loading: true, error: null });
    try {
      const res = await fetch(`${config.baseURLApi}/smartFactory/modal/item_list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          item: search,
          plant: plant || '',
          worker: worker || '',
          line: line || ''
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];
      const items = this.formatItems(data);
      this.setState({ items });
    } catch (err) {
      console.error('품목 데이터 로드 오류:', err);
      this.setState({ error: '품목 데이터를 불러오는 중 오류가 발생했습니다.' });
    } finally {
      this.setState({ loading: false });
    }
  };

  // 백엔드(자재번호/자재명) -> 프론트(품목번호/품목명)로 매핑
  formatItems = (apiData) =>
    apiData.map((item, idx) => {
      const 품목번호 = item?.자재번호 ?? item?.itemCode ?? '';
      const 품목명 = item?.자재명 ?? item?.itemName ?? '';
      const 실적번호 = item.실적번호 ?? item?.productionCode ?? '';
      // id는 고유하게(가능하면 백엔드 id 사용 권장)
      return {
        id: `${품목번호}-${idx}`,
        No: `${idx + 1}` ,
        품목번호,
        품목명,
        실적번호, 
      };
    });

  handleSearch = () => this.fetchItems(this.state.searchTerm);

  clearSearch = () => {
    this.setState({ searchTerm: '' }, () => this.fetchItems(''));
  };

  handleItemSelect = (row) => {
    // 부모에 품목번호만 넘길지, 둘 다 넘길지 필요에 맞게 조정
    const { onSelect, onClose } = this.props;
    

    onSelect?.({ 품목번호: row.품목번호, 품목명: row.품목명 });
    onClose?.();
  };

  render() {
    const { open, onClose, selectedItemCode, plant, worker, line, themeHex, themeKey } = this.props;
    const { searchTerm, items, loading, error } = this.state;

    const columns = [
      { 
        field: 'No', 
        headerName: 'No', 
        width: 60, 
        headerClassName: 'custom-header', 
        cellClassName: 'custom-cell',
        renderCell: (params) => (
          <Box sx={{ 
            fontWeight: 500, 
            color: '#1976d2',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            {params.value}
          </Box>
        )
      },
      { 
        field: '품목번호', 
        headerName: '품번', 
        width: 250, 
        headerClassName: 'custom-header', 
        cellClassName: 'custom-cell',
        renderCell: (params) => (
          <Box sx={{ 
            fontWeight: 500, 
            color: '#1976d2',
            fontFamily: 'monospace',
            fontSize: '0.875rem'
          }}>
            {params.value}
          </Box>
        )
      },
      { 
        field: '품목명', 
        headerName: '품목명', 
        width: 250, 
        headerClassName: 'custom-header', 
        cellClassName: 'custom-cell',
        renderCell: (params) => (
          <Box sx={{ 
            color: '#424242',
            fontSize: '0.875rem'
          }}>
            {params.value}
          </Box>
        )
      },
      { 
        field: '실적번호', 
        headerName: '실적번호', 
        width: 250, 
        headerClassName: 'custom-header', 
        cellClassName: 'custom-cell',
        renderCell: (params) => (
          <Box sx={{ 
            color: '#424242',
            fontSize: '0.875rem'
          }}>
            {params.value}
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
             overflow: 'hidden'
           } 
         }}
      >
        <DialogTitle
          sx={{
            background: `linear-gradient(135deg, ${themeHex} 0%, ${themeHex}dd 100%)`,
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
              background: 'rgba(255,255,255,0.2)'
            }
          }}
        >
          <InventoryIcon sx={{ fontSize: 28 }} />
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
              품목 코드 선택
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontWeight: 300 }}>
              검색하여 원하는 품목을 선택하세요
            </Typography>
            
            {/* 현재 필터 정보 표시 */}
            {(plant || worker || line) && (
              <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {plant && (
                  <Chip 
                    label={`공장: ${plant}`} 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
                {worker && (
                  <Chip 
                    label={`작업자: ${worker}`} 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
                {line && (
                  <Chip 
                    label={`작업장: ${line}`} 
                    size="small" 
                    variant="outlined"
                    sx={{ 
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      borderColor: 'rgba(255,255,255,0.3)',
                      color: 'white',
                      fontSize: '0.75rem'
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
        </DialogTitle>

        <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
          {/* 검색 영역 */}
          <Box sx={{ p: 3, pb: 2 }}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                backgroundColor: '#f8f9fa',
                borderRadius: '12px',
                border: '1px solid #e9ecef'
              }}
            >
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  label="품목 검색"
                  value={searchTerm}
                  onChange={(e) => this.setState({ searchTerm: e.target.value })}
                  placeholder="품번 또는 품목명으로 검색"
                  size="small"
                  sx={{
                       '& .MuiOutlinedInput-root': {
                       borderRadius: '8px',
                       backgroundColor: 'white',
                       '&:hover': {
                         '& .MuiOutlinedInput-notchedOutline': {
                           borderColor: themeHex,
                         }
                       },
                       '&.Mui-focused': {
                         '& .MuiOutlinedInput-notchedOutline': {
                           borderColor: themeHex,
                           borderWidth: '2px'
                         }
                       }
                     }
                  }}
                  InputProps={{
                                         startAdornment: (
                       <InputAdornment position="start">
                         <SearchIcon sx={{ color: themeHex }} />
                       </InputAdornment>
                     ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                                                 <IconButton 
                           size="small" 
                           onClick={this.clearSearch}
                           sx={{ 
                             color: '#6c757d',
                             '&:hover': { backgroundColor: `${themeHex}20` }
                           }}
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
                     background: `linear-gradient(135deg, ${themeHex} 0%, ${themeHex}dd 100%)`,
                     borderRadius: '8px',
                     px: 3,
                     py: 1,
                     textTransform: 'none',
                     fontWeight: 600,
                     boxShadow: `0 4px 12px ${themeHex}50`,
                     '&:hover': { 
                       background: `linear-gradient(135deg, ${themeHex}dd 0%, ${themeHex}bb 100%)`,
                       boxShadow: `0 6px 16px ${themeHex}60`
                     }
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
                     sx={{ 
                       borderColor: themeHex,
                       color: themeHex,
                       fontWeight: 600,
                       '& .MuiChip-label': { px: 1.5 }
                     }}
                   />
                </Box>
              )}
            </Paper>
          </Box>

          <Divider sx={{ mx: 3, opacity: 0.6 }} />

                     {/* 그리드 */}
           <Box sx={{ height: 'calc(100% - 140px)', width: '100%', px: 3, pb: 2 }}>
            {loading && (
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                justifyContent: 'center', 
                alignItems: 'center', 
                height: 200,
                gap: 2
              }}>
                                 <CircularProgress 
                   size={50} 
                   sx={{ 
                     color: themeHex,
                     '& .MuiCircularProgress-circle': {
                       strokeLinecap: 'round',
                     }
                   }} 
                 />
                <Typography variant="body2" color="text.secondary">
                  품목 데이터를 불러오는 중...
                </Typography>
              </Box>
            )}

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: '8px',
                  '& .MuiAlert-icon': { color: '#d32f2f' }
                }}
              >
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
                initialState={{
                  pagination: { paginationModel: { page: 0, pageSize: 10 } },
                }}
                onRowClick={(params) => this.handleItemSelect(params.row)}
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
                    '&:first-of-type': {
                      borderTopLeftRadius: '8px'
                    },
                    '&:last-of-type': {
                      borderTopRightRadius: '8px'
                    }
                  },
                  '& .custom-cell': {
                    borderBottom: '1px solid #f1f3f4',
                    padding: '8px 16px',
                  },
                                     '& .MuiDataGrid-row': {
                     '&:hover': {
                       backgroundColor: `${themeHex}10`,
                       cursor: 'pointer',
                       transition: 'background-color 0.2s ease'
                     },
                    '&:nth-of-type(even)': {
                      backgroundColor: '#fafbfc'
                    }
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid #e9ecef',
                    backgroundColor: '#f8f9fa'
                  },
                  '& .MuiDataGrid-paginationSelect': {
                    borderRadius: '6px'
                  }
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
                             '&:hover': {
                 borderColor: themeHex,
                 color: themeHex,
                 backgroundColor: `${themeHex}10`
               }
            }}
          >
            취소
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ItemCodeModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
  onSelect: PropTypes.func, // (선택된 {품목번호, 품목명}) 반환
  selectedItemCode: PropTypes.string, // 선택 표시용
  apiUrl: PropTypes.string, // 기본값: 
  plant: PropTypes.string, // 공장 정보
  worker: PropTypes.string, // 작업자 정보
  line: PropTypes.string, // 작업장 정보
  themeHex: PropTypes.string, // 테마 색상
  themeKey: PropTypes.string, // 테마 키
};

function mapStateToProps(state) {
  return {
    themeHex: selectThemeHex(state),
    themeKey: selectThemeKey(state)
  };
}

export default connect(mapStateToProps)(ItemCodeModal);
