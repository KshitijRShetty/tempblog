package com.blog.blogplatform.controller;

import com.blog.blogplatform.dto.CommentRequest;
import com.blog.blogplatform.dto.PostRequest;
import com.blog.blogplatform.dto.UpdatePostRequest;
import com.blog.blogplatform.entity.Comment;
import com.blog.blogplatform.entity.Post;
import com.blog.blogplatform.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping("/create")
    public Post createPost(@RequestBody PostRequest request) {

        String email = "kshitij@gmail.com"; // temporary

        return postService.createPost(
                request.getTitle(),
                request.getContent(),
                request.getImageUrl(),
                email
        );
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @PostMapping("/{id}/like")
    public Post likePost(@PathVariable Long id) {
        return postService.likePost(id);
    }

    @DeleteMapping("/{id}")
    public String deletePost(@PathVariable Long id) {
        return postService.deletePost(id);
    }

    @PostMapping("/{id}/comment")
    public Comment addComment(
            @PathVariable Long id,
            @RequestBody CommentRequest request
    ) {
        return postService.addComment(id, request.getContent());
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable Long id) {
        return postService.getComments(id);
    }
    @PutMapping("/{id}")
    public Post updatePost(
        @PathVariable Long id,
        @RequestBody UpdatePostRequest request
    ) {
       return postService.updatePost(id, request);
    }
    
}
