import { Card, CardContent } from '@/components/ui/card';
import { Shield, Globe, Briefcase, CreditCard, Mail } from 'lucide-react';
import { PasswordEntry } from './PasswordManager';
import { PasswordCard } from './PasswordCard';

const categories = [
  { id: 'pessoal', name: 'Pessoal', icon: Shield, color: 'bg-primary/10 text-primary' },
  { id: 'trabalho', name: 'Trabalho', icon: Briefcase, color: 'bg-accent/10 text-accent' },
  { id: 'financeiro', name: 'Financeiro', icon: CreditCard, color: 'bg-strength-medium/10 text-strength-medium' },
  { id: 'email', name: 'E-mail', icon: Mail, color: 'bg-strength-strong/10 text-strength-strong' },
  { id: 'outros', name: 'Outros', icon: Globe, color: 'bg-muted-foreground/10 text-muted-foreground' },
];

interface PasswordListProps {
  passwords: PasswordEntry[];
  filteredPasswords: PasswordEntry[];
  visiblePasswords: Set<string>;
  onToggleVisibility: (id: string) => void;
  onCopy: (text: string, type: string) => void;
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
}

export const PasswordList = ({
  passwords,
  filteredPasswords,
  visiblePasswords,
  onToggleVisibility,
  onCopy,
  onEdit,
  onDelete
}: PasswordListProps) => {
  if (filteredPasswords.length === 0) {
    return (
      <Card className="bg-gradient-card border-border">
        <CardContent className="py-12 text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {passwords.length === 0 ? 'Nenhuma senha salva' : 'Nenhuma senha encontrada'}
          </h3>
          <p className="text-muted-foreground">
            {passwords.length === 0 
              ? 'Adicione sua primeira senha para começar.' 
              : 'Tente ajustar os filtros ou termo de busca.'
            }
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {filteredPasswords.map((password) => {
        const category = categories.find(c => c.id === password.category);
        const isVisible = visiblePasswords.has(password.id);

        return (
          <PasswordCard
            key={password.id}
            password={password}
            category={category}
            isVisible={isVisible}
            onToggleVisibility={onToggleVisibility}
            onCopy={onCopy}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        );
      })}
    </div>
  );
};