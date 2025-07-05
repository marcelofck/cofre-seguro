import { useState, useEffect } from "react";
import { UnlockForm } from "./UnlockForm";
import { VaultContent } from "./VaultContent";

// This is a simplified example of what the code might look like
// with the insecure sessionStorage pattern.
const Index = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  // A chave mestra agora vive APENAS no estado do componente (em memória).
  const [masterKey, setMasterKey] = useState<string | null>(null);

  // Verifica se já está desbloqueado ao montar o componente
  useEffect(() => {
    const storedKey = sessionStorage.getItem("masterKey");
    if (storedKey) {
      setMasterKey(storedKey);
      setIsUnlocked(true);
    }
  }, []);

  // Função para desbloquear o cofre
  const handleUnlock = (password: string) => {
    // Em uma aplicação real, use uma Key Derivation Function (KDF) como Argon2 ou PBKDF2
    const derivedKey = `derived_key_from_${password}`; // Exemplo simplificado
    setMasterKey(derivedKey);
    sessionStorage.setItem("masterKey", derivedKey);
    setIsUnlocked(true);
  };

  // Função para bloquear o cofre
  const handleLock = () => {
    sessionStorage.removeItem("masterKey");
    setIsUnlocked(false);
    setMasterKey(null);
  };

  if (!isUnlocked) {
    return (
      <div>
        <h1>Cofre Bloqueado</h1>
        <button onClick={() => handleUnlock("password")}>Desbloquear</button>
      </div>
    );
  }

  // Se não houver chave, exibe o formulário de desbloqueio
  if (!masterKey) {
    return <UnlockForm onUnlock={handleUnlock} />;
  }

  // Se a chave existir, exibe o conteúdo do cofre
  return <VaultContent masterKey={masterKey} onLock={handleLock} />;
};

export default Index;

