package in.harshit.observatory;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/builds")
@CrossOrigin(
    originPatterns = {"http://localhost:*", "http://127.0.0.1:*"},
    allowedHeaders = "*",
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class BuildRunController {

    private final BuildRunService service;

    public BuildRunController(BuildRunService service) {
        this.service = service;
    }

    public record CreateBuildRequest(String commitMessage) {}

    @PostMapping
    public ResponseEntity<BuildRun> create(@RequestBody CreateBuildRequest request) {
        BuildRun run = service.createBuild(request != null ? request.commitMessage() : null);
        return ResponseEntity.created(URI.create("/api/builds/" + run.getId())).body(run);
    }

    @GetMapping
    public List<BuildRun> list() {
        return service.getBuilds();
    }

    @GetMapping("/{id}")
    public BuildRun get(@PathVariable long id) {
        return service.getBuild(id);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> clear() {
        service.clearAll();
        return ResponseEntity.ok(Map.of("message", "Build records cleared successfully"));
    }
}
