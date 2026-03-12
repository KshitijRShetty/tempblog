package com.blog.blogplatform.dto;

import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String name;
    private String bio;
    private String interests;
}
