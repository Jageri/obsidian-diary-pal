# Diary Pal - 日记伴侣

一个 Obsidian 插件，通过 AI 访谈式提问，学习你的写作风格，帮你完成每日日记。

English | [中文](#中文文档)

---

## ✨ Features

- 🤖 **AI Interview**: Guide you through daily reflection with gentle questions
- 📝 **Style Learning**: Analyze your diary history to mimic your writing style
- 🌍 **Bilingual**: Full support for Chinese and English
- 💬 **Sidebar Chat**: Complete conversations directly in Obsidian sidebar
- 📂 **Auto Save**: Save diary entries to your designated folder
- ✏️ **Editable Style**: Fine-tune the AI-generated writing style guide
- 🔒 **Privacy First**: Style analysis done locally, your data stays with you

## 📦 Installation

### Manual Install

1. Download `main.js`, `manifest.json`, `styles.css` from latest release
2. Create folder `.obsidian/plugins/diary-pal/` in your Obsidian Vault
3. Copy the three files to that folder
4. Restart Obsidian and enable "Diary Pal" in Settings → Community Plugins

### From Obsidian Community Plugin Store (Pending)

Coming soon...

## ⚙️ Configuration

### LLM Setup

1. Open Settings → Diary Pal
2. Select LLM Provider (OpenAI / Claude / Custom)
3. Enter API Key and model name
4. Set diary save folder (default: "日记" or "Diary")
5. Choose language (Auto / Chinese / English)
6. Click "Analyze Writing Style"

### Supported LLMs

- **OpenAI**: gpt-4o-mini, gpt-4o, etc.
- **Claude**: claude-3-haiku, claude-3-sonnet, etc.
- **Custom**: Any OpenAI-compatible API (Kimi, DeepSeek, etc.)

## 🚀 Usage

### Start a Diary Entry

1. Click the 📖 icon in the left sidebar, or press `Ctrl+P` and type "Open Diary Pal"
2. Chat with AI in the sidebar, answer its questions
3. Click "Finish & Generate Diary" when ready
4. The diary is automatically saved and opened for editing

### Style Analysis

The plugin analyzes your diary history using **iterative refinement**:
- Reads your existing diaries in batches
- Gradually refines the style understanding
- Generates an editable style guide (like SOUL.md)
- You can customize the style guide at any time

**Analysis Options**:
- Last 10 entries (Quick preview)
- Last 20 entries (Recommended)
- Last 50 entries (Detailed)
- All entries (Most accurate, slower)

### Features

**Smart Question Flow**:
- Base rounds: 5-8 questions (configurable)
- Can continue chatting beyond base rounds (up to 1.5x)
- Natural prompts to finish when chat is sufficient

**Retry on Failure**:
- If API fails, shows "Retry" button
- Auto-retry if generated content is incomplete

**Session Persistence**:
- Conversations are saved automatically
- Resume where you left off after restart

## 📝 Diary Format

Generated diaries mimic your natural writing style:

```
Today I finally finished cleaning the windows. The robot did an okay job, but at least it's done.

Had dinner at grandma's tonight. Haven't been there in a while. Since grandpa passed, grandma talks more—probably lonely sitting there alone.

Posted on Xiaohongshu about how the festive atmosphere is created by adults, and now it's our turn.

Tomorrow is New Year's Eve. Have a good one, haha.
```

**Characteristics**:
- Conversational, short sentences
- No emojis or structured headers
- Natural and authentic, like you wrote it

## 🌍 Internationalization

The plugin supports:
- **Auto-detect**: Follows Obsidian's interface language
- **Chinese**: Full Simplified Chinese support
- **English**: Full English support

Switch language in Settings → Diary Pal → Language (restart required).

## 🔧 Development

```bash
# Clone repo
git clone https://github.com/yourusername/obsidian-diary-pal.git
cd obsidian-diary-pal

# Install dependencies
npm install

# Dev mode (auto-compile)
npm run dev

# Build production
npm run build
```

## 📄 File Structure

```
obsidian-diary-pal/
├── main.ts                 # Plugin entry
├── manifest.json           # Plugin manifest
├── styles.css             # Styles
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── esbuild.config.mjs     # Build config
├── src/
│   ├── chat-view.ts       # Sidebar chat UI
│   ├── llm-client.ts      # LLM API client
│   ├── style-analyzer.ts  # Style analyzer (iterative)
│   └── i18n/              # Internationalization
│       ├── index.ts
│       ├── zh.ts          # Chinese
│       └── en.ts          # English
└── README.md
```

## 🤝 Contributing

Issues and PRs welcome!

## 📜 License

MIT License

## 💡 Credits

Inspired by [OpenClaw](https://github.com/openclaw/openclaw)'s diary companion workflow.

---

## 中文文档

见上方英文文档，功能相同。主要特点：

- 支持中英双语界面
- 渐进式文风分析（分批读取日记，逐步完善理解）
- 可编辑的文风文档
- 智能对话流程（基础轮次后可继续聊，1.5倍后提示结束）
- 自动保存并打开文件
- 失败重试机制
- 会话持久化
