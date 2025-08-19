// // src/pages/admin/UserGrid.js
// import config from '../../config';
// import React, { useEffect, useState } from 'react';
// import {
//   Box, Paper, Grid, TextField, Button, Typography, CircularProgress, Alert,
// } from '@mui/material';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';
// import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';

// export default function UserGrid() {
//   const [filters, setFilters] = useState({
//     user_id: '', pw: '', name: '', age: '', dept: '', email: '', phone: '', address: '',
//   });
//   const [rows, setRows] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const columns = [
//     { field: 'ID', headerName: 'ID', width: 140 },
//     { field: 'PW', headerName: 'PW', width: 160 },
//     { field: '이름', headerName: '이름', width: 120 },
//     { field: '나이', headerName: '나이', width: 90, type: 'number' },
//     { field: '부서', headerName: '부서', width: 140 },
//     { field: '메일', headerName: '메일', width: 220 },
//     { field: '주소', headerName: '주소', width: 260 },
//     { field: '전화번호', headerName: '전화번호', width: 160 },
//   ];

//   const fetchData = async () => {
//     setLoading(true);
//     setError('');
//     try {
//       const res = await fetch(`${config.baseURLApi}/smartFactory/user_grid/list`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(filters),
//       });
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const json = await res.json();
//       const data = Array.isArray(json?.data) ? json.data : [];
//       setRows(data.map((r, i) => ({ id: i + 1, ...r }))); // DataGrid는 id 필요
//     } catch (e) {
//       console.error(e);
//       setError('데이터를 불러오는 중 오류가 발생했습니다.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchData(); }, []); // 최초 1회 로딩

//   const set = (k) => (e) => setFilters((p) => ({ ...p, [k]: e.target.value }));

//   const clear = () => {
//     setFilters({ user_id: '', pw: '', name: '', age: '', dept: '', email: '', phone: '', address: '' });
//     setRows([]);
//   };

//   return (
//     <Box sx={{ p: 3 }}>
//       <Typography variant="h5" sx={{ mb: 2, color: '#ff8f00', fontWeight: 'bold' }}>
//         사원 관리 데이터 (그리드)
//       </Typography>

//       {/* 필터 폼 */}
//       <Paper sx={{ p: 2, mb: 2 }}>
//         <Grid container spacing={2}>
//           <Grid item xs={12} sm={6} md={3}><TextField label="ID" value={filters.user_id} onChange={set('user_id')} fullWidth size="small"/></Grid>
//           <Grid item xs={12} sm={6} md={3}><TextField label="PW" value={filters.pw} onChange={set('pw')} fullWidth size="small"/></Grid>
//           <Grid item xs={12} sm={6} md={3}><TextField label="이름" value={filters.name} onChange={set('name')} fullWidth size="small"/></Grid>
//           <Grid item xs={12} sm={6} md={3}><TextField label="나이" type="number" value={filters.age} onChange={set('age')} fullWidth size="small"/></Grid>

//           <Grid item xs={12} sm={6} md={3}><TextField label="부서" value={filters.dept} onChange={set('dept')} fullWidth size="small"/></Grid>
//           <Grid item xs={12} sm={6} md={3}><TextField label="메일" value={filters.email} onChange={set('email')} fullWidth size="small"/></Grid>
//           <Grid item xs={12} sm={6} md={3}><TextField label="전화번호" value={filters.phone} onChange={set('phone')} fullWidth size="small"/></Grid>
//           <Grid item xs={12} sm={6} md={3}><TextField label="주소" value={filters.address} onChange={set('address')} fullWidth size="small"/></Grid>

//           <Grid item xs={12} sx={{ display:'flex', gap:1, justifyContent:'flex-end' }}>
//             <Button variant="outlined" startIcon={<ClearIcon/>} onClick={clear}>초기화</Button>
//             <Button variant="contained" startIcon={<SearchIcon/>}
//               sx={{ bgcolor:'#ff8f00', '&:hover':{bgcolor:'#f57c00'} }}
//               onClick={fetchData}>
//               검색
//             </Button>
//           </Grid>
//         </Grid>
//       </Paper>

//       {/* 그리드 */}
//       <Paper sx={{ height: 600, p: 1 }}>
//         {loading && (
//           <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', height: 560 }}>
//             <CircularProgress sx={{ color:'#ff8f00' }} />
//           </Box>
//         )}
//         {error && (
//           <Box sx={{ p: 2 }}>
//             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
//             <Button variant="contained" onClick={fetchData}
//                     sx={{ bgcolor:'#ff8f00', '&:hover':{bgcolor:'#f57c00'} }}>
//               다시 시도
//             </Button>
//           </Box>
//         )}
//         {!loading && !error && (
//           <DataGrid
//             rows={rows}
//             columns={columns}
//             pagination
//             pageSizeOptions={[10, 25, 50, 100]}
//             disableRowSelectionOnClick
//             density="compact"
//             slots={{ toolbar: GridToolbar }}
//             slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 400 } } }}
//           />
//         )}
//       </Paper>
//     </Box>
//   );
// }


// src/pages/admin/UserGrid.js
import config from '../../config';

// React (클래스형)
import React, { Component } from 'react';

// MUI
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  CardHeader,
  IconButton,
  Divider,
  Collapse,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';

// SCSS 모듈
import s from './UserGrid.module.scss';

/**
 * 사원 관리 데이터 그리드
 * - 백엔드: POST /smartFactory/user_grid/list
 * - 요청 필드: user_id, pw, name, age, dept, email, phone, address
 * - 응답 필드(한글 컬럼 그대로): ID, PW, 이름, 나이, 부서, 메일, 주소, 전화번호
 */
class UserGrid extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 검색 필터(모두 문자열 입력으로 유지 → 전송 시 buildPayload에서 정리)
      filters: {
        user_id: '',
        pw: '',
        name: '',
        age: '',        // ← 숫자 문자열로 입력받고, 전송 직전에 숫자로 변환
        dept: '',
        email: '',
        phone: '',
        address: '',
      },
      // UI 상태
      filterExpanded: false, // 추가 필터 접기/펼치기
      showPw: false,         // PW 마스킹 토글
      // 데이터 상태
      rows: [],
      loading: false,
      error: null,
    };
  }

  componentDidMount() {
    // 최초 1회 기본 조회
    this.fetchUserData();
  }

  /** [HELPER] 유효값 체크 (필요 시 사용할 수 있음) */
  hasValue = (v) => {
    if (v === null || v === undefined) return false;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      return s !== '' && s !== 'string';
    }
    if (typeof v === 'number') return true;
    return true;
  };

  /** ***************************************
   * [ADD] 요청 바디 정리 함수
   * - 빈 문자열/공백 키 제거
   * - age는 숫자로 변환(숫자 아니면 키 삭제)
   **************************************** */
  buildPayload = () => {
    const p = { ...this.state.filters };

    // age: 값 없으면 제거, 값 있으면 숫자 변환(실패 시 제거)
    if (p.age === '' || p.age === null || p.age === undefined) {
      delete p.age;
    } else {
      const n = Number(p.age);
      if (Number.isNaN(n)) delete p.age;
      else p.age = n; // Pydantic의 Optional[int]에 맞춤
    }

    // 문자열 필드: 트림 후 빈 값이면 키 삭제
    ['user_id', 'pw', 'name', 'dept', 'email', 'phone', 'address'].forEach((k) => {
      if (typeof p[k] === 'string') {
        const t = p[k].trim();
        if (t === '') delete p[k];
        else p[k] = t;
      }
    });

    return p;
  };

  /** 서버 호출 */
  fetchUserData = async () => {
    this.setState({ loading: true, error: null });
    try {
      // 빈 값은 그대로 보내도 서비스에서 필터링(WHERE 조건 미포함)
    //   const body = { ...this.state.filters };
    // --------------------------------------
      // [CHANGE] 기존 filters 그대로 X → buildPayload로 정리해서 전송
      // --------------------------------------
      const body = this.buildPayload();


      const res = await fetch(`${config.baseURLApi}/smartFactory/user_grid/list`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      const data = Array.isArray(json?.data) ? json.data : [];

      // ⚠ 응답은 한글 키 그대로: ID, PW, 이름, 나이, 부서, 메일, 주소, 전화번호
      const rows = data.map((r, i) => ({ id: i + 1, ...r }));
      this.setState({ rows, loading: false });
    } catch (e) {
      console.error(e);
      this.setState({
        error: '데이터를 불러오는 중 오류가 발생했습니다.',
        loading: false,
      });
    }
  };

  /** 필터 값 변경 */
  handleFilterChange = (field, value) => {
    this.setState((prev) => ({
      filters: { ...prev.filters, [field]: value },
      // 입력 변경 시 기존 rows는 비워 UX 명확히
      rows: [],
    }));
  };

  /** 검색 버튼 */
  handleSearch = () => {
    this.fetchUserData();
  };

  /** 필터 초기화 */
  clearFilters = () => {
    this.setState({
      filters: {
        user_id: '',
        pw: '',
        name: '',
        age: '',
        dept: '',
        email: '',
        phone: '',
        address: '',
      },
      rows: [],
    });
  };

  /** 접기/펼치기 */
  toggleFilterExpansion = () => {
    this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }));
  };

  /** PW 보기 토글 */
  toggleShowPw = (_, v) => {
    this.setState({ showPw: v });
  };

  /** DataGrid 컬럼 정의 (응답 키 = 한글 컬럼명) */
  columns = [
    { field: 'id', headerName: 'No', width: 80, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell' },
    {
      field: 'ID', headerName: 'ID', width: 140,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell'
    },
    {
      field: 'PW', headerName: 'PW', width: 160,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell',
      renderCell: (params) => {
        const val = params.value || '';
        return this.state.showPw ? val : (val ? '•'.repeat(6) : '');
      }
    },
    {
      field: '이름', headerName: '이름', width: 120,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell'
    },
    {
      field: '나이', headerName: '나이', width: 90, type: 'number',
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell'
    },
    {
      field: '부서', headerName: '부서', width: 140,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell'
    },
    {
      field: '메일', headerName: '메일', width: 220,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell'
    },
    {
      field: '전화번호', headerName: '전화번호', width: 160,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell'
    },
    {
      field: '주소', headerName: '주소', width: 260,
      headerClassName: 'super-app-theme--header', cellClassName: 'super-app-theme--cell'
    },
  ];

  render() {
    const { filters, filterExpanded, showPw, rows, loading, error } = this.state;

    return (
      <Box className={s.root} sx={{ height: '100vh', p: 3, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
        {/* 헤더 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ color: '#ffb300', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            사원 관리 데이터
          </Typography>
          <Typography variant="body1" color="text.secondary">
            회원정보를 조건별로 조회하고 데이터 그리드로 확인합니다.
          </Typography>
        </Box>

        {/* 검색 패널 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <CardHeader
            title={(
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
                <SearchIcon /> 검색 조건
              </Typography>
            )}
            action={(
              <IconButton onClick={this.toggleFilterExpansion} sx={{ color: 'white' }}>
                {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            )}
            sx={{ backgroundColor: '#ff8f00', color: 'white', borderRadius: 1, mb: 2 }}
          />

          {/* 기본 필터 */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="ID" value={filters.user_id}
                         onChange={(e) => this.handleFilterChange('user_id', e.target.value)}
                         size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="PW" value={filters.pw}
                         onChange={(e) => this.handleFilterChange('pw', e.target.value)}
                         size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="이름" value={filters.name}
                         onChange={(e) => this.handleFilterChange('name', e.target.value)}
                         size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="나이" type="number" value={filters.age}
                         onChange={(e) => this.handleFilterChange('age', e.target.value)}
                         size="small" variant="outlined" />
            </Grid>
          </Grid>

          {/* 확장 필터 */}
          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="부서" value={filters.dept}
                           onChange={(e) => this.handleFilterChange('dept', e.target.value)}
                           size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="메일" value={filters.email}
                           onChange={(e) => this.handleFilterChange('email', e.target.value)}
                           size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="전화번호" value={filters.phone}
                           onChange={(e) => this.handleFilterChange('phone', e.target.value)}
                           size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="주소" value={filters.address}
                           onChange={(e) => this.handleFilterChange('address', e.target.value)}
                           size="small" variant="outlined" />
              </Grid>
            </Grid>
          </Collapse>

          {/* 옵션 & 버튼 */}
          <Grid item xs={12} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch checked={showPw} onChange={this.toggleShowPw} />}
              label="PW 보기 (운영권장 X)"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.clearFilters} size="large" color="secondary">
                필터 초기화
              </Button>
              <Button variant="contained" startIcon={<SearchIcon />} size="large"
                      sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
                      onClick={this.handleSearch}>
                검색
              </Button>
            </Box>
          </Grid>
        </Paper>

        {/* 그리드 */}
        <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
          <Box sx={{ height: '100%', width: '100%' }}>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
                <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
              </Box>
            )}

            {error && (
              <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                <Button variant="contained" onClick={this.fetchUserData}
                        sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}>
                  다시 시도
                </Button>
              </Box>
            )}

            {!loading && !error && (
              <DataGrid
                rows={rows}
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
                  '& .super-app-theme--header': {
                    backgroundColor: '#ff8f00',
                    color: 'white',
                    fontWeight: 'bold',
                  },
                  '& .super-app-theme--cell': {
                    borderBottom: '1px solid #e0e0e0',
                  },
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #e0e0e0',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    backgroundColor: '#fafafa',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '2px solid #e0e0e0',
                    backgroundColor: '#f5f5f5',
                  },
                  '& .MuiDataGrid-toolbarContainer': {
                    backgroundColor: '#f8f9fa',
                    borderBottom: '1px solid #e0e0e0',
                    padding: '8px 16px',
                  },
                }}
              />
            )}
          </Box>
        </Paper>
      </Box>
    );
  }
}

export default UserGrid;
