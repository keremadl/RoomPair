"""Asks Codex CLI's image tool for the demo people's photos.

    python3 scripts/demo/photos.py [--jobs 3] [--only id,id]

Two photos per person and three per room, saved as 600 × 800 JPEGs in
public/images/ (`<id>-1.jpg`, `<id>-room-1.jpg`, like the first demo people).
Work that is already there is skipped, so the script can be stopped and run
again; it stops by itself when Codex keeps failing (the image allowance ran
out). Needs `codex` signed in, and Pillow.
"""

import argparse
import shutil
import subprocess
import sys
import tempfile
import threading
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

sys.path.insert(0, str(Path(__file__).parent))
from people import people  # noqa: E402

OUT = Path(__file__).resolve().parents[2] / "public" / "images"

# What makes a generated picture pass for a phone photo: deep focus, flat
# light, untouched skin and careless framing. Found by trial; keep it whole.
PHONE = (
    "Unedited amateur photo from an iPhone camera roll (IMG_4127.HEIC), the "
    "kind of ordinary picture someone picks for a flat-share profile, not a "
    "photoshoot, not stock, not cinematic. Everything in focus from face to "
    "background (small phone sensor: no background blur, no bokeh). Natural "
    "available light only, slightly flat, mild phone HDR and digital noise, "
    "no studio light, no rim light. Real skin with pores, uneven tone and a "
    "little shine; no retouching, no beauty filter. Imperfect framing: "
    "subject a little off-centre, slightly crooked, ordinary cluttered "
    "surroundings. Relaxed, unposed, natural expression. One person only. "
    "Plain clothes: no brand names, band or team prints, or lettering on "
    "them, and no readable signs. No text, no captions, no watermark, no "
    "logos."
)
ROOM = (
    "Unedited amateur photo from an iPhone camera roll, taken by the tenant "
    "for a room listing, not by an estate agent: handheld, slightly crooked "
    "verticals, wide 1x lens, plain daylight from the window with the window "
    "a bit overexposed, mild phone HDR and noise. A lived-in, believable "
    "room in Riga, Latvia with a few everyday things left out (a charger, a "
    "mug, a jacket on a chair). No people, no pets, no text, no watermark."
)

FRAMING = [
    "Front-camera selfie at arm's length.",
    "Taken by a friend at eye level, waist-up, face clearly visible.",
    "Selfie held a little above the head, with a lot of the place visible.",
    "Taken by a friend across a table or from a step away, the person "
    "turning towards the camera mid-conversation.",
    "Taken by a friend, slightly from the side, the person glancing at the "
    "camera with a half-laugh.",
]

# The second photo copies the first one's face unless told otherwise.
EXPRESSION = [
    "not smiling: concentrating, eyes down on what the hands are doing, "
    "lips slightly pressed together",
    "caught mid-laugh, mouth open, eyes nearly closed, head tipped back",
    "talking to someone out of frame, mouth half open mid-word, eyebrows "
    "raised, looking away from the camera",
    "calm and neutral, mouth closed, looking off to the side, seen in "
    "three-quarter profile",
    "a small closed-mouth smile, eyes lowered, a little shy",
    "amused at being photographed, eyebrows up, glancing back over the "
    "shoulder",
]

lock = threading.Lock()
failures = 0
stop = threading.Event()


def brief(task):
    kind, p = task
    if kind == "second":
        # Only the second photo again, from the first one already saved.
        mood = EXPRESSION[(sum(map(ord, p["id"])) * 7 + len(p["id"])) % len(EXPRESSION)]
        return [f"{p['id']}-2"], (
            f"The file reference.jpg in the current directory is a photo of a "
            f"fictional person. Give it to the tool as the reference image, "
            f"for who the person is only (face shape, hair, build): do not "
            f"copy its expression, head angle, gaze, clothes or place.\n"
            f"Prompt: {PHONE} Taken by a friend from three or four steps "
            f"away, not a selfie: the person is small enough in the frame "
            f"that the place shows, and is busy with what they are doing, "
            f"not posing and not looking into the lens. Expression, clearly "
            f"different from the reference photo: {mood}. The photo: the "
            f"same person, {p['look']}; {p['shots'][1]}."
        )
    if kind == "person":
        a, b = p["shots"]
        # Vary who holds the phone, or every first photo is the same selfie.
        how = FRAMING[sum(map(ord, p["id"])) % len(FRAMING)]
        return [f"{p['id']}-1", f"{p['id']}-2"], (
            f"Make two photos of the SAME fictional person: {p['look']}.\n"
            f"Photo 1 prompt: {PHONE} {how} The photo: {p['look']}; {a}.\n"
            f"Photo 2 prompt (give photo 1 to the tool as the reference image, "
            f"so face, hair and build are the same person): {PHONE} Taken by a "
            f"friend from three or four steps away, not a selfie: the person "
            f"is small enough in the frame that the place shows, and is busy "
            f"with what they are doing, not posing. The photo: the same person, {p['look']}; {b}."
        )
    look = p["room"]["look"]
    return [f"{p['id']}-room-{n}" for n in (1, 2, 3)], (
        f"Make three photos of the SAME room: {look}.\n"
        f"Photo 1 prompt: {ROOM} The room, seen from the doorway so most of "
        f"it is visible: {look}.\n"
        f"Photo 2 prompt (give photo 1 to the tool as the reference image, "
        f"same room, same furniture and colours): {ROOM} The same room from "
        f"the opposite corner, looking back towards the door and the bed: {look}.\n"
        f"Photo 3 prompt (reference: photo 1): {ROOM} A closer view of the "
        f"window side of the same room, with the desk or shelf: {look}."
    )


def save(png, name):
    """Crop 2:3 to the app's 3:4, keeping the top (heads), and shrink."""
    im = Image.open(png).convert("RGB")
    w, h = im.size
    want = round(w * 4 / 3)
    if h > want:
        top = round((h - want) * 0.3)
        im = im.crop((0, top, w, top + want))
    elif h < want:
        cut = round(h * 3 / 4)
        left = (w - cut) // 2
        im = im.crop((left, 0, left + cut, h))
    im.resize((600, 800), Image.LANCZOS).save(
        OUT / f"{name}.jpg", quality=82, progressive=True, optimize=True
    )


def run(task):
    global failures
    names, text = brief(task)
    redo = task[0] == "second"
    if stop.is_set() or (
        not redo and all((OUT / f"{n}.jpg").exists() for n in names)
    ):
        return
    files = ", ".join(f"{n}.png" for n in names)
    with tempfile.TemporaryDirectory() as work:
        if redo:
            shutil.copy(OUT / f"{task[1]['id']}-1.jpg", Path(work) / "reference.jpg")
        prompt = (
            "Use the built-in image generation tool (not a script, no API "
            "key). Portrait orientation, 2:3. Pass each prompt below to the "
            "tool word for word; do not rewrite or embellish it. Save the "
            f"results in the current directory as {files}, in that order. "
            f"When all files exist, print DONE.\n\n{text}"
        )
        try:
            subprocess.run(
                ["codex", "exec", "--skip-git-repo-check", "-s",
                 "workspace-write", "-C", work, prompt],
                stdin=subprocess.DEVNULL, capture_output=True, timeout=900,
            )
        except subprocess.TimeoutExpired:
            pass
        made = [Path(work) / f"{n}.png" for n in names]
        ok = all(m.exists() for m in made)
        if ok:
            for m, n in zip(made, names):
                save(m, n)
    with lock:
        failures = 0 if ok else failures + 1
        print(("done  " if ok else "FAILED"), names[0], flush=True)
        if failures >= 4:
            print("Stopping: Codex keeps failing.", flush=True)
            stop.set()


if __name__ == "__main__":
    args = argparse.ArgumentParser()
    args.add_argument("--jobs", type=int, default=3)
    args.add_argument("--only", default="")
    args.add_argument(
        "--second", action="store_true",
        help="make every second photo again, with a different expression",
    )
    opts = args.parse_args()
    only = set(filter(None, opts.only.split(",")))
    tasks = []
    # A person first, then their room, so whatever is finished is complete.
    for p in people():
        if only and p["id"] not in only:
            continue
        if opts.second:
            tasks.append(("second", p))
            continue
        tasks.append(("person", p))
        if "room" in p:
            tasks.append(("room", p))
    with ThreadPoolExecutor(opts.jobs) as pool:
        list(pool.map(run, tasks))
