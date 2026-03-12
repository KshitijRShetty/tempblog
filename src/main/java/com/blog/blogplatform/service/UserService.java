package com.blog.blogplatform.service;

import com.blog.blogplatform.dto.PublicUserProfile;
import com.blog.blogplatform.dto.UpdateProfileRequest;
import com.blog.blogplatform.entity.User;
import com.blog.blogplatform.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public User banUser(@NonNull Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setBanned(true);

        return userRepository.save((User) user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public PublicUserProfile getPublicProfile(String email) {
        User user = getUserByEmail(email);
        PublicUserProfile profile = new PublicUserProfile();
        profile.setName(user.getName());
        profile.setEmail(user.getEmail());
        profile.setProfileImage(user.getProfileImage());
        profile.setBio(user.getBio());
        profile.setInterests(user.getInterests());
        profile.setCreatedAt(user.getCreatedAt());
        return profile;
    }

    public User updateProfilePhoto(String email, String photoUrl) {
        User user = getUserByEmail(email);
        user.setProfileImage(photoUrl);
        @SuppressWarnings("null")
        User savedUser = userRepository.save(user);
        return savedUser;
    }

    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = getUserByEmail(email);
        
        if (request.getName() != null && !request.getName().isEmpty()) {
            user.setName(request.getName());
        }
        
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        
        if (request.getInterests() != null) {
            user.setInterests(request.getInterests());
        }
        
        @SuppressWarnings("null")
        User savedUser = userRepository.save(user);
        return savedUser;
    }
}