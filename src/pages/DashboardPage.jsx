import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useProfile } from '../context/ProfileContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getReviewsByUserId } from '../services/reviewsService'

function formatMonthYear(value, lang) {
  if (!value) return ''

  const date = new Date(value)
  return date.toLocaleDateString(lang === 'ky' ? 'ky-KG' : lang === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function getExperienceLabel(profile, t, lang) {
  if (!profile?.experience_from) return t('dashboard.experienceNotSpecified')

  const from = formatMonthYear(profile.experience_from, lang)
  const to = profile?.experience_to
    ? formatMonthYear(profile.experience_to, lang)
    : t('dashboard.presentTime')

  return `${from} — ${to}`
}

function getJoinedLabel(profile, lang) {
  if (!profile?.joined_at) return ''

  return new Date(profile.joined_at).toLocaleDateString(lang === 'ky' ? 'ky-KG' : lang === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { profile, profileLoading, refreshProfile } = useProfile()
  const { t, i18n } = useTranslation()

  const [uploading, setUploading] = useState(false)
  const [uploadMessage, setUploadMessage] = useState('')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)

  useEffect(() => {
    if (user?.id) {
      getReviewsByUserId(user.id).then(data => {
        setReviews(data)
        setLoadingReviews(false)
      })
    }
  }, [user?.id])

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    try {
      setUploading(true)
      setUploadMessage('')

      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      const avatarUrl = publicUrlData.publicUrl

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      await refreshProfile()
      setUploadMessage(t('dashboard.avatarUploadSuccess'))
    } catch (error) {
      setUploadMessage(error.message || t('dashboard.avatarUploadError'))
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const getTranslatedDistrict = (dist) => {
    return dist ? t(`districts.${dist}`, { defaultValue: dist }) : t('services.districtNotSpecified')
  }

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1) 
    : 0;

  if (profileLoading) {
    return (
      <div className="dashboard-page">
        <div className="section-card dark-card">
          <h2>{t('dashboard.loadingProfile')}</h2>
          <p>{t('dashboard.loadingProfileSubtitle')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      {/* Mobile top bar to open menu */}
      <div className="dashboard-mobile-header">
        <button className="dashboard-menu-btn" onClick={() => setIsSidebarOpen(true)}>
          ☰ Меню кабинета
        </button>
      </div>

      <div className="dashboard-layout">
        {/* Overlay for mobile */}
        <div 
          className={isSidebarOpen ? 'dashboard-overlay open' : 'dashboard-overlay'} 
          onClick={() => setIsSidebarOpen(false)}
        />

        <aside className={isSidebarOpen ? 'dashboard-sidebar open' : 'dashboard-sidebar'}>
          <div className="section-card dark-card dashboard-sidebar-inner">
            <button className="dashboard-close-btn" onClick={() => setIsSidebarOpen(false)}>×</button>
            <div className="profile-box">
              <div className="profile-avatar">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={t('dashboard.avatarAlt')}
                    className="profile-avatar-img"
                  />
                ) : (
                  <span>{profile?.full_name?.[0] || 'U'}</span>
                )}
              </div>

              <div>
                <h4>{profile?.full_name || t('masters.noName')}</h4>
                <p>
                  {profile?.role === 'specialist' || profile?.role === 'contractor'
                    ? t('dashboard.roleSpecialist')
                    : t('dashboard.roleClient')}
                </p>
              </div>
            </div>

            <div className="upload-avatar-box">
              <label className="upload-avatar-btn">
                {uploading ? t('common.loading') : t('dashboard.uploadPhoto')}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  hidden
                  disabled={uploading}
                />
              </label>
              {uploadMessage && <p className="upload-message">{uploadMessage}</p>}
            </div>

            <ul className="dashboard-menu">
              <li><Link to="/orders">{t('nav.orders')}</Link></li>
              <li><Link to="/my-ads">{t('nav.myAds')}</Link></li>
              <li><Link to="/messages">{t('nav.messages')}</Link></li>
              <li><Link to="/reviews">{t('dashboard.reviews')}</Link></li>
              <li><Link to="/settings">{t('dashboard.settings')}</Link></li>
            </ul>
          </div>
        </aside>

        <div className="dashboard-main">
          <div className="dashboard-stats">
            <div className="stat-card">
              <p>Email</p>
              <h3 className="stat-text">{user?.email || '-'}</h3>
            </div>

            <div className="stat-card">
              <p>{t('services.ratingLabel')}</p>
              <h3>{avgRating}</h3>
            </div>

            <div className="stat-card">
              <p>{t('dashboard.reviews')}</p>
              <h3>{reviews.length}</h3>
            </div>
          </div>

          <div className="section-card dark-card">
            <div className="section-head">
              <h2>{t('dashboard.profileInfoTitle')}</h2>
            </div>

            <div className="profile-info-grid">
              <div className="profile-info-item">
                <span>{t('dashboard.fullName')}</span>
                <strong>{profile?.full_name || t('masters.noName')}</strong>
              </div>

              <div className="profile-info-item">
                <span>Username</span>
                <strong>{profile?.username || t('dashboard.usernameNotSpecified')}</strong>
              </div>

              <div className="profile-info-item">
                <span>{t('dashboard.phone')}</span>
                <strong>{profile?.phone || t('dashboard.phoneNotSpecified')}</strong>
              </div>

              <div className="profile-info-item">
                <span>{t('jobDetails.district')}</span>
                <strong>{getTranslatedDistrict(profile?.district)}</strong>
              </div>

              <div className="profile-info-item">
                <span>{t('dashboard.experience')}</span>
                <strong>{getExperienceLabel(profile, t, i18n.language)}</strong>
              </div>

              <div className="profile-info-item">
                <span>{t('dashboard.joinedAt')}</span>
                <strong>{getJoinedLabel(profile, i18n.language) || t('dashboard.joinedAtNotSpecified')}</strong>
              </div>

              <div className="profile-info-item full">
                <span>{t('dashboard.aboutMe')}</span>
                <strong>{profile?.bio || t('dashboard.noBio')}</strong>
              </div>
            </div>
          </div>

          <div className="dashboard-bottom">
            <div className="section-card dark-card">
              <div className="section-head">
                <h2>{t('dashboard.reviews')}</h2>
              </div>

              {loadingReviews ? (
                <div style={{ color: 'var(--muted)', fontSize: '14px' }}>{t('common.loading')}</div>
              ) : reviews.length === 0 ? (
                <div style={{ color: 'var(--muted)', fontSize: '14px' }}>{t('dashboard.noReviewsYet', { defaultValue: 'Отзывов пока нет' })}</div>
              ) : (
                reviews.map(review => (
                  <div key={review.id} className="review-short" style={{ marginBottom: '16px', borderBottom: '1px solid var(--line)', paddingBottom: '12px' }}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong>{review.reviewer?.full_name || t('masters.noName')}</strong>
                      <span style={{ color: '#f39c12', fontSize: '14px' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    </p>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--text)' }}>{review.comment}</p>
                  </div>
                ))
              )}
            </div>

            <div className="section-card dark-card">
              <div className="section-head">
                <h2>{t('dashboard.quickActions')}</h2>
              </div>

              <div className="quick-actions">
                <Link to="/create" className="quick-action-btn">
                  {t('dashboard.addService')}
                </Link>

                <Link to="/create?type=order" className="quick-action-btn secondary">
                  {t('dashboard.createJob')}
                </Link>

                <Link to="/messages" className="quick-action-btn ghost">
                  {t('dashboard.openMessages')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}