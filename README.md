# Between Us

一个高级、克制、现代化的情侣时间线与回忆收藏 Web 应用。基于 Next.js 15 App Router、TypeScript、TailwindCSS、shadcn/ui 风格组件、Framer Motion、Supabase 和 Vercel 构建。

## 功能

- 首页：情侣名字、恋爱天数自动计算、简洁文案、克制 Hero 动画
- 时间线：展示第一次见面、约会、纪念日、旅行、礼物和日常小事，支持中文标签筛选
- 照片墙：瀑布流布局、懒加载、点击查看大图
- 纪念日：在一起天数、下一个纪念日倒计时、生日倒计时、重要日期列表
- 礼物记录：日期、场景、可选价格、反应、图片
- 未来清单：每个分类下可直接添加事项，已完成/未完成可点击切换
- 管理后台：新增、编辑、删除时间线、照片、纪念日、礼物和未来清单
- 基础设置：后台调整情侣名字、恋爱开始日期和首页文案
- 照片导入：后台批量导入 URL，照片墙和编辑表单可直接从手机相册选择图片
- 中文标签：标签可点选，也可以新建中文标签
- Supabase 云端同步：两个人可在不同设备共同管理内容和图片
- 暗色模式、SEO 基础优化、移动端优先响应式设计

## 技术栈

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- shadcn/ui 风格组件
- Framer Motion
- Supabase Database + Supabase Storage
- localStorage + 本地 JSON 备用数据
- Vercel 部署

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## Supabase 设置

1. 在 [Supabase](https://supabase.com) 创建项目。
2. 打开 Supabase SQL Editor。
3. 复制并执行 `supabase/schema.sql` 的全部内容。
4. 打开 Project Settings -> API，复制：

```txt
Project URL
service_role key
```

5. 在 Vercel 的 Environment Variables 添加：

```bash
NEXT_PUBLIC_SUPABASE_URL=你的 Project URL
SUPABASE_SERVICE_ROLE_KEY=你的 service_role key
SUPABASE_STORAGE_BUCKET=between-us-images
BETWEEN_US_ADMIN_CODE=你和 Cindy 共享的管理密码
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

6. 重新部署 Vercel。

`BETWEEN_US_ADMIN_CODE` 用来保护修改和上传图片。你和 Cindy 第一次保存内容或上传图片时，在浏览器里输入这个密码即可。

## 数据和图片

- 结构化数据存储在 Supabase `memory_state.data` JSONB 字段里。
- 从手机相册选择的图片会上传到 Supabase Storage 的 `between-us-images` bucket。
- 外链图片会直接保存 URL。
- 未配置 Supabase 时，应用会退回本地备用模式，数据写入浏览器 localStorage。

localStorage key：

```txt
between-us-memory-data
```

## 共同管理方式

- 你和 Cindy 都访问同一个 Vercel 网站。
- 内容展示页面会读取同一份 Supabase 数据。
- 修改内容、切换未来清单状态、上传图片时，会要求输入共享管理密码。
- 两个人输入同一个 `BETWEEN_US_ADMIN_CODE` 后，都可以管理。

## 常用入口

- 管理后台：`/admin`
- 照片墙添加相册照片：`/photos`
- 未来清单快速添加：`/future`
- 批量导入照片：`/admin` -> “照片” -> “批量导入”

批量导入照片格式：

```txt
图片URL | 标题 | 日期YYYY-MM-DD | 地点 | 标签
https://example.com/photo-1.jpg | 海边日落 | 2025-05-20 | 厦门 | 旅行,纪念日
https://example.com/photo-2.jpg | 周末早餐 | 2025-06-01 | 家 | 日常,美食
```

## Vercel 部署

1. 将项目推送到 GitHub。
2. 在 Vercel 新建项目，选择该仓库。
3. Framework Preset 选择 `Next.js`。
4. Build Command 使用默认值：

```bash
npm run build
```

5. 添加上面的 Supabase 环境变量。
6. 点击 Deploy。

## 常用命令

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
```

## 自定义内容

- 默认数据：`src/data/seed.json`
- 数据类型：`src/types/memory.ts`
- 数据同步逻辑：`src/hooks/use-memory-data.ts`
- Supabase 服务端配置：`src/lib/supabase/server.ts`
- 主题色：`src/app/globals.css`
