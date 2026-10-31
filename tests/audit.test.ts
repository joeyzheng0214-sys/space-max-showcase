import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
test('audit rejects secrets, personal contacts, private paths, env files and outgoing calls',()=>{
 const folder=mkdtempSync(join(tmpdir(),'showcase-audit-'));
 try{
  mkdirSync(join(folder,'src'));
  const samples=[['credential.txt',['sk','-', 'x'.repeat(24)].join(''),'credential'],['contact.txt',['demo.person','@','example.invalid'].join(''),'email'],['path.txt',['','Users','private-person','file'].join('/'),'private-path'],['.env','DEMO=true','forbidden filename'],['src/network.ts',['fet','ch("/endpoint")'].join(''),'network or recording capability']];
  for(const [name,body,label] of samples){
   writeFileSync(join(folder,name),body);
   const out=spawnSync(process.execPath,[resolve('scripts/audit.mjs')],{cwd:folder,encoding:'utf8'});
   assert.equal(out.status,1);assert.ok(out.stderr.includes(label),out.stderr);
   assert.ok(!out.stderr.includes(body));rmSync(join(folder,name));
  }
  assert.equal(spawnSync(process.execPath,[resolve('scripts/audit.mjs')],{cwd:folder}).status,0);
 }finally{rmSync(folder,{recursive:true,force:true});}
});
