import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export default function ContactsPage() {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const contacts = [
    { icon: '📍', label: t('contacts.address'), value: t('contacts.addressVal'), link: null },
    { icon: '📧', label: t('contacts.email'), value: 'info@janalieva25.kg', link: 'mailto:info@janalieva25.kg' },
    { icon: '📱', label: t('contacts.phone'), value: '+996 706 315 630', link: 'tel:+996706315630' },
    { icon: '💬', label: t('contacts.whatsapp'), value: '+996 706 315 630', link: 'https://wa.me/996706315630' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
    setForm({ name: '', email: '', subject: '', message: '' })
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 0 80px' }}>
      <div style={{ marginBottom: '36px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center',
          padding: '6px 14px', borderRadius: '999px', marginBottom: '16px',
          background: 'rgba(99,102,241,0.1)', color: 'var(--primary)',
          fontSize: '13px', fontWeight: 700,
        }}>
          {t('contacts.badge')}
        </div>
        <h1 style={{ margin: '0 0 12px', fontSize: '38px', fontWeight: 900 }}>{t('contacts.title')}</h1>
        <p style={{ margin: 0, fontSize: '16px', color: 'var(--muted)', lineHeight: 1.7 }}>
          {t('contacts.subtitle')}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px', alignItems: 'start' }}>

        {/* Left — contact info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {contacts.map((c, i) => (
            <div key={i} style={{
              padding: '20px', borderRadius: '16px',
              background: 'var(--surface)', border: '1px solid var(--line)',
              display: 'flex', gap: '14px', alignItems: 'center',
            }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '13px',
                background: 'rgba(99,102,241,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', flexShrink: 0,
              }}>
                {c.icon}
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--muted)', fontWeight: 600, marginBottom: '3px' }}>{c.label}</div>
                {c.link ? (
                  <a href={c.link} style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary)', textDecoration: 'none' }}>{c.value}</a>
                ) : (
                  <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text)' }}>{c.value}</div>
                )}
              </div>
            </div>
          ))}

          <div style={{
            padding: '20px', borderRadius: '16px',
            background: 'var(--surface-soft)', border: '1px solid var(--line)',
            fontSize: '14px', color: 'var(--muted)', lineHeight: 1.65,
            whiteSpace: 'pre-line'
          }}>
            <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '6px' }}>{t('contacts.workHours')}</strong>
            {t('contacts.workHoursVal')}
          </div>
        </div>

        {/* Right — contact form */}
        <div style={{
          padding: '32px', borderRadius: '20px',
          background: 'var(--surface)', border: '1px solid var(--line)',
          boxShadow: 'var(--shadow-sm)',
        }}>
          {sent ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '56px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ margin: '0 0 10px', fontSize: '22px', fontWeight: 800 }}>{t('contacts.successTitle')}</h2>
              <p style={{ margin: '0 0 24px', color: 'var(--muted)', lineHeight: 1.6 }}>
                {t('contacts.successDesc')}
              </p>
              <button onClick={() => setSent(false)} style={{
                height: '44px', padding: '0 22px', borderRadius: '999px',
                border: 'none', background: 'var(--gradient-primary)',
                color: '#fff', fontWeight: 700, cursor: 'pointer',
              }}>
                {t('contacts.successBtn')}
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ margin: '0 0 24px', fontSize: '20px', fontWeight: 800 }}>{t('contacts.formTitle')}</h2>
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {[
                  { key: 'name', label: t('contacts.fieldName'), type: 'text', placeholder: t('contacts.fieldNamePh') },
                  { key: 'email', label: t('contacts.fieldEmail'), type: 'email', placeholder: t('contacts.fieldEmailPh') },
                  { key: 'subject', label: t('contacts.fieldSubject'), type: 'text', placeholder: t('contacts.fieldSubjectPh') },
                ].map((field) => (
                  <div key={field.key}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
                      {field.label}
                    </label>
                    <input
                      type={field.type}
                      required
                      placeholder={field.placeholder}
                      value={form[field.key]}
                      onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      style={{
                        width: '100%', height: '44px', padding: '0 14px',
                        borderRadius: '12px', border: '1px solid var(--line)',
                        background: 'var(--surface-soft)', color: 'var(--text)',
                        fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                        fontFamily: 'inherit',
                      }}
                      onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.target.style.borderColor = 'var(--line)'}
                    />
                  </div>
                ))}

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '6px', color: 'var(--text)' }}>
                    {t('contacts.fieldMessage')}
                  </label>
                  <textarea
                    required
                    placeholder={t('contacts.fieldMessagePh')}
                    value={form.message}
                    onChange={e => setForm(prev => ({ ...prev, message: e.target.value }))}
                    rows={4}
                    style={{
                      width: '100%', padding: '12px 14px',
                      borderRadius: '12px', border: '1px solid var(--line)',
                      background: 'var(--surface-soft)', color: 'var(--text)',
                      fontSize: '14px', outline: 'none', resize: 'vertical',
                      boxSizing: 'border-box', fontFamily: 'inherit', lineHeight: 1.6,
                    }}
                    onFocus={e => e.target.style.borderColor = 'var(--primary)'}
                    onBlur={e => e.target.style.borderColor = 'var(--line)'}
                  />
                </div>

                <button type="submit" style={{
                  height: '48px', borderRadius: '12px', border: 'none',
                  background: 'var(--gradient-primary)', color: '#fff',
                  fontWeight: 700, fontSize: '15px', cursor: 'pointer',
                  boxShadow: 'var(--shadow-sm)',
                }}>
                  {t('contacts.sendBtn')}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
