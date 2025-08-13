import React from 'react';
import s from './MoldCleaningData.module.scss';

const MoldCleaningData = () => {
  // 금형세척 데이터용 더미 데이터
  const cleaningData = [
    { id: 1, moldCode: 'MC-001', product: '제품A', status: '완료', date: '2024-01-15', worker: '김철수', time: '2시간 30분' },
    { id: 2, moldCode: 'MC-002', product: '제품B', status: '진행중', date: '2024-01-15', worker: '이영희', time: '1시간 45분' },
    { id: 3, moldCode: 'MC-003', product: '제품C', status: '완료', date: '2024-01-15', worker: '박민수', time: '3시간 15분' },
    { id: 4, moldCode: 'MC-004', product: '제품A', status: '대기', date: '2024-01-15', worker: '최지영', time: '-' },
    { id: 5, moldCode: 'MC-005', product: '제품B', status: '완료', date: '2024-01-15', worker: '정현우', time: '2시간 10분' }
  ];

  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>금형세척 데이터</h1>
        
        <div className={s.dataSection}>
          <div className={s.dataHeader}>
            <h3>금형세척 현황 상세</h3>
            <div className={s.dataControls}>
              <input
                type="text"
                placeholder="금형코드 검색..."
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
                  <th>금형코드</th>
                  <th>제품명</th>
                  <th>상태</th>
                  <th>날짜</th>
                  <th>작업자</th>
                  <th>소요시간</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {cleaningData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.moldCode}</td>
                    <td>{row.product}</td>
                    <td>
                      <span className={`${s.status} ${s[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.date}</td>
                    <td>{row.worker}</td>
                    <td>{row.time}</td>
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

export default MoldCleaningData;
