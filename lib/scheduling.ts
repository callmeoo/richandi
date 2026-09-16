import type { Card } from './knowledge';
import { isLearnable } from './knowledge';
export const DAY=86_400_000;
export function schedule(card:Pick<Card,'streak'>,correct:boolean,now:number){
 const streak=correct?card.streak+1:0;
 const days=[1,3,7,14,30,60,90];
 return {streak,nextReview:now+(correct?days[Math.min(streak-1,days.length-1)]*DAY:10*60_000),lastReview:now,lastResult:correct?'correct':'wrong'};
}
export function weight(c:Card,now:number){return 1+(c.lastResult==='wrong'?8:0)+(now-c.createdAt<7*DAY?4:0)+(c.nextReview<=now?3+Math.min(5,Math.max(0,(now-c.nextReview)/DAY)):0)}
export function reviewQueue(cards:Card[],now=Date.now()){return cards.filter(c=>isLearnable(c)&&c.nextReview<=now).sort((a,b)=>weight(b,now)-weight(a,now))}
export function examQueue(cards:Card[],count=10,random= Math.random,now=Date.now()){
 return cards.filter(isLearnable).map(c=>({c,key:Math.log(Math.max(Number.MIN_VALUE,random()))/weight(c,now)})).sort((a,b)=>b.key-a.key).slice(0,count).map(x=>x.c);
}
