import { createClient } from '@supabase/supabase-js';

let client;
export function db() {
  if (!client) {
    client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
  }
  return client;
}

// Supabase trả tối đa 1000 dòng/lần → gom nhiều trang
export async function fetchAll(buildQuery, pageSize = 1000) {
  const out = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await buildQuery().range(from, from + pageSize - 1);
    if (error) throw error;
    out.push(...data);
    if (data.length < pageSize) break;
  }
  return out;
}
