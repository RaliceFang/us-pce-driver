import { createFileRoute,Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card,CardContent } from '../components/ui/card'
export const Route=createFileRoute('/$locale/methodology')({component:Methodology})
function Methodology(){const {t}=useTranslation();const {locale}=Route.useParams();return <main className="page-shell method-page"><Link to="/$locale" search={{tf:"yoy",bk:"basic4",range:"60"}} params={{locale}}>← {t('home')}</Link><p className="eyebrow">PCE DRIVER</p><h1>{t('methodTitle')}</h1><p className="intro-subtitle">{t('methodSubtitle')}</p>{['sources','chain','fisher','checks'].map(k=><Card key={k}><CardContent><h2>{t(`${k}Title`)}</h2><p>{t(`${k}Text`)}</p>{k==='chain'&&<pre>cᵧᵢ(t) = Σ cₘᵢ(j) × I(j−1) / I(t−12)</pre>}{k==='fisher'&&<pre>{'L = Σ s₀ᵢrᵢ     P = 1 / Σ(s₁ᵢ/rᵢ)     F = √(LP)\ncᵢ = 100P/(F+1) × (s₀ᵢ+s₁ᵢ/rᵢ) × (rᵢ−1)'}</pre>}</CardContent></Card>)}<a href="/data/validation.json">{t('validation')} →</a></main>}
