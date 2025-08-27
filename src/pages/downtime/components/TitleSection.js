import React from "react";
import s from "../DowntimeChart.module.scss";

export default function TitleSection({ themeHex }) {
    return (
        <div className={s.titleCon}>
        <h1 style={{ color: themeHex }}>비가동 데이터 차트</h1>
        <p className={s.contant}>비가동 현황을 차트로 한눈에 파악할 수 있습니다.</p>
        </div>
    );
}