import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {initialSchedules,createProposal,applyDecision,demoFatigue,resolveScenario,DEMO_STATES} from '../src/demo/model.ts';
const minutes=(t:string)=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
function continuous(events:ReturnType<typeof initialSchedules>[number]){
 const sorted=[...events].sort((a,b)=>minutes(a.startTime)-minutes(b.startTime));
 assert.equal(sorted[0].startTime,'00:00');assert.equal(sorted.at(-1)?.endTime,'24:00');
 sorted.forEach((e,i)=>{assert.ok(minutes(e.endTime)>minutes(e.startTime));if(i)assert.equal(e.startTime,sorted[i-1].endTime);});
}
test('seven independently cloned fictional days cover 24 hours without overlap',()=>{
 const first=initialSchedules(),second=initialSchedules();assert.equal(Object.keys(first).length,7);
 for(let day=1;day<=7;day++){continuous(first[day]);assert.equal(new Set(first[day].map(e=>e.id)).size,first[day].length);}
 first[1][0].title='Changed';assert.equal(second[1][0].title,'Sleep');assert.equal(first[2][0].title,'Sleep');
});
test('preview is nonmutating; accept swaps intervals; keep original preserves schedule',()=>{
 const schedules=initialSchedules(),before=structuredClone(schedules[3]),proposal=createProposal(schedules[3],3)!;
 assert.deepEqual(schedules[3],before);continuous(proposal.previewEvents);
 const accepted=applyDecision(schedules[3],proposal,'accept');continuous(accepted);
 assert.equal(accepted.find(e=>e.title==='Scientific experiment')?.startTime,'09:00');assert.ok(accepted.every(e=>!e.proposed));
 assert.deepEqual(applyDecision(schedules[3],proposal,'reject').map(({proposed,...e})=>e),before);
 assert.equal(createProposal(accepted,3),null);assert.equal(schedules[4].find(e=>e.title==='Scientific experiment')?.startTime,'08:00');
 assert.equal(initialSchedules()[3].find(e=>e.title==='Scientific experiment')?.startTime,'08:00');
});
test('all fatigue readings are explicit synthetic hourly values',()=>{
 for(let d=1;d<=7;d++)for(let h=0;h<24;h++){const r=demoFatigue(d,h);if(h<6||h>=22){assert.equal(r.level,'Sleeping');assert.equal(r.value,null);}else assert.ok(typeof r.value==='number'&&r.value>=0&&r.value<=100);}
 assert.notDeepEqual(demoFatigue(1,8),demoFatigue(7,8));assert.notDeepEqual(demoFatigue(3,8),demoFatigue(3,18));
});
test('arbitrary input selects fixed presets and all four particle states exist',()=>{
 assert.equal(resolveScenario('random text').id,'briefing');assert.equal(resolveScenario('I feel tired').id,'recovery');assert.equal(resolveScenario('Move the experiment').id,'adjust');
 assert.deepEqual(DEMO_STATES,['idle','listening','thinking','speaking']);
});
test('no live connection, storage, recording or server imports in showcase app',()=>{
 for(const file of ['src/ShowcaseApp.tsx','src/demo/model.ts','src/main.tsx','src/components/agent/IntegratedAnimation.tsx']){
  const source=readFileSync(file,'utf8');assert.doesNotMatch(source,/fetch\s*\(|XMLHttpRequest|WebSocket|EventSource|sendBeacon|getUserMedia|localStorage|sessionStorage|server\/|services\//);
 }
 const html=readFileSync('index.html','utf8');assert.ok(html.includes("connect-src 'none'"));assert.ok(html.includes("media-src 'none'"));
 assert.ok(readFileSync('vite.config.ts','utf8').includes("base:'./'"));
});
