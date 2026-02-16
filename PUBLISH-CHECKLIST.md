# Diary Pal 发布检查清单

## ✅ 准备工作

### 1. GitHub 仓库设置
- [ ] 创建 GitHub 仓库（公开）
- [ ] 上传代码到仓库
- [ ] 添加 LICENSE 文件（MIT 推荐）

### 2. 必要文件检查
- [ ] `manifest.json` - 插件清单
- [ ] `main.js` - 编译后的主文件
- [ ] `styles.css` - 样式文件（即使为空也需要）
- [ ] `README.md` - 文档（中英双语更佳）

### 3. manifest.json 配置检查
```json
{
  "id": "diary-pal",                    // 唯一标识符
  "name": "Diary Pal",                  // 显示名称
  "version": "0.1.0",                   // 版本号
  "minAppVersion": "0.15.0",            // 最低 Obsidian 版本
  "description": "AI-powered diary writing assistant",  // 英文描述
  "author": "Allen",
  "authorUrl": "https://github.com/yourusername",  // 你的 GitHub
  "fundingUrl": "",                     // 可选：赞助链接
  "isDesktopOnly": false                // 是否仅桌面端
}
```

## 📦 发布步骤

### 第 1 步：创建 Release

1. 在 GitHub 仓库页面点击 "Releases"
2. 点击 "Create a new release"
3. 选择 "Choose a tag" → 输入 `0.1.0` → 创建新标签
4. Release title: `0.1.0`
5. 描述：复制 README 的关键内容
6. 上传三个文件：
   - `main.js`
   - `manifest.json`
   - `styles.css`
7. 点击 "Publish release"

### 第 2 步：提交到社区插件列表

1. Fork 官方仓库：`obsidianmd/obsidian-releases`
2. 在你的 fork 中编辑 `community-plugins.json`
3. 在合适的位置（按字母顺序）添加你的插件：

```json
{
  "id": "diary-pal",
  "name": "Diary Pal",
  "author": "Allen",
  "description": "AI-powered diary writing assistant with interview-style questioning and style learning",
  "repo": "yourusername/obsidian-diary-pal"
}
```

4. 提交 Pull Request，标题格式：
   ```
   Add Diary Pal plugin
   ```

### 第 3 步：等待审核

- 通常 1-7 天
- 审核通过后，你的插件会出现在社区插件市场
- 用户可以通过：Settings → Community Plugins → Browse 搜索 "Diary Pal"

## 🔄 后续更新

发布新版本时：
1. 更新 `manifest.json` 中的 `version`
2. 更新 `versions.json`（记录各版本兼容的 Obsidian 版本）
3. 创建新的 GitHub Release
4. 社区插件列表会自动更新（不需要再次 PR）

## 📝 最佳实践

1. **README 要详细** - 包含截图、GIF 演示、使用说明
2. **版本号遵循 SemVer** - 如 `0.1.0`, `0.1.1`, `0.2.0`
3. **处理 Issues** - 及时响应用户反馈
4. **保持更新** - 修复 bug，添加功能

## 🔗 相关链接

- 官方文档：https://docs.obsidian.md/Plugins/Releasing/Submit+your+plugin
- 社区插件列表仓库：https://github.com/obsidianmd/obsidian-releases
- 示例插件：https://github.com/obsidianmd/obsidian-sample-plugin

---

**当前状态**：
- [ ] GitHub 仓库已创建
- [ ] Release 已发布
- [ ] PR 已提交
- [ ] 审核通过已上线
