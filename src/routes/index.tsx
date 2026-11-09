import { createFileRoute, redirect } from '@tanstack/react-router'
export const Route = createFileRoute('/')({ beforeLoad: () => { throw redirect({ to: '/$locale', search:{tf:'mom',basis:'parent',bk:'basic4',range:'60'}, params: { locale: 'zh-tw' } }) } })
