import test from 'node:test'
import assert from 'node:assert/strict'
import { buildContextIndex, recallFromMessages, textOfMessage } from '../src/context.js'

const messages = [
  { role: 'user', content: [{ type: 'text', text: 'Investigate the failing test' }] },
  { role: 'assistant', content: [
    { type: 'text', text: 'I will inspect it.' },
    { type: 'tool-call', id: 'call_1', name: 'bash', arguments: '{"command":"npm test"}' },
  ] },
  { role: 'tool', toolCallId: 'call_1', content: [{ type: 'text', text: 'FAIL 1 test' }] },
  { role: 'assistant', content: [{ type: 'text', text: 'The failure is in parser.test.ts' }] },
]

test('context index uses refs and snippets, not full bodies', () => {
  const index = buildContextIndex(messages, { sessionId: 'parent-1', seq: 42, limit: 2 })
  assert.match(index, /Reference index/)
  assert.match(index, /msg:2 tool/)
  assert.match(index, /tool:call_1 bash \(completed\)/)
  assert.ok(index.length < 1000)
  assert.ok(!index.includes('Investigate the failing test'))
})

test('recall message expands full body and next refs', () => {
  const result = recallFromMessages(messages, 'message', 'msg:0')
  assert.match(result.text, /Investigate the failing test/)
  assert.match(result.text, /next refs: msg:1/)
  assert.deepEqual(result.next, ['msg:1'])
})

test('recall tool returns args, result, and next refs', () => {
  const result = recallFromMessages(messages, 'tool', 'tool:call_1')
  assert.match(result.text, /npm test/)
  assert.match(result.text, /FAIL 1 test/)
  assert.deepEqual(result.next, ['msg:1', 'msg:2'])
})

test('unknown refs fail soft', () => {
  assert.match(recallFromMessages(messages, 'message', 'msg:99').text, /Not found/)
  assert.match(recallFromMessages(messages, 'tool', 'tool:nope').text, /Not found/)
})

test('textOfMessage extracts text and tool calls', () => {
  assert.match(textOfMessage(messages[1]), /I will inspect it/)
  assert.match(textOfMessage(messages[1]), /tool call/)
})
