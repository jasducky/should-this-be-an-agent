"use client";

import { useState, useEffect } from "react";

export default function EmailCaptureForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("serpin_email");
    if (saved) setEmail(saved);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    localStorage.setItem("serpin_email", email);

    try {
      await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "landing-notify",
        }),
      });
    } catch {
      // Submission failure shouldn't block the user experience
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 p-3 bg-white/10 rounded-lg max-w-md">
        <svg
          className="w-5 h-5 text-serpin-yellow shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-white font-medium">
          You&apos;re on the list. We&apos;ll email you when the next question unlocks.
        </p>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your work email"
          className="flex-1 px-4 py-3 rounded-md border border-white/15 bg-white/5 text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-serpin-yellow"
        />
        <button
          type="submit"
          className="px-5 py-3 bg-serpin-yellow text-ink rounded-md text-sm font-semibold uppercase tracking-wide hover:bg-serpin-yellow-hover transition-colors whitespace-nowrap cursor-pointer"
        >
          Notify me
        </button>
      </form>
      <p className="mt-3 text-xs text-white/30">
        We&apos;ll email you when the next question unlocks &mdash;
        that&apos;s it. No spam, no selling your data. Unsubscribe any
        time.
      </p>
    </>
  );
}
