package com.example.experiment51.service;

import com.example.experiment51.model.User;
import com.example.experiment51.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository repository;

    public UserService(UserRepository repository) {
        this.repository = repository;
    }

    public List<User> getAllUsers() {
        return repository.findAll();
    }

    public User getUserByUid(String uid) {

        return repository.findById(uid)
                .orElseThrow(
                        () -> new RuntimeException(
                                "User not found with UID: " + uid
                        )
                );
    }

    public User addUser(User user) {
        return repository.save(user);
    }

    public User updateUser(
            String uid,
            User updatedUser) {

        User user = getUserByUid(uid);

        user.setName(updatedUser.getName());

        return repository.save(user);
    }

    public void deleteUser(String uid) {

        User user = getUserByUid(uid);

        repository.delete(user);
    }
}