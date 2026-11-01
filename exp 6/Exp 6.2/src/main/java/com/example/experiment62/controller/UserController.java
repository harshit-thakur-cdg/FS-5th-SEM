package com.example.experiment62.controller;

import com.example.experiment62.model.User;
import com.example.experiment62.service.UserService;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    // Get all users
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    // Add user
    @PostMapping
    public User addUser(@RequestBody User user) {
        return userService.addUser(user);
    }

    // Delete user
    @DeleteMapping("/{uid}")
    public String deleteUser(@PathVariable String uid) {
        userService.deleteUser(uid);
        return "User deleted successfully";
    }

    // Normal query - demonstrates inefficient fetching
    @GetMapping("/normal")
    public Map<String, Object> normalQuery() {

        long start = System.nanoTime();

        List<Map<String, Object>> data =
                userService.normalQuery();

        long end = System.nanoTime();

        return createResponse(
                "Normal Query / N+1",
                data,
                end - start
        );
    }

    // JOIN FETCH - optimized query
    @GetMapping("/join-fetch")
    public Map<String, Object> joinFetch() {

        long start = System.nanoTime();

        List<Map<String, Object>> data =
                userService.joinFetchQuery();

        long end = System.nanoTime();

        return createResponse(
                "JOIN FETCH",
                data,
                end - start
        );
    }

    // Cached query
    @GetMapping("/cached")
    public Map<String, Object> cached() {

        long start = System.nanoTime();

        List<Map<String, Object>> data =
                userService.cachedQuery();

        long end = System.nanoTime();

        return createResponse(
                "Cached Query",
                data,
                end - start
        );
    }

    // Native SQL query
    @GetMapping("/native")
    public Map<String, Object> nativeSql() {

        long start = System.nanoTime();

        List<Map<String, Object>> data =
                userService.nativeQuery();

        long end = System.nanoTime();

        return createResponse(
                "Native SQL",
                data,
                end - start
        );
    }

    // Sort by UID
    @GetMapping("/sort/id")
    public List<User> sortById() {
        return userService.sortById();
    }

    // Sort by name
    @GetMapping("/sort/name")
    public List<User> sortByName() {
        return userService.sortByName();
    }

    // Create common performance response
    private Map<String, Object> createResponse(
            String type,
            List<?> data,
            long nanoseconds) {

        Map<String, Object> response =
                new LinkedHashMap<>();

        double milliseconds =
                nanoseconds / 1_000_000.0;

        response.put(
                "queryType",
                type
        );

        response.put(
                "executionTimeMs",
                Math.round(milliseconds * 100.0) / 100.0
        );

        response.put(
                "recordCount",
                data.size()
        );

        response.put(
                "data",
                data
        );

        return response;
    }
}