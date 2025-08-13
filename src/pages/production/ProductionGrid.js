import React from 'react';
import s from './ProductionGrid.module.scss';

const ProductionGrid = () => {
  // 생산 데이터 그리드용 더미 데이터
  const productionGridData = [
    { id: 1, product: '제품A', line: '라인1', quantity: 150, status: '완료', date: '2024-01-15' },
    { id: 2, product: '제품B', line: '라인2', quantity: 200, status: '진행중', date: '2024-01-15' },
    { id: 3, product: '제품C', line: '라인1', quantity: 180, status: '완료', date: '2024-01-15' },
    { id: 4, product: '제품A', line: '라인3', quantity: 120, status: '대기', date: '2024-01-15' },
    { id: 5, product: '제품B', line: '라인2', quantity: 160, status: '완료', date: '2024-01-15' }
  ];

  return (
    <div className={s.root}>
      <div className={s.container}>
        <h1>생산 데이터 그리드</h1>
        
        <div className={s.gridSection}>
          <div className={s.gridHeader}>
            <h3>생산 현황 상세</h3>
            <div className={s.gridControls}>
              <input
                type="text"
                placeholder="검색..."
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

          <div className={s.gridTable}>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>제품명</th>
                  <th>라인</th>
                  <th>수량</th>
                  <th>상태</th>
                  <th>날짜</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {productionGridData.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.product}</td>
                    <td>{row.line}</td>
                    <td>{row.quantity}</td>
                    <td>
                      <span className={`${s.status} ${s[row.status]}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>{row.date}</td>
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

export default ProductionGrid;
