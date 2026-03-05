package com.blog.blogplatform.controller;

import com.blog.blogplatform.entity.User;
import com.blog.blogplatform.service.CommentService;
import com.blog.blogplatform.service.PostService;
import com.blog.blogplatform.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final CommentService commentService;
    private final PostService postService;

    @PutMapping("/ban/{id}")
    public User banUser(@PathVariable Long id) {
        return userService.banUser(id);
    }

    @DeleteMapping("/comment/{id}")
    public String deleteComment(@PathVariable Long id) {
        return commentService.deleteComment(id);
    }

    @DeleteMapping("/post/{id}")
    public String deletePost(@PathVariable Long id) {
        return postService.deletePost(id);
    }
}