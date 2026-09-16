'use client';
import {useState,useRef} from 'react';
import {Progress} from '@/components/ui/progress';
import {ArrowRight,Check,X,Volume2,PartyPopper} from 'lucide-react';
import {type Card} from '@/lib/knowledge';
import {api,RequestError} from '@/lib/client';
import {speak,date} from './card-detail';
export default function StudySession({cards,mode,onUpdate,onExit}:{cards:Card[];mode:'review'|'exam';onUpdate:(c:Card)=>void;onExit:()=>void}){
 const [index,setIndex]=useState(0),[revealed,setRevealed]=useState(false),[answer,setAnswer]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[results,setResults]=useState<{card:Card;correct:boolean}[]>([]),[graded,setGraded]=useState<Card|null>(null);
 const [attempt,setAttempt]=useState(()=>crypto.randomUUID()),[decision,setDecision]=useState<boolean|null>(null);const pending=useRef(false);
 const [fresh,setFresh]=useState<Card|null>(null),[errorStatus,setErrorStatus]=useState<number|null>(null),[notice,setNotice]=useState('');
 const card=fresh||cards[index];
 async function grade(correct:boolean){if(pending.current||graded)return;pending.current=true;setBusy(true);setError('');const selectedDecision=decision??correct;setDecision(selectedDecision);try{const data=await api<{card:Card}>('/api/reviews',{method:'POST',body:JSON.stringify({id:attempt,cardId:card.id,version:card.version,correct:selectedDecision,mode,response:answer})});onUpdate(data.card);setResults(r=>[...r,{card:data.card,correct:selectedDecision}]);setGraded(data.card)}catch(e){setError(e instanceof Error?e.message:'保存失败，请重试');setErrorStatus(e instanceof RequestError?e.status:null)}finally{setBusy(false);pending.current=false}}
 async function reloadQuestion(){
   if(pending.current)return;
   pending.current=true;setBusy(true);
   try{
     const data=await api<{cards:Card[]}>('/api/cards');
     const latest=data.cards.find(item=>item.id===card.id);
     if(!latest){setErrorStatus(404);setError('这张卡片已被删除，可以跳过本题。');return}
     setFresh(latest);onUpdate(latest);setAttempt(crypto.randomUUID());setDecision(null);setError('');setErrorStatus(null);setNotice('已载入最新知识卡，你的答案已保留，请重新核对。');
   }catch(e){setError(e instanceof Error?e.message:'重新加载失败，请重试')}
   finally{pending.current=false;setBusy(false)}
 }
 function next(){setFresh(null);setErrorStatus(null);setNotice('');setIndex(i=>i+1);setRevealed(false);setAnswer('');setGraded(null);setError('');setDecision(null);setAttempt(crypto.randomUUID())}
 if(!card)return <div className="session-summary"><PartyPopper size={42}/><p className="eyebrow">SESSION COMPLETE</p><h2>今天，又记牢了一点。</h2><p>本轮 {results.length} 题 · 答对 {results.filter(r=>r.correct).length} 题 · 待巩固 {results.filter(r=>!r.correct).length} 题</p><div className="result-list">{results.map(r=><div key={r.card.id}><span>{r.card.zh||r.card.en}</span><span className={r.correct?'correct-text':'wrong-text'}>{r.correct?'✓ 答对':'↻ 待巩固'}</span></div>)}</div><button className="primary" onClick={onExit}>回到知识库 <ArrowRight size={17}/></button><small>答错内容约 10 分钟后再次到期，已加入错题本。</small></div>;
 return <div className="session"><div className="session-top"><span>{mode==='exam'?'随机考试':'今日复习'} · {index+1} / {cards.length}</span><button className="text-button" onClick={onExit} disabled={busy}>结束本轮</button></div><Progress value={index/cards.length*100} aria-label="本轮进度"/><article className="question-card"><span className="badge">{card.category}</span><p className="eyebrow">{mode==='exam'?'THINK FIRST':'ACTIVE RECALL'}</p><h2>{card.question||`请解释「${card.zh||card.en}」，并举一个业务例子。`}</h2><p className="muted">先在脑中回答，也可以写下来。再查看参考答案。</p><textarea aria-label="我的答案" value={answer} onChange={e=>setAnswer(e.target.value)} placeholder="我的理解是……" rows={4} maxLength={6000} disabled={revealed}/>{!revealed?<button className="primary" onClick={()=>setRevealed(true)}>查看参考答案 <ArrowRight size={17}/></button>:<>{notice&&<p className="quick-entry-hint" role="status">{notice}</p>}<section className="answer-block"><div><strong>参考答案</strong><button className="text-button" onClick={()=>speak(card.en)} disabled={!card.en}><Volume2 size={16}/> 读英文</button></div><p>{card.answer||card.explanation}</p><small>{card.en} {card.ipa}</small>{card.example&&<blockquote>{card.example}</blockquote>}</section>{!graded?<><p className="muted">对照关键点自评；部分正确或不确定，选“还没记住”。</p><div className="grade-actions"><button className="wrong-button" onClick={()=>grade(false)} disabled={busy||decision===true||errorStatus===409||errorStatus===404}><X size={18}/> 还没记住 · Wrong</button><button className="primary" onClick={()=>grade(true)} disabled={busy||decision===false||errorStatus===409||errorStatus===404}><Check size={18}/> 记住了 · Correct</button></div></>:<div className="graded"><span>已保存 · 下次复习 {date(graded.nextReview)}</span><button className="primary" onClick={next}>{index===cards.length-1?'查看本轮结果':'下一题'} <ArrowRight size={17}/></button></div>}{error&&<p role="alert" className="error-message">{error} {errorStatus===409?<button className="text-button" onClick={reloadQuestion} disabled={busy}>保留答案，重新加载本题</button>:errorStatus===404?<button className="text-button" onClick={next} disabled={busy}>跳过已删除的卡片</button>:decision!==null&&<button className="text-button" onClick={()=>grade(decision!)} disabled={busy}>重试保存本次结果</button>}</p>}</>}</article></div>
}
