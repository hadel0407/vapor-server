const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');
const supabase = require('./utils/supabase');
const { OAuth2Client } = require('google-auth-library');

const app = new Koa();
const router = new Router();
app.use(bodyParser());

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// 验证 Google ID Token
async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  return ticket.getPayload(); // 返回 payload 包含 sub（Google 用户唯一 ID）
}

// POST /api/user - 保存购买信息
router.post('/api/user', async (ctx) => {
  const { google_id_token, purchased } = ctx.request.body;

  if (!google_id_token) {
    ctx.status = 400;
    ctx.body = { success: false, message: 'google_id_token 必填' };
    return;
  }

  let payload;
  try {
    payload = await verifyGoogleToken(google_id_token);
  } catch (err) {
    ctx.status = 401;
    ctx.body = { success: false, message: 'Google 验证失败' };
    return;
  }

  const google_id = payload.sub;

  // 插入或更新购买状态
  const { data, error } = await supabase
    .from('purchases')
    .upsert({ google_id, purchased }, { onConflict: 'google_id' });

  if (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: error.message };
    return;
  }

  ctx.body = { success: true, data };
});

// GET /api/user/:google_id - 查询购买状态
router.get('/api/user/:google_id', async (ctx) => {
  const { google_id } = ctx.params;

  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('google_id', google_id)
    .single();

  if (error || !data) {
    ctx.status = 404;
    ctx.body = { success: false, message: '未找到用户或未购买' };
    return;
  }

  ctx.body = {
    google_id: data.google_id,
    purchased: data.purchased,
    timestamp: data.timestamp
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

// 监听端口
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
