# Quick Reference - Blog Aggregator API

## 🎯 Main Endpoints

### Get Unified Feed (All Sources)
```bash
GET /api/posts/feed
# Returns: Local + Dev.to + Hacker News + RSS feeds
```

### Get Single Source
```bash
GET /api/aggregator/source/{source}?limit=N

Examples:
  /api/aggregator/source/devto?limit=50
  /api/aggregator/source/hackernews?limit=20
  /api/aggregator/source/rss?limit=30
```

### Get Stats
```bash
GET /api/aggregator/stats
# Shows total blogs, count by source, cache info
```

### Refresh Cache
```bash
POST /api/aggregator/refresh
```

### Custom RSS
```bash
GET /api/aggregator/rss/custom?url={feed_url}&limit=N
```

---

## 📊 Data Sources

| Source | Count | Type | Refresh |
|--------|-------|------|---------|
| Dev.to | 100 | REST API | 5 min |
| Hacker News | 30 | REST API | 5 min |
| RSS Feeds | 36 | RSS/Atom | 5 min |
| **Total** | **166+** | - | - |

---

## 🎨 Source Badges (Frontend)

| Source | Badge | Color |
|--------|-------|-------|
| Local | ✍️ Local Post | Purple |
| Dev.to | 🌐 Dev.to | Cyan |
| Hacker News | 📰 Hacker News | Orange |
| RSS | 📡 RSS Feed | Green |

---

## 🧪 Quick Tests

```bash
# Count total articles
curl -s http://localhost:8080/api/posts/feed | jq 'length'

# Show sources breakdown
curl -s http://localhost:8080/api/aggregator/stats | jq '.bySource'

# Test Dev.to only
curl -s http://localhost:8080/api/aggregator/source/devto?limit=5 | jq '.[].title'

# Test custom RSS
curl "http://localhost:8080/api/aggregator/rss/custom?url=https://blog.golang.org/feed.atom&limit=3"
```

---

## 🔧 Customization

### Add RSS Feed
Edit `RssFeedService.java`:
```java
private static final List<String> RSS_FEEDS = Arrays.asList(
    "https://your-feed.com/rss",
    // ... existing feeds
);
```

### Change Cache Time
Edit `BlogAggregatorService.java`:
```java
private static final long CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
```

### Adjust Article Counts
Edit `BlogAggregatorService.java`:
```java
hackerNewsService.fetchHackerNewsStories(50); // More HN stories
rssFeedService.fetchAllRssFeeds(5); // More per feed
```

---

## 📁 File Structure

```
service/
├── BlogAggregatorService.java    # Main orchestrator
├── ExternalBlogService.java      # Dev.to API
├── HackerNewsService.java        # Hacker News API
├── RssFeedService.java           # RSS parser
└── PostService.java              # Uses aggregator

controller/
└── AggregatorController.java     # New endpoints
```

---

## ⚡ Performance

- **Parallel fetching** (3 threads)
- **5-minute cache**
- **Timeout protection** (10-15s per source)
- **Graceful degradation** (if one source fails, others continue)

---

## 🚀 Start Using

1. Start backend: `.\mvnw.cmd spring-boot:run`
2. Start frontend: `cd frontend && npm run dev`
3. Open browser: `http://localhost:5173`
4. See 160+ articles from all sources!

---

## 📖 Full Documentation

See `AGGREGATOR_GUIDE.md` for complete details.
