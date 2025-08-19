// import React from 'react';
// import s from './DefectProcessGrid.module.scss';

// const DefectProcessGrid = () => {
//   // 불량공정 그리드용 더미 데이터
//   const defectGridData = [
//     { id: 1, product: '제품A', line: '라인1', defectType: '크랙', quantity: 5, status: '처리완료', date: '2024-01-15', worker: '김철수' },
//     { id: 2, product: '제품B', line: '라인2', defectType: '불량도장', quantity: 3, status: '처리중', date: '2024-01-15', worker: '이영희' },
//     { id: 3, product: '제품C', line: '라인1', defectType: '치수불량', quantity: 8, status: '대기', date: '2024-01-15', worker: '박민수' },
//     { id: 4, product: '제품A', line: '라인3', defectType: '표면결함', quantity: 2, status: '처리완료', date: '2024-01-15', worker: '최지영' },
//     { id: 5, product: '제품B', line: '라인2', defectType: '조립불량', quantity: 6, status: '처리중', date: '2024-01-15', worker: '정현우' }
//   ];

//   return (
//     <div className={s.root}>
//       <div className={s.container}>
//         <h1>불량공정 그리드</h1>
//         <div className={s.gridSection}>
//           <div className={s.gridHeader}>
//             <h3>불량공정 현황 상세</h3>
//             <div className={s.gridControls}>
//               <input
//                 type="text"
//                 placeholder="제품명 검색..."
//                 className={s.searchInput}
//               />
//               <select className={s.filterSelect}>
//                 <option value="">전체 상태</option>
//                 <option value="처리완료">처리완료</option>
//                 <option value="처리중">처리중</option>
//                 <option value="대기">대기</option>
//               </select>
//             </div>
//           </div>
//           <div className={s.gridTable}>
//             <table>
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>제품명</th>
//                   <th>라인</th>
//                   <th>불량유형</th>
//                   <th>수량</th>
//                   <th>상태</th>
//                   <th>날짜</th>
//                   <th>담당자</th>
//                   <th>작업</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {defectGridData.map((row) => (
//                   <tr key={row.id}>
//                     <td>{row.id}</td>
//                     <td>{row.product}</td>
//                     <td>{row.line}</td>
//                     <td>{row.defectType}</td>
//                     <td>{row.quantity}</td>
//                     <td>
//                       <span className={`${s.status} ${s[row.status]}`}>
//                         {row.status}
//                       </span>
//                     </td>
//                     <td>{row.date}</td>
//                     <td>{row.worker}</td>
//                     <td>
//                       <button className={s.actionBtn}>상세</button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//           <div className={s.gridPagination}>
//             <button className={s.paginationBtn}>이전</button>
//             <span className={s.paginationInfo}>1-5 / 25</span>
//             <button className={s.paginationBtn}>다음</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default DefectProcessGrid;

import config from '../../config';
import React, { Component } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Grid, InputAdornment,
  CardHeader, IconButton, Divider, Collapse, CircularProgress, Alert, Chip
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  BugReport as BugIcon
} from '@mui/icons-material';
import s from './DefectProcessGrid.module.scss';

class DefectProcessGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        // 날짜
        start_work_date: new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE'),
        end_work_date: new Date().toLocaleDateString('sv-SE'),
        // 텍스트/분류
        workplace: '',
        itemInfo: '',
        carModel: '',
        orderType: '',
        defectCode: '',
        defectType: '',
        remark: '',
        worker: '',
        // 수량
        goodItemCount: null,
        waitItemCount: null,
        rwkCount: null,
        scrapCount: null,
      },
      filterExpanded: false,
      rows: [],
      loading: false,
      error: null,
    };
  }

  componentDidMount() {
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const body = { ...this.state.filters };
      const res = await fetch(`${config.baseURLApi}/smartFactory/defect_grid/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const arr = Array.isArray(json.data) ? json.data : [];

      const mapped = arr.map((it, idx) => ({
        id: it.id || idx + 1,
        workDate: it.근무일자 || it.workDate || '',
        workplace: it.작업장 || it.workplace || '',
        itemInfo: it.자재정보 || it.itemInfo || '',
        carModel: it.차종 || it.carModel || '',
        orderType: it.수주유형 || it.orderType || '',
        goodItemCount: it.양품수량 ?? it.goodItemCount ?? 0,
        waitItemCount: it.판정대기 ?? it.waitItemCount ?? 0,
        rwkCount: it['RWK 수량'] ?? it.rwkCount ?? 0,
        scrapCount: it['폐기 수량'] ?? it.scrapCount ?? 0,
        defectCode: it.불량코드 || it.defectCode || '',
        defectType: it.불량유형 || it.defectType || '',
        remark: it.비고 || it.remark || '',
        worker: it.작업자 || it.worker || '',
      }));

      this.setState({ rows: mapped, loading: false });
    } catch (e) {
      console.error(e);
      this.setState({ error: '불량공정 데이터를 불러오는 중 오류가 발생했습니다.', loading: false });
    }
  };

  clearFilters = () => {
    this.setState({
      filters: {
        start_work_date: '',
        end_work_date: '',
        workplace: '',
        itemInfo: '',
        carModel: '',
        orderType: '',
        defectCode: '',
        defectType: '',
        remark: '',
        worker: '',
        goodItemCount: null,
        waitItemCount: null,
        rwkCount: null,
        scrapCount: null,
      },
      rows: [],
    });
  };

  handleFilterChange = (field, value) => {
    this.setState(prev => ({
      filters: { ...prev.filters, [field]: value },
      rows: [],
    }));
  };

  toggleFilterExpansion = () => {
    this.setState(prev => ({ filterExpanded: !prev.filterExpanded }));
  };

  refreshData = () => this.fetchData();

  columns = [
    { field: 'id', headerName: 'ID', width: 80, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'workDate', headerName: '근무일자', width: 120, type: 'date',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      valueGetter: (p) => (p.value ? new Date(p.value) : null) },
    { field: 'workplace', headerName: '작업장', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'itemInfo', headerName: '자재정보', width: 180,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'carModel', headerName: '차종', width: 100,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'orderType', headerName: '수주유형', width: 110,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

    { field: 'goodItemCount', headerName: '양품', width: 90, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      renderCell: (p) => (
        <Chip label={(p.value ?? 0).toLocaleString()} color="success" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
      ) },
    { field: 'waitItemCount', headerName: '판정대기', width: 100, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      renderCell: (p) => (
        <Chip label={(p.value ?? 0).toLocaleString()} color="warning" size="small" variant="outlined" sx={{ fontWeight: 'bold' }} />
      ) },
    { field: 'rwkCount', headerName: 'RWK', width: 90, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'scrapCount', headerName: '폐기', width: 90, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },

    { field: 'defectCode', headerName: '불량코드', width: 110,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'defectType', headerName: '불량유형', width: 150,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'remark', headerName: '비고', width: 200,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    { field: 'worker', headerName: '작업자', width: 100,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
  ];

  render() {
    const { filters, filterExpanded, rows, loading, error } = this.state;

    return (
      <Box className={s.root} sx={{ height: '100vh', p: 3, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#ff7043', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <BugIcon /> 불량공정 데이터 그리드
          </Typography>
          <Typography variant="body1" color="text.secondary">
            불량 수량과 유형을 상세 조회합니다.
          </Typography>
        </Box>

        {/* 필터 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <SearchIcon /> 검색 조건
              </Typography>
            }
            action={
              <IconButton onClick={this.toggleFilterExpansion} sx={{ color: 'white' }}>
                {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
            sx={{ backgroundColor: '#ff7043', color: 'white', borderRadius: 1, mb: 2 }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="시작일" type="date"
                value={filters.start_work_date}
                onChange={(e) => this.handleFilterChange('start_work_date', e.target.value)}
                InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="종료일" type="date"
                value={filters.end_work_date}
                onChange={(e) => this.handleFilterChange('end_work_date', e.target.value)}
                InputLabelProps={{ shrink: true }} size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="작업장" value={filters.workplace}
                onChange={(e) => this.handleFilterChange('workplace', e.target.value)}
                size="small" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth label="자재정보(부분검색)" value={filters.itemInfo}
                onChange={(e) => this.handleFilterChange('itemInfo', e.target.value)}
                size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              />
            </Grid>
          </Grid>

          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="차종" value={filters.carModel}
                  onChange={(e) => this.handleFilterChange('carModel', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="수주유형" value={filters.orderType}
                  onChange={(e) => this.handleFilterChange('orderType', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="불량코드" value={filters.defectCode}
                  onChange={(e) => this.handleFilterChange('defectCode', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="불량유형(부분검색)" value={filters.defectType}
                  onChange={(e) => this.handleFilterChange('defectType', e.target.value)} size="small" />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="양품" type="number" value={filters.goodItemCount ?? ''}
                  onChange={(e) => this.handleFilterChange('goodItemCount', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="판정대기" type="number" value={filters.waitItemCount ?? ''}
                  onChange={(e) => this.handleFilterChange('waitItemCount', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="RWK 수량" type="number" value={filters.rwkCount ?? ''}
                  onChange={(e) => this.handleFilterChange('rwkCount', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="폐기 수량" type="number" value={filters.scrapCount ?? ''}
                  onChange={(e) => this.handleFilterChange('scrapCount', e.target.value)} size="small" />
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="작업자" value={filters.worker}
                  onChange={(e) => this.handleFilterChange('worker', e.target.value)} size="small" />
              </Grid>
              <Grid item xs={12} sm={12} md={9}>
                <TextField fullWidth label="비고(부분검색)" value={filters.remark}
                  onChange={(e) => this.handleFilterChange('remark', e.target.value)} size="small" />
              </Grid>
            </Grid>
          </Collapse>

          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.clearFilters} size="large" color="secondary">
                필터 초기화
              </Button>
              <Button
                variant="contained" startIcon={<SearchIcon />} size="large"
                sx={{ backgroundColor: '#ff7043', '&:hover': { backgroundColor: '#f06292' } }}
                onClick={this.fetchData}
              >
                검색
              </Button>
            </Box>
          </Grid>
        </Paper>

        {/* 그리드 */}
        <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
          <Box sx={{ height: '100%', width: '100%' }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
                <CircularProgress size={60} sx={{ color: '#ff7043' }} />
              </Box>
            )}

            {error && (
              <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="contained" onClick={this.refreshData}
                  sx={{ backgroundColor: '#ff7043', '&:hover': { backgroundColor: '#f06292' } }}>
                  다시 시도
                </Button>
              </Box>
            )}

            {!loading && !error && (
              <DataGrid
                rows={this.state.rows}
                columns={this.columns}
                pagination
                paginationMode="client"
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
                disableRowSelectionOnClick
                density="compact"
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
                sx={{
                  '& .super-app-theme--header': { backgroundColor: '#ff7043', color: 'white', fontWeight: 'bold' },
                  '& .super-app-theme--cell': { borderBottom: '1px solid #e0e0e0' },
                  '& .MuiDataGrid-virtualScroller': { backgroundColor: '#fafafa' },
                  '& .MuiDataGrid-footerContainer': { borderTop: '2px solid #e0e0e0', backgroundColor: '#f5f5f5' },
                  '& .MuiDataGrid-toolbarContainer': { backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0', p: '8px 16px' },
                }}
              />
            )}
          </Box>
        </Paper>
      </Box>
    );
  }
}

export default DefectProcessGrid;
