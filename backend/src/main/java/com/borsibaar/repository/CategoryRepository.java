package com.borsibaar.repository;

import com.borsibaar.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByIdAndOrganizationId(Long id, Long organizationId);

    List<Category> findAllByOrganizationId(Long organizationId);

    boolean existsByOrganizationIdAndNameIgnoreCase(Long organizationId, String name);
}
