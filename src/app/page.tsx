import { getBlogPosts } from "@/modules/cms";
import { LandingClient } from "@/components/landing-client";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  const posts = await getBlogPosts();
  const top3Posts = posts.slice(0, 3);

  return <LandingClient blogPosts={top3Posts} />;
}
