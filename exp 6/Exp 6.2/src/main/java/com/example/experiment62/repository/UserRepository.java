package com.example.experiment62.repository;

import com.example.experiment62.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface UserRepository extends JpaRepository<User, String> {

    // Normal query - departments are loaded lazily
    @Query("SELECT u FROM User u")
    List<User> findUsersNormal();

    // JOIN FETCH - fetch users and departments in one query
    @Query("SELECT u FROM User u JOIN FETCH u.department")
    List<User> findUsersWithDepartment();

    // Native SQL query
    @Query(value = """
            SELECT u.uid, u.name, u.city, u.country,
                   d.name AS department_name
            FROM users u
            LEFT JOIN departments d
            ON u.department_id = d.id
            """, nativeQuery = true)
    List<Object[]> findUsersNative();
}