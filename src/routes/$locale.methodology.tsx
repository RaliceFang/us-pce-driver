import { createFileRoute,Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card,CardContent } from '../components/ui/card'
export const Route=createFileRoute('/$locale/methodology')({component:Methodology})
function Methodology(){const {t}=useTranslation();const {locale}=Route.useParams();return <main className="page-shell method-page"><Link to="/$locale" search={{tf:"mom",basis:"parent",bk:"basic4",range:"60"}} params={{locale}}>← {t('home')}</Link><p className="eyebrow">PCE DRIVER</p><h1>{t('methodTitle')}</h1><p className="intro-subtitle">{t('methodSubtitle')}</p>{['sources','chain','fisher','hierarchy','reading','checks'].map(k=><Card key={k}><CardContent><h2>{t(`${k}Title`)}</h2><p>{t(`${k}Text`)}</p>{k==='chain'&&<pre>{t('chainFormula')}</pre>}{k==='fisher'&&<pre>{t('fisherFormula')}</pre>}</CardContent></Card>)}<a href="/data/validation.json">{t('validation')} →</a></main>}
