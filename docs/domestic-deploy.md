# 国内可访问且可修改的部署方案

GitHub Pages 只能做静态镜像，不能安全运行 `/api/memory` 和 `/api/upload`，所以不能作为可修改后台。要在国内也能修改，需要把 Next.js 后端跑在一台服务器上。

推荐方案：

- 腾讯云轻量应用服务器、阿里云 ECS、华为云云耀服务器都可以。
- 服务器系统建议 Ubuntu 22.04 或 24.04。
- 地域建议优先香港、新加坡，通常无需备案；如果使用中国大陆地域和自定义域名，通常需要 ICP 备案。
- 数据和图片继续用 Supabase；如果之后 Supabase 在国内访问也不稳定，再把图片迁移到腾讯云 COS/阿里云 OSS。

## 方案 A：Docker 部署

服务器安装 Docker 后，在项目目录运行：

```bash
docker build -t between-us .
docker run -d \
  --name between-us \
  --restart unless-stopped \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SITE_URL=https://你的域名 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co \
  -e SUPABASE_SERVICE_ROLE_KEY=你的 service_role key \
  -e SUPABASE_STORAGE_BUCKET=between-us-images \
  -e BETWEEN_US_ADMIN_CODE=你和 Cindy 的管理密码 \
  between-us
```

访问：

```txt
http://服务器IP:3000
```

## 方案 B：PM2 部署

服务器安装 Node.js 22 后：

```bash
npm ci
STANDALONE=true npm run build
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

环境变量建议写到服务器的进程管理环境里，或用系统服务注入。必须包含：

```bash
NEXT_PUBLIC_SITE_URL=https://你的域名
NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
SUPABASE_SERVICE_ROLE_KEY=你的 service_role key
SUPABASE_STORAGE_BUCKET=between-us-images
BETWEEN_US_ADMIN_CODE=你和 Cindy 的管理密码
```

## Nginx 反向代理

如果要用域名访问：

```nginx
server {
  listen 80;
  server_name 你的域名;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

HTTPS 可以用：

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d 你的域名
```

## 和 Vercel 的关系

- Vercel 可以继续当主站或备用站。
- 国内服务器可以当可修改镜像站。
- 两边填同一套 Supabase 环境变量，就会共用同一份数据。
- 你和 Cindy 在任意一边修改，另一边刷新后也能看到。
