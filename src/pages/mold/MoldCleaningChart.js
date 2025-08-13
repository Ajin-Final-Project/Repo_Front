import React from 'react';
import s from './MoldCleaningChart.module.scss';

const MoldCleaningChart = () => {
  // 금형세척 차트용 더미 데이터
  const cleaningData = [
    { month: '1월', planned: 45, completed: 42, efficiency: 93.3 },
    { month: '2월', planned: 48, completed: 47, efficiency: 97.9 },
    { month: '3월', planned: 50, completed: 48, efficiency: 96.0 },
    { month: '4월', planned: 52, completed: 51, efficiency: 98.1 },
    { month: '5월', planned: 49, completed: 46, efficiency: 93.9 },
    { month: '6월', planned: 51, completed: 50, efficiency: 98.0 }
  ];

  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>금형세척 차트</h1>
        
        <div className={s.chartSection}>
          <div className={s.chartContainer}>
            <h3>월별 금형세척 계획 대비 실적</h3>
            <div className={s.chartGrid}>
              {cleaningData.map((item, index) => (
                <div key={index} className={s.chartItem}>
                  <div className={s.chartBar}>
                    <div
                      className={s.barFill}
                      style={{
                        height: `${Math.min(item.efficiency, 120)}%`,
                        backgroundColor: item.efficiency >= 95 ? '#FF5722' : '#FF9800'
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
                <span className={s.legendColor} style={{backgroundColor: '#FF5722'}}></span>
                <span>목표 달성 (95%+)</span>
              </div>
              <div className={s.legendItem}>
                <span className={s.legendColor} style={{backgroundColor: '#FF9800'}}></span>
                <span>목표 미달</span>
              </div>
            </div>
          </div>

          <div className={s.summaryCards}>
            <div className={s.summaryCard}>
              <h4>총 세척 계획</h4>
              <div className={s.summaryValue}>295</div>
              <div className={s.summaryUnit}>건</div>
            </div>
            <div className={s.summaryCard}>
              <h4>완료율</h4>
              <div className={s.summaryValue}>96.9%</div>
              <div className={s.summaryUnit}>평균</div>
            </div>
            <div className={s.summaryCard}>
              <h4>이번 달</h4>
              <div className={s.summaryValue}>50/51</div>
              <div className={s.summaryUnit}>건</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoldCleaningChart;
