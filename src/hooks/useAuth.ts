import { useState, useEffect } from 'react';
import { User, loginUser, registerUser, getUserById, verifyToken } from '@/lib/auth-simple';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Verificar se há token salvo
    const token = localStorage.getItem('auth_token');
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        fetchUser(decoded.userId);
      } else {
        localStorage.removeItem('auth_token');
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      const userData = await getUserById(userId);
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      localStorage.removeItem('auth_token');
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (username: string, password: string) => {
    try {
      console.log('Tentando fazer login com:', username);
      const result = await loginUser(username, password);
      console.log('Resultado do login:', result);
      
      if (result.success && result.user && result.token) {
        localStorage.setItem('auth_token', result.token);
        setUser(result.user);
        console.log('Usuário logado:', result.user);
        toast({
          title: "Login realizado",
          description: "Bem-vindo de volta!",
        });
        return { success: true };
      } else {
        console.log('Erro no login:', result.message);
        toast({
          title: "Erro no login",
          description: result.message || "Credenciais inválidas",
          variant: "destructive",
        });
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      toast({
        title: "Erro no login",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const signUp = async (username: string, email: string, password: string) => {
    try {
      const result = await registerUser(username, email, password);
      if (result.success && result.user && result.token) {
        localStorage.setItem('auth_token', result.token);
        setUser(result.user);
        toast({
          title: "Cadastro realizado",
          description: "Conta criada com sucesso!",
        });
        return { success: true };
      } else {
        toast({
          title: "Erro no cadastro",
          description: result.message || "Erro ao criar conta",
          variant: "destructive",
        });
        return { success: false, error: result.message };
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: "Erro interno do servidor",
        variant: "destructive",
      });
      return { success: false, error: 'Erro interno do servidor' };
    }
  };

  const signOut = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    isAdmin,
  };
};