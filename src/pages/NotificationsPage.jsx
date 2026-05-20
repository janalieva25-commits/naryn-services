import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getNotifications, markAsRead, markAllAsRead } from '../services/notificationsService'

export default function NotificationsPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!user) return

    const loadNotifications = async () => {
      try {
        setLoading(true)
        const data = await getNotifications(user.id)
        setNotifications(data || [])
      } catch (err) {
        setErrorMsg(t('notifications.loadError'))
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [user, t])

  const handleMarkAsRead = async (id) => {
    try {
      await markAsRead(id)
      setNotifications(prev => 
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleMarkAll = async () => {
    if (!user) return
    try {
      await markAllAsRead(user.id)
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return <div className="section-card dark-card">{t('notifications.loading')}</div>
  }

  const getLocaleTag = (lang) => {
    return lang === 'ky' ? 'ky-KG' : lang === 'ru' ? 'ru-RU' : 'en-US'
  }

  return (
    <div className="section-card dark-card">
      <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{t('nav.notifications')}</h2>
        {notifications.some(n => !n.is_read) && (
          <button 
            className="action-button secondary" 
            onClick={handleMarkAll}
            style={{ borderRadius: '999px', fontSize: '13px', padding: '6px 14px' }}
          >
            {t('header.markAllRead')}
          </button>
        )}
      </div>

      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {notifications.length === 0 ? (
        <p>{t('header.noNotifications')}</p>
      ) : (
        <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              style={{
                padding: '16px',
                borderRadius: '12px',
                background: notif.is_read ? 'var(--surface)' : 'var(--surface-soft)',
                border: notif.is_read ? '1px solid var(--line)' : '1px solid var(--primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                cursor: notif.link ? 'pointer' : 'default',
                transition: 'all 0.2s ease',
              }}
              onClick={() => {
                if (!notif.is_read) handleMarkAsRead(notif.id)
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <p style={{ margin: 0, fontWeight: notif.is_read ? '400' : '600' }}>
                  {notif.type === 'review' && '⭐ '}
                  {notif.type === 'message' && '💬 '}
                  {notif.content}
                </p>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {new Date(notif.created_at).toLocaleDateString(getLocaleTag(i18n.language), {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              {notif.link && (
                <Link 
                  to={notif.link} 
                  style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none', fontWeight: '500' }}
                >
                  {t('notifications.followLink')}
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
