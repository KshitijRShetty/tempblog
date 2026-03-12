package com.blog.blogplatform.service;

import com.blog.blogplatform.entity.Like;
import com.blog.blogplatform.entity.Post;
import com.blog.blogplatform.entity.User;
import com.blog.blogplatform.repository.LikeRepository;
import com.blog.blogplatform.repository.PostRepository;
import com.blog.blogplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final LikeRepository likeRepository;

    /**
     * Recommend posts for a user based on their liked posts and interests
     */
    public List<Post> getRecommendedPosts(String email, int limit) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Get posts the user has already liked
        List<Like> userLikes = likeRepository.findByUser(user);
        Set<Long> likedPostIds = userLikes.stream()
                .map(like -> like.getPost().getId())
                .collect(Collectors.toSet());
        
        // If user hasn't liked any posts, return popular posts
        if (likedPostIds.isEmpty()) {
            return getPopularPosts(limit);
        }
        
        // Get all posts the user hasn't liked yet
        List<Post> allPosts = postRepository.findAll();
        List<Post> candidatePosts = allPosts.stream()
                .filter(post -> !likedPostIds.contains(post.getId()))
                .filter(post -> !post.getUser().getId().equals(user.getId())) // Exclude user's own posts
                .collect(Collectors.toList());
        
        // Build user's interest profile from liked posts
        Map<String, Integer> userInterests = buildUserInterestProfile(userLikes);
        
        // Score each candidate post based on similarity to user interests
        Map<Post, Double> postScores = new HashMap<>();
        for (Post post : candidatePosts) {
            double score = calculateRecommendationScore(post, userInterests);
            postScores.put(post, score);
        }
        
        // Return top N recommended posts
        return postScores.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(limit)
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }
    
    /**
     * Get popular posts based on engagement (fallback recommendation)
     */
    private List<Post> getPopularPosts(int limit) {
        List<Post> allPosts = postRepository.findAll();
        
        return allPosts.stream()
                .sorted((p1, p2) -> {
                    int engagement1 = p1.getLikes() + p1.getComments().size() * 2;
                    int engagement2 = p2.getLikes() + p2.getComments().size() * 2;
                    return Integer.compare(engagement2, engagement1);
                })
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    /**
     * Build user's interest profile from their liked posts
     */
    private Map<String, Integer> buildUserInterestProfile(List<Like> userLikes) {
        Map<String, Integer> interests = new HashMap<>();
        
        for (Like like : userLikes) {
            Post post = like.getPost();
            Set<String> keywords = extractKeywords(post.getTitle() + " " + post.getContent());
            
            for (String keyword : keywords) {
                interests.put(keyword, interests.getOrDefault(keyword, 0) + 1);
            }
        }
        
        return interests;
    }
    
    /**
     * Calculate recommendation score for a post based on user interests
     */
    private double calculateRecommendationScore(Post post, Map<String, Integer> userInterests) {
        Set<String> postKeywords = extractKeywords(post.getTitle() + " " + post.getContent());
        
        double contentScore = 0.0;
        for (String keyword : postKeywords) {
            if (userInterests.containsKey(keyword)) {
                contentScore += userInterests.get(keyword);
            }
        }
        
        // Factor in post popularity
        double popularityScore = (post.getLikes() + post.getComments().size() * 2) * 0.1;
        
        return contentScore + popularityScore;
    }
    
    /**
     * Extract keywords from text
     */
    private Set<String> extractKeywords(String text) {
        Set<String> stopWords = Set.of(
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "but",
            "in", "with", "to", "for", "of", "as", "by", "this", "that",
            "it", "from", "be", "are", "was", "were", "been", "have", "has",
            "had", "do", "does", "did", "will", "would", "should", "could"
        );
        
        return Arrays.stream(text.toLowerCase()
                .replaceAll("[^a-z\\s]", " ")
                .split("\\s+"))
                .filter(word -> word.length() > 3)
                .filter(word -> !stopWords.contains(word))
                .collect(Collectors.toSet());
    }
    
    /**
     * Get posts by a specific keyword/topic
     */
    public List<Post> getPostsByTopic(String topic, int limit) {
        List<Post> allPosts = postRepository.findAll();
        
        return allPosts.stream()
                .filter(post -> {
                    String content = (post.getTitle() + " " + post.getContent()).toLowerCase();
                    return content.contains(topic.toLowerCase());
                })
                .limit(limit)
                .collect(Collectors.toList());
    }
}
