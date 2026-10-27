import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMdx from 'remark-mdx';
const { isRetiredCnDocsPath } = await import(path.resolve('src/lib/retired-cn-docs.mjs'));
const root = 'content/docs/zh-CN';
const files = fs.readdirSync(root, { recursive: true }).filter(f => /\.mdx?$/.test(f)).sort();
const parser = unified().use(remarkParse).use(remarkMdx);
const markdownParser = unified().use(remarkParse);
const result = { checkedAt: new Date().toISOString(), gitHead: execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(), files: [], occurrences: [], errors: [], unresolved: [] };
const hash = s => crypto.createHash('sha256').update(s).digest('hex');
for (const file of files) {
  const full = `${root}/${file}`;
  const original = fs.readFileSync(full, 'utf8');
  const text = original.replace(/^---\r?\n[\s\S]*?\r?\n---(?=\r?\n)/, s => s.replace(/[^\n\r]/g,' '));
  const retired = isRetiredCnDocsPath(`zh-CN/${file}`);
  result.files.push({ file: full, sha256: hash(original), retired });
  let tree;
  try { tree = (file.endsWith('.md') ? markdownParser : parser).parse(text); } catch(e) { result.errors.push({file:full, retired, message:e.message}); continue; }
  const definitions = new Map();
  function walk(n, f) { f(n); for(const c of n.children ?? []) walk(c,f); }
  walk(tree,n => { if(n.type==='definition') definitions.set(n.identifier,n.url); });
  function inspect(n, platform = null) {
    const attr = name => n.attributes?.find(a=>a.name===name)?.value;
    if(n.name==='PlatformStructured' || n.name==='PlatformInline') platform=attr('platform');
    let src, kind, alt;
    if(n.type==='image') { src=n.url; alt=n.alt; kind='markdown'; }
    if(n.type==='imageReference') { src=definitions.get(n.identifier); alt=n.alt; kind='reference'; }
    if(['mdxJsxFlowElement','mdxJsxTextElement'].includes(n.type) && (['img','Image','DocsImage','InlineImage','source'].includes(n.name) || n.attributes?.some(a=>a.name==='src'))) {
      src=attr('src'); alt=attr('alt'); kind=n.name;
      if(!['img','Image','DocsImage','InlineImage'].includes(n.name)) result.unresolved.push({file:full,line:n.position.start.line,retired,reason:'other-src-element',name:n.name,src});
    }
    function add(src, kind, alt, position = n.position) {
      if(typeof src!=='string') result.unresolved.push({file:full,line:position.start.line,retired,kind,reason:'nonliteral-or-missing-src',src});
      else {
        let hosting, hostname=null;
        if(/^https?:\/\//.test(src) || src.startsWith('//')) {
          try { const u=new URL(src.startsWith('//')?`https:${src}`:src); hostname=u.hostname;
            hosting=hostname==='assets-docs.agora.io' ? (/^\/(images|img)\//.test(u.pathname)?'designated-cdn':'designated-other-prefix') : 'other-remote';
          } catch { hosting='invalid-url'; }
        } else hosting=src.startsWith('data:')?'data-uri':'local';
        result.occurrences.push({id:`${full}:${position.start.line}:${position.start.column}:${kind}`,file:full,line:position.start.line,column:position.start.column,platform,kind,alt,src,hosting,hostname,retired});
      }
    }
    if(kind && ['markdown','reference','img','Image','DocsImage','InlineImage'].includes(kind)) add(src,kind,alt);
    const imageProps = ['imageSrc','qrCodeSrc','qrSrc','coverSrc','iconSrc','poster'];
    for(const a of n.attributes ?? []) {
      if(imageProps.includes(a.name)) add(a.value,`${n.name}.${a.name}`,attr('title') ?? attr('alt'), a.position ?? n.position);
      const estree = a.value?.data?.estree;
      if(estree) {
        function jsWalk(v) {
          if(!v || typeof v!=='object') return;
          if(v.type==='Property' && [...imageProps,'src'].includes(v.key?.name ?? v.key?.value)) {
            const key=v.key.name ?? v.key.value;
            if(v.value.type==='Literal' && typeof v.value.value==='string') {
              const pos=v.loc ? {start:{line:v.loc.start.line,column:v.loc.start.column+1}} : n.position;
              add(v.value.value,`${n.name}.${a.name}.${key}`,null,pos);
            } else result.unresolved.push({file:full,line:n.position.start.line,retired,reason:'nonliteral-image-property',name:key});
          }
          for(const [key,c] of Object.entries(v)) if(!['loc','position'].includes(key)) {
            if(Array.isArray(c)) c.forEach(jsWalk); else if(c && typeof c==='object') jsWalk(c);
          }
        }
        jsWalk(estree);
      }
    }
    for(const c of n.children ?? []) inspect(c,platform);
  }
  inspect(tree);
}
fs.writeFileSync('.agent/artifacts/cn-image-hosting-20261026/inventory.json',JSON.stringify(result,null,2)+'\n');
const active=result.occurrences.filter(o=>!o.retired);
const count=k=>Object.fromEntries([...new Set(active.map(o=>o[k]))].map(v=>[v,{occurrences:active.filter(o=>o[k]===v).length,unique:new Set(active.filter(o=>o[k]===v).map(o=>o.src)).size}]));
console.log(JSON.stringify({files:result.files.length,activeFiles:result.files.filter(f=>!f.retired).length,filesWithImages:new Set(active.map(o=>o.file)).size,occurrences:active.length,unique:new Set(active.map(o=>o.src)).size,hosting:count('hosting'),hosts:count('hostname'),errors:result.errors,unresolved:result.unresolved},null,2));

// Runtime resources are a separate surface, never counted as Markdown occurrences.
const runtime = [];
const iconFile = 'src/components/docs-overview/platform-icon-src.ts';
const iconSource = fs.readFileSync(iconFile, 'utf8');
const iconBase = iconSource.match(/'https:\/\/[^']+'/)[0].slice(1, -1);
for (const match of iconSource.matchAll(/\$\{platformIconBaseUrl\}\/([\w.-]+\.svg)|https:\/\/doc\.shengwang\.cn\/img\/platforms\/windows\.svg/g)) {
  runtime.push({ src: match[1] ? `${iconBase}/${match[1]}` : match[0], file: iconFile, line: iconSource.slice(0, match.index).split('\n').length, kind: 'runtime-platform-icon', retired: false });
}
const qrFile = 'src/components/docs-overview/KtvDownloadResources.tsx';
const qrSource = fs.readFileSync(qrFile, 'utf8');
for (const match of qrSource.matchAll(/qrSrc: '([^']+)'/g)) {
  runtime.push({ src: match[1], file: qrFile, line: qrSource.slice(0, match.index).split('\n').length, kind: 'runtime-ktv-qr', retired: false });
}
fs.writeFileSync('.agent/artifacts/cn-image-hosting-20261026/runtime-inventory.json', JSON.stringify({ occurrences: runtime }, null, 2) + '\n');
