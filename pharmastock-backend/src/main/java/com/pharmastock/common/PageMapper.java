package com.pharmastock.common;

import org.springframework.data.domain.Page;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Construit la structure de page attendue par le frontend (content / totalPages / totalElements). */
public final class PageMapper {
    private PageMapper() {}

    public static <T> Map<String, Object> of(Page<T> page, Function<T, Object> mapper) {
        List<Object> content = page.getContent().stream().map(mapper).collect(Collectors.toList());
        return build(content, page.getTotalElements(), page.getTotalPages(), page.getNumber(), page.getSize());
    }

    public static Map<String, Object> ofList(List<?> content) {
        return build(List.copyOf(content), content.size(), 1, 0, content.size());
    }

    private static Map<String, Object> build(List<?> content, long totalElements, int totalPages, int number, int size) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("content", content);
        m.put("totalElements", totalElements);
        m.put("totalPages", totalPages);
        m.put("number", number);
        m.put("size", size);
        return m;
    }
}
