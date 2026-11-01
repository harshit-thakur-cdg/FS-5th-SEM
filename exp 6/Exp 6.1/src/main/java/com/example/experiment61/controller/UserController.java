package com.example.experiment61.controller;

import com.example.experiment61.model.User;
import com.example.experiment61.service.UserService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Page<User> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "uid") String sortBy,
            @RequestParam(defaultValue = "asc") String order) {

        Sort.Direction direction;

        if (order.equalsIgnoreCase("desc")) {
            direction = Sort.Direction.DESC;
        } else {
            direction = Sort.Direction.ASC;
        }

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(direction, sortBy)
        );

        return userService.getUsers(pageable);
    }

    @PostMapping
    public User addUser(@RequestBody User user) {
        return userService.addUser(user);
    }

    @DeleteMapping("/{uid}")
    public String deleteUser(@PathVariable String uid) {

        userService.deleteUser(uid);

        return "User deleted successfully";
    }

    @GetMapping("/count")
    public long getTotalUsers() {
        return userService.getTotalUsers();
    }
}