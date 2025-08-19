# Dynamic UI Framework Documentation
## ChatGPT Exporter Enhanced with LML Integration

### Table of Contents
1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Architecture](#architecture)
5. [API Reference](#api-reference)
6. [Configuration](#configuration)
7. [Theming](#theming)
8. [Internationalization](#internationalization)
9. [Export Formats](#export-formats)
10. [Development](#development)
11. [Troubleshooting](#troubleshooting)

---

## Overview

The Dynamic UI Framework transforms the ChatGPT Exporter into a sophisticated, adaptive frontend capable of integrating with Language Model Learning (LML) systems and various APIs. It provides real-time UI adaptation, multi-format export capabilities, and comprehensive debugging tools.

### Key Features
- **Adaptive UI**: Automatically adjusts to user preferences and system capabilities
- **Multi-API Integration**: Supports OpenAI, Monica AI, and custom APIs
- **Enhanced Export System**: 7+ export formats with customizable templates
- **Real-time Synchronization**: WebSocket-based live updates
- **Comprehensive Theming**: Dark/light modes with custom theme support
- **Internationalization**: Support for 7+ languages with RTL text support
- **Accessibility**: WCAG 2.1 compliant with screen reader support
- **Offline Capability**: Service Worker integration for offline functionality

---

## Installation

### Method 1: UserScript Installation (Recommended)
1. Install a userscript manager (Tampermonkey, Greasemonkey, etc.)
2. Visit the [installation page](https://greasyfork.org/scripts/456055-chatgpt-exporter)
3. Click "Install this script"

### Method 2: Manual Integration
1. Include the dynamic UI files in your project:
```html
<link rel="stylesheet" href="dynamic-ui-styles.css">
<script src="dynamic-ui-fullstack.js"></script>
```

2. Initialize the framework:
```javascript
// Wait for DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.DynamicUI.init();
});
```

### Method 3: NPM Package (Development)
```bash
npm install @chatgpt-exporter/dynamic-ui
```

---

## Quick Start

### Basic Usage
```javascript
// Initialize the Dynamic UI Engine
const engine = new DynamicUIEngine({
    apis: {
        openai: {
            baseUrl: 'https://api.openai.com/v1',
            apiKey: 'your-api-key',
            enabled: true
        }
    },
    themes: {
        current: 'chatgpt-dark',
        adaptive: true
    },
    language: {
        current: 'en',
        autoDetect: true
    }
});

await engine.init();
```

### Export a Conversation
```javascript
// Get current conversation
const conversationData = await engine.getCurrentConversation();

// Export to markdown
await engine.exportManager.exportConversation(conversationData, {
    format: 'markdown',
    includeTimestamps: true,
    includeMetadata: true
});
```

### Change Theme
```javascript
// Apply a theme
await engine.themeManager.applyTheme('monica-light');

// Create custom theme
const customTheme = engine.themeManager.createCustomTheme('my-theme', {
    primary: '#ff6b6b',
    background: '#1a1a1a',
    text: '#ffffff'
});
```

---

## Architecture

### Core Components

```
Dynamic UI Framework
├── DynamicUIEngine (Core orchestrator)
├── APIManager (API integration and management)
├── ThemeManager (Theme and styling management)
├── ExportManager (Multi-format export handling)
├── I18nManager (Internationalization)
├── WebSocketManager (Real-time communication)
└── Components (UI components)
    ├── DynamicMenu
    ├── ExportDialog
    ├── SettingsPanel
    ├── DebugConsole
    └── APIPanel
```

### Data Flow
1. User interaction triggers events
2. DynamicUIEngine processes events
3. Appropriate managers handle specific functionality
4. UI components update based on state changes
5. WebSocket synchronizes changes across sessions

### Plugin Architecture
The framework supports plugins for extending functionality:

```javascript
// Register a custom plugin
engine.registerPlugin('customExporter', {
    name: 'Custom Exporter',
    version: '1.0.0',
    export: async (data, options) => {
        // Custom export logic
        return { filename: 'export.custom', content: '...', mimeType: 'text/plain' };
    }
});
```

---

## API Reference

### DynamicUIEngine

#### Constructor
```typescript
new DynamicUIEngine(config?: LMLConfig)
```

#### Methods

##### `init(): Promise<void>`
Initializes the engine and all managers.

##### `updateConfiguration(updates: Partial<LMLConfig>): void`
Updates the engine configuration.

##### `getConfiguration(): LMLConfig`
Returns the current configuration.

##### `cleanup(): void`
Cleans up resources and event listeners.

### APIManager

#### Methods

##### `request(apiName: string, endpoint: string, options?: RequestOptions): Promise<any>`
Makes a request to the specified API.

##### `getStatus(apiName: string): APIStatus`
Gets the status of a specific API.

##### `getAllStatus(): Record<string, APIStatus>`
Gets the status of all APIs.

### ThemeManager

#### Methods

##### `applyTheme(themeName: string): Promise<void>`
Applies a theme by name.

##### `createCustomTheme(name: string, properties: ThemeProperties): ThemeConfig`
Creates a new custom theme.

##### `getAvailableThemes(): ThemeInfo[]`
Returns a list of available themes.

##### `getCurrentTheme(): ThemeConfig`
Returns the currently active theme.

### ExportManager

#### Methods

##### `exportConversation(data: ConversationData, options: ExportOptions): Promise<ExportResult>`
Exports a conversation in the specified format.

##### `batchExport(conversations: ConversationData[], formats: string[], options?: ExportOptions): Promise<ExportResult[]>`
Exports multiple conversations in multiple formats.

##### `registerExporter(format: string, exporter: BaseExporter): void`
Registers a custom exporter.

---

## Configuration

### Complete Configuration Example
```javascript
const config = {
    apis: {
        openai: {
            baseUrl: 'https://api.openai.com/v1',
            apiKey: process.env.OPENAI_API_KEY,
            model: 'gpt-4',
            enabled: true,
            timeout: 30000,
            retries: 3
        },
        monica: {
            baseUrl: 'https://api.monica.im/v1',
            apiKey: process.env.MONICA_API_KEY,
            enabled: false,
            features: ['enhanced_chat', 'multi_language', 'debugging']
        }
    },
    themes: {
        current: 'adaptive',
        adaptive: true,
        customThemes: [
            {
                name: 'corporate',
                primary: '#0066cc',
                secondary: '#f8f9fa',
                background: '#ffffff',
                text: '#333333'
            }
        ]
    },
    exports: {
        defaultFormat: 'markdown',
        includeTimestamps: true,
        includeMetadata: true,
        customTemplates: {
            html: 'custom-template.html',
            markdown: 'custom-template.md'
        },
        postProcessing: ['sanitize', 'minify']
    },
    language: {
        current: 'en',
        autoDetect: true,
        fallback: 'en',
        supportedLanguages: ['en', 'es', 'zh-Hans', 'zh-Hant', 'jp', 'tr', 'id']
    },
    features: {
        realTimeSync: true,
        offlineMode: true,
        analytics: false,
        debugging: true,
        accessibility: true,
        rtlSupport: true
    },
    ui: {
        menuPosition: 'top-right',
        compactMode: false,
        animations: true,
        reducedMotion: false
    }
};
```

### Environment Variables
```bash
# API Keys
OPENAI_API_KEY=your_openai_key
MONICA_API_KEY=your_monica_key

# Feature Flags
DYNAMIC_UI_DEBUG=true
DYNAMIC_UI_ANALYTICS=false
DYNAMIC_UI_OFFLINE=true

# WebSocket Configuration
WEBSOCKET_URL=wss://your-websocket-server.com
WEBSOCKET_RECONNECT_ATTEMPTS=5
```

---

## Theming

### Built-in Themes

#### ChatGPT Dark (Default)
- Primary: #10a37f (ChatGPT Green)
- Background: #212121 (Dark Gray)
- Text: #ffffff (White)
- Surface: #2f2f2f (Medium Gray)

#### Monica Light
- Primary: #2563eb (Monica Blue)
- Background: #ffffff (White)
- Text: #1f2937 (Dark Gray)
- Surface: #f8fafc (Light Gray)

#### High Contrast
- Optimized for accessibility
- High contrast ratios
- Bold borders and focus indicators

#### Adaptive
- Automatically switches based on system preferences
- Respects `prefers-color-scheme` media query
- Adapts to user's accessibility settings

### Custom Theme Creation
```javascript
// Create a custom theme
const myTheme = engine.themeManager.createCustomTheme('my-brand', {
    name: 'My Brand Theme',
    primary: '#ff6b6b',
    primaryHover: '#ff5252',
    primaryLight: '#ff8a80',
    secondary: '#4ecdc4',
    background: '#1a1a1a',
    surface: '#2d2d2d',
    surfaceHover: '#3a3a3a',
    text: '#ffffff',
    textSecondary: '#cccccc',
    textMuted: '#888888',
    border: '#444444',
    borderLight: '#666666',
    shadow: 'rgba(0, 0, 0, 0.3)',
    fontFamily: 'Inter, sans-serif',
    borderRadius: '8px'
});

// Apply the custom theme
await engine.themeManager.applyTheme('my-brand');
```

### CSS Custom Properties
The framework uses CSS custom properties for theming:

```css
:root {
    --theme-primary: #10a37f;
    --theme-background: #212121;
    --theme-text: #ffffff;
    /* ... more properties */
}

/* Use in your components */
.my-component {
    background: var(--theme-background);
    color: var(--theme-text);
    border: 1px solid var(--theme-border);
}
```

---

## Internationalization

### Supported Languages
- English (en) - Default
- Spanish (es)
- Chinese Simplified (zh-Hans)
- Chinese Traditional (zh-Hant)
- Japanese (jp)
- Turkish (tr)
- Indonesian (id)

### Adding Translations
1. Create a new translation file:
```json
// src/locales/fr.json
{
    "export": "Exporter",
    "theme": "Thème",
    "language": "Langue",
    "settings": "Paramètres",
    "loading": "Chargement...",
    "error": "Erreur",
    "success": "Succès"
}
```

2. Register the language:
```javascript
engine.i18nManager.registerLanguage('fr', 'Français', {
    rtl: false,
    dateFormat: 'DD/MM/YYYY',
    numberFormat: 'fr-FR'
});
```

### Using Translations
```javascript
// In components
const { t } = useTranslation();
const exportText = t('export');

// With parameters
const welcomeText = t('welcome', { name: 'John' });

// Programmatically
const text = engine.i18nManager.t('export');
```

### RTL Support
The framework automatically handles RTL languages:

```css
/* RTL styles are applied automatically */
[dir="rtl"] .dynamic-ui-container {
    direction: rtl;
}

[dir="rtl"] .menu-content {
    text-align: right;
}
```

---

## Export Formats

### Supported Formats

#### JSON
- Raw conversation data
- Official OpenAI format
- Custom metadata
- Structured message format

#### Markdown
- GitHub Flavored Markdown
- Frontmatter support
- Timestamp integration
- Citation footnotes

#### HTML
- Styled conversation view
- Custom templates
- Responsive design
- Print-friendly

#### XML
- Structured data format
- CDATA sections for content
- Metadata preservation
- Schema validation ready

#### CSV
- Tabular data format
- Excel compatible
- Custom field selection
- Bulk data analysis

#### Plain Text
- Simple text format
- Timestamp options
- Clean formatting
- Terminal friendly

#### PDF (via HTML)
- Print-optimized HTML
- Custom styling
- Page break optimization
- Vector graphics support

### Custom Export Templates

#### HTML Template
```html
<!DOCTYPE html>
<html>
<head>
    <title>{{title}}</title>
    <style>
        /* Custom styles */
        .conversation { max-width: 800px; margin: 0 auto; }
        .message { margin: 20px 0; padding: 15px; }
        .user { background: #e3f2fd; }
        .assistant { background: #f1f8e9; }
    </style>
</head>
<body>
    <div class="conversation">
        <h1>{{title}}</h1>
        {{#messages}}
        <div class="message {{role}}">
            <strong>{{author}}:</strong>
            {{#timestamp}}<span class="time">{{timestamp}}</span>{{/timestamp}}
            <div class="content">{{content}}</div>
        </div>
        {{/messages}}
    </div>
</body>
</html>
```

#### Markdown Template
```markdown
---
title: {{title}}
model: {{model}}
created: {{created_at}}
updated: {{updated_at}}
{{#metadata}}
metadata:
{{#each metadata}}
  {{@key}}: {{this}}
{{/each}}
{{/metadata}}
---

# {{title}}

{{#messages}}
## {{author}}

{{#timestamp}}*{{timestamp}}*{{/timestamp}}

{{content}}

{{/messages}}
```

### Post-Processing Options
```javascript
const exportOptions = {
    format: 'html',
    postProcessing: [
        'sanitize',           // Remove dangerous HTML
        'minify',            // Minify output
        'add-timestamps',    // Add timestamp annotations
        'remove-metadata',   // Strip metadata
        'markdown-to-html',  // Convert markdown content
        'custom-processor'   // Custom post-processor
    ]
};
```

---

## Development

### Setting up Development Environment

1. **Clone the Repository**
```bash
git clone https://github.com/peterparker1718/chatgpt-exporter.git
cd chatgpt-exporter
```

2. **Install Dependencies**
```bash
npm install
# or
pnpm install
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Build for Production**
```bash
npm run build
```

### Project Structure
```
src/
├── api.ts                    # API integration
├── main.tsx                 # Entry point
├── dynamic-ui-bridge.ts     # Integration bridge
├── dynamic-ui/              # Dynamic UI framework
│   ├── config/             # Configuration management
│   ├── engine/             # Core engine
│   ├── managers/           # Feature managers
│   └── components/         # UI components
├── exporter/               # Export functionality
├── ui/                     # Original UI components
├── locales/               # Translation files
├── styles/                # Styling
└── utils/                 # Utility functions
```

### Testing

#### Unit Tests
```bash
npm run test
```

#### Integration Tests
```bash
npm run test:integration
```

#### E2E Tests
```bash
npm run test:e2e
```

### Building Custom Exporters
```typescript
import { BaseExporter, ExportOptions, ConversationData } from './types';

class CustomExporter extends BaseExporter {
    async export(data: ConversationData, options: ExportOptions) {
        // Custom export logic
        const content = this.processData(data, options);
        
        return {
            filename: this.formatFilename(data.title, 'custom', options),
            content,
            mimeType: 'application/custom'
        };
    }
    
    private processData(data: ConversationData, options: ExportOptions): string {
        // Process conversation data
        return JSON.stringify(data, null, 2);
    }
}

// Register the exporter
engine.exportManager.registerExporter('custom', new CustomExporter());
```

### API Integration
```typescript
// Add custom API integration
const customAPI = {
    name: 'CustomAPI',
    baseUrl: 'https://api.custom.com/v1',
    apiKey: 'your-api-key',
    authentication: 'bearer',
    capabilities: ['chat', 'analysis', 'export'],
    responseFormat: 'json'
};

engine.apiManager.registerAPI('custom', customAPI);

// Use the API
const response = await engine.apiManager.request('custom', 'analyze', {
    method: 'POST',
    data: { conversation: conversationData }
});
```

### Performance Optimization

#### Code Splitting
```javascript
// Lazy load components
const LazyComponent = lazy(() => import('./HeavyComponent'));

// Dynamic imports for features
const loadFeature = async () => {
    const { AdvancedFeature } = await import('./AdvancedFeature');
    return AdvancedFeature;
};
```

#### Caching Strategy
```javascript
// Configure caching
const cacheConfig = {
    conversations: {
        ttl: 300000, // 5 minutes
        maxSize: 100
    },
    themes: {
        ttl: 3600000, // 1 hour
        maxSize: 20
    }
};

engine.setCacheConfig(cacheConfig);
```

---

## Troubleshooting

### Common Issues

#### 1. Dynamic UI Not Loading
**Symptoms**: Dynamic UI components don't appear
**Solutions**:
- Check console for JavaScript errors
- Verify userscript manager is enabled
- Ensure page is fully loaded before initialization
- Check for conflicting extensions

#### 2. Export Failures
**Symptoms**: Export operations fail or produce empty files
**Solutions**:
- Verify conversation data is available
- Check API permissions and rate limits
- Ensure sufficient browser storage
- Try different export formats

#### 3. Theme Not Applying
**Symptoms**: UI doesn't reflect theme changes
**Solutions**:
- Clear browser cache and cookies
- Check CSS custom property support
- Verify theme configuration
- Disable conflicting browser extensions

#### 4. API Connection Issues
**Symptoms**: API status shows disconnected or error
**Solutions**:
- Verify API keys are correct
- Check network connectivity
- Review CORS settings
- Check API rate limits

### Debug Mode
Enable debug mode for detailed logging:

```javascript
// Enable debug mode
engine.updateConfiguration({
    features: { debugging: true }
});

// Access debug logs
const logs = engine.getDebugLogs();
console.table(logs);

// Monitor events
engine.on('debug', (event) => {
    console.log('Debug event:', event);
});
```

### Performance Monitoring
```javascript
// Monitor performance
engine.on('performance', (metrics) => {
    console.log('Performance metrics:', metrics);
});

// Memory usage
const memoryUsage = engine.getMemoryUsage();
console.log('Memory usage:', memoryUsage);
```

### Browser Compatibility
- **Chrome**: 90+ (Recommended)
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

### Known Limitations
1. Some features require modern browser APIs
2. WebSocket support needed for real-time features
3. Service Worker support required for offline mode
4. Local storage needed for configuration persistence

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Style
- Follow TypeScript/JavaScript best practices
- Use ESLint configuration provided
- Write meaningful commit messages
- Add JSDoc comments for public APIs

### Reporting Issues
Please use our [Issue Template](https://github.com/peterparker1718/chatgpt-exporter/issues/new) when reporting bugs or requesting features.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Changelog

### Version 3.0.0 (Current)
- Complete rewrite with Dynamic UI Framework
- LML integration support
- Multi-API support (OpenAI, Monica AI)
- Enhanced export system with 7+ formats
- Real-time synchronization via WebSocket
- Comprehensive theming system
- Multi-language support
- Accessibility improvements
- Offline functionality
- Performance optimizations

### Previous Versions
See [CHANGELOG.md](CHANGELOG.md) for full version history.