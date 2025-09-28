import DashboardLayout from '../DashboardLayout';
import { AuthProvider } from '@/hooks/use-auth';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

export default function DashboardLayoutExample() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DashboardLayout />
      </AuthProvider>
    </QueryClientProvider>
  );
}