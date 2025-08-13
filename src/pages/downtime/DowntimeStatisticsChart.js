import React from 'react';
import s from './DowntimeStatisticsChart.module.scss';

const DowntimeStatisticsChart = () => {
  // 비가동 통계 차트용 더미 데이터
  const downtimeData = [
    { month: '1월', planned: 120, actual: 135, efficiency: 88.9 },
    { month: '2월', planned: 120, actual: 128, efficiency: 93.8 },
    { month: '3월', planned: 120, actual: 142, efficiency: 84.5 },
    { month: '4월', planned: 120, actual: 125, efficiency: 96.0 },
    { month: '5월', planned: 120, actual: 138, efficiency: 87.0 },
    { month: '6월', planned: 120, actual: 130, efficiency: 92.3 }
  ];

  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>비가동 통계 차트</h1>
        <div className={s.chartSection}>
          <div className={s.chartContainer}>
            <h3>월별 가동률 추이</h3>
            <div className={s.chartGrid}>
              {downtimeData.map((item, index) => (
                <div key={index} className={s.chartItem}>
                  <div className={s.chartBar}>
                    <div
                      className={s.barFill}
                      style={{
                        height: `${Math.min(item.efficiency, 100)}%`,
                        backgroundColor: item.efficiency >= 95 ? '#4CAF50' : item.efficiency >= 90 ? '#FF9800' : '#F44336'
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
                <span>우수 (95%+)</span>
              </div>
              <div className={s.legendItem}>
                <span className={s.legendColor} style={{backgroundColor: '#FF9800'}}></span>
                <span>양호 (90-95%)</span>
              </div>
              <div className={s.legendItem}>
                <span className={s.legendColor} style={{backgroundColor: '#F44336'}}></span>
                <span>개선필요 (90% 미만)</span>
              </div>
            </div>
          </div>
          <div className={s.summaryCards}>
            <div className={s.summaryCard}>
              <h4>평균 가동률</h4>
              <div className={s.summaryValue}>90.4%</div>
              <div className={s.summaryUnit}>월 평균</div>
            </div>
            <div className={s.summaryCard}>
              <h4>총 비가동 시간</h4>
              <div className={s.summaryValue}>798</div>
              <div className={s.summaryUnit}>시간</div>
            </div>
            <div className={s.summaryCard}>
              <h4>목표 달성율</h4>
              <div className={s.summaryValue}>75%</div>
              <div className={s.summaryUnit}>월별</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DowntimeStatisticsChart;
