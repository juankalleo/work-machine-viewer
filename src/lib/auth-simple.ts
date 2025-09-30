// Sistema de autenticação simples para navegador
import { User, getUserByUsername, createUser } from './storage';

export interface AuthResult {
  success: boolean;
  user?: User;
  token?: string;
  message?: string;
}

// Simular hash de senha (em produção, use bcrypt no servidor)
function hashPassword(password: string): string {
  // Simulação simples - em produção, use bcrypt no servidor
  return btoa(password + '_hashed');
}

// Simular verificação de senha
function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword;
}

// Gerar token simples (em produção, use JWT no servidor)
function generateToken(userId: string): string {
  return btoa(JSON.stringify({ userId, timestamp: Date.now() }));
}

// Verificar token
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = JSON.parse(atob(token));
    return decoded;
  } catch (error) {
    return null;
  }
}

// Login do usuário
export async function loginUser(username: string, password: string): Promise<AuthResult> {
  try {
    // Buscar usuário
    const user = getUserByUsername(username);
    
    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado'
      };
    }

    // Para simplificar, vamos aceitar qualquer senha para o admin
    // Em produção, você teria senhas hasheadas no banco
    if (username === 'admin' && password === 'admin123') {
      const token = generateToken(user.id);
      return {
        success: true,
        user,
        token
      };
    }

    // Para outros usuários, verificar senha (implementação simplificada)
    if (password.length < 6) {
      return {
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      };
    }

    const token = generateToken(user.id);
    return {
      success: true,
      user,
      token
    };
  } catch (error) {
    console.error('Erro no login:', error);
    return {
      success: false,
      message: 'Erro interno do servidor'
    };
  }
}

// Registrar novo usuário
export async function registerUser(
  username: string, 
  email: string, 
  password: string, 
  role: string = 'user'
): Promise<AuthResult> {
  try {
    // Verificar se usuário já existe
    const existingUser = getUserByUsername(username);
    
    if (existingUser) {
      return {
        success: false,
        message: 'Usuário já existe'
      };
    }

    // Validar dados
    if (password.length < 6) {
      return {
        success: false,
        message: 'Senha deve ter pelo menos 6 caracteres'
      };
    }

    // Criar usuário
    const newUser = createUser({
      username,
      email,
      role
    });

    const token = generateToken(newUser.id);

    return {
      success: true,
      user: newUser,
      token
    };
  } catch (error) {
    console.error('Erro no registro:', error);
    return {
      success: false,
      message: 'Erro interno do servidor'
    };
  }
}

// Buscar usuário por ID
export async function getUserById(userId: string): Promise<User | null> {
  try {
    // Buscar usuário pelo ID no localStorage
    const users = JSON.parse(localStorage.getItem('work_machine_users') || '[]');
    const user = users.find((u: User) => u.id === userId);
    return user || null;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    return null;
  }
}

// Verificar se usuário é admin
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const user = await getUserById(userId);
    return user?.role === 'admin';
  } catch (error) {
    console.error('Erro ao verificar permissões:', error);
    return false;
  }
}
