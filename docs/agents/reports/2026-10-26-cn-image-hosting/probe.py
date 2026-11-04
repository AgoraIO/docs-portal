import concurrent.futures, hashlib, io, json, pathlib, subprocess, time, sys, xml.etree.ElementTree as ET
from datetime import datetime, timezone
from urllib.parse import urlsplit, urlunsplit
from PIL import Image
base=pathlib.Path('.agent/artifacts/cn-image-hosting-20261026')
inv=json.loads((base/(sys.argv[1] if len(sys.argv)>1 else 'inventory.json')).read_text())
output=sys.argv[2] if len(sys.argv)>2 else 'resources'
urls=sorted(set(o['src'] for o in inv['occurrences'] if not o['retired']))
cache=base/'bodies'; cache.mkdir(exist_ok=True)

def check(src):
    key=hashlib.sha256(src.encode()).hexdigest()[:20]
    body=cache/key
    out={'src':src,'checkedAt':datetime.now(timezone.utc).isoformat(),'bodyFile':str(body)}
    if src.startswith(('https://','http://','//')):
        cmd=['curl','--silent','--show-error','--location','--proto','=https,http','--proto-redir','=https,http','--connect-timeout','8','--max-time','25','--max-filesize','26214400','--retry','1','--retry-delay','0','--output',str(body),'--write-out','%{json}',src if not src.startswith('//') else 'https:'+src]
        p=subprocess.run(cmd,capture_output=True,text=True)
        out['curlExit']=p.returncode
        if p.stdout:
            try:
                m=json.loads(p.stdout); out.update(status=m.get('http_code'),finalUrl=m.get('url_effective'),contentType=m.get('content_type'),redirects=m.get('num_redirects'),seconds=m.get('time_total'),remoteIp=m.get('remote_ip'))
            except ValueError: pass
        if p.returncode:
            out.update(result='request-error',error=p.stderr.strip()); return out
        if out.get('status')!=200:
            out['result']='http-error'; return out
    else:
        paths=[pathlib.Path('public')/src.lstrip('/')] if src.startswith('/') else [pathlib.Path(o['file']).parent/src for o in inv['occurrences'] if o['src']==src and not o['retired']]
        out['localCandidates']=[str(p) for p in paths]
        if not paths or not all(p.is_file() for p in paths):
            out['result']='local-missing'; return out
        body.write_bytes(paths[0].read_bytes());out['status']='local-file'
    data=body.read_bytes();out.update(bytes=len(data),sha256=hashlib.sha256(data).hexdigest())
    try:
        if b'<svg' in data[:4096]:
            root=ET.fromstring(data)
            if root.tag.split('}')[-1]!='svg': raise ValueError('XML root is not SVG')
            out.update(result='svg-xml-valid',format='SVG',width=root.get('width'),height=root.get('height'),viewBox=root.get('viewBox'))
            refs=[v for n in root.iter() for k,v in n.attrib.items() if k.split('}')[-1]=='href' and not v.startswith(('#','data:'))]
            out['externalSvgReferences']=[{'url':urlunsplit((*urlsplit(u)[:3], '[redacted]' if urlsplit(u).query else '', '')), 'querySha256':hashlib.sha256(urlsplit(u).query.encode()).hexdigest()} for u in refs]
        else:
            im=Image.open(io.BytesIO(data)); im.verify()
            im=Image.open(io.BytesIO(data));frames=getattr(im,'n_frames',1)
            for f in range(frames): im.seek(f); im.load()
            out.update(result='raster-decoded',format=im.format,width=im.width,height=im.height,frames=frames)
    except Exception as e: out.update(result='content-error',error=str(e))
    return out

start=time.time(); results=[]
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
    for item in pool.map(check,urls):
        results.append(item)
        if len(results)%50==0: print(f'{len(results)}/{len(urls)} checked in {time.time()-start:.1f}s',flush=True)
        (base/(output+'.partial.json')).write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
(base/(output+'.json')).write_text(json.dumps(results,ensure_ascii=False,indent=2)+'\n')
counts={k:sum(r['result']==k for r in results) for k in sorted(set(r['result'] for r in results))}
print(json.dumps({'total':len(results),'results':counts,'seconds':time.time()-start},ensure_ascii=False),flush=True)
