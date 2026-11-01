package com.example.experiment61.repository;

import com.example.experiment61.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {

}