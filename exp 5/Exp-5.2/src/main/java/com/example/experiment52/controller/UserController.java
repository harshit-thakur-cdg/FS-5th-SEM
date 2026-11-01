package com.example.experiment52.controller;

import com.example.experiment52.model.User;
import com.example.experiment52.repository.UserRepository;
import com.example.experiment52.exception.UserNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private static final Logger log =
            LoggerFactory.getLogger(UserController.class);

    private final UserRepository repository;

    public UserController(UserRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<User> getUsers() {

        log.info("Fetching all users");

        return repository.findAll();
    }

    @PostMapping
    public User addUser(@RequestBody User user) {

        log.info("Adding user: {}", user.getUid());

        return repository.save(user);
    }

    @GetMapping("/{uid}")
    public User getUser(@PathVariable String uid) {

        log.info("Searching user: {}", uid);

        return repository.findById(uid)
                .orElseThrow(
                        () -> new UserNotFoundException(uid)
                );
    }

    @PutMapping("/{uid}")
    public User updateUser(
            @PathVariable String uid,
            @RequestBody User updatedUser) {

        log.info("Updating user: {}", uid);

        User user = repository.findById(uid)
                .orElseThrow(
                        () -> new UserNotFoundException(uid)
                );

        user.setName(updatedUser.getName());

        return repository.save(user);
    }

    @DeleteMapping("/{uid}")
    public String deleteUser(@PathVariable String uid) {

        log.info("Deleting user: {}", uid);

        if (!repository.existsById(uid)) {

            throw new UserNotFoundException(uid);
        }

        repository.deleteById(uid);

        return "User deleted successfully";
    }
}