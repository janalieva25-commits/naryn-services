import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getServiceById } from '../services/servicesService'
import { useAuth } from '../context/AuthContext'
import DetailPageShell from '../components/details/DetailPageShell'
import DetailHero from '../components/details/DetailHero'
import DetailSection from '../components/details/DetailSection'
import DetailSidebarCard from '../components/details/DetailSidebarCard'

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

export default function ServiceDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useTranslation()

  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const loadService = async () => {
      try {
        const data = await getServiceById(id)
        setService(data)
      } catch (error) {
        alert(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) loadService()
  }, [id])

  const getTranslatedCategory = (cat) => {
    const key = categoryKeys[cat]
    return key ? t(`categories.${key}`) : cat
  }

  const getTranslatedDistrict = (dist) => {
    return dist ? t(`districts.${dist}`, { defaultValue: dist }) : t('services.districtNotSpecified')
  }

  if (loading) {
    return (
      <div className="section-card dark-card">
        <h2>{t('common.loading')}</h2>
        <p>{t('serviceDetails.loadingText')}</p>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="section-card dark-card">
        <h2>{t('serviceDetails.notFoundTitle')}</h2>
        <p>{t('serviceDetails.notFoundDesc')}</p>
      </div>
    )
  }

  const mainImage = service.image_urls?.[0] || service.image_url || ''

  const meta = [
    {
      label: t('jobDetails.price'),
      value: service.price ? `${service.price} ${t('services.priceLabel')}` : t('services.priceNotSpecified'),
    },
    {
      label: t('jobDetails.district'),
      value: getTranslatedDistrict(service.district),
    },
    {
      label: t('jobDetails.category'),
      value: getTranslatedCategory(service.category) || t('categories.default'),
    },
  ]

  return (
    <DetailPageShell
      sidebar={
        <DetailSidebarCard
          title={t('serviceDetails.contact')}
          price={service.price ? `${service.price} ${t('services.priceLabel')}` : t('services.priceNotSpecified')}
        >
          {user ? (
            user.id !== service.user_id ? (
              <Link
                className="chat-link-btn detail-primary-btn"
                to={`/messages?serviceId=${service.id}&receiverId=${service.user_id}`}
              >
                {t('serviceDetails.contact')}
              </Link>
            ) : (
              <p className="auth-note">{t('serviceDetails.ownService')}</p>
            )
          ) : (
            <p className="auth-note">{t('jobDetails.loginToApply')}</p>
          )}

          <div className="detail-side-info">
            <div className="detail-side-row">
              <span>{t('jobDetails.category')}</span>
              <strong>{getTranslatedCategory(service.category) || t('categories.default')}</strong>
            </div>

            <div className="detail-side-row">
              <span>{t('jobDetails.district')}</span>
              <strong>{getTranslatedDistrict(service.district)}</strong>
            </div>

            <div className="detail-side-row">
              <span>{t('serviceDetails.specialist')}</span>
              <strong>
                <Link to={`/profile/${service.user_id}`}>
                  {service.public_profiles?.full_name || t('services.defaultUser')}
                </Link>
              </strong>
            </div>
          </div>
        </DetailSidebarCard>
      }
    >
      <DetailHero
        image={mainImage}
        placeholder={t('categories.default')}
        badge={getTranslatedCategory(service.category) || t('categories.default')}
        title={service.title}
        description={service.description || t('services.noDescription')}
        meta={meta}
      />

      <DetailSection title={t('serviceDetails.descriptionTitle')}>
        <div className="detail-text-content">
          <p>{service.description || t('jobDetails.noDescription')}</p>
        </div>
      </DetailSection>

      <DetailSection title={t('jobDetails.photos')}>
        {!service.image_urls || service.image_urls.length === 0 ? (
          <div className="detail-empty-state">
            <p>{t('jobDetails.noPhotos')}</p>
          </div>
        ) : (
          <div className="detail-images-grid">
            {service.image_urls.map((imageUrl) => (
              <img
                key={imageUrl}
                src={imageUrl}
                alt={service.title}
                className="detail-gallery-image"
                onClick={() => setSelectedImage(imageUrl)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title={t('jobDetails.documents')}>
        {!service.document_urls || service.document_urls.length === 0 ? (
          <div className="detail-empty-state">
            <p>{t('jobDetails.noDocuments')}</p>
          </div>
        ) : (
          <div className="detail-documents-list">
            {service.document_urls.map((docPath) => (
              <a
                key={docPath}
                href={docPath}
                target="_blank"
                rel="noreferrer"
                className="detail-document-btn"
              >
                {t('jobDetails.openDocument')}
              </a>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title={t('serviceDetails.specialistInfo')}>
        <Link
          to={`/profile/${service.user_id}`}
          className="detail-profile-card"
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
        >
          <div className="detail-profile-avatar" style={{ overflow: 'hidden' }}>
            {service.public_profiles?.avatar_url ? (
              <img 
                src={service.public_profiles.avatar_url} 
                alt={service.public_profiles?.full_name || t('services.defaultUser')}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (service.public_profiles?.full_name || 'U').slice(0, 1)
            )}
          </div>

          <div className="detail-profile-info">
            <h3>{service.public_profiles?.full_name || t('services.defaultUser')}</h3>
            <p>{t('services.ratingLabel')}: {service.public_profiles?.rating || 0}</p>
            <p>{t('dashboard.phone')}: {service.public_profiles?.phone || t('dashboard.phoneNotSpecified')}</p>
          </div>
        </Link>
      </DetailSection>

      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 99999,
            cursor: 'zoom-out',
            padding: '20px'
          }}
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Expanded view" 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '100%', 
              objectFit: 'contain',
              borderRadius: '8px' 
            }} 
          />
        </div>
      )}
    </DetailPageShell>
  )
}