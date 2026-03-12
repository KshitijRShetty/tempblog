# Blog Platform - New Features Documentation

## Overview
Your blog platform now includes four powerful new features:
1. **Blog Collection** - Automatically collects external blogs from Dev.to
2. **Trending Topics Detection** - Identifies hot topics based on engagement
3. **Post Recommendations** - Personalized post suggestions for users
4. **Summary Generation** - Auto-generates summaries and excerpts

---

## 1. Blog Collection (External Blogs)

### What it does:
- Automatically fetches 100+ recent articles from Dev.to API
- Merges external blogs with your local posts in the feed
- External blogs are marked with `external: true` flag

### API Endpoint:
```
GET /api/posts/feed
```

### Response Example:
```json
[
  {
    "id": "ext_123456",
    "title": "Getting Started with React",
    "content": "Learn the basics of React...",
    "external": true,
    "url": "https://dev.to/article-url",
    "user": { "name": "Dev.to Author" },
    "likes": 42,
    "comments": []
  },
  {
    "id": 5,
    "title": "My Local Blog Post",
    "content": "This is my post...",
    "external": false,
    "user": { "email": "user@example.com", "name": "John Doe" },
    "likes": 10,
    "comments": [...]
  }
]
```

---

## 2. Trending Topics Detection

### What it does:
- Analyzes all posts to identify trending keywords/topics
- Ranks topics based on:
  - Post engagement (likes + comments × 2)
  - Recency (recent posts get 2-3x boost)
  - Frequency of appearance
- Filters out common stop words
- Returns keywords that appear in at least 2 posts

### API Endpoints:

#### Get Trending Topics
```
GET /api/posts/trending/topics?limit=10
```

**Response:**
```json
[
  {
    "keyword": "react",
    "score": 87.5,
    "mentionCount": 15
  },
  {
    "keyword": "javascript",
    "score": 72.3,
    "mentionCount": 12
  }
]
```

#### Get Trending Posts
```
GET /api/posts/trending?limit=10
```

**Response:** Array of Post objects sorted by engagement score

**Scoring Algorithm:**
- Likes: 1 point each
- Comments: 2 points each
- Posts < 24 hours old: 3x multiplier
- Posts < 7 days old: 2x multiplier
- Posts > 7 days old: 1x multiplier

---

## 3. Post Recommendations

### What it does:
- Provides personalized post recommendations based on user's interests
- Analyzes user's liked posts to build interest profile
- Recommends posts the user hasn't seen with similar topics
- Falls back to popular posts for new users

### API Endpoints:

#### Get Personalized Recommendations (Requires Authentication)
```
GET /api/posts/recommendations?limit=10
Authorization: Bearer <jwt-token>
```

**Response:** Array of recommended Post objects

#### Get Posts by Topic
```
GET /api/posts/topic/{topic}?limit=10
```

**Example:**
```
GET /api/posts/topic/react?limit=10
```

**Response:** Array of Post objects containing the topic keyword

### Recommendation Algorithm:
1. Builds user profile from their liked posts (keyword extraction)
2. Scores all unseen posts based on:
   - Content similarity to user interests
   - Post popularity (likes + comments × 2) × 0.1
3. Returns top N highest-scoring posts

---

## 4. Summary Generation

### What it does:
- Generates concise summaries using extractive summarization
- Creates excerpts for preview cards
- Provides detailed post statistics
- Supports bulk summary generation

### API Endpoints:

#### Get Post Summary
```
GET /api/posts/{id}/summary
```

**Response:**
```json
{
  "postId": 5,
  "title": "Understanding Async Programming",
  "summary": "Async programming is crucial for modern applications. It allows non-blocking operations. This improves user experience significantly.",
  "fullLength": 2450,
  "summaryLength": 142,
  "compressionRatio": 94
}
```

#### Get Post Excerpt
```
GET /api/posts/{id}/excerpt?maxLength=200
```

**Response:**
```json
{
  "excerpt": "Async programming is crucial for modern applications. It allows non-blocking operations..."
}
```

#### Get Post Statistics
```
GET /api/posts/{id}/statistics
```

**Response:**
```json
{
  "postId": 5,
  "title": "Understanding Async Programming",
  "wordCount": 487,
  "characterCount": 2450,
  "sentenceCount": 28,
  "paragraphCount": 6,
  "likes": 15,
  "comments": 7,
  "engagement": 22,
  "estimatedReadTime": 2
}
```

#### Bulk Summary Generation
```
POST /api/posts/summaries/bulk
Content-Type: application/json

[1, 2, 3, 4, 5]
```

**Response:** Array of summary objects for each post ID

### Summarization Algorithm:
1. Splits content into sentences
2. Calculates word frequency (excluding stop words)
3. Scores each sentence based on important word frequency
4. Boosts score of first sentence by 50%
5. Returns top 3 highest-scoring sentences in original order

---

## Complete API Reference

### Public Endpoints (No Auth Required)
- `GET /api/posts` - Get all posts
- `GET /api/posts/feed` - Get mixed feed (local + external)
- `GET /api/posts/search?keyword={keyword}` - Search posts
- `GET /api/posts/trending/topics?limit={n}` - Get trending topics
- `GET /api/posts/trending?limit={n}` - Get trending posts
- `GET /api/posts/topic/{topic}?limit={n}` - Get posts by topic
- `GET /api/posts/{id}/summary` - Get post summary
- `GET /api/posts/{id}/excerpt?maxLength={n}` - Get post excerpt
- `GET /api/posts/{id}/statistics` - Get post statistics
- `POST /api/posts/summaries/bulk` - Get bulk summaries

### Authenticated Endpoints (Requires JWT Token)
- `POST /api/posts/create` - Create new post
- `PUT /api/posts/{id}` - Update post
- `DELETE /api/posts/{id}` - Delete post
- `POST /api/posts/{id}/like` - Toggle like
- `GET /api/posts/{id}/liked` - Check if user liked post
- `POST /api/posts/{id}/comment` - Add comment
- `GET /api/posts/recommendations?limit={n}` - Get personalized recommendations

---

## Testing the Features

### 1. Test Trending Topics
```bash
curl http://localhost:8080/api/posts/trending/topics?limit=10
```

### 2. Test Recommendations (with auth)
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:8080/api/posts/recommendations?limit=10
```

### 3. Test Summary Generation
```bash
curl http://localhost:8080/api/posts/1/summary
```

### 4. Test External Blog Collection
```bash
curl http://localhost:8080/api/posts/feed
```

---

## Frontend Integration Examples

### Display Trending Topics
```javascript
fetch('http://localhost:8080/api/posts/trending/topics?limit=5')
  .then(res => res.json())
  .then(topics => {
    topics.forEach(topic => {
      console.log(`Trending: #${topic.keyword} (${topic.mentionCount} posts)`);
    });
  });
```

### Get Recommendations
```javascript
const token = localStorage.getItem('token');
fetch('http://localhost:8080/api/posts/recommendations?limit=10', {
  headers: { 'Authorization': `Bearer ${token}` }
})
  .then(res => res.json())
  .then(posts => {
    // Display recommended posts
  });
```

### Show Post Summary
```javascript
fetch(`http://localhost:8080/api/posts/${postId}/summary`)
  .then(res => res.json())
  .then(data => {
    console.log(`Summary (${data.compressionRatio}% shorter):`);
    console.log(data.summary);
  });
```

---

## Configuration

### Adjust Algorithms
You can customize the behavior by modifying the service classes:

- **TrendingService.java** - Change scoring weights and time periods
- **RecommendationService.java** - Adjust content matching algorithms
- **SummaryService.java** - Change number of sentences, word frequency thresholds

### External Blog Sources
Currently using Dev.to API. To add more sources:
1. Update `ExternalBlogService.java`
2. Add additional API calls
3. Merge results in `getFeed()` method

---

## Performance Notes

- Trending calculation runs on-demand (consider caching for large datasets)
- Recommendations are calculated per request (consider background processing)
- Summary generation uses simple extractive method (fast but basic)
- External blog fetching may add latency (consider background refresh)

---

## Future Enhancements

Consider adding:
- Caching layer (Redis) for trending topics
- ML-based recommendation engine
- AI-powered summarization (OpenAI API)
- Real-time trending updates (WebSocket)
- User preference settings
- Topic following/subscriptions
- Bookmark/save for later functionality
- Read time tracking
