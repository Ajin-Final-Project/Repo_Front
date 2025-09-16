import React, { Component } from "react";

import {
  Typography,
  Paper,
  List,
  ListItem
} from "@mui/material";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList,
} from 'recharts';



import { BarChart as BarChartIcon } from "@mui/icons-material";

// ===== 커스텀 툴팁 (교체) =====
const CustomTooltip = ({ active, payload, fmtDuration, fmtNumber, themeHex = '#ffb74d' }) => {
  if (!active || !payload?.length) return null;

  const total = Number(payload[0]?.value ?? 0);
  const top3 = payload[0]?.payload?.top3 || [];

  return (
    <Paper
      elevation={4}
      sx={{
        p: 1.5,
        pr: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        minWidth: 220,
        pointerEvents: 'none',   // 호버 끊김 방지
      }}
    >
      {/* 헤더: 컬러 바 + 총 비가동 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span
          style={{
            display: 'inline-block',
            width: 6,
            height: 24,
            borderRadius: 4,
            backgroundColor: themeHex,
            flex: '0 0 6px',
          }}
        />
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          총 비가동: {fmtDuration(total)}
        </Typography>
      </div>

      {/* 서브 타이틀 */}
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        최다 비가동 TOP 3
      </Typography>

      {/* 리스트: 좌우 정렬(이름 / 시간) */}
      <div
        style={{
          marginTop: 6,
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          columnGap: 12,
          rowGap: 4,
          fontFeatureSettings: '"tnum"',
        }}
      >
        {top3.map((item, i) => (
          <React.Fragment key={i}>
            <Typography variant="body2">{item.name}</Typography>
            <Typography variant="body2" style={{ fontWeight: 600 }}>
              {fmtDuration(Number(item.minutes || 0))}
            </Typography>
          </React.Fragment>
        ))}
      </div>
    </Paper>
  );
};


// ===== 메인 컴포넌트 =====
export default function MonthlySection({
  chartMonths,
  chartSeries,
  chartItemCode, // prop 유지용
  monthTop3Map,
  themeHex = '#ffb74d',
  monthValueFormatter,
  fmtNumber,
  fmtDuration
}) {

  // 데이터 구성
  const data = chartMonths.map((m, i) => ({
    name: monthValueFormatter ? monthValueFormatter(m) : m,
    value: Number(chartSeries?.[0]?.data?.[i] ?? 0),
    top3: monthTop3Map?.[m] || [],
  }));

  const yMax = Math.max(...data.map(d => d.value), 0);
  const yPadding = yMax > 0 ? Math.ceil(yMax * 0.15) : 50;

  // 막대 위 라벨
  const renderTopLabel = ({ x, y, width, value }) => {
    if (value == null) return null;
    return (
      <text
        x={x + width / 2}
        y={y - 8}
        textAnchor="middle"
        fontSize={12}
        fill="#000"
        style={{ pointerEvents: 'none' }}
      >
        {fmtDuration(Number(value))}
      </text>
    );
  };

    // 품번 미선택시 안내 문구
    if (!chartItemCode) {
      return (
        <Paper
          sx={{
            p: 4,
            borderRadius: "16px",
            textAlign: "center",
            color: "text.secondary",
            bgcolor: "background.default",
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            월별 비가동 합계
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            품번을 선택하면 아래와 같이 <strong>월별 합계가 막대 그래프</strong>로 표시됩니다.
          </Typography>

          <List dense sx={{ display: "inline-block", textAlign: "left", mt: 1 }}>
            <ListItem disableGutters>• 월별 총 비가동 시간(분)</ListItem>
            <ListItem disableGutters>• 각 월별 최다 비가동 TOP 3 항목</ListItem>
          </List>

          <Typography variant="body2" sx={{ mt: 2 }}>
            상단/좌측의 품번 선택 영역에서 원하는 품번을 먼저 선택해 주세요.
          </Typography>
        </Paper>
      );
    }




  return (
    // 부모 컨테이너가 width를 가지고 있어야 함(예: width: 100%)
    <div style={{ width: '100%' }}>
      <Typography variant="h6" sx={{ color: themeHex, mb: 1 }}>
        <BarChartIcon /> {chartItemCode || "-"} · 월별 비가동 합계
      </Typography>
      {/* ★ 고정 width/height 금지. ResponsiveContainer로 자동 리사이즈 */}
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 24 }}
          // 퍼센트로 간격을 주면 컨테이너 크기 변화에 비례해서 간격도 자동 조절
          barCategoryGap="20%"
        >
          {/* 점선 그리드가 필요 없으면 이 줄 삭제 */}
          <CartesianGrid strokeDasharray="3 3" horizontal={false} vertical={false} />

          {/* 축 실선/틱 꼬리선 제거 */}
          <XAxis dataKey="name" />
          <YAxis
            allowDecimals={false}
            domain={[0, yMax + yPadding]}
            tickFormatter={(v) => fmtNumber(v)}
          />

          <Tooltip content={
            <CustomTooltip fmtDuration={fmtDuration} fmtNumber={fmtNumber}  themeHex={themeHex}/>
          } />

          <Bar
            dataKey="value"
            fill={themeHex}
            isAnimationActive={false}
            radius={[6, 6, 0, 0]}
            maxBarSize={90}
          >
            <LabelList content={renderTopLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
