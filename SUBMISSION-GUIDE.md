# 提交到社区插件列表步骤

## 1. Fork 完成后的操作

访问你的 fork：
https://github.com/Jageri/obsidian-releases

## 2. 编辑 community-plugins.json

在你的 fork 页面：
1. 找到 `community-plugins.json` 文件
2. 点击文件
3. 点击右上角的 **铅笔图标**（Edit this file）

## 3. 添加插件信息

按字母顺序找到 "d" 开头的地方，插入以下内容：

```json
{
  "id": "diary-pal",
  "name": "Diary Pal",
  "author": "Allen",
  "description": "AI-powered diary writing assistant with interview-style questioning and style learning",
  "repo": "Jageri/obsidian-diary-pal"
}
```

**注意：**
- 确保 JSON 格式正确（逗号、括号）
- 插入位置按 `id` 字母顺序（diary-pal 应该在 "d" 区域）

## 4. 提交更改

页面底部：
- **Commit message**: `Add Diary Pal plugin`
- **Description**: 可以留空或写简要说明
- 选择 **"Commit directly to the master branch"**
- 点击 **"Commit changes"**

## 5. 创建 Pull Request

1. 在你的 fork 页面点击 **"Contribute"** → **"Open pull request"**
2. 或者访问：https://github.com/Jageri/obsidian-releases/pulls

**PR 设置：**
- base repository: `obsidianmd/obsidian-releases`
- base: `master`
- head repository: `Jageri/obsidian-releases`
- compare: `master`

**PR 标题：**
```
Add Diary Pal plugin
```

**PR 描述**（复制粘贴）：
```markdown
# Diary Pal - AI Diary Writing Assistant

An Obsidian plugin that helps users write diaries through AI-guided conversation and style learning.

## Features
- 🤖 Interview-style questioning to guide daily reflection
- 📝 Learns user's writing style from existing diaries
- 🌍 Bilingual support (Chinese/English)
- 📂 Auto-save to vault

## Repo
https://github.com/Jageri/obsidian-diary-pal

## Release
https://github.com/Jageri/obsidian-diary-pal/releases/tag/0.1.0

## Checklist
- [x] I have read the plugin submission requirements
- [x] My plugin has a valid manifest.json
- [x] I have a GitHub release with required files (main.js, manifest.json, styles.css)
- [x] My plugin ID is unique
- [x] My plugin name is unique
```

## 6. 等待审核

点击 **"Create pull request"** 后，等待审核（通常 1-7 天）。

---

**完成后把 PR 链接发给我，我帮你确认是否成功。**
