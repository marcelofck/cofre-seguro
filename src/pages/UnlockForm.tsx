import { useState, FormEvent } from "react";

interface UnlockFormProps {
  onUnlock: (password: string) => void;
}

export const UnlockForm = ({ onUnlock }: UnlockFormProps) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (password) {
      onUnlock(password);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="p-8 border rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Cofre Seguro</h1>
        <label htmlFor="password">Senha Mestra</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded mt-1"
          autoFocus
        />
        <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded mt-4">
          Desbloquear
        </button>
      </form>
    </div>
  );
};

