"use client";

import { ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";

interface HeroProps {
  onGetStarted: () => void;
}

const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

export function Hero({ onGetStarted }: HeroProps) {
  return (
    <section style={{ width: "100%", backgroundColor: "#ffffff" }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={container}
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "80px 20px 96px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Pill */}
        <motion.div
          variants={fadeUp}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            backgroundColor: "#3ecf8e",
            color: "#171717",
            borderRadius: "9999px",
            fontSize: "12px",
            fontWeight: 500,
            padding: "4px 12px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              display: "inline-block",
              height: "6px",
              width: "6px",
              borderRadius: "9999px",
              backgroundColor: "#171717",
            }}
          />
          Open Source · Free Forever
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={fadeUp}
          style={{
            fontSize: "clamp(36px, 5vw, 56px)",
            fontWeight: 600,
            lineHeight: 1.1,
            letterSpacing: "-1.5px",
            color: "#171717",
            maxWidth: "720px",
          }}
        >
          Your open-source identity,{" "}
          <span style={{ color: "#3ecf8e" }}>beyond GitHub.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          variants={fadeUp}
          style={{
            marginTop: "20px",
            maxWidth: "520px",
            fontSize: "18px",
            lineHeight: 1.6,
            color: "#707070",
          }}
        >
          Sign in once. Get a shareable profile at{" "}
          <span style={{ color: "#171717", fontWeight: 500 }}>
            ossfolio.me/username
          </span>{" "}
          showing your real open-source impact — merged PRs, streaks, orgs,
          badges, and more.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={fadeUp}
          style={{
            marginTop: "32px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
          }}
        >
          <button
            onClick={onGetStarted}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#3ecf8e",
              color: "#171717",
              padding: "10px 20px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              border: "none",
              cursor: "pointer",
            }}
          >
            Get your profile free
            <ArrowRight size={15} />
          </button>
          <a
            href="#how-it-works"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              backgroundColor: "#ffffff",
              color: "#171717",
              padding: "10px 20px",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: 500,
              border: "1px solid #dfdfdf",
              textDecoration: "none",
            }}
          >
            See how it works
          </a>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={fadeUp}
          style={{
            marginTop: "56px",
            paddingTop: "32px",
            borderTop: "1px solid #ededed",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "48px",
            width: "100%",
            maxWidth: "480px",
          }}
        >
          {[
            { value: "10K+", label: "Contributors" },
            { value: "500K+", label: "PRs tracked" },
            { value: "100%", label: "Free & open source" },
          ].map(({ value, label }) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "#171717",
                  letterSpacing: "-0.4px",
                }}
              >
                {value}
              </p>
              <p style={{ marginTop: "2px", fontSize: "13px", color: "#707070" }}>
                {label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
