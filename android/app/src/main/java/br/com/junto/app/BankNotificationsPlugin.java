package br.com.junto.app;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationManager;
import android.content.BroadcastReceiver;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.os.Build;
import android.provider.Settings;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.content.ContextCompat;
import androidx.activity.result.ActivityResult;
import com.getcapacitor.JSArray;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.ActivityCallback;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;

@CapacitorPlugin(name = "BankNotifications", permissions = {
    @Permission(alias = "postNotifications", strings = {Manifest.permission.POST_NOTIFICATIONS})
})
public class BankNotificationsPlugin extends Plugin {
    private BroadcastReceiver receiver;
    @Override public void load() {
        receiver = new BroadcastReceiver() { @Override public void onReceive(Context context, Intent intent) {
            notifyListeners("bankEvent", new JSObject().put("pending", BankStore.pending(context).length()), true);
        }};
        ContextCompat.registerReceiver(getContext(), receiver, new IntentFilter(BankStore.ACTION), ContextCompat.RECEIVER_NOT_EXPORTED);
    }
    @Override protected void handleOnDestroy() {
        if (receiver != null) { getContext().unregisterReceiver(receiver); receiver = null; }
    }
    @Override protected void handleOnNewIntent(Intent intent) {
        getActivity().setIntent(intent);
        String id = intent.getStringExtra("bank_event_id");
        if (id != null && id.matches("[a-f0-9]{64}")) notifyListeners("bankEvent", new JSObject().put("id", id), true);
    }
    private JSObject status() {
        JSObject out = new JSObject();
        out.put("enabled", BankStore.enabled(getContext()));
        out.put("accessGranted", NotificationManagerCompat.getEnabledListenerPackages(getContext()).contains(getContext().getPackageName()));
        out.put("promptsGranted", NotificationManagerCompat.from(getContext()).areNotificationsEnabled());
        out.put("packages", new JSArray(BankStore.allowed(getContext())));
        out.put("pending", BankStore.pending(getContext()).length());
        return out;
    }
    @PluginMethod public void getStatus(PluginCall call) { call.resolve(status()); }
    @PluginMethod public void getPending(PluginCall call) {
        JSArray events = new JSArray(); org.json.JSONArray pending = BankStore.pending(getContext());
        for (int i = 0; i < pending.length(); i++) events.put(pending.optJSONObject(i));
        call.resolve(new JSObject().put("events", events));
    }
    @PluginMethod public void getLaunchEvent(PluginCall call) {
        String id = getActivity().getIntent().getStringExtra("bank_event_id");
        getActivity().getIntent().removeExtra("bank_event_id");
        call.resolve(new JSObject().put("id", id));
    }
    @PluginMethod public void listBanks(PluginCall call) {
        JSArray banks = new JSArray(); PackageManager pm = getContext().getPackageManager();
        for (Map.Entry<String, String> bank : BankStore.BANKS.entrySet()) {
            boolean installed; try { pm.getApplicationInfo(bank.getKey(), 0); installed = true; } catch (PackageManager.NameNotFoundException e) { installed = false; }
            banks.put(new JSObject().put("packageName", bank.getKey()).put("name", bank.getValue()).put("installed", installed));
        }
        call.resolve(new JSObject().put("banks", banks));
    }
    @PluginMethod public void setEnabled(PluginCall call) {
        boolean enabled = Boolean.TRUE.equals(call.getBoolean("enabled", false));
        if (enabled && !Boolean.TRUE.equals(call.getBoolean("consent", false))) { call.reject("Confirme a autorização de leitura."); return; }
        Set<String> selected = new HashSet<>();
        JSArray packages = call.getArray("packages", new JSArray());
        for (int i = 0; i < packages.length(); i++) {
            String value = packages.optString(i); if (BankStore.BANKS.containsKey(value)) selected.add(value);
        }
        if (enabled && selected.isEmpty()) { call.reject("Escolha pelo menos um banco ou carteira."); return; }
        BankStore.prefs(getContext()).edit().putBoolean("enabled", enabled).putStringSet("packages", selected).commit();
        if (!enabled) { BankStore.clear(getContext()); getContext().getSystemService(NotificationManager.class).cancelAll(); }
        if (enabled) NotificationListenerServiceRequest.rebind(getContext());
        call.resolve(status());
    }
    @PluginMethod public void openNotificationSettings(PluginCall call) {
        getActivity().startActivity(new Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS)); call.resolve();
    }
    @PluginMethod public void requestPrompts(PluginCall call) {
        if (Build.VERSION.SDK_INT < 33 || getPermissionState("postNotifications") == PermissionState.GRANTED) { call.resolve(status()); return; }
        requestPermissionForAlias("postNotifications", call, "promptsCallback");
    }
    @PermissionCallback private void promptsCallback(PluginCall call) { call.resolve(status()); }
    @PluginMethod public void acknowledge(PluginCall call) {
        String id = call.getString("id", "");
        if (!id.matches("[a-f0-9]{64}")) { call.reject("Movimento inválido."); return; }
        if (!BankStore.acknowledge(getContext(), id)) { call.reject("Não foi possível atualizar a lista."); return; }
        getContext().getSystemService(NotificationManager.class).cancel(id, 0); call.resolve();
    }
    @PluginMethod public void clearPending(PluginCall call) {
        BankStore.clear(getContext()); getContext().getSystemService(NotificationManager.class).cancelAll(); call.resolve();
    }
    @PluginMethod public void exportFile(PluginCall call) {
        String name = call.getString("name", ""), contents = call.getString("contents", "");
        if (!name.matches("Junto-[A-Za-z0-9._-]+\\.json") || name.contains("..") || name.length() > 100 || contents.isEmpty() || contents.length() > 32 * 1024 * 1024) {
            call.reject("A cópia de segurança é inválida ou grande demais."); return;
        }
        Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
            .setType("application/json").putExtra(Intent.EXTRA_TITLE, name);
        getBridge().executeOnMainThread(() -> {
            try { startActivityForResult(call, intent, "exportCallback"); }
            catch (Exception e) { call.reject("Não foi possível abrir a tela para salvar a cópia.", e); }
        });
    }
    @ActivityCallback protected void exportCallback(PluginCall call, ActivityResult result) {
        if (call == null) return;
        Intent data = result.getData();
        if (result.getResultCode() != Activity.RESULT_OK || data == null || data.getData() == null) {
            call.resolve(new JSObject().put("saved", false)); return;
        }
        getBridge().execute(() -> {
            try (OutputStream output = getContext().getContentResolver().openOutputStream(data.getData(), "wt")) {
                if (output == null) throw new java.io.IOException("Destino indisponível");
                output.write(call.getString("contents", "").getBytes(StandardCharsets.UTF_8));
                output.flush();
                call.resolve(new JSObject().put("saved", true));
            } catch (Exception e) { call.reject("Não foi possível salvar a cópia nesse destino.", e); }
        });
    }
    private static final class NotificationListenerServiceRequest {
        static void rebind(Context context) {
            android.service.notification.NotificationListenerService.requestRebind(new ComponentName(context, BankNotificationService.class));
        }
    }
}
