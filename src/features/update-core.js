// Pure update metadata validation; never trust release descriptions as executable code.
const RELEASE_ASSET = /^Junto-[A-Za-z0-9.-]+-teste\.apk$/;
const SHA = /^[0-9a-f]{40}$/;
const SHA256 = /^[0-9a-f]{64}$/;

export function parseApkRelease(release) {
  const match = typeof release?.body === 'string' && release.body.match(/<!-- junto-apk\s*\n([\s\S]*?)\n-->/);
  if (!match || release.draft || release.tag_name !== 'latest') return null;
  let m;
  try { m = JSON.parse(match[1]); } catch { return null; }
  if (m.channel !== 'main' || m.platform !== 'android' || m.testBuild !== true ||
      m.signing !== 'debug' || !SHA.test(m.commitSha || '') ||
      !SHA256.test(m.sha256 || '') || !SHA256.test(m.certificateSha256 || '') ||
      !RELEASE_ASSET.test(m.assetName || '') || !Number.isSafeInteger(m.runNumber) ||
      m.runNumber < 1 || !Number.isSafeInteger(m.apkSize) || m.apkSize < 100000 ||
      typeof m.version !== 'string' || m.version.length > 100) return null;
  const asset = release.assets?.find(a => a.name === m.assetName &&
    a.state === 'uploaded' && a.size === m.apkSize);
  if (!asset) return null;
  let valid = false;
  try {
    const uri = new URL(asset.browser_download_url);
    valid = uri.origin === 'https://github.com' &&
      uri.pathname === '/Guidoka7/junto-app/releases/download/latest/' + m.assetName;
  } catch { return null; }
  if (!valid) return null;
  return {version:m.version,packageVersion:m.packageVersion,commitSha:m.commitSha,
    runNumber:m.runNumber,runAttempt:Number(m.runAttempt || 1),apkSize:m.apkSize,
    builtAt:m.builtAt,assetName:m.assetName,sha256:m.sha256,
    certificateSha256:m.certificateSha256,downloadUrl:asset.browser_download_url};
}

export function isNewerApk(current, latest) {
  if (!latest || !current || !current.version) return false;
  if (current.commitSha && current.commitSha === latest.commitSha) return false;
  const currentRun = Number(current.runNumber);
  const latestRun = Number(latest.runNumber);
  if (Number.isSafeInteger(currentRun) && currentRun > 0) {
    if (latestRun !== currentRun) return latestRun > currentRun;
    const attempt = Number(current.runAttempt || current.version.match(/\.(\d+)$/)?.[1] || 1);
    return latest.runAttempt > attempt;
  }
  // Legacy builds without a GitHub run ID: a higher package version is comparable.
  const parse = x => String(x || '').match(/^(\d+)\.(\d+)\.(\d+)$/)?.slice(1).map(Number);
  const old = parse(current.packageVersion || current.version), next = parse(latest.packageVersion);
  if (!old || !next) return false;
  for (let i=0;i<3;i++) if (old[i] !== next[i]) return next[i] > old[i];
  return false;
}
