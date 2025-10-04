import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { email, productId, purchaseTime } = req.body;

  if (!email || !productId) {
    return res.status(400).json({ error: "Missing parameters" });
  }

  const { data, error } = await supabase
    .from("purchases")
    .insert([{ email, product_id: productId, time: purchaseTime || new Date().toISOString() }]);

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ message: "Purchase recorded", data });
}
