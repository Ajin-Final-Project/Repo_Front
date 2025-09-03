import React, { Component } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
  LabelList
} from 'recharts';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardHeader,
  Select,
  MenuItem,
  FormControl,
  TextField,
  CircularProgress,
  Alert,
  Button,
  IconButton,
  InputAdornment,
  Collapse,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { 
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  PieChart as PieChartIcon,
  Search as SearchIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon
} from '@mui/icons-material';
import s from './MoldCleaningChart.module.scss';
import config from '../../config';
import ItemCodeModal from '../common/ItemCodeModal';

// API 엔드포인트들
const API_ENDPOINTS = {
  WORK_COUNT: `${config.baseURLApi}/smartFactory/mold-chart/work-count`,
  RUNTIME: `${config.baseURLApi}/smartFactory/mold-chart/runtime`,
  SUMMARIZE: `${config.baseURLApi}/smartFactory/mold-chart/summarize`,
  BREAKDOWN: `${config.baseURLApi}/smartFactory/mold-chart/breakdown`,
  BREAKDOWN_PIE_TOP10: `${config.baseURLApi}/smartFactory/mold-chart/breakdown-pie-top10`,
  EQUIPMENT_LIST: `${config.baseURLApi}/smartFactory/mold-chart/equipment-list`,
  CLEANING_CHECK_LIST: `${config.baseURLApi}/smartFactory/mold-chart/cleaning-ranked`,
  SHOT_ANALYSIS: `${config.baseURLApi}/smartFactory/mold-chart/shot-analysis`,
};

class MoldChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // 통합된 검색 필터
      filters: {
        plant: "아진산업-경산(본사)",
        worker: "프레스",
        line: "1500T",
        itemCode: '',
        itemName: '',
        start_date: new Date(new Date().getFullYear(), 0, 1).toLocaleDateString('sv-SE'),
        end_date: new Date().toLocaleDateString('sv-SE'),
        equipment_detail: '전체'
      },
      filterExpanded: false,
      quickRange: 'year',
      itemCodeModalOpen: false,
      
      // 차트 데이터
      workCountData: [],
      runtimeData: [],
      breakdownData: [],
      equipmentRankingData: [],
      cleaningRankedData: [],
      moldAnalysisData: {},
      summaryData: {},
      equipmentTypes: [{ 설비내역: '전체' }],
      selectedMonthDetail:[],
      
      // 상태
      loading: false,
      error: null
    };
  }

  componentDidMount() {
    this.fetchEquipmentList();
    this.fetchAllData();
  }

  componentDidUpdate(prevProps, prevState) {
    // 필터가 변경되면 모든 데이터를 다시 가져옴
    if (
      prevState.filters.start_date !== this.state.filters.start_date ||
      prevState.filters.end_date !== this.state.filters.end_date ||
      prevState.filters.line !== this.state.filters.line ||
      prevState.filters.itemName !== this.state.filters.itemName ||
      prevState.filters.equipment_detail !== this.state.filters.equipment_detail
    ) {
      this.fetchAllData();
    }
  }

  // 모든 데이터를 가져오는 메서드
  fetchAllData = async () => {
    this.setState({ loading: true, error: null });
    
    try {
      await Promise.all([
        this.fetchWorkCountData(),
        this.fetchRuntimeData(),
        this.fetchSummaryData(),
        this.fetchBreakdownData(),
        this.fetchEquipmentRankingData(),
        this.fetchCleaningRankedData()
      ]);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
      this.setState({ error: '데이터를 불러오는 중 오류가 발생했습니다.' });
    } finally {
      this.setState({ loading: false });
    }
  }

  // 프레스 월별 작업횟수 데이터 가져오기
  fetchWorkCountData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.WORK_COUNT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: this.state.filters.start_date,
          end_date: this.state.filters.end_date,
          line: this.state.filters.line
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      this.setState({ workCountData: json.data || json || [] });
    } catch (error) {
      console.error('작업횟수 데이터 로드 오류:', error);
      this.setState({ workCountData: [] });
    }
  }

  // 프레스 가동시간 데이터 가져오기
  fetchRuntimeData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.RUNTIME, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: this.state.filters.start_date,
          end_date: this.state.filters.end_date,
          line: this.state.filters.line
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      
      // 데이터를 선 그래프에 맞게 변환
      const rawData = json.data || json || [];
      const transformedData = this.transformRuntimeData(rawData);
      
      this.setState({ runtimeData: transformedData });
    } catch (error) {
      console.error('가동시간 데이터 로드 오류:', error);
      this.setState({ runtimeData: [] });
    }
  }

  // 가동시간 데이터를 선 그래프에 맞게 변환하는 메서드
  transformRuntimeData = (rawData) => {
    const monthlyData = {};
    
    // 각 데이터를 월별로 그룹화
    rawData.forEach(item => {
      const month = item.월;
      const equipment = item.설비;
      const runtime = item.가동시간;
      
      if (!monthlyData[month]) {
        monthlyData[month] = { 월: month };
      }
      
      // 설비별 가동시간을 해당 월의 객체에 추가
      monthlyData[month][equipment] = runtime;
    });
    
    // 월 순서대로 정렬하여 배열로 변환
    const result = Object.values(monthlyData).sort((a, b) => a.월 - b.월);
    
    return result;
  }

  // 프레스 요약정보 데이터 가져오기
  fetchSummaryData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SUMMARIZE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_detail: this.state.filters.line,
          start_date: this.state.filters.start_date,
          end_date: this.state.filters.end_date
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      
      const finalData = json.data || json || {};

      this.setState({ summaryData: finalData });
    } catch (error) {
      console.error('요약정보 데이터 로드 오류:', error);
      this.setState({ summaryData: {} });
    }
  }

  // 월별 금형 고장 건수 데이터 가져오기
  fetchBreakdownData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BREAKDOWN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plant: this.state.filters.plant,
          worker: this.state.filters.worker,
          line: this.state.filters.line,
          itemCd: this.state.filters.itemCode,
          start_date: this.state.filters.start_date,
          end_date: this.state.filters.end_date
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
 
      this.setState({ breakdownData: json.data || json || [] });
      
    } catch (error) {
      console.error('고장 건수 데이터 로드 오류:', error);
      this.setState({ breakdownData: [] });
    }
  }

  // 막대 클릭 시 상세 데이터 가져오기
  handleBarClick = async (data) => {
    try {
      
      // 데이터가 객체인지 확인하고 필요한 정보 추출
      const ym = data.ym || data.label;
      const order_cnt = data.order_cnt || data.value;
      
      
      // 클릭된 월의 상세 데이터를 가져오는 API 호출
      const response = await fetch(`${config.baseURLApi}/smartFactory/mold-chart/breakdown-detail`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plant: this.state.filters.plant,
          worker: this.state.filters.worker,
          line: this.state.filters.line,
          itemCd: this.state.filters.itemCode,
          ym: ym, // 클릭된 월
          start_date: this.state.filters.start_date,
          end_date: this.state.filters.end_date
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
 
      // 여기서 상세 데이터를 처리하거나 모달로 표시할 수 있습니다
      this.setState({ selectedMonthDetail: json.data });
      
    } catch (error) {
      console.error('상세 데이터 로드 오류:', error);
    }
  }

  // 고장점검 설비 순위 top10 데이터 가져오기
  fetchEquipmentRankingData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BREAKDOWN_PIE_TOP10, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: this.state.filters.start_date,
          end_date: this.state.filters.end_date
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      this.setState({ equipmentRankingData: json.data || json || [] });
    } catch (error) {
      console.error('설비 순위 데이터 로드 오류:', error);
      this.setState({ equipmentRankingData: [] });
    }
  }

  // 금형 세척주기 랭킹 데이터 가져오기
  fetchCleaningRankedData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.CLEANING_CHECK_LIST, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plant: this.state.filters.plant,
          worker: this.state.filters.worker,
          line: this.state.filters.line,
          itemCd: this.state.filters.itemCode
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      this.setState({ cleaningRankedData: json.data || [] });
    } catch (error) {
      console.error('금형 세척주기 랭킹 데이터 로드 오류:', error);
      this.setState({ cleaningRankedData: [] });
    }
  }

  // 금형 점검 분석 데이터 가져오기
  fetchMoldAnalysisData = async (moldCode) => {
    try {
      const response = await fetch(API_ENDPOINTS.SHOT_ANALYSIS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mold_code: `${moldCode}`
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      const analysisData = json.data && json.data.length > 0 ? json.data[0] : {};
      this.setState({ moldAnalysisData: analysisData });
    } catch (error) {
      console.error('금형 점검 분석 데이터 로드 오류:', error);
      this.setState({ moldAnalysisData: {} });
    }
  }

  // 그리드 행 클릭 이벤트 핸들러
  handleRowClick = (moldCode) => {
    if (moldCode) {
      this.fetchMoldAnalysisData(moldCode);
    }
  }

  // 설비 목록 데이터 가져오기
  fetchEquipmentList = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.EQUIPMENT_LIST);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = await response.json();
      
      // API에서 받은 설비 목록에 '전체' 옵션 추가
      const equipmentList = json.data || [];
      const allEquipmentList = [{ 설비내역: '전체' }, ...equipmentList];
      
      this.setState({ 
        equipmentTypes: allEquipmentList,
        filters: { ...this.state.filters, equipment_detail: '전체' }
      });
    } catch (error) {
      console.error('설비 목록 데이터 로드 오류:', error);
      this.setState({ 
        equipmentTypes: [{ 설비내역: '전체' }],
        filters: { ...this.state.filters, equipment_detail: '전체' }
      });
    }
  }

  // 빠른 기간 선택 메서드
  toYMD = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD

  setQuickRange = (type) => {
    const now = new Date();
    const today = this.toYMD(now);

    let start = today;
    let end = today;

    if (type === 'today') {
      // 금일: 오늘~오늘
      start = today;
      end = today;
    } else if (type === 'week') {
      // 주간: 월요일~오늘 (한국/ISO 기준 월요일 시작)
      const d = new Date(now);
      const day = d.getDay();           // 0(일)~6(토)
      const diffToMonday = (day + 6) % 7; // 월=1 -> 0, 일=0 -> 6
      d.setDate(d.getDate() - diffToMonday);
      start = this.toYMD(d);
      end = today;
    } else if (type === 'month') {
      // 월간: 1일~오늘
      const d = new Date(now.getFullYear(), now.getMonth(), 1);
      start = this.toYMD(d);
      end = today;
    } else if (type === 'year') {
      // 년간: 1월1일~오늘
      const d = new Date(now.getFullYear(), 0, 1);
      start = this.toYMD(d);
      end = today;
    }

    this.setState(prev => ({
      quickRange: type,
      filters: {
        ...prev.filters,
        start_date: start,
        end_date: end,
      }
    }));
  };

  toggleFilterExpansion = () => {
    this.setState(prev => ({ filterExpanded: !prev.filterExpanded }));
  };

  handleFilterChange = (field, value) => {
    this.setState(prev => ({
      filters: { ...prev.filters, [field]: value }
    }));
  };

  openItemCodeModal = () => {
    this.setState({ itemCodeModalOpen: true });
  };

  closeItemCodeModal = () => {
    this.setState({ itemCodeModalOpen: false });
  };

  handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
    this.setState(prev => ({
      filters: {
        ...prev.filters,
        itemCode: 품목번호 || '',
        itemName: 품목명 || '',
      },
      itemCodeModalOpen: false, // 선택 후 모달 닫기
    }));
  };

  renderWorkCountChart = () => {
    const { workCountData, loading } = this.state;

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#ffb300',
                  mb: 2
                }}>
          <BarChartIcon />
          프레스 월별 작업횟수 
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : workCountData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, flexDirection: 'column' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              데이터가 없습니다.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              품목을 선택해주세요
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 400 }}>

            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={workCountData}
                margin={{ top: 28, right: 16, left: 8, bottom: 8 }}  // ↑ 라벨 공간
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="월" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  allowDecimals={false}
                  tickFormatter={(v) => (v?.toLocaleString?.() ?? v)}
                />
                <Tooltip 
                  formatter={(v) => (v?.toLocaleString?.() ?? v)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />

                {this.state.filters.line === '1000T' && (
                  <Bar dataKey="sum_1000T" fill="#8884d8" radius={[4, 4, 0, 0]} name="1000T" isAnimationActive={false}>
                    <LabelList
                  dataKey="sum_1000T" 
                      position="top"
                      content={({ x, y, width, value }) => {
                        if (!value) return null;
                        return (
                          <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={12} fill="#333">
                            {Number(value).toLocaleString()}
                          </text>
                        );
                      }}
                    />
                  </Bar>
                )}

                {this.state.filters.line === '1200T' && (
                  <Bar dataKey="sum_1200T" fill="#82ca9d" radius={[4, 4, 0, 0]} name="1200T" isAnimationActive={false}>
                    <LabelList
                  dataKey="sum_1200T" 
                      position="top"
                      content={({ x, y, width, value }) => {
                        if (!value) return null;
                        return (
                          <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={12} fill="#333">
                            {Number(value).toLocaleString()}
                          </text>
                        );
                      }}
                    />
                  </Bar>
                )}

                {this.state.filters.line === '1500T' && (
                  <Bar dataKey="sum_1500T" fill="#ffc658" radius={[4, 4, 0, 0]} name="1500T" isAnimationActive={false}>
                    <LabelList
                  dataKey="sum_1500T" 
                      position="top"
                      content={({ x, y, width, value }) => {
                        if (!value) return null;
                        return (
                          <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={12} fill="#333">
                            {Number(value).toLocaleString()}
                          </text>
                        );
                      }}
                    />
                  </Bar>
                )}

                {this.state.filters.line === '1000T-PRO' && (
                  <Bar dataKey="sum_1000T_PRO" fill="#ff7300" radius={[4, 4, 0, 0]} name="1000T PRO" isAnimationActive={false}>
                    <LabelList
                  dataKey="sum_1000T_PRO" 
                      position="top"
                      content={({ x, y, width, value }) => {
                        if (!value) return null;
                        return (
                          <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={12} fill="#333">
                            {Number(value).toLocaleString()}
                          </text>
                        );
                      }}
                    />
                  </Bar>
                )}
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  }

  renderRuntimeChart = () => {
    const { runtimeData, loading } = this.state;

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#ffb300',
                  mb: 2
                }}>
          <TrendingUpIcon />
          프레스 가동시간
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : runtimeData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, flexDirection: 'column' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              데이터가 없습니다.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              콘솔에서 API 응답을 확인해주세요.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={runtimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="월" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                                 {this.state.filters.line === '1000T' && (
                <Line 
                  type="monotone" 
                  dataKey="1000T" 
                  stroke="#8884d8"
                  strokeWidth={3}
                  name="1000T"
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
                 )}
                 {this.state.filters.line === '1200T' && (
                <Line 
                  type="monotone" 
                  dataKey="1200T" 
                  stroke="#82ca9d"
                  strokeWidth={3}
                  name="1200T"
                  dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
                 )}
                 {this.state.filters.line === '1500T' && (
                <Line 
                  type="monotone" 
                  dataKey="1500T" 
                  stroke="#ffc658"
                  strokeWidth={3}
                  name="1500T"
                  dot={{ fill: '#ffc658', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
                 )}
                 {this.state.filters.line === '1000T-PRO' && (
                <Line 
                  type="monotone" 
                  dataKey="1000T PRO" 
                  stroke="#ff7300"
                  strokeWidth={3}
                  name="1000T PRO"
                  dot={{ fill: '#ff7300', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
                 )}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  }

  renderBreakdownChart = () => {
    const { breakdownData, loading, equipmentTypes } = this.state;

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, height: 500 }}>
        <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#ffb300',
                  mb: 2
                }}>
          <WarningIcon />
          월별 금형 고장 건수
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : breakdownData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, flexDirection: 'column' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              데이터가 없습니다.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              콘솔에서 API 응답을 확인해주세요.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={breakdownData}
                margin={{ top: 24, right: 16, left: 8, bottom: 8 }}   // ↑ 라벨 공간
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="ym" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#666' }}
                  tickFormatter={(v) => v?.toLocaleString?.() ?? v}    // 천단위
                  allowDecimals={false}
                />
                <Tooltip 
                  formatter={(v) => v?.toLocaleString?.()}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="order_cnt" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  name="고장 건수"
                  isAnimationActive={false}
                  onClick={(entry, index) => {
                    // entry.payload에 원본 행이 들어있음
                    const { ym, order_cnt } = entry?.payload || {};
                    this.handleBarClick({ ym, order_cnt, index });     // 필요 값만 전달
                  }}
                  style={{ cursor: 'pointer' }}
                  barCategoryGap={20}
                >
                  {/* 막대 위 수치 라벨 */}
                  <LabelList
                    dataKey="order_cnt"
                    position="top"
                    offset={6}
                    formatter={(v) => (v ? v.toLocaleString() : '')}
                    // 0이면 표시 안 함 (커스텀)
                    content={(props) => {
                      const { x, y, width, value } = props;
                      if (!value) return null;
                      return (
                        <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={12} fill="#333">
                          {Number(value).toLocaleString()}
                        </text>
                      );
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>

          </Box>
        )}
      </Paper>
    );
  }

  renderEquipmentRankingChart = () => {
    const { equipmentRankingData, loading } = this.state;

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#ffb300',
                  mb: 2
                }}>
          <PieChartIcon />
          고장점검 설비 순위 top10
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
          </Box>
        ) : equipmentRankingData.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, flexDirection: 'column' }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              데이터가 없습니다.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              콘솔에서 API 응답을 확인해주세요.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equipmentRankingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ 설비내역, 비율퍼센트 }) => `${설비내역} ${비율퍼센트}%`}
                  outerRadius={120}
                  innerRadius={40}
                  paddingAngle={3}
                  fill="#8884d8"
                  dataKey="설비횟수"
                >
                  {equipmentRankingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || `hsl(${index * 36}, 70%, 60%)`} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [value, '고장점검 횟수']}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  }

  // 선택된 월의 상세 데이터를 테이블로 표시
  renderSelectedMonthDetail = () => {
    const { selectedMonthDetail } = this.state;
    
        if (!selectedMonthDetail || selectedMonthDetail.length === 0) {
    return (
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, height: 500 }}>
        <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#ffb300',
                  mb: 2
                }}>
            <WarningIcon />
            월별 상세 데이터
                </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
            <Typography variant="body1" color="text.secondary">
              막대그래프에서 월을 클릭하여 상세 데이터를 확인하세요.
              </Typography>
          </Box>
        </Paper>
      );
    }

        return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, height: 500 }}>
        <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#ffb300',
                  mb: 2
                }}>
          <WarningIcon />
          월별 상세 데이터 ({selectedMonthDetail[0]?.ym}월)
            </Typography>

        <TableContainer sx={{ height: 300 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>설비내역</TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>오더내역</TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>오더번호</TableCell>
                <TableCell sx={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>통지번호</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedMonthDetail.map((row, index) => (
                <TableRow key={index} hover>
                  <TableCell>{row.설비내역 || '-'}</TableCell>
                  <TableCell>{row.오더내역 || '-'}</TableCell>
                  <TableCell>{row.오더번호 || '-'}</TableCell>
                  <TableCell>{row.통지번호 || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    );
  }

  // 금형 세척주기 랭킹 그리드를 렌더링하는 메서드
  renderCleaningRankedGrid = () => {
    const { cleaningRankedData } = this.state;
    
    return (
      <Paper 
              sx={{
          p: 3, 
          height: 420,
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
          금형 세척주기 랭킹
        </Typography>
        
        {cleaningRankedData.length > 0 ? (
          <TableContainer sx={{ height: 300 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>자재명</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>설비내역</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>금형번호</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cleaningRankedData.map((row, index) => (
                  <TableRow 
                    key={index} 
                    hover 
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      this.handleRowClick(row.금형번호);
                    }}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell>{row.자재명 || '-'}</TableCell>
                    <TableCell>{row.설비내역 || '-'}</TableCell>
                    <TableCell>{row.금형번호 || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ 
            height: 300, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#666'
          }}>
            <Typography>데이터가 없습니다</Typography>
          </Box>
        )}
      </Paper>
    );
  }

  // 금형 점검 분석 파이차트와 요약카드를 렌더링하는 메서드
  renderMoldAnalysis = () => {
    const { moldAnalysisData } = this.state;
    
    // 파이차트 데이터 준비
    const progressRate = moldAnalysisData['진행률(%)'] || 0;
    const pieData = [
      { name: '소모한 점검타수', value: progressRate, fill: '#8884d8' },
      { name: '남은 점검타수', value: 100 - progressRate, fill: '#e0e0e0' }
    ];

    return (
      <Paper 
        sx={{ 
          p: 3, 
          height: 420,
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#1976d2' }}>
          진행률 분석
        </Typography>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
          {/* 파이차트와 총점검수 */}
          <Box sx={{ display: 'flex', gap: 2, height: 200 }}>
            {/* 파이차트 */}
            <Box sx={{ flex: 1 }}>
              {Object.keys(moldAnalysisData).length > 0 && progressRate > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => [`${value}%`, '진행률']}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#666'
                }}>
                  <Typography>그리드에서 행을 클릭하여 분석 데이터를 확인하세요</Typography>
                </Box>
              )}
            </Box>

            {/* 총점검수 카드 */}
            <Box sx={{ width: 120, display: 'flex', alignItems: 'center' }}>
              <Paper 
                sx={{ 
                  p: 2, 
                  width: '100%',
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  backgroundColor: '#f8f9fa',
                  textAlign: 'center'
                }}
              >
                <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                  총 점검수
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1976d2' }}>
                  {moldAnalysisData['총 점검수'] || '-'}
                </Typography>
              </Paper>
            </Box>
          </Box>

          {/* 80%, 90% 대비 비율/수치를 한줄로 */}
          <Box sx={{ display: 'flex', gap: 1.5, height: 120 }}>
            <Paper 
              sx={{ 
                p: 2, 
                flex: 1,
                height: '100%',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#f8f9fa',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                80% 대비 비율
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {moldAnalysisData['80프로대비비율(%)'] ? `${moldAnalysisData['80프로대비비율(%)']}%` : '-'}
              </Typography>
            </Paper>

            <Paper 
              sx={{ 
                p: 2, 
                flex: 1,
                height: '100%',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#f8f9fa',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                80% 대비 수치
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#4caf50' }}>
                {moldAnalysisData['80프로대비수치'] || '-'}
              </Typography>
            </Paper>

            <Paper 
              sx={{ 
                p: 2, 
                flex: 1,
                height: '100%',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#f8f9fa',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                90% 대비 비율
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {moldAnalysisData['90프로대비비율(%)'] ? `${moldAnalysisData['90프로대비비율(%)']}%` : '-'}
              </Typography>
            </Paper>

            <Paper 
              sx={{ 
                p: 2, 
                flex: 1,
                height: '100%',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                backgroundColor: '#f8f9fa',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
            >
              <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
                90% 대비 수치
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
                {moldAnalysisData['90프로대비수치'] || '-'}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </Paper>
    );
  }

        renderSummaryCards = () => {
    const { summaryData } = this.state;
    
    // summaryData가 배열인 경우 첫 번째 요소를 사용
    const data = Array.isArray(summaryData) && summaryData.length > 0 ? summaryData[0] : summaryData;
    
    return (
      <Paper elevation={3} sx={{ p: 2, mb: 3, borderRadius: 2, height: 500 }}>
        <Typography variant="subtitle1" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#ffb300',
                  mb: 1.5,
                  fontSize: '0.9rem'
                }}>
                  <ScheduleIcon sx={{ fontSize: '1.2rem' }} />
                  프레스 요약정보
                </Typography>

                 {/* 요약 카드들을 세로로 배치 */}
         <Grid container spacing={1.5}>
           <Grid item xs={12}>
            <Card elevation={2} sx={{ 
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
               <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                 <Typography variant="h5" sx={{ color: '#4CAF50', fontWeight: 'bold', mb: 0.5 }}>
                   {data.avg_작업횟수 ? Math.round(data.avg_작업횟수).toLocaleString() : 0}
                </Typography>
                 <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                   평균 작업횟수
                </Typography>
              </CardContent>
            </Card>
          </Grid>

           <Grid item xs={12}>
            <Card elevation={2} sx={{ 
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
               <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                 <Typography variant="h5" sx={{ color: '#2196F3', fontWeight: 'bold', mb: 0.5 }}>
                  {data.sum_작업횟수 ? data.sum_작업횟수.toLocaleString() : 0}
                </Typography>
                 <Typography variant="caption" sx={{ color: '#666', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                  총 작업횟수
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  render() {
    const { filters, filterExpanded, error } = this.state;

    return (
      <Box className={s.root} sx={{
        height: '100vh',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#f5f5f5'
      }}>
        {/* 헤더 섹션 */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ 
            color: '#ffb300',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <TrendingUpIcon />
            금형 데이터 차트
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            금형 현황을 차트로 한눈에 파악할 수 있습니다.
          </Typography>
        </Box>

        {/* 검색 필터 섹션 */}
        <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
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
                {/* 빠른 기간 버튼 */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant={this.state.quickRange === 'today' ? 'contained' : 'outlined'}
                    onClick={() => this.setQuickRange('today')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&.MuiButton-contained': { backgroundColor: 'white', color: '#ff8f00' },
                    }}
                  >
                    금일
                  </Button>
                  <Button
                    size="small"
                    variant={this.state.quickRange === 'week' ? 'contained' : 'outlined'}
                    onClick={() => this.setQuickRange('week')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&.MuiButton-contained': { backgroundColor: 'white', color: '#ff8f00' },
                    }}
                  >
                    주간
                  </Button>
                  <Button
                    size="small"
                    variant={this.state.quickRange === 'month' ? 'contained' : 'outlined'}
                    onClick={() => this.setQuickRange('month')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&.MuiButton-contained': { backgroundColor: 'white', color: '#ff8f00' },
                    }}
                  >
                    월간
                  </Button>
                  <Button
                    size="small"
                    variant={this.state.quickRange === 'year' ? 'contained' : 'outlined'}
                    onClick={() => this.setQuickRange('year')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&.MuiButton-contained': { backgroundColor: 'white', color: '#ff8f00' },
                    }}
                  >
                    년간
                  </Button>
                </Box>

                {/* 구분자 파이프(옵션) */}
                <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>

                {/* 기간선택 + 날짜 필드 */}
                <Typography sx={{ color: 'white' }}>기간선택</Typography>
                <TextField
                  type="date"
                  value={filters.start_date}
                  onChange={(e) => this.handleFilterChange('start_date', e.target.value)}
                  size="small"
                  variant="outlined"
                  sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                />
                <Typography sx={{ color: 'white' }}>~</Typography>
                <TextField
                  type="date"
                  value={filters.end_date}
                  onChange={(e) => this.handleFilterChange('end_date', e.target.value)}
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
              backgroundColor: '#ff8f00',
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
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                label="작업자"
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
                label="품목코드"
                value={filters.itemCode}
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

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                fullWidth
                label="품목명"
                value={filters.itemName}
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

          {/* 확장된 필터 - 화살표 클릭 시 펼쳐지는 추가 검색 필드들 */}
          <Collapse in={filterExpanded} timeout="auto" unmountOnExit>
            {/* 구분선 추가 */}
            <Divider sx={{ my: 2 }} />
            
            <Grid container spacing={2}>
              {/* 설비내역 선택 */}
              <Grid item xs={12} sm={6} md={3}>
                <FormControl size="small" fullWidth>
                  <TextField
                    select
                    label="설비내역"
                    value={filters.equipment_detail}
                    onChange={(e) => this.handleFilterChange('equipment_detail', e.target.value)}
                    size="small"
                    variant="outlined"
                  >
                    {this.state.equipmentTypes.map((equipment) => (
                      <MenuItem key={equipment.설비내역} value={equipment.설비내역}>
                        {equipment.설비내역}
                      </MenuItem>
                    ))}
                  </TextField>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>
        </Paper>

        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            {this.renderBreakdownChart()}
          </Grid>
          <Grid item xs={12} lg={6}>
             {this.renderSelectedMonthDetail()}
          </Grid>
        </Grid>

        {/* 차트들 */}


                        {/* 프레스 작업횟수, 가동시간, 요약정보를 한 줄로 배치 */}
        <Grid container spacing={3}>
           <Grid item xs={12} lg={5}>
             {this.renderWorkCountChart()}
           </Grid>
           <Grid item xs={12} lg={5}>
             {this.renderRuntimeChart()}
           </Grid>
           <Grid item xs={12} lg={2}>
        {this.renderSummaryCards()}
           </Grid>
         </Grid>

                  {/* 금형 세척주기 랭킹 그리드와 분석 차트 */}
         <Grid container spacing={3}>
           <Grid item xs={12} lg={7}>
            {this.renderCleaningRankedGrid()}
          </Grid>
          <Grid item xs={12} lg={5}>
            {this.renderMoldAnalysis()}
          </Grid>
        </Grid>

        {/* 세로 간격 추가 */}
        <Box sx={{ mt: 4 }} />

         {/* 고장점검 설비 순위 Top10 - 맨 아래로 이동 */}
         <Grid container spacing={3}>
           <Grid item xs={12}>
            {this.renderEquipmentRankingChart()}
          </Grid>
        </Grid>



        {/* 에러 메시지 */}
        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

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

export default MoldChart;
