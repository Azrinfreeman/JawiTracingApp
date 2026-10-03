package com.hananaacademy.tamanjawi;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.Insets;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.RenderProcessGoneDetail;
import android.widget.FrameLayout;
import android.widget.Toast;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.Collections;

public final class MainActivity extends Activity {
    private static final String LOCAL_HOST = "appassets.androidplatform.net";
    private static final String START_URL = "https://" + LOCAL_HOST + "/index.html";
    private static final int SAVE_JSON = 101, CHOOSE_AUDIO = 102;
    private WebView webView;
    private FrameLayout root;
    private String pendingExport;
    private ValueCallback<Uri[]> pendingAudio;
    private View customView;
    private WebChromeClient.CustomViewCallback customViewCallback;
    private boolean exitDialogShowing;
    private volatile boolean gameFullscreen = true;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(255, 253, 245));
        setContentView(root);
        configureInsets();
        if (Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT, this::handleBack);
        webView = new WebView(this);
        webView.setBackgroundColor(Color.rgb(255, 253, 245));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);
        root.addView(webView, new FrameLayout.LayoutParams(-1, -1));
        webView.addOnLayoutChangeListener((view, left, top, right, bottom, oldLeft, oldTop, oldRight, oldBottom) -> {
            if (right - left != oldRight - oldLeft || bottom - top != oldBottom - oldTop) signal("taman-jawi:viewport");
        });
        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setBuiltInZoomControls(false);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);
        settings.setSupportMultipleWindows(false);
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);
        final WebViewAssetLoader loader = new WebViewAssetLoader.Builder()
                .addPathHandler("/", new WebViewAssetLoader.AssetsPathHandler(this)).build();
        webView.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
                if (isLocal(request.getUrl())) {
                    WebResourceResponse response = loader.shouldInterceptRequest(request.getUrl());
                    if (response != null) return response;
                }
                return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found",
                        Collections.emptyMap(), new ByteArrayInputStream(new byte[0]));
            }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return !isLocal(request.getUrl());
            }
            @Override public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
                root.removeView(view); view.destroy(); webView = null;
                new AlertDialog.Builder(MainActivity.this).setTitle("Buka semula Taman Jawi")
                        .setMessage("Permainan perlu dibuka semula. Rekod yang disimpan masih tersedia.")
                        .setPositiveButton("Buka semula", (dialog, which) -> recreate())
                        .setNegativeButton("Keluar", (dialog, which) -> finish()).setCancelable(false).show();
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (pendingAudio != null) pendingAudio.onReceiveValue(null);
                pendingAudio = callback;
                Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT).setType("audio/*")
                        .addCategory(Intent.CATEGORY_OPENABLE)
                        .putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-wav"});
                try { startActivityForResult(intent, CHOOSE_AUDIO); }
                catch (android.content.ActivityNotFoundException error) {
                    pendingAudio.onReceiveValue(null); pendingAudio = null; toast("Pemilih fail tidak tersedia.");
                }
                return true;
            }
            @Override public void onShowCustomView(View view, CustomViewCallback callback) {
                if (customView != null) { callback.onCustomViewHidden(); return; }
                customView = view; customViewCallback = callback;
                webView.setVisibility(View.GONE); root.addView(view, new FrameLayout.LayoutParams(-1, -1));
                showSystemBars(false);
            }
            @Override public void onHideCustomView() { leaveFullscreen(); }
        });
        webView.addJavascriptInterface(new LocalBridge(), "TamanJawiAndroid");
        root.post(() -> showSystemBars(!gameFullscreen));
        webView.loadUrl(START_URL);
    }

    private static boolean isLocal(Uri uri) {
        return "https".equals(uri.getScheme()) && LOCAL_HOST.equals(uri.getHost()) && uri.getPort() == -1;
    }
    private void configureInsets() {
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            root.setOnApplyWindowInsetsListener((view, insets) -> {
                Insets safe = insets.getInsets(WindowInsets.Type.displayCutout()
                        | (gameFullscreen || customView != null ? 0 : WindowInsets.Type.systemBars()));
                Insets keyboard = insets.getInsets(WindowInsets.Type.ime());
                view.setPadding(safe.left, safe.top, safe.right, Math.max(safe.bottom, keyboard.bottom));
                return WindowInsets.CONSUMED;
            });
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller != null) controller.setSystemBarsAppearance(
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
                    WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS | WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS);
        }
    }
    private void showSystemBars(boolean show) {
        if (Build.VERSION.SDK_INT >= 30) {
            WindowInsetsController controller = getWindow().getInsetsController();
            if (controller == null) return;
            if (show) controller.show(WindowInsets.Type.systemBars());
            else { controller.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE); controller.hide(WindowInsets.Type.systemBars()); }
        } else getWindow().getDecorView().setSystemUiVisibility(show ? 0 :
                View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION | View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY);
        root.requestApplyInsets();
    }
    private void leaveFullscreen() {
        if (customView == null) return;
        root.removeView(customView); customView = null;
        if (webView != null) webView.setVisibility(View.VISIBLE);
        showSystemBars(!gameFullscreen);
        if (customViewCallback != null) { customViewCallback.onCustomViewHidden(); customViewCallback = null; }
    }
    private void signal(String event) {
        if (webView != null) webView.evaluateJavascript("window.dispatchEvent(new Event('" + event + "'));", null);
    }
    @Override protected void onPause() {
        signal("taman-jawi:pause");
        if (webView != null) webView.onPause();
        super.onPause();
    }
    @Override protected void onResume() {
        super.onResume(); if (webView != null) webView.onResume();
        if (root != null) root.post(() -> showSystemBars(customView == null && !gameFullscreen));
    }
    @Override public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus && root != null) showSystemBars(customView == null && !gameFullscreen);
    }
    // API 33+ uses the registered OnBackInvokedCallback; retain this entry for API 26-32.
    @android.annotation.SuppressLint("GestureBackNavigation")
    @Override public void onBackPressed() {
        handleBack();
    }
    private void handleBack() {
        if (customView != null) leaveFullscreen();
        else signal("taman-jawi:back");
    }
    @Override protected void onDestroy() {
        if (pendingAudio != null) pendingAudio.onReceiveValue(null);
        pendingAudio = null; pendingExport = null;
        if (webView != null) { root.removeView(webView); webView.removeJavascriptInterface("TamanJawiAndroid"); webView.destroy(); webView = null; }
        super.onDestroy();
    }
    private void toast(String text) { Toast.makeText(this, text, Toast.LENGTH_LONG).show(); }

    private final class LocalBridge {
        @JavascriptInterface public boolean isFullscreen() { return gameFullscreen; }
        @JavascriptInterface public void setFullscreen(boolean fullscreen) {
            runOnUiThread(() -> {
                if (webView == null || !START_URL.equals(webView.getUrl())) return;
                gameFullscreen = fullscreen;
                showSystemBars(customView == null && !gameFullscreen);
                signal("taman-jawi:viewport");
            });
        }
        @JavascriptInterface public void saveJson(String name, String content) {
            if (content == null || content.length() > 32 * 1024 * 1024
                    || !("taman-jawi-kemajuan.json".equals(name) || "taman-jawi-diagnostik.json".equals(name))) return;
            runOnUiThread(() -> {
                if (webView == null || !START_URL.equals(webView.getUrl()) || pendingExport != null) return;
                pendingExport = content;
                Intent intent = new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE)
                        .setType("application/json").putExtra(Intent.EXTRA_TITLE, name);
                try { startActivityForResult(intent, SAVE_JSON); }
                catch (android.content.ActivityNotFoundException error) { pendingExport = null; toast("Pemilih fail tidak tersedia."); }
            });
        }
        @JavascriptInterface public void confirmExit() {
            runOnUiThread(() -> {
                if (webView == null || !START_URL.equals(webView.getUrl()) || exitDialogShowing) return;
                exitDialogShowing = true; signal("taman-jawi:pause");
                new AlertDialog.Builder(MainActivity.this).setTitle("Keluar dari Taman Jawi?")
                        .setMessage("Boleh sambung belajar apabila kamu buka semula.")
                        .setPositiveButton("Keluar", (dialog, which) -> finish())
                        .setNegativeButton("Kembali", null).setOnDismissListener(dialog -> exitDialogShowing = false).show();
            });
        }
    }
    @Override protected void onActivityResult(int request, int result, Intent data) {
        super.onActivityResult(request, result, data);
        if (request == CHOOSE_AUDIO && pendingAudio != null) {
            pendingAudio.onReceiveValue(result == RESULT_OK && data != null && data.getData() != null ? new Uri[]{data.getData()} : null);
            pendingAudio = null;
        } else if (request == SAVE_JSON) {
            String content = pendingExport; pendingExport = null;
            if (result != RESULT_OK || data == null || data.getData() == null || content == null) return;
            try (OutputStream output = getContentResolver().openOutputStream(data.getData())) {
                if (output == null) throw new java.io.IOException("No destination");
                output.write(content.getBytes(StandardCharsets.UTF_8)); toast("Fail berjaya disimpan.");
            } catch (java.io.IOException error) { toast("Fail tidak dapat disimpan. Cuba eksport semula."); }
        }
    }
}
