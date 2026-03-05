package com.blog.blogplatform.repository;

import com.blog.blogplatform.entity.Comment;
import com.blog.blogplatform.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    List<Comment> findByPost(Post post);

    void deleteByPost(Post post);

}
