import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Shield, Lock, Unlock } from 'lucide-react';
import { PasswordDashboard } from './PasswordDashboard';

interface PasswordManagerProps {}

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  website: string;
  category: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const PasswordManager = ({}: PasswordManagerProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasMasterPassword, setHasMasterPassword] = useState(false);

  useEffect(() => {
    const storedHash = localStorage.getItem('password_manager_master_hash');
    setHasMasterPassword(!!storedHash);
  }, []);

  const bufferToHex = (buffer: ArrayBuffer): string => {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };

  const hexToBuffer = (hex: string): Uint8Array => {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return bytes;
  };

  const createVerificationHash = async (password: string, salt: Uint8Array): Promise<string> => {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    const key = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
      keyMaterial,
      256
    );
    const hash = await crypto.subtle.digest('SHA-256', key);
    return bufferToHex(hash);
  };

  const handleSetMasterPassword = async () => {
    if (masterPassword.length < 8) {
      setError('A senha mestre deve ter pelo menos 8 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const verificationHash = await createVerificationHash(masterPassword, salt);
      
      localStorage.setItem('password_manager_master_hash', verificationHash);
      localStorage.setItem('password_manager_master_salt', bufferToHex(salt));
      
      sessionStorage.setItem('temp_master_password', masterPassword);

      setHasMasterPassword(true);
      setIsAuthenticated(true);
      setError('');
    } catch (err) {
      setError('Erro ao definir a senha mestre. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const storedHash = localStorage.getItem('password_manager_master_hash');
      const saltHex = localStorage.getItem('password_manager_master_salt');
      
      if (!storedHash || !saltHex) {
        setError('Nenhuma senha mestre encontrada. Por favor, crie uma.');
        setHasMasterPassword(false);
        setIsLoading(false);
        return;
      }

      const salt = hexToBuffer(saltHex);
      const verificationHash = await createVerificationHash(masterPassword, salt);
      
      if (verificationHash === storedHash) {
        sessionStorage.setItem('temp_master_password', masterPassword);
        setIsAuthenticated(true);
        setError('');
      } else {
        setError('Senha mestre incorreta.');
      }
    } catch (err) {
      setError('Erro ao fazer login. Tente novamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setMasterPassword('');
    sessionStorage.removeItem('temp_master_password');
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (hasMasterPassword) {
        handleLogin();
      } else {
        handleSetMasterPassword();
      }
    }
  };

  if (isAuthenticated) {
    return <PasswordDashboard onLogout={handleLogout} />;
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-primary rounded-full mb-4 shadow-glow">
            <Shield className="w-10 h-10 text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Cofre Pessoal
          </h1>
          <p className="text-muted-foreground mt-2">
            Seu gerenciador de senhas pessoal e seguro
          </p>
        </div>

        <Card className="bg-gradient-card border-border shadow-elegant">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              {hasMasterPassword ? (
                <>
                  <Lock className="w-5 h-5" />
                  Digite sua Senha Mestre
                </>
              ) : (
                <>
                  <Unlock className="w-5 h-5" />
                  Crie sua Senha Mestre
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="masterPassword">
                {hasMasterPassword ? 'Senha Mestre' : 'Nova Senha Mestre (mín. 8 caracteres)'}
              </Label>
              <Input
                id="masterPassword"
                type="password"
                value={masterPassword}
                onChange={(e) => {
                  setMasterPassword(e.target.value);
                  setError('');
                }}
                onKeyDown={handleKeyPress}
                placeholder="Digite sua senha mestre..."
                className="bg-secondary border-border"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="text-destructive text-sm text-center">
                {error}
              </div>
            )}

            <Button
              onClick={hasMasterPassword ? handleLogin : handleSetMasterPassword}
              disabled={!masterPassword || isLoading}
              className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
            >
              {isLoading ? 'Processando...' : (
                hasMasterPassword ? 'Entrar' : 'Criar Senha Mestre'
              )}
            </Button>

            {!hasMasterPassword && (
              <div className="text-xs text-muted-foreground text-center space-y-1">
                <p>• Use pelo menos 8 caracteres.</p>
                <p>• Esta senha não pode ser recuperada.</p>
                <p>• Ela é a chave para criptografar seus dados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
