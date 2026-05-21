import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

function getExperienceText(master, t) {
  if (!master?.experience_from) return t('masters.noExperience')

  const from = new Date(master.experience_from)
  const to = master.experience_to ? new Date(master.experience_to) : null

  const fromYear = from.getFullYear()
  const toYear = to ? to.getFullYear() : new Date().getFullYear()

  const years = Math.max(1, toYear - fromYear + 1)
  return t('masters.yearsOfExperience', { count: years })
}

export default function MastersPage() {
  const { t } = useTranslation()
  const [masters, setMasters] = useState([])
  const [search, setSearch] = useState('')
  const [district, setDistrict] = useState('all')
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const loadMasters = async () => {
      try {
        setLoading(true)
        setErrorMessage('')

        const { data, error } = await supabase
          .from('profiles')
          .select(`
            id,
            full_name,
            username,
            role,
            bio,
            avatar_url,
            rating,
            district,
            experience_from,
            experience_to
          `)
          .eq('role', 'specialist')
          .not('experience_from', 'is', null)

        if (error) throw error

        if (data && data.length > 0) {
          const masterIds = data.map(m => m.id)
          const { data: reviewsData } = await supabase
            .from('reviews')
            .select('reviewee_id, rating')
            .in('reviewee_id', masterIds)

          const mappedMasters = data.map(m => {
            const masterReviews = (reviewsData || []).filter(r => r.reviewee_id === m.id)
            const calcRating = masterReviews.length > 0 
              ? (masterReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / masterReviews.length).toFixed(1)
              : 0
            return { ...m, calculatedRating: calcRating }
          })
          
          // Сортируем по высчитанному рейтингу
          mappedMasters.sort((a, b) => Number(b.calculatedRating) - Number(a.calculatedRating))
          setMasters(mappedMasters)
        } else {
          setMasters([])
        }
      } catch (error) {
        setErrorMessage(error.message || t('masters.loadError'))
      } finally {
        setLoading(false)
      }
    }

    loadMasters()
  }, [t])

  const filteredMasters = useMemo(() => {
    return masters.filter((master) => {
      const searchValue = search.trim().toLowerCase()

      const matchesSearch =
        !searchValue ||
        master.full_name?.toLowerCase().includes(searchValue) ||
        master.username?.toLowerCase().includes(searchValue) ||
        master.bio?.toLowerCase().includes(searchValue)

      const matchesDistrict =
        district === 'all' || master.district === district

      return matchesSearch && matchesDistrict
    })
  }, [masters, search, district])

  const getTranslatedDistrict = (dist) => {
    return dist ? t(`districts.${dist}`, { defaultValue: dist }) : t('services.districtNotSpecified')
  }

  return (
    <div className="directory-page">
      <div className="section-card dark-card">
        <div className="section-head">
          <h2>{t('masters.findMasterTitle')}</h2>

          <div className="services-filters">
            <input
              type="text"
              placeholder={t('masters.searchPlaceholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="all">{t('services.allDistricts')}</option>
              <option value="naryn">{t('districts.naryn')}</option>
              <option value="at_bashy">{t('districts.at_bashy')}</option>
              <option value="ak_talaa">{t('districts.ak_talaa')}</option>
              <option value="jumgal">{t('districts.jumgal')}</option>
              <option value="kochkor">{t('districts.kochkor')}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>{t('masters.loadingMasters')}</p>
        ) : errorMessage ? (
          <p>{errorMessage}</p>
        ) : filteredMasters.length === 0 ? (
          <p>{t('masters.noMastersFound')}</p>
        ) : (
          <div 
            className="masters-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '16px',
            }}
          >
            {filteredMasters.map((master) => (
              <article 
                className="market-card" 
                key={master.id}
                style={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  borderRadius: '18px',
                }}
              >
                <div
                  className="market-image-wrap"
                  style={{
                    background: 'var(--surface-soft)',
                    aspectRatio: '1 / 1',
                    overflow: 'hidden',
                  }}
                >
                  {master.avatar_url ? (
                    <img
                      src={master.avatar_url}
                      alt={master.full_name || t('masters.defaultSpecialist')}
                      className="market-card-image"
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div 
                      className="market-placeholder"
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        color: 'var(--text-muted)'
                      }}
                    >
                      {(master.full_name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  
                  {master.bio && (
                    <span className="market-category-badge">
                      {master.bio}
                    </span>
                  )}
                </div>

                <div 
                  className="market-body"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    paddingBottom: '10px',
                  }}
                >
                  <h3
                    style={{
                      marginBottom: '8px',
                      fontSize: '16px',
                      lineHeight: '1.3',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {master.full_name || t('masters.noName')}
                  </h3>

                  <p
                    style={{
                      fontSize: '13px',
                      lineHeight: '1.45',
                      marginBottom: '8px',
                      color: 'var(--text-muted)',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {getExperienceText(master, t)}
                  </p>

                  <div className="market-meta" style={{ marginTop: 'auto' }}>
                    <div className="market-meta-left">
                      <span>★ {master.calculatedRating || 0}</span>
                      <span>
                        {getTranslatedDistrict(master.district)}
                      </span>
                    </div>
                  </div>

                  <div className="market-card-footer" style={{ marginTop: '10px' }}>
                    <Link 
                      to={`/profile/${master.id}?tab=services`}
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
                    >
                      {t('masters.profileLink')}
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}