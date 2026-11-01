package com.harshit.streamops;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Duration;

import static org.awaitility.Awaitility.await;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:reliability82;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
@AutoConfigureMockMvc
@EmbeddedKafka(
    partitions = 1,
    topics = {"scheduled-posts-82", "scheduled-posts-dlq-82"},
    bootstrapServersProperty = "spring.kafka.bootstrap-servers"
)
@DirtiesContext
class ReliabilityTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private EventRepository repo;

    @Autowired
    private KafkaTemplate<String, String> kafka;

    private String payload(String id, int failures) {
        return "{\"eventId\":\"" + id + "\",\"content\":\"StreamOps check\",\"failuresBeforeSuccess\":" + failures + "}";
    }

    private void submit(String id, int failures) throws Exception {
        mvc.perform(post("/api/events")
                .contentType("application/json")
                .content(payload(id, failures)))
                .andExpect(status().isAccepted());
    }

    private void check(String id, String status, int attempts) {
        await().atMost(Duration.ofSeconds(40)).untilAsserted(() -> {
            EventRecord e = repo.findById(id).orElseThrow();
            assertEquals(status, e.status);
            assertEquals(attempts, e.attempts);
        });
    }

    @Test
    void verifiesRealBrokerLifecycleAndApi() throws Exception {
        submit("TEST-NORMAL-82", 0);
        check("TEST-NORMAL-82", "PROCESSED", 1);

        submit("TEST-RETRY-82", 2);
        check("TEST-RETRY-82", "PROCESSED", 3);

        submit("TEST-DLQ-82", 10);
        check("TEST-DLQ-82", "DLQ", 4);

        // Duplicate test returns 409 Conflict
        mvc.perform(post("/api/events")
                .contentType("application/json")
                .content(payload("TEST-NORMAL-82", 0)))
                .andExpect(status().isConflict());

        kafka.send(KafkaConfig.MAIN, "TEST-NORMAL-82", payload("TEST-NORMAL-82", 0)).get();

        submit("TEST-MARKER-82", 0);
        check("TEST-MARKER-82", "PROCESSED", 1);

        assertEquals(1, repo.findById("TEST-NORMAL-82").orElseThrow().attempts);

        mvc.perform(get("/api/events/TEST-DLQ-82"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.attempts").value(4));

        mvc.perform(get("/api/events/missing"))
                .andExpect(status().isNotFound());

        mvc.perform(post("/api/events")
                .contentType("application/json")
                .content(payload("BAD", -1)))
                .andExpect(status().isBadRequest());

        mvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.kafka").value("UP"));
    }
}
