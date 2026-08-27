import type { Metadata } from "next";
import { TrackDetailContent } from "@/components/dashboard/consultations/TrackDetailContent";
import { isTrackCode, TRACKS } from "@/lib/tracks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ track: string }>;
}): Promise<Metadata> {
  const { track } = await params;
  const title = isTrackCode(track) ? TRACKS[track].name : "الاستشارات";
  return { title, robots: { index: false, follow: false } };
}

export default async function TrackPage({ params }: { params: Promise<{ track: string }> }) {
  const { track } = await params;
  return <TrackDetailContent trackParam={track} />;
}
