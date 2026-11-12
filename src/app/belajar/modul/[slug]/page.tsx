import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearningPlayer } from "@/components/learning/learning-player";
import { getLearningModule, learningCatalog } from "@/modules/learning/catalog";
import { getModuleRegistration } from "@/modules/learning/registry";
import { createPageMetadata } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return learningCatalog.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = getLearningModule((await params).slug);
  return lesson
    ? createPageMetadata({ title: `${lesson.metadata.title} — Belajar`, description: lesson.metadata.summary, path: `/belajar/modul/${(await params).slug}` })
    : { title: "Modul tidak ditemukan" };
}

export default async function LearningModulePage({ params }: Props) {
  const { slug } = await params;
  const lesson = getLearningModule(slug);
  const registration = getModuleRegistration(slug);
  if (!lesson || !registration) notFound();
  return (
    <LearningPlayer
      key={lesson.id}
      module={lesson}
      slug={slug}
      publicCode={registration.publicCode}
    />
  );
}
