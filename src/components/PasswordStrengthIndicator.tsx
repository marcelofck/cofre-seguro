import { useMemo } from 'react';
import { Progress } from '@/components/ui/progress';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({ password }: PasswordStrengthIndicatorProps) => {
  const strength = useMemo(() => {
    if (!password) return { score: 0, text: '', color: '' };

    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 20;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;
    
    // Determine strength level
    if (score <= 30) {
      return { score, text: 'Muito Fraca', color: 'text-strength-weak' };
    } else if (score <= 50) {
      return { score, text: 'Fraca', color: 'text-strength-medium' };
    } else if (score <= 75) {
      return { score, text: 'Boa', color: 'text-strength-strong' };
    } else {
      return { score, text: 'Muito Forte', color: 'text-strength-very-strong' };
    }
  }, [password]);

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-sm">
        <span className="text-muted-foreground">Força da senha:</span>
        <span className={`font-medium ${strength.color}`}>
          {strength.text}
        </span>
      </div>
      <Progress 
        value={strength.score} 
        className="h-2"
      />
    </div>
  );
};