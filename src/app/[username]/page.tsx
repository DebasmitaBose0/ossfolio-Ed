import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} — OSSfolio`,
    description: `View ${username}'s open-source contribution profile on OSSfolio.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  // TODO: fetch contributor data from Supabase / GitHub API
  if (!username) notFound();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <p className="text-muted-foreground text-sm">
          Profile page for <strong>{username}</strong> — coming soon.
        </p>
      </div>
    </main>
  );
}
