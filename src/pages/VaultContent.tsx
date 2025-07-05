interface VaultContentProps {
  masterKey: string;
  onLock: () => void;
}

export const VaultContent = ({ masterKey, onLock }: VaultContentProps) => {
  // Agora você pode usar a 'masterKey' para descriptografar e exibir os dados.
  // A chave foi recebida via props, não lida de um local inseguro.

  return (
    <div className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Cofre Desbloqueado</h1>
        <button onClick={onLock} className="bg-red-500 text-white p-2 rounded">
          Bloquear
        </button>
      </header>
      <p>O conteúdo protegido do seu cofre seria exibido aqui.</p>
      <p className="text-sm text-gray-500 mt-4">Chave em memória (exemplo): {masterKey}</p>
    </div>
  );
};

