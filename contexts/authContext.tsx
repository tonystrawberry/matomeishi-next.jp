'use client'
import React, { useEffect, useState, createContext, ReactNode } from "react"
import { app } from "../app/firebase"
import { User, getAuth } from "firebase/auth";

// undefined: onAuthStateChanged hasn't been called
// null: user is not signed in
// User: user signed in
interface ContextProps {
  user: User | null | undefined;
  loading: boolean;
}

export const AuthContext = createContext<ContextProps>({ user: undefined, loading: true })

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    getAuth(app).onAuthStateChanged((user) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
  )
}
