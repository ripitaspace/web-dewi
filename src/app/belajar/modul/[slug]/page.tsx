import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LearningPlayer } from "@/components/learning/learning-player";
import { getLearningModule, learningCatalog } from "@/modules/learning/catalog";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return learningCatalog.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = getLearningModule((await params).slug);
  return {
    title: lesson
      ? `${lesson.metadata.title} — Belajar PUSPITA`
      : "Modul tidak ditemukan — PUSPITA",
    description: lesson?.metadata.summary,
  };
}

export default async function LearningModulePage({ params }: Props) {
  const { slug } = await params;
  const lesson = getLearningModule(slug);
  if (!lesson) notFound();
  return <LearningPlayer key={lesson.id} module={lesson} slug={slug} />;
}
