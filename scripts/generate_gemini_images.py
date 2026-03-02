import argparse
import base64
import json
import os
import pathlib
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

PROMPTS = {
    "hero-main.png": "Premium cinematic aerial view of a global logistics network from Yiwu China, cargo port, air freight lane trails, modern control center HUD overlays, ultra realistic photography style, blue and gold corporate palette, no text, 16:9.",
    "service-ocean.png": "Luxury commercial photography of container ships at sunrise with teal-blue sea and metallic containers, high contrast, realistic texture, no text, 3:2.",
    "service-air.png": "Premium air cargo logistics scene at international airport, cargo aircraft loading at dusk, cinematic lighting, realistic photo style, no text, 3:2.",
    "service-rail.png": "High-end railway freight terminal with modern cargo trains and containers, dramatic perspective, realistic commercial photograph, no text, 3:2.",
    "service-ddp.png": "Professional customs clearance and DDP fulfillment center interior, staff and packages in modern workflow, premium corporate photo style, no text, 3:2.",
    "about-ops.png": "Global logistics operations war room with large digital maps and professional team collaboration, luxury corporate branding feeling, realistic photography, no text, 16:9.",
}


def call_gemini(api_key: str, model: str, prompt: str) -> bytes:
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        + urllib.parse.quote(model)
        + ":generateContent?key="
        + urllib.parse.quote(api_key)
    )

    payload = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {
            "responseModalities": ["TEXT", "IMAGE"],
        },
    }

    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            body = resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        details = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"HTTP {e.code}: {details}")

    data = json.loads(body)
    candidates = data.get("candidates", [])
    for cand in candidates:
        content = cand.get("content", {})
        for part in content.get("parts", []):
            inline = part.get("inlineData")
            if inline and inline.get("data"):
                return base64.b64decode(inline["data"])

    raise RuntimeError(f"No image bytes in response: {body[:500]}")


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate website images with Gemini image model")
    parser.add_argument("--model", default="gemini-2.5-flash-image-preview", help="Gemini model id")
    parser.add_argument("--out", default="assets/img/generated", help="Output directory")
    parser.add_argument("--sleep", type=float, default=1.2, help="Delay between requests")
    args = parser.parse_args()

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        print("Missing GEMINI_API_KEY environment variable", file=sys.stderr)
        return 2

    out_dir = pathlib.Path(args.out)
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Using model: {args.model}")
    ok = 0
    for name, prompt in PROMPTS.items():
        target = out_dir / name
        print(f"Generating {name} ...")
        try:
            img = call_gemini(api_key=api_key, model=args.model, prompt=prompt)
            target.write_bytes(img)
            print(f"Saved {target}")
            ok += 1
        except Exception as exc:
            print(f"Failed {name}: {exc}", file=sys.stderr)
        time.sleep(args.sleep)

    print(f"Done. Success: {ok}/{len(PROMPTS)}")
    return 0 if ok == len(PROMPTS) else 1


if __name__ == "__main__":
    raise SystemExit(main())
