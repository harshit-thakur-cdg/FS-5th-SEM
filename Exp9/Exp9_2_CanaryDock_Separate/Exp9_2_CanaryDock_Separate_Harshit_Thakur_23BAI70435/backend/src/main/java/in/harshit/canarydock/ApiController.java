package in.harshit.canarydock;

import java.time.Instant;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
@CrossOrigin(originPatterns = {"http://localhost:*", "http://127.0.0.1:*"})
public class ApiController {

    private final LabService lab;

    @Value("${app.version:local-1.0}")
    private String version;

    @Value("${app.slot:local}")
    private String slot;

    @Value("${app.demo-enabled:true}")
    private boolean demoEnabled;

    public ApiController(LabService lab) {
        this.lab = lab;
    }

    @GetMapping("/info")
    public Map<String, Object> info() {
        return Map.of(
                "name", "CanaryDock",
                "author", "Harshit Thakur",
                "uid", "23BAI70435",
                "version", version,
                "slot", slot,
                "demoEnabled", demoEnabled,
                "timestamp", Instant.now().toString()
        );
    }

    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> hello() {
        return ResponseEntity.ok()
                .header("X-Release-Slot", slot)
                .header("X-Student-UID", "23BAI70435")
                .header("X-Student-Name", "Harshit Thakur")
                .body(Map.of(
                        "message", "Delivered safely. Built to evolve with progressive canary releases.",
                        "version", version,
                        "slot", slot,
                        "author", "Harshit Thakur",
                        "uid", "23BAI70435",
                        "timestamp", Instant.now().toString()
                ));
    }

    private void checkLabEnabled() {
        if (!demoEnabled) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Classroom lab is disabled on this deployment.");
        }
    }

    @GetMapping("/lab")
    public Map<String, Object> state() {
        checkLabEnabled();
        return lab.snapshot();
    }

    public record Command(String action, String version) {}

    @PostMapping("/lab")
    public Map<String, Object> action(@RequestBody Command command) {
        checkLabEnabled();
        if (command == null || command.action() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Action is required.");
        }
        return lab.action(command.action(), command.version());
    }
}
