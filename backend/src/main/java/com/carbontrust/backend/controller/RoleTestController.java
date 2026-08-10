package com.carbontrust.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RoleTestController {

    @GetMapping("/buyer/test")
    public String buyerTest() {
        return "BUYER access granted!";
    }

    @GetMapping("/ngo/test")
    public String ngoTest() {
        return "NGO access granted!";
    }

    @GetMapping("/verifier/test")
    public String verifierTest() {
        return "VERIFIER access granted!";
    }

    @GetMapping("/admin/test")
    public String adminTest() {
        return "ADMIN access granted!";
    }
}