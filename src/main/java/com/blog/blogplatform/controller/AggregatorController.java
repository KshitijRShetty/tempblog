package com.blog.blogplatform.controller;

import com.blog.blogplatform.service.BlogAggregatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/aggregator")
@RequiredArgsConstructor
public class AggregatorController {

    private final BlogAggregatorService aggregatorService;

    /**
     * Get blogs from a specific source
     */
    @GetMapping("/source/{source}")
    public List<Map<String, Object>> getBlogsBySource(
            @PathVariable String source,
            @RequestParam(defaultValue = "20") int limit
    ) {
        return aggregatorService.getBlogsBySource(source, limit);
    }

    /**
     * Get aggregator statistics
     */
    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        return aggregatorService.getAggregatorStats();
    }

    /**
     * Force refresh the cache
     */
    @PostMapping("/refresh")
    public Map<String, String> refreshCache() {
        aggregatorService.refreshCache();
        return Map.of("message", "Cache refreshed successfully");
    }
}
