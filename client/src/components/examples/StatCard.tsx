import StatCard from '../StatCard';
import { Users, Baby, Stethoscope, Heart } from 'lucide-react';

export default function StatCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <StatCard
        title="Total Families"
        value={125}
        icon={Users}
        status="normal"
        subtitle="Registered households"
      />
      <StatCard
        title="Pregnant Women"
        value={8}
        icon={Baby}
        status="pending"
        subtitle="Require ANC visits"
      />
      <StatCard
        title="Children Under 5"
        value={42}
        icon={Heart}
        status="complete"
        subtitle="Vaccination tracking"
      />
      <StatCard
        title="TB Patients"
        value={3}
        icon={Stethoscope}
        status="warning"
        subtitle="Active cases"
      />
    </div>
  );
}