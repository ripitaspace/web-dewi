import { getBlogPosts } from "@/modules/cms";
import { LandingClient } from "@/components/landing-client";

export const revalidate = 60; // ISR revalidate every 60s

export default async function Home() {
  const posts = await getBlogPosts();
  const top3Posts = posts.slice(0, 3);

  return <LandingClient blogPosts={top3Posts} />;
}
