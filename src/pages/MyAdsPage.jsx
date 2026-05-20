import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import { getMyJobs, deleteJob } from '../services/jobsService'
import { getMyServices, deleteService } from '../services/servicesService'
import {
  deleteStorageFiles,
  extractStoragePathFromUrl,
} from '../services/storageService'

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

export default function MyAdsPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsData, servicesData] = await Promise.all([
          getMyJobs(user.id),
          getMyServices(user.id)
        ])
        
        const jobsWithType = (jobsData || []).map(j => ({ ...j, type: 'job' }))
        const servicesWithType = (servicesData || []).map(s => ({ ...s, type: 'service' }))
        
        const combined = [...jobsWithType, ...servicesWithType].sort((a, b) => {
          return new Date(b.created_at) - new Date(a.created_at)
        })

        setItems(combined)
      } catch (error) {
        alert(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (user?.id) load()
  }, [user])

  const handleDelete = async (item) => {
    const ok = confirm(t('myAds.confirmDelete'))
    if (!ok) return

    try {
      setDeletingId(item.id)

      const imagePaths = (item.image_urls || [])
        .map((url) => extractStoragePathFromUrl(url, 'images'))
        .filter(Boolean)

      const documentPaths = item.document_urls || []

      if (imagePaths.length > 0) {
        await deleteStorageFiles('images', imagePaths)
      }

      if (documentPaths.length > 0) {
        await deleteStorageFiles('documents', documentPaths)
      }

      if (item.type === 'job') {
        await deleteJob(item.id)
      } else {
        await deleteService(item.id)
      }

      setItems((prev) => prev.filter((i) => i.id !== item.id))
      alert(t('myAds.successDelete'))
    } catch (error) {
      alert(error.message)
    } finally {
      setDeletingId(null)
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
    return <div className="section-card dark-card">{t('common.loading')}</div>
  }

  return (
    <div className="section-card dark-card">
      <div className="section-head">
        <h2>{t('myAds.title')}</h2>
      </div>

      {items.length === 0 ? (
        <p>{t('myAds.emptyText')}</p>
      ) : (
        <div className="ads-list">
          {items.map((item) => (
            <div className="ad-row" key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderBottom: '1px solid var(--line)' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '2px 8px', 
                    borderRadius: '12px', 
                    background: item.type === 'job' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                    color: item.type === 'job' ? '#60a5fa' : '#34d399',
                    fontWeight: 'bold'
                  }}>
                    {item.type === 'job' ? t('orders.defaultJobCategory') : t('categories.default')}
                  </span>
                  <h3 style={{ margin: 0 }}>
                    <Link to={item.type === 'job' ? `/jobs/${item.id}` : `/services/${item.id}`} style={{ color: 'var(--text-color)', textDecoration: 'none' }}>
                      {item.title}
                    </Link>
                  </h3>
                </div>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: '4px 0' }}>
                  {getTranslatedCategory(item.category)} · {getTranslatedDistrict(item.district)}
                </p>
                <p style={{ fontSize: '14px', fontWeight: 'bold', margin: 0 }}>
                  {item.price ? `${item.price} ${t('services.priceLabel')}` : t('services.priceNotSpecified')}
                </p>
              </div>

              <button
                type="button"
                className="action-button secondary"
                onClick={() => handleDelete(item)}
                disabled={deletingId === item.id}
                style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #ef4444', color: '#ef4444', background: 'transparent' }}
              >
                {deletingId === item.id ? t('myAds.deleting') : t('myAds.delete')}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}