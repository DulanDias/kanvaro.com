'use client';

import { useEffect, useState } from 'react';
import { Search, Bell, Command } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/hooks/use-socket';

type SearchResult = {
  type: string;
  id: string;
  title?: string;
  name?: string;
  description?: string;
};

export function TopBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<
    Array<{ title?: string; type?: string; body?: string }>
  >([]);
  const socket = useSocket();
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
          credentials: 'include',
        });
        if (res.ok) {
          const me = await res.json();
          setUserId(me.id);
        }
      } catch (err) {
        void err;
      }
    })();
  }, []);

  useEffect(() => {
    if (!socket) return;
    if (userId) {
      socket.emit('join-user', { userId });
    }
    socket.on(
      'notification',
      (notif: { title?: string; type?: string; body?: string }) => {
        setNotifications((prev) => [notif, ...prev].slice(0, 50));
      }
    );
    return () => {
      socket.off('notification');
    };
  }, [socket]);

  useEffect(() => {
    const id = setTimeout(async () => {
      if (!open || query.trim() === '') {
        setResults([]);
        return;
      }
      try {
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/search?q=${encodeURIComponent(query)}`,
          {
            credentials: 'include',
          }
        );
        const data = await resp.json();
        setResults(data.results || []);
      } catch {
        setResults([]);
      }
    }, 200);
    return () => clearTimeout(id);
  }, [open, query]);

  return (
    <div className="fixed top-0 left-0 right-0 h-14 border-b bg-white/80 backdrop-blur z-40">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-gray-700">
          <div className="font-semibold">Kanvaro</div>
          <div className="hidden md:flex items-center text-sm text-gray-500 gap-2">
            <Command className="w-4 h-4" />
            <span>Press</span>
            <kbd className="px-1.5 py-0.5 rounded border bg-gray-50">⌘K</kbd>
            <span>for search</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm text-gray-600 hover:bg-gray-50"
            onClick={() => setOpen(true)}
          >
            <Search className="w-4 h-4" />
            <span className="hidden md:inline">Search</span>
            <span className="md:hidden">Search</span>
          </button>
          <button
            className="relative p-2 rounded-md hover:bg-gray-50"
            onClick={() => setNotifOpen((v) => !v)}
          >
            <Bell className="w-5 h-5 text-gray-700" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 text-xs bg-red-500 text-white rounded-full px-1">
                {Math.min(9, notifications.length)}
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="absolute inset-x-0 top-14 bg-white border-b shadow-sm">
          <div className="max-w-3xl mx-auto p-4">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, tasks, comments, users..."
              className="w-full border rounded-md px-3 py-2"
            />
            <div className="py-2">
              {results.length === 0 ? (
                <div className="text-sm text-gray-500 py-6 text-center">
                  No results
                </div>
              ) : (
                <ul className="divide-y">
                  {results.map((r, idx) => (
                    <li
                      key={idx}
                      className="py-2 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-medium">{r.title || r.name}</div>
                        <div className="text-xs text-gray-500">{r.type}</div>
                      </div>
                      <button
                        className="text-blue-600 text-sm"
                        onClick={() => {
                          const href = resolveHref(r);
                          if (href) {
                            setOpen(false);
                            router.push(href);
                          }
                        }}
                      >
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {notifOpen && (
        <div className="absolute right-4 top-14 w-80 bg-white border shadow-lg rounded-md p-2">
          <div className="px-2 py-1 text-sm font-medium">Notifications</div>
          <div className="max-h-96 overflow-auto divide-y">
            {notifications.length === 0 ? (
              <div className="text-sm text-gray-500 p-4 text-center">
                No notifications
              </div>
            ) : (
              notifications.map((n, i) => (
                <div key={i} className="p-2">
                  <div className="text-sm font-medium">{n.title || n.type}</div>
                  {n.body && (
                    <div className="text-xs text-gray-600">{n.body}</div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

type Result = { type: string; id?: string; taskId?: string };

function resolveHref(r: Result): string | null {
  switch (r.type) {
    case 'project':
      return `/projects/${r.id}`;
    case 'task':
      return `/tasks/${r.id}`;
    case 'comment':
      return r.taskId ? `/tasks/${r.taskId}` : null;
    case 'user':
      return `/users/${r.id}`;
    case 'label':
      return `/labels/${r.id}`;
    default:
      return null;
  }
}
