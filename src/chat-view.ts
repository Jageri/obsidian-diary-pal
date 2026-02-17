import { 
  ItemView, 
  WorkspaceLeaf, 
  Notice,
  TFile,
} from 'obsidian';
import DiaryPalPlugin from '../main';
import { LLMClient } from './llm-client';
import { i18n } from './i18n';

export const VIEW_TYPE_DIARY_PAL = 'diary-pal-view';

interface ConversationSession {
  history: { question: string; answer: string }[];
  currentRound: number;
  timestamp: number;
}

export class DiaryPalView extends ItemView {
  plugin: DiaryPalPlugin;
  llmClient: LLMClient;
  
  private conversationHistory: { question: string; answer: string }[] = [];
  private currentRound: number = 0;
  private isGenerating: boolean = false;
  private isViewClosed: boolean = false;
  private messagesContainer: HTMLElement;
  private inputContainer: HTMLElement;
  private sessionKey: string = 'diary-pal-current-session';

  constructor(leaf: WorkspaceLeaf, plugin: DiaryPalPlugin) {
    super(leaf);
    this.plugin = plugin;
    this.llmClient = new LLMClient(plugin.settings);
  }

  getViewType(): string {
    return VIEW_TYPE_DIARY_PAL;
  }

  getDisplayText(): string {
    return i18n.t('plugin.name');
  }

  getIcon(): string {
    return 'book-heart';
  }

  async onOpen() {
    this.isViewClosed = false;
    this.containerEl.empty();
    this.containerEl.addClass('diary-pal-container');

    this.createHeader();
    this.messagesContainer = this.containerEl.createDiv('diary-pal-messages');
    this.inputContainer = this.containerEl.createDiv('diary-pal-input-container');

    // 延迟加载会话，避免阻塞初始化
    setTimeout(async () => {
      if (this.isViewClosed) return;
      try {
        const saved = await this.loadSession();
        if (this.isViewClosed) return;
        if (saved && saved.history.length > 0) {
          this.conversationHistory = saved.history;
          this.currentRound = saved.currentRound;
          this.restoreSessionUI();
        } else {
          await this.startNewSession();
        }
      } catch (e) {
        console.error('加载会话失败:', e);
        if (!this.isViewClosed) {
          await this.startNewSession();
        }
      }
    }, 100);
  }

  async onClose() {
    this.isViewClosed = true;
    // 保存当前会话
    if (this.conversationHistory.length > 0) {
      await this.saveSession();
    }
  }

  private async saveSession() {
    const session: ConversationSession = {
      history: this.conversationHistory,
      currentRound: this.currentRound,
      timestamp: Date.now()
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
  }

  private async loadSession(): Promise<ConversationSession | null> {
    const saved = localStorage.getItem(this.sessionKey);
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  }

  private clearSession() {
    localStorage.removeItem(this.sessionKey);
  }

  private restoreSessionUI() {
    this.messagesContainer.empty();
    this.addMessage('assistant', '欢迎回来，点击继续上次的对话~');
    
    // 恢复历史消息显示（只显示摘要）
    const summaryText = `已有 ${this.conversationHistory.length} 条对话记录`;
    this.addMessage('assistant', summaryText);
    
    // 显示继续按钮
    this.inputContainer.empty();
    const buttonRow = this.inputContainer.createDiv('diary-pal-button-row');
    
    const continueBtn = buttonRow.createEl('button', {
      text: '继续对话',
      cls: 'diary-pal-btn diary-pal-btn-primary'
    });
    continueBtn.style.padding = '10px 24px';
    continueBtn.style.fontSize = '14px';
    continueBtn.addEventListener('click', async () => {
      // 显示完整历史
      this.messagesContainer.empty();
      for (const item of this.conversationHistory) {
        this.addMessage('assistant', item.question);
        this.addMessage('user', item.answer || '(跳过)');
      }
      this.inputContainer.empty();
      await this.askQuestion();
    });
    
    const restartBtn = buttonRow.createEl('button', {
      text: '重新开始',
      cls: 'diary-pal-btn'
    });
    restartBtn.addEventListener('click', () => {
      this.confirmNewSession();
    });
  }

  private createHeader() {
    const header = this.containerEl.createDiv('diary-pal-header');
    const title = header.createEl('h3', { text: i18n.t('plugin.name') });
    const actions = header.createDiv('diary-pal-actions');
    
    const newChatBtn = actions.createEl('button', {
      text: i18n.t('button.newChat'),
      cls: 'diary-pal-btn',
    });
    newChatBtn.addEventListener('click', () => this.confirmNewSession());

    const finishBtn = actions.createEl('button', {
      text: i18n.t('button.finish'),
      cls: 'diary-pal-btn diary-pal-btn-primary',
    });
    finishBtn.addEventListener('click', () => this.finishAndGenerate());
  }

  private confirmNewSession() {
    if (this.conversationHistory.length === 0) {
      this.startNewSession();
      return;
    }

    this.inputContainer.empty();
    const confirmDiv = this.inputContainer.createDiv();
    confirmDiv.style.padding = '15px';
    confirmDiv.style.backgroundColor = 'var(--background-secondary)';
    confirmDiv.style.borderRadius = '8px';
    confirmDiv.style.marginBottom = '10px';
    
    const confirmText = confirmDiv.createEl('p');
    confirmText.textContent = i18n.t('message.restartConfirm', { count: this.conversationHistory.length });
    confirmText.style.margin = '0 0 10px 0';
    confirmText.style.fontSize = '14px';

    const btnRow = confirmDiv.createDiv();
    btnRow.style.display = 'flex';
    btnRow.style.gap = '10px';

    const cancelBtn = btnRow.createEl('button', {
      text: i18n.t('button.cancel'),
      cls: 'diary-pal-btn'
    });
    cancelBtn.addEventListener('click', () => {
      this.inputContainer.empty();
      this.showCurrentInput();
    });

    const confirmBtn = btnRow.createEl('button', {
      text: i18n.t('button.confirm'),
      cls: 'diary-pal-btn diary-pal-btn-primary'
    });
    confirmBtn.style.backgroundColor = 'var(--text-error)';
    confirmBtn.addEventListener('click', () => {
      this.clearSession();
      this.startNewSession();
    });
  }

  private showCurrentInput() {
    // 根据当前状态重新显示输入
    if (this.currentRound === 0) {
      this.askQuestion();
    } else {
      this.askQuestion();
    }
  }

  private async startNewSession() {
    this.conversationHistory = [];
    this.currentRound = 0;
    this.messagesContainer.empty();
    this.clearSession();
    
    this.addMessage('assistant', i18n.t('message.welcome'));
    this.showStartButton();
  }

  private showStartButton() {
    this.inputContainer.empty();
    
    // 检查 API 是否配置
    if (!this.plugin.settings.apiKey) {
      this.showConfigPrompt(i18n.t('message.noApiConfig'));
      return;
    }
    
    // 检查是否已分析文风
    if (!this.plugin.settings.analyzedStyle) {
      this.showConfigPrompt(i18n.t('message.noStyle'));
      return;
    }
    
    const buttonRow = this.inputContainer.createDiv('diary-pal-button-row');
    
    const startBtn = buttonRow.createEl('button', {
      text: i18n.t('button.start'),
      cls: 'diary-pal-btn diary-pal-btn-primary'
    });
    startBtn.style.padding = '10px 24px';
    startBtn.style.fontSize = '14px';
    startBtn.addEventListener('click', async () => {
      this.inputContainer.empty();
      await this.askQuestion();
    });
  }
  
  private showConfigPrompt(message: string) {
    this.inputContainer.empty();
    const promptDiv = this.inputContainer.createDiv();
    promptDiv.style.padding = '15px';
    promptDiv.style.backgroundColor = 'var(--background-secondary)';
    promptDiv.style.borderRadius = '8px';
    promptDiv.style.marginBottom = '10px';
    
    const promptText = promptDiv.createEl('p');
    promptText.textContent = message;
    promptText.style.margin = '0';
    promptText.style.fontSize = '14px';
    promptText.style.lineHeight = '1.6';
    
    const btnRow = promptDiv.createDiv();
    btnRow.style.display = 'flex';
    btnRow.style.gap = '10px';
    btnRow.style.marginTop = '15px';
    
    const settingsBtn = btnRow.createEl('button', {
      text: i18n.t('button.settings') || '打开设置',
      cls: 'diary-pal-btn diary-pal-btn-primary'
    });
    settingsBtn.addEventListener('click', () => {
      // @ts-ignore
      this.app.setting.open();
      // @ts-ignore
      this.app.setting.openTabById('diary-pal');
    });
  }

  private async askQuestion() {
    if (this.isGenerating) return;
    
    this.isGenerating = true;
    this.showLoading(i18n.t('status.thinking'));

    try {
      const styleDescription = await this.plugin.getWritingStyle();
      
      // 获取当前轮次（用于提示词）
      const nextRound = this.currentRound + 1;
      const totalRounds = this.plugin.settings.questionRounds;
      
      const question = await this.llmClient.generateQuestion(
        styleDescription,
        nextRound,
        totalRounds,
        this.conversationHistory.map(h => h.answer)
      );

      // API 成功后才增加计数
      this.currentRound = nextRound;
      await this.saveSession();

      this.hideLoading();
      this.addMessage('assistant', question);
      this.showInput(question);
    } catch (error) {
      this.hideLoading();
      this.addMessage('error', `出错了: ${error.message}`);
      this.showRetryButton('重试提问', () => this.askQuestion());
    } finally {
      this.isGenerating = false;
    }
  }

  private showInput(question: string) {
    this.inputContainer.empty();

    const textarea = this.inputContainer.createEl('textarea', {
      placeholder: i18n.t('message.inputPlaceholder') || '输入你的回答...',
      cls: 'diary-pal-textarea',
    });

    const buttonRow = this.inputContainer.createDiv('diary-pal-button-row');

    const skipBtn = buttonRow.createEl('button', {
      text: i18n.t('button.skip'),
      cls: 'diary-pal-btn',
    });
    skipBtn.addEventListener('click', () => {
      this.handleUserResponse(question, '');
    });

    const sendBtn = buttonRow.createEl('button', {
      text: i18n.t('button.send'),
      cls: 'diary-pal-btn diary-pal-btn-primary',
    });
    sendBtn.addEventListener('click', () => {
      const value = textarea.value.trim();
      this.handleUserResponse(question, value);
    });

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const value = textarea.value.trim();
        this.handleUserResponse(question, value);
      }
    });

    textarea.focus();
  }

  private async handleUserResponse(question: string, answer: string) {
    this.conversationHistory.push({ question, answer });
    await this.saveSession();
    
    this.addMessage('user', answer || `(${i18n.t('button.skip')})`);
    this.inputContainer.empty();

    const totalRounds = this.plugin.settings.questionRounds;
    
    // 只在 n, 2n, 4n 轮次提示结束，之后不再提示
    if (this.currentRound === totalRounds || 
        this.currentRound === totalRounds * 2 || 
        this.currentRound === totalRounds * 4) {
      if (this.currentRound === totalRounds) {
        // 第一轮结束提示（温和）
        this.addMessage('assistant', i18n.t('message.basicDone', { current: this.currentRound, total: totalRounds }));
      } else if (this.currentRound === totalRounds * 2) {
        // 第二轮结束提示（更主动）
        this.addMessage('assistant', i18n.t('message.enoughChat', { current: this.currentRound }));
      } else {
        // 4n 轮次，最后一次提示
        this.addMessage('assistant', i18n.t('message.lastChance', { current: this.currentRound }));
      }
      this.showContinueOrFinish();
    } else {
      await this.askQuestion();
    }
  }

  private showContinueOrFinish() {
    const buttonRow = this.inputContainer.createDiv('diary-pal-button-row');

    const continueBtn = buttonRow.createEl('button', {
      text: i18n.t('button.continue'),
      cls: 'diary-pal-btn',
    });
    continueBtn.addEventListener('click', async () => {
      this.inputContainer.empty();
      await this.askQuestion();
    });

    const finishBtn = buttonRow.createEl('button', {
      text: i18n.t('button.finish'),
      cls: 'diary-pal-btn diary-pal-btn-primary',
    });
    finishBtn.addEventListener('click', () => {
      this.finishAndGenerate();
    });
  }

  private showFinishOptions() {
    this.inputContainer.empty();
    const buttonRow = this.inputContainer.createDiv('diary-pal-button-row');

    const continueBtn = buttonRow.createEl('button', {
      text: i18n.t('button.continue'),
      cls: 'diary-pal-btn',
    });
    continueBtn.addEventListener('click', async () => {
      this.addMessage('user', i18n.t('button.continue'));
      this.inputContainer.empty();
      await this.askQuestion();
    });

    const finishBtn = buttonRow.createEl('button', {
      text: i18n.t('button.finish'),
      cls: 'diary-pal-btn diary-pal-btn-primary',
    });
    finishBtn.addEventListener('click', () => {
      this.finishAndGenerate();
    });
  }

  private async finishAndGenerate(retryCount: number = 0) {
    if (this.conversationHistory.length === 0) {
      new Notice(i18n.t('message.noContent'));
      return;
    }

    this.isGenerating = true;
    this.addMessage('assistant', i18n.t('message.generating'));
    this.showLoading(i18n.t('status.generating'));

    try {
      const styleDescription = await this.plugin.getWritingStyle();
      
      const { content, coreSentence } = await this.llmClient.generateDiary(
        styleDescription,
        this.conversationHistory
      );

      this.hideLoading();

      // 检查生成的内容是否完整
      if (!this.isContentComplete(content) && retryCount < 2) {
        this.addMessage('assistant', i18n.t('message.generationIncomplete'));
        await this.finishAndGenerate(retryCount + 1);
        return;
      }

      // 直接保存并打开
      await this.saveAndOpenDiary(content, coreSentence);

    } catch (error) {
      this.hideLoading();
      this.addMessage('error', `生成失败: ${error.message}`);
      
      // 显示重试按钮
      this.showRetryButton(i18n.t('button.retry'), () => this.finishAndGenerate());
    } finally {
      this.isGenerating = false;
    }
  }

  private showRetryButton(text: string, retryFn: () => void) {
    this.inputContainer.empty();
    const buttonRow = this.inputContainer.createDiv('diary-pal-button-row');

    const retryBtn = buttonRow.createEl('button', {
      text: text,
      cls: 'diary-pal-btn diary-pal-btn-primary',
    });
    retryBtn.addEventListener('click', () => {
      retryFn();
    });

    const cancelBtn = buttonRow.createEl('button', {
      text: i18n.t('button.cancel'),
      cls: 'diary-pal-btn',
    });
    cancelBtn.addEventListener('click', () => {
      this.inputContainer.empty();
      this.showCurrentInput();
    });
  }

  private async saveAndOpenDiary(content: string, coreSentence: string) {
    try {
      const filePath = await this.plugin.saveDiary(content, coreSentence);
      new Notice(i18n.t('message.saved') + ': ' + filePath);
      this.addMessage('assistant', `✅ ${i18n.t('message.saved')} ${filePath}`);
      
      // 打开文件
      const file = this.app.vault.getAbstractFileByPath(filePath);
      if (file instanceof TFile) {
        await this.app.workspace.getLeaf().openFile(file);
      }
      
      this.inputContainer.empty();
      this.clearSession();
      
      // 显示重新开始选项
      const buttonRow = this.inputContainer.createDiv('diary-pal-button-row');
      const restartBtn = buttonRow.createEl('button', {
        text: i18n.t('button.restart'),
        cls: 'diary-pal-btn diary-pal-btn-primary',
      });
      restartBtn.addEventListener('click', () => {
        this.startNewSession();
      });
      
    } catch (error) {
      new Notice(`保存失败: ${error.message}`);
      this.addMessage('error', `保存失败: ${error.message}`);
    }
  }

  private addMessage(role: 'assistant' | 'user' | 'error', content: string) {
    const messageEl = this.messagesContainer.createDiv(`diary-pal-message diary-pal-${role}`);
    const bubble = messageEl.createDiv('diary-pal-bubble');
    bubble.textContent = content;
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  private showLoading(text: string) {
    const loadingEl = this.inputContainer.createDiv('diary-pal-loading');
    loadingEl.textContent = text;
  }

  private hideLoading() {
    const loadingEl = this.inputContainer.querySelector('.diary-pal-loading');
    if (loadingEl) {
      loadingEl.remove();
    }
  }

  private isContentComplete(content: string): boolean {
    // 检查长度
    if (content.length < 50) return false;
    
    // 检查是否有完整的句子（包含句号、问号或感叹号）
    if (!/[。？！.?!]/.test(content)) return false;
    
    // 检查是否有明显的截断标记
    if (content.endsWith('...') || content.endsWith('…')) return false;
    if (content.endsWith('正在') || content.endsWith('ing')) return false;
    
    // 检查段落结构
    const paragraphs = content.split('\n').filter(p => p.trim());
    if (paragraphs.length < 1 && content.length < 100) return false;
    
    return true;
  }
}