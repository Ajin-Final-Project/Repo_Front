import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  List,
  Stack,
  Tooltip,
  Typography,
  Divider,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Done as DoneIcon,
  Notifications as BellIcon,
  NotificationsActive as BellActiveIcon,
  ErrorOutline as ErrorIcon,
  WarningAmber as WarnIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
  CartesianGrid,
  Tooltip as ReTooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";

/**
 * AJIN Realtime Dashboard (v6.1)
 * - 타일에서 ‘생산품목’ 제거
 * - 타임라인 헤더 오른쪽에만 품번 표시 (심플/고정 배지)
 * - 품번은 초기 1회만 설정 후 고정(랜덤 변경 제거)
 * - 가동률 75% 하한(시뮬 + 표기) 유지, 초기 100% 시작
 * - 타임라벨 HH:mm 예: 15:32, 실시간 1s 동기
 * - 비가동: 24h 총 40~60건 수준 + 시작 20~40초는 조용
 */

/* ----------------------------- 팔레트 ----------------------------- */
const PAL = {
  pageBg: "#ffffff",
  panelBg: "#ffffff",
  border: "#e5e7eb",
  grid: "#e5e7eb",
  text: "#111827",
  subText: "#6b7280",
  chipBg: "#f3f4f6",
  chipBorder: "#e5e7eb",
  accentBlue: "#2563eb",
  accentGreen: "#16a34a",
  accentOrange: "#ea580c",
  accentRed: "#ef4444",
};

/* ----------------------------- 유틸 ----------------------------- */
const pad2 = (n) => String(n).padStart(2, "0");
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const fmtDate = (d) =>
  `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())} (${WEEK[d.getDay()]})`;
const fmtTime = (d) =>
  `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
const timeLabel = (ts) =>
  new Date(ts).toLocaleTimeString("ko-KR", { hour12: false, hour: "2-digit", minute: "2-digit" });
const colorAlpha = (hex, a = 0.15) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};
const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);

function availabilityPctFor(runSec, stopSec) {
  const total = runSec + stopSec;
  if (total <= 0) return 100; // 시작은 항상 100%
  return Math.round((runSec / total) * 100);
}
function availabilityColor(v) {
  if (v >= 85) return PAL.accentGreen;
  if (v >= 60) return "#06b6d4";
  if (v >= 40) return PAL.accentOrange;
  return PAL.accentRed;
}

/* -------------------------- 레이아웃 상수 --------------------------- */
const STICKY_TOP = 78;
const TL_EVT_HEIGHT = 360;

/* -------------------------- 샘플/메타 --------------------------- */
const DOWNTIME_SLA_MIN = {
  VACUUM_ERR: 8,
  QDC_CLAMP: 12,
  SENSOR_ABN: 6,
  MATERIAL: 5,
  CHANGE_DIE: 20,
};

const MOTOR_SPEC = {
  L1500: { upper: 220, nominal: 130 },
  L1200: { upper: 190, nominal: 115 },
  L1000: { upper: 170, nominal: 100 },
  L800:  { upper: 150, nominal: 90 },
};

/* ---------- 제품(품번) 목록 ---------- */
const PRODUCT_CODES = [
  "64312-S8000","65778-S9000","65788-S9000","71612-P6000","71622-CG000",
  "71622-P6000","71652-P1000","71652-P1000","71652-P1000","64312-P7900",
  "69221-T1000","77211-G9000","77221-GI100","66792-K2000","71412-AR000",
  "71422-AR000","71446-AR000","71632-CG000","71632-CG300","71632-CG310",
  "66722-N9000-F1","71652-AA000","71662-AA000","64312-CG930"
];

const INITIAL_LINES = [
  { id: "L1500", name: "1500T", status: "RUN",  plan: 1200, motor: MOTOR_SPEC.L1500 },
  { id: "L1200", name: "1200T", status: "RUN",  plan: 1100, motor: MOTOR_SPEC.L1200 },
  {
    id: "L1000",
    name: "1000T",
    status: "STOP",
    plan: 900,
    motor: MOTOR_SPEC.L1000,
    downtimeCode: { code: "SENSOR_ABN", label: "센서이상" },
  },
  // ★ 800T → 1200T PRO
  { id: "L800",  name: "1200T PRO", status: "RUN", plan: 800, motor: MOTOR_SPEC.L800 },
];

const DOWNTIME_POOL = [
  { code: "VACUUM_ERR", label: "진공에러" },
  { code: "QDC_CLAMP", label: "QDC 클램프" },
  { code: "SENSOR_ABN", label: "센서이상" },
  { code: "MATERIAL",  label: "자재공급" },
  { code: "CHANGE_DIE", label: "금형교체" },
];

/* -------------------------- 부품/소모품 메타 -------------------------- */
const DIE_ACCEL = 2.5;      // 금형 타수 가속
const PART_DEMO_SPEED = 8;  // 데모용 사용량 가속(시간/타수)

/* 각 부품 수명 */
const PART_LIFE = {
  DIE:         { unit: "타", label: "금형",     base: 120000 },
  BEARING:     { unit: "h",  label: "베어링",   base: 2000   },
  SENSOR:      { unit: "h",  label: "센서",     base: 1500   },
  HYDRAULIC:   { unit: "h",  label: "유압 장치", base: 3000   },
  VACUUM_CUP:  { unit: "h",  label: "흡착컵",   base: 400    },
};

/* -------------------------- 정책 상수 ------------------------ */
const AVAILABILITY_MIN = 0.75; // 75% 하한(시뮬 + 표기)

/* 초기 시드 생성 + 일부 비정상 강제 */
function makePartSeeds(lines) {
  const randPct = () => 0.1 + Math.random() * 0.3; // 10~40%
  const seeds = {};
  for (const l of lines) {
    seeds[l.id] = {
      DIE:        Math.round(PART_LIFE.DIE.base        * randPct()),
      BEARING:   +(PART_LIFE.BEARING.base   * randPct()).toFixed(1),
      SENSOR:    +(PART_LIFE.SENSOR.base    * randPct()).toFixed(1),
      HYDRAULIC: +(PART_LIFE.HYDRAULIC.base * randPct()).toFixed(1),
    };
    forceNonNormalSeeds(seeds[l.id]);
  }
  return seeds;
}
function forceNonNormalSeeds(seedObj) {
  const keys = ["DIE", "BEARING", "SENSOR", "HYDRAULIC"];
  const count = Math.random() < 0.5 ? 1 : 2;
  const picked = shuffle(keys).slice(0, count);
  if (picked[0]) setSeedPct(seedObj, picked[0], randRange(0.88, 0.94)); // 교체 예정대
  if (picked[1]) setSeedPct(seedObj, picked[1], randRange(0.62, 0.75)); // 점검 권장대
}
function setSeedPct(seedObj, key, p) {
  const meta = PART_LIFE[key];
  const base = meta.base;
  if (!meta) return;
  if (meta.unit === "타") seedObj[key] = Math.round(base * p);
  else seedObj[key] = +(base * p).toFixed(1);
}
function randRange(min, max) { return min + Math.random() * (max - min); }
function shuffle(a) { const x = a.slice(); for (let i=x.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[x[i]]=[x[j]]; [x[j]]=[x[i]]} return x; }

/* -------------------------- 비가동 목표치 ------------------------ */
const LINES_COUNT = INITIAL_LINES.length;
/** 하루 40~60건 총량 기준 → 라인당 초당 기본 발생 확률 */
const TARGET_DT_PER_DAY = Math.round(randRange(40, 60));
const BASE_DT_PROB_PER_SEC_PER_LINE = (TARGET_DT_PER_DAY / 86400) / Math.max(1, LINES_COUNT);

/* -------------------------- 루트 ------------------------ */
export default function AjinDashboardDemo() {
  const [now, setNow] = useState(new Date());
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [lines, setLines] = useState(() => {
    const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
    const quiet = () => Date.now() + (20 + Math.floor(Math.random() * 20)) * 1000; // 20~40s
    return INITIAL_LINES.map((l) => ({
      ...l,
      currentProduct: pick(PRODUCT_CODES), // 최초 1회만 지정
      produced: 0,
      good: 0,
      defects: 0,
      motorAmp: 0,
      runtimeSec: 0, // 100%에서 시작
      stopSec: 0,    // 100%에서 시작
      timeline: [], // [{ts, run, pcs, amp}]
      quietUntil: quiet(),
      lastDowntimeTs: Date.now(),
    }));
  });
  const [events, setEvents] = useState([]);
  const [selectedLineId, setSelectedLineId] = useState("L1500");

  const [partSeeds] = useState(() => makePartSeeds(INITIAL_LINES));
  const dtProbRef = useRef(BASE_DT_PROB_PER_SEC_PER_LINE);

  useEffect(() => {
    const tick = setInterval(() => {
      setNow(new Date());

      setLines((prev) => {
        const newEvents = [];
        const updated = prev.map((l) => {
          const nowMs = Date.now();

          // --- 상태 토글(현실감 + RUN 쏠림, 조용 구간은 STOP 금지) ---
          let status = l.status;
          if (nowMs < l.quietUntil) {
            status = "RUN";
          } else {
            const flipToStop  = l.status === "RUN" ? 0.01 : 0.0; // RUN → STOP: 드물게
            const flipToRun   = l.status !== "RUN" ? 0.08 : 0.0; // STOP → RUN: 빨리 회복
            if (l.status === "RUN" && Math.random() < flipToStop) status = "STOP";
            if (l.status !== "RUN" && Math.random() < flipToRun)  status = "RUN";
          }

          // --- 가동률 75% 하한 가버너(시뮬레이션) ---
          let run = status === "RUN" ? 1 : 0;
          if (run === 0) {
            const willRun  = l.runtimeSec;
            const willStop = l.stopSec + 1; // 이번 초 STOP이 추가될 상황
            const projected = willRun / (willRun + willStop);
            if (projected < AVAILABILITY_MIN) {
              status = "RUN";
              run = 1;
            }
          }

          // 생산/전류 시뮬
          const pcs = status === "RUN" ? (Math.random() < 0.4 ? 1 : 0) : 0;
          const amp = simulateAmp(status, l.motor);

          // --- 모터 과전류 이벤트 ---
          if (status === "RUN") {
            const up = l.motor?.upper ?? 9999;
            if (amp > up * 1.2) {
              newEvents.push(makeEvent("motor_overcurrent", l.id, "critical", { amp, up }));
            } else if (amp > up * 1.05 && Math.random() < 0.6) {
              newEvents.push(makeEvent("motor_overcurrent", l.id, "warn", { amp, up }));
            }
          }

          // --- 비가동(downtime_start) 확률: 하루 40~60건 수준 + 경과시간 램프업 ---
          const sinceLast = (nowMs - (l.lastDowntimeTs || nowMs)) / 1000; // sec
          const ramp = Math.min(10, 1 + sinceLast / 600); // 10분마다 서서히 증가 (최대 10배)
          const pDowntime = (nowMs < l.quietUntil ? 0 : dtProbRef.current * ramp);
          if (Math.random() < pDowntime) {
            const code = sampleDowntime()?.code;
            newEvents.push({
              ts: nowMs,
              lineId: l.id,
              type: "downtime_start",
              code,
              severity: randPick(["info", "warn", "critical"]) || "info",
              message: renderEventMessage("downtime_start", l.name, code),
            });
            l = { ...l, lastDowntimeTs: nowMs };
          }

          // --- 품질 스파이크(소량 유지) ---
          if (nowMs >= l.quietUntil && Math.random() < 0.002) {
            newEvents.push({
              ts: nowMs,
              lineId: l.id,
              type: "quality_spike",
              severity: randPick(["info", "warn"]) || "info",
              message: renderEventMessage("quality_spike", l.name),
            });
          }

          // ★ 품번 고정 (랜덤 변경 제거)
          const currentProduct = l.currentProduct;

          const ts = nowMs;
          const timeline = [...l.timeline, { ts, run, pcs, amp }].slice(-600);

          return {
            ...l,
            status,
            currentProduct,
            produced: l.produced + pcs,
            good: l.good + pcs - (pcs && Math.random() < 0.02 ? 1 : 0),
            defects: l.defects + (pcs && Math.random() < 0.02 ? 1 : 0),
            motorAmp: amp,
            runtimeSec: l.runtimeSec + (run ? 1 : 0),
            stopSec: l.stopSec + (run ? 0 : 1),
            timeline,
            downtimeCode: status !== "RUN" ? l.downtimeCode ?? sampleDowntime() : null,
            lastDowntimeTs: l.lastDowntimeTs,
          };
        });

        if (newEvents.length > 0) {
          setEvents((prevE) => [...newEvents, ...prevE].slice(0, 100));
        }

        return updated;
      });
    }, 1000);

    return () => clearInterval(tick);
  }, []); // eslint-disable-line

  const kpi = useMemo(() => {
    const totPlan = lines.reduce((a, b) => a + b.plan, 0);
    const totProd = lines.reduce((a, b) => a + b.produced, 0);
    const totGood = lines.reduce((a, b) => a + b.good, 0);
    const totRuntime = lines.reduce((a, b) => a + b.runtimeSec, 0);
    const totStop = lines.reduce((a, b) => a + b.stopSec, 0);
    const availabilityPct = Math.max(75, availabilityPctFor(totRuntime, totStop)); // 표기 하한 75%
    const qualityPct = totProd > 0 ? Math.round((totGood / totProd) * 100) : 100;
    const OEE = Math.round((availabilityPct / 100) * (qualityPct / 100) * 100);
    return {
      plan: totPlan,
      produced: totProd,
      achievement: pct(totProd, totPlan),
      availability: availabilityPct,
      quality: qualityPct,
      OEE,
    };
  }, [lines]);

  const selectedLine = useMemo(
    () => lines.find((l) => l.id === selectedLineId) || lines[0],
    [lines, selectedLineId]
  );
  const selectedTimeline = useMemo(() => toRechartsData(selectedLine.timeline), [selectedLine]);

  const onAcknowledge = (idx) => removeEvent(setEvents, idx);

  const motorEventsForSelected = useMemo(
    () =>
      events.filter(
        (e) => e.lineId === selectedLine.id && e.type === "motor_overcurrent"
      ),
    [events, selectedLine.id]
  );

  return (
    <Box sx={{ p: { xs: 1, sm: 2 }, bgcolor: PAL.pageBg, color: PAL.text }}>
      <StickyKPIBar now={now} kpi={kpi} events={events} onOpenEvents={() => setEventModalOpen(true)} />

      <EventsModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        events={events}
        onAcknowledge={onAcknowledge}
      />

      <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="stretch" sx={{ mt: 0 }}>
        {/* 좌측: 라인 타일 */}
        <Grid item xs={12} md={3} sx={{ alignSelf: "stretch" }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1, sm: 1.25 },
              height: "100%",
              border: `1px solid ${PAL.border}`,
              borderRadius: 2,
              bgcolor: PAL.panelBg,
            }}
          >
            <Box
              sx={{
                position: { md: "sticky" },
                top: { md: STICKY_TOP },
                maxHeight: { md: `calc(100vh - ${STICKY_TOP + 16}px)` },
                overflowY: { md: "auto" },
                pr: { md: 1 },
              }}
            >
              <LineTileGrid
                lines={lines}
                onSelect={setSelectedLineId}
                selectedId={selectedLineId}
              />
            </Box>
          </Paper>
        </Grid>

        {/* 중앙: 타임라인 + MiddleBand */}
        <Grid item xs={12} md={9} sx={{ minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 1, sm: 1.25 },
              height: "100%",
              border: `1px solid ${PAL.border}`,
              borderRadius: 2,
              bgcolor: PAL.panelBg,
            }}
          >
            <Grid container spacing={{ xs: 1, sm: 2 }} alignItems="stretch" wrap="nowrap">
              <Grid item xs sx={{ minWidth: 0, display: "flex" }}>
                <RunTimelinePanel
                  line={selectedLine}
                  data={selectedTimeline}
                  fixedHeight={TL_EVT_HEIGHT}
                  events={motorEventsForSelected}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: { xs: 2, sm: 3 } }}>
              <MiddleBand line={selectedLine} events={events} seed={partSeeds[selectedLine.id]} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

/* ---------------------------- 컴포넌트 --------------------------- */
function StickyKPIBar({ now, kpi, events, onOpenEvents }) {
  const { count, sev } = useMemo(() => {
    const c = events.length;
    const hasCritical = events.some((e) => e.severity === "critical");
    const hasWarn = events.some((e) => e.severity === "warn");
    return { count: c, sev: hasCritical ? "critical" : hasWarn ? "warn" : "info" };
  }, [events]);

  const sevColorMap = {
    critical: PAL.accentRed,
    warn: "#f59e0b",
    info: PAL.subText,
  };
  const Icon = sev === "critical" ? BellActiveIcon : BellIcon;

  return (
    <Paper
      elevation={0}
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        p: { xs: 1, sm: 1.25 },
        bgcolor: PAL.panelBg,
        border: `1px solid ${PAL.border}`,
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={{ xs: 1, sm: 2 }} alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" }, fontWeight: 700 }}>
          {fmtDate(now)} · {fmtTime(now)}
        </Typography>

        <Stack direction="row" spacing={{ xs: 1, sm: 1.25 }} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<Icon />}
            onClick={onOpenEvents}
            sx={{
              position: "relative",
              borderColor: sevColorMap[sev],
              color: sevColorMap[sev],
              "&:hover": { borderColor: sevColorMap[sev], bgcolor: colorAlpha(sevColorMap[sev], 0.06) },
              borderRadius: 2,
              px: { xs: 1, sm: 1.25 },
            }}
          >
            알림 {count}
            {count > 0 && (
              <Box
                sx={{
                  position: "absolute",
                  top: -3,
                  right: -3,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: sevColorMap[sev],
                  boxShadow: "0 0 0 2px #fff",
                }}
              />
            )}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

/* -------- 이벤트 모달 -------- */
function EventsModal({ open, onClose, events, onAcknowledge }) {
  const [filter, setFilter] = useState("all");
  const sevCounts = useMemo(() => {
    const base = { all: events.length, critical: 0, warn: 0, info: 0 };
    events.forEach((e) => {
      if (e.severity === "critical") base.critical += 1;
      else if (e.severity === "warn") base.warn += 1;
      else base.info += 1;
    });
    return base;
  }, [events]);

  const list = useMemo(() => {
    return events
      .filter((e) => (filter === "all" ? true : e.severity === filter))
      .sort((a, b) => {
        const rank = { critical: 3, warn: 2, info: 1 };
        const r = rank[b.severity] - rank[a.severity];
        return r !== 0 ? r : b.ts - a.ts;
      });
  }, [events, filter]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          pr: 1,
          py: { xs: 1, sm: 1.25 },
          borderBottom: `1px solid ${PAL.border}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
            이벤트 / 알림
          </Typography>
          <Chip size="small" label={`전체 ${sevCounts.all}`} sx={chipStyle()} />
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: { xs: 1, sm: 1.25 } }}>
        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
          <FilterChip label={`전체 ${sevCounts.all}`} active={filter === "all"} onClick={() => setFilter("all")} />
          <FilterChip
            color="critical"
            icon={<ErrorIcon fontSize="small" />}
            label={`치명 ${sevCounts.critical}`}
            active={filter === "critical"}
            onClick={() => setFilter("critical")}
          />
          <FilterChip
            color="warn"
            icon={<WarnIcon fontSize="small" />}
            label={`경고 ${sevCounts.warn}`}
            active={filter === "warn"}
            onClick={() => setFilter("warn")}
          />
          <FilterChip
            color="info"
            icon={<InfoIcon fontSize="small" />}
            label={`정보 ${sevCounts.info}`}
            active={filter === "info"}
            onClick={() => setFilter("info")}
          />
        </Stack>

        <List dense sx={{ maxHeight: 520, overflowY: "auto", px: { xs: 0, sm: 0.5 } }}>
          {list.length === 0 && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: PAL.subText }}>
                해당 조건의 이벤트가 없습니다.
              </Typography>
            </Box>
          )}

          {list.map((e, idx) => {
            const meta = sevMeta(e.severity);
            return (
              <React.Fragment key={`${e.ts}-${idx}`}>
                <Box
                  sx={{
                    p: { xs: 1, sm: 1.25 },
                    border: `1px solid ${PAL.border}`,
                    borderRadius: 2,
                    bgcolor: "#fff",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, bgcolor: meta.color }} />
                  <Box
                    sx={{
                      mt: 0.2,
                      borderRadius: "50%",
                      p: 0.6,
                      bgcolor: meta.bg,
                      color: meta.color,
                      display: "inline-flex",
                    }}
                    aria-hidden
                  >
                    {meta.icon}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: { xs: "0.85rem", sm: "0.9rem" } }}>
                        {e.message}
                      </Typography>
                      <Typography variant="caption" sx={{ color: PAL.subText, ml: 1, whiteSpace: "nowrap" }}>
                        {timeAgo(e.ts)}
                      </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} sx={{ mt: 0.5, flexWrap: "wrap" }}>
                      {e.lineId && <Chip size="small" label={`라인 ${formatLineName(e.lineId)}`} sx={chipStyle()} />}
                      {e.type && <Chip size="small" label={typeKorean(e.type)} sx={chipStyle()} />}
                      {e.code && <Chip size="small" label={`코드 ${e.code}`} sx={chipStyle()} />}
                    </Stack>
                  </Box>

                  <Tooltip title="조치 완료(목록에서 제거)">
                    <IconButton onClick={() => onAcknowledge(events.indexOf(e))} size="small" sx={{ ml: 0.5 }}>
                      <DoneIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>

                <Divider sx={{ my: 1, borderColor: PAL.border }} />
              </React.Fragment>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: { xs: 1, sm: 1.25 }, borderTop: `1px solid ${PAL.border}` }}>
        <Button onClick={onClose} variant="contained" sx={{ borderRadius: 2 }}>
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* ----- 알림 필터 칩 ----- */
function FilterChip({ label, onClick, active, icon, color = "default" }) {
  const pal = {
    default:  { c: PAL.text,    b: PAL.chipBg, bd: PAL.chipBorder },
    info:     { c: PAL.subText, b: "#eef2ff",  bd: "#e0e7ff" },
    warn:     { c: "#b45309",   b: "#fff7ed",  bd: "#ffedd5" },
    critical: { c: "#991b1b",   b: "#fee2e2",  bd: "#fecaca" },
  }[color];

  return (
    <Chip
      icon={icon ?? null}
      size="small"
      label={label}
      onClick={onClick}
      sx={{
        bgcolor: active ? pal.b : PAL.chipBg,
        color: active ? pal.c : PAL.text,
        border: `1px solid ${active ? pal.bd : PAL.chipBorder}`,
        borderRadius: 1.5,
        "& .MuiChip-icon": { color: active ? pal.c : PAL.subText },
        cursor: "pointer",
      }}
    />
  );
}

/* -------- LineTileGrid -------- */
function LineTileGrid({ lines, onSelect, selectedId }) {
  return (
    <Paper elevation={0} sx={{ p: { xs: 1, sm: 1.25 }, bgcolor: "#f8fafc", border: `1px solid ${PAL.border}`, borderRadius: 2 }}>
      <Stack spacing={{ xs: 1, sm: 1.5 }}>
        {lines.map((l) => {
          const rawAvail = availabilityPctFor(l.runtimeSec, l.stopSec);
          const avail = Math.max(75, rawAvail); // 표기 하한
          const achv = pct(l.produced, l.plan);
          const col = availabilityColor(avail);
          const isSel = selectedId === l.id;
          const downtimeLabel = l.downtimeCode?.label || l.downtimeCode?.code;
          const isStop = l.status !== "RUN";

          return (
            <Box
              key={l.id}
              onClick={() => onSelect(l.id)}
              sx={{
                cursor: "pointer",
                borderRadius: 2,
                bgcolor: "#ffffff",
                border: `1px solid ${isSel ? PAL.accentBlue : PAL.border}`,
                boxShadow: isSel
                  ? `0 0 0 3px ${colorAlpha(PAL.accentBlue, 0.12)} inset`
                  : "0 1px 2px rgba(0,0,0,0.04)",
                transition: "transform 120ms ease, box-shadow 120ms ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                },
                display: "flex",
                flexDirection: "column",
                p: { xs: 1, sm: 1.3 },
                minHeight: { xs: 130, sm: 145 },
              }}
            >
              {/* 상단: 라인명 + 상태 */}
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                  {l.name}
                </Typography>
                <StatusBadge status={l.status} />
                {isStop && downtimeLabel && (
                  <Chip
                    size="small"
                    label={downtimeLabel}
                    sx={{
                      bgcolor: "#fff7ed",
                      color: "#f59e0b",
                      border: "1px solid #f59e0b55",
                      height: 22,
                      maxWidth: 140,
                      ".MuiChip-label": {
                        px: 0.75,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },
                    }}
                  />
                )}
              </Stack>

              {/* NOTE: 타일에서 ‘생산품목’ 표기 제거 */}
              <Box sx={{ height: 4 }} />

              {/* KPI 바 */}
              <Grid container spacing={{ xs: 0.5, sm: 1 }} sx={{ mt: "auto" }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: PAL.subText, mb: 0.5, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    달성률
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.3, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                    {achv}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={achv}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: PAL.chipBg,
                      ".MuiLinearProgress-bar": {
                        bgcolor: achv >= 100 ? PAL.accentGreen : PAL.accentBlue,
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: PAL.subText, mb: 0.5, fontSize: { xs: "0.75rem", sm: "0.875rem" } }}>
                    가동률
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: col, mb: 0.3, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
                    {avail}%
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={avail}
                    sx={{
                      height: 8,
                      borderRadius: 1,
                      bgcolor: PAL.chipBg,
                      ".MuiLinearProgress-bar": { bgcolor: col },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>
          );
        })}
      </Stack>
    </Paper>
  );
}

function StatusBadge({ status }) {
  const map = {
    RUN:   { text: "RUN",   color: PAL.accentGreen },
    STOP:  { text: "STOP",  color: PAL.accentRed },
    SETUP: { text: "SETUP", color: "#f59e0b" },
  };
  const s = map[status] || map.RUN;
  return (
    <Chip
      size="small"
      label={s.text}
      sx={{ bgcolor: `${s.color}1A`, color: s.color, border: `1px solid ${s.color}55` }}
    />
  );
}

function chipStyle() {
  return {
    bgcolor: PAL.chipBg,
    border: `1px solid ${PAL.chipBorder}`,
    color: PAL.text,
    borderRadius: 1.5,
  };
}

/* --------- 품번 배지 (심플/고정) --------- */
function ProductBadge({ code }) {
  return (
    <Chip
      label={`품번 ${code}`}
      sx={{
        bgcolor: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#0f172a",
        borderRadius: 1.5,
        height: { xs: 32, sm: 36 },
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        "& .MuiChip-label": {
          px: { xs: 1, sm: 1.2 },
          fontSize: { xs: "0.85rem", sm: "0.98rem" },
          fontWeight: 700,
          letterSpacing: "0.015em",
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          fontVariantNumeric: "tabular-nums",
        },
        maxWidth: 340,
      }}
    />
  );
}

/* ---------------- 타임라인 ---------------- */
function RunTimelinePanel({ line, data, fixedHeight = TL_EVT_HEIGHT, events = [] }) {
  const stopMin = useMemo(() => continuousStopMinutes(data), [data]);
  const isStop = line.status !== "RUN";
  const isRunning = line.status === "RUN";
  const reason = line.downtimeCode?.label || line.downtimeCode?.code;
  const estMin = reason ? DOWNTIME_SLA_MIN[line.downtimeCode?.code] || 5 : null;

  const ampUpper = line?.motor?.upper ?? 0;

  // 마지막 RUN 데이터 스냅샷 보관 → STOP이면 마지막 RUN 스냅샷 렌더
  const lastRunDataRef = useRef(data);
  useEffect(() => {
    if (isRunning) lastRunDataRef.current = data;
  }, [isRunning, data]);
  const chartData = isRunning ? data : (lastRunDataRef.current || data);

  const exceedBands = useMemo(() => computeExceedBands(chartData, ampUpper), [chartData, ampUpper]);
  const eventLabels = useMemo(() => events.map((e) => timeLabel(e.ts)), [events]);

  // 과전류 즉시 피드백 여부(현재 시점)
  const latest = chartData?.[chartData.length - 1];
  const isOverNow = !!ampUpper && latest && latest.amp > ampUpper;

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: { xs: fixedHeight * 0.8, sm: fixedHeight },
        width: "100%",
        bgcolor: PAL.panelBg,
        border: `1px solid ${PAL.border}`,
        color: PAL.text,
        borderRadius: 2,
        boxShadow: isOverNow ? `0 0 0 3px ${colorAlpha(PAL.accentRed,0.25)}` : "none",
        animation: isOverNow ? "overPulse 1.2s ease-in-out infinite" : "none",
        "@keyframes overPulse": {
          "0%":   { boxShadow: `0 0 0 0 ${colorAlpha(PAL.accentRed,0.35)}` },
          "70%":  { boxShadow: `0 0 0 10px ${colorAlpha(PAL.accentRed,0.0)}` },
          "100%": { boxShadow: `0 0 0 0 ${colorAlpha(PAL.accentRed,0.0)}` },
        },
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* 헤더: 라인명 왼쪽, 품번 배지 오른쪽(한 곳만) */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: { xs: 0.25, sm: 0.5 } }}>
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
            {line.name} · 타임라인
          </Typography>
          {line.currentProduct && <ProductBadge code={line.currentProduct} />}
        </Stack>

        {/* 수동 범례 */}
        <Stack direction="row" spacing={{ xs: 1, sm: 2 }} sx={{ mb: { xs: 0.25, sm: 0.5 }, color: PAL.subText }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 14, height: 3, bgcolor: PAL.accentBlue, borderRadius: 1 }} />
            <Typography variant="caption" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>파란 선 = <b>메인 모터 전류(A)</b></Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 14, height: 8, bgcolor: colorAlpha(PAL.accentGreen, 0.3), border: `1px solid ${PAL.accentGreen}66`, borderRadius: 0.5 }} />
            <Typography variant="caption" sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>초록 영역 = <b>가동 상태(RUN)</b></Typography>
          </Stack>
        </Stack>

        {/* 차트 */}
        <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
          {/* 과전류 경고 배지 */}
          {isOverNow && (
            <Box
              sx={{
                position: "absolute",
                top: 8, right: 8, zIndex: 2,
                px: 1, py: 0.5,
                borderRadius: 1.5,
                bgcolor: "#fee2e2",
                border: `1px solid ${PAL.accentRed}66`,
                color: PAL.accentRed,
                fontSize: { xs: 11, sm: 12 },
                fontWeight: 800,
              }}
            >
              과전류 경고
            </Box>
          )}

          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 34, right: 60, bottom: 8, left: 8 }}>
              <defs>
                <linearGradient id="runFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PAL.accentGreen} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={PAL.accentGreen} stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke={PAL.grid} strokeDasharray="3 3" />
              <XAxis dataKey="t" tick={{ fill: PAL.subText, fontSize: 11 }} />
              <YAxis yAxisId="run" domain={[0, 1]} hide />
              <YAxis
                yAxisId="amp"
                orientation="right"
                width={46}
                tickMargin={8}
                domain={[0, ampUpper ? Math.round(ampUpper * 1.3) : "auto"]}
                tick={{ fill: PAL.subText, fontSize: 11 }}
                label={{
                  value: "전류 (A)",
                  position: "right",
                  angle: -90,
                  offset: 12,
                  style: { fill: PAL.subText, fontSize: 12 },
                }}
              />

              {/* 상한선 */}
              <ReferenceLine yAxisId="amp" y={ampUpper} stroke={PAL.accentRed} strokeDasharray="4 4" />

              {/* 초과 밴드 */}
              {exceedBands.map((b, i) => (
                <ReferenceArea
                  key={i}
                  x1={b.start}
                  x2={b.end}
                  yAxisId="amp"
                  y1={ampUpper}
                  y2={Math.round(ampUpper * 1.3)}
                  fill={colorAlpha(PAL.accentRed, 0.12)}
                  strokeOpacity={0}
                />
              ))}

              {/* 이벤트 마커 */}
              {eventLabels.map((x, i) => (
                <ReferenceLine
                  key={i}
                  x={x}
                  stroke={PAL.accentRed}
                  strokeDasharray="3 3"
                  label={{ value: "EVT", position: "top", fill: PAL.accentRed, fontSize: 10 }}
                />
              ))}

              <ReTooltip content={<ChartTooltipRunAmp ampUpper={ampUpper} />} />

              <Area
                name="가동 상태 (RUN/STOP)"
                yAxisId="run"
                type="stepAfter"
                dataKey="run"
                stroke={isRunning ? PAL.accentGreen : "#9CA3AF"}
                fill={isRunning ? "url(#runFill)" : "#F3F4F6"}
                strokeWidth={2}
                isAnimationActive={isRunning}
                strokeDasharray={isRunning ? "" : "4 3"}
                opacity={isRunning ? 1 : 0.6}
              />
              <Line
                name="메인 모터 전류 (A)"
                yAxisId="amp"
                type="monotone"
                dataKey="amp"
                stroke={PAL.accentBlue}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>

          {/* STOP 강조 오버레이 */}
          {isStop && (
            <Box
              sx={{
                position: "absolute",
                inset: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#fff1f21a",
                borderRadius: 2,
                border: `2px dashed ${PAL.accentRed}`,
                animation: "pulseBorder 1.8s ease-in-out infinite",
                "@keyframes pulseBorder": {
                  "0%":   { boxShadow: `0 0 0 0 ${colorAlpha(PAL.accentRed,0.35)}` },
                  "70%":  { boxShadow: `0 0 0 12px ${colorAlpha(PAL.accentRed,0.0)}` },
                  "100%": { boxShadow: `0 0 0 0 ${colorAlpha(PAL.accentRed,0.0)}` },
                },
              }}
            >
              <Stack alignItems="center" spacing={{ xs: 0.4, sm: 0.6 }}>
                <Typography variant="h4" sx={{ fontWeight: 900, color: PAL.accentRed, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
                  ● 정지
                </Typography>
                {reason && (
                  <Typography variant="h6" sx={{ fontWeight: 800, color: PAL.accentRed, fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                    {reason}{estMin ? ` · 예상 ${estMin}분` : ""}
                  </Typography>
                )}
                <Typography variant="body1" sx={{ color: PAL.subText, fontSize: { xs: "0.85rem", sm: "1rem" } }}>
                  경과 {stopMin}분
                </Typography>
              </Stack>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
function ChartTooltipRunAmp({ active, payload, label, ampUpper }) {
  if (!active || !payload || payload.length === 0) return null;
  const p = Object.fromEntries(payload.map((x) => [x.dataKey, x.value]));
  return (
    <Box sx={{ p: 1, bgcolor: PAL.panelBg, border: `1px solid ${PAL.border}`, borderRadius: 1.5 }}>
      <Typography variant="caption" sx={{ color: PAL.subText, fontSize: { xs: "0.7rem", sm: "0.75rem" } }}>{label}</Typography>
      <Typography variant="body2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}><b>가동 상태:</b> {p.run === 1 ? "RUN" : "STOP"}</Typography>
      <Typography variant="body2" sx={{ fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
        <b>메인 모터 전류:</b> {Math.round(p.amp)} A {ampUpper ? `(상한 ${ampUpper}A)` : ""}
      </Typography>
    </Box>
  );
}

/* ---------------- MiddleBand: 부품/소모품 ---------------- */
function MiddleBand({ line, events, seed }) {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const events24h = useMemo(() => events.filter((e) => now - e.ts <= DAY), [events, now]);

  const parts = useMemo(
    () => computePartsForLineWithSeed(line, events24h, seed),
    [line, events24h, seed]
  );

  return (
    <Card sx={{ bgcolor: PAL.panelBg, border: `1px solid ${PAL.border}`, color: PAL.text, borderRadius: 2, width: "100%" }}>
      <CardContent sx={{ p: { xs: 1, sm: 1.25, md: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" noWrap title={`부품/소모품 상태 모니터링 · ${line?.name || ""}`} sx={{ maxWidth: "100%", fontSize: { xs: "0.9rem", sm: "1rem" } }}>
            <b>부품/소모품 상태 모니터링</b> · {line?.name}
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            // xs: 1열, sm: 2열, md↑: 4열 고정 (한 줄)
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(160px, 1fr))",
              md: "repeat(4, minmax(160px, 1fr))",
              lg: "repeat(4, minmax(190px, 1fr))",
            },
            // 네비 펼쳤을 때도 한 줄 유지되도록 간격도 살짝 줄임
            columnGap: { xs: 1, md: 1 },
            rowGap: { xs: 1, md: 1 },
            alignItems: "stretch",
            // 각 셀 내부 컨텐츠가 제대로 줄어들 수 있게
            "& > *": { minWidth: 0 },
          }}
        >

          {parts.map((p) => (
            <PartHealthCard key={p.key} part={p} />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
}

function computePartsForLineWithSeed(line, events24h, seed) {
  if (!line || !seed) return [];
  const usedHBase = (line.runtimeSec || 0) / 3600;
  const usedH = usedHBase * PART_DEMO_SPEED;

  const counts = { VACUUM_ERR: 0, QDC_CLAMP: 0, SENSOR_ABN: 0, MATERIAL: 0, CHANGE_DIE: 0 };
  events24h
    .filter((e) => e.lineId === line.id && e.type === "downtime_start")
    .forEach((e) => {
      if (counts[e.code] !== undefined) counts[e.code]++;
    });

  const dieUsed = Math.round(seed.DIE + PART_DEMO_SPEED * (line.produced * DIE_ACCEL));

  const brUsedH  = +(
    seed.BEARING +
    usedH +
    (counts.MATERIAL   * 0.5 + counts.CHANGE_DIE * 0.5) * PART_DEMO_SPEED / 6
  ).toFixed(1);

  const snUsedH  = +(
    seed.SENSOR +
    usedH +
    (counts.SENSOR_ABN * 8   + counts.VACUUM_ERR * 2) * PART_DEMO_SPEED / 12
  ).toFixed(1);

  const hydUsedH = +(
    seed.HYDRAULIC +
    usedH +
    (counts.QDC_CLAMP  * 4) * PART_DEMO_SPEED / 10
  ).toFixed(1);

  const parts = [
    makePart("DIE",         PART_LIFE.DIE,        dieUsed),
    makePart("BEARING",     PART_LIFE.BEARING,    brUsedH),
    makePart("SENSOR",      PART_LIFE.SENSOR,     snUsedH),
    makePart("HYDRAULIC",   PART_LIFE.HYDRAULIC,  hydUsedH),
  ];
  return parts;

  function makePart(key, meta, used) {
    const base = meta.base;
    const usagePct = Math.min(100, Math.round((used / base) * 100));
    const remain = Math.max(base - used, 0);
    const stat = statusByUsage(usagePct);
    return {
      key,
      name: meta.label,
      unit: meta.unit,
      base,
      used: Math.max(0, (meta.unit === "타" ? Math.round(used) : +used.toFixed(1))),
      remain: Math.max(0, (meta.unit === "타" ? Math.round(remain) : +remain.toFixed(1))),
      usagePct,
      status: stat.label,
      color: stat.color,
      bg: stat.bg,
      border: stat.border,
    };
  }
}
function statusByUsage(p) {
  if (p >= 100)
    return { label: "교체 지연", color: PAL.accentRed, bg: "#fee2e2", border: `${PAL.accentRed}55` };
  if (p >= 85) return { label: "교체 예정", color: "#f59e0b", bg: "#fff7ed", border: "#f59e0b55" };
  if (p >= 60) return { label: "점검 권장", color: "#2563eb", bg: "#eff6ff", border: "#93c5fd" };
  return { label: "정상", color: PAL.text, bg: PAL.chipBg, border: PAL.chipBorder };
}
function gaugeColor(p) {
  if (p >= 100) return PAL.accentRed;
  if (p >= 85)  return "#f59e0b";
  return PAL.accentBlue;
}
function PartHealthCard({ part }) {
  const percent = part.usagePct;
  const color   = gaugeColor(percent);
  const track   = PAL.chipBg;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 0.8, sm: 1, md: 1.1 },              // 컴팩트 패딩
        border: `1px solid ${PAL.border}`,
        borderRadius: 2,
        bgcolor: PAL.panelBg,
        display: "flex",
        flexDirection: "column",
        gap: { xs: 0.4, sm: 0.6 },
        height: "100%",
        minWidth: 0,                         // 그리드 축소 허용
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 0.25, minWidth: 0 }}
      >
        <Typography
          variant="body2"
          noWrap
          sx={{ fontWeight: 700, mr: 0.5, minWidth: 0, fontSize: { xs: "0.85rem", sm: "0.875rem" } }}
          title={part.name}
        >
          {part.name}
        </Typography>

        <Chip
          size="small"
          label={part.status}
          sx={{
            bgcolor: part.bg,
            color: part.color,
            border: `1px solid ${part.border}`,
            borderRadius: 1.5,
            // 칩도 폭을 덜 차지하게
            "& .MuiChip-label": { px: 0.75 },
            height: 22,
          }}
        />
      </Stack>

      <Box sx={{ position: "relative", width: "100%", aspectRatio: "2 / 1", minWidth: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0}
            data={[{ name: part.name, value: percent }]}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={10} background={{ fill: track }} fill={color} />
          </RadialBarChart>
        </ResponsiveContainer>

        <Box
          sx={{
            position: "absolute",
            left: 0, right: 0, bottom: "6%",
            textAlign: "center",
            px: 1,
          }}
        >
          {/* 숫자 크기도 반응형으로 살짝 압축 */}
          <Typography
            variant="h6"
            sx={{ fontWeight: 900, lineHeight: 1, color, fontSize: { xs: "1.05rem", md: "1.15rem" } }}
          >
            {percent}%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: PAL.subText,
              display: "inline-block",
              maxWidth: "100%",
              // 아주 좁을 때 줄바꿈 허용
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontSize: { xs: "0.7rem", sm: "0.75rem" },
            }}
            title={`사용 ${part.used.toLocaleString()}${part.unit} / 수명 ${part.base.toLocaleString()}${part.unit}`}
          >
            사용 {part.used.toLocaleString()}{part.unit}
            <span style={{ color: "#9CA3AF" }}> / </span>
            수명 {part.base.toLocaleString()}{part.unit}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}


/* ---------------------------- 헬퍼 ---------------------------- */
function toRechartsData(arr) {
  return arr.map((x) => ({
    t: timeLabel(x.ts), // HH:mm
    run: x.run,
    pcs: x.pcs,
    amp: x.amp ?? 0,
  }));
}
function continuousStopMinutes(data) {
  let i = data.length - 1, sec = 0;
  while (i >= 0 && data[i].run === 0) {
    sec++;
    i--;
  }
  return Math.floor(sec / 60);
}
function sampleDowntime() { return randPick(DOWNTIME_POOL); }
function randPick(arr) { if (!arr || arr.length === 0) return null; return arr[Math.floor(Math.random() * arr.length)]; }
function removeEvent(setter, idx) { setter((prev) => prev.filter((_, i) => i !== idx)); }
function renderEventMessage(type, lineName, code) {
  switch (type) {
    case "downtime_start": return `[${lineName}] 비가동 시작 · ${code || "원인확인"}`;
    case "quality_spike":  return `[${lineName}] 불량 급증 감지`;
    case "motor_overcurrent": return `[${lineName}] 메인 모터 전류 상한 초과`;
    default: return `[${lineName}] 이벤트`;
  }
}
function makeEvent(type, lineId, severity, extra = {}) {
  const nameMap = { L1500: "1500T", L1200: "1200T", L1000: "1000T", L800: "1200T PRO" };
  const lineName = nameMap[lineId] || lineId;
  const msg =
    type === "motor_overcurrent" && extra.amp && extra.up
      ? `[${lineName}] 메인 모터 전류 상한 초과 · ${Math.round(extra.amp)}A / 상한 ${extra.up}A`
      : renderEventMessage(type, lineName, extra.code);
  return { ts: Date.now(), lineId, type, severity: severity || "info", code: extra.code, message: msg };
}
function simulateAmp(status, motor) {
  const up = motor?.upper ?? 180;
  const nom = motor?.nominal ?? 110;
  if (status !== "RUN") return Math.max(0, 3 + Math.random() * 5);
  const jitter = (Math.random() - 0.5) * 0.25; // ±12.5%
  let amp = nom * (1 + jitter);
  if (Math.random() < 0.06) amp *= 1.25; // 간헐 스파이크
  if (Math.random() < 0.02) amp *= 1.45; // 큰 스파이크
  return Math.min(amp, up * 1.35);
}
function computeExceedBands(data, upper) {
  if (!upper || !data?.length) return [];
  const bands = [];
  let s = null;
  for (let i = 0; i < data.length; i++) {
    const over = data[i].amp > upper;
    if (over && s === null) s = i;
    if (!over && s !== null) {
      bands.push({ start: data[s].t, end: data[i - 1].t });
      s = null;
    }
  }
  if (s !== null) bands.push({ start: data[s].t, end: data[data.length - 1].t });
  return bands;
}
function timeAgo(ts) {
  const diff = Math.max(0, Date.now() - ts);
  const s = Math.floor(diff / 1000);
  if (s < 5) return "방금";
  if (s < 60) return `${s}초 전`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  const d = Math.floor(h / 24);
  return `${d}일 전`;
}
function sevMeta(sev) {
  switch (sev) {
    case "critical":
      return { color: PAL.accentRed, bg: colorAlpha(PAL.accentRed, 0.12), icon: <ErrorIcon fontSize="small" /> };
    case "warn":
      return { color: "#f59e0b", bg: colorAlpha("#f59e0b", 0.15), icon: <WarnIcon fontSize="small" /> };
    default:
      return { color: PAL.subText, bg: colorAlpha(PAL.subText, 0.12), icon: <InfoIcon fontSize="small" /> };
  }
}
function typeKorean(t) {
  return (
    {
      motor_overcurrent: "모터 과전류",
      downtime_start: "비가동 시작",
      quality_spike: "불량 급증",
    }[t] || "이벤트"
  );
}
function formatLineName(id) {
  const nameMap = { L1500: "1500T", L1200: "1200T", L1000: "1000T", L800: "1200T PRO" };
  return nameMap[id] || id;
}