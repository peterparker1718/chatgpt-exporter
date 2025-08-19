/**
 * Dynamic UI Integration Bridge
 * Connects the new dynamic UI framework with existing ChatGPT Exporter functionality
 */

import { fetchConversation, getCurrentChatId, processConversation } from './api'
import { exportToJson } from './exporter/json'
import { exportToMarkdown } from './exporter/markdown'
import { exportToHtml } from './exporter/html'
import { exportToPng } from './exporter/image'
import { exportToText } from './exporter/text'

// Extend Window interface for dynamic properties
declare global {
    interface Window {
        DynamicUI_getConversationData?: () => Promise<any>
        DynamicUIBridge?: DynamicUIBridge
    }
}

// Import Dynamic UI engine types (would be from the actual implementation)
interface DynamicUIEngine {
    exportManager: any
    apiManager: any
    themeManager: any
    init(): Promise<void>
    getDebugLogs(): any[]
}

class DynamicUIBridge {
    private engine: DynamicUIEngine | null = null

    async initialize() {
        try {
            // Initialize the dynamic UI engine
            // This would be: this.engine = new DynamicUIEngine()
            // For now, we'll create a mock implementation
            this.engine = await this.createMockEngine()
            
            // Setup bridge between existing and new functionality
            this.setupExportBridge()
            this.setupConversationBridge()
            this.setupUIBridge()
            
            console.log('Dynamic UI Bridge initialized successfully')
        } catch (error) {
            console.error('Failed to initialize Dynamic UI Bridge:', error)
        }
    }

    private async createMockEngine(): Promise<DynamicUIEngine> {
        // Mock implementation for demonstration
        return {
            exportManager: {
                exportConversation: async (_data: any, options: any) => {
                    console.log('Mock export:', options.format)
                    return { success: true }
                }
            },
            apiManager: {
                getAllStatus: () => ({
                    openai: { status: 'connected', timestamp: Date.now() },
                    monica: { status: 'disconnected', timestamp: Date.now() }
                })
            },
            themeManager: {
                applyTheme: async (theme: string) => {
                    console.log('Mock theme applied:', theme)
                    document.body.className = `theme-${theme}`
                }
            },
            init: async () => {
                console.log('Mock engine initialized')
            },
            getDebugLogs: () => []
        }
    }

    private setupExportBridge() {
        if (!this.engine) return

        // Override the export manager to use existing exporters
        const originalExportManager = this.engine.exportManager
        
        // Bridge the export functionality
        const bridgedExport = async (_conversationData: any, options: any) => {
            const fileNameFormat = options.fileNameFormat || '{title}'
            
            switch (options.format) {
                case 'json':
                    return await exportToJson(fileNameFormat, { 
                        officialFormat: options.officialFormat || false 
                    })
                case 'markdown':
                    return await exportToMarkdown(fileNameFormat, options.metaList || [])
                case 'html':
                    return await exportToHtml(fileNameFormat, options.metaList || [])
                case 'png':
                    return await exportToPng(fileNameFormat)
                case 'txt':
                    return await exportToText()
                default:
                    throw new Error(`Unsupported format: ${options.format}`)
            }
        }

        // Replace the export method
        originalExportManager.exportConversation = bridgedExport
    }

    private setupConversationBridge() {
        if (!this.engine) return

        // Bridge conversation data fetching
        const getConversationData = async () => {
            try {
                const chatId = await getCurrentChatId()
                if (!chatId) return null

                const rawConversation = await fetchConversation(chatId, true)
                return processConversation(rawConversation)
            } catch (error) {
                console.error('Error fetching conversation data:', error)
                return null
            }
        }

        // Make this available to the dynamic UI components
        window.DynamicUI_getConversationData = getConversationData
    }

    private setupUIBridge() {
        // Create dynamic UI toggle button
        const createToggleButton = () => {
            const button = document.createElement('button')
            button.className = 'dynamic-ui-toggle'
            button.innerHTML = '⚡ Dynamic'
            button.title = 'Toggle Dynamic UI'
            
            let showDynamicUI = false
            
            button.addEventListener('click', () => {
                showDynamicUI = !showDynamicUI
                this.toggleDynamicUI(showDynamicUI)
            })
            
            return button
        }

        // Find the original menu and add toggle
        const menuContainer = document.querySelector('nav')
        if (menuContainer) {
            const toggleButton = createToggleButton()
            menuContainer.appendChild(toggleButton)
        }

        // Store reference to original menu for later replacement
        // this.originalMenuContainer = document.querySelector('.menu-container') as HTMLDivElement
    }

    private toggleDynamicUI(show: boolean) {
        if (show) {
            this.showDynamicUIOverlay()
        } else {
            this.hideDynamicUIOverlay()
        }
    }

    private showDynamicUIOverlay() {
        // Create overlay
        const overlay = document.createElement('div')
        overlay.className = 'dynamic-ui-overlay'
        overlay.id = 'dynamic-ui-overlay'
        
        // Create dynamic UI content
        const content = document.createElement('div')
        content.className = 'dynamic-ui-content'
        content.innerHTML = `
            <div class="dynamic-ui-panel">
                <h3>Dynamic UI Controls</h3>
                <button onclick="window.DynamicUIBridge?.getEngine()?.themeManager?.applyTheme('chatgpt-dark')">
                    ChatGPT Dark Theme
                </button>
                <button onclick="window.DynamicUIBridge?.getEngine()?.themeManager?.applyTheme('monica-light')">
                    Monica Light Theme
                </button>
                <button onclick="document.getElementById('dynamic-ui-overlay')?.remove()">
                    Close
                </button>
            </div>
        `
        
        overlay.appendChild(content)
        document.body.appendChild(overlay)
        
        // Close on overlay click
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove()
            }
        })
    }

    private hideDynamicUIOverlay() {
        const overlay = document.getElementById('dynamic-ui-overlay')
        if (overlay) {
            overlay.remove()
        }
    }

    getEngine(): DynamicUIEngine | null {
        return this.engine
    }

    async testIntegration() {
        if (!this.engine) {
            console.error('Dynamic UI Engine not initialized')
            return false
        }

        try {
            // Test API connections
            const apiStatus = this.engine.apiManager.getAllStatus()
            console.log('API Status:', apiStatus)

            // Test theme system
            await this.engine.themeManager.applyTheme('chatgpt-dark')
            console.log('Theme applied successfully')

            // Test conversation fetching
            const conversationData = await (window as any).DynamicUI_getConversationData?.()
            if (conversationData) {
                console.log('Conversation data available:', conversationData.title)
            } else {
                console.log('No conversation data available (this is normal if no conversation is open)')
            }

            return true
        } catch (error) {
            console.error('Integration test failed:', error)
            return false
        }
    }
}

// Enhanced styles for the bridge
const bridgeStyles = `
.enhanced-menu-bridge {
    position: relative;
}

.dynamic-ui-toggle {
    position: absolute;
    top: -40px;
    right: 0;
    background: var(--chatgpt-green, #10a37f);
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 1000;
}

.dynamic-ui-toggle:hover {
    background: var(--chatgpt-green-dark, #0d8b6b);
    transform: translateY(-1px);
}

.dynamic-ui-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
    display: flex;
    align-items: center;
    justify-content: center;
}

/* Integration-specific dynamic UI styles */
.theme-integration {
    --theme-primary: var(--chatgpt-green, #10a37f);
    --theme-background: var(--chatgpt-background, #212121);
    --theme-text: var(--chatgpt-text, #ffffff);
    --theme-surface: var(--chatgpt-surface, #2f2f2f);
    --theme-border: var(--chatgpt-border, #4d4d4f);
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .dynamic-ui-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        top: auto;
    }
}
`

// Inject styles
const styleSheet = document.createElement('style')
styleSheet.textContent = bridgeStyles
document.head.appendChild(styleSheet)

// Global bridge instance
let dynamicUIBridge: DynamicUIBridge | null = null

// Initialize the bridge when the page is ready
function initializeDynamicUIBridge() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeDynamicUIBridge)
        return
    }

    dynamicUIBridge = new DynamicUIBridge()
    dynamicUIBridge.initialize()

    // Make available globally for debugging
    if (typeof window !== 'undefined') {
        (window as any).DynamicUIBridge = dynamicUIBridge
    }
}

// Auto-initialize
initializeDynamicUIBridge()

// Export for module usage
export { DynamicUIBridge, dynamicUIBridge }
export default DynamicUIBridge