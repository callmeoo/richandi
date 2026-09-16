# 我的行业知识库｜Industry Learning OS

一个中文为主、双语学习的个人知识库 MVP。桌面和手机浏览器均可使用，支持安装为 PWA。

## 固定入口

| 用途 | 入口 |
| --- | --- |
| 每天记知识、复习和考试 | [打开我的行业知识库](https://industry-learning-os-yuan.yuanlj0119.chatgpt.site) |
| 找回或继续编辑原项目 | [ChatGPT Sites](https://chatgpt.com/sites)，选择「我的行业知识库｜Industry Learning OS」 |
| 查看和保存应用源码 | [callmeoo/richandi](https://github.com/callmeoo/richandi) |

建议把学习网址加入浏览器书签。日常使用无需打开 Work，也无需安装桌面应用。网站目前仅限所有者访问，请登录创建项目时的同一 ChatGPT 账户。

## 当前状态 · 2026-09-16

原 MVP 第 1 版已在 ChatGPT Sites 发布，已通过站点管理信息核对；其源码版本为 `2779900d506a4b592a8d2785de5f42ee7e6ef5d6`。本仓库导入该版本的源码，并修正此前过期的部署说明。原应用功能保持不变。

GitHub 保存应用代码；账户下新增的知识卡和复习记录保存在原站点数据库中，不包含在 GitHub 仓库中。本次源码导入不是数据库迁移。

**Vercel 尚未部署。** 当前应用使用 Sites 提供的 ChatGPT 身份认证和 Cloudflare D1 数据库，不能把这份源码直接导入 Vercel 就视为完成迁移。迁移时需要适配服务器运行方式、登录认证和数据库，并单独验证用户隔离及原数据迁移；不得直接信任来自公开请求的 `oai-authenticated-user-*` 头。

## 已实现

- 只输入 MPV / JETOUR / Honda / Honda CR-V / Pickup，会匹配已核对的预置内容并打开完整卡片；已有卡片直接复用，不重复新增。
- 随手记、新增、编辑、删除；中文、English、缩写、IPA、发音提示、解释、关联知识、业务场景、中英例子、可选图片链接、考点、答案、来源。
- 八个一级分类与自由标签；全文搜索、分类/掌握度筛选、Automotive English 交叉标签。
- 今日到期复习、最多 10 题加权随机考试、错题本。
- Correct/Wrong、最近/下次复习、连续答对掌握度；答错后 10 分钟，连续答对间隔 1/3/7/14/30/60/90 天。
- 待完善卡片不出题；错误/新卡/到期卡提高抽样权重，单轮不重复。
- ChatGPT 账户识别、D1 持久数据、用户隔离、每 30 秒及回到页面时刷新；修改冲突提示与答题幂等保护。
- 手机底部导航、浏览器英文慢速朗读、PWA manifest/图标/服务工作线程/离线提示。
- 首次登录自动建立 JETOUR、Honda、Honda CR-V、MPV、Pickup 五张卡，均有 Automotive English 标签。

## 本机运行

需要 Node.js >=22.13。依赖已安装且本机数据库已初始化时直接运行：

```sh
npm run dev -- --port 5173
```

打开 `http://localhost:5173/`。开发登录会自动进入独立的本机体验账户，数据存于 `.wrangler/state`。本机登录模拟不会打包进生产部署，也不是实际云端账户。

全新电脑首次启动：

```sh
npm run install:ci
npm run build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_worthless_magus.sql
npm run dev -- --port 5173
```

该迁移只执行一次；不要在已初始化数据库上重复运行。新增数据库结构时生成追加迁移，不修改已经发布的迁移。

## 使用与继续开发

1. 手机和电脑直接打开上方学习网址，使用同一 ChatGPT 账户登录。iPhone：分享 → 添加到主屏幕；Android：菜单 → 安装应用（具体选项以浏览器为准）。
2. 要继续修改，打开 ChatGPT Sites，选择完整名称「我的行业知识库｜Industry Learning OS」。另一个「行业知识库与每日复习」是后来重复建立的未发布项目，请勿混用。
3. 也可在 ChatGPT 的 Work 对话中提供本仓库地址和学习网址，要求沿用原项目。原任务记录中的 `codex://threads/01a0a9a1-c47a-7160-a329-d78d33fcc75f` 是桌面应用链接，不是学习网址。
4. GitHub 与 Sites 是两个源码位置。本次导入不会自动建立双向同步；后续修改须明确提交目标和发布平台。Sites 的 `.openai/hosting.json` 保留原项目身份，不能据此新建替代项目。

不能执行任何付款、充值、升级或启用超额付费。如果平台要求这些操作，保留当前可运行版本并停止部署。

## 验证

```sh
npm test
npm run typecheck
npm run lint
npm run build
```

浏览器验证脚本位于 `tests/browser-smoke.mjs`，需要可用的 Playwright 和 Chrome；可用 `PLAYWRIGHT_MODULE` 指定已有的 Playwright 安装路径，无需修改应用依赖。验证前先运行开发服务。脚本会创建并删除一张临时卡片，执行一轮自评；请在开发账户运行。

`tests/api-isolation.mjs` 验证生产 Worker 的用户隔离、越权拒绝、跨来源写入拒绝和并发防重复。只针对本机构建预览使用测试身份头；真实线上身份头由平台可信分发层注入。

新增验证：`tests/mobile-loop.mjs` 在独立手机/电脑浏览器会话中测试 MPV 保存、模拟次日复习、记录答错和电脑刷新读到错题；`tests/review-conflict.mjs` 验证跨设备更新后的答题恢复。既有测试基于本机数据库；云端发布状态已另行核对，真实设备间同步仍需使用登录账户验证。

## MVP 边界

- 首批五个已知术语支持精确匹配；其他新词先保存草稿，再补充解释/答案后加入复习。未接入 AI 自动扩展或自动判卷，也没有伪装成真实 AI 的模拟内容。
- 考试采用“先回答、查看参考答案、自评”，无法评估口头发音是否标准。
- 图片为可选 HTTPS 链接，不上传文件。浏览器合成语音仅辅助练习，品牌词发音不保证准确。
- PWA 需要联网读取/写入账户知识。离线只显示提示；不缓存私人知识和登录页面。未保存的新卡草稿暂存当前浏览器，不能跨设备同步；退出账户会清除本机草稿。
- 本机体验数据与生产数据彼此独立。云端实际登录、跨实体设备同步和 iOS 安装效果需部署后确认。
- 没有后台推送通知或每日自动提醒；“今日复习”进入应用后可用。
- MVP 暂无数据导出和批量导入。

## 目录规则

见 `AGENTS.md`。应用数据、测试截图、构建产物及本机状态不进入 Git；密钥不写入源码。
