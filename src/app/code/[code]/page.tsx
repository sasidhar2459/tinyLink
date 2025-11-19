import { StatsCard } from "@/components/stats-card";

export default async function StatsPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  return <StatsCard code={code} />;
}
