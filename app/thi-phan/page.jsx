'use client';
import { useEffect, useMemo, useState } from 'react';
import Shell from '@/components/Shell';
import { db, fetchAll } from '@/lib/supabase';
import { vnd, vndShort, num, OUR_BRANDS } from '@/lib/format';

const METRICS = {
  tong_tien: { label: 'Giá trị trúng thầu', fmt: vndShort },
  tong_sl: { label: 'Số lượng', fmt: num },
  so_dong: { label: 'Số dòng trúng thầu', fmt: num },
};

function Page() {
  const [all, setAll] = useState([]);
  const [nhom, setNhom] = useState('');
  const [nam, setNam] = useState('');
  const [metric, setMetric] = useState('tong_tien');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll(() => db().from('v_thi_phan').select('*'))
      .then((d) => { setAll(d); setNhom((cur) => cur || [...new Set(d.map((r) => r.nhom_hang))].sort()[0] || ''); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const nhoms = useMemo(() => [...new Set(all.map((r) => r.nhom_hang).filter(Boolean))].sort(), [all]);
  const nams = useMemo(() => [...new Set(all.map((r) => r.nam).filter(Boolean))].sort((a, b) => b - a), [all]);

  const table = useMemo(() => {
    const by = new Map();
    for (const r of all) {
      if (r.nhom_hang !== nhom) continue;
      if (nam && String(r.nam) !== String(nam)) continue;
      const o = by.get(r.hang) || { hang: r.hang, so_dong: 0, tong_sl: 0, tong_tien: 0, so_bv: 0, gia_trung_vi: null, gia_min: null, gia_max: null };
      o.so_dong += Number(r.so_dong || 0);
      o.tong_sl += Number(r.tong_sl || 0);
      o.tong_tien += Number(r.tong_tien || 0);
      o.so_bv = Math.max(o.so_bv, Number(r.so_bv || 0)); // chặn dưới khi gộp nhiều năm
      o.gia_min = o.gia_min == null ? Number(r.gia_min) : Math.min(o.gia_min, Number(r.gia_min));
      o.gia_max = o.gia_max == null ? Number(r.gia_max) : Math.max(o.gia_max, Number(r.gia_max));
      if (nam) o.gia_trung_vi = Number(r.gia_trung_vi);
      by.set(r.hang, o);
    }
    const list = [...by.values()].sort((a, b) => b[metric] - a[metric]);
    const sum = list.reduce((s, r) => s + r[metric], 0) || 1;
    return list.map((r) => ({ ...r, share: r[metric] / sum }));
  }, [all, nhom, nam, metric]);

  return (
    <>
      <h1>Thị phần theo hãng</h1>
      <p className="sub">Tổng hợp từ kết quả lựa chọn nhà thầu, chỉ tính các dòng có đơn giá. Giá trung vị chỉ hiện khi chọn một năm cụ thể.</p>

      <div className="filters">
        <div className="field">
          <label htmlFor="n">Nhóm hàng</label>
          <select id="n" value={nhom} onChange={(e) => setNhom(e.target.value)}>
            {nhoms.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="y">Năm</label>
          <select id="y" value={nam} onChange={(e) => setNam(e.target.value)}>
            <option value="">Tất cả năm</option>
            {nams.map((x) => <option key={x}>{x}</option>)}
          </select>
        </div>
        <div className="field">
          <label htmlFor="m">Tính thị phần theo</label>
          <select id="m" value={metric} onChange={(e) => setMetric(e.target.value)}>
            {Object.entries(METRICS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
      </div>

      {error && <div className="err">Không tải được dữ liệu: {error}</div>}

      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Hãng</th><th style={{ width: '32%' }}>Thị phần</th>
              <th className="n">{METRICS[metric].label}</th><th className="n">Số dòng</th>
              <th className="n">Giá trung vị (đ)</th><th className="n">Giá thấp – cao (đ)</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={6} className="msg">Đang tải…</td></tr>}
            {!loading && table.length === 0 && !error && <tr><td colSpan={6} className="msg">Chưa có dữ liệu cho lựa chọn này.</td></tr>}
            {table.map((r) => (
              <tr key={r.hang} className={OUR_BRANDS.includes(r.hang) ? 'ours' : ''}>
                <td>{r.hang}</td>
                <td>
                  <div className="bar">
                    <i style={{ width: `${Math.max(r.share * 100, 1)}%` }} />
                    <span>{(r.share * 100).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}%</span>
                  </div>
                </td>
                <td className="n">{METRICS[metric].fmt(r[metric])}</td>
                <td className="n">{r.so_dong.toLocaleString('vi-VN')}</td>
                <td className="n">{r.gia_trung_vi ? vnd(r.gia_trung_vi) : '—'}</td>
                <td className="n dim">{vnd(r.gia_min)} – {vnd(r.gia_max)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function ThiPhan() { return <Shell><Page /></Shell>; }
