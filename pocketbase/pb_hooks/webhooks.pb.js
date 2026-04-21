/**
 * pb_hooks/webhooks.pb.js — Record lifecycle hooks
 *
 * These run synchronously inside PocketBase after a record is saved.
 * Keep them fast — long-running HTTP calls should use a goroutine or
 * just fire-and-forget via a quick fetch so the API response isn't delayed.
 *
 * Hooks defined here:
 *   1. onRecordAfterCreate<sermons>   → fire webhook when a sermon is published
 *   2. onRecordAfterUpdate<sermons>   → same, catches "published" flip on update
 *   3. onRecordAfterCreate<commands>  → structured log entry for audit trail
 *   4. onRecordAfterUpdate<commands>  → log when a command is marked as executed
 */

// ---------------------------------------------------------------------------
// Helper: safe HTTP fire-and-forget
//
// PocketBase's JS runtime has a built-in $http.send() — we wrap it so failures
// don't bubble up and corrupt the hook chain. The webhook is a nice-to-have,
// not a critical path.
// ---------------------------------------------------------------------------
const fireWebhook = (url, payload) => {
    if (!url || url.trim() === "") {
        // No webhook configured — totally fine, just skip silently
        return;
    }

    try {
        const result = $http.send({
            url: url,
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                // Include a simple shared secret if configured — teams can verify authenticity
                "X-Sanctuary-Hook-Secret": $app.settings().meta.appName || "sanctuary-stream",
            },
            body: JSON.stringify(payload),
            timeout: 5, // seconds — don't let a slow webhook block the response
        });

        $app.logger().info(
            "fireWebhook: delivered",
            "url", url,
            "status", result.statusCode
        );
    } catch (err) {
        // A failed webhook is unfortunate but not a disaster — the record is already saved
        $app.logger().error("fireWebhook: delivery failed", "url", url, "error", String(err));
    }
};

// ---------------------------------------------------------------------------
// Hook 1 & 2: Sermon published notifications
//
// Fires when a sermon is created with published=true, OR when an existing
// sermon's published field is flipped to true. The webhook payload includes
// everything a downstream consumer (website, notification service, etc.)
// might need without having to do a second API fetch.
// ---------------------------------------------------------------------------
const notifySermonPublished = (e) => {
    const sermon = e.record;

    // Only act when the record is actually published — drafts stay quiet
    if (!sermon.getBool("published")) {
        return;
    }

    const webhookUrl = $os.getenv("WEBHOOK_SERMON_URL");
    const payload = {
        event: "sermon.published",
        timestamp: new Date().toISOString(),
        data: {
            id: sermon.id,
            title: sermon.getString("title"),
            speaker: sermon.getString("speaker"),
            sermon_date: sermon.getString("sermon_date"),
            youtube_url: sermon.getString("youtube_url"),
            tags: sermon.get("tags"),
        },
    };

    $app.logger().info(
        "sermon published",
        "id", sermon.id,
        "title", sermon.getString("title")
    );

    fireWebhook(webhookUrl, payload);

    // Also send an email notification to the pastor/admin
    try {
        const adminEmail = $os.getenv("PB_ADMIN_EMAIL") || "brentmzey4795@gmail.com";
        const message = new MailerMessage({
            from: {
                address: $app.settings().meta.senderAddress || "noreply@brentzey.com",
                name:    $app.settings().meta.senderName || "Sanctuary Stream - Brent Zey",
            },
            to:      [{ address: adminEmail }],
            subject: `📢 New Sermon Published: ${sermon.getString("title")}`,
            html:    `<p>A new sermon has been published:</p>
                      <ul>
                        <li><strong>Title:</strong> ${sermon.getString("title")}</li>
                        <li><strong>Speaker:</strong> ${sermon.getString("speaker")}</li>
                        <li><strong>Date:</strong> ${sermon.getString("sermon_date")}</li>
                      </ul>
                      <p><a href="${sermon.getString("youtube_url")}">Watch on YouTube</a></p>`,
        });
        $app.newMailClient().send(message);
    } catch (mailErr) {
        $app.logger().error("notifySermonPublished: failed to send email", "error", String(mailErr));
    }
};

// Wire the same handler to both create and update so we catch all publishing paths
onRecordAfterCreateSuccess((e) => { notifySermonPublished(e); }, "sermons");
onRecordAfterUpdateSuccess((e) => { notifySermonPublished(e); }, "sermons");

// ---------------------------------------------------------------------------
// Hook: Login Alert
//
// Sends an automated email alert to the user whenever a successful 
// authentication event occurs (Password, OTP, or OAuth2).
// ---------------------------------------------------------------------------
const sendLoginAlert = (e) => {
    const user = e.record;
    const authMethod = e.collection.type === 'auth' ? 'account access' : 'login';
    
    try {
        const message = new MailerMessage({
            from: {
                address: $app.settings().meta.senderAddress || "noreply@brentzey.com",
                name:    $app.settings().meta.senderName || "Sanctuary Stream - Brent Zey",
            },
            to:      [{ address: user.email() }],
            subject: `🔐 Login Alert: Sanctuary Stream`,
            html:    `<p>Hello ${user.getString("name") || "User"},</p>
                      <p>A new <strong>${authMethod}</strong> was detected for your Sanctuary Stream account at <strong>${new Date().toLocaleString()}</strong>.</p>
                      <p>If this was not you, please reset your password immediately or contact support.</p>
                      <hr />
                      <p><small>This is an automated security notification.</small></p>`,
        });
        $app.newMailClient().send(message);
        $app.logger().info("login alert email sent", "user_id", user.id, "email", user.email());
    } catch (err) {
        $app.logger().error("login alert email failed", "user_id", user.id, "error", String(err));
    }
};

onRecordAuthWithPasswordSuccess((e) => { sendLoginAlert(e); }, "users");
onRecordAuthWithOTPSuccess((e) => { sendLoginAlert(e); }, "users");
onRecordAuthWithOAuth2Success((e) => { sendLoginAlert(e); }, "users");

// ---------------------------------------------------------------------------
// Hook: Auto-send verification email for new users
//
// When a new user is created (e.g., by an admin), we trigger a verification
// email automatically so they can set up their password or confirm their identity.
// ---------------------------------------------------------------------------
onRecordAfterCreateSuccess((e) => {
    const user = e.record;
    
    // Check if the user is already verified (unlikely for new records)
    if (user.getBool("verified")) {
        return;
    }

    try {
        $app.newMailClient().sendVerification(user);
        $app.logger().info("auto-verification email sent", "user_id", user.id, "email", user.email());
    } catch (err) {
        $app.logger().error("auto-verification email failed", "user_id", user.id, "error", String(err));
    }
}, "users");

// ---------------------------------------------------------------------------
// Hook 3: Log new commands as they come in
//
// This gives us a structural audit log without needing an external service.
// Handy when Pastor asks "who started the stream at 11am?" on a Tuesday.
// ---------------------------------------------------------------------------
onRecordAfterCreateSuccess((e) => {
    const cmd = e.record;

    $app.logger().info(
        "command created",
        "id", cmd.id,
        "action", cmd.getString("action"),
        "correlation_id", cmd.getString("correlation_id"),
        "created_by", cmd.getString("created_by"),
        "payload_present", cmd.get("payload") !== null
    );
}, "commands");

// ---------------------------------------------------------------------------
// Hook 4: Log command execution outcomes
//
// When the bridge marks a command as executed (with or without an error),
// we log the final outcome. This is especially useful for spotting patterns
// in OBS failures — if SET_STREAM_SETTINGS keeps erroring, we want to know.
// ---------------------------------------------------------------------------
onRecordAfterUpdateSuccess((e) => {
    const cmd = e.record;

    // Only care about the transition from unexecuted → executed
    if (!cmd.getBool("executed")) {
        return;
    }

    const errorMessage = cmd.getString("error_message");
    const hadError = errorMessage && errorMessage.trim() !== "";

    if (hadError) {
        $app.logger().error(
            "command execution failed",
            "id", cmd.id,
            "action", cmd.getString("action"),
            "correlation_id", cmd.getString("correlation_id"),
            "error", errorMessage
        );
    } else {
        $app.logger().info(
            "command executed successfully",
            "id", cmd.id,
            "action", cmd.getString("action"),
            "correlation_id", cmd.getString("correlation_id")
        );
    }
}, "commands");
