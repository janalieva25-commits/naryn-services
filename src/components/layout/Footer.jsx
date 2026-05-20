import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="site-footer">
      <div className="page-container footer-inner">
        <div>
          <h3>{t('footer.brand', { defaultValue: 'Нарын Услуги' })}</h3>
          <p>© 2026 {t('footer.rights')}</p>
        </div>

        <div className="footer-links">
          <Link to="/about">{t('footer.about')}</Link>
          <Link to="/how-it-works">{t('footer.howItWorks')}</Link>
          <Link to="/rules">{t('footer.rules')}</Link>
          <Link to="/contacts">{t('footer.contacts')}</Link>
        </div>
      </div>
    </footer>
  )
}