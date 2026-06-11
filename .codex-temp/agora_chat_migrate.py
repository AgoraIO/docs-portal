#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import shutil
from pathlib import Path


SOURCE_ROOT = Path('/Users/yangyixuan/Documents/GitHub/Doc-Source-Private')
PRODUCT_ROOT = SOURCE_ROOT / 'agora-chat'
ASSET_ROOT = SOURCE_ROOT / 'assets' / 'images' / 'chat'
PORTAL_ROOT = Path('/Users/yangyixuan/Documents/GitHub/docs-portal')
TEMP_OUT = PORTAL_ROOT / '.codex-temp' / 'agora-chat-im-tree'
TEMP_IMG = TEMP_OUT / '_images'


GLOBAL_VARS = {
    'COMPANY': 'Agora',
    'CONSOLE': 'Agora Console',
    'CHAT': 'Chat',
    'CHAT_SERVER': 'Chat',
    'CHAT_SDK': 'Chat SDK',
    'GET_STARTED': 'SDK quickstart',
    'AUDIO': 'Voice Calling',
    'VIDEO': 'Video Calling',
    'BS': 'Broadcast Streaming',
    'ILS': 'Interactive Live Streaming',
    'ENGINE': 'Agora Engine',
    'AGORA_CONSOLE_URL': 'https://console.agora.io/v2',
    'CHAT_SDK_API_WEB': 'https://api-ref.agora.io/en/chat-sdk/web/1.x',
}

PRODUCT_VARS = {
    'agora-chat': {
        'NAME': 'Chat',
        'PATH': 'agora-chat',
        'SDK': 'Chat SDK',
        'PRODUCT': 'Peer-to-Peer Messaging',
        'IOS_PACKAGE_NAME': 'AgoraChat_iOS',
        'SDK_LITE': 'Lite SDK',
        'STREAM': 'peer-to-peer, group, and chat room messaging',
        'MEDIA': 'messages',
        'MEDIA_DEVICES': 'client devices',
    }
}

PLATFORM_VARS = {
    'android': {'NAME': 'Android', 'PATH': 'android', 'CLIENT': 'app'},
    'ios': {'NAME': 'iOS', 'PATH': 'ios', 'CLIENT': 'app'},
    'web': {'NAME': 'Web', 'PATH': 'web', 'CLIENT': 'app'},
    'flutter': {'NAME': 'Flutter', 'PATH': 'flutter', 'CLIENT': 'app'},
    'react-native': {'NAME': 'React Native', 'PATH': 'react-native', 'CLIENT': 'app'},
    'unity': {'NAME': 'Unity', 'PATH': 'unity', 'CLIENT': 'game'},
    'windows': {'NAME': 'Windows', 'PATH': 'windows', 'CLIENT': 'app'},
    'macos': {'NAME': 'macOS', 'PATH': 'macos', 'CLIENT': 'app'},
    'electron': {'NAME': 'Electron', 'PATH': 'electron', 'CLIENT': 'app'},
}

SECTION_ORDER = [
    'overview',
    'get-started',
    'develop',
    'client-api',
    'restful-api',
    'agora-console',
    'reference',
]

SHARED_STUBS = {
    '@docs/shared/common/not-available.mdx': '**This feature guide is not available yet.**',
    '@docs/shared/common/feature-not-supported.mdx': '**This feature is not supported for this platform.**',
}

SECTION_MAP = {
    'overview': 'overview',
    'get-started': 'get-started',
    'develop': 'develop',
    'client-api': 'client-api',
    'reference': 'reference',
    'restful-api': 'restful-api',
    'agora-console': 'agora-console',
}

PAGE_OVERRIDES = {
    'overview/product-overview': '',
}


def read_text(path: Path) -> str:
    return path.read_text(encoding='utf-8')


def parse_frontmatter(text: str) -> tuple[dict[str, object], str]:
    if not text.startswith('---\n'):
        return {}, text
    end = text.find('\n---\n', 4)
    if end == -1:
        return {}, text
    frontmatter_raw = text[4:end]
    body = text[end + 5 :]
    data: dict[str, object] = {}
    current_key: str | None = None
    for line in frontmatter_raw.splitlines():
        if not line.strip():
            continue
        if line.startswith('  ') and current_key:
            prev = str(data.get(current_key, ''))
            data[current_key] = (prev + ' ' + line.strip()).strip()
            continue
        if ':' not in line:
            continue
        key, value = line.split(':', 1)
        key = key.strip()
        value = value.strip()
        current_key = key
        if value == '>':
            data[key] = ''
            continue
        if value.startswith('[') and value.endswith(']'):
            items = [item.strip().strip('"\'') for item in value[1:-1].split(',') if item.strip()]
            data[key] = items
        elif value.lower() in ('true', 'false'):
            data[key] = value.lower() == 'true'
        elif value.startswith(("'", '"')) and value.endswith(("'", '"')):
            data[key] = value[1:-1]
        else:
            data[key] = value
    return data, body


def normalize_wrapper_attributes(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        attr = match.group(1)
        values = [v.strip().strip('\'"') for v in match.group(2).split(',') if v.strip()]
        return f'{attr}="{",".join(values)}"'

    return re.sub(r'(platform|notAllowed|product)=\{?\[([^\]]+)\]\}?', repl, text)


def resolve_global_vars(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        return GLOBAL_VARS.get(match.group(1), match.group(0))

    return re.sub(r'<Vg\s+k\s*=\s*"([^"]+)"\s*/?>', repl, text)


def resolve_product_vars(text: str, product: str = 'agora-chat') -> str:
    product_vars = PRODUCT_VARS[product]

    def repl(match: re.Match[str]) -> str:
        key = match.group(1)
        if key in product_vars:
            return str(product_vars[key])
        fallback = {
            'NAME': 'Chat',
            'SDK': 'Chat SDK',
            'PRODUCT': 'Peer-to-Peer Messaging',
        }
        return fallback.get(key, '')

    return re.sub(r'<Vpd\s+k\s*=\s*"([^"]+)"\s*/?>', repl, text)


def resolve_platform_vars(text: str, platform: str = 'web') -> str:
    platform_vars = PLATFORM_VARS.get(platform, PLATFORM_VARS['web'])

    def repl(match: re.Match[str]) -> str:
        key = match.group(1)
        if key in platform_vars:
            return str(platform_vars[key])
        fallback = {'CLIENT': 'app', 'NAME': platform_label(platform)}
        return fallback.get(key, '')

    return re.sub(r'<Vpl\s+k\s*=\s*"([^"]+)"\s*/?>', repl, text)


def platform_label(slug: str) -> str:
    return PLATFORM_VARS.get(slug, {}).get('NAME', slug.replace('-', ' ').title())


def resolve_platform_wrappers(text: str) -> str:
    text = normalize_wrapper_attributes(text)

    pattern = re.compile(r'<PlatformWrapper\s+([^>]*?)>(.*?)</PlatformWrapper>', re.DOTALL)
    while True:
        match = pattern.search(text)
        if not match:
            break
        attrs = match.group(1)
        content = match.group(2).strip()
        include = []
        label = 'Platforms'
        m_platform = re.search(r'platform="([^"]+)"', attrs)
        m_not = re.search(r'notAllowed="([^"]+)"', attrs)
        if m_platform:
            include = [p.strip() for p in m_platform.group(1).split(',') if p.strip()]
            label = ', '.join(platform_label(p) for p in include)
        elif m_not:
            exclude = {p.strip() for p in m_not.group(1).split(',') if p.strip()}
            include = [p for p in PLATFORM_VARS if p not in exclude]
            label = f"All except {', '.join(platform_label(p) for p in exclude)}"
        block = f'### {label}\n\n{content}\n'
        text = text[: match.start()] + block + text[match.end() :]
    return text


def resolve_product_wrappers(text: str) -> str:
    text = normalize_wrapper_attributes(text)
    pattern = re.compile(r'<ProductWrapper\s+([^>]*?)>(.*?)</ProductWrapper>', re.DOTALL)
    while True:
        match = pattern.search(text)
        if not match:
            break
        text = text[: match.start()] + match.group(2).strip() + '\n' + text[match.end() :]
    return text


def resolve_link_tags(text: str) -> str:
    def global_link(match: re.Match[str]) -> str:
        key = match.group(1)
        suffix = match.group(2) or ''
        label = clean_inline(match.group(3).strip())
        base = GLOBAL_VARS.get(key, '')
        url = f'{base}{suffix}'
        if url.startswith('console.agora.io'):
            url = f'https://{url}'
        elif url and not url.startswith('http'):
            url = f'https://{url}'
        return f'[{label}]({url})'

    text = re.sub(
        r'<Link\s+[^>]*to\s*=\s*"\{\{(?:Global|global)\.([^"}]+)}}([^"]*)"\s*>(.*?)</Link>',
        global_link,
        text,
        flags=re.DOTALL,
    )

    def normal_link(match: re.Match[str]) -> str:
        target = match.group(1).strip()
        label = clean_inline(match.group(2).strip())
        return f'[{label}]({target})'

    text = re.sub(r'<Link\s+[^>]*to\s*=\s*"([^"]+)"[^>]*>(.*?)</Link>', normal_link, text, flags=re.DOTALL)
    return text


def resolve_admonitions(text: str) -> str:
    def repl(match: re.Match[str]) -> str:
        admon_type = match.group(1).strip()
        body = match.group(2).strip()
        mapping = {'info': 'info', 'caution': 'warning', 'warning': 'warning', 'danger': 'error', 'tip': 'tip'}
        out_type = mapping.get(admon_type, 'info')
        return f':::${out_type}\n{body}\n:::'.replace('$', '')

    return re.sub(r'<Admonition\s+type="([^"]+)"[^>]*>(.*?)</Admonition>', repl, text, flags=re.DOTALL)


def resolve_codeblocks(text: str) -> str:
    def wrapped(match: re.Match[str]) -> str:
        lang = match.group(1) or 'text'
        code = match.group(2)
        return f'```{lang}\n{code.strip()}\n```'

    def raw(match: re.Match[str]) -> str:
        lang = match.group(1) or 'text'
        code = match.group(2)
        return f'```{lang}\n{code.strip()}\n```'

    text = re.sub(r'<CodeBlock\s+language="([^"]+)"[^>]*>\s*\{`(.*?)`\}\s*</CodeBlock>', wrapped, text, flags=re.DOTALL)
    text = re.sub(r'<CodeBlock\s+language="([^"]+)"[^>]*>(.*?)</CodeBlock>', raw, text, flags=re.DOTALL)
    return text


def resolve_details(text: str) -> str:
    return text.replace('<details>', '').replace('</details>', '')


def clean_inline(text: str) -> str:
    text = resolve_global_vars(text)
    text = resolve_product_vars(text)
    text = resolve_platform_vars(text)
    text = re.sub(r'<[^>]+>', '', text)
    return ' '.join(text.split())


def resolve_product_overview(text: str) -> str:
    m = re.search(r'<ProductOverview\s*(.*?)>(.*?)</ProductOverview>', text, re.DOTALL)
    if not m:
        return text
    attrs = m.group(1)
    inner = m.group(2).strip()
    img = re.search(r'img="([^"]+)"', attrs)
    quick = re.search(r'quickStartLink="([^"]+)"', attrs)
    ui_quick = re.search(r'uiSamplesQuickStartLink="([^"]+)"', attrs)
    auth = re.search(r'authenticationLink="([^"]+)"', attrs)
    api_ref = re.search(r'apiReferenceLink="([^"]+)"', attrs)
    samples = re.search(r'samplesLink="([^"]+)"', attrs)
    features_match = re.search(r'productFeatures=\{\[(.*?)\]\}', attrs, re.DOTALL)

    lines: list[str] = []
    if img:
        lines.append(f'![Agora Chat overview]({img.group(1)})')
        lines.append('')
    body = clean_spacing(inner)
    if body:
        lines.append(body)
        lines.append('')
    lines.append('## Start building with')
    lines.append('')
    if quick:
        lines.append(f'- [SDK quickstart]({quick.group(1)})')
    if ui_quick:
        lines.append(f'- [UI kit quickstart]({ui_quick.group(1)})')
    if auth:
        lines.append(f'- [Authentication]({auth.group(1)})')
    if api_ref:
        lines.append(f'- [API reference]({api_ref.group(1)})')
    if samples:
        lines.append(f'- [Samples and demos]({samples.group(1)})')
    lines.append('')

    if features_match:
        lines.append('## Product features')
        lines.append('')
        features_block = features_match.group(1)
        for title, content in re.findall(r'title:\s*"([^"]+)"\s*,\s*content:\s*"([^"]+)"', features_block):
            lines.append(f'### {title.strip()}')
            lines.append('')
            lines.append(content.strip())
            lines.append('')

    return '\n'.join(lines).strip() + '\n'


def resolve_tabs(text: str) -> str:
    def tab_block(match: re.Match[str]) -> str:
        content = match.group(1)
        items = re.findall(r'<TabItem[^>]*label="([^"]+)"[^>]*>(.*?)</TabItem>', content, re.DOTALL)
        if not items:
            return content
        out: list[str] = []
        for label, body in items:
            out.append(f'### {label}')
            out.append('')
            out.append(body.strip())
            out.append('')
        return '\n'.join(out).strip()

    return re.sub(r'<Tabs[^>]*>(.*?)</Tabs>', tab_block, text, flags=re.DOTALL)


def strip_html(text: str) -> str:
    text = re.sub(r'<img\s+[^>]*src="([^"]+)"[^>]*alt="([^"]*)"[^>]*/?>', r'![\2](\1)', text)
    text = re.sub(r'<a\s+href="([^"]+)"[^>]*>(.*?)</a>', lambda m: f'[{clean_inline(m.group(2))}]({m.group(1)})', text, flags=re.DOTALL)
    text = re.sub(r'<code[^>]*>(.*?)</code>', r'`\1`', text, flags=re.DOTALL)
    text = re.sub(r'<div class="alert info">(.*?)</div>', r':::info\n\1\n:::', text, flags=re.DOTALL)
    text = re.sub(r'<div class="alert warning">(.*?)</div>', r':::warning\n\1\n:::', text, flags=re.DOTALL)
    text = re.sub(r'</?(summary|a name="[^"]+")>', '', text)
    text = re.sub(r'<[^>]+>', '', text)
    return text


def clean_spacing(text: str) -> str:
    text = text.replace('\r\n', '\n')
    text = re.sub(r'^export\s+const\s+.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^import\s+.*$', '', text, flags=re.MULTILINE)
    text = re.sub(r'\n{3,}', '\n\n', text)
    return text.strip()


def resolve_import_target(current_file: Path, import_path: str) -> Path:
    if import_path.startswith('@theme/'):
        stub_path = TEMP_OUT / '_stubs' / re.sub(r'[^A-Za-z0-9_.-]+', '_', import_path)
        stub_path.parent.mkdir(parents=True, exist_ok=True)
        stub_path.write_text('', encoding='utf-8')
        return stub_path
    if import_path in SHARED_STUBS:
        stub_path = TEMP_OUT / '_stubs' / re.sub(r'[^A-Za-z0-9_.-]+', '_', import_path)
        stub_path.parent.mkdir(parents=True, exist_ok=True)
        stub_path.write_text(SHARED_STUBS[import_path], encoding='utf-8')
        return stub_path
    import_path = import_path.replace('@docs', str(SOURCE_ROOT))
    import_path = import_path.replace('@site/data/variables', str(SOURCE_ROOT / 'data' / 'variables'))
    if not os.path.isabs(import_path):
        resolved = (current_file.parent / import_path).resolve()
    else:
        resolved = Path(import_path)
    if resolved.exists():
        return resolved
    stub_path = TEMP_OUT / '_stubs' / re.sub(r'[^A-Za-z0-9_.-]+', '_', str(import_path))
    stub_path.parent.mkdir(parents=True, exist_ok=True)
    stub_path.write_text('', encoding='utf-8')
    return stub_path


def extract_top_level_imports(body: str) -> tuple[list[tuple[str, str]], str]:
    lines = body.splitlines()
    imports: list[tuple[str, str]] = []
    kept_lines: list[str] = []
    idx = 0

    while idx < len(lines):
        line = lines[idx]
        stripped = line.strip()
        if not stripped:
            idx += 1
            continue
        if stripped.startswith('import '):
            match = re.match(r'import\s+([^;]+?)\s+from\s+[\'"]([^\'"]+)[\'"]\s*;', stripped)
            if match:
                imports.append((match.group(1), match.group(2)))
                idx += 1
                continue
        break

    kept_lines = lines[idx:]
    return imports, '\n'.join(kept_lines)


def expand_imports(path: Path, seen: set[Path] | None = None) -> tuple[dict[str, object], str]:
    seen = seen or set()
    if path in seen:
        return {}, ''
    if not path.exists():
        return {}, ''
    seen.add(path)
    text = read_text(path)
    fm, body = parse_frontmatter(text)
    imports, body = extract_top_level_imports(body)
    components: dict[str, str] = {}
    for alias, import_path in imports:
        alias = alias.strip()
        if alias.startswith('* as'):
            continue
        if alias.startswith('{'):
            continue
        target = resolve_import_target(path, import_path)
        _, imported_body = expand_imports(target, seen)
        components[alias] = imported_body

    for alias, imported_body in components.items():
        tag_name = re.escape(alias)
        body = re.sub(
            rf'<{tag_name}\s*([^>/]*?)\/>',
            lambda _m, content=imported_body: content,
            body,
        )
        body = re.sub(
            rf'<{tag_name}\s*([^>]*)>(.*?)</{tag_name}>',
            lambda _m, content=imported_body: content,
            body,
            flags=re.DOTALL,
        )
    return fm, body


def convert_page(source_path: Path) -> tuple[dict[str, object], str]:
    fm, body = expand_imports(source_path)
    body = resolve_product_overview(body)
    body = resolve_tabs(body)
    body = resolve_codeblocks(body)
    body = resolve_admonitions(body)
    body = resolve_details(body)
    body = resolve_platform_wrappers(body)
    body = resolve_product_wrappers(body)
    body = resolve_link_tags(body)
    body = resolve_global_vars(body)
    body = resolve_product_vars(body)
    body = resolve_platform_vars(body)
    body = strip_html(body)
    body = clean_spacing(body)
    return fm, body


def slug_for_source(rel_no_ext: str) -> str:
    if rel_no_ext in PAGE_OVERRIDES:
        return PAGE_OVERRIDES[rel_no_ext]
    return rel_no_ext


def relative_target(rel_no_ext: str) -> Path:
    slug = slug_for_source(rel_no_ext)
    if slug == '':
        return Path('index.md')
    return Path(f'{slug}.md')


def ensure_parent(path: Path) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)


def remap_link_target(current_out: Path, href: str) -> str:
    href = href.strip()
    if href.startswith('http://') or href.startswith('https://') or href.startswith('#') or href.startswith('mailto:'):
        return href
    if href.startswith('/images/'):
        return href.replace('/images/chat/', '/images/im/').replace('/images/common/', '/images/common/')
    if href.startswith('/agora-chat/'):
        target = href[len('/agora-chat/') :]
        target = target.split('#', 1)[0]
        anchor = ''
        if '#' in href:
            anchor = '#' + href.split('#', 1)[1]
        out_target = relative_target(target)
        return os.path.relpath((TEMP_OUT / out_target).resolve(), current_out.parent.resolve()).replace(os.sep, '/') + anchor
    if href.startswith('../') or href.startswith('./'):
        resolved_src = Path(os.path.normpath(str((Path(current_out.as_posix()).parent / href).resolve())))
        # fallback handled later in second pass
        return href
    return href


def second_pass_links(path: Path) -> None:
    text = read_text(path)

    def repl(match: re.Match[str]) -> str:
        label = match.group(1)
        href = match.group(2)
        return f'[{label}]({remap_known_href(path, href)})'

    text = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', repl, text)
    text = text.replace('/images/chat/', '/images/im/')
    text = re.sub(r'\.md\?platform=[^)#]+', '.md', text)
    path.write_text(text, encoding='utf-8')


def remap_known_href(current_out: Path, href: str) -> str:
    href = href.strip()
    href = href.replace('https://docs.agora.io/en/agora-chat/', '/agora-chat/')
    path_part = href
    query = ''
    anchor = ''
    if '#' in path_part:
        path_part, anchor = path_part.split('#', 1)
    if '?' in path_part:
        path_part, query = path_part.split('?', 1)
    if href.startswith('http://') or href.startswith('https://') or href.startswith('#') or href.startswith('mailto:'):
        return href
    if href.startswith('/images/chat/'):
        return href.replace('/images/chat/', '/images/im/')
    if href.startswith('/images/common/'):
        return href
    if path_part.startswith('/agora-chat/'):
        target = relative_target(path_part[len('/agora-chat/') :])
        rel = os.path.relpath((TEMP_OUT / target).resolve(), current_out.parent.resolve()).replace(os.sep, '/')
        if not rel.startswith('.'):
            rel = f'./{rel}'
        suffix = ''
        if query:
            suffix += f'?{query}'
        if anchor:
            suffix += f'#{anchor}'
        return rel + suffix
    if path_part == '/api-reference':
        return '/en/api-reference/im'
    if path_part.startswith('/signaling/'):
        return path_part.replace('/signaling/', '/en/realtime-media/rtm/') + (f'?{query}' if query else '') + (f'#{anchor}' if anchor else '')
    if path_part.startswith('/agora-analytics/'):
        return path_part.replace('/agora-analytics/', '/en/api-reference/analytics/') + (f'?{query}' if query else '') + (f'#{anchor}' if anchor else '')
    if path_part.startswith('/video-calling/'):
        return path_part.replace('/video-calling/', '/en/realtime-media/rtc/') + (f'?{query}' if query else '') + (f'#{anchor}' if anchor else '')
    if path_part.startswith('/cloud-recording/'):
        return path_part.replace('/cloud-recording/', '/en/realtime-media/recording/') + (f'?{query}' if query else '') + (f'#{anchor}' if anchor else '')
    if path_part.startswith('/media-push/'):
        return path_part.replace('/media-push/', '/en/realtime-media/media-push/') + (f'?{query}' if query else '') + (f'#{anchor}' if anchor else '')
    if path_part.startswith('/media-pull/'):
        return path_part.replace('/media-pull/', '/en/realtime-media/media-pull/') + (f'?{query}' if query else '') + (f'#{anchor}' if anchor else '')
    if path_part.startswith('/interactive-whiteboard/'):
        return path_part.replace('/interactive-whiteboard/', '/en/realtime-media/whiteboard/') + (f'?{query}' if query else '') + (f'#{anchor}' if anchor else '')
    if path_part.startswith('/extensions-marketplace/'):
        return path_part.replace('/extensions-marketplace/', '/en/realtime-media/marketplace/') + (f'?{query}' if query else '') + (f'#{anchor}' if anchor else '')
    if path_part.startswith('/help/') or path_part.startswith('/files/'):
        return f'https://docs.agora.io/en{path_part}' + (f'?{query}' if query else '') + (f'#{anchor}' if anchor else '')
    return href


def copy_referenced_images(text: str) -> None:
    for image in re.findall(r'!\[[^\]]*]\((/images/chat/[^)]+)\)', text):
        name = image.split('/images/chat/', 1)[1]
        src = ASSET_ROOT / name
        dst = TEMP_IMG / name
        if src.exists():
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(src, dst)


def build_tree() -> None:
    if TEMP_OUT.exists():
        shutil.rmtree(TEMP_OUT)
    TEMP_OUT.mkdir(parents=True)
    TEMP_IMG.mkdir(parents=True, exist_ok=True)

    pages_by_dir: dict[Path, list[str]] = {}
    child_dirs_by_dir: dict[Path, set[str]] = {}
    top_pages: list[str] = ['index']
    top_dirs: list[tuple[int, str, str]] = []

    for category in PRODUCT_ROOT.rglob('_category_.json'):
        rel = category.relative_to(PRODUCT_ROOT)
        if rel.parent == Path('.') or len(rel.parent.parts) != 1:
            continue
        data = json.loads(read_text(category))
        top_dirs.append((int(data.get('position', 999)), rel.parent.as_posix(), str(data.get('label', rel.parent.name))))

    for source in sorted(PRODUCT_ROOT.rglob('*.mdx')):
        rel = source.relative_to(PRODUCT_ROOT)
        rel_no_ext = rel.as_posix()[:-4]
        fm, body = convert_page(source)
        target = TEMP_OUT / relative_target(rel_no_ext)
        ensure_parent(target)
        title = str(fm.get('title') or rel.stem.replace('-', ' ').title()).strip()
        description = str(fm.get('description') or '').strip()
        if not description:
            description = f'Documentation for {title}.'
        copy_referenced_images(body)
        target.write_text(f"---\ntitle: {json.dumps(title)}\ndescription: {json.dumps(description)}\n---\n\n{body}\n", encoding='utf-8')

        if target.name != 'index.md':
            pages_by_dir.setdefault(target.parent, []).append(target.stem)
        for parent in target.parents:
            if parent == TEMP_OUT:
                break
            grand = parent.parent
            if grand == TEMP_OUT or grand.is_relative_to(TEMP_OUT):
                child_dirs_by_dir.setdefault(grand, set()).add(parent.name)

    for page in TEMP_OUT.rglob('*.md'):
        second_pass_links(page)

    top_dir_map = {name: label for _, name, label in top_dirs}
    ordered_sections = [name for name in SECTION_ORDER if name in top_dir_map]
    root_meta = {
        'title': 'Chat',
        'navScope': {},
        'sidebarIndexTitle': 'Overview',
        'pages': ['index'] + ordered_sections,
    }
    (TEMP_OUT / 'meta.json').write_text(json.dumps(root_meta, indent=2) + '\n', encoding='utf-8')

    for dir_name in ordered_sections:
        label = top_dir_map[dir_name]
        section_dir = TEMP_OUT / dir_name
        section_dir.mkdir(parents=True, exist_ok=True)
        pages = sorted(pages_by_dir.get(section_dir, []))
        pages.extend(sorted(child_dirs_by_dir.get(section_dir, set())))
        meta = {
            'title': label,
            'pages': pages,
        }
        (section_dir / 'meta.json').write_text(json.dumps(meta, indent=2) + '\n', encoding='utf-8')

    nested_categories = sorted([p for p in PRODUCT_ROOT.rglob('_category_.json') if p.relative_to(PRODUCT_ROOT).parent.parts and len(p.relative_to(PRODUCT_ROOT).parent.parts) > 1])
    for category in nested_categories:
        rel_dir = category.relative_to(PRODUCT_ROOT).parent
        data = json.loads(read_text(category))
        out_dir = TEMP_OUT / rel_dir
        out_dir.mkdir(parents=True, exist_ok=True)
        pages = sorted(pages_by_dir.get(out_dir, []))
        pages.extend(sorted(child_dirs_by_dir.get(out_dir, set())))
        meta = {'title': data.get('label', rel_dir.name.replace('-', ' ').title()), 'pages': pages}
        (out_dir / 'meta.json').write_text(json.dumps(meta, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    build_tree()
