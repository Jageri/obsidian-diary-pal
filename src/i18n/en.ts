export const en = {
  // Plugin
  'plugin.name': 'Diary Pal',
  'plugin.description': 'Complete your daily diary through AI interview-style questions',

  // Buttons
  'button.newChat': 'New Chat',
  'button.finish': 'Finish & Generate',
  'button.start': 'Start Chat',
  'button.continue': 'Continue',
  'button.restart': 'Restart',
  'button.skip': 'Skip',
  'button.send': 'Send',
  'button.save': 'Save',
  'button.edit': 'Edit',
  'button.cancel': 'Cancel',
  'button.retry': 'Retry',
  'button.confirm': 'Confirm',
  'button.resume': 'Resume',
  'button.discard': 'Discard',
  'button.test': 'Test Connection',
  'button.settings': 'Open Settings',

  // Messages
  'message.welcome': 'Hey, ready to write today\'s diary? Click the button below to start.',
  'message.welcomeBack': 'Welcome back! Continue your previous conversation.',
  'message.generating': 'Generating diary...',
  'message.saved': 'Diary saved',
  'message.saveFailed': 'Save failed',
  'message.generationFailed': 'Generation failed',
  'message.generationIncomplete': 'Content seems incomplete, retrying...',
  'message.restartConfirm': 'Current chat has {count} messages. Discard them?',
  'message.basicDone': 'Basic questions done. Want to chat more? (Round {current}/{total})',
  'message.enoughChat': 'We\'ve chatted for {current} rounds. Ready to organize into a diary?',
  'message.lastChance': 'We\'ve chatted for {current} rounds. If you want to continue, we won\'t ask again. You can chat as long as you like. Ready to finish?',
  'message.cancelled': 'Cancelled',
  'message.noContent': 'No conversation content yet',
  'message.restartRequired': 'Language changed. Please restart Obsidian to apply.',
  'message.inputPlaceholder': 'Enter your answer... (supports multi-line, drag to resize)',
  'message.resetConfirm': 'Reset to default writing style? This will lose your custom content.',
  'message.noStyle': '⚠️ Writing style not analyzed yet. Please go to Settings → Diary Pal → Writing Style Analysis to analyze at least one diary for better results.',
  'message.noApiConfig': '⚠️ LLM API not configured. Please go to Settings → Diary Pal to configure API Key and test connectivity.',

  // Labels
  'label.lastAnalyzed': 'Last analyzed',
  'label.analyzing': 'Analyzing...',
  'label.cancel': 'Cancel',

  // Status
  'status.testing': 'Testing...',
  'status.testingApi': 'Testing API connectivity...',

  // Errors
  'error.api': 'API request failed',
  'error.timeout': 'Request timeout (3 min), please retry',
  'error.noApiKey': 'API Key not set, please configure in settings',
  'error.analysisRunning': 'Analysis already in progress',
  'error.generationFailed': 'Generation failed: {message}',
  'error.saveFailed': 'Save failed: {message}',

  // Settings
  'setting.llmProvider': 'LLM Provider',
  'setting.llmProviderDesc': 'Choose your AI service',
  'setting.apiKey': 'API Key',
  'setting.apiKeyDesc': 'Your API key (stays on your device)',
  'setting.apiEndpoint': 'API Endpoint',
  'setting.apiEndpointDesc': 'Full URL of the LLM API',
  'setting.modelName': 'Model Name',
  'setting.modelNameDesc': 'Specific model to use',
  'setting.diaryFolder': 'Diary Folder',
  'setting.diaryFolderDesc': 'Where to save diaries (relative to Vault root)',
  'setting.questionRounds': 'Question Rounds',
  'setting.questionRoundsDesc': 'Base number of guiding questions',
  'setting.language': 'Language / 语言',
  'setting.languageDesc': 'Plugin interface language (restart to apply)',
  'setting.securityWarning': 'API Key is stored in plain text. Please ensure your Obsidian configuration is secure and do not share configuration files containing your API Key.',

  // Options
  'option.openai': 'OpenAI',
  'option.claude': 'Claude (Anthropic)',
  'option.custom': 'Custom API',
  'option.auto': 'Auto / 自动',
  'option.zh': '中文',
  'option.en': 'English',

  // Analysis
  'analysis.title': 'Style Analysis',
  'analysis.range': '📦 Analysis Range',
  'analysis.rangeDesc': 'Choose how many diaries to analyze. Uses iterative refinement.',
  'analysis.quick': 'Last 10 (Quick preview)',
  'analysis.recommended': 'Last 20 (Recommended)',
  'analysis.detailed': 'Last 50 (Detailed)',
  'analysis.all': 'All diaries (Most accurate, slower)',
  'analysis.start': 'Start Analysis',
  'analysis.checkpoint': '⚠️ Incomplete analysis found',
  'analysis.checkpointDesc': 'Last analyzed {analyzed}/{total} diaries, {time}',
  'analysis.progress': 'Analysis Progress',
  'analysis.warning': '⚠️ Do not close Obsidian during analysis',
  'analysis.complete': '✅ AI Style Analysis Complete (Iterative)',
  'analysis.iterations': 'Iterations: {count}',

  // Soul document
  'soul.title': '📝 Writing Style Guide (Editable)',
  'soul.desc': 'This is the AI-generated style guide. Edit directly to fine-tune generation.',
  'soul.save': 'Save Changes',
  'soul.reset': 'Reset to Default',
  'soul.export': 'Export to File',
  'soul.saved': 'Saved',
  'soul.exported': 'Exported to: {path}',
  'soul.exportFailed': 'Export failed: {message}',

  // API Test
  'api.testing': 'Testing API connection...',
  'api.success': '✅ API connection successful!',
  'api.failed': '❌ API connection failed ({status})',
  'api.error': '❌ Connection error: {message}',

  // Status
  'status.thinking': 'Thinking...',
  'status.generating': 'Generating...',
  'status.analyzing': 'Analyzing...',
  'status.reading': 'Reading',
};
