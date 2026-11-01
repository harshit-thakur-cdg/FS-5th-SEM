package com.example.experiment52.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
public class LoggingFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        String correlationId =
                UUID.randomUUID().toString();

        MDC.put("correlationId", correlationId);

        long startTime = System.currentTimeMillis();

        log.info(
                "Request Started: {} {} | Correlation ID: {}",
                request.getMethod(),
                request.getRequestURI(),
                correlationId
        );

        try {

            filterChain.doFilter(request, response);

        } finally {

            long time =
                    System.currentTimeMillis() - startTime;

            log.info(
                    "Request Completed: {} | Status: {} | Time: {} ms",
                    request.getRequestURI(),
                    response.getStatus(),
                    time
            );

            MDC.clear();
        }
    }
}