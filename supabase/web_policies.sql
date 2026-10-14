-- Cho người đã đăng nhập (authenticated) được sửa trạng thái duyệt alias và trạng thái dự thầu.
-- Đọc dữ liệu đã có policy read_auth trong schema.sql.
drop policy if exists alias_update_auth on alias_san_pham;
create policy alias_update_auth on alias_san_pham for update to authenticated using (true) with check (true);

drop policy if exists tbmt_update_auth on tbmt_lo;
create policy tbmt_update_auth on tbmt_lo for update to authenticated using (true) with check (true);
