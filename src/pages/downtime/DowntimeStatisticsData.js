import React from 'react';
import s from './DowntimeStatisticsData.module.scss';

const DowntimeStatisticsData = () => {
  // 비가동 통계 데이터용 더미 데이터
  const downtimeData = [
    { id: 1, line: '라인1', reason: '정기점검', startTime: '2024-01-15 08:00', endTime: '2024-01-15 12:00', duration: '4시간', status: '완료', worker: '김철수' },
    { id: 2, line: '라인2', reason: '설비고장', startTime: '2024-01-15 10:30', endTime: '2024-01-15 15:30', duration: '5시간', status: '완료', worker: '이영희' },
    { id: 3, line: '라인1', reason: '원료부족', startTime: '2024-01-15 14:00', endTime: '2024-01-15 16:00', duration: '2시간', status: '진행중', worker: '박민수' },
    { id: 4, line: '라인3', reason: '품질검사', startTime: '2024-01-15 09:00', endTime: '2024-01-15 11:00', duration: '2시간', status: '완료', worker: '최지영' },
    { id: 5, line: '라인2', reason: '인력부족', startTime: '2024-01-15 13:00', endTime: '2024-01-15 14:30', duration: '1.5시간', status: '완료', worker: '정현우' }
  ];

  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>비가동 통계 데이터</h1>
        <div className={s.dataSection}>
          <div className={s.dataHeader}>
            <h3>비가동 현황 상세</h3>
            <div className={s.dataControls}>
              <input
                type="text"
                placeholder="라인명 검색..."
                className={s.searchInput}
              />
              <select className={s.filterSelect}>
                <option value="">전체 상태</option>
                <option value="완료">완료</option>
                <option value="진행중">진행중</option>
                <option value="대기">대기</option>
              </select>
            </div>
          </div>
          <div className={s.dataTable}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>라인</th>
                  <th>비가동 사유</th>
                  <th>시작시간</th>
                  <th>종료시간</th>
                  <th>소요시간</th>
                  <th>상태</th>
                  <th>담당자</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {downtimeData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.line}</td>
                    <td>{row.reason}</td>
                    <td>{row.startTime}</td>
                    <td>{row.endTime}</td>
                    <td>{row.duration}</td>
                    <td>
                      <span className={`${s.status} ${s[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.worker}</td>
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

export default DowntimeStatisticsData;
