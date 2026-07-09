# Clashgram
> Privacy-hardened client modification of the Telegram Web client.

Clashgram is an open-source client for Telegram designed to block telemetry, retain deleted/edited messages locally, and support hybrid server/local audio transcription.

---

## Features

### Zero-Telemetry Stealth
* **Read Receipts:** Discards outgoing read acknowledgements (`messages.readHistory`). Messages remain unread for the sender.
* **Typing Indicator:** Intercepts and discards outgoing typing/activity signals.
* **Presence status:** Discards outgoing status updates (`account.updateStatus`), keeping the account status offline.

### Local Message Retention
* **Anti-Delete:** Retains messages locally in IndexedDB after a remote deletion request (`UpdateDeleteMessages`).
* **Anti-Edit:** Preserves the original message text upon remote edits (`UpdateEditMessage`) and renders it as metadata.
* **Storage Pruner:** Cleans up local messages automatically after 1, 3, or 7 days.

### Hybrid Audio Transcription
* **Cloud API:** Routes transcription requests to a Cloud API proxy worker (`worker.js`) with an IP-based rate limit of 50 requests per day.
* **Local Fallback:** Routes requests to a local single-threaded `@huggingface/transformers` WASM model when the daily server limit is reached.
* **Limit Indicators:** Displays visual daily limit usage bars inside Settings and message boxes.

### Custom Emulations
* **Protected Media:** Bypasses copy and download restrictions in groups and channels.
* **Premium Emulation:** Simulates Premium badges and custom animated emojis locally.

---

## Installation & Setup

### Prerequisites
* Node.js v22.6+ / v24+
* npm v10.8+

### Setup
1. Clone the repository and copy the environment template:
   ```bash
   git clone https://github.com/ajisth69/clashgram.git
   cd clashgram
   copy .env.example .env
   ```
2. Configure credentials in `.env`:
   ```env
   CLASHGRAM_API_ID=your_api_id
   CLASHGRAM_API_HASH=your_api_hash
   ```
3. Run the development server:
   ```bash
   npm install
   npm run dev
   ```
   Access the server locally at `http://localhost:1111/`.

---

## Local Development & Testing
* **CORS Restrictions:** The production worker whitelists `https://clashgram.pages.dev`.
* **Testing locally:** Local requests to the proxy from `localhost:1111` will fail due to CORS and automatically fall back to the offline local WASM model.

---

## Production Deployment
* **Worker:** Deploy the code inside `worker.js` directly to a Cloudflare Worker.
* **Frontend:** Compile the production assets and push commits to GitHub:
  ```bash
  npm run build:production
  git add -A
  git commit -m "Build: Release frontend"
  git push
  ```
  *(Do not add `worker.js` to Git as it contains your API keys).*
