#!/usr/bin/env python3
"""Read-only retrieval/link smoke checks; content correctness stays not_reviewed."""
import argparse, concurrent.futures, datetime, json, pathlib, urllib.parse, urllib.request

parser = argparse.ArgumentParser()
parser.add_argument('--base', required=True)
parser.add_argument('--out', required=True)
args = parser.parse_args()
base = args.base.rstrip('/')
if urllib.parse.urlparse(base).scheme != 'https':
    parser.error('Use an HTTPS staging origin')
opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))

def fetch(path):
    request = urllib.request.Request(base + path, headers={'Accept': 'application/json', 'User-Agent': 'docs-p0-quality-smoke/1'})
    with opener.open(request, timeout=30) as response:
        return response.status, response.read().decode(), response.geturl()

release = json.loads(fetch('/__docs-release.json')[1])
cases = json.loads((pathlib.Path(__file__).parent / 'quality-cases.json').read_text())

def check(case):
    params = {'q': case['query'], 'page': 1, 'type': 'all', **case['filters']}
    result = {'id': case['id'], 'task': case['task'], 'query': case['query'], 'filters': case['filters'],
              'release': release['revision'], 'content_review': 'not_reviewed', 'reviewer': None,
              'severity_if_wrong': case['severity_if_wrong']}
    try:
        _, body, _ = fetch('/api/search?' + urllib.parse.urlencode(params))
        data = json.loads(body)
        groups = data['groups']
        top = groups[:3]
        result['total_hits'] = data['totalHits']
        result['filter_consistency'] = {}
        for field in ['product', 'platform', 'version']:
            wanted = case['filters'].get(field)
            if not wanted:
                continue
            mismatches, unknown = [], 0
            for group in groups:
                values = group.get(field)
                if field == 'product':
                    values = list({group.get('product'), *(p for section in group['sections'] for p in section.get('products', []))} - {None, ''})
                elif not isinstance(values, list):
                    values = [values] if values else []
                if not values:
                    unknown += 1
                elif wanted not in values:
                    mismatches.append({'url': group['pageUrl'], 'observed': values})
            result['filter_consistency'][field] = {'mismatches': mismatches, 'generic_or_unknown': unknown}
        filter_consistent = all(not item['mismatches'] for item in result['filter_consistency'].values())
        if case['id'] == 'CN-P0-20':
            filter_consistent = filter_consistent and all(item['generic_or_unknown'] == 0 for item in result['filter_consistency'].values())
        result['filter_consistent'] = filter_consistent
        result['top_three'] = [{'rank': i + 1, 'title': g['title'], 'url': g['pageUrl'],
                              'product': g.get('product'), 'platform': g.get('platform'), 'version': g.get('version'),
                              'sections': [{'title': s.get('sectionTitle'), 'url': s['url']} for s in g['sections'][:5]]}
                             for i, g in enumerate(top)]
        topic = case['expected_topic']
        anchor = case['expected_anchor']
        relevant = [g for g in top if not topic or topic in g['pageUrl'] or g.get('product') == topic]
        result['expected_empty_observed'] = (len(groups) == 0) == case['expected_empty']
        result['expected_topic_in_top_three'] = bool(relevant) if not case['expected_empty'] else None
        targets = [s['url'] for g in relevant for s in g['sections']
                   if not anchor or urllib.parse.unquote(s['url']).lower().endswith('#' + anchor)]
        result['expected_anchor_in_top_three'] = bool(targets) if anchor else None
        if not targets and relevant and not anchor:
            targets = [relevant[0]['pageUrl']]
        if targets:
            target = targets[0]
            parsed = urllib.parse.urlparse(target)
            if parsed.netloc or not parsed.path.startswith('/zh-CN/'):
                raise ValueError('Search result leaves the expected docs origin')
            status, html, final = fetch(parsed.path)
            if urllib.parse.urlparse(final).netloc != urllib.parse.urlparse(base).netloc or not urllib.parse.urlparse(final).path.startswith('/zh-CN/'):
                raise ValueError('Target redirects outside the Chinese docs origin')
            result['target'] = target
            result['target_status'] = status
            result['target_anchor_exists'] = (('id="' + urllib.parse.unquote(parsed.fragment) + '"') in html) if parsed.fragment else None
            result['target_final_path'] = urllib.parse.urlparse(final).path
        checks = [result['expected_empty_observed'], filter_consistent]
        if not case['expected_empty']:
            checks.append(result['expected_topic_in_top_three'])
            if anchor:
                checks += [result['expected_anchor_in_top_three'], result.get('target_anchor_exists', False)]
            checks.append(result.get('target_status') == 200)
        result['retrieval_smoke'] = 'pass' if all(checks) else 'needs_review'
    except Exception as error:
        result['retrieval_smoke'] = 'error'
        result['error'] = str(error)
    return result

with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
    results = list(pool.map(check, cases))
receipt = {'checked_at': datetime.datetime.now(datetime.timezone.utc).isoformat(),
           'environment': 'staging', 'origin': base, 'release': release,
           'scope': 'API retrieval and server-rendered target anchors only; SDK correctness unreviewed',
           'summary': {state: sum(r['retrieval_smoke'] == state for r in results)
                       for state in ['pass', 'needs_review', 'error']}, 'cases': results}
pathlib.Path(args.out).write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(receipt['summary'], ensure_ascii=False))
