import { describe, expect, it } from "vitest";
import config from "../mobile/capacitor.config";

describe("Capacitor push configuration", () => {
  it("uses the Android application ID as the Capacitor app ID", () => {
    expect(config.appId).toBe("sport.mentoring.app");
  });

  it("displays incoming notifications while the app is in the foreground", () => {
    expect(config.plugins?.PushNotifications?.presentationOptions).toContain("alert");
  });
});
