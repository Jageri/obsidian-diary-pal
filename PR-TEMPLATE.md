## PR 内容模板（复制粘贴到 GitHub PR）

### PR 标题
```
Add Diary Pal plugin
```

### PR 描述
```markdown
## Plugin Submission: Diary Pal

**Repository:** https://github.com/Jageri/obsidian-diary-pal
**Release:** https://github.com/Jageri/obsidian-diary-pal/releases/tag/0.1.0

### Description
Diary Pal is an AI-powered diary writing assistant that guides users through daily reflection via conversational interview, learns their writing style from existing diaries, and generates authentic diary entries.

### Features
- Interview-style questioning (5-8 rounds)
- Progressive style analysis from user's diary history
- Bilingual support (Chinese/English)
- Auto-save to vault with intelligent file naming
- Editable writing style guide

### Requirements Checklist
- [x] I have read the community plugin submission guidelines
- [x] My plugin has a valid `manifest.json` with correct `minAppVersion`
- [x] I have a GitHub release with all required files:
  - `main.js`
  - `manifest.json`  
  - `styles.css`
- [x] My plugin ID (`diary-pal`) is unique in the community plugins list
- [x] My plugin name (`Diary Pal`) is unique in the community plugins list
- [x] I am willing to maintain and support this plugin
- [x] I have tested this plugin on Obsidian v0.15.0+

### Technical Details
- **ID:** diary-pal
- **Name:** Diary Pal
- **Author:** Allen
- **Min App Version:** 0.15.0
- **Description:** AI-powered diary writing assistant with interview-style questioning and style learning
```

---

## community-plugins.json 添加内容

在你的 fork 的 `community-plugins.json` 中，按字母顺序找到合适位置插入：

```json
{
  "id": "diary-pal",
  "name": "Diary Pal",
  "author": "Allen",
  "description": "AI-powered diary writing assistant with interview-style questioning and style learning",
  "repo": "Jageri/obsidian-diary-pal"
}
```

**插入位置：** 按 `id` 字母顺序，放在 "d" 开头的区域（比如 "dataview" 和 "dictionary" 之间）

---

## 提交步骤回顾

1. **Fork** https://github.com/obsidianmd/obsidian-releases
2. **Edit** `community-plugins.json` 添加上述 JSON
3. **Commit** 到你的 fork
4. **Create PR** 使用上面的标题和描述
5. **Wait** 审核（1-7天）

**注意事项：**
- 确保 JSON 格式正确（逗号、引号）
- 不要修改其他插件的条目
- 保持字母顺序
