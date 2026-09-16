'use client';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return <main className="login-page"><section className="login-card"><h1>暂时无法打开知识库</h1><p>请检查网络后重试。已保存的内容仍在云端。</p><button className="primary" onClick={reset}>重新连接</button><p><a href="/auth/sign-in">重新登录</a></p></section></main>;
}
