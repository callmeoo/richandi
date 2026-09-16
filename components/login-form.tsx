'use client';
import { useActionState } from 'react';
import { login, type LoginState } from '@/app/auth/actions';
export default function LoginForm({ ready }: { ready: boolean }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, { email: '', stage: 'email', error: '', message: '' });
  return <form action={action} className="login-form">
    <label htmlFor="email">你的邮箱</label>
    <input id="email" name="email" type="email" autoComplete="email" placeholder="输入知识库所有者邮箱" required defaultValue={state.email} readOnly={state.stage === 'code'} />
    {state.stage === 'code' && <><label htmlFor="otp">邮箱验证码</label><input id="otp" name="otp" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} placeholder="6 位验证码" /></>}
    {state.message && <p role="status">{state.message}</p>}
    {(state.error || !ready) && <p role="alert" className="wrong-text">{state.error || '登录服务尚未配置完成，请稍后再试。'}</p>}
    <button className="primary" disabled={pending || !ready} name="intent" value={state.stage === 'email' ? 'send' : 'verify'}>{pending ? '请稍候…' : state.stage === 'email' ? '获取登录验证码' : '打开我的知识库'}</button>
    {state.stage === 'code' && <><button className="text-button" name="intent" value="send" formNoValidate disabled={pending}>重新发送验证码</button><a href="/auth/sign-in">换一个邮箱</a></>}
  </form>;
}
