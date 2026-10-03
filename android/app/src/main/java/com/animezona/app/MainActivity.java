package com.animezona.app;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(AppOrientationPlugin.class);
        super.onCreate(savedInstanceState);

        // Bloqueo de ventanas emergentes y popups externos para reproductores embed
        try {
            WebView webView = getBridge().getWebView();
            if (webView != null) {
                WebSettings settings = webView.getSettings();
                settings.setSupportMultipleWindows(false);
                settings.setJavaScriptCanOpenWindowsAutomatically(false);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
