package com.harshit.kafkapulse;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.TimeUnit;

@Service
public class EventService {

    private final EventRepository repo;
    private final KafkaTemplate<String, String> kafka;
    private final ObjectMapper json;

    public EventService(EventRepository repo, KafkaTemplate<String, String> kafka, ObjectMapper json) {
        this.repo = repo;
        this.kafka = kafka;
        this.json = json;
    }

    /**
     * Submit an event to the Kafka broker.
     * Enforces duplicate protection (HTTP 409 Conflict if ID already exists).
     */
    public synchronized EventRecord submit(EventRequest request) {
        if (repo.existsById(request.eventId())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Event ID '" + request.eventId() + "' already exists. Duplicate submissions are strictly blocked for idempotency."
            );
        }

        EventRecord record = new EventRecord(
            request.eventId(),
            request.content().strip(),
            request.failuresBeforeSuccess()
        );
        record = repo.saveAndFlush(record);

        try {
            String payload = json.writeValueAsString(request);
            kafka.send(KafkaConfig.MAIN, record.eventId, payload).get(20, TimeUnit.SECONDS);
        } catch (Exception ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            record.status = "PUBLISH_FAILED";
            record.lastError = "Broker acknowledgement not received: " + ex.getMessage();
            record.updatedAt = Instant.now();
            repo.saveAndFlush(record);
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, record.lastError);
        }

        return record;
    }

    public List<EventRecord> list() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    public EventRecord get(String id) {
        return repo.findById(id).orElseThrow(() ->
            new ResponseStatusException(HttpStatus.NOT_FOUND, "Event record not found: " + id)
        );
    }

    /**
     * Called by EventConsumer when a message is picked up from the MAIN topic.
     */
    public synchronized void process(String id) {
        EventRecord record = get(id);
        if ("PROCESSED".equals(record.status) || "DLQ".equals(record.status)) {
            return;
        }

        record.attempts++;
        record.status = "PROCESSING";
        record.updatedAt = Instant.now();
        repo.saveAndFlush(record);

        if (record.attempts <= record.failuresBeforeSuccess) {
            record.status = "RETRYING";
            record.lastError = "Simulated transient failure on attempt " + record.attempts + " of " + record.failuresBeforeSuccess;
            record.updatedAt = Instant.now();
            repo.saveAndFlush(record);

            // Throw exception to trigger Kafka consumer backoff retry
            throw new IllegalStateException(record.lastError);
        }

        record.status = "PROCESSED";
        record.lastError = null;
        record.updatedAt = Instant.now();
        repo.saveAndFlush(record);
    }

    /**
     * Called when retries are exhausted and the message arrives on the DLQ topic.
     */
    public synchronized void deadLetter(String id) {
        EventRecord record = get(id);
        if ("PROCESSED".equals(record.status)) {
            return;
        }
        record.status = "DLQ";
        if (record.lastError == null || record.lastError.isBlank()) {
            record.lastError = "Exhausted all retry attempts (1 initial + 3 exponential backoffs). Routed to DLQ.";
        }
        record.updatedAt = Instant.now();
        repo.saveAndFlush(record);
    }

    /**
     * Purge all records from H2 (useful for demonstration reset).
     */
    public synchronized void clearAll() {
        repo.deleteAll();
    }
}
