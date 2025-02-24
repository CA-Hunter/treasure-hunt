// app/treasures/my-findings/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TreasureList } from '@/components/treasures/treasure_list';
import { useTreasures } from '@/hooks/use-treasure';
import { useSession } from 'next-auth/react';
import { useUserProfile } from '@/hooks/use-user';

export default function MyFindingsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { userFindings, isLoading, error } = useTreasures();
  const { profile } = useUserProfile({ enabled: !!session?.user?.email });

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!session?.user) {
      router.push('/login');
    }
  }, [session, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (error) {
    return <div>Error loading treasures</div>;
  }

  const findingsWithFinder = userFindings?.map(treasure => ({
    ...treasure,
    finder_id: profile?.id
  })) || [];

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">My Found Treasures</h1>
      
      <TreasureList
        treasures={findingsWithFinder}
        showActions={false}
      />
    </div>
  );
}