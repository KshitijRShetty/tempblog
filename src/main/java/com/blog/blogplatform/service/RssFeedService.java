package com.blog.blogplatform.service;

import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.util.*;

@Service
public class RssFeedService {

    // Popular RSS feed URLs
    private static final List<String> RSS_FEEDS = Arrays.asList(
        // Start with just a few reliable feeds
        "https://github.blog/feed/",
        "https://stackoverflow.blog/feed/",
        "https://www.freecodecamp.org/news/rss/"
    );

    public List<Map<String, Object>> fetchAllRssFeeds(int articlesPerFeed) {
        List<Map<String, Object>> allArticles = new ArrayList<>();
        
        for (String feedUrl : RSS_FEEDS) {
            try {
                List<Map<String, Object>> articles = fetchRssFeed(feedUrl, articlesPerFeed);
                allArticles.addAll(articles);
            } catch (Exception e) {
                System.err.println("Error fetching RSS feed " + feedUrl + ": " + e.getMessage());
            }
        }
        
        return allArticles;
    }

    public List<Map<String, Object>> fetchRssFeed(String feedUrl, int limit) {
        List<Map<String, Object>> articles = new ArrayList<>();
        
        try {
            URL url = new URL(feedUrl);
            SyndFeedInput input = new SyndFeedInput();
            try (java.io.InputStream is = url.openStream()) {
                SyndFeed feed = input.build(new XmlReader(is));
            
                List<SyndEntry> entries = feed.getEntries();
                int count = 0;
            
                for (SyndEntry entry : entries) {
                    if (count >= limit) break;
                
                    try {
                        Map<String, Object> article = transformRssEntry(entry, feed.getTitle());
                        if (article != null) {
                            articles.add(article);
                            count++;
                        }
                    } catch (Exception e) {
                        System.err.println("Error processing RSS entry: " + e.getMessage());
                    }
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error fetching RSS feed: " + e.getMessage());
        }
        
        return articles;
    }

    private Map<String, Object> transformRssEntry(SyndEntry entry, String feedTitle) {
        try {
            Map<String, Object> article = new HashMap<>();
            
            // Generate unique ID
            String entryId = entry.getUri() != null ? entry.getUri() : entry.getLink();
            if (entryId != null) {
                article.put("id", "rss_" + Math.abs(entryId.hashCode()));
            } else {
                article.put("id", "rss_" + UUID.randomUUID().toString());
            }
            
            // Title
            article.put("title", entry.getTitle() != null ? entry.getTitle() : "Untitled");
            
            // Content/Description
            String content = "";
            if (entry.getDescription() != null && entry.getDescription().getValue() != null) {
                content = stripHtml(entry.getDescription().getValue());
            } else if (entry.getContents() != null && !entry.getContents().isEmpty()) {
                content = stripHtml(entry.getContents().get(0).getValue());
            }
            
            // Limit content length
            if (content.length() > 500) {
                content = content.substring(0, 497) + "...";
            }
            
            if (content.isEmpty()) {
                content = "Click to read this article";
            }
            
            article.put("content", content);
            
            // Images (if available in enclosures)
            article.put("imageUrls", Collections.emptyList());
            
            // Author
            Map<String, Object> author = new HashMap<>();
            if (entry.getAuthor() != null && !entry.getAuthor().isEmpty()) {
                author.put("name", entry.getAuthor());
            } else {
                author.put("name", feedTitle != null ? feedTitle : "RSS Feed");
            }
            article.put("user", author);
            
            // Metadata
            article.put("likes", 0);
            article.put("comments", Collections.emptyList());
            
            // Date
            Date publishedDate = entry.getPublishedDate() != null ? 
                                 entry.getPublishedDate() : 
                                 entry.getUpdatedDate() != null ? 
                                 entry.getUpdatedDate() : 
                                 new Date();
            article.put("createdAt", publishedDate.toInstant().toString());
            
            // External link
            article.put("external", true);
            article.put("source", "rss");
            article.put("url", entry.getLink());
            
            return article;
        } catch (Exception e) {
            System.err.println("Error transforming RSS entry: " + e.getMessage());
            return null;
        }
    }
    
    /**
     * Strip HTML tags and clean up text
     */
    private String stripHtml(String html) {
        if (html == null) return "";
        return html.replaceAll("<[^>]*>", " ")
                   .replaceAll("&nbsp;", " ")
                   .replaceAll("&quot;", "\"")
                   .replaceAll("&amp;", "&")
                   .replaceAll("&lt;", "<")
                   .replaceAll("&gt;", ">")
                   .replaceAll("\\s+", " ")
                   .trim();
    }
    
    /**
     * Add a custom RSS feed URL
     */
    public List<Map<String, Object>> fetchCustomFeed(String feedUrl, int limit) {
        return fetchRssFeed(feedUrl, limit);
    }
}
