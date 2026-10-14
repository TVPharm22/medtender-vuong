# MedTender Vương

Web xem giá trúng thầu, thị phần và thầu đang mở (tim mạch can thiệp, mạch ngoại biên). Dữ liệu nằm ở Supabase, n8n cập nhật hằng ngày.

## Chạy thử
```
cp .env.example .env.local   # điền anon key
npm install
npm run dev
```

## Deploy Vercel
Import repo, thêm 2 biến môi trường `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

## Supabase
- Chạy `supabase/web_policies.sql` một lần (cho phép người đăng nhập sửa trạng thái).
- Tạo user ở Authentication → Users và tắt "Allow new users to sign up".
"# medtender-vuong" 
