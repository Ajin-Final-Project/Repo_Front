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
  Legend,
} from "recharts";

/**
 * AJIN Realtime Dashboard - Frontend-Only Demo (v5.4)
 * ---------------------------------------------------
 * - STOP 시 타임라인 차트 "완전 정지" UX 구현
 *   1) RUN일 때만 Area 애니메이션 활성화, STOP이면 디밍 + 점선
 *   2) STOP이면 마지막 RUN 시점의 차트 스냅샷으로 렌더(뷰포트 고정)
 * - 기타: 정지 오버레이에 "정지 n분" 문구 표시
 */

// ----------------------------- 팔레트 -----------------------------
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

// ----------------------------- 유틸 -----------------------------
const pad2 = (n) => String(n).padStart(2, "0");
const WEEK = ["일", "월", "화", "수", "목", "금", "토"];
const fmtDate = (d) =>
  `${d.getFullYear()}.${pad2(d.getMonth() + 1)}.${pad2(d.getDate())} (${WEEK[d.getDay()]})`;
const fmtTime = (d) =>
  `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
const pct = (num, den) => (den > 0 ? Math.round((num / den) * 100) : 0);
const colorAlpha = (hex, a = 0.15) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};
function availabilityColor(v) {
  if (v >= 85) return PAL.accentGreen;
  if (v >= 60) return "#06b6d4";
  if (v >= 40) return PAL.accentOrange;
  return PAL.accentRed;
}

// -------------------------- 레이아웃 상수 ---------------------------
const SHIFT_SECONDS = 8 * 3600;
const STICKY_TOP = 78; // 좌측 타일 sticky 기준
const TL_EVT_HEIGHT = 360; // 타임라인 고정 높이

// -------------------------- 샘플/메타 ---------------------------
const DOWNTIME_SLA_MIN = {
  VACUUM_ERR: 8,
  QDC_CLAMP: 12,
  SENSOR_ABN: 6,
  MATERIAL: 5,
  CHANGE_DIE: 20,
};

// 라인별 모터 전류 상한/정상치
const MOTOR_SPEC = {
  L1500: { upper: 220, nominal: 130 },
  L1200: { upper: 190, nominal: 115 },
  L1000: { upper: 170, nominal: 100 },
  L800: { upper: 150, nominal: 90 },
};

const INITIAL_LINES = [
  { id: "L1500", name: "1500T", status: "RUN", plan: 1200, motor: MOTOR_SPEC.L1500 },
  { id: "L1200", name: "1200T", status: "RUN", plan: 1100, motor: MOTOR_SPEC.L1200 },
  {
    id: "L1000",
    name: "1000T",
    status: "STOP",
    plan: 900,
    motor: MOTOR_SPEC.L1000,
    downtimeCode: { code: "SENSOR_ABN", label: "센서이상" },
  },
  { id: "L800", name: "800T", status: "RUN", plan: 800, motor: MOTOR_SPEC.L800 },
];

const DOWNTIME_POOL = [
  { code: "VACUUM_ERR", label: "진공에러" },
  { code: "QDC_CLAMP", label: "QDC 클램프" },
  { code: "SENSOR_ABN", label: "센서이상" },
  { code: "MATERIAL", label: "자재공급" },
  { code: "CHANGE_DIE", label: "금형교체" },
];

// -------------------------- 루트 ------------------------
export default function AjinDashboardDemo() {
  const [now, setNow] = useState(new Date());
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [lines, setLines] = useState(() =>
    INITIAL_LINES.map((l) => ({
      ...l,
      produced: 0,
      good: 0,
      defects: 0,
      motorAmp: 0,
      runtimeSec: l.status === "RUN" ? 1 : 0,
      stopSec: l.status !== "RUN" ? 1 : 0,
      timeline: [], // [{ts, run, pcs, amp}]
    }))
  );
  const [events, setEvents] = useState([]);
  const [selectedLineId, setSelectedLineId] = useState("L1500");

  useEffect(() => {
    const tick = setInterval(() => {
      setNow(new Date());

      // 라인 상태/전류 시뮬레이션 + 이벤트 생성
      setLines((prev) => {
        const newEvents = [];
        const updated = prev.map((l) => {
          // 상태 토글 확률
          let status = l.status;
          if (Math.random() < 0.04) status = l.status === "RUN" ? "STOP" : "RUN";

          // 생산/전류 시뮬
          const pcs = status === "RUN" ? (Math.random() < 0.4 ? 1 : 0) : 0;
          const amp = simulateAmp(status, l.motor);

          // 전류 상한 경보 생성
          if (status === "RUN") {
            const up = l.motor?.upper ?? 9999;
            if (amp > up * 1.2) {
              newEvents.push(makeEvent("motor_overcurrent", l.id, "critical", { amp, up }));
            } else if (amp > up * 1.05 && Math.random() < 0.6) {
              newEvents.push(makeEvent("motor_overcurrent", l.id, "warn", { amp, up }));
            }
          }

          // 랜덤 이벤트(예: 비가동 시작/불량 급증)
          if (Math.random() < 0.08) {
            const type = randPick(["downtime_start", "quality_spike"]);
            const severity = randPick(["info", "warn", "critical"]);
            const code = type === "downtime_start" ? sampleDowntime()?.code : undefined;
            newEvents.push({
              ts: Date.now(),
              lineId: l.id,
              type,
              code,
              severity,
              message: renderEventMessage(type, l.name, code),
            });
          }

          const ts = Date.now();
          const run = status === "RUN" ? 1 : 0;
          const timeline = [...l.timeline, { ts, run, pcs, amp }].slice(-600);

          return {
            ...l,
            status,
            produced: l.produced + pcs,
            good: l.good + pcs - (pcs && Math.random() < 0.02 ? 1 : 0),
            defects: l.defects + (pcs && Math.random() < 0.02 ? 1 : 0),
            motorAmp: amp,
            runtimeSec: l.runtimeSec + (run ? 1 : 0),
            stopSec: l.stopSec + (run ? 0 : 1),
            timeline,
            downtimeCode: status !== "RUN" ? l.downtimeCode ?? sampleDowntime() : null,
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
    const availabilityPct = pct(totRuntime, totRuntime + totStop); // ▶︎ 투입시간-비가동시간 / 투입시간
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

  // 모터 과전류 이벤트만 타임라인에 표시
  const motorEventsForSelected = useMemo(
    () =>
      events.filter(
        (e) => e.lineId === selectedLine.id && e.type === "motor_overcurrent"
      ),
    [events, selectedLine.id]
  );

  return (
    <Box sx={{ p: 2, bgcolor: PAL.pageBg, color: PAL.text }}>
      <StickyKPIBar now={now} kpi={kpi} events={events} onOpenEvents={() => setEventModalOpen(true)} />

      {/* 이벤트 모달 */}
      <EventsModal
        open={eventModalOpen}
        onClose={() => setEventModalOpen(false)}
        events={events}
        onAcknowledge={onAcknowledge}
      />

      <Grid container spacing={2} alignItems="stretch" sx={{ mt: 0 }}>
        {/* 좌측: 라인 타일(Sticky + 내부 스크롤) */}
        <Grid item xs={12} md={3} sx={{ alignSelf: "stretch" }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.25,
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

        {/* 중앙: 타임라인 + 하단 MiddleBand */}
        <Grid item xs={12} md={9} sx={{ minWidth: 0 }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.25,
              height: "100%",
              border: `1px solid ${PAL.border}`,
              borderRadius: 2,
              bgcolor: PAL.panelBg,
            }}
          >
            <Grid
              container
              spacing={2}
              alignItems="stretch"
              wrap="nowrap"
              sx={{ overflowX: { xs: "auto", md: "visible" } }}
            >
              <Grid item xs sx={{ minWidth: 0, display: "flex" }}>
                <RunTimelinePanel
                  line={selectedLine}
                  data={selectedTimeline}
                  fixedHeight={TL_EVT_HEIGHT}
                  events={motorEventsForSelected}
                />
              </Grid>
            </Grid>

            {/* 2행: 부품/소모품 상태 모니터링 */}
            <Box sx={{ mt: 2 }}>
              <MiddleBand line={selectedLine} events={events} />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

// ---------------------------- 컴포넌트 ---------------------------
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
        p: 1.25,
        bgcolor: PAL.panelBg,
        border: `1px solid ${PAL.border}`,
        borderRadius: 2,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
        <Typography variant="subtitle2" sx={{ fontSize: "1.25rem", fontWeight: 700 }}>
          {fmtDate(now)} · {fmtTime(now)}
        </Typography>

        <Stack direction="row" spacing={1.25} alignItems="center">
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
              px: 1.25,
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

/* -------- 이벤트 모달 (리디자인) -------- */
function EventsModal({ open, onClose, events, onAcknowledge }) {
  const [filter, setFilter] = useState("all"); // all | critical | warn | info
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
          py: 1.25,
          borderBottom: `1px solid ${PAL.border}`,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            이벤트 / 알림
          </Typography>
          <Chip size="small" label={`전체 ${sevCounts.all}`} sx={chipStyle()} />
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 1.25 }}>
        {/* 필터 칩 */}
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

        {/* 리스트 */}
        <List dense sx={{ maxHeight: 520, overflowY: "auto", px: 0.5 }}>
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
                    p: 1.25,
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
                  {/* 좌측 색 띠 */}
                  <Box sx={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, bgcolor: meta.color }} />

                  {/* 아이콘 */}
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

                  {/* 본문 */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
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

                  {/* 액션 */}
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

      <DialogActions sx={{ p: 1.25, borderTop: `1px solid ${PAL.border}` }}>
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
    default: { c: PAL.text, b: PAL.chipBg, bd: PAL.chipBorder },
    info: { c: PAL.subText, b: "#eef2ff", bd: "#e0e7ff" },
    warn: { c: "#b45309", b: "#fff7ed", bd: "#ffedd5" },
    critical: { c: "#991b1b", b: "#fee2e2", bd: "#fecaca" },
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

/* -------- LineTileGrid (스파크라인 없이 카드형) -------- */
function LineTileGrid({ lines, onSelect, selectedId }) {
  return (
    <Paper elevation={0} sx={{ p: 1.25, bgcolor: "#f8fafc", border: `1px solid ${PAL.border}`, borderRadius: 2 }}>
      <Stack spacing={1.5}>
        {lines.map((l) => {
          const avail = pct(l.runtimeSec, l.runtimeSec + l.stopSec);
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
                p: 1.3,
                minHeight: 140,
              }}
            >
              {/* 상단: 라인명 + 상태 */}
              <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
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

              {/* 하단: 달성률 & 가동률 2단 레이아웃 */}
              <Grid container spacing={1} sx={{ mt: "auto" }}>
                <Grid item xs={6}>
                  <Typography variant="body2" sx={{ color: PAL.subText, mb: 0.5 }}>
                    달성률
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.3 }}>
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
                  <Typography variant="body2" sx={{ color: PAL.subText, mb: 0.5 }}>
                    가동률
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: col, mb: 0.3 }}>
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
    RUN: { text: "RUN", color: PAL.accentGreen },
    STOP: { text: "STOP", color: PAL.accentRed },
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

function LinearWithLabel({ label, value }) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.3 }}>
        <Typography variant="body2" sx={{ color: PAL.subText }}>
          {label}
        </Typography>
        <Typography variant="body2">
          <b>{value}%</b>
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 6,
          borderRadius: 1,
          bgcolor: PAL.chipBg,
          ".MuiLinearProgress-bar": {
            bgcolor:
              value >= 100 ? PAL.accentGreen : value >= 80 ? "#06b6d4" : PAL.accentBlue,
          },
        }}
      />
    </Box>
  );
}

/* ---------------- 타임라인: 메인 모터 전류 시각화 + 밴딩/마커 + 범례 ---------------- */
function RunTimelinePanel({ line, data, fixedHeight = TL_EVT_HEIGHT, events = [] }) {
  const availPct = useMemo(() => pct(line.runtimeSec, line.runtimeSec + line.stopSec), [line.runtimeSec, line.stopSec]);
  const stopMin = useMemo(() => continuousStopMinutes(data), [data]);
  const isStop = line.status !== "RUN";
  const isRunning = line.status === "RUN";
  const reason = line.downtimeCode?.label || line.downtimeCode?.code;
  const estMin = reason ? DOWNTIME_SLA_MIN[line.downtimeCode?.code] || 5 : null;

  const ampUpper = line?.motor?.upper ?? 0;

  // ✅ 마지막 RUN 차트 스냅샷 보관 → STOP이면 이 데이터로 렌더(뷰포트 고정)
  const lastRunDataRef = useRef(data);
  useEffect(() => {
    if (isRunning) lastRunDataRef.current = data;
  }, [isRunning, data]);
  const chartData = isRunning ? data : (lastRunDataRef.current || data);

  const exceedBands = useMemo(() => computeExceedBands(chartData, ampUpper), [chartData, ampUpper]);
  const ampAgg = useMemo(() => ampStats(chartData, ampUpper), [chartData, ampUpper]);
  const eventLabels = useMemo(() => events.map((e) => new Date(e.ts).toLocaleTimeString()), [events]);

  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        height: fixedHeight,
        width: "100%",
        bgcolor: PAL.panelBg,
        border: `1px solid ${PAL.border}`,
        color: PAL.text,
        borderRadius: 2,
      }}
    >
      <CardContent sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* 헤더 */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
          <Stack direction="row" spacing={1} alignItems="baseline">
            <Typography variant="h6">
              <b>{line.name}</b> · 타임라인
            </Typography>
            <Chip size="small" label={`가동률 ${availPct}%`} sx={chipStyle()} />
            <Chip size="small" label={`메인 모터 상한 ${ampUpper}A`} sx={chipStyle()} />
            <Chip size="small" label={`Max ${ampAgg.max}A`} sx={chipStyle()} />
            {!!ampUpper && (
              <Chip size="small" label={`초과 ${ampAgg.overSec}s · ${ampAgg.overCnt}건`} sx={chipStyle()} />
            )}
          </Stack>

          {isStop && reason && (
            <Chip
              size="small"
              label={`정지 · ${reason}${estMin ? ` · 예상 ${estMin}분` : ""}`}
              sx={{ bgcolor: "#fee2e2", border: `1px solid ${PAL.accentRed}55`, color: PAL.accentRed }}
            />
          )}
        </Stack>

        {/* 미니 범례(시선 유도용) */}
        <Stack direction="row" spacing={2} sx={{ mb: 0.5, color: PAL.subText }}>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 14, height: 3, bgcolor: PAL.accentBlue, borderRadius: 1 }} />
            <Typography variant="caption">파란 선 = <b>메인 모터 전류(A)</b></Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 14, height: 8, bgcolor: colorAlpha(PAL.accentGreen, 0.3), border: `1px solid ${PAL.accentGreen}66`, borderRadius: 0.5 }} />
            <Typography variant="caption">초록 영역 = <b>가동 상태(RUN)</b></Typography>
          </Stack>
        </Stack>

        {/* 차트 */}
        <Box sx={{ flex: 1, minHeight: 0, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 34, right: 60, bottom: 8, left: 8 }}>
              <defs>
                <linearGradient id="runFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={PAL.accentGreen} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={PAL.accentGreen} stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid stroke={PAL.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="t"
                tick={{ fill: PAL.subText, fontSize: 11 }}
                tickFormatter={(v) => v.split(":").slice(0, 2).join(":")}
              />
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

              {/* 범례 */}
              <Legend
                verticalAlign="top"
                align="right"
                height={20}
                wrapperStyle={{ color: PAL.subText, fontSize: 12 }}
              />

              {/* 툴팁 */}
              <ReTooltip content={<ChartTooltipRunAmp ampUpper={ampUpper} />} />

              {/* 시리즈 */}
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

          {isStop && (
            <Box
              sx={{
                position: "absolute",
                inset: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "#ef44440d",
                border: `1px dashed ${PAL.accentRed}66`,
                borderRadius: 2,
              }}
            >
              <Typography variant="h5" sx={{ color: PAL.accentRed, fontWeight: 800 }}>
                정지 {stopMin}분
              </Typography>
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
      <Typography variant="caption" sx={{ color: PAL.subText }}>{label}</Typography>
      <Typography variant="body2"><b>가동 상태:</b> {p.run === 1 ? "RUN" : "STOP"}</Typography>
      <Typography variant="body2">
        <b>메인 모터 전류:</b> {Math.round(p.amp)} A {ampUpper ? `(상한 ${ampUpper}A)` : ""}
      </Typography>
    </Box>
  );
}

/* ---------------- MiddleBand: 부품/소모품 ---------------- */
const DIE_ACCEL = 2.5; // 금형 타수 가속(데모)

const PART_LIFE = {
  DIE: { unit: "타", base: 120000, label: "금형" },
  BEARING: { unit: "h", base: 2000, label: "베어링" },
  SENSOR: { unit: "h", base: 1500, label: "센서" },
  HYDRAULIC: { unit: "h", base: 3000, label: "유압 장치" },
  VACUUM_CUP: { unit: "h", base: 400, label: "흡착컵" },
};

function MiddleBand({ line, events }) {
  const now = Date.now();
  const DAY = 24 * 60 * 60 * 1000;
  const events24h = useMemo(() => events.filter((e) => now - e.ts <= DAY), [events, now]);
  const parts = useMemo(() => computePartsForLine(line, events24h), [line, events24h]);

  return (
    <Card sx={{ bgcolor: PAL.panelBg, border: `1px solid ${PAL.border}`, color: PAL.text, borderRadius: 2, width: "100%" }}>
      <CardContent sx={{ p: { xs: 1.25, sm: 1.5, md: 2 } }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
          <Typography variant="subtitle1" noWrap title={`부품/소모품 상태 모니터링 · ${line?.name || ""}`} sx={{ maxWidth: "100%" }}>
            <b>부품/소모품 상태 모니터링</b> · {line?.name}
          </Typography>
          <Chip size="small" label="최근 24h 기준" sx={chipStyle()} />
        </Stack>

        {/* ✅ 반응형 그리드: 컨테이너 폭에 맞춰 자동 칼럼 수 조정 */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
            gap: 1.25,
            alignItems: "stretch",
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

function computePartsForLine(line, events24h) {
  if (!line) return [];
  const usedH = (line.runtimeSec || 0) / 3600;
  const counts = { VACUUM_ERR: 0, QDC_CLAMP: 0, SENSOR_ABN: 0, MATERIAL: 0, CHANGE_DIE: 0 };
  events24h
    .filter((e) => e.lineId === line.id && e.type === "downtime_start")
    .forEach((e) => {
      if (counts[e.code] !== undefined) counts[e.code]++;
    });

  const dieUsed = Math.round(line.produced * DIE_ACCEL);
  const brUsedH = usedH + counts.MATERIAL * 0.5 + counts.CHANGE_DIE * 0.5;
  const snUsedH = usedH + counts.SENSOR_ABN * 8 + counts.VACUUM_ERR * 2;
  const hydUsedH = usedH + counts.QDC_CLAMP * 4;
  const cupUsedH = usedH + counts.VACUUM_ERR * 5;

  const parts = [
    makePart("DIE", PART_LIFE.DIE, dieUsed),
    makePart("BEARING", PART_LIFE.BEARING, brUsedH),
    makePart("SENSOR", PART_LIFE.SENSOR, snUsedH),
    makePart("HYDRAULIC", PART_LIFE.HYDRAULIC, hydUsedH),
    makePart("VACUUM_CUP", PART_LIFE.VACUUM_CUP, cupUsedH),
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
      used: Math.max(0, Math.round(used)),
      remain: Math.max(0, Math.round(remain)),
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

/* -------- 부품 카드 -------- */
function PartHealthCard({ part }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.25,
        border: `1px solid ${PAL.border}`,
        borderRadius: 2,
        bgcolor: PAL.panelBg,
        display: "flex",
        flexDirection: "column",
        gap: 0.6,
        height: "100%",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.25 }}>
        <Typography variant="body2">
          <b>{part.name}</b>
        </Typography>
        <Chip
          size="small"
          label={part.status}
          sx={{ bgcolor: part.bg, color: part.color, border: `1px solid ${part.border}`, borderRadius: 1.5 }}
        />
      </Stack>

      <Typography variant="caption" sx={{ color: PAL.subText }}>
        사용 {part.used.toLocaleString()}
        {part.unit} <span style={{ color: "#9CA3AF" }}>/</span> 수명 {part.base.toLocaleString()}
        {part.unit}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={part.usagePct}
        sx={{
          height: 8,
          borderRadius: 1,
          bgcolor: PAL.chipBg,
          ".MuiLinearProgress-bar": {
            bgcolor: part.usagePct >= 100 ? PAL.accentRed : part.usagePct >= 85 ? "#f59e0b" : PAL.accentBlue,
          },
        }}
      />

      <Typography variant="caption" sx={{ color: PAL.subText, mt: 0.2 }}>
        남은 수명: <b>{part.remain.toLocaleString()}{part.unit}</b>
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.max(0, 100 - part.usagePct)}
        sx={{
          height: 6,
          borderRadius: 1,
          bgcolor: "#F9FAFB",
          ".MuiLinearProgress-bar": { bgcolor: "#D1D5DB" },
          mt: 0.4,
        }}
      />
    </Paper>
  );
}

// ---------------------------- 헬퍼 ----------------------------
function toRechartsData(arr) {
  return arr.map((x) => ({
    t: new Date(x.ts).toLocaleTimeString(),
    run: x.run,
    pcs: x.pcs,
    amp: x.amp ?? 0,
  }));
}
function rollingAvailability(data) {
  if (!data || data.length === 0) return 0;
  const run = data.reduce((a, b) => a + (b.run ? 1 : 0), 0);
  return Math.round((run / data.length) * 100);
}
function windowAvailability(data, sec = 60) {
  if (!data || data.length === 0) return 0;
  const take = data.slice(-sec);
  const run = take.reduce((a, b) => a + (b.run ? 1 : 0), 0);
  return Math.round((run / take.length) * 100);
}
function continuousStopMinutes(data) {
  let i = data.length - 1,
    sec = 0;
  while (i >= 0 && data[i].run === 0) {
    sec++;
    i--;
  }
  return Math.floor(sec / 60);
}
function sampleDowntime() {
  return randPick(DOWNTIME_POOL);
}
function randPick(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}
function sevColor(s) {
  return s === "critical" ? PAL.accentRed : s === "warn" ? "#f59e0b" : PAL.subText;
}
function removeEvent(setter, idx) {
  setter((prev) => prev.filter((_, i) => i !== idx));
}

function renderEventMessage(type, lineName, code) {
  switch (type) {
    case "downtime_start":
      return `[${lineName}] 비가동 시작 · ${code || "원인확인"}`;
    case "quality_spike":
      return `[${lineName}] 불량 급증 감지`;
    case "motor_overcurrent":
      return `[${lineName}] 메인 모터 전류 상한 초과`;
    default:
      return `[${lineName}] 이벤트`;
  }
}

function makeEvent(type, lineId, severity, extra = {}) {
  const nameMap = { L1500: "1500T", L1200: "1200T", L1000: "1000T", L800: "800T" };
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
  if (status !== "RUN") return Math.max(0, 3 + Math.random() * 5); // 정지 시 거의 0 근처
  const jitter = (Math.random() - 0.5) * 0.25; // ±12.5%
  let amp = nom * (1 + jitter);
  if (Math.random() < 0.06) amp *= 1.25; // 간헐 스파이크
  if (Math.random() < 0.02) amp *= 1.45; // 드문 큰 스파이크
  return Math.min(amp, up * 1.35);
}

/* ----- 전류 상한 초과 밴드/요약 계산 ----- */
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
function ampStats(data, upper) {
  if (!data?.length) return { max: 0, overSec: 0, overCnt: 0 };
  let max = 0,
    overSec = 0,
    overCnt = 0,
    prevOver = false;
  for (const d of data) {
    if (d.amp > max) max = d.amp;
    const over = upper && d.amp > upper;
    if (over) overSec += 1; // 1s 샘플 가정
    if (over && !prevOver) overCnt += 1;
    prevOver = over;
  }
  return { max: Math.round(max), overSec, overCnt };
}

/* ----- 알림용 헬퍼 ----- */
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
  const nameMap = { L1500: "1500T", L1200: "1200T", L1000: "1000T", L800: "800T" };
  return nameMap[id] || id;
}
