package com.blog.blogplatform.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import java.util.*;

@Service
public class ExternalBlogService {

    @SuppressWarnings("unchecked")
    public List<Map<String, Object>> fetchExternalBlogs() {
        try {
            // Fetch maximum articles (Dev.to API allows up to 1000 per_page)
            // Using 100 for optimal performance and variety
            int articleCount = 100;
            
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://dev.to/api/articles?per_page=" + articleCount;
            
            // Add headers to avoid being blocked
            HttpHeaders headers = new HttpHeaders();
            headers.set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<List> response = restTemplate.exchange(url, HttpMethod.GET, entity, List.class);
            List<Map<String, Object>> articles = response.getBody();
            List<Map<String, Object>> blogs = new ArrayList<>();

            if (articles != null) {
                for (Map<String, Object> article : articles) {
                    Map<String, Object> blog = new HashMap<>();

                    blog.put("id", "ext_" + article.get("id"));
                    blog.put("title", article.get("title"));
                    blog.put("content", article.get("description"));
                    
                    // Handle image URL
                    Object coverImage = article.get("cover_image");
                    if (coverImage != null && !coverImage.toString().isEmpty()) {
                        blog.put("imageUrls", Collections.singletonList(coverImage.toString()));
                    } else {
                        blog.put("imageUrls", Collections.emptyList());
                    }
                    
                    // Handle user/author
                    Map<String, Object> user = (Map<String, Object>) article.get("user");
                    if (user != null) {
                        Map<String, Object> author = new HashMap<>();
                        author.put("name", user.get("name"));
                        blog.put("user", author);
                    } else {
                        Map<String, Object> author = new HashMap<>();
                        author.put("name", "Dev.to Author");
                        blog.put("user", author);
                    }
                    
                    blog.put("likes", article.get("positive_reactions_count") != null ? article.get("positive_reactions_count") : 0);
                    blog.put("comments", Collections.emptyList());
                    blog.put("createdAt", article.get("published_at"));
                    blog.put("external", true);
                    blog.put("url", article.get("url")); // Dev.to article URL

                    blogs.add(blog);
                }
            }

            return blogs;
        } catch (Exception e) {
            System.err.println("Error fetching external blogs: " + e.getMessage());
            e.printStackTrace();
            return Collections.emptyList();
        }
    }
}
