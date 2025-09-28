import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import DashboardHeader from "./DashboardHeader";
import AlertStrip from "./AlertStrip";
import StatCard from "./StatCard";
import NavigationGrid from "./NavigationGrid";
import QuickActions from "./QuickActions";
import { Users, Baby, Heart, Activity, UserCheck, Stethoscope } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardStats {
  totalFamilies: number;
  totalMembers: number;
  pregnantWomen: number;
  childrenUnder5: number;
  tbPatients: number;
  diabetesPatients: number;
  hypertensionPatients: number;
  seniorCitizens: number;
}

export default function DashboardLayout() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard-stats"],
    enabled: !!user,
  });

  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container mx-auto p-4 space-y-6">
        {/* Alert Strip */}
        <AlertStrip />

        {/* Welcome Section */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold" data-testid="text-welcome-title">
            Welcome, {user?.name || "ASHA Worker"}
          </h2>
          <p className="text-muted-foreground" data-testid="text-welcome-subtitle">
            Village Health Management Dashboard
          </p>
        </div>

        {/* Statistics Cards */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Health Statistics</h3>
          {isLoading ? (
            <StatsSkeleton />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Families"
                value={stats?.totalFamilies || 0}
                icon={Users}
                status="normal"
                subtitle="Registered households"
              />
              <StatCard
                title="Total Members"
                value={stats?.totalMembers || 0}
                icon={UserCheck}
                status="normal"
                subtitle="All family members"
              />
              <StatCard
                title="Pregnant Women"
                value={stats?.pregnantWomen || 0}
                icon={Baby}
                status={stats?.pregnantWomen ? "pending" : "complete"}
                subtitle="Active pregnancies"
              />
              <StatCard
                title="Children Under 5"
                value={stats?.childrenUnder5 || 0}
                icon={Heart}
                status="normal"
                subtitle="Vaccination tracking"
              />
              <StatCard
                title="TB Patients"
                value={stats?.tbPatients || 0}
                icon={Stethoscope}
                status={stats?.tbPatients ? "warning" : "complete"}
                subtitle="Active TB cases"
              />
              <StatCard
                title="Diabetes Patients"
                value={stats?.diabetesPatients || 0}
                icon={Activity}
                status={stats?.diabetesPatients ? "warning" : "complete"}
                subtitle="Monitoring required"
              />
              <StatCard
                title="Hypertension"
                value={stats?.hypertensionPatients || 0}
                icon={Activity}
                status={stats?.hypertensionPatients ? "warning" : "complete"}
                subtitle="Blood pressure monitoring"
              />
              <StatCard
                title="Senior Citizens"
                value={stats?.seniorCitizens || 0}
                icon={Users}
                status="normal"
                subtitle="Age 65+ monitoring"
              />
            </div>
          )}
        </section>

        {/* Navigation Grid */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold">Main Functions</h3>
          <NavigationGrid />
        </section>

        {/* Quick Actions */}
        <section className="space-y-4">
          <h3 className="text-lg font-semibold text-center">Quick Actions</h3>
          <QuickActions
            onAddFamily={() => console.log("Navigate to add family form")}
            onAddPatient={() => console.log("Navigate to add patient form")}
            onScanQR={() => console.log("Open QR scanner")}
          />
        </section>
      </main>
    </div>
  );
}