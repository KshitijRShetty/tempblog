package com.blog.blogplatform.service;

import com.blog.blogplatform.entity.Post;
import com.blog.blogplatform.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TrendingService {

    private final PostRepository postRepository;

    /**
     * Detects trending topics based on post content, likes, comments, and recency
     */
    public List<Map<String, Object>> detectTrendingTopics(int topN) {
        List<Post> allPosts = postRepository.findAll();
        
        // Extract words from all posts and calculate their trending score
        Map<String, TrendingScore> wordScores = new HashMap<>();
        
        for (Post post : allPosts) {
            // Calculate post engagement score
            double engagementScore = calculateEngagementScore(post);
            
            // Extract meaningful words from title and content
            Set<String> words = extractKeywords(post.getTitle() + " " + post.getContent());
            
            for (String word : words) {
                wordScores.putIfAbsent(word, new TrendingScore());
                TrendingScore score = wordScores.get(word);
                score.addEngagement(engagementScore);
                score.incrementCount();
            }
        }
        
        // Sort topics by their trending score
        List<Map<String, Object>> trendingTopics = wordScores.entrySet().stream()
                .filter(entry -> entry.getValue().count >= 2) // At least 2 mentions
                .sorted((e1, e2) -> Double.compare(e2.getValue().getTotalScore(), e1.getValue().getTotalScore()))
                .limit(topN)
                .map(entry -> {
                    Map<String, Object> topic = new HashMap<>();
                    topic.put("keyword", entry.getKey());
                    topic.put("score", Math.round(entry.getValue().getTotalScore() * 100) / 100.0);
                    topic.put("mentionCount", entry.getValue().count);
                    return topic;
                })
                .collect(Collectors.toList());
        
        return trendingTopics;
    }
    
    /**
     * Get trending posts based on engagement and recency
     */
    public List<Post> getTrendingPosts(int limit) {
        List<Post> allPosts = postRepository.findAll();
        
        return allPosts.stream()
                .sorted((p1, p2) -> Double.compare(
                    calculateEngagementScore(p2),
                    calculateEngagementScore(p1)
                ))
                .limit(limit)
                .collect(Collectors.toList());
    }
    
    /**
     * Calculate engagement score for a post based on likes, comments, and recency
     */
    private double calculateEngagementScore(Post post) {
        double likeScore = post.getLikes() * 1.0;
        double commentScore = post.getComments().size() * 2.0; // Comments weighted more
        
        // Recency factor (posts from last 7 days get boost)
        long hoursSinceCreation = java.time.Duration.between(
            post.getCreatedAt(), 
            LocalDateTime.now()
        ).toHours();
        
        double recencyMultiplier = 1.0;
        if (hoursSinceCreation < 24) {
            recencyMultiplier = 3.0; // Big boost for posts less than 1 day old
        } else if (hoursSinceCreation < 168) { // 7 days
            recencyMultiplier = 2.0; // Medium boost for posts less than 7 days old
        }
        
        return (likeScore + commentScore) * recencyMultiplier;
    }
    
    /**
     * Extract meaningful keywords from text (removes common words)
     */
    private Set<String> extractKeywords(String text) {
        // Common stop words to filter out
        Set<String> stopWords = Set.of(
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "but",
            "in", "with", "to", "for", "of", "as", "by", "this", "that",
            "it", "from", "be", "are", "was", "were", "been", "have", "has",
            "had", "do", "does", "did", "will", "would", "should", "could",
            "can", "may", "might", "must", "i", "you", "he", "she", "we", "they"
        );
        
        return Arrays.stream(text.toLowerCase()
                .replaceAll("[^a-z\\s]", " ") // Remove special characters
                .split("\\s+"))
                .filter(word -> word.length() > 3) // At least 4 characters
                .filter(word -> !stopWords.contains(word))
                .collect(Collectors.toSet());
    }
    
    /**
     * Inner class to track trending scores
     */
    private static class TrendingScore {
        private double totalEngagement = 0.0;
        private int count = 0;
        
        public void addEngagement(double engagement) {
            this.totalEngagement += engagement;
        }
        
        public void incrementCount() {
            this.count++;
        }
        
        public double getTotalScore() {
            return totalEngagement * Math.log(count + 1); // Log scale for count
        }
    }
}
