'use client';
import { useEffect, useState, useCallback } from 'react';
import Shell from '@/components/Shell';
import { db, fetchAll } from '@/lib/supabase';
import { vnd, num, dmy, clean, OUR_BRANDS } from '@/lib/format';

const PAGE = 50;

function Page() {
  const [opts, setOpts] = useState({ nhom: [], nam: [], hang: [] });
  const [f, setF] = useState({ nhom: '', nam: '', hang: '', q: '' });
  const [applied, setApplied] = useState(f);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll(() => db().from('v_thi_phan').select('nhom_hang,nam,hang'))
      .then((d) => {
        const uniq = (k) => [...new Set(d.map((r) => r[k]).filter(Boolean))];
        setOpts({
          nhom: uniq('nhom_hang').sort(),
          nam: uniq('nam').sort((a, b) => b - a),
          hang: uniq('hang').filter((h) => h !== '(chưa rõ)').sort((a, b) => a.localeCompare(b)),
        });
      })
      .catch((e) => setError(e.message));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    let q = db()
      .from('v_gia_trung_thau')
      .select(
        'record_key,nam,ngay_qd,benh_vien,tinh,nhom_hang,ten_thuong_mai,hang_sx,ten_chuan,hang_chuan,dvt,so_luong,don_gia,thanh_tien,nha_thau_trung,mapping_status',
        { count: 'exact' }
      )
      .order('ngay_qd', { ascending: false, nullsFirst: false });
    if (applied.nhom) q = q.eq('nhom_hang', applied.nhom);
    if (applied.nam) q = q.eq('nam', Number(applied.nam));
    if (applied.hang) {
      const h = clean(applied.hang);
      q = q.or(`hang_chuan.eq.${h},and(hang_chuan.is.null,hang_sx.ilike.%${h}%)`);
    }
    if (applied.q) {
      const s = clean(applied.q);
      q = q.or(`ten_thuong_mai.ilike.%${s}%,ten_chuan.ilike.%${s}%,benh_vien.ilike.%${s}%,nha_thau_trung.ilike.%${s}%`);
    }
    const { data, error, count } = await q.range(page * PAGE, page * PAGE + PAGE - 1);
    if (error) setError(error.message);
    else { setRows(data); setTotal(count ?? 0); }
    setLoading(false);
  }, [applied, page]);

  useEffect(() => { load(); }, [load]);

  const apply = (e) => { e.preventDefault(); setPage(0); setApplied(f); };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <>
      <h1>Giá trúng thầu</h1>
      <p className="sub">Từng mặt hàng trong kết quả lựa chọn nhà thầu, đã gắn tên sản phẩm chuẩn. Dòng viền cam là sản phẩm của hãng mình.</p>

      <form className="filters" onSubmit={apply}>
        <div className="field">
          <label htmlFor="nhom">Nhóm hàng</label>
          <select id="nhom" value={f.nhom} onChange={set('nhom')}>
            <option value="">Tất cả</option>
            {opts.nhom.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="nam">Năm</label>
          <select id="nam" value={f.nam} onChange={set('nam')}>
            <option value="">Tất cả</option>
            {opts.nam.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="hang">Hãng</label>
          <select id="hang" value={f.hang} onChange={set('hang')}>
            <option value="">Tất cả</option>
            {opts.hang.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="q">Tìm tên sản phẩm, bệnh viện, nhà thầu</label>
          <input id="q" className="wide" value={f.q} onChange={set('q')} placeholder="Ví dụ: Orsiro, Chợ Rẫy" />
        </div>
        <button className="btn">Lọc</button>
      </form>

      {error && <div className="err">Không tải được dữ liệu: {error}</div>}

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Ngày QĐ</th><th>Bệnh viện</th><th>Sản phẩm</th><th>Hãng</th>
              <th className="n">SL</th><th className="n">Đơn giá (đ)</th><th>Nhà thầu trúng</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={7} className="msg">Đang tải…</td></tr>}
            {!loading && rows.length === 0 && !error && (
              <tr><td colSpan={7} className="msg">Không có dòng nào khớp bộ lọc. Bỏ bớt điều kiện lọc để xem thêm.</td></tr>
            )}
            {!loading && rows.map((r) => {
              const hang = r.hang_chuan || r.hang_sx || '';
              const ours = OUR_BRANDS.includes(r.hang_chuan);
              return (
                <tr key={r.record_key} className={ours ? 'ours' : ''}>
                  <td className="dim">{dmy(r.ngay_qd)}</td>
                  <td>{r.benh_vien}<div className="dim">{r.tinh}</div></td>
                  <td className="clip">
                    {r.ten_chuan || r.ten_thuong_mai || '—'}
                    {r.ten_chuan && r.ten_thuong_mai && <div className="dim">{r.ten_thuong_mai}</div>}
                    {!r.ten_chuan && <div className="dim">{r.nhom_hang}</div>}
                  </td>
                  <td>
                    {hang || '—'}
                    {r.mapping_status === 'ai_goi_y' && <div><span className="tag gray">AI gợi ý</span></div>}
                  </td>
                  <td className="n">{num(r.so_luong)} <span className="dim">{r.dvt}</span></td>
                  <td className="n">{vnd(r.don_gia)}</td>
                  <td className="clip dim">{r.nha_thau_trung}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pager">
        <button className="btn ghost sm" disabled={page === 0} onClick={() => setPage(page - 1)}>Trước</button>
        <span>Trang {page + 1}/{pages} · {total.toLocaleString('vi-VN')} dòng</span>
        <button className="btn ghost sm" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>Sau</button>
      </div>
    </>
  );
}

export default function Home() { return <Shell><Page /></Shell>; }
