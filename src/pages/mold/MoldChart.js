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
  Cell
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
  Alert
} from '@mui/material';
import { 
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import s from './MoldCleaningChart.module.scss';
import config from '../../config';
// API 엔드포인트들




const API_ENDPOINTS = {
  WORK_COUNT: `${config.baseURLApi}/smartFactory/mold-chart/work-count`,
  RUNTIME: `${config.baseURLApi}/smartFactory/mold-chart/runtime`,
  SUMMARIZE: `${config.baseURLApi}/smartFactory/mold-chart/summarize`,
  BREAKDOWN: `${config.baseURLApi}/smartFactory/mold-chart/breakdown`,
  BREAKDOWN_PIE_TOP10: `${config.baseURLApi}/smartFactory/mold-chart/breakdown-pie-top10`,
  EQUIPMENT_LIST: `${config.baseURLApi}/smartFactory/mold-chart/equipment-list`
};

class MoldChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedYear: new Date().getFullYear(),
      selectedPress: '1000T',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      // 막대 그래프용 날짜
      barStartDate: '2024-01-01',
      barEndDate: '2024-12-31',
      // 선 그래프용 날짜
      lineStartDate: '2024-01-01',
      lineEndDate: '2024-12-31',
      // 고장 건수 차트용 날짜
      breakdownStartDate: '2024-01-01',
      breakdownEndDate: '2024-12-31',
      // 설비내역 드롭다운
      selectedEquipment: '',
      workCountData: [],
      runtimeData: [],
      breakdownData: [],
      equipmentRankingData: [],
      summaryData: {},
      loading: false,
      error: null,
      years: [],
      pressTypes: ['1000T', '1200T', '1500T', '1000T PRO'],
      equipmentTypes: []
    };
  }

  componentDidMount() {
    this.generateYearOptions();
    this.generateDateRange();
    this.fetchAllData();
    this.fetchEquipmentList();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedYear !== this.state.selectedYear || 
        prevState.selectedPress !== this.state.selectedPress ||
        prevState.startDate !== this.state.startDate ||
        prevState.endDate !== this.state.endDate ||
        prevState.barStartDate !== this.state.barStartDate ||
        prevState.barEndDate !== this.state.barEndDate ||
        prevState.lineStartDate !== this.state.lineStartDate ||
        prevState.lineEndDate !== this.state.lineEndDate ||
        prevState.breakdownStartDate !== this.state.breakdownStartDate ||
        prevState.breakdownEndDate !== this.state.breakdownEndDate ||
        prevState.selectedEquipment !== this.state.selectedEquipment) {
      this.fetchAllData();
    }
  }

  generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear - 5; year <= currentYear + 1; year++) {
      years.push(year);
    }
    this.setState({ years });
  }

  generateDateRange = () => {
    const selectedYear = this.state.selectedYear;
    const startDate = `${selectedYear}-01-01`;
    const endDate = `${selectedYear}-12-31`;
    this.setState({ 
      startDate, 
      endDate,
      barStartDate: startDate,
      barEndDate: endDate,
      lineStartDate: startDate,
      lineEndDate: endDate,
      breakdownStartDate: startDate,
      breakdownEndDate: endDate
    });
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
        this.fetchEquipmentRankingData()
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
          start_date: this.state.barStartDate,
          end_date: this.state.barEndDate
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
          start_date: this.state.lineStartDate,
          end_date: this.state.lineEndDate
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
          equipment_detail: this.state.selectedPress,
          start_date: this.state.startDate,
          end_date: this.state.endDate
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
          equipment_detail: this.state.selectedEquipment,
          start_date: this.state.breakdownStartDate,
          end_date: this.state.breakdownEndDate
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

  // 고장점검 설비 순위 top10 데이터 가져오기
  fetchEquipmentRankingData = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.BREAKDOWN_PIE_TOP10, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_date: this.state.breakdownStartDate,
          end_date: this.state.breakdownEndDate
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
        selectedEquipment: '전체' // 기본값으로 '전체' 설정
      });
    } catch (error) {
      console.error('설비 목록 데이터 로드 오류:', error);
      this.setState({ 
        equipmentTypes: [{ 설비내역: '전체' }],
        selectedEquipment: '전체'
      });
    }
  }

  handleYearChange = (event) => {
    const newYear = event.target.value;
    this.setState({ selectedYear: newYear }, () => {
      this.generateDateRange();
    });
  }

  handlePressChange = (event) => {
    this.setState({ selectedPress: event.target.value });
  }

  handleStartDateChange = (event) => {
    this.setState({ startDate: event.target.value });
  }

  handleEndDateChange = (event) => {
    this.setState({ endDate: event.target.value });
  }

  handleBarStartDateChange = (event) => {
    this.setState({ barStartDate: event.target.value });
  }

  handleBarEndDateChange = (event) => {
    this.setState({ barEndDate: event.target.value });
  }

  handleLineStartDateChange = (event) => {
    this.setState({ lineStartDate: event.target.value });
  }

  handleLineEndDateChange = (event) => {
    this.setState({ lineEndDate: event.target.value });
  }

  handleBreakdownStartDateChange = (event) => {
    this.setState({ breakdownStartDate: event.target.value });
  }

  handleBreakdownEndDateChange = (event) => {
    this.setState({ breakdownEndDate: event.target.value });
  }

  handleEquipmentChange = (event) => {
    this.setState({ selectedEquipment: event.target.value });
  }

  // 데이터 키를 표시 이름으로 변환하는 헬퍼 메서드
  getDataKeyDisplayName = (dataKey) => {
    const displayNames = {
      'plannedRuntime': '계획 가동시간',
      'actualRuntime': '실제 가동시간',
      'efficiency': '효율성',
      'workCount': '작업횟수',
      'breakdownCount': '고장 건수',
      'maintenanceCount': '정비 건수',
      'emergencyCount': '긴급 수리',
      '1000T': '1000T',
      '1500T': '1500T',
      '3000T': '3000T',
      '1000T PRO': '1000T PRO',
      'sum_1000T': '1000T',
      'sum_1500T': '1500T',
      'sum_1200T': '1200T',
      'sum_1000T_PRO': '1000T PRO',
      '월': '월'
    };
    
    return displayNames[dataKey] || dataKey;
  }

  renderWorkCountChart = () => {
    const { workCountData, loading, barStartDate, barEndDate } = this.state;

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

        {/* 막대 그래프용 날짜 선택 */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                프레스 작업횟수 기간:
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="시작일"
                value={barStartDate}
                onChange={this.handleBarStartDateChange}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ff8f00',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8f00',
                    },
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                ~
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="종료일"
                value={barEndDate}
                onChange={this.handleBarEndDateChange}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ff8f00',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8f00',
                    },
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

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
              콘솔에서 API 응답을 확인해주세요.
            </Typography>
          </Box>
        ) : (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workCountData}>
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
                <Bar 
                  dataKey="sum_1000T" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  name="1000T"
                />
                <Bar 
                  dataKey="sum_1200T" 
                  fill="#82ca9d"
                  radius={[4, 4, 0, 0]}
                  name="1200T"
                />
                <Bar 
                  dataKey="sum_1500T" 
                  fill="#ffc658"
                  radius={[4, 4, 0, 0]}
                  name="1500T"
                />
                <Bar 
                  dataKey="sum_1000T_PRO" 
                  fill="#ff7300"
                  radius={[4, 4, 0, 0]}
                  name="1000T PRO"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  }

  renderRuntimeChart = () => {
    const { runtimeData, loading, lineStartDate, lineEndDate } = this.state;

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

        {/* 선 그래프용 날짜 선택 */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                가동시간 기간:
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="시작일"
                value={lineStartDate}
                onChange={this.handleLineStartDateChange}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ff8f00',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8f00',
                    },
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                ~
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="종료일"
                value={lineEndDate}
                onChange={this.handleLineStartDateChange}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ff8f00',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8f00',
                    },
                  }
                }}
              />
            </Grid>           
          </Grid>
        </Box>

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
                <Line 
                  type="monotone" 
                  dataKey="1000T" 
                  stroke="#8884d8"
                  strokeWidth={3}
                  name="1000T"
                  dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="1200T" 
                  stroke="#82ca9d"
                  strokeWidth={3}
                  name="1200T"
                  dot={{ fill: '#82ca9d', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="1500T" 
                  stroke="#ffc658"
                  strokeWidth={3}
                  name="1500T"
                  dot={{ fill: '#ffc658', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="1000T PRO" 
                  stroke="#ff7300"
                  strokeWidth={3}
                  name="1000T PRO"
                  dot={{ fill: '#ff7300', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  }

  renderBreakdownChart = () => {
    const { breakdownData, loading, breakdownStartDate, breakdownEndDate, selectedEquipment } = this.state;

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
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

        {/* 고장 건수 차트용 날짜 선택 및 설비 선택 */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={2}>
              <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                설비내역:
              </Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <FormControl size="small" fullWidth>
                <Select
                  value={selectedEquipment}
                  onChange={this.handleEquipmentChange}
                  sx={{
                    backgroundColor: 'white',
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: '#ff8f00',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff8f00',
                      },
                    }
                  }}
                >
                  {this.state.equipmentTypes.map((equipment) => (
                    <MenuItem key={equipment.설비내역} value={equipment.설비내역}>
                      {equipment.설비내역}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={1}>
              <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                기간:
              </Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                type="date"
                label="시작일"
                value={breakdownStartDate}
                onChange={this.handleBreakdownStartDateChange}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ff8f00',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8f00',
                    },
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                ~
              </Typography>
            </Grid>
            <Grid item xs={12} sm={2}>
              <TextField
                type="date"
                label="종료일"
                value={breakdownEndDate}
                onChange={this.handleBreakdownEndDateChange}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ff8f00',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8f00',
                    },
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

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
              <BarChart data={breakdownData}>
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
                <Bar 
                  dataKey="고장건수" 
                  fill="#8884d8"
                  radius={[4, 4, 0, 0]}
                  name="고장 건수"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        )}
      </Paper>
    );
  }

  renderEquipmentRankingChart = () => {
    const { equipmentRankingData, loading, breakdownStartDate, breakdownEndDate } = this.state;

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

        {/* 설비 순위 차트용 날짜 선택 */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <Typography variant="body2" sx={{ color: '#333', fontWeight: 600 }}>
                설비 순위 기간:
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="시작일"
                value={breakdownStartDate}
                onChange={this.handleBreakdownStartDateChange}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ff8f00',
                    },
                    '&:focus fieldset': {
                      borderColor: '#ff8f00',
                    },
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Typography variant="body2" sx={{ color: '#666', textAlign: 'center' }}>
                ~
              </Typography>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                type="date"
                label="종료일"
                value={breakdownEndDate}
                onChange={this.handleBreakdownEndDateChange}
                size="small"
                fullWidth
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ff8f00',
                    },
                    '&:focus fieldset': {
                      borderColor: '#ff8f00',
                    },
                  }
                }}
              />
            </Grid>
          </Grid>
        </Box>

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

  renderSummaryCards = () => {
    const { summaryData, selectedPress, startDate, endDate } = this.state;
    
    // summaryData가 배열인 경우 첫 번째 요소를 사용
    const data = Array.isArray(summaryData) && summaryData.length > 0 ? summaryData[0] : summaryData;
    
    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  color: '#ffb300',
                  mb: 2
                }}>
                  <ScheduleIcon />
                  프레스 요약정보
                </Typography>
        {/* 프레스 선택 및 기간 선택 */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <Typography variant="body2" sx={{ mb: 1, color: '#333', fontWeight: 600 }}>
                프레스 선택:
              </Typography>
              <Select
                value={selectedPress}
                onChange={this.handlePressChange}
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#ff8f00',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#ff8f00',
                    },
                  }
                }}
              >
                {this.state.pressTypes.map((press) => (
                  <MenuItem key={press} value={press}>
                    {press}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ mb: 1, color: '#333', fontWeight: 600 }}>
              시작일:
            </Typography>
            <TextField
              type="date"
              value={startDate}
              onChange={this.handleStartDateChange}
              size="small"
              fullWidth
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#ff8f00',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff8f00',
                  },
                }
              }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="body2" sx={{ mb: 1, color: '#333', fontWeight: 600 }}>
              종료일:
            </Typography>
            <TextField
              type="date"
              value={endDate}
              onChange={this.handleEndDateChange}
              size="small"
              fullWidth
              sx={{
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#ff8f00',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#ff8f00',
                  },
                }
              }}
            />
          </Grid>
        </Grid>

        {/* 요약 카드들 */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ color: '#4CAF50', fontWeight: 'bold', mb: 1 }}>
                  {data.avg_작업횟수 ? Math.round(data.avg_작업횟수).toLocaleString() : 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase' }}>
                  {selectedPress} 평균 작업횟수
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ color: '#FF9800', fontWeight: 'bold', mb: 1 }}>
                  {data.avg_가동시간 ? Math.round(data.avg_가동시간).toLocaleString() : 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase' }}>
                  평균 가동시간 (분)
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ color: '#2196F3', fontWeight: 'bold', mb: 1 }}>
                  {data.sum_작업횟수 ? data.sum_작업횟수.toLocaleString() : 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase' }}>
                  총 작업횟수
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={2} sx={{ 
              borderRadius: 2,
              '&:hover': {
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="h4" sx={{ color: '#9C27B0', fontWeight: 'bold', mb: 1 }}>
                  {data.sum_가동시간 ? Math.round(data.sum_가동시간).toLocaleString() : 0}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase' }}>
                  총 가동시간 (분)
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  render() {
    const { selectedYear, years, error } = this.state;

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

       
        {/* 차트들 */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            {this.renderWorkCountChart()}
          </Grid>
          <Grid item xs={12} lg={6}>
            {this.renderRuntimeChart()}
          </Grid>
        </Grid>

        {/* 요약 카드들 (그래프 밑에 배치) */}
        {this.renderSummaryCards()}

        {/* 하단 차트들 */}
        <Grid container spacing={3}>
          <Grid item xs={12} lg={6}>
            {this.renderBreakdownChart()}
          </Grid>
          <Grid item xs={12} lg={6}>
            {this.renderEquipmentRankingChart()}
          </Grid>
        </Grid>

        {/* 에러 메시지 */}
        {error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}
      </Box>
    );
  }
}

export default MoldChart;
