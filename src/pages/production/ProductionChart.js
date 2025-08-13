import React from 'react';
import s from './ProductionChart.module.scss';

const ProductionChart = () => {
  // 생산 데이터 차트용 더미 데이터
  const productionData = [
    { month: '1월', target: 1000, actual: 950, efficiency: 95 },
    { month: '2월', target: 1000, actual: 1020, efficiency: 102 },
    { month: '3월', target: 1000, actual: 980, efficiency: 98 },
    { month: '4월', target: 1000, actual: 1050, efficiency: 105 },
    { month: '5월', target: 1000, actual: 990, efficiency: 99 },
    { month: '6월', target: 1000, actual: 1030, efficiency: 103 }
  ];

  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>생산 데이터 차트</h1>
        
        <div className={s.chartSection}>
          <div className={s.chartContainer}>
            <h3>월별 생산 목표 대비 실적</h3>
            <div className={s.chartGrid}>
              {productionData.map((item, index) => (
                <div key={index} className={s.chartItem}>
                  <div className={s.chartBar}>
                    <div
                      className={s.barFill}
                      style={{
                        height: `${Math.min(item.efficiency, 120)}%`,
                        backgroundColor: item.efficiency >= 100 ? '#4CAF50' : '#FF9800'
                      }}
                    ></div>
                  </div>
                  <div className={s.chartLabel}>
                    <span>{item.month}</span>
                    <span className={s.efficiency}>{item.efficiency}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={s.chartLegend}>
              <div className={s.legendItem}>
                <span className={s.legendColor} style={{backgroundColor: '#4CAF50'}}></span>
                <span>목표 달성</span>
              </div>
              <div className={s.legendItem}>
                <span className={s.legendColor} style={{backgroundColor: '#FF9800'}}></span>
                <span>목표 미달</span>
              </div>
            </div>
          </div>

          <div className={s.summaryCards}>
            <div className={s.summaryCard}>
              <h4>총 생산량</h4>
              <div className={s.summaryValue}>6,020</div>
              <div className={s.summaryUnit}>개</div>
            </div>
            <div className={s.summaryCard}>
              <h4>평균 효율성</h4>
              <div className={s.summaryValue}>100.3%</div>
              <div className={s.summaryUnit}>목표 대비</div>
            </div>
            <div className={s.summaryCard}>
              <h4>가동률</h4>
              <div className={s.summaryValue}>98.5%</div>
              <div className={s.summaryUnit}>월 평균</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionChart;
