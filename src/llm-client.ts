import { DiaryPalSettings } from '../main';
import { i18n } from './i18n';

/**
 * LLM API 客户端
 * 支持 OpenAI、Claude 和自定义 API
 */
export class LLMClient {
  constructor(private settings: DiaryPalSettings) {}

  /**
   * 发送聊天请求
   */
  async chat(messages: { role: string; content: string }[]): Promise<string> {
    if (!this.settings.apiKey) {
      throw new Error('API Key 未设置，请在设置中配置');
    }

    if (this.settings.llmProvider === 'claude') {
      return await this.callClaude(messages);
    } else {
      return await this.callOpenAICompat(messages);
    }
  }

  /**
   * 调用 OpenAI 兼容 API
   */
  private async callOpenAICompat(
    messages: { role: string; content: string }[]
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3分钟超时

    try {
      const response = await fetch(this.settings.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.settings.apiKey}`,
        },
        body: JSON.stringify({
          model: this.settings.modelName,
          messages: messages,
          temperature: 0.7,
          max_tokens: 8000, // 足够生成长日记
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API请求失败: ${error}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时（3分钟），请重试');
      }
      throw error;
    }
  }

  /**
   * 调用 Claude API
   */
  private async callClaude(
    messages: { role: string; content: string }[]
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 180000); // 3分钟超时

    try {
      // 转换消息格式为 Claude 格式
      const systemMessage = messages.find(m => m.role === 'system');
      const userMessages = messages.filter(m => m.role !== 'system');

      const response = await fetch(this.settings.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.settings.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: this.settings.modelName,
          max_tokens: 8000, // 足够生成长日记
          system: systemMessage?.content || '',
          messages: userMessages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content,
          })),
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API请求失败: ${error}`);
      }

      const data = await response.json();
      return data.content?.[0]?.text || '';
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时（3分钟），请重试');
      }
      throw error;
    }
  }

  /**
   * 生成日记
   */
  async generateDiary(
    styleDescription: string,
    conversationHistory: { question: string; answer: string }[]
  ): Promise<{ content: string; coreSentence: string }> {
    const isEnglish = i18n.getCurrentLang() === 'en';
    const systemPrompt = this.generateDiarySystemPrompt(styleDescription);
    
    // 构建对话记录
    let userContent = isEnglish 
      ? 'Based on the following conversation, help me organize it into a diary entry:\n\n'
      : '基于以下对话，帮我整理成一篇日记：\n\n';
    
    for (const item of conversationHistory) {
      userContent += isEnglish
        ? `Q: ${item.question}\nA: ${item.answer}\n\n`
        : `问：${item.question}\n答：${item.answer}\n\n`;
    }
    
    userContent += isEnglish
      ? '\nPlease organize into diary format. Only output the diary content, no explanation.'
      : '\n请整理成日记格式，只输出日记正文，不要任何解释。';
    userContent += isEnglish
      ? '\nAlso, extract the most important sentence as the filename (not a summary, the actual sentence).'
      : '\n同时，从日记中提取最重要的一句话作为文件名（不是概括，是原话）。';
    userContent += '\n格式：\n---DIARY---\n[日记正文]\n---CORE---\n[核心句]';

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ];

    const response = await this.chat(messages);
    
    // 解析响应
    const diaryMatch = response.match(/---DIARY---\n?([\s\S]*?)\n?---CORE---/);
    const coreMatch = response.match(/---CORE---\n?([\s\S]*?)(?:\n?$)/);
    
    const content = diaryMatch?.[1]?.trim() || response;
    const coreSentence = coreMatch?.[1]?.trim() || '';

    return { content, coreSentence };
  }

  /**
   * 生成访谈问题
   */
  async generateQuestion(
    styleDescription: string,
    round: number,
    totalRounds: number,
    previousAnswers: string[]
  ): Promise<string> {
    const isEnglish = i18n.getCurrentLang() === 'en';
    
    const systemPrompt = isEnglish
      ? `You are a diary companion, guiding users to reflect on their day through gentle questions.
User's writing style: ${styleDescription}

Requirements:
1. Questions should be short and conversational
2. Avoid vague questions (like "How was your day?" should be followed by specific directions)
3. Naturally follow up on previous answers
4. Question ${round} of ${totalRounds}
5. Ask only one question at a time
6. IMPORTANT: You MUST ask questions in English only`
      : `你是一个日记伴侣，通过温和的问题引导用户回顾一天。
用户的写作风格：${styleDescription}

要求：
1. 问题要简短、口语化
2. 不要问太笼统的问题（如"今天过得怎么样"后面要跟进具体方向）
3. 根据前面的回答自然地追问
4. 第${round}轮问题，总共${totalRounds}轮
5. 一次只问一个问题
6. 重要：必须使用中文提问`;

    let userContent = '';
    if (previousAnswers.length === 0) {
      userContent = isEnglish
        ? 'This is the first question. Start the conversation in a casual way, asking about what happened today or how they feel.'
        : '这是第一轮提问，请用轻松随意的方式开启对话，问今天发生了什么或心情如何。';
    } else {
      userContent = isEnglish ? 'Previous answers:\n' : '前面的回答：\n';
      for (let i = 0; i < previousAnswers.length; i++) {
        userContent += `${i + 1}. ${previousAnswers[i]}\n`;
      }
      userContent += isEnglish
        ? `\nThis is question ${round}. Please naturally follow up on previous content or start a new topic.`
        : `\n这是第${round}轮，请根据前面的内容自然追问，或开启新的话题。`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ];

    return await this.chat(messages);
  }

  /**
   * 生成日记的 System Prompt
   */
  private generateDiarySystemPrompt(styleDescription: string): string {
    const isEnglish = i18n.getCurrentLang() === 'en';
    
    if (isEnglish) {
      return `You are a diary assistant, helping users organize their diary entries.

【User's Writing Style】
${styleDescription}

【Output Requirements】
1. Conversational tone, short sentences
2. No structured headers (like "## Today's Events")
3. No emojis
4. No bullet lists
5. Natural paragraph breaks by time or topic
6. Authentic and natural, like the user's own stream of consciousness
7. IMPORTANT: You MUST write the diary in English only

【Output Format】
---DIARY---
[Diary content, paragraphs separated by blank lines]
---CORE---
[The most important sentence as filename]`;
    }
    
    return `你是一个日记助手，帮用户整理日记。

【用户的写作风格】
${styleDescription}

【输出要求】
1. 口语化、短句为主
2. 不使用结构化标题（如"## 今日事记"）
3. 不使用emoji
4. 不使用bullet list
5. 按时间或主题自然分段
6. 真实自然，像用户自己写的流水账
7. 重要：必须使用中文撰写日记

【输出格式】
---DIARY---
[日记正文，段落间空行]
---CORE---
[最重要的一句话作为文件名]`;
  }
}
