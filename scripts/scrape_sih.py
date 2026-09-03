#!/usr/bin/env python3
"""Scrape SIH 2026 problem statements from https://sih.gov.in/sih2026PS

Generates:
  ps_2026/SIHXXXXX.md          - one markdown file per problem statement
  ps_2026/README.md            - index table linking every problem statement
  data/sih2026_ps.json         - full structured export (consumed by the web app)
  data/sih2026_ps.csv          - spreadsheet-friendly export
  web/src/data/ps.json         - copy of the JSON consumed by the Next.js app

Usage:
  python3 scripts/scrape_sih.py            # fetch live + regenerate everything
  python3 scripts/scrape_sih.py --validate # validate existing artifacts offline
  python3 scripts/scrape_sih.py --cache HTML_FILE  # parse a local cached HTML file

Notes:
  - The source HTML contains CP1252-double-encoded UTF-8 (mojibake). A fix table
    repairs the most common sequences (dashes, smart quotes, degree signs, etc.).
  - Content is published by Smart India Hackathon (sih.gov.in) and is licensed
    CC-BY-4.0 in this repository. See LICENSE.
"""

import argparse
import gzip
import html
import json
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from datetime import date, datetime
from http.cookiejar import CookieJar
from pathlib import Path

try:
    from bs4 import BeautifulSoup
except ImportError:
    sys.exit("beautifulsoup4 is required: pip install beautifulsoup4 lxml")

ROOT = Path(__file__).resolve().parent.parent
PS_DIR = ROOT / "ps_2026"
DATA_DIR = ROOT / "data"
WEB_DATA = ROOT / "web" / "src" / "data"
URL = "https://sih.gov.in/sih2026PS"
SCRAPE_DATE = date.today().isoformat()

# UTF-8 decoded as CP1252 then re-encoded as UTF-8 (mojibake) -> correct chars
MOJIBAKE_FIX = {
    "\u00e2\u20ac\u201c": "\u2013",  # en dash
    "\u00e2\u20ac\u201d": "\u2014",  # em dash
    "\u00e2\u20ac\u2122": "\u2019",  # right single quote
    "\u00e2\u20ac\u02dc": "\u2018",  # left single quote
    "\u00e2\u20ac\u0153": "\u201c",  # left double quote
    "\u00e2\u20ac\u0152": "\u201d",  # right double quote
    "\u00e2\u20ac\u00a6": "\u2026",  # ellipsis
    "\u00c2\u00b0": "\u00b0",        # degree sign
    "\u00c2\u00b5": "\u00b5",        # micro sign
    "\u00c2\u00b7": "\u00b7",        # middle dot
    "\u00c3\u00b1": "\u00f1",        # n-tilde
    "\u00c3\u00a0": "\u00e0",        # a-grave
    "\u00c3\u00a9": "\u00e9",        # e-acute
}

# Em dashes replaced with hyphens throughout the dataset
PUNCTUATION_FIX = {
    "\u2014": "-",
}


def fix_text(text: str) -> str:
    for bad, good in MOJIBAKE_FIX.items():
        text = text.replace(bad, good)
    for bad, good in PUNCTUATION_FIX.items():
        text = text.replace(bad, good)
    return text


def fetch_html(url: str, attempts: int = 5) -> str:
    """Fetch HTML using curl with browser-like TLS fingerprint.

    The SIH portal sits behind an Azure Application Gateway / WAF that
    blocks Python urllib/requests from CI runners. curl's TLS fingerprint
    matches real browsers much better, so we shell out to it.
    """
    cmd = [
        "curl", "-sS", "-L",
        "--max-time", "90",
        "--compressed",
        "-H", "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        "-H", "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
        "-H", "Accept-Language: en-US,en;q=0.9",
        "-H", "Referer: https://sih.gov.in/",
        "-H", "Sec-Fetch-Dest: document",
        "-H", "Sec-Fetch-Mode: navigate",
        "-H", "Sec-Fetch-Site: same-origin",
        "-H", "Sec-Ch-Ua: \"Chromium\";v=\"126\", \"Google Chrome\";v=\"126\", \"Not.A/Brand\";v=\"99\"",
        "-H", "Sec-Ch-Ua-Mobile: ?0",
        "-H", "Sec-Ch-Ua-Platform: \"Windows\"",
        url,
    ]
    last_err = None
    for i in range(attempts):
        try:
            result = subprocess.run(cmd, capture_output=True, timeout=120)
            if result.returncode != 0:
                stderr = result.stderr.decode("utf-8", errors="replace").strip()
                raise RuntimeError(f"curl exited with code {result.returncode}: {stderr}")
            text = result.stdout.decode("utf-8", errors="replace")
            if not text.strip():
                raise RuntimeError("Empty response body")
            if "dataTablePS" not in text and "<table" not in text:
                snippet = text[:500].replace("\n", " ")
                print(f"  warning: response missing expected table (snippet: {snippet[:200]}...)")
            return text
        except Exception as e:  # noqa: BLE001 - network retries
            last_err = e
            err_detail = str(e)
            if i < attempts - 1:
                wait = 10 * (2**i)  # 10, 20, 40, 80, 160
                wait = min(wait, 60)
                print(f"  fetch attempt {i + 1}/{attempts} failed ({err_detail}); retrying in {wait}s")
                time.sleep(wait)
            else:
                print(f"  fetch attempt {i + 1}/{attempts} failed ({err_detail}); no more retries")
    raise RuntimeError(f"Could not fetch {url} after {attempts} attempts: {last_err}")


MIN_RECORDS = 200

# Fields that must match for a record to count as "unchanged" (scraped_at excluded)
CONTENT_KEYS = [
    "sno", "ps_number", "title", "org", "department", "category", "theme",
    "deadline", "deadline_date", "ideas", "dataset_link", "contact", "youtube",
    "description",
]


def load_existing() -> list:
    path = DATA_DIR / "sih2026_ps.json"
    if path.exists():
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            return []
    return []


def preserve_scrape_dates(records: list, existing: list) -> list:
    """Keep the original scraped_at for records whose content is unchanged,
    so the generated artifacts are byte-stable between runs."""
    by_id = {r["ps_number"]: r for r in existing}
    for r in records:
        prev = by_id.get(r["ps_number"])
        if prev and all(prev.get(k) == r[k] for k in CONTENT_KEYS):
            r["scraped_at"] = prev.get("scraped_at") or r["scraped_at"]
    return records


# Human-readable labels for changed fields in the changelog
FIELD_LABELS = {
    "deadline": "Deadline",
    "deadline_date": "Deadline (parsed)",
    "ideas": "Submitted ideas count",
    "dataset_link": "Dataset link",
    "title": "Title",
    "description": "Description",
    "theme": "Theme",
    "org": "Organization",
    "department": "Department",
    "category": "Category",
    "contact": "Contact info",
    "youtube": "Youtube link",
}


def compute_diff(records: list, existing: list) -> dict:
    """Field-level diff between the new scrape and the previous one."""
    prev_by_id = {r["ps_number"]: r for r in existing}
    new_by_id = {r["ps_number"]: r for r in records}
    prev_ids = set(prev_by_id)
    new_ids = set(new_by_id)

    added = sorted(new_ids - prev_ids)
    removed = sorted(prev_ids - new_ids)
    updated = []
    for psn in sorted(new_ids & prev_ids):
        prev = prev_by_id[psn]
        curr = new_by_id[psn]
        changed = [
            (k, prev.get(k), curr.get(k))
            for k in CONTENT_KEYS
            if prev.get(k) != curr.get(k)
        ]
        if changed:
            updated.append({"ps_number": psn, "fields": changed})
    return {"added": added, "removed": removed, "updated": updated}


def _fmt_value(v) -> str:
    if v is None:
        return "N/A"
    s = str(v)
    if len(s) > 200:
        return s[:197] + "..."
    return s


def write_changelog(records: list, existing: list, date_str: str):
    diff = compute_diff(records, existing)
    if not diff["added"] and not diff["removed"] and not diff["updated"]:
        return False

    lines = [f"# SIH 2026 Data Update - {date_str}", ""]
    lines.append(f"- **Total statements:** {len(records)}")
    lines.append(f"- **Added:** {len(diff['added'])}")
    lines.append(f"- **Removed:** {len(diff['removed'])}")
    lines.append(f"- **Updated:** {len(diff['updated'])}")
    lines.append("")

    if diff["added"]:
        lines.append("## Added")
        lines.append("")
        for psn in diff["added"]:
            r = next(x for x in records if x["ps_number"] == psn)
            lines.append(f"- **{psn}** - {r['title']} ({r['org']}, {r['theme']})")
        lines.append("")

    if diff["removed"]:
        lines.append("## Removed")
        lines.append("")
        for psn in diff["removed"]:
            lines.append(f"- {psn}")
        lines.append("")

    if diff["updated"]:
        lines.append("## Updated")
        lines.append("")
        for u in diff["updated"]:
            lines.append(f"### {u['ps_number']}")
            for key, old, new in u["fields"]:
                label = FIELD_LABELS.get(key, key)
                lines.append(f"- **{label}:** `{_fmt_value(old)}` -> `{_fmt_value(new)}`")
            lines.append("")
        lines.append("")

    changelog_dir = DATA_DIR / "changelog"
    changelog_dir.mkdir(parents=True, exist_ok=True)
    (changelog_dir / f"{date_str}.md").write_text("\n".join(lines), encoding="utf-8")

    root_changelog = ROOT / "CHANGELOG.md"
    entry = lines + [f"Full diff: [data/changelog/{date_str}.md](data/changelog/{date_str}.md)", ""]
    header = [
        "# CHANGELOG",
        "",
        "Automated record of daily changes to the SIH 2026 problem statement dataset.",
        "",
    ]
    if root_changelog.exists():
        header_str = "\n".join(header)
        existing_text = root_changelog.read_text(encoding="utf-8")
        if existing_text.startswith(header_str):
            body = existing_text[len(header_str):].lstrip("\n")
        else:
            body = existing_text.replace("# CHANGELOG\n", "", 1).lstrip("\n")
    else:
        body = ""
    entries = ["\n".join(entry)]
    if body.strip():
        entries.append(body.rstrip("\n"))
    kept = "\n\n---\n\n".join(entries[:30])
    root_changelog.write_text("\n".join(header) + kept + "\n", encoding="utf-8")
    return True


def parse(html_text: str):
    soup = BeautifulSoup(html_text, "lxml")
    table = soup.find("table", id="dataTablePS")
    if not table:
        sys.exit("Could not find #dataTablePS in the page. The site layout may have changed.")
    rows = table.find("tbody").find_all("tr")
    records = []
    for tr in rows:
        tds = tr.find_all("td", recursive=False)
        if len(tds) < 8:
            continue
        title_cell = tds[2]
        link = title_cell.find("a")
        title = fix_text(link.get_text(strip=True)) if link else fix_text(title_cell.get_text(strip=True))
        modal = title_cell.find("div", id=re.compile(r"^ViewProblemStatement"))

        desc = department = dataset_link = contact = youtube = ""
        if modal:
            modal_soup = BeautifulSoup(str(modal), "lxml")
            for trow in modal_soup.find_all("tr"):
                th = trow.find("th")
                td = trow.find("td")
                if not th or not td:
                    continue
                key = th.get_text(strip=True)
                if key == "Description":
                    div = td.find("div", class_="style-2")
                    desc = fix_text(div.get_text("\n", strip=True) if div else td.get_text("\n", strip=True))
                elif key == "Department":
                    department = fix_text(td.get_text(strip=True))
                elif key == "Dataset Link":
                    dataset_link = fix_text(td.get_text(strip=True)).strip()
                elif key == "Contact info":
                    contact = fix_text(td.get_text(strip=True))
                elif key == "Youtube Link":
                    youtube = fix_text(td.get_text(strip=True))

        deadline = fix_text(tds[7].get_text(strip=True))
        deadline_date = None
        try:
            deadline_date = datetime.strptime(deadline, "%d %B %Y").date().isoformat()
        except ValueError:
            pass

        records.append({
            "sno": int(tds[0].get_text(strip=True)),
            "ps_number": fix_text(tds[4].get_text(strip=True)),
            "title": title,
            "org": fix_text(tds[1].get_text(strip=True)),
            "department": department,
            "category": fix_text(tds[3].get_text(strip=True)),
            "theme": fix_text(tds[6].get_text(strip=True)),
            "deadline": deadline,
            "deadline_date": deadline_date,
            "ideas": fix_text(tds[5].get_text(strip=True)),
            "dataset_link": dataset_link,
            "contact": contact,
            "youtube": youtube,
            "description": desc,
            "scraped_at": SCRAPE_DATE,
        })
    return records


def fmt_link(text: str) -> str:
    text = text.strip()
    if not text:
        return "N/A"
    urls = re.findall(r"https?://[^\s]+", text)
    if urls:
        return " ".join(f"[{u}]({u})" for u in urls)
    return html.unescape(text).replace("\n", ", ")


def write_markdown(records: list):
    PS_DIR.mkdir(parents=True, exist_ok=True)
    last_scrape = max(r["scraped_at"] for r in records)
    index = [
        "# SIH 2026 - Problem Statements", "",
        f"Total: {len(records)} problem statements, scraped from https://sih.gov.in/sih2026PS (last update: {last_scrape}).",
        "",
        f"Licensed under CC-BY-4.0. Source: Smart India Hackathon (sih.gov.in).",
        "",
        "| S.No. | PS Number | Category | Theme | Organization | Title |",
        "|---|---|---|---|---|---|",
    ]
    for r in records:
        safe = re.sub(r"[^\w\-]+", "_", r["ps_number"])
        footer = (f"\n---\n_Source: [sih.gov.in/sih2026PS](https://sih.gov.in/sih2026PS) | "
                  f"Scraped: {r['scraped_at']} | License: CC-BY-4.0_")
        body = [
            f"# {r['ps_number']} - {r['title']}", "",
            "## Metadata", "",
            f"- **S.No.:** {r['sno']}",
            f"- **PS Number:** {r['ps_number']}",
            f"- **Title:** {r['title']}",
            f"- **Organization:** {r['org']}",
            f"- **Department:** {r['department']}",
            f"- **Category:** {r['category']}",
            f"- **Theme:** {r['theme']}",
            f"- **Deadline for Idea Submission:** {r['deadline']}",
            f"- **Submitted Ideas:** {r['ideas']}",
            f"- **Dataset Link:** {fmt_link(r['dataset_link'])}",
            f"- **Contact Info:** {r['contact'] if r['contact'].strip() else 'N/A'}",
            f"- **Youtube Link:** {r['youtube'] if r['youtube'].strip() else 'N/A'}",
            "", "## Description", "", r["description"], "",
        ]
        (PS_DIR / f"{safe}.md").write_text("\n".join(body) + footer + "\n", encoding="utf-8")
        index.append(f"| {r['sno']} | {r['ps_number']} | {r['category']} | {r['theme']} | {r['org']} | "
                     f"[{r['title']}]({safe}.md) |")
    (PS_DIR / "README.md").write_text("\n".join(index) + "\n", encoding="utf-8")


def write_json(records: list):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    WEB_DATA.mkdir(parents=True, exist_ok=True)
    payload = json.dumps(records, ensure_ascii=False, indent=2)
    (DATA_DIR / "sih2026_ps.json").write_text(payload + "\n", encoding="utf-8")
    (WEB_DATA / "ps.json").write_text(payload + "\n", encoding="utf-8")


def write_csv(records: list):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    import csv as csvlib
    fields = ["sno", "ps_number", "title", "org", "department", "category", "theme",
              "deadline", "deadline_date", "ideas", "dataset_link", "contact", "youtube",
              "description", "scraped_at"]
    with (DATA_DIR / "sih2026_ps.csv").open("w", newline="", encoding="utf-8") as f:
        w = csvlib.DictWriter(f, fieldnames=fields)
        w.writeheader()
        for r in records:
            w.writerow({k: r[k] for k in fields})


WEB_PUBLIC = ROOT / "web" / "public"
WEB_API = ROOT / "web" / "public" / "api"


def write_sitemap(records: list):
    """Generate static sitemap.xml for Cloudflare Pages."""
    WEB_PUBLIC.mkdir(parents=True, exist_ok=True)
    import re as re_mod

    def slugify(name: str) -> str:
        return re_mod.sub(r"[^a-z0-9]+", "-", name.lower().replace("()", "")).strip("-")

    themes: dict[str, list] = {}
    orgs: dict[str, list] = {}
    for r in records:
        themes.setdefault(r["theme"], []).append(r)
        orgs.setdefault(r["org"], []).append(r)

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
        "  <url>",
        "    <loc>https://sih2026.vuce.in/</loc>",
        "    <changefreq>daily</changefreq>",
        "    <priority>1.0</priority>",
        "  </url>",
        "  <url>",
        "    <loc>https://sih2026.vuce.in/shortlist</loc>",
        "    <changefreq>monthly</changefreq>",
        "    <priority>0.3</priority>",
        "  </url>",
    ]
    for name in themes:
        lines += ["  <url>", f"    <loc>https://sih2026.vuce.in/themes/{slugify(name)}</loc>",
                  "    <changefreq>weekly</changefreq>", "    <priority>0.7</priority>", "  </url>"]
    for name in orgs:
        lines += ["  <url>", f"    <loc>https://sih2026.vuce.in/orgs/{slugify(name)}</loc>",
                  "    <changefreq>weekly</changefreq>", "    <priority>0.7</priority>", "  </url>"]
    for r in records:
        lines += ["  <url>", f"    <loc>https://sih2026.vuce.in/ps/{r['ps_number']}</loc>",
                  f"    <lastmod>{r['scraped_at']}</lastmod>",
                  "    <changefreq>monthly</changefreq>", "    <priority>0.8</priority>", "  </url>"]
    lines.append("</urlset>")
    (WEB_PUBLIC / "sitemap.xml").write_text("\n".join(lines) + "\n", encoding="utf-8")


def write_llms_full(records: list):
    """Generate llms-full.txt with all problem statements for AI agents."""
    WEB_PUBLIC.mkdir(parents=True, exist_ok=True)
    lines = [
        "# SIH 2026 Problem Statements — Full Archive",
        "",
        f"Total: {len(records)} problem statements from Smart India Hackathon 2026.",
        f"Source: https://sih.gov.in/sih2026PS | Last updated: {records[0]['scraped_at'] if records else 'N/A'}",
        f"License: CC-BY-4.0 | Data: https://sih2026.vuce.in/api/ps.json",
        "",
        "---",
        "",
    ]
    for r in records:
        lines.append(f"## {r['ps_number']} — {r['title']}")
        lines.append("")
        lines.append(f"- **Organization:** {r['org']}")
        lines.append(f"- **Department:** {r['department'] or 'N/A'}")
        lines.append(f"- **Category:** {r['category']}")
        lines.append(f"- **Theme:** {r['theme']}")
        lines.append(f"- **Deadline:** {r['deadline']}")
        lines.append(f"- **Submitted Ideas:** {r['ideas']}")
        if r["dataset_link"].strip():
            lines.append(f"- **Dataset:** {r['dataset_link'].strip()}")
        if r["contact"].strip():
            lines.append(f"- **Contact:** {r['contact']}")
        if r["youtube"].strip():
            lines.append(f"- **YouTube:** {r['youtube']}")
        lines.append("")
        lines.append("### Description")
        lines.append("")
        lines.append(r["description"])
        lines.append("")
        lines.append("---")
        lines.append("")
    (WEB_PUBLIC / "llms-full.txt").write_text("\n".join(lines), encoding="utf-8")


def write_api_json(records: list):
    """Generate JSON API files for AI agents and programmatic access."""
    WEB_API.mkdir(parents=True, exist_ok=True)

    # Full dataset
    payload = json.dumps(records, ensure_ascii=False, indent=2)
    (WEB_API / "ps.json").write_text(payload + "\n", encoding="utf-8")

    # Per-PS individual files
    ps_dir = WEB_API / "ps"
    ps_dir.mkdir(parents=True, exist_ok=True)
    for r in records:
        (ps_dir / f"{r['ps_number']}.json").write_text(
            json.dumps(r, ensure_ascii=False, indent=2) + "\n",
            encoding="utf-8",
        )

    # Themes index
    themes: dict[str, list[str]] = {}
    for r in records:
        themes.setdefault(r["theme"], []).append(r["ps_number"])
    themes_data = [
        {"theme": t, "count": len(ps_list), "ps_numbers": ps_list}
        for t, ps_list in sorted(themes.items(), key=lambda x: -len(x[1]))
    ]
    (WEB_API / "themes.json").write_text(
        json.dumps(themes_data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    # Organizations index
    orgs: dict[str, list[str]] = {}
    for r in records:
        orgs.setdefault(r["org"], []).append(r["ps_number"])
    orgs_data = [
        {"org": o, "count": len(ps_list), "ps_numbers": ps_list}
        for o, ps_list in sorted(orgs.items(), key=lambda x: -len(x[1]))
    ]
    (WEB_API / "orgs.json").write_text(
        json.dumps(orgs_data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def validate(records: list):
    issues = []
    seen = set()
    files = sorted(PS_DIR.glob("SIH*.md"))
    if len(files) != len(records):
        issues.append(f"expected {len(records)} md files, found {len(files)}")
    for r in records:
        if r["ps_number"] in seen:
            issues.append(f"duplicate PS number {r['ps_number']}")
        seen.add(r["ps_number"])
        if not (PS_DIR / f"{r['ps_number']}.md").exists():
            issues.append(f"missing file {r['ps_number']}.md")
        for key in ("sno", "ps_number", "title", "org", "category", "theme", "deadline", "description"):
            if not r.get(key):
                issues.append(f"{r['ps_number']}: empty {key}")
        if len(r["description"]) < 50:
            issues.append(f"{r['ps_number']}: description too short")
    return issues


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--validate", action="store_true", help="validate existing artifacts and exit")
    ap.add_argument("--cache", type=str, help="parse a local cached HTML file instead of fetching")
    args = ap.parse_args()

    if args.validate:
        raw = (DATA_DIR / "sih2026_ps.json").read_text(encoding="utf-8")
        records = json.loads(raw)
        issues = validate(records)
        if issues:
            print(f"VALIDATION FAILED: {len(issues)} issue(s)")
            for i in issues:
                print(" -", i)
            sys.exit(1)
        n_files = len(list(PS_DIR.glob("SIH*.md")))
        print(f"OK: {len(records)} problem statements validated ({n_files} md files)")
        return

    if args.cache:
        html_text = Path(args.cache).read_text(encoding="utf-8", errors="replace")
    else:
        print(f"Fetching {URL} ...")
        html_text = fetch_html(URL)

    records = parse(html_text)
    if len(records) < MIN_RECORDS:
        sys.exit(
            f"Sanity check failed: only {len(records)} records parsed "
            f"(expected >= {MIN_RECORDS}). Refusing to write partial data."
        )
    existing = load_existing()
    records = preserve_scrape_dates(records, existing)
    write_markdown(records)
    write_json(records)
    write_csv(records)
    write_llms_full(records)
    write_api_json(records)
    write_sitemap(records)
    changed = write_changelog(records, existing, SCRAPE_DATE)
    if changed:
        print(f"Changelog written: data/changelog/{SCRAPE_DATE}.md")

    issues = validate(records)
    if issues:
        for i in issues:
            print(" -", i)
        sys.exit(1)

    cats = {}
    themes = {}
    for r in records:
        cats[r["category"]] = cats.get(r["category"], 0) + 1
        themes[r["theme"]] = themes.get(r["theme"], 0) + 1
    print(f"OK: {len(records)} problem statements")
    print(f"Categories: {cats}")
    print(f"Themes: {len(themes)}")
    print(f"MD -> {PS_DIR}")
    print(f"JSON -> {DATA_DIR / 'sih2026_ps.json'} (+ web/src/data/ps.json)")
    print(f"CSV -> {DATA_DIR / 'sih2026_ps.csv'}")
    print(f"LLMs -> {WEB_PUBLIC / 'llms-full.txt'}")
    print(f"API -> {WEB_API}")


if __name__ == "__main__":
    main()
