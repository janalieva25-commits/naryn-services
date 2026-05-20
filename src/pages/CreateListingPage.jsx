import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { createJob } from '../services/jobsService'
import { createService } from '../services/servicesService'
import { uploadImages, uploadDocuments } from '../services/storageService'
import { useAuth } from '../context/AuthContext'

const serviceCategories = [
  'Сантехника',
  'Электрика',
  'Уборка',
  'Ремонт и строительство',
  'IT услуги',
  'Дизайн',
  'Маркетинг и реклама',
  'Перевозки и доставка',
  'Репетиторы и обучение',
  'Красота и здоровье',
  'Бытовой ремонт',
  'Другое',
]

const orderCategories = [
  'Нужен сантехник',
  'Нужен электрик',
  'Нужна уборка',
  'Нужен ремонт и строительство',
  'Нужна IT помощь',
  'Нужен дизайн',
  'Нужен маркетинг и реклама',
  'Нужна перевозка и доставка',
  'Нужен репетитор / обучение',
  'Нужны услуги красоты и здоровья',
  'Нужен бытовой ремонт',
  'Другое',
]

const serviceCategoryKeys = {
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

const orderCategoryKeys = {
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

const districts = [
  { value: 'naryn', key: 'districts.naryn' },
  { value: 'at_bashy', key: 'districts.at_bashy' },
  { value: 'ak_talaa', key: 'districts.ak_talaa' },
  { value: 'jumgal', key: 'districts.jumgal' },
  { value: 'kochkor', key: 'districts.kochkor' },
]

export default function CreateListingPage() {
  const { user } = useAuth()
  const { t } = useTranslation()

  const [listingType, setListingType] = useState('service')
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Сантехника',
    district: 'naryn',
    address: '',
    price: '',
  })

  const [imageFiles, setImageFiles] = useState([])
  const [documentFiles, setDocumentFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleTypeChange = (e) => {
    const nextType = e.target.value
    setListingType(nextType)
    setForm((prev) => ({
      ...prev,
      category: nextType === 'service' ? serviceCategories[0] : orderCategories[0],
    }))
  }

  const handleImageChange = (e) => {
    setImageFiles(Array.from(e.target.files || []))
  }

  const handleDocumentChange = (e) => {
    setDocumentFiles(Array.from(e.target.files || []))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setSuccess('')

    try {
      let imageUrls = []
      let documentPaths = []

      if (imageFiles.length > 0) {
        imageUrls = await uploadImages(imageFiles, user.id)
      }

      if (documentFiles.length > 0) {
        documentPaths = await uploadDocuments(documentFiles, user.id)
      }

      const payload = {
        user_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        district: form.district,
        address: form.address,
        price: Number(form.price) || null,
        image_urls: imageUrls,
        document_urls: documentPaths,
      }

      if (listingType === 'service') {
        await createService({
          ...payload,
          status: 'active',
        })
      } else {
        await createJob({
          ...payload,
          status: 'open',
        })
      }

      setSuccess(
        listingType === 'service'
          ? t('createListing.successService')
          : t('createListing.successOrder')
      )

      setForm({
        title: '',
        description: '',
        category:
          listingType === 'service' ? serviceCategories[0] : orderCategories[0],
        district: 'naryn',
        address: '',
        price: '',
      })

      setImageFiles([])
      setDocumentFiles([])
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const categories = listingType === 'service' ? serviceCategories : orderCategories

  const getTranslatedCategory = (cat) => {
    if (listingType === 'service') {
      const key = serviceCategoryKeys[cat]
      return key ? t(`categories.${key}`) : cat
    } else {
      const key = orderCategoryKeys[cat]
      return key ? t(`categories.${key}`) : cat
    }
  }

  return (
    <div className="create-page">
      <div className="create-layout">
        <div className="section-card dark-card">
          <div className="section-head">
            <h2>{t('createListing.title')}</h2>
          </div>

          <form className="create-form" onSubmit={handleSubmit}>
            <select value={listingType} onChange={handleTypeChange}>
              <option value="service">{t('createListing.serviceType')}</option>
              <option value="order">{t('createListing.orderType')}</option>
            </select>

            <input
              type="text"
              name="title"
              placeholder={
                listingType === 'service'
                  ? t('createListing.placeholderServiceTitle')
                  : t('createListing.placeholderOrderTitle')
              }
              value={form.title}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder={
                listingType === 'service'
                  ? t('createListing.placeholderServiceDesc')
                  : t('createListing.placeholderOrderDesc')
              }
              value={form.description}
              onChange={handleChange}
              required
            />

            <select name="category" value={form.category} onChange={handleChange}>
              {categories.map((item) => (
                <option key={item} value={item}>
                  {getTranslatedCategory(item)}
                </option>
              ))}
            </select>

            <select name="district" value={form.district} onChange={handleChange}>
              {districts.map((item) => (
                <option key={item.value} value={item.value}>
                  {t(item.key)}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="address"
              placeholder={
                listingType === 'service'
                  ? t('createListing.placeholderServiceAddress')
                  : t('createListing.placeholderOrderAddress')
              }
              value={form.address}
              onChange={handleChange}
            />

            <input
              type="number"
              name="price"
              placeholder={
                listingType === 'service'
                  ? t('createListing.placeholderServicePrice')
                  : t('createListing.placeholderOrderPrice')
              }
              value={form.price}
              onChange={handleChange}
            />

            <div>
              <label>
                {listingType === 'service'
                  ? t('createListing.servicePhotoLabel')
                  : t('createListing.orderPhotoLabel')}
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
              />
            </div>

            <div>
              <label>{t('createListing.docsLabel')}</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                multiple
                onChange={handleDocumentChange}
              />
            </div>

            {imageFiles.length > 0 && (
              <div>
                <strong>{t('createListing.selectedPhotos')}</strong>
                <ul>
                  {imageFiles.map((file) => (
                    <li key={file.name}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {documentFiles.length > 0 && (
              <div>
                <strong>{t('createListing.selectedDocs')}</strong>
                <ul>
                  {documentFiles.map((file) => (
                    <li key={file.name}>{file.name}</li>
                  ))}
                </ul>
              </div>
            )}

            {success && <p className="auth-success">{success}</p>}

            <button type="submit" disabled={loading}>
              {loading
                ? t('createListing.creatingBtn')
                : listingType === 'service'
                  ? t('createListing.createServiceBtn')
                  : t('createListing.createOrderBtn')}
            </button>
          </form>
        </div>

        <div className="section-card dark-card">
          <div className="section-head">
            <h2>{t('createListing.tipsTitle')}</h2>
          </div>

          <div className="tips-list">
            <div className="tip-item">
              <strong>{t('createListing.tip1Title')}</strong>
              <p>{t('createListing.tip1Desc')}</p>
            </div>

            <div className="tip-item">
              <strong>{t('createListing.tip2Title')}</strong>
              <p>{t('createListing.tip2Desc')}</p>
            </div>

            <div className="tip-item">
              <strong>{t('createListing.tip3Title')}</strong>
              <p>
                {listingType === 'service'
                  ? t('createListing.tip3DescService')
                  : t('createListing.tip3DescOrder')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}