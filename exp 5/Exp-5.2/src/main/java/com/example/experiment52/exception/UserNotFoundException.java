package com.example.experiment52.exception;

public class UserNotFoundException extends RuntimeException {

    public UserNotFoundException(String uid) {
        super("User not found with UID: " + uid);
    }
}