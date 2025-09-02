import React, { useEffect, useState } from "react";
import ReactECharts from "echarts-for-react";
import styles from "./Bottleneck.module.scss";

const Bottleneck = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ 소수점 둘째 자리까지 포맷
  const formatNumber = (value) => {
    if (value === null || value === undefined) return 0;
    return Number(value).toFixed(2);
  };

  // ✅ 오늘 날짜 (하드코딩 대신 new Date()도 가능)
  const today = "2025-06-27";

  // ✅ 과거 4일 자동 계산
  const getPastDates = (todayStr, days) => {
    const base = new Date(todayStr);
    const dates = [];
    for (let i = days; i >= 1; i--) {
      const past = new Date(base);
      past.setDate(base.getDate() - i);
      dates.push(past.toISOString().split("T")[0]);
    }
    return dates;
  };
  const pastDates = getPastDates(today, 4);

  // ✅ 미래 3일 (예측용)
  const getFutureDates = (todayStr, days) => {
    const base = new Date(todayStr);
    const dates = [];
    for (let i = 1; i <= days; i++) {
      const future = new Date(base);
      future.setDate(base.getDate() + i);
      dates.push(future.toISOString().split("T")[0]);
    }
    return dates;
  };
  const futureDates = getFutureDates(today, 3);

  // ✅ API 호출 (기간 조회: 과거 4일 + 오늘)
  useEffect(() => {
    fetch("http://localhost:8000/smartFactory/bottleneck/overview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Time_Start: pastDates[0],
        Time_End: today,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("📊 API 응답:", res);
        if (res.data && res.data.length > 0) {
          setData(res.data);
        }
      })
      .catch((err) => console.error("API 호출 에러:", err))
      .finally(() => setLoading(false));
  }, [today]);

  if (loading) return <div>로딩중...</div>;
  if (!data || data.length === 0) return <div>데이터 없음</div>;

  // ✅ 날짜별 매핑
  const byDate = {};
  data.forEach((row) => {
    const dateKey = row.Time_Now.split("T")[0];
    byDate[dateKey] = row;
  });

  // ✅ 최신 데이터는 오늘 기준
  const latest = byDate[today] || byDate[pastDates.at(-1)];

  // ✅ Radar 차트 최대치 계산
  const maxQueueValue = Math.max(
    latest?.Cell1_Queue || 0,
    latest?.Press1_Queue || 0,
    latest?.Blanking_SKU1_Queue || 0,
    latest?.Forklift_Blanking_Queue || 0,
    latest?.Forklift_Press_Queue || 0
  );
  const radarMax = Math.ceil(maxQueueValue * 1.1);

  // ✅ Radar 차트 옵션
  const radarOption = {
    tooltip: {},
    legend: { data: ["실시간 병목 현황"], top: "bottom" },
    radar: {
      indicator: [
        { name: "조립셀", max: radarMax },
        { name: "프레스", max: radarMax },
        { name: "블랭킹", max: radarMax },
        { name: "블랭킹 지게차", max: radarMax },
        { name: "프레스 지게차", max: radarMax },
      ],
    },
    series: [
      {
        name: "실시간 병목 현황",
        type: "radar",
        data: [
          {
            value: [
              Number(latest?.Cell1_Queue || 0),
              Number(latest?.Press1_Queue || 0),
              Number(latest?.Blanking_SKU1_Queue || 0),
              Number(latest?.Forklift_Blanking_Queue || 0),
              Number(latest?.Forklift_Press_Queue || 0),
            ],
            name: "실시간 병목 현황",
          },
        ],
      },
    ],
  };

  // ✅ Pie 차트 데이터 준비 (빈도 높은 순 정렬)
  // ✅ 과거 7일 계산
  const past7Dates = getPastDates(today, 7);

  // ✅ 주간 데이터 집계 (공정별 합계)
  let pieData = [
    {
      name: "블랭킹",
      value: past7Dates.reduce((sum, d) => sum + (byDate[d]?.Blanking_SKU1_Queue || 0), 0),
    },
    {
      name: "프레스",
      value: past7Dates.reduce((sum, d) => sum + (byDate[d]?.Press1_Queue || 0), 0),
    },
    {
      name: "조립셀",
      value: past7Dates.reduce((sum, d) => sum + (byDate[d]?.Cell1_Queue || 0), 0),
    },
    {
      name: "블랭킹 지게차",
      value: past7Dates.reduce((sum, d) => sum + (byDate[d]?.Forklift_Blanking_Queue || 0), 0),
    },
    {
      name: "프레스 지게차",
      value: past7Dates.reduce((sum, d) => sum + (byDate[d]?.Forklift_Press_Queue || 0), 0),
    },
  ];

  // value 기준 내림차순 정렬
  pieData = pieData.sort((a, b) => b.value - a.value);

  // ✅ Pie 차트 옵션
  const pieOption = {
    tooltip: { trigger: "item" },
    series: [
      {
        name: "주간 병목 빈도",
        type: "pie",
        radius: "70%",
        label: {
          formatter: "{b}: {d}%", // ✅ 이름 + 비율만 표시
        },
        data: pieData,
      },
    ],
  };

  // ✅ Heatmap 데이터 변환
  const stages = ["블랭킹", "블랭킹 지게차", "프레스", "프레스 지게차", "조립셀"];
  const allDates = [...pastDates, today, ...futureDates];
  const heatmapData = [];

  // 과거 + 오늘 → 실제 병목
  [...pastDates, today].forEach((d, xIdx) => {
    const row = byDate[d];
    if (!row || !row.Bottleneck_actual) return;

    const actual = row.Bottleneck_actual.toLowerCase();
    if (actual.includes("forklift") && actual.includes("blank")) {
      heatmapData.push([xIdx, stages.indexOf("블랭킹 지게차"), 1]);
    } else if (actual.includes("forklift") && actual.includes("press")) {
      heatmapData.push([xIdx, stages.indexOf("프레스 지게차"), 1]);
    } else if (actual.includes("cell")) {
      heatmapData.push([xIdx, stages.indexOf("조립셀"), 1]);
    } else if (actual.includes("press")) {
      heatmapData.push([xIdx, stages.indexOf("프레스"), 1]);
    } else if (actual.includes("blank")) {
      heatmapData.push([xIdx, stages.indexOf("블랭킹"), 1]);
    }
  });

  // 미래 → 예측 병목 (today 행의 Bottleneck_pred 값 이용)
  futureDates.forEach((d, idx) => {
    const xIdx = pastDates.length + 1 + idx;
    const row = byDate[today];
    if (!row || !row.Bottleneck_pred) return;

    const pred = row.Bottleneck_pred.toLowerCase();
    if (pred.includes("forklift") && pred.includes("blank")) {
      heatmapData.push([xIdx, stages.indexOf("블랭킹 지게차"), 2]);
    } else if (pred.includes("forklift") && pred.includes("press")) {
      heatmapData.push([xIdx, stages.indexOf("프레스 지게차"), 2]);
    } else if (pred.includes("cell")) {
      heatmapData.push([xIdx, stages.indexOf("조립셀"), 2]);
    } else if (pred.includes("press")) {
      heatmapData.push([xIdx, stages.indexOf("프레스"), 2]);
    } else if (pred.includes("blank")) {
      heatmapData.push([xIdx, stages.indexOf("블랭킹"), 2]);
    }
  });

  // ✅ Heatmap 옵션
  const blockOption = {
    tooltip: {
      formatter: (params) => {
        const date = allDates[params.data[0]];
        const stage = stages[params.data[1]];
        const type = params.data[2] === 1 ? "실제 병목" : "예측 병목";
        return `${date}<br/>${stage} : ${type}`;
      },
    },
    grid: { top: 60, bottom: 20, left: 110, right: 20 },
    xAxis: {
      type: "category",
      data: allDates.map((d) => d.slice(5)),
      splitLine: { show: true },
    },
    yAxis: {
      type: "category",
      data: stages,
      axisLabel: { margin: 20 },
      splitLine: { show: true },
    },
    visualMap: {
      show: false,
      min: 1,
      max: 2,
      inRange: { color: ["#ef4444", "#3b82f6"] },
    },
    series: [{ type: "heatmap", data: heatmapData }],
  };

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <h1>병목 공정 예측</h1>
        <span>{pastDates[0]} ~ {today}</span>
      </div>

      {/* 경고 박스 */}
      <div className={styles.alert}>
        ⚠️ {latest?.Bottleneck_actual}에서 병목이 발생하여 생산량에{" "}
        {formatNumber(latest?.Cell1_Queue_Percent)}% 정도 영향이 예상됩니다.
      </div>

      {/* 1행: Radar + 공정도 */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>실시간 병목 현황</h2>
          <ReactECharts option={radarOption} style={{ height: "240px" }} />
          <div className={styles.percentTable}>
            <div>
              <span className={`${styles.dot} ${styles.dotBlanking}`}></span>
              블랭킹 : {formatNumber(latest?.Blanking_SKU1_Queue)}
            </div>
            <div>
              <span className={`${styles.dot} ${styles.dotForkliftBlanking}`}></span>
              블랭킹 지게차 : {formatNumber(latest?.Forklift_Blanking_Queue)}
            </div>
            <div>
              <span className={`${styles.dot} ${styles.dotPress}`}></span>
              프레스 : {formatNumber(latest?.Press1_Queue)}
            </div>
            <div>
              <span className={`${styles.dot} ${styles.dotForkliftPress}`}></span>
              프레스 지게차 : {formatNumber(latest?.Forklift_Press_Queue)}
            </div>
            <div>
              <span className={`${styles.dot} ${styles.dotCell}`}></span>
              조립셀 : {formatNumber(latest?.Cell1_Queue)}
            </div>
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
          <h2>과거 병목 시각화 (주간)</h2>
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
        <table className={styles.table} style={{ tableLayout: "fixed", width: "100%" }}>
          <thead>
            <tr>
              <th>SKU</th>
              {pastDates.map((d) => <th key={d}>{d}</th>)}
              {/* ✅ 여기서 today는 제거 */}
              <th>{today} (실제)</th>
              <th>오늘 예측</th>
            </tr>
          </thead>
          <tbody>
            {["SKU1", "SKU2", "SKU3", "SKU4"].map((sku) => (
              <tr key={sku}>
                <td>{sku}</td>
                {pastDates.map((d) => (
                  <td key={d}>{byDate[d]?.[`Bottleneck_actual_${sku}`] || "-"}</td>
                ))}
                {/* ✅ 오늘은 여기서만 출력 */}
                <td>{byDate[today]?.[`Bottleneck_actual_${sku}`] || "-"}</td>
                <td>{byDate[today]?.[`Bottleneck_pred_${sku}`] || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* StageGroup별 병목 예측 */}
      <div className={`${styles.cardWide} ${styles.section}`}>
        <h2>과거의 공정별 실제 병목과 예측병목 표시 / 오늘의 공정별 병목 예측</h2>
        <table className={styles.table} style={{ tableLayout: "fixed", width: "100%" }}>
          <thead>
            <tr>
              <th>공정</th>
              {pastDates.map((d) => <th key={d}>{d}</th>)}
              <th>{today} (실제)</th>
              <th>오늘 예측</th>
            </tr>
          </thead>
          <tbody>
            {["Blanking", "Press", "Cell"].map((stage) => (
              <tr key={stage}>
                <td>{stage}</td>
                {pastDates.map((d) => (
                  <td key={d}>{byDate[d]?.[`Bottleneck_actual_${stage}`] || "-"}</td>
                ))}
                <td>{byDate[today]?.[`Bottleneck_actual_${stage}`] || "-"}</td>
                <td>{byDate[today]?.[`Bottleneck_pred_${stage}`] || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 인사이트 */}
      <div className={`${styles.insight} ${styles.section}`}>
        병목 집중 지점: <b>{latest?.Bottleneck_actual}</b> → SKU 분산 재배치를 통한 부하 균형 조정이 요구됨.
      </div>

      {/* 원래 vs 제안 + Queue 변화 */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>원래 vs 제안 비율</h2>
          <div className={styles.cardList}>
            <div className={styles.skuCard}><h3>SKU1</h3><span className={styles.tagRed}>48.20%</span> → <span className={styles.tagBlue}>100.00%</span></div>
            <div className={styles.skuCard}><h3>SKU2</h3><span className={styles.tagRed}>37.90%</span> → <span className={styles.tagBlue}>0.00%</span></div>
            <div className={styles.skuCard}><h3>SKU3</h3><span className={styles.tagRed}>0.00%</span> → <span className={styles.tagBlue}>50.00%</span></div>
            <div className={styles.skuCard}><h3>SKU4</h3><span className={styles.tagRed}>13.90%</span> → <span className={styles.tagBlue}>30.00%</span></div>
          </div>
        </div>
        <div className={styles.card}>
          <h2>재분배 전후 Cell별 Queue 변화</h2>
          <div className={styles.cardList}>
            <div className={styles.skuCard}><h3>Cell1</h3><span className={styles.tagRed}>Before {formatNumber(latest?.Cell1_Queue)}</span> → <span className={styles.tagBlue}>After {formatNumber((latest?.Cell1_Queue || 0) / 2)}</span></div>
            <div className={styles.skuCard}><h3>Cell2</h3><span className={styles.tagRed}>Before {formatNumber(latest?.Cell2_Queue)}</span> → <span className={styles.tagBlue}>After {formatNumber((latest?.Cell2_Queue || 0) * 2)}</span></div>
            <div className={styles.skuCard}><h3>Cell3</h3><span className={styles.tagRed}>Before {formatNumber(latest?.Cell3_Queue)}</span> → <span className={styles.tagBlue}>After {formatNumber((latest?.Cell3_Queue || 0) * 2)}</span></div>
            <div className={styles.skuCard}><h3>Cell4</h3><span className={styles.tagRed}>Before {formatNumber(latest?.Cell4_Queue)}</span> → <span className={styles.tagBlue}>After {formatNumber((latest?.Cell4_Queue || 0) * 1.1)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Bottleneck;
