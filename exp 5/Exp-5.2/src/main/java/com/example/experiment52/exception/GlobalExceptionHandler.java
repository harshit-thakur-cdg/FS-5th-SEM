package com.example.experiment52.exception;

import com.example.experiment52.dto.ApiResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log =
            LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiResponse<String>> handleUserNotFound(
            UserNotFoundException ex) {

        log.error("User not found: {}", ex.getMessage());

        ApiResponse<String> response =
                new ApiResponse<>(
                        "error",
                        ex.getMessage(),
                        null
                );

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<String>> handleException(
            Exception ex) {

        log.error("Unexpected error: {}", ex.getMessage());

        ApiResponse<String> response =
                new ApiResponse<>(
                        "error",
                        "An unexpected error occurred",
                        null
                );

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}