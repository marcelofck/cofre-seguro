import { Button } from '@/components/ui/button';
import { Download, Upload } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PasswordEntry } from './PasswordManager';

interface ImportExportActionsProps {
  passwords: PasswordEntry[];
  onPasswordsImported: (passwords: PasswordEntry[]) => void;
}

export const ImportExportActions = ({ passwords, onPasswordsImported }: ImportExportActionsProps) => {
  const exportPasswords = () => {
    const dataToExport = {
      passwords: passwords,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };
    
    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `senhas-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: "Backup criado!",
      description: `${passwords.length} senhas exportadas com sucesso`,
    });
  };

  const importPasswords = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target?.result as string);
        const importedPasswords = jsonData.passwords || jsonData;
        
        if (!Array.isArray(importedPasswords)) {
          throw new Error('Formato de arquivo inválido');
        }
        
        const processedPasswords = importedPasswords.map((p: any) => ({
          ...p,
          id: p.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
          createdAt: new Date(p.createdAt || Date.now()),
          updatedAt: new Date(p.updatedAt || Date.now())
        }));
        
        // Mesclar com senhas existentes, evitando duplicatas por título
        const existingTitles = passwords.map(p => p.title.toLowerCase());
        const newPasswords = processedPasswords.filter((p: PasswordEntry) => 
          !existingTitles.includes(p.title.toLowerCase())
        );
        
        const mergedPasswords = [...passwords, ...newPasswords];
        onPasswordsImported(mergedPasswords);
        
        toast({
          title: "Importação concluída!",
          description: `${newPasswords.length} novas senhas importadas`,
        });
        
      } catch (error) {
        toast({
          title: "Erro na importação",
          description: "Arquivo inválido ou corrompido",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(file);
    // Limpar o input para permitir reimportar o mesmo arquivo
    event.target.value = '';
  };

  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={exportPasswords}
      >
        <Download className="w-4 h-4 mr-2" />
        Exportar Senhas
      </Button>
      
      <div className="relative">
        <input
          type="file"
          accept=".json"
          onChange={importPasswords}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          id="import-file"
        />
        <Button
          variant="outline"
          className="w-full justify-start"
          asChild
        >
          <label htmlFor="import-file" className="cursor-pointer">
            <Upload className="w-4 h-4 mr-2" />
            Importar Senhas
          </label>
        </Button>
      </div>
    </div>
  );
};