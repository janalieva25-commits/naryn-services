import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getJobById } from '../services/jobsService'
import { createSignedDocumentUrl } from '../services/storageService'
import { useAuth } from '../context/AuthContext'
import DetailPageShell from '../components/details/DetailPageShell'
import DetailHero from '../components/details/DetailHero'
import DetailSection from '../components/details/DetailSection'
import DetailSidebarCard from '../components/details/DetailSidebarCard'

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

export default function JobDetailsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { t } = useTranslation()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [openingDoc, setOpeningDoc] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)

  useEffect(() => {
    const loadJob = async () => {
      try {
        const data = await getJobById(id)
        setJob(data)
      } catch (error) {
        alert(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (id) loadJob()
  }, [id])

  const handleOpenDocument = async (path) => {
    try {
      setOpeningDoc(true)
      const url = await createSignedDocumentUrl(path)
      window.open(url, '_blank')
    } catch (error) {
      alert(error.message)
    } finally {
      setOpeningDoc(false)
    }
  }

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
        <p>{t('jobDetails.loadingText')}</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="section-card dark-card">
        <h2>{t('jobDetails.notFoundTitle')}</h2>
        <p>{t('jobDetails.notFoundDesc')}</p>
      </div>
    )
  }

  const mainImage = job.image_urls?.[0] || job.image_url || ''

  const meta = [
    {
      label: t('jobDetails.price'),
      value: job.price ? `${job.price} ${t('services.priceLabel')}` : t('services.priceNotSpecified'),
    },
    {
      label: t('jobDetails.district'),
      value: getTranslatedDistrict(job.district),
    },
    {
      label: t('jobDetails.address'),
      value: job.address || t('services.districtNotSpecified'),
    },
  ]

  return (
    <DetailPageShell
      sidebar={
        <DetailSidebarCard
          title={t('jobDetails.apply')}
          price={job.price ? `${job.price} ${t('services.priceLabel')}` : t('services.priceNotSpecified')}
        >
          {user ? (
            user.id !== job.user_id ? (
              <Link
                className="chat-link-btn detail-primary-btn"
                to={`/messages?jobId=${job.id}&receiverId=${job.user_id}`}
              >
                {t('jobDetails.apply')}
              </Link>
            ) : (
              <p className="auth-note">{t('jobDetails.ownAd')}</p>
            )
          ) : (
            <p className="auth-note">{t('jobDetails.loginToApply')}</p>
          )}

          <div className="detail-side-info">
            <div className="detail-side-row">
              <span>{t('jobDetails.category')}</span>
              <strong>{getTranslatedCategory(job.category) || t('orders.defaultJobCategory')}</strong>
            </div>

            <div className="detail-side-row">
              <span>{t('jobDetails.district')}</span>
              <strong>{getTranslatedDistrict(job.district)}</strong>
            </div>

            <div className="detail-side-row">
              <span>{t('jobDetails.client')}</span>
              <strong>
                <Link to={`/profile/${job.user_id}`}>
                  {job.public_profiles?.full_name || t('services.defaultUser')}
                </Link>
              </strong>
            </div>
          </div>
        </DetailSidebarCard>
      }
    >
      <DetailHero
        image={mainImage}
        placeholder={t('orders.defaultJobCategory')}
        badge={getTranslatedCategory(job.category) || t('orders.defaultJobCategory')}
        title={job.title}
        description={job.description || t('services.noDescription')}
        meta={meta}
      />

      <DetailSection title={t('jobDetails.descriptionTitle')}>
        <div className="detail-text-content">
          <p>{job.description || t('jobDetails.noDescription')}</p>
        </div>
      </DetailSection>

      <DetailSection title={t('jobDetails.photos')}>
        {!job.image_urls || job.image_urls.length === 0 ? (
          <div className="detail-empty-state">
            <p>{t('jobDetails.noPhotos')}</p>
          </div>
        ) : (
          <div className="detail-images-grid">
            {job.image_urls.map((imageUrl) => (
              <img
                key={imageUrl}
                src={imageUrl}
                alt={job.title}
                className="detail-gallery-image"
                onClick={() => setSelectedImage(imageUrl)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title={t('jobDetails.documents')}>
        {!job.document_urls || job.document_urls.length === 0 ? (
          <div className="detail-empty-state">
            <p>{t('jobDetails.noDocuments')}</p>
          </div>
        ) : (
          <div className="detail-documents-list">
            {job.document_urls.map((docPath) => (
              <button
                key={docPath}
                type="button"
                className="detail-document-btn"
                onClick={() => handleOpenDocument(docPath)}
                disabled={openingDoc}
              >
                {openingDoc ? t('jobDetails.opening') : t('jobDetails.openDocument')}
              </button>
            ))}
          </div>
        )}
      </DetailSection>

      <DetailSection title={t('jobDetails.clientInfo')}>
        <Link
          to={`/profile/${job.user_id}`}
          className="detail-profile-card"
          style={{ textDecoration: 'none', color: 'inherit', display: 'flex' }}
        >
          <div className="detail-profile-avatar" style={{ overflow: 'hidden' }}>
            {job.public_profiles?.avatar_url ? (
              <img 
                src={job.public_profiles.avatar_url} 
                alt={job.public_profiles?.full_name || t('services.defaultUser')}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              (job.public_profiles?.full_name || 'U').slice(0, 1)
            )}
          </div>

          <div className="detail-profile-info">
            <h3>{job.public_profiles?.full_name || t('services.defaultUser')}</h3>
            <p>{t('services.ratingLabel')}: {job.public_profiles?.rating || 0}</p>
            <p>{t('dashboard.phone')}: {job.public_profiles?.phone || t('dashboard.phoneNotSpecified')}</p>
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