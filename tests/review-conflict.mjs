import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
 const context=await browser.newContext({viewport:{width:390,height:844}});
 const page=await context.newPage(),base='http://localhost:5173';
 await page.goto(base+'/signin-with-chatgpt?return_to=%2F');await page.locator('.knowledge-card').first().waitFor();
 await page.locator('.mobile-nav').getByRole('button',{name:'随机考试',exact:true}).click();
 await page.getByRole('button',{name:'开始随机考试',exact:true}).click();
 const question=await page.locator('.question-card h2').innerText();
 const cards=(await (await context.request.get(base+'/api/cards')).json()).cards;
 const card=cards.find(c=>(c.question||`请解释「${c.zh||c.en}」，并举一个业务例子。`)===question);assert(card);
 await page.getByLabel('我的答案').fill('这份答案必须保留');
 await page.getByRole('button',{name:'查看参考答案',exact:true}).click();
 const edit=await context.request.put(base+'/api/cards',{data:{id:card.id,version:card.version,content:card}});assert.equal(edit.status(),200);
 await page.getByRole('button',{name:'记住了 · Correct',exact:true}).click();
 await page.getByRole('button',{name:'保留答案，重新加载本题',exact:true}).click();
 assert.equal(await page.getByLabel('我的答案').inputValue(),'这份答案必须保留');
 await page.getByRole('button',{name:'记住了 · Correct',exact:true}).click();await page.getByText(/已保存 · 下次复习/).waitFor();
 await page.getByRole('button',{name:'下一题',exact:true}).click();
 await page.getByRole('button',{name:'查看参考答案',exact:true}).click();
 await page.route('**/api/reviews',route=>route.fulfill({status:404,contentType:'application/json',body:JSON.stringify({error:'这张卡片已被删除'})}));
 await page.getByRole('button',{name:'记住了 · Correct',exact:true}).click();
 await page.getByRole('button',{name:'跳过已删除的卡片',exact:true}).click();
 await page.getByRole('button',{name:'查看参考答案',exact:true}).waitFor();
 console.log('PASS: concurrent edit conflict reloads current question, retains answer and saves once; missing card can be skipped.');
} finally {await browser.close()}
