# 商镜Global — 企业订单增长诊断中心

**企业免费体检 · 精准增长方案**

Next.js 15 App Router · Tailwind CSS · MySQL

## 本地开发

```bash
cp .env.example .env.local   # 填写数据库和密码
npm install
npm run dev                  # http://localhost:3020
```

## 生产部署

```bash
npm install
NODE_OPTIONS="--max-old-space-size=768" npm run build
PORT=3002 pm2 start npm --name shangjing -- start
```

## 环境变量（.env.local）

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=shangjing_db
DB_USER=root
DB_PASSWORD=your_password
SESSION_SECRET=32位以上随机字符串
ADMIN_PASSWORD=管理员密码12位以上
ADMIN_RECOVERY_KEY=恢复密钥20位以上
NEXT_PUBLIC_WHATSAPP_NUMBER=电话号码
NEXT_PUBLIC_SITE_URL=https://你的域名
```

## 页面

| 路径 | 说明 |
|---|---|
| `/` | 首页 |
| `/diagnosis` | 免费诊断 |
| `/results` | 诊断结果 |
| `/services` | 服务介绍 |
| `/cases` | 成功案例 |
| `/contact` | 联系我们 |
| `/admin` | 管理后台 |
