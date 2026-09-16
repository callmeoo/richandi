import {identity,db,one,json,failure,body,ApiError} from '@/lib/storage';
import {reviewSchema} from '@/lib/validation';
import {schedule} from '@/lib/scheduling';
import {isLearnable} from '@/lib/knowledge';
export const dynamic='force-dynamic';
export async function POST(req:Request){try{
 const user=await identity(req),data=reviewSchema.parse(await body(req)),database=db();
 const prior=await database.prepare('SELECT card_id,correct FROM reviews WHERE user_id=? AND id=?').bind(user,data.id).first<{card_id:string;correct:number}>();
 if(prior){if(prior.card_id!==data.cardId||prior.correct!==Number(data.correct))throw new ApiError(409,'本次答案已提交，请继续下一题');return json({card:await one(user,data.cardId)})}
 const card=await one(user,data.cardId);if(!isLearnable(card))throw new ApiError(400,'请先补充解释或参考答案');if(card.version!==data.version)throw new ApiError(409,'卡片已在另一设备更新，请重新加载本题');
 const now=Date.now(),next=schedule(card,data.correct,now);
 const result=await database.batch([
 database.prepare('INSERT OR IGNORE INTO reviews (id,user_id,card_id,correct,reviewed_at,mode,response) SELECT ?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM cards WHERE user_id=? AND id=? AND version=?)').bind(data.id,user,data.cardId,Number(data.correct),now,data.mode,data.response,user,data.cardId,data.version),
 database.prepare('UPDATE cards SET correct=correct+?,wrong=wrong+?,streak=?,last_review=?,next_review=?,last_result=?,updated_at=?,version=version+1 WHERE user_id=? AND id=? AND version=? AND EXISTS (SELECT 1 FROM reviews WHERE user_id=? AND id=? AND card_id=? AND correct=?)').bind(Number(data.correct),Number(!data.correct),next.streak,now,next.nextReview,next.lastResult,now,user,data.cardId,data.version,user,data.id,data.cardId,Number(data.correct))
 ]);
 if(!result[1].meta.changes){const saved=await database.prepare('SELECT id FROM reviews WHERE user_id=? AND id=? AND card_id=? AND correct=?').bind(user,data.id,data.cardId,Number(data.correct)).first();if(!saved)throw new ApiError(409,'卡片已更新，请重新加载本题')}
 return json({card:await one(user,data.cardId)});
}catch(e){return failure(e)}}
