package in.harshit.observatory;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.junit.jupiter.api.Assertions.*;

@Testcontainers
@SpringBootTest
class BuildRunPostgresIT {

    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void database(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
        r.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private BuildRunRepository repository;

    @Test
    void persistsInRealPostgres() {
        BuildRun saved = repository.saveAndFlush(new BuildRun("Verify PostgreSQL persistence"));
        assertNotNull(saved.getId());
        BuildRun found = repository.findById(saved.getId()).orElseThrow();
        assertEquals("Verify PostgreSQL persistence", found.getCommitMessage());
        assertEquals("QUEUED", found.getStatus());
        assertNotNull(found.getCreatedAt());
    }
}
