/// <reference path="../pb_data/types.d.ts" />

/**
 * settings.pb.js
 * 
 * This hook runs after the app is bootstrapped.
 * It ensures that SMTP, OTP, and MFA settings are correctly configured 
 * based on environment variables or provided defaults.
 */

onAfterBootstrap((e) => {
    const settings = $app.settings();
    
    // ---------------------------------------------------------------------------
    // 1. Configure Global SMTP Settings
    // ---------------------------------------------------------------------------
    // These use the provided Resend SMTP details.
    // ---------------------------------------------------------------------------
    settings.smtp.enabled = true;
    settings.smtp.host = $os.getenv("SMTP_HOST") || "smtp.resend.com";
    settings.smtp.port = parseInt($os.getenv("SMTP_PORT") || "587");
    settings.smtp.username = $os.getenv("SMTP_USER") || "resend";
    settings.smtp.password = $os.getenv("SMTP_PASS") || ""; // Usually provided via .env
    settings.smtp.tls = true;
    
    // Identity settings used in outgoing emails
    settings.meta.senderName = $os.getenv("SMTP_FROM_NAME") || "Sanctuary Stream - Brent Zey";
    settings.meta.senderAddress = $os.getenv("SMTP_FROM_ADDR") || "noreply@brentzey.com";
    
    // Save global settings
    $app.saveSettings(settings);
    
    // ---------------------------------------------------------------------------
    // 2. Configure Users Collection (Verification, OTP, MFA)
    // ---------------------------------------------------------------------------
    // Ensures the Users collection supports the required security protocols.
    // ---------------------------------------------------------------------------
    try {
        const users = $app.findCollectionByNameOrId("users");
        if (users) {
            // Enable OTP (Sign in with email code)
            users.otp.enabled = true;
            
            // Enable MFA (Multi-Factor Authentication)
            users.mfa.enabled = true;
            users.mfa.duration = 300; // 5 minutes

            // Enable Verification and Password Reset options
            users.authRule = ""; // Ensure public can attempt auth (filtered by PB)
            
            $app.saveCollection(users);
            $app.logger().info("Email system initialized: SMTP enabled, OTP/MFA configured for Users.");
        } else {
            $app.logger().error("Settings Initialization: 'users' collection not found.");
        }
    } catch (err) {
        $app.logger().error("Settings Initialization Error", "error", String(err));
    }
});
