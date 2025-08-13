import React from 'react';
import s from './DefectProcessChart.module.scss';

const DefectProcessChart = () => {
  // 불량공정 차트용 더미 데이터
  const defectData = [
    { month: '1월', total: 1200, defect: 48, rate: 4.0 },
    { month: '2월', total: 1180, defect: 42, rate: 3.6 },
    { month: '3월', total: 1250, defect: 50, rate: 4.0 },
    { month: '4월', total: 1220, defect: 37, rate: 3.0 },
    { month: '5월', total: 1280, defect: 45, rate: 3.5 },
    { month: '6월', total: 1240, defect: 40, rate: 3.2 }
  ];

  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>불량공정 차트</h1>
        <div className={s.chartSection}>
          <div className={s.chartContainer}>
            <h3>월별 불량률 추이</h3>
            <div className={s.chartGrid}>
              {defectData.map((item, index) => (
                <div key={index} className={s.chartItem}>
                  <div className={s.chartBar}>
                    <div
                      className={s.barFill}
                      style={{
                        height: `${Math.min(item.rate * 20, 100)}%`,
                        backgroundColor: item.rate <= 3.5 ? '#4CAF50' : item.rate <= 4.0 ? '#FF9800' : '#F44336'
                      }}
                    ></div>
                  </div>
                  <div className={s.chartLabel}>
                    <span>{item.month}</span>
                    <span className={s.defectRate}>{item.rate}%</span>
                  </div>
                </div>
              ))}
            </div>
            <div className={s.chartLegend}>
              <div className={s.legendItem}>
                <span className={s.legendColor} style={{backgroundColor: '#4CAF50'}}></span>
                <span>양호 (3.5% 이하)</span>
              </div>
              <div className={s.legendItem}>
                <span className={s.legendColor} style={{backgroundColor: '#FF9800'}}></span>
                <span>주의 (3.5-4.0%)</span>
              </div>
              <div className={s.legendItem}>
                <span className={s.legendColor} style={{backgroundColor: '#F44336'}}></span>
                <span>위험 (4.0% 초과)</span>
              </div>
            </div>
          </div>
          <div className={s.summaryCards}>
            <div className={s.summaryCard}>
              <h4>총 생산량</h4>
              <div className={s.summaryValue}>7,370</div>
              <div className={s.summaryUnit}>개</div>
            </div>
            <div className={s.summaryCard}>
              <h4>총 불량품</h4>
              <div className={s.summaryValue}>262</div>
              <div className={s.summaryUnit}>개</div>
            </div>
            <div className={s.summaryCard}>
              <h4>평균 불량률</h4>
              <div className={s.summaryValue}>3.6%</div>
              <div className={s.summaryUnit}>월 평균</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectProcessChart;
