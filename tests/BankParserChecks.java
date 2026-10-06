import br.com.junto.app.BankNotificationParser;
public class BankParserChecks {
  static int count=0;
  static void expect(String title,String text,long amount,String direction){BankNotificationParser.Result r=BankNotificationParser.parse(title,text);if(r==null||r.amount!=amount||!r.direction.equals(direction))throw new AssertionError(title+" / "+text);count++;}
  static void ignore(String text){if(BankNotificationParser.parse("Banco",text)!=null)throw new AssertionError("Should ignore: "+text);count++;}
  public static void main(String[]args){
    expect("Pix enviado","Você enviou R$ 1.234,56 para Maria.",123456,"expense");
    expect("Compra aprovada","Compra aprovada de R$ 25,90 no cartão final 1234.",2590,"expense");
    expect("Pix recebido","Você recebeu R$ 5.600,00.",560000,"income");
    expect("Pagamento realizado","Você pagou R$ 25.90 em MERCADO.",2590,"expense");
    expect("Pix enviado de R$ 50,00","Pix enviado de R$ 50,00. Saldo disponível: R$ 300,00.",5000,"expense");
    expect("Transferência enviada","Transferência realizada de R$ 100.",10000,"expense");
    ignore("Pix agendado de R$ 100,00 para amanhã.");ignore("Compra recusada de R$ 200,00.");ignore("Código de verificação: 123456. Pix R$ 50,00.");
    ignore("Seu limite agora é R$ 1.000,00.");ignore("Pix recebido e Pix enviado: R$ 25,00.");ignore("Pix enviado de R$ 10,00 e pagamento realizado de R$ 15,00.");ignore("Pix enviado sem valor.");ignore("Pix enviado de R$ 0,00.");ignore("Pagamento realizado de R$ 9,99. Estorno realizado.");
    System.out.println("Bank parser: "+count+" checks passed");
  }
}
