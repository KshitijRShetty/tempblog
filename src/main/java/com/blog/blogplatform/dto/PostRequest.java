package com.blog.blogplatform.dto;

import lombok.Data;
import java.util.List;
import java.util.ArrayList;

@Data
public class PostRequest {

    private String title;
    private String content;
    private List<String> imageUrls = new ArrayList<>();
    private List<String> tags = new ArrayList<>();
}
