package com.example.experiment62.service;

import com.example.experiment62.model.User;
import com.example.experiment62.repository.UserRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @CacheEvict(value = "users", allEntries = true)
    public User addUser(User user) {
        return userRepository.save(user);
    }

    @CacheEvict(value = "users", allEntries = true)
    public void deleteUser(String uid) {
        userRepository.deleteById(uid);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> normalQuery() {

        List<User> users = userRepository.findUsersNormal();

        return users.stream()
                .map(this::convertUser)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> joinFetchQuery() {

        List<User> users = userRepository.findUsersWithDepartment();

        return users.stream()
                .map(this::convertUser)
                .toList();
    }

    @Cacheable(value = "users")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> cachedQuery() {

        System.out.println(">>> DATABASE HIT - Cached Query");

        List<User> users = userRepository.findUsersWithDepartment();

        return users.stream()
                .map(this::convertUser)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> nativeQuery() {

        List<Object[]> rows = userRepository.findUsersNative();

        List<Map<String, Object>> result = new ArrayList<>();

        for (Object[] row : rows) {

            Map<String, Object> user = new LinkedHashMap<>();

            user.put("uid", row[0]);
            user.put("name", row[1]);
            user.put("city", row[2]);
            user.put("country", row[3]);
            user.put("department", row[4]);

            result.add(user);
        }

        return result;
    }

    public List<User> sortById() {

        return userRepository.findAll(
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.ASC,
                        "uid"
                )
        );
    }

    public List<User> sortByName() {

        return userRepository.findAll(
                org.springframework.data.domain.Sort.by(
                        org.springframework.data.domain.Sort.Direction.ASC,
                        "name"
                )
        );
    }

    public List<User> getAllUsers() {

        return userRepository.findAll();
    }

    private Map<String, Object> convertUser(User user) {

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("uid", user.getUid());
        result.put("name", user.getName());
        result.put("city", user.getCity());
        result.put("country", user.getCountry());

        if (user.getDepartment() != null) {
            result.put("department", user.getDepartment().getName());
        } else {
            result.put("department", "Not Assigned");
        }

        return result;
    }
}