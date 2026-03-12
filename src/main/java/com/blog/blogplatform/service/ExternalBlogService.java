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

    @SuppressWarnings({"unchecked", "null"})
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
            
            ResponseEntity<List<?>> response = restTemplate.exchange(url, HttpMethod.GET, entity, (Class<List<?>>) (Class<?>) List.class);
            List<?> rawArticles = response.getBody();
            List<Map<String, Object>> blogs = new ArrayList<>();

            if (rawArticles != null) {
                for (Object rawArticle : rawArticles) {
                    if (!(rawArticle instanceof Map)) continue;
                    
                    Map<String, Object> article = (Map<String, Object>) rawArticle;
                    
                    // Skip articles without description or title
                    Object description = article.get("description");
                    Object title = article.get("title");
                    
                    if (title == null || title.toString().trim().isEmpty()) {
                        continue; // Skip articles without title
                    }
                    
                    Map<String, Object> blog = new HashMap<>();

                    blog.put("id", "ext_" + article.get("id"));
                    blog.put("title", title);
                    
                    // Provide fallback for missing description - try to get more content
                    String content = "";
                    if (description != null && !description.toString().trim().isEmpty()) {
                        content = description.toString();
                        
                        // If description is short, try to add more context
                        Object readingTimeMinutes = article.get("reading_time_minutes");
                        Object tagList = article.get("tag_list");
                        
                        // Enhance short descriptions with additional context
                        if (content.length() < 200) {
                            StringBuilder enhancedContent = new StringBuilder(content);
                            
                            if (tagList instanceof List && !((List<?>) tagList).isEmpty()) {
                                enhancedContent.append("\n\n📚 Topics covered: ");
                                List<?> tags = (List<?>) tagList;
                                for (int i = 0; i < Math.min(tags.size(), 5); i++) {
                                    enhancedContent.append("#").append(tags.get(i));
                                    if (i < tags.size() - 1) enhancedContent.append(", ");
                                }
                            }
                            
                            if (readingTimeMinutes != null) {
                                enhancedContent.append("\n\n⏱️ Estimated reading time: ")
                                    .append(readingTimeMinutes).append(" minutes");
                            }
                            
                            enhancedContent.append("\n\nThis article provides in-depth insights and practical guidance. ");
                            enhancedContent.append("Click below to read the complete article with code examples, ");
                            enhancedContent.append("detailed explanations, and community discussions.");
                            
                            content = enhancedContent.toString();
                        }
                    } else {
                        // Fallback: use title or generic message
                        content = "This article covers interesting topics in software development.\n\n";
                        content += "Click the button below to read the full article on Dev.to for detailed insights, ";
                        content += "code examples, and community discussions.";
                    }
                    blog.put("content", content);
                    
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
                    
                    // Add tags for display
                    Object tagList = article.get("tag_list");
                    if (tagList instanceof List) {
                        blog.put("tags", tagList);
                    } else {
                        blog.put("tags", Collections.emptyList());
                    }
                    
                    // Add reading time if available
                    Object readingTime = article.get("reading_time_minutes");
                    if (readingTime != null) {
                        blog.put("readingTime", readingTime);
                    }

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
