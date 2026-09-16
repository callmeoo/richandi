import LearningApp from '@/components/learning-app';
import { requireUser } from '@/lib/auth/server';
export const dynamic = 'force-dynamic';
export default async function Home() { const user = await requireUser(); return <LearningApp account={user.displayName} accountKey={user.userId}/>; }
