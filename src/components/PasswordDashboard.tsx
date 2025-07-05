import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Shield, Plus, Download, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PasswordEntry } from './PasswordManager';
import { CategorySidebar } from './CategorySidebar';
import { PasswordForm } from './PasswordForm';
import { SearchBar } from './SearchBar';
import { PasswordList } from './PasswordList';
import { Card, CardContent } from '@/components/ui/card';

interface PasswordDashboardProps {
  onLogout: () => void;
}

interface EncryptedEntry {
  id: string;
  iv: string; // Initialization Vector as hex
  data: string; // Encrypted data as hex
}

// Helper functions for cryptography
const bufferToHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

const hexToBuffer = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes;
};

export const PasswordDashboard = ({ onLogout }: PasswordDashboardProps) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [encryptionKey, setEncryptionKey] = useState<CryptoKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    username: '',
    password: '',
    website: '',
    category: 'pessoal',
    notes: '',
  });

  // --- CRYPTOGRAPHY HOOKS ---
  useEffect(() => {
    const deriveKey = async () => {
      const masterPassword = sessionStorage.getItem('temp_master_password');
      const saltHex = localStorage.getItem('password_manager_master_salt');

      if (!masterPassword || !saltHex) {
        toast({
          title: 'Erro de Segurança',
          description: 'Sessão inválida. Por favor, faça login novamente.',
          variant: 'destructive',
        });
        onLogout();
        return;
      }

      try {
        const salt = hexToBuffer(saltHex);
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
          'raw',
          encoder.encode(masterPassword),
          { name: 'PBKDF2' },
          false,
          ['deriveKey']
        );
        const key = await crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt, iterations: 200000, hash: 'SHA-256' },
          keyMaterial,
          { name: 'AES-GCM', length: 256 },
          true,
          ['encrypt', 'decrypt']
        );
        setEncryptionKey(key);
      } catch (error) {
        console.error('Key derivation failed:', error);
        toast({
          title: 'Erro Crítico de Segurança',
          description: 'Não foi possível derivar a chave de criptografia.',
          variant: 'destructive',
        });
        onLogout();
      }
    };
    deriveKey();
  }, [onLogout, toast]);

  const encryptData = useCallback(
    async (data: object): Promise<{ iv: string; encryptedData: string } | null> => {
      if (!encryptionKey) return null;
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encodedData = new TextEncoder().encode(JSON.stringify(data));
      const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, encryptionKey, encodedData);
      return { iv: bufferToHex(iv), encryptedData: bufferToHex(encrypted) };
    },
    [encryptionKey]
  );

  const decryptData = useCallback(
    async (encryptedEntry: EncryptedEntry): Promise<PasswordEntry | null> => {
      if (!encryptionKey) return null;
      try {
        const iv = hexToBuffer(encryptedEntry.iv);
        const data = hexToBuffer(encryptedEntry.data);
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, encryptionKey, data);
        const decoded = new TextDecoder().decode(decrypted);
        const parsed = JSON.parse(decoded);
        return {
          ...parsed,
          id: encryptedEntry.id,
          createdAt: new Date(parsed.createdAt),
          updatedAt: new Date(parsed.updatedAt),
        };
      } catch (e) {
        console.error('Decryption failed:', e);
        toast({
          title: 'Erro de Descriptografia',
          description: 'Não foi possível descriptografar uma entrada. Os dados podem estar corrompidos ou a senha mestre está incorreta.',
          variant: 'destructive',
        });
        return null;
      }
    },
    [encryptionKey, toast]
  );

  // --- DATA MANAGEMENT HOOKS ---
  const loadPasswords = useCallback(async () => {
    if (!encryptionKey) return;
    setIsLoading(true);
    const storedEncrypted = localStorage.getItem('password_manager_entries_encrypted');
    if (storedEncrypted) {
      try {
        const encryptedEntries: EncryptedEntry[] = JSON.parse(storedEncrypted);
        const decryptedPasswords = await Promise.all(encryptedEntries.map(decryptData));
        setPasswords(decryptedPasswords.filter((p): p is PasswordEntry => p !== null));
      } catch (error) {
        console.error('Error loading passwords:', error);
        toast({ title: 'Erro ao carregar senhas.', variant: 'destructive' });
      }
    }
    setIsLoading(false);
  }, [encryptionKey, decryptData, toast]);

  useEffect(() => {
    if (encryptionKey) {
      loadPasswords();
    }
  }, [encryptionKey, loadPasswords]);

  const savePasswords = async (newPasswords: PasswordEntry[]) => {
    if (!encryptionKey) {
      toast({ title: 'Chave de criptografia não está pronta.', variant: 'destructive' });
      return;
    }
    try {
      const encryptedEntries = await Promise.all(
        newPasswords.map(async (p) => {
          const { id, ...dataToEncrypt } = p;
          const encrypted = await encryptData(dataToEncrypt);
          if (!encrypted) throw new Error('Encryption failed for an entry.');
          return { id, iv: encrypted.iv, data: encrypted.encryptedData };
        })
      );
      localStorage.setItem('password_manager_entries_encrypted', JSON.stringify(encryptedEntries));
      setPasswords(newPasswords);
    } catch (error) {
      console.error('Failed to save passwords:', error);
      toast({ title: 'Erro ao salvar senhas criptografadas.', variant: 'destructive' });
    }
  };

  // --- FORM HANDLING ---
  const resetForm = () => {
    setFormData({ title: '', username: '', password: '', website: '', category: 'pessoal', notes: '' });
  };

  const handleOpenAddForm = () => {
    resetForm();
    setEditingPassword(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (password: PasswordEntry) => {
    setFormData({
      title: password.title,
      username: password.username,
      password: password.password,
      website: password.website,
      category: password.category,
      notes: password.notes || '',
    });
    setEditingPassword(password);
    setIsFormOpen(true);
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    resetForm();
    setEditingPassword(null);
  };

  const handleFormSubmit = () => {
    if (!formData.title || !formData.password) {
      toast({ title: 'Erro', description: 'Título e senha são obrigatórios', variant: 'destructive' });
      return;
    }

    let updatedPasswords;
    if (editingPassword) {
      updatedPasswords = passwords.map((p) =>
        p.id === editingPassword.id ? { ...p, ...formData, updatedAt: new Date() } : p
      );
      toast({ title: 'Sucesso', description: 'Senha atualizada com sucesso!' });
    } else {
      const newPassword: PasswordEntry = {
        id: crypto.randomUUID(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      updatedPasswords = [...passwords, newPassword];
      toast({ title: 'Sucesso', description: 'Senha adicionada com sucesso!' });
    }

    savePasswords(updatedPasswords);
    handleFormCancel();
  };

  // --- PASSWORD ACTIONS ---
  const handleDeletePassword = (id: string) => {
    const updatedPasswords = passwords.filter((p) => p.id !== id);
    savePasswords(updatedPasswords);
    toast({ title: 'Sucesso', description: 'Senha removida com sucesso!' });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: 'Copiado!', description: `${type} copiado para a área de transferência` });
    } catch (error) {
      toast({ title: 'Erro', description: 'Não foi possível copiar', variant: 'destructive' });
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords((prev) => {
      const newVisible = new Set(prev);
      if (newVisible.has(id)) {
        newVisible.delete(id);
      } else {
        newVisible.add(id);
      }
      return newVisible;
    });
  };

  // --- IMPORT/EXPORT ---
  const exportPasswords = async () => {
    const encryptedData = localStorage.getItem('password_manager_entries_encrypted');
    if (!encryptedData) {
      toast({ title: 'Nenhuma senha para exportar.', variant: 'destructive' });
      return;
    }

    const dataToExport = {
      type: 'CofrePessoal-Encrypted-Backup-v1',
      encryptedData,
      exportDate: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cofre-pessoal-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: 'Backup criado!', description: 'Arquivo de backup criptografado foi baixado.' });
  };

  const importPasswords = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON.parse(content);

        let passwordsToImport: PasswordEntry[] = [];

        // Handle new encrypted format
        if (jsonData.type === 'CofrePessoal-Encrypted-Backup-v1' && jsonData.encryptedData) {
          const encryptedEntries: EncryptedEntry[] = JSON.parse(jsonData.encryptedData);
          const decrypted = await Promise.all(encryptedEntries.map(decryptData));
          passwordsToImport = decrypted.filter((p): p is PasswordEntry => p !== null);
          if (passwordsToImport.length !== encryptedEntries.length) {
            throw new Error('Falha ao descriptografar algumas entradas. A senha mestre pode estar incorreta.');
          }
        }
        // Handle old plaintext format
        else {
          const rawPasswords = jsonData.passwords || jsonData;
          if (!Array.isArray(rawPasswords)) throw new Error('Formato de arquivo inválido.');
          passwordsToImport = rawPasswords.map((p: any) => ({
            ...p,
            id: p.id || crypto.randomUUID(),
            createdAt: new Date(p.createdAt || Date.now()),
            updatedAt: new Date(p.updatedAt || Date.now()),
          }));
        }

        const existingTitles = new Set(passwords.map((p) => p.title.toLowerCase()));
        const newUniquePasswords = passwordsToImport.filter(
          (p) => !existingTitles.has(p.title.toLowerCase())
        );

        if (newUniquePasswords.length > 0) {
          await savePasswords([...passwords, ...newUniquePasswords]);
          toast({
            title: 'Importação concluída!',
            description: `${newUniquePasswords.length} novas senhas importadas e criptografadas.`,
          });
        } else {
          toast({
            title: 'Nenhuma senha nova',
            description: 'As senhas do arquivo de backup já existem no seu cofre.',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Erro na importação',
          description: error.message || 'Arquivo inválido ou corrompido.',
          variant: 'destructive',
        });
      } finally {
        event.target.value = ''; // Allow re-importing the same file
      }
    };
    reader.readAsText(file);
  };

  // --- FILTERING & SORTING ---
  const filteredAndSortedPasswords = useMemo(() => {
    return passwords
      .filter((password) => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          password.title.toLowerCase().includes(search) ||
          password.username.toLowerCase().includes(search) ||
          password.website.toLowerCase().includes(search);
        const matchesCategory = selectedCategory === 'todos' || password.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [passwords, searchTerm, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Cofre Pessoal</h1>
                <p className="text-sm text-muted-foreground">
                  {passwords.length} {passwords.length === 1 ? 'senha salva' : 'senhas salvas'}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={onLogout} className="border-destructive/50 text-destructive hover:bg-destructive/10">
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-4">
            <Button className="w-full bg-gradient-primary hover:opacity-90" onClick={handleOpenAddForm}>
              <Plus className="w-4 h-4 mr-2" />
              Nova Senha
            </Button>
            <CategorySidebar
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              passwords={passwords}
            />
            <Card className="bg-gradient-card border-border">
              <CardContent className="p-4 space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={exportPasswords}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Backup
                </Button>
                <div className="relative">
                  <input
                    type="file"
                    accept=".json"
                    onChange={importPasswords}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    id="import-file"
                  />
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <label htmlFor="import-file" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Importar Backup
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-4">
            <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
            {isLoading ? (
              <Card className="bg-gradient-card border-border">
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Descriptografando senhas...</p>
                </CardContent>
              </Card>
            ) : (
              <PasswordList
                passwords={passwords}
                filteredPasswords={filteredAndSortedPasswords}
                visiblePasswords={visiblePasswords}
                onToggleVisibility={togglePasswordVisibility}
                onCopy={copyToClipboard}
                onEdit={handleOpenEditForm}
                onDelete={handleDeletePassword}
              />
            )}
          </div>
        </div>
      </main>

      <PasswordForm
        isOpen={isFormOpen}
        editingPassword={editingPassword}
        formData={formData}
        onFormDataChange={setFormData}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        onOpenAdd={handleOpenAddForm}
      />
    </div>
  );
};
