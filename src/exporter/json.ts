import JSZip from 'jszip'
import { fetchConversation, getCurrentChatId, processConversation } from '../api'
import i18n from '../i18n'
import { checkIfConversationStarted } from '../page'
import { downloadFile, getFileNameWithFormat } from '../utils/download'
import type { ApiConversationWithId } from '../api'

export async function exportToJson(fileNameFormat: string, options: { officialFormat: boolean }) {
    if (!checkIfConversationStarted()) {
        alert(i18n.t('Please start a conversation first'))
        return false
    }

    const chatId = await getCurrentChatId()
    const rawConversation = await fetchConversation(chatId, false)
    const conversation = processConversation(rawConversation)

    const fileName = getFileNameWithFormat(fileNameFormat, 'json', { title: conversation.title, chatId })
    /**
     * The official format is just an array of the API response.
     */
    const content = conversationToJson(options.officialFormat ? [rawConversation] : rawConversation)
    downloadFile(fileName, 'application/json', content)

    return true
}

export async function exportAllToOfficialJson(_fileNameFormat: string, apiConversations: ApiConversationWithId[]) {
    const content = conversationToJson(apiConversations)
    downloadFile('chatgpt-export.json', 'application/json', content)

    return true
}

export async function exportAllToJson(fileNameFormat: string, apiConversations: ApiConversationWithId[]) {
    const zip = new JSZip()
    const filenameMap = new Map<string, number>()
    const conversations = apiConversations.map(x => ({
        conversation: processConversation(x),
        rawConversation: x,
    }))
    conversations.forEach(({ conversation, rawConversation }) => {
        let fileName = getFileNameWithFormat(fileNameFormat, 'json', {
            title: conversation.title,
            chatId: conversation.id,
            createTime: conversation.createTime,
            updateTime: conversation.updateTime,
        })
        if (filenameMap.has(fileName)) {
            const count = filenameMap.get(fileName) ?? 1
            filenameMap.set(fileName, count + 1)
            fileName = `${fileName.slice(0, -5)} (${count}).json`
        }
        else {
            filenameMap.set(fileName, 1)
        }
        const content = conversationToJson(rawConversation)
        zip.file(fileName, content)
    })

    const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: {
            level: 9,
        },
    })
    downloadFile('chatgpt-export.zip', 'application/zip', blob)

    return true
}

function conversationToJson(conversation: ApiConversationWithId | ApiConversationWithId[]) {
    return JSON.stringify(conversation)
}
