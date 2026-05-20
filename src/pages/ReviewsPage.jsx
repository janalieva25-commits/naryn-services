import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'
import { supabase } from '../lib/supabase'
import { createNotification } from '../services/notificationsService'

export default function ReviewsPage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()

  const jobId = searchParams.get('jobId')
  const serviceId = searchParams.get('serviceId')

  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [checkingDeal, setCheckingDeal] = useState(false)
  const [message, setMessage] = useState('')
  const [dealInfo, setDealInfo] = useState(null)
  const [canLeaveReview, setCanLeaveReview] = useState(false)
  const [alreadyReviewed, setAlreadyReviewed] = useState(false)

  const [form, setForm] = useState({
    reviewee_id: '',
    rating: 5,
    comment: '',
  })

  useEffect(() => {
    if (profile?.id) {
      setForm((prev) => ({
        ...prev,
        reviewee_id: profile.id,
      }))
    }
  }, [profile])

  useEffect(() => {
    const loadReviews = async () => {
      if (!profile?.id) {
        setLoading(false)
        return
      }

      setLoading(true)
      setMessage('')

      const { data, error } = await supabase
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
        .eq('reviewee_id', profile.id)
        .order('created_at', { ascending: false })

      if (error) {
        setMessage(error.message || t('reviews.loadError'))
        setReviews([])
      } else {
        setReviews(data || [])
      }

      setLoading(false)
    }

    loadReviews()
  }, [profile?.id, t])

  useEffect(() => {
    const checkDealForReview = async () => {
      if (!user?.id || (!jobId && !serviceId)) {
        setCanLeaveReview(false)
        setAlreadyReviewed(false)
        setDealInfo(null)
        return
      }

      setCheckingDeal(true)
      setMessage('')

      try {
        if (jobId) {
          const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('id, title, status, user_id')
            .eq('id', jobId)
            .single()

          if (jobError) throw jobError

          const { data: existingReview, error: reviewError } = await supabase
            .from('reviews')
            .select('id')
            .eq('job_id', jobId)
            .eq('reviewer_id', user.id)
            .maybeSingle()

          if (reviewError) throw reviewError

          setDealInfo({
            type: 'job',
            id: job.id,
            title: job.title,
            reviewee_id: job.user_id,
            status: job.status,
          })

          setForm((prev) => ({
            ...prev,
            reviewee_id: job.user_id,
          }))

          if (existingReview) {
            setAlreadyReviewed(true)
            setCanLeaveReview(false)
          } else if (job.status === 'completed' && job.user_id !== user.id) {
            setAlreadyReviewed(false)
            setCanLeaveReview(true)
          } else {
            setAlreadyReviewed(false)
            setCanLeaveReview(false)
          }
        }

        if (serviceId) {
          const { data: service, error: serviceError } = await supabase
            .from('services')
            .select('id, title, status, user_id')
            .eq('id', serviceId)
            .single()

          if (serviceError) throw serviceError

          const { data: existingReview, error: reviewError } = await supabase
            .from('reviews')
            .select('id')
            .eq('service_id', serviceId)
            .eq('reviewer_id', user.id)
            .maybeSingle()

          if (reviewError) throw reviewError

          setDealInfo({
            type: 'service',
            id: service.id,
            title: service.title,
            reviewee_id: service.user_id,
            status: service.status,
          })

          setForm((prev) => ({
            ...prev,
            reviewee_id: service.user_id,
          }))

          if (existingReview) {
            setAlreadyReviewed(true)
            setCanLeaveReview(false)
          } else if (service.status === 'completed' && service.user_id !== user.id) {
            setAlreadyReviewed(false)
            setCanLeaveReview(true)
          } else {
            setAlreadyReviewed(false)
            setCanLeaveReview(false)
          }
        }
      } catch (error) {
        setMessage(error.message || t('reviews.checkDealError'))
        setCanLeaveReview(false)
        setAlreadyReviewed(false)
        setDealInfo(null)
      } finally {
        setCheckingDeal(false)
      }
    }

    checkDealForReview()
  }, [user?.id, jobId, serviceId, t])

  const averageRating = useMemo(() => {
    if (!reviews.length) return 0
    const total = reviews.reduce((sum, item) => sum + Number(item.rating || 0), 0)
    return (total / reviews.length).toFixed(1)
  }, [reviews])

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!user?.id) {
      setMessage(t('reviews.mustLogin'))
      return
    }

    if (!dealInfo) {
      setMessage(t('reviews.noDealSelected'))
      return
    }

    if (!canLeaveReview) {
      setMessage(t('reviews.cannotLeaveReview'))
      return
    }

    if (!form.reviewee_id) {
      setMessage(t('reviews.noReviewee'))
      return
    }

    if (user.id === form.reviewee_id) {
      setMessage(t('reviews.cannotReviewSelf'))
      return
    }

    if (!form.comment.trim()) {
      setMessage(t('reviews.emptyCommentError'))
      return
    }

    setSending(true)
    setMessage('')

    const payload = {
      service_id: dealInfo.type === 'service' ? dealInfo.id : null,
      job_id: dealInfo.type === 'job' ? dealInfo.id : null,
      reviewer_id: user.id,
      reviewee_id: form.reviewee_id,
      rating: Number(form.rating),
      comment: form.comment.trim(),
    }

    const { data, error } = await supabase
      .from('reviews')
      .insert([payload])
      .select(`
        *,
        reviewer:reviewer_id (
          id,
          full_name,
          username,
          avatar_url
        )
      `)

    if (error) {
      setMessage(error.message || t('reviews.submitError'))
    } else {
      const newReviews = data || []
      setReviews((prev) => [...newReviews, ...prev])
      setAlreadyReviewed(true)
      setCanLeaveReview(false)
      
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
          userId: form.reviewee_id,
          type: 'review',
          content: t('profile.newReviewNotification', { rating: Number(form.rating), name: reviewerName }),
          link: `/profile/${form.reviewee_id}`
        })
      } catch (notifErr) {
        console.error('Failed to create notification', notifErr)
      }

      setForm((prev) => ({
        ...prev,
        rating: 5,
        comment: '',
      }))
      setMessage(t('reviews.publishedSuccess'))
    }

    setSending(false)
  }

  const getLocaleTag = (lang) => {
    return lang === 'ky' ? 'ky-KG' : lang === 'ru' ? 'ru-RU' : 'en-US'
  }

  return (
    <div className="reviews-page">
      <div className="reviews-layout">
        <div className="section-card dark-card">
          <div className="section-head">
            <h2>{t('reviews.myReviewsTitle')}</h2>
          </div>

          <div className="review-summary">
            <p>
              <strong>{t('reviews.averageRatingLabel')}</strong> {averageRating}/5
            </p>
            <p>
              <strong>{t('reviews.totalReviewsLabel')}</strong> {reviews.length}
            </p>
          </div>

          {loading ? (
            <p>{t('reviews.loadingReviews')}</p>
          ) : reviews.length === 0 ? (
            <p>{t('reviews.noReviewsYet')}</p>
          ) : (
            <div className="reviews-list">
              {reviews.map((review) => (
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

                    <span>{t('profile.ratingFormLabel')} {review.rating}/5</span>
                  </div>

                  <p>{review.comment || t('profile.noReviewText')}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="section-card dark-card">
          <div className="section-head">
            <h2>{t('profile.leaveReview')}</h2>
          </div>

          {checkingDeal ? (
            <p>{t('reviews.checkingDeal')}</p>
          ) : !jobId && !serviceId ? (
            <p>{t('reviews.onlyForFinishedDeals')}</p>
          ) : alreadyReviewed ? (
            <p>{t('reviews.alreadyReviewed')}</p>
          ) : !canLeaveReview ? (
            <p>{t('reviews.availableAfterDealFinished')}</p>
          ) : (
            <>
              {dealInfo && (
                <div className="experience-block">
                  <p>
                    <strong>{t('reviews.dealLabel')}</strong> {dealInfo.title}
                  </p>
                  <p>
                    <strong>{t('reviews.typeLabel')}</strong>{' '}
                    {dealInfo.type === 'service' ? t('categories.default') : t('orders.defaultJobCategory')}
                  </p>
                </div>
              )}

              <form className="review-form" onSubmit={handleSubmit}>
                <div className="review-field">
                  <label>{t('profile.ratingFormLabel')}</label>
                  <select
                    name="rating"
                    value={form.rating}
                    onChange={handleChange}
                  >
                    <option value="5">5</option>
                    <option value="4">4</option>
                    <option value="3">3</option>
                    <option value="2">2</option>
                    <option value="1">1</option>
                  </select>
                </div>

                <div className="review-field">
                  <label>{t('reviews.commentLabel')}</label>
                  <textarea
                    name="comment"
                    value={form.comment}
                    onChange={handleChange}
                    placeholder={t('reviews.commentPlaceholder')}
                    rows="6"
                  />
                </div>

                {message && <p className="upload-message">{message}</p>}

                <button type="submit" disabled={sending}>
                  {sending ? t('common.submitting') : t('reviews.publishBtn')}
                </button>
              </form>
            </>
          )}

          {!canLeaveReview && message && <p className="upload-message">{message}</p>}
        </div>
      </div>
    </div>
  )
}