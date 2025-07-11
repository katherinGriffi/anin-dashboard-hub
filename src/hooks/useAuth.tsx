import { createContext, useContext, useState, ReactNode } from 'react';

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
  // ✨ CORRECCIÓN: Inicializa el estado directamente desde localStorage.
  // Esta función se ejecuta UNA SOLA VEZ al inicio, evitando el parpadeo.
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('anin-auth') === 'true';
  });

  // ✨ ELIMINADO: El useEffect ya no es necesario gracias a la inicialización síncrona.
  /*
  useEffect(() => {
    const auth = localStorage.getItem('anin-auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);
  */

  const login = (username: string, password: string): boolean => {
    // Credenciales específicas para ANIN
    if (username === 'user@anin.gob.pe' && password === 'anin@2025') {
      localStorage.setItem('anin-auth', 'true');
      setIsAuthenticated(true);
      console.log('Login exitoso para usuario:', username);
      return true;
    }
    console.log('Intento de login fallido');
    return false;
  };

  const logout = () => {
    localStorage.removeItem('anin-auth');
    setIsAuthenticated(false);
    console.log('Usuario deslogueado');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};