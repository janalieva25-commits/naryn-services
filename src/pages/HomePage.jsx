import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import HeroSection from '../components/home/HeroSection'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'

export default function HomePage() {
  const { user } = useAuth()
  const { profile } = useProfile()
  const { t } = useTranslation()

  const [topMasters, setTopMasters] = useState([])
  const [popularServices, setPopularServices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true)

        const [
          { data: mastersData, error: mastersError },
          { data: servicesData, error: servicesError },
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, avatar_url, rating, role, bio')
            .eq('role', 'specialist')
            .order('rating', { ascending: false })
            .limit(4),

          supabase
            .from('services')
            .select(`
              id,
              title,
              price,
              category,
              district,
              image_urls,
              image_url,
              user_id,
              profiles:user_id (
                id,
                full_name,
                rating
              )
            `)
            .order('created_at', { ascending: false })
            .limit(3),
        ])

        if (mastersError) throw mastersError
        if (servicesError) throw servicesError

        setTopMasters(mastersData || [])
        setPopularServices(servicesData || [])
      } catch (error) {
        console.error('Home data load error:', error.message)
      } finally {
        setLoading(false)
      }
    }

    loadHomeData()
  }, [])

  const getTranslatedDistrict = (dist) => {
    return dist ? t(`districts.${dist}`, { defaultValue: dist }) : t('services.districtNotSpecified')
  }

  return (
    <div className="home-page">
      <HeroSection />

      <section className="content-grid">
        <div className="content-main">
          <div className="section-card">
            <div className="section-head">
              <h2>{t('home.popularMasters')}</h2>
              <Link to="/masters">{t('home.viewAll')}</Link>
            </div>

            {loading ? (
              <p>{t('masters.loadingMasters')}</p>
            ) : topMasters.length === 0 ? (
              <p>{t('home.noMastersYet')}</p>
            ) : (
              <div className="cards-row">
                {topMasters.map((master) => (
                  <Link
                    key={master.id}
                    to={`/profile/${master.id}?tab=services`}
                    className="service-card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {master.avatar_url ? (
                      <img
                        src={master.avatar_url}
                        alt={master.full_name || t('masters.defaultSpecialist')}
                        className="service-image"
                      />
                    ) : (
                      <div className="service-image"></div>
                    )}

                    <h3>{master.full_name || t('services.defaultUser')}</h3>
                    <p>{master.bio || t('home.defaultMasterBio')}</p>
                    <span>★ {master.rating || 0}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="section-card">
            <div className="section-head">
              <h2>{t('home.howItWorksTitle')}</h2>
            </div>

            <div className="steps-grid">
              <div className="step-item">
                <strong>1.</strong>
                <p>{t('home.step1Text')}</p>
              </div>
              <div className="step-item">
                <strong>2.</strong>
                <p>{t('home.step2Text')}</p>
              </div>
              <div className="step-item">
                <strong>3.</strong>
                <p>{t('home.step3Text')}</p>
              </div>
              <div className="step-item">
                <strong>4.</strong>
                <p>{t('home.step4Text')}</p>
              </div>
            </div>
          </div>
        </div>

        <aside className="content-sidebar">
          <div className="section-card">
            <div className="section-head">
              <h2>{t('home.popularServices')}</h2>
            </div>

            {loading ? (
              <p>{t('home.loadingServices')}</p>
            ) : popularServices.length === 0 ? (
              <p>{t('home.noServicesYet')}</p>
            ) : (
              <div className="mini-list">
                {popularServices.map((service) => (
                  <Link
                    key={service.id}
                    to={`/services/${service.id}`}
                    className="mini-item"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    {service.image_urls?.[0] || service.image_url ? (
                      <img
                        src={service.image_urls?.[0] || service.image_url}
                        alt={service.title}
                        className="mini-thumb"
                      />
                    ) : (
                      <div className="mini-thumb"></div>
                    )}

                    <div>
                      <h4>{service.title}</h4>
                      <p>
                        {service.price ? t('home.priceFromSom', { price: service.price }) : t('services.priceNotSpecified')}
                      </p>
                      <p>
                        {getTranslatedDistrict(service.district)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="section-card">
            <div className="section-head">
              <h2>{t('home.cabinetTitle')}</h2>
            </div>

            {user && profile ? (
              <>
                <Link
                  to={`/profile/${profile.id}?tab=services`}
                  className="profile-box"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name || t('masters.profileLink')}
                      className="profile-avatar"
                    />
                  ) : (
                    <div className="profile-avatar"></div>
                  )}

                  <div>
                    <h4>{profile.full_name || t('services.defaultUser')}</h4>
                    <p>{profile.role === 'specialist' ? t('dashboard.roleSpecialist') : t('dashboard.roleCustomer')}</p>
                  </div>
                </Link>

                <ul className="profile-menu">
                  <li>
                    <Link to="/my-ads">{t('nav.myAds')}</Link>
                  </li>
                  <li>
                    <Link to="/my-offers">{t('nav.myResponses')}</Link>
                  </li>
                  <li>
                    <Link to="/messages">{t('nav.messages')}</Link>
                  </li>
                  <li>
                    <Link to="/reviews">{t('home.reviewsLink')}</Link>
                  </li>
                  <li>
                    <Link to="/settings">{t('home.profileSettingsLink')}</Link>
                  </li>
                </ul>
              </>
            ) : (
              <div className="profile-box">
                <div>
                  <h4>{t('home.guestTitle')}</h4>
                  <p>{t('home.guestSubtitle')}</p>
                  <div style={{ marginTop: '12px' }}>
                    <Link to="/login">{t('auth.login')}</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  )
}