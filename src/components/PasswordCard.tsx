import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Edit, 
  Trash2, 
  Copy, 
  Eye, 
  EyeOff,
  Globe,
  FileText
} from 'lucide-react';
import { PasswordEntry } from './PasswordManager';

interface PasswordCardProps {
  password: PasswordEntry;
  category: any;
  isVisible: boolean;
  onToggleVisibility: (id: string) => void;
  onCopy: (text: string, type: string) => void;
  onEdit: (password: PasswordEntry) => void;
  onDelete: (id: string) => void;
}

export const PasswordCard = ({ 
  password, 
  category, 
  isVisible, 
  onToggleVisibility, 
  onCopy, 
  onEdit, 
  onDelete 
}: PasswordCardProps) => {
  const Icon = category?.icon || Globe;

  return (
    <Card className="bg-gradient-card border-border hover:shadow-glow/50 transition-all">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${category?.color || 'bg-muted'}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">{password.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {category?.name || 'Outros'}
                </Badge>
              </div>
              
              {password.username && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <span className="truncate">{password.username}</span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-6 w-6 p-0"
                    onClick={() => onCopy(password.username, 'Usuário')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono">
                  {isVisible ? password.password : '••••••••••••'}
                </span>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0"
                  onClick={() => onToggleVisibility(password.id)}
                >
                  {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-6 w-6 p-0"
                  onClick={() => onCopy(password.password, 'Senha')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </div>

              {password.website && (
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  <Globe className="w-3 h-3 inline mr-1" />
                  {password.website}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0"
              onClick={() => onEdit(password)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            {password.notes && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 w-8 p-0"
                    title="Ver notas"
                  >
                    <FileText className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md bg-card border-border">
                  <DialogHeader>
                    <DialogTitle>Notas - {password.title}</DialogTitle>
                  </DialogHeader>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {password.notes}
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              onClick={() => onDelete(password.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};