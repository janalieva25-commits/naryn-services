import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import AppRoutes from './app/routes'

export default function App() {
  const { t, i18n } = useTranslation()

  useEffect(() => {
    document.title = t('footer.brand', { defaultValue: 'Нарын Услуги' }) + ' — ' + t('landing.desc', { defaultValue: 'Платформа услуг и заказов для Нарынской области' })
  }, [t, i18n.language])

  return <AppRoutes />
}