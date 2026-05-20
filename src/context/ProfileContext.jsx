import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const ProfileContext = createContext(null)

export function ProfileProvider({ children }) {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  const loadProfile = async () => {
    if (!user?.id) {
      setProfile(null)
      setProfileLoading(false)
      return
    }

    setProfileLoading(true)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Profile load error:', error.message)
      setProfile(null)
      setProfileLoading(false)
      return
    }

    setProfile(data)
    setProfileLoading(false)
  }

  const updateMyProfile = async (updates) => {
    if (!user?.id) throw new Error('Пользователь не авторизован')

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error

    setProfile(data)
    return data
  }

  useEffect(() => {
    loadProfile()
  }, [user?.id])

  return (
    <ProfileContext.Provider
      value={{
        profile,
        profileLoading,
        refreshProfile: loadProfile,
        updateMyProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  )
}

export function useProfile() {
  const context = useContext(ProfileContext)

  if (!context) {
    throw new Error('useProfile must be used within ProfileProvider')
  }

  return context
}