param([string]$SdkPath, [string]$GradlePath, [switch]$Offline, [switch]$SkipWebBuild)
$ErrorActionPreference = 'Stop'
$androidWorkspace = Split-Path $PSScriptRoot -Parent
$androidProject = Join-Path $androidWorkspace 'android'
$releaseConfig = Get-Content -LiteralPath (Join-Path $androidProject 'app/build.gradle') -Raw
$releaseVersion = [regex]::Match($releaseConfig, "versionName\s+'([0-9]+\.[0-9]+\.[0-9]+)'").Groups[1].Value
if (-not $releaseVersion) { throw 'Android release versionName must use major.minor.patch.' }
$androidEvidence = Join-Path $androidWorkspace "output/verification/android-release-$releaseVersion"
$apkPath = Join-Path $androidWorkspace "output/releases/Taman-Jawi-$releaseVersion-release.apk"
if (Test-Path -LiteralPath $apkPath) { throw "Release already exists: $apkPath. Increase the Android version before producing another release." }
$androidJdk = $env:JAVA_HOME
if (-not $SdkPath) {
    $SdkPath = $env:ANDROID_SDK_ROOT
    if (-not $SdkPath) { $SdkPath = $env:ANDROID_HOME }
    if (-not $SdkPath) {
        $sdkCandidates = @((Join-Path $env:LOCALAPPDATA 'Android\Sdk'))
        $unityEditors = 'C:\Program Files\Unity\Hub\Editor'
        if (Test-Path -LiteralPath $unityEditors) {
            $sdkCandidates += @(Get-ChildItem -LiteralPath $unityEditors -Directory | ForEach-Object {
                Join-Path $_.FullName 'Editor\Data\PlaybackEngines\AndroidPlayer\SDK'
            })
        }
        $SdkPath = $sdkCandidates | Where-Object { Test-Path -LiteralPath (Join-Path $_ 'build-tools\36.0.0\apksigner.bat') } | Select-Object -First 1
    }
}
if (-not $SdkPath) { throw 'Android SDK 36 and Build Tools 36.0.0 are required.' }
if (-not $androidJdk -or -not (Test-Path -LiteralPath (Join-Path $androidJdk 'bin\keytool.exe'))) { throw 'Set JAVA_HOME to JDK 17.' }
if (-not $GradlePath) {
    $gradleCandidates = @(Get-ChildItem -Path (Join-Path $env:USERPROFILE '.gradle\wrapper\dists\gradle-8.14.3-*\*\gradle-8.14.3\bin\gradle.bat') -ErrorAction SilentlyContinue)
    if ($gradleCandidates.Count) { $GradlePath = $gradleCandidates[0].FullName }
    elseif (Test-Path -LiteralPath (Join-Path $androidProject 'gradlew.bat')) { $GradlePath = Join-Path $androidProject 'gradlew.bat' }
    else { throw 'Gradle 8.14.3 is required; pass -GradlePath or use the Gradle wrapper.' }
}
$env:GRADLE_USER_HOME = Join-Path $androidWorkspace '.tools\android-gradle'
$env:ANDROID_USER_HOME = Join-Path $androidWorkspace '.tools\android-user'
New-Item -ItemType Directory -Force -Path $env:ANDROID_USER_HOME | Out-Null
$signingFile = Join-Path $androidProject 'signing.properties'
if (-not (Test-Path -LiteralPath $signingFile)) {
    $keyDirectory = Join-Path $androidProject 'keys'; New-Item -ItemType Directory -Force -Path $keyDirectory | Out-Null
    $keyPath = Join-Path $keyDirectory 'taman-jawi-release.jks'
    if (Test-Path -LiteralPath $keyPath) { throw 'Existing release key found. Restore signing.properties instead of replacing its identity.' }
    $keyBytes = New-Object byte[] 32
    $keyRandom = [Security.Cryptography.RandomNumberGenerator]::Create()
    try { $keyRandom.GetBytes($keyBytes) } finally { $keyRandom.Dispose() }
    $keyPassword = [Convert]::ToBase64String($keyBytes)
    $temporaryPasswordFile = Join-Path $keyDirectory 'key-password.tmp'
    [IO.File]::WriteAllText($temporaryPasswordFile, $keyPassword)
    try {
        $ErrorActionPreference = 'Continue'
        & (Join-Path $androidJdk 'bin\keytool.exe') -genkeypair -alias tamanjawi -keyalg RSA -keysize 3072 -validity 10000 -keystore $keyPath -storetype JKS -storepass:file $temporaryPasswordFile -keypass:file $temporaryPasswordFile -dname 'CN=Taman Jawi, OU=Android, O=Hanana Academy, C=MY' 2>&1 | Out-Null
        $ErrorActionPreference = 'Stop'
        if ($LASTEXITCODE -ne 0) { throw 'Release key creation failed.' }
        [IO.File]::WriteAllText($signingFile, "storeFile=keys/taman-jawi-release.jks`nstorePassword=$keyPassword`nkeyAlias=tamanjawi`nkeyPassword=$keyPassword`n")
    } finally { Remove-Item -LiteralPath $temporaryPasswordFile -ErrorAction SilentlyContinue; $keyPassword = $null }
}
[IO.File]::WriteAllText((Join-Path $androidProject 'local.properties'), 'sdk.dir=' + $SdkPath.Replace('\','/').Replace(':','\:') + "`n")
Push-Location $androidWorkspace
try {
    if (-not $SkipWebBuild) { npm run build; if ($LASTEXITCODE -ne 0) { throw 'Web build failed.' } }
    node scripts/sync-android-assets.js $androidEvidence; if ($LASTEXITCODE -ne 0) { throw 'Android asset sync failed.' }
    $gradleArguments = @('-p', $androidProject, ':app:assembleRelease', ':app:lintRelease', '--no-daemon', '--console=plain')
    if ($Offline) { $gradleArguments += '--offline' }
    & $GradlePath @gradleArguments
    if ($LASTEXITCODE -ne 0) { throw 'Android release build or lint failed.' }
    $releaseDirectory = Join-Path $androidWorkspace 'output\releases'; New-Item -ItemType Directory -Force -Path $releaseDirectory | Out-Null
    Copy-Item -LiteralPath (Join-Path $androidProject 'app\build\outputs\apk\release\app-release.apk') -Destination $apkPath
    & (Join-Path $SdkPath 'build-tools\36.0.0\apksigner.bat') verify --verbose --print-certs $apkPath
    if ($LASTEXITCODE -ne 0) { throw 'APK signature verification failed.' }
    (Get-FileHash -LiteralPath $apkPath -Algorithm SHA256).Hash | Set-Content -LiteralPath ($apkPath + '.sha256')
    Write-Output "Release APK: $apkPath"
} finally { Pop-Location }
