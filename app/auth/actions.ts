'use server';
import { auth, authReady } from '@/lib/auth/server';
import { redirect } from 'next/navigation';
export type LoginState = { email: string; stage: 'email' | 'code'; error: string; message: string };
export async function login(previous: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get('email') || '').trim().toLowerCase();
  const state: LoginState = { email, stage: previous.email === email ? previous.stage : 'email', error: '', message: '' };
  if (!authReady()) return { ...state, error: '登录服务尚未配置完成，请稍后再试。' };
  if (email !== process.env.OWNER_EMAIL?.trim().toLowerCase()) return { ...state, error: '请使用知识库所有者的邮箱登录。' };
  const otp = String(form.get('otp') || '').trim();
  try {
    if (form.get('intent') === 'send' || !otp) {
      const { error } = await auth().emailOtp.sendVerificationOtp({ email, type: 'sign-in' });
      if (error) return { ...state, error: '验证码暂时发送失败，请稍后重试。' };
      return { email, stage: 'code', error: '', message: '验证码已发到你的邮箱，请查看收件箱或垃圾邮件。' };
    }
    if (!/^\d{6}$/.test(otp)) return { ...state, error: '请输入 6 位邮箱验证码。' };
    const { error } = await auth().signIn.emailOtp({ email, otp });
    if (error) return { ...state, error: '验证码无效或已过期，请重试或重新获取。' };
  } catch {
    return { ...state, error: '登录服务暂时无法连接，请稍后重试。' };
  }
  redirect('/');
}
export async function signOut() {
  await auth().signOut();
  redirect('/auth/sign-in');
}
