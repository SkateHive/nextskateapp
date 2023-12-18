import { HiveAccount } from "@/lib/useHiveAuth"
import { createContext, useContext, useEffect, useState } from "react"

interface HiveUserContextProps {
  hiveUser: HiveAccount | null
  setHiveUser: (user: HiveAccount | null) => void
}

const HiveUserContext = createContext<HiveUserContextProps | undefined>(
  undefined
)

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<HiveAccount | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem("hiveuser")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  return (
    <HiveUserContext.Provider value={{ hiveUser: user, setHiveUser: setUser }}>
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
