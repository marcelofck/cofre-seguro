import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Shield,
  Globe,
  Briefcase,
  CreditCard,
  Mail,
  Settings
} from 'lucide-react';

const categories = [
  { id: 'pessoal', name: 'Pessoal', icon: Shield, color: 'bg-primary/10 text-primary' },
  { id: 'trabalho', name: 'Trabalho', icon: Briefcase, color: 'bg-accent/10 text-accent' },
  { id: 'financeiro', name: 'Financeiro', icon: CreditCard, color: 'bg-strength-medium/10 text-strength-medium' },
  { id: 'email', name: 'E-mail', icon: Mail, color: 'bg-strength-strong/10 text-strength-strong' },
  { id: 'outros', name: 'Outros', icon: Globe, color: 'bg-muted-foreground/10 text-muted-foreground' },
];

interface CategorySidebarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  totalPasswords: number;
  passwords: any[];
}

export const CategorySidebar = ({ 
  selectedCategory, 
  onCategoryChange, 
  totalPasswords, 
  passwords 
}: CategorySidebarProps) => {
  const getCategoryStats = () => {
    return categories.map(cat => ({
      ...cat,
      count: passwords.filter(p => p.category === cat.id).length
    }));
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardHeader>
        <CardTitle className="text-lg">Categorias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button
          variant={selectedCategory === 'todos' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onCategoryChange('todos')}
        >
          <Settings className="w-4 h-4 mr-2" />
          Todas ({totalPasswords})
        </Button>
        {getCategoryStats().map(category => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => onCategoryChange(category.id)}
            >
              <Icon className="w-4 h-4 mr-2" />
              {category.name} ({category.count})
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};