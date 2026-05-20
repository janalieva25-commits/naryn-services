import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getServices } from '../services/servicesService'

const categoryKeys = {
  'Сантехника': 'plumbing',
  'Электрика': 'electrical',
  'Уборка': 'cleaning',
  'Ремонт и строительство': 'repair',
  'IT услуги': 'itDesign',
  'Дизайн': 'design',
  'Маркетинг и реклама': 'marketing',
  'Перевозки и доставка': 'cargo',
  'Репетиторы и обучение': 'education',
  'Красота и здоровье': 'beauty',
  'Бытовой ремонт': 'handyman',
  'Другое': 'other',
}

const categoryThemes = {
  plumbing: { icon: '🔧', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  electrical: { icon: '💡', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  cleaning: { icon: '🧼', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  repair: { icon: '🛠️', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  itDesign: { icon: '💻', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  design: { icon: '🎨', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  marketing: { icon: '📣', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  cargo: { icon: '🚛', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  education: { icon: '🎓', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  beauty: { icon: '💅', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  handyman: { icon: '🔨', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  other: { icon: '🧩', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  default: { icon: '🛎️', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
}

function getBaseCategoryKey(cat) {
  const key = categoryKeys[cat];
  if (!key) return 'other';
  if (key.startsWith('need')) {
    const base = key.slice(4);
    if (base === 'Plumber') return 'plumbing';
    if (base === 'Electrician') return 'electrical';
    if (base === 'Cleaning') return 'cleaning';
    if (base === 'Repair') return 'repair';
    if (base === 'It') return 'itDesign';
    if (base === 'Design') return 'design';
    if (base === 'Marketing') return 'marketing';
    if (base === 'Cargo') return 'cargo';
    if (base === 'Tutor') return 'education';
    if (base === 'Beauty') return 'beauty';
    if (base === 'Handyman') return 'handyman';
  }
  return key;
}

function getCategoryTheme(category) {
  const key = getBaseCategoryKey(category)
  return categoryThemes[key] || categoryThemes.default
}

function getServiceImage(service) {
  if (service?.image_url) return service.image_url
  if (Array.isArray(service?.image_urls) && service.image_urls.length > 0) {
    return service.image_urls[0]
  }
  return null
}

const ITEMS_PER_PAGE = 20

export default function ServicesPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState(() => searchParams.get('search') || '')
  const [district, setDistrict] = useState(() => searchParams.get('district') || 'all')
  const [category, setCategory] = useState(() => searchParams.get('category') || 'all')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const qSearch = searchParams.get('search') || ''
    const qCategory = searchParams.get('category') || 'all'
    const qDistrict = searchParams.get('district') || 'all'
    setSearch(qSearch)
    setCategory(qCategory)
    setDistrict(qDistrict)
  }, [searchParams])

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await getServices()
        setServices(data || [])
      } catch (error) {
        alert(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadServices()
  }, [])

  const filteredServices = useMemo(() => {
    let result = [...services]

    if (search.trim()) {
      const value = search.toLowerCase()
      result = result.filter(
        (service) =>
          service.title?.toLowerCase().includes(value) ||
          service.description?.toLowerCase().includes(value) ||
          service.category?.toLowerCase().includes(value)
      )
    }

    if (district !== 'all') {
      result = result.filter((service) => service.district === district)
    }

    if (category !== 'all') {
      const targetBaseKey = getBaseCategoryKey(category)
      result = result.filter((service) => getBaseCategoryKey(service.category) === targetBaseKey)
    }

    if (minPrice !== '') {
      result = result.filter(
        (service) => Number(service.price || 0) >= Number(minPrice)
      )
    }

    if (maxPrice !== '') {
      result = result.filter(
        (service) => Number(service.price || 0) <= Number(maxPrice)
      )
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0))
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0))
    } else if (sortBy === 'rating_desc') {
      result.sort(
        (a, b) => Number(b.public_profiles?.rating || 0) - Number(a.public_profiles?.rating || 0)
      )
    } else if (sortBy === 'rating_asc') {
      result.sort(
        (a, b) => Number(a.public_profiles?.rating || 0) - Number(b.public_profiles?.rating || 0)
      )
    } else {
      result.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
    }

    return result
  }, [services, search, district, category, minPrice, maxPrice, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredServices.length / ITEMS_PER_PAGE))

  const paginatedServices = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredServices.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredServices, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, district, category, minPrice, maxPrice, sortBy])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const getTranslatedCategory = (cat) => {
    const key = categoryKeys[cat]
    return key ? t(`categories.${key}`) : cat
  }

  const getTranslatedDistrict = (dist) => {
    return dist ? t(`districts.${dist}`, { defaultValue: dist }) : t('services.districtNotSpecified')
  }

  return (
    <div className="services-page">
      <div className="section-card dark-card">
        <div className="section-head">
          <h2>{t('services.catalogTitle')}</h2>
        </div>

        <div className="services-filters">
          <input
            type="text"
            placeholder={t('services.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select value={district} onChange={(e) => setDistrict(e.target.value)}>
            <option value="all">{t('services.allDistricts')}</option>
            <option value="naryn">{t('districts.naryn')}</option>
            <option value="at_bashy">{t('districts.at_bashy')}</option>
            <option value="ak_talaa">{t('districts.ak_talaa')}</option>
            <option value="jumgal">{t('districts.jumgal')}</option>
            <option value="kochkor">{t('districts.kochkor')}</option>
          </select>

          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">{t('categories.all')}</option>
            {Object.keys(categoryKeys).map((catName) => (
              <option key={catName} value={catName}>
                {getTranslatedCategory(catName)}
              </option>
            ))}
          </select>

          <input
            type="number"
            placeholder={t('services.priceFrom')}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="newest">{t('services.sortNewest')}</option>
            <option value="price_asc">{t('services.sortPriceAsc')}</option>
            <option value="price_desc">{t('services.sortPriceDesc')}</option>
            <option value="rating_desc">{t('services.sortRatingDesc')}</option>
            <option value="rating_asc">{t('services.sortRatingAsc')}</option>
          </select>
        </div>
      </div>

      <div className="section-card dark-card">
        <div className="section-head">
          <h2>{t('services.allServicesTitle')}</h2>
        </div>

        {loading ? (
          <p>{t('common.loading')}</p>
        ) : paginatedServices.length === 0 ? (
          <div className="empty-state-box">
            <h3>{t('services.emptyStateTitle')}</h3>
            <p>{t('services.emptyStateText')}</p>
          </div>
        ) : (
          <>
            <div
              className="my-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              {paginatedServices.map((service) => {
                const theme = getCategoryTheme(service.category)
                const imageUrl = getServiceImage(service)

                return (
                  <article
                    className="market-card"
                    key={service.id}
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      borderRadius: '18px',
                    }}
                  >
                    <Link
                      to={`/services/${service.id}`}
                      className="card-link"
                      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                    >
                      <div
                        className="market-image-wrap"
                        style={{
                          ...(imageUrl ? {} : { background: theme.bg }),
                          aspectRatio: '1 / 1',
                          overflow: 'hidden',
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={service.title}
                            className="market-card-image"
                            loading="lazy"
                            decoding="async"
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
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              textAlign: 'center',
                              padding: '16px',
                            }}
                          >
                            <div className="market-placeholder-icon">{theme.icon}</div>
                            <div className="market-placeholder-title">
                              {getTranslatedCategory(service.category)}
                            </div>
                            <div className="market-placeholder-subtitle">
                              {service.title || t('services.defaultServiceTitle')}
                            </div>
                          </div>
                        )}

                        <span className="market-category-badge">
                          {getTranslatedCategory(service.category) || t('services.defaultServiceCategory')}
                        </span>
                      </div>
                    </Link>

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
                        {service.title}
                      </h3>

                      <p
                        style={{
                          fontSize: '13px',
                          lineHeight: '1.45',
                          marginBottom: '8px',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {service.description || t('services.noDescription')}
                      </p>

                      <div className="market-meta" style={{ marginTop: 'auto' }}>
                        <div className="market-meta-left">
                          <strong>
                            {service.price ? `${service.price} ${t('services.priceLabel')}` : t('services.priceNotSpecified')}
                          </strong>
                          <span>
                            {getTranslatedDistrict(service.district)}
                          </span>
                        </div>

                        <div className="market-meta-right" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {service.public_profiles?.avatar_url ? (
                              <img 
                                src={service.public_profiles.avatar_url} 
                                alt="avatar" 
                                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
                                {(service.public_profiles?.full_name || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span>
                              {service.public_profiles?.full_name || t('services.defaultUser')}
                            </span>
                          </div>
                          <span>{t('services.ratingLabel')}: {service.public_profiles?.rating || 0}</span>
                        </div>
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
                        >
                          {t('services.openService')}
                        </Link>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>

            {totalPages > 1 && (
              <nav className="pagination" aria-label="Pagination">
                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  aria-label="Go to previous page"
                >
                  {t('services.prevBtn')}
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={page === currentPage ? 'active' : ''}
                    aria-label={`Go to page ${page}`}
                    aria-current={page === currentPage ? 'page' : undefined}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  aria-label="Go to next page"
                >
                  {t('services.nextBtn')}
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  )
}