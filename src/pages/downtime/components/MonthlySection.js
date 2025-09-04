import { Typography } from "@mui/material";
import {
  ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList,
} from 'recharts';

import { BarChart as BarChartIcon } from "@mui/icons-material";

// ===== 커스텀 툴팁 =====
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const top3 = payload[0]?.payload?.top3 || [];
    return (
      <div style={{ backgroundColor: '#fff', padding: 10, border: '1px solid #ccc' }}>
        <p>{`총 비가동: ${payload[0].value}분`}</p>
        <p>최다 비가동 TOP 3</p>
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {top3.map((item, i) => (
            <li key={i}>{`${item.name}: ${item.minutes}분`}</li>
          ))}
        </ol>
      </div>
    );
  }
  return null;
};

// ===== 메인 컴포넌트 =====
export default function MonthlySection({
  chartMonths,
  chartSeries,
  chartItemCode, // prop 유지용
  monthTop3Map,
  themeHex = '#ffb74d',
  monthValueFormatter,
  fmtNumber = (n) => Number(n ?? 0).toLocaleString(),
}) {
  // 데이터 구성
  const data = chartMonths.map((m, i) => ({
    name: monthValueFormatter ? monthValueFormatter(m) : m,
    value: Number(chartSeries?.[0]?.data?.[i] ?? 0),
    top3: monthTop3Map?.[m] || [],
  }));

  // 라벨이 상단에서 안 잘리도록 Y축 여유
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
        {`${fmtNumber(value)}분`}
      </text>
    );
  };

  // 품번 미선택시 안내 문구
  if (!chartItemCode) return <Typography sx={{ textAlign: "center"}}>품번을 선택해주세요</Typography>;

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

          <Tooltip content={<CustomTooltip />} />

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
