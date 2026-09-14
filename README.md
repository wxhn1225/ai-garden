# 拾知 · AI Garden

一个浅色的个人 AI 学习资料库，用 Markdown 持续整理网页设计、Skills、性能优化、Prompt 与学习笔记。

界面采用 C「便签工作室」：奶油色桌面、彩色文件夹页签和纸张卡片，配合全宽页头与便笺式阅读区。手机上收为单列，保留搜索、筛选和资料维护入口。视觉规范见 [DESIGN.md](DESIGN.md)。

## 使用

- 搜索名称、标签、域名和正文；支持中文与多关键词。
- 按板块、资料类型与主题筛选，切换卡片或列表，按收录时间或名称排序。
- 搜索与筛选保存在 URL 中，可分享当前视图，浏览器后退可恢复条件。
- 查看 Markdown 详情、相关资料与原始来源；复制页面链接或提示词。
- 仅有浅色主题，支持手机、键盘与减少动态效果偏好。

首次导入 21 个原始收藏和 28 个补充设计资源，另有 2 个官方性能资料入口、2 份本站提示词模板和 1 份内容维护指南。调研条目没有被标记为已实践。

## 本地运行

使用 Node.js **26.8.2** 与 pnpm **12.4.1**。旧版 pnpm 在 Windows 上自动切换到 pnpm 12 时可能无法启动；直接使用对应版本的包管理器。

```bash
npm install --global pnpm@12.4.1
pnpm install --frozen-lockfile
pnpm dev
```

如不修改全局 pnpm，可将上面的 `pnpm` 替换为：

```bash
npm exec --yes --package=pnpm@12.4.1 -- pnpm
```

## 添加与维护资料

1. 从 `templates/` 复制资源、Skill 或笔记模板到 `content/` 下的对应目录。
2. 文件名使用小写英文与短横线，全站唯一，例如 `my-new-skill.md`。
3. 填写 frontmatter，正文使用 Markdown。`addedAt` 与 `updatedAt` 使用 `YYYY-MM-DD`。
4. 提交到 `main`，GitHub Actions 校验、构建并部署。非法字段或重复文件名会让构建失败并给出位置。

各板块的 `section` 值为 `web`、`skills`、`performance`、`prompts`、`notes`。标签自动汇总，计数、详情页和全文索引自动生成。站内“添加资料”有完整操作说明；详情页可直接进入 GitHub 编辑。

`scripts/seed-content.mjs` 仅记录首次导入，正常维护不要再次运行。修改或删除 `content/` 的 Markdown 即可。

## 构建与检查

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm verify
pnpm preview
```

`pnpm build` 先由 Next.js 静态导出，再由 Pagefind 建立中文全文索引。`pnpm verify` 检查详情与分类页面、站内资源路径和搜索文件。`pnpm preview` 在本地 4173 端口按实际构建路径提供静态预览。

检查项目型 GitHub Pages 的子路径，在 PowerShell 中运行：

```powershell
$env:NEXT_PUBLIC_BASE_PATH = '/ai-garden'
pnpm build
pnpm verify
pnpm preview
```

## GitHub Pages

仓库 Settings → Pages → Build and deployment 选择 **GitHub Actions**。工作流 `.github/workflows/pages.yml` 会根据仓库名配置路径：普通项目仓库使用 `/仓库名`；`用户名.github.io` 根站点使用空路径。

- 推送 `main`：检查、构建并发布。
- Pull request：只检查与构建，不发布。
- 构建失败：不会进入部署步骤。

Next 使用 `output: 'export'` 与 `trailingSlash: true`。部署目录是 `out/`，包含 `.nojekyll`。页面、图标和 Pagefind 都使用同一子路径。使用自定义域名时，将工作流中的路径解析步骤改为显式设置空 `NEXT_PUBLIC_BASE_PATH`。

GitHub Pages 只运行静态文件。内容通过 GitHub 更新，不需要数据库；当前没有在线账号、服务端写入或 AI API 密钥。不要将秘密信息写入会发布的 Markdown。

## 技术版本

2026-09-14 按官方 registry 与发布页锁定，详见 `package.json` 和 `pnpm-lock.yaml`。

| 技术 | 版本 |
| --- | --- |
| Next.js / App Router / Turbopack | 16.3.5 |
| React / React DOM | 19.3.0 |
| TypeScript | 7.0.2 |
| Tailwind CSS | 4.3.3 |
| Node.js Current | 26.8.2 |
| pnpm | 12.4.1 |
| Biome | 2.5.13 |
| Zod | 4.6.5 |
| Pagefind | 1.5.2 |
| react-markdown / remark-gfm | 10.1.0 / 4.0.1 |
| gray-matter | 4.0.3 |
| Lucide React | 1.45.0 |

Next 16.3.5 默认调用项目本地 `tsc`，可使用 TypeScript 7。官方仍将对应 `useTypeScriptCli` 配置归为 experimental；本项目保留默认检查，未设置 `ignoreBuildErrors`。Turbopack 负责转译，TS7 负责类型检查。[Next 官方说明](https://nextjs.org/docs/app/api-reference/config/next-config-js/useTypeScriptCli)

## 目录

```text
content/           资料正文与元信息
templates/         新资料模板
src/app/           静态路由与全局样式
src/components/    目录、导航、复制按钮
src/lib/           内容校验与板块配置
public/            图标与静态资源
scripts/           导入、静态预览和导出检查
docs/              调研与实现记录
DESIGN.md          便签工作室视觉规范
.github/workflows/ 自动构建与发布
```

界面为原创实现。外部网站、Skill 与商业模板作为参考资料收录；未复制其付费源码、广告、热度背书或促销内容。各资源的内容和代码许可由原作者决定。
