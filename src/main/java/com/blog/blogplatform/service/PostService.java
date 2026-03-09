package com.blog.blogplatform.service;

import com.blog.blogplatform.dto.UpdatePostRequest;
import com.blog.blogplatform.entity.Comment;
import com.blog.blogplatform.entity.Like;
import com.blog.blogplatform.entity.Post;
import com.blog.blogplatform.entity.User;
import com.blog.blogplatform.repository.CommentRepository;
import com.blog.blogplatform.repository.LikeRepository;
import com.blog.blogplatform.repository.PostRepository;
import com.blog.blogplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final ExternalBlogService externalBlogService;

    public Post createPost(String title, String content, List<String> imageUrls, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Post post = Post.builder()
                .title(title)
                .content(content)
                .imageUrls(imageUrls != null ? imageUrls : new ArrayList<>())
                .likes(0)
                .createdAt(LocalDateTime.now())
                .user(user)
                .build();

        return postRepository.save(post);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<Map<String, Object>> getFeed() {
        // Get local posts and convert to maps
        List<Post> localPosts = postRepository.findAll();
        List<Map<String, Object>> localPostMaps = new ArrayList<>();
        
        for (Post post : localPosts) {
            Map<String, Object> postMap = new HashMap<>();
            postMap.put("id", post.getId());
            postMap.put("title", post.getTitle());
            postMap.put("content", post.getContent());
            postMap.put("imageUrls", post.getImageUrls());
            postMap.put("createdAt", post.getCreatedAt());
            postMap.put("likes", post.getLikes());
            postMap.put("comments", post.getComments());
            
            Map<String, Object> userMap = new HashMap<>();
            if (post.getUser() != null) {
                userMap.put("email", post.getUser().getEmail());
                userMap.put("name", post.getUser().getName());
            }
            postMap.put("user", userMap);
            postMap.put("external", false);
            
            localPostMaps.add(postMap);
        }
        
        // Get external blogs with random count (10-30 articles)
        List<Map<String, Object>> externalBlogs = externalBlogService.fetchExternalBlogs();
        
        // Merge both into a feed
        List<Map<String, Object>> feed = new ArrayList<>();
        feed.addAll(localPostMaps);
        feed.addAll(externalBlogs);
        
        // Shuffle the feed randomly so posts are mixed
        java.util.Collections.shuffle(feed);
        
        return feed;
    }

    @Transactional
    public Map<String, Object> toggleLike(Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<Like> existingLike = likeRepository.findByUserAndPost(user, post);
        
        boolean liked;
        if (existingLike.isPresent()) {
            // Unlike: remove the like
            likeRepository.delete(existingLike.get());
            post.setLikes(Math.max(0, post.getLikes() - 1));
            liked = false;
        } else {
            // Like: add a new like
            Like newLike = Like.builder()
                    .user(user)
                    .post(post)
                    .build();
            likeRepository.save(newLike);
            post.setLikes(post.getLikes() + 1);
            liked = true;
        }

        postRepository.save(post);
        
        Map<String, Object> response = new HashMap<>();
        response.put("post", post);
        response.put("liked", liked);
        return response;
    }

    public boolean hasUserLikedPost(Long postId, String email) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return likeRepository.existsByUserAndPost(user, post);
    }

    public List<Post> searchPosts(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return getAllPosts();
        }
        return postRepository.searchPosts(keyword.trim());
    }

    public Comment addComment(Long postId, String content, String email) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = Comment.builder()
                .content(content)
                .post(post)
                .user(user)
                .createdAt(LocalDateTime.now())
                .build();

        return commentRepository.save(comment);
    }

    public List<Comment> getComments(Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        return commentRepository.findByPost(post);
    }
    @Transactional
    public String deletePost(Long postId) {

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("Post not found"));

        commentRepository.deleteByPost(post);
        postRepository.delete(post);

        return "Post deleted successfully";
    }
    public Post updatePost(Long id, UpdatePostRequest request) {
        Post post = postRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Post not found"));

        post.setTitle(request.getTitle());
        post.setContent(request.getContent());
        post.setImageUrls(request.getImageUrls() != null ? request.getImageUrls() : new ArrayList<>());

        return postRepository.save(post);
    }
    
}
