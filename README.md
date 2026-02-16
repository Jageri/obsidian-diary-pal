# Diary Pal - 日记伴侣

> 不知道怎么写日记？让 AI 通过对话引导你，然后自动整理成一篇像你亲笔写的日记。

[English](#quick-start) | [中文](#快速开始)

---

## 🚀 Quick Start (3 Steps)

### 1. Configure
Open Settings → Diary Pal → Enter your OpenAI/Claude API Key → Click "Test Connection"

### 2. Analyze Your Style
Click "Analyze Writing Style" to let AI learn how you write (reads your existing diaries)

### 3. Start Writing
Click the 📖 icon in sidebar → Chat with AI → Click "Finish & Generate" → Done! Your diary is saved.

**That's it.** The AI asks you questions, you answer naturally, and it writes the diary for you—in your own style.

---

## 快速开始（3步）

### 1. 配置
打开设置 → Diary Pal → 填入 OpenAI/Claude API Key → 点击"测试连接"

### 2. 分析文风
点击"开始分析"让 AI 学习你的写作方式（会读取你已有的日记）

### 3. 开始记录
点击侧边栏 📖 图标 → 和 AI 对话 → 点击"结束并生成" → 完成！日记已保存。

**就这么简单。** AI 提问，你自然回答，然后它帮你写成日记——用你的文风。

---

## ✨ What You Get

| Before | After |
|--------|-------|
| Staring at blank page, don't know what to write | AI asks you questions, just chat naturally |
| Writing feels like a chore | 5-min conversation becomes a diary |
| Diary sounds robotic | Matches YOUR writing style (short sentences, casual tone, etc.) |
| Forgetting what happened today | AI guides you to recall details |

## 你能得到什么

| 以前 | 现在 |
|------|------|
| 盯着空白页面不知道写什么 | AI 问你问题，自然聊天就好 |
| 写日记像完成任务 | 5分钟对话变成一篇日记 |
| 写出的东西像机器人 | 匹配你的文风（短句、口语化等） |
| 忘记今天发生了什么 | AI 引导你回忆细节 |

---

## 📖 How It Works

1. **Interview Mode** - AI asks 5-8 gentle questions about your day
2. **Style Learning** - Analyzes your past diaries to match your tone
3. **Auto Generate** - Transforms conversation into a diary entry
4. **Save & Edit** - Auto-saved to your vault, open and edit if needed

## 工作流程

1. **访谈模式** - AI 问你 5-8 个关于今天的问题
2. **文风学习** - 分析你过去的日记，匹配你的语气
3. **自动生成** - 把对话转换成日记正文
4. **保存编辑** - 自动保存到仓库，可打开修改

---

## 🛠️ Detailed Setup

### Requirements
- Obsidian v0.15.0+
- OpenAI, Claude, or compatible API key

### Installation

**Manual Install:**
1. Download `main.js`, `manifest.json`, `styles.css` from [GitHub Releases](https://github.com/Jageri/obsidian-diary-pal/releases)
2. Copy to `.obsidian/plugins/diary-pal/`
3. Restart Obsidian → Enable "Diary Pal" in Community Plugins

**From Community Plugin Store (Pending):**
Coming soon...

### Configuration

1. **Settings → Diary Pal**
2. **Choose LLM Provider**: OpenAI / Claude / Custom
3. **Enter API Key**: Your key (stored locally only)
4. **Test Connection**: Verify it works
5. **Analyze Writing Style**: Let AI learn your style (takes 1-2 minutes)

### Supported LLMs
- OpenAI: gpt-4o-mini, gpt-4o, etc.
- Claude: claude-3-haiku, claude-3-sonnet, etc.
- Custom: Any OpenAI-compatible API

---

## 🌍 Language Support

- **Auto-detect**: Follows Obsidian's language
- **中文**: Full Simplified Chinese support
- **English**: Full English support

Switch in Settings → Diary Pal → Language (restart required).

---

## 📝 Example Output

### Your conversation with AI:
```
AI: What happened today?
You: Fixed a bug at work, took 3 hours
AI: How did you feel when you finally solved it?
You: Relieved but tired
AI: Anything else worth noting?
You: Had great ramen for dinner
```

### Generated diary:
```
Spent 3 hours fixing a bug today. Finally solved it—felt relieved but drained.

Dinner was a highlight. Great ramen, hit the spot.
```

**Characteristics:**
- Short, conversational sentences
- No emojis or structured headers
- Sounds like you wrote it yourself

---

## 🔒 Privacy

- API Key stored locally (plain text, keep your config safe)
- Diary analysis done locally (your data never leaves your device)
- Only API calls go to your chosen LLM provider

---

## 🔧 Development

```bash
git clone https://github.com/Jageri/obsidian-diary-pal.git
cd obsidian-diary-pal
npm install
npm run dev    # Development mode
npm run build  # Production build
```

---

## 🤝 Contributing

Issues and PRs welcome!

---

## 📜 License

MIT License - see [LICENSE](LICENSE)

---

## 💡 Credits

Inspired by [OpenClaw](https://github.com/openclaw/openclaw)'s diary companion workflow.

---

**Ready to start?** [Go to Quick Start](#quick-start) or [快速开始](#快速开始)
