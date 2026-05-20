import { useTranslation } from 'react-i18next'

export default function RulesPage() {
  const { t } = useTranslation()

  const rules = [
    {
      num: '1', title: t('rules.s1Title'),
      items: [
        t('rules.s1Item1'),
        t('rules.s1Item2'),
        t('rules.s1Item3'),
      ],
    },
    {
      num: '2', title: t('rules.s2Title'),
      items: [
        t('rules.s2Item1'),
        t('rules.s2Item2'),
        t('rules.s2Item3'),
        t('rules.s2Item4'),
      ],
    },
    {
      num: '3', title: t('rules.s3Title'),
      items: [
        t('rules.s3Item1'),
        t('rules.s3Item2'),
        t('rules.s3Item3'),
        t('rules.s3Item4'),
      ],
    },
    {
      num: '4', title: t('rules.s4Title'),
      items: [
        t('rules.s4Item1'),
        t('rules.s4Item2'),
        t('rules.s4Item3'),
        t('rules.s4Item4'),
      ],
    },
    {
      num: '5', title: t('rules.s5Title'),
      items: [
        t('rules.s5Item1'),
        t('rules.s5Item2'),
        t('rules.s5Item3'),
      ],
    },
  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 0 80px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '6px 14px', borderRadius: '999px', marginBottom: '16px',
          background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
          fontSize: '13px', fontWeight: 700,
        }}>
          {t('rules.badge')}
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: '38px', fontWeight: 900 }}>{t('rules.title')}</h1>
        <p style={{ margin: 0, fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7 }}>
          {t('rules.updated')}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {rules.map((section) => (
          <div key={section.num} style={{
            padding: '28px', borderRadius: '20px',
            background: 'var(--surface)', border: '1px solid var(--line)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
                background: 'var(--gradient-primary)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 900, fontSize: '16px',
              }}>
                {section.num}
              </div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{section.title}</h2>
            </div>
            <ul style={{ margin: 0, padding: '0 0 0 4px', listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.items.map((item, i) => (
                <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.65 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, flexShrink: 0, marginTop: '1px' }}>—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div style={{
          padding: '24px 28px', borderRadius: '18px',
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.2)',
          fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7,
        }}>
          <strong style={{ color: 'var(--text)' }}>{t('rules.contactText')}</strong>{' '}
          <a href="/contacts" style={{ color: 'var(--primary)', fontWeight: 600 }}>{t('rules.contactLink')}</a>.
        </div>
      </div>
    </div>
  )
}
