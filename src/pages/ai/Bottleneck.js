import React, { useEffect, useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import styles from "./Bottleneck.module.scss";
import { useSelector } from "react-redux";
import { selectThemeHex } from "../../reducers/layout";
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  CardHeader,
  CircularProgress,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import config from "../../config";
import AssessmentIcon from "@mui/icons-material/Assessment";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import Tooltip from "@mui/material/Tooltip";

const Bottleneck = () => {
  const themeHex = useSelector(selectThemeHex);

  // ✅ 데이터 상태
  const [data, setData] = useState([]);
  const [animatedHeatmapData, setAnimatedHeatmapData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // ✅ 로딩/에러 상태
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState({ overview: null });

  // ✅ 검색 필터
  const [quickRange, setQuickRange] = useState("day");
  const [filters, setFilters] = useState({
    date: "2025-06-27",
  });

  // ✅ 라벨 표시용
  const [showPastLabel, setShowPastLabel] = useState(false);
  const [showFutureLabel, setShowFutureLabel] = useState(false);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  
  // ✅ 날짜 계산 함수
  const addDays = (dateStr, diff) => {
    const base = new Date(dateStr);
    base.setDate(base.getDate() + diff);
    return base.toISOString().split("T")[0];
  };


  // ✅ 숫자 포맷
  const formatNumber = (value) => {
    if (value === null || value === undefined) return 0;
    return Number(value).toFixed(2);
  };

  // ✅ 병목 이름 변환
  const translateBottleneck = (value) => {
    if (!value) return "-";
    const val = value.toLowerCase();
    if (val.includes("cell")) {
      const match = value.match(/cell(\d+)/i);
      return match ? `조립셀${match[1]}` : "조립셀";
    }
    if (val.includes("forklift") && val.includes("blank")) return "블랭킹 지게차";
    if (val.includes("forklift") && val.includes("press")) return "프레스 지게차";
    if (val.includes("blanking")) {
      const match = value.match(/\d+/);
      return match ? `블랭킹${match[0]}` : "블랭킹";
    }
    if (val.includes("press")) {
      const match = value.match(/\d+/);
      return match ? `프레스${match[0]}` : "프레스";
    }
    return value;
  };


  // ✅ 날짜 계산
  const today = filters.date;

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
  const pastDates = useMemo(() => getPastDates(filters.date, 4), [filters.date]);

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
  const futureDates = useMemo(() => getFutureDates(filters.date, 3), [filters.date]);

  // ✅ fetchJson 유틸
  const fetchJson = async (url, options = {}, key = "API") => {
    const res = await fetch(url, options);
    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      throw new Error(`${key} 실패: HTTP ${res.status} ${txt}`);
    }
    return res.json();
  };

  // ✅ API 경로
  const API = (path) => `${config.baseURLApi}/smartFactory${path}`;

  // ✅ 개별 API 호출 함수
  const fetchBottleneckOverview = async () => {
    setLoading((s) => ({ ...s, overview: true }));
    setError((s) => ({ ...s, overview: null }));

    try {
      const today = filters.date;
      const timeStart = addDays(today, -4);
      const timeEnd = addDays(today, +3);

      const json = await fetchJson(
        API("/bottleneck/overview"),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            Time_Start: timeStart,
            Time_End: timeEnd,
          }),
        },
        "bottleneck-overview"
      );
      setData(Array.isArray(json?.data) ? json.data : []);
    } catch (e) {
      console.error("[fetchBottleneckOverview]", e);
      setError((s) => ({ ...s, overview: e.message || "조회 실패" }));
      setData([]);
    } finally {
      setLoading((s) => ({ ...s, overview: false }));
      setPageLoading(false);
    }
  };

  // ✅ 초기 및 필터 변경 시 호출
  useEffect(() => {
    setPageError(null);
    setPageLoading(true);
    fetchBottleneckOverview();
  }, [filters]);

  // ✅ 히트맵 데이터 준비
  const stages = ["조립셀", "프레스 지게차", "프레스", "블랭킹 지게차", "블랭킹"];
  const allDates = [...pastDates, today, ...futureDates];
  const fullHeatmapData = [];

  // 날짜별 매핑
  const byDate = useMemo(() => {
  const result = {};
    data.forEach((row) => {
      const dateKey = row.Time_Now?.split("T")[0];
      if (dateKey) result[dateKey] = row;
    });
    return result;
  }, [data]);

  // 👉 SKU별: 블랭킹/프레스/조립셀 기준으로 카운트
  const skuBottleneckStats = ["SKU1", "SKU2", "SKU3", "SKU4"].map((sku, idx) => {
    let counts = { 블랭킹: 0, 프레스: 0, 조립셀: 0 };

    pastDates.forEach((d) => {
      const row = byDate[d];
      if (!row) return;

      const blankingQ = row[`Blanking_${sku}_Queue`] || 0;
      const pressQ = row[`Press${idx + 1}_Queue`] || 0;
      const cellQ = row[`Cell${idx + 1}_Queue`] || 0;

      const maxVal = Math.max(blankingQ, pressQ, cellQ);
      if (maxVal === 0) return;

      if (maxVal === blankingQ) counts["블랭킹"]++;
      else if (maxVal === pressQ) counts["프레스"]++;
      else if (maxVal === cellQ) counts["조립셀"]++;
    });

    return { name: sku, ...counts };
  });



  const skuTotalPieData = [
    { name: "블랭킹", value: skuBottleneckStats.reduce((s, d) => s + d["블랭킹"], 0) },
    { name: "프레스", value: skuBottleneckStats.reduce((s, d) => s + d["프레스"], 0) },
    { name: "조립셀", value: skuBottleneckStats.reduce((s, d) => s + d["조립셀"], 0) },
  ];



  // ✅ Stage별 병목 발생 횟수 (넘버별 구분 포함)
  const stageGroups = {
    블랭킹: ["Blanking_SKU1_Queue","Blanking_SKU2_Queue","Blanking_SKU3_Queue","Blanking_SKU4_Queue"],
    프레스: ["Press1_Queue","Press2_Queue","Press3_Queue","Press4_Queue"],
    조립셀: ["Cell1_Queue","Cell2_Queue","Cell3_Queue","Cell4_Queue"]
  };

  const stageBottleneckCounts = {
    블랭킹: Array(4).fill(0),
    프레스: Array(4).fill(0),
    조립셀: Array(4).fill(0),
  };

  pastDates.forEach((d) => {
    const row = byDate[d];
    if (!row) return;

    Object.entries(stageGroups).forEach(([stage, queues]) => {
      let maxVal = 0, maxIdx = -1;
      queues.forEach((col, i) => {
        const val = row[col] || 0;
        if (val > maxVal) {
          maxVal = val;
          maxIdx = i;
        }
      });
      if (maxIdx >= 0) stageBottleneckCounts[stage][maxIdx] += 1;
    });
  });

  // ✅ Stage별 파이차트 데이터 분리
  const stagePieDataByStage = {
    블랭킹: stageBottleneckCounts["블랭킹"].map((v, i) => ({ name: `블랭킹${i+1}`, value: v })),
    프레스: stageBottleneckCounts["프레스"].map((v, i) => ({ name: `프레스${i+1}`, value: v })),
    조립셀: stageBottleneckCounts["조립셀"].map((v, i) => ({ name: `조립셀${i+1}`, value: v })),
  };

  const makePieOption = (title, data) => ({
    tooltip: { trigger: "item", formatter: "{b}: {d}%" },
    title: { text: title, left: "center", top: 10 },
    series: [
      {
        type: "pie",
        radius: "65%",
        data,
        label: { formatter: "{b}: {d}%" },
        emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0,0,0,0.3)" } },
      },
    ],
  });






  const topStageEntry = skuTotalPieData.sort((a, b) => b.value - a.value)[0];
  const topStage = topStageEntry?.name;
  const topStageData = stagePieDataByStage[topStage] || [];





  // ✅ 미래 공정별 예측 요약 (Bottleneck_pred_Cell 사용)
  const futureSkuSummary = (() => {
    let counts = { 블랭킹: 0, 프레스: 0, 조립셀: 0 };
    let total = 0;
    ["SKU1", "SKU2", "SKU3", "SKU4"].forEach((sku) => {
      futureDates.forEach((d) => {
        const pred = byDate[d]?.[`Bottleneck_pred_${sku}`];
        if (!pred) return;
        total++;
        const stage = pred.toLowerCase().includes("blank")
          ? "블랭킹"
          : pred.toLowerCase().includes("press")
          ? "프레스"
          : pred.toLowerCase().includes("cell")
          ? "조립셀"
          : "기타";
        if (counts[stage] !== undefined) counts[stage]++;
      });
    });

    const entries = Object.entries(counts).filter(([, v]) => v > 0);
    if (entries.length === 0)
      return { summary: "미래 SKU별 예측 데이터 없음", topStage: null };

    const [topStage, topCount] = entries.sort((a, b) => b[1] - a[1])[0];
    const percent = total > 0 ? ((topCount / total) * 100).toFixed(1) : 0;
    return {
      summary: `SKU1~4 모두 ${percent}% 확률로 ${topStage}에서 향후 병목 발생 예측됨`,
      topStage,
    };
  })();

  // ✅ 미래 공정별 예측 요약
  const futureStageSummary = (() => {
  let counts = {};
  let total = 0;

  futureDates.forEach((d) => {
    const pred = byDate[d]?.Bottleneck_pred_Cell; // 👉 Bottleneck_pred_Cell 필드 사용
    if (!pred) return;

    let t = translateBottleneck(pred); // 예: Cell1 → 조립셀1

    // 👉 세부 단계가 없는 경우 (예: "조립셀"), Queue 값으로 세부 구분
    if (t === "조립셀") {
      const row = byDate[d];
      if (row) {
        const cellQueues = [
          { name: "조립셀1", value: row.Cell1_Queue || 0 },
          { name: "조립셀2", value: row.Cell2_Queue || 0 },
          { name: "조립셀3", value: row.Cell3_Queue || 0 },
          { name: "조립셀4", value: row.Cell4_Queue || 0 },
        ];
        const maxQueue = cellQueues.reduce(
          (max, curr) => (curr.value > max.value ? curr : max),
          { name: t, value: -1 }
        );
        if (maxQueue.value !== -1) {
          t = maxQueue.name; // 최대 Queue를 가진 세부 단계 선택
        } else {
          t = "조립셀1"; // Queue 데이터가 없으면 기본값
        }
      }
    }

    counts[t] = (counts[t] || 0) + 1;
    total++;
  });

  const entries = Object.entries(counts).filter(([, v]) => v > 0);
  if (entries.length === 0) return "미래 공정별 예측 데이터 없음";

  const [topProc, topCount] = entries.sort((a, b) => b[1] - a[1])[0];
  const percent = total > 0 ? ((topCount / total) * 100).toFixed(1) : 0;

  // 👉 요청된 문구 형식: "{공정}에서는 {확률}% 확률로 {세부공정}에서 향후 병목 발생 예측됨"
  const baseStage = topProc.replace(/\d+$/, ""); // 예: 조립셀1 → 조립셀
  return `${baseStage}에서는 ${percent}% 확률로 ${topProc}에서 향후 병목 발생 예측됨`;
})();








// ✅ 전후 상태 선택 (before/after)
const [viewMode, setViewMode] = useState("before");








// 최신 데이터
const latest = byDate[filters.date] || byDate[pastDates[pastDates.length - 1]] || {};




// ✅ SankeyConfig 동적 생성 함수
const buildSankeyConfig = (row) => {
  if (!row) return { skuToBefore: {}, skuToAfter: {} };

  // 생산량 매트릭스: production[cellIdx][skuIdx]
  const production = Array.from({ length: 4 }, () => Array(4).fill(0));
  for (let c = 0; c < 4; c++) {
    for (let s = 0; s < 4; s++) {
      production[c][s] = Number(row[`c_Cell${c + 1}_SKU${s + 1}`] || 0);
    }
  }

  // 셀별 총 생산량
  const cellTotals = production.map(row => row.reduce((sum, val) => sum + val, 0));
  const totalProduction = cellTotals.reduce((sum, val) => sum + val, 0);
  const avgPerCell = totalProduction / 4; // 목표 평균 생산량

  // 병목 셀 찾기
  const bneckIdx = cellTotals.indexOf(Math.max(...cellTotals));
  const productionAfter = production.map(row => [...row]);

  // 초과분 분배: 병목 > 평균일 때
  const excessTotal = cellTotals[bneckIdx] - avgPerCell;
  if (excessTotal > 0) {
    const bneckSkuTotals = production[bneckIdx];
    const bneckSum = cellTotals[bneckIdx];
    for (let s = 0; s < 4; s++) {
      if (bneckSkuTotals[s] === 0) continue;
      const skuExcessRatio = bneckSkuTotals[s] / bneckSum; // SKU 비율
      const skuExcess = excessTotal * skuExcessRatio; // SKU별 초과분
      productionAfter[bneckIdx][s] -= skuExcess; // 병목 감소
      const share = skuExcess / 3; // 나머지 3셀에 분배
      for (let c = 0; c < 4; c++) {
        if (c !== bneckIdx) {
          productionAfter[c][s] += share;
        }
      }
    }
  }

  // skuToBefore: 비율 계산 (SKU 중심)
  const skuToBefore = {};
  for (let s = 0; s < 4; s++) {
    const totalSku = production.reduce((sum, row) => sum + row[s], 0);
    skuToBefore[`SKU${s + 1}`] = {};
    if (totalSku > 0) {
      for (let c = 0; c < 4; c++) {
        skuToBefore[`SKU${s + 1}`][`Cell${c + 1}`] = production[c][s] / totalSku;
      }
    }
  }

  // skuToAfter: 비율 계산
  const skuToAfter = {};
  for (let s = 0; s < 4; s++) {
    const totalSkuAfter = productionAfter.reduce((sum, row) => sum + row[s], 0);
    skuToAfter[`SKU${s + 1}`] = {};
    if (totalSkuAfter > 0) {
      for (let c = 0; c < 4; c++) {
        skuToAfter[`SKU${s + 1}`][`Cell${c + 1}`] = productionAfter[c][s] / totalSkuAfter;
      }
    }
  }

  // 총합 검증
  const sumAfter = productionAfter.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);
  if (Math.abs(totalProduction - sumAfter) > 0.01) {
    console.warn(`Production Sum Mismatch: Before=${totalProduction}, After=${sumAfter}`);
  }

  return { skuToBefore, skuToAfter };
};


// ✅ 최신 데이터 기반 sankeyConfig 만들기
const sankeyConfig = buildSankeyConfig(latest);











// ✅ Cell ↔ SKU 매핑 (실제 공정 규칙에 맞춰 수정 가능)
const computeQueueFlow = (row) => {
  if (!row) return { before: [], after: [] };

  const cells = ["Cell1", "Cell2", "Cell3", "Cell4"];
  // Before: 원본 Queue
  const before = cells.map((c) => Number(row[`${c}_Queue`] || 0));
  const total = before.reduce((sum, val) => sum + val, 0);
  const avg = total / 4; // 전체 평균

  // 병목 Cell 찾기
  const bneckIdx = before.indexOf(Math.max(...before));
  const after = [...before];

  // 초과분 분배: 병목 > 평균일 때
  const excess = before[bneckIdx] - avg;
  if (excess > 0) {
    after[bneckIdx] = avg; // 병목을 평균으로
    const share = excess / 3; // 나머지 3셀에 균등 분배
    const eligible = cells.filter((_, i) => i !== bneckIdx);
    eligible.forEach((c) => {
      const idx = cells.indexOf(c);
      after[idx] += share;
    });
  }

  // 총합 검증
  const sumBefore = before.reduce((a, b) => a + b, 0);
  const sumAfter = after.reduce((a, b) => a + b, 0);
  if (Math.abs(sumBefore - sumAfter) > 0.01) {
    console.warn(`Queue Sum Mismatch: Before=${sumBefore}, After=${sumAfter}`);
  }

  return { before, after };
};












// ✅ 최신 데이터 기반으로 계산
const { before, after } = computeQueueFlow(latest);




// ✅ Bar 차트 옵션 (전/후 하나만 표시, y축 범위 고정)
const makeBarOption = (before, after, mode) => {
  const cells = ["Cell1", "Cell2", "Cell3", "Cell4"];
  const data = mode === "before" ? before : after;

  // ✅ before/after 중 최대값 찾기
  const maxVal = Math.max(...before, ...after);

  return {
    tooltip: { trigger: "axis" },
    legend: { show: false },
    xAxis: { type: "category", data: cells },
    yAxis: {
      type: "value",
      min: 0,
      max: Math.ceil(maxVal * 1.1), // ✅ 여유 10% 줘서 보기 좋게
    },
    series: [
      {
        type: "bar",
        data: data.map((v, i) => ({
          value: v,
          itemStyle: { color: SKU_COLORS[`SKU${i + 1}`] }, // ✅ SKU 색상 적용
        })),
      },
    ],
  };
};

























// 번호별 팔레트: Cell=진한색, SKU=연한색
// const PALETTE = {
//   1: { cell: "#2563eb", sku: "#93c5fd" },  // 파랑
//   2: { cell: "#10b981", sku: "#6ee7b7" },  // 초록
//   3: { cell: "#7c3aed", sku: "#c4b5fd" },  // 보라
//   4: { cell: "#f59e0b", sku: "#fcd34d" },  // 주황
// };

// const getNumFromName = (name) => {
//   const m = String(name).match(/(\d)/);
//   return m ? Number(m[1]) : null;
// };

// const colorForNode = (name) => {
//   const n = getNumFromName(name);
//   if (!n) return "#94a3b8";
//   if (name.includes("SKU")) return PALETTE[n].sku;
//   return PALETTE[n].cell;
// };









// ✅ SKU 고정 색상
const SKU_COLORS = {
  SKU1: "#2563eb", // 파랑
  SKU2: "#10b981", // 초록
  SKU3: "#7c3aed", // 보라
  SKU4: "#f59e0b", // 주황
};

// ✅ Cell 연한 색상
const CELL_COLORS = {
  1: "#93c5fd",  // 연파랑
  2: "#6ee7b7",  // 연초록
  3: "#c4b5fd",  // 연보라
  4: "#fcd34d",  // 연주황
};

// ✅ 이름에서 번호 추출
const getNumFromName = (name) => {
  const m = String(name).match(/(\d)/);
  return m ? Number(m[1]) : null;
};

// ✅ 색상 매핑 함수
const colorForNode = (name) => {
  if (name.startsWith("SKU")) {
    return SKU_COLORS[name] || "#94a3b8";
  }
  const n = getNumFromName(name);
  return CELL_COLORS[n] || "#94a3b8";
};






// ✅ Sankey 옵션 (CELL → SKU 고정)
const makeSankeyOption = (skuToBefore, skuToAfter, mode) => {
  const cells = ["Cell1", "Cell2", "Cell3", "Cell4"];
  const skus = ["SKU1", "SKU2", "SKU3", "SKU4"];

  // 노드: 항상 CELL → SKU
  const nodes = [
    ...cells.map((c) => ({
      name: `${c} (${mode})`,
      depth: 0,
      itemStyle: { color: colorForNode(c) },
      label: { color: "#111827", fontSize: 12 },
    })),
    ...skus.map((s) => ({
      name: s,
      depth: 1,
      itemStyle: { color: colorForNode(s) },
      label: { color: "#111827", fontSize: 12 },
    })),
  ];

  // 링크: Cell → SKU
  const links =
    mode === "before"
      ? cells.flatMap((cell) =>
          skus
            .filter((sku) => (skuToBefore[sku]?.[cell] ?? 0) > 0)
            .map((sku) => ({
              source: `${cell} (before)`,
              target: sku,
              value: skuToBefore[sku][cell],
            }))
        )
      : cells.flatMap((cell) =>
          skus
            .filter((sku) => (skuToAfter[sku]?.[cell] ?? 0) > 0)
            .map((sku) => ({
              source: `${cell} (after)`,
              target: sku,
              value: skuToAfter[sku][cell],
            }))
        );

  return {
    tooltip: {
      trigger: "item",
      formatter: (p) => {
        if (p.dataType === "edge") {
          return `${p.data.source} → ${p.data.target}: ${(Number(p.value) * 100).toFixed(1)}%`;
        }
        return p.data.name;
      },
    },
    series: [
      {
        type: "sankey",
        nodeAlign: "justify", // 좌우 여백 균일
        draggable: false,
        emphasis: { focus: "adjacency" },
        data: nodes,
        links,
        lineStyle: { color: "source", curveness: 0.5, opacity: 0.6 },
      },
    ],
  };
};



























const availableDates = Object.keys(byDate);  // 실제 DB에서 내려온 날짜들
  const past7Dates = useMemo(() => {
    return getPastDates(filters.date, 7).filter((d) => availableDates.includes(d));
  }, [filters.date, byDate]);












// ✅ 영향도 매핑
const impactMapping = {
  Blanking_SKU4_Queue: 8014.621055,
  Blanking_SKU3_Queue: 5490.032026,
  Blanking_SKU1_Queue: 3903.947551,
  Blanking_SKU2_Queue: 761.9814485,
  Quality_Queue: 291.523455,
  Blanking_Queue: 171.6450285,
  Bottleneck_actual_Forklift_Blanking_Queue: 59.57540731,
  Bottleneck_actual_Cell3_Queue: -38.07273859,
  Forklift_Assembly_Queue: -34.05873643,
  Cell1_Queue: -28.44256136,
  Cell4_Queue: -22.95752247,
  Forklift_Press_Queue: -15.95779415,
  Cell3_Queue: -6.781044675,
  Forklift_Blanking_Queue: -4.507178062,
  Press3_Queue: 2.960711111,
  Press2_Queue: -1.999469585,
  Press4_Queue: 1.907993839,
  Press1_Queue: 1.233813105,
  Cell2_Queue: 1.080143683,
  Cell_SKU4_Queue: 0.001410595,
  Cell_SKU3_Queue: 0.001266782,
  Cell_SKU1_Queue: 0.000930683,
  Cell_SKU2_Queue: 0.000714764,
};

// ✅ 전일 대비 증감 계산
const todayRow = byDate[filters.date];
const prevDate = availableDates.filter(d => d < filters.date).pop();
const prevRow = prevDate ? byDate[prevDate] : null;

let changeMsg = "데이터 없음";
if (todayRow && prevRow && prevRow.c_TotalProducts > 0) {
  const diff = todayRow.c_TotalProducts - prevRow.c_TotalProducts;
  const diffPct = (diff / prevRow.c_TotalProducts) * 100;
  const sign = diff > 0 ? "+" : "";
  changeMsg = `${sign}${diff.toFixed(0)} (${sign}${diffPct.toFixed(1)}%)`;
}

// ✅ 영향도 값 가져오기
const bottleneckKey = latest?.Bottleneck_actual;
const impactVal = impactMapping[bottleneckKey] ?? 0;

// ✅ 최종 메시지
const alertMessage =
    `⚠️ [${translateBottleneck(bottleneckKey)}]에서 병목이 발생했습니다. `
  + `이는 통합 생산량에 약 ${impactVal.toFixed(1)}의 영향을 줄 것으로 보입니다. `
  + `전날보다 생산량은 ${changeMsg} 예상됩니다.`;
























  [...pastDates, today].forEach((d, xIdx) => {
    const row = byDate[d];
    if (!row || !row.Bottleneck_actual) return;
    const actual = row.Bottleneck_actual.toLowerCase();
    if (actual.includes("forklift") && actual.includes("blank"))
      fullHeatmapData.push([xIdx, stages.indexOf("블랭킹 지게차"), 1]);
    else if (actual.includes("forklift") && actual.includes("press"))
      fullHeatmapData.push([xIdx, stages.indexOf("프레스 지게차"), 1]);
    else if (actual.includes("cell"))
      fullHeatmapData.push([xIdx, stages.indexOf("조립셀"), 1]);
    else if (actual.includes("press"))
      fullHeatmapData.push([xIdx, stages.indexOf("프레스"), 1]);
    else if (actual.includes("blank"))
      fullHeatmapData.push([xIdx, stages.indexOf("블랭킹"), 1]);
  });

  futureDates.forEach((d, idx) => {
    const xIdx = pastDates.length + 1 + idx;
    const row = byDate[d];
    if (!row || !row.Bottleneck_pred) return;
    const pred = row.Bottleneck_pred.toLowerCase();
    if (pred.includes("forklift") && pred.includes("blank"))
      fullHeatmapData.push([xIdx, stages.indexOf("블랭킹 지게차"), 2]);
    else if (pred.includes("forklift") && pred.includes("press"))
      fullHeatmapData.push([xIdx, stages.indexOf("프레스 지게차"), 2]);
    else if (pred.includes("cell"))
      fullHeatmapData.push([xIdx, stages.indexOf("조립셀"), 2]);
    else if (pred.includes("press"))
      fullHeatmapData.push([xIdx, stages.indexOf("프레스"), 2]);
    else if (pred.includes("blank"))
      fullHeatmapData.push([xIdx, stages.indexOf("블랭킹"), 2]);
  });

  // ✅ 애니메이션 효과
  useEffect(() => {
    if (pageLoading || !data || data.length === 0) {
      setAnimatedHeatmapData([]);
      setCurrentIndex(0);
      setShowPastLabel(false);
      setShowFutureLabel(false);
      return;
    }
    if (currentIndex >= fullHeatmapData.length) return;
    const timer = setTimeout(() => {
      setAnimatedHeatmapData((prev) => {
        const newData = [...prev, fullHeatmapData[currentIndex]];
        const currentData = fullHeatmapData[currentIndex];
        if (currentData[2] === 1) setShowPastLabel(true);
        else if (currentData[2] === 2) setShowFutureLabel(true);
        return newData;
      });
      setCurrentIndex((prev) => prev + 1);
    }, 500);
    return () => clearTimeout(timer);
  }, [currentIndex, fullHeatmapData, pageLoading, data]);

  // ✅ 조건부 렌더링
  if (pageLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
        <CircularProgress size={60} sx={{ color: themeHex }} />
      </Box>
    );
  }

  if (pageError || error.overview) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="error">❌ {pageError || error.overview}</Typography>
        <Button
          onClick={fetchBottleneckOverview}
          sx={{ mt: 2, backgroundColor: themeHex }}
          variant="contained"
        >
          다시 시도
        </Button>
      </Box>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography color="text.secondary">데이터 없음</Typography>
      </Box>
    );
  }

  

  // Radar 차트 최대치
  const maxQueueValue = Math.max(
    (latest?.Cell1_Queue || 0) +
      (latest?.Cell2_Queue || 0) +
      (latest?.Cell3_Queue || 0) +
      (latest?.Cell4_Queue || 0),
    (latest?.Press1_Queue || 0) +
      (latest?.Press2_Queue || 0) +
      (latest?.Press3_Queue || 0) +
      (latest?.Press4_Queue || 0),
    (latest?.Blanking_SKU1_Queue || 0) +
      (latest?.Blanking_SKU2_Queue || 0) +
      (latest?.Blanking_SKU3_Queue || 0) +
      (latest?.Blanking_SKU4_Queue || 0),
    latest?.Forklift_Blanking_Queue || 0,
    latest?.Forklift_Press_Queue || 0
  );
  const radarMax = Math.ceil(maxQueueValue * 1.1);


  // Radar 차트 옵션
  const radarOption = {
    tooltip: {
      formatter: (params) =>
        params.name +
        "<br/>" +
        params.value
          .map(
            (v, i) =>
              `${radarOption.radar.indicator[i].name}: ${Number(v).toFixed(2)}`
          )
          .join("<br/>"),
    },
    legend: { data: ["실시간 병목 현황"], top: "bottom" },
    radar: {
      indicator: [
        { name: "블랭킹", max: radarMax },
        { name: "블랭킹 지게차", max: radarMax },
        { name: "프레스", max: radarMax },
        { name: "프레스 지게차", max: radarMax },
        { name: "조립셀", max: radarMax },
      ],
    },
    series: [
      {
        name: "실시간 병목 현황",
        type: "radar",
        data: [
          {
            value: [
              (latest?.Blanking_SKU1_Queue || 0) +
                (latest?.Blanking_SKU2_Queue || 0) +
                (latest?.Blanking_SKU3_Queue || 0) +
                (latest?.Blanking_SKU4_Queue || 0),
              latest?.Forklift_Blanking_Queue || 0,
              (latest?.Press1_Queue || 0) +
                (latest?.Press2_Queue || 0) +
                (latest?.Press3_Queue || 0) +
                (latest?.Press4_Queue || 0),
              latest?.Forklift_Press_Queue || 0,
              (latest?.Cell1_Queue || 0) +
                (latest?.Cell2_Queue || 0) +
                (latest?.Cell3_Queue || 0) +
                (latest?.Cell4_Queue || 0),
            ],
            name: "실시간 병목 현황",
          },
        ],
        itemStyle: { color: themeHex },
      },
    ],
  };


  // Pie 차트 데이터

  let pieData = [
    {
      name: "블랭킹",
      value: past7Dates.reduce(
        (s, d) =>
          s +
          (byDate[d]?.Blanking_SKU1_Queue || 0) +
          (byDate[d]?.Blanking_SKU2_Queue || 0) +
          (byDate[d]?.Blanking_SKU3_Queue || 0) +
          (byDate[d]?.Blanking_SKU4_Queue || 0),
        0
      ),
    },
    {
      name: "블랭킹 지게차",
      value: past7Dates.reduce(
        (s, d) => s + (byDate[d]?.Forklift_Blanking_Queue || 0),
        0
      ),
    },
    {
      name: "프레스",
      value: past7Dates.reduce(
        (s, d) =>
          s +
          (byDate[d]?.Press1_Queue || 0) +
          (byDate[d]?.Press2_Queue || 0) +
          (byDate[d]?.Press3_Queue || 0) +
          (byDate[d]?.Press4_Queue || 0),
        0
      ),
    },
    {
      name: "프레스 지게차",
      value: past7Dates.reduce(
        (s, d) => s + (byDate[d]?.Forklift_Press_Queue || 0),
        0
      ),
    },
    {
      name: "조립셀",
      value: past7Dates.reduce(
        (s, d) =>
          s +
          (byDate[d]?.Cell1_Queue || 0) +
          (byDate[d]?.Cell2_Queue || 0) +
          (byDate[d]?.Cell3_Queue || 0) +
          (byDate[d]?.Cell4_Queue || 0),
        0
      ),
    },
  ];
  pieData = pieData.sort((a, b) => b.value - a.value);

  const pieOption = {
    tooltip: {
      trigger: "item",
      formatter: (p) => `${p.name}: ${Number(p.value).toFixed(2)} (${p.percent}%)`,
    },
    series: [
      {
        name: "주간 병목 빈도",
        type: "pie",
        radius: "70%",
        label: { formatter: "{b}: {d}%" },
        data: pieData,
      },
    ],
  };




  




  // ✅ 회색 배경 데이터: 과거+오늘 날짜 전체
  const grayBackgroundData = [];
  [...pastDates, today].forEach((d, xIdx) => {
    stages.forEach((stage, yIdx) => {
      grayBackgroundData.push([xIdx, yIdx, 0]); // 0 = 회색
    });
  });

  // ✅ blockOption 수정
  const blockOption = {
    tooltip: {
      formatter: (p) => {
        const date = allDates[p.data[0]];
        const stage = stages[p.data[1]];
        if (p.data[2] === 0) return `${date}<br/>${stage} : 기록 없음`;
        const type = p.data[2] === 1 ? "실제 병목" : "예측 병목";
        return `${date}<br/>${stage} : ${type}`;
      },
    },
    grid: { top: 60, bottom: 20, left: 110, right: 20 },
    xAxis: {
      type: "category",
      data: allDates.map((d) => d.slice(5)),
      splitLine: { show: true },
      axisLine: { show: true },
      markLine: {
        data: [{ xAxis: pastDates.length }], // 오늘 위치
        lineStyle: { color: "black", type: "solid" },
      },
    },
    yAxis: {
      type: "category",
      data: stages,
      axisLabel: { margin: 20 },
      splitLine: { show: true },
    },
    visualMap: {
      show: false,
      min: 0,
      max: 2,
      inRange: {
        color: [
          "rgba(200,200,200,0.2)", // 0 → 회색 (배경)
          "#ef4444",               // 1 → 빨강 (과거 병목)
          "#3b82f6",               // 2 → 파랑 (예측 병목)
        ],
      },
    },
    series: [
      {
        type: "heatmap",
        data: grayBackgroundData, // ✅ 전체 회색 배경
        silent: true,             // tooltip 안뜨게 하고 싶으면 true
      },
      {
        type: "heatmap",
        data: animatedHeatmapData, // ✅ 실제 병목 데이터
      },
    ],
  };








  
  

  return (
    <div className={styles.dashboard}>
      {/* 제목 + 설명 */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: "bold", color: themeHex }}
        >
          병목 공정 예측
        </Typography>
        <Typography variant="body1" color="text.secondary">
          주요 공정의 병목 현황과 예측 결과를 시각화합니다.
        </Typography>
      </Box>

      {/* 검색 필터 섹션 */}
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <CardHeader
          title={
            <Typography
              variant="h6"
              sx={{ display: "flex", alignItems: "center", gap: 1, color: "white" }}
            >
              <SearchIcon />
              검색 조건
            </Typography>
          }
          sx={{
            backgroundColor: themeHex,
            color: "white",
            borderRadius: 1,
            mb: 2,
          }}
        />
        <Grid container spacing={2} alignItems="center">
          {/* 일간 버튼만 고정 */}
          <Grid item>
            <Button
              size="small"
              variant="contained"
              sx={{ backgroundColor: themeHex, "&:hover": { backgroundColor: themeHex } }}
            >
              일간
            </Button>
          </Grid>

          {/* 단일 날짜 선택 */}
          <Grid item>
            <Typography sx={{ mr: 1 }}>기준일 선택</Typography>
          </Grid>
          <Grid item>
            <TextField
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange("date", e.target.value)}
              size="small"
              variant="outlined"
              inputProps={{
                min: "2024-01-06",
                max: "2025-06-27",
              }}
              sx={{ backgroundColor: "white", borderRadius: 1, minWidth: 160 }}
            />
          </Grid>
        </Grid>
      </Paper>










      {/* 경고 박스 */}
      <div className={styles.alert}>
        {/* ⚠️ {translateBottleneck(latest?.Bottleneck_actual)}에서 병목이 발생하여 생산량에{" "}
        {formatNumber(latest?.Cell1_Queue_Percent)}% 정도 영향이 예상됩니다. */}
        {alertMessage}
      </div>



      {/* 1행: Radar + 공정도 */}

      {/* 1행: 공정도(좌측) + 실시간 병목 현황(Radar, 우측) */}
      <div className={styles.grid}>
        {/* 공정도 */}
        <div className={styles.card} aria-label="공정 흐름도">

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>공정도</h2>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              ({filters.date})
            </span>
          </div>
          <div className={styles.flow}></div>

          <div className={styles.flow}>
            {/* 블랭킹 */}
            <div className={styles.row}>
              {[1, 2, 3, 4].map((i) => (
                <Tooltip
                  key={`blanking${i}`}
                  title={`Queue: ${formatNumber(latest?.[`Blanking_${i}_Queue`] || 0)}`}
                  placement="top"
                >
                  <div
                    className={`${styles.stage} ${
                      latest?.Bottleneck_actual?.toLowerCase().includes(`blanking${i}`)
                        ? styles.stageRed
                        : ""
                    }`}
                  >
                    블랭킹{i}
                  </div>
                </Tooltip>
              ))}
            </div>
            <div className={styles.arrow}>↓</div>

            {/* 블랭킹 지게차 */}
            <div className={styles.row}>
              <Tooltip
                title={`Queue: ${formatNumber(latest?.Forklift_Blanking_Queue || 0)}`}
                placement="top"
              >
                <div
                  className={`${styles.stage} ${styles.wide} ${
                    latest?.Bottleneck_actual?.toLowerCase().includes("forklift_blank")
                      ? styles.stageRed
                      : ""
                  }`}
                >
                  블랭킹 지게차
                </div>
              </Tooltip>
            </div>
            <div className={styles.arrow}>↓</div>

            {/* 프레스 */}
            <div className={styles.row}>
              {[1, 2, 3, 4].map((i) => (
                <Tooltip
                  key={`press${i}`}
                  title={`Queue: ${formatNumber(latest?.[`Press${i}_Queue`] || 0)}`}
                  placement="top"
                >
                  <div
                    className={`${styles.stage} ${
                      latest?.Bottleneck_actual?.toLowerCase().includes(`press${i}`)
                        ? styles.stageRed
                        : ""
                    }`}
                  >
                    프레스{i}
                  </div>
                </Tooltip>
              ))}
            </div>
            <div className={styles.arrow}>↓</div>

            {/* 프레스 지게차 */}
            <div className={styles.row}>
              <Tooltip
                title={`Queue: ${formatNumber(latest?.Forklift_Press_Queue || 0)}`}
                placement="top"
              >
                <div
                  className={`${styles.stage} ${styles.wide} ${
                    latest?.Bottleneck_actual?.toLowerCase().includes("forklift_press")
                      ? styles.stageRed
                      : ""
                  }`}
                >
                  프레스 지게차
                </div>
              </Tooltip>
            </div>
            <div className={styles.arrow}>↓</div>

            {/* 조립셀 */}
            <div className={styles.row}>
              {[1, 2, 3, 4].map((i) => (
                <Tooltip
                  key={`cell${i}`}
                  title={`Queue: ${formatNumber(latest?.[`Cell${i}_Queue`] || 0)}`}
                  placement="top"
                >
                  <div
                    className={`${styles.stage} ${
                      latest?.Bottleneck_actual?.toLowerCase().includes(`cell${i}`)
                        ? styles.stageRed
                        : ""
                    }`}
                  >
                    조립셀{i}
                  </div>
                </Tooltip>
              ))}
            </div>
          </div>
        </div>

        {/* 실시간 병목 현황 */}
        <div className={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>실시간 병목 현황</h2>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              ({filters.date})
            </span>
          </div>
          <ReactECharts option={radarOption} style={{ height: "400px" }} />
        </div>

      </div>





      {/* 2행: Pie + Heatmap */}
      <div className={styles.grid}>
        <div className={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>📊 과거 병목 시각화 (주간)</h2>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              {past7Dates.length > 0
                ? `(${past7Dates[0]} ~ ${past7Dates[past7Dates.length - 1]})`
                : "(데이터 없음)"}
            </span>
          </div>
          <ReactECharts option={pieOption} style={{ height: "280px" }} />
        </div>

        <div className={styles.card}>
          <h2>날짜별 병목 기록 및 예측</h2>
          <div style={{ position: "relative", height: "280px" }}>
            <ReactECharts option={blockOption} style={{ height: "280px" }} />
            {showPastLabel && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  left: "20px",
                  color: "#ef4444",
                  fontWeight: "bold",
                  fontSize: "14px",
                  zIndex: 10,
                }}
              >
                과거 병목 기록
              </div>
            )}
            {showFutureLabel && (
              <div
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "20px",
                  color: "#3b82f6",
                  fontWeight: "bold",
                  fontSize: "14px",
                  zIndex: 10,
                }}
              >
                미래 병목 예측
              </div>
            )}
          </div>
        </div>
      </div>


      {/* 1행: SKU + 공정 병목 분석 (수평 2개 카드) */}
      <div className={styles.grid}>
        {/* (1) SKU별 병목 비율 종합 + SKU별 병목 예측 */}
        <div className={styles.card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>📦 SKU별 병목 분석</h2>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              {pastDates.length > 0
                ? `(${pastDates[0]} ~ ${pastDates[pastDates.length - 1]})`
                : "(데이터 없음)"}
            </span>
          </div>

          {/* SKU별 병목 비율 종합 (파이차트) */}
          <ReactECharts
            option={makePieOption("", skuTotalPieData)}
            style={{ height: "280px" }}
          />

          {/* SKU별 병목 예측 (텍스트 박스) */}
          <div
            style={{
              marginTop: "16px",
              background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid #bfdbfe",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#1e40af",
              }}
            >
              예측 결과
            </h3>
            <div
              style={{
                background: "white",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#1e293b",
                border: "1px solid #e2e8f0",
              }}
            >
              {futureSkuSummary.summary}
            </div>
          </div>
        </div>

        {/* (2) 조립셀 세부 병목 비율 + 공정별 병목 예측 */}
        <div className={styles.card}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0 }}>⚙️ 공정별 병목 분석</h2>
            <span style={{ fontSize: "14px", color: "#6b7280" }}>
              {pastDates.length > 0
                ? `(${pastDates[0]} ~ ${pastDates[pastDates.length - 1]})`
                : "(데이터 없음)"}
            </span>
          </div>

          {/* 조립셀 세부 병목 비율 (파이차트) */}
          {topStage ? (
            <ReactECharts
              option={makePieOption("", topStageData)}
              style={{ height: "280px" }}
            />
          ) : (
            <Typography color="text.secondary">데이터 없음</Typography>
          )}

          {/* 공정별 병목 예측 (텍스트 박스) */}
          <div
            style={{
              marginTop: "16px",
              background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid #bbf7d0",
            }}
          >
            <h3
              style={{
                fontSize: "15px",
                fontWeight: "bold",
                marginBottom: "8px",
                color: "#166534",
              }}
            >
              예측 결과
            </h3>
            <div
              style={{
                background: "white",
                padding: "10px",
                borderRadius: "6px",
                fontSize: "14px",
                lineHeight: "1.5",
                color: "#1e293b",
                border: "1px solid #e2e8f0",
              }}
            >
              {futureStageSummary}
            </div>
          </div>
        </div>
      </div>


      

      









      {/* 인사이트 */}
      <div className={`${styles.insight} ${styles.section}`}>
        병목 집중 지점: <b>{translateBottleneck(latest?.Bottleneck_actual)}</b> → SKU 분산
        재배치를 통한 부하 균형 조정이 요구됨.
      </div>








      {/* 전/후 선택 버튼 */}
      <Box sx={{ display: "flex", justifyContent: "flex-start", mb: 2, gap: 2 }}>
        <Button
          size="large"
          variant={viewMode === "before" ? "contained" : "outlined"}
          onClick={() => setViewMode("before")}
          sx={{
            px: 3,
            py: 1,
            fontWeight: "bold",
            borderRadius: "20px",
            boxShadow: viewMode === "before" ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
            background: viewMode === "before" ? themeHex : "white",
            color: viewMode === "before" ? "white" : themeHex,
            borderColor: themeHex,
            "&:hover": {
              background: viewMode === "before" ? themeHex : "rgba(0,0,0,0.04)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            },
          }}
        >
          재분배 전
        </Button>

        <Button
          size="large"
          variant={viewMode === "after" ? "contained" : "outlined"}
          onClick={() => setViewMode("after")}
          sx={{
            px: 3,
            py: 1,
            fontWeight: "bold",
            borderRadius: "20px",
            boxShadow: viewMode === "after" ? "0 4px 12px rgba(0,0,0,0.2)" : "none",
            background: viewMode === "after" ? themeHex : "white",
            color: viewMode === "after" ? "white" : themeHex,
            borderColor: themeHex,
            "&:hover": {
              background: viewMode === "after" ? themeHex : "rgba(0,0,0,0.04)",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
            },
          }}
        >
          재분배 후
        </Button>
      </Box>






      

      {/* 원래 vs 제안 + Queue 변화 */}
      <div className={styles.grid}>
        {/* Sankey 다이어그램 */}
        <div className={styles.card}>
          <h2>재분배 {viewMode === "before" ? "전" : "후"} 흐름 (SKU → Cell)</h2>
          <ReactECharts
            option={makeSankeyOption(sankeyConfig.skuToBefore, sankeyConfig.skuToAfter, viewMode)}
            style={{ height: 400 }}
          />
        </div>

        {/* Bar 차트 */}
        <div className={styles.card}>
          <h2>재분배 {viewMode === "before" ? "전" : "후"} Cell별 Queue 변화</h2>
          <ReactECharts
            option={makeBarOption(before, after, viewMode)} // ✅ viewMode 반영
            style={{ height: 400 }}
          />
        </div>

      </div>






      



    </div>
  );
};

export default Bottleneck;