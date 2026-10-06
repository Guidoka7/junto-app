package br.com.junto.app;

import android.os.Bundle;
import androidx.activity.EdgeToEdge;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BankNotificationsPlugin.class);
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
    }
}
