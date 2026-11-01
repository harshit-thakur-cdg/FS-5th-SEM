package com.harshit.kafkapulse;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.TopicPartition;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.ExponentialBackOffWithMaxRetries;

@Configuration
public class KafkaConfig {

    public static final String MAIN = "scheduled-posts";
    public static final String DLQ = "scheduled-posts-dlq";

    @Bean
    public NewTopic mainTopic() {
        return TopicBuilder.name(MAIN).partitions(1).replicas(1).build();
    }

    @Bean
    public NewTopic deadLetterTopic() {
        return TopicBuilder.name(DLQ).partitions(1).replicas(1).build();
    }

    /**
     * Exponential backoff retry handler:
     * - 3 retries max (1 initial attempt + 3 retries = 4 attempts total)
     * - Initial interval: 1000ms (1s)
     * - Multiplier: 2.0 (1s, 2s, 4s)
     * - On exhaustion: forwards to Dead-Letter Topic (DLQ)
     */
    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<String, String> template) {
        DeadLetterPublishingRecoverer recoverer = new DeadLetterPublishingRecoverer(
            template,
            (record, exception) -> new TopicPartition(DLQ, record.partition())
        );
        recoverer.setFailIfSendResultIsError(true);

        ExponentialBackOffWithMaxRetries backoff = new ExponentialBackOffWithMaxRetries(3);
        backoff.setInitialInterval(1000L);
        backoff.setMultiplier(2.0);
        backoff.setMaxInterval(4000L);

        return new DefaultErrorHandler(recoverer, backoff);
    }
}
