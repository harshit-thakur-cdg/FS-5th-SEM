package com.example.experiment51.repository;

import com.example.experiment51.model.User;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository
        extends JpaRepository<User, String> {
}