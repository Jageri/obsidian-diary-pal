import { zh } from './zh';
import { en } from './en';

const translations: Record<string, Record<string, string>> = {
  'zh': zh,
  'en': en,
  'zh-CN': zh,
  'zh-TW': zh,
  'zh-HK': zh,
};

export type Language = 'auto' | 'zh' | 'en';

class I18n {
  private currentLang: string = 'en';
  private settingsLang: Language = 'auto';

  /**
   * 检测 Obsidian 界面语言
   */
  detectLanguage(): string {
    // Obsidian 的界面语言存储在 localStorage
    const obsidianLang = localStorage.getItem('language') || 'en';
    return this.normalizeLang(obsidianLang);
  }

  /**
   * 标准化语言代码
   */
  normalizeLang(lang: string): string {
    if (lang.startsWith('zh')) return 'zh';
    return 'en';
  }

  /**
   * 设置语言（来自设置）
   */
  setLanguage(lang: Language) {
    this.settingsLang = lang;
    if (lang === 'auto') {
      this.currentLang = this.detectLanguage();
    } else {
      this.currentLang = lang;
    }
  }

  /**
   * 获取当前语言
   */
  getCurrentLang(): string {
    return this.currentLang;
  }

  /**
   * 获取设置的语言
   */
  getSettingsLang(): Language {
    return this.settingsLang;
  }

  /**
   * 翻译
   * @param key 翻译键
   * @param vars 变量替换对象，如 {count: 5}
   */
  t(key: string, vars?: Record<string, string | number>): string {
    const dict = translations[this.currentLang] || translations['en'];
    let text = dict[key] || translations['en'][key] || key;

    // 变量替换
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), String(v));
      });
    }

    return text;
  }
}

export const i18n = new I18n();
