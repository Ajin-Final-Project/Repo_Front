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

const API_URL = 'http://localhost:8000/smartFactory/mold_cleaning/chart';

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
      selectedEquipment: '전체',
      workCountData: [],
      runtimeData: [],
      breakdownData: [],
      equipmentRankingData: [],
      loading: false,
      error: null,
      years: [],
      pressTypes: ['1000T', '1500T', '3000T', '1000T PRO'],
      equipmentTypes: ['전체', '프레스', '컨베이어', '로봇', '냉각기', '가열기', '기타']
    };
  }

  componentDidMount() {
    this.generateYearOptions();
    this.generateDateRange();
    this.fetchData();
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
      this.fetchData();
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

  fetchData = async () => {
    this.setState({ loading: true, error: null });
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          year: this.state.selectedYear,
          press: this.state.selectedPress,
          start_date: this.state.startDate,
          end_date: this.state.endDate,
          bar_start_date: this.state.barStartDate,
          bar_end_date: this.state.barEndDate,
          line_start_date: this.state.lineStartDate,
          line_end_date: this.state.lineEndDate,
          breakdown_start_date: this.state.breakdownStartDate,
          breakdown_end_date: this.state.breakdownEndDate,
          equipment: this.state.selectedEquipment
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const json = await response.json();
      this.processChartData(json.data || json);
    } catch (error) {
      console.error('금형세척 차트 데이터 로드 오류:', error);
      // 에러 발생 시 더미 데이터로 표시
      this.setState({
        workCountData: this.generateDummyWorkCountData(),
        runtimeData: this.generateDummyRuntimeData(),
        breakdownData: this.generateDummyBreakdownData(),
        equipmentRankingData: this.generateDummyEquipmentRankingData(),
        error: null
      });
    } finally {
      this.setState({ loading: false });
    }
  }

  processChartData = (data) => {
    if (!data) {
      this.setState({
        workCountData: this.generateDummyWorkCountData(),
        runtimeData: this.generateDummyRuntimeData(),
        breakdownData: this.generateDummyBreakdownData(),
        equipmentRankingData: this.generateDummyEquipmentRankingData()
      });
      return;
    }

    // 실제 API 응답 구조에 맞게 데이터 처리
    // 여기서는 더미 데이터를 사용하지만, 실제 API 응답에 맞게 수정 가능
    this.setState({
      workCountData: this.generateDummyWorkCountData(),
      runtimeData: this.generateDummyRuntimeData(),
      breakdownData: this.generateDummyBreakdownData(),
      equipmentRankingData: this.generateDummyEquipmentRankingData()
    });
  }

  generateDummyWorkCountData = () => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    return months.map((month, index) => ({
      month,
      '1000T': Math.floor(Math.random() * 50) + 20,
      '1500T': Math.floor(Math.random() * 60) + 25,
      '3000T': Math.floor(Math.random() * 40) + 15,
      '1000T PRO': Math.floor(Math.random() * 45) + 18
    }));
  }

  generateDummyRuntimeData = () => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    return months.map((month, index) => ({
      month,
      plannedRuntime: Math.floor(Math.random() * 200) + 400, // 400-600 사이 랜덤 값
      actualRuntime: Math.floor(Math.random() * 200) + 350, // 350-550 사이 랜덤 값
      efficiency: Math.floor(Math.random() * 20) + 80, // 80-100 사이 랜덤 값
      testData :  Math.floor(Math.random() * 30) + 80 
    }));
  }

  generateDummyBreakdownData = () => {
    const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];
    return months.map((month, index) => ({
      month,
      breakdownCount: Math.floor(Math.random() * 15) + 5, // 5-20 사이 랜덤 값
      maintenanceCount: Math.floor(Math.random() * 10) + 3, // 3-13 사이 랜덤 값
      emergencyCount: Math.floor(Math.random() * 8) + 1 // 1-9 사이 랜덤 값
    }));
  }

  generateDummyEquipmentRankingData = () => {
    const equipmentNames = ['프레스 A', '컨베이어 B', '로봇 C', '냉각기 D', '가열기 E', '프레스 F', '컨베이어 G', '로봇 H', '냉각기 I', '가열기 J'];
    return equipmentNames.map((name, index) => ({
      name,
      value: Math.floor(Math.random() * 50) + 20, // 20-70 사이 랜덤 값
      color: `hsl(${index * 36}, 70%, 60%)` // 각각 다른 색상
    }));
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

  renderWorkCountChart = () => {
    const { workCountData, loading, selectedPress, barStartDate, barEndDate } = this.state;

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
        ) : (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workCountData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
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
                  dataKey="1000T" 
                  fill="#4CAF50"
                  radius={[4, 4, 0, 0]}
                  name="1000T"
                />
                <Bar 
                  dataKey="1500T" 
                  fill="#FF5722"
                  radius={[4, 4, 0, 0]}
                  name="1500T"
                />
                <Bar 
                  dataKey="3000T" 
                  fill="#2196F3"
                  radius={[4, 4, 0, 0]}
                  name="3000T"
                />
                <Bar 
                  dataKey="1000T PRO" 
                  fill="#9C27B0"
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
                  <PieChartIcon />
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
                onChange={this.handleLineEndDateChange}
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
        ) : (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={runtimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
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
                  dataKey="plannedRuntime" 
                  stroke="#4CAF50" 
                  strokeWidth={3}
                  name="3000T"
                  dot={{ fill: '#4CAF50', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="actualRuntime" 
                  stroke="#FF9800" 
                  strokeWidth={3}
                  name="2000T"
                  dot={{ fill: '#FF9800', strokeWidth: 2, r: 6 }}
                  activeDot={{ r: 8 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="efficiency" 
                  stroke="#2196F3" 
                  strokeWidth={2}
                  name="1000T"
                  dot={{ fill: '#2196F3', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                  yAxisId={1}
                />
                <Line 
                  type="monotone" 
                  dataKey="testData" 
                  stroke="#f5695a" 
                  strokeWidth={3}
                  name="1500T"
                  dot={{ fill: '#f5695a', strokeWidth: 2, r: 6 }}
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
                  <PieChartIcon />
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
                    <MenuItem key={equipment} value={equipment}>
                      {equipment}
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
        ) : (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={breakdownData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="month" 
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
                  dataKey="breakdownCount" 
                  fill="#FF5722"
                  radius={[4, 4, 0, 0]}
                  name="고장 건수"
                />
                <Bar 
                  dataKey="maintenanceCount" 
                  fill="#FF9800"
                  radius={[4, 4, 0, 0]}
                  name="정비 건수"
                />
                <Bar 
                  dataKey="emergencyCount" 
                  fill="#F44336"
                  radius={[4, 4, 0, 0]}
                  name="긴급 수리"
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
        ) : (
          <Box sx={{ height: 400 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={equipmentRankingData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {equipmentRankingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
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
    const { workCountData, runtimeData, selectedPress, startDate, endDate } = this.state;
    
    if (!workCountData.length || !runtimeData.length) return null;

    // 선택된 프레스의 총 작업횟수 계산
    const totalWorkCount = workCountData.reduce((sum, item) => sum + (item[selectedPress] || 0), 0);
    const totalRuntime = runtimeData.reduce((sum, item) => sum + item.actualRuntime, 0);
    const avgEfficiency = Math.round(runtimeData.reduce((sum, item) => sum + item.efficiency, 0) / runtimeData.length);

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
                  {totalWorkCount.toLocaleString()}
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
                  {totalRuntime.toLocaleString()}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase' }}>
                  평균 가동시간
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
                  100012분
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase' }}>
                  총 가동시간
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
                  100142
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', textTransform: 'uppercase' }}>
                  총  작업횐수
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
