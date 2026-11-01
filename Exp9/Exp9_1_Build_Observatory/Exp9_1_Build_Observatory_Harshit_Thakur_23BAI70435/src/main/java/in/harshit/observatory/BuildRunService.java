package in.harshit.observatory;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class BuildRunService {

    private final BuildRunRepository repository;

    public BuildRunService(BuildRunRepository repository) {
        this.repository = repository;
    }

    public BuildRun createBuild(String message) {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Commit message must not be blank");
        }
        String trimmed = message.trim();
        if (trimmed.length() > 200) {
            throw new IllegalArgumentException("Commit message must not exceed 200 characters");
        }
        return repository.save(new BuildRun(trimmed));
    }

    public List<BuildRun> getBuilds() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "id"));
    }

    public BuildRun getBuild(long id) {
        return repository.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Build record not found")
        );
    }

    public void clearAll() {
        repository.deleteAll();
    }
}
