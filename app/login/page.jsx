'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const { error } = await db().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError('Email hoặc mật khẩu chưa đúng. Kiểm tra lại rồi thử lần nữa.');
    else router.replace('/');
  }

  return (
    <div className="login">
      <form onSubmit={submit}>
        <h1>Đăng nhập MedTender</h1>
        {error && <div className="err">{error}</div>}
        <div className="field">
          <label htmlFor="em">Email</label>
          <input id="em" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="pw">Mật khẩu</label>
          <input id="pw" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <button className="btn" disabled={busy}>{busy ? 'Đang đăng nhập…' : 'Đăng nhập'}</button>
      </form>
    </div>
  );
}
