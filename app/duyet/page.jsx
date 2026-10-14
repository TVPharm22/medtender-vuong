'use client';
import { useEffect, useState, useCallback } from 'react';
import Shell from '@/components/Shell';
import { db } from '@/lib/supabase';

const PAGE = 40;

function Page() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    const { data, error, count } = await db()
      .from('alias_san_pham')
      .select('id,ten_tm_norm,hang_norm,hang_chuan,do_tin_cay,san_pham_chuan(ten_chuan,hang)', { count: 'exact' })
      .eq('trang_thai', 'ai_goi_y')
      .order('do_tin_cay', { ascending: true, nullsFirst: true })
      .limit(PAGE);
    if (error) setError(error.message);
    else { setRows(data); setTotal(count ?? 0); }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function decide(id, value) {
    const { data: u } = await db().auth.getUser();
    const { error } = await db()
      .from('alias_san_pham')
      .update({ trang_thai: value, nguoi_duyet: u?.user?.email ?? null, cap_nhat: new Date().toISOString() })
      .eq('id', id);
    if (error) { setError('Không lưu được: ' + error.message); return; }
    setRows((r) => r.filter((x) => x.id !== id));
    setTotal((t) => t - 1);
  }

  return (
    <>
      <h1>Duyệt tên sản phẩm</h1>
      <p className="sub">AI gợi ý tên sản phẩm chuẩn cho từng tên thương mại. Hiện các dòng độ tin cậy thấp trước. Duyệt thì giữ nguyên, từ chối thì dòng đó không còn được gắn sản phẩm. Còn {total.toLocaleString('vi-VN')} dòng chờ duyệt.</p>

      {error && <div className="err">{error}</div>}

      <div className="tablewrap">
        <table>
          <thead>
            <tr><th>Tên trên kết quả thầu</th><th>Hãng đã chuẩn hoá</th><th>Sản phẩm chuẩn</th><th className="n">Độ tin cậy</th><th /></tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={5} className="msg">Đang tải…</td></tr>}
            {!loading && rows.length === 0 && !error && <tr><td colSpan={5} className="msg">Không còn dòng nào chờ duyệt.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="clip">{r.ten_tm_norm}{r.hang_norm && <div className="dim">hãng ghi: {r.hang_norm}</div>}</td>
                <td>{r.san_pham_chuan?.hang || r.hang_chuan || <span className="tag red">Chưa xác định</span>}</td>
                <td className="clip">{r.san_pham_chuan?.ten_chuan || <span className="dim">Chỉ có hãng</span>}</td>
                <td className="n">
                  <span className={`tag ${r.do_tin_cay >= 0.8 ? '' : r.do_tin_cay >= 0.5 ? 'amber' : 'red'}`}>
                    {r.do_tin_cay == null ? '—' : Math.round(r.do_tin_cay * 100) + '%'}
                  </span>
                </td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button className="btn sm" onClick={() => decide(r.id, 'da_duyet')}>Duyệt</button>{' '}
                  <button className="btn sm red" onClick={() => decide(r.id, 'tu_choi')}>Từ chối</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function Duyet() { return <Shell><Page /></Shell>; }
