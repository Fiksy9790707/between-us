# Between Us

一个高级、克制、现代化的情侣时间线与回忆收藏 Web 应用。基于 Next.js 15 App Router、TypeScript、TailwindCSS、shadcn/ui 风格组件、Framer Motion 和本地 JSON/localStorage 数据构建，可直接部署到 Vercel。

## 功能

- 首页：情侣名字、恋爱天数自动计算、简洁文案、克制 Hero 动画
- 时间线：按时间展示第一次见面、约会、纪念日、旅行、礼物和日常小事，支持标签筛选
- 照片墙：响应式瀑布流、懒加载、点击查看大图
- 纪念日：在一起天数、下一个纪念日倒计时、生日倒计时、重要日期列表
- 礼物记录：日期、场景、可选价格、反应、图片
- 未来清单：地点、美食、想做的事，支持已完成/未完成
- 管理后台：对时间线、照片、纪念日、礼物和未来清单进行新增、编辑、删除
- 基础设置：在后台调整情侣名字、恋爱开始日期和首页文案
- 暗色模式、SEO 基础元信息、移动端优先响应式设计

## 技术栈

- Next.js 15 App Router
- TypeScript
- TailwindCSS
- shadcn/ui 风格组件
- Framer Motion
- localStorage + 本地 JSON 模拟数据
- Vercel 部署

## 本地运行

```bash
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 数据说明

初始数据位于：

```txt
src/data/seed.json
```

核心类型位于：

```txt
src/types/memory.ts
```

运行后，管理后台的修改会写入浏览器 localStorage，key 为：

```txt
between-us-memory-data
```

如果要恢复示例数据，可在管理后台点击“重置示例”。

## 未来迁移到 Supabase/PostgreSQL

当前数据边界集中在：

```txt
src/hooks/use-memory-data.ts
```

迁移时建议保留 `MemoryData` 及各实体类型不变，将这个 hook 替换为 repository/API 调用：

- `timeline_events`
- `photos`
- `anniversaries`
- `gifts`
- `wishes`
- `profiles`

页面和组件只消费统一的数据结构，因此迁移数据库时不需要大规模改 UI。

## Vercel 部署

1. 将项目推送到 GitHub。
2. 在 Vercel 新建项目，选择该仓库。
3. Framework Preset 选择 `Next.js`。
4. Build Command 使用默认值：

```bash
npm run build
```

5. Output Directory 保持默认。
6. 如需设置站点 URL，在 Vercel Environment Variables 中添加：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

7. 点击 Deploy。

## 常用命令

```bash
npm run dev
npm run build
npm run typecheck
```

## 自定义内容

- 修改默认情侣名字与开始日期：`src/data/seed.json` 的 `profile`
- 网站上线后的内容调整：进入 `/admin`，可修改基础设置、日期和照片
- 修改标签文案：`src/lib/constants.ts`
- 修改导航与页面结构：`src/components/app-shell.tsx`
- 修改主题色：`src/app/globals.css`
