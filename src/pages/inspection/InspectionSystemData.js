import config from '../../config';

// React와 Component 클래스를 import하여 클래스형 컴포넌트 구현
import React, { Component } from 'react';

// Material-UI 컴포넌트들을 import
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  Chip,
  CardHeader,
  IconButton,
  Divider,
  Collapse,
  CircularProgress,
  Alert
} from '@mui/material';

// MUI DataGrid 컴포넌트들을 import
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// Material-UI 아이콘들을 import
import { 
  Search as SearchIcon, 
  Clear as ClearIcon, 
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon
} from '@mui/icons-material';

// SCSS 모듈 스타일을 import
// ProductionGrid와 동일한 스타일을 사용한다고 가정합니다.
import s from './InspectionSystemData.module.scss'; 

/**
 * 검사 데이터 그리드 컴포넌트
 * API에서 검사 데이터를 가져와서 테이블 형태로 표시
 * 검색 필터 기능과 페이징, 정렬 기능을 제공합니다.
 */
class InspectionGrid extends Component {
  /**
   * 컴포넌트 생성자
   */
  constructor(props) {
    super(props);
    
    // 오늘 날짜와 올해 1월 1일을 'YYYY-MM-DD' 형식으로 변환
    const today = new Date().toLocaleDateString('sv-SE');
    const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');

    // 컴포넌트의 초기 상태를 설정
    this.state = {
      // 검색 필터 상태 - 각 필드별로 검색 조건을 저장
      filters: {
        businessPlace: '',
        plant: '',
        process: '',
        equipment: '',
        inspectionType: '',
        itemNumber: '',
        start_work_date: jan1, 
        end_work_date: today,  
        shiftType: '',
        workSequence: null,
        workType: '',
        inspectionSequence: null,
        inspectionItemName: '',
        inspectionDetails: '',
        productionValue: null,
      },
      // 필터 확장 상태 - 추가 필터를 펼칠지 말지를 결정
      filterExpanded: false,
      // 데이터 상태
      inspectionData: [],
      loading: false,
      error: null
    };
  }

  /**
   * 컴포넌트가 DOM에 마운트된 후 실행되는 생명주기 메서드
   * 컴포넌트가 처음 렌더링될 때 API에서 데이터를 가져옵니다.
   */
  componentDidMount() {
    this.fetchInspectionData();
  }

  /**
   * API에서 검사 데이터를 가져오는 메서드
   * POST 요청을 통해 서버에서 데이터를 받아와서 상태에 저장합니다.
   */
  fetchInspectionData = async () => {
    this.setState({ loading: true, error: null });
    
    try {
      // POST 요청에 검색 조건을 포함한 body 구성
      const requestBody = {
        ...this.state.filters
      };
      
      console.log('API 요청 본문:', requestBody); // 요청 본문 확인용 로그

      // API 요청 주소는 config에서 가져오거나 직접 지정할 수 있습니다.
      // 로컬 환경에서 테스트 중이므로 'http://localhost:8000'를 직접 사용합니다.
      const response = await fetch(`http://localhost:8000/smartFactory/inspection_grid/list`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        // HTTP 오류 발생 시 에러 메시지 처리
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const jsonResponseData = await response.json();
      
      // API 응답의 'data' 키에 실제 데이터 배열이 있다고 가정하고 바로 전달
      // 백엔드에서 빈 리스트가 넘어온다면 formattedData도 빈 리스트가 됩니다.
      const formattedData = this.formatApiData(jsonResponseData.data);
      
      console.log('API 응답 데이터 (변환 후):', formattedData); // 변환된 응답 데이터 확인용 로그
      this.setState({ 
        inspectionData: formattedData, 
        loading: false 
      });
    } catch (error) {
      console.error('데이터 로드 중 오류 발생:', error);
      this.setState({ 
        error: `데이터를 불러오는 중 오류가 발생했습니다: ${error.message || error}`, 
        loading: false 
      });
    }
  };

  /**
   * API 응답 데이터를 그리드 형식에 맞게 변환하는 메서드
   * DataGrid에 필요한 'id' 속성을 추가하고, 필드명 매핑을 처리합니다.
   * 이 함수는 이제 순수하게 데이터 배열을 받아서 매핑만 수행합니다.
   */
  formatApiData = (apiData) => {
    // apiData는 이미 데이터 배열이어야 합니다.
    if (Array.isArray(apiData)) {
      return apiData.map((item, index) => ({
        // 각 항목에 고유 ID를 부여 (id 필드가 없으면 인덱스 사용)
        id: item.id || index + 1,
        // API 응답의 필드명을 DataGrid 컬럼의 'field' 속성에 매핑
        businessPlace: item.businessPlace || '',
        plant: item.plant || '',
        process: item.process || '',
        equipment: item.equipment || '',
        inspectionType: item.inspectionType || '',
        itemNumber: item.itemNumber || '',
        // '보고일' 필드를 Date 객체로 변환하되, 유효하지 않으면 null로 처리
        reportDate: item.reportDate ? new Date(item.reportDate) : null,
        shiftType: item.shiftType || '',
        // 숫자 타입은 null로 초기화하여 0이 아닌 비어있음을 나타낼 수 있도록 함
        workSequence: item.workSequence !== undefined && item.workSequence !== null ? item.workSequence : null,
        workType: item.workType || '',
        inspectionSequence: item.inspectionSequence !== undefined && item.inspectionSequence !== null ? item.inspectionSequence : null,
        inspectionItemName: item.inspectionItemName || '',
        inspectionDetails: item.inspectionDetails || '',
        productionValue: item.productionValue !== undefined && item.productionValue !== null ? item.productionValue : null
      }));
    } else {
      // API 응답이 예상과 다른 경우 (배열이 아닌 경우)
      console.warn("API 응답 데이터 형식이 예상과 다릅니다. 배열이 아닙니다:", apiData);
      return [];
    }
  };

  /**
   * 모든 필터 조건을 초기화하는 메서드
   * 필터 초기화 버튼 클릭 시 호출됩니다.
   */
  clearFilters = () => {
    const today = new Date().toLocaleDateString('sv-SE');
    const jan1 = new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE');
    
    this.setState({
      filters: {
        businessPlace: '',
        plant: '',
        process: '',
        equipment: '',
        inspectionType: '',
        itemNumber: '',
        start_work_date: jan1, // 초기값으로 재설정
        end_work_date: today,  // 초기값으로 재설정
        shiftType: '',
        workSequence: null,
        workType: '',
        inspectionSequence: null,
        inspectionItemName: '',
        inspectionDetails: '',
        productionValue: null,
      },
      // 필터 초기화 시에도 테이블 데이터를 초기화
      inspectionData: []
    });
  };

  /**
   * 특정 필터 필드의 값을 변경하는 메서드
   * @param {string} field - 변경할 필터 필드명
   * @param {string|number|null} value - 새로운 필터 값 (number 타입은 null 허용)
   */
  handleFilterChange = (field, value) => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters, 
        // 숫자 타입 필드도 비어있는 문자열 대신 null을 직접 저장하도록 변경
        [field]: (field.includes('Sequence') || field === 'productionValue') && value === '' ? null : value
      },
      // 필터 값이 변경되면 테이블 데이터를 초기화하여 새로운 검색을 유도
      inspectionData: []
    }));
  };

  /**
   * 검색 버튼 클릭 시 호출되는 메서드
   * 현재 설정된 필터 조건으로 서버에서 새로운 데이터를 가져옵니다.
   */
  handleSearch = () => {
    this.fetchInspectionData();
  };

  /**
   * 필터 확장/축소 상태를 토글하는 메서드
   * 화살표 버튼 클릭 시 호출되어 추가 필터를 보여주거나 숨깁니다.
   */
  toggleFilterExpansion = () => {
    this.setState(prevState => ({
      filterExpanded: !prevState.filterExpanded 
    }));
  };

  /**
   * 데이터를 새로고침하는 메서드
   * 에러 발생 시 "다시 시도" 버튼 클릭으로 호출됩니다.
   */
  refreshData = () => {
    this.fetchInspectionData();
  };

  /**
   * DataGrid에 표시할 컬럼 정의
   * 각 컬럼의 속성과 렌더링 방식을 설정합니다.
   */
  columns = [
    { 
      field: 'id', 
      headerName: 'ID', 
      width: 80, 
      type: 'number', 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'businessPlace', 
      headerName: '사업장', 
      width: 120, 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'plant', 
      headerName: '공장', 
      width: 120, 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'process', 
      headerName: '공정', 
      width: 120, 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'equipment', 
      headerName: '설비', 
      width: 150, 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'inspectionType', 
      headerName: '검사구분', 
      width: 100, 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'itemNumber', 
      headerName: '품번', 
      width: 120, 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'reportDate', 
      headerName: '보고일', 
      width: 120, 
      type: 'date', 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell', 
      // valueGetter에서 Date 객체가 유효한 경우에만 반환하도록 하여 DataGrid가 더 유연하게 처리하도록 함
      valueGetter: (params) => params.value instanceof Date && !isNaN(params.value) ? params.value : null
    },
    { 
      field: 'shiftType', 
      headerName: '주야구분', 
      width: 100, 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'workSequence', 
      headerName: '작업순번', 
      width: 100, 
      type: 'number', 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'workType', 
      headerName: '작업구분', 
      width: 100, 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'inspectionSequence', 
      headerName: '검사순번', 
      width: 120, 
      type: 'number', 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'inspectionItemName', 
      headerName: '검사항목명', 
      width: 150, 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'inspectionDetails', 
      headerName: '검사내용', 
      width: 200, 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell' 
    },
    { 
      field: 'productionValue', 
      headerName: '생산', 
      width: 100, 
      type: 'number', 
      headerClassName: 'super-app-theme--header', 
      cellClassName: 'super-app-theme--cell', 
      // '생산' 수량을 Chip 컴포넌트로 시각적으로 강조하여 표시
      renderCell: (params) => (
        <Chip 
          label={params.value ? params.value.toLocaleString() : '0'} // 숫자 포맷팅
          color="primary" // 기본 색상 (파란색 계열)
          size="small" 
          variant="outlined"
          sx={{ fontWeight: 'bold' }} // 굵은 글씨
        />
      )
    }
  ];

  /**
   * 컴포넌트를 렌더링하는 메서드
   * @returns {JSX.Element} 렌더링될 JSX 요소
   */
  render() {
    // 현재 상태에서 필요한 값들을 구조분해할당으로 추출
    const { filters, filterExpanded, inspectionData, loading, error } = this.state;

    return (
      // 전체 컴포넌트를 감싸는 Box 컨테이너
      <Box className={s.root} sx={{ 
        height: '100vh', 
        p: 3, 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: '#f5f5f5' 
      }}>
        
        {/* 헤더 섹션 - 제목과 설명 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ 
            color: '#ffb300', 
            fontWeight: 'bold', 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1 
          }}>
            <FilterIcon /> 
            검사 데이터 그리드 
          </Typography>
          <Typography variant="body1" color="text.secondary">
            검사 현황을 상세하게 조회하고 관리할 수 있습니다.
          </Typography>
        </Box>

        {/* 검색 필터 섹션 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <CardHeader
            title={
              <Typography variant="h6" sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1,
                color: 'white'
              }}>
                <SearchIcon />
                검색 조건
              </Typography>
            }
            action={
              <IconButton
                onClick={this.toggleFilterExpansion}
                sx={{ color: 'white' }}
              >
                {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            }
            sx={{ 
              backgroundColor: '#ff8f00',
              color: 'white',
              borderRadius: 1,
              mb: 2
            }}
          />
          
          {/* 기본 필터 */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="사업장" value={filters.businessPlace} onChange={(e) => this.handleFilterChange('businessPlace', e.target.value)} size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="공장" value={filters.plant} onChange={(e) => this.handleFilterChange('plant', e.target.value)} size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="공정" value={filters.process} onChange={(e) => this.handleFilterChange('process', e.target.value)} size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="설비" value={filters.equipment} onChange={(e) => this.handleFilterChange('equipment', e.target.value)} size="small" variant="outlined" />
            </Grid>

            {/* 날짜 범위 필터 추가: 시작일과 종료일 */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="시작일" type="date" value={filters.start_work_date} onChange={(e) => this.handleFilterChange('start_work_date', e.target.value)} InputLabelProps={{ shrink: true }} size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="종료일" type="date" value={filters.end_work_date} onChange={(e) => this.handleFilterChange('end_work_date', e.target.value)} InputLabelProps={{ shrink: true }} size="small" variant="outlined" />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="검사구분" value={filters.inspectionType} onChange={(e) => this.handleFilterChange('inspectionType', e.target.value)} size="small" variant="outlined" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField fullWidth label="품번" value={filters.itemNumber} onChange={(e) => this.handleFilterChange('itemNumber', e.target.value)} size="small" variant="outlined" />
            </Grid>
          </Grid>

          {/* 확장된 필터 - Collpase 컴포넌트를 사용하여 펼치기/접기 가능 */}
          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="주야구분" value={filters.shiftType} onChange={(e) => this.handleFilterChange('shiftType', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="작업순번" type="number" value={filters.workSequence !== null ? filters.workSequence : ''} onChange={(e) => this.handleFilterChange('workSequence', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="작업구분" value={filters.workType} onChange={(e) => this.handleFilterChange('workType', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="검사순번" type="number" value={filters.inspectionSequence !== null ? filters.inspectionSequence : ''} onChange={(e) => this.handleFilterChange('inspectionSequence', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="검사항목명" value={filters.inspectionItemName} onChange={(e) => this.handleFilterChange('inspectionItemName', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="검사내용" value={filters.inspectionDetails} onChange={(e) => this.handleFilterChange('inspectionDetails', e.target.value)} size="small" variant="outlined" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="생산" type="number" value={filters.productionValue !== null ? filters.productionValue : ''} onChange={(e) => this.handleFilterChange('productionValue', e.target.value === '' ? null : Number(e.target.value))} size="small" variant="outlined" />
              </Grid>
            </Grid>
          </Collapse>

          {/* 버튼 행 - 필터 초기화와 검색 버튼 */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={this.clearFilters}
                size="large"
                color="secondary"
              >
                필터 초기화
              </Button>
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                size="large"
                sx={{ 
                  backgroundColor: '#ff8f00',
                  '&:hover': {
                    backgroundColor: '#f57c00'
                  }
                }}
                onClick={this.handleSearch}
              >
                검색
              </Button>
            </Box>
          </Grid>
        </Paper>

        {/* 데이터 그리드 섹션 - 실제 데이터를 표시하는 테이블 */}
        <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
          <Box sx={{ height: '100%', width: '100%' }}>
            
            {/* 로딩 상태 */}
            {loading && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '200px' 
              }}>
                <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
              </Box>
            )}

            {/* 에러 상태 */}
            {error && (
              <Box sx={{ p: 3 }}>
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                <Button
                  variant="contained"
                  onClick={this.refreshData}
                  sx={{ 
                    backgroundColor: '#ff8f00',
                    '&:hover': {
                      backgroundColor: '#f57c00'
                    }
                  }}
                >
                  다시 시도
                </Button>
              </Box>
            )}

            {/* 데이터 그리드 - 로딩과 에러가 없을 때만 표시 */}
            {!loading && !error && (
              <DataGrid
                rows={inspectionData} // API에서 가져와 가공된 데이터 사용
                columns={this.columns} // 위에서 정의한 컬럼 설정 사용
                pagination // 페이지네이션 기능 활성화
                paginationMode="client" // 클라이언트 사이드 페이지네이션
                pageSizeOptions={[10, 25, 50, 100]} // 페이지 크기 선택 옵션
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 }, // 초기 페이지 설정
                  },
                }}
                disableRowSelectionOnClick // 행 클릭 시 선택 비활성화
                density="compact" // 컴팩트한 행 높이
                slots={{
                  toolbar: GridToolbar, // 기본 툴바 사용 (빠른 검색 등 포함)
                }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true, // 빠른 검색 기능 활성화
                    quickFilterProps: { debounceMs: 500 }, // 검색 지연 시간 500ms
                  },
                }}
                // 그리드 스타일링 (헤더, 셀, 루트 등)
                sx={{
                  '& .super-app-theme--header': {
                    backgroundColor: '#ff8f00',
                    color: 'white',
                    fontWeight: 'bold',
                  },
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #e0e0e0',
                  },
                  '& .MuiDataGrid-root': {
                    border: 'none',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    backgroundColor: '#fafafa',
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid #e0e0e0',
                  }
                }}
              />
            )}
          </Box>
        </Paper>
      </Box>
    );
  }
}

export default InspectionGrid;
