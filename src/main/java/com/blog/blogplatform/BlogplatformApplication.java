package com.blog.blogplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;

@SpringBootApplication(exclude = SecurityAutoConfiguration.class)
public class BlogplatformApplication {

    public static void main(String[] args) {
        SpringApplication.run(BlogplatformApplication.class, args);
    }

}
