"use client"

import React, { useState, useEffect, createContext, useContext } from "react"
import { authService } from "@/lib/auth"

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: !!user,
        })
      } catch (error) {
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        })
      }
    }

    checkAuth()
  }, [])

  const login = async (email, password) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const { user, token } = await authService.login(email, password)
      localStorage.setItem("auth-token", token)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const register = async (userData) => {
    setAuthState((prev) => ({ ...prev, isLoading: true }))
    try {
      const { user, token } = await authService.register(userData)
      localStorage.setItem("auth-token", token)
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })
    } catch (error) {
      setAuthState((prev) => ({ ...prev, isLoading: false }))
      throw error
    }
  }

  const logout = async () => {
    await authService.logout()
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }

  const forgotPassword = async (email) => {
    await authService.forgotPassword(email)
  }

  return (
    <AuthContext.Provider
      value={{
        authState,
        login,
        register,
        logout,
        forgotPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
