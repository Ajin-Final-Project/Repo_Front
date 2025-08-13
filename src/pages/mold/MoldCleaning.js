import React from 'react';
import { Link } from 'react-router-dom';
import s from './MoldCleaning.module.scss';

const MoldCleaning = () => {
  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>금형세척 시스템</h1>
        
        <div className={s.mainContent}>
          <div className={s.welcomeSection}>
            <h2>금형세척 시스템에 오신 것을 환영합니다</h2>
            <p>금형세척 현황을 모니터링하고 관리할 수 있는 다양한 도구를 제공합니다.</p>
          </div>

          <div className={s.menuGrid}>
            <Link to="/app/mold/chart" className={s.menuCard}>
              <div className={s.menuIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,3V21H21V3H3M9,17H7V10H9V17M13,17H11V7H13V17M17,17H15V13H17V17Z" />
                </svg>
              </div>
              <h3>금형세척 차트</h3>
              <p>월별 금형세척 계획 대비 실적을 차트로 확인하고 분석합니다.</p>
              <div className={s.menuArrow}>→</div>
            </Link>

            <Link to="/app/mold/data" className={s.menuCard}>
              <div className={s.menuIcon}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,3H5V5H3V3M7,3H9V5H7V3M11,3H13V5H11V3M15,3H17V5H15V3M3,7H5V9H3V7M7,7H9V9H7V7M11,7H13V9H11V7M15,7H17V9H15V7M3,11H5V13H3V11M7,11H9V13H7V11M11,11H13V13H11V11M15,11H17V13H15V11M3,15H5V17H3V15M7,15H9V17H7V15M11,15H13V17H11V15M15,15H17V17H15V15Z" />
                </svg>
              </div>
              <h3>금형세척 데이터</h3>
              <p>금형세척 현황을 상세한 테이블 형태로 확인하고 관리합니다.</p>
              <div className={s.menuArrow}>→</div>
            </Link>
          </div>

          <div className={s.quickStats}>
            <div className={s.statCard}>
              <h4>오늘의 세척 계획</h4>
              <div className={s.statValue}>8</div>
              <div className={s.statUnit}>건</div>
            </div>
            <div className={s.statCard}>
              <h4>완료율</h4>
              <div className={s.statValue}>87.5%</div>
              <div className={s.statUnit}>현재</div>
            </div>
            <div className={s.statCard}>
              <h4>평균 소요시간</h4>
              <div className={s.statValue}>2.5</div>
              <div className={s.statUnit}>시간</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoldCleaning;
