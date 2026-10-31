import {readdir,readFile,lstat} from 'node:fs/promises';
import {join,relative} from 'node:path';
const root=process.cwd(),findings=[];
const skip=new Set(['node_modules','.git']);
const patterns=[
 ['credential',/\b(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
 ['private-key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
 ['private-path',new RegExp('/'+'Users'+'/[^/\s]+|C:'+String.fromCharCode(92).repeat(4)+'Users')],
 ['email',/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i],
 ['assigned-secret',/(?:api[_-]?key|password|access[_-]?token)\s*[:=]\s*["'][A-Za-z0-9_/-]{12,}["']/i]
];
async function walk(dir){for(const name of await readdir(dir)){
 if(skip.has(name))continue;
 const path=join(dir,name),rel=relative(root,path),stat=await lstat(path);
 if(stat.isSymbolicLink()){findings.push([rel,'unexpected symlink']);continue;}
 if(/^(?:\.env(?:\..*)?|credentials.*)$|\.(?:pem|key|p12)$/i.test(name))findings.push([rel,'forbidden filename']);
 if(stat.isDirectory()){if(['server','data','runtime','voice','work'].includes(name))findings.push([rel,'private directory']);await walk(path);}
 else if(!/\.(?:woff2?|png|jpe?g|ico|zip)$/.test(name)){
  const content=await readFile(path,'utf8');
  for(const [label,pattern] of patterns)if(pattern.test(content))findings.push([rel,label]);
  if(rel.startsWith('src/')&&/fetch\s*\(|XMLHttpRequest|new WebSocket|sendBeacon|getUserMedia|https?:\/\//.test(content))findings.push([rel,'network or recording capability']);
 }
}}
await walk(root);
if(findings.length){console.error('Public audit FAILED (values withheld):',JSON.stringify(findings));process.exit(1);}
console.log('Public audit PASS: source and build scanned; no credential, contact, private path, backend, network call or recording findings.');
