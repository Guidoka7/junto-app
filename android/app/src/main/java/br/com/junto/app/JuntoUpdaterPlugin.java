package br.com.junto.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;
import androidx.core.content.FileProvider;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.Locale;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;

/**
 * Downloads a validated Juntô release inside the Android app's private cache.
 * Only the system Package Installer is allowed to install it (with user confirmation).
 * This component never launches a browser or requests a silent installation.
 */
@CapacitorPlugin(name = "JuntoUpdater")
public class JuntoUpdaterPlugin extends Plugin {
    private static final String ASSET_PREFIX =
        "https://github.com/Guidoka7/junto-app/releases/download/latest/";
    private static final String APK_MIME = "application/vnd.android.package-archive";
    private static final long MAX_APK_BYTES = 150L * 1024L * 1024L;
    private final ExecutorService worker = Executors.newSingleThreadExecutor();
    private final AtomicBoolean downloading = new AtomicBoolean(false);
    private final AtomicBoolean canceled = new AtomicBoolean(false);
    private volatile HttpURLConnection connection;

    private File apk() {
        File folder = new File(getContext().getCacheDir(), "updates");
        if (!folder.exists() && !folder.mkdirs()) throw new IllegalStateException("Sem espaço para atualização.");
        return new File(folder, "junto-update.apk");
    }

    private static boolean isSha(String value) {
        return value != null && value.matches("[0-9a-fA-F]{64}");
    }

    private static String hex(byte[] bytes) {
        StringBuilder out = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) out.append(String.format(Locale.ROOT, "%02x", b & 0xff));
        return out.toString();
    }

    private static String sha256(File file) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        try (FileInputStream input = new FileInputStream(file)) {
            byte[] bytes = new byte[65536];
            int length;
            while ((length = input.read(bytes)) != -1) digest.update(bytes, 0, length);
        }
        return hex(digest.digest());
    }

    private static boolean approvedDownload(String raw) {
        try {
            URL url = new URL(raw);
            if (!"https".equals(url.getProtocol()) || url.getPort() != -1 ||
                url.getUserInfo() != null || url.getRef() != null) return false;
            return "github.com".equalsIgnoreCase(url.getHost()) &&
                url.getPath().startsWith("/Guidoka7/junto-app/releases/download/latest/") &&
                url.getPath().endsWith("-teste.apk") &&
                !url.getPath().contains("..");
        } catch (Exception ignored) { return false; }
    }

    private static boolean approvedRedirect(URL url) {
        String host = url.getHost().toLowerCase(Locale.ROOT);
        return "https".equals(url.getProtocol()) && url.getPort() == -1 &&
            url.getUserInfo() == null &&
            ("github.com".equals(host) || "release-assets.githubusercontent.com".equals(host) ||
             "objects.githubusercontent.com".equals(host));
    }

    private HttpURLConnection connect(URL url) throws Exception {
        for (int i = 0; i < 6; i++) {
            if (!approvedRedirect(url)) throw new SecurityException("Origem de APK não autorizada.");
            HttpURLConnection http = (HttpURLConnection) url.openConnection();
            connection = http;
            http.setInstanceFollowRedirects(false);
            http.setConnectTimeout(15000);
            http.setReadTimeout(30000);
            http.setRequestProperty("User-Agent", "Junto-Android-Updater");
            http.setRequestProperty("Accept", "application/octet-stream");
            int code = http.getResponseCode();
            if (code == 301 || code == 302 || code == 303 || code == 307 || code == 308) {
                String target = http.getHeaderField("Location");
                if (target == null) throw new IllegalStateException("Redirecionamento inválido.");
                URL next = new URL(url, target);
                http.disconnect();
                url = next;
                continue;
            }
            if (code != 200) { http.disconnect(); throw new IllegalStateException("Download HTTP " + code); }
            return http;
        }
        throw new IllegalStateException("Redirecionamentos em excesso.");
    }

    private void progress(long received, long size) {
        JSObject info = new JSObject();
        info.put("bytes", received);
        info.put("total", size);
        info.put("percent", (int) Math.min(100L, received * 100L / size));
        notifyListeners("downloadProgress", info);
    }

    @PluginMethod
    public void downloadAndInstall(PluginCall call) {
        String url = call.getString("url");
        String expected = call.getString("sha256");
        Long size = call.getLong("apkSize");
        if (!approvedDownload(url) || !isSha(expected) || size == null ||
            size < 100000 || size > MAX_APK_BYTES) {
            call.reject("Metadados do APK inválidos. Atualize a consulta e tente de novo.");
            return;
        }
        if (!downloading.compareAndSet(false, true)) {
            call.reject("Uma atualização já está sendo baixada.");
            return;
        }
        canceled.set(false);
        worker.execute(() -> {
            File target = null, partial = null;
            try {
                target = apk();
                partial = new File(target.getParentFile(), "junto-update.part");
                if (!target.exists() || target.length() != size ||
                    !sha256(target).equalsIgnoreCase(expected)) {
                    if (partial.exists()) partial.delete();
                    HttpURLConnection http = connect(new URL(url));
                    long advertised = http.getContentLengthLong();
                    if (advertised > MAX_APK_BYTES || (advertised >= 0 && advertised != size))
                        throw new IllegalStateException("O tamanho do arquivo mudou. Verifique a nova versão.");
                    MessageDigest digest = MessageDigest.getInstance("SHA-256");
                    long received = 0, lastProgress = 0;
                    try (InputStream input = http.getInputStream();
                         FileOutputStream output = new FileOutputStream(partial)) {
                        byte[] buffer = new byte[65536];
                        int n;
                        while ((n = input.read(buffer)) != -1) {
                            if (canceled.get()) throw new InterruptedException("Cancelado");
                            received += n;
                            if (received > size || received > MAX_APK_BYTES)
                                throw new SecurityException("Arquivo maior que o APK esperado.");
                            output.write(buffer, 0, n);
                            digest.update(buffer, 0, n);
                            if (received - lastProgress >= 262144) {
                                progress(received, size);
                                lastProgress = received;
                            }
                        }
                        output.getFD().sync();
                    } finally {
                        http.disconnect();
                        connection = null;
                    }
                    if (canceled.get()) throw new InterruptedException("Cancelado");
                    if (received != size || !hex(digest.digest()).equalsIgnoreCase(expected))
                        throw new SecurityException("O APK não passou na verificação SHA-256.");
                    if (target.exists() && !target.delete()) throw new IllegalStateException("Falha ao renovar o APK.");
                    if (!partial.renameTo(target)) throw new IllegalStateException("Falha ao preparar o APK.");
                }
                progress(size, size);
                verifyPackage(target);
                JSObject result = openSystemInstaller(target);
                call.resolve(result);
            } catch (InterruptedException interrupted) {
                call.reject("Download cancelado.");
            } catch (Exception error) {
                call.reject(error.getMessage() == null ? "Não foi possível baixar o APK." : error.getMessage());
            } finally {
                if (partial != null && partial.exists()) partial.delete();
                connection = null;
                downloading.set(false);
            }
        });
    }

    @PluginMethod
    public void cancelDownload(PluginCall call) {
        canceled.set(true);
        HttpURLConnection active = connection;
        if (active != null) active.disconnect();
        call.resolve(new JSObject().put("canceled", true));
    }

    @PluginMethod
    public void installDownloaded(PluginCall call) {
        String expected = call.getString("sha256");
        Long size = call.getLong("apkSize");
        if (!isSha(expected) || size == null || size < 100000 || size > MAX_APK_BYTES) {
            call.reject("Versão inválida. Consulte as atualizações novamente.");
            return;
        }
        worker.execute(() -> {
            try {
                if (downloading.get()) throw new IllegalStateException("Aguarde o download terminar.");
                File file = apk();
                if (!file.isFile() || file.length() != size ||
                    !sha256(file).equalsIgnoreCase(expected))
                    throw new IllegalStateException("APK indisponível ou desatualizado. Baixe novamente.");
                verifyPackage(file);
                call.resolve(openSystemInstaller(file));
            } catch (Exception error) {
                call.reject(error.getMessage() == null ? "Falha ao instalar o APK." : error.getMessage());
            }
        });
    }

    private void verifyPackage(File file) throws Exception {
        PackageManager pm = getContext().getPackageManager();
        PackageInfo archive, installed;
        if (Build.VERSION.SDK_INT >= 28) {
            archive = pm.getPackageArchiveInfo(file.getAbsolutePath(), PackageManager.GET_SIGNING_CERTIFICATES);
            installed = pm.getPackageInfo(getContext().getPackageName(), PackageManager.GET_SIGNING_CERTIFICATES);
        } else {
            archive = pm.getPackageArchiveInfo(file.getAbsolutePath(), PackageManager.GET_SIGNATURES);
            installed = pm.getPackageInfo(getContext().getPackageName(), PackageManager.GET_SIGNATURES);
        }
        if (archive == null || !getContext().getPackageName().equals(archive.packageName))
            throw new SecurityException("O APK não pertence ao Juntô.");
        Signature[] oldCerts = Build.VERSION.SDK_INT >= 28
            ? installed.signingInfo.getApkContentsSigners() : installed.signatures;
        Signature[] newCerts = Build.VERSION.SDK_INT >= 28
            ? archive.signingInfo.getApkContentsSigners() : archive.signatures;
        if (oldCerts == null || newCerts == null || oldCerts.length == 0 ||
            !Arrays.equals(oldCerts, newCerts))
            throw new SecurityException("A assinatura do APK não corresponde à instalação atual.");
        long oldVersion = Build.VERSION.SDK_INT >= 28
            ? installed.getLongVersionCode() : installed.versionCode;
        long newVersion = Build.VERSION.SDK_INT >= 28
            ? archive.getLongVersionCode() : archive.versionCode;
        if (newVersion < oldVersion) throw new SecurityException("Versão antiga bloqueada.");
    }

    private JSObject openSystemInstaller(File file) throws Exception {
        if (Build.VERSION.SDK_INT >= 26 &&
            !getContext().getPackageManager().canRequestPackageInstalls()) {
            Intent settings = new Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                Uri.parse("package:" + getContext().getPackageName()));
            settings.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            try {
                getContext().startActivity(settings);
            } catch (ActivityNotFoundException e) {
                throw new IllegalStateException("Abra as permissões do Android e autorize instalar apps pelo Juntô.");
            }
            return new JSObject().put("status", "permissionRequired");
        }
        Uri uri = FileProvider.getUriForFile(getContext(),
            getContext().getPackageName() + ".fileprovider", file);
        Intent install = new Intent(Intent.ACTION_VIEW);
        install.setDataAndType(uri, APK_MIME);
        install.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION | Intent.FLAG_ACTIVITY_NEW_TASK);
        install.setClipData(android.content.ClipData.newRawUri("Juntô atualização", uri));
        try {
            getContext().startActivity(install);
        } catch (ActivityNotFoundException e) {
            throw new IllegalStateException("O instalador do Android não está disponível.");
        }
        return new JSObject().put("status", "installerOpened");
    }
}
