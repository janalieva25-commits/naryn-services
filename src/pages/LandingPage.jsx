import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import {
  Wrench, Sparkles, Truck, MonitorSmartphone,
  Scissors, GraduationCap, Hammer, CookingPot,
  HeartHandshake, BriefcaseBusiness, Search,
  Lightbulb, Paintbrush, HelpCircle
} from 'lucide-react'

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
}

const categoriesConfig = [
  { icon: Wrench, name: 'Сантехника', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { icon: Lightbulb, name: 'Электрика', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { icon: Sparkles, name: 'Уборка', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)' },
  { icon: Hammer, name: 'Ремонт и строительство', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { icon: MonitorSmartphone, name: 'IT услуги', color: '#6366f1', bg: 'rgba(99,102,241,0.12)' },
  { icon: Paintbrush, name: 'Дизайн', color: '#ec4899', bg: 'rgba(236,72,153,0.12)' },
  { icon: BriefcaseBusiness, name: 'Маркетинг и реклама', color: '#14b8a6', bg: 'rgba(20,184,166,0.12)' },
  { icon: Truck, name: 'Перевозки и доставка', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  { icon: GraduationCap, name: 'Репетиторы и обучение', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)' },
  { icon: HeartHandshake, name: 'Красота и здоровье', color: '#f43f5e', bg: 'rgba(244,63,94,0.12)' },
  { icon: Scissors, name: 'Бытовой ремонт', color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
  { icon: HelpCircle, name: 'Другое', color: '#64748b', bg: 'rgba(100,116,139,0.12)' },
]

const categoryThemes = {
  plumbing: { icon: '🔧' },
  electrical: { icon: '💡' },
  cleaning: { icon: '🧼' },
  repair: { icon: '🛠️' },
  itDesign: { icon: '💻' },
  design: { icon: '🎨' },
  marketing: { icon: '📣' },
  cargo: { icon: '🚛' },
  education: { icon: '🎓' },
  beauty: { icon: '💅' },
  handyman: { icon: '🔨' },
  other: { icon: '🧩' },
  needPlumber: { icon: '🔧' },
  needElectrician: { icon: '💡' },
  needCleaning: { icon: '🧼' },
  needRepair: { icon: '🛠️' },
  needIt: { icon: '💻' },
  needDesign: { icon: '🎨' },
  needMarketing: { icon: '📣' },
  needCargo: { icon: '🚛' },
  needTutor: { icon: '🎓' },
  needBeauty: { icon: '💅' },
  needHandyman: { icon: '🔨' },
  default: { icon: '🛎️' },
}

function getCategoryTheme(category) {
  const key = categoryKeys[category] || 'default'
  return categoryThemes[key] || categoryThemes.default
}

function getServiceImage(service) {
  if (service?.image_url) return service.image_url
  if (Array.isArray(service?.image_urls) && service.image_urls.length > 0) {
    return service.image_urls[0]
  }
  return null
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
}

export default function LandingPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [stats, setStats] = useState({ specialists: 0, services: 0, orders: 0 })
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadLandingData = async () => {
      try {
        setLoading(true)

        // Live counts for stats
        const [
          specCountRes,
          servCountRes,
          ordersCountRes
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'specialist'),
          supabase.from('services').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'open')
        ])

        setStats({
          specialists: specCountRes.count ?? 0,
          services: servCountRes.count ?? 0,
          orders: ordersCountRes.count ?? 0
        })
      } catch (error) {
        console.error('Landing page loading error:', error.message)
      } finally {
        setLoading(false)
      }
    }

    loadLandingData()
  }, [])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`)
    } else {
      navigate('/services')
    }
  }

  const getTranslatedDistrict = (dist) => {
    return dist ? t(`districts.${dist}`, { defaultValue: dist }) : t('services.districtNotSpecified')
  }

  const getTranslatedCategory = (cat) => {
    const key = categoryKeys[cat]
    return key ? t(`categories.${key}`) : cat
  }

  const howItWorks = [
    {
      icon: t('landing.howStep1Icon'), step: '01', title: t('landing.howStep1Title'),
      desc: t('landing.howStep1Desc'), link: '/services', linkText: t('landing.howStep1Link'),
    },
    {
      icon: t('landing.howStep2Icon'), step: '02', title: t('landing.howStep2Title'),
      desc: t('landing.howStep2Desc'), link: '/masters', linkText: t('landing.howStep2Link'),
    },
    {
      icon: t('landing.howStep3Icon'), step: '03', title: t('landing.howStep3Title'),
      desc: t('landing.howStep3Desc'), link: '/messages', linkText: t('landing.howStep3Link'),
    },
  ]

  const benefits = [
    {
      icon: '🛡️', title: t('landing.benefit1Title'),
      desc: t('landing.benefit1Desc'), link: '/masters',
    },
    {
      icon: '📍', title: t('landing.benefit2Title'),
      desc: t('landing.benefit2Desc'), link: '/services',
    },
    {
      icon: '⚡', title: t('landing.benefit3Title'),
      desc: t('landing.benefit3Desc'), link: '/messages',
    },
    {
      icon: '📋', title: t('landing.benefit4Title'),
      desc: t('landing.benefit4Desc'), link: '/orders',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', paddingBottom: '80px' }}>

      {/* ═══════════════ HERO ═══════════════ */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: '1.15fr 0.85fr',
        gap: '36px',
        alignItems: 'center',
        padding: '56px 48px',
        borderRadius: '32px',
        background: 'var(--surface)',
        border: '1px solid var(--line)',
        boxShadow: 'var(--shadow-sm)',
      }}>
        <div>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '6px 14px', borderRadius: '999px', marginBottom: '22px',
            background: 'rgba(99,102,241,0.08)', color: 'var(--primary)',
            fontSize: '13px', fontWeight: 700, border: '1px solid rgba(99,102,241,0.18)',
          }}>
            📍 {t('landing.badge')}
          </div>

          <h1 style={{
            margin: '0 0 18px',
            fontSize: 'clamp(32px, 4.5vw, 54px)',
            lineHeight: 1.1,
            fontWeight: 900,
            letterSpacing: '-0.025em',
            color: 'var(--text-color)',
          }}>
            {t('landing.title1')}<br />
            <span style={{
              background: 'var(--gradient-primary)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {t('landing.title2')}
            </span>{' '}{t('landing.title3')}
          </h1>

          <p style={{
            margin: '0 0 32px',
            fontSize: '16px', lineHeight: 1.7,
            color: 'var(--text-muted)', maxWidth: '44ch',
          }}>
            {t('landing.desc')}
          </p>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '12px', marginBottom: '28px', maxWidth: '520px' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '18px' }} />
              <input
                type="search"
                placeholder={t('landing.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%', height: '52px', padding: '0 20px 0 46px',
                  borderRadius: '999px', border: '1.5px solid var(--line)',
                  background: 'var(--surface-soft)', color: 'var(--text-color)',
                  fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                onBlur={e => e.target.style.borderColor = 'var(--line)'}
              />
            </div>
            <button type="submit" style={{
              height: '52px', padding: '0 28px', borderRadius: '999px',
              border: 'none', background: 'var(--gradient-primary)',
              color: '#fff', fontWeight: 700, fontSize: '14px',
              cursor: 'pointer', boxShadow: 'var(--shadow-sm)', whiteSpace: 'nowrap',
              transition: 'transform 0.15s',
            }}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
            >{t('landing.searchBtn')}</button>
          </form>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link to="/services" style={{
              height: '48px', padding: '0 24px', borderRadius: '999px',
              background: 'var(--gradient-primary)', color: '#fff',
              textDecoration: 'none', fontWeight: 700, fontSize: '14px',
              display: 'inline-flex', alignItems: 'center', boxShadow: 'var(--shadow-sm)',
            }}>{t('landing.servicesBtn')}</Link>
            <Link to="/orders" style={{
              height: '48px', padding: '0 24px', borderRadius: '999px',
              background: 'var(--surface-soft)', color: 'var(--text-color)',
              textDecoration: 'none', fontWeight: 600, fontSize: '14px',
              display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)',
            }}>{t('landing.ordersBtn')}</Link>
            <Link to="/masters" style={{
              height: '48px', padding: '0 24px', borderRadius: '999px',
              background: 'var(--surface-soft)', color: 'var(--text-color)',
              textDecoration: 'none', fontWeight: 600, fontSize: '14px',
              display: 'inline-flex', alignItems: 'center', border: '1px solid var(--line)',
            }}>{t('landing.mastersBtn')}</Link>
          </div>
        </div>

        {/* Right stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{
            gridColumn: '1 / -1', padding: '32px 28px', borderRadius: '24px',
            background: 'var(--gradient-primary)', color: '#fff',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <div>
              <div style={{ fontSize: '44px', fontWeight: 900, lineHeight: 1 }}>{stats.specialists}</div>
              <div style={{ fontSize: '14px', opacity: 0.95, marginTop: '6px', fontWeight: 600 }}>{t('landing.statsSpecialists')}</div>
              <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '2px' }}>{t('landing.statsSpecialistsRegion')}</div>
            </div>
            <div style={{ fontSize: '56px' }}>🛠️</div>
          </div>

          {[
            { val: stats.services, label: t('landing.servicesBtn'), sub: t('landing.statsServicesSub'), emoji: '🌟' },
            { val: stats.orders, label: t('landing.ordersBtn'), sub: t('landing.statsOrdersSub'), emoji: '📋' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '24px 20px', borderRadius: '20px',
              background: 'var(--surface-soft)', border: '1px solid var(--line)',
              display: 'flex', flexDirection: 'column', gap: '6px',
            }}>
              <div style={{ fontSize: '28px', marginBottom: '4px' }}>{s.emoji}</div>
              <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-color)', lineHeight: 1 }}>{s.val}</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-color)' }}>{s.label}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ CATEGORIES ═══════════════ */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: 'var(--text-color)' }}>{t('landing.categoriesTitle')}</h2>
          </div>
          <Link to="/services" style={{ color: 'var(--primary)', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>
            {t('landing.categoriesAll')}
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {categoriesConfig.map(({ icon: Icon, name, color, bg }) => (
            <Link key={name} to={`/services?category=${encodeURIComponent(name)}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '24px 16px', borderRadius: '20px',
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
                  textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  e.currentTarget.style.borderColor = 'var(--primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  e.currentTarget.style.borderColor = 'var(--line)'
                }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={24} color={color} strokeWidth={2.2} />
                </div>
                <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-color)' }}>{getTranslatedCategory(name)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>


      {/* ═══════════════ PLACE ADVERTISEMENT BANNER ═══════════════ */}
      <Link to="/create" style={{ textDecoration: 'none' }}>
        <div
          style={{
            padding: '40px 48px', borderRadius: '28px',
            background: 'var(--gradient-primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '24px', flexWrap: 'wrap',
            cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: 'var(--shadow-md)',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
            <div style={{ display: 'flex', gap: '0px', flexShrink: 0 }}>
              <div style={{ fontSize: '56px', lineHeight: 1 }}>🛠️</div>
              <div style={{ fontSize: '56px', lineHeight: 1, marginLeft: '-8px' }}>📋</div>
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 900, marginBottom: '6px' }}>
                {t('landing.placeAdTitle')}
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9, lineHeight: 1.6, maxWidth: '52ch' }}>
                {t('landing.placeAdDesc')}
              </div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '14px 28px', borderRadius: '999px',
            background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.35)',
            fontSize: '15px', fontWeight: 800, flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            {t('landing.placeAdBtn')}
          </div>
        </div>
      </Link>

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section style={{
        padding: '48px 40px', borderRadius: '28px',
        background: 'var(--surface)', border: '1px solid var(--line)', boxShadow: 'var(--shadow-sm)',
      }}>
        <h2 style={{ margin: '0 0 36px', fontSize: '24px', fontWeight: 900, textAlign: 'center', color: 'var(--text-color)' }}>
          {t('landing.howTitle')}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          {howItWorks.map((step, i) => (
            <div key={i} style={{
              padding: '28px', borderRadius: '20px',
              background: 'var(--surface-soft)', border: '1px solid var(--line)',
              display: 'flex', flexDirection: 'column', gap: '14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'rgba(99,102,241,0.1)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '26px', flexShrink: 0,
                }}>
                  {step.icon}
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--primary)', fontWeight: 800, letterSpacing: '0.05em' }}>
                    {t('howPage.step')} {step.step}
                  </div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: 'var(--text-color)' }}>{step.title}</h3>
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{step.desc}</p>
              <Link to={step.link} style={{
                marginTop: 'auto', display: 'inline-flex', alignItems: 'center', gap: '6px',
                color: 'var(--primary)', textDecoration: 'none', fontSize: '13px', fontWeight: 700,
              }}>
                {step.linkText} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════ BENEFITS ═══════════════ */}
      <section>
        <h2 style={{ margin: '0 0 20px', fontSize: '24px', fontWeight: 900, color: 'var(--text-color)' }}>{t('landing.benefitsTitle')}</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {benefits.map((b, i) => (
            <Link key={i} to={b.link} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  padding: '24px', borderRadius: '20px',
                  background: 'var(--surface)', border: '1px solid var(--line)',
                  display: 'flex', gap: '20px', alignItems: 'flex-start',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: 'var(--shadow-sm)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                  e.currentTarget.style.borderColor = 'var(--primary)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                  e.currentTarget.style.borderColor = 'var(--line)'
                }}
              >
                <div style={{
                  width: '52px', height: '52px', borderRadius: '16px',
                  background: 'var(--surface-soft)', border: '1px solid var(--line)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '24px', flexShrink: 0,
                }}>
                  {b.icon}
                </div>
                <div>
                  <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 800, color: 'var(--text-color)' }}>{b.title}</h3>
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{b.desc}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════ BOTTOM CTA ═══════════════ */}
      {!user && (
        <section style={{
          padding: '52px 48px', borderRadius: '28px',
          background: 'var(--gradient-primary)', color: '#fff',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          gap: '24px', flexWrap: 'wrap', boxShadow: 'var(--shadow-lg)',
        }}>
          <div>
            <h2 style={{ margin: '0 0 8px', fontSize: '30px', fontWeight: 900 }}>{t('landing.ctaTitle')}</h2>
            <p style={{ margin: 0, fontSize: '15px', opacity: 0.95 }}>
              {t('landing.ctaDesc')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '14px', flexShrink: 0 }}>
            <Link to="/register" style={{
              height: '50px', padding: '0 28px', borderRadius: '999px',
              background: '#fff', color: 'var(--primary)', textDecoration: 'none',
              fontWeight: 800, fontSize: '15px', display: 'inline-flex', alignItems: 'center',
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
            }}>
              {t('landing.ctaRegister')}
            </Link>
            <Link to="/services" style={{
              height: '50px', padding: '0 28px', borderRadius: '999px',
              background: 'rgba(255,255,255,0.15)', color: '#fff', textDecoration: 'none',
              fontWeight: 700, fontSize: '15px', display: 'inline-flex', alignItems: 'center',
              border: '1px solid rgba(255,255,255,0.3)',
            }}>
              {t('landing.ctaServices')}
            </Link>
          </div>
        </section>
      )}

    </div>
  )
}