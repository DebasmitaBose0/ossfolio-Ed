"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

interface NavbarProps {
  onSignIn?: () => void;
  onGetStarted?: () => void;
}

const navLinks = ["Features", "How it works", "Leaderboard"];

export function Navbar({ onSignIn, onGetStarted }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        width: "100%",
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #ededed",
      }}
    >
      {/* Inner container */}
      <div
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          height: "56px",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
          <Image
            src="/logo.png"
            alt=""
            width={28}
            height={28}
            priority
            style={{ borderRadius: "6px", flexShrink: 0 }}
          />
          <span style={{ display: "flex", alignItems: "baseline" }}>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#171717", letterSpacing: "-0.3px" }}>OSS</span>
            <span style={{ fontSize: "15px", fontWeight: 600, color: "#3ecf8e", letterSpacing: "-0.3px" }}>folio</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "28px" }}
          className="hide-on-mobile">
          {navLinks.map((item) => (
            <Link
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              style={{ fontSize: "14px", fontWeight: 500, color: "#707070", textDecoration: "none" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#171717")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#707070")}
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}
          className="hide-on-mobile">
          <button
            onClick={() => onSignIn?.()}
            style={{
              fontSize: "14px",
              fontWeight: 500,
              color: "#171717",
              background: "#ffffff",
              border: "1px solid #c7c7c7",
              cursor: "pointer",
              padding: "7px 16px",
              borderRadius: "6px",
              letterSpacing: "0",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#fafafa";
              e.currentTarget.style.borderColor = "#b2b2b2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#ffffff";
              e.currentTarget.style.borderColor = "#c7c7c7";
            }}
          >
            Sign in
          </button>
          <button
            onClick={() => onGetStarted?.()}
            style={{
              fontSize: "14px",
              fontWeight: 500,
              backgroundColor: "#3ecf8e",
              color: "#171717",
              padding: "7px 16px",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              letterSpacing: "0",
              lineHeight: 1,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#24b47e")}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3ecf8e")}
          >
            Get started
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#171717",
            padding: "4px",
            display: "none",
          }}
          className="show-on-mobile"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          style={{
            borderTop: "1px solid #ededed",
            backgroundColor: "#ffffff",
            display: "none",
          }}
          className="show-on-mobile"
        >
          <div style={{ padding: "12px 20px 16px", display: "flex", flexDirection: "column", gap: "4px" }}>
            {navLinks.map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                style={{
                  padding: "8px 0",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#707070",
                  textDecoration: "none",
                  display: "block",
                }}
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </Link>
            ))}
            <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid #ededed", display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                onClick={() => { setMobileOpen(false); if (onSignIn) onSignIn(); }}
                style={{
                  width: "100%",
                  padding: "9px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#171717",
                  backgroundColor: "#ffffff",
                  border: "1px solid #c7c7c7",
                  borderRadius: "6px",
                  cursor: "pointer",
                  textAlign: "center",
                }}
              >
                Sign in
              </button>
              <button
                onClick={() => { setMobileOpen(false); if (onGetStarted) onGetStarted(); }}
                style={{
                  width: "100%",
                  padding: "9px 16px",
                  fontSize: "14px",
                  fontWeight: 500,
                  backgroundColor: "#3ecf8e",
                  color: "#171717",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                Get started
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Responsive styles */}
      <style>{`
        @media (min-width: 768px) {
          .hide-on-mobile { display: flex !important; }
          .show-on-mobile { display: none !important; }
        }
        @media (max-width: 767px) {
          .hide-on-mobile { display: none !important; }
          .show-on-mobile { display: block !important; }
        }
      `}</style>
    </header>
  );
}
