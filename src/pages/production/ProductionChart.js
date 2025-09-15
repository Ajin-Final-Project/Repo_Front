import React, { Component } from 'react';
import { connect } from 'react-redux';

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardHeader,
  MenuItem,
  TextField,
  CircularProgress,
  Button,
  IconButton,
  InputAdornment,
  Menu
} from '@mui/material';
import {
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Monitor as MonitorIcon,
  Search as SearchIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import s from './ProductionChart.module.scss';
import config from '../../config';

import { selectThemeHex, selectThemeKey } from '../../reducers/layout';
// 품목 코드 선택 모달 컴포넌트 import
import ItemCodeModal from '../common/ItemCodeModal';

const t = config.app.themeColors;
const primary = '#ffb300';
const info = t.info;
const success = t.success;
const warning = t.warning;
const danger = t.danger;
const API_BASE = process.env.REACT_APP_API_BASE;

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

// ✅ 퍼센트 정규화 유틸(문자/숫자 안전 처리)
const toPercent = (v) => {
  if (v == null) return 0;
  if (typeof v === 'number' && Number.isFinite(v)) {
    const pctNum = v <= 1 ? v * 100 : v;
    return Math.max(0, Math.min(100, +pctNum.toFixed(2)));
  }
  const s = String(v).trim();
  const cleaned = s.replace(/,/g, '').replace(/\s+/g, '');
  if (/%$/.test(cleaned)) {
    const n = parseFloat(cleaned.slice(0, -1));
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.min(100, +n.toFixed(2)));
  }
  const n = parseFloat(cleaned);
  if (!Number.isFinite(n)) return 0;
  const pct = n <= 1 ? n * 100 : n;
  return Math.max(0, Math.min(100, +pct.toFixed(2)));
};

function mapStateToProps(state) {
  return {
    themeHex: selectThemeHex(state),
    themeKey: selectThemeKey(state)
  };
}

class ProductionChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedProduct: '',
      selectedCapacity: '1500T',
      startDate: '2024-01-01',
      endDate: '2025-06-30',
      pieChartData: [],
      barChartData: [],
      liveChartData: [],
      loading: false,
      liveLoading: false,
      currentDataIndex: 0,
      displayData: [],
      itemList: [],
      summaryData: { totalProduction: 0, totalDefect: 0, totalRuntime: 0 },
      // 추가된 상태들
      filters: {
        plant: '아진산업-경산(본사)',
        worker: '프레스',
        line: '1500T',
        itemCode: '',
        itemName: '',
        start_work_date: '2024-01-01',
        end_work_date: '2025-06-30'
      },
      filterExpanded: false,
      quickRange: 'month',
      itemCodeModalOpen: false,     // 품목 코드 선택 모달 열림/닫힘 상태
      // UPH 데이터 상태 추가
      uphData: [],
      uphLoading: false,
      
      // 프리셋 상태/앵커 
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth() + 1,
      yearAnchorPos: null,
      monthAnchorPos: null,
      weekAnchorPos: null,
      
      // 연도 목록
      years: []
    };
    this.liveChartInterval = null;
    this.dataAnimationInterval = null;
  }

  componentDidMount() {
    this.loadYears();
    this.fetchItemList(); 
    // 처음 페이지 열 때는 기본 데이터만 로드
    this.fetchProductionData();
    // this.fetchLiveChartData();

    // this.liveChartInterval = setInterval(() => {
    //   if (!this.isAnimating) this.fetchLiveChartData();
    // }, 1000000000);
  }

  componentWillUnmount() {
    if (this.liveChartInterval) clearInterval(this.liveChartInterval);
    if (this.dataAnimationInterval) clearInterval(this.dataAnimationInterval);
    if (this.fetchTimeout) clearTimeout(this.fetchTimeout);
  }

  componentDidUpdate(prevProps, prevState) {
    // 필터 변경 시에는 데이터를 지우기만 하고, 검색 버튼을 눌러야만 데이터 로드
    // 자동 API 호출은 제거됨
  }

  /** 연도 옵션 (서버 없으면 fallback) */
  loadYears = async () => {
    try {
      // 서버에서 연도 목록을 가져오는 API가 있다면 여기에 추가
      // const response = await fetch(`${API_BASE}/smartFactory/production_chart/years`);
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

  fetchItemList = async () => {
    try {
      const response = await fetch(`${API_BASE}/smartFactory/production_chart/item_list`);
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      if (result.message === 'production item list 조회 성공') {
        const validItems = result.data.filter((item) => item.자재명 !== null);
        this.setState({
          itemList: validItems,
          selectedProduct: validItems.length > 0 ? validItems[0].자재명 : ''
        });
      }
    } catch (error) {
      this.setState({
        itemList: [{ 자재명: '제품 A' }, { 자재명: '제품 B' }, { 자재명: '제품 C' }],
        selectedProduct: '제품 A'
      });
    }
  };

  fetchProductionData = async () => {
    this.setState({ loading: true });
    try {
      const response = await fetch(`${API_BASE}/smartFactory/production_chart/pie`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_work_date: this.state.filters.start_work_date,
          end_work_date: this.state.filters.end_work_date,
          workplace: this.state.filters.line || this.state.selectedCapacity
        })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      if (result.message === 'production 테이블 조회 성공' || result.data) {
        this.processChartData(result.data);
      } else {
        throw new Error('API 응답에 데이터가 없습니다.');
      }
    } catch (error) {
      const defaultData = [
        { name: '생산 완료율', value: 0, color: primary, type: 'product_rate' },
        { name: '품질 합격률', value: 0, color: success, type: '생산비율' },
        { name: '완료 수량', value: 0, color: info, type: 'sum_complete_count' },
        { name: '가동 시간', value: 0, color: warning, type: 'sum_runtime' }
      ];
      this.setState({ pieChartData: defaultData, loading: false });
    }
  };

  fetchBarChartData = async () => {
    if (!this.state.filters.itemName) return;
    try {
      const response = await fetch(`${API_BASE}/smartFactory/production_chart/bar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_work_date: this.state.filters.start_work_date,
          itemName: this.state.filters.itemName,
          end_work_date: this.state.filters.end_work_date
        })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      if (result.message === 'production 테이블 조회 성공') this.processBarChartData(result.data);
    } catch (error) {
      this.setState({ barChartData: [] });
    }
  };

  // 실시간 차트 데이터 가져오기
  // fetchLiveChartData = async () => {
  //   try {
  //     const response = await fetch(`${API_BASE}/smartFactory/production_chart/live-chart`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ 
  //         start_date: this.state.filters.start_work_date, 
  //         end_date: this.state.filters.end_work_date 
  //       })
  //     });
  //     if (!response.ok) throw new Error('Network response was not ok');
  //     const result = await response.json();
  //     if (result.message === 'productionGrid live list 조회 성공' && result.data) {
  //       const chartData = result.data.map((item) => ({
  //         date: item.근무일자,
  //         production: parseInt(item['sum(생산수량)']) || 0
  //       }));
  //       this.setState({
  //         liveChartData: chartData,
  //         liveLoading: false,
  //         currentDataIndex: 0,
  //         displayData: []
  //       });
  //       this.startDataAnimation(chartData);
  //     } else {
  //       throw new Error('API 응답 형식이 올바르지 않습니다.');
  //     }
  //   } catch (error) {
  //     const defaultData = [
  //       { date: '2024-01-01', production: 15000 },
  //       { date: '2024-01-02', production: 18000 },
  //       { date: '2024-01-03', production: 22000 },
  //       { date: '2024-01-04', production: 19000 },
  //       { date: '2024-01-05', production: 25000 },
  //       { date: '2024-01-06', production: 21000 },
  //       { date: '2024-01-07', production: 28000 }
  //     ];
  //     this.setState({
  //       liveChartData: defaultData,
  //       liveLoading: false,
  //       currentDataIndex: 0,
  //       displayData: []
  //     });
  //     this.startDataAnimation(defaultData);
  //   }
  // };

  // UPH 데이터 가져오기
  fetchUphData = async () => {
    this.setState({ uphLoading: true });
    try {
      const response = await fetch(`${API_BASE}/smartFactory/production_chart/uph-production`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: this.state.filters.start_work_date,
          end_date: this.state.filters.end_work_date,
          itemCd: this.state.filters.itemCode || undefined
        })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      
      // 다양한 응답 구조에 대응
      let uphData = [];
      if (result.success && result.data) {
        uphData = result.data;
      } else if (result.data) {
        uphData = result.data;
      } else if (Array.isArray(result)) {
        uphData = result;
      } else if (result.message && result.data) {
        uphData = result.data;
      }

      this.setState({ uphData, uphLoading: false });
    } catch (error) {
      console.error('UPH 데이터 로드 오류:', error);
      this.setState({ 
        uphData: [], 
        uphLoading: false 
      });
    }
  };

  // ✅ 파이차트는 즉시 렌더(애니메이션 없음)
  processChartData = (data) => {
    const newPieChartData = [];
    if (data.pie1 && data.pie1.length > 0) {
      const p1 = data.pie1[0] || {};
      const productRateRaw = p1.product_rate ?? p1.productRate ?? p1['생산완료율'] ?? p1.rate ?? p1['rate'];
      const productRate = toPercent(productRateRaw);
      newPieChartData.push({ name: '생산 완료율', value: productRate, color: primary, type: 'product_rate' });
    }
    if (data.pie2 && data.pie2.length > 0) {
      const p2 = data.pie2[0] || {};
      const qualityRateRaw = p2['생산비율'] ?? p2.quality_rate ?? p2.qualityRate ?? p2.pass_rate ?? p2.passRate;
      const qualityRate = toPercent(qualityRateRaw);
      newPieChartData.push({ name: '품질 합격률', value: qualityRate, color: success, type: '생산비율' });
    }
    if (data.pie3 && data.pie3.length > 0) {
      const p3 = data.pie3[0] || {};
      newPieChartData.push({ name: '완료 수량', value: Number(p3.sum_complete_count) || 0, color: danger, type: 'sum_complete_count' });
      newPieChartData.push({ name: '가동 시간', value: Number(p3.sum_runtime) || 0, color: info, type: 'sum_runtime' });
    }
    this.setState({ pieChartData: newPieChartData, loading: false });
  };

  processBarChartData = (data) => {
    const chartData = data.map((item) => ({ month: `${item.월}월`, quantity: item.월별_양품수량, year: item.년도 }));
    const summaryData = {
      totalProduction: data.length > 0 ? Number(data[0].총_생산수량) || 0 : 0,
      totalDefect: data.length > 0 ? Number(data[0].총_공정불량) || 0 : 0,
      totalRuntime: data.length > 0 ? Number(data[0].총_가동시간) || 0 : 0
    };
    this.setState({ barChartData: chartData, summaryData });
  };

  handleProductChange = (e) => this.setState({ selectedProduct: e.target.value });
  handleCapacityChange = (e) => this.setState({ selectedCapacity: e.target.value });
  handleStartDateChange = (e) => this.setState({ startDate: e.target.value });
  handleEndDateChange = (e) => this.setState({ endDate: e.target.value });


  toggleFilterExpansion = () => {
    this.setState(prevState => ({
      filterExpanded: !prevState.filterExpanded
    }));
  };

  handleFilterChange = (field, value) => {
    this.setState(prevState => {
      const newFilters = {
        ...prevState.filters,
        [field]: value
      };
      
      // 품번, 품목명, 날짜가 변경되면 차트 데이터 초기화
      const shouldClearData = ['itemCode', 'itemName', 'start_work_date', 'end_work_date'].includes(field);
      
      const clearData = shouldClearData ? {
        pieChartData: [],
        barChartData: [],
        uphData: [],
        summaryData: { totalProduction: 0, totalDefect: 0, totalRuntime: 0 }
      } : {};
      
      // line 필드가 변경되면 selectedCapacity도 업데이트
      if (field === 'line') {
        return {
          filters: newFilters,
          selectedCapacity: value,
          ...clearData
        };
      }
      
      return { 
        filters: newFilters,
        ...clearData
      };
    });
  };

  /** 필터 초기화 */
  resetFilters = () => {
    const currentYear = new Date().getFullYear();
    const defaultFilters = {
      plant: '아진산업-경산(본사)',
      worker: '프레스',
      line: '1500T',
      itemCode: '',
      itemName: '',
      start_work_date: `${currentYear}-01-01`,
      end_work_date: `${currentYear}-12-31`
    };
    
    this.setState({
      filters: defaultFilters,
      quickRange: null,
      pieChartData: [],
      barChartData: [],
      uphData: [],
      summaryData: { totalProduction: 0, totalDefect: 0, totalRuntime: 0 }
    });
  };

  /** 날짜 프리셋/범위 */
  setDateRange = (start, end) => {
    const start_date = iso(start);
    const end_date = iso(end);
    this.setState((prev) => ({
      filters: { ...prev.filters, start_work_date: start_date, end_work_date: end_date },
      // 날짜 변경 시 차트 데이터 초기화 (API 호출 없음)
      pieChartData: [],
      barChartData: [],
      uphData: [],
      summaryData: { totalProduction: 0, totalDefect: 0, totalRuntime: 0 }
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

  /** 검색 실행 */
  handleSearch = async () => {
    this.fetchProductionData();
    this.fetchBarChartData();
    this.fetchUphData();
  };

  openItemCodeModal = () => {
    // 품목코드 모달 열기 로직
    this.setState({ itemCodeModalOpen: true });
  };

  closeItemCodeModal = () => {
    // 품목코드 모달 닫기
    this.setState({ itemCodeModalOpen: false });
  };

  handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
    this.setState(prevState => ({
      filters: {
        ...prevState.filters,
        itemCode: 품목번호 || '',
        itemName: 품목명 || ''
      },
      itemCodeModalOpen: false // 선택 후 모달 닫기
    }));
  };

  renderPieCharts = (themeHex) => {
    const { pieChartData, loading } = this.state;

    if (loading) {
      return (
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2 }}>
            <PieChartIcon /> 생산 현황 지표
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: themeHex }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>데이터를 불러오는 중...</Typography>
          </Box>
        </Paper>
      );
    }

    if (!pieChartData || pieChartData.length === 0) {
      return (
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2 }}>
            <PieChartIcon /> 생산 현황 지표
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">표시할 데이터가 없습니다. 기간과 프레스를 선택해주세요.</Typography>
          </Box>
        </Paper>
      );
    }

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2 }}>
          <PieChartIcon /> 생산 현황 지표
        </Typography>



        {/* 파이 차트 그리드 */}
        <Grid container spacing={2}>
          {pieChartData.map((data, index) => (
            <Grid item xs={12} sm={6} md={3} key={`${data.type}-${index}`}>
              <Card elevation={1} sx={{ height: '100%', border: `1px solid ${data.color}20`, borderRadius: 2, '&:hover': { elevation: 2, transform: 'translateY(-1px)', transition: 'all 0.2s ease-in-out' } }}>
                <CardContent sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: data.color, fontWeight: 600, mb: 1, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.8rem' }}>{data.name}</Typography>

                  {/* 파이차트는 첫 번째와 두 번째만 표시 (애니메이션 비활성화) */}
                  {index < 2 ? (
                    <Box sx={{ height: 120, width: '100%', mb: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          {(() => {
                            const pct = toPercent(data.value);
                            const remainder = Math.max(0, 100 - pct);
                            return (
                              <Pie
                                isAnimationActive={false}
                                data={[
                                  { name: data.name, value: pct },
                                  { name: '잔여', value: remainder }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={25}
                                outerRadius={45}
                                paddingAngle={1}
                                dataKey="value"
                              >
                                <Cell fill={data.color} />
                                <Cell fill="#f8f9fa" />
                              </Pie>
                            );
                          })()}
                          <Tooltip formatter={(value, name) => [`${Number(value).toFixed(2)}%`, name]} contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  ) : (
                    <Box sx={{ height: 120, width: '100%', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="h3" sx={{ color: data.color, fontWeight: 'bold' }}>{index === 2 ? '📊' : '⏱️'}</Typography>
                    </Box>
                  )}

                  <Typography variant="h4" component="div" sx={{ color: data.color, fontWeight: 700, fontSize: '1.8rem' }}>
                    {index < 2 ? `${toPercent(data.value)}%` : Number(data.value / 60 || 0).toLocaleString()}
                  </Typography>

                  {index >= 2 && (
                    <Typography variant="body2" sx={{ color: '#666', fontSize: '0.7rem', mt: 0.5 }}>{index === 2 ? '개' : '시간'}</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  };

  renderBarChart = (themeHex) => {
    const { barChartData, summaryData } = this.state;

    // 막대그래프 데이터가 없을 때 안내 메시지 표시
    if (!barChartData || barChartData.length === 0) {
      return (
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2 }}>
            <BarChartIcon /> 제품별 월간 생산량
          </Typography>
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h5" sx={{ color: '#666', mb: 2 }}>
              품목을 선택해주세요
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              막대그래프를 보려면 상단의 품번 또는 품목명을 선택해주세요.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              품목을 선택하면 해당 제품의 월간 생산량 데이터가 표시됩니다.
            </Typography>
          </Box>
        </Paper>
      );
    }

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2 }}>
          <BarChartIcon /> 제품별 월간 생산량
        </Typography>

        <Box sx={{ display: 'flex', gap: 3 }}>
          <Box sx={{ flex: 1, height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                <Tooltip formatter={(value) => [value, '양품수량']} labelFormatter={(label) => `${label} 양품수량`} contentStyle={{ backgroundColor: 'white', border: '1px solid #e0e0e0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="quantity" fill={themeHex} radius={[4, 4, 0, 0]} name="양품수량" />
              </BarChart>
            </ResponsiveContainer>
          </Box>

          {/* 요약 카드들 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 160 }}>
            <Card elevation={1} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, '&:hover': { elevation: 2, transform: 'translateY(-1px)', transition: 'all 0.2s ease-in-out' } }}>
              <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>총 생산수량</Typography>
                <Typography variant="h5" component="div" sx={{ fontWeight: 300, color: '#333', mb: 0.5, fontSize: '1.2rem' }}>{summaryData ? Number(summaryData.totalProduction || 0).toLocaleString() : '0'}</Typography>
                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.65rem' }}>개</Typography>
              </CardContent>
            </Card>
            <Card elevation={1} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, '&:hover': { elevation: 2, transform: 'translateY(-1px)', transition: 'all 0.2s ease-in-out' } }}>
              <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>총 공정불량</Typography>
                <Typography variant="h5" component="div" sx={{ fontWeight: 300, color: '#333', mb: 0.5, fontSize: '1.2rem' }}>{summaryData ? Number(summaryData.totalDefect || 0).toLocaleString() : '0'}</Typography>
                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.65rem' }}>개</Typography>
              </CardContent>
            </Card>
            <Card elevation={1} sx={{ border: '1px solid #e0e0e0', borderRadius: 2, '&:hover': { elevation: 2, transform: 'translateY(-1px)', transition: 'all 0.2s ease-in-out' } }}>
              <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                <Typography variant="body2" sx={{ color: '#666', mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>총 가동시간(분)</Typography>
                <Typography variant="h5" component="div" sx={{ fontWeight: 300, color: '#333', mb: 0.5, fontSize: '1.2rem' }}>{summaryData ? Number(summaryData.totalRuntime || 0).toLocaleString() : '0'}</Typography>
                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.65rem' }}>시간</Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>
    );
  };

  // UPH 차트 렌더링
  renderUphCharts = (themeHex) => {
    const { uphData, uphLoading } = this.state;

    if (uphLoading) {
      return (
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2 }}>
            <BarChartIcon /> UPH 분석
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress size={40} sx={{ color: themeHex }} />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>UPH 데이터를 불러오는 중...</Typography>
          </Box>
        </Paper>
      );
    }

    if (!uphData || uphData.length === 0) {
      return (
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2 }}>
            <BarChartIcon /> UPH 분석
          </Typography>
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h5" sx={{ color: '#666', mb: 2 }}>
              품목을 선택해주세요
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              막대그래프를 보려면 상단의 품번 또는 품목명을 선택해주세요.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              품목을 선택하면 해당 제품의 UPH 데이터가 표시됩니다.
            </Typography>
          </Box>
        </Paper>
      );
    }

    // 차트 데이터 변환 - 최적화된 버전
    const parseDecimal = (value) => {
      if (value == null || value === '') return 0;
      if (typeof value === 'object' && value.toString) {
        return parseFloat(value.toString()) || 0;
      }
      return parseFloat(value) || 0;
    };

    // 원본 데이터를 그대로 사용 (년월별 표시) - 메모이제이션 적용
    const chartData = uphData.map(item => ({
      년월: item.년월 || '',
      자재번호: item.자재번호 || '',
      자재명: item.자재명 || '',
      작업장: item.작업장 || '',
      uphProduction: parseDecimal(item.UPH_생산),
      uphGood: parseDecimal(item.UPH_양품),
      totalProduction: parseDecimal(item.월총생산),
      totalGood: parseDecimal(item.월총양품),
      totalRuntime: parseDecimal(item.월총가동분)
    }));

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2 }}>
          <BarChartIcon /> UPH 분석
        </Typography>

        <Grid container spacing={3}>
          {/* 자재별 양품수량 UPH */}
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#4CAF50', mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                  년월별 양품수량 UPH
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="년월" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#666' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${Number(value).toFixed(2)} UPH`, 
                          name
                        ]} 
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            const data = payload[0].payload;
                            return `${data.년월} - ${data.자재명} (${data.자재번호})`;
                          }
                          return label;
                        }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          maxWidth: 300
                        }} 
                      />
                      <Bar 
                        dataKey="uphGood" 
                        fill="#4CAF50" 
                        radius={[4, 4, 0, 0]} 
                        name="양품 UPH"
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 자재별 생산수량 UPH */}
          <Grid item xs={12} md={6}>
            <Card elevation={1} sx={{ height: '100%', border: '1px solid #e0e0e0', borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ color: '#2196F3', mb: 2, textAlign: 'center', fontWeight: 'bold' }}>
                  년월별 생산수량 UPH
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="년월" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#666' }}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${Number(value).toFixed(2)} UPH`, 
                          name
                        ]} 
                        labelFormatter={(label, payload) => {
                          if (payload && payload[0]) {
                            const data = payload[0].payload;
                            return `${data.년월} - ${data.자재명} (${data.자재번호})`;
                          }
                          return label;
                        }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: '8px', 
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          maxWidth: 300
                        }} 
                      />
                      <Bar 
                        dataKey="uphProduction" 
                        fill="#2196F3" 
                        radius={[4, 4, 0, 0]} 
                        name="생산 UPH"
                        isAnimationActive={false}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* UPH 데이터 테이블 - 최적화된 버전 */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ color: themeHex, mb: 2, fontWeight: 'bold' }}>
            UPH 상세 데이터 ({chartData.length}건)
          </Typography>
          <Paper elevation={1} sx={{ overflow: 'auto', maxHeight: 400 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f5f5f5', position: 'sticky', top: 0 }}>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>년월</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>자재번호</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>자재명</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>작업장</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>UPH 생산</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>UPH 양품</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>월총생산</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>월총양품</th>
                  <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>월총가동분</th>
                </tr>
              </thead>
              <tbody>
                {chartData.slice(0, 100).map((item, index) => (
                  <tr key={`${item.년월}-${item.자재번호}-${index}`} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{item.년월}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{item.자재번호}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{item.자재명}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd' }}>{item.작업장}</td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                      {item.uphProduction > 0 ? item.uphProduction.toFixed(2) : '-'}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                      {item.uphGood > 0 ? item.uphGood.toFixed(2) : '-'}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                      {item.totalProduction.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                      {item.totalGood.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'right' }}>
                      {item.totalRuntime.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {chartData.length > 100 && (
                  <tr style={{ backgroundColor: '#f0f0f0' }}>
                    <td colSpan="9" style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'center', fontStyle: 'italic' }}>
                      ... 및 {chartData.length - 100}건 더 (처음 100건만 표시)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Paper>
        </Box>
      </Paper>
    );
  };

  // renderLiveChart = (themeHex) => {
  //   const { liveLoading, displayData, currentDataIndex } = this.state;

  //   return (
  //     <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: `2px solid ${themeHex}20` }}>
  //       <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2, fontSize: '1.3rem', fontWeight: 'bold' }}>
  //         <MonitorIcon sx={{ fontSize: '1.5rem' }} /> 실시간 생산량 모니터링
  //       </Typography>

  //       <Box sx={{ height: 400, backgroundColor: '#f8f9fa', borderRadius: 2, border: `1px solid ${themeHex}30`, position: 'relative' }}>
  //         {liveLoading ? (
  //           <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
  //             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
  //           </Box>
  //         ) : displayData && displayData.length > 0 ? (
  //           <ResponsiveContainer width="100%" height="100%">
  //             <AreaChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
  //               <defs>
  //                 <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
  //                   <stop offset="5%" stopColor={themeHex} stopOpacity={0.8} />
  //                   <stop offset="95%" stopColor={themeHex} stopOpacity={0.1} />
  //                 </linearGradient>
  //               </defs>
  //               <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
  //               <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} tickFormatter={(value) => { const date = new Date(value); return `${date.getMonth() + 1}/${date.getDate()}`; }} />
  //               <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
  //               <Tooltip formatter={(value) => [Number(value).toLocaleString(), '생산량']} labelFormatter={(label) => `날짜: ${label}` } contentStyle={{ backgroundColor: 'white', border: `2px solid ${themeHex}`, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
  //               <Area type="monotone" dataKey="production" stroke={themeHex} strokeWidth={3} fill="url(#colorProduction)" name="생산량" animationDuration={300} animationBegin={0} />
  //             </AreaChart>
  //           </ResponsiveContainer>
  //         ) : (
  //            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
  //             <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
  //           </Box>
  //         )}
  //       </Box>

  //       {/* 하단 통계 정보 */}
  //       <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: `1px solid ${themeHex}20` }}>
  //         <Box sx={{ textAlign: 'center' }}>
  //           <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>총 데이터 포인트</Typography>
  //           <Typography variant="h6" sx={{ color: themeHex, fontWeight: 'bold' }}>{displayData ? displayData.length : 0}</Typography>
  //         </Box>
  //         <Box sx={{ textAlign: 'center' }}>
  //           <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>최고 생산량</Typography>
  //           <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>{displayData && displayData.length > 0 ? Math.max(...displayData.map((d) => d.production)).toLocaleString() : '0'}</Typography>
  //         </Box>
  //         <Box sx={{ textAlign: 'center' }}>
  //           <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>평균 생산량</Typography>
  //           <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>{displayData && displayData.length > 0 ? Math.round(displayData.reduce((sum, d) => sum + d.production, 0) / displayData.length).toLocaleString() : '0'}</Typography>
  //         </Box>
  //         <Box sx={{ textAlign: 'center' }}>
  //           <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>현재 인덱스</Typography>
  //           <Typography variant="h6" sx={{ color: '#9C27B0', fontWeight: 'bold' }}>{currentDataIndex + 1}</Typography>
  //         </Box>
  //       </Box>
  //     </Paper>
  //   );
  // };

  // // 데이터 애니메이션(라이브영역만 사용)
  // startDataAnimation = (data) => {
  //   if (this.dataAnimationInterval) clearInterval(this.dataAnimationInterval);
  //   this.dataAnimationInterval = setInterval(() => {
  //     this.setState((prevState) => {
  //       if (prevState.displayData.length >= data.length) {
  //         clearInterval(this.dataAnimationInterval);
  //         return prevState;
  //       }
  //       const newIndex = prevState.currentDataIndex + 1;
  //       const newDisplayData = [...prevState.displayData];
  //       newDisplayData.push(data[prevState.currentDataIndex]);
  //       return { currentDataIndex: newIndex, displayData: newDisplayData };
  //     });
  //   }, 500);
  // };

  render() {
    const { themeHex } = this.props;
    return (
      <Box className={s.root} sx={{ height: '100vh', p: 3, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
        {/* 헤더 섹션 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ color: themeHex, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon /> 생산 데이터 차트
          </Typography>
          <Typography variant="body1" color="text.secondary">생산 현황을 차트로 한눈에 파악할 수 있습니다.</Typography>
        </Box>
        <Box sx= {{mb: 3}} >
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
                오늘
              </Button>
        
              {/* 구분자 파이프(옵션) */}
              <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>
        
              {/* 기간선택 + 날짜 필드 */}
                <Typography sx={{ color: 'white' }}>기간선택</Typography>
                <TextField
                  type="date"
                  value={this.state.filters.start_work_date}
                  onChange={(e) => this.handleFilterChange('start_work_date', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                />
                <Typography sx={{ color: 'white' }}>~</Typography>
                <TextField
                  type="date"
                  value={this.state.filters.end_work_date}
                  onChange={(e) => this.handleFilterChange('end_work_date', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                />
        
                {/* 확장/축소 버튼 */}
                <IconButton onClick={this.toggleFilterExpansion} sx={{ color: 'white' }}>
                  {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
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
                      value={this.state.filters.plant ?? ''}
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
                      value={this.state.filters.worker}
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
                      label="작업자"
                      value={this.state.filters.line}
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
                      value={this.state.filters.itemCode}
                      onClick={this.openItemCodeModal}
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
                      value={this.state.filters.itemName}
                      onClick={this.openItemCodeModal}
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

                {/* 버튼 섹션 */}
                <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button 
                    variant="outlined" 
                    startIcon={<ClearIcon />} 
                    onClick={this.resetFilters} 
                    size="large" 
                    color="secondary"
                    sx={{
                      borderColor: '#666',
                      color: '#666',
                      '&:hover': {
                        borderColor: '#333',
                        backgroundColor: '#f5f5f5'
                      }
                    }}
                  >
                    필터 초기화
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SearchIcon />}
                    size="large"
                    onClick={this.handleSearch}
                    sx={{ 
                      backgroundColor: themeHex, 
                      '&:hover': { backgroundColor: '#e65100' },
                      fontWeight: 'bold'
                    }}
                  >
                    검색
                  </Button>
                </Box>
                </Paper>
        </Box>

        {/* 실시간 생산량 차트 */}
        {/* {this.renderLiveChart(themeHex)} */}
        {/* 파이차트 */}
        {this.renderPieCharts(themeHex)}
        {/* 막대 그래프 */}
        {this.renderBarChart(themeHex)}
        {/* UPH 차트 */}
        {this.renderUphCharts(themeHex)}

                 {/* 품목 코드 선택 모달 */}
         <ItemCodeModal
           open={this.state.itemCodeModalOpen}
           onClose={this.closeItemCodeModal}
           onSelect={this.handleItemCodeSelect}
           plant={this.state.filters.plant}
           worker={this.state.filters.worker}
           line={this.state.filters.line}
         />
      </Box>
    );
  }
}

export default connect(mapStateToProps)(ProductionChart);
