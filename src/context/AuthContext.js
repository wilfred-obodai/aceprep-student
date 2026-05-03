import React, { createContext, useState, useContext, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [school,  setSchool]  = useState(null);
  const [token,   setToken]   = useState(localStorage.getItem('token'));
  const [role,    setRole]    = useState(localStorage.getItem('role'));
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    try {
      const savedUser   = localStorage.getItem('user');
      const savedSchool = localStorage.getItem('school');
      const savedRole   = localStorage.getItem('role');
      if (savedUser   && savedUser   !== 'undefined') setUser(JSON.parse(savedUser));
      if (savedSchool && savedSchool !== 'undefined') setSchool(JSON.parse(savedSchool));
      if (savedRole) setRole(savedRole);
    } catch (e) {
      localStorage.removeItem('user');
      localStorage.removeItem('school');
      localStorage.removeItem('role');
    }
  }, []);

  // ── Student Login ─────────────────────────────
  const loginStudent = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/student/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user',  JSON.stringify(user));
      localStorage.setItem('role',  'student');
      setToken(token);
      setUser(user);
      setRole('student');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── School Admin Login ────────────────────────
  const loginAdmin = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/school/login', { email, password });
      const { token, user, school } = res.data;
      localStorage.setItem('token',  token);
      localStorage.setItem('user',   JSON.stringify(user));
      localStorage.setItem('school', JSON.stringify(school));
      localStorage.setItem('role',   'admin');
      setToken(token);
      setUser(user);
      setSchool(school);
      setRole('admin');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Parent Login ──────────────────────────────
  const loginParent = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/parent/login', { email, password });
      const { token, parent } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user',  JSON.stringify(parent));
      localStorage.setItem('role',  'parent');
      setToken(token);
      setUser(parent);
      setRole('parent');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ── Register Student ──────────────────────────
  const registerStudent = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/student/register', data);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── Register Parent ───────────────────────────
  const registerParent = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/parent/register', data);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── Register School ───────────────────────────
  const registerSchool = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const res = await API.post('/auth/school/register', data);
      return { success: true, data: res.data };
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  // ── Logout ────────────────────────────────────
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('school');
    localStorage.removeItem('role');
    setToken(null);
    setUser(null);
    setSchool(null);
    setRole(null);
  };

  const isStudent = role === 'student';
  const isAdmin = role === 'admin' || role === 'teacher';
  const isParent  = role === 'parent';

  return (
    <AuthContext.Provider value={{
      user, school, token, role,
      loading, error,
      isStudent, isAdmin, isParent,
      loginStudent, loginAdmin, loginParent,
      registerStudent, registerParent, registerSchool,
      logout,
      login: loginStudent, // backward compat
      setError,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);