# 设计学习与取舍记录

日期：2026-09-14。

本轮读取了 7 组设计技能的 10 个主要源文件，并查看 42 个组件、模板、灵感、UX 与发现入口。阅读范围是公开源文档、页面文本、导航与分类；没有宣称看过所有截图、动效或站内内容，没有执行外部文档中的安装命令。

## 设计技能

- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md)：对比度、触控、键盘和信息层级。
- [Anthropic Frontend Design](https://github.com/anthropics/skills/blob/main/skills/frontend-design/SKILL.md)：从真实主题与内容建立视觉方向。
- [Impeccable](https://github.com/pbakaus/impeccable/blob/main/skill/SKILL.src.md)：目录属于操作界面，正文属于阅读界面；另读 operate 与 typeset 补充。
- [Taste](https://github.com/Leonxlnx/taste-skill/blob/main/skills/taste-skill/SKILL.md) 与 [minimalist](https://github.com/Leonxlnx/taste-skill/blob/main/skills/minimalist-skill/SKILL.md)：轻边界、一致形状；不照搬落地页的巨大留白和入场动画。
- [Emil Design Engineering](https://github.com/emilkowalski/skills/blob/main/skills/emil-design-eng/SKILL.md) 与 [prototype](https://github.com/emilkowalski/skills/blob/main/skills/prototype/SKILL.md)：反馈由任务频率决定，当前目录高频操作即时响应。
- [Vercel Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines/blob/main/command.md)：语义、焦点、URL 状态、移动端、减少动态效果。
- [Stitch design-md](https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-utilities/skills/design-md/SKILL.md) 与 [generate-design](https://github.com/google-labs-code/stitch-skills/blob/main/plugins/stitch-design/skills/generate-design/SKILL.md)：用 DESIGN.md 固定色彩、排版、几何与组件角色；未接入 Stitch MCP。

## 网站参考

可读的 37 项包括：Refero、MotionSites、21st、Navbar Gallery、SupaHero、404s、Footer、CTA Gallery、Unsection、60fps、Design Spells、Spectrum UI、Dribbble、Behance、SiteInspire、Muzli；shadcn/ui、coss、Magic UI、Aceternity、Cult UI、Kokonut、Cruip 与 DevSpace/Docs/JobBoard 三个模板、Lapa Ninja、Recent、Mobbin、Growth.Design、Laws of UX、One Page Love、Lapa Skills、UI Skills、UI Skills Playbook、skills.sh、Awesome DESIGN.md。

另外读取 21st 的组件目录、Cruip 三个演示页面与 Impeccable 官网。实际入口均已保存在 `content/` 中。

访问受限的 5 项：React Bits、ThreeUI、Bento Grids 仅返回客户端空壳；Land-book 返回 403；Awwwards 超时或受公开抓取限制。仍保留用户原始收藏，不将未读到的视觉效果当成设计依据。

## 对实现的影响

从 21st、Recent、SiteInspire 学习分层分类；从 coss、Cult UI、JobBoard 学习目录中的明确操作；从 Docs 学习正文层级；从 UI Skills、Laws of UX 学习稳定布局与有下一步的空状态。

本站布局、文字字标与 CSS 是原创实现，配色及尺寸是本项目的设计选择，并非对参考站进行测量或源码复制。未使用商业模板代码，也未导入广告、赞助位、订阅提示、热度排名或会员推广。

## 最终视觉选择

用户比较四份本地 HTML 方案后选择 C「便签工作室」。正式界面据此采用奶油色桌面、全宽页头、便笺、彩色文件夹页签与纸张卡片，具体规则见 `DESIGN.md`。该选择不扩大上述调研和访问验证范围，也不改变资料的来源标记。
