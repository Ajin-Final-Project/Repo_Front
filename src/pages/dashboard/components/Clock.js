import React, { useEffect, useState } from "react";

/**
 * Clock (HH:MM:SS)
 * - 1초 단위로 딱 맞춰 갱신되도록 ms 보정(setTimeout) 사용
 * - 24시간/12시간 표기 전환, 타임존 지정 가능
 *
 * Props
 *  - is24Hour?: boolean = true    // 24시간제 여부
 *  - timeZone?: string = "local"   // IANA 타임존("Asia/Seoul" 등), "local"이면 브라우저 로컬
 *  - className?: string = ""       // Tailwind 등 외부 스타일링용
 */
export default function Clock({
    is24Hour = true,
    timeZone = "local",
    className = "",
}) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        let timeoutId;

        const scheduleNextTick = () => {
        // 다음 초의 경계(1000ms)에 맞춰 갱신 -> 드리프트 최소화
        const ms = new Date().getMilliseconds();
        const delay = 1000 - ms;
        timeoutId = window.setTimeout(() => {
            setNow(new Date());
            scheduleNextTick();
        }, delay);
        };

        scheduleNextTick();
        return () => clearTimeout(timeoutId);
    }, []);

    const formatOptions = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: !is24Hour,
        ...(timeZone !== "local" ? { timeZone } : {}),
    };

    // 브라우저 기본 언어를 사용(한국어 환경이면 ko-KR)
    const timeText = new Intl.DateTimeFormat(undefined, formatOptions).format(now);

    return (
        <div
        className={`w-full h-full flex items-center justify-center p-6 ${className}`}
        role="timer"
        aria-live="polite"
        aria-label="현재 시간"
        title="현재 시간"
        >
        {/* Tailwind가 없더라도 기본 텍스트만 표시됩니다. */}
        <div style={{ textAlign: "right", fontSize: "35px", fontWeight: "bold"}}>
            {timeText}
        </div>
        </div>
    );
}
