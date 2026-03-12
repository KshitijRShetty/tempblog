package com.blog.blogplatform.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import java.util.*;

@Service
public class HackerNewsService {

    private static final String HN_TOP_STORIES_URL = "https://hacker-news.firebaseio.com/v0/topstories.json";
    private static final String HN_ITEM_URL = "https://hacker-news.firebaseio.com/v0/item/%d.json";

    @SuppressWarnings({"unchecked", "null"})
    public List<Map<String, Object>> fetchHackerNewsStories(int limit) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            restTemplate.setRequestFactory(new org.springframework.http.client.SimpleClientHttpRequestFactory());
            ((org.springframework.http.client.SimpleClientHttpRequestFactory) restTemplate.getRequestFactory())
                .setConnectTimeout(java.time.Duration.ofSeconds(5));
            ((org.springframework.http.client.SimpleClientHttpRequestFactory) restTemplate.getRequestFactory())
                .setReadTimeout(java.time.Duration.ofSeconds(10));
            
            // Get top story IDs
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "BlogPlatform/1.0");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            System.out.println("Fetching HN top stories...");
            
            ResponseEntity<List<?>> response = restTemplate.exchange(
                HN_TOP_STORIES_URL, 
                HttpMethod.GET, 
                entity, 
                (Class<List<?>>) (Class<?>) List.class
            );
            
            List<?> rawList = response.getBody();
            if (rawList == null || rawList.isEmpty()) {
                System.out.println("No HN stories found");
                return Collections.emptyList();
            }
            
            // Convert to List<Integer>
            List<Integer> storyIds = new ArrayList<>();
            for (Object obj : rawList) {
                if (obj instanceof Integer) {
                    storyIds.add((Integer) obj);
                }
            }
            
            System.out.println("Got " + storyIds.size() + " HN story IDs");
            
            List<Map<String, Object>> stories = new ArrayList<>();
            
            // Fetch first 'limit' stories (reduced for speed)
            int fetchLimit = Math.min(limit, Math.min(20, storyIds.size())); // Max 20 stories
            for (int i = 0; i < fetchLimit; i++) {
                try {
                    Map<String, Object> story = fetchStoryDetails(storyIds.get(i), restTemplate, headers);
                    if (story != null) {
                        stories.add(story);
                        System.out.println("Fetched HN story " + (i+1) + "/" + fetchLimit);
                    }
                } catch (Exception e) {
                    System.err.println("Error fetching HN story " + storyIds.get(i) + ": " + e.getMessage());
                }
            }
            
            System.out.println("Successfully fetched " + stories.size() + " HN stories");
            return stories;
        } catch (Exception e) {
            System.err.println("Error fetching Hacker News stories: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    @SuppressWarnings({"unchecked", "null"})
    private Map<String, Object> fetchStoryDetails(int storyId, RestTemplate restTemplate, HttpHeaders headers) {
        try {
            String url = String.format(HN_ITEM_URL, storyId);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map<?, ?>> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                entity,
                (Class<Map<?, ?>>) (Class<?>) Map.class
            );
            
            Map<?, ?> rawItem = response.getBody();
            if (rawItem == null || !"story".equals(rawItem.get("type"))) {
                return null;
            }
            
            // Convert to Map<String, Object>
            Map<String, Object> item = new HashMap<>();
            for (Map.Entry<?, ?> entry : rawItem.entrySet()) {
                if (entry.getKey() != null) {
                    item.put(entry.getKey().toString(), entry.getValue());
                }
            }
            
            // Transform to our blog format
            Map<String, Object> blog = new HashMap<>();
            blog.put("id", "hn_" + storyId);
            blog.put("title", item.get("title"));
            
            // HN stories often don't have text, just URLs
            String content = "";
            if (item.get("text") != null) {
                content = stripHtml(item.get("text").toString());
            } else if (item.get("url") != null) {
                content = "Read the full story at: " + item.get("url");
            } else {
                content = "Click to view discussion on Hacker News";
            }
            blog.put("content", content);
            
            blog.put("imageUrls", Collections.emptyList());
            
            // Author info
            Map<String, Object> author = new HashMap<>();
            author.put("name", item.get("by") != null ? item.get("by") : "HN User");
            blog.put("user", author);
            
            blog.put("likes", item.get("score") != null ? item.get("score") : 0);
            blog.put("comments", Collections.emptyList());
            
            // Convert Unix timestamp to ISO format
            if (item.get("time") != null) {
                long timestamp = ((Number) item.get("time")).longValue() * 1000;
                blog.put("createdAt", new Date(timestamp).toInstant().toString());
            } else {
                blog.put("createdAt", new Date().toInstant().toString());
            }
            
            blog.put("external", true);
            blog.put("source", "hackernews");
            
            // Add HN URL
            String hnUrl = "https://news.ycombinator.com/item?id=" + storyId;
            blog.put("url", hnUrl);
            
            return blog;
        } catch (Exception e) {
            System.err.println("Error fetching HN story details: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Strip HTML tags from content
     */
    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", " ")
                   .replaceAll("\\s+", " ")
                   .trim();
    }
}
