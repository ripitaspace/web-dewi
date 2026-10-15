import type { Metadata } from "next";
import { ManageBookingClient } from "./manage-booking-client";

export const metadata: Metadata = {
  title: "Kelola Booking — PUSPITA",
  robots: { index: false, follow: false },
};

export default async function ManageBookingPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <ManageBookingClient token={token} />;
}
