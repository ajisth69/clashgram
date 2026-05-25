# Clashgram: Advanced Privacy and Custom Interface Client for Telegram

Clashgram is a highly optimized, privacy-focused hybrid web and native client for Telegram. Architected on top of the official Telegram Web A client, Clashgram introduces rigorous privacy controls, client-side message retention, multi-account routing, dynamic glassmorphism interface layers, and local machine learning audio transcription. 

The application is structured to run as a highly performant static web application and is packaged within a custom native Android container optimized for modern display cutouts and responsive safe area constraints.

---

## Architectural Deep Dive and Implementation

Unlike simple interface wraps, Clashgram introduces state modifications, network interception, and local storage overrides directly within the Web client runtime.

### 1. Network-Level Privacy and Stealth Architecture
The privacy module operates at the boundary of the MTProto network client and local state selectors to restrict outbound data disclosure:
*   **Selective Read Acknowledgment:** When a conversation is loaded, the client updates the local unread count to zero instantly for a clean user experience. However, outbound network packets for `messages.readHistory` are intercepted and discarded before serialization.
*   **Typing State Suppression:** Outgoing typing status updates, voice recording indicators, and document uploading states are intercepted at the action-handler level in `src/global/actions/api/messages.ts` and returned immediately, ensuring no status indicators are broadcast to target chats.
*   **Presence Heartbeat Filtering:** The application blocks outgoing status heartbeats (`account.updateStatus`). When the user's account configuration is set to public visibility for status tracking, Clashgram captures inbound presence streams for peer nodes while completely suppressing outgoing presence indicators.
*   **Anonymized Story Consumption:** Interactive story views are kept anonymous by suppressing the `stories.readStories` network calls, preventing the user's account identifier from registering in the author's viewed log.

### 2. Client-Side Data Retention (Anti-Deletion and Anti-Edition)
Clashgram maintains structural integrity of incoming communication by overriding server-directed deletion and modification commands:
*   **Message Retention (Anti-Delete):** Server-side message retraction triggers (`UpdateDeleteMessages`) are intercepted inside `src/global/reducers/messages.ts`. Instead of purging target elements from the local state arrays, Clashgram flags the records with `clashgramDeleted: true`, halts active deletions, and persists the payload to an IndexedDB store via the `saveClashgramMessage` handler. Retained messages are rendered with an indicators to signify server retraction.
*   **Revision History (Anti-Edit):** Upon receiving message edit packets (`UpdateEditMessage`), Clashgram retrieves the cached content payload from local storage, assigns the historical text to the `clashgramOriginalText` field, and flags the message state. The UI displays the original revision beneath the edited message.
*   **Automated Pruning:** A toggleable retention scheduler allows users to configure database pruning intervals (1, 3, or 7 days, or until session close) to maintain local database performance.

### 3. Restriction Bypass Module
Channel and group protection flags (such as the `no_forwards` flag that limits copying, saving, and forwarding) are neutralized at the interface layer:
*   The system strips the `user-select: none` CSS rules, overrides standard system right-click block actions in the document root, and forces media saving interfaces to remain active, enabling normal copying, selection, and forwarding.

### 4. Local Feature Emulation
Certain user configurations, premium features, and visual badges are unlocked via local state manipulation:
*   Global state selectors (`selectIsCurrentUserPremium` and user info hooks) check the `clashgramLocalPremium` runtime parameter.
*   When active, the selectors inject simulated account flags into the current session. This enables localized interface badges, double-limit allocations, custom emoji sets, and reaction animations without modifying database records on the centralized servers.

### 5. On-Device Voice Transcription (Whisper AI)
Voice and audio message transcription is handled entirely client-side without relying on third-party cloud engines:
*   Uses local Whisper models compiled to ONNX Runtime and executed directly within the web sandbox via WebGPU and WebAssembly.
*   Users can select between **Tiny** (optimized for speed and low memory profiles), **Base** (default performance threshold), and **Small** (highest accuracy).
*   Supports native language transcription and direct translation to English completely offline.

### 6. Hardware-Accelerated Glassmorphism Theme
The interface layer features a configurable depth theme:
*   Renders translucent overlays using GPU-backed `backdrop-filter: blur()` configurations across panels, menus, and sidebars.
*   Utilizes a dynamic HSL styling engine to customize color Hue (0 to 360 degrees) and Opacity (0 to 100 percent) in real time.

### 7. Responsive Native Android Container
The mobile application is compiled into an Android wrapper using the Capacitor engine, featuring specialized configurations:
*   **Viewport Management:** Binds layout parameters using standard CSS environment variables (`env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`). This ensures system taskbars and display camera cutouts do not overlap interactable components, maintaining layout consistency across diverse device orientations.
*   **Adaptive Asset Assets:** Native launchers use custom adaptive icon assets, compiled and rendered across multiple mipmap density levels (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi).

---

## Technical Specifications and Capabilities

| Capability | Standard Web Client | Clashgram Client | Implementation Vector |
| :--- | :---: | :---: | :--- |
| **Selective Read Receipts** | No | Yes | Discards `messages.readHistory` MTProto calls |
| **Typing State Hiding** | No | Yes | Short-circuits outgoing typing action streams |
| **Presence Suppressing** | No | Yes | Discards outgoing presence updates |
| **Local Message Deletion Bypass** | No | Yes | Intercepts and caches `UpdateDeleteMessages` |
| **Revision Auditing (Edits)** | No | Yes | Tracks historical state via IndexedDB cache |
| **Protected Chat Export** | No | Yes | Neutralizes DOM-level `user-select` locks |
| **Local Account Emulation** | No | Yes | Injects simulated state properties into memory selectors |
| **Local Machine Learning Audio Transcripts** | No | Yes | WebAssembly/WebGPU based ONNX Whisper engine |
| **HSL Glassmorphism Overlays** | No | Yes | Hardware-accelerated dynamic backdrop CSS variables |
| **Safe-Area Display Scaling** | No | Yes | Capacitor container with CSS safe-area bindings |

---

## Setup and Development

### Development Environment Setup
1.  Clone the repository:
    ```bash
    git clone https://github.com/ajisth69/clashgram.git
    cd clashgram
    ```
2.  Create the environment configuration file:
    ```bash
    cp .env.example .env
    ```
3.  Configure your Telegram API credentials in `.env` (obtainable from my.telegram.org):
    ```env
    CLASHGRAM_API_ID=1234567
    CLASHGRAM_API_HASH=abcdef0123456789abcdef0123456789
    ```
4.  Install dependencies:
    ```bash
    npm install
    ```
5.  Start the local development server:
    ```bash
    npm run dev
    ```

---

## Native Android Compilation

### 1. Build and Assets Synchronization
```bash
# Compile optimized production web bundle
npm run build:production

# Synchronize static web assets with the native Android container
npx cap sync android
```

### 2. Manual Android Package Compilation
To compile the APK binary from the command line interface without launching Android Studio:
```bash
# Windows Environments (PowerShell)
cd android
./gradlew assembleDebug

# Unix-like Environments (Linux / macOS)
cd android
./gradlew assembleDebug
```
The compiled, ready-to-run debug package is located at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## Continuous Integration and Delivery (CI/CD)

The application has isolated automated deployment pipelines:

### 1. Static Web Hosting (GitHub Pages)
The static web bundle utilizes the workflow defined in `.github/workflows/deploy.yml`.
*   **Triggers:** Pushes to the `main` branch.
*   **Optimizations:** Restricts execution to web-only assets using `paths-ignore` configuration on native folders, automation templates, and documentation trees.
*   **Requirements:** Store the `CLASHGRAM_API_ID` and `CLASHGRAM_API_HASH` values as GitHub Repository Secrets.

### 2. Native Package Compilation (Android Releases)
The automation configuration `.github/workflows/android-release.yml` compiles and publishes native binaries.
*   **Triggers:** Executed on version tag updates (matching `v*`) or via manual trigger.
*   **Outcome:** Sets up a clean Java 17 container, compiles the Gradle assets, and updates the release artifacts on the GitHub Releases interface.

### 3. Cloudflare Pages Configurations
To host the web assets on Cloudflare Pages:
1.  Add the repository to Cloudflare Pages.
2.  Set the **Build command** to: `npm run build:production`
3.  Set the **Build output directory** to: `dist`
4.  Configure the **Ignored builds** parameter in the dashboard configuration to skip executions for native-only commits:
    ```bash
    git diff --quiet HEAD^ HEAD -- . ':!android' ':!.github' ':!scratch' ':!docs' ':!README.md' ':!.gitignore'
    ```

---

## Frequently Asked Questions

#### Q: How safe is the client regarding account suspensions?
**A:** The application operates strictly within standard browser sandbox specifications or standard system WebViews, connecting to official MTProto endpoints. It does not automate interactions or generate spam sequences, meaning it conforms to Telegram's normal API usage patterns and remains undetectable.

#### Q: Where are the custom theme options modified?
**A:** Open the main sidebar, select **Settings**, and choose **Clashgram Settings**. You can toggle the **Native Glass Theme** and tweak the Hue and Opacity slider parameters to alter the translucency of the interface.

#### Q: Why does the voice transcriber experience a delay on its first activation?
**A:** On its initial execution, the local on-device transcription engine must download the target Whisper model weight configurations to the local IndexedDB system cache. Once downloaded, all future transcribing actions are processed locally and operate entirely offline.

#### Q: How does the local passcode secure conversation data?
**A:** Open **Settings** -> **Clashgram Settings** -> **Passcode Lock**. Configuring a passcode activates standard client-side state locks, restricting access to target chat folders and conversations until unlocked.

---

## Licenses and Attributions
Clashgram is an independent modification based on the open-source Telegram Web A client.
All original Telegram design assets, stylesheets, animations, and core algorithms are the properties of Telegram FZ-LLC. Modified and distributed under the GNU GPL v3 license agreements.
