import { App, TFile, normalizePath } from 'obsidian';
import { DiaryPalSettings } from '../main';
import { LLMClient } from './llm-client';

export interface AnalysisProgress {
  stage: 'scanning' | 'reading' | 'analyzing' | 'complete' | 'error' | 'cancelled';
  message: string;
  progress: number;
  details?: string;
}

export type ProgressCallback = (progress: AnalysisProgress) => void;

/**
 * 文风分析器 - 渐进式提炼版本
 * 像人学习一样，逐步迭代完善文风理解
 */
export class StyleAnalyzer {
  private llmClient: LLMClient;
  private isAnalyzing: boolean = false;
  private shouldCancel: boolean = false;

  constructor(
    private app: App,
    private settings: DiaryPalSettings
  ) {
    this.llmClient = new LLMClient(settings);
  }

  /**
   * 检查是否正在分析
   */
  isAnalysisRunning(): boolean {
    return this.isAnalyzing;
  }

  /**
   * 取消分析
   */
  cancelAnalysis(): void {
    this.shouldCancel = true;
  }

  /**
   * 分析写作风格 - 渐进式提炼
   * 先分析第一批生成初始文风，然后逐步用新日记更新文风
   */
  async analyzeStyle(
    options: {
      maxDiaries?: number;
    } = {},
    onProgress?: ProgressCallback
  ): Promise<{
    style: string;
    soulContent: string;
    details: string;
    wasCancelled: boolean;
    analyzedCount: number;
  }> {
    if (this.isAnalyzing) {
      throw new Error('已有分析任务在运行');
    }

    this.isAnalyzing = true;
    this.shouldCancel = false;

    try {
      const result = await this.doIterativeAnalysis(options, onProgress);
      return result;
    } finally {
      this.isAnalyzing = false;
      this.shouldCancel = false;
    }
  }

  /**
   * 实际分析逻辑 - 渐进式
   */
  private async doIterativeAnalysis(
    options: { maxDiaries?: number },
    onProgress?: ProgressCallback
  ): Promise<{
    style: string;
    soulContent: string;
    details: string;
    wasCancelled: boolean;
    analyzedCount: number;
  }> {
    const diaryFolder = normalizePath(this.settings.diaryFolder);
    const maxDiaries = options.maxDiaries || Number.MAX_SAFE_INTEGER;

    onProgress?.({
      stage: 'scanning',
      message: `正在扫描文件夹: ${diaryFolder}...`,
      progress: 5
    });

    // 获取日记文件
    const allFiles = this.app.vault.getFiles();
    let files = allFiles
      .filter(file => file.path.startsWith(diaryFolder) && file.extension === 'md')
      .sort((a, b) => b.stat.mtime - a.stat.mtime);

    if (files.length > maxDiaries) {
      files = files.slice(0, maxDiaries);
    }

    if (files.length === 0) {
      return {
        ...this.getDefaultResult(diaryFolder),
        wasCancelled: false,
        analyzedCount: 0
      };
    }

    onProgress?.({
      stage: 'reading',
      message: `找到 ${files.length} 篇日记，准备读取...`,
      progress: 10,
      details: `共找到 ${files.length} 篇日记`
    });

    // 读取所有日记内容
    const diaries: { name: string; content: string }[] = [];
    let readErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      if (this.shouldCancel) {
        onProgress?.({
          stage: 'cancelled',
          message: '分析已取消',
          progress: Math.round((i / files.length) * 50),
          details: `已读取 ${i}/${files.length} 篇后取消`
        });
        return {
          style: '分析已取消',
          soulContent: this.getDefaultSoulContent(),
          details: `分析已取消。已读取 ${i}/${files.length} 篇。`,
          wasCancelled: true,
          analyzedCount: i
        };
      }

      const file = files[i];
      try {
        const content = await this.app.vault.read(file);
        diaries.push({
          name: file.basename,
          content: content.substring(0, 2500)
        });

        const progress = 10 + Math.round((i + 1) / files.length * 15);
        onProgress?.({
          stage: 'reading',
          message: `正在读取 (${i + 1}/${files.length})...`,
          progress,
          details: `已读取 ${i + 1}/${files.length} 篇`
        });

        if (i % 3 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      } catch (e: any) {
        readErrors.push(file.basename);
      }
    }

    // 渐进式分析
    const batchSize = 5;
    let currentStyleDoc = '';
    let iterationCount = 0;
    const analysisErrors: string[] = [];  // 记录错误

    onProgress?.({
      stage: 'analyzing',
      message: '开始渐进式文风提炼...',
      progress: 30,
      details: `将分 ${Math.ceil(diaries.length / batchSize)} 轮逐步完善文风理解`
    });

    for (let i = 0; i < diaries.length; i += batchSize) {
      if (this.shouldCancel) {
        onProgress?.({
          stage: 'cancelled',
          message: '分析已取消',
          progress: 30 + Math.round((i / diaries.length) * 60),
          details: `已完成 ${iterationCount} 轮迭代后取消`
        });
        return {
          style: currentStyleDoc ? '部分分析结果' : '分析已取消',
          soulContent: currentStyleDoc || this.getDefaultSoulContent(),
          details: `分析已取消。完成了 ${iterationCount} 轮迭代。`,
          wasCancelled: true,
          analyzedCount: i
        };
      }

      const batch = diaries.slice(i, i + batchSize);
      iterationCount++;
      const totalIterations = Math.ceil(diaries.length / batchSize);

      const progress = 30 + Math.round((iterationCount / totalIterations) * 60);
      onProgress?.({
        stage: 'analyzing',
        message: `第 ${iterationCount}/${totalIterations} 轮分析...`,
        progress,
        details: currentStyleDoc
          ? `基于已有文风，分析新批次 (${batch.map(d => d.name).join(', ')})`
          : `初始分析 (${batch.map(d => d.name).join(', ')})`
      });

      try {
        if (i === 0) {
          // 第一批：生成初始文风
          currentStyleDoc = await this.generateInitialStyle(batch);
        } else {
          // 后续批次：基于现有文风进行更新
          currentStyleDoc = await this.updateStyle(currentStyleDoc, batch);
        }
      } catch (e: any) {
        const errorMsg = `第 ${iterationCount} 轮分析失败: ${e.message || '未知错误'}`;
        console.error(errorMsg);
        analysisErrors.push(errorMsg);
        
        // 如果连续失败次数过多，中止分析
        if (analysisErrors.length >= 3) {
          onProgress?.({
            stage: 'error',
            message: '分析多次失败，已中止',
            progress: progress,
            details: `连续 ${analysisErrors.length} 轮失败: ${analysisErrors.join('; ')}`
          });
          return {
            style: currentStyleDoc ? '部分分析结果' : '分析失败',
            soulContent: currentStyleDoc || this.getDefaultSoulContent(),
            details: `文风分析多次失败，请检查网络连接或 API 配置。错误: ${analysisErrors.join('; ')}`,
            wasCancelled: false,
            analyzedCount: i
          };
        }
        // 继续下一轮，不中断
      }

      // 批次间延迟
      if (i + batchSize < diaries.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (this.shouldCancel) {
      return {
        style: currentStyleDoc ? '部分分析结果' : '分析已取消',
        soulContent: currentStyleDoc || this.getDefaultSoulContent(),
        details: '分析已取消',
        wasCancelled: true,
        analyzedCount: diaries.length
      };
    }

    onProgress?.({
      stage: 'complete',
      message: '分析完成',
      progress: 100,
      details: `完成 ${iterationCount} 轮迭代，生成最终文风文档`
    });

    const style = this.extractBriefStyle(currentStyleDoc);
    let details = this.generateDetails(diaries.length, readErrors, iterationCount);
    
    // 如果有错误，添加到详情中
    if (analysisErrors.length > 0) {
      details += `\n\n⚠️ 分析过程中遇到 ${analysisErrors.length} 个错误:\n` + analysisErrors.join('\n');
    }

    return {
      style,
      soulContent: currentStyleDoc,
      details,
      wasCancelled: false,
      analyzedCount: diaries.length
    };
  }

  /**
   * 生成初始文风（第一批日记）
   */
  private async generateInitialStyle(
    diaries: { name: string; content: string }[]
  ): Promise<string> {
    const systemPrompt = `你是一个写作风格分析师。请基于用户的日记样本，生成一份详细的"文风指南"文档。

要求：
1. 仔细阅读日记，找出作者的写作习惯
2. 输出格式为 Markdown，包含以下部分：
   - 核心特征（3-5句概括）
   - 句式习惯（短句/长句？断句方式？）
   - 词汇偏好（口语词？书面语？口头禅？）
   - 结构模式（如何分段？有无标题？开头结尾习惯？）
   - 情绪与语气（直接？含蓄？自嘲？调侃？）
   - 独特标识（只有这个作者会用的表达）
   - 生成日记时的要求（基于以上特征的写作指令）

3. 要具体、可执行，不要泛泛而谈`;

    let userContent = `请分析以下 ${diaries.length} 篇日记，生成文风指南：\n\n`;

    for (const diary of diaries) {
      userContent += `=== ${diary.name} ===\n${diary.content.substring(0, 2000)}\n\n`;
    }

    userContent += `\n请输出完整的文风指南文档（Markdown格式）：`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ];

    return await this.llmClient.chat(messages);
  }

  /**
   * 更新文风（基于现有文风 + 新日记）
   */
  private async updateStyle(
    currentStyle: string,
    newDiaries: { name: string; content: string }[]
  ): Promise<string> {
    const systemPrompt = `你是一个写作风格分析师。你的任务是基于已有的文风指南，结合新的日记样本，更新和完善文风理解。

要求：
1. 仔细阅读新的日记样本
2. 对比现有文风指南，看看是否需要：
   - 补充新发现的特征
   - 修正不准确的描述
   - 合并相似的观察
   - 删除不普遍的特征（如果新样本不支持）
3. 输出更新后的完整文风指南（保持相同格式）
4. 保持具体、可执行的风格`;

    let userContent = `【现有文风指南】\n${currentStyle}\n\n`;

    userContent += `【新的日记样本】\n`;
    for (const diary of newDiaries) {
      userContent += `=== ${diary.name} ===\n${diary.content.substring(0, 1800)}\n\n`;
    }

    userContent += `\n请基于以上信息，输出更新后的文风指南（Markdown格式）：`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ];

    return await this.llmClient.chat(messages);
  }

  /**
   * 提取简要风格描述
   */
  private extractBriefStyle(soulContent: string): string {
    const lines = soulContent.split('\n');
    const features: string[] = [];

    for (const line of lines) {
      if (line.startsWith('## ')) {
        // 跳过标题行
        continue;
      }
      if (line.startsWith('- ') && features.length < 5) {
        const feature = line.replace(/^- /, '').trim();
        if (feature.length > 5 && feature.length < 60) {
          features.push(feature);
        }
      }
      // 如果收集够了或者遇到空行，停止
      if (features.length >= 3 && line.trim() === '') {
        break;
      }
    }

    return features.length > 0
      ? features.join('；')
      : '已生成详细文风文档';
  }

  /**
   * 获取默认 Soul 内容
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

## 词汇偏好
- 使用日常口语词汇（哈哈、呃、吧、呢）
- 避免过于书面化的表达

## 结构模式
- 按时间或主题自然分段
- 段落间空一行
- 不使用结构化标题

## 情绪与语气
- 真实自然，不掩饰情绪
- 可适当自嘲或调侃

## 独特标识
- 无特定标识

## 生成日记时的要求
1. 严格使用短句，断句随意
2. 使用口语化表达，像和未来的自己聊天
3. 不使用emoji和装饰性符号
4. 不使用结构化标题
5. 段落间空一行
6. 真实记录，不升华不总结
`;
  }

  /**
   * 默认结果
   */
  private getDefaultResult(diaryFolder: string): {
    style: string;
    soulContent: string;
    details: string;
  } {
    return {
      style: '默认风格：短句口语化',
      soulContent: this.getDefaultSoulContent(),
      details: `未在 "${diaryFolder}" 中找到日记文件。\n请检查文件夹路径。`
    };
  }

  /**
   * 生成详细报告
   */
  private generateDetails(
    totalFiles: number,
    errors: string[],
    iterations: number
  ): string {
    let details = `✅ AI 文风分析完成（渐进式提炼）\n\n`;

    details += `📊 统计信息\n`;
    details += `- 分析日记：${totalFiles} 篇\n`;
    details += `- 迭代轮数：${iterations} 轮\n`;
    if (errors.length > 0) {
      details += `- 读取失败：${errors.length} 篇\n`;
    }

    details += `\n📝 分析策略\n`;
    details += `- 采用渐进式迭代，逐步完善文风理解\n`;
    details += `- 每轮分析 5 篇日记，基于已有文风进行更新\n`;
    details += `- 最终文风融合了所有日记的特征\n`;

    return details;
  }

  /**
   * 生成用于LLM的System Prompt
   */
  generateSystemPrompt(soulContent: string): string {
    return `你是一个日记伴侣，帮助用户完成每日日记记录。

【文风指南】
${soulContent}

【输出要求】
基于以上文风指南，生成符合用户写作风格的日记。像用户自己写的流水账，真实比漂亮重要。`;
  }
}
