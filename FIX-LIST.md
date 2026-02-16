# 代码修复清单 - 基于 Obsidian 插件指南

## 🔴 必须修复

### 1. 移除 console.log
**位置：** main.ts 第 107, 111 行
```typescript
console.log('Diary Pal 插件已加载');
console.log('Diary Pal 插件已卸载');
```
**修复：** 删除这两行

### 2. 移除设置页顶层 h2 标题
**位置：** main.ts 第 242 行
```typescript
containerEl.createEl('h2', { text: i18n.t('plugin.name') });
```
**修复：** 删除这一行（Obsidian 设置标签页本身已显示插件名称）

### 3. 替换 Vault.modify 为 Vault.process
**位置：** main.ts 第 210 行
```typescript
await this.app.vault.modify(existingFile, existingContent + '\n\n---\n\n' + content);
```
**修复：** 使用 Vault.process（原子操作，避免冲突）

### 4. 避免使用 vault.adapter
**位置：** main.ts 第 200 行, 第 674 行
```typescript
await this.app.vault.adapter.exists(folder);
```
**修复：** 使用 `getAbstractFileByPath` 检查文件夹是否存在

### 5. 避免遍历所有文件
**位置：** style-analyzer.ts 第 99 行
```typescript
const allFiles = this.app.vault.getFiles();
```
**问题：** 在大仓库中效率低
**修复：** 如果可能，使用更高效的文件获取方式

## 🟡 建议修复（提升质量）

### 6. 减少硬编码样式
**位置：** chat-view.ts 多处
```typescript
el.style.padding = '15px';
el.style.backgroundColor = 'var(--background-secondary)';
```
**建议：** 将样式移到 styles.css，使用 CSS 类

### 7. 检查 var/let 使用
**建议：** 优先使用 const，必要时用 let，避免 var

## 📋 修复优先级

**P0（提交前必须修复）：**
1. console.log
2. 设置页 h2 标题
3. Vault.modify → Vault.process
4. vault.adapter → Vault API

**P1（建议修复）：**
5. getFiles() 优化
6. 硬编码样式整理

## 🔧 修复后的提交

修复完成后：
```bash
git add .
git commit -m "Fix code quality issues per Obsidian plugin guidelines"
git push origin main
```

然后更新 GitHub Release（删除旧的，创建新的，或创建 0.1.1 版本）
