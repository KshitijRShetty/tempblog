package com.blog.blogplatform.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class FileUploadController {

    private final String uploadDir = System.getProperty("user.dir") + "/uploads/";

    @PostMapping("/upload")
    public String uploadImage(@RequestParam("file") MultipartFile file) throws IOException {

        File directory = new File(uploadDir);

        if (!directory.exists()) {
            directory.mkdirs();
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        File destination = new File(uploadDir + fileName);

        file.transferTo(destination);

        return "/uploads/" + fileName;
    }

    @PostMapping("/upload/multiple")
    public List<String> uploadMultipleImages(@RequestParam("files") MultipartFile[] files) throws IOException {
        List<String> imageUrls = new ArrayList<>();

        File directory = new File(uploadDir);
        if (!directory.exists()) {
            directory.mkdirs();
        }

        for (MultipartFile file : files) {
            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            File destination = new File(uploadDir + fileName);
            file.transferTo(destination);
            imageUrls.add("/uploads/" + fileName);
        }

        return imageUrls;
    }
}