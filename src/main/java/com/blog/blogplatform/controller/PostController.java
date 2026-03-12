package com.blog.blogplatform.controller;

import com.blog.blogplatform.dto.CommentRequest;
import com.blog.blogplatform.dto.PostRequest;
import com.blog.blogplatform.dto.UpdatePostRequest;
import com.blog.blogplatform.entity.Comment;
import com.blog.blogplatform.entity.Post;
import com.blog.blogplatform.security.JwtUtil;
import com.blog.blogplatform.service.PostService;
import com.blog.blogplatform.service.TrendingService;
import com.blog.blogplatform.service.RecommendationService;
import com.blog.blogplatform.service.SummaryService;
import com.blog.blogplatform.service.TagSuggestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
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
    private final TrendingService trendingService;
    private final RecommendationService recommendationService;
    private final SummaryService summaryService;
    private final TagSuggestionService tagSuggestionService;

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
        
        // Ensure tags is never null
        List<String> tags = request.getTags();
        if (tags == null) {
            tags = new ArrayList<>();
        }

        return postService.createPost(
                request.getTitle(),
                request.getContent(),
                imageUrls,
                tags,
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
    
    @PostMapping("/suggest-tags")
    public Map<String, Object> suggestTags(@RequestBody Map<String, String> request) {
        String title = request.getOrDefault("title", "");
        String content = request.getOrDefault("content", "");
        
        List<String> suggestions = tagSuggestionService.suggestTags(title, content);
        
        return Map.of("suggestions", suggestions);
    }

    @PostMapping("/{id}/like")
    public Map<String, Object> toggleLike(
            @PathVariable @NonNull Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String email = jwtUtil.extractEmail(token);
        return postService.toggleLike(id, email);
    }

    @GetMapping("/{id}/liked")
    public Map<String, Boolean> hasUserLikedPost(
            @PathVariable @NonNull Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String email = jwtUtil.extractEmail(token);
        boolean liked = postService.hasUserLikedPost(id, email);
        return Map.of("liked", liked);
    }

    @DeleteMapping("/{id}")
    public String deletePost(
            @PathVariable @NonNull Long id,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String email = jwtUtil.extractEmail(token);
        return postService.deletePost(id, email);
    }

    @PostMapping("/{id}/comment")
    public Comment addComment(
            @PathVariable @NonNull Long id,
            @RequestBody CommentRequest request,
            @RequestHeader("Authorization") String authHeader
    ) {
        String token = authHeader.substring(7); // Remove "Bearer " prefix
        String email = jwtUtil.extractEmail(token);
        
        return postService.addComment(id, request.getContent(), email);
    }

    @GetMapping("/{id}/comments")
    public List<Comment> getComments(@PathVariable @NonNull Long id) {
        return postService.getComments(id);
    }
    @PutMapping("/{id}")
    public Post updatePost(
        @PathVariable @NonNull Long id,
        @RequestBody UpdatePostRequest request
    ) {
       return postService.updatePost(id, request);
    }
    
    // Trending Topics Endpoints
    @GetMapping("/trending/topics")
    public List<Map<String, Object>> getTrendingTopics(
            @RequestParam(defaultValue = "10") int limit
    ) {
        return trendingService.detectTrendingTopics(limit);
    }
    
    @GetMapping("/trending")
    public List<Map<String, Object>> getTrendingPosts() {
        return postService.getTrendingBlogs();
    }
    
    // Recommendation Endpoints
    @GetMapping("/recommendations")
    public List<Post> getRecommendations(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "10") int limit
    ) {
        String token = authHeader.substring(7);
        String email = jwtUtil.extractEmail(token);
        return recommendationService.getRecommendedPosts(email, limit);
    }
    
    @GetMapping("/topic/{topic}")
    public List<Post> getPostsByTopic(
            @PathVariable String topic,
            @RequestParam(defaultValue = "10") int limit
    ) {
        return recommendationService.getPostsByTopic(topic, limit);
    }
    
    // Summary Endpoints
    @GetMapping("/{id}/summary")
    public Map<String, Object> getPostSummary(@PathVariable @NonNull Long id) {
        return summaryService.generatePostSummary(id);
    }
    
    @GetMapping("/{id}/excerpt")
    public Map<String, String> getPostExcerpt(
            @PathVariable @NonNull Long id,
            @RequestParam(defaultValue = "200") int maxLength
    ) {
        String excerpt = summaryService.generateExcerpt(id, maxLength);
        return Map.of("excerpt", excerpt);
    }
    
    @GetMapping("/{id}/statistics")
    public Map<String, Object> getPostStatistics(@PathVariable @NonNull Long id) {
        return summaryService.getPostStatistics(id);
    }
    
    @PostMapping("/summaries/bulk")
    public List<Map<String, Object>> getBulkSummaries(
            @RequestBody List<Long> postIds
    ) {
        return summaryService.generateBulkSummaries(postIds);
    }
    
}
