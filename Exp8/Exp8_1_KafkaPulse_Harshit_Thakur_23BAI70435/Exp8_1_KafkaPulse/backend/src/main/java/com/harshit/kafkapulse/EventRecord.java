package com.harshit.kafkapulse;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

/**
 * Persisted state of an event record in H2.
 * Tracks lifecycle: QUEUED -> PROCESSING -> RETRYING -> PROCESSED | DLQ | PUBLISH_FAILED.
 */
@Entity
@Table(name = "event_records")
public class EventRecord {

    @Id
    public String eventId;

    @Column(nullable = false, length = 2000)
    public String content;

    @Column(nullable = false)
    public String status;

    public int attempts;

    public int failuresBeforeSuccess;

    @Column(length = 2000)
    public String lastError;

    public Instant createdAt;

    public Instant updatedAt;

    public EventRecord() {}

    public EventRecord(String eventId, String content, int failuresBeforeSuccess) {
        this.eventId = eventId;
        this.content = content;
        this.failuresBeforeSuccess = failuresBeforeSuccess;
        this.status = "QUEUED";
        this.attempts = 0;
        this.lastError = null;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }
}
