import React from 'react';
import s from './InspectionSystemChart.module.scss';

const InspectionSystemChart = () => {
  // 검사 시스템 차트용 더미 데이터
  const inspectionData = [
    { month: '1월', initial: 95.2, mid: 92.8, final: 98.5, average: 95.5 },
    { month: '2월', initial: 96.1, mid: 94.2, final: 99.1, average: 96.5 },
    { month: '3월', initial: 94.8, mid: 93.5, final: 97.8, average: 95.4 },
    { month: '4월', initial: 97.3, mid: 95.1, final: 99.3, average: 97.2 },
    { month: '5월', initial: 95.9, mid: 93.8, final: 98.9, average: 96.2 },
    { month: '6월', initial: 96.7, mid: 94.5, final: 99.0, average: 96.7 }
  ];

  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>검사 시스템 차트</h1>
        <div className={s.chartSection}>
          <div className={s.chartContainer}>
            <h3>월별 검사 합격률 추이</h3>
            <div className={s.chartGrid}>
              {inspectionData.map((item, index) => (
                <div key={index} className={s.chartItem}>
                  <div className={s.chartBar}>
                    <div
                      className={s.barFill}
                      style={{
                        height: `${Math.min(item.average, 100)}%`,
                        backgroundColor: item.average >= 97 ? '#4CAF50' : item.average >= 95 ? '#FF9800' : '#F44336'
                      }}
                    ></div>
                  </div>
                  <div className={s.chartLabel}>
                    <span>{item.month}</span>
                    <span className={s.averageRate}>{item.average}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={s.chartLegend}>
              <div className={s.legendItem}>
                <span className={s.legendColor} style={{backgroundColor: '#4CAF50'}}></span>
                <span>우수 (97%+)</span>
              </div>
              <div className={s.legendItem}>
                <span className={s.legendColor} style={{backgroundColor: '#FF9800'}}></span>
                <span>양호 (95-97%)</span>
              </div>
              <div className={s.legendItem}>
                <span className={s.legendColor} style={{backgroundColor: '#F44336'}}></span>
                <span>개선필요 (95% 미만)</span>
              </div>
            </div>
          </div>
          <div className={s.summaryCards}>
            <div className={s.summaryCard}>
              <h4>평균 합격률</h4>
              <div className={s.summaryValue}>96.4%</div>
              <div className={s.summaryUnit}>전체 평균</div>
            </div>
            <div className={s.summaryCard}>
              <h4>초품 검사</h4>
              <div className={s.summaryValue}>95.0%</div>
              <div className={s.summaryUnit}>평균 합격률</div>
            </div>
            <div className={s.summaryCard}>
              <h4>종품 검사</h4>
              <div className={s.summaryValue}>98.8%</div>
              <div className={s.summaryUnit}>평균 합격률</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionSystemChart;
