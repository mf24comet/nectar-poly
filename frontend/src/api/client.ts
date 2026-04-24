const API_USER = import.meta.env.VITE_API_USERNAME ?? "admin";
const API_PASS = import.meta.env.VITE_API_PASSWORD ?? "secret";

function authHeader(): string {
  return `Basic ${btoa(`${API_USER}:${API_PASS}`)}`;
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader(),
      ...(init?.headers as Record<string, string>),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}
