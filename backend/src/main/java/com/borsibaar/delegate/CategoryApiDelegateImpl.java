package com.borsibaar.delegate;

import com.borsibaar.api.CategoryApi;
import com.borsibaar.dto.CategoryRequestDto;
import com.borsibaar.dto.CategoryResponseDto;
import com.borsibaar.entity.User;
import com.borsibaar.mapper.CategoryMapper;
import com.borsibaar.service.CategoryService;
import com.borsibaar.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@ControllerAdvice
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class CategoryApiDelegateImpl extends AbstractApiDelegateImpl implements CategoryApi {

    private final CategoryService categoryService;
    private final CategoryMapper categoryMapper;

    @Override
    public ResponseEntity<CategoryResponseDto> createCategory(CategoryRequestDto request) {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(request, user.getOrganizationId()));
    }

    @Override
    public ResponseEntity<Void> deleteCategory(Long id) {
        User user = SecurityUtils.getCurrentUser();
        categoryService.deleteReturningDto(id, user.getOrganizationId());
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @Override
    public ResponseEntity<List<CategoryResponseDto>> getAllCategories(Long organizationId) {
        // If organizationId is provided, use it (for public access)
        // Otherwise, get from authenticated user
        Long orgId;
        if (organizationId != null) {
            orgId = organizationId;
        } else {
            User user = SecurityUtils.getCurrentUser();
            orgId = user.getOrganizationId();
        }
        List<CategoryResponseDto> response = categoryService.getAllByOrg(orgId);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<CategoryResponseDto> getCategoryById(Long id) {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(categoryService.getByIdAndOrg(id, user.getOrganizationId()));
    }
}
