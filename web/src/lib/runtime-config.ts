const DEFAULT_DEV_API_BASE_URL = "http://localhost:8080/api/v1";
const API_BASE_PATH = "/api/v1";
const TUTOR_API_PATH = "/api/tutor";

export const API_URL_CONFIG_ERROR_MESSAGE =
  "Missing NEXT_PUBLIC_API_URL. Set it in web/.env.local for local development and in Vercel for preview and production deployments.";

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getConfiguredApiBaseUrl() {
  const configured = process.env.NEXT_PUBLIC_API_URL?.trim();
  return configured ? trimTrailingSlash(configured) : null;
}

export function getApiBaseUrl() {
  const configuredApiBaseUrl = getConfiguredApiBaseUrl();
  if (configuredApiBaseUrl) {
    return configuredApiBaseUrl;
  }

  if (process.env.NODE_ENV !== "production") {
    return DEFAULT_DEV_API_BASE_URL;
  }

  throw new Error(API_URL_CONFIG_ERROR_MESSAGE);
}

export function getTutorApiUrl() {
  const apiBaseUrl = getApiBaseUrl();

  if (apiBaseUrl.endsWith(API_BASE_PATH)) {
    return `${apiBaseUrl.slice(0, -API_BASE_PATH.length)}${TUTOR_API_PATH}`;
  }

  return `${apiBaseUrl}${TUTOR_API_PATH}`;
}
