import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from '../services/notificationsService'

export default function NotificationsPage() {
  const { user } = useAuth()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
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
        setErrorMsg(t('notifications.loadError') || 'Error loading notifications')
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

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      console.error('Failed to delete notification', err)
    }
  }

  const handleDeleteAll = async () => {
    if (!user) return
    try {
      await deleteAllNotifications(user.id)
      setNotifications([])
    } catch (err) {
      console.error('Failed to delete all notifications', err)
    }
  }

  if (loading) {
    return <div className="section-card dark-card">{t('notifications.loading') || 'Loading...'}</div>
  }

  const getLocaleTag = (lang) => {
    return lang === 'ky' ? 'ky-KG' : lang === 'ru' ? 'ru-RU' : 'en-US'
  }

  return (
    <div className="section-card dark-card">
      <div className="section-head" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{t('nav.notifications')}</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {notifications.some(n => !n.is_read) && (
            <button 
              className="action-button secondary" 
              onClick={handleMarkAll}
              style={{ borderRadius: '999px', fontSize: '13px', padding: '6px 14px' }}
            >
              {t('header.markAllRead') || 'Mark all as read'}
            </button>
          )}
          {notifications.length > 0 && (
            <button 
              className="action-button" 
              onClick={handleDeleteAll}
              style={{ borderRadius: '999px', fontSize: '13px', padding: '6px 14px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}
            >
              {t('notifications.clearAll', 'Очистить все')}
            </button>
          )}
        </div>
      </div>

      {errorMsg && <p className="error-message">{errorMsg}</p>}

      {notifications.length === 0 ? (
        <p>{t('header.noNotifications') || 'No notifications'}</p>
      ) : (
        <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {notifications.map((notif) => (
            <div 
              key={notif.id} 
              style={{
                position: 'relative',
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
                if (notif.link) {
                  navigate(notif.link)
                }
              }}
            >
              <button
                onClick={(e) => handleDelete(e, notif.id)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: 'var(--muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                }}
                title={t('common.delete', 'Удалить')}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '24px' }}>
                <p style={{ margin: 0, fontWeight: notif.is_read ? '400' : '600' }}>
                  {notif.type === 'review' && '⭐ '}
                  {notif.type === 'message' && '💬 '}
                  {notif.content}
                </p>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '12px' }}>
                  {new Date(notif.created_at).toLocaleDateString(getLocaleTag(i18n.language), {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              
              {notif.link && (
                <span 
                  style={{ color: 'var(--primary)', fontSize: '14px', textDecoration: 'none', fontWeight: '500', marginTop: '4px' }}
                >
                  {t('notifications.followLink', 'Перейти')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
