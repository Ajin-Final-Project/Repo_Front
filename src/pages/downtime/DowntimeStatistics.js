import React from 'react';
import { Link } from 'react-router-dom';
import s from './DowntimeStatistics.module.scss';

const DowntimeStatistics = () => {
  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.mainContent}>
          <div className={s.welcomeSection}>
            <h1>비가동 통계 시스템</h1>
            <p>비가동 현황을 분석하고 통계를 제공하는 시스템입니다.</p>
          </div>
          
          <div className={s.menuGrid}>
            <Link to="/app/downtime/chart" className={s.menuCard}>
              <div className={s.menuIcon}>📊</div>
              <h3>비가동 통계 차트</h3>
              <p>월별 가동률 추이와 통계를 차트로 확인</p>
              <div className={s.menuArrow}>→</div>
            </Link>
            
            <Link to="/app/downtime/data" className={s.menuCard}>
              <div className={s.menuIcon}>📋</div>
              <h3>비가동 통계 데이터</h3>
              <p>비가동 현황을 상세하게 데이터로 확인</p>
              <div className={s.menuArrow}>→</div>
            </Link>
          </div>
          
          <div className={s.quickStats}>
            <div className={s.statCard}>
              <h4>평균 가동률</h4>
              <div className={s.statValue}>90.4%</div>
              <div className={s.statUnit}>월 평균</div>
            </div>
            <div className={s.statCard}>
              <h4>총 비가동 시간</h4>
              <div className={s.statValue}>798</div>
              <div className={s.statUnit}>시간</div>
            </div>
            <div className={s.statCard}>
              <h4>목표 달성율</h4>
              <div className={s.statValue}>75%</div>
              <div className={s.statUnit}>월별</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DowntimeStatistics;
