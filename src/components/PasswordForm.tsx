import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { PasswordEntry } from './PasswordManager';
import { PasswordGenerator } from './PasswordGenerator';
import { PasswordStrengthIndicator } from './PasswordStrengthIndicator';

const categories = [
  { id: 'pessoal', name: 'Pessoal' },
  { id: 'trabalho', name: 'Trabalho' },
  { id: 'financeiro', name: 'Financeiro' },
  { id: 'email', name: 'E-mail' },
  { id: 'outros', name: 'Outros' },
];

interface PasswordFormProps {
  isOpen: boolean;
  editingPassword: PasswordEntry | null;
  formData: any;
  onFormDataChange: (data: any) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onOpenAdd: () => void;
}

export const PasswordForm = ({
  isOpen,
  editingPassword,
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
  onOpenAdd
}: PasswordFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel()}>
      <DialogTrigger asChild>
        <Button 
          className="w-full bg-gradient-primary hover:opacity-90"
          onClick={onOpenAdd}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Senha
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle>
            {editingPassword ? 'Editar Senha' : 'Nova Senha'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título*</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => onFormDataChange({...formData, title: e.target.value})}
              placeholder="Ex: Gmail, Facebook..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Usuário/E-mail</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => onFormDataChange({...formData, username: e.target.value})}
              placeholder="usuario@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha*</Label>
            <div className="flex gap-2">
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => onFormDataChange({...formData, password: e.target.value})}
                placeholder="Digite a senha..."
              />
              <PasswordGenerator onPasswordGenerated={(pwd) => onFormDataChange({...formData, password: pwd})} />
            </div>
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              value={formData.website}
              onChange={(e) => onFormDataChange({...formData, website: e.target.value})}
              placeholder="https://exemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={formData.category} onValueChange={(value) => onFormDataChange({...formData, category: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => onFormDataChange({...formData, notes: e.target.value})}
              placeholder="Notas adicionais..."
              rows={3}
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-gradient-primary hover:opacity-90"
              onClick={onSubmit}
            >
              {editingPassword ? 'Salvar' : 'Adicionar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};