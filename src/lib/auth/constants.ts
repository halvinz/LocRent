export const SESSION_COOKIE_NAME = "fleetrent_session";
export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export const AUTH_ROUTES = {
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
} as const;

export const PUBLIC_ROUTES = ["/", "/login", "/register"] as const;

export const PROTECTED_PREFIXES = ["/dashboard"] as const;
