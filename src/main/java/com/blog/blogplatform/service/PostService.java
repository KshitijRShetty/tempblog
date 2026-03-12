package com.blog.blogplatform.service;

import com.blog.blogplatform.dto.UpdatePostRequest;
import com.blog.blogplatform.entity.Comment;
import com.blog.blogplatform.entity.Like;
import com.blog.blogplatform.entity.Post;
import com.blog.blogplatform.entity.User;
import com.blog.blogplatform.repository.CommentRepository;
import com.blog.blogplatform.repository.LikeRepository;
import com.blog.blogplatform.repository.PostRepository;
import com.blog.blogplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final BlogAggregatorService blogAggregatorService;

    public Post createPost(String title, String content, List<String> imageUrls, List<String> tags, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .title(title)
                .content(content)
                .imageUrls(imageUrls != null ? imageUrls : new ArrayList<>())
                .tags(tags != null ? tags : new ArrayList<>())
                .likes(0)
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        @SuppressWarnings("null")
        Post savedPost = postRepository.save(post);
        return savedPost;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Map<String, Object>> getFeed() {
        // Get local posts and convert to maps
        List<Post> localPosts = postRepository.findAll();
        List<Map<String, Object>> localPostMaps = new ArrayList<>();
        
        for (Post post : localPosts) {
            Map<String, Object> postMap = new HashMap<>();
            postMap.put("id", post.getId());
            postMap.put("title", post.getTitle());
            postMap.put("content", post.getContent());
            postMap.put("imageUrls", post.getImageUrls());
            postMap.put("createdAt", post.getCreatedAt());
            postMap.put("likes", post.getLikes());
            postMap.put("comments", post.getComments());
            
            Map<String, Object> userMap = new HashMap<>();
            if (post.getUser() != null) {
                userMap.put("email", post.getUser().getEmail());
                userMap.put("name", post.getUser().getName());
            }
            postMap.put("user", userMap);
            postMap.put("external", false);
            postMap.put("source", "local");
            postMap.put("sourceLabel", "Local Post");
            
            localPostMaps.add(postMap);
        }
        
        // Get all external blogs from aggregator (Dev.to, HN, RSS)
        List<Map<String, Object>> externalBlogs = blogAggregatorService.aggregateAllBlogs();
        
        // Merge both into a feed
        List<Map<String, Object>> feed = new ArrayList<>();
        feed.addAll(localPostMaps);
        feed.addAll(externalBlogs);
        
        // Shuffle the feed randomly so posts are mixed
        java.util.Collections.shuffle(feed);
        
        return feed;
    }

    @Transactional
    @SuppressWarnings("null")
    public Map<String, Object> toggleLike(@NonNull Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post);
        
        boolean liked;
        if (existingLike.isPresent()) {
            // Unlike: remove the like
            Like likeToDelete = existingLike.get();
            likeRepository.delete(likeToDelete);
            post.setLikes(Math.max(0, post.getLikes() - 1));
            liked = false;
        } else {
            // Like: add a new like
            Like newLike = Like.builder()
                    .user(user)
                    .post(post)
                    .build();
            likeRepository.save(newLike);
            post.setLikes(post.getLikes() + 1);
            liked = true;
        }

        postRepository.save(post);
        
        Map<String, Object> response = new HashMap<>();
        response.put("post", post);
        response.put("liked", liked);
        return response;
    }

    public boolean hasUserLikedPost(@NonNull Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return likeRepository.existsByUserAndPost(user, post);
    }

    public List<Post> searchPosts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllPosts();
        }
        return postRepository.searchPosts(keyword.trim());
    }

    public Comment addComment(@NonNull Long postId, String content, String email) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .content(content)
                .post(post)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        @SuppressWarnings("null")
        Comment savedComment = commentRepository.save(comment);
        return savedComment;
    }

    public List<Comment> getComments(@NonNull Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        return commentRepository.findByPost(post);
    }
    @Transactional
    @SuppressWarnings("null")
    public String deletePost(@NonNull Long postId, String email) {
        // Get the user making the request
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if user is banned
        if (user.isBanned()) {
            throw new RuntimeException("Cannot delete post: Your account has been banned");
        }

        // Get the post
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        // Check authorization: user must own the post or be an admin
        if (!post.getUser().getEmail().equals(email) && !"ADMIN".equals(user.getRole())) {
            throw new RuntimeException("You are not authorized to delete this post");
        }

        // Delete likes, comments, then the post
        likeRepository.deleteByPost(post);
        commentRepository.deleteByPost(post);
        postRepository.delete(post);

        return "Post deleted successfully";
    }
    
    // Admin delete - bypasses ownership check
    @Transactional
    @SuppressWarnings("null")
    public String adminDeletePost(@NonNull Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        likeRepository.deleteByPost(post);
        commentRepository.deleteByPost(post);
        postRepository.delete(post);

        return "Post deleted successfully";
    }
    
    public Post updatePost(@NonNull Long id, UpdatePostRequest request) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrls(request.getImageUrls() != null ? request.getImageUrls() : new ArrayList<>());
        post.setTags(request.getTags() != null ? request.getTags() : new ArrayList<>());

        return postRepository.save(post);
    }
    
    /**
     * Get trending blogs based on engagement scoring system
     * Score formula: (reactions_count * 2 + comments_count * 3 + public_reactions_count) / hours_since_published
     * Returns top 5 blogs sorted by score descending
     */
    public List<Map<String, Object>> getTrendingBlogs() {
        List<Map<String, Object>> allBlogs = getFeed();
        
        // Calculate trending score for each blog
        for (Map<String, Object> blog : allBlogs) {
            double score = calculateTrendingScore(blog);
            blog.put("trendingScore", score);
        }
        
        // Sort by trending score descending and get top 5
        return allBlogs.stream()
                .sorted(Comparator.comparingDouble((Map<String, Object> blog) -> 
                    ((Number) blog.getOrDefault("trendingScore", 0.0)).doubleValue())
                    .reversed())
                .limit(5)
                .collect(Collectors.toList());
    }
    
    /**
     * Calculate trending score for a blog post
     * Formula: (reactions_count * 2 + comments_count * 3 + public_reactions_count) / hours_since_published
     */
    private double calculateTrendingScore(Map<String, Object> blog) {
        try {
            // Get engagement metrics
            int reactionsCount = 0;
            int commentsCount = 0;
            int publicReactionsCount = 0;
            
            // Get likes (reactions)
            Object likesObj = blog.get("likes");
            if (likesObj instanceof Number) {
                reactionsCount = ((Number) likesObj).intValue();
                publicReactionsCount = reactionsCount; // Use same value
            }
            
            // Get comments count
            Object commentsObj = blog.get("comments");
            if (commentsObj instanceof List) {
                commentsCount = ((List<?>) commentsObj).size();
            }
            
            // Calculate hours since published
            double hoursSincePublished = calculateHoursSincePublished(blog);
            
            // Avoid division by zero - use minimum of 1 hour
            if (hoursSincePublished < 1) {
                hoursSincePublished = 1;
            }
            
            // Apply scoring formula
            double engagementScore = (reactionsCount * 2.0) + (commentsCount * 3.0) + publicReactionsCount;
            double trendingScore = engagementScore / hoursSincePublished;
            
            return trendingScore;
        } catch (Exception e) {
            // If any error in calculation, return 0
            return 0.0;
        }
    }
    
    /**
     * Calculate hours since a blog was published
     */
    private double calculateHoursSincePublished(Map<String, Object> blog) {
        try {
            Object createdAtObj = blog.get("createdAt");
            
            if (createdAtObj == null) {
                return 24.0; // Default to 24 hours if no timestamp
            }
            
            LocalDateTime createdAt = null;
            
            if (createdAtObj instanceof LocalDateTime) {
                createdAt = (LocalDateTime) createdAtObj;
            } else if (createdAtObj instanceof String) {
                // Parse ISO 8601 date string (for external blogs)
                try {
                    ZonedDateTime zonedDateTime = ZonedDateTime.parse((String) createdAtObj);
                    createdAt = zonedDateTime.toLocalDateTime();
                } catch (Exception e) {
                    // Fallback: try parsing as LocalDateTime directly
                    createdAt = LocalDateTime.parse((String) createdAtObj);
                }
            }
            
            if (createdAt != null) {
                long hours = ChronoUnit.HOURS.between(createdAt, LocalDateTime.now());
                return Math.max(1, hours); // Minimum 1 hour
            }
            
            return 24.0; // Default fallback
        } catch (Exception e) {
            return 24.0; // Default fallback on any error
        }
    }
    
}
