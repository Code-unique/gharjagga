'use client'

import { useEffect } from 'react'
import { useUser } from '@clerk/nextjs'

export default function UserSync() {
  const { user, isLoaded, isSignedIn } = useUser()

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      syncUser()
    }
  }, [isLoaded, isSignedIn, user])

  const syncUser = async () => {
    try {
      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      if (res.ok) {
        const data = await res.json()
        console.log('User synced:', data.user.role)
      }
    } catch (error) {
      console.error('Failed to sync user:', error)
    }
  }

  // This component doesn't render anything
  return null
}