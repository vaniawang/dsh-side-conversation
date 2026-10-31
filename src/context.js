/**
 * Context organization helpers for side conversations.
 *
 * The parent snapshot stays small by default (Inline), while every interesting
 * object gets a stable reference. `recallFromMessages` expands one reference at
 * a time and inlines the next-hop IDs (Chain of Recall), so long histories do
 * not have to be copied into every request.
 */

const DEFAULT_SNIPPET = 80

export function textOfMessage(message) {
  if (!message || !Array.isArray(message.content)) return ''
  const parts = []
  for (const block of message.content) {
    if (block?.type === 'text' && typeof block.text === 'string' && block.text.trim() !== '') {
      parts.push(block.text.trim())
    } else if (block?.type === 'tool-call') {
      parts.push('[tool call] ' + String(block.name || '?') + ' ' + String(block.arguments || ''))
    } else if (block?.type === 'tool-result' && typeof block.text === 'string') {
      parts.push(String(block.text))
    }
  }
  return parts.join('\n').trim()
}

function snippet(text, limit = DEFAULT_SNIPPET) {
  const oneLine = String(text || '').replace(/\s+/g, ' ').trim()
  return oneLine.length > limit ? oneLine.slice(0, limit - 1) + '…' : oneLine
}

function messageRef(index, message) {
  const role = message?.role || '?'
  return `msg:${index} ${role}: ${snippet(textOfMessage(message))}`
}

function toolRefs(messages, limit = 6) {
  const finished = new Set()
  for (const message of messages) {
    if (message?.role === 'tool' && message.toolCallId) finished.add(String(message.toolCallId))
  }
  const refs = []
  for (let index = messages.length - 1; index >= 0 && refs.length < limit; index -= 1) {
    const message = messages[index]
    if (message?.role !== 'assistant' || !Array.isArray(message.content)) continue
    for (let blockIndex = message.content.length - 1; blockIndex >= 0 && refs.length < limit; blockIndex -= 1) {
      const block = message.content[blockIndex]
      if (block?.type !== 'tool-call' || typeof block.id !== 'string') continue
      const status = finished.has(block.id) ? 'completed' : 'pending'
      refs.push(`tool:${block.id} ${String(block.name || '?')} (${status})`)
    }
  }
  return refs.reverse()
}

/**
 * Build the compact parent-context reference index. It intentionally contains
 * IDs and short snippets only; message/tool bodies stay out of the window.
 */
export function buildContextIndex(messages, options = {}) {
  const sessionId = String(options.sessionId || '')
  const seq = Number.isFinite(options.seq) ? Number(options.seq) : undefined
  const limit = Math.max(1, Math.min(20, Number(options.limit) || 8))
  const messageLines = []
  const start = Math.max(0, messages.length - limit)
  for (let index = start; index < messages.length; index += 1) {
    const line = messageRef(index, messages[index])
    if (line !== '') messageLines.push('  - ' + line)
  }
  if (messageLines.length === 0) return ''

  const lines = ['### Reference index (Inline & Spill)']
  if (sessionId !== '') lines.push('- parent session: ' + sessionId + (seq === undefined ? '' : ' (seq ' + seq + ')'))
  lines.push('- recent message refs (oldest → newest):', ...messageLines)
  const toolLines = toolRefs(messages)
  if (toolLines.length > 0) lines.push('- tool refs:', ...toolLines.map((line) => '  - ' + line))
  lines.push('- Expand one ref at a time with recall_main_conversation({kind:"message", id:"msg:<n>"}) or {kind:"tool", id:"tool:<id>"}; the response inlines the next-hop refs.')
  return lines.join('\n')
}

function parseMessageIndex(id) {
  const raw = String(id || '')
  const match = /^(?:msg:)?(\d+)$/.exec(raw)
  return match ? Number(match[1]) : undefined
}

/**
 * Chain-of-recall expansion for one parent reference. Returns the expanded text
 * plus next-hop IDs. Unknown refs return a short not-found message, never throw.
 */
export function recallFromMessages(messages, kind, id, options = {}) {
  const maxChars = Math.max(500, Math.min(40000, Number(options.maxChars) || 12000))
  const list = Array.isArray(messages) ? messages : []
  const normalizedKind = String(kind || 'message')

  if (normalizedKind === 'message') {
    const index = parseMessageIndex(id)
    if (index === undefined || index < 0 || index >= list.length) {
      return { text: `Not found: message ${String(id || '')}`, next: [] }
    }
    const message = list[index]
    const next = []
    if (index > 0) next.push('msg:' + (index - 1))
    if (index + 1 < list.length) next.push('msg:' + (index + 1))
    const body = textOfMessage(message) || '(empty message)'
    const text = [
      `ref msg:${index} (${message?.role || '?'})`,
      body.length > maxChars ? body.slice(0, maxChars) + `\n[... truncated; ${body.length} chars total]` : body,
      '',
      'next refs: ' + (next.join(', ') || '(none)'),
    ].join('\n')
    return { text, next }
  }

  if (normalizedKind === 'tool') {
    const wanted = String(id || '').replace(/^tool:/, '')
    if (wanted === '') return { text: 'Not found: empty tool id', next: [] }
    let callIndex = -1
    let call = undefined
    for (let index = 0; index < list.length; index += 1) {
      const message = list[index]
      if (message?.role !== 'assistant' || !Array.isArray(message.content)) continue
      const block = message.content.find((item) => item?.type === 'tool-call' && String(item.id) === wanted)
      if (block) { callIndex = index; call = block; break }
    }
    if (call === undefined) return { text: `Not found: tool ${wanted}`, next: [] }
    const resultIndex = list.findIndex((message) => message?.role === 'tool' && String(message.toolCallId || '') === wanted)
    const result = resultIndex >= 0 ? textOfMessage(list[resultIndex]) : ''
    const next = ['msg:' + callIndex]
    if (resultIndex >= 0) next.push('msg:' + resultIndex)
    const args = String(call.arguments || '')
    const text = [
      `ref tool:${wanted} (${String(call.name || '?')})`,
      'args: ' + (args.length > maxChars ? args.slice(0, maxChars) + '…' : args || '(none)'),
      result === '' ? 'result: (pending)' : 'result:\n' + (result.length > maxChars ? result.slice(0, maxChars) + '…' : result),
      '',
      'next refs: ' + next.join(', '),
    ].join('\n')
    return { text, next }
  }

  return { text: `Not found: unknown kind ${normalizedKind}`, next: [] }
}
