package com.blog.blogplatform.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PublicUserProfile {
    private String name;
    private String email;
    private String profileImage;
    private String bio;
    private String interests;
    private LocalDateTime createdAt;
}
