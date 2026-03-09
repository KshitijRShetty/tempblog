package com.blog.blogplatform.controller;

import com.blog.blogplatform.dto.CommentRequest;
import com.blog.blogplatform.dto.PostRequest;
import com.blog.blogplatform.dto.UpdatePostRequest;
import com.blog.blogplatform.entity.Comment;
import com.blog.blogplatform.entity.Post;
import com.blog.blogplatform.security.JwtUtil;
import com.blog.blogplatform.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;
    private final JwtUtil jwtUtil;

    @PostMapping("/create")
    public Post createPost(
            @RequestBody PostRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String email = jwtUtil.extractEmail(token);

        // Ensure imageUrls is never null
        List<String> imageUrls = request.getImageUrls();
        if (imageUrls == null) {
            imageUrls = new ArrayList<>();
        }

        return postService.createPost(
                request.getTitle(),
                request.getContent(),
                imageUrls,
                email
        );
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/feed")
    public List<Map<String, Object>> getFeed() {
        return postService.getFeed();
    }

    @GetMapping("/search")
    public List<Post> searchPosts(@RequestParam(required = false) String keyword) {
        return postService.searchPosts(keyword);
    }

    @PostMapping("/{id}/like")
    public Map<String, Object> toggleLike(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String email = jwtUtil.extractEmail(token);
        return postService.toggleLike(id, email);
    }

    @GetMapping("/{id}/liked")
    public Map<String, Boolean> hasUserLikedPost(
            @PathVariable Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String email = jwtUtil.extractEmail(token);
        boolean liked = postService.hasUserLikedPost(id, email);
        return Map.of("liked", liked);
    }

    @DeleteMapping("/{id}")
    public String deletePost(@PathVariable Long id) {
        return postService.deletePost(id);
    }

    @PostMapping("/{id}/comment")
    public Comment addComment(
            @PathVariable Long id,
            @RequestBody CommentRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String email = jwtUtil.extractEmail(token);
        
        return postService.addComment(id, request.getContent(), email);
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
