param([Parameter(Mandatory=$true)][string]$SdkPath, [string]$ApkPath, [string]$EvidencePath)
$ErrorActionPreference = 'Stop'
$androidWorkspace = Split-Path $PSScriptRoot -Parent
$releaseConfig = Get-Content -LiteralPath (Join-Path $androidWorkspace 'android/app/build.gradle') -Raw
$releaseVersion = [regex]::Match($releaseConfig, "versionName\s+'([0-9]+\.[0-9]+\.[0-9]+)'").Groups[1].Value
$releaseCode = [regex]::Match($releaseConfig, 'versionCode\s+(\d+)').Groups[1].Value
if (-not $releaseVersion -or -not $releaseCode) { throw 'Android release version metadata is missing.' }
if (-not $ApkPath) { $ApkPath = Join-Path $androidWorkspace "output/releases/Taman-Jawi-$releaseVersion-release.apk" }
if (-not $EvidencePath) { $EvidencePath = Join-Path $androidWorkspace "output/verification/android-release-$releaseVersion" }
$androidEvidence = $EvidencePath
$androidTools = Join-Path $SdkPath 'build-tools/36.0.0'
$badging = & (Join-Path $androidTools 'aapt2.exe') dump badging $ApkPath
if ($LASTEXITCODE -ne 0) { throw 'APK metadata could not be read.' }
$manifest = & (Join-Path $androidTools 'aapt2.exe') dump xmltree $ApkPath --file AndroidManifest.xml
if ($LASTEXITCODE -ne 0) { throw 'APK manifest could not be read.' }
$signature = & (Join-Path $androidTools 'apksigner.bat') verify --verbose --print-certs $ApkPath
if ($LASTEXITCODE -ne 0) { throw 'APK signature is invalid.' }
$alignment = & (Join-Path $androidTools 'zipalign.exe') -c -v 4 $ApkPath
if ($LASTEXITCODE -ne 0) { throw 'APK alignment is invalid.' }
if (($manifest -join "`n") -match 'android:debuggable.*0xffffffff') { throw 'Release APK is debuggable.' }
if (($manifest -join "`n") -match 'uses-permission') { throw 'Unexpected Android permission in offline APK.' }
$expectedIdentity = "package: name='com.hananaacademy.tamanjawi' versionCode='$releaseCode' versionName='$releaseVersion'"
if (($badging -join "`n") -notmatch [regex]::Escape($expectedIdentity)) { throw 'Unexpected package identity.' }
if (($badging -join "`n") -notmatch "sdkVersion:'26'" -or ($badging -join "`n") -notmatch "targetSdkVersion:'36'") { throw 'Unexpected Android compatibility.' }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$assetRecord = Get-Content -LiteralPath (Join-Path $androidEvidence 'bundled-assets.json') -Raw | ConvertFrom-Json
$letters = Get-Content -LiteralPath (Join-Path $androidWorkspace 'src/content/letters.json') -Raw | ConvertFrom-Json
foreach ($letter in $letters) {
    if (-not $assetRecord.files.PSObject.Properties[$letter.audio.name.src.TrimStart('/')]) { throw "Missing active recording for $($letter.id)." }
}
$apkArchive = [IO.Compression.ZipFile]::OpenRead($ApkPath)
$checkedAssets = 0
try {
    foreach ($property in $assetRecord.files.PSObject.Properties) {
        $entry = $apkArchive.GetEntry('assets/' + $property.Name)
        if (-not $entry) { throw "Missing packaged game asset: $($property.Name)" }
        $entryStream = $entry.Open(); $hasher = [Security.Cryptography.SHA256]::Create()
        try { $actualHash = ([BitConverter]::ToString($hasher.ComputeHash($entryStream))).Replace('-','').ToLowerInvariant() }
        finally { $entryStream.Dispose(); $hasher.Dispose() }
        if ($actualHash -ne $property.Value) { throw "Changed packaged game asset: $($property.Name)" }
        $checkedAssets++
    }
    $packagedAssets = @($apkArchive.Entries | Where-Object { $_.FullName.StartsWith('assets/') -and $_.Name }).Count
    if ($packagedAssets -ne $checkedAssets) { throw 'APK contains untracked game assets.' }
    if (-not $apkArchive.GetEntry('classes.dex')) { throw 'Android entry code is missing.' }
    $unexpected = @($apkArchive.Entries | Where-Object { $_.FullName -match '(?i)(\.jks$|\.keystore$|signing\.properties$|local\.properties$|^lib/)' })
    if ($unexpected.Count) { throw 'Unexpected signing/configuration/native-library file in APK.' }
} finally { $apkArchive.Dispose() }
$sha256 = (Get-FileHash -LiteralPath $ApkPath -Algorithm SHA256).Hash.ToLowerInvariant()
$sidecar = (Get-Content -LiteralPath ($ApkPath + '.sha256') -Raw).Trim().ToLowerInvariant()
if ($sha256 -ne $sidecar) { throw 'APK checksum file does not match.' }
$badging | Set-Content -LiteralPath (Join-Path $androidEvidence 'apk-badging.txt')
$manifest | Set-Content -LiteralPath (Join-Path $androidEvidence 'apk-manifest.txt')
$signature | Set-Content -LiteralPath (Join-Path $androidEvidence 'apk-signature.txt')
$alignment | Set-Content -LiteralPath (Join-Path $androidEvidence 'apk-alignment.txt')
[ordered]@{
    verifiedAt = [DateTime]::UtcNow.ToString('o'); apk = $ApkPath; bytes = (Get-Item -LiteralPath $ApkPath).Length
    sha256 = $sha256; package = 'com.hananaacademy.tamanjawi'; version = $releaseVersion; versionCode = [int]$releaseCode
    minSdk = 26; targetSdk = 36; signatureVerified = $true; alignmentVerified = $true
    debuggable = $false; permissions = @(); matchingBundledAssets = $checkedAssets
    activeLetterRecordings = $letters.Count
    deviceInstallTest = 'Not run: no Android device or emulator connected.'
} | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $androidEvidence 'apk-verification.json')
Write-Output "Verified release signature, alignment, metadata, checksum and all $checkedAssets bundled assets."
