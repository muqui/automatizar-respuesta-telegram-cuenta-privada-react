
import { useEffect, useState } from 'react';
import {
  getTelegramChats,
  getTelegramMessages,
} from '../../api/telegram.api';

interface TelegramChat {
  id: number;
  telegramId: string;
  accountId: number;
  title: string;
  username?: string;
  chatType: string;
  lastMessage?: string;
  lastMessageDate?: string;
  totalMessages?: number | string;
}

interface TelegramMessage {
  id: number;
  telegramMessageId: string;
  accountId: number;
  chatId: number;
  senderId?: string;
  message: string;
  direction: 'incoming' | 'outgoing';
  messageDate: string;
}

export default function TelegramPage() {
  const [chats, setChats] = useState<TelegramChat[]>([]);
  const [messages, setMessages] = useState<TelegramMessage[]>([]);

  const [accountId, setAccountId] = useState<number | undefined>(1);
  const [selectedChat, setSelectedChat] = useState<TelegramChat | null>(null);

  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState('');

  // Navegación móvil
  const [showMobileMessages, setShowMobileMessages] = useState(false);

  // Búsqueda
  const [searchTerm, setSearchTerm] = useState('');

  // Filtrar conversaciones por nombre o username
  const filteredChats = chats.filter((chat) => {
    const search = searchTerm.trim().toLowerCase();

    return (
      chat.title.toLowerCase().includes(search) ||
      chat.username?.toLowerCase().includes(search)
    );
  });

  // Cargar conversaciones
  const loadChats = async () => {
    try {
      setLoadingChats(true);
      setError('');

      const response = await getTelegramChats(accountId);
      const data: TelegramChat[] = response.data;

      setChats(data);

      // Conservar el contacto seleccionado si sigue disponible
      setSelectedChat((current) => {
        if (current) {
          const existing = data.find(
            (chat) =>
              chat.id === current.id &&
              chat.accountId === current.accountId
          );

          if (existing) return existing;
        }

        return data[0] ?? null;
      });
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las conversaciones.');
    } finally {
      setLoadingChats(false);
    }
  };

  // Cargar historial de la conversación seleccionada
  const loadMessages = async () => {
    if (!selectedChat) {
      setMessages([]);
      return;
    }

    try {
      setLoadingMessages(true);

      const response = await getTelegramMessages(
        selectedChat.id,
        selectedChat.accountId
      );

      setMessages(response.data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los mensajes.');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Actualizar conversaciones al cambiar de cuenta
  useEffect(() => {
    setSelectedChat(null);
    setMessages([]);
    setShowMobileMessages(false);
    loadChats();
  }, [accountId]);

  // Actualizar mensajes al cambiar de conversación
  useEffect(() => {
    loadMessages();
  }, [selectedChat?.id, selectedChat?.accountId]);

  // Formatear hora
  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Formatear fecha
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="h-[calc(100dvh-2rem)] min-h-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      <div className="flex h-full min-h-0">

        {/* LISTA DE CONVERSACIONES */}
        <aside
          className={`
            ${showMobileMessages ? 'hidden' : 'flex'}
            w-full min-h-0 flex-col border-r border-gray-200
            md:flex md:w-80 lg:w-96 md:shrink-0
          `}
        >

          {/* CABECERA */}
          <div className="shrink-0 border-b border-gray-200 p-4">

            <div className="mb-4 flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800">
                Telegram
              </h1>

              <button
                onClick={loadChats}
                disabled={loadingChats}
                className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-600 hover:bg-blue-100 disabled:opacity-50"
              >
                {loadingChats ? 'Cargando...' : '↻ Actualizar'}
              </button>
            </div>

            {/* SELECTOR DE CUENTAS */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Todas', value: undefined },
                { label: 'Cuenta 1', value: 1 },
                { label: 'Cuenta 2', value: 2 },
              ].map((account) => (
                <button
                  key={account.label}
                  onClick={() => setAccountId(account.value)}
                  className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                    accountId === account.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {account.label}
                </button>
              ))}
            </div>
          </div>

          {/* BUSCADOR */}
          <div className="shrink-0 border-b border-gray-200 p-3">
            <div className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre o usuario..."
                className="w-full rounded-lg border border-gray-200 bg-gray-50 py-3 pl-10 pr-10 text-sm text-gray-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>

              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label="Limpiar búsqueda"
                >
                  ✕
                </button>
              )}
            </div>

            <p className="mt-2 text-xs text-gray-400">
              {filteredChats.length} de {chats.length} conversaciones
            </p>
          </div>

          {/* CONTACTOS */}
          <div className="min-h-0 flex-1 overflow-y-auto">

            {loadingChats && chats.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-500">
                Cargando conversaciones...
              </p>
            )}

            {!loadingChats && filteredChats.length === 0 && (
              <p className="p-6 text-center text-sm text-gray-500">
                {searchTerm
                  ? 'No se encontraron conversaciones.'
                  : 'No hay conversaciones disponibles.'}
              </p>
            )}

            {filteredChats.map((chat) => (
              <button
                key={`${chat.accountId}-${chat.id}`}
                onClick={() => {
                  setSelectedChat(chat);
                  setShowMobileMessages(true);
                  setError('');
                }}
                className={`flex w-full items-center gap-3 border-b border-gray-100 p-4 text-left transition hover:bg-gray-50 ${
                  selectedChat?.id === chat.id &&
                  selectedChat?.accountId === chat.accountId
                    ? 'bg-blue-50'
                    : ''
                }`}
              >

                {/* AVATAR */}
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {chat.title?.charAt(0).toUpperCase() || '?'}
                </div>

                {/* INFORMACIÓN */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="truncate font-semibold text-gray-800">
                      {chat.title}
                    </h3>

                    <span className="shrink-0 text-xs text-gray-400">
                      {chat.lastMessageDate
                        ? formatTime(chat.lastMessageDate)
                        : ''}
                    </span>
                  </div>

                  <p className="truncate text-sm text-gray-500">
                    {chat.lastMessage || 'Sin mensajes'}
                  </p>

                  <span className="mt-1 inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-500">
                    Cuenta {chat.accountId}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* PANEL DE MENSAJES */}
        <main
          className={`
            ${showMobileMessages ? 'flex' : 'hidden'}
            min-w-0 min-h-0 flex-1 flex-col bg-gray-100
            md:flex
          `}
        >

          {selectedChat ? (
            <>

              {/* CABECERA */}
              <header className="flex shrink-0 items-center gap-3 border-b border-gray-200 bg-white p-3 sm:p-4">

                {/* REGRESAR EN MÓVIL */}
                <button
                  onClick={() => setShowMobileMessages(false)}
                  className="shrink-0 rounded-lg bg-gray-100 px-3 py-2 text-gray-700 hover:bg-gray-200 md:hidden"
                  aria-label="Regresar a conversaciones"
                >
                  ←
                </button>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white sm:h-11 sm:w-11">
                  {selectedChat.title?.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-bold text-gray-800">
                    {selectedChat.title}
                  </h2>

                  <p className="truncate text-xs text-gray-500">
                    {selectedChat.username
                      ? `@${selectedChat.username}`
                      : `Telegram ID: ${selectedChat.telegramId}`}
                    {' · '}Cuenta {selectedChat.accountId}
                  </p>
                </div>

                <button
                  onClick={loadMessages}
                  disabled={loadingMessages}
                  className="shrink-0 rounded-lg bg-gray-100 px-3 py-2 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50"
                  aria-label="Actualizar mensajes"
                >
                  ↻
                </button>
              </header>

              {/* HISTORIAL */}
              <section className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3 sm:p-4 lg:p-6">

                {loadingMessages && (
                  <p className="text-center text-sm text-gray-500">
                    Cargando mensajes...
                  </p>
                )}

                {!loadingMessages && messages.length === 0 && (
                  <p className="mt-10 text-center text-gray-500">
                    Esta conversación todavía no tiene mensajes.
                  </p>
                )}

                {messages.map((message, index) => {
                  const outgoing = message.direction === 'outgoing';
                  const previous = messages[index - 1];

                  const showDate =
                    !previous ||
                    new Date(previous.messageDate).toDateString() !==
                      new Date(message.messageDate).toDateString();

                  return (
                    <div key={message.id}>

                      {showDate && (
                        <div className="my-5 text-center">
                          <span className="rounded-full bg-gray-300 px-3 py-1 text-xs text-gray-700">
                            {formatDate(message.messageDate)}
                          </span>
                        </div>
                      )}

                      <div
                        className={`flex ${
                          outgoing ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] break-words rounded-2xl px-4 py-2 shadow-sm sm:max-w-[80%] ${
                            outgoing
                              ? 'rounded-br-sm bg-blue-600 text-white'
                              : 'rounded-bl-sm bg-white text-gray-800'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm">
                            {message.message}
                          </p>

                          <div
                            className={`mt-1 text-right text-[10px] ${
                              outgoing ? 'text-blue-100' : 'text-gray-400'
                            }`}
                          >
                            {formatTime(message.messageDate)}
                            {outgoing && ' ✓✓'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </section>

              {/* SOLO LECTURA */}
              <footer className="shrink-0 border-t border-gray-200 bg-white p-3">
                <p className="text-center text-xs text-gray-400">
                  Modo de solo lectura · El envío de mensajes se habilitará posteriormente.
                </p>
              </footer>

            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-4 text-center text-gray-400">
              Selecciona una conversación para ver los mensajes.
            </div>
          )}
        </main>
      </div>

      {/* ERROR */}
      {error && (
        <div className="fixed bottom-4 right-4 z-50 max-w-[90%] rounded-lg bg-red-100 px-4 py-3 text-sm text-red-700 shadow">
          {error}
        </div>
      )}
    </div>
  );
}
