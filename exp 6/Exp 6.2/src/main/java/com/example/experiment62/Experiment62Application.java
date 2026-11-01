package com.example.experiment62;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class Experiment62Application {

    public static void main(String[] args) {

        SpringApplication.run(
                Experiment62Application.class,
                args
        );
    }
}