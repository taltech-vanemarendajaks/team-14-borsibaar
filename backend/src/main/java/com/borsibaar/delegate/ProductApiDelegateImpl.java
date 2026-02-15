package com.borsibaar.delegate;

import com.borsibaar.api.ProductApi;
import com.borsibaar.dto.ProductRequestDto;
import com.borsibaar.dto.ProductResponseDto;
import com.borsibaar.entity.User;
import com.borsibaar.service.ProductService;
import com.borsibaar.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@ControllerAdvice
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductApiDelegateImpl extends AbstractApiDelegateImpl implements ProductApi {

    private final ProductService productService;

    @Override
    public ResponseEntity<ProductResponseDto> createProduct(ProductRequestDto request) {
        User user = SecurityUtils.getCurrentUser();
        ProductResponseDto response = productService.create(request, user.getOrganizationId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<Void> deleteProduct(Long id) {
        productService.delete(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @Override
    public ResponseEntity<ProductResponseDto> getProductById(Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }
}
