"use client";

export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      onClick={() => {
        window.dispatchEvent(new Event("open-cookie-preferences"));
      }}
      className="text-left transition hover:text-white"
    >
      Gerir cookies
    </button>
  );
}
