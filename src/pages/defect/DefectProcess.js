import React from 'react';
import { Link } from 'react-router-dom';
import s from './DefectProcess.module.scss';

const DefectProcess = () => {
  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.mainContent}>
          <div className={s.welcomeSection}>
            <h1>불량공정 시스템</h1>
            <p>불량공정 현황을 모니터링하고 관리하는 시스템입니다.</p>
          </div>
          
          <div className={s.menuGrid}>
            <Link to="/app/defect/chart" className={s.menuCard}>
              <div className={s.menuIcon}>📊</div>
              <h3>불량공정 차트</h3>
              <p>월별 불량률 추이와 통계를 차트로 확인</p>
              <div className={s.menuArrow}>→</div>
            </Link>
            
            <Link to="/app/defect/grid" className={s.menuCard}>
              <div className={s.menuIcon}>📋</div>
              <h3>불량공정 그리드</h3>
              <p>불량공정 현황을 상세하게 그리드로 확인</p>
              <div className={s.menuArrow}>→</div>
            </Link>
          </div>
          
          <div className={s.quickStats}>
            <div className={s.statCard}>
              <h4>이번 달 불량률</h4>
              <div className={s.statValue}>3.2%</div>
              <div className={s.statUnit}>목표 3.5% 이하</div>
            </div>
            <div className={s.statCard}>
              <h4>총 불량품 수</h4>
              <div className={s.statValue}>262</div>
              <div className={s.statUnit}>개</div>
            </div>
            <div className={s.statCard}>
              <h4>처리 완료율</h4>
              <div className={s.statValue}>85%</div>
              <div className={s.statUnit}>이번 달</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectProcess;
