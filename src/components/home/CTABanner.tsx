"use client";

import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface CTABannerProps {
  onGetStarted: () => void;
}

export function CTABanner({ onGetStarted }: CTABannerProps) {
  return (
    <section
      style={{
        backgroundColor: "#fafafa",
        borderTop: "1px solid #ededed",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        viewport={{ once: true }}
        style={{
          maxWidth: "72rem",
          margin: "0 auto",
          padding: "80px 20px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(28px, 3.5vw, 36px)",
            fontWeight: 600,
            color: "#171717",
            letterSpacing: "-0.72px",
            lineHeight: 1.15,
            maxWidth: "560px",
          }}
        >
          Ready to share your open-source story?
        </h2>
        <p
          style={{
            marginTop: "16px",
            maxWidth: "420px",
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#707070",
          }}
        >
          It&apos;s free, takes 30 seconds, and your profile is live at
          ossfolio.me/username the moment you sign in.
        </p>
        <div
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
            Get started for free
            <ArrowRight size={15} />
          </button>
          <a
            href="https://github.com/PRODHOSH/ossfolio"
            target="_blank"
            rel="noopener noreferrer"
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
            Star on GitHub
          </a>
        </div>
      </motion.div>
    </section>
  );
}
