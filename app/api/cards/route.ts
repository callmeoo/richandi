import {identity,db,initialize,toCard,one,json,failure,body,ApiError,type Row} from '@/lib/storage';
import {createSchema,updateSchema,removeSchema} from '@/lib/validation';
import {quickEntrySeed} from '@/lib/knowledge';
export const dynamic='force-dynamic';
export async function GET(){try{const user=await identity();await initialize(user);const rows=await db().prepare('SELECT * FROM cards WHERE user_id=? ORDER BY created_at DESC,id').bind(user).all<Row>();return json({cards:rows.results.map(toCard),serverTime:Date.now()})}catch(e){return failure(e)}}
export async function POST(req: Request) {
  try {
    const user = await identity(req);
    const data = createSchema.parse(await body(req));
    const curated = quickEntrySeed(data.content);
    if (curated) {
      await initialize(user);
      const existing = await db().prepare("SELECT * FROM cards WHERE user_id=? AND lower(json_extract(content,'$.en'))=lower(?) ORDER BY created_at LIMIT 1").bind(user, curated.en).first<Row>();
      if (existing) return json({ card: toCard(existing), reused: true });
    }
    const now = Date.now();
    await db().prepare('INSERT OR IGNORE INTO cards (id,user_id,content,created_at,updated_at,next_review) VALUES (?,?,?,?,?,?)').bind(data.id,user,JSON.stringify(curated || data.content),now,now,now).run();
    return json({ card: await one(user, data.id) }, 201);
  } catch (e) { return failure(e); }
}
export async function PUT(req:Request){try{const user=await identity(req);const data=updateSchema.parse(await body(req));const r=await db().prepare('UPDATE cards SET content=?,updated_at=?,version=version+1 WHERE user_id=? AND id=? AND version=?').bind(JSON.stringify(data.content),Date.now(),user,data.id,data.version).run();if(!r.meta.changes)throw new ApiError(409,'卡片已在另一处更新，请先复制修改内容，关闭后刷新卡片再编辑');return json({card:await one(user,data.id)})}catch(e){return failure(e)}}
export async function DELETE(req:Request){try{const user=await identity(req);const data=removeSchema.parse(await body(req));const r=await db().prepare('DELETE FROM cards WHERE user_id=? AND id=? AND version=?').bind(user,data.id,data.version).run();if(!r.meta.changes)throw new ApiError(409,'卡片已更新，请刷新后重试');return json({ok:true})}catch(e){return failure(e)}}
