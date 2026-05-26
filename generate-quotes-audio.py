#!/usr/bin/env python3
"""Extract all quotes from app.js and generate audio via edge-tts.

Usage:
  python3 generate-quotes-audio.py                   # male + female
  python3 generate-quotes-audio.py --voice male      # male only
  python3 generate-quotes-audio.py --voice female    # female only
"""
import re
import json
import asyncio
import os
import sys
import argparse

APP_JS = os.path.join(os.path.dirname(__file__), 'app.js')
OUT_DIR = os.path.join(os.path.dirname(__file__), 'quotes-audio')
METADATA_FILE = os.path.join(os.path.dirname(__file__), 'quotes-audio.json')

VOICES = {
    'male': 'en-US-GuyNeural',
    'female': 'en-US-AriaNeural',
}

def extract_quotes():
    with open(APP_JS, 'r') as f:
        content = f.read()
    m = re.search(r'quotes:\s*\[', content)
    if not m:
        print("ERROR: Could not find quotes array")
        sys.exit(1)
    start = m.end()
    depth = 1
    pos = start
    while pos < len(content) and depth > 0:
        c = content[pos]
        if c == '[':
            depth += 1
        elif c == ']':
            depth -= 1
        pos += 1
    quotes_text = content[start:pos-1]
    quote_blocks = re.findall(r'\{([^}]+)\}', quotes_text)
    quotes = []
    for block in quote_blocks:
        q = {}
        id_m = re.search(r'id:\s*(\d+)', block)
        if id_m:
            q['id'] = int(id_m.group(1))
        text_m = re.search(r'text:\s*"([^"]+)"', block)
        if text_m:
            q['text'] = text_m.group(1)
        author_m = re.search(r'author:\s*"([^"]*)"', block)
        if author_m:
            q['author'] = author_m.group(1)
        source_m = re.search(r'source:\s*"([^"]*)"', block)
        if source_m:
            q['source'] = source_m.group(1)
        cat_m = re.search(r'category:\s*"([^"]+)"', block)
        if cat_m:
            q['category'] = cat_m.group(1)
        if 'id' in q and 'text' in q and q['text'].strip():
            quotes.append(q)
    return quotes

async def generate_audio(quote, voice_label, voice_name):
    qid = quote['id']
    speech = quote['text']
    out_dir = os.path.join(OUT_DIR, voice_label)
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, f'{qid}.mp3')
    if os.path.exists(out_file):
        return  # skip existing
    try:
        import edge_tts
        communicate = edge_tts.Communicate(speech, voice_name)
        await communicate.save(out_file)
        print(f"  [{voice_label}/{qid}] OK")
    except Exception as e:
        print(f"  [{voice_label}/{qid}] FAILED: {e}")

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--voice', choices=['male', 'female', 'both'], default='both')
    args = parser.parse_args()

    quotes = extract_quotes()
    print(f"Extracted {len(quotes)} quotes\n")

    os.makedirs(OUT_DIR, exist_ok=True)

    with open(METADATA_FILE, 'w') as f:
        json.dump(quotes, f, indent=2)
    print(f"Metadata saved to {METADATA_FILE}\n")

    voices_to_gen = ['male', 'female'] if args.voice == 'both' else [args.voice]

    for label in voices_to_gen:
        voice_name = VOICES[label]
        print(f"Generating {label} ({voice_name})...")
        for q in quotes:
            await generate_audio(q, label, voice_name)

    # Stats
    for label in ['male', 'female']:
        d = os.path.join(OUT_DIR, label)
        count = len([f for f in os.listdir(d) if f.endswith('.mp3')]) if os.path.isdir(d) else 0
        print(f"  {label}: {count} files")

    print("\nDone.")

if __name__ == '__main__':
    asyncio.run(main())
