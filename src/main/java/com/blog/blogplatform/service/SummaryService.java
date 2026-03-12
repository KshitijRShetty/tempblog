package com.blog.blogplatform.service;

import com.blog.blogplatform.entity.Post;
import com.blog.blogplatform.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class SummaryService {

    private final PostRepository postRepository;

    /**
     * Generate a summary of a post using extractive summarization
     */
    public Map<String, Object> generatePostSummary(@NonNull Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        String content = post.getContent();
        String summary = extractiveSummarize(content, 3); // Get top 3 sentences
        
        Map<String, Object> result = new HashMap<>();
        result.put("postId", post.getId());
        result.put("title", post.getTitle());
        result.put("summary", summary);
        result.put("fullLength", content.length());
        result.put("summaryLength", summary.length());
        result.put("compressionRatio", Math.round((1 - (double) summary.length() / content.length()) * 100));
        
        return result;
    }
    
    /**
     * Generate summaries for multiple posts
     */
    public List<Map<String, Object>> generateBulkSummaries(List<Long> postIds) {
        List<Map<String, Object>> summaries = new ArrayList<>();
        
        for (Long postId : postIds) {
            try {
                @SuppressWarnings("null")
                Map<String, Object> summary = generatePostSummary(postId);
                summaries.add(summary);
            } catch (Exception e) {
                // Skip posts that can't be summarized
                System.err.println("Error summarizing post " + postId + ": " + e.getMessage());
            }
        }
        
        return summaries;
    }
    
    /**
     * Generate a quick excerpt from the beginning of the post
     */
    public String generateExcerpt(@NonNull Long postId, int maxLength) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        String content = post.getContent();
        
        if (content.length() <= maxLength) {
            return content;
        }
        
        // Try to cut at a sentence boundary
        String excerpt = content.substring(0, maxLength);
        int lastPeriod = excerpt.lastIndexOf('.');
        int lastQuestion = excerpt.lastIndexOf('?');
        int lastExclamation = excerpt.lastIndexOf('!');
        
        int cutPoint = Math.max(lastPeriod, Math.max(lastQuestion, lastExclamation));
        
        if (cutPoint > maxLength / 2) { // If we found a good cut point
            return content.substring(0, cutPoint + 1);
        } else {
            // Cut at the last space
            int lastSpace = excerpt.lastIndexOf(' ');
            return content.substring(0, lastSpace) + "...";
        }
    }
    
    /**
     * Extractive summarization: ranks sentences and returns top N
     */
    private String extractiveSummarize(String text, int numSentences) {
        // Split into sentences
        String[] sentences = text.split("[.!?]+");
        
        if (sentences.length <= numSentences) {
            return text;
        }
        
        // Calculate word frequency
        Map<String, Integer> wordFreq = calculateWordFrequency(text);
        
        // Score each sentence based on word frequency
        Map<String, Double> sentenceScores = new HashMap<>();
        for (String sentence : sentences) {
            if (sentence.trim().isEmpty()) continue;
            
            double score = 0.0;
            String[] words = sentence.toLowerCase().split("\\s+");
            
            for (String word : words) {
                word = word.replaceAll("[^a-z]", "");
                if (wordFreq.containsKey(word)) {
                    score += wordFreq.get(word);
                }
            }
            
            // Normalize by sentence length to avoid bias towards longer sentences
            score = score / words.length;
            
            // Bonus for first sentence (often contains key information)
            if (sentence.equals(sentences[0])) {
                score *= 1.5;
            }
            
            sentenceScores.put(sentence, score);
        }
        
        // Get top N sentences
        List<String> topSentences = sentenceScores.entrySet().stream()
                .sorted((e1, e2) -> Double.compare(e2.getValue(), e1.getValue()))
                .limit(numSentences)
                .map(Map.Entry::getKey)
                .toList();
        
        // Return sentences in original order
        List<String> orderedSummary = new ArrayList<>();
        for (String sentence : sentences) {
            if (topSentences.contains(sentence)) {
                orderedSummary.add(sentence.trim());
            }
        }
        
        return String.join(". ", orderedSummary) + ".";
    }
    
    /**
     * Calculate word frequency for ranking
     */
    private Map<String, Integer> calculateWordFrequency(String text) {
        Map<String, Integer> wordFreq = new HashMap<>();
        
        Set<String> stopWords = Set.of(
            "the", "is", "at", "which", "on", "a", "an", "and", "or", "but",
            "in", "with", "to", "for", "of", "as", "by", "this", "that",
            "it", "from", "be", "are", "was", "were", "been", "have", "has",
            "had", "do", "does", "did", "will", "would", "should", "could",
            "can", "may", "might", "must", "i", "you", "he", "she", "we", "they"
        );
        
        String[] words = text.toLowerCase().split("\\s+");
        
        for (String word : words) {
            word = word.replaceAll("[^a-z]", "");
            
            if (word.length() > 3 && !stopWords.contains(word)) {
                wordFreq.put(word, wordFreq.getOrDefault(word, 0) + 1);
            }
        }
        
        return wordFreq;
    }
    
    /**
     * Get key statistics about a post
     */
    public Map<String, Object> getPostStatistics(@NonNull Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));
        
        String content = post.getContent();
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("postId", post.getId());
        stats.put("title", post.getTitle());
        stats.put("wordCount", content.split("\\s+").length);
        stats.put("characterCount", content.length());
        stats.put("sentenceCount", content.split("[.!?]+").length);
        stats.put("paragraphCount", content.split("\\n\\n+").length);
        stats.put("likes", post.getLikes());
        stats.put("comments", post.getComments().size());
        stats.put("engagement", post.getLikes() + post.getComments().size());
        stats.put("estimatedReadTime", Math.max(1, content.split("\\s+").length / 200)); // 200 words per minute
        
        return stats;
    }
}
