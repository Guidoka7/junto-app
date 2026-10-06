package br.com.junto.app;

import android.content.Context;
import android.content.SharedPreferences;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

/** Private on-device inbox. Raw notification text is never included in a cloud snapshot. */
final class BankStore {
    static final String ACTION = "br.com.junto.app.BANK_EVENT_AVAILABLE";
    static final Map<String, String> BANKS;
    static {
        LinkedHashMap<String, String> banks = new LinkedHashMap<>();
        banks.put("com.nu.production", "Nubank"); banks.put("br.com.intermedium", "Inter");
        banks.put("com.itau", "Itaú"); banks.put("com.itaucard", "Itaú Cartões");
        banks.put("br.com.bb.android", "Banco do Brasil"); banks.put("br.com.gabba.Caixa", "Caixa");
        banks.put("com.santander.app", "Santander"); banks.put("com.bradesco", "Bradesco");
        banks.put("com.c6bank.app", "C6 Bank"); banks.put("com.picpay", "PicPay");
        banks.put("com.mercadopago.wallet", "Mercado Pago"); banks.put("br.com.uol.ps.myaccount", "PagBank");
        banks.put("br.com.neon", "Neon"); banks.put("br.com.bradesco.next", "Next");
        banks.put("com.transferwise.android", "Wise");
        banks.put("com.btg.pactual.digital.mobile", "BTG Pactual"); banks.put("br.com.bancopan.cartoes", "Banco PAN");
        banks.put("com.votorantim.bvpd", "Banco BV"); banks.put("br.com.sicoobnet", "Sicoob");
        banks.put("br.com.sicredi.app", "Sicredi"); banks.put("br.livetouch.safra.net", "Safra");
        banks.put("com.google.android.apps.walletnfcrel", "Google Wallet");
        BANKS = Collections.unmodifiableMap(banks);
    }
    static SharedPreferences prefs(Context c) { return c.getSharedPreferences("junto_bank_inbox", Context.MODE_PRIVATE); }
    static boolean enabled(Context c) { return prefs(c).getBoolean("enabled", false); }
    static Set<String> allowed(Context c) { return prefs(c).getStringSet("packages", Collections.emptySet()); }
    static synchronized JSONArray pending(Context c) {
        try { return new JSONArray(prefs(c).getString("pending", "[]")); } catch (Exception e) { return new JSONArray(); }
    }
    static synchronized boolean add(Context c, JSONObject event) {
        try {
            SharedPreferences p = prefs(c);
            JSONObject seen = new JSONObject(p.getString("seen", "{}"));
            String id = event.getString("id"); if (seen.has(id)) return false;
            long now = System.currentTimeMillis();
            java.util.Iterator<String> keys = seen.keys();
            while (keys.hasNext()) { String key = keys.next(); if (now - seen.optLong(key) > 30L * 86400000L) keys.remove(); }
            if (seen.length() >= 4000) return false;
            JSONArray queue = pending(c);
            // Keep existing candidates rather than silently dropping older ones.
            if (queue.length() >= 500) return false;
            queue.put(event); seen.put(id, now);
            return p.edit().putString("pending", queue.toString()).putString("seen", seen.toString()).commit();
        } catch (Exception e) { return false; }
    }
    static synchronized boolean acknowledge(Context c, String id) {
        JSONArray next = new JSONArray(), queue = pending(c);
        for (int i = 0; i < queue.length(); i++) { JSONObject e = queue.optJSONObject(i); if (e != null && !id.equals(e.optString("id"))) next.put(e); }
        return prefs(c).edit().putString("pending", next.toString()).commit();
    }
    static synchronized void clear(Context c) { prefs(c).edit().remove("pending").remove("seen").commit(); }
    private BankStore() { }
}
