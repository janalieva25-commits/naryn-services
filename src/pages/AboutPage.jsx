import { useTranslation } from 'react-i18next'

export default function AboutPage() {
  const { t } = useTranslation()

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0 80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '6px 14px', borderRadius: '999px', marginBottom: '16px',
          background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
          fontSize: '13px', fontWeight: 700,
        }}>
          {t('about.badge')}
        </div>
        <h1 style={{ margin: '0 0 16px', fontSize: '40px', fontWeight: 900, letterSpacing: '-0.02em' }}>
          {t('about.title')}
        </h1>
        <p style={{ margin: 0, fontSize: '18px', color: 'var(--muted)', lineHeight: 1.7 }}>
          {t('about.subtitle')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[
          {
            icon: '🎯',
            title: t('about.missionTitle'),
            text: t('about.missionText'),
          },
          {
            icon: '📍',
            title: t('about.forWhoTitle'),
            text: t('about.forWhoText'),
          },
          {
            icon: '🤝',
            title: t('about.howWeWorkTitle'),
            text: t('about.howWeWorkText'),
          },
          {
            icon: '🚀',
            title: t('about.plansTitle'),
            text: t('about.plansText'),
          },
        ].map((item, i) => (
          <div key={i} style={{
            padding: '28px', borderRadius: '20px',
            background: 'var(--surface)', border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex', gap: '20px', alignItems: 'flex-start',
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '15px',
              background: 'rgba(99,102,241,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', flexShrink: 0,
            }}>
              {item.icon}
            </div>
            <div>
              <h2 style={{ margin: '0 0 10px', fontSize: '18px', fontWeight: 700 }}>{item.title}</h2>
              <p style={{ margin: 0, color: 'var(--muted)', lineHeight: 1.7, fontSize: '15px' }}>{item.text}</p>
            </div>
          </div>
        ))}

        <div style={{
          padding: '32px', borderRadius: '20px',
          background: 'var(--gradient-primary)', color: '#fff',
          textAlign: 'center',
        }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '22px', fontWeight: 800 }}>{t('about.ctaTitle')}</h2>
          <p style={{ margin: '0 0 20px', opacity: 0.9, fontSize: '15px' }}>
            {t('about.ctaDesc')}
          </p>
          <a href="/register" style={{
            display: 'inline-flex', alignItems: 'center',
            height: '46px', padding: '0 24px', borderRadius: '999px',
            background: '#fff', color: '#6366f1',
            textDecoration: 'none', fontWeight: 800, fontSize: '15px',
          }}>
            {t('about.ctaBtn')}
          </a>
        </div>
      </div>
    </div>
  )
}
