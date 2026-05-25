# ✈️ Clashgram Web A: Premium, Ghost & Anti-Censorship Client

Clashgram is an elite, privacy-hardened, high-performance hybrid web and native client for Telegram. Built on top of the ultra-fast, official Telegram Web A client, Clashgram integrates powerful stealth controls, message retention safety tools, multi-account capabilities, local AI transcription, and a beautiful translucent UI theme directly inside your browser and mobile device.

Whether compiled as a static web bundle or packaged into its custom notch-proof native Android container, Clashgram is designed to give you absolute control over your digital footprint and messaging experience.

---

## 📖 Deep Dives: How It Works Under the Hood

Unlike generic client skins, Clashgram modifies the core state management, network serialization, and UI render cycles of the Telegram Web engine. Here is a technical breakdown of its primary pillars:

### 1. 🕵️ Stealth & Ghost Mode Engine
The Stealth engine intercepts outbound packets at the network layer and state controllers before they leave the browser or device:
*   **Read Receipts Control:** When you open a chat, the client UI updates local unread counts to zero instantly so you can read cleanly, but it intercepts and drops outbound `messages.readHistory` API calls to the Telegram MTProto servers.
*   **Typing Status Suppressor:** In `src/global/actions/api/messages.ts`, typing event triggers are completely hijacked. Any typing, voice recording, or file upload action returns early, ensuring your typing indicator never blinks for other users.
*   **Online Status Hijack:** Telegram's server protocol marks you as online whenever there is active websocket traffic. Clashgram intercepts outgoing presence heartbeats (`account.updateStatus`). If you set your Telegram privacy settings for "Last Seen & Online" to **"Everybody"** and activate Ghost Mode, other users' status changes will stream down to you, but Clashgram will block your outgoing presence. You remain permanently "Offline" or "Last seen recently" while seeing everyone else's real-time state!
*   **Story Anonymity:** When viewing Telegram Stories, the client blocks the `stories.readStories` network request, keeping your view completely hidden from the author's list.

### 2. 🛡️ Message & Media Retention (Anti-Delete & Anti-Edit)
To prevent digital gaslighting, Clashgram retains every piece of data locally, bypassing server-directed retractions:
*   **Anti-Delete:** When another user deletes a message, the Telegram server sends a `UpdateDeleteMessages` payload. In `src/global/reducers/messages.ts`, Clashgram intercepts this update. Instead of purging the message ID from the client's Redux state, it flags the item with `clashgramDeleted: true`, turns off active loading states, and persists it inside an IndexedDB cache (`saveClashgramMessage`). In the UI, the message remains fully visible, decorated with a subtle trash bin/deleted icon.
*   **Anti-Edit:** When an edit occurs (`UpdateEditMessage`), Clashgram reads the previous text from its local cache, assigns it to `clashgramOriginalText`, and flags the message as edited. The UI then renders the original pre-edited message directly under the new text, ensuring you see what was changed.
*   **Retention Period:** You can configure a sliding window (1, 3, or 7 days, or until session refresh) to automatically prune old deleted/edited data, preventing local storage bloat.

### 3. 🔓 Restriction Bypass Engine
Many Telegram channels and groups enable content protection flags (`no_forwards` / copy restriction), disabling selection, forwarding, saving media, or right-clicking. 
*   Clashgram bypasses this entirely at the DOM and component level. It strips CSS restriction rules (like `user-select: none`), overrides context-menu blockers, and re-enables the download/forward icons in the UI, allowing you to copy, save, and forward content seamlessly from any restricted chat.

### 4. 💎 Local Premium Emulation
Official premium badges and emoji packs are locked behind server flags. Clashgram intercepts state selectors globally:
*   In `src/global/selectors/users.ts`, when the client queries `selectIsCurrentUserPremium` or retrieves the active user's profile, it checks the setting `clashgramLocalPremium`.
*   If enabled, it dynamically injects `isPremium: true` into your local session. This immediately unlocks decorative premium badges, native double-limit features, custom premium emoji styling, and advanced reaction options directly in the client layout without a paid Telegram subscription.

### 5. 🎙️ On-Device Local Whisper AI (Speech-to-Text)
Voice note transcription is usually restricted to paid Premium users and processed on Telegram servers. Clashgram builds in a private, high-fidelity, completely offline transcriber:
*   Uses **Whisper ONNX models** running directly in the browser sandboxes using WebAssembly and WebGPU acceleration.
*   Supports multiple model sizes: **Tiny** (fastest, optimized for mobile devices), **Base** (recommended balance), and **Small** (high precision).
*   Can transcribe voice notes in their original language or translate foreign speech directly to English completely offline—no voice data is ever uploaded to external servers.

### 6. 🎨 Translucent Glassmorphism Interface
Clashgram introduces a native, beautifully responsive custom Glassmorphism theme:
*   Applies hardware-accelerated translucent filters (`backdrop-filter: blur()`) only to sidebars, headers, floating menus, and settings windows.
*   Features a custom HSL color-depth engine that allows users to adjust both the base color hue (0° to 360°) and the transparency scale (0% to 100%) dynamically to create custom backdrop aesthetics that blend with the workspace wallpaper.

### 7. 📱 Notch-Proof Native Android Mobile Shell
Clashgram is fully optimized to run inside a high-speed native shell using Capacitor:
*   **Viewport Cutout Support:** Unlike simple web-wrappers that get cut off by front camera punch-holes or rounded device screens, Clashgram binds its body layout using dynamic CSS environment values (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`). This ensures status bar and system navigation buttons never overlay or clip chat elements on any phone, tablet, or Chromebook in both portrait and landscape rotations.
*   **Adaptive Density Icons:** High-definition adaptive vector densities are auto-generated across all mipmap density buckets (`mdpi`, `hdpi`, `xhdpi`, `xxhdpi`, `xxxhdpi`) for a seamless, professional native launcher look on high-res displays.

---

## 🛠️ Feature Comparison Matrix

| Feature | Official Telegram Web A | **Clashgram Web & Android** | How it's Done |
| :--- | :---: | :---: | :--- |
| **Stealth Mode (Read Receipts)** | ❌ No | **Yes (Toggleable)** | Blocks outgoing `messages.readHistory` API calls |
| **Typing Hider** | ❌ No | **Yes (Toggleable)** | Suppresses outbound typing events |
| **Ghost Online Status** | ❌ No | **Yes (Toggleable)** | Drops outgoing presence updates |
| **Anti-Delete Messages** | ❌ No | **Yes (Local Cache)** | Intercepts `UpdateDeleteMessages` |
| **Anti-Edit History** | ❌ No | **Yes (Sub-text)** | Caches pre-edit strings locally |
| **Bypass Protected Chats** | ❌ No | **Yes (Universal)** | Bypasses `no_forwards` selectors & DOM blocks |
| **Local Premium Spoofing** | ❌ No | **Yes (Visual & Emojis)**| State selector overrides (`isPremium = true`) |
| **Offline Voice-to-Text** | ❌ No | **Yes (Whisper AI)** | On-device ONNX runtime + WebGPU / WASM |
| **Translucent Glass UI** | ❌ No | **Yes (Dynamic HSL)** | backdrop-filter custom theme layers |
| **Notch-Proof Android Shell**| ❌ No | **Yes (Capacitor)** | Dynamic safe-area padding layouts |

---

## 🚀 Getting Started

### Prerequisites
*   **Node.js**: v20 or v22 (LTS recommended)
*   **Package Manager**: `npm`
*   **Android Development (Optional)**: Android Studio, SDK 34+, Gradle 8, and JDK 17.

### Local Installation & Web Setup
1.  Clone the repository and enter the directory:
    ```bash
    git clone https://github.com/ajisth69/clashgram.git
    cd clashgram
    ```
2.  Copy the environment file:
    ```bash
    cp .env.example .env
    ```
3.  Configure your API keys. Go to [my.telegram.org](https://my.telegram.org), create a application profile, copy your credentials, and paste them in your `.env`:
    ```env
    CLASHGRAM_API_ID=1234567
    CLASHGRAM_API_HASH=abcdef0123456789abcdef0123456789
    ```
4.  Install dependencies:
    ```bash
    npm install
    ```
5.  Start the development server:
    ```bash
    npm run dev
    ```

---

## 📱 Compiling & Running on Android

Clashgram is pre-configured with Capacitor for native deployment.

### 1. Build and Synchronize Assets
```bash
# 1. Compile the production web bundles
npm run build:production

# 2. Sync files and copy plugins to the Android project folder
npx cap sync android
```

### 2. Build Debug APK Locally
To compile the APK directly from the terminal without opening Android Studio:
```bash
# On Windows (PowerShell):
cd android
./gradlew assembleDebug

# On Linux/macOS:
cd android
./gradlew assembleDebug
```
The compiled, ready-to-install debug binary will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

### 3. Run on Device / Emulator
Connect your Android phone with USB Debugging enabled, and launch it natively:
```bash
npx cap run android
```

---

## 📦 Cloud & Continuous Deployment (CI/CD)

The codebase contains separate, fully isolated deployment workflows:

### 1. Web Deployment (GitHub Pages)
The client includes an automated workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml).
*   **Triggers:** Pushes to the `main` branch.
*   **Optimizations:** Automatically ignores native Android files, scripts, and documentation changes (`paths-ignore`), preventing wasteful redeployments.
*   **Setup:** Make sure to add `CLASHGRAM_API_ID` and `CLASHGRAM_API_HASH` as secrets in your GitHub repository!

### 2. Android Automated Releases
The repository contains an isolated build script [`.github/workflows/android-release.yml`](.github/workflows/android-release.yml).
*   **Triggers:** Triggered when you push a version tag (e.g. `v1.0.0`) or manually via the "Actions" tab.
*   **Output:** Automatically checks out, sets up JDK 17, compiles the native assets in a clean container, and publishes the ready-to-use `.apk` straight to your GitHub Releases page.

### 3. Cloudflare Pages Setup
To deploy your static web portal directly to Cloudflare Pages:
1.  Connect your repository to Cloudflare Pages.
2.  Set the **Build command** to: `npm run build:production`
3.  Set the **Build output directory** to: `dist`
4.  To prevent Cloudflare from building when you only push native Android changes, set the **Ignored builds command** in Cloudflare **Settings > Builds & deployments** to:
    ```bash
    git diff --quiet HEAD^ HEAD -- . ':!android' ':!.github' ':!scratch' ':!docs' ':!README.md' ':!.gitignore'
    ```

---

## ❓ FAQ & Troubleshooting

#### Q: Will my account get banned for using Clashgram?
**A:** No. Clashgram runs entirely inside standard secure browser sandboxes or a native WebView shell. It relies on standard MTProto v5 API connections (just like official Telegram Web A). It does not modify outgoing message contents or spam API endpoints, making it completely safe and undetectable.

#### Q: How do I change the Glassmorphism settings?
**A:** Click on the main menu, go to **Settings**, select **Clashgram Settings**. You can turn on the **Native Glass Theme** and adjust the base Hue slider and Opacity slider directly with a real-time visual preview.

#### Q: The voice note translation/transcription is stuck or downloading. Is that normal?
**A:** Yes, the first time you transcribe a voice message, the client will download the Whisper ONNX model configuration (a few megabytes) directly to your local browser storage cache. Once downloaded, all subsequent transcriptions are instant and operate 100% offline.

#### Q: How do I lock specific folders or chats?
**A:** Open **Settings** -> **Clashgram Settings** -> **Passcode Lock**. Set your primary passcode and optional recovery question. Once enabled, a lock icon will appear at the top of your chat list, allowing you to lock your session with a single click.

---

## 📄 License & Credits
Clashgram Web A is an independent fork of the official Telegram Web A client.
All original Telegram design styles, animations, and source code belong to Telegram FZ-LLC. Modified under the terms of the GNU GPL v3 license.
