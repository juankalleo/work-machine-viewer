import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { Shield, Lock, User, Mail, Monitor, Cpu, Settings, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="animate-pulse text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-pulse" />
            <Shield className="relative h-16 w-16 mx-auto text-blue-400" />
          </div>
          <p className="text-blue-200/80 text-lg">Carregando sistema...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await signIn(username, password);
    if (result.success) {
      // Login bem-sucedido, o hook useAuth já vai redirecionar
      console.log('Login realizado com sucesso');
    }
    setIsSubmitting(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    await signUp(email, password, username);
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      
      <div className="relative w-full max-w-md">
        {/* Modern Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center items-center mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl">
                <Shield className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
            DER-SESUT
          </h1>
          <h2 className="text-xl font-semibold mb-2 text-blue-300">
            MONITORAMENTO
          </h2>
          <p className="text-slate-300 flex items-center justify-center gap-2">
            <Monitor className="h-4 w-4" />
            <span>Sistema de Gerenciamento de Equipamentos</span>
            <Cpu className="h-4 w-4" />
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-sm border border-white/20">
            <TabsTrigger value="login" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">
              <Lock className="h-4 w-4 mr-2" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-slate-300">
              <User className="h-4 w-4 mr-2" />
              Cadastrar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center gap-2 text-white text-xl">
                  <Settings className="h-5 w-5 text-blue-400" />
                  Acesso ao Sistema
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Entre com suas credenciais para gerenciar equipamentos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={handleSignIn} className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="username" className="text-slate-200 font-medium">Usuário</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Digite seu usuário"
                        className="pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:border-blue-400 transition-all duration-200 h-12"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="password" className="text-slate-200 font-medium">Senha</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Digite sua senha"
                        className="pl-12 pr-12 py-3 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:border-blue-400 transition-all duration-200 h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Entrando...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Entrar no Sistema
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-6">
            <Card className="bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl">
              <CardHeader className="text-center pb-6">
                <CardTitle className="flex items-center justify-center gap-2 text-white text-xl">
                  <User className="h-5 w-5 text-green-400" />
                  Criar Nova Conta
                </CardTitle>
                <CardDescription className="text-slate-300">
                  Registre-se para ter acesso ao sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignUp} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="reg-username" className="text-slate-200 font-medium">Nome de usuário</Label>
                    <div className="relative group">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-green-400 transition-colors" />
                      <Input
                        id="reg-username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Escolha um nome de usuário"
                        className="pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:border-green-400 transition-all duration-200 h-12"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="reg-email" className="text-slate-200 font-medium">Email</Label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-green-400 transition-colors" />
                      <Input
                        id="reg-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                        className="pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:border-green-400 transition-all duration-200 h-12"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="reg-password" className="text-slate-200 font-medium">Senha</Label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-green-400 transition-colors" />
                      <Input
                        id="reg-password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Crie uma senha segura"
                        className="pl-12 pr-4 py-3 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 focus:border-green-400 transition-all duration-200 h-12"
                        required
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Criando conta...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Criar Conta
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;