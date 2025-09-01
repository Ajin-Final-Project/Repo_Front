import React from "react";
import ReactECharts from "echarts-for-react";
import styles from "./Bottleneck.module.scss";

const Bottleneck = () => {
  // Radar 차트 옵션
  const radarOption = {
    tooltip: {},
    legend: {
      data: ["실시간 병목 현황"],
      top: "bottom",
    },
    radar: {
      indicator: [
        { name: "조립셀", max: 100 },
        { name: "프레스", max: 100 },
        { name: "블랭킹", max: 100 },
      ],
    },
    series: [
      {
        name: "실시간 병목 현황",
        type: "radar",
        data: [{ value: [65.8, 45.2, 12.3], name: "실시간 병목 현황" }],
      },
    ],
  };

  // Pie 차트 옵션
  const pieOption = {
    tooltip: { trigger: "item" },
    legend: { bottom: 0 },
    series: [
      {
        name: "과거 병목",
        type: "pie",
        radius: "70%",
        data: [
          { value: 40, name: "블랭킹" },
          { value: 25, name: "프레스" },
          { value: 20, name: "조립셀" },
          { value: 15, name: "지게차" },
        ],
      },
    ],
  };

  // 날짜별 병목 기록 & 예측
  const blockOption = {
    tooltip: {},
    grid: { top: 60, bottom: 20, left: 110, right: 20 },
    xAxis: {
      type: "category",
      data: [
        "06-18","06-19","06-20","06-21","06-22",
        "06-23","06-24","06-25","06-26",
        "06-27","06-28","06-29","06-30"
      ],
      splitLine: { show: true },
    },
    yAxis: {
      type: "category",
      data: ["블랭킹","블랭킹 지게차","프레스","프레스 지게차","조립셀"],
      axisLabel: { margin: 20 },
      splitLine: { show: true },
    },
    visualMap: {
      show: false,
      min: 1,
      max: 2,
      inRange: { color: ["#ef4444", "#3b82f6"] },
    },
    series: [
      {
        type: "heatmap",
        data: [
          [0, 4, 1],[1, 2, 1],[2, 4, 1],[3, 2, 1],[4, 4, 1],[5, 2, 1],
          [6, 4, 1],[7, 2, 1],[8, 4, 1],
          [9, 4, 2],[10, 2, 2],[11, 4, 2],[12, 4, 2],
        ],
      },
    ],
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1>병목 공정 예측</h1>
        <span>25.6.27 3PM</span>
      </div>

      {/* 경고 박스 */}
      <div className={styles.alert}>
        ⚠️ 조립셀1에서 병목이 발생하여 생산량에 15% 정도 영향이 예상됩니다.
        <br />알림: 조립셀1 병목 5회 지속
      </div>

      {/* 1행: Radar + 공정도 */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>실시간 병목 현황</h2>
          <ReactECharts option={radarOption} style={{ height: "240px" }} />
          <div className={styles.percentTable}>
            <div><span className={styles.dotRed}></span> 조립셀 : 65.8%</div>
            <div><span className={styles.dotOrange}></span> 프레스 : 45.2%</div>
            <div><span className={styles.dotGreen}></span> 블랭킹 : 12.3%</div>
          </div>
        </div>

        <div className={styles.card}>
          <h2>공정도</h2>
          <div className={styles.flow}>
            <div className={styles.row}>
              <div className={styles.stage}>블랭킹1</div>
              <div className={styles.stage}>블랭킹2</div>
              <div className={styles.stage}>블랭킹3</div>
              <div className={styles.stage}>블랭킹4</div>
            </div>
            <div className={styles.row}>
              <div className={`${styles.stage} ${styles.wide}`}>블랭킹 지게차</div>
            </div>
            <div className={styles.row}>
              <div className={styles.stage}>프레스1</div>
              <div className={styles.stage}>프레스2</div>
              <div className={styles.stage}>프레스3</div>
              <div className={styles.stage}>프레스4</div>
            </div>
            <div className={styles.row}>
              <div className={`${styles.stage} ${styles.wide}`}>프레스 지게차</div>
            </div>
            <div className={styles.row}>
              <div className={styles.stageRed}>조립셀1</div>
              <div className={styles.stage}>조립셀2</div>
              <div className={styles.stage}>조립셀3</div>
              <div className={styles.stage}>조립셀4</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2행: Pie + Heatmap */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>과거 병목 시각화 (주간/월간)</h2>
          <ReactECharts option={pieOption} style={{ height: "280px" }} />
        </div>
        <div className={styles.card}>
          <h2>날짜별 병목 기록 및 예측</h2>
          <div className={styles.subHeader}>
            <span>과거 병목 기록</span>
            <span>미래 병목 예측</span>
          </div>
          <ReactECharts option={blockOption} style={{ height: "280px" }} />
        </div>
      </div>

      {/* SKU별 병목 예측 */}
      <div className={`${styles.cardWide} ${styles.section}`}>
        <h2>과거의 SKU별 실제 병목과 예측병목 표시 / 오늘의 SKU별 병목 예측</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>SKU</th><th>2025-06-27</th><th>2025-06-28</th><th>2025-06-29</th><th>2025-06-30</th><th>오늘 예측</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>SKU1</td><td>프레스 <span className={styles.check}>✓</span></td><td>조립셀 <span className={styles.check}>✓</span></td><td>프레스 <span className={styles.check}>✓</span></td><td>조립셀 <span className={styles.check}>✓</span></td><td>조립셀</td></tr>
            <tr><td>SKU2</td><td>조립셀 <span className={styles.check}>✓</span></td><td>조립셀 <span className={styles.check}>✓</span></td><td>조립셀 <span className={styles.check}>✓</span></td><td>조립셀 <span className={styles.check}>✓</span></td><td>조립셀</td></tr>
            <tr><td>SKU3</td><td>블랭킹 <span className={styles.check}>✓</span></td><td>조립셀 <span className={styles.check}>✓</span></td><td>프레스 <span className={styles.check}>✓</span></td><td>조립셀 <span className={styles.check}>✓</span></td><td>조립셀</td></tr>
            <tr><td>SKU4</td><td>프레스 <span className={styles.check}>✓</span></td><td>프레스 <span className={styles.check}>✓</span></td><td>조립셀 <span className={styles.check}>✓</span></td><td>조립셀 <span className={styles.check}>✓</span></td><td>프레스</td></tr>
          </tbody>
        </table>
      </div>

      {/* StageGroup별 병목 예측 */}
      <div className={`${styles.cardWide} ${styles.section}`}>
        <h2>과거의 공정별 실제 병목과 예측병목 표시 / 오늘의 공정별 병목 예측</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>공정</th><th>2025-06-27</th><th>2025-06-28</th><th>2025-06-29</th><th>2025-06-30</th><th>오늘 예측</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>블랭킹</td><td>블랭킹1 <span className={styles.check}>✓</span></td><td>블랭킹4 <span className={styles.check}>✓</span></td><td>블랭킹4 <span className={styles.check}>✓</span></td><td>블랭킹4 <span className={styles.check}>✓</span></td><td>블랭킹4</td></tr>
            <tr><td>프레스</td><td>프레스1 <span className={styles.check}>✓</span></td><td>프레스2 <span className={styles.check}>✓</span></td><td>프레스1 <span className={styles.check}>✓</span></td><td>프레스2 <span className={styles.check}>✓</span></td><td>프레스2</td></tr>
            <tr><td>조립셀</td><td>조립셀1 <span className={styles.check}>✓</span></td><td>조립셀1 <span className={styles.check}>✓</span></td><td>조립셀1 <span className={styles.check}>✓</span></td><td>조립셀1 <span className={styles.check}>✓</span></td><td>조립셀1</td></tr>
          </tbody>
        </table>
      </div>

      {/* 인사이트 */}
      <div className={`${styles.insight} ${styles.section}`}>
        병목 집중 지점: <b>조립셀1</b> → SKU 분산 재배치를 통한 부하 균형 조정이 요구됨.
      </div>

      {/* 원래 vs 제안 + Queue 변화 */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>원래 vs 제안 비율</h2>
          <div className={styles.cardList}>
            <div className={styles.skuCard}><h3>SKU1</h3><span className={styles.tagRed}>48.2%</span> → <span className={styles.tagBlue}>100%</span></div>
            <div className={styles.skuCard}><h3>SKU2</h3><span className={styles.tagRed}>37.9%</span> → <span className={styles.tagBlue}>0%</span></div>
            <div className={styles.skuCard}><h3>SKU3</h3><span className={styles.tagRed}>0%</span> → <span className={styles.tagBlue}>50%</span></div>
            <div className={styles.skuCard}><h3>SKU4</h3><span className={styles.tagRed}>13.9%</span> → <span className={styles.tagBlue}>30%</span></div>
          </div>
        </div>
        <div className={styles.card}>
          <h2>재분배 전후 Cell별 Queue 변화</h2>
          <div className={styles.cardList}>
            <div className={styles.skuCard}><h3>Cell1</h3><span className={styles.tagRed}>Before 240K</span> → <span className={styles.tagBlue}>After 120K (-50%)</span></div>
            <div className={styles.skuCard}><h3>Cell2</h3><span className={styles.tagRed}>Before 60K</span> → <span className={styles.tagBlue}>After 125K (+108.3%)</span></div>
            <div className={styles.skuCard}><h3>Cell3</h3><span className={styles.tagRed}>Before 45K</span> → <span className={styles.tagBlue}>After 90K (+100%)</span></div>
            <div className={styles.skuCard}><h3>Cell4</h3><span className={styles.tagRed}>Before 135K</span> → <span className={styles.tagBlue}>After 155K (+14.8%)</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bottleneck;
