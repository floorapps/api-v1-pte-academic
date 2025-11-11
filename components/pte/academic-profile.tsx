'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { updateProfile } from '@/lib/auth/profile-actions';
import { useAuth } from '@/lib/auth/auth-client';

// Simple toast implementation
const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.error('Error:', message)
};

interface AcademicProfileProps {
  initialTargetScore?: number;
  initialExamDate?: string;
}

export function AcademicProfile({ initialTargetScore = 65, initialExamDate }: AcademicProfileProps) {
  const { user } = useAuth();
  const [targetScore, setTargetScore] = useState(initialTargetScore?.toString() || '65');
  const [examDate, setExamDate] = useState(initialExamDate || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in to update your profile');
      return;
    }
    
    const formData = new FormData();
    formData.append('name', user.name || user.email.split('@')[0] || 'User');
    formData.append('email', user.email || '');
    formData.append('targetScore', targetScore);
    formData.append('examDate', examDate);
    
    const result = await updateProfile(undefined, formData);
    
    if (result?.success) {
      toast.success(result.success);
    } else {
      toast.error(result?.error || 'Failed to update profile');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Academic Profile</CardTitle>
        <CardDescription>Set your target score and exam date to track your progress</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="targetScore">Target Score</Label>
            <Input
              id="targetScore"
              type="number"
              min="10"
              max="90"
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              placeholder="Enter your target score (10-90)"
            />
            <p className="text-sm text-muted-foreground">Your target PTE score</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="examDate">Exam Date</Label>
            <Input
              id="examDate"
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">Your scheduled exam date</p>
          </div>
          
          <Button type="submit">Update Profile</Button>
        </form>
      </CardContent>
    </Card>
  );
}