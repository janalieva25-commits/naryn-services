import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function HowItWorksPage() {
  const { t } = useTranslation()

  const steps = [
    {
      num: '01', icon: '📝', title: t('howPage.step1Title'),
      desc: t('howPage.step1Desc'), link: '/register', linkText: t('howPage.step1Link'),
    },
    {
      num: '02', icon: '🔍', title: t('howPage.step2Title'),
      desc: t('howPage.step2Desc'), link: '/services', linkText: t('howPage.step2Link'),
    },
    {
      num: '03', icon: '💬', title: t('howPage.step3Title'),
      desc: t('howPage.step3Desc'), link: '/messages', linkText: t('howPage.step3Link'),
    },
    {
      num: '04', icon: '✅', title: t('howPage.step4Title'),
      desc: t('howPage.step4Desc'), link: '/services', linkText: t('howPage.step4Link'),
    },
  ]

  const forClients = [
    { icon: '📋', text: t('landing.benefit4Desc') },
    { icon: '🔎', text: t('landing.howStep1Desc') },
    { icon: '👤', text: t('landing.benefit1Desc') },
    { icon: '💬', text: t('landing.benefit3Desc') },
  ]

  const forSpecialists = [
    { icon: '🛠️', text: t('landing.placeAdDesc') },
    { icon: '📬', text: t('landing.placeAdDesc') },
    { icon: '💬', text: t('landing.benefit3Desc') },
  ]

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '40px 0 80px' }}>
      <div style={{ marginBottom: '40px', textAlign: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '6px 14px', borderRadius: '999px', marginBottom: '16px',
          background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
          fontSize: '13px', fontWeight: 700,
        }}>
          {t('howPage.badge')}
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: '38px', fontWeight: 900 }}>{t('howPage.title')}</h1>
        <p style={{ margin: 0, fontSize: '17px', color: 'var(--muted)', lineHeight: 1.7 }}>
          {t('howPage.subtitle')}
        </p>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' }}>
        {steps.map((step, i) => (
          <div key={i} style={{
            padding: '28px 32px', borderRadius: '20px',
            background: 'var(--surface)', border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex', gap: '24px', alignItems: 'flex-start',
          }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '18px', flexShrink: 0,
              background: 'var(--gradient-primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px',
            }}>
              {step.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{
                  fontSize: '12px', fontWeight: 700, color: 'var(--primary)',
                  background: 'rgba(99,102,241,0.1)', padding: '2px 10px', borderRadius: '999px',
                }}>{t('howPage.step')} {step.num}</span>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{step.title}</h2>
              </div>
              <p style={{ margin: '0 0 14px', color: 'var(--muted)', lineHeight: 1.7, fontSize: '15px' }}>{step.desc}</p>
              <Link to={step.link} style={{
                color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, fontSize: '14px',
              }}>{step.linkText} →</Link>
            </div>
          </div>
        ))}
      </div>

      {/* For clients and specialists */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
        {[
          { title: t('howPage.clientsTitle'), items: forClients },
          { title: t('howPage.specialistsTitle'), items: forSpecialists },
        ].map((col, i) => (
          <div key={i} style={{
            padding: '24px', borderRadius: '20px',
            background: 'var(--surface)', border: '1px solid var(--line)',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '17px', fontWeight: 800 }}>{col.title}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {col.items.map((item, j) => (
                <div key={j} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', fontSize: '14px' }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ color: 'var(--muted)', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{
        padding: '32px 40px', borderRadius: '20px',
        background: 'var(--gradient-primary)', color: '#fff', textAlign: 'center',
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800 }}>{t('howPage.ctaTitle')}</h2>
        <p style={{ margin: '0 0 20px', opacity: 0.9 }}>{t('howPage.ctaDesc')}</p>
        <Link to="/register" style={{
          display: 'inline-flex', alignItems: 'center',
          height: '46px', padding: '0 24px', borderRadius: '999px',
          background: '#fff', color: '#6366f1', textDecoration: 'none', fontWeight: 800,
        }}>{t('howPage.ctaBtn')}</Link>
      </div>
    </div>
  )
}
