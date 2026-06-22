# Clashgram

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/ajisth69/clashgram)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-blue.svg)](https://www.typescriptlang.org/)

Clashgram is a privacy-hardened, high-performance web and native client for Telegram. Built as an advanced fork of the official Telegram Web application, Clashgram introduces zero-telemetry stealth features, persistent client-side message retention, hardware-accelerated glassmorphism design presets, and fully offline, on-device Whisper AI audio transcription.

The application is structured to compile as a fast static web app (SPA) and is packaged inside a custom Android wrapper optimized for display cutouts, notches, and responsive safe area bounds.

---

## One-Click Deployment

Deploy Clashgram to your own Cloudflare Pages hosting in seconds:

1. Click the **Deploy to Cloudflare Pages** button at the top of this file.
2. Connect your GitHub account and select this repository.
3. Configure the following environment variables in the Cloudflare Dashboard under Settings:
   - `CLASHGRAM_API_ID` (Get it from [my.telegram.org](https://my.telegram.org))
   - `CLASHGRAM_API_HASH` (Get it from [my.telegram.org](https://my.telegram.org))
4. Click **Save and Deploy**. Cloudflare will compile and host the static files globally on their edge network.

---

## Architectural Pillars

### 1. Zero-Telemetry Stealth Architecture
Clashgram intercepts network payloads before MTProto serialization to guarantee absolute sender privacy:
* **Selective Read Receipts:** Message lists are marked read locally to provide a clean UX, but outbound history acknowledgment packets (`messages.readHistory`) are blocked at the socket layer. peers see messages as unread.
* **Typing Status Suppression:** Outgoing typing status indicators, audio recording states, and file uploads are intercepted and discarded inside [messages.ts](file:///c:/Users/Ajisth/Downloads/clashgram-main%20(1)/clashgram-main/src/global/actions/api/messages.ts).
* **Presence Stream Isolation:** Incoming user presence updates are parsed normally, but outgoing active presence heartbeats (`account.updateStatus`) are discarded.

### 2. Client-Side Message Retention (Anti-Delete & Anti-Edit)
The client operates local data interception pipelines to bypass remote server purging actions:
* **Anti-Delete System:** When target servers issue a message revocation command (`UpdateDeleteMessages`), Clashgram stops active deletes, marks the record with `clashgramDeleted: true`, and saves the message state to a fast IndexedDB database.
* **Anti-Edit Audit Trail:** Remote message edits (`UpdateEditMessage`) trigger history tracking. Clashgram retains the pre-edited content block, storing it inside `clashgramOriginalText` and visually rendering it directly beneath the updated message.
* **Database Pruning Scheduler:** Includes configuration settings to automatically prune local IndexedDB records after 1, 3, or 7 days, or when closing the session.

### 3. Restriction Bypass & Group Message Filtering
* **Protected Media Exports:** Strips strict `user-select: none` styles, bypasses default browser context menu blockades, and activates save options on protected groups and channels.
* **Group Content Filters:** Restricts copy-paste forwarding actions to protected chats. Also features a custom configuration to securely hide messages sent by blocked users inside group chats using clean CSS display rules, preserving correct virtualization layout indices.

### 4. Local Premium Emulation
* Connects local state selectors directly to `clashgramLocalPremium` settings. When enabled, the application emulates custom animated emojis, visual UI badges, and expanded layout boundaries without modifying central database records.

### 5. On-Device Voice Transcription (Whisper AI)
* Transcribes audio messages locally in the browser sandbox. Powered by ONNX Runtime, it utilizes WebGPU and WebAssembly compilation profiles to execute transcription without sending data to external cloud APIs.
* Supported models: **Tiny** (optimized for lower memory budgets), **Base** (recommended balance), and **Small** (highest precision).

### 6. Interactive Confirmations
* Prompts for user verification before executing outbound message streams. Configurable options allow confirming plain text messages, media attachments (photos, videos, voice notes), documents/files, and stickers/GIFs separately to prevent accidental transmissions.

---

## Tech Stack Overview

| Capabilities | Telegram Web Client | Clashgram Client | Implementation Vector |
| :--- | :---: | :---: | :--- |
| **Silent History Reads** | ❌ No |  Yes | Network block on `messages.readHistory` |
| **Typing Hiding** | ❌ No |  Yes | Discards outgoing client typing states |
| **Deleted Message Cache** | ❌ No |  Yes | Intercepts updates to IndexedDB cache |
| **Original Revision Log** | ❌ No |  Yes | Caches revision strings locally |
| **Protected Download Bypass** | ❌ No |  Yes | Strips CSS and context menu event blocks |
| **Local Account Emulation** | ❌ No |  Yes | Injects simulated state properties into selectors |
| **Offline Whisper Transcripts** | ❌ No |  Yes | Local WebAssembly/WebGPU ONNX Whisper models |
| **Send Confirmation Safeguards**| ❌ No |  Yes | Intercepts composer streams for validation |
| **Safe-Area Display Scaling** | ❌ No |  Yes | Capacitor container with CSS safe-area bindings |

---

## Setup & Local Development

### Prerequisites
* **Node.js:** v22.6+ or v24+
* **npm:** v10.8+

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/ajisth69/clashgram.git
   cd clashgram
   ```
2. Create your local environment configuration:
   ```bash
   copy .env.example .env
   ```
3. Insert your Telegram API credentials in `.env` (obtainable from [my.telegram.org](https://my.telegram.org)):
   ```env
   CLASHGRAM_API_ID=your_api_id
   CLASHGRAM_API_HASH=your_api_hash
   ```
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the local webpack development server:
   ```bash
   npm run dev
   ```

---

## Native Compilation (Android)

1. Compile the production bundles:
   ```bash
   npm run build:production
   ```
2. Sync the compiled static assets with the Android native folder structure:
   ```bash
   npx cap sync android
   ```
3. Compile the APK binary package directly from the command line:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```
   The generated APK binary is output to:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Continuous Deployment (CI/CD)

Clashgram contains isolated CI/CD workflows:
* **GitHub Pages Hosting (.github/workflows/deploy.yml):** Builds and deploys the static files to GitHub Pages on pushes to `main`.
* **Android Releases (.github/workflows/android-release.yml):** Compiles Gradle builds and creates GitHub Releases with the APK asset on new tags matching `v*`.
* **Cloudflare Pages:** Monitors the workspace and deploys static assets built via `npm run build:production` to the `dist` folder. Uses git diff configurations to ignore commits that only modify native Android source paths or documentation trees.

---

## Licenses & Attributions

Clashgram is an independent client modification based on the open-source Telegram Web client. All original Telegram designs, assets, styling rules, and core protocols are the properties of Telegram FZ-LLC. Modified and distributed under the GNU GPL v3 license.
