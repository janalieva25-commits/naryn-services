import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { useProfile } from '../context/ProfileContext'

const districts = [
  { value: 'naryn', key: 'districts.naryn' },
  { value: 'at_bashy', key: 'districts.at_bashy' },
  { value: 'ak_talaa', key: 'districts.ak_talaa' },
  { value: 'jumgal', key: 'districts.jumgal' },
  { value: 'kochkor', key: 'districts.kochkor' },
]

function formatMonthYear(value, lang) {
  if (!value) return ''

  const date = new Date(`${value}-01`)
  return date.toLocaleDateString(lang === 'ky' ? 'ky-KG' : lang === 'ru' ? 'ru-RU' : 'en-US', {
    month: 'long',
    year: 'numeric',
  })
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { profile, profileLoading, updateMyProfile } = useProfile()
  const { t, i18n } = useTranslation()

  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    username: '',
    phone: '',
    district: 'naryn',
    bio: '',
    experience_from: '',
    experience_to: '',
  })

  useEffect(() => {
    if (!profile) return

    setForm({
      full_name: profile.full_name || '',
      username: profile.username || '',
      phone: profile.phone || '',
      district: profile.district || 'naryn',
      bio: profile.bio || '',
      experience_from: profile.experience_from
        ? String(profile.experience_from).slice(0, 7)
        : '',
      experience_to: profile.experience_to
        ? String(profile.experience_to).slice(0, 7)
        : '',
    })
  }, [profile])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (
      form.experience_from &&
      form.experience_to &&
      form.experience_from > form.experience_to
    ) {
      setMessage(t('settings.experienceDateError'))
      return
    }

    const nextRole =
      form.experience_from || form.experience_to ? 'specialist' : 'customer'

    try {
      setSaving(true)
      setMessage('')

      await updateMyProfile({
        full_name: form.full_name.trim(),
        username: form.username.trim(),
        phone: form.phone.trim(),
        district: form.district,
        bio: form.bio.trim(),
        experience_from: form.experience_from
          ? `${form.experience_from}-01`
          : null,
        experience_to: form.experience_to
          ? `${form.experience_to}-01`
          : null,
        role: nextRole,
      })

      setMessage(t('settings.profileSaved'))
    } catch (error) {
      setMessage(error.message || t('settings.profileSaveError'))
    } finally {
      setSaving(false)
    }
  }

  const getLocaleTag = (lang) => {
    return lang === 'ky' ? 'ky-KG' : lang === 'ru' ? 'ru-RU' : 'en-US'
  }

  if (profileLoading) {
    return (
      <div className="section-card dark-card">
        <h2>{t('settings.loading')}</h2>
        <p>{t('settings.loadingText')}</p>
      </div>
    )
  }

  return (
    <div className="settings-page">
      <div className="section-card dark-card">
        <div className="section-head">
          <h2>{t('settings.title')}</h2>
        </div>

        <form className="create-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="full_name"
            placeholder={t('dashboard.fullName')}
            value={form.full_name}
            onChange={handleChange}
          />

          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
          />

          <input
            type="tel"
            name="phone"
            placeholder={t('dashboard.phone')}
            value={form.phone}
            onChange={handleChange}
          />

          <select
            name="district"
            value={form.district}
            onChange={handleChange}
          >
            {districts.map((item) => (
              <option key={item.value} value={item.value}>
                {t(item.key)}
              </option>
            ))}
          </select>

          <textarea
            name="bio"
            placeholder={t('dashboard.aboutMe')}
            value={form.bio}
            onChange={handleChange}
          />

          <div className="experience-block">
            <label>{t('settings.experienceFrom')}</label>
            <input
              type="month"
              name="experience_from"
              value={form.experience_from}
              onChange={handleChange}
            />
          </div>

          <div className="profile-meta-block">
            <p>
              <strong>Email:</strong> {user?.email || '-'}
            </p>

            <p>
              <strong>{t('settings.joinedAtLabel')}</strong>{' '}
              {profile?.joined_at
                ? new Date(profile.joined_at).toLocaleDateString(getLocaleTag(i18n.language))
                : t('services.priceNotSpecified')}
            </p>

            <p>
              <strong>{t('settings.statusLabel')}</strong>{' '}
              {form.experience_from || form.experience_to
                ? t('dashboard.roleSpecialist')
                : t('dashboard.roleClient')}
            </p>

            <p>
              <strong>{t('settings.experienceLabel')}</strong>{' '}
              {form.experience_from
                ? `${formatMonthYear(form.experience_from, i18n.language)} — ${
                    form.experience_to
                      ? formatMonthYear(form.experience_to, i18n.language)
                      : t('dashboard.presentTime')
                  }`
                : t('dashboard.experienceNotSpecified')}
            </p>
          </div>

          {message && <p className="upload-message">{message}</p>}

          <button type="submit" disabled={saving}>
            {saving ? t('settings.savingBtn') : t('settings.saveBtn')}
          </button>
        </form>
      </div>
    </div>
  )
}