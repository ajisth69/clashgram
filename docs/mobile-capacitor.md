# Clashgram Android Capacitor Plan

## Setup commands

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/local-notifications @capacitor/push-notifications @capacitor/filesystem
npm run build:production
npx cap add android
npx cap sync
```

Useful project commands:

```bash
npm run cap:sync
npm run android:apk:debug
npm run android:apk:release
```

This workspace also supports a local Android toolchain under `.android-toolchain`. Before the first APK build, accept the Android SDK license in your terminal:

```powershell
$env:JAVA_HOME = "$PWD\.android-toolchain\jdk"
$env:ANDROID_HOME = "$PWD\.android-toolchain\android-sdk"
$env:ANDROID_SDK_ROOT = $env:ANDROID_HOME
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --licenses
& "$env:ANDROID_HOME\cmdline-tools\latest\bin\sdkmanager.bat" --sdk_root=$env:ANDROID_HOME "platform-tools" "platforms;android-36" "build-tools;35.0.0" "build-tools;36.0.0"
npm run android:apk:debug
```

Debug APK output after a successful Android build:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

Release APK output after signing is configured:

```text
android/app/build/outputs/apk/release/app-release.apk
```

## Native configuration

The Capacitor app id is `com.clashgram.mobile`; change it before publishing if you already own a package name. Production disables WebView inspection by default. To enable it locally:

```bash
set CAPACITOR_WEBVIEW_DEBUG=1
npm run cap:sync
```

Android hardware acceleration is controlled by the generated native manifest. Keep this on the application/activity:

```xml
<application
    android:hardwareAccelerated="true"
    android:largeHeap="true"
    android:requestLegacyExternalStorage="true">
</application>
```

For notifications and public storage:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" android:maxSdkVersion="28" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<uses-permission android:name="android.permission.READ_MEDIA_VIDEO" />
<uses-permission android:name="android.permission.READ_MEDIA_AUDIO" />
```

Use `MANAGE_EXTERNAL_STORAGE` only for a real all-files manager build distributed outside Play Store review constraints:

```xml
<uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" />
```

## Notification service

Use `src/util/capacitor/NotificationService.ts` during native app bootstrap:

```ts
import NotificationService from './util/capacitor/NotificationService';

await NotificationService.init({
  onPushToken: (token) => sendTokenToBackend(token),
  onPushAction: ({ notification }) => openChat(notification.data?.chatId),
  onLocalAction: ({ notification }) => openChat(notification.extra?.chatId),
});

await NotificationService.scheduleLocalNotification({
  title: 'New message',
  body: 'Tap to open Clashgram',
  data: { chatId: '123' },
});
```

For custom Android sound, place `clashgram_notification.wav` in:

```text
android/app/src/main/res/raw/clashgram_notification.wav
```

## File storage service

Use `src/util/capacitor/FileStorageService.ts` for public documents and best-effort public downloads:

```ts
import FileStorageService from './util/capacitor/FileStorageService';

const bytes = await FileStorageService.readFileAsBytes('Clashgram/photo.jpg');
await FileStorageService.saveBase64ToPublicStorage({
  fileName: 'photo.jpg',
  base64Data,
  target: 'documents',
});
```

`Directory.Documents` maps to public Documents on Android. Public Downloads through Capacitor Filesystem is limited on Android 10+ by scoped storage; the service targets `ExternalStorage/Download` on Android for compatibility, but a production-grade Downloads picker should use Android MediaStore or the Storage Access Framework via a small native plugin.

## 60-120 FPS checklist

- Animate only `transform` and `opacity`; avoid animating `top`, `left`, `width`, `height`, `box-shadow`, or `filter` in hot paths.
- Put frequently animated elements on compositor layers with `.gpu-layer` or the `_mobilePerformance.scss` `gpu-layer` mixin.
- Use `translate3d(...)` for sheet, message-reaction, media-viewer, and composer transitions.
- Keep scroll handlers passive and use `rafThrottle` from `src/util/performanceEvents.ts`.
- Virtualize long feeds. Use `createVirtualWindow` to render only visible rows plus overscan spacers.
- Avoid synchronous measurement loops during scroll; batch reads before writes inside `requestAnimationFrame`.
- Decode large media off the hot path and pause non-visible videos/animations.
- Keep WebView debugging disabled in production and test release builds on 60 Hz and 120 Hz devices.

Virtual feed pattern:

```ts
const window = createVirtualWindow({
  itemCount: messages.length,
  itemHeight: 72,
  viewportHeight,
  scrollTop,
  overscan: 10,
});

const visibleMessages = messages.slice(window.startIndex, window.endIndex);
```

Render a top spacer with `window.beforeHeight`, visible rows, then a bottom spacer with `window.afterHeight`.
