package com.blog.blogplatform.repository;

import com.blog.blogplatform.entity.Like;
import com.blog.blogplatform.entity.Post;
import com.blog.blogplatform.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByUserAndPost(User user, Post post);
    boolean existsByUserAndPost(User user, Post post);
    void deleteByPost(Post post);
    List<Like> findByUser(User user);
}
