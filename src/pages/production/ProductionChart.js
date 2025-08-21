import React, { Component } from 'react';
import { connect } from "react-redux";

import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
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
  InputLabel,
  TextField
} from '@mui/material';
import { 
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import s from './ProductionChart.module.scss';
import config from '../../config';

import { selectThemeHex, selectThemeKey } from '../../reducers/layout'; // 리덕스에서 색상 상태 불러옴

const t = config.app.themeColors;
const primary = '#ffb300';       // 카드 라벨 등에서 쓰는 기본 포인트 색
const info    = t.info;
const success = t.success;
const warning = t.warning;
const danger  = t.danger;


function mapStateToProps(state) {
  return {
    themeHex: selectThemeHex(state),
    themeKey: selectThemeKey(state), 
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
      loading: false,
      itemList: [],
      productData: {
        product1: [
          { month: '1월', quantity: 1200 },
          { month: '2월', quantity: 1350 },
          { month: '3월', quantity: 1100 },
          { month: '4월', quantity: 1400 },
          { month: '5월', quantity: 1250 },
          { month: '6월', quantity: 1300 }
        ],
        product2: [
          { month: '1월', quantity: 800 },
          { month: '2월', quantity: 950 },
          { month: '3월', quantity: 900 },
          { month: '4월', quantity: 1000 },
          { month: '5월', quantity: 850 },
          { month: '6월', quantity: 920 }
        ],
        product3: [
          { month: '1월', quantity: 600 },
          { month: '2월', quantity: 750 },
          { month: '3월', quantity: 700 },
          { month: '4월', quantity: 800 },
          { month: '5월', quantity: 650 },
          { month: '6월', quantity: 720 }
        ]
      }
    };
  }

  componentDidMount() {
    this.fetchItemList();
    this.fetchProductionData();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.startDate !== this.state.startDate || 
        prevState.endDate !== this.state.endDate || 
        prevState.selectedCapacity !== this.state.selectedCapacity ||
        prevState.selectedProduct !== this.state.selectedProduct) {
      this.fetchProductionData();
      this.fetchBarChartData();
    }
  }

  fetchItemList = async () => {
    try {
      const response = await fetch('http://localhost:8000/smartFactory/production_chart/item_list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      
      if (result.message === "production item list 조회 성공") {
        // null이 아닌 자재명만 필터링하고 첫 번째 항목을 기본값으로 설정
        const validItems = result.data.filter(item => item.자재명 !== null);
        this.setState({ 
          itemList: validItems,
          selectedProduct: validItems.length > 0 ? validItems[0].자재명 : ''
        });
      }
    } catch (error) {
      console.error('Error fetching item list:', error);
      // 에러 발생 시 기본 자재 목록으로 설정
      this.setState({
        itemList: [
          { 자재명: '제품 A' },
          { 자재명: '제품 B' },
          { 자재명: '제품 C' }
        ],
        selectedProduct: '제품 A'
      });
    }
  }

  fetchProductionData = async () => {
    this.setState({ loading: true });
    
    try {
      const response = await fetch('http://localhost:8000/smartFactory/production_chart/pie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_work_date: this.state.startDate,
          end_work_date: this.state.endDate,
          workplace: this.state.selectedCapacity
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      
      if (result.message === "production 테이블 조회 성공") {
        this.processChartData(result.data);
      }
    } catch (error) {
      console.error('Error fetching production data:', error);
      // 에러 발생 시 기본 데이터로 설정
      this.setState({
        pieChartData: [
          { name: '생산 완료율', value: 0, color: primary, type: 'product_rate' },
          { name: '품질 합격률', value: 0, color: success, type: '생산비율' },
          { name: '완료 수량', value: 0, color: info, type: 'sum_complete_count' },
          { name: '가동 시간', value: 0, color: warning, type: 'sum_runtime' }
        ]
      });
    } finally {
      this.setState({ loading: false });
    }
  }

  fetchBarChartData = async () => {
    if (!this.state.selectedProduct) return;
    
    try {
      const response = await fetch('http://localhost:8000/smartFactory/production_chart/bar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          start_work_date: this.state.startDate,
          itemName: this.state.selectedProduct,
          end_work_date: this.state.endDate
        })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();

      if (result.message === "production 테이블 조회 성공") {
        this.processBarChartData(result.data);
      }
    } catch (error) {
      console.error('Error fetching bar chart data:', error);
      // 에러 발생 시 기본 데이터로 설정
      this.setState({
        barChartData: []
      });
    }
  }

  processChartData = (data) => {
    const newPieChartData = [];
    
    // 첫 번째 파이차트: product_rate (노란색)
    if (data.pie1 && data.pie1.length > 0) {
      const productRate = data.pie1[0].product_rate * 100;
      newPieChartData.push({
        name: '생산 완료율',
        value: Math.round(productRate * 100) / 100,
        color: primary,
        type: 'product_rate',
        rawValue: data.pie1[0].sum_production_count
      });
    }
    
    // 두 번째 파이차트: 생산비율 (민트색)
    if (data.pie2 && data.pie2.length > 0) {
      const productionRate = data.pie2[0].생산비율 * 100;
      newPieChartData.push({
        name: '품질 합격률',
        value: Math.round(productionRate * 100) / 100,
        color: success,
        type: '생산비율',
        rawValue: data.pie2[0].sum_complete_count
      });
    }
    
    // 세 번째 파이차트: sum_complete_count (빨간색)
    if (data.pie3 && data.pie3.length > 0) {
      newPieChartData.push({
        name: '완료 수량',
        value: data.pie3[0].sum_complete_count,
        color: danger,
        type: 'sum_complete_count',
        rawValue: data.pie3[0].sum_complete_count
      });
    }
    
    // 네 번째 파이차트: sum_runtime (파란색)
    if (data.pie3 && data.pie3.length > 0) {
      newPieChartData.push({
        name: '가동 시간',
        value: data.pie3[0].sum_runtime,
        color: info,
        type: 'sum_runtime',
        rawValue: data.pie3[0].sum_runtime
      });
    }

    this.setState({ pieChartData: newPieChartData });
  }

  processBarChartData = (data) => {
    // 막대그래프용 데이터 변환
    const chartData = data.map(item => ({
      month: `${item.월}월`,
      quantity: item.월별_양품수량,
      year: item.년도
    }));

    // 요약 데이터 계산
    const summaryData = {
      totalProduction: data.length > 0 ? data[0].총_생산수량 : 0,
      totalDefect: data.length > 0 ? data[0].총_공정불량 : 0,
      totalRuntime: data.length > 0 ? data[0].총_가동시간 : 0
    };

    this.setState({ 
      barChartData: chartData,
      summaryData: summaryData
    });
  }

  handleProductChange = (event) => {
    this.setState({ selectedProduct: event.target.value });
  }

  handleCapacityChange = (event) => {
    this.setState({ selectedCapacity: event.target.value });
  }

  handleStartDateChange = (event) => {
    this.setState({ startDate: event.target.value });
  }

  handleEndDateChange = (event) => {
    this.setState({ endDate: event.target.value });
  }

  renderPieCharts = (themeHex) => {
    const { pieChartData, selectedCapacity, startDate, endDate, loading } = this.state;

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: themeHex,
          mb: 2
        }}>
          <PieChartIcon />
          생산 현황 지표
        </Typography>
        
        {/* 필터 섹션 추가 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          p: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ 
              fontWeight: 500,
              color: '#333',
              minWidth: '80px'
            }}>
              프레스 선택:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <Select
                value={selectedCapacity}
                onChange={this.handleCapacityChange}
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#4CAF50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4CAF50',
                    },
                  }
                }}
              >
                <MenuItem value="1500T">1500T</MenuItem>
                <MenuItem value="1000T">1000T</MenuItem>
                <MenuItem value="2000T">2000T</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ 
              fontWeight: 500,
              color: '#333',
              minWidth: '80px'
            }}>
              기간 선택:
            </Typography>
            <TextField
              type="date"
              value={startDate}
              onChange={this.handleStartDateChange}
              size="small"
              sx={{ 
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#4CAF50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4CAF50',
                  },
                }
              }}
            />
            <Typography variant="body2" sx={{ color: '#666' }}>
              ~
            </Typography>
            <TextField
              type="date"
              value={endDate}
              onChange={this.handleEndDateChange}
              size="small"
              sx={{ 
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#4CAF50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4CAF50',
                  },
                }
              }}
            />
          </Box>
        </Box>
        
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary">
              데이터를 불러오는 중...
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {pieChartData.map((data, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card elevation={1} sx={{ 
                  height: '100%',
                  border: `1px solid ${data.color}20`,
                  borderRadius: 2,
                  '&:hover': {
                    elevation: 2,
                    transform: 'translateY(-1px)',
                    transition: 'all 0.2s ease-in-out'
                  }
                }}>
                  <CardContent sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ 
                      color: data.color, 
                      fontWeight: 600,
                      mb: 1,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      fontSize: '0.8rem'
                    }}>
                      {data.name}
                    </Typography>
                    
                    {/* 파이차트는 첫 번째와 두 번째만 표시 */}
                    {index < 2 ? (
                      <Box sx={{ height: 120, width: '100%', mb: 1 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: data.name, value: data.value },
                                { name: '잔여', value: index === 0 ? 100 - data.value : 100 - data.value }
                              ]}
                              cx="50%"
                              cy="50%"
                              innerRadius={25}
                              outerRadius={45}
                              paddingAngle={1}
                              dataKey="value"
                            >
                              <Cell key={`cell-${index}`} fill={data.color} />
                              <Cell key={`cell-remainder-${index}`} fill="#f8f9fa" />
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [name === '잔여' ? `${index === 0 ? 100 - data.value : 100 - data.value}%` : `${value}%`, name]}
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
                    ) : (
                      <Box sx={{ height: 120, width: '100%', mb: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="h3" sx={{ color: data.color, fontWeight: 'bold' }}>
                          {index === 2 ? '📊' : '⏱️'}
                        </Typography>
                      </Box>
                    )}
                    
                    <Typography variant="h4" component="div" sx={{ 
                      color: data.color, 
                      fontWeight: 700,
                      fontSize: '1.8rem'
                    }}>
                      {index < 2 ? `${data.value}%` : data.value.toLocaleString()}
                    </Typography>
                    
                    {index >= 2 && (
                      <Typography variant="body2" sx={{ 
                        color: '#666', 
                        fontSize: '0.7rem',
                        mt: 0.5
                      }}>
                        {index === 2 ? '개' : '시간'}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>
    );
  }

  renderBarChart = (themeHex) => {
    const { selectedProduct, barChartData, itemList, startDate, endDate, summaryData } = this.state;

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          color: themeHex,
          mb: 2
        }}>
          <BarChartIcon />
          제품별 월간 생산량
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Typography variant="body1" sx={{ 
            fontWeight: 500,
            color: '#333'
          }}>
            월별 생산량을 확인하려면 자재를 선택하세요
          </Typography>
        </Box>
        
        {/* 자재 선택 섹션 추가 */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3,
          p: 2,
          backgroundColor: '#f8f9fa',
          borderRadius: 2,
          border: '1px solid #e0e0e0'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ 
              fontWeight: 500,
              color: '#333',
              minWidth: '80px'
            }}>
              자재 선택:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 300 }}>
              <Select
                value={selectedProduct}
                onChange={this.handleProductChange}
                sx={{ 
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#4CAF50',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#4CAF50',
                    },
                  }
                }}
              >
                {itemList.map((item, index) => (
                  <MenuItem key={index} value={item.자재명}>
                    {item.자재명}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" sx={{ 
              fontWeight: 500,
              color: '#333',
              minWidth: '80px'
            }}>
              기간 선택:
            </Typography>
            <TextField
              type="date"
              value={startDate}
              onChange={this.handleStartDateChange}
              size="small"
              sx={{ 
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#4CAF50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4CAF50',
                  },
                }
              }}
            />
            <Typography variant="body2" sx={{ color: '#666' }}>
              ~
            </Typography>
            <TextField
              type="date"
              value={endDate}
              onChange={this.handleEndDateChange}
              size="small"
              sx={{ 
                backgroundColor: 'white',
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': {
                    borderColor: '#4CAF50',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#4CAF50',
                  },
                }
              }}
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* 막대 그래프 */}
          <Box sx={{ flex: 1, height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
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
                  formatter={(value, name) => [value, '양품수량']}
                  labelFormatter={(label) => `${label} 양품수량`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="quantity" 
                  fill={themeHex}
                  radius={[4, 4, 0, 0]}
                  name="양품수량"
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
          
          {/* 요약 카드들 */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, minWidth: 160 }}>
            <Card elevation={1} sx={{ 
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              '&:hover': {
                elevation: 2,
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                <Typography variant="body2" sx={{ 
                  color: '#666',
                  mb: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.7rem'
                }}>
                  총 생산수량
                </Typography>
                <Typography variant="h5" component="div" sx={{ 
                  fontWeight: 300,
                  color: '#333',
                  mb: 0.5,
                  fontSize: '1.2rem'
                }}>
                  {summaryData ? summaryData.totalProduction.toLocaleString() : '0'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.65rem' }}>
                  개
                </Typography>
              </CardContent>
            </Card>
            
            <Card elevation={1} sx={{ 
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              '&:hover': {
                elevation: 2,
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                <Typography variant="body2" sx={{ 
                  color: '#666',
                  mb: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.7rem'
                }}>
                  총 공정불량
                </Typography>
                <Typography variant="h5" component="div" sx={{ 
                  fontWeight: 300,
                  color: '#333',
                  mb: 0.5,
                  fontSize: '1.2rem'
                }}>
                  {summaryData ? summaryData.totalDefect.toLocaleString() : '0'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.65rem' }}>
                  개
                </Typography>
              </CardContent>
            </Card>
            
            <Card elevation={1} sx={{ 
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              '&:hover': {
                elevation: 2,
                transform: 'translateY(-1px)',
                transition: 'all 0.2s ease-in-out'
              }
            }}>
              <CardContent sx={{ textAlign: 'center', p: 1.5 }}>
                <Typography variant="body2" sx={{ 
                  color: '#666',
                  mb: 0.5,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.7rem'
                }}>
                  총 가동시간
                </Typography>
                <Typography variant="h5" component="div" sx={{ 
                  fontWeight: 300,
                  color: '#333',
                  mb: 0.5,
                  fontSize: '1.2rem'
                }}>
                  {summaryData ? summaryData.totalRuntime.toLocaleString() : '0'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.65rem' }}>
                  시간
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>
    );
  }

  render() {
    const { themeHex } = this.props; 

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
            color: themeHex,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <TrendingUpIcon />
            생산 데이터 차트
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            생산 현황을 차트로 한눈에 파악할 수 있습니다.
          </Typography>
        </Box>

        {/* 파이차트 섹션 */}
        {this.renderPieCharts(themeHex)}

        {/* 막대 그래프 섹션 */}
        {this.renderBarChart(themeHex)}
      </Box>
    );
  }
}

export default connect(mapStateToProps)(ProductionChart);