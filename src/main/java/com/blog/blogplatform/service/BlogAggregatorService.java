package com.blog.blogplatform.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Blog Aggregator Service
 * Fetches blogs from Dev.to API
 */
@Service
@RequiredArgsConstructor
public class BlogAggregatorService {

    private final ExternalBlogService devToService;
    
    // Cache to avoid fetching external blogs too frequently
    private List<Map<String, Object>> cachedBlogs = null;
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    /**
     * Fetch and aggregate blogs from Dev.to
     */
    public List<Map<String, Object>> aggregateAllBlogs() {
        // Check if we have cached data
        long currentTime = System.currentTimeMillis();
        if (cachedBlogs != null && (currentTime - lastFetchTime) < CACHE_DURATION) {
            return new ArrayList<>(cachedBlogs);
        }
        
        List<Map<String, Object>> allBlogs = fetchDevToSafely();
        
        // Shuffle for variety
        Collections.shuffle(allBlogs);
        
        // Update cache
        cachedBlogs = new ArrayList<>(allBlogs);
        lastFetchTime = currentTime;
        
        return allBlogs;
    }
    
    /**
     * Get blogs from Dev.to with limit
     */
    public List<Map<String, Object>> getBlogsBySource(String source, int limit) {
        if ("devto".equalsIgnoreCase(source)) {
            return fetchDevToSafely().stream()
                .limit(limit)
                .collect(Collectors.toList());
        }
        return Collections.emptyList();
    }
    
    /**
     * Get statistics about aggregated blogs
     */
    public Map<String, Object> getAggregatorStats() {
        List<Map<String, Object>> allBlogs = aggregateAllBlogs();
        
        Map<String, Long> sourceCount = allBlogs.stream()
            .collect(Collectors.groupingBy(
                blog -> blog.getOrDefault("source", "unknown").toString(),
                Collectors.counting()
            ));
        
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalBlogs", allBlogs.size());
        stats.put("bySource", sourceCount);
        stats.put("lastUpdated", new Date(lastFetchTime));
        stats.put("cacheExpiry", new Date(lastFetchTime + CACHE_DURATION));
        
        return stats;
    }
    
    /**
     * Force refresh cache
     */
    public void refreshCache() {
        cachedBlogs = null;
        lastFetchTime = 0;
    }
    
    // Safe fetch methods with error handling
    
    private List<Map<String, Object>> fetchDevToSafely() {
        try {
            List<Map<String, Object>> blogs = devToService.fetchExternalBlogs();
            // Add source tag
            blogs.forEach(blog -> {
                blog.put("source", "devto");
                blog.put("sourceLabel", "Dev.to");
            });
            return blogs;
        } catch (Exception e) {
            System.err.println("Error fetching Dev.to blogs: " + e.getMessage());
            return Collections.emptyList();
        }
    }
}
