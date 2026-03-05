package com.blog.blogplatform.repository;

import com.blog.blogplatform.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, Long> {
}
