
import { useState, type FormEvent, type ReactNode } from "react";

const CHAT_PASSWORD = import.meta.env.VITE_CHAT_PASSWORD;

interface ChatLockProps {
  children: ReactNode;
}

export default function ChatLock({ children }: ChatLockProps) {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState("");

  // Si no hay contraseña configurada, permite el acceso.
  if (!CHAT_PASSWORD || authenticated) {
    return <>{children}</>;
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password === CHAT_PASSWORD) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Contraseña incorrecta");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-gray-900 p-8 shadow-xl"
      >
        <h1 className="text-2xl font-bold text-white mb-2">
          Acceso restringido
        </h1>

        <p className="text-gray-400 mb-6">
          Introduce la contraseña para acceder al chat.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña"
          autoComplete="current-password"
          required
          className="w-full rounded-lg bg-gray-800 border border-gray-700 p-3 text-white outline-none"
        />

        {error && (
          <p className="text-red-400 text-sm mt-2">{error}</p>
        )}

        <button
          type="submit"
          className="w-full mt-5 rounded-lg bg-blue-600 p-3 text-white font-semibold hover:bg-blue-700"
        >
          Desbloquear
        </button>
      </form>
    </div>
  );
}
