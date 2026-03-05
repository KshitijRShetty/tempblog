package com.blog.blogplatform.controller;

import com.blog.blogplatform.entity.Post;
import com.blog.blogplatform.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping("/create")
    public Post createPost(
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam String imageUrl
    ) {

        String email = "kshitij@gmail.com"; // temporary until JWT filter added

        return postService.createPost(title, content, imageUrl, email);
    }
}
