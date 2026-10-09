package br.com.junto.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/**
 * Opens the official APK endpoint in the system browser.
 * Android handles the download and requires explicit user approval for installation.
 * No unknown-sources permission and no background/silent package installer.
 */
@CapacitorPlugin(name = "JuntoUpdater")
public class JuntoUpdaterPlugin extends Plugin {
    private static final Uri DOWNLOAD = Uri.parse("https://junto-updates.vercel.app/apk");

    @PluginMethod
    public void openDownload(PluginCall call) {
        try {
            Intent intent = new Intent(Intent.ACTION_VIEW, DOWNLOAD);
            intent.addCategory(Intent.CATEGORY_BROWSABLE);
            getActivity().startActivity(intent);
            call.resolve(new JSObject().put("opened", true));
        } catch (ActivityNotFoundException | SecurityException ex) {
            call.reject("Nenhum navegador disponível para baixar a atualização.");
        }
    }
}
