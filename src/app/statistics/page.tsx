import { AppLayout } from "@/components/app-layout";
import { StatsDashboard } from "@/components/stats-dashboard";

export default function StatisticsPage() {
  return (
    <AppLayout>
      <h1 className="text-3xl font-bold mb-6">Statistics</h1>
      <StatsDashboard />
    </AppLayout>
  );
}
