import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getJobs } from '../services/jobsService'

const categoryKeys = {
  'Нужен сантехник': 'needPlumber',
  'Нужен электрик': 'needElectrician',
  'Нужна уборка': 'needCleaning',
  'Нужен ремонт и строительство': 'needRepair',
  'Нужна IT помощь': 'needIt',
  'Нужен дизайн': 'needDesign',
  'Нужен маркетинг и реклама': 'needMarketing',
  'Нужна перевозка и доставка': 'needCargo',
  'Нужен репетитор / обучение': 'needTutor',
  'Нужны услуги красоты и здоровья': 'needBeauty',
  'Нужен бытовой ремонт': 'needHandyman',
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
  needPlumber: { icon: '🔧', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  needElectrician: { icon: '💡', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  needCleaning: { icon: '🧼', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  needRepair: { icon: '🛠️', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  needIt: { icon: '💻', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  needDesign: { icon: '🎨', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  needMarketing: { icon: '📣', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  needCargo: { icon: '🚛', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  needTutor: { icon: '🎓', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  needBeauty: { icon: '💅', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  needHandyman: { icon: '🔨', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
  default: { icon: '📌', bg: 'linear-gradient(135deg, color-mix(in srgb, var(--primary) 12%, transparent) 0%, color-mix(in srgb, var(--surface) 20%, transparent) 100%)' },
}

function getBaseCategoryKey(cat) {
  if (!cat) return 'other';
  const c = cat.toLowerCase().trim();
  
  if (c === 'plumbing' || c === 'needplumber' || c === 'сантехника' || c === 'нужен сантехник') return 'plumbing';
  if (c === 'electrical' || c === 'needelectrician' || c === 'электрика' || c === 'нужен электрик') return 'electrical';
  if (c === 'cleaning' || c === 'needcleaning' || c === 'уборка' || c === 'нужна уборка') return 'cleaning';
  if (c === 'repair' || c === 'needrepair' || c === 'ремонт и строительство' || c === 'нужен ремонт и строительство' || c === 'ремонт') return 'repair';
  if (c === 'itdesign' || c === 'needit' || c === 'it услуги' || c === 'нужна it помощь' || c === 'it помощь') return 'itDesign';
  if (c === 'design' || c === 'needdesign' || c === 'дизайн' || c === 'нужен дизайн') return 'design';
  if (c === 'marketing' || c === 'needmarketing' || c === 'маркетинг и реклама' || c === 'нужен маркетинг и реклама' || c === 'маркетинг') return 'marketing';
  if (c === 'cargo' || c === 'needcargo' || c === 'перевозки и доставка' || c === 'нужна перевозка и доставка' || c === 'перевозки' || c === 'доставка') return 'cargo';
  if (c === 'education' || c === 'needtutor' || c === 'репетиторы и обучение' || c === 'нужен репетитор / обучение' || c === 'репетиторы' || c === 'обучение') return 'education';
  if (c === 'beauty' || c === 'needbeauty' || c === 'красота и здоровье' || c === 'нужны услуги красоты и здоровья') return 'beauty';
  if (c === 'handyman' || c === 'needhandyman' || c === 'бытовой ремонт' || c === 'нужен бытовой ремонт') return 'handyman';
  
  return 'other';
}

function getTranslationKey(cat) {
  if (!cat) return 'other';
  const c = cat.toLowerCase().trim();
  
  // Requests/Orders
  if (c === 'needplumber' || c === 'нужен сантехник') return 'needPlumber';
  if (c === 'needelectrician' || c === 'нужен электрик') return 'needElectrician';
  if (c === 'needcleaning' || c === 'нужна уборка') return 'needCleaning';
  if (c === 'needrepair' || c === 'нужен ремонт и строительство') return 'needRepair';
  if (c === 'needit' || c === 'нужна it помощь') return 'needIt';
  if (c === 'needdesign' || c === 'нужен дизайн') return 'needDesign';
  if (c === 'needmarketing' || c === 'нужен маркетинг и реклама') return 'needMarketing';
  if (c === 'needcargo' || c === 'нужна перевозка и доставка') return 'needCargo';
  if (c === 'needtutor' || c === 'нужен репетитор / обучение') return 'needTutor';
  if (c === 'needbeauty' || c === 'нужны услуги красоты и здоровья') return 'needBeauty';
  if (c === 'needhandyman' || c === 'нужен бытовой ремонт') return 'needHandyman';

  // Base/Services
  if (c === 'plumbing' || c === 'сантехника') return 'plumbing';
  if (c === 'electrical' || c === 'электрика') return 'electrical';
  if (c === 'cleaning' || c === 'уборка') return 'cleaning';
  if (c === 'repair' || c === 'ремонт и строительство' || c === 'ремонт') return 'repair';
  if (c === 'itdesign' || c === 'it услуги') return 'itDesign';
  if (c === 'design' || c === 'дизайн') return 'design';
  if (c === 'marketing' || c === 'маркетинг и реклама' || c === 'маркетинг') return 'marketing';
  if (c === 'cargo' || c === 'перевозки и доставка' || c === 'перевозки' || c === 'доставка') return 'cargo';
  if (c === 'education' || c === 'репетиторы и обучение' || c === 'репетиторы' || c === 'обучение') return 'education';
  if (c === 'beauty' || c === 'красота и здоровье') return 'beauty';
  if (c === 'handyman' || c === 'бытовой ремонт') return 'handyman';
  
  return 'other';
}

function getCategoryTheme(category) {
  const key = getBaseCategoryKey(category)
  return categoryThemes[key] || categoryThemes.default
}

function getJobImage(job) {
  if (job?.image_url) return job.image_url
  if (Array.isArray(job?.image_urls) && job.image_urls.length > 0) {
    return job.image_urls[0]
  }
  return null
}

const ITEMS_PER_PAGE = 20

export default function OrdersPage() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [jobs, setJobs] = useState([])
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
    const loadJobs = async () => {
      try {
        const data = await getJobs()
        setJobs(data || [])
      } catch (error) {
        alert(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadJobs()
  }, [])

  const filteredJobs = useMemo(() => {
    let result = [...jobs]

    if (search.trim()) {
      const value = search.toLowerCase()
      result = result.filter(
        (job) =>
          job.title?.toLowerCase().includes(value) ||
          job.description?.toLowerCase().includes(value) ||
          job.category?.toLowerCase().includes(value)
      )
    }

    if (district !== 'all') {
      result = result.filter((job) => job.district === district)
    }

    if (category !== 'all') {
      const targetBaseKey = getBaseCategoryKey(category)
      result = result.filter((job) => getBaseCategoryKey(job.category) === targetBaseKey)
    }

    if (minPrice !== '') {
      result = result.filter((job) => Number(job.price || 0) >= Number(minPrice))
    }

    if (maxPrice !== '') {
      result = result.filter((job) => Number(job.price || 0) <= Number(maxPrice))
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
  }, [jobs, search, district, category, minPrice, maxPrice, sortBy])

  const totalPages = Math.max(1, Math.ceil(filteredJobs.length / ITEMS_PER_PAGE))

  const paginatedJobs = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredJobs.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredJobs, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [search, district, category, minPrice, maxPrice, sortBy])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const getTranslatedCategory = (cat) => {
    const key = getTranslationKey(cat)
    return t(`categories.${key}`)
  }

  const getTranslatedDistrict = (dist) => {
    return dist ? t(`districts.${dist}`, { defaultValue: dist }) : t('services.districtNotSpecified')
  }

  return (
    <div className="orders-page">
      <div className="section-card dark-card">
        <div className="section-head">
          <h2>{t('orders.clientOrdersTitle')}</h2>
        </div>

        <div className="services-filters orders-filters-grid">
          <input
            type="text"
            placeholder={t('orders.searchPlaceholder')}
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
          <h2>{t('orders.allOrdersTitle')}</h2>
        </div>

        {loading ? (
          <p>{t('common.loading')}</p>
        ) : paginatedJobs.length === 0 ? (
          <div className="empty-state-box">
            <h3>{t('orders.emptyStateTitle')}</h3>
            <p>{t('orders.emptyStateText')}</p>
          </div>
        ) : (
          <>
            <div
              className="orders-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                gap: '16px',
              }}
            >
              {paginatedJobs.map((job) => {
                const theme = getCategoryTheme(job.category)
                const imageUrl = getJobImage(job)

                return (
                  <article
                    className="order-card-modern"
                    key={job.id}
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      overflow: 'hidden',
                      borderRadius: '18px',
                    }}
                  >
                    <Link
                      to={`/jobs/${job.id}`}
                      className="order-card-link"
                      style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
                    >
                      <div
                        className="order-card-image-wrap"
                        style={{
                          ...(imageUrl ? {} : { background: theme.bg }),
                          aspectRatio: '1 / 1',
                          overflow: 'hidden',
                        }}
                      >
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={job.title}
                            className="order-card-image"
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
                            className="order-placeholder"
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
                            <div className="order-placeholder-icon">{theme.icon}</div>
                            <div className="order-placeholder-title">
                              {getTranslatedCategory(job.category)}
                            </div>
                            <div className="order-placeholder-subtitle">
                              {job.title || t('orders.defaultJobTitle')}
                            </div>
                          </div>
                        )}

                        <span className="order-category-badge">
                          {getTranslatedCategory(job.category) || t('orders.defaultJobCategory')}
                        </span>
                      </div>
                    </Link>

                    <div
                      className="order-card-body"
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
                        {job.title}
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
                        {job.description || t('services.noDescription')}
                      </p>

                      <div className="order-card-meta" style={{ marginTop: 'auto' }}>
                        <div className="order-card-meta-left">
                          <strong>
                            {job.price ? `${job.price} ${t('services.priceLabel')}` : t('services.priceNotSpecified')}
                          </strong>
                          <span>
                            {getTranslatedDistrict(job.district)}
                          </span>
                        </div>

                        <div className="order-card-meta-right" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {job.public_profiles?.avatar_url ? (
                              <img 
                                src={job.public_profiles.avatar_url} 
                                alt="avatar" 
                                style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'var(--text-muted)' }}>
                                {(job.public_profiles?.full_name || 'U').charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span>{job.public_profiles?.full_name || t('services.defaultUser')}</span>
                          </div>
                          <span>{t('services.ratingLabel')}: {job.public_profiles?.rating || 0}</span>
                        </div>
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
                        >
                          {t('orders.openOrder')}
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