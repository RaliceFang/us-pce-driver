import { createRootRoute, HeadContent, Scripts, useRouterState } from '@tanstack/react-router'
import styles from '../styles.css?url'
export const Route = createRootRoute({
  head: () => ({ meta: [{ charSet: 'utf-8' }, { name: 'viewport', content: 'width=device-width, initial-scale=1' }, { title: 'US PCE Driver | MacroMicro' }], links: [{ rel: 'stylesheet', href: styles }, { rel: 'icon', href: 'https://open.mmgo.me/logo/favicon-196.png' }] }),
  shellComponent: Document,
})
function Document({ children }: { children: React.ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const lang = path.startsWith('/en') ? 'en' : path.startsWith('/zh-cn') ? 'zh-Hans' : 'zh-Hant'
  return <html lang={lang}><head><HeadContent /></head><body>{children}<Scripts /></body></html>
}
