import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { createReview, checkCanReview } from '../services/reviewsService'
import { createNotification } from '../services/notificationsService'

function formatMonthYear(value, lang) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toLocaleDateString(lang === 'ky' ? 'ky-KG' : lang === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })
}

function getExperienceText(profile, t, lang) {
  if (!profile?.experience_from) return t('masters.noExperience')

  return `${formatMonthYear(profile.experience_from, lang)} — ${
    profile.experience_to
      ? formatMonthYear(profile.experience_to, lang)
      : t('dashboard.presentTime')
  }`
}

export default function ProfilePage() {
  const { id } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const { t, i18n } = useTranslation()

  const initialTab = searchParams.get('tab') === 'orders' ? 'orders' : 'services'

  const [activeTab, setActiveTab] = useState(initialTab)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [services, setServices] = useState([])
  const [jobs, setJobs] = useState([])
  const [reviews, setReviews] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  const { user } = useAuth()
  const [canReview, setCanReview] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState('')
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [showAllReviews, setShowAllReviews] = useState(false)

  useEffect(() => {
    const tab = searchParams.get('tab')
    setActiveTab(tab === 'orders' ? 'orders' : 'services')
  }, [searchParams])

  useEffect(() => {
    const loadProfilePage = async () => {
      try {
        setLoading(true)
        setErrorMessage('')

        const [
          { data: profileData, error: profileError },
          { data: servicesData, error: servicesError },
          { data: jobsData, error: jobsError },
          { data: reviewsData, error: reviewsError },
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single(),

          supabase
            .from('services')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false }),

          supabase
            .from('jobs')
            .select('*')
            .eq('user_id', id)
            .order('created_at', { ascending: false }),

          supabase
            .from('reviews')
            .select(`
              *,
              reviewer:reviewer_id (
                id,
                full_name,
                username,
                avatar_url
              )
            `)
            .eq('reviewee_id', id)
            .order('created_at', { ascending: false }),
        ])

        if (profileError) throw profileError
        if (servicesError) throw servicesError
        if (jobsError) throw jobsError
        if (reviewsError) throw reviewsError

        setProfile(profileData)
        setServices(servicesData || [])
        setJobs(jobsData || [])
        setReviews(reviewsData || [])

        if (user && user.id !== id) {
          const hasChat = await checkCanReview(user.id, id)
          setCanReview(hasChat)
        }
      } catch (error) {
        setErrorMessage(error.message || t('masters.loadError'))
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadProfilePage()
    }
  }, [id, user, t])

  const isSpecialist = profile?.role === 'specialist'

  const servicesCount = useMemo(() => services.length, [services])
  const jobsCount = useMemo(() => jobs.length, [jobs])

  const averageRating = useMemo(() => {
    if (profile?.rating) return Number(profile.rating).toFixed(1)
    if (!reviews.length) return '0.0'

    const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0)
    return (total / reviews.length).toFixed(1)
  }, [profile?.rating, reviews])

  const reviewsCount = useMemo(() => {
    if (typeof profile?.reviews_count === 'number') return profile.reviews_count
    return reviews.length
  }, [profile?.reviews_count, reviews])

  const handleTabChange = (e) => {
    const value = e.target.value
    setActiveTab(value)
    setSearchParams({ tab: value })
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    setIsSubmittingReview(true)
    setReviewError('')
    
    try {
      const newReview = await createReview({
        reviewer_id: user.id,
        reviewee_id: id,
        rating: reviewRating,
        comment: reviewComment,
      })
      
      setReviews(prev => [newReview, ...prev])
      setShowReviewForm(false)
      setReviewComment('')
      setReviewRating(5)

      // Create notification for the user receiving the review
      try {
        let reviewerName = user.user_metadata?.full_name || t('masters.noName')
        try {
          const { data: reviewerProfile } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single()
          if (reviewerProfile?.full_name) {
            reviewerName = reviewerProfile.full_name
          }
        } catch (err) {
          console.error('Failed to fetch reviewer profile name', err)
        }

        await createNotification({
          userId: id,
          type: 'review',
          content: t('profile.newReviewNotification', { rating: reviewRating, name: reviewerName }),
          link: `/profile/${id}`
        })
      } catch (notifErr) {
        console.error('Failed to create notification', notifErr)
      }

    } catch (err) {
      setReviewError(err.message || t('profile.reviewSubmitError'))
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const getTranslatedDistrict = (dist) => {
    return dist ? t(`districts.${dist}`, { defaultValue: dist }) : t('services.districtNotSpecified')
  }

  const getLocaleTag = (lang) => {
    return lang === 'ky' ? 'ky-KG' : lang === 'ru' ? 'ru-RU' : 'en-US'
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="section-card dark-card">
          <div className="section-head">
            <h2>{t('dashboard.loadingProfile')}</h2>
          </div>
          <p>{t('profile.loadingText')}</p>
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="profile-page">
        <div className="section-card dark-card">
          <div className="section-head">
            <h2>{t('common.error')}</h2>
          </div>
          <p>{errorMessage}</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <div className="section-card dark-card">
          <div className="section-head">
            <h2>{t('profile.notFoundTitle')}</h2>
          </div>
          <p>{t('profile.notFoundDesc')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <div className="profile-cover-section section-card">
        <div className="profile-header-main">
          <div className="profile-avatar-wrap">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || t('services.defaultUser')}
                className="profile-avatar-image"
              />
            ) : (
              <div className="profile-avatar-placeholder">
                {(profile.full_name || 'U').trim().charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="profile-header-info">
            <div className="profile-name-row" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
              <h1 style={{ margin: 0, lineHeight: 1.2 }}>{profile.full_name || t('services.defaultUser')}</h1>
              {isSpecialist && <span className="badge-specialist" style={{ margin: 0 }}>{t('dashboard.roleSpecialist')}</span>}
            </div>
            <p className="profile-username">@{profile.username || 'username'}</p>

            <div className="profile-badges">
              <span className="info-badge">
                📍 {getTranslatedDistrict(profile.district)}
              </span>
              {profile.phone && (
                <span className="info-badge">📞 {profile.phone}</span>
              )}
            </div>
          </div>
        </div>

        {profile.bio && (
          <div className="profile-bio-box">
            <h3>{t('dashboard.aboutMe')}</h3>
            <p>{profile.bio}</p>
          </div>
        )}
      </div>

      {isSpecialist && (
        <div className="profile-widgets-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          <div className="section-card stat-widget" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>⭐ {t('services.ratingLabel')}</h3>
            <div className="stat-value">{averageRating}</div>
            <p className="stat-sub">{t('profile.basedOnReviews', { count: reviewsCount })}</p>
          </div>
          
          <div className="section-card stat-widget" style={{ padding: '16px' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '8px' }}>💼 {t('dashboard.experience')}</h3>
            <div className="stat-value-text" style={{ fontSize: '14px' }}>{getExperienceText(profile, t, i18n.language)}</div>
          </div>
        </div>
      )}

      {isSpecialist && (
        <div className="section-card">
          <div className="section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{t('profile.clientReviews', { count: reviews.length })}</h2>
            {canReview && !showReviewForm && (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="action-button primary"
                style={{ borderRadius: '999px', padding: '6px 16px', fontSize: '13px' }}
              >
                {t('profile.leaveReview')}
              </button>
            )}
          </div>

          {showReviewForm && (
            <form onSubmit={handleReviewSubmit} className="review-form profile-bio-box" style={{ marginBottom: '20px' }}>
              <h3 style={{ marginBottom: '12px' }}>{t('profile.newReview')}</h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: 'var(--text-muted)' }}>{t('profile.ratingFormLabel')}</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      style={{
                        background: 'none',
                        border: 'none',
                        fontSize: '24px',
                        cursor: 'pointer',
                        color: star <= reviewRating ? 'var(--primary)' : 'var(--line)',
                        padding: 0
                      }}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder={t('profile.reviewCommentPlaceholder')}
                  required
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid var(--line)',
                    background: 'var(--bg-main)',
                    color: 'var(--text-color)',
                    resize: 'vertical'
                  }}
                />
              </div>

              {reviewError && <p style={{ color: '#ef4444', marginBottom: '16px', fontSize: '13px' }}>{reviewError}</p>}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="submit" 
                  disabled={isSubmittingReview}
                  className="action-button primary"
                  style={{ borderRadius: '999px', padding: '8px 20px', fontWeight: 'bold' }}
                >
                  {isSubmittingReview ? t('common.submitting') : t('common.send')}
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowReviewForm(false)}
                  className="action-button secondary"
                  style={{ borderRadius: '999px', padding: '8px 20px' }}
                >
                  {t('common.cancel')}
                </button>
              </div>
            </form>
          )}

          {reviews.length === 0 && !showReviewForm ? (
            <p style={{ color: 'var(--text-muted)' }}>{t('profile.noReviewsYet')}</p>
          ) : (
            <div className="reviews-list">
              {reviews.slice(0, showAllReviews ? reviews.length : 2).map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-top">
                    <div className="review-author">
                      {review.reviewer?.avatar_url ? (
                        <img
                          src={review.reviewer.avatar_url}
                          alt={review.reviewer.full_name || t('profile.reviewAuthorAlt')}
                          className="review-avatar"
                        />
                      ) : (
                        <div className="review-avatar"></div>
                      )}
                      <div>
                        <strong>
                          {review.reviewer?.full_name ||
                            review.reviewer?.username ||
                            t('services.defaultUser')}
                        </strong>
                        <p>
                          {new Date(review.created_at).toLocaleDateString(getLocaleTag(i18n.language))}
                        </p>
                      </div>
                    </div>
                    <span className="review-rating" style={{ color: 'var(--primary)', fontWeight: 'bold' }}>★ {review.rating}</span>
                  </div>
                  <p className="review-text">{review.comment || t('profile.noReviewText')}</p>
                </div>
              ))}
              
              {!showAllReviews && reviews.length > 2 && (
                <button 
                  onClick={() => setShowAllReviews(true)}
                  style={{ 
                    width: '100%', 
                    padding: '12px', 
                    background: 'var(--bg-elevated)', 
                    border: '1px solid var(--line)', 
                    borderRadius: '12px',
                    color: 'var(--text)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '8px'
                  }}
                >
                  Показать все отзывы ({reviews.length})
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="section-card dark-card">
        <div className="section-head">
          <h2>{t('profile.userListings')}</h2>
        </div>

        <div className="profile-filter">
          <label htmlFor="profile-tab-select">{t('profile.showLabel')}</label>
          <select
            id="profile-tab-select"
            value={activeTab}
            onChange={handleTabChange}
          >
            <option value="services">{t('profile.servicesCountLabel', { count: servicesCount })}</option>
            <option value="orders">{t('profile.ordersCountLabel', { count: jobsCount })}</option>
          </select>
        </div>

        {activeTab === 'services' && (
          <div className="profile-tab-content">
            {services.length === 0 ? (
              <p>{t('services.emptyStateTitle')}</p>
            ) : (
              <div className="my-grid">
                {services.map((service) => (
                  <article key={service.id} className="market-card">
                    <div className="market-body">
                      <h3>{service.title}</h3>
                      <p>{service.description || t('services.noDescription')}</p>

                      <div className="market-meta">
                        <strong>
                          {service.price ? `${service.price} ${t('services.priceLabel')}` : t('services.priceNotSpecified')}
                        </strong>
                        <span>
                          {getTranslatedDistrict(service.district)}
                        </span>
                      </div>

                      <div className="market-card-footer" style={{ marginTop: '10px' }}>
                        <Link
                          to={`/services/${service.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '999px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '14px',
                            background: 'var(--gradient-primary)',
                            color: '#ffffff',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          }}
                        >{t('services.openService')}</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="profile-tab-content">
            {jobs.length === 0 ? (
              <p>{t('orders.emptyStateTitle')}</p>
            ) : (
              <div className="orders-grid">
                {jobs.map((job) => (
                  <article key={job.id} className="order-card-modern">
                    <div className="order-card-body">
                      <h3>{job.title}</h3>
                      <p>{job.description || t('services.noDescription')}</p>

                      <div className="order-card-meta">
                        <strong>
                          {job.price ? `${job.price} ${t('services.priceLabel')}` : t('services.priceNotSpecified')}
                        </strong>
                        <span>
                          {getTranslatedDistrict(job.district)}
                        </span>
                      </div>

                      <div className="order-card-footer" style={{ marginTop: '10px' }}>
                        <Link
                          to={`/jobs/${job.id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '999px',
                            textDecoration: 'none',
                            fontWeight: 700,
                            fontSize: '14px',
                            background: 'var(--gradient-primary)',
                            color: '#ffffff',
                            boxShadow: 'var(--shadow-sm)',
                            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                          }}
                        >{t('orders.openOrder')}</Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}