/**
 * pb_hooks/cron.pb.js — Scheduled background jobs
 *
 * PocketBase runs these inside its own JS runtime — no npm, no imports.
 * Think of it like little serverless functions that fire on a schedule.
 *
 * Jobs defined here:
 *   1. Clean up old executed commands (hourly)
 *   2. Mark stale streams as errored (every 5 minutes)
 *
 * Naming convention for cron expressions: "min hour dom month dow"
 * Same as standard Unix cron — nothing exotic.
 */

// ---------------------------------------------------------------------------
// Job 1: Archive executed commands older than 7 days
//
// Commands accumulate fast during a busy Sunday — START, RECORD_START, etc.
// We don't need a history longer than a week for debugging purposes.
// This keeps the commands table lean without requiring manual attention.
// ---------------------------------------------------------------------------
cronAdd("cleanup_old_commands", "0 * * * *", () => {
    // Calculate the cutoff timestamp — 7 days ago in ISO 8601
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString().replace("T", " ").substring(0, 19);

    try {
        // Find all executed commands older than the cutoff date
        // We only delete executed ones — unexecuted ones might still be in-flight
        const staleCommands = $app.findRecordsByFilter(
            "commands",
            `executed = true && created < {:cutoff}`,
            "-created",  // sort newest-first just in case we hit a limit
            500,         // process up to 500 at a time to avoid timeouts
            0,
            { cutoff: cutoffStr }
        );

        if (staleCommands.length === 0) {
            // Nothing to do — early exit keeps the log clean
            $app.logger().info("cleanup_old_commands: no stale records found, nothing to do");
            return;
        }

        // Delete each one — PocketBase JS hooks don't have a bulk delete API yet
        let deleted = 0;
        for (const record of staleCommands) {
            $app.delete(record);
            deleted++;
        }

        $app.logger().info(
            "cleanup_old_commands: archived executed commands",
            "count", deleted,
            "cutoff", cutoffStr
        );
    } catch (err) {
        // Log but don't crash the whole hook runner — a cleanup failure is noisy but not fatal
        $app.logger().error("cleanup_old_commands: failed", "error", String(err));
    }
});

// ---------------------------------------------------------------------------
// Job 2: Detect stale streams and mark them as errored
//
// If the bridge process crashes or loses network, the stream record will stop
// getting heartbeats. After 2 minutes of silence, something is wrong — 
// flip the status to "error" so the dashboard shows a warning, not "live".
//
// Fires every 5 minutes so worst-case lag is 5 min + 2 min = 7 min total.
// ---------------------------------------------------------------------------
cronAdd("detect_stale_streams", "*/5 * * * *", () => {
    // Anything with a heartbeat older than 2 minutes is considered stale
    const staleThreshold = new Date();
    staleThreshold.setMinutes(staleThreshold.getMinutes() - 2);
    const thresholdStr = staleThreshold.toISOString().replace("T", " ").substring(0, 19);

    try {
        // Only check streams that are actively "live" or "recording" — idle streams
        // don't need heartbeats and we'd spam false positives all day otherwise
        const activeStreams = $app.findRecordsByFilter(
            "streams",
            `(status = 'live' || status = 'recording') && heartbeat < {:threshold}`,
            "-heartbeat",
            100,
            0,
            { threshold: thresholdStr }
        );

        if (activeStreams.length === 0) {
            return; // All active streams are healthy — nothing to report
        }

        for (const stream of activeStreams) {
            stream.set("status", "error");
            $app.save(stream);

            $app.logger().warn(
                "detect_stale_streams: stream marked as error due to missed heartbeat",
                "stream_id", stream.id,
                "last_heartbeat", stream.get("heartbeat"),
                "threshold", thresholdStr
            );

            // Send email notification to admin
            try {
                const adminEmail = $os.getenv("PB_ADMIN_EMAIL") || "brentmzey4795@gmail.com";
                const message = new MailerMessage({
                    from: {
                        address: $app.settings().meta.senderAddress || "noreply@sanctuary-stream.local",
                        name:    $app.settings().meta.senderName || "Sanctuary Stream",
                    },
                    to:      [{ address: adminEmail }],
                    subject: `⚠️ Stream Error Detected: ${stream.id}`,
                    html:    `<p>Stream <strong>${stream.id}</strong> has been marked as <strong>error</strong> because it missed its heartbeat for more than 2 minutes.</p>
                              <p>Last heartbeat: ${stream.get("heartbeat")}</p>
                              <p>Threshold was: ${thresholdStr}</p>`,
                });
                $app.newMailClient().send(message);
            } catch (mailErr) {
                $app.logger().error("detect_stale_streams: failed to send email", "error", String(mailErr));
            }
        }
    } catch (err) {
        $app.logger().error("detect_stale_streams: failed", "error", String(err));
    }
});
