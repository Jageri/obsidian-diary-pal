# I am submitting a new Community Plugin

- [x] I attest that I have done my best to deliver a high-quality plugin, am proud of the code I have written, and would recommend it to others. I commit to maintaining the plugin and being responsive to bug reports. If I am no longer able to maintain it, I will make reasonable efforts to find a successor maintainer or withdraw the plugin from the directory.

## Repo URL

https://github.com/Jageri/obsidian-diary-pal

## Release Checklist

- [x] I have tested the plugin on
  - [x] Windows
  - [ ] macOS
  - [ ] Linux
  - [ ] Android _(if applicable)_
  - [ ] iOS _(if applicable)_
- [x] My GitHub release contains all required files (as individual files, not just in the source.zip / source.tar.gz)
  - [x] main.js
  - [x] manifest.json
  - [x] styles.css _(optional)_
- [x] GitHub release name matches the exact version number specified in my manifest.json (_**Note:** Use the exact version number, don't include a prefix `v`_)
  - Release: `0.1.0`
  - manifest.json: `"version": "0.1.0"`
- [x] The `id` in my manifest.json matches the id in the community-plugins.json file.
  - manifest.json: `"id": "diary-pal"`
  - community-plugins.json: `"id": "diary-pal"`
- [x] My README.md describes the plugin's purpose and provides clear usage instructions.
- [x] I have read the developer policies at https://docs.obsidian.md/Developer+policies, and have assessed my plugin's adherence to these policies.
- [x] I have read the tips in https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines and have self-reviewed my plugin to avoid these common pitfalls.
- [x] I have added a license in the LICENSE file.
- [x] My project respects and is compatible with the original license of any code from other plugins that I'm using. I have given proper attribution to these other projects in my README.md.
  - This plugin is built from scratch, no code from other plugins is used.

## Plugin Description

Diary Pal is an AI-powered diary writing assistant for Obsidian. It helps users write daily diaries through:

1. **Interview Mode**: AI asks 5-8 gentle questions about your day
2. **Style Learning**: Analyzes your existing diaries to match your writing tone
3. **Auto Generation**: Transforms conversation into a diary entry
4. **Bilingual Support**: Full Chinese and English interface

### How it works
- Click the 📖 icon in sidebar
- Answer AI's questions naturally
- Click "Finish & Generate"
- Diary is auto-saved to your vault

### Key Features
- Progressive style analysis (iterative refinement)
- Editable writing style guide
- Session persistence (resume where you left off)
- Retry mechanisms for failed API calls
- Local date-based file naming

## Release Link

https://github.com/Jageri/obsidian-diary-pal/releases/tag/0.1.0

## community-plugins.json Entry

```json
{
  "id": "diary-pal",
  "name": "Diary Pal",
  "author": "Allen",
  "description": "AI-powered diary writing assistant with interview-style questioning and style learning",
  "repo": "Jageri/obsidian-diary-pal"
}
```
