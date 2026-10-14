export const vnd = (n) =>
  n == null || n === '' ? '—' : Math.round(Number(n)).toLocaleString('vi-VN');

export const vndShort = (n) => {
  const v = Number(n);
  if (!isFinite(v)) return '—';
  if (v >= 1e9) return (v / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tỷ';
  if (v >= 1e6) return (v / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tr';
  return Math.round(v).toLocaleString('vi-VN');
};

export const num = (n) =>
  n == null ? '—' : Number(n).toLocaleString('vi-VN', { maximumFractionDigits: 2 });

export const dmy = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  if (isNaN(x)) return String(d);
  return x.toLocaleDateString('vi-VN');
};

export const dmyHm = (d) => {
  if (!d) return '—';
  const x = new Date(d);
  if (isNaN(x)) return String(d);
  return x.toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' });
};

// Hãng của mình — chỉnh ở đây nếu cần
export const OUR_BRANDS = ['Teleflex', 'Biotronik'];

// Bỏ ký tự làm hỏng cú pháp .or() của PostgREST
export const clean = (s) => s.replace(/[,()*%\\]/g, ' ').trim();
