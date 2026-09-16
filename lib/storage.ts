import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {seeds,type Card,type Content} from './knowledge';
export class ApiError extends Error{constructor(public status:number,message:string){super(message)}}
export async function identity(request?:Request){
 const user=await getChatGPTUser(); if(!user)throw new ApiError(401,'登录已过期，请重新登录');
 if(request&&request.method!=='GET') {const origin=request.headers.get('origin'); if(origin&&origin!==new URL(request.url).origin)throw new ApiError(403,'请在应用内提交');}
 return user.userId;
}
export function db(){if(!env.DB)throw new ApiError(503,'知识库暂时无法连接，请稍后重试');return env.DB}
export type Row={id:string;content:string;created_at:number;updated_at:number;correct:number;wrong:number;streak:number;last_review:number|null;next_review:number;last_result:string|null;version:number};
export function toCard(r:Row):Card{return {...JSON.parse(r.content) as Content,id:r.id,createdAt:r.created_at,updatedAt:r.updated_at,correct:r.correct,wrong:r.wrong,streak:r.streak,lastReview:r.last_review,nextReview:r.next_review,lastResult:r.last_result,version:r.version}}
export async function one(user:string,id:string){const r=await db().prepare('SELECT * FROM cards WHERE user_id=? AND id=?').bind(user,id).first<Row>();if(!r)throw new ApiError(404,'这张卡片已被删除');return toCard(r)}
export async function initialize(user:string){
 const database=db(),now=Date.now();
 if(await database.prepare('SELECT user_id FROM libraries WHERE user_id=?').bind(user).first())return;
 await database.batch([...seeds.map((content,i)=>database.prepare('INSERT OR IGNORE INTO cards (id,user_id,content,created_at,updated_at,next_review) SELECT ?,?,?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM libraries WHERE user_id=?)').bind(`seed-${i+1}`,user,JSON.stringify(content),now,now,now,user)),database.prepare('INSERT OR IGNORE INTO libraries (user_id,created_at) VALUES (?,?)').bind(user,now)]);
}
export function json(data:unknown,status=200){return Response.json(data,{status,headers:{'Cache-Control':'private, no-store','Vary':'Cookie','X-Content-Type-Options':'nosniff'}})}
export function failure(error:unknown){if(error instanceof ApiError)return json({error:error.message},error.status);if(error instanceof Error && error.name==='ZodError')return json({error:'内容格式不正确，请检查必填项、长度和链接'},400);if(error instanceof SyntaxError)return json({error:'提交内容无效'},400);console.error('Knowledge API unavailable',error instanceof Error?error.message:'unknown');return json({error:'暂时保存失败，内容已保留，请重试'},503)}
export async function body(request:Request){const raw=await request.text();if(raw.length>70_000)throw new ApiError(413,'内容过长，请分成多张知识卡');return JSON.parse(raw)}
