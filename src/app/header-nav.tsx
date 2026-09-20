"use client";

import { useState } from "react";
import Link from "next/link";

export function HeaderNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [open, setOpen] = useState(false);

  const links = [
    { href: "/photographers", label: "Find a photographer" },
    { href: "/requirements/new", label: "Post a job" },
    { href: "/leads", label: "For photographers" },
  ];

  return (
    <>
      <nav className="hidden md:flex items-center gap-6">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-sm text-slate hover:text-ink">
            {l.label}
          </Link>
        ))}
        <Link
          href={isLoggedIn ? "/my-bookings" : "/login"}
          className="text-sm text-slate hover:text-ink"
        >
          {isLoggedIn ? "My bookings" : "Log in"}
        </Link>
        <Link
          href="/#services"
          className="rounded-lg bg-primary text-on-primary px-4 py-2 text-sm font-semibold"
        >
          Book a session
        </Link>
      </nav>

      <button
        className="md:hidden p-2 -mr-2"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 6H17M3 10H17M3 14H17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-16 left-0 right-0 md:hidden border-b border-hairline bg-canvas px-6 py-4 flex flex-col gap-4 shadow-md">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-ink"
              onClick={() => setOpen(false)}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href={isLoggedIn ? "/my-bookings" : "/login"}
            className="text-sm text-ink"
            onClick={() => setOpen(false)}
          >
            {isLoggedIn ? "My bookings" : "Log in"}
          </Link>
          <Link
            href="/#services"
            className="rounded-lg bg-primary text-on-primary px-4 py-2.5 text-sm font-semibold text-center"
            onClick={() => setOpen(false)}
          >
            Book a session
          </Link>
        </div>
      )}
    </>
  );
}
