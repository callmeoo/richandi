import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = { title:'我的行业知识库｜Industry Learning OS', description:'双语知识卡、每日复习与随机考试。', manifest:'/manifest.webmanifest', icons:{icon:'/favicon.svg',apple:'/icon-192.png'}, appleWebApp:{capable:true,title:'行业知识库',statusBarStyle:'default'} };
export const viewport: Viewport = { width:'device-width',initialScale:1,themeColor:'#28634f',viewportFit:'cover' };
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="zh-CN"><body>{children}</body></html>}
