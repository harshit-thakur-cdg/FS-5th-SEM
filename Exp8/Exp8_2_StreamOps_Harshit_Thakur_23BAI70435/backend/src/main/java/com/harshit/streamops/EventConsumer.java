package com.harshit.streamops;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class EventConsumer {

    private final EventService events;
    private final ObjectMapper json;

    public EventConsumer(EventService events, ObjectMapper json) {
        this.events = events;
        this.json = json;
    }

    @KafkaListener(topics = KafkaConfig.MAIN, groupId = "scheduled-posts-group-82")
    public void consume(String payload) throws Exception {
        EventRequest request = json.readValue(payload, EventRequest.class);
        events.process(request.eventId());
    }

    @KafkaListener(topics = KafkaConfig.DLQ, groupId = "scheduled-posts-dlq-group-82")
    public void consumeDeadLetter(String payload) throws Exception {
        EventRequest request = json.readValue(payload, EventRequest.class);
        events.deadLetter(request.eventId());
    }
}
