package in.harshit.canarydock;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ThreadLocalRandom;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

/**
 * CanaryDock Teaching & Simulation Model.
 * Simulates progressive canary deployment, traffic weighting, health-gated promotion,
 * and automated rollback upon telemetry anomalies.
 */
@Service
public class LabService {
    private String phase = "READY";
    private String stable = "v1.0.0";
    private String candidate = "v1.1.0";
    private String previous = "v1.0.0";
    private int weight = 0;
    private int stableHits = 0;
    private int canaryHits = 0;
    private int failures = 0;
    private int batch = 0;
    private boolean faulty = false;
    private final Deque<Map<String, Object>> events = new ArrayDeque<>();
    private final Deque<Map<String, Object>> recentRequests = new ArrayDeque<>();

    public LabService() {
        log("CanaryDock Lab ready. Configure and start a candidate release.");
    }

    private void log(String message) {
        events.addFirst(Map.of(
                "time", Instant.now().toString(),
                "message", message
        ));
        while (events.size() > 80) {
            events.removeLast();
        }
    }

    private void recordRequest(String slot, String version, int statusCode, int latencyMs) {
        recentRequests.addFirst(Map.of(
                "time", Instant.now().toString(),
                "slot", slot,
                "version", version,
                "status", statusCode,
                "latencyMs", latencyMs
        ));
        while (recentRequests.size() > 50) {
            recentRequests.removeLast();
        }
    }

    private void require(boolean ok, String message) {
        if (!ok) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, message);
        }
    }

    public synchronized Map<String, Object> snapshot() {
        int total = stableHits + canaryHits;
        double healthScore = (total == 0) ? 100.0 : Math.max(0.0, ((double)(total - failures) / total) * 100.0);

        Map<String, Object> map = new LinkedHashMap<>();
        map.put("mode", "CLASSROOM LAB");
        map.put("phase", phase);
        map.put("stable", stable);
        map.put("candidate", candidate);
        map.put("previous", previous);
        map.put("weight", weight);
        map.put("stableHits", stableHits);
        map.put("canaryHits", canaryHits);
        map.put("failures", failures);
        map.put("faulty", faulty);
        map.put("batch", batch);
        map.put("healthScore", Math.round(healthScore * 10.0) / 10.0);
        map.put("stableLatencyMs", 18 + ThreadLocalRandom.current().nextInt(8));
        map.put("canaryLatencyMs", faulty ? 280 + ThreadLocalRandom.current().nextInt(150) : 22 + ThreadLocalRandom.current().nextInt(10));
        map.put("events", List.copyOf(events));
        map.put("recentRequests", List.copyOf(recentRequests));
        return map;
    }

    public synchronized Map<String, Object> action(String action, String version) {
        switch (action) {
            case "start" -> {
                require(!phase.equals("CANARY"), "Finish or roll back the current release first.");
                if (version == null || !version.matches("v[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}")) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use a semantic version like v1.1.0 (max 3 digits per section).");
                }
                require(!version.equals(stable), "Candidate version must differ from the current stable release.");
                previous = stable;
                candidate = version;
                phase = "CANARY";
                weight = 10;
                stableHits = canaryHits = failures = batch = 0;
                faulty = false;
                log("Candidate release " + candidate + " deployed to canary slot. Routed with 10% traffic exposure.");
            }
            case "traffic" -> {
                require(phase.equals("CANARY"), "Start a release before sending test traffic.");
                int c = weight;
                int s = 100 - c;
                canaryHits += c;
                stableHits += s;
                batch++;

                // Emulate request traces
                for (int i = 0; i < Math.min(c, 5); i++) {
                    int latency = faulty ? ThreadLocalRandom.current().nextInt(300, 650) : ThreadLocalRandom.current().nextInt(18, 35);
                    int code = faulty ? 500 : 200;
                    recordRequest("canary", candidate, code, latency);
                }
                for (int i = 0; i < Math.min(s, 5); i++) {
                    int latency = ThreadLocalRandom.current().nextInt(14, 28);
                    recordRequest("stable", stable, 200, latency);
                }

                if (faulty) {
                    failures += c;
                    weight = 0;
                    phase = "ROLLED_BACK";
                    log("Health gate anomaly detected (HTTP 500 spike). Automatic safety rollback engaged: 100% traffic routed to baseline " + stable + ".");
                } else {
                    log("Batch #" + batch + " completed: 100 simulated requests processed (" + c + " canary, " + s + " stable). All SLOs satisfied.");
                }
            }
            case "advance" -> {
                require(phase.equals("CANARY") && batch > 0 && !faulty, "Run a healthy traffic batch before advancing.");
                if (weight == 10) {
                    weight = 50;
                    log("Health gate passed for Stage 1. Traffic weight scaled to 50% for canary candidate " + candidate + ".");
                } else {
                    weight = 100;
                    stable = candidate;
                    phase = "PROMOTED";
                    log("Promotion complete: Candidate " + stable + " passed all verification gates and is now 100% STABLE.");
                }
                batch = 0;
            }
            case "fault" -> {
                require(phase.equals("CANARY"), "Start a release before configuring failure injection.");
                faulty = !faulty;
                batch = 0;
                log(faulty ? "Failure injection enabled: Synthetic HTTP 500 errors armed on candidate slot." : "Failure injection disarmed: Candidate returned to normal operation.");
            }
            case "rollback" -> {
                require(phase.equals("CANARY") || phase.equals("PROMOTED"), "No active release available to roll back.");
                stable = previous;
                weight = 0;
                phase = "ROLLED_BACK";
                log("Manual emergency rollback executed. Stable release restored to " + stable + " (0% candidate exposure).");
            }
            case "reset" -> {
                phase = "READY";
                stable = previous = "v1.0.0";
                candidate = "v1.1.0";
                weight = stableHits = canaryHits = failures = batch = 0;
                faulty = false;
                events.clear();
                recentRequests.clear();
                log("CanaryDock laboratory state reset to pristine baseline (v1.0.0).");
            }
            default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown lab action: " + action);
        }
        return snapshot();
    }
}
