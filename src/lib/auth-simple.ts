// Sistema de autenticação com MySQL
import { User } from '@/types/equipment';
import { db } from './database';

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
    // Para o admin, usar credenciais fixas sem consultar o banco
    if (username === 'admin' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-001',
        username: 'admin',
        email: 'admin@der-sesut.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const token = generateToken(adminUser.id);
      return {
        success: true,
        user: adminUser,
        token
      };
    }

    // Para outros usuários, buscar no banco MySQL
    const user = await db.getUserByUsername(username);
    
    if (!user) {
      return {
        success: false,
        message: 'Usuário não encontrado'
      };
    }

    // Validação básica de senha (para usuários do banco)
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
    // Verificar se usuário já existe no MySQL
    const existingUser = await db.getUserByUsername(username);
    
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

    // Criar usuário no MySQL
    const newUser = await db.createUser({
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
    // Se for o admin, retornar diretamente
    if (userId === 'admin-001') {
      return {
        id: 'admin-001',
        username: 'admin',
        email: 'admin@der-sesut.com',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Para outros usuários, buscar no MySQL
    const users = await db.getAllUsers();
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
