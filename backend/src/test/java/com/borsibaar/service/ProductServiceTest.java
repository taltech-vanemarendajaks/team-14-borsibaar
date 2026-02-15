package com.borsibaar.service;

import com.borsibaar.dto.ProductRequestDto;
import com.borsibaar.dto.ProductResponseDto;
import com.borsibaar.entity.Category;
import com.borsibaar.entity.Inventory;
import com.borsibaar.entity.InventoryTransaction;
import com.borsibaar.entity.Product;
import com.borsibaar.mapper.ProductMapper;
import com.borsibaar.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private CategoryRepository categoryRepository;
    @Mock private ProductRepository productRepository;
    @Mock private ProductMapper productMapper;
    @Mock private UserRepository userRepository;
    @Mock private InventoryRepository inventoryRepository;
    @Mock private InventoryTransactionRepository inventoryTransactionRepository;

    @InjectMocks private ProductService productService;

    @Test
    void create_Success_CreatesInventoryAndTransaction() {
        new ProductRequestDto();
        var req = new ProductRequestDto().name("  Beer  ").description("Desc").currentPrice(BigDecimal.valueOf(5))
                .minPrice(BigDecimal.valueOf(3)).maxPrice(BigDecimal.valueOf(10)).categoryId(7L);
        Category cat = new Category(); cat.setId(7L); cat.setOrganizationId(1L); cat.setName("Cat");
        when(categoryRepository.findById(7L)).thenReturn(Optional.of(cat));
        Product entity = new Product(); entity.setName("Beer"); entity.setCategoryId(7L); entity.setBasePrice(BigDecimal.valueOf(5));
        when(productMapper.toEntity(req)).thenReturn(entity);
        when(productRepository.existsByOrganizationIdAndNameIgnoreCase(1L, "Beer")).thenReturn(false);
        Product saved = new Product(); saved.setId(11L); saved.setName("Beer"); saved.setCategoryId(7L); saved.setOrganizationId(1L); saved.setBasePrice(BigDecimal.valueOf(5)); saved.setActive(true); saved.setCreatedAt(OffsetDateTime.now()); saved.setUpdatedAt(OffsetDateTime.now());
        when(productRepository.save(entity)).thenReturn(saved);
        var resp = new ProductResponseDto().id(11L).name("Beer").description("Desc")
                .currentPrice(BigDecimal.valueOf(5)).minPrice(BigDecimal.valueOf(3)).maxPrice(BigDecimal.valueOf(10))
                .categoryId(7L).categoryName("Cat");
        when(productMapper.toResponse(saved)).thenReturn(resp);
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(inv -> {
            Inventory i = inv.getArgument(0); i.setId(100L); return i; });
        when(inventoryTransactionRepository.save(any(InventoryTransaction.class))).thenAnswer(inv -> inv.getArgument(0));

        ProductResponseDto dto = productService.create(req, 1L);
        assertEquals("Beer", dto.getName());
        verify(inventoryRepository).save(any(Inventory.class));
        verify(inventoryTransactionRepository).save(any(InventoryTransaction.class));
    }

    @Test
    void create_CategoryNotFound_Throws() {
        var req = new ProductRequestDto().name("Beer").description("Desc").currentPrice(BigDecimal.ONE)
                .minPrice(BigDecimal.ONE).maxPrice(BigDecimal.TEN).categoryId(9L);
        when(categoryRepository.findById(9L)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> productService.create(req, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void create_NameBlank_Throws() {
        var req = new ProductRequestDto().name("   ").description("Desc").currentPrice(BigDecimal.ONE)
                .minPrice(BigDecimal.ONE).maxPrice(BigDecimal.TEN).categoryId(7L);
        Category cat = new Category(); cat.setId(7L); cat.setOrganizationId(1L);
        when(categoryRepository.findById(7L)).thenReturn(Optional.of(cat));
        Product entity = new Product();
        when(productMapper.toEntity(req)).thenReturn(entity);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> productService.create(req, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void create_CategoryOrgMismatch_Throws() {
        var req = new ProductRequestDto().name("Beer").description("Desc").currentPrice(BigDecimal.ONE)
                .minPrice(BigDecimal.ONE).maxPrice(BigDecimal.TEN).categoryId(7L);
        Category cat = new Category(); cat.setId(7L); cat.setOrganizationId(2L);
        when(categoryRepository.findById(7L)).thenReturn(Optional.of(cat));
        Product entity = new Product(); entity.setName("Beer");
        when(productMapper.toEntity(req)).thenReturn(entity);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> productService.create(req, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void create_DuplicateName_ThrowsConflict() {
        var req = new ProductRequestDto().name("Beer").description("Desc").currentPrice(BigDecimal.ONE)
                .minPrice(BigDecimal.ONE).maxPrice(BigDecimal.TEN).categoryId(7L);
        Category cat = new Category(); cat.setId(7L); cat.setOrganizationId(1L);
        when(categoryRepository.findById(7L)).thenReturn(Optional.of(cat));
        Product entity = new Product(); entity.setName("Beer");
        when(productMapper.toEntity(req)).thenReturn(entity);
        when(productRepository.existsByOrganizationIdAndNameIgnoreCase(1L, "Beer")).thenReturn(true);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> productService.create(req, 1L));
        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
    }

    @Test
    void delete_MarksInactive() {
        Product product = new Product(); product.setId(44L); product.setActive(true);
        when(productRepository.findById(44L)).thenReturn(Optional.of(product));
        productService.delete(44L);
        assertFalse(product.isActive());
        verify(productRepository).save(product);
    }

    @Test
    void delete_NotFound_Throws() {
        when(productRepository.findById(88L)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> productService.delete(88L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }
}
