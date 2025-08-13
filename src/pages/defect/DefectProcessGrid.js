import React from 'react';
import s from './DefectProcessGrid.module.scss';

const DefectProcessGrid = () => {
  // 불량공정 그리드용 더미 데이터
  const defectGridData = [
    { id: 1, product: '제품A', line: '라인1', defectType: '크랙', quantity: 5, status: '처리완료', date: '2024-01-15', worker: '김철수' },
    { id: 2, product: '제품B', line: '라인2', defectType: '불량도장', quantity: 3, status: '처리중', date: '2024-01-15', worker: '이영희' },
    { id: 3, product: '제품C', line: '라인1', defectType: '치수불량', quantity: 8, status: '대기', date: '2024-01-15', worker: '박민수' },
    { id: 4, product: '제품A', line: '라인3', defectType: '표면결함', quantity: 2, status: '처리완료', date: '2024-01-15', worker: '최지영' },
    { id: 5, product: '제품B', line: '라인2', defectType: '조립불량', quantity: 6, status: '처리중', date: '2024-01-15', worker: '정현우' }
  ];

  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>불량공정 그리드</h1>
        <div className={s.gridSection}>
          <div className={s.gridHeader}>
            <h3>불량공정 현황 상세</h3>
            <div className={s.gridControls}>
              <input
                type="text"
                placeholder="제품명 검색..."
                className={s.searchInput}
              />
              <select className={s.filterSelect}>
                <option value="">전체 상태</option>
                <option value="처리완료">처리완료</option>
                <option value="처리중">처리중</option>
                <option value="대기">대기</option>
              </select>
            </div>
          </div>
          <div className={s.gridTable}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>제품명</th>
                  <th>라인</th>
                  <th>불량유형</th>
                  <th>수량</th>
                  <th>상태</th>
                  <th>날짜</th>
                  <th>담당자</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {defectGridData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.product}</td>
                    <td>{row.line}</td>
                    <td>{row.defectType}</td>
                    <td>{row.quantity}</td>
                    <td>
                      <span className={`${s.status} ${s[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.date}</td>
                    <td>{row.worker}</td>
                    <td>
                      <button className={s.actionBtn}>상세</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className={s.gridPagination}>
            <button className={s.paginationBtn}>이전</button>
            <span className={s.paginationInfo}>1-5 / 25</span>
            <button className={s.paginationBtn}>다음</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DefectProcessGrid;
