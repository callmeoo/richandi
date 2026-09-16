import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const browser=await chromium.launch({headless:true,channel:'chrome'});
try {
  const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  const desktop=await browser.newContext({viewport:{width:1440,height:1000}});
  const phone=await mobile.newPage(),computer=await desktop.newPage();
  const base='http://localhost:5173';
  await Promise.all([phone.goto(base+'/signin-with-chatgpt?return_to=%2F'),computer.goto(base+'/signin-with-chatgpt?return_to=%2F')]);
  await Promise.all([phone.locator('.knowledge-card').first().waitFor(),computer.locator('.knowledge-card').first().waitFor()]);
  const before=(await (await mobile.request.get(base+'/api/cards')).json()).cards;
  await phone.getByRole('button',{name:'随手记',exact:true}).click();
  await phone.getByLabel('中文 / 随手记').fill('MPV');
  await phone.getByText('已匹配：MPV · 多用途汽车。保存后可直接学习和复习。').waitFor();
  await phone.getByRole('button',{name:'保存知识卡',exact:true}).click();
  const detail=phone.getByRole('dialog',{name:'多用途汽车'});
  await detail.waitFor();
  assert((await detail.innerText()).includes('Multi-Purpose Vehicle'));
  assert((await detail.innerText()).includes('MPV 的英文全称是什么'));
  const after=(await (await mobile.request.get(base+'/api/cards')).json()).cards;
  assert.equal(after.length,before.length,'Exact known term must reuse existing card');
  const mpv=after.find(c=>c.en==='Multi-Purpose Vehicle');assert(mpv);
  await phone.keyboard.press('Escape');
  await phone.clock.install({time:new Date(Date.now()+25*3600000)});
  await phone.reload();await phone.locator('.knowledge-card').first().waitFor();
  await phone.locator('.mobile-nav').getByRole('button',{name:'今日复习',exact:true}).click();
  await phone.locator('.review-info').getByRole('button',{name:/多用途汽车/}).waitFor();
  await phone.getByRole('button',{name:'开始今日复习',exact:true}).click();
  let found=false;
  for(let i=0;i<after.length;i++){
    const text=await phone.locator('.question-card h2').innerText();
    await phone.getByLabel('我的答案').fill('Multi-Purpose Vehicle，强调载人空间，不是所有七座车。');
    await phone.getByRole('button',{name:'查看参考答案',exact:true}).click();
    const isMPV=text.includes('MPV 的英文全称');
    await phone.getByRole('button',{name:isMPV?'还没记住 · Wrong':'记住了 · Correct',exact:true}).click();
    await phone.getByText(/已保存 · 下次复习/).waitFor();
    if(isMPV){found=true;break}
    await phone.getByRole('button',{name:'下一题',exact:true}).click();
  }
  assert(found,'MPV must appear in next-day review');
  const updated=(await (await mobile.request.get(base+'/api/cards')).json()).cards.find(c=>c.id===mpv.id);
  assert.equal(updated.wrong,mpv.wrong+1);assert.equal(updated.lastResult,'wrong');assert.equal(updated.streak,0);
  await computer.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await computer.locator('.side').getByRole('button',{name:/错题本/}).click();
  await computer.getByRole('button',{name:/MPV 多用途汽车/}).waitFor();
  assert.equal(await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  console.log('PASS: mobile MPV input → curated bilingual card without duplicate → simulated next-day review → Wrong recorded → separate desktop session sees wrong card.');
} finally {await browser.close()}
