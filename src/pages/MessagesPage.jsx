import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../context/AuthContext'
import EmojiPicker from 'emoji-picker-react'
import {
  findOrCreateConversation,
  getMessages,
  getMyConversations,
  markMessagesAsRead,
  sendMessage,
  subscribeToMessages,
  updateMessage,
  deleteMessage,
  clearConversation,
  deleteConversation,
  getConversationById,
} from '../services/messagesService'
import { getJobById } from '../services/jobsService'
import { getServiceById } from '../services/servicesService'
import { createNotification } from '../services/notificationsService'
import { uploadImages, uploadDocuments } from '../services/storageService'

export default function MessagesPage() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const { t, i18n } = useTranslation()
  const jobId = searchParams.get('jobId')
  const serviceId = searchParams.get('serviceId')
  const conversationId = searchParams.get('conversationId')

  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loadingList, setLoadingList] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)

  const [showEmoji, setShowEmoji] = useState(false)
  const [showAttachMenu, setShowAttachMenu] = useState(false)
  const [attachedImages, setAttachedImages] = useState([])
  const [attachedDocs, setAttachedDocs] = useState([])
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [fullscreenImage, setFullscreenImage] = useState(null)
  const imageInputRef = useRef(null)
  const docInputRef = useRef(null)

  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editText, setEditText] = useState('')
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [convMenuOpenId, setConvMenuOpenId] = useState(null)

  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  const activeConversationId = activeConversation?.id || null

  const otherUser = useMemo(() => {
    if (!user || !activeConversation) return null
    return activeConversation.customer_id === user.id
      ? activeConversation.specialist
      : activeConversation.customer
  }, [user, activeConversation])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const close = () => { setMenuOpenId(null); setConvMenuOpenId(null) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  useEffect(() => {
    const close = (e) => { 
      if (!e.target.closest('.emoji-zone')) setShowEmoji(false) 
      if (!e.target.closest('.attach-zone')) setShowAttachMenu(false)
    }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [])

  useEffect(() => {
    const load = async () => {
      if (!user?.id) { setConversations([]); setLoadingList(false); return }
      setLoadingList(true)
      try {
        const data = await getMyConversations(user.id)
        setConversations(data || [])
      } catch (e) { console.error(e) } finally { setLoadingList(false) }
    }
    load()
  }, [user?.id])

  useEffect(() => {
    const init = async () => {
      if (!user?.id || (!jobId && !serviceId && !conversationId)) return
      try {
        let conversation = null
        
        if (conversationId) {
          conversation = await getConversationById(conversationId)
        } else {
          let item = null
          if (jobId) item = await getJobById(jobId)
          else if (serviceId) item = await getServiceById(serviceId)
          if (!item) return
          const ownerId = item.user_id
          if (!ownerId) return
          if (user.id === ownerId) return // Cannot guess the other participant just from jobId/serviceId
          conversation = await findOrCreateConversation({
            jobId: jobId || null, serviceId: serviceId || null,
            customerId: jobId ? ownerId : user.id,
            specialistId: jobId ? user.id : ownerId,
            createdBy: user.id,
          })
        }
        
        if (conversation) {
          setActiveConversation(conversation)
          setConversations(prev => {
            const exists = prev.some(c => c.id === conversation.id)
            if (exists) return prev.map(c => c.id === conversation.id ? conversation : c)
            return [conversation, ...prev]
          })
        }
      } catch (e) { console.error(e) }
    }
    init()
  }, [user?.id, jobId, serviceId, conversationId])

  useEffect(() => {
    const load = async () => {
      if (!activeConversationId || !user?.id) { setMessages([]); return }
      setLoadingMessages(true)
      try {
        const data = await getMessages(activeConversationId)
        setMessages(data || [])
        await markMessagesAsRead(activeConversationId, user.id)
      } catch (e) { console.error(e) } finally { setLoadingMessages(false) }
    }
    load()
  }, [activeConversationId, user?.id])

  useEffect(() => {
    if (!activeConversationId) return
    const channel = subscribeToMessages(activeConversationId, (event) => {
      const { type, message } = event
      if (type === 'INSERT') setMessages(prev => prev.some(m => m.id === message.id) ? prev : [...prev, message])
      else if (type === 'UPDATE') setMessages(prev => prev.map(m => m.id === message.id ? message : m))
      else if (type === 'DELETE') setMessages(prev => prev.filter(m => m.id !== message.id))
    })
    return () => channel.unsubscribe()
  }, [activeConversationId])

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv)
    setEditingMessageId(null)
    setAttachedImages([])
    setAttachedDocs([])
    setConvMenuOpenId(null)
  }

  const handleClearConversation = async (convId) => {
    if (!window.confirm(t('messages.confirmClear'))) return
    try {
      await clearConversation(convId)
      if (convId === activeConversationId) setMessages([])
    } catch (err) { alert(err.message) }
    setConvMenuOpenId(null)
  }

  const handleDeleteConversation = async (convId) => {
    if (!window.confirm(t('messages.confirmDeleteChat'))) return
    try {
      await deleteConversation(convId)
      setConversations(prev => prev.filter(c => c.id !== convId))
      if (convId === activeConversationId) { setActiveConversation(null); setMessages([]) }
    } catch (err) { alert(err.message) }
    setConvMenuOpenId(null)
  }

  const handleImageAttach = (e) => { 
    setShowAttachMenu(false); 
    setUploadError(''); 
    const files = e.target.files ? Array.from(e.target.files).filter(f => f && f.name) : [];
    if (files.length > 0) {
      setAttachedImages(prev => [...prev, ...files]); 
    }
    e.target.value = ''; 
  }
  const handleDocAttach = (e) => { 
    setShowAttachMenu(false); 
    setUploadError(''); 
    const files = e.target.files ? Array.from(e.target.files).filter(f => f && f.name) : [];
    if (files.length > 0) {
      setAttachedDocs(prev => [...prev, ...files]); 
    }
    e.target.value = ''; 
  }
  const removeAttachedImage = (idx) => setAttachedImages(prev => prev.filter((_, i) => i !== idx))
  const removeAttachedDoc = (idx) => setAttachedDocs(prev => prev.filter((_, i) => i !== idx))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploadError('')
    if (!user?.id || !activeConversationId) return
    if (!text.trim() && attachedImages.length === 0 && attachedDocs.length === 0) return
    setSending(true)
    try {
      let imageUrls = [], documentUrls = []
      if (attachedImages.length > 0) { setUploading(true); imageUrls = await uploadImages(attachedImages, user.id) }
      if (attachedDocs.length > 0) { setUploading(true); documentUrls = await uploadDocuments(attachedDocs, user.id) }
      setUploading(false)
      await sendMessage({ conversationId: activeConversationId, senderId: user.id, body: text.trim(), imageUrls, documentUrls })
      const receiverId = activeConversation.customer_id === user.id ? activeConversation.specialist_id : activeConversation.customer_id
      if (receiverId) {
        try {
          const senderProfile = activeConversation.customer_id === user.id ? activeConversation.customer : activeConversation.specialist
          const senderName = senderProfile?.full_name || user.user_metadata?.full_name || t('masters.noName')
          
          await createNotification({
            userId: receiverId, type: 'message',
            content: `${senderName}: ${text.trim() ? text.trim().slice(0, 45) : t('messages.fileSuffix')}`,
            link: `/messages?conversationId=${activeConversation.id}`
          })
        } catch (notifErr) {
          console.error('Failed to create notification', notifErr)
        }
      }
      setText(''); setAttachedImages([]); setAttachedDocs([])
      await markMessagesAsRead(activeConversationId, user.id)
    } catch (e) { 
      setUploadError(e.message || 'Ошибка при отправке')
    } finally { 
      setSending(false); setUploading(false) 
    }
  }

  const startEdit = (msg) => { setEditingMessageId(msg.id); setEditText(msg.body); setMenuOpenId(null); setTimeout(() => textareaRef.current?.focus(), 50) }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!editText.trim() || !editingMessageId) return
    try { await updateMessage(editingMessageId, editText.trim()); setEditingMessageId(null); setEditText('') }
    catch (err) { alert(err.message) }
  }

  const handleDelete = async (msgId) => {
    if (!window.confirm(t('messages.confirmDeleteMsg'))) return
    try { 
      setMessages(prev => prev.filter(m => m.id !== msgId))
      await deleteMessage(msgId) 
    } catch (err) { alert(err.message) }
    setMenuOpenId(null)
  }

  const handleClearChat = async () => {
    if (!window.confirm(t('messages.confirmClear'))) return
    try { await clearConversation(activeConversationId); setMessages([]) } catch (err) { alert(err.message) }
  }

  const handleEmojiClick = (emojiData) => {
    if (editingMessageId) {
      setEditText(prev => prev + emojiData.emoji)
    } else {
      setText(prev => prev + emojiData.emoji)
    }
    // Do not focus the textarea here, otherwise the native OS keyboard will pop up and ruin the layout
  }

  const formatTime = (d) => {
    const locale = i18n.language === 'ky' ? 'ky-KG' : i18n.language === 'ru' ? 'ru-RU' : 'en-US'
    return new Date(d).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })
  }

  const formatDate = (d) => {
    const date = new Date(d)
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
    if (date.toDateString() === today.toDateString()) return t('common.today')
    if (date.toDateString() === yesterday.toDateString()) return t('common.yesterday')
    const locale = i18n.language === 'ky' ? 'ky-KG' : i18n.language === 'ru' ? 'ru-RU' : 'en-US'
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'long' })
  }

  const initials = (name) => (name || 'U').slice(0, 1).toUpperCase()
  const avatarEl = (person, size = 40) => person?.avatar_url
    ? <img src={person.avatar_url} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
    : <span style={{ fontSize: size * 0.4 }}>{initials(person?.full_name)}</span>

  return (
    <div className="messages-layout-container">

      {/* ─── LEFT: Conversation List ─── */}
      <div className={`messages-sidebar ${activeConversation ? 'hidden-on-mobile' : ''}`}>
        {/* Header */}
        <div style={{ padding: '20px 16px 14px', borderBottom: '1px solid var(--line)', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{t('nav.messages')}</h2>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loadingList ? (
            <p style={{ padding: '20px', color: 'var(--muted)', fontSize: '14px' }}>{t('common.loading')}</p>
          ) : conversations.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--muted)' }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>💬</div>
              <p style={{ margin: 0, fontSize: '14px' }}>{t('messages.emptyListTip')}</p>
            </div>
          ) : (
            conversations.map(conv => {
              const isActive = conv.id === activeConversationId
              const partner = conv.customer_id === user?.id ? conv.specialist : conv.customer
              const itemTitle = conv.job?.title || conv.service?.title || t('messages.noTitle')
              return (
                <div
                  key={conv.id}
                  style={{ position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                  <button
                    onClick={() => handleSelectConversation(conv)}
                    style={{
                      flex: 1, display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '12px 10px 12px 16px', border: 'none', cursor: 'pointer', textAlign: 'left',
                      background: isActive ? 'var(--surface-soft)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      color: 'var(--text)', transition: 'all 0.15s',
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                      {avatarEl(partner, 44)}
                    </div>
                    <div style={{ overflow: 'hidden', flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{partner?.full_name || t('services.defaultUser')}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{itemTitle}</div>
                    </div>
                  </button>

                  {/* 3-dot menu button */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setConvMenuOpenId(convMenuOpenId === conv.id ? null : conv.id) }}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--muted)', fontSize: '16px',
                        padding: '8px 12px 8px 4px', opacity: 0.5,
                        lineHeight: 1,
                      }}
                      title={t('messages.chatActions')}
                    >⋮</button>

                    {convMenuOpenId === conv.id && (
                      <div
                        onClick={e => e.stopPropagation()}
                        style={{
                          position: 'absolute', top: '100%', right: '8px',
                          background: 'var(--surface)', border: '1px solid var(--line)',
                          borderRadius: '12px', boxShadow: 'var(--shadow)',
                          zIndex: 200, minWidth: '160px', overflow: 'hidden',
                        }}
                      >
                        <button
                          onClick={() => handleClearConversation(conv.id)}
                          style={{ width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--line)' }}
                        >
                          🧹 {t('messages.clearChatBtnShort')}
                        </button>
                        <button
                          onClick={() => handleDeleteConversation(conv.id)}
                          style={{ width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
                        >
                          🗑 {t('messages.deleteChatBtn')}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* ─── RIGHT: Chat Area ─── */}
      <div className={`messages-chat-area ${!activeConversation ? 'hidden-on-mobile' : ''}`}>

        {!activeConversation ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', gap: '12px' }}>
            <div style={{ fontSize: '64px' }}>💬</div>
            <h3 style={{ margin: 0, fontSize: '18px', color: 'var(--text)' }}>{t('messages.selectChatTitle')}</h3>
            <p style={{ margin: 0, fontSize: '14px' }}>{t('messages.selectChatDesc')}</p>
          </div>
        ) : (
          <>
            {/* ── Chat Header ── */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', flexShrink: 0, gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  className="messages-back-btn" 
                  onClick={() => setActiveConversation(null)}
                  title="Back"
                >
                  ←
                </button>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, overflow: 'hidden', flexShrink: 0 }}>
                  {avatarEl(otherUser, 40)}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '15px' }}>{otherUser?.full_name || t('messages.partnerPlaceholder')}</div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {activeConversation?.job?.title || activeConversation?.service?.title || t('messages.dialog')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                {activeConversation?.job_id && <Link to={`/jobs/${activeConversation.job_id}`} style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>{t('orders.openOrder')}</Link>}
                {activeConversation?.service_id && <Link to={`/services/${activeConversation.service_id}`} style={{ fontSize: '13px', color: 'var(--primary)', textDecoration: 'none' }}>{t('services.openService')}</Link>}
                <button onClick={handleClearChat} title={t('messages.clearChatBtnShort')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', opacity: 0.5, padding: '4px' }}>🗑</button>
              </div>
            </div>

            {/* ── Messages ── */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {loadingMessages ? (
                <div style={{ margin: 'auto', color: 'var(--muted)', fontSize: '14px' }}>{t('common.loading')}</div>
              ) : messages.length === 0 ? (
                <div style={{ margin: 'auto', textAlign: 'center', color: 'var(--muted)' }}>
                  <div style={{ fontSize: '40px', marginBottom: '8px' }}>👋</div>
                  <p style={{ margin: 0, fontSize: '14px' }}>{t('messages.firstMsgTip')}</p>
                </div>
              ) : (
                (() => {
                  let lastDate = null
                  return messages.map(msg => {
                    const isMine = msg.sender_id === user?.id
                    const msgDate = formatDate(msg.created_at)
                    const showDate = msgDate !== lastDate
                    lastDate = msgDate

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div style={{ textAlign: 'center', margin: '12px 0 8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
                            <span style={{ fontSize: '12px', color: 'var(--muted)', background: 'var(--surface-soft)', padding: '2px 12px', borderRadius: '999px', whiteSpace: 'nowrap', fontWeight: 500 }}>{msgDate}</span>
                            <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
                          </div>
                        )}

                        <div style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start', marginBottom: '4px', gap: '6px', alignItems: 'flex-end' }}>

                          {/* other user avatar */}
                          {!isMine && (
                            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700, flexShrink: 0, overflow: 'hidden' }}>
                              {avatarEl(otherUser, 30)}
                            </div>
                          )}

                          {/* Bubble */}
                          <div style={{ maxWidth: '65%', position: 'relative' }}>

                            {/* 3-dot menu button for own messages */}
                            {isMine && (
                              <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', right: '100%', marginRight: '4px' }}>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === msg.id ? null : msg.id) }}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '14px', padding: '4px', borderRadius: '4px', opacity: 0.5, lineHeight: 1 }}
                                >⋮</button>
                                {menuOpenId === msg.id && (
                                  <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', bottom: '100%', right: 0, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '10px', boxShadow: 'var(--shadow)', zIndex: 100, minWidth: '130px', overflow: 'hidden' }}>
                                    <button onClick={() => startEdit(msg)} style={{ width: '100%', padding: '9px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>✏️ {t('messages.editBtn')}</button>
                                    <button onClick={() => handleDelete(msg.id)} style={{ width: '100%', padding: '9px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}>🗑 {t('messages.deleteBtn')}</button>
                                  </div>
                                )}
                              </div>
                            )}

                            <div style={{
                              padding: '8px 12px',
                              borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                              background: isMine ? 'var(--gradient-primary)' : 'var(--surface)',
                              color: isMine ? '#fff' : 'var(--text)',
                              boxShadow: isMine ? '0 2px 8px rgba(99,102,241,0.3)' : '0 1px 3px rgba(0,0,0,0.08)',
                              border: isMine ? 'none' : '1px solid var(--line)',
                              fontSize: '14px', lineHeight: '1.5', wordBreak: 'break-word',
                            }}>

                              {msg.body && <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.body}</p>}

                              {/* Images */}
                              {msg.image_urls?.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: msg.body ? '8px' : 0 }}>
                                  {msg.image_urls.map((url, i) => (
                                    <div 
                                      key={i} 
                                      onClick={(e) => { e.stopPropagation(); setFullscreenImage(url); }}
                                      style={{ cursor: 'pointer' }}
                                    >
                                      <img src={url} alt="" style={{ width: '160px', height: '120px', objectFit: 'cover', borderRadius: '10px', display: 'block' }} />
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Documents */}
                              {msg.document_urls?.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: msg.body ? '8px' : 0 }}>
                                  {msg.document_urls.map((url, i) => (
                                    <a key={i} href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderRadius: '8px', background: isMine ? 'rgba(255,255,255,0.15)' : 'var(--surface-soft)', color: 'inherit', textDecoration: 'none', fontSize: '13px' }}>
                                      📄 {url.split('/').pop()?.split('?')[0] || `${t('messages.fileLabel')} ${i + 1}`}
                                    </a>
                                  ))}
                                </div>
                              )}

                              {/* Time row */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', justifyContent: 'flex-end' }}>
                                {msg.is_edited && <span style={{ fontSize: '11px', opacity: 0.65, fontStyle: 'italic' }}>{t('messages.edited')}</span>}
                                <span style={{ fontSize: '11px', opacity: isMine ? 0.75 : 0.5 }}>{formatTime(msg.created_at)}</span>
                                {isMine && <span style={{ fontSize: '11px', opacity: 0.75 }}>{msg.is_read ? '✓✓' : '✓'}</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                })()
              )}
              <div ref={bottomRef} />
            </div>

            {/* ── Input Area ── */}
            <div style={{ flexShrink: 0, background: 'var(--surface)', borderTop: '1px solid var(--line)', padding: '10px 16px' }}>

              {/* Attached files preview */}
              {(attachedImages.length > 0 || attachedDocs.length > 0) && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
                  {attachedImages.map((file, i) => {
                    let src = '';
                    try { src = file ? URL.createObjectURL(file) : ''; } catch(e) { console.error('Error creating object URL:', e); }
                    return (
                      <div key={i} style={{ position: 'relative' }}>
                        {src ? (
                          <img src={src} alt="" style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '8px', display: 'block' }} />
                        ) : (
                          <div style={{ width: '56px', height: '56px', background: '#ccc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>Error</div>
                        )}
                        <button onClick={() => removeAttachedImage(i)} style={{ position: 'absolute', top: '-5px', right: '-5px', width: '16px', height: '16px', borderRadius: '50%', background: '#e74c3c', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '10px', lineHeight: '16px', textAlign: 'center', padding: 0 }}>×</button>
                      </div>
                    )
                  })}
                  {attachedDocs.map((file, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--surface-soft)', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', maxWidth: '180px' }}>
                      <span>📄</span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>
                      <button onClick={() => removeAttachedDoc(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e74c3c', fontSize: '14px', flexShrink: 0, padding: 0 }}>×</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Error message */}
              {uploadError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', background: '#fdf0f0', border: '1px solid #f5c6c6', borderRadius: '8px', marginBottom: '8px', fontSize: '13px', color: '#e74c3c' }}>
                  <span>⚠️</span> {uploadError}
                  <button onClick={() => setUploadError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px', marginLeft: 'auto', padding: 0 }}>×</button>
                </div>
              )}

              {/* Edit mode banner */}
              {editingMessageId && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px', background: 'rgba(99,102,241,0.08)', borderRadius: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--primary)' }}>
                  {t('messages.editing')}
                  <button onClick={() => { setEditingMessageId(null); setEditText('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '16px', marginLeft: 'auto', padding: 0 }}>×</button>
                </div>
              )}

              {/* Input row */}
              <form onSubmit={editingMessageId ? handleEditSubmit : handleSubmit} style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>

                <input id="image-input" ref={imageInputRef} type="file" accept="image/*" multiple style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }} onChange={handleImageAttach} />
                <input id="doc-input" ref={docInputRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar" multiple style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', borderWidth: 0 }} onChange={handleDocAttach} />

                {/* Action buttons (Attachment + Emoji) */}
                <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', flexShrink: 0 }}>
                  {!editingMessageId && (
                    <div className="attach-zone" style={{ position: 'relative' }}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setShowAttachMenu(v => !v) }} title={t('messages.documentTooltip')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '24px', padding: '6px 8px', color: 'var(--muted)', lineHeight: 1 }}>
                        +
                      </button>
                      
                      {showAttachMenu && (
                        <div style={{ position: 'absolute', bottom: '48px', left: '10px', zIndex: 200, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: '12px', boxShadow: 'var(--shadow)', padding: '8px', minWidth: '180px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <label 
                            htmlFor="image-input"
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '14px', borderRadius: '8px', textAlign: 'left' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-soft)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          >
                            <span style={{ fontSize: '18px', color: '#3498db' }}>📷</span> {t('messages.photoTooltip') || 'Фото и видео'}
                          </label>
                          <label 
                            htmlFor="doc-input"
                            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '14px', borderRadius: '8px', textAlign: 'left' }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-soft)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
                          >
                            <span style={{ fontSize: '18px', color: '#9b59b6' }}>📄</span> {t('messages.documentTooltip') || 'Документ'}
                          </label>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="emoji-zone" style={{ position: 'relative' }}>
                    <button type="button" onClick={(e) => { 
                      e.stopPropagation()
                      setShowEmoji(v => {
                        const next = !v;
                        if (next) textareaRef.current?.blur();
                        return next;
                      })
                    }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '22px', padding: '6px 8px', color: 'var(--muted)', lineHeight: 1 }}>😊</button>
                  </div>
                </div>

                {/* Textarea */}
                <textarea
                  ref={textareaRef}
                  placeholder={t('messages.writePlaceholder')}
                  value={editingMessageId ? editText : text}
                  onChange={(e) => {
                    editingMessageId ? setEditText(e.target.value) : setText(e.target.value)
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      editingMessageId ? handleEditSubmit(e) : handleSubmit(e)
                    }
                  }}
                  onFocus={() => setShowEmoji(false)}
                  rows={1}
                  style={{
                    flex: 1, resize: 'none', border: 'none',
                    borderRadius: '20px', padding: '10px 14px',
                    background: 'var(--surface-soft)', color: 'var(--text)',
                    fontSize: '15px', lineHeight: '1.4', outline: 'none',
                    overflow: 'hidden', minHeight: '40px', maxHeight: '120px',
                    boxSizing: 'border-box', fontFamily: 'inherit',
                  }}
                />

                {/* Send button */}
                <button
                  type="submit"
                  disabled={sending || uploading || (!text.trim() && attachedImages.length === 0 && attachedDocs.length === 0)}
                  style={{
                    width: '40px', height: '40px', borderRadius: '50%', border: 'none',
                    background: (text.trim() || attachedImages.length > 0 || attachedDocs.length > 0) ? 'var(--primary)' : 'var(--surface-soft)', 
                    color: (text.trim() || attachedImages.length > 0 || attachedDocs.length > 0) ? '#fff' : 'var(--muted)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', flexShrink: 0,
                    opacity: sending || uploading ? 0.6 : 1,
                    transition: 'all 0.2s ease',
                  }}
                >
                  {uploading ? '⏳' : editingMessageId ? '✓' : '➤'}
                </button>
              </form>
              
              {showEmoji && (
                <div style={{ width: '100%', marginTop: '10px' }}>
                  <EmojiPicker onEmojiClick={handleEmojiClick} theme="auto" height={300} width="100%" previewConfig={{ showPreview: false }} searchPlaceholder={t('common.search')} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <div 
          onClick={() => setFullscreenImage(null)}
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.9)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <img src={fullscreenImage} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          <button 
            onClick={() => setFullscreenImage(null)}
            style={{ position: 'absolute', top: '20px', right: '20px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', fontSize: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}