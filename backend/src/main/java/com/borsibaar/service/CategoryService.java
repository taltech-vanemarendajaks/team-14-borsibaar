package com.borsibaar.service;

import com.borsibaar.dto.CategoryRequestDto;
import com.borsibaar.dto.CategoryResponseDto;
import com.borsibaar.entity.Category;
import com.borsibaar.exception.BadRequestException;
import com.borsibaar.exception.DuplicateResourceException;
import com.borsibaar.exception.NotFoundException;
import com.borsibaar.mapper.CategoryMapper;
import com.borsibaar.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    public CategoryService(CategoryRepository categoryRepository, CategoryMapper categoryMapper) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
    }

    @Transactional
    public CategoryResponseDto create(CategoryRequestDto request, Long organizationId) {
        Category category = categoryMapper.toEntity(request);

        category.setOrganizationId(organizationId);

        String normalizedName = request.getName() == null ? null : request.getName().trim();
        if (normalizedName == null || normalizedName.isEmpty()) {
            throw new BadRequestException("Category name must not be blank");
        }
        category.setName(normalizedName);

        boolean dynamicPricing = request.getDynamicPricing() != null ? request.getDynamicPricing() : true;
        category.setDynamicPricing(dynamicPricing);

        if (categoryRepository.existsByOrganizationIdAndNameIgnoreCase(organizationId, normalizedName)) {
            throw new DuplicateResourceException("Category '" + normalizedName + "' already exists");
        }

        return categoryMapper.toResponse(categoryRepository.save(category));
    }

    @Transactional
    public List<CategoryResponseDto> getAllByOrg(Long organizationId) {
        return categoryRepository.findAllByOrganizationId(organizationId)
                .stream().map(categoryMapper::toResponse).toList();
    }

    @Transactional
    public CategoryResponseDto getByIdAndOrg(Long id, Long organizationId) {
        Optional<Category> category = categoryRepository.findByIdAndOrganizationId(id, organizationId);

        if (category.isEmpty()) {
            throw new NotFoundException("Category not found: " + id);
        }

        return categoryMapper.toResponse(category.get());
    }

    @Transactional
    public CategoryResponseDto deleteReturningDto(Long id, Long organizationId) {
        return categoryRepository.findByIdAndOrganizationId(id, organizationId)
                .map(category -> {
                    CategoryResponseDto dto = categoryMapper.toResponse(category);
                    categoryRepository.delete(category);
                    return dto;
                })
                .orElseThrow(() -> new NotFoundException("Category not found: " + id));
    }
}
