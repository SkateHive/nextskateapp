"use client"

import { HiveAccount } from "@/lib/useHiveAuth"
import { createContext, useContext, useEffect, useMemo, useState } from "react"

interface HiveUserContextProps {
  hiveUser: HiveAccount | null
  setHiveUser: (user: HiveAccount | null) => void
  isLoading: boolean
}

const HiveUserContext = createContext<HiveUserContextProps | undefined>(
  undefined
)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<HiveAccount | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const getUserData = useMemo(() => {
    const userData = localStorage.getItem("hiveuser")
    return userData
  }, [])

  useEffect(() => {
    const userData = getUserData
    if (userData) {
      setUser(JSON.parse(userData))
      setIsLoading(false)
    }
  }, [getUserData])

  return (
    <HiveUserContext.Provider
      value={{ hiveUser: user, setHiveUser: setUser, isLoading }}
    >
      {children}
    </HiveUserContext.Provider>
  )
}

export const useHiveUser = (): HiveUserContextProps => {
  const context = useContext(HiveUserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}
