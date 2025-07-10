
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Verificar autenticación persistente al cargar
  useEffect(() => {
    const auth = localStorage.getItem('anin-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    // Credenciales específicas para ANIN
    if (username === 'admin' && password === 'Anin.2025*') {
      setIsAuthenticated(true);
      localStorage.setItem('anin-auth', 'true');
      console.log('Login exitoso para usuario:', username);
      return true;
    }
    console.log('Intento de login fallido');
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('anin-auth');
    console.log('Usuario deslogueado');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
