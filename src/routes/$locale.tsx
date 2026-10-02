import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { locales, type Locale, TranslationProvider } from '../i18n'
import { AppHeader } from '../components/app-header'
export const Route = createFileRoute('/$locale')({
  beforeLoad: ({ params }) => {
    if (!locales.includes(params.locale as Locale)) throw redirect({ to: '/$locale', search:{tf:'yoy',bk:'basic4',range:'60'}, params: { locale: 'zh-tw' } })
  },
  component: Layout,
})
function Layout() {
  const { locale } = Route.useParams()
  return <TranslationProvider locale={locale as Locale}><AppHeader locale={locale as Locale}/><Outlet /></TranslationProvider>
}
