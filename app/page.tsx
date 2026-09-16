import LearningApp from '@/components/learning-app';
import { requireChatGPTUser } from './chatgpt-auth';
export const dynamic = 'force-dynamic';
export default async function Home() { const user = await requireChatGPTUser('/'); return <LearningApp account={user.displayName} accountKey={user.userId}/>; }
