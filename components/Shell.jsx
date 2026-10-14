'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { db } from '@/lib/supabase';

const LINKS = [
  { href: '/', label: 'Giá trúng thầu' },
  { href: '/thi-phan', label: 'Thị phần' },
  { href: '/tbmt', label: 'Thầu đang mở' },
  { href: '/duyet', label: 'Duyệt tên sản phẩm' },
];

export default function Shell({ children }) {
  const router = useRouter();
  const path = usePathname();
  const [user, setUser] = useState(undefined);

  useEffect(() => {
    const sb = db();
    sb.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace('/login');
      else setUser(data.session.user);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      if (!session) router.replace('/login');
      else setUser(session.user);
    });
    return () => sub.subscription.unsubscribe();
  }, [router]);

  if (!user) return <div className="msg">Đang kiểm tra đăng nhập…</div>;

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          MedTender Vương
          <small>Tim mạch can thiệp · Mạch ngoại biên</small>
        </div>
        <nav className="nav">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} aria-current={path === l.href ? 'page' : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="who">
          {user.email}
          <button onClick={() => db().auth.signOut()}>Đăng xuất</button>
        </div>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}
