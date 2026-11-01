package com.example.experiment61;

import com.example.experiment61.model.User;
import com.example.experiment61.repository.UserRepository;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class Experiment61Application {

    public static void main(String[] args) {

        SpringApplication.run(
                Experiment61Application.class,
                args
        );
    }

    @Bean
    CommandLineRunner loadData(UserRepository repository) {

        return args -> {

            if (repository.count() == 0) {

                repository.save(
                        new User("E20451", "Nitish")
                );

                repository.save(
                        new User("E20452", "Shriya")
                );

                repository.save(
                        new User("E20453", "Prabhsjot")
                );

                repository.save(
                        new User("E20454", "Lovleen")
                );

                repository.save(
                        new User("E20467", "Kriti")
                );

            }

        };
    }
}