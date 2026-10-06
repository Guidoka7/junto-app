package br.com.junto.app;

import java.text.Normalizer;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Pure Java: only confirmed movements with an unambiguous amount are candidates. */
public final class BankNotificationParser {
    private static final Pattern MONEY = Pattern.compile("(?i)(?:R\\$|BRL)\\s*([0-9]{1,3}(?:\\.[0-9]{3})*(?:,[0-9]{2})?|[0-9]+(?:[,.][0-9]{2})?)(?![0-9]|[.,][0-9])");
    private static final Pattern REJECT = Pattern.compile("cancelad|estorn|devolu|recusad|negad|falhou|falha|pendente|agendad|solicitou|solicitacao|pedido de pix|codigo de|verificacao|senha|nao (?:foi|realiz|autoriz)");
    private static final Pattern IN = Pattern.compile("pix receb|recebeu (?:um )?pix|transferencia recebida|dinheiro (?:receb|entrou)|credito (?:em|na) (?:sua )?conta|deposito (?:recebido|realizado)|voce recebeu");
    private static final Pattern OUT = Pattern.compile("pix (?:enviad|realizad|efetuad)|enviou (?:um )?pix|transferencia (?:realizada|enviada)|compra (?:aprovada|realizada)|voce comprou|pagamento (?:aprovado|realizado|efetuado)|voce pagou|debito (?:em|na) (?:sua )?conta|voce enviou");

    public static final class Result {
        public final long amount;
        public final String direction;
        public final String method;
        public Result(long amount, String direction, String method) {
            this.amount = amount;
            this.direction = direction;
            this.method = method;
        }
    }

    public static String normalize(String value) {
        return Normalizer.normalize(value == null ? "" : value, Normalizer.Form.NFD)
            .replaceAll("\\p{M}+", "").replace('\u00a0', ' ').toLowerCase(Locale.ROOT);
    }

    public static Result parse(String title, String body) {
        String raw = (title == null ? "" : title) + "\n" + (body == null ? "" : body);
        String text = normalize(raw);
        if (REJECT.matcher(text).find()) return null;
        boolean incoming = IN.matcher(text).find(), outgoing = OUT.matcher(text).find();
        if (incoming == outgoing) return null;
        Matcher matcher = MONEY.matcher(raw);
        List<Long> values = new ArrayList<>();
        while (matcher.find()) {
            String before = normalize(raw.substring(Math.max(0, matcher.start() - 45), matcher.start()));
            if (before.matches("(?s).*(?:saldo|limite|cashback|disponivel|parcela)[^.!?\\n]{0,25}$")) continue;
            String value = matcher.group(1);
            try {
                String units, cents;
                if (value.contains(",")) {
                    String[] parts = value.replace(".", "").split(",");
                    units = parts[0]; cents = parts.length > 1 ? parts[1] : "00";
                } else if (value.matches("[0-9]+\\.[0-9]{2}")) {
                    String[] parts = value.split("\\."); units = parts[0]; cents = parts[1];
                } else { units = value.replace(".", ""); cents = "00"; }
                long amount = Math.addExact(Math.multiplyExact(Long.parseLong(units), 100), Long.parseLong(cents));
                if (amount > 0 && amount <= 99999999999L) values.add(amount);
            } catch (RuntimeException ignored) { return null; }
        }
        // Repeated title/body values are common; two different values need a human check.
        if (values.isEmpty() || values.stream().distinct().count() != 1) return null;
        String method = text.contains("pix") ? "pix" :
            text.contains("debito") ? "debit" : text.contains("cartao") || text.contains("credito") ? "card" : "payment";
        return new Result(values.get(0), incoming ? "income" : "expense", method);
    }
    private BankNotificationParser() { }
}
