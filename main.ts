import {
  App,
  Plugin,
  PluginSettingTab,
  Setting,
  WorkspaceLeaf,
  TFile,
  normalizePath,
  moment,
  Notice,
} from 'obsidian';
import { DiaryPalView, VIEW_TYPE_DIARY_PAL } from './src/chat-view';
import { StyleAnalyzer } from './src/style-analyzer';
import { i18n, Language } from './src/i18n';

export interface DiaryPalSettings {
  // LLM 配置
  llmProvider: 'openai' | 'claude' | 'custom';
  apiKey: string;
  apiEndpoint: string;
  modelName: string;
  
  // 日记配置
  diaryFolder: string;
  fileNameFormat: string;
  
  // 文风分析
  analyzedStyle: string;
  soulContent: string;
  lastAnalyzed: number;
  
  // 访谈配置
  questionRounds: number;
  topics: string[];
  
  // 语言设置
  language: Language;
}

// 默认配置
const DEFAULT_SETTINGS: DiaryPalSettings = {
  llmProvider: 'openai',
  apiKey: '',
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  modelName: 'gpt-4o-mini',
  diaryFolder: '日记',
  fileNameFormat: 'YYYY-MM-DD',
  analyzedStyle: '',
  soulContent: '',
  lastAnalyzed: 0,
  questionRounds: 5,
  topics: ['工作', '生活', '情绪', '思考'],
  language: 'auto',
};

export default class DiaryPalPlugin extends Plugin {
  settings: DiaryPalSettings;
  styleAnalyzer: StyleAnalyzer;

  async onload() {
    await this.loadSettings();
    
    // 初始化语言
    i18n.setLanguage(this.settings.language);
    
    this.styleAnalyzer = new StyleAnalyzer(this.app, this.settings);

    // 注册视图
    this.registerView(
      VIEW_TYPE_DIARY_PAL,
      (leaf) => new DiaryPalView(leaf, this)
    );

    // 添加左侧图标
    this.addRibbonIcon('book-heart', i18n.t('plugin.name'), () => {
      this.activateView();
    });

    // 添加命令
    this.addCommand({
      id: 'open-diary-pal',
      name: i18n.t('plugin.name'),
      callback: () => {
        this.activateView();
      },
    });

    this.addCommand({
      id: 'analyze-writing-style',
      name: i18n.t('analysis.title'),
      callback: async () => {
        await this.analyzeStyle();
      },
    });

    this.addCommand({
      id: 'start-diary-session',
      name: i18n.t('button.start'),
      callback: () => {
        this.activateView();
      },
    });

    // 添加设置页
    this.addSettingTab(new DiaryPalSettingTab(this.app, this));

    console.log('Diary Pal 插件已加载');
  }

  onunload() {
    console.log('Diary Pal 插件已卸载');
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  // 激活侧边栏视图
  async activateView() {
    const { workspace } = this.app;
    
    let leaf: WorkspaceLeaf | null = null;
    const leaves = workspace.getLeavesOfType(VIEW_TYPE_DIARY_PAL);
    
    if (leaves.length > 0) {
      leaf = leaves[0];
    } else {
      leaf = workspace.getRightLeaf(false);
      if (!leaf) {
        // 如果无法获取右侧叶子，尝试创建一个新的
        leaf = workspace.getLeaf('split', 'vertical');
      }
      await leaf.setViewState({ type: VIEW_TYPE_DIARY_PAL, active: true });
    }
    
    if (leaf) {
      workspace.revealLeaf(leaf);
    }
  }

  // 分析写作风格
  async analyzeStyle(
    onProgress?: import('./src/style-analyzer').ProgressCallback
  ): Promise<{ style: string; details: string }> {
    const result = await this.styleAnalyzer.analyzeStyle({}, onProgress);
    this.settings.analyzedStyle = result.style;
    this.settings.soulContent = result.soulContent;
    this.settings.lastAnalyzed = Date.now();
    await this.saveSettings();
    return { style: result.style, details: result.details };
  }

  // 获取或更新文风
  async getWritingStyle(): Promise<string> {
    // 如果7天内分析过，直接返回缓存
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    if (this.settings.analyzedStyle && 
        (Date.now() - this.settings.lastAnalyzed) < oneWeek) {
      return this.settings.analyzedStyle;
    }
    
    // 否则重新分析
    const result = await this.analyzeStyle();
    return result.style;
  }

  // 生成日记文件名
  generateFileName(coreSentence: string): string {
    const dateStr = moment().format('YYYY-MM-DD');
    // 清理核心句，移除非法字符
    const cleanSentence = coreSentence
      .replace(/[<>:"/\\|?*]/g, '')       // 移除非法字符
      .replace(/\s+/g, ' ')                // 多个空格合并为一个
      .replace(/^[\s\-_.]+|[\s\-_.]+$/g, '') // 移除开头结尾的空格和符号
      .substring(0, 50)
      .trim();
    
    if (cleanSentence) {
      return `${dateStr} ${cleanSentence}.md`;
    }
    return `${dateStr}.md`;
  }

  // 保存日记
  async saveDiary(content: string, coreSentence: string): Promise<string> {
    const folder = normalizePath(this.settings.diaryFolder);
    const fileName = this.generateFileName(coreSentence);
    const filePath = normalizePath(`${folder}/${fileName}`);

    // 确保文件夹存在
    const folderExists = await this.app.vault.adapter.exists(folder);
    if (!folderExists) {
      await this.app.vault.createFolder(folder);
    }

    // 检查文件是否已存在
    const existingFile = this.app.vault.getAbstractFileByPath(filePath);
    if (existingFile instanceof TFile) {
      // 追加内容
      const existingContent = await this.app.vault.read(existingFile);
      await this.app.vault.modify(existingFile, existingContent + '\n\n---\n\n' + content);
    } else {
      // 创建新文件
      await this.app.vault.create(filePath, content);
    }

    return filePath;
  }
}

// 设置页
class DiaryPalSettingTab extends PluginSettingTab {
  plugin: DiaryPalPlugin;
  private progressBarEl: HTMLElement | null = null;
  private progressTextEl: HTMLElement | null = null;
  private resultContainerEl: HTMLElement | null = null;

  constructor(app: App, plugin: DiaryPalPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl('h2', { text: i18n.t('plugin.name') });

    // ===== LLM 配置区域 =====
    containerEl.createEl('h3', { text: i18n.t('setting.llmProvider') });

    // LLM 提供商
    new Setting(containerEl)
      .setName(i18n.t('setting.llmProvider'))
      .setDesc(i18n.t('setting.llmProviderDesc'))
      .addDropdown(dropdown => dropdown
        .addOption('openai', i18n.t('option.openai'))
        .addOption('claude', i18n.t('option.claude'))
        .addOption('custom', i18n.t('option.custom'))
        .setValue(this.plugin.settings.llmProvider)
        .onChange(async (value) => {
          this.plugin.settings.llmProvider = value as any;
          
          // 自动切换默认 endpoint
          if (value === 'openai') {
            this.plugin.settings.apiEndpoint = 'https://api.openai.com/v1/chat/completions';
            this.plugin.settings.modelName = 'gpt-4o-mini';
          } else if (value === 'claude') {
            this.plugin.settings.apiEndpoint = 'https://api.anthropic.com/v1/messages';
            this.plugin.settings.modelName = 'claude-3-haiku-20240307';
          }
          
          await this.plugin.saveSettings();
          this.display(); // 刷新显示
        }));

    // API Key
    new Setting(containerEl)
      .setName(i18n.t('setting.apiKey'))
      .setDesc(i18n.t('setting.apiKeyDesc'))
      .addText(text => text
        .setPlaceholder('sk-...')
        .setValue(this.plugin.settings.apiKey)
        .onChange(async (value) => {
          this.plugin.settings.apiKey = value;
          await this.plugin.saveSettings();
        }));

    // API Key 安全警告
    const securityWarning = containerEl.createEl('p', {
      text: '⚠️ ' + (i18n.t('setting.securityWarning') || 'API Key 以明文形式存储。请确保您的 Obsidian 配置安全，不要分享包含 API Key 的配置文件。')
    });
    securityWarning.style.fontSize = '12px';
    securityWarning.style.color = 'var(--text-muted)';
    securityWarning.style.marginTop = '-10px';
    securityWarning.style.marginBottom = '15px';

    // API Endpoint
    new Setting(containerEl)
      .setName(i18n.t('setting.apiEndpoint'))
      .setDesc(i18n.t('setting.apiEndpointDesc'))
      .addText(text => text
        .setPlaceholder('https://api.openai.com/v1/chat/completions')
        .setValue(this.plugin.settings.apiEndpoint)
        .onChange(async (value) => {
          this.plugin.settings.apiEndpoint = value;
          await this.plugin.saveSettings();
        }));

    // Model Name
    new Setting(containerEl)
      .setName(i18n.t('setting.modelName'))
      .setDesc(i18n.t('setting.modelNameDesc'))
      .addText(text => text
        .setPlaceholder('gpt-4o-mini')
        .setValue(this.plugin.settings.modelName)
        .onChange(async (value) => {
          this.plugin.settings.modelName = value;
          await this.plugin.saveSettings();
        }));

    // API 测试按钮
    new Setting(containerEl)
      .setName(i18n.t('setting.llmProvider'))
      .setDesc(i18n.t('api.testing'))
      .addButton(button => button
        .setButtonText(i18n.t('button.test'))
        .onClick(async () => {
          await this.testAPIConnection(button, apiTestResultEl);
        }));

    // API 测试结果区域 - 必须在按钮之前定义，以便传递给事件处理
    const apiTestResultEl = containerEl.createDiv('diary-pal-api-test-result');
    apiTestResultEl.style.display = 'none';
    apiTestResultEl.style.margin = '10px 0';
    apiTestResultEl.style.padding = '10px';
    apiTestResultEl.style.borderRadius = '6px';

    // ===== 日记配置区域 =====
    containerEl.createEl('h3', { text: i18n.t('setting.diaryFolder') });

    // 语言设置
    new Setting(containerEl)
      .setName(i18n.t('setting.language'))
      .setDesc(i18n.t('setting.languageDesc'))
      .addDropdown(dropdown => dropdown
        .addOption('auto', i18n.t('option.auto'))
        .addOption('zh', i18n.t('option.zh'))
        .addOption('en', i18n.t('option.en'))
        .setValue(this.plugin.settings.language)
        .onChange(async (value) => {
          this.plugin.settings.language = value as Language;
          i18n.setLanguage(this.plugin.settings.language);
          await this.plugin.saveSettings();
          // 提示刷新
          new Notice(i18n.t('message.restartRequired') || 'Language changed. Please restart Obsidian to apply.');
        }));

    // 日记文件夹
    new Setting(containerEl)
      .setName(i18n.t('setting.diaryFolder'))
      .setDesc(i18n.t('setting.diaryFolderDesc'))
      .addText(text => text
        .setPlaceholder('日记')
        .setValue(this.plugin.settings.diaryFolder)
        .onChange(async (value) => {
          this.plugin.settings.diaryFolder = value;
          await this.plugin.saveSettings();
        }));

    // 访谈轮数
    new Setting(containerEl)
      .setName(i18n.t('setting.questionRounds'))
      .setDesc(i18n.t('setting.questionRoundsDesc'))
      .addSlider(slider => slider
        .setLimits(3, 8, 1)
        .setValue(this.plugin.settings.questionRounds)
        .setDynamicTooltip()
        .onChange(async (value) => {
          this.plugin.settings.questionRounds = value;
          await this.plugin.saveSettings();
        }));

    // ===== 文风分析区域 =====
    containerEl.createEl('h3', { text: i18n.t('analysis.title') });

    // 显示上次分析时间
    if (this.plugin.settings.lastAnalyzed > 0) {
      const lastDate = new Date(this.plugin.settings.lastAnalyzed).toLocaleString();
      containerEl.createEl('p', { 
        text: `${i18n.t('label.lastAnalyzed')}: ${lastDate}`,
        cls: 'setting-item-description'
      });
    }

    // 分批分析选项
    const batchOptionsEl = containerEl.createDiv();
    batchOptionsEl.style.margin = '10px 0';
    batchOptionsEl.style.padding = '10px';
    batchOptionsEl.style.backgroundColor = 'var(--background-secondary)';
    batchOptionsEl.style.borderRadius = '6px';
    
    batchOptionsEl.createEl('strong', { text: i18n.t('analysis.range') });
    const batchDescEl = batchOptionsEl.createEl('p');
    batchDescEl.textContent = i18n.t('analysis.rangeDesc');
    batchDescEl.style.margin = '5px 0';
    batchDescEl.style.fontSize = '13px';
    batchDescEl.style.color = 'var(--text-muted)';
    
    // 单选按钮组
    const radioGroup = batchOptionsEl.createDiv();
    radioGroup.style.display = 'flex';
    radioGroup.style.flexDirection = 'column';
    radioGroup.style.gap = '8px';
    radioGroup.style.marginTop = '10px';
    
    const batchSizes = [
      { value: '10', label: i18n.t('analysis.quick') },
      { value: '20', label: i18n.t('analysis.recommended') },
      { value: '50', label: i18n.t('analysis.detailed') },
      { value: '0', label: i18n.t('analysis.all') }
    ];
    
    let selectedBatchSize = '20'; // 默认
    
    for (const option of batchSizes) {
      const label = radioGroup.createEl('label');
      label.style.display = 'flex';
      label.style.alignItems = 'center';
      label.style.gap = '8px';
      label.style.cursor = 'pointer';
      label.style.fontSize = '13px';
      
      const radio = label.createEl('input');
      radio.type = 'radio';
      radio.name = 'batch-size';
      radio.value = option.value;
      if (option.value === selectedBatchSize) {
        radio.checked = true;
      }
      
      radio.addEventListener('change', () => {
        selectedBatchSize = option.value;
      });
      
      label.appendText(option.label);
    }

    // 分析按钮区域
    const analysisBtnRow = containerEl.createDiv();
    analysisBtnRow.style.display = 'flex';
    analysisBtnRow.style.gap = '10px';
    analysisBtnRow.style.marginTop = '15px';
    
    const startBtn = analysisBtnRow.createEl('button', {
      text: i18n.t('analysis.start'),
      cls: 'diary-pal-btn diary-pal-btn-primary'
    });
    
    // 取消按钮（初始隐藏）
    const cancelBtn = analysisBtnRow.createEl('button', {
      text: i18n.t('button.cancel'),
      cls: 'diary-pal-btn'
    });
    cancelBtn.style.display = 'none';
    cancelBtn.addEventListener('click', () => {
      this.plugin.styleAnalyzer.cancelAnalysis();
      cancelBtn.textContent = i18n.t('label.analyzing');
      cancelBtn.disabled = true;
    });
    
    startBtn.addEventListener('click', async () => {
      const maxDiaries = selectedBatchSize === '0' ? undefined : parseInt(selectedBatchSize);
      await this.runStyleAnalysis(startBtn, { maxDiaries }, cancelBtn);
    });

    // 进度条容器
    const progressContainer = containerEl.createDiv('diary-pal-progress-container');
    progressContainer.style.display = 'none';
    progressContainer.style.margin = '15px 0';
    progressContainer.style.padding = '12px';
    progressContainer.style.backgroundColor = 'var(--background-secondary)';
    progressContainer.style.borderRadius = '6px';
    
    // 提示文本
    const tipEl = progressContainer.createEl('div');
    tipEl.textContent = i18n.t('analysis.warning');
    tipEl.style.fontSize = '12px';
    tipEl.style.color = 'var(--text-muted)';
    tipEl.style.marginBottom = '8px';
    
    // 进度文本
    this.progressTextEl = progressContainer.createEl('div');
    this.progressTextEl.textContent = i18n.t('status.thinking');
    this.progressTextEl.style.fontSize = '14px';
    this.progressTextEl.style.marginBottom = '8px';
    this.progressTextEl.style.fontWeight = '500';
    
    // 进度条
    const progressBarContainer = progressContainer.createDiv();
    progressBarContainer.style.width = '100%';
    progressBarContainer.style.height = '8px';
    progressBarContainer.style.backgroundColor = 'var(--background-modifier-border)';
    progressBarContainer.style.borderRadius = '4px';
    progressBarContainer.style.overflow = 'hidden';
    
    this.progressBarEl = progressBarContainer.createDiv();
    this.progressBarEl.style.width = '0%';
    this.progressBarEl.style.height = '100%';
    this.progressBarEl.style.backgroundColor = 'var(--interactive-accent)';
    this.progressBarEl.style.transition = 'width 0.3s ease';
    
    // 详细信息
    const progressDetailsEl = progressContainer.createEl('div');
    progressDetailsEl.style.marginTop = '8px';
    progressDetailsEl.style.fontSize = '12px';
    progressDetailsEl.style.color = 'var(--text-muted)';
    progressDetailsEl.style.whiteSpace = 'pre-wrap';
    progressDetailsEl.textContent = '';

    // 结果区域
    this.resultContainerEl = containerEl.createDiv('diary-pal-analysis-result');
    this.resultContainerEl.style.display = 'none';
    this.resultContainerEl.style.margin = '15px 0';
    this.resultContainerEl.style.padding = '12px';
    this.resultContainerEl.style.backgroundColor = 'var(--background-secondary)';
    this.resultContainerEl.style.borderRadius = '6px';
    this.resultContainerEl.style.fontSize = '13px';
    this.resultContainerEl.style.lineHeight = '1.6';
    this.resultContainerEl.style.whiteSpace = 'pre-wrap';

    // ===== 文风文档编辑区域 =====
    if (this.plugin.settings.soulContent) {
      this.createSoulEditor(containerEl);
    }
  }

  /**
   * 创建文风文档编辑器
   */
  private createSoulEditor(containerEl: HTMLElement): void {
    const headingEl = containerEl.createEl('h4', { text: i18n.t('soul.title') });
    headingEl.style.marginTop = '20px';
    headingEl.style.marginBottom = '10px';

    const descEl = containerEl.createEl('p', {
      text: i18n.t('soul.desc')
    });
    descEl.style.fontSize = '13px';
    descEl.style.color = 'var(--text-muted)';
    descEl.style.marginBottom = '10px';

    // 编辑器容器
    const editorContainer = containerEl.createDiv();
    editorContainer.style.marginBottom = '15px';

    // 文本域
    const textarea = editorContainer.createEl('textarea');
    textarea.value = this.plugin.settings.soulContent;
    textarea.style.width = '100%';
    textarea.style.minHeight = '300px';
    textarea.style.padding = '10px';
    textarea.style.border = '1px solid var(--background-modifier-border)';
    textarea.style.borderRadius = '6px';
    textarea.style.backgroundColor = 'var(--background-primary)';
    textarea.style.color = 'var(--text-normal)';
    textarea.style.fontFamily = 'var(--font-monospace)';
    textarea.style.fontSize = '13px';
    textarea.style.lineHeight = '1.6';
    textarea.style.resize = 'vertical';

    // 按钮行
    const buttonRow = containerEl.createDiv();
    buttonRow.style.display = 'flex';
    buttonRow.style.gap = '10px';
    buttonRow.style.marginTop = '10px';

    // 保存按钮
    const saveBtn = buttonRow.createEl('button', {
      text: i18n.t('soul.save'),
      cls: 'diary-pal-btn diary-pal-btn-primary'
    });
    saveBtn.addEventListener('click', async () => {
      this.plugin.settings.soulContent = textarea.value;
      await this.plugin.saveSettings();
      
      // 显示保存成功提示
      const notice = containerEl.createEl('div', { text: '✅ ' + i18n.t('soul.saved') });
      notice.style.color = 'var(--text-success)';
      notice.style.fontSize = '13px';
      notice.style.marginTop = '5px';
      setTimeout(() => notice.remove(), 2000);
    });

    // 重置按钮
    const resetBtn = buttonRow.createEl('button', {
      text: i18n.t('soul.reset'),
      cls: 'diary-pal-btn'
    });
    resetBtn.addEventListener('click', async () => {
      if (confirm(i18n.t('message.resetConfirm') || '确定要重置为默认文风吗？这将丢失当前的自定义内容。')) {
        this.plugin.settings.soulContent = this.getDefaultSoulContent();
        await this.plugin.saveSettings();
        textarea.value = this.plugin.settings.soulContent;
      }
    });

    // 导出按钮
    const exportBtn = buttonRow.createEl('button', {
      text: i18n.t('soul.export'),
      cls: 'diary-pal-btn'
    });
    exportBtn.addEventListener('click', async () => {
      try {
        const filePath = await this.exportSoulToFile();
        const notice = containerEl.createEl('div', { text: `✅ ${i18n.t('soul.exported', { path: filePath })}` });
        notice.style.color = 'var(--text-success)';
        notice.style.fontSize = '13px';
        notice.style.marginTop = '5px';
        setTimeout(() => notice.remove(), 3000);
      } catch (e: any) {
        const notice = containerEl.createEl('div', { text: `❌ ${i18n.t('soul.exportFailed', { message: e.message })}` });
        notice.style.color = 'var(--text-error)';
        notice.style.fontSize = '13px';
        notice.style.marginTop = '5px';
        setTimeout(() => notice.remove(), 3000);
      }
    });
  }

  /**
   * 获取默认文风文档
   */
  private getDefaultSoulContent(): string {
    return `# 用户写作风格指南

## 核心特征
- 口语化表达，像说话一样写
- 短句为主，断句简洁自然
- 真实记录，不刻意修饰

## 句式习惯
- 使用短句，每句15-25字左右
- 断句随意，不强求完整语法
- 用句号、逗号自然分隔

## 词汇偏好
- 使用日常口语词汇（哈哈、呃、吧、呢）
- 避免过于书面化的表达
- 适当使用语气词表达情绪

## 结构模式
- 按时间或主题自然分段
- 段落间空一行
- 不使用结构化标题

## 情绪与语气
- 真实自然，不掩饰情绪
- 可适当自嘲或调侃
- 不升华总结，不抒情

## 独特标识
- 无特定标识

## 生成日记时的要求
1. 严格使用短句，断句随意
2. 使用口语化表达，像和未来的自己聊天
3. 不使用emoji和装饰性符号
4. 不使用结构化标题（如 ## 今日事记）
5. 段落间空一行
6. 真实记录，不升华不总结
7. 可以适当使用语气词（哈哈、呃、吧等）
`;
  }

  /**
   * 导出文风文档为文件
   */
  private async exportSoulToFile(): Promise<string> {
    const folder = 'diary-pal';
    const fileName = 'writing-style.md';
    const filePath = normalizePath(`${folder}/${fileName}`);

    // 确保文件夹存在
    const folderExists = await this.plugin.app.vault.adapter.exists(folder);
    if (!folderExists) {
      await this.plugin.app.vault.createFolder(folder);
    }

    const content = `# 我的写作风格指南

*由 Diary Pal 插件生成*

---

${this.plugin.settings.soulContent}

---

*上次更新: ${new Date().toLocaleString()}*
`;

    const existingFile = this.plugin.app.vault.getAbstractFileByPath(filePath);
    if (existingFile instanceof TFile) {
      await this.plugin.app.vault.modify(existingFile, content);
    } else {
      await this.plugin.app.vault.create(filePath, content);
    }

    return filePath;
  }

  /**
   * 测试 API 连通性
   */
  private async testAPIConnection(button: any, resultEl: HTMLElement): Promise<void> {
    button.setButtonText(i18n.t('status.testing') || '测试中...');
    button.setDisabled(true);

    resultEl.style.display = 'block';
    resultEl.textContent = i18n.t('status.testingApi') || '正在测试 API 连通性...';
    resultEl.style.backgroundColor = 'var(--background-secondary)';
    resultEl.style.color = 'var(--text-normal)';

    try {
      const response = await fetch(this.plugin.settings.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.plugin.settings.apiKey}`,
        },
        body: JSON.stringify({
          model: this.plugin.settings.modelName,
          messages: [{ role: 'user', content: '你好' }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        resultEl.textContent = '✅ API 连接成功！配置正确。';
        resultEl.style.backgroundColor = 'rgba(0, 200, 0, 0.1)';
        resultEl.style.color = 'var(--text-success)';
      } else {
        const errorText = await response.text();
        let errorMsg = `❌ API 连接失败 (${response.status})`;
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error?.message) {
            errorMsg += `\n错误信息: ${errorJson.error.message}`;
          }
        } catch {
          errorMsg += `\n响应: ${errorText.substring(0, 200)}`;
        }
        
        resultEl.textContent = errorMsg;
        resultEl.style.backgroundColor = 'rgba(200, 0, 0, 0.1)';
        resultEl.style.color = 'var(--text-error)';
      }
    } catch (error: any) {
      resultEl.textContent = `❌ 连接错误: ${error.message}\n\n请检查:\n1. API Key 是否正确\n2. API 地址是否可访问\n3. 网络连接是否正常`;
      resultEl.style.backgroundColor = 'rgba(200, 0, 0, 0.1)';
      resultEl.style.color = 'var(--text-error)';
    } finally {
      button.setButtonText('测试连接');
      button.setDisabled(false);
    }
  }

  /**
   * 运行文风分析
   */
  private async runStyleAnalysis(
    button: HTMLElement, 
    options: { maxDiaries?: number } = {},
    cancelBtn?: HTMLElement
  ): Promise<void> {
    const progressContainer = this.containerEl.querySelector('.diary-pal-progress-container') as HTMLElement;
    const progressDetailsEl = progressContainer.querySelector('div:last-child') as HTMLElement;
    
    // 保存原始按钮文本
    const originalText = button.textContent || '开始分析';
    
    button.textContent = '分析中...';
    button.setAttribute('disabled', 'true');
    button.style.opacity = '0.6';
    progressContainer.style.display = 'block';
    
    if (cancelBtn) {
      cancelBtn.style.display = 'inline-block';
      cancelBtn.textContent = '取消分析';
      cancelBtn.removeAttribute('disabled');
    }
    
    if (this.resultContainerEl) {
      this.resultContainerEl.style.display = 'none';
      this.resultContainerEl.textContent = '';
    }

    try {
      const result = await this.plugin.styleAnalyzer.analyzeStyle(
        options,
        (progress) => {
          // 更新进度条
          if (this.progressBarEl) {
            this.progressBarEl.style.width = `${progress.progress}%`;
          }
          if (this.progressTextEl) {
            this.progressTextEl.textContent = progress.message;
          }
          if (progressDetailsEl) {
            progressDetailsEl.textContent = progress.details || '';
          }
          
          // 处理完成/取消/错误状态
          if (this.resultContainerEl) {
            if (progress.stage === 'complete') {
              this.resultContainerEl.style.display = 'block';
              this.resultContainerEl.textContent = progress.details || '分析完成';
              this.resultContainerEl.style.backgroundColor = 'var(--background-secondary)';
            } else if (progress.stage === 'cancelled') {
              this.resultContainerEl.style.display = 'block';
              this.resultContainerEl.textContent = progress.details || '分析已取消';
              this.resultContainerEl.style.backgroundColor = 'rgba(255, 193, 7, 0.1)';
            } else if (progress.stage === 'error') {
              this.resultContainerEl.style.display = 'block';
              this.resultContainerEl.textContent = progress.details || '分析失败';
              this.resultContainerEl.style.backgroundColor = 'rgba(200, 0, 0, 0.1)';
            }
          }
        }
      );

      // 保存结果
      this.plugin.settings.analyzedStyle = result.style;
      this.plugin.settings.soulContent = result.soulContent;
      this.plugin.settings.lastAnalyzed = Date.now();
      await this.plugin.saveSettings();

      button.textContent = result.wasCancelled ? '已取消' : '分析完成';
      
      // 2秒后刷新页面
      setTimeout(() => {
        this.display();
      }, 2000);
      
    } catch (error: any) {
      button.textContent = '分析失败';
      if (this.resultContainerEl) {
        this.resultContainerEl.style.display = 'block';
        this.resultContainerEl.textContent = `❌ 分析失败: ${error.message}`;
        this.resultContainerEl.style.backgroundColor = 'rgba(200, 0, 0, 0.1)';
        this.resultContainerEl.style.color = 'var(--text-error)';
      }
    } finally {
      if (cancelBtn) {
        cancelBtn.style.display = 'none';
      }
      setTimeout(() => {
        button.textContent = originalText;
        button.removeAttribute('disabled');
        button.style.opacity = '1';
      }, 2000);
    }
  }
}
