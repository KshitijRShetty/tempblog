# Blog Aggregator - Multi-Source Architecture

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Frontend      │
│   (React App)   │
└────────┬────────┘
         │
         ↓
┌─────────────────────────────────┐
│   Spring Boot API               │
│   BlogAggregatorService         │
└────┬──────────┬────────┬────────┘
     │          │        │
     ↓          ↓        ↓
┌──────────┐ ┌──────┐ ┌──────────┐
│ Dev.to   │ │  HN  │ │   RSS    │
│   API    │ │ API  │ │  Feeds   │
└──────────┘ └──────┘ └──────────┘
                         │
                    ┌────┴────┐
                    │         │
                    ↓         ↓
              ┌─────────┐ ┌────────┐
              │ Medium  │ │GitHub  │
              │TechCrch │ │ etc... │
              └─────────┘ └────────┘
```

## 📡 Data Sources

### 1. **Dev.to API** (100 articles)
- **Source**: https://dev.to/api/articles
- **Type**: REST API
- **Content**: Developer articles, tutorials, tech news
- **Refresh**: Cached for 5 minutes

### 2. **Hacker News API** (30 stories)
- **Source**: Firebase API (https://hacker-news.firebaseio.com)
- **Type**: REST API
- **Content**: Tech news, startup stories, programming discussions
- **Refresh**: Cached for 5 minutes

### 3. **RSS Feeds** (36+ articles from 12 feeds)
- **Medium** (Programming, Technology, Web Development)
- **TechCrunch** - Tech industry news
- **The Verge** - Technology news
- **CSS Tricks** - Web development
- **Smashing Magazine** - Design & development
- **Coding Horror** - Software development
- **Martin Fowler** - Software architecture
- **GitHub Blog** - Open source news
- **Stack Overflow Blog** - Developer community
- **freeCodeCamp** - Coding tutorials

**Total: 160+ articles** aggregated from all sources!

---

## 🚀 New API Endpoints

### Main Feed (All Sources Combined)
```bash
GET /api/posts/feed
```
Returns local posts + Dev.to + Hacker News + RSS feeds (shuffled)

### Get Blogs by Source
```bash
GET /api/aggregator/source/{source}?limit=20

# Examples:
GET /api/aggregator/source/devto?limit=50
GET /api/aggregator/source/hackernews?limit=20
GET /api/aggregator/source/rss?limit=30
```

### Aggregator Statistics
```bash
GET /api/aggregator/stats
```

**Response:**
```json
{
  "totalBlogs": 168,
  "bySource": {
    "devto": 100,
    "hackernews": 30,
    "rss": 36,
    "local": 2
  },
  "lastUpdated": "2026-03-10T03:35:12.000+00:00",
  "cacheExpiry": "2026-03-10T03:40:12.000+00:00"
}
```

### Force Cache Refresh
```bash
POST /api/aggregator/refresh
```

### Custom RSS Feed
```bash
GET /api/aggregator/rss/custom?url=https://example.com/feed&limit=10
```

---

## 🎨 Frontend Changes

### Source Badges
Each blog post now displays a colored badge indicating its source:

- **Local Posts**: 🖊️ Purple badge "Local Post"
- **Dev.to**: 🌐 Cyan badge "Dev.to"
- **Hacker News**: 📰 Orange badge "Hacker News"
- **RSS Feeds**: 📡 Green badge "RSS Feed"

### Post Data Structure
```javascript
{
  "id": "hn_123456",
  "title": "The Future of Web Development",
  "content": "Article preview...",
  "external": true,
  "source": "hackernews",
  "sourceLabel": "Hacker News",
  "url": "https://news.ycombinator.com/item?id=123456",
  "user": { "name": "Author Name" },
  "likes": 42,
  "createdAt": "2026-03-10T03:30:00.000Z"
}
```

---

## 🔧 Services Architecture

### 1. **BlogAggregatorService**
Main orchestrator that:
- Fetches from all sources in parallel (using ExecutorService)
- Implements 5-minute caching to avoid excessive API calls
- Handles errors gracefully (if one source fails, others still work)
- Shuffles results for variety

### 2. **ExternalBlogService** (Dev.to)
- Fetches 100 recent articles from Dev.to
- Filters articles without titles/descriptions
- Provides fallback content

### 3. **HackerNewsService** 
- Fetches top 30 stories from HN
- Gets story details individually
- Strips HTML from content
- Converts Unix timestamps

### 4. **RssFeedService**
- Parses XML/Atom feeds using Rome library
- Fetches 3 articles per feed (12 feeds = 36 articles)
- Handles missing data gracefully
- Cleans HTML entities

---

## ⚙️ Configuration

### Add Custom RSS Feeds
Edit `RssFeedService.java` and add to the `RSS_FEEDS` list:

```java
private static final List<String> RSS_FEEDS = Arrays.asList(
    "https://yourfeed.com/rss",
    "https://anotherfeed.com/feed",
    // ... existing feeds
);
```

### Adjust Fetching Limits
In `BlogAggregatorService.java`:

```java
// Change article counts per source
hackerNewsService.fetchHackerNewsStories(30); // HN stories
rssFeedService.fetchAllRssFeeds(3); // articles per RSS feed
```

### Modify Cache Duration
```java
private static final long CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
```

---

## 🧪 Testing the Aggregator

### 1. Test All Sources Combined
```bash
curl http://localhost:8080/api/posts/feed | jq length
# Should show 160+ articles
```

### 2. Test Individual Sources
```bash
# Dev.to only
curl http://localhost:8080/api/aggregator/source/devto?limit=10

# Hacker News only
curl http://localhost:8080/api/aggregator/source/hackernews?limit=10

# RSS feeds only
curl http://localhost:8080/api/aggregator/source/rss?limit=10
```

### 3. Check Statistics
```bash
curl http://localhost:8080/api/aggregator/stats | jq
```

### 4. Test Custom RSS Feed
```bash
curl "http://localhost:8080/api/aggregator/rss/custom?url=https://blog.golang.org/feed.atom&limit=5"
```

---

## 📊 Performance Optimization

### Parallel Fetching
All sources are fetched concurrently using `ExecutorService`:
- **Dev.to**: 10s timeout
- **Hacker News**: 10s timeout
- **RSS Feeds**: 15s timeout (multiple feeds)

If any source times out, others continue working.

### Caching Strategy
- Cache duration: **5 minutes**
- Prevents excessive API calls
- Can force refresh via `/api/aggregator/refresh`

### Memory Efficiency
- Only fetches what's needed
- Limits article counts per source
- Cleans up executor threads properly

---

## 🎯 RSS Feed URLs Reference

### Currently Integrated Feeds

**Developer Blogs:**
- Medium Programming: `https://medium.com/feed/tag/programming`
- Medium Technology: `https://medium.com/feed/tag/technology`
- Medium Web Dev: `https://medium.com/feed/tag/web-development`
- Martin Fowler: `https://martinfowler.com/feed.atom`
- Coding Horror: `https://blog.codinghorror.com/rss/`

**Tech News:**
- TechCrunch: `https://techcrunch.com/feed/`
- The Verge: `https://www.theverge.com/rss/index.xml`

**Web Development:**
- CSS Tricks: `https://css-tricks.com/feed/`
- Smashing Magazine: `https://www.smashingmagazine.com/feed/`

**Community:**
- GitHub Blog: `https://github.blog/feed/`
- Stack Overflow: `https://stackoverflow.blog/feed/`
- freeCodeCamp: `https://www.freecodecamp.org/news/rss/`

### Adding More RSS Feeds

Popular blog platforms all support RSS:

**WordPress blogs:** Add `/feed/` to URL
- `https://example.com/feed/`

**Medium publications:** 
- `https://medium.com/feed/publication-name`

**Substack:**
- `https://newsletter.substack.com/feed`

**Ghost blogs:**
- `https://example.com/rss/`

---

## 🐛 Troubleshooting

### Issue: "No external blogs showing"
**Solution:** Check network connectivity, verify API endpoints are accessible

### Issue: "RSS feeds timing out"
**Solution:** Reduce number of RSS feeds or increase timeout in `BlogAggregatorService`

### Issue: "Duplicate articles"
**Solution:** Each article has a unique ID based on source prefix (`ext_`, `hn_`, `rss_`)

### Issue: "Cache not refreshing"
**Solution:** Call `POST /api/aggregator/refresh` or wait 5 minutes

---

## 📈 Scaling Recommendations

For production deployment:

1. **Use Redis for caching** instead of in-memory cache
2. **Background job scheduler** (Spring @Scheduled) for periodic refresh
3. **Database storage** for external blogs (reduce API calls)
4. **Rate limiting** on external API calls
5. **Circuit breaker** pattern for failed sources (Resilience4j)
6. **Monitoring** with metrics (Micrometer + Prometheus)

---

## 🔐 Security Considerations

- All external API calls use User-Agent headers
- No sensitive data is exposed
- External URLs are validated
- HTML content is stripped from RSS feeds
- No script injection vulnerabilities

---

## 📝 Future Enhancements

Consider adding:
- ✅ ~~Dev.to API~~
- ✅ ~~Hacker News API~~
- ✅ ~~RSS feeds~~
- 🔄 Reddit API (r/programming, r/webdev)
- 🔄 Twitter/X API for hashtags
- 🔄 YouTube RSS feeds
- 🔄 Podcasts RSS feeds
- 🔄 Custom webhook integrations
- 🔄 AI-powered content summarization
- 🔄 Content categorization/tagging
- 🔄 User preferences for sources

---

## 🎉 Summary

Your blog platform is now a **full-featured blog aggregator** with:

- ✅ **160+ articles** from multiple sources
- ✅ **Parallel fetching** for speed
- ✅ **Caching** to reduce API calls
- ✅ **Source badges** for easy identification
- ✅ **Error handling** for reliability
- ✅ **Extensible architecture** for adding sources
- ✅ **Custom RSS feed support**

Start the server and enjoy your multi-source blog aggregator! 🚀
