import { useState, useEffect } from "react";
import { useState } from "react";
import { UnlockForm } from "@/components/UnlockForm";
import { VaultContent } from "@/components/VaultContent";

// This is a simplified example of what the code might look like
// with the insecure sessionStorage pattern.
const Index = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  // A chave mestra agora vive APENAS no estado do componente (em memória).
  const [masterKey, setMasterKey] = useState<string | null>(null);

  // On component mount, check if we are already "logged in"
  useEffect(() => {
    if (sessionStorage.getItem("masterKey")) {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = () => {
    // In a real app, you'd get a password from a form
    const password = prompt("Enter master password:");
    if (password) {
      // Insecure: Storing the key in sessionStorage
      sessionStorage.setItem("masterKey", password);
      setIsUnlocked(true);
    }
  // Esta função é passada para o UnlockForm para definir a chave no estado.
  const handleUnlock = (password: string) => {
    // Em uma aplicação real, use uma Key Derivation Function (KDF) como Argon2 ou PBKDF2.
    const derivedKey = `derived_key_from_${password}`; // Exemplo simplificado
    setMasterKey(derivedKey);
  };

  // Esta função é passada para o VaultContent para limpar a chave do estado.
  const handleLock = () => {
    sessionStorage.removeItem("masterKey");
    setIsUnlocked(false);
    setMasterKey(null);
  };

  if (!isUnlocked) {
    return (
      <div>
        <h1>Cofre Bloqueado</h1>
        <button onClick={handleUnlock}>Desbloquear</button>
      </div>
    );
  // Se não houver chave, exibe o formulário de desbloqueio.
  if (!masterKey) {
    return <UnlockForm onUnlock={handleUnlock} />;
  }

  return (
    <div>
      <h1>Cofre Desbloqueado</h1>
      <p>Seu conteúdo secreto está aqui.</p>
      {/* Components that read from sessionStorage would be here */}
      <button onClick={handleLock}>Bloquear</button>
    </div>
  );
  // Se a chave existir, exibe o conteúdo do cofre, passando a chave via props.
  return <VaultContent masterKey={masterKey} onLock={handleLock} />;
};

export default Index;

