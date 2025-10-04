import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  const { data, error } = await supabase
    .from("users")
    .upsert({ email, name, last_login: new Date().toISOString() })
    .select();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ message: "User logged in", user: data[0] });
}
