#!/usr/bin/env python3
"""Consolidate all quotes into a single data/quotes.js file.

Reads from:
1. data/quotes.js (existing, ~80 quotes with motivationalQuotesSystem)
2. app.js (embedded motivationalQuotesSystem, ~165 quotes)
3. Notes/New_Quotes_Research.md (169 new quotes)

Outputs consolidated data/quotes.js with all unique quotes.
"""

import re
import json
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(SCRIPT_DIR)

def extract_appjs_quotes():
    """Extract quotes from app.js motivationalQuotesSystem"""
    appjs_path = os.path.join(PROJECT_DIR, 'app.js')
    with open(appjs_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the quotes array within motivationalQuotesSystem
    # Look for: id: N, text: "..."
    quotes = []
    
    # Pattern to match quote objects within the motivationalQuotesSystem.quotes array
    pattern = r'\{\s*id:\s*(\d+),\s*text:\s*"([^"]*)"(?:,|\s*\})'
    matches = re.findall(pattern, content)
    
    seen_texts = set()
    for qid, text in matches:
        if text not in seen_texts:
            seen_texts.add(text)
    
    # Now extract full quote objects
    # Find the quotes array start
    start_idx = content.find('quotes: [')
    if start_idx == -1:
        print("Could not find quotes array in app.js")
        return []
    
    # Find the corresponding closing bracket
    depth = 0
    in_string = False
    escape = False
    array_start = content.index('[', start_idx)
    
    for i in range(array_start, len(content)):
        c = content[i]
        
        if escape:
            escape = False
            continue
        if c == '\\':
            escape = True
            continue
        if c == '"' or c == "'":
            # Simple string tracking (handles basic cases)
            continue
        
        if c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
            if depth == 0:
                array_end = i + 1
                break
    
    array_content = content[array_start:array_end]
    
    # Extract individual quote objects
    # Split by closing brace followed by comma or newline
    raw_quotes = re.findall(r'\{([^}]+)\}', array_content)
    
    parsed = []
    for rq in raw_quotes:
        q = {}
        # Extract id
        id_m = re.search(r'id:\s*(\d+)', rq)
        if id_m: q['id'] = int(id_m.group(1))
        
        # Extract text (handle escaped quotes)
        text_m = re.search(r'text:\s*"((?:[^"\\]|\\.)*)"', rq)
        if text_m: q['text'] = text_m.group(1).replace('\\"', '"')
        
        # Extract author
        auth_m = re.search(r'author:\s*"((?:[^"\\]|\\.)*)"', rq)
        if auth_m: q['author'] = auth_m.group(1)
        
        # Extract source
        src_m = re.search(r'source:\s*"((?:[^"\\]|\\.)*)"', rq)
        if src_m: q['source'] = src_m.group(1)
        
        # Extract category
        cat_m = re.search(r'category:\s*"([^"]*)"', rq)
        if cat_m: q['category'] = cat_m.group(1)
        
        # Extract contexts
        ctx_m = re.search(r'contexts:\s*\[([^\]]*)\]', rq)
        if ctx_m:
            ctxs = re.findall(r'"([^"]*)"', ctx_m.group(1))
            if ctxs: q['contexts'] = ctxs
        
        if q.get('id') and q.get('text'):
            parsed.append(q)
    
    return parsed

def extract_research_quotes():
    """Extract quotes from Notes/New_Quotes_Research.md"""
    research_path = os.path.join(PROJECT_DIR, 'Notes', 'New_Quotes_Research.md')
    if not os.path.exists(research_path):
        print(f"Research file not found: {research_path}")
        return []
    
    with open(research_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    quotes = []
    current_category = None
    
    lines = content.split('\n')
    for line in lines:
        cat_m = re.match(r'^##\s+(\w+)', line)
        if cat_m:
            cat = cat_m.group(1).lower()
            if cat in ['power', 'wisdom', 'discipline', 'growth', 'perseverance', 'faith']:
                current_category = cat
                continue
        
        # Match table rows: | N | "quote" | Author | Source |
        table_m = re.match(r'^\|\s*(\d+)\s*\|\s*"([^"]*)"\s*\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|', line)
        if table_m and current_category:
            q = {
                'id': int(table_m.group(1)),
                'text': table_m.group(2).strip(),
                'author': table_m.group(3).strip(),
                'source': table_m.group(4).strip(),
                'category': current_category,
                'contexts': ['daily']
            }
            # Skip rows that are headers or not actual quotes
            if q['author'] and q['source'] and '---' not in q['author'] and '---' not in q['source']:
                if 'Quote' not in q['author'] and 'Author' not in q['author']:
                    quotes.append(q)
    
    return quotes

def deduplicate_quotes(all_quotes):
    """Remove duplicates based on text (case-insensitive)"""
    seen = {}
    deduped = []
    
    for q in all_quotes:
        key = q.get('text', '').lower().strip()
        if not key:
            continue
        if key not in seen:
            seen[key] = q
            deduped.append(q)
    
    return deduped

def write_quotes_js(quotes):
    """Write the consolidated quotes to data/quotes.js"""
    # Assign sequential IDs
    for i, q in enumerate(quotes, 1):
        q['id'] = i
    
    output_path = os.path.join(SCRIPT_DIR, 'quotes.js')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('/* ═══════════════════════════════════════════════\n')
        f.write(' * Solo Leveling System — Motivational Quotes (Consolidated)\n')
        f.write(f' * Total: {len(quotes)} quotes from all sources\n')
        f.write(' * ═══════════════════════════════════════════════ */\n\n')
        f.write('const QUOTES_DATA = [\n')
        
        for q in quotes:
            contexts = json.dumps(q.get('contexts', ['daily']))
            text = q.get('text', '').replace('"', '\\"')
            author = q.get('author', 'Unknown').replace('"', '\\"')
            source = q.get('source', '').replace('"', '\\"')
            category = q.get('category', 'wisdom')
            
            f.write(f'  {{ id: {q["id"]}, text: "{text}", author: "{author}", ')
            f.write(f'source: "{source}", category: "{category}", ')
            f.write(f'contexts: {contexts} }},\n')
        
        f.write('];\n\n')
        
        # Write the constants and object
        f.write("""const QUOTE_CATEGORIES = { POWER: "power", WISDOM: "wisdom", DISCIPLINE: "discipline", GROWTH: "growth", PERSEVERANCE: "perseverance", FAITH: "faith" };
const QUOTE_CONTEXTS = { QUEST_COMPLETE: "questComplete", LEVEL_UP: "levelUp", STREAK_MILESTONE: "streakMilestone", ACHIEVEMENT_UNLOCKED: "achievementUnlocked", DAILY: "daily" };

const motivationalQuotesSystem = {
  categories: QUOTE_CATEGORIES,
  contexts: QUOTE_CONTEXTS,
  quotes: QUOTES_DATA,

  getRandomQuote() {
    return this.quotes[Math.floor(Math.random() * this.quotes.length)];
  },

  getQuoteByContext(context) {
    const matches = this.quotes.filter(q => q.contexts.includes(context));
    return matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : this.getRandomQuote();
  },

  getQuoteByCategory(category) {
    const matches = this.quotes.filter(q => q.category === category);
    return matches.length > 0 ? matches[Math.floor(Math.random() * matches.length)] : this.getRandomQuote();
  },

  getFavoriteQuotes() {
    return db.favoriteQuotes.toArray().then(favorites =>
      this.quotes.filter(q => favorites.some(f => f.quoteId === q.id))
    );
  },

  toggleFavorite(quoteId) {
    return db.favoriteQuotes.where('quoteId').equals(quoteId).first().then(existing => {
      if (existing) {
        return db.favoriteQuotes.delete(existing.id).then(() => false);
      }
      return db.favoriteQuotes.add({ quoteId, dateAdded: new Date() }).then(() => true);
    });
  }
};
""")
    
    print(f"Written {len(quotes)} quotes to data/quotes.js")

def main():
    print("=== Quote Consolidation ===\n")
    
    # Extract from all sources
    appjs_quotes = extract_appjs_quotes()
    print(f"Extracted {len(appjs_quotes)} quotes from app.js")
    
    research_quotes = extract_research_quotes()
    print(f"Extracted {len(research_quotes)} quotes from research doc")
    
    # Combine and deduplicate
    all_quotes = appjs_quotes + research_quotes
    deduped = deduplicate_quotes(all_quotes)
    print(f"After deduplication: {len(deduped)} unique quotes\n")
    
    # Write output
    write_quotes_js(deduped)
    
    # Category breakdown
    cats = {}
    for q in deduped:
        c = q.get('category', 'unknown')
        cats[c] = cats.get(c, 0) + 1
    print("\nCategory breakdown:")
    for c, n in sorted(cats.items()):
        print(f"  {c}: {n}")

if __name__ == '__main__':
    main()
