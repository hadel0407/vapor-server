const Koa = require('koa');
const app = new Koa();

// 简单响应
app.use(async ctx => {
  ctx.body = 'Hello Vercel Node!';
});

// 监听 Vercel 分配的端口
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
