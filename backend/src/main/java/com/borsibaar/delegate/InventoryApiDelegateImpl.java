package com.borsibaar.delegate;

import com.borsibaar.api.InventoryApi;
import com.borsibaar.dto.*;
import com.borsibaar.entity.User;
import com.borsibaar.service.InventoryService;
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
public class InventoryApiDelegateImpl extends AbstractApiDelegateImpl implements InventoryApi {

    private final InventoryService inventoryService;

    @Override
    public ResponseEntity<InventoryResponseDto> addStock(AddStockRequestDto request) {
        User user = SecurityUtils.getCurrentUser();
        InventoryResponseDto response = inventoryService.addStock(request, user.getId(), user.getOrganizationId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Override
    public ResponseEntity<InventoryResponseDto> adjustStock(AdjustStockRequestDto request) {
        User user = SecurityUtils.getCurrentUser();
        InventoryResponseDto response = inventoryService.adjustStock(request, user.getId(), user.getOrganizationId());
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<List<InventoryResponseDto>> getOrganizationInventory(Long categoryId, Long organizationId) {
        // If organizationId is provided, use it (for public access)
        // Otherwise, get from authenticated user
        Long orgId;
        if (organizationId != null) {
            orgId = organizationId;
        } else {
            User user = SecurityUtils.getCurrentUser();
            orgId = user.getOrganizationId();
        }
        return ResponseEntity.ok(inventoryService.getByOrganization(orgId, categoryId));
    }

    @Override
    public ResponseEntity<InventoryResponseDto> getProductInventory(Long productId) {
        User user = SecurityUtils.getCurrentUser();
        InventoryResponseDto response = inventoryService.getByProductAndOrganization(productId, user.getOrganizationId());
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<List<StationSalesStatsResponseDto>> getStationSalesStats() {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(inventoryService.getStationSalesStats(user.getOrganizationId()));
    }

    @Override
    public ResponseEntity<List<InventoryTransactionResponseDto>> getTransactionHistory(Long productId) {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(inventoryService.getTransactionHistory(productId, user.getOrganizationId()));
    }

    @Override
    public ResponseEntity<List<UserSalesStatsResponseDto>> getUserSalesStats() {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(inventoryService.getUserSalesStats(user.getOrganizationId()));
    }

    @Override
    public ResponseEntity<InventoryResponseDto> removeStock(RemoveStockRequestDto request) {
        User user = SecurityUtils.getCurrentUser();
        return ResponseEntity.ok(inventoryService.removeStock(request, user.getId(), user.getOrganizationId()));
    }
}
