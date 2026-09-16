# 我的行业知识库｜Industry Learning OS

中文为主的个人知识库。手机和电脑可以记知识、编辑知识卡、复习、考试，支持添加到手机主屏幕。

## 固定入口

| 用途 | 入口 |
| --- | --- |
| 目前可用的原知识库 | [打开知识库](https://industry-learning-os-yuan.yuanlj0119.chatgpt.site)，使用原 ChatGPT 账户 |
| 应用源码和继续开发 | [callmeoo/richandi](https://github.com/callmeoo/richandi) |
| Vercel 项目管理 | [Vercel 工作空间](https://vercel.com/yuanlj0119-4486s-projects) |
| 原项目管理 | [ChatGPT Sites](https://chatgpt.com/sites)，选择「我的行业知识库｜Industry Learning OS」 |

**Vercel 上线状态：尚未完成。** 实际发布请求返回 403：当前 Vercel 连接未获授权访问此工作空间，需要重新连接并授权该空间。 工作空间链接是管理后台，不是知识库访问链接。只有部署成功、数据库和登录验证通过后，才将新的正式学习网址添加到这里。

用户已明确授权将 Vercel 适配版推送至本仓库。此版本沿用原应用页面，并迁移到标准 Next.js、Neon Postgres 与邮箱验证码登录。

## Vercel 适配版

- 标准 Next.js App Router；Vercel 使用 `npm ci` / `npm run build`。
- Neon Postgres 保存知识卡、修改版本和复习记录，Drizzle 管理结构与迁移。
- Neon Auth 邮箱验证码登录。只允许 `OWNER_EMAIL` 对应且已经验证邮箱的账户访问；生产环境没有模拟登录，也不信任 Sites 的身份请求头。
- 手机和电脑登录同一邮箱后访问同一份数据。编辑使用版本检查；答题通过数据库事务、行锁与提交 ID 防止重复记分。
- 保留原页面、随手记、8 个分类、搜索、关联知识、英文朗读、今日复习、随机考试、错题本和 PWA。
- 首次建立空知识库时提供 JETOUR、Honda、Honda CR-V、MPV、Pickup 五张预置卡。其他内容可先存草稿，再补充解释与答案。

## 数据库与原数据

2026-09-16 已在原有 Neon 项目中建立独立数据库 `richandi`，生产库的 `cards`、`libraries`、`reviews` 及迁移记录表已创建。没有修改原 `neondb` 业务表和原 Sites 数据库。

经用户明确同意，原 Sites 的 **5 张知识卡已复制到 Neon**，逐项核对内容、创建/更新时间、学习状态和版本，全部一致。原库复习记录为 0。原 Sites 数据仍保留，双方目前不自动同步；正式切换前请继续使用原入口，避免同时编辑两个版本。

应用代码保存在 GitHub；新增知识和复习记录保存在数据库，不会写进 GitHub。新增或修改知识内容不需要重新部署，修改应用代码才需要重新部署。

## 运行与部署

需要 Node.js 22.13 或以上。复制 `.env.example` 为 `.env.local`，填写：

| 变量 | 用途 |
| --- | --- |
| `DATABASE_URL` | Neon `richandi` 数据库的池化连接，服务端使用 |
| `DATABASE_URL_UNPOOLED` | 同一数据库的直连，仅运行迁移时使用 |
| `NEON_AUTH_BASE_URL` | Neon Auth 的完整服务地址，本项目复用现有认证服务 |
| `NEON_AUTH_COOKIE_SECRET` | 至少 32 字符的随机密钥，例如 `openssl rand -base64 48` |
| `OWNER_EMAIL` | 唯一所有者的邮箱，登录时必须完成邮箱验证 |

所有变量均为服务端配置，不添加 `NEXT_PUBLIC_` 前缀，不提交真实值到 GitHub。

```sh
npm ci
npm run db:migrate
npm run dev
```

新电脑打开 `http://localhost:3000`。本机运行同样使用真实认证与配置的数据库；使用测试分支进行开发。生产库已完成首个迁移，迁移记录已核对，Drizzle 会跳过已应用的迁移。

Vercel 导入本仓库，Framework 选择 Next.js，Root Directory 为仓库根目录。配置上述运行变量；`DATABASE_URL_UNPOOLED` 可仅保留在受信任的迁移环境。将部署后**实际生成的** HTTPS 域名加入 Neon Auth 的 Trusted Domains，再验证验证码登录与保存。

不要将生产库配置复制到不受信任的预览分支。Vercel 数据库 Marketplace 默认注入的连接可能指向 `neondb`，必须检查目标数据库名为 `richandi`。

Neon 现有共享邮件服务已启用；真实验证码收取及正式域名仍需上线验证。未新增付费服务、充值、升级或超额付费配置。

## 验证

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

`tests/storage.test.ts` 使用 PGlite 的 PostgreSQL 引擎执行实际迁移和 Drizzle 数据读写，覆盖用户隔离、重复新增、版本冲突、答题幂等、时间戳和删除后不重建预置卡。`tests/auth-policy.test.ts` 检查所有者验证及跨来源写入拒绝。既有复习调度与快速录入检查继续运行。

Neon 测试分支也已完成真实表结构及中文数据写入、读取验证。当前执行环境无法直连 Neon，也无法在浏览器打开本机验证地址；**未完成真实邮箱登录、线上端到端保存及实体手机验证**。详见 `VERIFICATION.md`。

`tests/*.mjs`、`build/`、`vite.config.ts`、`cloudflare-env.d.ts`、`drizzle/` 和 Sites 辅助脚本保留原版本资料，当前 Vercel 流程不运行这些旧脚本。旧 SQLite 迁移保持不变；新迁移位于 `drizzle-postgres/`。`.openai/hosting.json` 仅保留原站点身份，不能用当前 Vercel 适配版覆盖原 Sites 服务。

## 使用边界

- 已保存的知识可跨设备同步；未保存草稿仍只在当前浏览器，退出登录会清除。
- 需要联网读写；离线不缓存私人知识或登录页面。
- 图片使用 HTTPS 链接，不上传文件；朗读由浏览器提供。
- 考试采用自评，未接入 AI 自动判卷或后台推送。
- GitHub 和原 Sites 没有自动双向同步。后续修改沿用本仓库，明确部署目标为 Vercel。
