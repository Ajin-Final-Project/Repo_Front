import React from 'react';
import s from './InspectionSystemData.module.scss';

const InspectionSystemData = () => {
  // 검사 시스템 데이터용 더미 데이터
  const inspectionData = [
    { id: 1, product: '제품A', type: '초품검사', inspector: '김철수', result: '합격', date: '2024-01-15', time: '09:30', notes: '규격 적합' },
    { id: 2, product: '제품B', type: '중품검사', inspector: '이영희', result: '불합격', date: '2024-01-15', time: '10:15', notes: '치수 불량' },
    { id: 3, product: '제품C', type: '종품검사', inspector: '박민수', result: '합격', date: '2024-01-15', time: '11:00', notes: '품질 우수' },
    { id: 4, product: '제품A', type: '초품검사', inspector: '최지영', result: '합격', date: '2024-01-15', time: '13:30', notes: '규격 적합' },
    { id: 5, product: '제품B', type: '종품검사', inspector: '정현우', result: '합격', date: '2024-01-15', time: '14:45', notes: '품질 적합' }
  ];

  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>검사 시스템 데이터</h1>
        <div className={s.dataSection}>
          <div className={s.dataHeader}>
            <h3>검사 현황 상세</h3>
            <div className={s.dataControls}>
              <input
                type="text"
                placeholder="제품명 검색..."
                className={s.searchInput}
              />
              <select className={s.filterSelect}>
                <option value="">전체 결과</option>
                <option value="합격">합격</option>
                <option value="불합격">불합격</option>
              </select>
            </div>
          </div>
          <div className={s.dataTable}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>제품명</th>
                  <th>검사유형</th>
                  <th>검사자</th>
                  <th>결과</th>
                  <th>날짜</th>
                  <th>시간</th>
                  <th>비고</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {inspectionData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.product}</td>
                    <td>{row.type}</td>
                    <td>{row.inspector}</td>
                    <td>
                      <span className={`${s.result} ${s[row.result]}`}>
                        {row.result}
                      </span>
                    </td>
                    <td>{row.date}</td>
                    <td>{row.time}</td>
                    <td>{row.notes}</td>
                    <td>
                      <button className={s.actionBtn}>상세</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.dataPagination}>
            <button className={s.paginationBtn}>이전</button>
            <span className={s.paginationInfo}>1-5 / 25</span>
            <button className={s.paginationBtn}>다음</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionSystemData;
