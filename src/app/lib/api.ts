const env = import.meta.env as any;

const isLocalHost = typeof window !== "undefined" && [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
].includes(window.location.hostname);

const localDevDefault = isLocalHost ? "http://127.0.0.1:8000" : "https://finocr.onrender.com";

export const apiUrl = env.VITE_API_URL || localDevDefault;

if (!env.VITE_API_URL && isLocalHost) {
  console.warn(
    "VITE_API_URL is not set. Defaulting to local backend at http://127.0.0.1:8000.",
  );
}
