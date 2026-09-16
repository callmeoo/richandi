export class RequestError extends Error { constructor(public status: number, message: string) { super(message); } }
export async function api<T>(url:string,options:RequestInit={}):Promise<T>{
 const response=await fetch(url,{...options,headers:{'Content-Type':'application/json',...options.headers},cache:'no-store',signal:AbortSignal.timeout(15000)});
 const data=await response.json().catch(()=>({error:'服务暂时没有响应，请稍后重试'}));
 if(!response.ok)throw new RequestError(response.status,data&&typeof data==='object'&&'error' in data&&typeof data.error==='string'?data.error:'请求失败，请重试');return data as T;
}
