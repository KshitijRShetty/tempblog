package com.blog.blogplatform.service;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class TagSuggestionService {

    // Common words to exclude from tag suggestions
    private static final Set<String> STOP_WORDS = Set.of(
        "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
        "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
        "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
        "or", "an", "will", "my", "one", "all", "would", "there", "their",
        "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
        "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
        "people", "into", "year", "your", "good", "some", "could", "them", "see",
        "other", "than", "then", "now", "look", "only", "come", "its", "over",
        "think", "also", "back", "after", "use", "two", "how", "our", "work",
        "first", "well", "way", "even", "new", "want", "because", "any", "these",
        "give", "day", "most", "us", "is", "was", "are", "been", "has", "had",
        "were", "said", "did", "having", "may", "should", "am", "being", "does"
    );

    // Tech-related keywords that are good tags
    private static final Set<String> TECH_KEYWORDS = Set.of(
        "javascript", "java", "python", "react", "angular", "vue", "nodejs", "typescript",
        "springboot", "spring", "database", "sql", "nosql", "mongodb", "mysql", "postgresql",
        "api", "rest", "graphql", "microservices", "docker", "kubernetes", "aws", "azure",
        "cloud", "devops", "ci/cd", "git", "github", "testing", "frontend", "backend",
        "fullstack", "machine", "learning", "ai", "artificial", "intelligence", "data",
        "science", "algorithm", "programming", "coding", "development", "web", "mobile",
        "android", "ios", "swift", "kotlin", "flutter", "reactnative", "css", "html",
        "security", "authentication", "authorization", "jwt", "oauth", "encryption",
        "performance", "optimization", "responsive", "design", "ui", "ux", "agile",
        "scrum", "tutorial", "guide", "tips", "tricks", "best", "practices", "patterns",
        "architecture", "serverless", "lambda", "functions", "redux", "state", "management"
    );

    /**
     * Suggest tags based on title and content
     * @param title Post title
     * @param content Post content
     * @return List of suggested tags (max 8)
     */
    public List<String> suggestTags(String title, String content) {
        // Combine title and content, giving title more weight
        String textToAnalyze = (title + " " + title + " " + content).toLowerCase();
        
        // Extract words
        String[] words = textToAnalyze
                .replaceAll("[^a-zA-Z0-9\\s]", " ")
                .split("\\s+");
        
        // Count word frequencies
        Map<String, Integer> wordCount = new HashMap<>();
        for (String word : words) {
            word = word.trim();
            if (word.length() >= 3 && !STOP_WORDS.contains(word)) {
                // Give extra weight to tech keywords
                int weight = TECH_KEYWORDS.contains(word) ? 3 : 1;
                wordCount.put(word, wordCount.getOrDefault(word, 0) + weight);
            }
        }
        
        // Sort by frequency and return top suggested tags
        List<String> suggestions = wordCount.entrySet().stream()
                .sorted((e1, e2) -> Integer.compare(e2.getValue(), e1.getValue()))
                .map(Map.Entry::getKey)
                .limit(8)
                .collect(Collectors.toList());
        
        return suggestions;
    }

    /**
     * Validate and clean up tags
     * @param tags User-provided tags
     * @return Cleaned list of tags
     */
    public List<String> validateTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return new ArrayList<>();
        }
        
        return tags.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .map(String::toLowerCase)
                .filter(tag -> tag.length() >= 2 && tag.length() <= 30)
                .distinct()
                .limit(10) // Max 10 tags per post
                .collect(Collectors.toList());
    }
}
