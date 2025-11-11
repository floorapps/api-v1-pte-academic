import { getUserProfile } from '@/lib/db/queries';
import { AcademicProfile } from '@/components/pte/academic-profile';

export default async function AcademicSettingsPage() {
  const user = await getUserProfile();
  
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Please login to access settings</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Academic Settings</h1>
        <p className="text-muted-foreground">Manage your academic profile and preferences</p>
      </div>

      <AcademicProfile 
        initialTargetScore={user.targetScore ?? 65} 
        initialExamDate={user.examDate ? new Date(user.examDate).toISOString().split('T')[0] : undefined}
      />
    </div>
  );
}