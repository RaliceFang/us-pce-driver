import { createFileRoute } from '@tanstack/react-router'
import { searchSchema } from '../features/pce/catalog'
import { getDashboard } from '../features/pce/dashboard.functions'
import { Dashboard } from '../features/pce/dashboard'
import type { Locale } from '../i18n'
export const Route = createFileRoute('/$locale/')({
  validateSearch: searchSchema,
  loaderDeps: ({ search }) => search,
  loader: ({ params, deps }) => getDashboard({ data: { ...deps, locale: params.locale as Locale } }),
  component: Page,
})
function Page() {
  const data = Route.useLoaderData()
  const settings = Route.useSearch()
  const { locale } = Route.useParams()
  const navigate = Route.useNavigate()
  return <Dashboard data={data} settings={settings} locale={locale as Locale} onChange={(change)=>void navigate({search:prev=>({...prev,...change})})} />
}
