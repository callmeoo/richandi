import { BookOpen } from 'lucide-react';
import LoginForm from '@/components/login-form';
import { authReady } from '@/lib/auth/server';
export const dynamic = 'force-dynamic';
export default function SignIn() {
  return <main className="login-page"><section className="login-card"><div className="brand"><BookOpen /><strong>行业知识库<small>INDUSTRY LEARNING OS</small></strong></div><p className="eyebrow">你的学习空间</p><h1>每天一点，记得更牢。</h1><p>记下工作中的新发现，随时打开复习。手机和电脑登录同一邮箱，即可继续学习。</p><LoginForm ready={authReady()} /><small>知识卡和复习进度会保存到你的云端知识库。</small></section></main>;
}
