import React, { Component } from 'react';
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
  InputLabel
} from '@mui/material';
import { 
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import s from './ProductionChart.module.scss';
import config from '../../config';

const t = config.app.themeColors;
const primary = '#ffb300';       // 카드 라벨 등에서 쓰는 기본 포인트 색
const info    = t.info;
const success = t.success;
const warning = t.warning;
const danger  = t.danger;

class ProductionChart extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedProduct: 'product1',
      pieChartData: [
        { name: '생산 완료율', value: 85, color: primary },
        { name: '품질 합격률', value: 92, color: success },
        { name: '설비 가동률', value: 78, color: danger },
        { name: '인력 활용률', value: 88, color: info }
      ],
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

  handleProductChange = (event) => {
    this.setState({ selectedProduct: event.target.value });
  }

  renderPieCharts = () => {
    const { pieChartData } = this.state;
    
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
          생산 현황 지표
        </Typography>
        
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
                  
                  <Box sx={{ height: 120, width: '100%', mb: 1 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: data.name, value: data.value },
                            { name: '잔여', value: 100 - data.value }
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
                          formatter={(value, name) => [name === '잔여' ? `${100 - data.value}%` : `${value}%`, name]}
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
                  
                  <Typography variant="h4" component="div" sx={{ 
                    color: data.color, 
                    fontWeight: 700,
                    fontSize: '1.8rem'
                  }}>
                    {data.value}%
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  renderBarChart = () => {
    const { selectedProduct, productData } = this.state;
    const currentProductData = productData[selectedProduct];

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
            월별 생산량을 확인하려면 제품을 선택하세요
          </Typography>
          
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel id="product-select-label">제품 선택</InputLabel>
            <Select
              labelId="product-select-label"
              id="product-select"
              value={selectedProduct}
              label="제품 선택"
              onChange={this.handleProductChange}
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
            >
              <MenuItem value="product1">제품 A</MenuItem>
              <MenuItem value="product2">제품 B</MenuItem>
              <MenuItem value="product3">제품 C</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 3 }}>
          {/* 막대 그래프 */}
          <Box sx={{ flex: 1, height: 350 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentProductData}>
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
                  formatter={(value, name) => [value, '생산량']}
                  labelFormatter={(label) => `${label} 생산량`}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
                <Bar 
                  dataKey="quantity" 
                  fill={warning}
                  radius={[4, 4, 0, 0]}
                  name="생산량"
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
                  총 생산량
                </Typography>
                <Typography variant="h5" component="div" sx={{ 
                  fontWeight: 300,
                  color: '#333',
                  mb: 0.5,
                  fontSize: '1.2rem'
                }}>
                  6,020
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
                  평균 효율성
                </Typography>
                <Typography variant="h5" component="div" sx={{ 
                  fontWeight: 300,
                  color: '#333',
                  mb: 0.5,
                  fontSize: '1.2rem'
                }}>
                  100.3%
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.65rem' }}>
                  목표 대비
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
                  가동률
                </Typography>
                <Typography variant="h5" component="div" sx={{ 
                  fontWeight: 300,
                  color: '#333',
                  mb: 0.5,
                  fontSize: '1.2rem'
                }}>
                  98.5%
                </Typography>
                <Typography variant="body2" sx={{ color: '#999', fontSize: '0.65rem' }}>
                  월 평균
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Paper>
    );
  }

  render() {
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
            생산 데이터 차트
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            생산 현황을 차트로 한눈에 파악할 수 있습니다.
          </Typography>
        </Box>

        {/* 파이차트 섹션 */}
        {this.renderPieCharts()}

        {/* 막대 그래프 섹션 */}
        {this.renderBarChart()}
      </Box>
    );
  }
}

export default ProductionChart;
