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
  Select,
  MenuItem,
  FormControl,
  TextField,
  CircularProgress
} from '@mui/material';
import {
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon,
  Monitor as MonitorIcon
} from '@mui/icons-material';
import s from './ProductionChart.module.scss';
import config from '../../config';

import { selectThemeHex, selectThemeKey } from '../../reducers/layout';

const t = config.app.themeColors;
const primary = '#ffb300';
const info = t.info;
const success = t.success;
const warning = t.warning;
const danger = t.danger;
const API_BASE = process.env.REACT_APP_API_BASE;

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
    };
    this.liveChartInterval = null;
    this.dataAnimationInterval = null;
  }

  componentDidMount() {
    this.fetchItemList();
    this.fetchProductionData();
    this.fetchBarChartData();
    this.fetchLiveChartData();
    this.liveChartInterval = setInterval(() => {
      if (!this.isAnimating) this.fetchLiveChartData();
    }, 1000000000);
  }

  componentWillUnmount() {
    if (this.liveChartInterval) clearInterval(this.liveChartInterval);
    if (this.dataAnimationInterval) clearInterval(this.dataAnimationInterval);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.startDate !== this.state.startDate ||
      prevState.endDate !== this.state.endDate ||
      prevState.selectedCapacity !== this.state.selectedCapacity ||
      prevState.selectedProduct !== this.state.selectedProduct
    ) {
      this.fetchProductionData();
      this.fetchBarChartData();
    }
  }

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
          start_work_date: this.state.startDate,
          end_work_date: this.state.endDate,
          workplace: this.state.selectedCapacity
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
    if (!this.state.selectedProduct) return;
    try {
      const response = await fetch(`${API_BASE}/smartFactory/production_chart/bar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_work_date: this.state.startDate,
          itemName: this.state.selectedProduct,
          end_work_date: this.state.endDate
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
  fetchLiveChartData = async () => {
    try {
      const response = await fetch(`${API_BASE}/smartFactory/production_chart/live-chart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start_date: this.state.startDate, end_date: this.state.endDate })
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const result = await response.json();
      if (result.message === 'productionGrid live list 조회 성공' && result.data) {
        const chartData = result.data.map((item) => ({
          date: item.근무일자,
          production: parseInt(item['sum(생산수량)']) || 0
        }));
        this.setState({
          liveChartData: chartData,
          liveLoading: false,
          currentDataIndex: 0,
          displayData: []
        });
        this.startDataAnimation(chartData);
      } else {
        throw new Error('API 응답 형식이 올바르지 않습니다.');
      }
    } catch (error) {
      const defaultData = [
        { date: '2024-01-01', production: 15000 },
        { date: '2024-01-02', production: 18000 },
        { date: '2024-01-03', production: 22000 },
        { date: '2024-01-04', production: 19000 },
        { date: '2024-01-05', production: 25000 },
        { date: '2024-01-06', production: 21000 },
        { date: '2024-01-07', production: 28000 }
      ];
      this.setState({
        liveChartData: defaultData,
        liveLoading: false,
        currentDataIndex: 0,
        displayData: []
      });
      this.startDataAnimation(defaultData);
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

  renderPieCharts = (themeHex) => {
    const { pieChartData, selectedCapacity, startDate, endDate, loading } = this.state;

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

        {/* 필터 섹션 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', minWidth: '80px' }}>프레스 선택:</Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select value={selectedCapacity} onChange={this.handleCapacityChange} sx={{ backgroundColor: 'white', '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#4CAF50' }, '&.Mui-focused fieldset': { borderColor: '#4CAF50' } } }}>
                <MenuItem value="1500T">1500T</MenuItem>
                <MenuItem value="1200T">1200T</MenuItem>
                <MenuItem value="1000T">1000T</MenuItem>
                <MenuItem value="1000T PRO">1000T PRO</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', minWidth: '80px' }}>기간 선택:</Typography>
            <TextField type="date" value={startDate} onChange={this.handleStartDateChange} size="small" sx={{ backgroundColor: 'white', '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#4CAF50' }, '&.Mui-focused fieldset': { borderColor: '#4CAF50' } } }} />
            <Typography variant="body2" sx={{ color: '#666' }}>~</Typography>
            <TextField type="date" value={endDate} onChange={this.handleEndDateChange} size="small" sx={{ backgroundColor: 'white', '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#4CAF50' }, '&.Mui-focused fieldset': { borderColor: '#4CAF50' } } }} />
          </Box>
        </Box>

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
                    {index < 2 ? `${toPercent(data.value)}%` : Number(data.value || 0).toLocaleString()}
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
    const { selectedProduct, barChartData, itemList, startDate, endDate, summaryData } = this.state;

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2 }}>
          <BarChartIcon /> 제품별 월간 생산량
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 500, color: '#333' }}>월별 생산량을 확인하려면 자재를 선택하세요</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', minWidth: '80px' }}>자재 선택:</Typography>
            <FormControl size="small" sx={{ minWidth: 300 }}>
              <Select value={selectedProduct} onChange={this.handleProductChange} sx={{ backgroundColor: 'white', '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#4CAF50' }, '&.Mui-focused fieldset': { borderColor: '#4CAF50' } } }}>
                {itemList.map((item, index) => (
                  <MenuItem key={index} value={item.자재명}>{item.자재명}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ fontWeight: 500, color: '#333', minWidth: '80px' }}>기간 선택:</Typography>
            <TextField type="date" value={startDate} onChange={this.handleStartDateChange} size="small" sx={{ backgroundColor: 'white', '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#4CAF50' }, '&.Mui-focused fieldset': { borderColor: '#4CAF50' } } }} />
            <Typography variant="body2" sx={{ color: '#666' }}>~</Typography>
            <TextField type="date" value={endDate} onChange={this.handleEndDateChange} size="small" sx={{ backgroundColor: 'white', '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: '#4CAF50' }, '&.Mui-focused fieldset': { borderColor: '#4CAF50' } } }} />
          </Box>
        </Box>

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

  renderLiveChart = (themeHex) => {
    const { liveLoading, displayData, currentDataIndex } = this.state;

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2, background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)', border: `2px solid ${themeHex}20` }}>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: themeHex, mb: 2, fontSize: '1.3rem', fontWeight: 'bold' }}>
          <MonitorIcon sx={{ fontSize: '1.5rem' }} /> 실시간 생산량 모니터링
        </Typography>

        <Box sx={{ height: 400, backgroundColor: '#f8f9fa', borderRadius: 2, border: `1px solid ${themeHex}30`, position: 'relative' }}>
          {liveLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
            </Box>
          ) : displayData && displayData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={displayData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorProduction" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={themeHex} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={themeHex} stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} tickFormatter={(value) => { const date = new Date(value); return `${date.getMonth() + 1}/${date.getDate()}`; }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#666' }} tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`} />
                <Tooltip formatter={(value) => [Number(value).toLocaleString(), '생산량']} labelFormatter={(label) => `날짜: ${label}` } contentStyle={{ backgroundColor: 'white', border: `2px solid ${themeHex}`, borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="production" stroke={themeHex} strokeWidth={3} fill="url(#colorProduction)" name="생산량" animationDuration={300} animationBegin={0} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
             <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
              <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
            </Box>
          )}
        </Box>

        {/* 하단 통계 정보 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2, border: `1px solid ${themeHex}20` }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>총 데이터 포인트</Typography>
            <Typography variant="h6" sx={{ color: themeHex, fontWeight: 'bold' }}>{displayData ? displayData.length : 0}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>최고 생산량</Typography>
            <Typography variant="h6" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>{displayData && displayData.length > 0 ? Math.max(...displayData.map((d) => d.production)).toLocaleString() : '0'}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>평균 생산량</Typography>
            <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 'bold' }}>{displayData && displayData.length > 0 ? Math.round(displayData.reduce((sum, d) => sum + d.production, 0) / displayData.length).toLocaleString() : '0'}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>현재 인덱스</Typography>
            <Typography variant="h6" sx={{ color: '#9C27B0', fontWeight: 'bold' }}>{currentDataIndex + 1}</Typography>
          </Box>
        </Box>
      </Paper>
    );
  };

  // 데이터 애니메이션(라이브영역만 사용)
  startDataAnimation = (data) => {
    if (this.dataAnimationInterval) clearInterval(this.dataAnimationInterval);
    this.dataAnimationInterval = setInterval(() => {
      this.setState((prevState) => {
        if (prevState.displayData.length >= data.length) {
          clearInterval(this.dataAnimationInterval);
          return prevState;
        }
        const newIndex = prevState.currentDataIndex + 1;
        const newDisplayData = [...prevState.displayData];
        newDisplayData.push(data[prevState.currentDataIndex]);
        return { currentDataIndex: newIndex, displayData: newDisplayData };
      });
    }, 500);
  };

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

        {/* 실시간 생산량 차트 */}
        {this.renderLiveChart(themeHex)}
        {/* 파이차트 */}
        {this.renderPieCharts(themeHex)}
        {/* 막대 그래프 */}
        {this.renderBarChart(themeHex)}
      </Box>
    );
  }
}

export default connect(mapStateToProps)(ProductionChart);
