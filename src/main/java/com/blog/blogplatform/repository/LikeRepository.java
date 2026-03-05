package com.blog.blogplatform.repository;

import com.blog.blogplatform.entity.Like;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LikeRepository extends JpaRepository<Like, Long> {
}
