import { createFileRoute, redirect } from '@tanstack/react-router'
export const Route = createFileRoute('/')({ beforeLoad: () => { throw redirect({ to: '/$locale', search:{tf:'yoy',bk:'basic4',range:'60'}, params: { locale: 'zh-tw' } }) } })
