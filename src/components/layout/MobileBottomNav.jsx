import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { useProfile } from '../../context/ProfileContext'

export default function MobileBottomNav() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { profile } = useProfile()
  const location = useLocation()

  const navItems = user
    ? [
        { to: '/', icon: '🏠', label: t('nav.home'), end: true },
        { to: '/services', icon: '🔧', label: t('nav.services') },
        { to: '/masters', icon: '👷', label: t('nav.masters') },
        { to: '/orders', icon: '📋', label: t('nav.orders') },
        { to: profile?.id ? `/profile/${profile.id}` : '/settings', icon: '👤', label: t('nav.cabinet') },
      ]
    : [
        { to: '/', icon: '🏠', label: t('nav.home'), end: true },
        { to: '/services', icon: '🔧', label: t('nav.services') },
        { to: '/masters', icon: '👷', label: t('nav.masters') },
        { to: '/orders', icon: '📋', label: t('nav.orders') },
        { to: '/login', icon: '🔑', label: t('auth.login') },
      ]

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
      {navItems.map((item) => {
        const isActive = item.end
          ? location.pathname === item.to
          : location.pathname.startsWith(item.to)

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={isActive ? 'mobile-nav-item active' : 'mobile-nav-item'}
            aria-label={item.label}
          >
            <span className="mobile-nav-icon">{item.icon}</span>
            <span className="mobile-nav-label">{item.label}</span>
            {isActive && <span className="mobile-nav-indicator" />}
          </NavLink>
        )
      })}
    </nav>
  )
}
