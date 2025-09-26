import React, { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, setAuthToken, logout as apiLogout } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Verificar autenticación al cargar la app
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token')
      const savedUser = localStorage.getItem('user')

      if (token && savedUser) {
        try {
          setAuthToken(token)
          const userData = JSON.parse(savedUser)
          
          // Verificar que el token siga siendo válido
          const response = await authAPI.getProfile()
          
          setUser(response.user)
          setIsAuthenticated(true)
        } catch (error) {
          // Token inválido, limpiar datos
          handleLogout()
        }
      }
      
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await authAPI.login(credentials)
      
      if (response.token && response.user) {
        // Guardar token y usuario
        setAuthToken(response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        setUser(response.user)
        setIsAuthenticated(true)
        
        toast.success(`¡Bienvenido/a ${response.user.full_name}! 🎉`)
        return { success: true, user: response.user }
      }
      
      throw new Error('Respuesta de login inválida')
    } catch (error) {
      const message = error.response?.data?.message || 'Error al iniciar sesión'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authAPI.register(userData)
      
      toast.success('Usuario creado exitosamente')
      return { success: true, user: response.user }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al crear usuario'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    apiLogout()
    setUser(null)
    setIsAuthenticated(false)
    toast.success('Sesión cerrada exitosamente')
  }

  const updateProfile = async (profileData) => {
    try {
      setLoading(true)
      // Aquí iría la llamada a la API para actualizar el perfil
      // Por ahora solo actualizamos el estado local
      const updatedUser = { ...user, ...profileData }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      toast.success('Perfil actualizado exitosamente')
      return { success: true, user: updatedUser }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al actualizar perfil'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (passwordData) => {
    try {
      setLoading(true)
      await authAPI.changePassword(passwordData)
      
      toast.success('Contraseña cambiada exitosamente')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Error al cambiar contraseña'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    apiLogout()
    setUser(null)
    setIsAuthenticated(false)
  }

  // Verificar si el usuario es admin
  const isAdmin = () => {
    return user?.role === 'admin'
  }

  // Verificar permisos específicos
  const hasPermission = (permission) => {
    if (!user) return false
    
    // Los administradores tienen todos los permisos
    if (user.role === 'admin') return true
    
    // Definir permisos por rol
    const permissions = {
      user: [
        'read_inventory',
        'read_incidents', 
        'create_incidents',
        'read_maintenance',
        'create_requisitions',
        'read_reports'
      ],
      admin: ['*'] // Todos los permisos
    }
    
    const userPermissions = permissions[user.role] || []
    return userPermissions.includes('*') || userPermissions.includes(permission)
  }

  const value = {
    // Estado
    user,
    loading,
    isAuthenticated,
    
    // Métodos
    login,
    register,
    logout: handleLogout,
    updateProfile,
    changePassword,
    
    // Utilidades
    isAdmin,
    hasPermission,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}