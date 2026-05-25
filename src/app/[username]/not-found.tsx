import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-canvas-night flex items-center justify-center">
      <div className="text-center space-y-4 px-4">
        <p className="text-6xl font-bold text-primary">404</p>
        <h1 className="text-2xl font-semibold text-on-dark">User not found</h1>
        <p className="text-ink-mute max-w-md mx-auto">
          This username does not exist or has not signed up yet.
        </p>
        <div className="flex justify-center gap-4" style={{ marginTop: "28px" }}>
          <Link
            href="/"
            style={{ padding: "10px 28px" }}
            className="inline-flex items-center justify-center min-w-32.5 rounded-md bg-primary text-white text-base font-semibold hover:opacity-90 transition"
          >
            Home
          </Link>
          <Link
            href="/explore"
            style={{ padding: "10px 28px" }}
            className="inline-flex items-center justify-center min-w-32.5 rounded-md border border-white/30 text-on-dark text-base font-semibold hover:opacity-90 transition"
          >
            Explore
          </Link>
        </div>
      </div>
    </main>
  );
}
