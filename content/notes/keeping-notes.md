---
title: "怎样给拾知添一份资料"
description: "从保存一个链接开始，用 Markdown 慢慢补充用途、标签和自己的笔记。"
section: "notes"
kind: "笔记"
tags: ["使用指南", "Markdown"]
addedAt: "2026-09-14"
updatedAt: "2026-09-14"
origin: "editorial"
mark: "+"
color: "teal"
---

## 保存一份新资料

一份资料对应一个 Markdown 文件，保存在仓库的 `content/` 目录中。文件开头记录名称、简介、分类、标签与日期，下面写内容和笔记。

1. [在 GitHub 新建资源文件](https://github.com/wxhn1225/ai-garden/new/main/content/resources?filename=my-resource.md)。需要登录有仓库写入权限的账号。
2. 复制下面的模板，修改文件名、名称、链接和标签。
3. 保存提交。自动构建通过后，资料会出现在网站对应板块与搜索中。

```yaml
---
title: "资料名称"
description: "一句话说明它能解决什么问题。"
section: "web"
kind: "灵感"
url: "https://example.com/"
tags: ["布局", "设计系统"]
addedAt: "2026-09-14"
updatedAt: "2026-09-14"
origin: "original"
mark: "Ex"
color: "blue"
---

## 为什么收录

记录喜欢的布局、交互，或准备研究的问题。

## 实践笔记

使用后再补充结果。
```

## 选对板块

| section | 板块 | 常用 kind |
| --- | --- | --- |
| web | 网页设计 | 灵感、组件、模板、UX、指南 |
| skills | Skills | Skill |
| performance | 性能优化 | 指南 |
| prompts | Prompt / 工作流 | Prompt |
| notes | 学习笔记 | 笔记 |

文件名使用小写英文与短横线，例如 `my-resource.md`，全站保持唯一。`mark` 是卡片上的简短标识，最多 4 个字符。`color` 可选 blue、violet、orange、teal、rose、slate。

## 写下自己的理解

不必一开始就写完整文章。可以先存下链接和用途，之后补充三个问题：它解决了什么？我试过什么？下次使用时要注意什么？

文档中的提示词或外部 Skill 是学习材料。使用前判断其是否适合当前任务，再选择需要的部分。

## 更新和纠错

每份资料的详情页都有“在 GitHub 编辑这份资料”入口。修改内容时一并更新 `updatedAt`，保留最初的 `addedAt`。删除或改名文件会在下次构建时更新网站。

页面上的条目数与搜索内容都由文件生成，不需要手动维护另一份清单。
