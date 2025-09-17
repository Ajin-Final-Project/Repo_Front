// // // // // // src/pages/inspection/InspectionSystemData.js
// // // // // import config from '../../config';
// // // // // import React, { Component } from 'react';

// // // // // import {
// // // // //   Box,
// // // // //   Paper,
// // // // //   TextField,
// // // // //   Button,
// // // // //   Typography,
// // // // //   CardHeader,
// // // // //   IconButton,
// // // // //   Divider,
// // // // //   Collapse,
// // // // //   CircularProgress,
// // // // //   Alert,
// // // // //   Menu,
// // // // //   MenuItem,
// // // // //   InputAdornment,
// // // // // } from '@mui/material';
// // // // // import { Autocomplete } from '@mui/material';
// // // // // import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// // // // // import {
// // // // //   Search as SearchIcon,
// // // // //   Clear as ClearIcon,
// // // // //   FilterList as FilterIcon,
// // // // //   ExpandMore as ExpandMoreIcon,
// // // // //   ExpandLess as ExpandLessIcon,
// // // // //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // // // // } from '@mui/icons-material';

// // // // // import InspectionItemModal from '../common/InspectionItemModal';
// // // // // import s from './InspectionSystemData.module.scss';

// // // // // /** ---------- helpers ---------- */
// // // // // const iso = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD
// // // // // const today0 = () => {
// // // // //   const t = new Date();
// // // // //   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// // // // // };
// // // // // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // // // /** 버튼 기준 화면 좌표 → Menu anchorPosition */
// // // // // const getAnchorPos = (el) => {
// // // // //   if (!el) return null;
// // // // //   const r = el.getBoundingClientRect();
// // // // //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // // // // };
// // // // // /** 월요일 시작 주간 */
// // // // // const startOfWeek = (d) => {
// // // // //   const day = d.getDay();
// // // // //   const diff = (day === 0 ? -6 : 1) - day;
// // // // //   const s = new Date(d);
// // // // //   s.setDate(d.getDate() + diff);
// // // // //   return new Date(s.getFullYear(), s.getMonth(), s.getDate());
// // // // // };
// // // // // const endOfWeek = (d) => {
// // // // //   const s = startOfWeek(d);
// // // // //   return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
// // // // // };
// // // // // const getWeeksOfMonth = (year, month) => {
// // // // //   const first = new Date(year, month - 1, 1);
// // // // //   const last = lastOfMonth(first);
// // // // //   let cur = startOfWeek(first);
// // // // //   const out = [];
// // // // //   let idx = 1;
// // // // //   while (cur <= last) {
// // // // //     const s = new Date(cur), e = endOfWeek(cur);
// // // // //     const clipS = new Date(Math.max(s, first));
// // // // //     const clipE = new Date(Math.min(e, last));
// // // // //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// // // // //     idx += 1;
// // // // //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// // // // //   }
// // // // //   return out;
// // // // // };

// // // // // /** ▶ 기본값을 '전체' 상태로 변경 (start_date/end_date/equipment = "") */
// // // // // const getDefaultFilters = () => ({
// // // // //   start_date: '',   // 전체기간
// // // // //   end_date: '',     // 전체기간
// // // // //   factory: '아진산업-본사(경산)',
// // // // //   process: '프레스',
// // // // //   equipment: '',    // 전체 설비
// // // // //   partNo: '',
// // // // //   item: '',
// // // // //   inspType: '',
// // // // //   workType: '',
// // // // //   shiftType: '',
// // // // //   topN: 5,
// // // // // });

// // // // // /* ====== 키/값 정규화 유틸 ====== */
// // // // // /* eslint-disable no-control-regex */
// // // // // const INVISIBLE = /[\u00A0\u200B-\u200F\u202A-\u202E\u2060]/g; // NBSP & zero-width & bidi
// // // // // const CTRL_IN_KEYS = /[\u0000-\u001F\u007F]/g;                 // control chars (키 전용)
// // // // // const CTRL_IN_VALUES = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g; // 값에서만 제거(탭/개행/CR 허용)
// // // // // /* eslint-enable no-control-regex */
// // // // // const MULTI_SPACE = / {2,}/g;

// // // // // /** 키: 제어문자/제로폭/여러 공백 제거 */
// // // // // function normalizeKey(k) {
// // // // //   if (k == null) return '';
// // // // //   return String(k)
// // // // //     .replace(INVISIBLE, '')
// // // // //     .replace(CTRL_IN_KEYS, '')
// // // // //     .trim()
// // // // //     .replace(MULTI_SPACE, ' ');
// // // // // }
// // // // // /** 값: 눈에 보이지 않는 제어문자만 제거 (한글/영문/숫자/기호 보존) */
// // // // // function sanitizeValue(v) {
// // // // //   if (v == null) return v;
// // // // //   if (typeof v === 'string') return v.replace(CTRL_IN_VALUES, '');
// // // // //   return v;
// // // // // }
// // // // // /** 행 키 정규화 */
// // // // // function normalizeRowKeys(row) {
// // // // //   const out = {};
// // // // //   Object.keys(row || {}).forEach((k) => {
// // // // //     const nk = normalizeKey(k);
// // // // //     if (out[nk] == null || out[nk] === '') out[nk] = sanitizeValue(row[k]);
// // // // //   });
// // // // //   return out;
// // // // // }

// // // // // /** 컬럼 정렬 우선순위 */
// // // // // const PREFERRED_ORDER = [
// // // // //   'work_date', '보고일',
// // // // //   'plant', '공장', '플랜트',
// // // // //   'process', '공정',
// // // // //   'equipment', '설비',
// // // // //   '책임자', '작업장', '자재번호', '자재명', '실적번호', '차종',
// // // // //   '양품수량', '생산수량', '불량합계',
// // // // //   '검사구분', '주야구분', '작업순번', '작업구분', '검사순번',
// // // // //   '검사항목명', '검사내용', '생산',
// // // // //   '사업장',
// // // // //   'id'
// // // // // ];

// // // // // export default class InspectionGrid extends Component {
// // // // //   state = {
// // // // //     // 필터
// // // // //     filters: getDefaultFilters(),

// // // // //     // 옵션
// // // // //     factories: [],
// // // // //     processes: [],
// // // // //     equipments: [],
// // // // //     parts: [],
// // // // //     items: [],
// // // // //     optionsLoading: false,

// // // // //     // UI
// // // // //     loading: false,
// // // // //     error: '',
// // // // //     filterExpanded: false,

// // // // //     // 프리셋 상태/앵커
// // // // //     selectedYear: new Date().getFullYear(),
// // // // //     selectedMonth: new Date().getMonth() + 1,
// // // // //     yearAnchorPos: null,
// // // // //     monthAnchorPos: null,
// // // // //     weekAnchorPos: null,

// // // // //     years: [],

// // // // //     // 모달
// // // // //     itemCodeModalOpen: false,

// // // // //     // 그리드
// // // // //     rows: [],
// // // // //     columns: [],
// // // // //   };

// // // // //   componentDidMount() {
// // // // //     const base = getDefaultFilters();
// // // // //     const saved = localStorage.getItem('inspectionFilters');
// // // // //     if (saved) {
// // // // //       try {
// // // // //         const parsed = JSON.parse(saved);
// // // // //         const merged = { ...base, ...parsed };
// // // // //         // 설비는 저장값이 유효하지 않을 수 있으므로 비워서 '전체'
// // // // //         merged.equipment = merged.equipment || '';
// // // // //         // 날짜도 전체기간 유지
// // // // //         merged.start_date = merged.start_date ?? '';
// // // // //         merged.end_date = merged.end_date ?? '';
// // // // //         this.setState({ filters: merged });
// // // // //       } catch {
// // // // //         this.setState({ filters: base });
// // // // //       }
// // // // //     } else {
// // // // //       this.setState({ filters: base });
// // // // //     }
// // // // //     this.bootstrap();
// // // // //   }

// // // // //   /** 공통 POST (그리드 엔드포인트) */
// // // // //   post = async (path, body) => {
// // // // //     const headers = { 'Content-Type': 'application/json' };
// // // // //     const url = `${(config.baseURLApi || '').replace(/\/$/, '')}/smartFactory/inspection_grid${path}`;
// // // // //     const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body || {}) });
// // // // //     if (!res.ok) {
// // // // //       const t = await res.text().catch(() => '');
// // // // //       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// // // // //     }
// // // // //     const json = await res.json();
// // // // //     return json.data || [];
// // // // //   };

// // // // //   /** 초기 부트스트랩 */
// // // // //   bootstrap = async () => {
// // // // //     await this.loadYears();
// // // // //     await this.loadOptions();
// // // // //     this.loadList();
// // // // //   };

// // // // //   /** 연도 목록 (fallback) */
// // // // //   loadYears = async () => {
// // // // //     const y = new Date().getFullYear();
// // // // //     const years = [y, y - 1, y - 2, y - 3, y - 4];
// // // // //     this.setState({ years, selectedYear: y });
// // // // //   };

// // // // //   /** 프론트 → 백엔드 요청 매핑 (빈 문자열은 undefined로 넘겨 필터 해제) */
// // // // //   mapFiltersToRequest = (f) => ({
// // // // //     start_work_date: f.start_date || undefined,
// // // // //     end_work_date: f.end_date || undefined,
// // // // //     plant: f.factory || undefined,
// // // // //     process: f.process || undefined,
// // // // //     equipment: f.equipment || undefined,
// // // // //     itemNumber: f.partNo || undefined,
// // // // //     inspectionType: f.inspType || undefined,
// // // // //     workType: f.workType || undefined,
// // // // //     shiftType: f.shiftType || undefined,
// // // // //   });

// // // // //   /** 옵션 로드 */
// // // // //   loadOptions = async () => {
// // // // //     const { filters } = this.state;
// // // // //     this.setState({ optionsLoading: true });
// // // // //     try {
// // // // //       const reqBase = this.mapFiltersToRequest(filters);

// // // // //       const [factories, processes, equipments, parts, items] = await Promise.all([
// // // // //         this.post('/options/plants', {
// // // // //           start_work_date: reqBase.start_work_date,
// // // // //           end_work_date: reqBase.end_work_date,
// // // // //         }),
// // // // //         this.post('/options/processes', {
// // // // //           start_work_date: reqBase.start_work_date,
// // // // //           end_work_date: reqBase.end_work_date,
// // // // //           plant: reqBase.plant || undefined,
// // // // //         }),
// // // // //         this.post('/options/equipments', {
// // // // //           start_work_date: reqBase.start_work_date,
// // // // //           end_work_date: reqBase.end_work_date,
// // // // //           plant: reqBase.plant || undefined,
// // // // //           process: reqBase.process || undefined,
// // // // //         }),
// // // // //         this.post('/options/partNos', reqBase),
// // // // //         this.post('/options/partNames', reqBase),
// // // // //       ]);

// // // // //       // 현재 필터 값이 실제 옵션에 없으면 자동으로 비움
// // // // //       const fixed = { ...this.state.filters };
// // // // //       if (fixed.factory && factories.length && !factories.includes(fixed.factory)) fixed.factory = '';
// // // // //       if (fixed.process && processes.length && !processes.includes(fixed.process)) fixed.process = '';
// // // // //       if (fixed.equipment && equipments.length && !equipments.includes(fixed.equipment)) fixed.equipment = '';

// // // // //       this.setState({
// // // // //         factories,
// // // // //         processes,
// // // // //         equipments,
// // // // //         parts,
// // // // //         items,
// // // // //         optionsLoading: false,
// // // // //         filters: fixed,
// // // // //       });
// // // // //     } catch (e) {
// // // // //       console.error(e);
// // // // //       this.setState({ optionsLoading: false });
// // // // //     }
// // // // //   };

// // // // //   /** 동적 컬럼 생성 */
// // // // //   buildColumns = (rows) => {
// // // // //     if (!rows?.length) return [];
// // // // //     const keySet = new Set();
// // // // //     const scanCount = Math.min(rows.length, 200);
// // // // //     for (let i = 0; i < scanCount; i += 1) {
// // // // //       Object.keys(rows[i] || {}).forEach((k) => keySet.add(k));
// // // // //     }
// // // // //     const allKeys = Array.from(keySet);
// // // // //     const sortKey = (k) => {
// // // // //       const idx = PREFERRED_ORDER.indexOf(k);
// // // // //       return idx === -1 ? 1000 + allKeys.indexOf(k) : idx;
// // // // //     };
// // // // //     const ordered = allKeys.sort((a, b) => sortKey(a) - sortKey(b));

// // // // //     const dateLike = /(^|_)(date|work_date|reportdate|보고일)$/i;
// // // // //     const cols = ordered
// // // // //       .filter((k) => k !== '')
// // // // //       .map((k) => {
// // // // //         const width = Math.min(340, Math.max(110, (k.length || 6) * 16));
// // // // //         const isDate = dateLike.test(k);
// // // // //         return {
// // // // //           field: k,
// // // // //           headerName: k,
// // // // //           headerClassName: 'super-app-theme--header',
// // // // //           cellClassName: 'super-app-theme--cell',
// // // // //           width,
// // // // //           type: isDate ? 'date' : undefined,
// // // // //           valueGetter: isDate
// // // // //             ? (p) => {
// // // // //                 const v = p.value ?? p.row?.[k];
// // // // //                 if (!v) return null;
// // // // //                 const d = new Date(v);
// // // // //                 return Number.isNaN(d.getTime()) ? null : d;
// // // // //               }
// // // // //             : undefined,
// // // // //         };
// // // // //       });

// // // // //     // id 컬럼 앞으로
// // // // //     const idIdx = cols.findIndex((c) => c.field === 'id');
// // // // //     if (idIdx > 0) {
// // // // //       const idCol = cols.splice(idIdx, 1)[0];
// // // // //       cols.unshift({ ...idCol, width: 100 });
// // // // //     }
// // // // //     return cols;
// // // // //   };

// // // // //   /** 리스트 로드 */
// // // // //   loadList = async () => {
// // // // //     const { filters } = this.state;
// // // // //     try {
// // // // //       localStorage.setItem('inspectionFilters', JSON.stringify(filters));
// // // // //     } catch {}
// // // // //     this.setState({ loading: true, error: '' });
// // // // //     try {
// // // // //       const rawRows = await this.post('/list', this.mapFiltersToRequest(filters));

// // // // //       // 디버깅: 첫 행 비교
// // // // //       if (rawRows?.length) {
// // // // //         // eslint-disable-next-line no-console
// // // // //         console.log('[INSPECTION_GRID] raw sample =', rawRows[0]);
// // // // //       }

// // // // //       const normalized = (rawRows || []).map((r, i) => {
// // // // //         const nr = normalizeRowKeys(r);
// // // // //         const idVal = nr.id ?? r?.id ?? i + 1;
// // // // //         return { id: idVal, ...nr };
// // // // //       });

// // // // //       // 디버깅: 정규화된 첫 행
// // // // //       if (normalized?.length) {
// // // // //         // eslint-disable-next-line no-console
// // // // //         console.log('[INSPECTION_GRID] sample keys =', Object.keys(normalized[0]));
// // // // //         // eslint-disable-next-line no-console
// // // // //         console.log('[INSPECTION_GRID] normalized sample =', normalized[0]);
// // // // //       }

// // // // //       const columns = this.buildColumns(normalized);
// // // // //       this.setState({ rows: normalized, columns, loading: false });
// // // // //     } catch (e) {
// // // // //       console.error(e);
// // // // //       this.setState({ error: '데이터를 불러오지 못했습니다.', loading: false });
// // // // //     }
// // // // //   };

// // // // //   /** 필터 변경 */
// // // // //   handleFilterChange = async (field, value) => {
// // // // //     this.setState(
// // // // //       (prev) => {
// // // // //         const f = { ...prev.filters, [field]: value };
// // // // //         if (field === 'factory') {
// // // // //           f.process = '';
// // // // //           f.equipment = '';
// // // // //           f.partNo = '';
// // // // //           f.item = '';
// // // // //         } else if (field === 'process') {
// // // // //           f.equipment = '';
// // // // //           f.partNo = '';
// // // // //           f.item = '';
// // // // //         } else if (field === 'equipment') {
// // // // //           f.partNo = '';
// // // // //           f.item = '';
// // // // //         } else if (field === 'topN') {
// // // // //           f.topN = Number(value) || 5;
// // // // //         }
// // // // //         return { filters: f };
// // // // //       },
// // // // //       async () => {
// // // // //         await this.loadOptions();
// // // // //         await this.loadList();
// // // // //       }
// // // // //     );
// // // // //   };

// // // // //   /** 날짜 프리셋/범위 */
// // // // //   setDateRange = async (start, end) => {
// // // // //     const start_date = start ? iso(start) : '';
// // // // //     const end_date = end ? iso(end) : '';
// // // // //     this.setState(
// // // // //       (prev) => ({ filters: { ...prev.filters, start_date, end_date } }),
// // // // //       async () => {
// // // // //         try {
// // // // //           localStorage.setItem('inspectionFilters', JSON.stringify(this.state.filters));
// // // // //         } catch {}
// // // // //         await this.loadOptions();
// // // // //         this.loadList();
// // // // //       }
// // // // //     );
// // // // //   };
// // // // //   applyToday = () => {
// // // // //     const t = today0();
// // // // //     this.setDateRange(t, t);
// // // // //   };
// // // // //   selectYear = (y) => {
// // // // //     const s = new Date(y, 0, 1);
// // // // //     const e = new Date(y, 11, 31);
// // // // //     this.setState({ selectedYear: y, yearAnchorPos: null });
// // // // //     this.setDateRange(s, e);
// // // // //   };
// // // // //   selectMonth = (m) => {
// // // // //     const y = this.state.selectedYear;
// // // // //     const s = new Date(y, m - 1, 1);
// // // // //     const e = lastOfMonth(s);
// // // // //     this.setState({ monthAnchorPos: null, selectedMonth: m });
// // // // //     this.setDateRange(s, e);
// // // // //   };
// // // // //   selectWeek = (w) => {
// // // // //     this.setState({ weekAnchorPos: null });
// // // // //     this.setDateRange(w.start, w.end);
// // // // //   };

// // // // //   /** ▶ 전체 초기화(전체기간/전체 옵션) */
// // // // //   resetToAll = async () => {
// // // // //     const filters = getDefaultFilters(); // 이미 전체기간/전체 설비
// // // // //     this.setState({ filters, selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1 }, async () => {
// // // // //       try { localStorage.removeItem('inspectionFilters'); } catch {}
// // // // //       await this.loadOptions();
// // // // //       this.loadList();
// // // // //     });
// // // // //   };

// // // // //   /** 품번/품명 모달 */
// // // // //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// // // // //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// // // // //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// // // // //     this.setState(
// // // // //       (prev) => ({
// // // // //         filters: { ...prev.filters, partNo: 품목번호 || '', item: 품목명 || '' },
// // // // //         itemCodeModalOpen: false,
// // // // //       }),
// // // // //       () => {
// // // // //         this.loadOptions();
// // // // //         this.loadList();
// // // // //       }
// // // // //     );
// // // // //   };

// // // // //   /** ---------- 필터 바 ---------- */
// // // // //   renderFilterBar = () => {
// // // // //     const { filters, factories, processes, equipments, itemCodeModalOpen } = this.state;

// // // // //     const now = today0();
// // // // //     const thisYear = now.getFullYear();
// // // // //     const thisMonth = now.getMonth() + 1;
// // // // //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// // // // //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// // // // //     return (
// // // // //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// // // // //         <CardHeader
// // // // //           title={
// // // // //             <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
// // // // //               <FilterIcon /> 검색 조건
// // // // //             </Typography>
// // // // //           }
// // // // //           action={
// // // // //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
// // // // //               {/* 연간 */}
// // // // //               <Button
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 color="success"
// // // // //                 endIcon={<ExpandMoreIcon />}
// // // // //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // // // //               >
// // // // //                 연간
// // // // //               </Button>
// // // // //               <Menu
// // // // //                 open={!!this.state.yearAnchorPos}
// // // // //                 onClose={() => this.setState({ yearAnchorPos: null })}
// // // // //                 anchorReference="anchorPosition"
// // // // //                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// // // // //               >
// // // // //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
// // // // //                 {this.state.years.map((y) => (
// // // // //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
// // // // //                 ))}
// // // // //               </Menu>

// // // // //               {/* 월간 */}
// // // // //               <Button
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 color="success"
// // // // //                 endIcon={<ExpandMoreIcon />}
// // // // //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // // // //               >
// // // // //                 월간
// // // // //               </Button>
// // // // //               <Menu
// // // // //                 open={!!this.state.monthAnchorPos}
// // // // //                 onClose={() => this.setState({ monthAnchorPos: null })}
// // // // //                 anchorReference="anchorPosition"
// // // // //                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// // // // //               >
// // // // //                 <MenuItem
// // // // //                   dense
// // // // //                   onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}
// // // // //                 >
// // // // //                   이번달
// // // // //                 </MenuItem>
// // // // //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // // // //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// // // // //                     {this.state.selectedYear}년 {m}월
// // // // //                   </MenuItem>
// // // // //                 ))}
// // // // //               </Menu>

// // // // //               {/* 주간 */}
// // // // //               <Button
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 color="success"
// // // // //                 endIcon={<ExpandMoreIcon />}
// // // // //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// // // // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // // // //               >
// // // // //                 주간
// // // // //               </Button>
// // // // //               <Menu
// // // // //                 open={!!this.state.weekAnchorPos}
// // // // //                 onClose={() => this.setState({ weekAnchorPos: null })}
// // // // //                 anchorReference="anchorPosition"
// // // // //                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
// // // // //               >
// // // // //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// // // // //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// // // // //                 </MenuItem>
// // // // //                 {weeks.map((w, i) => (
// // // // //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// // // // //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// // // // //                   </MenuItem>
// // // // //                 ))}
// // // // //               </Menu>

// // // // //               {/* 오늘 */}
// // // // //               <Button
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 color="success"
// // // // //                 onClick={this.applyToday}
// // // // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // // // //               >
// // // // //                 오늘
// // // // //               </Button>

// // // // //               {/* 구분자 & 기간선택 직접 입력 */}
// // // // //               <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>
// // // // //               <Typography sx={{ color: 'white' }}>기간선택</Typography>
// // // // //               <TextField
// // // // //                 type="date"
// // // // //                 value={filters.start_date}
// // // // //                 onChange={(e) => this.handleFilterChange('start_date', e.target.value)}
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
// // // // //                 InputLabelProps={{ shrink: true }}
// // // // //               />
// // // // //               <Typography sx={{ color: 'white' }}>~</Typography>
// // // // //               <TextField
// // // // //                 type="date"
// // // // //                 value={filters.end_date}
// // // // //                 onChange={(e) => this.handleFilterChange('end_date', e.target.value)}
// // // // //                 size="small"
// // // // //                 variant="outlined"
// // // // //                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
// // // // //                 InputLabelProps={{ shrink: true }}
// // // // //               />

// // // // //               {/* 확장/축소 */}
// // // // //               <IconButton
// // // // //                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
// // // // //                 sx={{ color: 'white' }}
// // // // //               >
// // // // //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// // // // //               </IconButton>
// // // // //             </Box>
// // // // //           }
// // // // //           sx={{ backgroundColor: '#ff8f00', color: 'white', borderRadius: 1, mb: 2 }}
// // // // //         />

// // // // //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// // // // //         <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))', gap: 2, mb: 1 }}>
// // // // //           <Autocomplete
// // // // //             size="small"
// // // // //             options={factories}
// // // // //             value={filters.factory || null}
// // // // //             onChange={(_, v) => this.handleFilterChange('factory', v || '')}
// // // // //             renderInput={(params) => <TextField {...params} label="공장" />}
// // // // //             clearOnEscape
// // // // //           />
// // // // //           <Autocomplete
// // // // //             size="small"
// // // // //             options={processes}
// // // // //             value={filters.process || null}
// // // // //             onChange={(_, v) => this.handleFilterChange('process', v || '')}
// // // // //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
// // // // //             clearOnEscape
// // // // //           />
// // // // //           <Autocomplete
// // // // //             size="small"
// // // // //             options={equipments}
// // // // //             value={filters.equipment || null}
// // // // //             onChange={(_, v) => this.handleFilterChange('equipment', v || '')}
// // // // //             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
// // // // //             clearOnEscape
// // // // //           />

// // // // //           <TextField
// // // // //             fullWidth
// // // // //             label="품번"
// // // // //             value={filters.partNo}
// // // // //             onClick={this.openItemCodeModal}
// // // // //             size="small"
// // // // //             variant="outlined"
// // // // //             InputProps={{
// // // // //               readOnly: true,
// // // // //               style: { cursor: 'pointer' },
// // // // //               endAdornment: (
// // // // //                 <InputAdornment position="end">
// // // // //                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
// // // // //                 </InputAdornment>
// // // // //               ),
// // // // //             }}
// // // // //             sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
// // // // //           />

// // // // //           <TextField
// // // // //             fullWidth
// // // // //             label="품명(검사항목)"
// // // // //             value={filters.item}
// // // // //             onClick={this.openItemCodeModal}
// // // // //             size="small"
// // // // //             variant="outlined"
// // // // //             InputProps={{
// // // // //               readOnly: true,
// // // // //               style: { cursor: 'pointer' },
// // // // //               endAdornment: (
// // // // //                 <InputAdornment position="end">
// // // // //                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
// // // // //                 </InputAdornment>
// // // // //               ),
// // // // //             }}
// // // // //             sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
// // // // //           />
// // // // //         </Box>

// // // // //         {/* 확장 필터 */}
// // // // //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// // // // //           <Divider sx={{ my: 2 }} />
// // // // //           <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 16 }}>
// // // // //             <TextField
// // // // //               fullWidth
// // // // //               label="검사구분"
// // // // //               value={filters.inspType}
// // // // //               onChange={(e) => this.handleFilterChange('inspType', e.target.value)}
// // // // //               size="small"
// // // // //               variant="outlined"
// // // // //             />
// // // // //             <TextField
// // // // //               fullWidth
// // // // //               label="작업구분"
// // // // //               value={filters.workType}
// // // // //               onChange={(e) => this.handleFilterChange('workType', e.target.value)}
// // // // //               size="small"
// // // // //               variant="outlined"
// // // // //             />
// // // // //             <TextField
// // // // //               fullWidth
// // // // //               label="주야구분"
// // // // //               value={filters.shiftType}
// // // // //               onChange={(e) => this.handleFilterChange('shiftType', e.target.value)}
// // // // //               size="small"
// // // // //               variant="outlined"
// // // // //             />
// // // // //             <TextField
// // // // //               fullWidth
// // // // //               label="Top N"
// // // // //               type="number"
// // // // //               value={filters.topN ?? 5}
// // // // //               onChange={(e) => this.handleFilterChange('topN', e.target.value)}
// // // // //               size="small"
// // // // //               variant="outlined"
// // // // //             />
// // // // //           </Box>
// // // // //         </Collapse>

// // // // //         {/* 버튼 */}
// // // // //         <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
// // // // //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToAll} size="large" color="secondary">
// // // // //             필터 초기화
// // // // //           </Button>
// // // // //           <Button
// // // // //             variant="contained"
// // // // //             startIcon={<SearchIcon />}
// // // // //             size="large"
// // // // //             sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
// // // // //             onClick={() => {
// // // // //               this.loadOptions();
// // // // //               this.loadList();
// // // // //             }}
// // // // //           >
// // // // //             검색
// // // // //           </Button>
// // // // //         </Box>

// // // // //         {/* 품목 코드/명 선택 모달 */}
// // // // //         <InspectionItemModal
// // // // //           open={itemCodeModalOpen}
// // // // //           onClose={this.closeItemCodeModal}
// // // // //           onSelect={this.handleItemCodeSelect}
// // // // //           selectedItemCode={filters.partNo}
// // // // //           plant={filters.factory}
// // // // //           worker={filters.process}
// // // // //           line={filters.equipment}
// // // // //           startDate={filters.start_date}
// // // // //           endDate={filters.end_date}
// // // // //         />
// // // // //       </Paper>
// // // // //     );
// // // // //   };

// // // // //   render() {
// // // // //     const { error, loading, rows, columns } = this.state;

// // // // //     return (
// // // // //       <Box className={s.root} sx={{ height: '100vh', p: 3, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
// // // // //         {/* 필터 바 */}
// // // // //         {this.renderFilterBar()}

// // // // //         {/* 에러 */}
// // // // //         {error && (
// // // // //           <Box sx={{ mb: 2 }}>
// // // // //             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
// // // // //             <Button
// // // // //               variant="contained"
// // // // //               onClick={this.loadList}
// // // // //               sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
// // // // //             >
// // // // //               다시 시도
// // // // //             </Button>
// // // // //           </Box>
// // // // //         )}

// // // // //         {/* 그리드 */}
// // // // //         <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
// // // // //           <Box sx={{ height: '100%', width: '100%' }}>
// // // // //             {loading ? (
// // // // //               <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px' }}>
// // // // //                 <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
// // // // //               </Box>
// // // // //             ) : (
// // // // //               <DataGrid
// // // // //                 rows={rows}
// // // // //                 columns={columns}
// // // // //                 getRowId={(r) => r.id}
// // // // //                 pagination
// // // // //                 paginationMode="client"
// // // // //                 pageSizeOptions={[10, 25, 50, 100]}
// // // // //                 initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
// // // // //                 disableRowSelectionOnClick
// // // // //                 density="compact"
// // // // //                 slots={{ toolbar: GridToolbar }}
// // // // //                 slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
// // // // //                 sx={{
// // // // //                   '& .super-app-theme--header': { backgroundColor: '#ff8f00', color: 'white', fontWeight: 'bold' },
// // // // //                   '& .MuiDataGrid-cell': { borderBottom: '1px solid #e0e0e0' },
// // // // //                   '& .MuiDataGrid-root': { border: 'none' },
// // // // //                   '& .MuiDataGrid-virtualScroller': { backgroundColor: '#fafafa' },
// // // // //                   '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e0e0e0' },
// // // // //                 }}
// // // // //               />
// // // // //             )}
// // // // //           </Box>
// // // // //         </Paper>
// // // // //       </Box>
// // // // //     );
// // // // //   }
// // // // // }


// // // // // src/pages/inspection/InspectionSystemData.js
// // // // import config from '../../config';
// // // // import React, { Component } from 'react';

// // // // import {
// // // //   Box,
// // // //   Paper,
// // // //   TextField,
// // // //   Button,
// // // //   Typography,
// // // //   CardHeader,
// // // //   IconButton,
// // // //   Divider,
// // // //   Collapse,
// // // //   CircularProgress,
// // // //   Alert,
// // // //   Menu,
// // // //   MenuItem,
// // // //   InputAdornment,
// // // // } from '@mui/material';
// // // // import { Autocomplete } from '@mui/material';
// // // // import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// // // // import {
// // // //   Search as SearchIcon,
// // // //   Clear as ClearIcon,
// // // //   FilterList as FilterIcon,
// // // //   ExpandMore as ExpandMoreIcon,
// // // //   ExpandLess as ExpandLessIcon,
// // // //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // // // } from '@mui/icons-material';

// // // // import InspectionItemModal from '../common/InspectionItemModal';
// // // // import s from './InspectionSystemData.module.scss';

// // // // /** ---------- helpers ---------- */
// // // // const iso = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD
// // // // const today0 = () => {
// // // //   const t = new Date();
// // // //   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// // // // };
// // // // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // // /** 버튼 기준 화면 좌표 → Menu anchorPosition */
// // // // const getAnchorPos = (el) => {
// // // //   if (!el) return null;
// // // //   const r = el.getBoundingClientRect();
// // // //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // // // };
// // // // /** 월요일 시작 주간 */
// // // // const startOfWeek = (d) => {
// // // //   const day = d.getDay();
// // // //   const diff = (day === 0 ? -6 : 1) - day;
// // // //   const s = new Date(d);
// // // //   s.setDate(d.getDate() + diff);
// // // //   return new Date(s.getFullYear(), s.getMonth(), s.getDate());
// // // // };
// // // // const endOfWeek = (d) => {
// // // //   const s = startOfWeek(d);
// // // //   return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
// // // // };
// // // // const getWeeksOfMonth = (year, month) => {
// // // //   const first = new Date(year, month - 1, 1);
// // // //   const last = lastOfMonth(first);
// // // //   let cur = startOfWeek(first);
// // // //   const out = [];
// // // //   let idx = 1;
// // // //   while (cur <= last) {
// // // //     const s = new Date(cur), e = endOfWeek(cur);
// // // //     const clipS = new Date(Math.max(s, first));
// // // //     const clipE = new Date(Math.min(e, last));
// // // //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// // // //     idx += 1;
// // // //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// // // //   }
// // // //   return out;
// // // // };

// // // // /** ▶ 기본값을 '전체' 상태로 변경 (start_date/end_date/equipment = "") */
// // // // const getDefaultFilters = () => ({
// // // //   start_date: '',   // 전체기간
// // // //   end_date: '',     // 전체기간
// // // //   factory: '아진산업-본사(경산)',
// // // //   process: '프레스',
// // // //   equipment: '',    // 전체 설비
// // // //   partNo: '',
// // // //   item: '',
// // // //   inspType: '',
// // // //   workType: '',
// // // //   shiftType: '',
// // // //   topN: 5,
// // // // });

// // // // /* ====== 키/값 정규화 유틸 ====== */
// // // // /* eslint-disable no-control-regex */
// // // // const INVISIBLE = /[\u00A0\u200B-\u200F\u202A-\u202E\u2060]/g; // NBSP & zero-width & bidi
// // // // const CTRL_IN_KEYS = /[\u0000-\u001F\u007F]/g;                 // control chars (키 전용)
// // // // const CTRL_IN_VALUES = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g; // 값에서만 제거(탭/개행/CR 허용)
// // // // /* eslint-enable no-control-regex */
// // // // const MULTI_SPACE = / {2,}/g;

// // // // /** 키: 제어문자/제로폭/여러 공백 제거 */
// // // // function normalizeKey(k) {
// // // //   if (k == null) return '';
// // // //   return String(k)
// // // //     .replace(INVISIBLE, '')
// // // //     .replace(CTRL_IN_KEYS, '')
// // // //     .trim()
// // // //     .replace(MULTI_SPACE, ' ');
// // // // }
// // // // /** 값: 눈에 보이지 않는 제어문자만 제거 (한글/영문/숫자/기호 보존) */
// // // // function sanitizeValue(v) {
// // // //   if (v == null) return v;
// // // //   if (typeof v === 'string') return v.replace(CTRL_IN_VALUES, '');
// // // //   return v;
// // // // }
// // // // /** 행 키 정규화 */
// // // // function normalizeRowKeys(row) {
// // // //   const out = {};
// // // //   Object.keys(row || {}).forEach((k) => {
// // // //     const nk = normalizeKey(k);
// // // //     if (out[nk] == null || out[nk] === '') out[nk] = sanitizeValue(row[k]);
// // // //   });
// // // //   return out;
// // // // }

// // // // /** 컬럼 정렬 우선순위 */
// // // // const PREFERRED_ORDER = [
// // // //   'work_date', '보고일',
// // // //   'plant', '공장', '플랜트',
// // // //   'process', '공정',
// // // //   'equipment', '설비',
// // // //   '책임자', '작업장', '자재번호', '자재명', '실적번호', '차종',
// // // //   '양품수량', '생산수량', '불량합계',
// // // //   '검사구분', '주야구분', '작업순번', '작업구분', '검사순번',
// // // //   '검사항목명', '검사내용', '생산',
// // // //   '사업장',
// // // //   'id'
// // // // ];

// // // // /** ✅ 모든 값이 채워져 있어야 하는 필드 */
// // // // const MUST_HAVE_ALL = [
// // // //   '검사구분', '주야구분', '작업순번', '작업구분', '검사순번',
// // // //   '검사항목명', '검사내용', '생산'
// // // // ];

// // // // export default class InspectionGrid extends Component {
// // // //   state = {
// // // //     // 필터
// // // //     filters: getDefaultFilters(),

// // // //     // 옵션
// // // //     factories: [],
// // // //     processes: [],
// // // //     equipments: [],
// // // //     parts: [],
// // // //     items: [],
// // // //     optionsLoading: false,

// // // //     // UI
// // // //     loading: false,
// // // //     error: '',
// // // //     filterExpanded: false,

// // // //     // 프리셋 상태/앵커
// // // //     selectedYear: new Date().getFullYear(),
// // // //     selectedMonth: new Date().getMonth() + 1,
// // // //     yearAnchorPos: null,
// // // //     monthAnchorPos: null,
// // // //     weekAnchorPos: null,

// // // //     years: [],

// // // //     // 모달
// // // //     itemCodeModalOpen: false,

// // // //     // 그리드
// // // //     rows: [],
// // // //     columns: [],
// // // //   };

// // // //   componentDidMount() {
// // // //     const base = getDefaultFilters();
// // // //     const saved = localStorage.getItem('inspectionFilters');
// // // //     if (saved) {
// // // //       try {
// // // //         const parsed = JSON.parse(saved);
// // // //         const merged = { ...base, ...parsed };
// // // //         // 설비는 저장값이 유효하지 않을 수 있으므로 비워서 '전체'
// // // //         merged.equipment = merged.equipment || '';
// // // //         // 날짜도 전체기간 유지
// // // //         merged.start_date = merged.start_date ?? '';
// // // //         merged.end_date = merged.end_date ?? '';
// // // //         this.setState({ filters: merged });
// // // //       } catch {
// // // //         this.setState({ filters: base });
// // // //       }
// // // //     } else {
// // // //       this.setState({ filters: base });
// // // //     }
// // // //     this.bootstrap();
// // // //   }

// // // //   /** 공통 POST (그리드 엔드포인트) */
// // // //   post = async (path, body) => {
// // // //     const headers = { 'Content-Type': 'application/json' };
// // // //     const url = `${(config.baseURLApi || '').replace(/\/$/, '')}/smartFactory/inspection_grid${path}`;
// // // //     const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body || {}) });
// // // //     if (!res.ok) {
// // // //       const t = await res.text().catch(() => '');
// // // //       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// // // //     }
// // // //     const json = await res.json();
// // // //     return json.data || [];
// // // //   };

// // // //   /** 초기 부트스트랩 */
// // // //   bootstrap = async () => {
// // // //     await this.loadYears();
// // // //     await this.loadOptions();
// // // //     this.loadList();
// // // //   };

// // // //   /** 연도 목록 (fallback) */
// // // //   loadYears = async () => {
// // // //     const y = new Date().getFullYear();
// // // //     const years = [y, y - 1, y - 2, y - 3, y - 4];
// // // //     this.setState({ years, selectedYear: y });
// // // //   };

// // // //   /** 프론트 → 백엔드 요청 매핑 (빈 문자열은 undefined로 넘겨 필터 해제) */
// // // //   mapFiltersToRequest = (f) => ({
// // // //     start_work_date: f.start_date || undefined,
// // // //     end_work_date: f.end_date || undefined,
// // // //     plant: f.factory || undefined,
// // // //     process: f.process || undefined,
// // // //     equipment: f.equipment || undefined,
// // // //     itemNumber: f.partNo || undefined,
// // // //     inspectionType: f.inspType || undefined,
// // // //     workType: f.workType || undefined,
// // // //     shiftType: f.shiftType || undefined,
// // // //   });

// // // //   /** 옵션 로드 */
// // // //   loadOptions = async () => {
// // // //     const { filters } = this.state;
// // // //     this.setState({ optionsLoading: true });
// // // //     try {
// // // //       const reqBase = this.mapFiltersToRequest(filters);

// // // //       const [factories, processes, equipments, parts, items] = await Promise.all([
// // // //         this.post('/options/plants', {
// // // //           start_work_date: reqBase.start_work_date,
// // // //           end_work_date: reqBase.end_work_date,
// // // //         }),
// // // //         this.post('/options/processes', {
// // // //           start_work_date: reqBase.start_work_date,
// // // //           end_work_date: reqBase.end_work_date,
// // // //           plant: reqBase.plant || undefined,
// // // //         }),
// // // //         this.post('/options/equipments', {
// // // //           start_work_date: reqBase.start_work_date,
// // // //           end_work_date: reqBase.end_work_date,
// // // //           plant: reqBase.plant || undefined,
// // // //           process: reqBase.process || undefined,
// // // //         }),
// // // //         this.post('/options/partNos', reqBase),
// // // //         this.post('/options/partNames', reqBase),
// // // //       ]);

// // // //       // 현재 필터 값이 실제 옵션에 없으면 자동으로 비움
// // // //       const fixed = { ...this.state.filters };
// // // //       if (fixed.factory && factories.length && !factories.includes(fixed.factory)) fixed.factory = '';
// // // //       if (fixed.process && processes.length && !processes.includes(fixed.process)) fixed.process = '';
// // // //       if (fixed.equipment && equipments.length && !equipments.includes(fixed.equipment)) fixed.equipment = '';

// // // //       this.setState({
// // // //         factories,
// // // //         processes,
// // // //         equipments,
// // // //         parts,
// // // //         items,
// // // //         optionsLoading: false,
// // // //         filters: fixed,
// // // //       });
// // // //     } catch (e) {
// // // //       console.error(e);
// // // //       this.setState({ optionsLoading: false });
// // // //     }
// // // //   };

// // // //   /** 동적 컬럼 생성 */
// // // //   buildColumns = (rows) => {
// // // //     if (!rows?.length) return [];
// // // //     const keySet = new Set();
// // // //     const scanCount = Math.min(rows.length, 200);
// // // //     for (let i = 0; i < scanCount; i += 1) {
// // // //       Object.keys(rows[i] || {}).forEach((k) => keySet.add(k));
// // // //     }
// // // //     const allKeys = Array.from(keySet);
// // // //     const sortKey = (k) => {
// // // //       const idx = PREFERRED_ORDER.indexOf(k);
// // // //       return idx === -1 ? 1000 + allKeys.indexOf(k) : idx;
// // // //     };
// // // //     const ordered = allKeys.sort((a, b) => sortKey(a) - sortKey(b));

// // // //     const dateLike = /(^|_)(date|work_date|reportdate|보고일)$/i;
// // // //     const cols = ordered
// // // //       .filter((k) => k !== '')
// // // //       .map((k) => {
// // // //         const width = Math.min(340, Math.max(110, (k.length || 6) * 16));
// // // //         const isDate = dateLike.test(k);
// // // //         return {
// // // //           field: k,
// // // //           headerName: k,
// // // //           headerClassName: 'super-app-theme--header',
// // // //           cellClassName: 'super-app-theme--cell',
// // // //           width,
// // // //           type: isDate ? 'date' : undefined,
// // // //           valueGetter: isDate
// // // //             ? (p) => {
// // // //                 const v = p.value ?? p.row?.[k];
// // // //                 if (!v) return null;
// // // //                 const d = new Date(v);
// // // //                 return Number.isNaN(d.getTime()) ? null : d;
// // // //               }
// // // //             : undefined,
// // // //         };
// // // //       });

// // // //     // id 컬럼 앞으로
// // // //     const idIdx = cols.findIndex((c) => c.field === 'id');
// // // //     if (idIdx > 0) {
// // // //       const idCol = cols.splice(idIdx, 1)[0];
// // // //       cols.unshift({ ...idCol, width: 100 });
// // // //     }
// // // //     return cols;
// // // //   };

// // // //   /** 리스트 로드 */
// // // //   loadList = async () => {
// // // //     const { filters } = this.state;
// // // //     try {
// // // //       localStorage.setItem('inspectionFilters', JSON.stringify(filters));
// // // //     } catch {}
// // // //     this.setState({ loading: true, error: '' });
// // // //     try {
// // // //       const rawRows = await this.post('/list', this.mapFiltersToRequest(filters));

// // // //       // 디버깅: 첫 행 비교
// // // //       if (rawRows?.length) {
// // // //         // eslint-disable-next-line no-console
// // // //         console.log('[INSPECTION_GRID] raw sample =', rawRows[0]);
// // // //       }

// // // //       const normalized = (rawRows || []).map((r, i) => {
// // // //         const nr = normalizeRowKeys(r);
// // // //         const idVal = nr.id ?? r?.id ?? i + 1;
// // // //         return { id: idVal, ...nr };
// // // //       });

// // // //       /** ✅ 모든 필드가 채워진 행만 필터링 */
// // // //       const filtered = normalized.filter((row) =>
// // // //         MUST_HAVE_ALL.every((k) => row[k] !== null && row[k] !== undefined && String(row[k]).trim() !== '')
// // // //       );

// // // //       // 디버깅: 정규화/필터링된 첫 행
// // // //       if (filtered?.length) {
// // // //         // eslint-disable-next-line no-console
// // // //         console.log('[INSPECTION_GRID] sample keys =', Object.keys(filtered[0]));
// // // //         // eslint-disable-next-line no-console
// // // //         console.log('[INSPECTION_GRID] filtered sample =', filtered[0]);
// // // //       }

// // // //       const columns = this.buildColumns(filtered);
// // // //       this.setState({ rows: filtered, columns, loading: false });
// // // //     } catch (e) {
// // // //       console.error(e);
// // // //       this.setState({ error: '데이터를 불러오지 못했습니다.', loading: false });
// // // //     }
// // // //   };

// // // //   /** 필터 변경 */
// // // //   handleFilterChange = async (field, value) => {
// // // //     this.setState(
// // // //       (prev) => {
// // // //         const f = { ...prev.filters, [field]: value };
// // // //         if (field === 'factory') {
// // // //           f.process = '';
// // // //           f.equipment = '';
// // // //           f.partNo = '';
// // // //           f.item = '';
// // // //         } else if (field === 'process') {
// // // //           f.equipment = '';
// // // //           f.partNo = '';
// // // //           f.item = '';
// // // //         } else if (field === 'equipment') {
// // // //           f.partNo = '';
// // // //           f.item = '';
// // // //         } else if (field === 'topN') {
// // // //           f.topN = Number(value) || 5;
// // // //         }
// // // //         return { filters: f };
// // // //       },
// // // //       async () => {
// // // //         await this.loadOptions();
// // // //         await this.loadList();
// // // //       }
// // // //     );
// // // //   };

// // // //   /** 날짜 프리셋/범위 */
// // // //   setDateRange = async (start, end) => {
// // // //     const start_date = start ? iso(start) : '';
// // // //     const end_date = end ? iso(end) : '';
// // // //     this.setState(
// // // //       (prev) => ({ filters: { ...prev.filters, start_date, end_date } }),
// // // //       async () => {
// // // //         try {
// // // //           localStorage.setItem('inspectionFilters', JSON.stringify(this.state.filters));
// // // //         } catch {}
// // // //         await this.loadOptions();
// // // //         this.loadList();
// // // //       }
// // // //     );
// // // //   };
// // // //   applyToday = () => {
// // // //     const t = today0();
// // // //     this.setDateRange(t, t);
// // // //   };
// // // //   selectYear = (y) => {
// // // //     const s = new Date(y, 0, 1);
// // // //     const e = new Date(y, 11, 31);
// // // //     this.setState({ selectedYear: y, yearAnchorPos: null });
// // // //     this.setDateRange(s, e);
// // // //   };
// // // //   selectMonth = (m) => {
// // // //     const y = this.state.selectedYear;
// // // //     const s = new Date(y, m - 1, 1);
// // // //     const e = lastOfMonth(s);
// // // //     this.setState({ monthAnchorPos: null, selectedMonth: m });
// // // //     this.setDateRange(s, e);
// // // //   };
// // // //   selectWeek = (w) => {
// // // //     this.setState({ weekAnchorPos: null });
// // // //     this.setDateRange(w.start, w.end);
// // // //   };

// // // //   /** ▶ 전체 초기화(전체기간/전체 옵션) */
// // // //   resetToAll = async () => {
// // // //     const filters = getDefaultFilters(); // 이미 전체기간/전체 설비
// // // //     this.setState({ filters, selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1 }, async () => {
// // // //       try { localStorage.removeItem('inspectionFilters'); } catch {}
// // // //       await this.loadOptions();
// // // //       this.loadList();
// // // //     });
// // // //   };

// // // //   /** 품번/품명 모달 */
// // // //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// // // //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// // // //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// // // //     this.setState(
// // // //       (prev) => ({
// // // //         filters: { ...prev.filters, partNo: 품목번호 || '', item: 품목명 || '' },
// // // //         itemCodeModalOpen: false,
// // // //       }),
// // // //       () => {
// // // //         this.loadOptions();
// // // //         this.loadList();
// // // //       }
// // // //     );
// // // //   };

// // // //   /** ---------- 필터 바 ---------- */
// // // //   renderFilterBar = () => {
// // // //     const { filters, factories, processes, equipments, itemCodeModalOpen } = this.state;

// // // //     const now = today0();
// // // //     const thisYear = now.getFullYear();
// // // //     const thisMonth = now.getMonth() + 1;
// // // //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// // // //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// // // //     return (
// // // //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// // // //         <CardHeader
// // // //           title={
// // // //             <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
// // // //               <FilterIcon /> 검색 조건
// // // //             </Typography>
// // // //           }
// // // //           action={
// // // //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
// // // //               {/* 연간 */}
// // // //               <Button
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 color="success"
// // // //                 endIcon={<ExpandMoreIcon />}
// // // //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// // // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // // //               >
// // // //                 연간
// // // //               </Button>
// // // //               <Menu
// // // //                 open={!!this.state.yearAnchorPos}
// // // //                 onClose={() => this.setState({ yearAnchorPos: null })}
// // // //                 anchorReference="anchorPosition"
// // // //                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// // // //               >
// // // //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
// // // //                 {this.state.years.map((y) => (
// // // //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
// // // //                 ))}
// // // //               </Menu>

// // // //               {/* 월간 */}
// // // //               <Button
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 color="success"
// // // //                 endIcon={<ExpandMoreIcon />}
// // // //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// // // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // // //               >
// // // //                 월간
// // // //               </Button>
// // // //               <Menu
// // // //                 open={!!this.state.monthAnchorPos}
// // // //                 onClose={() => this.setState({ monthAnchorPos: null })}
// // // //                 anchorReference="anchorPosition"
// // // //                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// // // //               >
// // // //                 <MenuItem
// // // //                   dense
// // // //                   onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}
// // // //                 >
// // // //                   이번달
// // // //                 </MenuItem>
// // // //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // // //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// // // //                     {this.state.selectedYear}년 {m}월
// // // //                   </MenuItem>
// // // //                 ))}
// // // //               </Menu>

// // // //               {/* 주간 */}
// // // //               <Button
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 color="success"
// // // //                 endIcon={<ExpandMoreIcon />}
// // // //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// // // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // // //               >
// // // //                 주간
// // // //               </Button>
// // // //               <Menu
// // // //                 open={!!this.state.weekAnchorPos}
// // // //                 onClose={() => this.setState({ weekAnchorPos: null })}
// // // //                 anchorReference="anchorPosition"
// // // //                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
// // // //               >
// // // //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// // // //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// // // //                 </MenuItem>
// // // //                 {weeks.map((w, i) => (
// // // //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// // // //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// // // //                   </MenuItem>
// // // //                 ))}
// // // //               </Menu>

// // // //               {/* 오늘 */}
// // // //               <Button
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 color="success"
// // // //                 onClick={this.applyToday}
// // // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // // //               >
// // // //                 오늘
// // // //               </Button>

// // // //               {/* 구분자 & 기간선택 직접 입력 */}
// // // //               <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>
// // // //               <Typography sx={{ color: 'white' }}>기간선택</Typography>
// // // //               <TextField
// // // //                 type="date"
// // // //                 value={filters.start_date}
// // // //                 onChange={(e) => this.handleFilterChange('start_date', e.target.value)}
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
// // // //                 InputLabelProps={{ shrink: true }}
// // // //               />
// // // //               <Typography sx={{ color: 'white' }}>~</Typography>
// // // //               <TextField
// // // //                 type="date"
// // // //                 value={filters.end_date}
// // // //                 onChange={(e) => this.handleFilterChange('end_date', e.target.value)}
// // // //                 size="small"
// // // //                 variant="outlined"
// // // //                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
// // // //                 InputLabelProps={{ shrink: true }}
// // // //               />

// // // //               {/* 확장/축소 */}
// // // //               <IconButton
// // // //                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
// // // //                 sx={{ color: 'white' }}
// // // //               >
// // // //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// // // //               </IconButton>
// // // //             </Box>
// // // //           }
// // // //           sx={{ backgroundColor: '#ff8f00', color: 'white', borderRadius: 1, mb: 2 }}
// // // //         />

// // // //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// // // //         <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))', gap: 2, mb: 1 }}>
// // // //           <Autocomplete
// // // //             size="small"
// // // //             options={this.state.factories}
// // // //             value={filters.factory || null}
// // // //             onChange={(_, v) => this.handleFilterChange('factory', v || '')}
// // // //             renderInput={(params) => <TextField {...params} label="공장" />}
// // // //             clearOnEscape
// // // //           />
// // // //           <Autocomplete
// // // //             size="small"
// // // //             options={this.state.processes}
// // // //             value={filters.process || null}
// // // //             onChange={(_, v) => this.handleFilterChange('process', v || '')}
// // // //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
// // // //             clearOnEscape
// // // //           />
// // // //           <Autocomplete
// // // //             size="small"
// // // //             options={this.state.equipments}
// // // //             value={filters.equipment || null}
// // // //             onChange={(_, v) => this.handleFilterChange('equipment', v || '')}
// // // //             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
// // // //             clearOnEscape
// // // //           />

// // // //           <TextField
// // // //             fullWidth
// // // //             label="품번"
// // // //             value={filters.partNo}
// // // //             onClick={this.openItemCodeModal}
// // // //             size="small"
// // // //             variant="outlined"
// // // //             InputProps={{
// // // //               readOnly: true,
// // // //               style: { cursor: 'pointer' },
// // // //               endAdornment: (
// // // //                 <InputAdornment position="end">
// // // //                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
// // // //                 </InputAdornment>
// // // //               ),
// // // //             }}
// // // //             sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
// // // //           />

// // // //           <TextField
// // // //             fullWidth
// // // //             label="품명(검사항목)"
// // // //             value={filters.item}
// // // //             onClick={this.openItemCodeModal}
// // // //             size="small"
// // // //             variant="outlined"
// // // //             InputProps={{
// // // //               readOnly: true,
// // // //               style: { cursor: 'pointer' },
// // // //               endAdornment: (
// // // //                 <InputAdornment position="end">
// // // //                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
// // // //                 </InputAdornment>
// // // //               ),
// // // //             }}
// // // //             sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
// // // //           />
// // // //         </Box>

// // // //         {/* 확장 필터 */}
// // // //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// // // //           <Divider sx={{ my: 2 }} />
// // // //           <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 16 }}>
// // // //             <TextField
// // // //               fullWidth
// // // //               label="검사구분"
// // // //               value={filters.inspType}
// // // //               onChange={(e) => this.handleFilterChange('inspType', e.target.value)}
// // // //               size="small"
// // // //               variant="outlined"
// // // //             />
// // // //             <TextField
// // // //               fullWidth
// // // //               label="작업구분"
// // // //               value={filters.workType}
// // // //               onChange={(e) => this.handleFilterChange('workType', e.target.value)}
// // // //               size="small"
// // // //               variant="outlined"
// // // //             />
// // // //             <TextField
// // // //               fullWidth
// // // //               label="주야구분"
// // // //               value={filters.shiftType}
// // // //               onChange={(e) => this.handleFilterChange('shiftType', e.target.value)}
// // // //               size="small"
// // // //               variant="outlined"
// // // //             />
// // // //             <TextField
// // // //               fullWidth
// // // //               label="Top N"
// // // //               type="number"
// // // //               value={filters.topN ?? 5}
// // // //               onChange={(e) => this.handleFilterChange('topN', e.target.value)}
// // // //               size="small"
// // // //               variant="outlined"
// // // //             />
// // // //           </Box>
// // // //         </Collapse>

// // // //         {/* 버튼 */}
// // // //         <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
// // // //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToAll} size="large" color="secondary">
// // // //             필터 초기화
// // // //           </Button>
// // // //           <Button
// // // //             variant="contained"
// // // //             startIcon={<SearchIcon />}
// // // //             size="large"
// // // //             sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
// // // //             onClick={() => {
// // // //               this.loadOptions();
// // // //               this.loadList();
// // // //             }}
// // // //           >
// // // //             검색
// // // //           </Button>
// // // //         </Box>

// // // //         {/* 품목 코드/명 선택 모달 */}
// // // //         <InspectionItemModal
// // // //           open={itemCodeModalOpen}
// // // //           onClose={this.closeItemCodeModal}
// // // //           onSelect={this.handleItemCodeSelect}
// // // //           selectedItemCode={filters.partNo}
// // // //           plant={filters.factory}
// // // //           worker={filters.process}
// // // //           line={filters.equipment}
// // // //           startDate={filters.start_date}
// // // //           endDate={filters.end_date}
// // // //         />
// // // //       </Paper>
// // // //     );
// // // //   };

// // // //   render() {
// // // //     const { error, loading, rows, columns } = this.state;

// // // //     return (
// // // //       <Box className={s.root} sx={{ height: '100vh', p: 3, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
// // // //         {/* 필터 바 */}
// // // //         {this.renderFilterBar()}

// // // //         {/* 에러 */}
// // // //         {error && (
// // // //           <Box sx={{ mb: 2 }}>
// // // //             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
// // // //             <Button
// // // //               variant="contained"
// // // //               onClick={this.loadList}
// // // //               sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
// // // //             >
// // // //               다시 시도
// // // //             </Button>
// // // //           </Box>
// // // //         )}

// // // //         {/* 그리드 */}
// // // //         <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
// // // //           <Box sx={{ height: '100%', width: '100%' }}>
// // // //             {loading ? (
// // // //               <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px' }}>
// // // //                 <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
// // // //               </Box>
// // // //             ) : (
// // // //               <DataGrid
// // // //                 rows={rows}
// // // //                 columns={columns}
// // // //                 getRowId={(r) => r.id}
// // // //                 pagination
// // // //                 paginationMode="client"
// // // //                 pageSizeOptions={[10, 25, 50, 100]}
// // // //                 initialState={{ pagination: { paginationModel: { page: 0, pageSize: 10 } } }}
// // // //                 disableRowSelectionOnClick
// // // //                 density="compact"
// // // //                 slots={{ toolbar: GridToolbar }}
// // // //                 slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
// // // //                 sx={{
// // // //                   '& .super-app-theme--header': { backgroundColor: '#ff8f00', color: 'white', fontWeight: 'bold' },
// // // //                   '& .MuiDataGrid-cell': { borderBottom: '1px solid #e0e0e0' },
// // // //                   '& .MuiDataGrid-root': { border: 'none' },
// // // //                   '& .MuiDataGrid-virtualScroller': { backgroundColor: '#fafafa' },
// // // //                   '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e0e0e0' },
// // // //                 }}
// // // //               />
// // // //             )}
// // // //           </Box>
// // // //         </Paper>
// // // //       </Box>
// // // //     );
// // // //   }
// // // // }


// // // // src/pages/inspection/InspectionSystemData.js
// // // import config from '../../config';
// // // import React, { Component } from 'react';

// // // import {
// // //   Box,
// // //   Paper,
// // //   TextField,
// // //   Button,
// // //   Typography,
// // //   CardHeader,
// // //   IconButton,
// // //   Divider,
// // //   Collapse,
// // //   CircularProgress,
// // //   Alert,
// // //   Menu,
// // //   MenuItem,
// // //   InputAdornment,
// // // } from '@mui/material';
// // // import { Autocomplete } from '@mui/material';
// // // import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// // // import {
// // //   Search as SearchIcon,
// // //   Clear as ClearIcon,
// // //   FilterList as FilterIcon,
// // //   ExpandMore as ExpandMoreIcon,
// // //   ExpandLess as ExpandLessIcon,
// // //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // // } from '@mui/icons-material';

// // // import InspectionItemModal from '../common/InspectionItemModal';
// // // import s from './InspectionSystemData.module.scss';

// // // /** ---------- helpers ---------- */
// // // const iso = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD
// // // const today0 = () => {
// // //   const t = new Date();
// // //   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// // // };
// // // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // // /** 버튼 기준 화면 좌표 → Menu anchorPosition */
// // // const getAnchorPos = (el) => {
// // //   if (!el) return null;
// // //   const r = el.getBoundingClientRect();
// // //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // // };
// // // /** 월요일 시작 주간 */
// // // const startOfWeek = (d) => {
// // //   const day = d.getDay();
// // //   const diff = (day === 0 ? -6 : 1) - day;
// // //   const s = new Date(d);
// // //   s.setDate(d.getDate() + diff);
// // //   return new Date(s.getFullYear(), s.getMonth(), s.getDate());
// // // };
// // // const endOfWeek = (d) => {
// // //   const s = startOfWeek(d);
// // //   return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
// // // };
// // // const getWeeksOfMonth = (year, month) => {
// // //   const first = new Date(year, month - 1, 1);
// // //   const last = lastOfMonth(first);
// // //   let cur = startOfWeek(first);
// // //   const out = [];
// // //   let idx = 1;
// // //   while (cur <= last) {
// // //     const s = new Date(cur), e = endOfWeek(cur);
// // //     const clipS = new Date(Math.max(s, first));
// // //     const clipE = new Date(Math.min(e, last));
// // //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// // //     idx += 1;
// // //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// // //   }
// // //   return out;
// // // };

// // // /** ▶ 기본값을 '전체' 상태로 변경 (start_date/end_date/equipment = "") */
// // // const getDefaultFilters = () => ({
// // //   start_date: '',   // 전체기간
// // //   end_date: '',     // 전체기간
// // //   factory: '아진산업-본사(경산)',
// // //   process: '프레스',
// // //   equipment: '',    // 전체 설비
// // //   partNo: '',
// // //   item: '',
// // //   inspType: '',
// // //   workType: '',
// // //   shiftType: '',
// // //   topN: 5,
// // // });

// // // /* ====== 키/값 정규화 유틸 ====== */
// // // /* eslint-disable no-control-regex */
// // // const INVISIBLE = /[\u00A0\u200B-\u200F\u202A-\u202E\u2060]/g; // NBSP & zero-width & bidi
// // // const CTRL_IN_KEYS = /[\u0000-\u001F\u007F]/g;                 // control chars (키 전용)
// // // const CTRL_IN_VALUES = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g; // 값에서만 제거(탭/개행/CR 허용)
// // // /* eslint-enable no-control-regex */
// // // const MULTI_SPACE = / {2,}/g;

// // // /** 키: 제어문자/제로폭/여러 공백 제거 */
// // // function normalizeKey(k) {
// // //   if (k == null) return '';
// // //   return String(k)
// // //     .replace(INVISIBLE, '')
// // //     .replace(CTRL_IN_KEYS, '')
// // //     .trim()
// // //     .replace(MULTI_SPACE, ' ');
// // // }
// // // /** 값: 눈에 보이지 않는 제어문자만 제거 (한글/영문/숫자/기호 보존) */
// // // function sanitizeValue(v) {
// // //   if (v == null) return v;
// // //   if (typeof v === 'string') return v.replace(CTRL_IN_VALUES, '');
// // //   return v;
// // // }
// // // /** 행 키 정규화 */
// // // function normalizeRowKeys(row) {
// // //   const out = {};
// // //   Object.keys(row || {}).forEach((k) => {
// // //     const nk = normalizeKey(k);
// // //     if (out[nk] == null || out[nk] === '') out[nk] = sanitizeValue(row[k]);
// // //   });
// // //   return out;
// // // }

// // // /** 컬럼 정렬 우선순위 */
// // // const PREFERRED_ORDER = [
// // //   'work_date', '보고일',
// // //   'plant', '공장', '플랜트',
// // //   'process', '공정',
// // //   'equipment', '설비',
// // //   '책임자', '작업장', '자재번호', '자재명', '실적번호', '차종',
// // //   '양품수량', '생산수량', '불량합계',
// // //   '검사구분', '주야구분', '작업순번', '작업구분', '검사순번',
// // //   '검사항목명', '검사내용', '생산',
// // //   '사업장',
// // //   'id'
// // // ];

// // // /** ✅ 모든 값이 채워져 있어야 하는 필드 */
// // // const MUST_HAVE_ALL = [
// // //   '검사구분', '주야구분', '작업순번', '작업구분', '검사순번',
// // //   '검사항목명', '검사내용', '생산'
// // // ];

// // // /** ✅ 기본으로 숨길 컬럼(컬럼 패널 토글 OFF) */
// // // const DEFAULT_COLUMN_VIS = {
// // //   id: false,
// // //   '보고일': false,
// // //   '공장': false,
// // //   '플랜트': false,
// // //   '공정': false,
// // //   '설비': false,
// // //   '책임자': false,
// // //   '작업장': false,
// // //   '실적번호': false,
// // //   '사업장': false,
// // //   // 나머지는 표시(명시하지 않으면 보임)
// // // };

// // // export default class InspectionGrid extends Component {
// // //   state = {
// // //     // 필터
// // //     filters: getDefaultFilters(),

// // //     // 옵션
// // //     factories: [],
// // //     processes: [],
// // //     equipments: [],
// // //     parts: [],
// // //     items: [],
// // //     optionsLoading: false,

// // //     // UI
// // //     loading: false,
// // //     error: '',
// // //     filterExpanded: false,

// // //     // 프리셋 상태/앵커
// // //     selectedYear: new Date().getFullYear(),
// // //     selectedMonth: new Date().getMonth() + 1,
// // //     yearAnchorPos: null,
// // //     monthAnchorPos: null,
// // //     weekAnchorPos: null,

// // //     years: [],

// // //     // 모달
// // //     itemCodeModalOpen: false,

// // //     // 그리드
// // //     rows: [],
// // //     columns: [],
// // //   };

// // //   componentDidMount() {
// // //     const base = getDefaultFilters();
// // //     const saved = localStorage.getItem('inspectionFilters');
// // //     if (saved) {
// // //       try {
// // //         const parsed = JSON.parse(saved);
// // //         const merged = { ...base, ...parsed };
// // //         // 설비는 저장값이 유효하지 않을 수 있으므로 비워서 '전체'
// // //         merged.equipment = merged.equipment || '';
// // //         // 날짜도 전체기간 유지
// // //         merged.start_date = merged.start_date ?? '';
// // //         merged.end_date = merged.end_date ?? '';
// // //         this.setState({ filters: merged });
// // //       } catch {
// // //         this.setState({ filters: base });
// // //       }
// // //     } else {
// // //       this.setState({ filters: base });
// // //     }
// // //     this.bootstrap();
// // //   }

// // //   /** 공통 POST (그리드 엔드포인트) */
// // //   post = async (path, body) => {
// // //     const headers = { 'Content-Type': 'application/json' };
// // //     const url = `${(config.baseURLApi || '').replace(/\/$/, '')}/smartFactory/inspection_grid${path}`;
// // //     const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body || {}) });
// // //     if (!res.ok) {
// // //       const t = await res.text().catch(() => '');
// // //       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// // //     }
// // //     const json = await res.json();
// // //     return json.data || [];
// // //   };

// // //   /** 초기 부트스트랩 */
// // //   bootstrap = async () => {
// // //     await this.loadYears();
// // //     await this.loadOptions();
// // //     this.loadList();
// // //   };

// // //   /** 연도 목록 (fallback) */
// // //   loadYears = async () => {
// // //     const y = new Date().getFullYear();
// // //     const years = [y, y - 1, y - 2, y - 3, y - 4];
// // //     this.setState({ years, selectedYear: y });
// // //   };

// // //   /** 프론트 → 백엔드 요청 매핑 (빈 문자열은 undefined로 넘겨 필터 해제) */
// // //   mapFiltersToRequest = (f) => ({
// // //     start_work_date: f.start_date || undefined,
// // //     end_work_date: f.end_date || undefined,
// // //     plant: f.factory || undefined,
// // //     process: f.process || undefined,
// // //     equipment: f.equipment || undefined,
// // //     itemNumber: f.partNo || undefined,
// // //     inspectionType: f.inspType || undefined,
// // //     workType: f.workType || undefined,
// // //     shiftType: f.shiftType || undefined,
// // //   });

// // //   /** 옵션 로드 */
// // //   loadOptions = async () => {
// // //     const { filters } = this.state;
// // //     this.setState({ optionsLoading: true });
// // //     try {
// // //       const reqBase = this.mapFiltersToRequest(filters);

// // //       const [factories, processes, equipments, parts, items] = await Promise.all([
// // //         this.post('/options/plants', {
// // //           start_work_date: reqBase.start_work_date,
// // //           end_work_date: reqBase.end_work_date,
// // //         }),
// // //         this.post('/options/processes', {
// // //           start_work_date: reqBase.start_work_date,
// // //           end_work_date: reqBase.end_work_date,
// // //           plant: reqBase.plant || undefined,
// // //         }),
// // //         this.post('/options/equipments', {
// // //           start_work_date: reqBase.start_work_date,
// // //           end_work_date: reqBase.end_work_date,
// // //           plant: reqBase.plant || undefined,
// // //           process: reqBase.process || undefined,
// // //         }),
// // //         this.post('/options/partNos', reqBase),
// // //         this.post('/options/partNames', reqBase),
// // //       ]);

// // //       // 현재 필터 값이 실제 옵션에 없으면 자동으로 비움
// // //       const fixed = { ...this.state.filters };
// // //       if (fixed.factory && factories.length && !factories.includes(fixed.factory)) fixed.factory = '';
// // //       if (fixed.process && processes.length && !processes.includes(fixed.process)) fixed.process = '';
// // //       if (fixed.equipment && equipments.length && !equipments.includes(fixed.equipment)) fixed.equipment = '';

// // //       this.setState({
// // //         factories,
// // //         processes,
// // //         equipments,
// // //         parts,
// // //         items,
// // //         optionsLoading: false,
// // //         filters: fixed,
// // //       });
// // //     } catch (e) {
// // //       console.error(e);
// // //       this.setState({ optionsLoading: false });
// // //     }
// // //   };

// // //   /** 동적 컬럼 생성 */
// // //   buildColumns = (rows) => {
// // //     if (!rows?.length) return [];
// // //     const keySet = new Set();
// // //     const scanCount = Math.min(rows.length, 200);
// // //     for (let i = 0; i < scanCount; i += 1) {
// // //       Object.keys(rows[i] || {}).forEach((k) => keySet.add(k));
// // //     }
// // //     const allKeys = Array.from(keySet);
// // //     const sortKey = (k) => {
// // //       const idx = PREFERRED_ORDER.indexOf(k);
// // //       return idx === -1 ? 1000 + allKeys.indexOf(k) : idx;
// // //     };
// // //     const ordered = allKeys.sort((a, b) => sortKey(a) - sortKey(b));

// // //     const dateLike = /(^|_)(date|work_date|reportdate|보고일)$/i;
// // //     const cols = ordered
// // //       .filter((k) => k !== '')
// // //       .map((k) => {
// // //         const width = Math.min(340, Math.max(110, (k.length || 6) * 16));
// // //         const isDate = dateLike.test(k);
// // //         return {
// // //           field: k,
// // //           headerName: k,
// // //           headerClassName: 'super-app-theme--header',
// // //           cellClassName: 'super-app-theme--cell',
// // //           width,
// // //           type: isDate ? 'date' : undefined,
// // //           valueGetter: isDate
// // //             ? (p) => {
// // //                 const v = p.value ?? p.row?.[k];
// // //                 if (!v) return null;
// // //                 const d = new Date(v);
// // //                 return Number.isNaN(d.getTime()) ? null : d;
// // //               }
// // //             : undefined,
// // //         };
// // //       });

// // //     // id 컬럼 앞으로
// // //     const idIdx = cols.findIndex((c) => c.field === 'id');
// // //     if (idIdx > 0) {
// // //       const idCol = cols.splice(idIdx, 1)[0];
// // //       cols.unshift({ ...idCol, width: 100 });
// // //     }
// // //     return cols;
// // //   };

// // //   /** 리스트 로드 */
// // //   loadList = async () => {
// // //     const { filters } = this.state;
// // //     try {
// // //       localStorage.setItem('inspectionFilters', JSON.stringify(filters));
// // //     } catch {}
// // //     this.setState({ loading: true, error: '' });
// // //     try {
// // //       const rawRows = await this.post('/list', this.mapFiltersToRequest(filters));

// // //       // 디버깅: 첫 행 비교
// // //       if (rawRows?.length) {
// // //         // eslint-disable-next-line no-console
// // //         console.log('[INSPECTION_GRID] raw sample =', rawRows[0]);
// // //       }

// // //       const normalized = (rawRows || []).map((r, i) => {
// // //         const nr = normalizeRowKeys(r);
// // //         const idVal = nr.id ?? r?.id ?? i + 1;
// // //         return { id: idVal, ...nr };
// // //       });

// // //       /** ✅ 모든 필드가 채워진 행만 필터링 */
// // //       const filtered = normalized.filter((row) =>
// // //         MUST_HAVE_ALL.every((k) => row[k] !== null && row[k] !== undefined && String(row[k]).trim() !== '')
// // //       );

// // //       // 디버깅: 정규화/필터링된 첫 행
// // //       if (filtered?.length) {
// // //         // eslint-disable-next-line no-console
// // //         console.log('[INSPECTION_GRID] sample keys =', Object.keys(filtered[0]));
// // //         // eslint-disable-next-line no-console
// // //         console.log('[INSPECTION_GRID] filtered sample =', filtered[0]);
// // //       }

// // //       const columns = this.buildColumns(filtered);
// // //       this.setState({ rows: filtered, columns, loading: false });
// // //     } catch (e) {
// // //       console.error(e);
// // //       this.setState({ error: '데이터를 불러오지 못했습니다.', loading: false });
// // //     }
// // //   };

// // //   /** 필터 변경 */
// // //   handleFilterChange = async (field, value) => {
// // //     this.setState(
// // //       (prev) => {
// // //         const f = { ...prev.filters, [field]: value };
// // //         if (field === 'factory') {
// // //           f.process = '';
// // //           f.equipment = '';
// // //           f.partNo = '';
// // //           f.item = '';
// // //         } else if (field === 'process') {
// // //           f.equipment = '';
// // //           f.partNo = '';
// // //           f.item = '';
// // //         } else if (field === 'equipment') {
// // //           f.partNo = '';
// // //           f.item = '';
// // //         } else if (field === 'topN') {
// // //           f.topN = Number(value) || 5;
// // //         }
// // //         return { filters: f };
// // //       },
// // //       async () => {
// // //         await this.loadOptions();
// // //         await this.loadList();
// // //       }
// // //     );
// // //   };

// // //   /** 날짜 프리셋/범위 */
// // //   setDateRange = async (start, end) => {
// // //     const start_date = start ? iso(start) : '';
// // //     const end_date = end ? iso(end) : '';
// // //     this.setState(
// // //       (prev) => ({ filters: { ...prev.filters, start_date, end_date } }),
// // //       async () => {
// // //         try {
// // //           localStorage.setItem('inspectionFilters', JSON.stringify(this.state.filters));
// // //         } catch {}
// // //         await this.loadOptions();
// // //         this.loadList();
// // //       }
// // //     );
// // //   };
// // //   applyToday = () => {
// // //     const t = today0();
// // //     this.setDateRange(t, t);
// // //   };
// // //   selectYear = (y) => {
// // //     const s = new Date(y, 0, 1);
// // //     const e = new Date(y, 11, 31);
// // //     this.setState({ selectedYear: y, yearAnchorPos: null });
// // //     this.setDateRange(s, e);
// // //   };
// // //   selectMonth = (m) => {
// // //     const y = this.state.selectedYear;
// // //     const s = new Date(y, m - 1, 1);
// // //     const e = lastOfMonth(s);
// // //     this.setState({ monthAnchorPos: null, selectedMonth: m });
// // //     this.setDateRange(s, e);
// // //   };
// // //   selectWeek = (w) => {
// // //     this.setState({ weekAnchorPos: null });
// // //     this.setDateRange(w.start, w.end);
// // //   };

// // //   /** ▶ 전체 초기화(전체기간/전체 옵션) */
// // //   resetToAll = async () => {
// // //     const filters = getDefaultFilters(); // 이미 전체기간/전체 설비
// // //     this.setState({ filters, selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1 }, async () => {
// // //       try { localStorage.removeItem('inspectionFilters'); } catch {}
// // //       await this.loadOptions();
// // //       this.loadList();
// // //     });
// // //   };

// // //   /** 품번/품명 모달 */
// // //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// // //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// // //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// // //     this.setState(
// // //       (prev) => ({
// // //         filters: { ...prev.filters, partNo: 품목번호 || '', item: 품목명 || '' },
// // //         itemCodeModalOpen: false,
// // //       }),
// // //       () => {
// // //         this.loadOptions();
// // //         this.loadList();
// // //       }
// // //     );
// // //   };

// // //   /** ---------- 필터 바 ---------- */
// // //   renderFilterBar = () => {
// // //     const { filters, factories, processes, equipments, itemCodeModalOpen } = this.state;

// // //     const now = today0();
// // //     const thisYear = now.getFullYear();
// // //     const thisMonth = now.getMonth() + 1;
// // //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// // //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// // //     return (
// // //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// // //         <CardHeader
// // //           title={
// // //             <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
// // //               <FilterIcon /> 검색 조건
// // //             </Typography>
// // //           }
// // //           action={
// // //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
// // //               {/* 연간 */}
// // //               <Button
// // //                 size="small"
// // //                 variant="outlined"
// // //                 color="success"
// // //                 endIcon={<ExpandMoreIcon />}
// // //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // //               >
// // //                 연간
// // //               </Button>
// // //               <Menu
// // //                 open={!!this.state.yearAnchorPos}
// // //                 onClose={() => this.setState({ yearAnchorPos: null })}
// // //                 anchorReference="anchorPosition"
// // //                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// // //               >
// // //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
// // //                 {this.state.years.map((y) => (
// // //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
// // //                 ))}
// // //               </Menu>

// // //               {/* 월간 */}
// // //               <Button
// // //                 size="small"
// // //                 variant="outlined"
// // //                 color="success"
// // //                 endIcon={<ExpandMoreIcon />}
// // //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // //               >
// // //                 월간
// // //               </Button>
// // //               <Menu
// // //                 open={!!this.state.monthAnchorPos}
// // //                 onClose={() => this.setState({ monthAnchorPos: null })}
// // //                 anchorReference="anchorPosition"
// // //                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// // //               >
// // //                 <MenuItem
// // //                   dense
// // //                   onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}
// // //                 >
// // //                   이번달
// // //                 </MenuItem>
// // //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// // //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// // //                     {this.state.selectedYear}년 {m}월
// // //                   </MenuItem>
// // //                 ))}
// // //               </Menu>

// // //               {/* 주간 */}
// // //               <Button
// // //                 size="small"
// // //                 variant="outlined"
// // //                 color="success"
// // //                 endIcon={<ExpandMoreIcon />}
// // //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // //               >
// // //                 주간
// // //               </Button>
// // //               <Menu
// // //                 open={!!this.state.weekAnchorPos}
// // //                 onClose={() => this.setState({ weekAnchorPos: null })}
// // //                 anchorReference="anchorPosition"
// // //                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
// // //               >
// // //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// // //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// // //                 </MenuItem>
// // //                 {weeks.map((w, i) => (
// // //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// // //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// // //                   </MenuItem>
// // //                 ))}
// // //               </Menu>

// // //               {/* 오늘 */}
// // //               <Button
// // //                 size="small"
// // //                 variant="outlined"
// // //                 color="success"
// // //                 onClick={this.applyToday}
// // //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// // //               >
// // //                 오늘
// // //               </Button>

// // //               {/* 구분자 & 기간선택 직접 입력 */}
// // //               <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>
// // //               <Typography sx={{ color: 'white' }}>기간선택</Typography>
// // //               <TextField
// // //                 type="date"
// // //                 value={filters.start_date}
// // //                 onChange={(e) => this.handleFilterChange('start_date', e.target.value)}
// // //                 size="small"
// // //                 variant="outlined"
// // //                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
// // //                 InputLabelProps={{ shrink: true }}
// // //               />
// // //               <Typography sx={{ color: 'white' }}>~</Typography>
// // //               <TextField
// // //                 type="date"
// // //                 value={filters.end_date}
// // //                 onChange={(e) => this.handleFilterChange('end_date', e.target.value)}
// // //                 size="small"
// // //                 variant="outlined"
// // //                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
// // //                 InputLabelProps={{ shrink: true }}
// // //               />

// // //               {/* 확장/축소 */}
// // //               <IconButton
// // //                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
// // //                 sx={{ color: 'white' }}
// // //               >
// // //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// // //               </IconButton>
// // //             </Box>
// // //           }
// // //           sx={{ backgroundColor: '#ff8f00', color: 'white', borderRadius: 1, mb: 2 }}
// // //         />

// // //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// // //         <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))', gap: 2, mb: 1 }}>
// // //           <Autocomplete
// // //             size="small"
// // //             options={this.state.factories}
// // //             value={filters.factory || null}
// // //             onChange={(_, v) => this.handleFilterChange('factory', v || '')}
// // //             renderInput={(params) => <TextField {...params} label="공장" />}
// // //             clearOnEscape
// // //           />
// // //           <Autocomplete
// // //             size="small"
// // //             options={this.state.processes}
// // //             value={filters.process || null}
// // //             onChange={(_, v) => this.handleFilterChange('process', v || '')}
// // //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
// // //             clearOnEscape
// // //           />
// // //           <Autocomplete
// // //             size="small"
// // //             options={this.state.equipments}
// // //             value={filters.equipment || null}
// // //             onChange={(_, v) => this.handleFilterChange('equipment', v || '')}
// // //             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
// // //             clearOnEscape
// // //           />

// // //           <TextField
// // //             fullWidth
// // //             label="품번"
// // //             value={filters.partNo}
// // //             onClick={this.openItemCodeModal}
// // //             size="small"
// // //             variant="outlined"
// // //             InputProps={{
// // //               readOnly: true,
// // //               style: { cursor: 'pointer' },
// // //               endAdornment: (
// // //                 <InputAdornment position="end">
// // //                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
// // //                 </InputAdornment>
// // //               ),
// // //             }}
// // //             sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
// // //           />

// // //           <TextField
// // //             fullWidth
// // //             label="품명(검사항목)"
// // //             value={filters.item}
// // //             onClick={this.openItemCodeModal}
// // //             size="small"
// // //             variant="outlined"
// // //             InputProps={{
// // //               readOnly: true,
// // //               style: { cursor: 'pointer' },
// // //               endAdornment: (
// // //                 <InputAdornment position="end">
// // //                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
// // //                 </InputAdornment>
// // //               ),
// // //             }}
// // //             sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
// // //           />
// // //         </Box>

// // //         {/* 확장 필터 */}
// // //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// // //           <Divider sx={{ my: 2 }} />
// // //           <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 16 }}>
// // //             <TextField
// // //               fullWidth
// // //               label="검사구분"
// // //               value={filters.inspType}
// // //               onChange={(e) => this.handleFilterChange('inspType', e.target.value)}
// // //               size="small"
// // //               variant="outlined"
// // //             />
// // //             <TextField
// // //               fullWidth
// // //               label="작업구분"
// // //               value={filters.workType}
// // //               onChange={(e) => this.handleFilterChange('workType', e.target.value)}
// // //               size="small"
// // //               variant="outlined"
// // //             />
// // //             <TextField
// // //               fullWidth
// // //               label="주야구분"
// // //               value={filters.shiftType}
// // //               onChange={(e) => this.handleFilterChange('shiftType', e.target.value)}
// // //               size="small"
// // //               variant="outlined"
// // //             />
// // //             <TextField
// // //               fullWidth
// // //               label="Top N"
// // //               type="number"
// // //               value={filters.topN ?? 5}
// // //               onChange={(e) => this.handleFilterChange('topN', e.target.value)}
// // //               size="small"
// // //               variant="outlined"
// // //             />
// // //           </Box>
// // //         </Collapse>

// // //         {/* 버튼 */}
// // //         <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
// // //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToAll} size="large" color="secondary">
// // //             필터 초기화
// // //           </Button>
// // //           <Button
// // //             variant="contained"
// // //             startIcon={<SearchIcon />}
// // //             size="large"
// // //             sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
// // //             onClick={() => {
// // //               this.loadOptions();
// // //               this.loadList();
// // //             }}
// // //           >
// // //             검색
// // //           </Button>
// // //         </Box>

// // //         {/* 품목 코드/명 선택 모달 */}
// // //         <InspectionItemModal
// // //           open={itemCodeModalOpen}
// // //           onClose={this.closeItemCodeModal}
// // //           onSelect={this.handleItemCodeSelect}
// // //           selectedItemCode={filters.partNo}
// // //           plant={filters.factory}
// // //           worker={filters.process}
// // //           line={filters.equipment}
// // //           startDate={filters.start_date}
// // //           endDate={filters.end_date}
// // //         />
// // //       </Paper>
// // //     );
// // //   };

// // //   render() {
// // //     const { error, loading, rows, columns } = this.state;

// // //     return (
// // //       <Box className={s.root} sx={{ height: '100vh', p: 3, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
// // //         {/* 필터 바 */}
// // //         {this.renderFilterBar()}

// // //         {/* 에러 */}
// // //         {error && (
// // //           <Box sx={{ mb: 2 }}>
// // //             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
// // //             <Button
// // //               variant="contained"
// // //               onClick={this.loadList}
// // //               sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
// // //             >
// // //               다시 시도
// // //             </Button>
// // //           </Box>
// // //         )}

// // //         {/* 그리드 */}
// // //         <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
// // //           <Box sx={{ height: '100%', width: '100%' }}>
// // //             {loading ? (
// // //               <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px' }}>
// // //                 <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
// // //               </Box>
// // //             ) : (
// // //               <DataGrid
// // //                 rows={rows}
// // //                 columns={columns}
// // //                 getRowId={(r) => r.id}
// // //                 pagination
// // //                 paginationMode="client"
// // //                 pageSizeOptions={[10, 25, 50, 100]}
// // //                 initialState={{
// // //                   pagination: { paginationModel: { page: 0, pageSize: 10 } },
// // //                   columns: { columnVisibilityModel: DEFAULT_COLUMN_VIS }, // 🔴 기본 컬럼 숨김 적용
// // //                 }}
// // //                 disableRowSelectionOnClick
// // //                 density="compact"
// // //                 slots={{ toolbar: GridToolbar }}
// // //                 slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
// // //                 sx={{
// // //                   '& .super-app-theme--header': { backgroundColor: '#ff8f00', color: 'white', fontWeight: 'bold' },
// // //                   '& .MuiDataGrid-cell': { borderBottom: '1px solid #e0e0e0' },
// // //                   '& .MuiDataGrid-root': { border: 'none' },
// // //                   '& .MuiDataGrid-virtualScroller': { backgroundColor: '#fafafa' },
// // //                   '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e0e0e0' },
// // //                 }}
// // //               />
// // //             )}
// // //           </Box>
// // //         </Paper>
// // //       </Box>
// // //     );
// // //   }
// // // }


// // // src/pages/inspection/InspectionSystemData.js
// // import config from '../../config';
// // import React, { Component } from 'react';

// // import {
// //   Box,
// //   Paper,
// //   TextField,
// //   Button,
// //   Typography,
// //   CardHeader,
// //   IconButton,
// //   Divider,
// //   Collapse,
// //   CircularProgress,
// //   Alert,
// //   Menu,
// //   MenuItem,
// //   InputAdornment,
// // } from '@mui/material';
// // import { Autocomplete } from '@mui/material';
// // import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// // import {
// //   Search as SearchIcon,
// //   Clear as ClearIcon,
// //   FilterList as FilterIcon,
// //   ExpandMore as ExpandMoreIcon,
// //   ExpandLess as ExpandLessIcon,
// //   KeyboardArrowDown as KeyboardArrowDownIcon,
// // } from '@mui/icons-material';

// // import InspectionItemModal from '../common/InspectionItemModal';
// // import s from './InspectionSystemData.module.scss';

// // /** ---------- helpers ---------- */
// // const iso = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD
// // const today0 = () => {
// //   const t = new Date();
// //   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// // };
// // const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// // /** 버튼 기준 화면 좌표 → Menu anchorPosition */
// // const getAnchorPos = (el) => {
// //   if (!el) return null;
// //   const r = el.getBoundingClientRect();
// //   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// // };
// // /** 월요일 시작 주간 */
// // const startOfWeek = (d) => {
// //   const day = d.getDay();
// //   const diff = (day === 0 ? -6 : 1) - day;
// //   const s = new Date(d);
// //   s.setDate(d.getDate() + diff);
// //   return new Date(s.getFullYear(), s.getMonth(), s.getDate());
// // };
// // const endOfWeek = (d) => {
// //   const s = startOfWeek(d);
// //   return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
// // };
// // const getWeeksOfMonth = (year, month) => {
// //   const first = new Date(year, month - 1, 1);
// //   const last = lastOfMonth(first);
// //   let cur = startOfWeek(first);
// //   const out = [];
// //   let idx = 1;
// //   while (cur <= last) {
// //     const s = new Date(cur), e = endOfWeek(cur);
// //     const clipS = new Date(Math.max(s, first));
// //     const clipE = new Date(Math.min(e, last));
// //     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
// //     idx += 1;
// //     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
// //   }
// //   return out;
// // };

// // /** ▶ 기본값을 '전체' 상태로 변경 (start_date/end_date/equipment = "") */
// // const getDefaultFilters = () => ({
// //   start_date: '',   // 전체기간
// //   end_date: '',     // 전체기간
// //   factory: '아진산업-본사(경산)',
// //   process: '프레스',
// //   equipment: '',    // 전체 설비
// //   partNo: '',
// //   item: '',
// //   inspType: '',
// //   workType: '',
// //   shiftType: '',
// //   topN: 5,
// // });

// // /* ====== 키/값 정규화 유틸 ====== */
// // /* eslint-disable no-control-regex */
// // const INVISIBLE = /[\u00A0\u200B-\u200F\u202A-\u202E\u2060]/g; // NBSP & zero-width & bidi
// // const CTRL_IN_KEYS = /[\u0000-\u001F\u007F]/g;                 // control chars (키 전용)
// // const CTRL_IN_VALUES = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g; // 값에서만 제거(탭/개행/CR 허용)
// // /* eslint-enable no-control-regex */
// // const MULTI_SPACE = / {2,}/g;

// // /** 키: 제어문자/제로폭/여러 공백 제거 */
// // function normalizeKey(k) {
// //   if (k == null) return '';
// //   return String(k)
// //     .replace(INVISIBLE, '')
// //     .replace(CTRL_IN_KEYS, '')
// //     .trim()
// //     .replace(MULTI_SPACE, ' ');
// // }
// // /** 값: 눈에 보이지 않는 제어문자만 제거 (한글/영문/숫자/기호 보존) */
// // function sanitizeValue(v) {
// //   if (v == null) return v;
// //   if (typeof v === 'string') return v.replace(CTRL_IN_VALUES, '');
// //   return v;
// // }
// // /** 행 키 정규화 */
// // function normalizeRowKeys(row) {
// //   const out = {};
// //   Object.keys(row || {}).forEach((k) => {
// //     const nk = normalizeKey(k);
// //     if (out[nk] == null || out[nk] === '') out[nk] = sanitizeValue(row[k]);
// //   });
// //   return out;
// // }

// // /** 컬럼 정렬 우선순위 */
// // const PREFERRED_ORDER = [
// //   'work_date', '보고일',
// //   'plant', '공장', '플랜트',
// //   'process', '공정',
// //   'equipment', '설비',
// //   '책임자', '작업장', '자재번호', '자재명', '실적번호', '차종',
// //   '양품수량', '생산수량', '불량합계',
// //   '검사구분', '주야구분', '작업순번', '작업구분', '검사순번',
// //   '검사항목명', '검사내용', '생산',
// //   '사업장',
// //   'id'
// // ];

// // /** ✅ 모든 값이 채워져 있어야 하는 필드 */
// // const MUST_HAVE_ALL = [
// //   '검사구분', '주야구분', '작업순번', '작업구분', '검사순번',
// //   '검사항목명', '검사내용', '생산'
// // ];

// // /** ✅ 기본으로 숨길 컬럼(컬럼 패널 토글 OFF) */
// // const DEFAULT_COLUMN_VIS = {
// //   id: false,
// //   '보고일': false,
// //   '공장': false,
// //   '플랜트': false,
// //   '공정': false,
// //   '설비': false,
// //   '책임자': false,
// //   '작업장': false,
// //   '실적번호': false,
// //   '사업장': false,
// //   // 나머지는 표시(명시하지 않으면 보임)
// // };

// // export default class InspectionGrid extends Component {
// //   state = {
// //     // 필터
// //     filters: getDefaultFilters(),

// //     // 옵션
// //     factories: [],
// //     processes: [],
// //     equipments: [],
// //     parts: [],
// //     items: [],
// //     optionsLoading: false,

// //     // UI
// //     loading: false,
// //     error: '',
// //     filterExpanded: false,

// //     // 프리셋 상태/앵커
// //     selectedYear: new Date().getFullYear(),
// //     selectedMonth: new Date().getMonth() + 1,
// //     yearAnchorPos: null,
// //     monthAnchorPos: null,
// //     weekAnchorPos: null,

// //     years: [],

// //     // 모달
// //     itemCodeModalOpen: false,

// //     // 그리드
// //     rows: [],
// //     columns: [],
// //   };

// //   componentDidMount() {
// //     const base = getDefaultFilters();
// //     const saved = localStorage.getItem('inspectionFilters');
// //     if (saved) {
// //       try {
// //         const parsed = JSON.parse(saved);
// //         const merged = { ...base, ...parsed };
// //         // 설비는 저장값이 유효하지 않을 수 있으므로 비워서 '전체'
// //         merged.equipment = merged.equipment || '';
// //         // 날짜도 전체기간 유지
// //         merged.start_date = merged.start_date ?? '';
// //         merged.end_date = merged.end_date ?? '';
// //         this.setState({ filters: merged });
// //       } catch {
// //         this.setState({ filters: base });
// //       }
// //     } else {
// //       this.setState({ filters: base });
// //     }
// //     this.bootstrap();
// //   }

// //   /** 공통 POST (그리드 엔드포인트) */
// //   post = async (path, body) => {
// //     const headers = { 'Content-Type': 'application/json' };
// //     const url = `${(config.baseURLApi || '').replace(/\/$/, '')}/smartFactory/inspection_grid${path}`;
// //     const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body || {}) });
// //     if (!res.ok) {
// //       const t = await res.text().catch(() => '');
// //       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
// //     }
// //     const json = await res.json();
// //     return json.data || [];
// //   };

// //   /** 초기 부트스트랩 */
// //   bootstrap = async () => {
// //     await this.loadYears();
// //     await this.loadOptions();
// //     this.loadList();
// //   };

// //   /** 연도 목록 (fallback) */
// //   loadYears = async () => {
// //     const y = new Date().getFullYear();
// //     const years = [y, y - 1, y - 2, y - 3, y - 4];
// //     this.setState({ years, selectedYear: y });
// //   };

// //   /** 프론트 → 백엔드 요청 매핑 (빈 문자열은 undefined로 넘겨 필터 해제) */
// //   mapFiltersToRequest = (f) => ({
// //     start_work_date: f.start_date || undefined,
// //     end_work_date: f.end_date || undefined,
// //     plant: f.factory || undefined,
// //     process: f.process || undefined,
// //     equipment: f.equipment || undefined,
// //     itemNumber: f.partNo || undefined,
// //     inspectionType: f.inspType || undefined,
// //     workType: f.workType || undefined,
// //     shiftType: f.shiftType || undefined,
// //   });

// //   /** 옵션 로드 */
// //   loadOptions = async () => {
// //     const { filters } = this.state;
// //     this.setState({ optionsLoading: true });
// //     try {
// //       const reqBase = this.mapFiltersToRequest(filters);

// //       const [factories, processes, equipments, parts, items] = await Promise.all([
// //         this.post('/options/plants', {
// //           start_work_date: reqBase.start_work_date,
// //           end_work_date: reqBase.end_work_date,
// //         }),
// //         this.post('/options/processes', {
// //           start_work_date: reqBase.start_work_date,
// //           end_work_date: reqBase.end_work_date,
// //           plant: reqBase.plant || undefined,
// //         }),
// //         this.post('/options/equipments', {
// //           start_work_date: reqBase.start_work_date,
// //           end_work_date: reqBase.end_work_date,
// //           plant: reqBase.plant || undefined,
// //           process: reqBase.process || undefined,
// //         }),
// //         this.post('/options/partNos', reqBase),
// //         this.post('/options/partNames', reqBase),
// //       ]);

// //       // 현재 필터 값이 실제 옵션에 없으면 자동으로 비움
// //       const fixed = { ...this.state.filters };
// //       if (fixed.factory && factories.length && !factories.includes(fixed.factory)) fixed.factory = '';
// //       if (fixed.process && processes.length && !processes.includes(fixed.process)) fixed.process = '';
// //       if (fixed.equipment && equipments.length && !equipments.includes(fixed.equipment)) fixed.equipment = '';

// //       this.setState({
// //         factories,
// //         processes,
// //         equipments,
// //         parts,
// //         items,
// //         optionsLoading: false,
// //         filters: fixed,
// //       });
// //     } catch (e) {
// //       console.error(e);
// //       this.setState({ optionsLoading: false });
// //     }
// //   };

// //   /** 동적 컬럼 생성 */
// //   buildColumns = (rows) => {
// //     if (!rows?.length) return [];
// //     const keySet = new Set();
// //     const scanCount = Math.min(rows.length, 200);
// //     for (let i = 0; i < scanCount; i += 1) {
// //       Object.keys(rows[i] || {}).forEach((k) => keySet.add(k));
// //     }
// //     const allKeys = Array.from(keySet);
// //     const sortKey = (k) => {
// //       const idx = PREFERRED_ORDER.indexOf(k);
// //       return idx === -1 ? 1000 + allKeys.indexOf(k) : idx;
// //     };
// //     const ordered = allKeys.sort((a, b) => sortKey(a) - sortKey(b));

// //     const dateLike = /(^|_)(date|work_date|reportdate|보고일)$/i;
// //     const cols = ordered
// //       .filter((k) => k !== '')
// //       .map((k) => {
// //         const width = Math.min(340, Math.max(110, (k.length || 6) * 16));
// //         const isDate = dateLike.test(k);
// //         return {
// //           field: k,
// //           headerName: k,
// //           headerClassName: 'super-app-theme--header',
// //           cellClassName: 'super-app-theme--cell',
// //           width,
// //           type: isDate ? 'date' : undefined,
// //           valueGetter: isDate
// //             ? (p) => {
// //                 const v = p.value ?? p.row?.[k];
// //                 if (!v) return null;
// //                 const d = new Date(v);
// //                 return Number.isNaN(d.getTime()) ? null : d;
// //               }
// //             : undefined,
// //         };
// //       });

// //     // id 컬럼 앞으로
// //     const idIdx = cols.findIndex((c) => c.field === 'id');
// //     if (idIdx > 0) {
// //       const idCol = cols.splice(idIdx, 1)[0];
// //       cols.unshift({ ...idCol, width: 100 });
// //     }
// //     return cols;
// //   };

// //   /** 리스트 로드 */
// //   loadList = async () => {
// //     const { filters } = this.state;
// //     try {
// //       localStorage.setItem('inspectionFilters', JSON.stringify(filters));
// //     } catch {}
// //     this.setState({ loading: true, error: '' });
// //     try {
// //       const rawRows = await this.post('/list', this.mapFiltersToRequest(filters));

// //       // 디버깅: 첫 행 비교
// //       if (rawRows?.length) {
// //         // eslint-disable-next-line no-console
// //         console.log('[INSPECTION_GRID] raw sample =', rawRows[0]);
// //       }

// //       const normalized = (rawRows || []).map((r, i) => {
// //         const nr = normalizeRowKeys(r);
// //         const idVal = nr.id ?? r?.id ?? i + 1;
// //         return { id: idVal, ...nr };
// //       });

// //       /** ✅ 모든 필드가 채워진 행만 필터링 */
// //       const filtered = normalized.filter((row) =>
// //         MUST_HAVE_ALL.every((k) => row[k] !== null && row[k] !== undefined && String(row[k]).trim() !== '')
// //       );

// //       // 디버깅: 정규화/필터링된 첫 행
// //       if (filtered?.length) {
// //         // eslint-disable-next-line no-console
// //         console.log('[INSPECTION_GRID] sample keys =', Object.keys(filtered[0]));
// //         // eslint-disable-next-line no-console
// //         console.log('[INSPECTION_GRID] filtered sample =', filtered[0]);
// //       }

// //       const columns = this.buildColumns(filtered);
// //       this.setState({ rows: filtered, columns, loading: false });
// //     } catch (e) {
// //       console.error(e);
// //       this.setState({ error: '데이터를 불러오지 못했습니다.', loading: false });
// //     }
// //   };

// //   /** 필터 변경 */
// //   handleFilterChange = async (field, value) => {
// //     this.setState(
// //       (prev) => {
// //         const f = { ...prev.filters, [field]: value };
// //         if (field === 'factory') {
// //           f.process = '';
// //           f.equipment = '';
// //           f.partNo = '';
// //           f.item = '';
// //         } else if (field === 'process') {
// //           f.equipment = '';
// //           f.partNo = '';
// //           f.item = '';
// //         } else if (field === 'equipment') {
// //           f.partNo = '';
// //           f.item = '';
// //         } else if (field === 'topN') {
// //           f.topN = Number(value) || 5;
// //         }
// //         return { filters: f };
// //       },
// //       async () => {
// //         await this.loadOptions();
// //         await this.loadList();
// //       }
// //     );
// //   };

// //   /** 날짜 프리셋/범위 */
// //   setDateRange = async (start, end) => {
// //     const start_date = start ? iso(start) : '';
// //     const end_date = end ? iso(end) : '';
// //     this.setState(
// //       (prev) => ({ filters: { ...prev.filters, start_date, end_date } }),
// //       async () => {
// //         try {
// //           localStorage.setItem('inspectionFilters', JSON.stringify(this.state.filters));
// //         } catch {}
// //         await this.loadOptions();
// //         this.loadList();
// //       }
// //     );
// //   };
// //   applyToday = () => {
// //     const t = today0();
// //     this.setDateRange(t, t);
// //   };
// //   selectYear = (y) => {
// //     const s = new Date(y, 0, 1);
// //     const e = new Date(y, 11, 31);
// //     this.setState({ selectedYear: y, yearAnchorPos: null });
// //     this.setDateRange(s, e);
// //   };
// //   selectMonth = (m) => {
// //     const y = this.state.selectedYear;
// //     const s = new Date(y, m - 1, 1);
// //     const e = lastOfMonth(s);
// //     this.setState({ monthAnchorPos: null, selectedMonth: m });
// //     this.setDateRange(s, e);
// //   };
// //   selectWeek = (w) => {
// //     this.setState({ weekAnchorPos: null });
// //     this.setDateRange(w.start, w.end);
// //   };

// //   /** ▶ 전체 초기화(전체기간/전체 옵션) */
// //   resetToAll = async () => {
// //     const filters = getDefaultFilters(); // 이미 전체기간/전체 설비
// //     this.setState({ filters, selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1 }, async () => {
// //       try { localStorage.removeItem('inspectionFilters'); } catch {}
// //       await this.loadOptions();
// //       this.loadList();
// //     });
// //   };

// //   /** 품번/품명 모달 */
// //   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
// //   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
// //   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
// //     this.setState(
// //       (prev) => ({
// //         filters: { ...prev.filters, partNo: 품목번호 || '', item: 품목명 || '' },
// //         itemCodeModalOpen: false,
// //       }),
// //       () => {
// //         this.loadOptions();
// //         this.loadList();
// //       }
// //     );
// //   };

// //   /** ---------- 필터 바 ---------- */
// //   renderFilterBar = () => {
// //     const { filters, factories, processes, equipments, itemCodeModalOpen } = this.state;

// //     const now = today0();
// //     const thisYear = now.getFullYear();
// //     const thisMonth = now.getMonth() + 1;
// //     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
// //     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

// //     return (
// //       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
// //         <CardHeader
// //           title={
// //             <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
// //               <FilterIcon /> 검색 조건
// //             </Typography>
// //           }
// //           action={
// //             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
// //               {/* 연간 */}
// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 endIcon={<ExpandMoreIcon />}
// //                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
// //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// //               >
// //                 연간
// //               </Button>
// //               <Menu
// //                 open={!!this.state.yearAnchorPos}
// //                 onClose={() => this.setState({ yearAnchorPos: null })}
// //                 anchorReference="anchorPosition"
// //                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
// //               >
// //                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
// //                 {this.state.years.map((y) => (
// //                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
// //                 ))}
// //               </Menu>

// //               {/* 월간 */}
// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 endIcon={<ExpandMoreIcon />}
// //                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
// //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// //               >
// //                 월간
// //               </Button>
// //               <Menu
// //                 open={!!this.state.monthAnchorPos}
// //                 onClose={() => this.setState({ monthAnchorPos: null })}
// //                 anchorReference="anchorPosition"
// //                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
// //               >
// //                 <MenuItem
// //                   dense
// //                   onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}
// //                 >
// //                   이번달
// //                 </MenuItem>
// //                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
// //                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
// //                     {this.state.selectedYear}년 {m}월
// //                   </MenuItem>
// //                 ))}
// //               </Menu>

// //               {/* 주간 */}
// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 endIcon={<ExpandMoreIcon />}
// //                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
// //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// //               >
// //                 주간
// //               </Button>
// //               <Menu
// //                 open={!!this.state.weekAnchorPos}
// //                 onClose={() => this.setState({ weekAnchorPos: null })}
// //                 anchorReference="anchorPosition"
// //                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
// //               >
// //                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
// //                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
// //                 </MenuItem>
// //                 {weeks.map((w, i) => (
// //                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
// //                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
// //                   </MenuItem>
// //                 ))}
// //               </Menu>

// //               {/* 오늘 */}
// //               <Button
// //                 size="small"
// //                 variant="outlined"
// //                 color="success"
// //                 onClick={this.applyToday}
// //                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
// //               >
// //                 오늘
// //               </Button>

// //               {/* 구분자 & 기간선택 직접 입력 */}
// //               <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>
// //               <Typography sx={{ color: 'white' }}>기간선택</Typography>
// //               <TextField
// //                 type="date"
// //                 value={filters.start_date}
// //                 onChange={(e) => this.handleFilterChange('start_date', e.target.value)}
// //                 size="small"
// //                 variant="outlined"
// //                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
// //                 InputLabelProps={{ shrink: true }}
// //               />
// //               <Typography sx={{ color: 'white' }}>~</Typography>
// //               <TextField
// //                 type="date"
// //                 value={filters.end_date}
// //                 onChange={(e) => this.handleFilterChange('end_date', e.target.value)}
// //                 size="small"
// //                 variant="outlined"
// //                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
// //                 InputLabelProps={{ shrink: true }}
// //               />

// //               {/* 확장/축소 */}
// //               <IconButton
// //                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
// //                 sx={{ color: 'white' }}
// //               >
// //                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
// //               </IconButton>
// //             </Box>
// //           }
// //           sx={{ backgroundColor: '#ff8f00', color: 'white', borderRadius: 1, mb: 2 }}
// //         />

// //         {/* === 1행: 공장/공정/설비/품번/품명 === */}
// //         <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))', gap: 2, mb: 1 }}>
// //           <Autocomplete
// //             size="small"
// //             options={this.state.factories}
// //             value={filters.factory || null}
// //             onChange={(_, v) => this.handleFilterChange('factory', v || '')}
// //             renderInput={(params) => <TextField {...params} label="공장" />}
// //             clearOnEscape
// //           />
// //           <Autocomplete
// //             size="small"
// //             options={this.state.processes}
// //             value={filters.process || null}
// //             onChange={(_, v) => this.handleFilterChange('process', v || '')}
// //             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
// //             clearOnEscape
// //           />
// //           <Autocomplete
// //             size="small"
// //             options={this.state.equipments}
// //             value={filters.equipment || null}
// //             onChange={(_, v) => this.handleFilterChange('equipment', v || '')}
// //             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
// //             clearOnEscape
// //           />

// //           <TextField
// //             fullWidth
// //             label="품번"
// //             value={filters.partNo}
// //             onClick={this.openItemCodeModal}
// //             size="small"
// //             variant="outlined"
// //             InputProps={{
// //               readOnly: true,
// //               style: { cursor: 'pointer' },
// //               endAdornment: (
// //                 <InputAdornment position="end">
// //                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
// //                 </InputAdornment>
// //               ),
// //             }}
// //             sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
// //           />

// //           <TextField
// //             fullWidth
// //             label="품명(검사항목)"
// //             value={filters.item}
// //             onClick={this.openItemCodeModal}
// //             size="small"
// //             variant="outlined"
// //             InputProps={{
// //               readOnly: true,
// //               style: { cursor: 'pointer' },
// //               endAdornment: (
// //                 <InputAdornment position="end">
// //                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
// //                 </InputAdornment>
// //               ),
// //             }}
// //             sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
// //           />
// //         </Box>

// //         {/* 확장 필터 */}
// //         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
// //           <Divider sx={{ my: 2 }} />
// //           <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 16 }}>
// //             <TextField
// //               fullWidth
// //               label="검사구분"
// //               value={filters.inspType}
// //               onChange={(e) => this.handleFilterChange('inspType', e.target.value)}
// //               size="small"
// //               variant="outlined"
// //             />
// //             <TextField
// //               fullWidth
// //               label="작업구분"
// //               value={filters.workType}
// //               onChange={(e) => this.handleFilterChange('workType', e.target.value)}
// //               size="small"
// //               variant="outlined"
// //             />
// //             <TextField
// //               fullWidth
// //               label="주야구분"
// //               value={filters.shiftType}
// //               onChange={(e) => this.handleFilterChange('shiftType', e.target.value)}
// //               size="small"
// //               variant="outlined"
// //             />
// //             <TextField
// //               fullWidth
// //               label="Top N"
// //               type="number"
// //               value={filters.topN ?? 5}
// //               onChange={(e) => this.handleFilterChange('topN', e.target.value)}
// //               size="small"
// //               variant="outlined"
// //             />
// //           </Box>
// //         </Collapse>

// //         {/* 버튼 */}
// //         <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
// //           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToAll} size="large" color="secondary">
// //             필터 초기화
// //           </Button>
// //           <Button
// //             variant="contained"
// //             startIcon={<SearchIcon />}
// //             size="large"
// //             sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
// //             onClick={() => {
// //               this.loadOptions();
// //               this.loadList();
// //             }}
// //           >
// //             검색
// //           </Button>
// //         </Box>

// //         {/* 품목 코드/명 선택 모달 */}
// //         <InspectionItemModal
// //           open={itemCodeModalOpen}
// //           onClose={this.closeItemCodeModal}
// //           onSelect={this.handleItemCodeSelect}
// //           selectedItemCode={filters.partNo}
// //           plant={filters.factory}
// //           worker={filters.process}
// //           line={filters.equipment}
// //           startDate={filters.start_date}
// //           endDate={filters.end_date}
// //         />
// //       </Paper>
// //     );
// //   };

// //   render() {
// //     const { error, loading, rows, columns } = this.state;

// //     return (
// //       <Box className={s.root} sx={{ height: '100vh', p: 3, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
// //         {/* 필터 바 */}
// //         {this.renderFilterBar()}

// //         {/* 에러 */}
// //         {error && (
// //           <Box sx={{ mb: 2 }}>
// //             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
// //             <Button
// //               variant="contained"
// //               onClick={this.loadList}
// //               sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
// //             >
// //               다시 시도
// //             </Button>
// //           </Box>
// //         )}

// //         {/* 그리드 */}
// //         <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
// //           <Box sx={{ height: '100%', width: '100%' }}>
// //             {loading ? (
// //               <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px' }}>
// //                 <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
// //               </Box>
// //             ) : (
// //               <DataGrid
// //                 rows={rows}
// //                 columns={columns}
// //                 getRowId={(r) => r.id}
// //                 pagination
// //                 paginationMode="client"
// //                 pageSizeOptions={[10, 25, 50, 100]}
// //                 initialState={{
// //                   pagination: { paginationModel: { page: 0, pageSize: 10 } },
// //                   sorting: { sortModel: [{ field: 'id', sort: 'asc' }] }, // 기본 정렬: id 오름차순
// //                   columns: { columnVisibilityModel: DEFAULT_COLUMN_VIS },  // 기본 컬럼 숨김
// //                 }}
// //                 disableRowSelectionOnClick
// //                 density="compact"
// //                 slots={{ toolbar: GridToolbar }}
// //                 slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
// //                 sx={{
// //                   '& .super-app-theme--header': { backgroundColor: '#ff8f00', color: 'white', fontWeight: 'bold' },
// //                   '& .MuiDataGrid-cell': { borderBottom: '1px solid #e0e0e0' },
// //                   '& .MuiDataGrid-root': { border: 'none' },
// //                   '& .MuiDataGrid-virtualScroller': { backgroundColor: '#fafafa' },
// //                   '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e0e0e0' },
// //                 }}
// //               />
// //             )}
// //           </Box>
// //         </Paper>
// //       </Box>
// //     );
// //   }
// // }


// // src/pages/inspection/InspectionSystemData.js
// import config from '../../config';
// import React, { Component } from 'react';

// import {
//   Box,
//   Paper,
//   TextField,
//   Button,
//   Typography,
//   CardHeader,
//   IconButton,
//   Divider,
//   Collapse,
//   CircularProgress,
//   Alert,
//   Menu,
//   MenuItem,
//   InputAdornment,
// } from '@mui/material';
// import { Autocomplete } from '@mui/material';
// import { DataGrid, GridToolbar } from '@mui/x-data-grid';

// import {
//   Search as SearchIcon,
//   Clear as ClearIcon,
//   FilterList as FilterIcon,
//   ExpandMore as ExpandMoreIcon,
//   ExpandLess as ExpandLessIcon,
//   KeyboardArrowDown as KeyboardArrowDownIcon,
// } from '@mui/icons-material';

// import InspectionItemModal from '../common/InspectionItemModal';
// import s from './InspectionSystemData.module.scss';

// /** ---------- helpers ---------- */
// const iso = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD
// const today0 = () => {
//   const t = new Date();
//   return new Date(t.getFullYear(), t.getMonth(), t.getDate());
// };
// const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

// /** 버튼 기준 화면 좌표 → Menu anchorPosition */
// const getAnchorPos = (el) => {
//   if (!el) return null;
//   const r = el.getBoundingClientRect();
//   return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
// };
// /** 월요일 시작 주간 */
// const startOfWeek = (d) => {
//   const day = d.getDay();
//   const diff = (day === 0 ? -6 : 1) - day;
//   const s = new Date(d);
//   s.setDate(d.getDate() + diff);
//   return new Date(s.getFullYear(), s.getMonth(), s.getDate());
// };
// const endOfWeek = (d) => {
//   const s = startOfWeek(d);
//   return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
// };
// const getWeeksOfMonth = (year, month) => {
//   const first = new Date(year, month - 1, 1);
//   const last = lastOfMonth(first);
//   let cur = startOfWeek(first);
//   const out = [];
//   let idx = 1;
//   while (cur <= last) {
//     const s = new Date(cur), e = endOfWeek(cur);
//     const clipS = new Date(Math.max(s, first));
//     const clipE = new Date(Math.min(e, last));
//     out.push({ label: `${idx}주차`, start: clipS, end: clipE });
//     idx += 1;
//     cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
//   }
//   return out;
// };

// /** ▶ 기본값을 '전체' 상태로 변경 (start_date/end_date/equipment = "") */
// const getDefaultFilters = () => ({
//   start_date: '',   // 전체기간
//   end_date: '',     // 전체기간
//   factory: '아진산업-본사(경산)',
//   process: '프레스',
//   equipment: '',    // 전체 설비
//   partNo: '',
//   item: '',
//   inspType: '',
//   workType: '',
//   shiftType: '',
//   topN: 5,
// });

// /* ====== 키/값 정규화 유틸 ====== */
// /* eslint-disable no-control-regex */
// const INVISIBLE = /[\u00A0\u200B-\u200F\u202A-\u202E\u2060]/g;
// const CTRL_IN_KEYS = /[\u0000-\u001F\u007F]/g;
// const CTRL_IN_VALUES = /[\u00A0\u200B-\u200F\u202A-\u202E\u2060\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
// /* eslint-enable no-control-regex */
// const MULTI_SPACE = / {2,}/g;

// function normalizeKey(k) {
//   if (k == null) return '';
//   return String(k).replace(INVISIBLE, '').replace(CTRL_IN_KEYS, '').trim().replace(MULTI_SPACE, ' ');
// }
// function sanitizeValue(v) {
//   if (v == null) return v;
//   if (typeof v === 'string') return v.replace(CTRL_IN_VALUES, '');
//   return v;
// }
// function normalizeRowKeys(row) {
//   const out = {};
//   Object.keys(row || {}).forEach((k) => {
//     const nk = normalizeKey(k);
//     if (out[nk] == null || out[nk] === '') out[nk] = sanitizeValue(row[k]);
//   });
//   return out;
// }

// /** 컬럼 정렬 우선순위 */
// const PREFERRED_ORDER = [
//   'work_date', '보고일',
//   'plant', '공장', '플랜트',
//   'process', '공정',
//   'equipment', '설비',
//   '책임자', '작업장', '자재번호', '자재명', '실적번호', '차종',
//   '양품수량', '생산수량', '불량합계',
//   '검사구분', '주야구분', '작업순번', '작업구분', '검사순번',
//   '검사항목명', '검사내용', '생산',
//   '사업장',
//   'id'
// ];

// /** ✅ 모든 값이 채워져 있어야 하는 필드 */
// const MUST_HAVE_ALL = [
//   '검사구분', '주야구분', '작업순번', '작업구분', '검사순번',
//   '검사항목명', '검사내용', '생산'
// ];

// /** ✅ 기본으로 숨길 컬럼(컬럼 패널 토글 OFF) */
// const DEFAULT_COLUMN_VIS = {
//   id: false,
//   '보고일': false,
//   '공장': false,
//   '플랜트': false,
//   '공정': false,
//   '설비': false,
//   '책임자': false,
//   '작업장': false,
//   '실적번호': false,
//   '사업장': false,
// };

// /** ---------- 텍스트 폭 측정(캔버스) ---------- */
// const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
// const ctx = canvas ? canvas.getContext('2d') : null;
// const GRID_FONT = '14px Roboto, Arial, Helvetica, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
// const measure = (text) => {
//   if (!ctx) return String(text ?? '').length * 10;
//   ctx.font = GRID_FONT;
//   return ctx.measureText(String(text ?? '')).width;
// };
// function calcColumnWidth(field, headerName, rows, maxRows = 5000) {
//   const headerW = measure(headerName || field);
//   let maxW = headerW;
//   const limit = Math.min(rows.length, maxRows);
//   for (let i = 0; i < limit; i += 1) {
//     const v = rows[i]?.[field];
//     const s =
//       v == null
//         ? ''
//         : v instanceof Date
//           ? v.toLocaleDateString()
//           : typeof v === 'object'
//             ? JSON.stringify(v)
//             : String(v);
//     const w = measure(s);
//     if (w > maxW) maxW = w;
//   }
//   const PADDING = 40; // 좌우 여백/정렬 아이콘 고려
//   const MIN = 110;
//   const MAX = 1200;
//   return Math.min(MAX, Math.max(MIN, Math.ceil(maxW + PADDING)));
// }

// export default class InspectionGrid extends Component {
//   state = {
//     // 필터
//     filters: getDefaultFilters(),

//     // 옵션
//     factories: [],
//     processes: [],
//     equipments: [],
//     parts: [],
//     items: [],
//     optionsLoading: false,

//     // UI
//     loading: false,
//     error: '',
//     filterExpanded: false,

//     // 프리셋 상태/앵커
//     selectedYear: new Date().getFullYear(),
//     selectedMonth: new Date().getMonth() + 1,
//     yearAnchorPos: null,
//     monthAnchorPos: null,
//     weekAnchorPos: null,

//     years: [],

//     // 모달
//     itemCodeModalOpen: false,

//     // 그리드
//     rows: [],
//     columns: [],
//   };

//   componentDidMount() {
//     const base = getDefaultFilters();
//     const saved = localStorage.getItem('inspectionFilters');
//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);
//         const merged = { ...base, ...parsed };
//         merged.equipment = merged.equipment || '';
//         merged.start_date = merged.start_date ?? '';
//         merged.end_date = merged.end_date ?? '';
//         this.setState({ filters: merged });
//       } catch {
//         this.setState({ filters: base });
//       }
//     } else {
//       this.setState({ filters: base });
//     }
//     this.bootstrap();
//   }

//   /** 공통 POST (그리드 엔드포인트) */
//   post = async (path, body) => {
//     const headers = { 'Content-Type': 'application/json' };
//     const url = `${(config.baseURLApi || '').replace(/\/$/, '')}/smartFactory/inspection_grid${path}`;
//     const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body || {}) });
//     if (!res.ok) {
//       const t = await res.text().catch(() => '');
//       throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
//     }
//     const json = await res.json();
//     return json.data || [];
//   };

//   /** 초기 부트스트랩 */
//   bootstrap = async () => {
//     await this.loadYears();
//     await this.loadOptions();
//     this.loadList();
//   };

//   /** 연도 목록 (fallback) */
//   loadYears = async () => {
//     const y = new Date().getFullYear();
//     const years = [y, y - 1, y - 2, y - 3, y - 4];
//     this.setState({ years, selectedYear: y });
//   };

//   /** 프론트 → 백엔드 요청 매핑 (빈 문자열은 undefined로 넘겨 필터 해제) */
//   mapFiltersToRequest = (f) => ({
//     start_work_date: f.start_date || undefined,
//     end_work_date: f.end_date || undefined,
//     plant: f.factory || undefined,
//     process: f.process || undefined,
//     equipment: f.equipment || undefined,
//     itemNumber: f.partNo || undefined,
//     inspectionType: f.inspType || undefined,
//     workType: f.workType || undefined,
//     shiftType: f.shiftType || undefined,
//   });

//   /** 옵션 로드 */
//   loadOptions = async () => {
//     const { filters } = this.state;
//     this.setState({ optionsLoading: true });
//     try {
//       const reqBase = this.mapFiltersToRequest(filters);

//       const [factories, processes, equipments, parts, items] = await Promise.all([
//         this.post('/options/plants', {
//           start_work_date: reqBase.start_work_date,
//           end_work_date: reqBase.end_work_date,
//         }),
//         this.post('/options/processes', {
//           start_work_date: reqBase.start_work_date,
//           end_work_date: reqBase.end_work_date,
//           plant: reqBase.plant || undefined,
//         }),
//         this.post('/options/equipments', {
//           start_work_date: reqBase.start_work_date,
//           end_work_date: reqBase.end_work_date,
//           plant: reqBase.plant || undefined,
//           process: reqBase.process || undefined,
//         }),
//         this.post('/options/partNos', reqBase),
//         this.post('/options/partNames', reqBase),
//       ]);

//       const fixed = { ...this.state.filters };
//       if (fixed.factory && factories.length && !factories.includes(fixed.factory)) fixed.factory = '';
//       if (fixed.process && processes.length && !processes.includes(fixed.process)) fixed.process = '';
//       if (fixed.equipment && equipments.length && !equipments.includes(fixed.equipment)) fixed.equipment = '';

//       this.setState({
//         factories,
//         processes,
//         equipments,
//         parts,
//         items,
//         optionsLoading: false,
//         filters: fixed,
//       });
//     } catch (e) {
//       console.error(e);
//       this.setState({ optionsLoading: false });
//     }
//   };

//   /** 동적 컬럼 생성 (각 컬럼의 최장 텍스트 길이로 width 계산) */
//   buildColumns = (rows) => {
//     if (!rows?.length) return [];
//     const keySet = new Set();
//     const scanCount = Math.min(rows.length, 200);
//     for (let i = 0; i < scanCount; i += 1) {
//       Object.keys(rows[i] || {}).forEach((k) => keySet.add(k));
//     }
//     const allKeys = Array.from(keySet);
//     const sortKey = (k) => {
//       const idx = PREFERRED_ORDER.indexOf(k);
//       return idx === -1 ? 1000 + allKeys.indexOf(k) : idx;
//     };
//     const ordered = allKeys.sort((a, b) => sortKey(a) - sortKey(b));

//     const dateLike = /(^|_)(date|work_date|reportdate|보고일)$/i;

//     const cols = ordered
//       .filter((k) => k !== '')
//       .map((k) => {
//         const headerName = k;
//         const width = calcColumnWidth(k, headerName, rows, 5000);
//         const isDate = dateLike.test(k);
//         return {
//           field: k,
//           headerName,
//           headerClassName: 'super-app-theme--header',
//           cellClassName: 'super-app-theme--cell',
//           width,
//           type: isDate ? 'date' : undefined,
//           valueGetter: isDate
//             ? (p) => {
//                 const v = p.value ?? p.row?.[k];
//                 if (!v) return null;
//                 const d = new Date(v);
//                 return Number.isNaN(d.getTime()) ? null : d;
//               }
//             : undefined,
//         };
//       });

//     const idIdx = cols.findIndex((c) => c.field === 'id');
//     if (idIdx > 0) {
//       const idCol = cols.splice(idIdx, 1)[0];
//       cols.unshift({ ...idCol, width: Math.max(idCol.width || 110, 110) });
//     }
//     return cols;
//   };

//   /** 리스트 로드 */
//   loadList = async () => {
//     const { filters } = this.state;
//     try {
//       localStorage.setItem('inspectionFilters', JSON.stringify(filters));
//     } catch {}
//     this.setState({ loading: true, error: '' });
//     try {
//       const rawRows = await this.post('/list', this.mapFiltersToRequest(filters));

//       if (rawRows?.length) {
//         console.log('[INSPECTION_GRID] raw sample =', rawRows[0]);
//       }

//       const normalized = (rawRows || []).map((r, i) => {
//         const nr = normalizeRowKeys(r);
//         const idVal = nr.id ?? r?.id ?? i + 1;
//         return { id: idVal, ...nr };
//       });

//       const filtered = normalized.filter((row) =>
//         MUST_HAVE_ALL.every((k) => row[k] !== null && row[k] !== undefined && String(row[k]).trim() !== '')
//       );

//       if (filtered?.length) {
//         console.log('[INSPECTION_GRID] sample keys =', Object.keys(filtered[0]));
//         console.log('[INSPECTION_GRID] filtered sample =', filtered[0]);
//       }

//       const columns = this.buildColumns(filtered);
//       this.setState({ rows: filtered, columns, loading: false });
//     } catch (e) {
//       console.error(e);
//       this.setState({ error: '데이터를 불러오지 못했습니다.', loading: false });
//     }
//   };

//   /** 필터 변경 */
//   handleFilterChange = async (field, value) => {
//     this.setState(
//       (prev) => {
//         const f = { ...prev.filters, [field]: value };
//         if (field === 'factory') {
//           f.process = '';
//           f.equipment = '';
//           f.partNo = '';
//           f.item = '';
//         } else if (field === 'process') {
//           f.equipment = '';
//           f.partNo = '';
//           f.item = '';
//         } else if (field === 'equipment') {
//           f.partNo = '';
//           f.item = '';
//         } else if (field === 'topN') {
//           f.topN = Number(value) || 5;
//         }
//         return { filters: f };
//       },
//       async () => {
//         await this.loadOptions();
//         await this.loadList();
//       }
//     );
//   };

//   /** 날짜 프리셋/범위 */
//   setDateRange = async (start, end) => {
//     const start_date = start ? iso(start) : '';
//     const end_date = end ? iso(end) : '';
//     this.setState(
//       (prev) => ({ filters: { ...prev.filters, start_date, end_date } }),
//       async () => {
//         try {
//           localStorage.setItem('inspectionFilters', JSON.stringify(this.state.filters));
//         } catch {}
//         await this.loadOptions();
//         this.loadList();
//       }
//     );
//   };
//   applyToday = () => {
//     const t = today0();
//     this.setDateRange(t, t);
//   };
//   selectYear = (y) => {
//     const s = new Date(y, 0, 1);
//     const e = new Date(y, 11, 31);
//     this.setState({ selectedYear: y, yearAnchorPos: null });
//     this.setDateRange(s, e);
//   };
//   selectMonth = (m) => {
//     const y = this.state.selectedYear;
//     const s = new Date(y, m - 1, 1);
//     const e = lastOfMonth(s);
//     this.setState({ monthAnchorPos: null, selectedMonth: m });
//     this.setDateRange(s, e);
//   };
//   selectWeek = (w) => {
//     this.setState({ weekAnchorPos: null });
//     this.setDateRange(w.start, w.end);
//   };

//   /** ▶ 전체 초기화(전체기간/전체 옵션) */
//   resetToAll = async () => {
//     const filters = getDefaultFilters();
//     this.setState({ filters, selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1 }, async () => {
//       try { localStorage.removeItem('inspectionFilters'); } catch {}
//       await this.loadOptions();
//       this.loadList();
//     });
//   };

//   /** 품번/품명 모달 */
//   openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
//   closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
//   handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
//     this.setState(
//       (prev) => ({
//         filters: { ...prev.filters, partNo: 품목번호 || '', item: 품목명 || '' },
//         itemCodeModalOpen: false,
//       }),
//       () => {
//         this.loadOptions();
//         this.loadList();
//       }
//     );
//   };

//   /** ---------- 필터 바 ---------- */
//   renderFilterBar = () => {
//     const { filters, itemCodeModalOpen } = this.state;

//     const now = today0();
//     const thisYear = now.getFullYear();
//     const thisMonth = now.getMonth() + 1;
//     const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
//     const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

//     return (
//       <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
//         <CardHeader
//           title={
//             <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
//               <SearchIcon /> 검색 조건
//             </Typography>
//           }
//           action={
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
//               {/* 연간 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
//               >
//                 연간
//               </Button>
//               <Menu
//                 open={!!this.state.yearAnchorPos}
//                 onClose={() => this.setState({ yearAnchorPos: null })}
//                 anchorReference="anchorPosition"
//                 anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
//               >
//                 <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
//                 {this.state.years.map((y) => (
//                   <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
//                 ))}
//               </Menu>

//               {/* 월간 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
//               >
//                 월간
//               </Button>
//               <Menu
//                 open={!!this.state.monthAnchorPos}
//                 onClose={() => this.setState({ monthAnchorPos: null })}
//                 anchorReference="anchorPosition"
//                 anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
//               >
//                 <MenuItem
//                   dense
//                   onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}
//                 >
//                   이번달
//                 </MenuItem>
//                 {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
//                   <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
//                     {this.state.selectedYear}년 {m}월
//                   </MenuItem>
//                 ))}
//               </Menu>

//               {/* 주간 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 endIcon={<ExpandMoreIcon />}
//                 onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
//                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
//               >
//                 주간
//               </Button>
//               <Menu
//                 open={!!this.state.weekAnchorPos}
//                 onClose={() => this.setState({ weekAnchorPos: null })}
//                 anchorReference="anchorPosition"
//                 anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
//               >
//                 <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
//                   이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
//                 </MenuItem>
//                 {weeks.map((w, i) => (
//                   <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
//                     {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
//                   </MenuItem>
//                 ))}
//               </Menu>

//               {/* 오늘 */}
//               <Button
//                 size="small"
//                 variant="outlined"
//                 color="success"
//                 onClick={this.applyToday}
//                 sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
//               >
//                 오늘
//               </Button>

//               {/* 기간선택 직접 입력 */}
//               <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>
//               <Typography sx={{ color: 'white' }}>기간선택</Typography>
//               <TextField
//                 type="date"
//                 value={filters.start_date}
//                 onChange={(e) => this.handleFilterChange('start_date', e.target.value)}
//                 size="small"
//                 variant="outlined"
//                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
//                 InputLabelProps={{ shrink: true }}
//               />
//               <Typography sx={{ color: 'white' }}>~</Typography>
//               <TextField
//                 type="date"
//                 value={filters.end_date}
//                 onChange={(e) => this.handleFilterChange('end_date', e.target.value)}
//                 size="small"
//                 variant="outlined"
//                 sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
//                 InputLabelProps={{ shrink: true }}
//               />

//               {/* 확장/축소 */}
//               <IconButton
//                 onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
//                 sx={{ color: 'white' }}
//               >
//                 {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
//               </IconButton>
//             </Box>
//           }
//           sx={{ backgroundColor: '#ff8f00', color: 'white', borderRadius: 1, mb: 2 }}
//         />

//         {/* === 1행: 공장/공정/설비/품번/품명 === */}
//         <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))', gap: 2, mb: 1 }}>
//           <Autocomplete
//             size="small"
//             options={this.state.factories}
//             value={filters.factory || null}
//             onChange={(_, v) => this.handleFilterChange('factory', v || '')}
//             renderInput={(params) => <TextField {...params} label="공장" />}
//             clearOnEscape
//           />
//           <Autocomplete
//             size="small"
//             options={this.state.processes}
//             value={filters.process || null}
//             onChange={(_, v) => this.handleFilterChange('process', v || '')}
//             renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
//             clearOnEscape
//           />
//           <Autocomplete
//             size="small"
//             options={this.state.equipments}
//             value={filters.equipment || null}
//             onChange={(_, v) => this.handleFilterChange('equipment', v || '')}
//             renderInput={(params) => <TextField {...params} label="라인(설비)" />}
//             clearOnEscape
//           />

//           <TextField
//             fullWidth
//             label="품번"
//             value={filters.partNo}
//             onClick={this.openItemCodeModal}
//             size="small"
//             variant="outlined"
//             InputProps={{
//               readOnly: true,
//               style: { cursor: 'pointer' },
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
//           />

//           <TextField
//             fullWidth
//             label="품명(검사항목)"
//             value={filters.item}
//             onClick={this.openItemCodeModal}
//             size="small"
//             variant="outlined"
//             InputProps={{
//               readOnly: true,
//               style: { cursor: 'pointer' },
//               endAdornment: (
//                 <InputAdornment position="end">
//                   <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
//                 </InputAdornment>
//               ),
//             }}
//             sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
//           />
//         </Box>

//         {/* 확장 필터 */}
//         <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
//           <Divider sx={{ my: 2 }} />
//           <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 16 }}>
//             <TextField
//               fullWidth
//               label="검사구분"
//               value={filters.inspType}
//               onChange={(e) => this.handleFilterChange('inspType', e.target.value)}
//               size="small"
//               variant="outlined"
//             />
//             <TextField
//               fullWidth
//               label="작업구분"
//               value={filters.workType}
//               onChange={(e) => this.handleFilterChange('workType', e.target.value)}
//               size="small"
//               variant="outlined"
//             />
//             <TextField
//               fullWidth
//               label="주야구분"
//               value={filters.shiftType}
//               onChange={(e) => this.handleFilterChange('shiftType', e.target.value)}
//               size="small"
//               variant="outlined"
//             />
//             <TextField
//               fullWidth
//               label="Top N"
//               type="number"
//               value={filters.topN ?? 5}
//               onChange={(e) => this.handleFilterChange('topN', e.target.value)}
//               size="small"
//               variant="outlined"
//             />
//           </Box>
//         </Collapse>

//         {/* 버튼 */}
//         <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
//           <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToAll} size="large" color="secondary">
//             필터 초기화
//           </Button>
//           <Button
//             variant="contained"
//             startIcon={<SearchIcon />}
//             size="large"
//             sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
//             onClick={() => {
//               this.loadOptions();
//               this.loadList();
//             }}
//           >
//             검색
//           </Button>
//         </Box>

//         {/* 품목 코드/명 선택 모달 */}
//         <InspectionItemModal
//           open={itemCodeModalOpen}
//           onClose={this.closeItemCodeModal}
//           onSelect={this.handleItemCodeSelect}
//           selectedItemCode={filters.partNo}
//           plant={filters.factory}
//           worker={filters.process}
//           line={filters.equipment}
//           startDate={filters.start_date}
//           endDate={filters.end_date}
//         />
//       </Paper>
//     );
//   };

//   render() {
//     const { error, loading, rows, columns } = this.state;

//     return (
//       <Box className={s.root} sx={{ height: '100vh', p: 3, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
        
//         {/* 헤더 섹션 */}
//         <Box sx={{ mb: 3 }}>
//           <Typography
//             variant="h4"
//             gutterBottom
//             sx={{
//               color: '#ff8f00',
//               fontWeight: 'bold',
//               display: 'flex',
//               alignItems: 'center',
//               gap: 1,
//             }}
//           >
//             <FilterIcon /> 검사 데이터 차트
//           </Typography>
//           <Typography variant="body1" color="text.secondary">
//             검사 결과를 차트와 표로 한눈에 파악할 수 있습니다.
//           </Typography>
//         </Box>

//         {/* 필터 바 */}
//         {this.renderFilterBar()}

//         {/* 에러 */}
//         {error && (
//           <Box sx={{ mb: 2 }}>
//             <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
//             <Button
//               variant="contained"
//               onClick={this.loadList}
//               sx={{ backgroundColor: '#ff8f00', '&:hover': { backgroundColor: '#f57c00' } }}
//             >
//               다시 시도
//             </Button>
//           </Box>
//         )}

//         {/* 그리드 */}
//         <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
//           <Box sx={{ height: '100%,', width: '100%' }}>
//             {loading ? (
//               <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px' }}>
//                 <CircularProgress size={60} sx={{ color: '#ff8f00' }} />
//               </Box>
//             ) : (
//               <DataGrid
//                 rows={rows}
//                 columns={columns}
//                 getRowId={(r) => r.id}
//                 pagination
//                 paginationMode="client"
//                 pageSizeOptions={[10, 25, 50, 100]}
//                 initialState={{
//                   pagination: { paginationModel: { page: 0, pageSize: 10 } },
//                   sorting: { sortModel: [{ field: 'id', sort: 'asc' }] }, // 기본 정렬: id 오름차순
//                   columns: { columnVisibilityModel: DEFAULT_COLUMN_VIS },  // 기본 컬럼 숨김
//                 }}
//                 disableRowSelectionOnClick
//                 density="compact"
//                 slots={{ toolbar: GridToolbar }}
//                 slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
//                 sx={{
//                   '& .super-app-theme--header': { backgroundColor: '#ff8f00', color: 'white', fontWeight: 'bold' },
//                   '& .MuiDataGrid-cell': { borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap' },
//                   '& .MuiDataGrid-root': { border: 'none' },
//                   '& .MuiDataGrid-virtualScroller': { backgroundColor: '#fafafa' },
//                   '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e0e0e0' },
//                 }}
//               />
//             )}
//           </Box>
//         </Paper>
//       </Box>
//     );
//   }
// }


// src/pages/inspection/InspectionSystemData.js
import config from '../../config';
import React, { Component } from 'react';

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  CardHeader,
  IconButton,
  Divider,
  Collapse,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import { Autocomplete } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';

import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
} from '@mui/icons-material';

import InspectionItemModal from '../common/InspectionItemModal';
import s from './InspectionSystemData.module.scss';
import { connect } from 'react-redux';
import { selectThemeHex, selectThemeKey } from '../../reducers/layout';

/** ---------- 공통 상수 ---------- */
const FILTER_STORAGE_KEY = 'inspectionFilters';

/** ---------- helpers ---------- */
const iso = (d) => d.toLocaleDateString('sv-SE'); // YYYY-MM-DD
const today0 = () => {
  const t = new Date();
  return new Date(t.getFullYear(), t.getMonth(), t.getDate());
};
const lastOfMonth = (d) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/** 버튼 기준 화면 좌표 → Menu anchorPosition */
const getAnchorPos = (el) => {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { top: Math.round(r.bottom + window.scrollY), left: Math.round(r.left + window.scrollX) };
};
/** 월요일 시작 주간 */
const startOfWeek = (d) => {
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const s = new Date(d);
  s.setDate(d.getDate() + diff);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate());
};
const endOfWeek = (d) => {
  const s = startOfWeek(d);
  return new Date(s.getFullYear(), s.getMonth(), s.getDate() + 6);
};
const getWeeksOfMonth = (year, month) => {
  const first = new Date(year, month - 1, 1);
  const last = lastOfMonth(first);
  let cur = startOfWeek(first);
  const out = [];
  let idx = 1;
  while (cur <= last) {
    const s = new Date(cur), e = endOfWeek(cur);
    const clipS = new Date(Math.max(s, first));
    const clipE = new Date(Math.min(e, last));
    out.push({ label: `${idx}주차`, start: clipS, end: clipE });
    idx += 1;
    cur = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
  }
  return out;
};

// ▶ 기본값을 '올해 시작 ~ (미정)'으로 설정
const getDefaultFilters = () => {
  const now = today0();
  const start = new Date(now.getFullYear(), 0, 1);   // 1월 1일
  return {
    start_date: iso(start),
    end_date: '',   // ← DB에서 최신 날짜를 받아 채움
    factory: '아진산업-본사(경산)',
    process: '프레스',
    equipment: '1500T(E라인)',
    partNo: '',
    item: '',
    inspType: '',
    workType: '',
    shiftType: '',
    topN: 5,
  };
};

/* ====== 키/값 정규화 유틸 ====== */
/* eslint-disable no-control-regex */
const INVISIBLE = /[\u00A0\u200B-\u200F\u202A-\u202E\u2060]/g;
const CTRL_IN_KEYS = /[\u0000-\u001F\u007F]/g;
const CTRL_IN_VALUES = /[\u00A0\u200B-\u200F\u202A-\u202E\u2060\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
/* eslint-enable no-control-regex */
const MULTI_SPACE = / {2,}/g;

function normalizeKey(k) {
  if (k == null) return '';
  return String(k).replace(INVISIBLE, '').replace(CTRL_IN_KEYS, '').trim().replace(MULTI_SPACE, ' ');
}
function sanitizeValue(v) {
  if (v == null) return v;
  if (typeof v === 'string') return v.replace(CTRL_IN_VALUES, '');
  return v;
}
function normalizeRowKeys(row) {
  const out = {};
  Object.keys(row || {}).forEach((k) => {
    const nk = normalizeKey(k);
    if (out[nk] == null || out[nk] === '') out[nk] = sanitizeValue(row[k]);
  });
  return out;
}

/** 컬럼 정렬 우선순위 */
const PREFERRED_ORDER = [
  'work_date', '보고일',
  'plant', '공장', '플랜트',
  'process', '공정',
  'equipment', '설비',
  '책임자', '작업장', '자재번호', '자재명', '실적번호', '차종',
  '양품수량', '생산수량', '불량합계',
  '검사구분', '주야구분', '작업순번', '작업구분', '검사순번',
  '검사항목명', '검사내용', '생산',
  '사업장',
  'id'
];

/** ✅ 모든 값이 채워져 있어야 하는 필드 */
const MUST_HAVE_ALL = [
  '검사구분', '주야구분', '작업순번', '작업구분', '검사순번',
  '검사항목명', '검사내용', '생산'
];

/** ✅ 기본으로 숨길 컬럼(컬럼 패널 토글 OFF) */
const DEFAULT_COLUMN_VIS = {
  id: false,
  '보고일': false,
  '공장': false,
  '플랜트': false,
  '공정': false,
  '설비': false,
  '책임자': false,
  '작업장': false,
  '실적번호': false,
  '사업장': false,
};

/** ---------- 텍스트 폭 측정(캔버스) ---------- */
const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const ctx = canvas ? canvas.getContext('2d') : null;
const GRID_FONT = '14px Roboto, Arial, Helvetica, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';
const measure = (text) => {
  if (!ctx) return String(text ?? '').length * 10;
  ctx.font = GRID_FONT;
  return ctx.measureText(String(text ?? '')).width;
};
function calcColumnWidth(field, headerName, rows, maxRows = 5000) {
  const headerW = measure(headerName || field);
  let maxW = headerW;
  const limit = Math.min(rows.length, maxRows);
  for (let i = 0; i < limit; i += 1) {
    const v = rows[i]?.[field];
    const s =
      v == null
        ? ''
        : v instanceof Date
          ? v.toLocaleDateString()
          : typeof v === 'object'
            ? JSON.stringify(v)
            : String(v);
    const w = measure(s);
    if (w > maxW) maxW = w;
  }
  const PADDING = 40; // 좌우 여백/정렬 아이콘 고려
  const MIN = 110;
  const MAX = 1200;
  return Math.min(MAX, Math.max(MIN, Math.ceil(maxW + PADDING)));
}

class InspectionGrid extends Component {
  state = {
    // 필터
    filters: getDefaultFilters(),

    // 옵션
    factories: [],
    processes: [],
    equipments: [],
    parts: [],
    items: [],
    optionsLoading: false,

    // UI
    loading: false,
    error: '',
    filterExpanded: false,

    // 프리셋 상태/앵커
    selectedYear: new Date().getFullYear(),
    selectedMonth: new Date().getMonth() + 1,
    yearAnchorPos: null,
    monthAnchorPos: null,
    weekAnchorPos: null,

    years: [],

    // 모달
    itemCodeModalOpen: false,

    // 그리드
    rows: [],
    columns: [],
  };

  componentDidMount() {
    const base = getDefaultFilters();
    const saved = localStorage.getItem(FILTER_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...base, ...parsed };

        // 저장된 값이 빈 날짜라면 올해 기본 시작/종료로 보정
        if (!parsed.start_date && !parsed.end_date) {
          merged.start_date = base.start_date; // 올해 1월1일
          merged.end_date = base.end_date;     // '' (이후 ensureDefaultDbLastDate가 채움)
        }

        merged.equipment = merged.equipment || '';
        merged.start_date = merged.start_date ?? '';
        merged.end_date = merged.end_date ?? '';
        this.setState({ filters: merged });
      } catch {
        this.setState({ filters: base });
      }
    } else {
      this.setState({ filters: base });
    }
    this.bootstrap();
  }

  /** 공통 POST (그리드 엔드포인트) */
  post = async (path, body) => {
    const headers = { 'Content-Type': 'application/json' };
    const url = `${(config.baseURLApi || '').replace(/\/$/, '')}/smartFactory/inspection_grid${path}`;
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body || {}) });
    if (!res.ok) {
      const t = await res.text().catch(() => '');
      throw new Error(`${path} 호출 실패: ${res.status} ${t}`);
    }
    const json = await res.json();
    return json.data || [];
  };

  /** 초기 부트스트랩 */
  bootstrap = async () => {
    await this.loadYears();
    await this.ensureDefaultDbLastDate(); // ← 추가: 최신일자 먼저 세팅
    await this.loadOptions();
    this.loadList();
  };

  // ★ DB의 최신 work_date(YYYY-MM-DD)를 읽어서 end_date가 비어 있으면 채운다
  ensureDefaultDbLastDate = async () => {
    const { filters } = this.state;
    if (filters.end_date) return; // 이미 값 있으면 스킵

    try {
      // 전역 최신일자: 필터 없이 빈 바디로 호출
      const lastDate = await this.post('/options/latest_date', {});
      if (lastDate) {
        this.setState((prev) => ({
          filters: { ...prev.filters, end_date: lastDate }
        }), () => {
          try { localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(this.state.filters)); } catch {}
        });
      }
    } catch (e) {
      console.error('최신 날짜 조회 실패', e);
    }
  };
  

  /** 연도 목록 (fallback) */
  loadYears = async () => {
    const y = new Date().getFullYear();
    const years = [y, y - 1, y - 2, y - 3, y - 4];
    this.setState({ years, selectedYear: y });
  };

  /** 프론트 → 백엔드 요청 매핑 (빈 문자열은 undefined로 넘겨 필터 해제) */
  mapFiltersToRequest = (f) => ({
    start_work_date: f.start_date || undefined,
    end_work_date: f.end_date || undefined,
    plant: f.factory || undefined,
    process: f.process || undefined,
    equipment: f.equipment || undefined,
    itemNumber: f.partNo || undefined,
    inspectionType: f.inspType || undefined,
    workType: f.workType || undefined,
    shiftType: f.shiftType || undefined,
  });

  /** 옵션 로드 */
  loadOptions = async () => {
    const { filters } = this.state;
    this.setState({ optionsLoading: true });
    try {
      const reqBase = this.mapFiltersToRequest(filters);

      const [factories, processes, equipments, parts, items] = await Promise.all([
        this.post('/options/plants', {
          start_work_date: reqBase.start_work_date,
          end_work_date: reqBase.end_work_date,
        }),
        this.post('/options/processes', {
          start_work_date: reqBase.start_work_date,
          end_work_date: reqBase.end_work_date,
          plant: reqBase.plant || undefined,
        }),
        this.post('/options/equipments', {
          start_work_date: reqBase.start_work_date,
          end_work_date: reqBase.end_work_date,
          plant: reqBase.plant || undefined,
          process: reqBase.process || undefined,
        }),
        this.post('/options/partNos', reqBase),
        this.post('/options/partNames', reqBase),
      ]);

      const fixed = { ...this.state.filters };
      if (fixed.factory && factories.length && !factories.includes(fixed.factory)) fixed.factory = '';
      if (fixed.process && processes.length && !processes.includes(fixed.process)) fixed.process = '';
      if (fixed.equipment && equipments.length && !equipments.includes(fixed.equipment)) fixed.equipment = '';
      // 날짜 바뀌어도 선택한 품번/품명은 유지(차트와 동일)
      this.setState({
        factories,
        processes,
        equipments,
        parts,
        items,
        optionsLoading: false,
        filters: fixed,
      });
    } catch (e) {
      console.error(e);
      this.setState({ optionsLoading: false });
    }
  };

  /** 동적 컬럼 생성 (각 컬럼의 최장 텍스트 길이로 width 계산) */
  buildColumns = (rows) => {
    if (!rows?.length) return [];
    const keySet = new Set();
    const scanCount = Math.min(rows.length, 200);
    for (let i = 0; i < scanCount; i += 1) {
      Object.keys(rows[i] || {}).forEach((k) => keySet.add(k));
    }
    const allKeys = Array.from(keySet);
    const sortKey = (k) => {
      const idx = PREFERRED_ORDER.indexOf(k);
      return idx === -1 ? 1000 + allKeys.indexOf(k) : idx;
    };
    const ordered = allKeys.sort((a, b) => sortKey(a) - sortKey(b));

    const dateLike = /(^|_)(date|work_date|reportdate|보고일)$/i;

    const cols = ordered
      .filter((k) => k !== '')
      .map((k) => {
        const headerName = k;
        const width = calcColumnWidth(k, headerName, rows, 5000);
        const isDate = dateLike.test(k);
        return {
          field: k,
          headerName,
          headerClassName: 'super-app-theme--header',
          cellClassName: 'super-app-theme--cell',
          width,
          type: isDate ? 'date' : undefined,
          valueGetter: isDate
            ? (p) => {
                const v = p.value ?? p.row?.[k];
                if (!v) return null;
                const d = new Date(v);
                return Number.isNaN(d.getTime()) ? null : d;
              }
            : undefined,
        };
      });

    const idIdx = cols.findIndex((c) => c.field === 'id');
    if (idIdx > 0) {
      const idCol = cols.splice(idIdx, 1)[0];
      cols.unshift({ ...idCol, width: Math.max(idCol.width || 110, 110) });
    }
    return cols;
  };

  /** 리스트 로드 */
  loadList = async () => {
    const { filters } = this.state;
    try {
      localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
    } catch {}
    this.setState({ loading: true, error: '' });
    try {
      const rawRows = await this.post('/list', this.mapFiltersToRequest(filters));

      if (rawRows?.length) {
        console.log('[INSPECTION_GRID] raw sample =', rawRows[0]);
      }

      const normalized = (rawRows || []).map((r, i) => {
        const nr = normalizeRowKeys(r);
        const idVal = nr.id ?? r?.id ?? i + 1;
        return { id: idVal, ...nr };
      });

      const filtered = normalized.filter((row) =>
        MUST_HAVE_ALL.every((k) => row[k] !== null && row[k] !== undefined && String(row[k]).trim() !== '')
      );

      if (filtered?.length) {
        console.log('[INSPECTION_GRID] sample keys =', Object.keys(filtered[0]));
        console.log('[INSPECTION_GRID] filtered sample =', filtered[0]);
      }

      const columns = this.buildColumns(filtered);
      this.setState({ rows: filtered, columns, loading: false });
    } catch (e) {
      console.error(e);
      this.setState({ error: '데이터를 불러오지 못했습니다.', loading: false });
    }
  };

  /** 필터 변경 (차트 페이지와 동일한 캐스케이드) */
  handleFilterChange = async (field, value) => {
    this.setState(
      (prev) => {
        const f = { ...prev.filters, [field]: value };
        if (field === 'factory') {
          f.process = '';
          f.equipment = '';
          f.partNo = '';
          f.item = '';
        } else if (field === 'process') {
          f.equipment = '';
          f.partNo = '';
          f.item = '';
        } else if (field === 'equipment') {
          f.partNo = '';
          f.item = '';
        } else if (field === 'topN') {
          f.topN = Number(value) || 5;
        }
        return { filters: f };
      },
      async () => {
        await this.loadOptions();
        await this.loadList();
      }
    );
  };

  /** 날짜 프리셋/범위 (차트 페이지와 동일) */
  setDateRange = async (start, end) => {
    const start_date = start ? iso(start) : '';
    const end_date = end ? iso(end) : '';
    this.setState(
      (prev) => ({ filters: { ...prev.filters, start_date, end_date } }),
      async () => {
        try {
          localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(this.state.filters));
        } catch {}
        await this.loadOptions();
        this.loadList();
      }
    );
  };
  applyToday = () => {
    const t = today0();
    this.setDateRange(t, t);
  };
  selectYear = (y) => {
    const s = new Date(y, 0, 1);
    const e = new Date(y, 11, 31);
    this.setState({ selectedYear: y, yearAnchorPos: null });
    this.setDateRange(s, e);
  };
  selectMonth = (m) => {
    const y = this.state.selectedYear;
    const s = new Date(y, m - 1, 1);
    const e = lastOfMonth(s);
    this.setState({ monthAnchorPos: null, selectedMonth: m });
    this.setDateRange(s, e);
  };
  selectWeek = (w) => {
    this.setState({ weekAnchorPos: null });
    this.setDateRange(w.start, w.end);
  };

  /** ▶ 전체 초기화(전체기간/전체 옵션) — 차트와 동일하게 즉시 조회 */
  resetToAll = async () => {
    const filters = getDefaultFilters();
    this.setState(
      { filters, selectedYear: new Date().getFullYear(), selectedMonth: new Date().getMonth() + 1 },
      async () => {
        try { localStorage.removeItem(FILTER_STORAGE_KEY); } catch {}
        await this.ensureDefaultDbLastDate();  // ← 추가: 최신일자 채우기
        await this.loadOptions();
        this.loadList();
      }
    );
  };


  /** 품번/품명 모달 */
  openItemCodeModal = () => this.setState({ itemCodeModalOpen: true });
  closeItemCodeModal = () => this.setState({ itemCodeModalOpen: false });
  handleItemCodeSelect = ({ 품목번호, 품목명 }) => {
    this.setState(
      (prev) => ({
        filters: { ...prev.filters, partNo: 품목번호 || '', item: 품목명 || '' },
        itemCodeModalOpen: false,
      }),
      () => {
        this.loadOptions();
        this.loadList();
      }
    );
  };

  /** ---------- 필터 바 (차트와 동일한 구조/스타일) ---------- */
  renderFilterBar = () => {
    const { themeHex } = this.props;
    const { filters, itemCodeModalOpen } = this.state;

    const now = today0();
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth() + 1;
    const thisWeek = { start: startOfWeek(now), end: endOfWeek(now) };
    const weeks = getWeeksOfMonth(this.state.selectedYear, this.state.selectedMonth);

    return (
      <Paper elevation={3} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <CardHeader
          title={
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'white' }}>
              <SearchIcon /> 검색 조건
            </Typography>
          }
          action={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              {/* 연간 */}
              <Button
                size="small"
                variant="outlined"
                color="success"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => this.setState({ yearAnchorPos: getAnchorPos(e.currentTarget) })}
                sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
              >
                연간
              </Button>
              <Menu
                open={!!this.state.yearAnchorPos}
                onClose={() => this.setState({ yearAnchorPos: null })}
                anchorReference="anchorPosition"
                anchorPosition={this.state.yearAnchorPos || { top: 0, left: 0 }}
              >
                <MenuItem dense onClick={() => this.selectYear(thisYear)}>올해</MenuItem>
                {this.state.years.map((y) => (
                  <MenuItem key={y} dense onClick={() => this.selectYear(y)}>{y}년</MenuItem>
                ))}
              </Menu>

              {/* 월간 */}
              <Button
                size="small"
                variant="outlined"
                color="success"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => this.setState({ monthAnchorPos: getAnchorPos(e.currentTarget) })}
                sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
              >
                월간
              </Button>
              <Menu
                open={!!this.state.monthAnchorPos}
                onClose={() => this.setState({ monthAnchorPos: null })}
                anchorReference="anchorPosition"
                anchorPosition={this.state.monthAnchorPos || { top: 0, left: 0 }}
              >
                <MenuItem
                  dense
                  onClick={() => { this.setState({ selectedYear: thisYear }, () => this.selectMonth(thisMonth)); }}
                >
                  이번달
                </MenuItem>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <MenuItem key={m} dense onClick={() => this.selectMonth(m)}>
                    {this.state.selectedYear}년 {m}월
                  </MenuItem>
                ))}
              </Menu>

              {/* 주간 */}
              <Button
                size="small"
                variant="outlined"
                color="success"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => this.setState({ weekAnchorPos: getAnchorPos(e.currentTarget) })}
                sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
              >
                주간
              </Button>
              <Menu
                open={!!this.state.weekAnchorPos}
                onClose={() => this.setState({ weekAnchorPos: null })}
                anchorReference="anchorPosition"
                anchorPosition={this.state.weekAnchorPos || { top: 0, left: 0 }}
              >
                <MenuItem dense onClick={() => this.selectWeek(thisWeek)}>
                  이번주 ({iso(thisWeek.start)}~{iso(thisWeek.end)})
                </MenuItem>
                {weeks.map((w, i) => (
                  <MenuItem key={i} dense onClick={() => this.selectWeek(w)}>
                    {this.state.selectedYear}년 {this.state.selectedMonth}월 {w.label} ({iso(w.start)}~{iso(w.end)})
                  </MenuItem>
                ))}
              </Menu>

              {/* 오늘 */}
              <Button
                size="small"
                variant="outlined"
                color="success"
                onClick={this.applyToday}
                sx={{ textTransform: 'none', fontWeight: 700, borderColor: 'white', color: 'white' }}
              >
                금일
              </Button>

              {/* 기간선택 직접 입력 */}
              <Typography sx={{ color: 'white', opacity: 0.8, mx: 0.5 }}>|</Typography>
              <Typography sx={{ color: 'white' }}>기간선택</Typography>
              <TextField
                type="date"
                value={filters.start_date}
                onChange={(e) => this.handleFilterChange('start_date', e.target.value)}
                size="small"
                variant="outlined"
                sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />
              <Typography sx={{ color: 'white' }}>~</Typography>
              <TextField
                type="date"
                value={filters.end_date}
                onChange={(e) => this.handleFilterChange('end_date', e.target.value)}
                size="small"
                variant="outlined"
                sx={{ backgroundColor: 'white', borderRadius: 1, minWidth: 150 }}
                InputLabelProps={{ shrink: true }}
              />

              {/* 확장/축소 */}
              <IconButton
                onClick={() => this.setState((prev) => ({ filterExpanded: !prev.filterExpanded }))}
                sx={{ color: 'white' }}
              >
                {this.state.filterExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Box>
          }
          sx={{ backgroundColor: themeHex, color: 'white', borderRadius: 1, mb: 2 }}
        />

        {/* === 1행: 공장/공정/설비/품번/품명 === */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(160px, 1fr))', gap: 2, mb: 1 }}>
          <Autocomplete
            size="small"
            options={this.state.factories}
            value={filters.factory || null}
            onChange={(_, v) => this.handleFilterChange('factory', v || '')}
            renderInput={(params) => <TextField {...params} label="공장" />}
            clearOnEscape
          />
          <Autocomplete
            size="small"
            options={this.state.processes}
            value={filters.process || null}
            onChange={(_, v) => this.handleFilterChange('process', v || '')}
            renderInput={(params) => <TextField {...params} label="작업장(공정)" />}
            clearOnEscape
          />
          <Autocomplete
            size="small"
            options={this.state.equipments}
            value={filters.equipment || null}
            onChange={(_, v) => this.handleFilterChange('equipment', v || '')}
            renderInput={(params) => <TextField {...params} label="라인(설비)" />}
            clearOnEscape
          />

          <TextField
            fullWidth
            label="품번"
            value={filters.partNo}
            onClick={this.openItemCodeModal}
            size="small"
            variant="outlined"
            InputProps={{
              readOnly: true,
              style: { cursor: 'pointer' },
              endAdornment: (
                <InputAdornment position="end">
                  <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
          />

          <TextField
            fullWidth
            label="품명(검사항목)"
            value={filters.item}
            onClick={this.openItemCodeModal}
            size="small"
            variant="outlined"
            InputProps={{
              readOnly: true,
              style: { cursor: 'pointer' },
              endAdornment: (
                <InputAdornment position="end">
                  <KeyboardArrowDownIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ '& .MuiInputBase-root': { cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } } }}
          />
        </Box>

        {/* 확장 필터 — 차트와 동일한 위치/형태 */}
        <Collapse in={this.state.filterExpanded} timeout="auto" unmountOnExit>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(160px, 1fr))', gap: 2 }}>
            <TextField
              fullWidth
              label="검사구분"
              value={filters.inspType}
              onChange={(e) => this.handleFilterChange('inspType', e.target.value)}
              size="small"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="작업구분"
              value={filters.workType}
              onChange={(e) => this.handleFilterChange('workType', e.target.value)}
              size="small"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="주야구분"
              value={filters.shiftType}
              onChange={(e) => this.handleFilterChange('shiftType', e.target.value)}
              size="small"
              variant="outlined"
            />
            <TextField
              fullWidth
              label="Top N"
              type="number"
              value={filters.topN ?? 5}
              onChange={(e) => this.handleFilterChange('topN', e.target.value)}
              size="small"
              variant="outlined"
            />
          </Box>
        </Collapse>

        {/* 버튼 */}
        <Box sx={{ mt: 2, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button variant="outlined" startIcon={<ClearIcon />} onClick={this.resetToAll} size="large" color="secondary">
            필터 초기화
          </Button>
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            size="large"
            sx={{ backgroundColor: themeHex, '&:hover': { backgroundColor: '#f57c00' } }}
            onClick={() => {
              this.loadOptions();
              this.loadList();
            }}
          >
            검색
          </Button>
        </Box>

        {/* 품목 코드/명 선택 모달 */}
        <InspectionItemModal
          open={itemCodeModalOpen}
          onClose={this.closeItemCodeModal}
          onSelect={this.handleItemCodeSelect}
          selectedItemCode={filters.partNo}
          plant={filters.factory}
          worker={filters.process}
          line={filters.equipment}
          startDate={filters.start_date}
          endDate={filters.end_date}
        />
      </Paper>
    );
  };

  render() {
    const { themeHex } = this.props;
    const { error, loading, rows, columns } = this.state;

    return (
      <Box className={s.root} sx={{ height: '100vh', p: 3, display: 'flex', flexDirection: 'column', backgroundColor: '#f5f5f5' }}>
        {/* 헤더 섹션 */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: themeHex,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <FilterIcon /> 검사 데이터 내역
          </Typography>
          <Typography variant="body1" color="text.secondary">
            검사 결과를 차트와 표로 한눈에 파악할 수 있습니다.
          </Typography>
        </Box>

        {/* 필터 바 */}
        {this.renderFilterBar()}

        {/* 에러 */}
        {error && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
            <Button
              variant="contained"
              onClick={this.loadList}
              sx={{ backgroundColor: themeHex, '&:hover': { backgroundColor: '#f57c00' } }}
            >
              다시 시도
            </Button>
          </Box>
        )}

        {/* 그리드 */}
        <Paper elevation={3} sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
          <Box sx={{ height: '100%,', width: '100%' }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px' }}>
                <CircularProgress size={60} sx={{ color: themeHex }} />
              </Box>
            ) : (
              <DataGrid
                rows={rows}
                columns={columns}
                getRowId={(r) => r.id}
                pagination
                paginationMode="client"
                pageSizeOptions={[10, 25, 50, 100]}
                initialState={{
                  pagination: { paginationModel: { page: 0, pageSize: 10 } },
                  sorting: { sortModel: [{ field: 'id', sort: 'asc' }] }, // 기본 정렬: id 오름차순
                  columns: { columnVisibilityModel: DEFAULT_COLUMN_VIS },  // 기본 컬럼 숨김
                }}
                disableRowSelectionOnClick
                density="compact"
                slots={{ toolbar: GridToolbar }}
                slotProps={{ toolbar: { showQuickFilter: true, quickFilterProps: { debounceMs: 500 } } }}
                sx={{
                  '& .super-app-theme--header': { backgroundColor: themeHex, color: 'white', fontWeight: 'bold' },
                  '& .MuiDataGrid-cell': { borderBottom: '1px solid #e0e0e0', whiteSpace: 'nowrap' },
                  '& .MuiDataGrid-root': { border: 'none' },
                  '& .MuiDataGrid-virtualScroller': { backgroundColor: '#fafafa' },
                  '& .MuiDataGrid-footerContainer': { borderTop: '1px solid #e0e0e0' },
                }}
              />
            )}
          </Box>
        </Paper>
      </Box>
    );
  }
}

function mapStateToProps(state) {
  return {
    themeHex: selectThemeHex(state),
    themeKey: selectThemeKey(state)
  };
}

export default connect(mapStateToProps)(InspectionGrid);
