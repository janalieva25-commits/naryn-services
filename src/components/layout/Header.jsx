import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../lib/supabase'

export default function Header() {
  const [theme, setTheme] = useState('light')
  const [notifications, setNotifications] = useState([])
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(false)

  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    const loadNotifications = async () => {
      if (!user?.id) {
        setNotifications([])
        return
      }

      setLoadingNotifications(true)

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!error) {
        setNotifications(data || [])
      }

      setLoadingNotifications(false)
    }

    loadNotifications()
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`notifications-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        async () => {
          const { data } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(20)

          setNotifications(data || [])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user?.id])

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setNotificationsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  const handleLogout = async () => {
    await signOut()
    navigate('/login')
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notification.id)

      setNotifications((prev) =>
        prev.map((item) =>
          item.id === notification.id
            ? { ...item, is_read: true }
            : item
        )
      )
    }

    setNotificationsOpen(false)

    if (notification.link) {
      navigate(notification.link)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return

    const unreadItems = notifications.filter((item) => !item.is_read)
    if (unreadItems.length === 0) return

    const unreadIds = unreadItems.map((item) => item.id)

    await supabase
      .from('notifications')
      .update({ is_read: true })
      .in('id', unreadIds)

    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        is_read: true,
      }))
    )
  }

  const unreadCount = notifications.filter((item) => !item.is_read).length

  return (
    <>
      <header className="site-header">
        <div className="page-container header-inner">
          <div className="brand">
            <div className="brand-badge">🛠</div>
            <div className="brand-text">
            <span className="brand-title">{t('about.title')}</span>
          </div>
        </div>

        <nav className="main-nav">
          <NavLink to="/" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'} end>{t('nav.home')}</NavLink>
          <NavLink to="/services" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>{t('nav.services')}</NavLink>
          <NavLink to="/masters" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>{t('nav.masters')}</NavLink>
          <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>{t('nav.orders')}</NavLink>
          {user && <NavLink to="/create" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>{t('nav.create')}</NavLink>}
          {user && <NavLink to="/my-ads" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>{t('nav.myAds')}</NavLink>}
          {user && <NavLink to="/messages" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>{t('nav.messages')}</NavLink>}
          {user && <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>{t('nav.cabinet')}</NavLink>}
        </nav>

          <div className="header-actions">
            <div className="lang-switcher">
              <select
                className="lang-select"
                value={(i18n.resolvedLanguage || i18n.language || 'ru').slice(0, 2)}
                onChange={(e) => i18n.changeLanguage(e.target.value)}
              >
                <option value="ru">RU</option>
                <option value="ky">KY</option>
                <option value="en">EN</option>
              </select>
            </div>

            <button
              className="theme-btn"
              type="button"
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

            {!user ? (
              <>
                <Link className="header-link-btn" to="/login">
                  {t('auth.login')}
                </Link>
                <Link className="header-main-btn" to="/register">
                  {t('auth.register')}
                </Link>
              </>
            ) : (
              <>
                <button
                  className="icon-btn"
                  type="button"
                  onClick={() => setNotificationsOpen(true)}
                  style={{ position: 'relative' }}
                >
                  🔔
                  {unreadCount > 0 && (
                    <span
                      style={{
                        position: 'absolute',
                        top: '-6px',
                        right: '-6px',
                        minWidth: '18px',
                        height: '18px',
                        borderRadius: '999px',
                        background: 'var(--primary)',
                        color: '#fff',
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 5px',
                        fontWeight: 700,
                      }}
                    >
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button className="header-main-btn" type="button" onClick={handleLogout}>
                  {t('nav.logout')}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Overlay backdrop */}
      <div
        onClick={() => setNotificationsOpen(false)}
        className={notificationsOpen ? 'notif-overlay notif-overlay--open' : 'notif-overlay'}
      >
        {/* Panel — bottom sheet on mobile, right drawer on desktop */}
        <div
          onClick={(e) => e.stopPropagation()}
          className={notificationsOpen ? 'notif-panel notif-panel--open' : 'notif-panel'}
        >
          {/* Drag handle (mobile only) */}
          <div className="notif-drag-handle" />

          {/* Header */}
          <div style={{
            padding: '16px 20px 14px',
            borderBottom: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                {t('nav.notifications')}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.6 }}>
                {t('header.unread')}: {unreadCount}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                style={{
                  border: 'none', borderRadius: '12px', padding: '8px 12px',
                  background: 'var(--surface-soft)', color: 'var(--text)',
                  cursor: 'pointer', fontWeight: 600, fontSize: '12px',
                }}
              >
                {t('header.markAllRead')}
              </button>
              <button
                type="button"
                onClick={() => setNotificationsOpen(false)}
                style={{
                  border: 'none', borderRadius: '12px',
                  width: '36px', height: '36px',
                  background: 'var(--surface-soft)', color: 'var(--text)',
                  cursor: 'pointer', fontSize: '18px', fontWeight: 700, flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Notifications list */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '14px 16px 24px',
            display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            {loadingNotifications ? (
              <p style={{ margin: 0 }}>{t('common.loading')}</p>
            ) : notifications.length === 0 ? (
              <div style={{
                padding: '18px', borderRadius: '18px',
                background: 'var(--surface-soft)', border: '1px solid var(--line)',
              }}>
                <p style={{ margin: 0, fontWeight: 600 }}>{t('header.noNotifications')}</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    width: '100%', textAlign: 'left', padding: '14px',
                    border: '1px solid var(--line)', borderRadius: '16px',
                    background: notification.is_read ? 'var(--surface)' : 'rgba(99, 102, 241, 0.08)',
                    color: 'var(--text)', cursor: 'pointer',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                  }}
                >
                  <div style={{
                    display: 'flex', justifyContent: 'space-between',
                    gap: '12px', marginBottom: '6px', alignItems: 'center',
                  }}>
                    <strong style={{ fontSize: '14px', color: 'var(--text)' }}>
                      {notification.type === 'message' && '💬 '}
                      {notification.type === 'review' && '⭐ '}
                      {notification.type === 'message'
                        ? t('nav.messages')
                        : notification.type === 'review'
                        ? t('dashboard.reviews')
                        : t('nav.notifications')}
                    </strong>
                    {!notification.is_read && (
                      <span style={{
                        fontSize: '11px', padding: '3px 8px', borderRadius: '999px',
                        background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)',
                        fontWeight: 700, flexShrink: 0,
                      }}>
                        {t('header.newBadge')}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '13px', lineHeight: 1.5, marginBottom: '6px', color: 'var(--muted)' }}>
                    {notification.content}
                  </div>
                  <div style={{ fontSize: '11px', opacity: 0.6, color: 'var(--muted)' }}>
                    {new Date(notification.created_at).toLocaleString('ru-RU')}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
