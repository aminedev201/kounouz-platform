'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { authService, setAuthToken } from '@/services/apis'; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userOrderCount , setuserOrderCount] = useState(0);
  

  useEffect(() => {
    const init = async () => {
      const savedUserRaw = localStorage.getItem('user');
      if (!savedUserRaw) {
        setLoading(false);
        return;
      }

      let savedUser;
      try {
        savedUser = JSON.parse(savedUserRaw);
      } catch (err) {
        setLoading(false);
        return;
      }

      try {
        setAuthToken(savedUser.token); 
        const res = await authService.getCurrentUser(savedUser.id, savedUser.token);
        const currentUser = res.data;

        if (!currentUser) {
          logout();
          return;
        }

        setUser(currentUser);
        setToken(savedUser.token);
        setLoading(false);
      } catch (err) {
        console.error('Login check failed:', err);
        logout();
      }
    };

    init();
  }, []);

  const login = async (userData) => {
    localStorage.setItem('user', JSON.stringify(userData));
    try {
      setAuthToken(userData.token); 
      const res = await authService.getCurrentUser(userData.id, userData.token);
      const currentUser = res.data;

      setUser(currentUser);
      setToken(userData.token);

      if (currentUser.roles?.includes('ROLE_VENDOR')) {
        router.push('/dashboard/home');
      } else if (currentUser.roles?.includes('ROLE_USER')) {
        router.push('/');
      }
    } catch (err) {
      console.error('Login failed:', err);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setToken(null);
    setAuthToken(null); 
    setLoading(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading,userOrderCount, login, logout , setUser  , setuserOrderCount}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
