/**
 * Side Conversation — client half.
 *
 * Registers a right-sidebar tab that renders the plugin's forked side session
 * with the host Conversation surface, plus a launcher in the conversation
 * header and a token/cache badge.
 */
window.__ModuleLoader__.load({
  id: 'dsh-side-conversation',
  factory: (require) => {
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useRef, useState } = React

    const PLUGIN = 'dsh-side-conversation'
    const TAB_ID = PLUGIN
    const TAB_KIND = 'sideconversation'
    const RESOURCE_PROTOCOL = 'sideconversation'
    const RESOURCE_PREFIX = 'dsh-resource://sideconversation/session/'
    const CONVERSATION_SLOT = 'dsh-side-conversation.conversation'
    const OPEN_PATH = '/dsh-side-conversation/open'
    const STATS_PATH = '/dsh-side-conversation/stats'
    const HISTORY_PATH = '/dsh-side-conversation/history'
    const RESTORE_PATH = '/dsh-side-conversation/restore'
    const RELAY_PENDING_PATH = '/dsh-side-conversation/relay/pending'
    const RELAY_DECISION_PATH = '/dsh-side-conversation/relay/decision'
    const HEALTH_PATH = '/dsh-side-conversation/health'
    const BUILD = '0.6.0'

    const EN = {
      tabTitle: 'Side Conversation',
      launch: 'Open side conversation',
      busy: 'Opening side conversation...',
      errorTitle: 'Could not open side conversation',
      errorParentOffline: 'The parent conversation is not live. Focus it and try again.',
      errorSidebar: 'The right sidebar is unavailable.',
      errorOpen: 'Failed to open the side conversation: ',
      loading: 'Loading side conversation...',
      noSession: 'Close this tab and reopen the side conversation from the header button.',
      cache: 'cache',
      history: 'History',
      historyTitle: 'Side conversations',
      historyLoading: 'Loading...',
      historyEmpty: 'No earlier side conversations.',
      historyUnavailable: 'History is unavailable for this conversation.',
      historyCurrent: 'current',
      relayTitle: 'Relay to main conversation',
      relayApprove: 'Send',
      relayReject: 'Discard',
    }

    const ZH = {
      tabTitle: '侧边对话',
      launch: '打开侧边对话',
      busy: '正在打开侧边对话...',
      errorTitle: '侧边对话打开失败',
      errorParentOffline: '主对话当前不在线，请回到主对话后重试。',
      errorSidebar: '右侧栏不可用。',
      errorOpen: '侧边对话打开失败：',
      loading: '正在加载侧边对话...',
      noSession: '请关闭此页签，再用右上角气泡按钮重新打开侧边对话。',
      cache: '缓存',
      history: '历史',
      historyTitle: '历史侧边对话',
      historyLoading: '正在加载...',
      historyEmpty: '没有更早的侧边对话。',
      historyUnavailable: '当前对话无法查看历史。',
      historyCurrent: '当前',
      relayTitle: '转达到主对话',
      relayApprove: '发送',
      relayReject: '丢弃',
    }

    const styles = {
      root: { position: 'relative', width: '100%', minWidth: 0, height: '100%', minHeight: 0, display: 'flex' },
      loading: { margin: 'auto', padding: '12px', color: 'var(--dsw-alias-label-secondary)', fontSize: '12px', textAlign: 'center' },
      launcher: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '26px',
        height: '26px',
        padding: 0,
        border: 'none',
        borderRadius: '6px',
        background: 'transparent',
        color: 'var(--dsw-alias-label-secondary)',
        cursor: 'pointer',
      },
      launcherDisabled: {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '26px',
        height: '26px',
        padding: 0,
        border: 'none',
        borderRadius: '6px',
        background: 'transparent',
        color: 'var(--dsw-alias-label-secondary)',
        cursor: 'default',
        opacity: 0.6,
      },
      badge: {
        position: 'absolute',
        top: '6px',
        right: '10px',
        zIndex: 5,
        padding: '1px 7px',
        borderRadius: '999px',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-overlay)',
        color: 'var(--dsw-alias-label-secondary)',
        fontSize: '10px',
        lineHeight: '16px',
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        opacity: 0.9,
      },
      relayBar: {
        position: 'absolute',
        left: '10px',
        right: '10px',
        bottom: '10px',
        zIndex: 6,
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        padding: '8px',
        borderRadius: '9px',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-overlay)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
      },
      relayText: {
        maxHeight: '58px',
        overflow: 'hidden',
        color: 'var(--dsw-alias-label-primary)',
        fontSize: '11px',
        lineHeight: '16px',
        wordBreak: 'break-word',
      },
      relayActions: { display: 'flex', justifyContent: 'flex-end', gap: '6px' },
      relayButton: {
        padding: '2px 10px',
        borderRadius: '6px',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'transparent',
        color: 'var(--dsw-alias-label-secondary)',
        fontSize: '11px',
        lineHeight: '16px',
        cursor: 'pointer',
      },
      relayButtonPrimary: {
        padding: '2px 10px',
        borderRadius: '6px',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-l2)',
        color: 'var(--dsw-alias-label-primary)',
        fontSize: '11px',
        lineHeight: '16px',
        fontWeight: 600,
        cursor: 'pointer',
      },
      historyButton: {
        position: 'absolute',
        top: '6px',
        left: '10px',
        zIndex: 5,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '1px 8px',
        borderRadius: '999px',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-overlay)',
        color: 'var(--dsw-alias-label-secondary)',
        fontSize: '10px',
        lineHeight: '16px',
        cursor: 'pointer',
      },
      historyPanel: {
        position: 'absolute',
        top: '30px',
        left: '10px',
        zIndex: 6,
        width: '300px',
        maxWidth: 'calc(100% - 20px)',
        maxHeight: '320px',
        overflowY: 'auto',
        padding: '4px',
        borderRadius: '9px',
        border: '1px solid var(--dsw-alias-border-l1)',
        background: 'var(--dsw-alias-bg-overlay)',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.18)',
      },
      historyHeader: {
        padding: '6px 8px',
        color: 'var(--dsw-alias-label-secondary)',
        fontSize: '11px',
        fontWeight: 600,
      },
      historyEmpty: {
        padding: '6px 8px 8px',
        color: 'var(--dsw-alias-label-secondary)',
        fontSize: '11px',
        lineHeight: '16px',
      },
      historyItem: {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        width: '100%',
        padding: '6px 8px',
        border: 'none',
        borderRadius: '6px',
        background: 'transparent',
        color: 'var(--dsw-alias-label-primary)',
        font: 'inherit',
        textAlign: 'left',
        cursor: 'pointer',
      },
      historyName: {
        maxWidth: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontSize: '11px',
        lineHeight: '16px',
      },
      historyMeta: {
        color: 'var(--dsw-alias-label-secondary)',
        fontSize: '10px',
        lineHeight: '14px',
      },
      toast: {
        position: 'fixed',
        left: '50%',
        bottom: '28px',
        transform: 'translateX(-50%)',
        zIndex: 2147483000,
        maxWidth: 'min(520px, calc(100vw - 48px))',
        padding: '9px 14px',
        borderRadius: '9px',
        border: '1px solid var(--dsw-alias-border-l2)',
        background: 'var(--dsw-alias-bg-overlay)',
        color: 'var(--dsw-alias-label-primary)',
        font: 'inherit',
        fontSize: '12px',
        lineHeight: '18px',
        pointerEvents: 'none',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      },
      toastTitle: { fontWeight: 600, color: 'var(--dsw-alias-state-error-primary)', marginRight: '6px' },
    }

    /* ------------------------------------------------------------ toast */

    const toastListeners = new Set()
    let toastState = null
    let toastTimer = 0

    function showToast(title, message) {
      toastState = { title, message, key: Date.now() }
      for (const listener of toastListeners) listener()
      if (toastTimer !== 0) clearTimeout(toastTimer)
      toastTimer = setTimeout(() => {
        toastTimer = 0
        toastState = null
        for (const listener of toastListeners) listener()
      }, 6000)
    }

    function Toast() {
      const [current, setCurrent] = useState(toastState)
      useEffect(() => {
        const listener = () => setCurrent(toastState)
        toastListeners.add(listener)
        return () => {
          toastListeners.delete(listener)
        }
      }, [])
      if (!current) return null
      return h('div', { style: styles.toast, role: 'status' }, h('span', { style: styles.toastTitle }, current.title), h('span', null, current.message))
    }

    /* ---------------------------------------------------------- helpers */

    function sideChatIcon(size) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M2.6 3.4h10.8v6.9H8.5L5.4 12.6v-2.3H2.6z',
          stroke: 'currentColor',
          strokeWidth: 1.25,
          strokeLinejoin: 'round',
          strokeLinecap: 'round',
        }),
        h('path', { d: 'M5.2 5.9h5.6M5.2 8h3.8', stroke: 'currentColor', strokeWidth: 1.05, strokeLinecap: 'round' }),
      )
    }

    function formatTokens(value) {
      const number = Number(value) || 0
      if (number >= 1e6) return (number / 1e6).toFixed(1) + 'M'
      if (number >= 1e3) return (number / 1e3).toFixed(1) + 'k'
      return String(number)
    }

    function waitForAbort(signal) {
      if (!signal) return new Promise(() => {})
      if (signal.aborted) return Promise.resolve()
      return new Promise((resolve) => signal.addEventListener('abort', () => resolve(), { once: true }))
    }

    function parseSessionAddress(contentId) {
      if (typeof contentId !== 'string' || !contentId.startsWith(RESOURCE_PREFIX)) return undefined
      try {
        const sessionId = decodeURIComponent(contentId.slice(RESOURCE_PREFIX.length))
        return sessionId === '' ? undefined : sessionId
      } catch {
        return undefined
      }
    }

    function historyIcon(size) {
      return h(
        'svg',
        { width: size, height: size, viewBox: '0 0 16 16', fill: 'none', 'aria-hidden': true },
        h('path', {
          d: 'M8 3.4a4.6 4.6 0 1 1-4.4 5.9M8 3.4V1.6M8 3.4h1.8M8 4.8v3.4l2.2 1.3',
          stroke: 'currentColor',
          strokeWidth: 1.2,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
        }),
      )
    }

    function formatHistoryTime(value) {
      const date = new Date(Number(value) || 0)
      if (!Number.isFinite(date.getTime())) return ''
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    }

    function ChatView(props) {
      return typeof props?.renderSlot === 'function' ? props.renderSlot('conversation.session', { view: 'chat' }) : null
    }

    function ConversationSurface(props) {
      const { sessionId, useSession, useConversation, useSessions, renderFactorySlot } = props ?? {}
      const session = typeof useSession === 'function' ? useSession((value) => value) : undefined
      const conversation = typeof useConversation === 'function' ? useConversation((value) => value) : undefined
      if (!session || !conversation || typeof renderFactorySlot !== 'function') {
        return h('div', { style: styles.loading }, '...')
      }
      const active = conversation.activeTargets.size > 0
      const phase = active || (!session.blank && !session.awaitingFirstTurn) || session.running ? 'active' : session.promptAttempted ? 'engaging' : 'blank'
      const summaryBlank = typeof useSessions === 'function' ? useSessions((state) => state.byId[sessionId]?.blank) : undefined
      const settling = phase === 'blank' && session.openState === 'loading' && summaryBlank !== true
      const hero = phase === 'blank' && (session.openState === 'open' || summaryBlank === true)
      return renderFactorySlot(
        'conversation.content',
        { variant: 'embedded', phase: settling ? 'settling' : hero ? 'hero' : 'active', hero },
        { slots: { views: ChatView } },
      )
    }

    return {
      name: PLUGIN,
      inject: ['slots', 'locale', 'sessions'],
      apply(ctx) {
        let t = (key) => key
        try {
          t = ctx.locale.bind(PLUGIN)
        } catch (error) {
          console.warn('[dsh-side-conversation] locale binding failed', error)
        }

        let surface = 'pending'
        const announce = (attempt = 0) => {
          fetch(HEALTH_PATH, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ client: BUILD, surface }),
          }).catch(() => {
            if (attempt < 5) setTimeout(() => announce(attempt + 1), 1200)
          })
        }
        announce()

        ctx.effect(() => ctx.locale.register(PLUGIN, { en: EN, zh: ZH }), 'dsh-side-conversation: locale')

        async function openSideConversation(parentSessionId) {
          const response = await fetch(OPEN_PATH, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ parentSessionId }),
          })
          const data = await response.json().catch(() => null)
          if (!response.ok || data?.ok !== true) {
            const code = data?.error ?? 'HTTP ' + response.status
            if (code === 'parent-conversation-not-live' || code === 'parent-session-not-live') throw new Error(t('errorParentOffline'))
            throw new Error(t('errorOpen') + code)
          }
          const sidebarRight = ctx.get('sidebarRight')
          if (!sidebarRight || typeof sidebarRight.openResource !== 'function') throw new Error(t('errorSidebar'))
          sidebarRight.openResource(RESOURCE_PREFIX + encodeURIComponent(String(data.childId)), { kind: TAB_KIND })
        }

        function LaunchButton(props) {
          const parentSessionId = props?.sessionId
          const [busy, setBusy] = useState(false)
          const launch = useCallback(() => {
            if (busy || typeof parentSessionId !== 'string' || parentSessionId === '') return
            setBusy(true)
            openSideConversation(parentSessionId)
              .catch((error) => {
                showToast(t('errorTitle'), String(error?.message ?? error))
              })
              .finally(() => setBusy(false))
          }, [busy, parentSessionId])

          return h(
            'button',
            {
              type: 'button',
              style: busy ? styles.launcherDisabled : styles.launcher,
              title: busy ? t('busy') : t('launch'),
              'aria-label': busy ? t('busy') : t('launch'),
              'aria-busy': busy ? 'true' : 'false',
              disabled: busy,
              onClick: launch,
            },
            sideChatIcon(16),
          )
        }

        function SideChatTab(props) {
          const { useTabInfo, SessionProvider, renderSlot } = props ?? {}
          const tab = typeof useTabInfo === 'function' ? useTabInfo()?.tab : undefined
          const targetSessionId =
            (typeof tab?.navigation?.params?.sessionId === 'string' ? tab.navigation.params.sessionId : undefined) ||
            parseSessionAddress(tab?.contentId)

          const [reference, setReference] = useState(null)
          const [failure, setFailure] = useState('')
          const [stats, setStats] = useState(null)
          const [historyOpen, setHistoryOpen] = useState(false)
          const [history, setHistory] = useState(null)
          const [historyError, setHistoryError] = useState('')
          const [relays, setRelays] = useState([])

          useEffect(() => {
            setReference(null)
            setFailure('')
            if (!targetSessionId) return undefined
            let retained
            try {
              retained = ctx.sessions.retain(targetSessionId, { source: 'sidebarChat' })
            } catch (error) {
              setFailure(String(error?.message ?? error))
              return undefined
            }
            setReference(retained)
            if (retained.ready && typeof retained.ready.catch === 'function') {
              retained.ready.catch((error) => setFailure(String(error?.message ?? error)))
            }
            return () => {
              try {
                retained.release()
              } catch {
                // already released
              }
            }
          }, [targetSessionId])

          useEffect(() => {
            setHistoryOpen(false)
            setHistory(null)
            setHistoryError('')
          }, [targetSessionId])

          useEffect(() => {
            setStats(null)
            if (!targetSessionId) return undefined
            let cancelled = false
            let timer = 0
            const load = () => {
              fetch(STATS_PATH + '?sessionId=' + encodeURIComponent(targetSessionId))
                .then((response) => response.json().catch(() => null))
                .then((data) => {
                  if (!cancelled && data?.ok) setStats(data)
                })
                .catch(() => {})
            }
            load()
            timer = setInterval(load, 6000)
            return () => {
              cancelled = true
              if (timer !== 0) clearInterval(timer)
            }
          }, [targetSessionId])

          useEffect(() => {
            setRelays([])
            if (!targetSessionId) return undefined
            let cancelled = false
            let timer = 0
            const load = () => {
              fetch(RELAY_PENDING_PATH + '?sessionId=' + encodeURIComponent(targetSessionId))
                .then((response) => response.json().catch(() => null))
                .then((data) => {
                  if (!cancelled && data?.ok) setRelays(Array.isArray(data.relays) ? data.relays : [])
                })
                .catch(() => {})
            }
            load()
            timer = setInterval(load, 4000)
            return () => {
              cancelled = true
              if (timer !== 0) clearInterval(timer)
            }
          }, [targetSessionId])

          const decideRelay = useCallback(
            (relayId, approve) => {
              fetch(RELAY_DECISION_PATH, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ sessionId: targetSessionId, relayId, approve }),
              })
                .then((response) => response.json().catch(() => null))
                .then((data) => {
                  if (!data?.ok) throw new Error(data?.error ?? 'relay-decision-failed')
                  setRelays((current) => current.filter((entry) => entry.id !== relayId))
                })
                .catch((error) => showToast(t('errorTitle'), String(error?.message ?? error)))
            },
            [targetSessionId],
          )

          const parentSessionId = stats?.parentSessionId ?? ''

          const loadHistory = useCallback(() => {
            if (!parentSessionId) return
            setHistoryError('')
            setHistory(null)
            fetch(HISTORY_PATH + '?parentSessionId=' + encodeURIComponent(parentSessionId))
              .then((response) => response.json().catch(() => null))
              .then((data) => {
                if (data?.ok) setHistory(Array.isArray(data.sessions) ? data.sessions : [])
                else {
                  setHistory([])
                  setHistoryError(t('historyUnavailable'))
                }
              })
              .catch(() => {
                setHistory([])
                setHistoryError(t('historyUnavailable'))
              })
          }, [parentSessionId])

          const toggleHistory = useCallback(() => {
            if (!parentSessionId) return
            if (!historyOpen && history === null) loadHistory()
            setHistoryOpen((value) => !value)
          }, [historyOpen, history, loadHistory, parentSessionId])

          const openHistorical = useCallback(
            (sessionId) => {
              setHistoryOpen(false)
              const target = String(sessionId)
              if (target === String(targetSessionId ?? '')) return
              const sidebarRight = ctx.get('sidebarRight')
              const sessionsService = ctx.sessions || ctx.get('sessions')
              if (sessionsService && typeof sessionsService.refresh === 'function' && sidebarRight && typeof sidebarRight.openResource === 'function') {
                sessionsService
                  .refresh()
                  .then(() => {
                    sidebarRight.openResource(RESOURCE_PREFIX + encodeURIComponent(target), { kind: TAB_KIND })
                  })
                  .catch((error) => showToast(t('errorTitle'), String(error?.message ?? error)))
                return
              }
              fetch(RESTORE_PATH, {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ sessionId: target, parentSessionId }),
              })
                .then((response) =>
                  response.json().then((data) => {
                    if (!response.ok || data?.ok !== true) throw new Error(data?.error ?? 'HTTP ' + response.status)
                    if (sidebarRight && typeof sidebarRight.openResource === 'function') {
                      sidebarRight.openResource(RESOURCE_PREFIX + encodeURIComponent(String(data.restoredId)), { kind: TAB_KIND })
                    }
                  }),
                )
                .catch((error) => showToast(t('errorTitle'), String(error?.message ?? error)))
            },
            [parentSessionId, targetSessionId],
          )

          if (!targetSessionId) return h('div', { style: styles.root }, h('div', { style: styles.loading }, t('noSession')))
          if (failure !== '') return h('div', { style: styles.root }, h('div', { style: styles.loading }, failure))
          if (!reference) return h('div', { style: styles.root }, h('div', { style: styles.loading }, t('loading')))
          if (typeof renderSlot !== 'function' || (typeof SessionProvider !== 'function' && typeof SessionProvider !== 'object')) {
            return h('div', { style: styles.root }, h('div', { style: styles.loading }, t('loading')))
          }

          let badge = null
          if (stats && (stats.requests > 0 || stats.turns > 0)) {
            const last = stats.lastUsage
            const input = last ? last.totalInputTokens : stats.totalInputTokens
            const percent = last ? last.cacheHitPercent : stats.cacheHitPercent
            const title = [
              'Side conversation usage',
              last
                ? 'Last request: input ' + formatTokens(last.totalInputTokens) + ' (cached ' + formatTokens(last.cacheReadTokens) + ', ' + last.cacheHitPercent + '%), output ' + formatTokens(last.outputTokens)
                : '',
              'Total: ' + stats.requests + ' requests, ' + stats.turns + ' turns, input ' + formatTokens(stats.totalInputTokens) + ' (' + stats.cacheHitPercent + '% cached), output ' + formatTokens(stats.outputTokens),
              'Parent context injected: ~' + formatTokens(stats.liveContextChars) + ' chars',
              stats.provider && stats.model ? stats.provider + '/' + stats.model : '',
            ]
              .filter(Boolean)
              .join('\n')
            badge = h('div', { style: styles.badge, title, 'aria-label': title }, 'in ' + formatTokens(input) + ' · ' + percent + '% ' + t('cache'))
          }

          let historyPanel = null
          if (historyOpen) {
            const entries = history ?? []
            historyPanel = h(
              'div',
              { style: styles.historyPanel },
              h('div', { style: styles.historyHeader }, t('historyTitle')),
              historyError !== ''
                ? h('div', { style: styles.historyEmpty }, historyError)
                : history === null
                  ? h('div', { style: styles.historyEmpty }, t('historyLoading'))
                  : entries.length === 0
                    ? h('div', { style: styles.historyEmpty }, t('historyEmpty'))
                    : entries.map((entry) =>
                        h(
                          'button',
                          {
                            key: entry.id,
                            type: 'button',
                            style: styles.historyItem,
                            title: entry.id,
                            onClick: () => openHistorical(entry.id),
                          },
                          h('span', { style: styles.historyName }, entry.title || entry.id),
                          h(
                            'span',
                            { style: styles.historyMeta },
                            [formatHistoryTime(entry.createdAt), entry.live ? 'live' : '', String(entry.id) === String(targetSessionId) ? t('historyCurrent') : '']
                              .filter(Boolean)
                              .join(' · '),
                          ),
                        ),
                      ),
            )
          }

          const historyButton = h(
            'button',
            {
              type: 'button',
              style: parentSessionId ? styles.historyButton : { ...styles.historyButton, opacity: 0.5, cursor: 'default' },
              disabled: !parentSessionId,
              title: t('historyTitle'),
              onClick: toggleHistory,
            },
            historyIcon(12),
            h('span', null, t('history')),
          )

          let relayBar = null
          if (relays.length > 0) {
            const entry = relays[0]
            relayBar = h(
              'div',
              { style: styles.relayBar },
              h('div', { style: styles.relayText }, entry.text),
              h(
                'div',
                { style: styles.relayActions },
                h('button', { type: 'button', style: styles.relayButton, onClick: () => decideRelay(entry.id, false) }, t('relayReject')),
                h('button', { type: 'button', style: styles.relayButtonPrimary, onClick: () => decideRelay(entry.id, true) }, t('relayApprove')),
              ),
            )
          }

          return h(
            'div',
            { style: styles.root, 'data-sidebar-chat': '' },
            h(SessionProvider, { session: reference }, renderSlot(CONVERSATION_SLOT, {})),
            badge,
            historyButton,
            historyPanel,
            relayBar,
          )
        }

        const disposers = []
        ctx.inject(['resources', 'sidebarRightTabs'], (scope) => {
          try {
            disposers.push(
              ctx.effect(
                () =>
                  scope.resources.register({
                    protocol: RESOURCE_PROTOCOL,
                    async *open(_address, { signal }) {
                      if (signal?.aborted) return
                      yield { ok: true, value: {} }
                      await waitForAbort(signal)
                    },
                  }),
                'dsh-side-conversation: resource',
              ),
            )
            disposers.push(
              ctx.effect(
                () =>
                  ctx.slots.inject('sidebar.right.pane.tab', () =>
                    ctx.slots.register(
                      {
                        name: 'sidebar.right.pane.tab',
                        key: TAB_ID,
                        children: { [CONVERSATION_SLOT]: { kind: 'single', scope: 'session' } },
                      },
                      SideChatTab,
                    ),
                  ),
                'dsh-side-conversation: tab body',
              ),
            )
            disposers.push(
              ctx.effect(
                () => ctx.slots.inject(CONVERSATION_SLOT, () => ctx.slots.register({ name: CONVERSATION_SLOT }, ConversationSurface)),
                'dsh-side-conversation: conversation',
              ),
            )
            disposers.push(
              ctx.effect(
                () =>
                  scope.sidebarRightTabs.register({
                    id: TAB_ID,
                    kind: TAB_KIND,
                    patterns: ['dsh-resource://sideconversation/session/**'],
                    priority: 'extension',
                    title: () => t('tabTitle'),
                  }),
                'dsh-side-conversation: tab type',
              ),
            )
            surface = 'ready'
            announce()
          } catch (error) {
            for (const dispose of disposers) dispose()
            surface = 'error: ' + String(error?.message ?? error)
            announce()
            console.warn('[dsh-side-conversation] surface registration failed', error)
            return undefined
          }
          return () => {
            for (const dispose of disposers) dispose()
          }
        })

        try {
          ctx.slots.inject('conversation.session.header.utilities', () =>
            ctx.slots.register(
              { name: 'conversation.session.header.utilities', id: PLUGIN + ':launcher', order: 15, label: () => t('launch'), locale: PLUGIN },
              LaunchButton,
            ),
          )
        } catch (error) {
          console.warn('[dsh-side-conversation] launcher registration failed', error)
        }

        try {
          ctx.slots.inject('shell.overlay', () => ctx.slots.register({ name: 'shell.overlay', id: PLUGIN + ':toast', order: 100 }, Toast))
        } catch (error) {
          console.warn('[dsh-side-conversation] toast registration failed', error)
        }
      },
    }
  },
})
