package com.harshit.kafkapulse;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventRepository extends JpaRepository<EventRecord, String> {
    List<EventRecord> findAllByOrderByCreatedAtDesc();
}
