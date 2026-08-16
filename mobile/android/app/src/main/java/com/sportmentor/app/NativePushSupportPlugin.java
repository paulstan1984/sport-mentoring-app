package com.sportmentor.app;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.PluginMethod;

@CapacitorPlugin(name = "NativePushSupport")
public class NativePushSupportPlugin extends Plugin {
    @PluginMethod
    public void isAvailable(PluginCall call) {
        int appIdResource = getContext().getResources().getIdentifier(
            "google_app_id",
            "string",
            getContext().getPackageName()
        );

        JSObject result = new JSObject();
        result.put("available", appIdResource != 0);
        call.resolve(result);
    }
}
