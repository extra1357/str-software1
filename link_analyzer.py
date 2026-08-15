#!/usr/bin/env python3
"""
STR Software - Analisador de Links Quebrados
==============================================

Verifica links que retornam erro (400, 404, 5xx, timeout etc.) em duas frentes:
  1. Rastreando o site ao vivo (seguindo links internos a partir da home)
  2. Vasculhando o código-fonte local (Next.js) atrás de links "hardcoded"
     (href="...", <Link href="...">, URLs em strings)

Gera um relatório HTML colorido com todos os links quebrados encontrados.

USO:
    python link_analyzer.py --url https://strsoftware.com.br --source "C:\\caminho\\para\\str-software1"

INSTALAÇÃO (uma vez só):
    pip install requests beautifulsoup4

Parâmetros:
    --url          URL base do site a rastrear (obrigatório para o crawler)
    --source       Caminho da pasta do código-fonte a vasculhar (opcional)
    --output       Caminho do relatório HTML de saída (padrão: relatorio_links.html)
    --max-pages    Máximo de páginas a visitar no crawler (padrão: 200)
    --workers      Quantas checagens de link em paralelo (padrão: 10)
    --timeout      Timeout por requisição em segundos (padrão: 10)
    --sitemap      Também tenta ler /sitemap.xml para achar páginas órfãs
"""

import argparse
import os
import re
import sys
import time
import concurrent.futures
from urllib.parse import urljoin, urlparse
from xml.etree import ElementTree

try:
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    print("ERRO: faltam dependências. Rode primeiro:")
    print("    pip install requests beautifulsoup4")
    sys.exit(1)


# ============================================================
# CONFIGURAÇÃO
# ============================================================

DEFAULT_TIMEOUT = 10
DEFAULT_MAX_PAGES = 200
DEFAULT_WORKERS = 10

# Extensões de arquivo de código que serão vasculhadas
SOURCE_EXTENSIONS = {".tsx", ".ts", ".jsx", ".js", ".mdx", ".md"}

# Pastas que nunca devem ser vasculhadas (lixo / dependências / build)
IGNORE_DIRS = {"node_modules", ".next", ".git", "dist", "build", ".vercel", "venv", "__pycache__"}

# Extensões de arquivo estático que, se um link apontar pra elas, não
# tem "página" pra seguir depois (evita o crawler tentar abrir imagem como HTML)
STATIC_FILE_EXT = {
    ".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".ico", ".pdf",
    ".zip", ".rar", ".mp4", ".mp3", ".css", ".js", ".woff", ".woff2", ".ttf"
}

USER_AGENT = "STR-LinkAnalyzer/1.0 (auditoria interna de links)"

# Regex: encontra href="..." tanto em <a> quanto em <Link> do Next.js
HREF_REGEX = re.compile(r'''href\s*=\s*(?:\{)?\s*["'`]([^"'`]+)["'`]''', re.IGNORECASE)

# Regex: encontra URLs absolutas (http/https) soltas dentro de strings no código
# (ex: fetch("https://..."), const url = "https://...")
ABSOLUTE_URL_REGEX = re.compile(r'''["'`](https?://[^\s"'`]+)["'`]''')


# ============================================================
# FUNÇÕES AUXILIARES
# ============================================================

def normalize_url(raw_url, base_url):
    """Resolve uma URL relativa/absoluta contra uma base e remove fragmento (#)."""
    raw_url = raw_url.strip()
    if not raw_url:
        return None
    if raw_url.startswith(("mailto:", "tel:", "javascript:", "data:", "#")):
        return None
    try:
        absolute = urljoin(base_url, raw_url)
    except ValueError:
        return None
    absolute = absolute.split("#")[0]
    if not absolute.startswith(("http://", "https://")):
        return None
    return absolute


def is_internal(url, base_domain):
    return urlparse(url).netloc == base_domain


def is_static_file(url):
    path = urlparse(url).path.lower()
    return any(path.endswith(ext) for ext in STATIC_FILE_EXT)


# ============================================================
# FASE 1 — CRAWLER DO SITE AO VIVO
# ============================================================

class LiveCrawler:
    def __init__(self, base_url, max_pages, timeout, use_sitemap):
        self.base_url = base_url.rstrip("/")
        self.base_domain = urlparse(self.base_url).netloc
        self.max_pages = max_pages
        self.timeout = timeout
        self.use_sitemap = use_sitemap
        self.visited_pages = set()
        self.queue = [self.base_url]
        self.discovered_links = {}  # url encontrada -> texto do link (label)
        self.session = requests.Session()
        self.session.headers.update({"User-Agent": USER_AGENT})

    def _seed_from_sitemap(self):
        sitemap_url = f"{self.base_url}/sitemap.xml"
        try:
            resp = self.session.get(sitemap_url, timeout=self.timeout)
            if resp.status_code != 200:
                return
            root = ElementTree.fromstring(resp.content)
            ns = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
            for loc in root.findall(".//sm:loc", ns):
                url = loc.text.strip() if loc.text else None
                if url and url not in self.queue:
                    self.queue.append(url)
            print(f"  [sitemap] {len(self.queue) - 1} páginas adicionais encontradas em sitemap.xml")
        except (requests.RequestException, ElementTree.ParseError):
            print("  [sitemap] não foi possível ler sitemap.xml (ignorando)")

    def crawl(self):
        if self.use_sitemap:
            self._seed_from_sitemap()

        print(f"  Rastreando a partir de: {self.base_url}")
        while self.queue and len(self.visited_pages) < self.max_pages:
            url = self.queue.pop(0)
            if url in self.visited_pages:
                continue
            self.visited_pages.add(url)

            try:
                resp = self.session.get(url, timeout=self.timeout, allow_redirects=True)
            except requests.RequestException as e:
                self.discovered_links.setdefault(url, f"(erro ao acessar página: {e})")
                continue

            if resp.status_code >= 400:
                # a própria página já é um link quebrado; não tem corpo confiável pra seguir
                continue

            content_type = resp.headers.get("Content-Type", "")
            if "text/html" not in content_type:
                continue

            soup = BeautifulSoup(resp.text, "html.parser")
            for a in soup.find_all("a", href=True):
                raw = a["href"]
                text = a.get_text(strip=True) or "(sem texto visível)"
                normalized = normalize_url(raw, url)
                if not normalized:
                    continue
                if normalized not in self.discovered_links:
                    self.discovered_links[normalized] = text
                if (
                    is_internal(normalized, self.base_domain)
                    and not is_static_file(normalized)
                    and normalized not in self.visited_pages
                    and normalized not in self.queue
                    and len(self.visited_pages) + len(self.queue) < self.max_pages
                ):
                    self.queue.append(normalized)

        print(f"  {len(self.visited_pages)} páginas visitadas, {len(self.discovered_links)} links únicos encontrados")
        return self.discovered_links


# ============================================================
# FASE 2 — SCANNER DO CÓDIGO-FONTE
# ============================================================

def scan_source_code(source_dir, base_url):
    """Vasculha arquivos .tsx/.ts/.jsx/.js/.mdx atrás de href='...' e URLs absolutas."""
    results = {}  # url -> label (arquivo onde foi encontrado)
    files_scanned = 0

    if not os.path.isdir(source_dir):
        print(f"  AVISO: pasta de código-fonte não encontrada: {source_dir}")
        return results

    for root, dirs, files in os.walk(source_dir):
        dirs[:] = [d for d in dirs if d not in IGNORE_DIRS and not d.startswith(".")]
        for fname in files:
            ext = os.path.splitext(fname)[1]
            if ext not in SOURCE_EXTENSIONS:
                continue

            fpath = os.path.join(root, fname)
            try:
                with open(fpath, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
            except OSError:
                continue

            files_scanned += 1
            rel_path = os.path.relpath(fpath, source_dir)

            candidates = set(HREF_REGEX.findall(content)) | set(ABSOLUTE_URL_REGEX.findall(content))
            for raw in candidates:
                normalized = normalize_url(raw, base_url)
                if not normalized:
                    continue
                if normalized not in results:
                    results[normalized] = f"código-fonte: {rel_path}"

    print(f"  {files_scanned} arquivos de código vasculhados, {len(results)} links únicos encontrados")
    return results


# ============================================================
# FASE 3 — CHECAGEM DE STATUS DE CADA LINK
# ============================================================

def check_single_link(url, timeout, session):
    """Retorna (status_code_ou_None, mensagem_de_erro_ou_None, url_final_apos_redirect)."""
    try:
        resp = session.head(url, timeout=timeout, allow_redirects=True)
        # alguns servidores não respondem bem a HEAD (405, ou corpo vazio suspeito) -> confirma com GET
        if resp.status_code in (405, 403) or resp.status_code >= 400:
            resp = session.get(url, timeout=timeout, allow_redirects=True, stream=True)
        return resp.status_code, None, resp.url
    except requests.exceptions.Timeout:
        return None, "timeout", url
    except requests.exceptions.SSLError:
        return None, "erro de certificado SSL", url
    except requests.exceptions.ConnectionError:
        return None, "erro de conexão (site fora do ar ou domínio inválido)", url
    except requests.RequestException as e:
        return None, str(e), url


def check_all_links(links_dict, timeout, workers):
    """Checa o status de cada link único em paralelo. Retorna lista de dicts."""
    session = requests.Session()
    session.headers.update({"User-Agent": USER_AGENT})

    results = []
    urls = list(links_dict.keys())
    print(f"  Checando {len(urls)} links únicos (até {workers} em paralelo)...")

    with concurrent.futures.ThreadPoolExecutor(max_workers=workers) as executor:
        future_to_url = {
            executor.submit(check_single_link, url, timeout, session): url for url in urls
        }
        done = 0
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            status, error, final_url = future.result()
            done += 1
            if done % 25 == 0 or done == len(urls):
                print(f"    {done}/{len(urls)} checados...")
            results.append({
                "url": url,
                "label": links_dict[url],
                "status": status,
                "error": error,
                "final_url": final_url,
                "redirected": final_url != url,
            })
    return results


# ============================================================
# RELATÓRIO HTML
# ============================================================

def classify(entry):
    """Retorna (categoria, cor_css) para uma entrada checada."""
    if entry["status"] is None:
        return "erro de conexão", "#f8d7da"
    if entry["status"] >= 500:
        return f"erro do servidor ({entry['status']})", "#f8d7da"
    if entry["status"] >= 400:
        return f"não encontrado ({entry['status']})", "#f8d7da"
    if entry["status"] >= 300:
        return f"redirecionamento ({entry['status']})", "#fff3cd"
    return f"ok ({entry['status']})", "#d4edda"


def build_html_report(all_results, output_path, base_url, source_dir):
    broken = [r for r in all_results if r["status"] is None or r["status"] >= 400]
    redirects = [r for r in all_results if r["status"] and 300 <= r["status"] < 400]
    ok = [r for r in all_results if r["status"] and r["status"] < 300]

    broken.sort(key=lambda r: (r["status"] is not None, r["status"] or 0))

    def escape(s):
        return (str(s)
                .replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
                .replace('"', "&quot;"))

    def row(entry):
        categoria, cor = classify(entry)
        detalhe = entry["error"] or ""
        return f"""
        <tr style="background:{cor}">
            <td><a href="{escape(entry['url'])}" target="_blank">{escape(entry['url'])}</a></td>
            <td>{escape(entry['label'])}</td>
            <td><strong>{escape(categoria)}</strong></td>
            <td>{escape(detalhe)}</td>
        </tr>"""

    rows_html = "\n".join(row(e) for e in broken) or "<tr><td colspan='4'>Nenhum link quebrado encontrado 🎉</td></tr>"

    html_doc = f"""<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório de Links — {escape(base_url)}</title>
<style>
    body {{ font-family: -apple-system, Segoe UI, Arial, sans-serif; margin: 0; padding: 24px; background: #f5f5f7; color: #1d1d1f; }}
    h1 {{ font-size: 20px; margin-bottom: 4px; }}
    .meta {{ color: #666; font-size: 13px; margin-bottom: 24px; }}
    .summary {{ display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }}
    .card {{ background: white; border-radius: 10px; padding: 16px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); min-width: 140px; }}
    .card .num {{ font-size: 28px; font-weight: 700; }}
    .card .label {{ font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.03em; }}
    .card.red .num {{ color: #d32f2f; }}
    .card.yellow .num {{ color: #b8860b; }}
    .card.green .num {{ color: #2e7d32; }}
    table {{ width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }}
    th {{ text-align: left; padding: 12px 14px; background: #1d1d1f; color: white; font-size: 13px; }}
    td {{ padding: 10px 14px; font-size: 13px; border-bottom: 1px solid #eee; word-break: break-all; }}
    a {{ color: #0066cc; text-decoration: none; }}
    a:hover {{ text-decoration: underline; }}
</style>
</head>
<body>
    <h1>Relatório de Links — STR Software</h1>
    <div class="meta">
        Site: {escape(base_url)} &nbsp;|&nbsp;
        Código-fonte: {escape(source_dir or "(não verificado)")} &nbsp;|&nbsp;
        Gerado em: {time.strftime("%d/%m/%Y %H:%M")}
    </div>

    <div class="summary">
        <div class="card red"><div class="num">{len(broken)}</div><div class="label">Links quebrados</div></div>
        <div class="card yellow"><div class="num">{len(redirects)}</div><div class="label">Redirecionamentos</div></div>
        <div class="card green"><div class="num">{len(ok)}</div><div class="label">Links OK</div></div>
        <div class="card"><div class="num">{len(all_results)}</div><div class="label">Total verificado</div></div>
    </div>

    <table>
        <thead>
            <tr><th>Link</th><th>Nome / Origem</th><th>Status</th><th>Detalhe</th></tr>
        </thead>
        <tbody>
            {rows_html}
        </tbody>
    </table>
</body>
</html>"""

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(html_doc)


# ============================================================
# MAIN
# ============================================================

def main():
    parser = argparse.ArgumentParser(description="Analisador de links quebrados - STR Software")
    parser.add_argument("--url", help="URL base do site a rastrear (ex: https://strsoftware.com.br)")
    parser.add_argument("--source", help="Caminho da pasta do código-fonte a vasculhar")
    parser.add_argument("--output", default="relatorio_links.html", help="Arquivo HTML de saída")
    parser.add_argument("--max-pages", type=int, default=DEFAULT_MAX_PAGES)
    parser.add_argument("--workers", type=int, default=DEFAULT_WORKERS)
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT)
    parser.add_argument("--sitemap", action="store_true", help="Também ler /sitemap.xml para achar páginas órfãs")
    args = parser.parse_args()

    if not args.url and not args.source:
        parser.error("informe pelo menos --url ou --source")

    all_links = {}

    if args.url:
        print("[1/3] Rastreando site ao vivo...")
        crawler = LiveCrawler(args.url, args.max_pages, args.timeout, args.sitemap)
        all_links.update(crawler.crawl())
    else:
        print("[1/3] Pulando rastreio do site ao vivo (--url não informado)")

    if args.source:
        print("[2/3] Vasculhando código-fonte...")
        base_for_relative = args.url or "https://strsoftware.com.br"
        source_links = scan_source_code(args.source, base_for_relative)
        for url, label in source_links.items():
            if url not in all_links:
                all_links[url] = label
    else:
        print("[2/3] Pulando varredura de código-fonte (--source não informado)")

    if not all_links:
        print("Nenhum link encontrado. Verifique os parâmetros e tente novamente.")
        sys.exit(1)

    print("[3/3] Checando status de cada link...")
    results = check_all_links(all_links, args.timeout, args.workers)

    build_html_report(results, args.output, args.url or "", args.source or "")

    broken_count = len([r for r in results if r["status"] is None or r["status"] >= 400])
    print()
    print(f"Concluído. {broken_count} link(s) quebrado(s) de {len(results)} verificados.")
    print(f"Relatório salvo em: {os.path.abspath(args.output)}")


if __name__ == "__main__":
    main()
