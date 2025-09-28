import DashboardHeader from '../DashboardHeader';
import { AuthProvider } from '@/hooks/use-auth';

export default function DashboardHeaderExample() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <DashboardHeader />
        <div className="p-6">
          <p className="text-muted-foreground">Content below header...</p>
        </div>
      </div>
    </AuthProvider>
  );
}