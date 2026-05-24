# ✈️ Clashgram Web A

Clashgram Web A is a premium, feature-rich, high-performance web client for Telegram. Built upon the award-winning official Telegram Web A client, Clashgram integrates state-of-the-art stealth controls, message retention safety features, multi-account expansions, and premium tools directly inside your browser.

## 🚀 Key Features

### 🕵️ Ghost Mode & Stealth
*   **Hide Read Receipts:** Read incoming messages anonymously without sending receipts.
*   **Hide Typing Status:** Suppress typing and audio recording indicators.
*   **Hide Online Status:** Hide your active status while keeping the ability to view other users' online indicators.
*   **Stealth Story Views:** Watch stories in complete anonymity without sending story view receipts.

### 🛡️ Message Retention
*   **Anti-Delete:** Keep and view messages deleted by other users.
*   **Anti-Edit:** Show the original text directly beneath edited messages so you know exactly what changed.

### 🔓 Bypass Restrictions
*   Copy, save, and forward content seamlessly from protected groups/channels that have copy restrictions enabled.

### 💎 Local Premium Emulation
*   Locally emulate Telegram Premium state to unlock gorgeous premium badges, stealth options, and custom emoji packs without a paid subscription.

### 🚀 100+ Multi-Account Support
*   Bypass official client limitations and concurrently log in and switch between up to 100 separate Telegram accounts in a single browser session.

### 🔒 Passcode Protection
*   Secure your client session with custom primary and recovery passcode locks, allowing you to lock specific chats and folders securely.

### 💾 Premium Chat History Export
*   Package complete chat histories into a structured ZIP archive containing separate, responsive `/index.html` (with local instant search), `/css/style.css`, `/js/app.js`, `/assets/logo.svg`, and a downloaded `/media/` folder.

### 📞 Web Calling & Transcription
*   High-fidelity secure browser calling (voice & video) and high-speed local AI speech-to-text transcription.

---

## 🛠️ Local Setup

1. Copy the environment template:
   ```sh
   cp .env.example .env
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Obtain your `API_ID` and `API_HASH` from [my.telegram.org](https://my.telegram.org) and populate your `.env` file:
   ```env
   CLASHGRAM_API_ID=your_api_id
   CLASHGRAM_API_HASH=your_api_hash
   ```

---

## 💻 Development & Build

### Run Dev Server
```sh
npm run dev
```

### Build Production Bundle
```sh
npm run build:production
```
The compiled, highly optimized static payload will be generated in the `./dist` folder.

---

## 📦 Deployment

### GitHub Pages (Automated CI/CD)
This repository includes a pre-configured GitHub Actions workflow at [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml). Whenever you push to the `main` branch, GitHub will automatically compile the production static files and publish your client.
Make sure to add your `CLASHGRAM_API_ID` and `CLASHGRAM_API_HASH` as GitHub Repository Secrets!

### Cloudflare Pages
You can deploy directly to Cloudflare Pages. Connect this repository and set the following build options:
*   **Framework Preset:** `None`
*   **Build command:** `npm run build:production`
*   **Build output directory:** `dist`
