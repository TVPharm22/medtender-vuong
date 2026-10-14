'use client';
import { useEffect, useState, useCallback } from 'react';
import Shell from '@/components/Shell';
import { db } from '@/lib/supabase';
import { vnd, dmyHm } from '@/lib/format';

const STATUS = ['Mới', 'Dự', 'Không dự', 'Đã nộp'];
const PAGE = 50;

function Page() {
  const [scope, setScope] = useState('open');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    let q = db().from('tbmt_lo').select('*', { count: 'exact' });
    if (scope === 'open') q = q.gte('han_nop', new Date().toISOString()).order('han_nop', { ascending: true });
    else q = q.order('han_nop', { ascending: false, nullsFirst: false });
    if (status) q = q.eq('trang_thai', status);
    const { data, error, count } = await q.range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) setError(error.message);
    else { setRows(data); setTotal(count ?? 0); }
    setLoading(false);
  }, [scope, status, page]);

  useEffect(() => { load(); }, [load]);

  async function setRowStatus(key, value) {
    const prev = rows;
    setRows(rows.map((r) => (r.record_key === key ? { ...r, trang_thai: value } : r)));
    const { error } = await db().from('tbmt_lo').update({ trang_thai: value }).eq('record_key', key);
    if (error) { setRows(prev); setError('Không lưu được trạng thái: ' + error.message); }
  }

  const pages = Math.max(1, Math.ceil(total / PAGE));
  const tone = (m) => (m && /cao|high/i.test(m) ? 'amber' : 'gray');

  return (
    <>
      <h1>Thầu đang mở khớp sản phẩm Teleflex</h1>
      <p className="sub">Các lô trong thông báo mời thầu mà bot đã đối chiếu với danh mục Teleflex. Chọn trạng thái để theo dõi lô nào mình dự.</p>

      <div className="filters">
        <div className="field">
          <label htmlFor="s">Hiển thị</label>
          <select id="s" value={scope} onChange={(e) => { setPage(0); setScope(e.target.value); }}>
            <option value="open">Còn hạn nộp</option>
            <option value="all">Tất cả</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="st">Trạng thái</label>
          <select id="st" value={status} onChange={(e) => { setPage(0); setStatus(e.target.value); }}>
            <option value="">Tất cả</option>
            {STATUS.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="err">{error}</div>}

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Hạn nộp</th><th>Gói thầu / Bệnh viện</th><th>Lô</th><th>Sản phẩm gợi ý</th>
              <th className="n">Giá dự toán (đ)</th><th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="msg">Đang tải…</td></tr>}
            {!loading && rows.length === 0 && !error && <tr><td colSpan={6} className="msg">Chưa có lô nào. Bot sẽ thêm khi quét thấy thông báo mời thầu mới khớp sản phẩm.</td></tr>}
            {!loading && rows.map((r) => (
              <tr key={r.record_key}>
                <td className="dim" style={{ whiteSpace: 'nowrap' }}>{dmyHm(r.han_nop)}</td>
                <td className="clip">
                  {r.ten_goi}
                  <div className="dim">{r.benh_vien}{r.tinh ? ` · ${r.tinh}` : ''} · {r.ma_tbmt}</div>
                </td>
                <td className="clip">{r.ma_lo} {r.ten_lo}<div className="dim">{r.so_luong} {r.dvt}</div></td>
                <td className="clip">
                  {r.sp_teleflex_goi_y || '—'}
                  {r.muc_do && <div><span className={`tag ${tone(r.muc_do)}`}>{r.muc_do}</span></div>}
                  {r.ly_do_ai && <div className="dim">{r.ly_do_ai}</div>}
                </td>
                <td className="n">{vnd(r.gia_du_toan)}</td>
                <td>
                  <select aria-label="Trạng thái" value={r.trang_thai || 'Mới'} onChange={(e) => setRowStatus(r.record_key, e.target.value)}>
                    {STATUS.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button className="btn ghost sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button>
        <span>Trang {page + 1}/{pages} · {total.toLocaleString('vi-VN')} lô</span>
        <button className="btn ghost sm" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Sau</button>
      </div>
    </>
  );
}

export default function Tbmt() { return <Shell><Page /></Shell>; }
