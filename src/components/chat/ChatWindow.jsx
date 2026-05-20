import { useEffect, useRef, useState } from 'react'
import {
  getMessagesByParticipants,
  sendMessage,
  subscribeToMessages,
} from '../../services/messagesService'
import { useAuth } from '../../context/AuthContext'

export default function ChatWindow({ jobId, receiverId, receiverName = 'Собеседник' }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    const loadMessages = async () => {
      if (!user?.id || !receiverId || !jobId) return

      try {
        const data = await getMessagesByParticipants(jobId, user.id, receiverId)
        setMessages(data || [])
      } catch (error) {
        alert(error.message)
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [user, receiverId, jobId])

  useEffect(() => {
    if (!jobId) return

    const channel = subscribeToMessages(jobId, (newMessage) => {
      const isCurrentChat =
        (newMessage.sender_id === user?.id && newMessage.receiver_id === receiverId) ||
        (newMessage.sender_id === receiverId && newMessage.receiver_id === user?.id)

      if (isCurrentChat) {
        setMessages((prev) => {
          const exists = prev.some((item) => item.id === newMessage.id)
          if (exists) return prev
          return [...prev, newMessage]
        })
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [jobId, receiverId, user])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e) => {
    e.preventDefault()

    if (!text.trim()) return
    if (!user?.id) return

    try {
      await sendMessage({
        job_id: jobId,
        sender_id: user.id,
        receiver_id: receiverId,
        content: text.trim(),
      })

      setText('')
    } catch (error) {
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="chat-window">
        <div className="chat-header">
          <h3>{receiverName}</h3>
        </div>
        <div className="chat-messages">
          <p>Загрузка сообщений...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="chat-window">
      <div className="chat-header">
        <div>
          <h3>{receiverName}</h3>
          <p>Онлайн-чат по объявлению</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <h4>Сообщений пока нет</h4>
            <p>Начни диалог первым.</p>
          </div>
        ) : (
          messages.map((message) => {
            const isMine = message.sender_id === user?.id

            return (
              <div
                key={message.id}
                className={`chat-bubble ${isMine ? 'mine' : 'theirs'}`}
              >
                <p>{message.content}</p>
                <span>
                  {new Date(message.created_at).toLocaleString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                  })}
                </span>
              </div>
            )
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-form" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Введите сообщение..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button type="submit">Отправить</button>
      </form>
    </div>
  )
}