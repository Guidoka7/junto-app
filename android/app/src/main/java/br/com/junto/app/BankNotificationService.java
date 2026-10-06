package br.com.junto.app;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.service.notification.NotificationListenerService;
import android.service.notification.StatusBarNotification;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import org.json.JSONObject;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.text.NumberFormat;
import java.util.Locale;

public class BankNotificationService extends NotificationListenerService {
    static final String CHANNEL = "junto_bank_review";
    @Override public void onNotificationPosted(StatusBarNotification sbn) {
        if (sbn == null || !BankStore.enabled(this) || !BankStore.allowed(this).contains(sbn.getPackageName())) return;
        Notification n = sbn.getNotification();
        if (n == null || (n.flags & Notification.FLAG_GROUP_SUMMARY) != 0) return;
        Bundle extras = n.extras; if (extras == null) return;
        String title = String.valueOf(extras.getCharSequence(Notification.EXTRA_TITLE, ""));
        String body = String.valueOf(extras.getCharSequence(Notification.EXTRA_BIG_TEXT,
            extras.getCharSequence(Notification.EXTRA_TEXT, "")));
        if (body.length() > 2000 || title.length() > 300) return;
        BankNotificationParser.Result result = BankNotificationParser.parse(title, body);
        if (result == null) return;
        try {
            long when = n.when > 0 ? n.when : sbn.getPostTime();
            byte[] bytes = MessageDigest.getInstance("SHA-256").digest(
                (sbn.getPackageName() + "|" + sbn.getKey() + "|" + when + "|" + result.direction + "|" + result.amount).getBytes(StandardCharsets.UTF_8));
            StringBuilder hash = new StringBuilder(); for (byte b : bytes) hash.append(String.format(Locale.ROOT, "%02x", b));
            String id = hash.toString();
            JSONObject event = new JSONObject().put("id", id).put("amount", result.amount)
                .put("direction", result.direction).put("method", result.method).put("timestamp", when)
                .put("bank", BankStore.BANKS.get(sbn.getPackageName())).put("packageName", sbn.getPackageName())
                .put("preview", (title + "\n" + body).substring(0, Math.min(600, title.length() + 1 + body.length())));
            if (!BankStore.add(this, event)) return;
            sendBroadcast(new Intent(BankStore.ACTION).setPackage(getPackageName()));
            prompt(event);
        } catch (Exception ignored) { /* Ignore unsupported content without logging financial text. */ }
    }
    private void prompt(JSONObject event) throws Exception {
        if (Build.VERSION.SDK_INT >= 33 && ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return;
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (Build.VERSION.SDK_INT >= 26) manager.createNotificationChannel(new NotificationChannel(CHANNEL, "Confirmar movimentos bancários", NotificationManager.IMPORTANCE_DEFAULT));
        String id = event.getString("id");
        Intent open = new Intent(this, MainActivity.class).setAction("br.com.junto.app.REVIEW_BANK_EVENT")
            .setData(Uri.parse("junto://bank/" + id)).putExtra("bank_event_id", id)
            .addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent content = PendingIntent.getActivity(this, id.hashCode(), open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
        boolean income = "income".equals(event.getString("direction"));
        String amount = NumberFormat.getCurrencyInstance(new Locale("pt", "BR")).format(event.getLong("amount") / 100.0);
        Notification hidden = new NotificationCompat.Builder(this, CHANNEL).setSmallIcon(R.drawable.ic_bank_notice)
            .setContentTitle("Juntô").setContentText("Há um movimento para conferir.").build();
        Notification notice = new NotificationCompat.Builder(this, CHANNEL).setSmallIcon(R.drawable.ic_bank_notice)
            .setContentTitle(income ? "Entrou " + amount + ". Confirmar?" : "Saiu " + amount + ". Com o que você gastou?")
            .setContentText("Toque para conferir no Juntô. Nada foi registrado ainda.")
            .setContentIntent(content).setAutoCancel(true).setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .setPublicVersion(hidden).setCategory(NotificationCompat.CATEGORY_REMINDER).build();
        manager.notify(id, 0, notice);
    }
}
