const COOKIE_NAME = "numdlewang_result";

export interface CookieData {
  date: string;
  results: (boolean | "neutral" | "nine-eleven")[];
  seen: boolean;
}

function nextMidnight(): Date {
  const d = new Date();
  d.setHours(24, 0, 0, 0);
  return d;
}

export function saveCookie(data: CookieData) {
  const expires = nextMidnight().toUTCString();
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; expires=${expires}; path=/; SameSite=Lax`;
}

export function loadCookie(dateStr: string): CookieData | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  try {
    const data: CookieData = JSON.parse(decodeURIComponent(match.split("=").slice(1).join("=")));
    if (data.date !== dateStr) return null;
    return data;
  } catch {
    return null;
  }
}
