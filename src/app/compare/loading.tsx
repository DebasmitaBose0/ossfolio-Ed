import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SkeletonCard } from "@/components/ui/skeleton-card";

export default function CompareLoading() {
  return (
    <>
      <Navbar />
      <main
        style={{
          backgroundColor: "var(--color-canvas)",
          color: "var(--color-ink)",
          minHeight: "100vh",
          transition: "background-color 0.2s ease, color 0.2s ease",
        }}
      >
        <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "56px 20px" }}>
          <header style={{ marginBottom: "32px" }}>
            <div
              style={{
                width: "280px",
                height: "28px",
                backgroundColor: "var(--color-hairline-cool)",
                borderRadius: "6px",
                animation: "sk-pulse 1.5s ease-in-out infinite",
                marginBottom: "8px",
              }}
            />
            <div
              style={{
                width: "400px",
                height: "15px",
                backgroundColor: "var(--color-hairline-cool)",
                borderRadius: "6px",
                animation: "sk-pulse 1.5s ease-in-out infinite",
              }}
            />
          </header>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "24px",
              marginTop: "32px",
            }}
            className="compare-grid"
          >
            <SkeletonCard variant="profile-header" />
            <SkeletonCard variant="profile-header" />
          </div>
        </div>
      </main>
      <Footer />
      <style>{`@keyframes sk-pulse { 0%,100% { opacity: 0.4; } 50% { opacity: 0.8; } }`}</style>
    </>
  );
}
