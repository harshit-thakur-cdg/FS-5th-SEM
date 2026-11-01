package com.example.experiment51.controller;

import com.example.experiment51.dto.ApiResponse;
import com.example.experiment51.model.User;
import com.example.experiment51.service.UserService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {

        List<User> users = service.getAllUsers();

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "success",
                        "Users fetched successfully",
                        users
                )
        );
    }

    @GetMapping("/{uid}")
    public ResponseEntity<ApiResponse<User>> getUser(
            @PathVariable String uid) {

        User user = service.getUserByUid(uid);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "success",
                        "User found successfully",
                        user
                )
        );
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> addUser(
            @Valid @RequestBody User user) {

        User savedUser = service.addUser(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        new ApiResponse<>(
                                "success",
                                "User added successfully",
                                savedUser
                        )
                );
    }

    @PutMapping("/{uid}")
    public ResponseEntity<ApiResponse<User>> updateUser(
            @PathVariable String uid,
            @Valid @RequestBody User user) {

        User updatedUser =
                service.updateUser(uid, user);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "success",
                        "User updated successfully",
                        updatedUser
                )
        );
    }

    @DeleteMapping("/{uid}")
    public ResponseEntity<ApiResponse<String>> deleteUser(
            @PathVariable String uid) {

        service.deleteUser(uid);

        return ResponseEntity.ok(
                new ApiResponse<>(
                        "success",
                        "User deleted successfully",
                        null
                )
        );
    }
}