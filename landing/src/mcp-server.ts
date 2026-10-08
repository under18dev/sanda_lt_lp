import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { z } from 'zod'

const baseUrl = (process.env.SANDA_MCP_URL ?? 'http://127.0.0.1:3000').replace(/\/$/, '')
const token = process.env.SANDA_MCP_TOKEN
if (!token) throw new Error('SANDA_MCP_TOKEN is required')

const request = async (path: string, init?: RequestInit) => {
  const response = await fetch(`${baseUrl}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...init?.headers } })
  const text = await response.text()
  let data: unknown
  try { data = JSON.parse(text) } catch { data = text }
  if (!response.ok) throw new Error(`${response.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`)
  return data
}

const result = (data: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] })

const server = new McpServer({ name: 'sanda-lt-admin', version: '0.1.0' })

server.tool('get_event_state', 'イベント・登壇者・セッション・FAQ・スポンサーをまとめて取得します。', {}, async () => result(await request('/api/mcp/state')))
server.tool('list_sessions', 'タイムテーブルを取得します。dateを指定すると日付で絞り込みます。', { date: z.string().optional() }, async ({ date }) => result(await request(`/api/mcp/sessions${date ? `?date=${encodeURIComponent(date)}` : ''}`)))
server.tool('upsert_session', 'セッションを追加または更新します。時刻はHH:MM、dateはYYYY-MM-DDです。', {
  id: z.string(), date: z.string(), start: z.string(), end: z.string(), title: z.string(), category: z.enum(['talk', 'special', 'break']), color: z.enum(['white', 'yellow', 'blue', 'green', 'red']), summary: z.string(), detail: z.string(), speakerIds: z.array(z.string()).optional(), sortOrder: z.number().optional(),
}, async (input) => result(await request('/api/mcp/sessions/upsert', { method: 'POST', body: JSON.stringify(input) })))
server.tool('delete_session', 'セッションを削除します。IDを正確に指定してください。', { id: z.string() }, async ({ id }) => result(await request(`/api/mcp/sessions/${encodeURIComponent(id)}`, { method: 'DELETE' })))
server.tool('reorder_sessions', 'セッションの表示順をID配列で保存します。', { order: z.array(z.string()) }, async ({ order }) => result(await request('/api/mcp/sessions/reorder', { method: 'POST', body: JSON.stringify({ order }) })))
server.tool('list_speakers', '登壇者一覧を取得します。', {}, async () => result(await request('/api/mcp/speakers')))
server.tool('upsert_speaker', '登壇者を追加または更新します。bioの改行も保持されます。', { id: z.string(), name: z.string(), role: z.string(), category: z.string(), bio: z.string(), handle: z.string().optional(), icon: z.string().optional(), ogpImage: z.string().optional(), online: z.boolean().optional() }, async (input) => result(await request('/api/mcp/speakers/upsert', { method: 'POST', body: JSON.stringify(input) })))
server.tool('update_event', 'イベント情報を更新します。指定した項目だけ変更します。', { title: z.string().optional(), description: z.string().optional(), dateLabel: z.string().optional(), timeLabel: z.string().optional(), venue: z.string().optional(), venueDetail: z.string().optional(), capacity: z.string().optional(), connpassUrl: z.string().optional(), streamUrl: z.string().nullable().optional() }, async (input) => result(await request('/api/mcp/event', { method: 'POST', body: JSON.stringify(input) })))
server.tool('list_faqs', 'FAQ一覧を取得します。', {}, async () => result(await request('/api/mcp/faqs')))
server.tool('upsert_faq', 'FAQを追加または更新します。', { id: z.string(), question: z.string(), answer: z.string(), sortOrder: z.number().optional() }, async (input) => result(await request('/api/mcp/faqs/upsert', { method: 'POST', body: JSON.stringify(input) })))
server.tool('list_sponsors', 'スポンサー一覧を取得します。', {}, async () => result(await request('/api/mcp/sponsors')))
server.tool('upsert_sponsor', 'スポンサーを追加または更新します。', { id: z.string(), name: z.string(), tier: z.enum(['PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'SUPPORT']), description: z.string(), detail: z.string(), url: z.string().optional(), logo: z.string().optional(), sortOrder: z.number().optional() }, async (input) => result(await request('/api/mcp/sponsors/upsert', { method: 'POST', body: JSON.stringify(input) })))

const transport = new StdioServerTransport()
await server.connect(transport)
console.error(`sanda-lt-admin MCP connected to ${baseUrl}`)
