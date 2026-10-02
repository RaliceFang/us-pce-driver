import { Link, useRouterState, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { locales, type Locale } from '../i18n'
import { NativeSelect, NativeSelectOption } from './ui/native-select'
const logos: Record<Locale,string> = {'zh-tw':'https://open.mmgo.me/logo/logo%402x.png','zh-cn':'https://open.mmgo.me/logo/logo-sc%402x.png',en:'https://open.mmgo.me/logo/logo-en%402x.png'}
const names: Record<Locale,string> = {'zh-tw':'繁體中文','zh-cn':'简体中文',en:'English'}
export function AppHeader({locale}:{locale:Locale}) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useRouterState({select:s=>s.location})
  const isMethod = location.pathname.endsWith('/methodology')
  return <header className="site-header"><div className="header-inner"><Link to="/$locale" search={{tf:"yoy",bk:"basic4",range:"60"}} params={{locale}}><img src={logos[locale]} alt="MacroMicro" className="brand-logo"/></Link><div className="brand-divider"/><span className="product-brand">PCE DRIVER</span><nav className="main-nav"><Link to="/$locale" search={{tf:"yoy",bk:"basic4",range:"60"}} params={{locale}} className={!isMethod?'active':''}>{t('dashboard')}</Link><Link to="/$locale/methodology" params={{locale}} className={isMethod?'active':''}>{t('methodology')}</Link></nav><NativeSelect aria-label="Language" value={locale} onChange={e=>{const next=e.target.value as Locale;if(isMethod)void navigate({to:'/$locale/methodology',params:{locale:next}});else void navigate({to:'/$locale',params:{locale:next},search:previous=>({tf:previous.tf??'yoy',bk:previous.bk??'basic4',range:previous.range??'60',month:previous.month})})}}>{locales.map(l=><NativeSelectOption key={l} value={l}>{names[l]}</NativeSelectOption>)}</NativeSelect></div></header>
}
