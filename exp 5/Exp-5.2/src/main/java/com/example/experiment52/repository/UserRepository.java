package com.example.experiment52.repository;

import com.example.experiment52.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {
}