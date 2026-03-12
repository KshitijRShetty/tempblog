package com.blog.blogplatform.service;

import com.blog.blogplatform.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;

    public String deleteComment(@NonNull Long id) {

        commentRepository.deleteById(id);

        return "Comment deleted successfully";
    }
}