param(
  [ValidateSet('assembleDebug', 'assembleRelease')]
  [string] $Task = 'assembleDebug'
)

$ErrorActionPreference = 'Stop'

$root = Resolve-Path (Join-Path $PSScriptRoot '..')
$toolchain = Join-Path $root '.android-toolchain'
$jdkRoot = Join-Path $toolchain 'jdk'
$sdkRoot = Join-Path $toolchain 'android-sdk'
$sdkManager = Join-Path $sdkRoot 'cmdline-tools\latest\bin\sdkmanager.bat'
$gradleWrapper = Join-Path $root 'android\gradlew.bat'
$localProperties = Join-Path $root 'android\local.properties'

if (-not (Test-Path (Join-Path $jdkRoot 'bin\java.exe'))) {
  throw "Missing workspace JDK at $jdkRoot"
}

if (-not (Test-Path $sdkManager)) {
  throw "Missing Android SDK command-line tools at $sdkManager"
}

$env:JAVA_HOME = $jdkRoot
$env:ANDROID_HOME = $sdkRoot
$env:ANDROID_SDK_ROOT = $sdkRoot
$env:PATH = "$jdkRoot\bin;$sdkRoot\platform-tools;$env:PATH"

$sdkDir = $sdkRoot.Replace('\', '/')
Set-Content -LiteralPath $localProperties -Value "sdk.dir=$sdkDir"

Push-Location (Join-Path $root 'android')
try {
  & $gradleWrapper $Task
  if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
  }
} finally {
  Pop-Location
}
