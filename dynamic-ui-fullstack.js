/**
 * ChatGPT Exporter Full-Stack JavaScript Package
 * Enhanced Dynamic UI with LML Integration and API Support
 * 
 * This comprehensive JavaScript file provides:
 * - Frontend dynamic UI components
 * - Backend API integration
 * - Real-time data processing
 * - Multi-format export capabilities
 * - Theme and language management
 * - WebSocket communication
 * - Service Worker for offline functionality
 */

// =============================================================================
// CONFIGURATION AND CONSTANTS
// =============================================================================

const CONFIG = {
    VERSION: '3.0.0',
    API_BASE_URL: 'https://api.openai.com/v1',
    MONICA_API_URL: 'https://api.monica.im/v1',
    WEBSOCKET_URL: 'wss://dynamic-ui.chatgpt-exporter.com',
    SUPPORTED_LANGUAGES: ['en', 'es', 'zh-Hans', 'zh-Hant', 'jp', 'tr', 'id'],
    SUPPORTED_FORMATS: ['json', 'markdown', 'html', 'xml', 'csv', 'txt', 'pdf'],
    THEMES: {
        'chatgpt-dark': {
            primary: '#10a37f',
            secondary: '#1a1a1a',
            background: '#212121',
            text: '#ffffff',
            border: '#4d4d4f'
        },
        'monica-light': {
            primary: '#2563eb',
            secondary: '#f8fafc',
            background: '#ffffff',
            text: '#1f2937',
            border: '#e5e7eb'
        },
        'adaptive': {
            primary: 'var(--adaptive-primary)',
            secondary: 'var(--adaptive-secondary)',
            background: 'var(--adaptive-background)',
            text: 'var(--adaptive-text)',
            border: 'var(--adaptive-border)'
        }
    },
    DEBUG: true
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

class Logger {
    static levels = { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3 };
    static currentLevel = CONFIG.DEBUG ? 0 : 1;

    static log(level, message, data = null) {
        if (this.levels[level] >= this.currentLevel) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [${level}] DynamicUI:`;
            
            if (data) {
                console[level.toLowerCase()](prefix, message, data);
            } else {
                console[level.toLowerCase()](prefix, message);
            }
        }
    }

    static debug(message, data) { this.log('DEBUG', message, data); }
    static info(message, data) { this.log('INFO', message, data); }
    static warn(message, data) { this.log('WARN', message, data); }
    static error(message, data) { this.log('ERROR', message, data); }
}

class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, listener) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(listener);
        return () => this.off(event, listener);
    }

    off(event, listener) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(l => l !== listener);
    }

    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(listener => {
            try {
                listener(data);
            } catch (error) {
                Logger.error(`Error in event listener for ${event}:`, error);
            }
        });
    }
}

class StorageManager {
    static PREFIX = 'chatgpt-exporter-';

    static get(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(this.PREFIX + key);
            return value ? JSON.parse(value) : defaultValue;
        } catch (error) {
            Logger.error(`Error reading from storage:`, error);
            return defaultValue;
        }
    }

    static set(key, value) {
        try {
            localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
        } catch (error) {
            Logger.error(`Error writing to storage:`, error);
        }
    }

    static remove(key) {
        localStorage.removeItem(this.PREFIX + key);
    }

    static clear() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(this.PREFIX))
            .forEach(key => localStorage.removeItem(key));
    }
}

// =============================================================================
// DYNAMIC UI ENGINE
// =============================================================================

class DynamicUIEngine extends EventEmitter {
    constructor() {
        super();
        this.config = this.loadConfiguration();
        this.apiManager = new APIManager(this.config.apis);
        this.themeManager = new ThemeManager(this.config.themes);
        this.exportManager = new ExportManager(this.config.exports);
        this.i18nManager = new I18nManager(this.config.language);
        this.websocketManager = new WebSocketManager(CONFIG.WEBSOCKET_URL);
        
        this.isInitialized = false;
        this.components = new Map();
        this.middleware = [];
        
        this.init();
    }

    async init() {
        Logger.info('Initializing Dynamic UI Engine...');
        
        try {
            // Initialize managers
            await this.apiManager.init();
            await this.themeManager.init();
            await this.exportManager.init();
            await this.i18nManager.init();
            await this.websocketManager.init();

            // Setup event listeners
            this.setupEventListeners();
            
            // Register service worker
            if ('serviceWorker' in navigator) {
                await this.registerServiceWorker();
            }

            // Initialize UI components
            this.initializeComponents();
            
            this.isInitialized = true;
            this.emit('initialized');
            Logger.info('Dynamic UI Engine initialized successfully');
            
        } catch (error) {
            Logger.error('Failed to initialize Dynamic UI Engine:', error);
            throw error;
        }
    }

    loadConfiguration() {
        const defaultConfig = {
            apis: {
                openai: {
                    baseUrl: CONFIG.API_BASE_URL,
                    apiKey: '',
                    model: 'gpt-4',
                    enabled: true
                },
                monica: {
                    baseUrl: CONFIG.MONICA_API_URL,
                    apiKey: '',
                    enabled: false
                }
            },
            themes: {
                current: 'chatgpt-dark',
                adaptive: false,
                customThemes: []
            },
            exports: {
                defaultFormat: 'markdown',
                includeTimestamps: true,
                includeMetadata: true,
                customTemplates: {}
            },
            language: {
                current: 'en',
                autoDetect: true,
                fallback: 'en'
            },
            features: {
                realTimeSync: true,
                offlineMode: true,
                analytics: false,
                debugging: CONFIG.DEBUG
            }
        };

        const savedConfig = StorageManager.get('config', {});
        return this.mergeDeep(defaultConfig, savedConfig);
    }

    mergeDeep(target, source) {
        const output = Object.assign({}, target);
        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target))
                        Object.assign(output, { [key]: source[key] });
                    else
                        output[key] = this.mergeDeep(target[key], source[key]);
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    }

    isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }

    setupEventListeners() {
        // Listen for configuration changes
        this.on('config-updated', (config) => {
            StorageManager.set('config', config);
            this.emit('ui-update-required');
        });

        // Listen for theme changes
        this.themeManager.on('theme-changed', (theme) => {
            this.emit('theme-applied', theme);
        });

        // Listen for language changes
        this.i18nManager.on('language-changed', (language) => {
            this.emit('language-applied', language);
        });

        // Listen for API status changes
        this.apiManager.on('status-changed', (status) => {
            this.emit('api-status-updated', status);
        });

        // Listen for export completions
        this.exportManager.on('export-completed', (result) => {
            this.emit('export-completed', result);
        });

        // Listen for WebSocket messages
        this.websocketManager.on('message', (message) => {
            this.handleWebSocketMessage(message);
        });

        // Browser events
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleVisibilityHidden();
            } else {
                this.handleVisibilityVisible();
            }
        });
    }

    async registerServiceWorker() {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            Logger.info('Service Worker registered:', registration);
            
            registration.addEventListener('updatefound', () => {
                Logger.info('Service Worker update found');
                this.emit('service-worker-update');
            });
        } catch (error) {
            Logger.error('Service Worker registration failed:', error);
        }
    }

    initializeComponents() {
        // Initialize core UI components
        this.registerComponent('menu', DynamicMenu);
        this.registerComponent('export-dialog', ExportDialog);
        this.registerComponent('settings-panel', SettingsPanel);
        this.registerComponent('debug-console', DebugConsole);
        this.registerComponent('api-panel', APIPanel);
        
        // Create and mount components
        this.mountComponents();
    }

    registerComponent(name, componentClass) {
        this.components.set(name, componentClass);
        Logger.debug(`Registered component: ${name}`);
    }

    mountComponents() {
        // Find mount points and create components
        document.querySelectorAll('[data-dynamic-ui]').forEach(element => {
            const componentName = element.dataset.dynamicUi;
            const ComponentClass = this.components.get(componentName);
            
            if (ComponentClass) {
                const component = new ComponentClass(element, this);
                element._dynamicUIComponent = component;
                Logger.debug(`Mounted component: ${componentName}`);
            }
        });
    }

    handleWebSocketMessage(message) {
        switch (message.type) {
            case 'config-update':
                this.updateConfiguration(message.data);
                break;
            case 'theme-update':
                this.themeManager.applyTheme(message.data);
                break;
            case 'export-request':
                this.exportManager.exportConversation(message.data);
                break;
            default:
                Logger.warn('Unknown WebSocket message type:', message.type);
        }
    }

    handleVisibilityHidden() {
        Logger.debug('Page became hidden');
        this.websocketManager.pause();
    }

    handleVisibilityVisible() {
        Logger.debug('Page became visible');
        this.websocketManager.resume();
    }

    updateConfiguration(updates) {
        this.config = this.mergeDeep(this.config, updates);
        this.emit('config-updated', this.config);
        Logger.info('Configuration updated');
    }

    getConfiguration() {
        return JSON.parse(JSON.stringify(this.config));
    }

    cleanup() {
        Logger.info('Cleaning up Dynamic UI Engine...');
        this.websocketManager.disconnect();
        this.components.forEach(component => {
            if (component.cleanup) {
                component.cleanup();
            }
        });
    }
}

// =============================================================================
// API MANAGER
// =============================================================================

class APIManager extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.clients = new Map();
        this.status = new Map();
        this.rateLimiter = new RateLimiter();
    }

    async init() {
        Logger.info('Initializing API Manager...');
        
        for (const [name, config] of Object.entries(this.config)) {
            if (config.enabled) {
                await this.initializeAPI(name, config);
            }
        }
    }

    async initializeAPI(name, config) {
        try {
            const client = new APIClient(config);
            await client.test();
            
            this.clients.set(name, client);
            this.updateStatus(name, 'connected');
            Logger.info(`API ${name} initialized successfully`);
            
        } catch (error) {
            this.updateStatus(name, 'error', error.message);
            Logger.error(`Failed to initialize API ${name}:`, error);
        }
    }

    updateStatus(apiName, status, message = null) {
        this.status.set(apiName, { status, message, timestamp: Date.now() });
        this.emit('status-changed', { api: apiName, status, message });
    }

    async request(apiName, endpoint, options = {}) {
        const client = this.clients.get(apiName);
        if (!client) {
            throw new Error(`API ${apiName} not available`);
        }

        // Apply rate limiting
        await this.rateLimiter.acquire(apiName);

        try {
            const response = await client.request(endpoint, options);
            this.updateStatus(apiName, 'connected');
            return response;
        } catch (error) {
            this.updateStatus(apiName, 'error', error.message);
            throw error;
        }
    }

    getStatus(apiName) {
        return this.status.get(apiName) || { status: 'unknown' };
    }

    getAllStatus() {
        const result = {};
        this.status.forEach((status, name) => {
            result[name] = status;
        });
        return result;
    }
}

class APIClient {
    constructor(config) {
        this.config = config;
        this.baseUrl = config.baseUrl;
        this.headers = this.buildHeaders(config);
    }

    buildHeaders(config) {
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': `ChatGPT-Exporter-Dynamic/${CONFIG.VERSION}`
        };

        if (config.apiKey) {
            headers['Authorization'] = `Bearer ${config.apiKey}`;
        }

        return headers;
    }

    async test() {
        try {
            const response = await fetch(`${this.baseUrl}/models`, {
                method: 'GET',
                headers: this.headers
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return true;
        } catch (error) {
            throw new Error(`API test failed: ${error.message}`);
        }
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}/${endpoint.replace(/^\//, '')}`;
        const requestOptions = {
            method: options.method || 'GET',
            headers: { ...this.headers, ...options.headers },
            ...options
        };

        if (requestOptions.method !== 'GET' && options.data) {
            requestOptions.body = JSON.stringify(options.data);
        }

        const response = await fetch(url, requestOptions);
        
        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }
}

class RateLimiter {
    constructor() {
        this.limits = new Map();
        this.defaultLimit = { requests: 60, window: 60000 }; // 60 requests per minute
    }

    async acquire(apiName) {
        const limit = this.limits.get(apiName) || this.defaultLimit;
        const key = `${apiName}-${Math.floor(Date.now() / limit.window)}`;
        
        const current = StorageManager.get(`ratelimit-${key}`, 0);
        
        if (current >= limit.requests) {
            const waitTime = limit.window - (Date.now() % limit.window);
            await this.sleep(waitTime);
            return this.acquire(apiName);
        }

        StorageManager.set(`ratelimit-${key}`, current + 1);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    setLimit(apiName, requests, windowMs) {
        this.limits.set(apiName, { requests, window: windowMs });
    }
}

// =============================================================================
// THEME MANAGER
// =============================================================================

class ThemeManager extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.currentTheme = null;
        this.adaptiveMode = false;
    }

    async init() {
        Logger.info('Initializing Theme Manager...');
        
        // Load current theme
        const themeName = this.config.current || 'chatgpt-dark';
        await this.applyTheme(themeName);

        // Setup adaptive theme detection if enabled
        if (this.config.adaptive) {
            this.enableAdaptiveMode();
        }

        // Listen for system theme changes
        this.setupSystemThemeListener();
    }

    async applyTheme(themeName) {
        let theme = CONFIG.THEMES[themeName];
        
        if (!theme && this.config.customThemes) {
            theme = this.config.customThemes.find(t => t.name === themeName);
        }

        if (!theme) {
            Logger.warn(`Theme ${themeName} not found, falling back to default`);
            theme = CONFIG.THEMES['chatgpt-dark'];
            themeName = 'chatgpt-dark';
        }

        this.currentTheme = { name: themeName, ...theme };
        this.applyThemeToDOM(this.currentTheme);
        
        this.emit('theme-changed', this.currentTheme);
        Logger.info(`Applied theme: ${themeName}`);
    }

    applyThemeToDOM(theme) {
        const root = document.documentElement;
        
        // Apply CSS custom properties
        Object.entries(theme).forEach(([key, value]) => {
            if (key !== 'name') {
                root.style.setProperty(`--theme-${key}`, value);
            }
        });

        // Update theme class on body
        document.body.className = document.body.className
            .replace(/theme-\w+/g, '')
            .trim();
        document.body.classList.add(`theme-${theme.name}`);

        // Apply dark/light mode
        if (theme.background && this.isLightColor(theme.background)) {
            document.body.classList.remove('dark');
            document.body.classList.add('light');
        } else {
            document.body.classList.remove('light');
            document.body.classList.add('dark');
        }
    }

    isLightColor(color) {
        // Simple heuristic to determine if a color is light
        const hex = color.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128;
    }

    enableAdaptiveMode() {
        this.adaptiveMode = true;
        
        // Detect system theme preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const adaptiveTheme = prefersDark ? 'chatgpt-dark' : 'monica-light';
        
        this.applyTheme(adaptiveTheme);
        Logger.info('Adaptive theme mode enabled');
    }

    setupSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', (e) => {
            if (this.adaptiveMode) {
                const themeName = e.matches ? 'chatgpt-dark' : 'monica-light';
                this.applyTheme(themeName);
            }
        });
    }

    createCustomTheme(name, properties) {
        const customTheme = { name, ...properties };
        
        if (!this.config.customThemes) {
            this.config.customThemes = [];
        }
        
        const existingIndex = this.config.customThemes.findIndex(t => t.name === name);
        if (existingIndex >= 0) {
            this.config.customThemes[existingIndex] = customTheme;
        } else {
            this.config.customThemes.push(customTheme);
        }

        Logger.info(`Created custom theme: ${name}`);
        return customTheme;
    }

    getAvailableThemes() {
        const themes = Object.keys(CONFIG.THEMES).map(name => ({
            name,
            type: 'built-in'
        }));

        if (this.config.customThemes) {
            themes.push(...this.config.customThemes.map(theme => ({
                name: theme.name,
                type: 'custom'
            })));
        }

        return themes;
    }

    getCurrentTheme() {
        return this.currentTheme;
    }
}

// =============================================================================
// EXPORT MANAGER
// =============================================================================

class ExportManager extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.exporters = new Map();
        this.queue = [];
        this.processing = false;
    }

    async init() {
        Logger.info('Initializing Export Manager...');
        
        // Register built-in exporters
        this.registerExporter('json', new JSONExporter());
        this.registerExporter('markdown', new MarkdownExporter());
        this.registerExporter('html', new HTMLExporter());
        this.registerExporter('xml', new XMLExporter());
        this.registerExporter('csv', new CSVExporter());
        this.registerExporter('txt', new TextExporter());
        this.registerExporter('pdf', new PDFExporter());
    }

    registerExporter(format, exporter) {
        this.exporters.set(format, exporter);
        Logger.debug(`Registered exporter: ${format}`);
    }

    async exportConversation(conversationData, options = {}) {
        const format = options.format || this.config.defaultFormat;
        const exporter = this.exporters.get(format);
        
        if (!exporter) {
            throw new Error(`Unsupported export format: ${format}`);
        }

        const exportOptions = {
            includeTimestamps: this.config.includeTimestamps,
            includeMetadata: this.config.includeMetadata,
            ...options
        };

        try {
            Logger.info(`Starting export to ${format}`);
            this.emit('export-started', { format, options: exportOptions });

            const result = await exporter.export(conversationData, exportOptions);
            
            // Apply post-processing if specified
            if (exportOptions.postProcessing) {
                result.content = await this.applyPostProcessing(result.content, exportOptions.postProcessing);
            }

            // Download or save the file
            if (exportOptions.download !== false) {
                this.downloadFile(result.filename, result.content, result.mimeType);
            }

            this.emit('export-completed', { format, result, options: exportOptions });
            Logger.info(`Export completed: ${format}`);
            
            return result;
            
        } catch (error) {
            this.emit('export-failed', { format, error, options: exportOptions });
            Logger.error(`Export failed:`, error);
            throw error;
        }
    }

    async batchExport(conversations, formats, options = {}) {
        const results = [];
        
        for (const conversation of conversations) {
            for (const format of formats) {
                try {
                    const result = await this.exportConversation(conversation, {
                        ...options,
                        format,
                        download: false
                    });
                    results.push(result);
                } catch (error) {
                    Logger.error(`Batch export failed for ${conversation.id} in ${format}:`, error);
                }
            }
        }

        // Create ZIP file with all exports
        if (results.length > 0 && options.createZip !== false) {
            const zipFile = await this.createZipArchive(results);
            this.downloadFile('chatgpt-export.zip', zipFile, 'application/zip');
        }

        return results;
    }

    async applyPostProcessing(content, processors) {
        for (const processor of processors) {
            switch (processor) {
                case 'minify-html':
                    content = this.minifyHTML(content);
                    break;
                case 'remove-timestamps':
                    content = this.removeTimestamps(content);
                    break;
                case 'markdown-to-html':
                    content = this.markdownToHTML(content);
                    break;
                case 'sanitize':
                    content = this.sanitizeContent(content);
                    break;
                default:
                    Logger.warn(`Unknown post-processor: ${processor}`);
            }
        }
        return content;
    }

    minifyHTML(html) {
        return html
            .replace(/\s+/g, ' ')
            .replace(/>\s+</g, '><')
            .trim();
    }

    removeTimestamps(content) {
        return content.replace(/\*\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}[^*]*\*/g, '');
    }

    markdownToHTML(markdown) {
        // Simple markdown to HTML converter
        return markdown
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*)\*/gim, '<em>$1</em>')
            .replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, '<img alt="$1" src="$2" />')
            .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2">$1</a>')
            .replace(/\n/gim, '<br>');
    }

    sanitizeContent(content) {
        return content
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/javascript:/gi, '');
    }

    downloadFile(filename, content, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        Logger.debug(`Downloaded file: ${filename}`);
    }

    async createZipArchive(files) {
        // This would require a ZIP library like JSZip
        // For now, return a simple archive representation
        const archive = {
            files: files.map(f => ({
                name: f.filename,
                content: f.content
            })),
            created: new Date().toISOString()
        };
        
        return JSON.stringify(archive, null, 2);
    }
}

// =============================================================================
// EXPORTER CLASSES
// =============================================================================

class BaseExporter {
    async export(conversationData, options) {
        throw new Error('Export method must be implemented by subclass');
    }

    formatFilename(title, format, options = {}) {
        const sanitized = title.replace(/[^\w\s-]/g, '').trim();
        const timestamp = options.includeTimestamp ? `-${Date.now()}` : '';
        return `${sanitized}${timestamp}.${format}`;
    }

    formatTimestamp(timestamp, options = {}) {
        if (!timestamp) return '';
        
        const date = new Date(timestamp);
        if (options.format === 'iso') {
            return date.toISOString();
        } else if (options.format === 'local') {
            return date.toLocaleString();
        } else {
            return date.toUTCString();
        }
    }
}

class JSONExporter extends BaseExporter {
    async export(conversationData, options) {
        const data = {
            id: conversationData.id,
            title: conversationData.title,
            model: conversationData.model,
            created_at: conversationData.created_at,
            updated_at: conversationData.updated_at,
            messages: conversationData.messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                ...(options.includeTimestamps && msg.timestamp && { timestamp: msg.timestamp }),
                ...(options.includeMetadata && msg.metadata && { metadata: msg.metadata })
            }))
        };

        if (options.includeMetadata && conversationData.metadata) {
            data.metadata = conversationData.metadata;
        }

        return {
            filename: this.formatFilename(conversationData.title, 'json', options),
            content: JSON.stringify(data, null, 2),
            mimeType: 'application/json'
        };
    }
}

class MarkdownExporter extends BaseExporter {
    async export(conversationData, options) {
        let content = '';
        
        // Add frontmatter
        content += '---\n';
        content += `title: ${conversationData.title}\n`;
        content += `model: ${conversationData.model}\n`;
        content += `created: ${conversationData.created_at}\n`;
        content += `updated: ${conversationData.updated_at}\n`;
        content += '---\n\n';
        
        // Add title
        content += `# ${conversationData.title}\n\n`;
        
        // Add messages
        for (const message of conversationData.messages) {
            const author = this.formatAuthor(message.role);
            content += `## ${author}\n\n`;
            
            if (options.includeTimestamps && message.timestamp) {
                content += `*${this.formatTimestamp(message.timestamp)}*\n\n`;
            }
            
            content += `${message.content}\n\n`;
        }
        
        return {
            filename: this.formatFilename(conversationData.title, 'md', options),
            content,
            mimeType: 'text/markdown'
        };
    }

    formatAuthor(role) {
        const roleMap = {
            'user': 'You',
            'assistant': 'ChatGPT',
            'system': 'System',
            'tool': 'Tool'
        };
        return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
    }
}

class HTMLExporter extends BaseExporter {
    async export(conversationData, options) {
        const template = this.getTemplate(options.template);
        const content = this.renderTemplate(template, conversationData, options);
        
        return {
            filename: this.formatFilename(conversationData.title, 'html', options),
            content,
            mimeType: 'text/html'
        };
    }

    getTemplate(templateName) {
        const templates = {
            default: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
        .message { margin: 20px 0; padding: 15px; border-radius: 8px; }
        .user { background: #e3f2fd; border-left: 4px solid #2196f3; }
        .assistant { background: #f1f8e9; border-left: 4px solid #4caf50; }
        .author { font-weight: bold; margin-bottom: 8px; }
        .timestamp { font-size: 0.8em; color: #666; }
        .content { white-space: pre-wrap; }
    </style>
</head>
<body>
    <div class="container">
        <h1>{{title}}</h1>
        <div class="metadata">
            <strong>Model:</strong> {{model}}<br>
            <strong>Created:</strong> {{created_at}}<br>
            <strong>Updated:</strong> {{updated_at}}
        </div>
        {{#messages}}
        <div class="message {{role}}">
            <div class="author">{{author}}</div>
            {{#timestamp}}<div class="timestamp">{{timestamp}}</div>{{/timestamp}}
            <div class="content">{{content}}</div>
        </div>
        {{/messages}}
    </div>
</body>
</html>`
        };
        
        return templates[templateName] || templates.default;
    }

    renderTemplate(template, data, options) {
        // Simple template renderer (in production, use a proper template engine)
        let content = template;
        
        // Replace basic variables
        content = content.replace(/\{\{title\}\}/g, data.title);
        content = content.replace(/\{\{model\}\}/g, data.model);
        content = content.replace(/\{\{created_at\}\}/g, data.created_at);
        content = content.replace(/\{\{updated_at\}\}/g, data.updated_at);
        
        // Replace messages
        let messagesHtml = '';
        for (const message of data.messages) {
            let messageHtml = `
            <div class="message ${message.role}">
                <div class="author">${this.formatAuthor(message.role)}</div>
                ${options.includeTimestamps && message.timestamp ? 
                    `<div class="timestamp">${this.formatTimestamp(message.timestamp)}</div>` : ''}
                <div class="content">${this.escapeHtml(message.content)}</div>
            </div>`;
            messagesHtml += messageHtml;
        }
        
        content = content.replace(/\{\{#messages\}\}.*?\{\{\/messages\}\}/s, messagesHtml);
        
        return content;
    }

    formatAuthor(role) {
        const roleMap = {
            'user': 'You',
            'assistant': 'ChatGPT',
            'system': 'System',
            'tool': 'Tool'
        };
        return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

class XMLExporter extends BaseExporter {
    async export(conversationData, options) {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += `<conversation id="${conversationData.id}" title="${this.escapeXml(conversationData.title)}" model="${conversationData.model}">\n`;
        xml += `  <metadata>\n`;
        xml += `    <created_at>${conversationData.created_at}</created_at>\n`;
        xml += `    <updated_at>${conversationData.updated_at}</updated_at>\n`;
        xml += `  </metadata>\n`;
        xml += `  <messages>\n`;
        
        for (const message of conversationData.messages) {
            xml += `    <message role="${message.role}"`;
            if (options.includeTimestamps && message.timestamp) {
                xml += ` timestamp="${message.timestamp}"`;
            }
            xml += `>\n`;
            xml += `      <content><![CDATA[${message.content}]]></content>\n`;
            xml += `    </message>\n`;
        }
        
        xml += `  </messages>\n`;
        xml += `</conversation>\n`;
        
        return {
            filename: this.formatFilename(conversationData.title, 'xml', options),
            content: xml,
            mimeType: 'application/xml'
        };
    }

    escapeXml(text) {
        return text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    }
}

class CSVExporter extends BaseExporter {
    async export(conversationData, options) {
        const headers = ['role', 'content'];
        if (options.includeTimestamps) headers.push('timestamp');
        if (options.includeMetadata) headers.push('metadata');
        
        let csv = headers.join(',') + '\n';
        
        for (const message of conversationData.messages) {
            const row = [
                this.escapeCsv(message.role),
                this.escapeCsv(message.content)
            ];
            
            if (options.includeTimestamps) {
                row.push(this.escapeCsv(message.timestamp || ''));
            }
            
            if (options.includeMetadata) {
                row.push(this.escapeCsv(JSON.stringify(message.metadata || {})));
            }
            
            csv += row.join(',') + '\n';
        }
        
        return {
            filename: this.formatFilename(conversationData.title, 'csv', options),
            content: csv,
            mimeType: 'text/csv'
        };
    }

    escapeCsv(field) {
        if (typeof field !== 'string') {
            field = String(field);
        }
        
        if (field.includes(',') || field.includes('"') || field.includes('\n')) {
            return '"' + field.replace(/"/g, '""') + '"';
        }
        
        return field;
    }
}

class TextExporter extends BaseExporter {
    async export(conversationData, options) {
        let content = `Conversation: ${conversationData.title}\n`;
        content += `Model: ${conversationData.model}\n`;
        content += `Created: ${conversationData.created_at}\n`;
        content += `Updated: ${conversationData.updated_at}\n`;
        content += '='.repeat(80) + '\n\n';
        
        for (const message of conversationData.messages) {
            const author = this.formatAuthor(message.role);
            
            if (options.includeTimestamps && message.timestamp) {
                content += `${author} (${this.formatTimestamp(message.timestamp)}):\n`;
            } else {
                content += `${author}:\n`;
            }
            
            content += message.content + '\n';
            content += '-'.repeat(40) + '\n\n';
        }
        
        return {
            filename: this.formatFilename(conversationData.title, 'txt', options),
            content,
            mimeType: 'text/plain'
        };
    }

    formatAuthor(role) {
        const roleMap = {
            'user': 'You',
            'assistant': 'ChatGPT',
            'system': 'System',
            'tool': 'Tool'
        };
        return roleMap[role] || role.charAt(0).toUpperCase() + role.slice(1);
    }
}

class PDFExporter extends BaseExporter {
    async export(conversationData, options) {
        // For PDF export, we'd typically use a library like jsPDF
        // For now, return HTML that can be printed to PDF
        const htmlExporter = new HTMLExporter();
        const htmlResult = await htmlExporter.export(conversationData, options);
        
        // Add print-specific styles
        const printStyles = `
            <style>
                @media print {
                    body { background: white !important; }
                    .container { box-shadow: none !important; }
                }
            </style>
        `;
        
        const content = htmlResult.content.replace('</head>', printStyles + '</head>');
        
        return {
            filename: this.formatFilename(conversationData.title, 'html', options),
            content,
            mimeType: 'text/html'
        };
    }
}

// =============================================================================
// I18N MANAGER
// =============================================================================

class I18nManager extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.currentLanguage = config.current || 'en';
        this.translations = new Map();
        this.fallbackLanguage = config.fallback || 'en';
    }

    async init() {
        Logger.info('Initializing I18n Manager...');
        
        // Load translations for current language
        await this.loadLanguage(this.currentLanguage);
        
        if (this.currentLanguage !== this.fallbackLanguage) {
            await this.loadLanguage(this.fallbackLanguage);
        }

        // Auto-detect language if enabled
        if (this.config.autoDetect) {
            this.detectLanguage();
        }
    }

    async loadLanguage(languageCode) {
        try {
            // In a real implementation, this would fetch from /src/locales/
            const response = await fetch(`/src/locales/${languageCode}.json`);
            if (response.ok) {
                const translations = await response.json();
                this.translations.set(languageCode, translations);
                Logger.info(`Loaded translations for ${languageCode}`);
            }
        } catch (error) {
            Logger.error(`Failed to load translations for ${languageCode}:`, error);
        }
    }

    detectLanguage() {
        const browserLanguage = navigator.language || navigator.userLanguage;
        const detectedCode = browserLanguage.split('-')[0];
        
        if (CONFIG.SUPPORTED_LANGUAGES.includes(detectedCode) && detectedCode !== this.currentLanguage) {
            this.setLanguage(detectedCode);
        }
    }

    async setLanguage(languageCode) {
        if (!CONFIG.SUPPORTED_LANGUAGES.includes(languageCode)) {
            Logger.warn(`Unsupported language: ${languageCode}`);
            return;
        }

        await this.loadLanguage(languageCode);
        this.currentLanguage = languageCode;
        
        // Update document language
        document.documentElement.lang = languageCode;
        
        this.emit('language-changed', languageCode);
        Logger.info(`Language changed to: ${languageCode}`);
    }

    t(key, params = {}) {
        const translations = this.translations.get(this.currentLanguage) || {};
        const fallbackTranslations = this.translations.get(this.fallbackLanguage) || {};
        
        let text = translations[key] || fallbackTranslations[key] || key;
        
        // Replace parameters
        Object.entries(params).forEach(([param, value]) => {
            text = text.replace(new RegExp(`\\{${param}\\}`, 'g'), value);
        });
        
        return text;
    }

    getCurrentLanguage() {
        return this.currentLanguage;
    }

    getSupportedLanguages() {
        return CONFIG.SUPPORTED_LANGUAGES;
    }
}

// =============================================================================
// WEBSOCKET MANAGER
// =============================================================================

class WebSocketManager extends EventEmitter {
    constructor(url) {
        super();
        this.url = url;
        this.ws = null;
        this.connected = false;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.paused = false;
    }

    async init() {
        if (this.url && typeof WebSocket !== 'undefined') {
            await this.connect();
        }
    }

    async connect() {
        if (this.connected || this.paused) return;

        try {
            this.ws = new WebSocket(this.url);
            
            this.ws.onopen = () => {
                this.connected = true;
                this.reconnectAttempts = 0;
                Logger.info('WebSocket connected');
                this.emit('connected');
            };

            this.ws.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);
                    this.emit('message', message);
                } catch (error) {
                    Logger.error('Invalid WebSocket message:', error);
                }
            };

            this.ws.onclose = () => {
                this.connected = false;
                Logger.info('WebSocket disconnected');
                this.emit('disconnected');
                
                if (!this.paused && this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.scheduleReconnect();
                }
            };

            this.ws.onerror = (error) => {
                Logger.error('WebSocket error:', error);
                this.emit('error', error);
            };

        } catch (error) {
            Logger.error('Failed to connect WebSocket:', error);
        }
    }

    scheduleReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        setTimeout(() => {
            if (!this.connected && !this.paused) {
                Logger.info(`Attempting to reconnect WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connect();
            }
        }, delay);
    }

    send(message) {
        if (this.connected && this.ws) {
            this.ws.send(JSON.stringify(message));
        } else {
            Logger.warn('Cannot send message: WebSocket not connected');
        }
    }

    pause() {
        this.paused = true;
        if (this.ws) {
            this.ws.close();
        }
    }

    resume() {
        this.paused = false;
        if (!this.connected) {
            this.connect();
        }
    }

    disconnect() {
        this.paused = true;
        if (this.ws) {
            this.ws.close();
        }
    }
}

// =============================================================================
// UI COMPONENTS
// =============================================================================

class DynamicMenu {
    constructor(element, engine) {
        this.element = element;
        this.engine = engine;
        this.isExpanded = false;
        this.init();
    }

    init() {
        this.render();
        this.bindEvents();
    }

    render() {
        this.element.innerHTML = `
            <div class="dynamic-menu">
                <button class="menu-toggle">
                    <span class="menu-icon">⚡</span>
                    Dynamic UI
                </button>
                <div class="menu-content" style="display: none;">
                    <div class="section">
                        <label>Export Formats:</label>
                        <div class="format-grid">
                            ${CONFIG.SUPPORTED_FORMATS.map(format => 
                                `<button class="format-button" data-format="${format}">${format.toUpperCase()}</button>`
                            ).join('')}
                        </div>
                    </div>
                    <div class="section">
                        <label>Theme:</label>
                        <select class="theme-selector">
                            ${this.engine.themeManager.getAvailableThemes().map(theme =>
                                `<option value="${theme.name}">${theme.name}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <div class="section">
                        <label>Language:</label>
                        <select class="language-selector">
                            ${CONFIG.SUPPORTED_LANGUAGES.map(lang =>
                                `<option value="${lang}">${lang}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
            </div>
        `;
    }

    bindEvents() {
        const toggle = this.element.querySelector('.menu-toggle');
        const content = this.element.querySelector('.menu-content');
        
        toggle.addEventListener('click', () => {
            this.isExpanded = !this.isExpanded;
            content.style.display = this.isExpanded ? 'block' : 'none';
        });

        // Format buttons
        this.element.querySelectorAll('.format-button').forEach(button => {
            button.addEventListener('click', () => {
                const format = button.dataset.format;
                this.handleExport(format);
            });
        });

        // Theme selector
        const themeSelector = this.element.querySelector('.theme-selector');
        themeSelector.addEventListener('change', () => {
            this.engine.themeManager.applyTheme(themeSelector.value);
        });

        // Language selector
        const languageSelector = this.element.querySelector('.language-selector');
        languageSelector.addEventListener('change', () => {
            this.engine.i18nManager.setLanguage(languageSelector.value);
        });
    }

    async handleExport(format) {
        try {
            // Get current conversation data (this would need to be implemented)
            const conversationData = await this.getCurrentConversationData();
            
            if (conversationData) {
                await this.engine.exportManager.exportConversation(conversationData, { format });
            } else {
                Logger.warn('No conversation data available for export');
            }
        } catch (error) {
            Logger.error(`Export failed:`, error);
        }
    }

    async getCurrentConversationData() {
        // This would integrate with the existing ChatGPT exporter functionality
        // For now, return null to indicate no data available
        return null;
    }
}

// =============================================================================
// INITIALIZATION AND GLOBAL ACCESS
// =============================================================================

// Global instance
let dynamicUIEngine = null;

// Initialize when DOM is ready
function initializeDynamicUI() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDynamicUI);
        return;
    }

    Logger.info('Starting Dynamic UI initialization...');
    
    try {
        dynamicUIEngine = new DynamicUIEngine();
        
        // Make engine globally accessible for debugging
        if (CONFIG.DEBUG) {
            window.DynamicUI = dynamicUIEngine;
        }
        
    } catch (error) {
        Logger.error('Failed to initialize Dynamic UI:', error);
    }
}

// Auto-initialize
initializeDynamicUI();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DynamicUIEngine,
        CONFIG,
        Logger,
        StorageManager
    };
}

// =============================================================================
// SERVICE WORKER CODE (to be saved as sw.js)
// =============================================================================

const SERVICE_WORKER_CODE = `
const CACHE_NAME = 'chatgpt-exporter-dynamic-v1';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/dynamic-ui.html',
    '/src/style.css',
    '/src/locales/en.json'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(STATIC_ASSETS))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
`;

// Create service worker file if we're in a browser environment
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    // This would typically be saved as a separate sw.js file
    console.log('Service Worker code ready for deployment');
}