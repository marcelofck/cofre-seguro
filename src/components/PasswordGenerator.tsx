import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { RefreshCw, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';

interface PasswordGeneratorProps {
  onPasswordGenerated: (password: string) => void;
}

export const PasswordGenerator = ({ onPasswordGenerated }: PasswordGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [length, setLength] = useState([16]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [generatedPassword, setGeneratedPassword] = useState('');

  const generatePassword = () => {
    let charset = '';
    
    if (includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (includeNumbers) charset += '0123456789';
    if (includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um tipo de caractere",
        variant: "destructive"
      });
      return;
    }

    let password = '';
    for (let i = 0; i < length[0]; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setGeneratedPassword(password);
  };

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(generatedPassword);
      toast({
        title: "Copiado!",
        description: "Senha copiada para a área de transferência",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar a senha",
        variant: "destructive"
      });
    }
  };

  const usePassword = () => {
    onPasswordGenerated(generatedPassword);
    setIsOpen(false);
    toast({
      title: "Senha aplicada!",
      description: "A senha foi adicionada ao formulário",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          className="shrink-0"
          onClick={() => {
            setIsOpen(true);
            if (!generatedPassword) generatePassword();
          }}
        >
          <RefreshCw className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>Gerador de Senhas</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Generated Password Display */}
          {generatedPassword && (
            <div className="space-y-3">
              <Label>Senha Gerada</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 p-3 bg-secondary rounded-md font-mono text-sm break-all border border-border">
                  {generatedPassword}
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyPassword}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Length Slider */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Comprimento</Label>
              <span className="text-sm text-muted-foreground">{length[0]} caracteres</span>
            </div>
            <Slider
              value={length}
              onValueChange={setLength}
              max={50}
              min={4}
              step={1}
              className="w-full"
            />
          </div>

          {/* Character Type Options */}
          <div className="space-y-4">
            <Label>Tipos de Caracteres</Label>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="uppercase" 
                  checked={includeUppercase}
                  onCheckedChange={(checked) => setIncludeUppercase(checked === true)}
                />
                <Label htmlFor="uppercase" className="text-sm">
                  Letras maiúsculas (A-Z)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="lowercase" 
                  checked={includeLowercase}
                  onCheckedChange={(checked) => setIncludeLowercase(checked === true)}
                />
                <Label htmlFor="lowercase" className="text-sm">
                  Letras minúsculas (a-z)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="numbers" 
                  checked={includeNumbers}
                  onCheckedChange={(checked) => setIncludeNumbers(checked === true)}
                />
                <Label htmlFor="numbers" className="text-sm">
                  Números (0-9)
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="symbols" 
                  checked={includeSymbols}
                  onCheckedChange={(checked) => setIncludeSymbols(checked === true)}
                />
                <Label htmlFor="symbols" className="text-sm">
                  Símbolos (!@#$%^&*)
                </Label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={generatePassword}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Gerar Nova
            </Button>
            
            {generatedPassword && (
              <Button 
                className="flex-1 bg-gradient-primary hover:opacity-90"
                onClick={usePassword}
              >
                Usar Esta Senha
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};