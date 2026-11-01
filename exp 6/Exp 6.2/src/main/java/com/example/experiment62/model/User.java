package com.example.experiment62.model;

import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {

    @Id
    private String uid;

    private String name;

    private String city;

    private String country;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;

    public User() {
    }

    public User(String uid, String name, String city, String country, Department department) {
        this.uid = uid;
        this.name = name;
        this.city = city;
        this.country = country;
        this.department = department;
    }

    public String getUid() {
        return uid;
    }

    public void setUid(String uid) {
        this.uid = uid;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public Department getDepartment() {
        return department;
    }

    public void setDepartment(Department department) {
        this.department = department;
    }
}