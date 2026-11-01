package com.harshit.kafkapulse;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record EventRequest(
    @NotBlank
    @Pattern(regexp = "[A-Za-z0-9_-]{1,80}", message = "Event ID must be 1-80 alphanumeric characters, underscores, or hyphens")
    String eventId,

    @NotBlank
    @Size(max = 2000, message = "Content cannot exceed 2000 characters")
    String content,

    @Min(value = 0, message = "Failures must be >= 0")
    @Max(value = 100, message = "Failures must be <= 100")
    int failuresBeforeSuccess
) {}
