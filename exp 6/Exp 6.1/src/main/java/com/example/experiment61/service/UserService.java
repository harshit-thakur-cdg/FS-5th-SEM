package com.example.experiment61.service;

import com.example.experiment61.model.User;
import com.example.experiment61.repository.UserRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Page<User> getUsers(Pageable pageable) {
        return userRepository.findAll(pageable);
    }

    public User addUser(User user) {
        return userRepository.save(user);
    }

    public void deleteUser(String uid) {
        userRepository.deleteById(uid);
    }

    public long getTotalUsers() {
        return userRepository.count();
    }
}