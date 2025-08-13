import React from 'react';
import { Link } from 'react-router-dom';
import s from './InspectionSystem.module.scss';

const InspectionSystem = () => {
  return (
    <div className={s.root}>
      <div className={s.container}>
        <div className={s.mainContent}>
          <div className={s.welcomeSection}>
            <h1>초/중/종품 검사 시스템</h1>
            <p>제품의 품질을 검사하고 관리하는 시스템입니다.</p>
          </div>
          
          <div className={s.menuGrid}>
            <Link to="/app/inspection/chart" className={s.menuCard}>
              <div className={s.menuIcon}>📊</div>
              <h3>검사 시스템 차트</h3>
              <p>월별 검사 합격률 추이와 통계를 차트로 확인</p>
              <div className={s.menuArrow}>→</div>
            </Link>
            
            <Link to="/app/inspection/data" className={s.menuCard}>
              <div className={s.menuIcon}>📋</div>
              <h3>검사 시스템 데이터</h3>
              <p>검사 현황을 상세하게 데이터로 확인</p>
              <div className={s.menuArrow}>→</div>
            </Link>
          </div>
          
          <div className={s.quickStats}>
            <div className={s.statCard}>
              <h4>평균 합격률</h4>
              <div className={s.statValue}>96.4%</div>
              <div className={s.statUnit}>전체 평균</div>
            </div>
            <div className={s.statCard}>
              <h4>초품 검사</h4>
              <div className={s.statValue}>95.0%</div>
              <div className={s.statUnit}>평균 합격률</div>
            </div>
            <div className={s.statCard}>
              <h4>종품 검사</h4>
              <div className={s.statValue}>98.8%</div>
              <div className={s.statUnit}>평균 합격률</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionSystem;
