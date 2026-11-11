# The Lapwing Manual — Interactive Stenography Trainer

An interactive, gamified stenography trainer built around **[Lapwing Theory](https://lapwing.aerick.ca/)** (*Lapwing for Beginners* by Aerick), designed specifically for **Plover** whole-word input and styled after a classic mid-century court-reporting manual.

---

## Features

- **Complete 26-Chapter Interactive Syllabus (`lapwing.aerick.ca`):**
  - Structured into **6 progressive Units** along a winding Syllabus Path with 3-Star Merit stamps, levels, daily quotas, streaks, and proficiency badges.
  - Includes all **73 official practice drills & chapter tests** (from single-syllable CVC chords to prefixes/suffixes, KWR syllabic splitting, Top 200 briefs, R/L/T/E folding, proper nouns, and punctuation).
- **Plover-Native Practice Room:**
  - Accepts translated whole-word output directly from Plover.
  - **Live Misstroke Diagnostics:** If you misstroke and Plover outputs a different English word, the trainer reverse-looks up the chord you accidentally pressed and compares it against the target Lapwing outline.
  - **3 Hint Modes:** *Hints: On*, *Hints: 2s (Auto-Reveal on Hesitation)*, and *No Hints (Examination Mode)*.
- **Tactile 23-Key Bakelite Stenograph & Paper Tape:**
  - Visualizes multi-stroke outlines (`KOPL/PHREU/KAEUT`) with color-coded phonetic/orthographic breakdowns for Initial (`emerald`), Vowel (`ochre`), Asterisk (`vermilion`), and Final (`cobalt`) banks.
  - Live vertical `#STKPWHRAO*EUFRPBLGTSDZ` paper tape roll.
- **Full `lapwing-base.json` Lexicon (114,885 Entries) & Key Sandbox:**
  - Instant reverse lookup of any English word or raw steno outline, sorted from shortest brief to full write-out.
  - Interactive **Manual Key Sandbox** where you can click keys on the steno layout to test raw chords live.
- **Spaced Repetition (SRS) Register & Server-Side Persistence:**
  - Automatically tracks per-word accuracy, best stroke speed, and hesitation streaks, and persists all progress to `/app/data/user-progress.json` on your server volume.

---

## Setting Up Plover for Lapwing Theory

1. Open **Plover** and go to **Tools → Plugins Manager**.
2. Find and install **`plover-lapwing-aio`**, then **Restart Plover** completely.
3. In Plover, open **Configure → System** and change the system to **`Lapwing`**.
4. Enable Plover output and start practicing!

---

## Running in Your Homelab (Docker Compose)

Pre-built multi-architecture (`linux/amd64`, `linux/arm64`) images are published automatically to GitHub Container Registry at:
`ghcr.io/catawayfromfire/stenolearningtool:latest`

Create a `docker-compose.yml` file:

```yaml
services:
  lapwing-trainer:
    image: ghcr.io/catawayfromfire/stenolearningtool:latest
    container_name: lapwing-steno-trainer
    restart: unless-stopped
    ports:
      - "8085:80"
    volumes:
      - lapwing_data:/app/data
    environment:
      - TZ=Europe/Warsaw
      - DATA_DIR=/app/data
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://127.0.0.1:80/api/progress > /dev/null || exit 1"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 5s
    security_opt:
      - no-new-privileges:true
    deploy:
      resources:
        limits:
          cpus: "0.50"
          memory: 128M
    labels:
      - "com.centurylinklabs.watchtower.enable=true"

volumes:
  lapwing_data:
    driver: local
```

Start the container:

```bash
docker compose up -d
```

Then open **`http://localhost:8085`** (or your homelab IP on port `8085`). All progress is saved inside the `lapwing_data` Docker volume (`/app/data/user-progress.json`).

---

## Local Development

```bash
# Install dependencies
npm install

# Start Vite development server (http://127.0.0.1:5173)
npm run dev

# Build production bundle
npm run build

# Run production server locally with disk persistence
PORT=8085 DATA_DIR=./data node server.mjs
```

---

## Credits & Acknowledgments

- **[Lapwing for Beginners](https://lapwing.aerick.ca/)** & **`plover-lapwing-aio`** by [Aerick](https://github.com/aerickt)
- **[Open Steno Project / Plover](https://www.openstenoproject.org/plover/)**
