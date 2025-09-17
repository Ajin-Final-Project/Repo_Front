import config from '../../config';
import { connect } from 'react-redux';

// React와 Component 클래스를 import하여 클래스형 컴포넌트 구현
import React, { Component } from 'react';

// Material-UI 컴포넌트들을 import
// Box: 레이아웃을 위한 기본 컨테이너
// Paper: 카드 형태의 UI 컴포넌트
// TextField: 텍스트 입력 필드
// Button: 버튼 컴포넌트
// Typography: 텍스트 스타일링
// Grid: 그리드 레이아웃 시스템
// InputAdornment: 입력 필드의 앞/뒤 장식 요소
// Chip: 작은 라벨 형태의 컴포넌트
// IconButton: 아이콘 버튼
// Divider: 구분선
// Collapse: 접을 수 있는 애니메이션 컴포넌트
// CircularProgress: 로딩 스피너
// Alert: 경고/에러 메시지
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Grid,
  InputAdornment,
  Chip,
  IconButton,
  Divider,
  Collapse,
  CircularProgress,
  Alert,
  CardHeader,
  MenuItem,
  Menu
} from '@mui/material';

// MUI DataGrid 컴포넌트들을 import
// DataGrid: 데이터 테이블의 핵심 컴포넌트
// GridToolbar: 그리드 상단의 도구 모음
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// Material-UI 아이콘들을 import
// Search: 검색 아이콘
// Clear: 지우기 아이콘
// FilterList: 필터 목록 아이콘
// ExpandMore: 아래쪽 화살표 아이콘
// ExpandLess: 위쪽 화살표 아이콘
import { 
  Search as SearchIcon, 
  Clear as ClearIcon, 
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';

// SCSS 모듈 스타일을 import
import s from './ProductionGrid.module.scss';

// 품목 코드 선택 모달 컴포넌트 import
import ItemCodeModal from '../common/ItemCodeModal';
import { selectThemeHex, selectThemeKey } from '../../reducers/layout';

// 날짜 관련 헬퍼 함수들
const iso = (d) => d.toLocaleDateString("sv-SE"); // YYYY-MM-DD
const today0 = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};
const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/** 버튼 기준 화면 좌표 → Menu anchorPosition */
const getAnchorPos = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
};

/** 월요일 시작 주간 */
const startOfWeek = (d) => {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const s = new Date(d);
  s.setDate(d.getDate() + diff);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate());
};
const endOfWeek = (d) => {
  const s = startOfWeek(d);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
};
const getWeeksOfMonth = (year, month) => {
  const first = new Date(year, month - 1, 1);
  const last = lastOfMonth(first);
  let cur = startOfWeek(first);
  const out = [];
  let idx = 1;
  while (cur <= last) {
    const s = new Date(cur),
      e = endOfWeek(cur);
    const clipS = new Date(Math.max(s, first));
    const clipE = new Date(Math.min(e, last));
    out.push({ label: `${idx}주차`, start: clipS, end: clipE });
    idx += 1;
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
  }
  return out;
};

/**
 * 생산 데이터 그리드 컴포넌트
 * API에서 생산 데이터를 가져와서 테이블 형태로 표시
 * 검색 필터 기능과 페이징, 정렬 기능을 제공
 */
class ProductionGrid extends Component {
  /**
   * 컴포넌트 생성자
   * @param {Object} props - 부모 컴포넌트에서 전달받은 props
   */
  constructor(props) {
    super(props);
    
    // 컴포넌트의 초기 상태를 설정
    this.state = {
      // 검색 필터 상태 - 각 필드별로 검색 조건을 저장
      filters: {
        start_work_date: new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE'),       // 작업시작일
        end_work_date: new Date().toLocaleDateString('sv-SE'),          // 작업종료일
        productionNumber: '',       // 생산번호
        plant: "아진산업-경산(본사)",                  // 공장
        worker: "프레스",                 // 작업자
        line: "1500T",              // 작업장
        itemCode: '',               // 품목코드
        itemName: '',               // 품목명
        carModel: '',               // 차량모델
        lot: '',                    // LOT
        sheetInputCoil: '',         // 시트입고코일
        runtime: '',                // 가동시간
        goodItemCount: null,          // 양품수량
        waitItemCount: null,          // 대기수량
        badItemCount: null,           // 불량수량
        productionItemNumber: null,   // 생산품목수
        processBadItemCount: null,    // 공정불량수   ← Count로 통일
        componentDeliveryCount: null, // 부품납품수
        constructor: '',            // 생성자
        createDate: ''              // 생성일시
      },
      // 필터 확장 상태 - 추가 필터를 펼칠지 말지를 결정
      filterExpanded: false,
      // 품목 코드 선택 모달 상태
      itemCodeModalOpen: false,     // 품목 코드 선택 모달 열림/닫힘 상태
      // 데이터 상태
      productionData: [],           // API에서 가져온 생산 데이터 배열
      loading: false,               // 데이터 로딩 중인지 여부
      error: null,                  // 에러가 발생했을 때의 에러 메시지
      
      // 프리셋 상태/앵커 
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      yearAnchorPos: null,
      monthAnchorPos: null,
      weekAnchorPos: null,
      
      // 연도 목록
      years: []
    };
  }

  /**
   * 컴포넌트가 DOM에 마운트된 후 실행되는 생명주기 메서드
   * 컴포넌트가 처음 렌더링될 때 API에서 데이터를 가져옴
   */
  componentDidMount() {
    this.loadYears();
    this.fetchProductionData();
  }

  /**
   * API에서 생산 데이터를 가져오는 메서드
   * POST 요청을 통해 서버에서 데이터를 받아와서 상태에 저장
   */
  fetchProductionData = async () => {
    // 로딩 상태를 true로 설정하고 에러를 초기화
    this.setState({ loading: true, error: null });
    
    try {
      // POST 요청에 검색 조건을 포함한 body 구성
      const requestBody = {
        ...this.state.filters
      }
      const response = await fetch(`${config.baseURLApi}/smartFactory/production_grid/list`, {
        method: 'POST',               // HTTP 메서드: POST
        headers: {
          'Content-Type': 'application/json',  // JSON 형태로 데이터 전송
        },
        body: JSON.stringify(requestBody)      // 요청 본문을 JSON 문자열로 변환
      });

      // HTTP 응답 상태를 확인
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 응답 데이터를 JSON으로 파싱
      const jsonResoponseData = await response.json();
      
      

      const formattedData = this.formatApiData(jsonResoponseData.data);
      
      // 변환된 데이터를 상태에 저장하고 로딩 상태를 false로 변경
      this.setState({ 
        productionData: formattedData, 
        loading: false 
      });
    } catch (error) {
      // 에러가 발생했을 때의 처리
      console.error('데이터 로드 중 오류 발생:', error);
      this.setState({ 
        error: '데이터를 불러오는 중 오류가 발생했습니다.', 
        loading: false 
      });
    }
  };

  /**
   * API 응답 데이터를 그리드 형식에 맞게 변환하는 메서드
   * @param {Object|Array} apiData - API에서 받은 원본 데이터
   * @returns {Array} 그리드에 표시할 수 있는 형태로 변환된 데이터 배열
   */
  formatApiData = (apiData) => {
    // API 응답 구조에 따라 적절히 변환
    // 만약 API 응답이 배열이 아니라면 적절히 처리
    if (Array.isArray(apiData)) {
      return apiData.map((item, index) => ({
        id: item.id || index + 1,  // 고유 ID가 없으면 인덱스 기반으로 생성
        // API 응답의 한국어 필드명을 그리드 필드명에 매핑
        // || 연산자를 사용하여 우선순위: 한국어필드명 > 영문필드명 > 기본값
        start_work_date: item.start_work_date || item.근무일자 || '',
        end_work_date: item.근무일자 || item.end_work_date || '', // 근무일자를 작업종료일에도 사용
        productionNumber: item.실적번호 || item.productionNumber || '',
        plant: item.플랜트 || item.plant || '',
        worker: item.책임자 || item.worker || '',
        line: item.작업장 || item.line || '',
        itemCode: item.자재번호 || item.itemCode || '',
        itemName: item.자재명 || item.itemName || '',
        carModel: item.차종 || item.carModel || '',
        lot: item.투입LOT || item.lot || '',
        sheetInputCoil: item.시트투입코일 || item.sheetInputCoil || '',
        runtime: item.가동시간 || item.runtime || '',
        goodItemCount: item.양품수량 || item.goodItemCount || 0,
        waitItemCount: item.판정대기 || item.waitItemCount || 0,
        badItemCount: item.불량수량 || item.badItemCount || 0,
        productionItemNumber: item.생산수량 || item.productionItemNumber || 0,
        processBadItemCount: item.공정불량 || item.processBadItemCount || 0,
        componentDeliveryCount: item.구성품출고 || item.componentDeliveryCount || 0,
        constructor: item.생성자 || item.constructor || '',
        createDate: item.생성일시 || item.createDate || item.근무일자 || ''
      }));
    } else if (apiData.data && Array.isArray(apiData.data)) {
      // API 응답이 { data: [...] } 형태인 경우 재귀적으로 처리
      return this.formatApiData(apiData.data);
    } else {
      // 기타 경우 빈 배열 반환
      return [];
    }
  };

  /**
   * 모든 필터 조건을 초기화하는 메서드
   * 필터 초기화 버튼 클릭 시 호출됨
   */
  clearFilters = () => {
    this.setState({
      filters: {
        ...this.state.filters,
        productionNumber: '',
        itemCode: '',
        itemName: '',
        carModel: '',
        lot: '',
        sheetInputCoil: '',
        runtime: '',
        goodItemCount: '',
        waitItemCount: '',
        badItemCount: '',
        productionItemNumber: '',
        processBadItemCount: '',
        componentDeliveryCount: '',
        constructor: '',
        createDate: ''
      },
      // 필터 초기화 시에도 테이블 데이터를 초기화
      productionData: []
    });
  };

  /**
   * 특정 필터 필드의 값을 변경하는 메서드
   * @param {string} field - 변경할 필터 필드명
   * @param {string|number} value - 새로운 필터 값
   */
  handleFilterChange = (field, value) => {
    this.setState(prevState => {
      const newFilters = {
        ...prevState.filters,  // 기존 필터 상태를 유지
        [field]: value         // 특정 필드만 새로운 값으로 업데이트
      };
      
      // 품번, 품목명, 날짜가 변경되면 데이터 초기화
      const shouldClearData = ['itemCode', 'itemName', 'start_work_date', 'end_work_date'].includes(field);
      
      const clearData = shouldClearData ? {
        productionData: []
      } : {};
      
      return {
        filters: newFilters,
        ...clearData
      };
    });
  };

  /** 연도 옵션 (서버 없으면 fallback) */
  loadYears = async () => {
    try {
      // 서버에서 연도 목록을 가져오는 API가 있다면 여기에 추가
      // const response = await fetch(`${config.baseURLApi}/smartFactory/production/years`);
      // const result = await response.json();
      // const years = result.data || [];
      
      // 현재는 클라이언트에서 생성
      const y = new Date().getFullYear();
      const years = [y, y - 1, y - 2, y - 3, y - 4];
      this.setState({ years, selectedYear: y });
    } catch {
      const y = new Date().getFullYear();
      const years = [y, y - 1, y - 2, y - 3, y - 4];
      this.setState({ years, selectedYear: y });
    }
  };

  /** 날짜 프리셋/범위 */
  setDateRange = (start, end) => {
    const start_work_date = iso(start);
    const end_work_date = iso(end);
    this.setState((prev) => ({
      filters: { ...prev.filters, start_work_date, end_work_date },
      // 날짜 변경 시 데이터 초기화 (API 호출 없음)
      productionData: []
    }));
  };

  applyToday = () => {
    const t = today0();
    this.setDateRange(t, t);
  };

  selectYear = (y) => {
    const s = new Date(y, 0, 1);
    const e = new Date(y, 11, 31);
    this.setState({ selectedYear: y, yearAnchorPos: null });
    this.setDateRange(s, e);
  };

  selectMonth = (m) => {
    const y = this.state.selectedYear;
    const s = new Date(y, m - 1, 1);
    const e = lastOfMonth(s);
    this.setState({ monthAnchorPos: null, selectedMonth: m });
    this.setDateRange(s, e);
  };

  selectWeek = (w) => {
    this.setState({ weekAnchorPos: null });
    this.setDateRange(w.start, w.end);
  };

  /** 필터 초기화 */
  resetFilters = () => {
    const currentYear = new Date().getFullYear();
    const defaultFilters = {
      start_work_date: `${currentYear}-01-01`,
      end_work_date: `${currentYear}-12-31`,
      productionNumber: '',
      plant: "아진산업-경산(본사)",
      worker: "프레스",
      line: "1500T",
      itemCode: '',
      itemName: '',
      carModel: '',
      lot: '',
      sheetInputCoil: '',
      runtime: '',
      goodItemCount: null,
      waitItemCount: null,
      badItemCount: null,
      productionItemNumber: null,
      processBadItemCount: null,
      componentDeliveryCount: null,
      constructor: '',
      createDate: ''
    };
    
    this.setState({
      filters: defaultFilters,
      selectedYear: currentYear,
      selectedMonth: new Date().getMonth() + 1,
      productionData: []
    });
  };

  /**
   * 검색 버튼 클릭 시 호출되는 메서드
   * 현재 설정된 필터 조건으로 서버에서 새로운 데이터를 가져옴
   */
  handleSearch = () => {
    this.fetchProductionData();
  };

  /**
   * 필터 확장/축소 상태를 토글하는 메서드
   * 화살표 버튼 클릭 시 호출되어 추가 필터를 보여주거나 숨김
   */
  toggleFilterExpansion = () => {
    this.setState(prevState => ({
      filterExpanded: !prevState.filterExpanded  // 현재 상태의 반대값으로 변경
    }));
  };

  /**
   * 데이터를 새로고침하는 메서드
   * 에러 발생 시 "다시 시도" 버튼 클릭으로 호출됨
   */
  refreshData = () => {
    this.fetchProductionData();
  };

  /**
   * 품목 코드 선택 모달을 여는 메서드
   * 현재 필터 상태의 plant, worker, workplace 값을 모달에 전달
   */
  openItemCodeModal = () => {
    this.setState({ itemCodeModalOpen: true });
  };

  /**
   * 품목 코드 선택 모달을 닫는 메서드
   */
  closeItemCodeModal = () => {
    this.setState({ itemCodeModalOpen: false });
  };

  /**
   * DataGrid에 표시할 컬럼 정의
   * 각 컬럼의 속성과 렌더링 방식을 설정
   */
  columns = [
    { 
      field: 'id',                    // 데이터 필드명
      headerName: 'ID',               // 컬럼 헤더에 표시될 이름
      width: 80,                      // 컬럼 너비 (픽셀)
      type: 'number',                 // 데이터 타입 (숫자)
      headerClassName: 'super-app-theme--header',  // 헤더 스타일 클래스
      cellClassName: 'super-app-theme--cell'       // 셀 스타일 클래스
    },
    { 
      field: 'start_work_date', 
      headerName: '작업시작일', 
      width: 120, 
      type: 'date',                   // 날짜 타입으로 설정
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      // 날짜 값을 Date 객체로 변환하는 함수
      valueGetter: (params) => {
        return params.value ? new Date(params.value) : null;
      }
    },
    { 
      field: 'end_work_date', 
      headerName: '작업종료일', 
      width: 120, 
      type: 'date',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      valueGetter: (params) => {
        return params.value ? new Date(params.value) : null;
      }
    },
    { 
      field: 'productionNumber', 
      headerName: '실적번호', 
      width: 150,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    { 
      field: 'plant', 
      headerName: '공장', 
      width: 200,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    { 
      field: 'worker', 
      headerName: '작업장', 
      width: 100,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    { 
      field: 'line', 
      headerName: '라인', 
      width: 100,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    { 
      field: 'itemCode', 
      headerName: '품번', 
      width: 120,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    { 
      field: 'itemName', 
      headerName: '품목명', 
      width: 200,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    { 
      field: 'carModel', 
      headerName: '차종', 
      width: 80,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    { 
      field: 'lot', 
      headerName: 'LOT', 
      width: 200,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    { 
      field: 'sheetInputCoil', 
      headerName: '시트입고코일', 
      width: 130,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    { 
      field: 'runtime', 
      headerName: '가동시간', 
      width: 100,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    { 
      field: 'goodItemCount', 
      headerName: '양품수량', 
      width: 100, 
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      // 셀 내용을 커스텀 렌더링하는 함수
      renderCell: (params) => (
        <Chip 
          label={params.value ? params.value.toLocaleString() : '0'}  // 숫자를 천 단위 구분자와 함께 표시
          color="success"                                            // 성공을 나타내는 초록색
          size="small"                                               // 작은 크기
          variant="outlined"                                         // 테두리만 있는 스타일
          sx={{ fontWeight: 'bold' }}                               // 굵은 글씨체
        />
      )
    },
    { 
      field: 'waitItemCount', 
      headerName: '대기수량', 
      width: 100, 
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      renderCell: (params) => (
        <Chip 
          label={params.value ? params.value.toLocaleString() : '0'} 
          color="warning"                                            // 경고를 나타내는 주황색
          size="small" 
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    { 
      field: 'badItemCount', 
      headerName: '불량수량', 
      width: 100, 
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      renderCell: (params) => (
        <Chip 
          label={params.value ? params.value.toLocaleString() : '0'} 
          color="error"                                              // 에러를 나타내는 빨간색
          size="small" 
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      )
    },
    { 
      field: 'productionItemNumber', 
      headerName: '생산품목수', 
      width: 120, 
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {params.value ? params.value.toLocaleString() : '0'}
        </Typography>
      )
    },
    { 
      field: 'processBadItemCount', 
      headerName: '공정불량수', 
      width: 120, 
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {params.value ? params.value.toLocaleString() : '0'}
        </Typography>
      )
    },
    { 
      field: 'componentDeliveryCount', 
      headerName: '부품납품수', 
      width: 120, 
      type: 'number',
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {params.value ? params.value.toLocaleString() : '0'}
        </Typography>
      )
    },
    { 
      field: 'constructor', 
      headerName: '생성자', 
      width: 100,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell'
    },
    { 
      field: 'createDate', 
      headerName: '생성일시', 
      width: 100,
      headerClassName: 'super-app-theme--header',
      cellClassName: 'super-app-theme--cell',
     valueGetter: (params) => {
      if (!params.value) return '';
      return new Date(params.value).toLocaleDateString('ko-KR');
    }
    }
  ];

  handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
            this.setState(prev => ({
              filters: {
                ...prev.filters,
                itemCode: 품목번호 || '',
                itemName: 품목명   || '',
              },
              itemCodeModalOpen: false, // 선택 후 모달 닫기
            }));
          };

  toYMD = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD


  /**
   * 컴포넌트를 렌더링하는 메서드
   * @returns {JSX.Element} 렌더링될 JSX 요소
   */
  render() {
    // 현재 상태에서 필요한 값들을 구조분해할당으로 추출
    const { themeHex } = this.props;
    const { filters, filterExpanded, productionData, loading, error } = this.state;

    return (
      // 전체 컴포넌트를 감싸는 Box 컨테이너
      // 전체 화면 높이를 사용하고, 패딩과 flexbox 레이아웃 설정
      <Box className={s.root} sx={{ 
        height: '100vh',                    // 전체 화면 높이 사용
        p: 3,                               // 모든 방향에 24px 패딩
        display: 'flex',                    // flexbox 레이아웃 사용
        flexDirection: 'column',            // 세로 방향으로 요소들을 배치
        backgroundColor: '#f5f5f5'          // 연한 회색 배경
      }}>
        
        {/* 헤더 섹션 - 제목과 설명 */}
        <Box sx={{ mb: 3 }}>
          {/* 메인 제목 */}
          <Typography variant="h4" gutterBottom sx={{ 
            color: themeHex,                // 테마 색상
            fontWeight: 'bold',              // 굵은 글씨체
            display: 'flex',                 // flexbox 레이아웃
            alignItems: 'center',            // 세로 중앙 정렬
            gap: 1                           // 아이콘과 텍스트 사이 간격
          }}>
            <FilterIcon />                   {/* 필터 아이콘 */}
            생산 데이터 내역               {/* 제목 텍스트 */}
          </Typography>
          
          {/* 부제목/설명 */}
          <Typography variant="body1" color="text.secondary">
            생산 현황을 상세하게 조회하고 관리할 수 있습니다.
          </Typography>
        </Box>

        {/* 검색 필터 섹션 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          {/* 필터 섹션의 헤더 */}
           {/* 필터 섹션의 헤더 */}
          <CardHeader
            title={
              <Typography
                variant="h6"
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'white',
                }}
              >
                <SearchIcon />
                검색 조건
              </Typography>
            }
             action={
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
      {/* 연간 */}
      <Button
        size="small"
        variant="outlined"
        color="success"
        endIcon={<ExpandMoreIcon />}
        onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
        sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
      >
        연간
      </Button>
      <Menu
        open={!!this.state.yearAnchorPos}
        onClose={() => this.setState({ yearAnchorPos: null })}
        anchorReference="anchorPosition"
        anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
      >
        <MenuItem dense onClick={() => this.selectYear(new Date().getFullYear())}>
          올해
        </MenuItem>
        {this.state.years.map((y) => (
          <MenuItem key={y} dense onClick={() => this.selectYear(y)}>
            {y}년
          </MenuItem>
        ))}
      </Menu>

      {/* 월간 */}
      <Button
        size="small"
        variant="outlined"
        color="success"
        endIcon={<ExpandMoreIcon />}
        onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
        sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
      >
        월간
      </Button>
      <Menu
        open={!!this.state.monthAnchorPos}
        onClose={() => this.setState({ monthAnchorPos: null })}
        anchorReference="anchorPosition"
        anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
      >
        <MenuItem
          dense
          onClick={() => {
            this.setState({ selectedYear: new Date().getFullYear() }, () => this.selectMonth(new Date().getMonth() + 1));
          }}
        >
          이번달
        </MenuItem>
        {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
          <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
            {this.state.selectedYear}년 {m}월
          </MenuItem>
        ))}
      </Menu>

      {/* 주간 */}
      <Button
        size="small"
        variant="outlined"
        color="success"
        endIcon={<ExpandMoreIcon />}
        onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
        sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
      >
        주간
      </Button>
      <Menu
        open={!!this.state.weekAnchorPos}
        onClose={() => this.setState({ weekAnchorPos: null })}
        anchorReference="anchorPosition"
        anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
      >
        <MenuItem dense onClick={() => {
          const now = today0();
          const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
          this.selectWeek(thisWeek);
        }}>
          이번주 ({iso(startOfWeek(today0()))}~{iso(endOfWeek(today0()))})
        </MenuItem>
        {getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth).map((w, i) => (
          <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
            {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
          </MenuItem>
        ))}
      </Menu>

      {/* 오늘 */}
      <Button
        size="small"
        variant="outlined"
        color="success"
        onClick={this.applyToday}
        sx={{ textTransform: "none", fontWeight: 700, borderColor: "white", color: "white" }}
      >
        금일
      </Button>

      {/* 구분자 파이프(옵션) */}
      <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>

      {/* 기간선택 + 날짜 필드 */}
        <Typography sx={{ color: 'white' }}>기간선택</Typography>
        <TextField
          type="date"
          value={filters.start_work_date}
          onChange={(e) => this.handleFilterChange('start_work_date', e.target.value)}
          size="small"
          variant="outlined"
          sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
        />
        <Typography sx={{ color: 'white' }}>~</Typography>
        <TextField
          type="date"
          value={filters.end_work_date}
          onChange={(e) => this.handleFilterChange('end_work_date', e.target.value)}
          size="small"
          variant="outlined"
          sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
        />

        {/* 확장/축소 버튼 */}
        <IconButton onClick={this.toggleFilterExpansion} sx={{ color: 'white' }}>
          {filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
    }
    sx={{
      backgroundColor: themeHex,
      color: 'white',
      borderRadius: 1,
      mb: 2,
    }}
  />
          
          
          {/* 기본 필터 (8개) - 항상 보이는 주요 검색 필드들 */}
         <Grid container spacing={2}>
          {/* 공장 */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select                     
              fullWidth
              label="공장"
              value={filters.plant ?? ''}
              onChange={(e) => this.handleFilterChange('plant', e.target.value)}
              size="small"
              variant="outlined"
              SelectProps={{ MenuProps: { PaperProps: { sx: { maxHeight: 280 } } } }}
            >
            <MenuItem value="아진산업-경산(본사)">아진산업-본사(경산)</MenuItem>
            <MenuItem value="아진산업-1공장(경산)">아진산업-1공장(경산)</MenuItem>
            <MenuItem value="아진산업-구어공장(경주)">아진산업-구어공장(경주)</MenuItem>
            <MenuItem value="아진산업-하양공장(예정)">아진산업-하양공장(예정)</MenuItem>
            </TextField>
          </Grid>

          {/* 작업장 */}
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              select
              fullWidth
              label="작업장"
              value={filters.worker}
              onChange={(e) => this.handleFilterChange('worker', e.target.value)}
              size="small"
              variant="outlined"
             >
            <MenuItem value="프레스">프레스</MenuItem>
            <MenuItem value="금형">금형</MenuItem>
            <MenuItem value="블랭크">블랭크</MenuItem>

            </TextField>
          </Grid>

          {/* 작업자 */}
          <Grid item x-s={12} sm={6} md={3}>
            <TextField
              select
              fullWidth
              label="라인"
              value={filters.line}
              onChange={(e) => this.handleFilterChange('line', e.target.value)}
              size="small"
              variant="outlined"
            >
            <MenuItem value="1500T">1500T(E라인) </MenuItem>
            <MenuItem value="1200T">1200T(D라인)</MenuItem>
            <MenuItem value="1000T">1000T(F라인)</MenuItem>
            <MenuItem value="1000T-PRO">1000T-PRO(G라인)</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              label="품번"
              value={filters.itemCode}
              onClick={this.openItemCodeModal}
              onSelect={this.handleItemCodeSelect}
              size="small"
              variant="outlined"
              InputProps={{
                readOnly: true,
                style: { cursor: 'pointer' },
                endAdornment: (
                  <InputAdornment position="end">
                    <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiInputBase-root': {
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="품목명"
              value={filters.itemName}
              onClick={this.openItemCodeModal}
              onSelect={this.handleItemCodeSelect}
              onChange={(e) => this.handleFilterChange('itemName', e.target.value)}
              size="small"
              variant="outlined"
               InputProps={{
                readOnly: true,
                style: { cursor: 'pointer' },
                endAdornment: (
                  <InputAdornment position="end">
                    <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiInputBase-root': {
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#f5f5f5' }
                }
              }}
            />
          </Grid>
        </Grid>
            <Grid item xs={12} sm={6} md={3}>

              {/* 생산번호 입력 필드 */}
              {/* <TextField
                fullWidth
                label="생산번호"
                value={filters.productionNumber}
                onChange={(e) => this.handleFilterChange('productionNumber', e.target.value)}
                size="small"
                variant="outlined"
                // 입력 필드 앞에 검색 아이콘 추가
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              /> */}
            </Grid>
        

          {/* 확장된 필터 - 화살표 클릭 시 펼쳐지는 추가 검색 필드들 */}
          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            {/* 구분선 추가 */}
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              {/* 세 번째 행 - 4개 필드 */}
              <Grid item xs={12} sm={6} md={3}>
                {/* 차량모델 입력 필드 */}
                <TextField
                  fullWidth
                  label="차량모델"
                  value={filters.carModel}
                  onChange={(e) => this.handleFilterChange('carModel', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                {/* LOT 입력 필드 */}
                <TextField
                  fullWidth
                  label="LOT"
                  value={filters.lot}
                  onChange={(e) => this.handleFilterChange('lot', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                {/* 시트입고코일 입력 필드 */}
                <TextField
                  fullWidth
                  label="시트입고코일"
                  value={filters.sheetInputCoil}
                  onChange={(e) => this.handleFilterChange('sheetInputCoil', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                {/* 가동시간 입력 필드 */}
                <TextField
                  fullWidth
                  label="가동시간"
                  value={filters.runtime}
                  onChange={(e) => this.handleFilterChange('runtime', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              {/* 네 번째 행 - 4개 필드 */}
              <Grid item xs={12} sm={6} md={3}>
                {/* 양품수량 입력 필드 */}
                <TextField
                  fullWidth
                  label="양품수량"
                  type="number"              // 숫자 입력 타입
                  value={filters.goodItemCount}
                  onChange={(e) => this.handleFilterChange('goodItemCount', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                {/* 대기수량 입력 필드 */}
                <TextField
                  fullWidth
                  label="대기수량"
                  type="number"
                  value={filters.waitItemCount}
                  onChange={(e) => this.handleFilterChange('waitItemCount', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                {/* 불량수량 입력 필드 */}
                <TextField
                  fullWidth
                  label="불량수량"
                  type="number"
                  value={filters.badItemCount}
                  onChange={(e) => this.handleFilterChange('badItemCount', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                {/* 생산품목수 입력 필드 */}
                <TextField
                  fullWidth
                  label="생산품목수"
                  type="number"
                  value={filters.productionItemNumber}
                  onChange={(e) => this.handleFilterChange('productionItemNumber', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>

              {/* 다섯 번째 행 - 4개 필드 */}
              <Grid item xs={12} sm={6} md={3}>
                {/* 공정불량수 입력 필드 */}
                <TextField
                  fullWidth
                  label="공정불량수"
                  type="number"
                  value={filters.processBadItemCount}
                  onChange={(e) => this.handleFilterChange('processBadItemCount', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                {/* 부품납품수 입력 필드 */}
                <TextField
                  fullWidth
                  label="부품납품수"
                  type="number"
                  value={filters.componentDeliveryCount}
                  onChange={(e) => this.handleFilterChange('componentDeliveryCount', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                {/* 생성자 입력 필드 */}
                <TextField
                  fullWidth
                  label="생성자"
                  value={filters.constructor}
                  onChange={(e) => this.handleFilterChange('constructor', e.target.value)}
                  size="small"
                  variant="outlined"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={3}>
                {/* 생성일시 입력 필드 */}
                <TextField
                  fullWidth
                  label="생성일시"
                  type="datetime-local"      // 날짜와 시간을 함께 선택
                  value={filters.createDate}
                  onChange={(e) => this.handleFilterChange('createDate', e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  size="small"
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Collapse>

          {/* 버튼 행 - 필터 초기화와 검색 버튼 */}
          <Grid item xs={12} sx={{ mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              {/* 필터 초기화 버튼 */}
              <Button
                variant="outlined"           // 테두리만 있는 스타일
                startIcon={<ClearIcon />}     // 앞에 지우기 아이콘
                onClick={this.resetFilters}   // 클릭 시 필터 초기화 메서드 호출
                size="large"                  // 큰 크기
                color="secondary"             // 보조 색상
              >
                필터 초기화
              </Button>
              
              {/* 검색 버튼 */}
              <Button
                variant="contained"           // 배경이 채워진 스타일
                startIcon={<SearchIcon />}    // 앞에 검색 아이콘
                size="large"
                sx={{ 
                  backgroundColor: themeHex,    // 테마 색상 배경
                  '&:hover': {                    // 마우스 호버 시 색상 변경
                    backgroundColor: '#f57c00'
                  }
                }}
                onClick={this.handleSearch} // 클릭 시 검색 메서드 호출
              >
                검색
              </Button>
            </Box>
          </Grid>
        </Paper>

        {/* 데이터 그리드 섹션 - 실제 데이터를 표시하는 테이블 */}
        <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
          <Box sx={{ height: '100%', width: '100%' }}>
            
            {/* 로딩 상태 - 데이터를 가져오는 중일 때 표시 */}
            {loading && (
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center',     // 가로 중앙 정렬
                alignItems: 'center',         // 세로 중앙 정렬
                height: '200px'               // 높이 설정
              }}>
                <CircularProgress size={60} sx={{ color: themeHex }} />
              </Box>
            )}

            {/* 에러 상태 - 데이터 로드 중 오류가 발생했을 때 표시 */}
            {error && (
              <Box sx={{ p: 3 }}>
                {/* 에러 메시지 표시 */}
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
                
                {/* 다시 시도 버튼 */}
                <Button
                  variant="contained"
                  onClick={this.refreshData}   // 클릭 시 데이터 새로고침
                  sx={{ 
                    backgroundColor: themeHex,
                    '&:hover': {
                      backgroundColor: '#f57c00'
                    }
                  }}
                >
                  다시 시도
                </Button>
              </Box>
            )}

            {/* 데이터 그리드 - 로딩과 에러가 없을 때 표시 */}
            {!loading && !error && (
              <DataGrid
                rows={this.state.productionData}   
                columns={this.columns}       
                pagination                    
                paginationMode="client"       
                pageSizeOptions={[10, 25, 50, 100]}  // 페이지 크기 선택 옵션
                initialState={{
                  pagination: { paginationModel: { page: 0, pageSize: 10 } },
                  columns: {
                      columnVisibilityModel: {
                        id: false,
                        creator: false,       
                        createDate: false,
                        sheetInputCoil: false, // hide:true 대신 여기서 숨김
                        constructor: false
                      }}
                }}
                
                disableRowSelectionOnClick   // 행 클릭 시 선택 비활성화
                density="compact"             // 컴팩트한 행 높이
                
                // // 그리드 툴바 설정
                // components={{
                //   Toolbar: GridToolbar,       // 기본 툴바 사용
                // }}
                // componentsProps={{
                //   toolbar: {
                //     showQuickFilter: true,    // 빠른 검색 기능 활성화
                //     quickFilterProps: { debounceMs: 500 },  // 검색 지연 시간 500ms
                //   },
                // }}
                slots={{
                  toolbar: GridToolbar,       // 기본 툴바 사용
                }}
                slotProps={{
                  toolbar: {
                    showQuickFilter: true,            // 빠른 검색 기능
                    quickFilterProps: { debounceMs: 500 },  // 검색 지연 500ms
                  },
                }}

                // 그리드 스타일링

            sx={{
    /* 스크롤 시 고정 열이 비치지 않도록 */
                  height: '600px',
                  // 헤더 스타일
                  '& .super-app-theme--header': {
                    backgroundColor: themeHex,    // 테마 색상 배경
                    color: 'white',                // 흰색 텍스트
                    fontWeight: 'bold',            // 굵은 글씨체
                  },
                  // 셀 스타일
                  '& .super-app-theme--cell': {
                    borderBottom: '1px solid #e0e0e0',  // 하단 테두리
                  },
                  // 그리드 루트 스타일
                  '& .MuiDataGrid-root': {
                    border: 'none',              // 외곽 테두리 제거
                  },
                  // 개별 셀 스타일
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid #e0e0e0',  // 하단 테두리
                  },
                  // 가상 스크롤러 스타일
                  '& .MuiDataGrid-virtualScroller': {
                    backgroundColor: '#fafafa',   // 연한 회색 배경
                  },
                  // 푸터 컨테이너 스타일
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '2px solid #e0e0e0',     // 상단 테두리
                    backgroundColor: '#f5f5f5',          // 배경색
                  },
                  // 툴바 컨테이너 스타일
                  '& .MuiDataGrid-toolbarContainer': {
                    backgroundColor: '#f8f9fa',          // 배경색
                    borderBottom: '1px solid #e0e0e0',  // 하단 테두리
                    padding: '8px 16px',                 // 내부 여백
                  },
                }}
              />
            )}
          </Box>
        </Paper>

        {/* 품목 코드 선택 모달 */}
        <ItemCodeModal
          open={this.state.itemCodeModalOpen}
          onClose={this.closeItemCodeModal}
          onSelect={this.handleItemCodeSelect}
          selectedItemCode={this.state.filters.itemCode}
          plant={this.state.filters.plant}
          worker={this.state.filters.worker}
          line={this.state.filters.line}
        />
      </Box>
    );
  }
}

function mapStateToProps(state) {
  return {
    themeHex: selectThemeHex(state),
    themeKey: selectThemeKey(state)
  };
}

// 컴포넌트를 외부에서 사용할 수 있도록 export
export default connect(mapStateToProps)(ProductionGrid);
