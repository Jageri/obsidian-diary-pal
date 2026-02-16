export const zh = {
  // 插件
  'plugin.name': '日记伴侣',
  'plugin.description': '通过AI访谈式提问，学习你的文风，帮你完成每日日记',

  // 按钮
  'button.newChat': '新对话',
  'button.finish': '结束并生成日记',
  'button.start': '开始对话',
  'button.continue': '继续对话',
  'button.restart': '重新开始',
  'button.skip': '跳过',
  'button.send': '发送',
  'button.save': '保存',
  'button.edit': '编辑',
  'button.cancel': '取消',
  'button.retry': '重试',
  'button.confirm': '确定',
  'button.resume': '继续分析',
  'button.discard': '放弃进度',
  'button.test': '测试连接',
  'button.settings': '打开设置',

  // 消息
  'message.welcome': '嗨，准备写今天的日记了吗？点击下面的按钮开始吧。',
  'message.welcomeBack': '欢迎回来，点击继续上次的对话~',
  'message.generating': '正在整理日记...',
  'message.saved': '日记已保存',
  'message.saveFailed': '保存失败',
  'message.generationFailed': '生成失败',
  'message.generationIncomplete': '生成的内容似乎不完整，正在重试...',
  'message.restartConfirm': '当前对话已有 {count} 条记录，确定要放弃吗？',
  'message.basicDone': '基础问题问完了，还想继续聊聊吗？（可以继续回答或点击"结束并生成日记"）',
  'message.enoughChat': '聊得挺多了，要不要整理成日记？',
  'message.cancelled': '已取消',
  'message.noContent': '还没有对话内容',
  'message.restartRequired': '语言已更改，请重启 Obsidian 生效',
  'message.inputPlaceholder': '输入你的回答...（支持多行，可拖动调节高度）',
  'message.resetConfirm': '确定要重置为默认文风吗？这将丢失当前的自定义内容。',
  'message.noStyle': '⚠️ 还没有分析你的写作风格。请先前往设置 → 文风分析，分析至少一篇日记以获得更好的生成效果。',
  'message.noApiConfig': '⚠️ 大模型 API 未配置。请前往设置 → Diary Pal，配置 API Key 并测试连通性。',

  // 标签
  'label.lastAnalyzed': '上次分析时间',
  'label.analyzing': '分析中...',
  'label.cancel': '取消',

  // 状态
  'status.testing': '测试中...',
  'status.testingApi': '正在测试 API 连通性...',

  // 错误
  'error.api': 'API 请求失败',
  'error.timeout': '请求超时（3分钟），请重试',
  'error.noApiKey': 'API Key 未设置，请在设置中配置',
  'error.analysisRunning': '已有分析任务在运行',
  'error.generationFailed': '生成失败: {message}',
  'error.saveFailed': '保存失败: {message}',

  // 设置
  'setting.llmProvider': 'LLM 提供商',
  'setting.llmProviderDesc': '选择你要使用的AI服务',
  'setting.apiKey': 'API Key',
  'setting.apiKeyDesc': '你的API密钥（不会离开你的设备）',
  'setting.apiEndpoint': 'API 地址',
  'setting.apiEndpointDesc': 'LLM API的完整地址',
  'setting.modelName': '模型名称',
  'setting.modelNameDesc': '使用的具体模型',
  'setting.diaryFolder': '日记文件夹',
  'setting.diaryFolderDesc': '日记保存的位置（相对于Vault根目录）',
  'setting.questionRounds': '访谈轮数',
  'setting.questionRoundsDesc': '引导提问的基础轮数',
  'setting.language': '语言 / Language',
  'setting.languageDesc': '插件界面语言（重启后生效）',
  'setting.securityWarning': 'API Key 以明文形式存储。请确保您的 Obsidian 配置安全，不要分享包含 API Key 的配置文件。',

  // 选项
  'option.openai': 'OpenAI',
  'option.claude': 'Claude (Anthropic)',
  'option.custom': '自定义API',
  'option.auto': '自动 / Auto',
  'option.zh': '中文',
  'option.en': 'English',

  // 分析
  'analysis.title': '文风分析',
  'analysis.range': '📦 分析范围',
  'analysis.rangeDesc': '选择要分析的日记数量。采用渐进式迭代分析，逐步完善文风理解。',
  'analysis.quick': '最近 10 篇（快速预览）',
  'analysis.recommended': '最近 20 篇（推荐）',
  'analysis.detailed': '最近 50 篇（详细分析）',
  'analysis.all': '全部日记（最准确，但较慢）',
  'analysis.start': '开始分析',
  'analysis.checkpoint': '⚠️ 有未完成的分析',
  'analysis.checkpointDesc': '上次分析了 {analyzed}/{total} 篇日记，{time}',
  'analysis.progress': '分析进度',
  'analysis.warning': '⚠️ 分析过程中请勿关闭 Obsidian',
  'analysis.complete': '✅ AI 文风分析完成（渐进式提炼）',
  'analysis.iterations': '迭代轮数：{count} 轮',

  // 文风文档
  'soul.title': '📝 文风文档（可编辑）',
  'soul.desc': '这是 AI 生成的文风指南，你可以直接编辑来微调生成效果。',
  'soul.save': '保存修改',
  'soul.reset': '重置为默认',
  'soul.export': '导出为文件',
  'soul.saved': '已保存',
  'soul.exported': '已导出到: {path}',
  'soul.exportFailed': '导出失败: {message}',

  // API 测试
  'api.testing': '正在测试 API 连通性...',
  'api.success': '✅ API 连接成功！配置正确。',
  'api.failed': '❌ API 连接失败 ({status})',
  'api.error': '❌ 连接错误: {message}',

  // 状态
  'status.thinking': '正在思考...',
  'status.generating': '生成中...',
  'status.analyzing': '分析中...',
  'status.reading': '正在读取',
};
