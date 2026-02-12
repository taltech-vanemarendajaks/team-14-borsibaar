package com.borsibaar.service;

import com.borsibaar.dto.*;
import com.borsibaar.entity.*;
import com.borsibaar.mapper.InventoryMapper;
import com.borsibaar.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final BarStationRepository barStationRepository;
    private final InventoryMapper inventoryMapper;

    @Transactional(readOnly = true)
    public List<InventoryResponseDto> getByOrganization(Long organizationId) {
        return getByOrganization(organizationId, null);
    }

    @Transactional(readOnly = true)
    public List<InventoryResponseDto> getByOrganization(Long organizationId, Long categoryId) {
        List<Inventory> inventories;

        if (categoryId != null) {
            inventories = inventoryRepository.findByOrganizationIdAndCategoryId(organizationId, categoryId);
        } else {
            inventories = inventoryRepository.findByOrganizationId(organizationId);
        }

        var productsMap = productRepository
                .findAllById(inventories.stream().map(Inventory::getProductId).toList())
                .stream()
                .collect(Collectors.toMap(Product::getId, p -> p));

        return inventories.stream()
                .map(inv -> {
                    InventoryResponseDto base = inventoryMapper.toResponse(inv);
                    Product product = productsMap.get(inv.getProductId());

                    if (product == null || !product.isActive()) {
                        return null;
                    }

                    String productName = product.getName();
                    BigDecimal unitPrice = Optional.ofNullable(inv.getAdjustedPrice())
                            .orElse(product.getBasePrice());

                    base.setProductName(productName);
                    base.setUnitPrice(unitPrice);
                    base.setDescription(product.getDescription());
                    base.setBasePrice(product.getBasePrice());
                    base.setMinPrice(product.getMinPrice());
                    base.setMaxPrice(product.getMaxPrice());

                    return base;
                })
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(InventoryResponseDto::getProductName))
                .toList();
    }

    @Transactional(readOnly = true)
    public InventoryResponseDto getByProductAndOrganization(Long productId, Long organizationId) {
        Inventory inventory = inventoryRepository
                .findByOrganizationIdAndProductId(organizationId, productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No inventory found for this product"));

        InventoryResponseDto base = inventoryMapper.toResponse(inventory);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No product found"));
        if (!product.isActive()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Product is deleted");
        }

        String productName = product.getName();
        BigDecimal unitPrice = Optional.ofNullable(inventory.getAdjustedPrice())
                .orElse(product.getBasePrice());
        BigDecimal basePrice = product.getBasePrice();

        base.setProductName(productName);
        base.setUnitPrice(unitPrice);
        base.setDescription(product.getDescription());
        base.setBasePrice(basePrice);
        base.setMinPrice(product.getMinPrice());
        base.setMaxPrice(product.getMaxPrice());

        return base;
    }

    @Transactional
    public InventoryResponseDto addStock(AddStockRequestDto request, UUID userId, Long organizationId) {
        Long productId = request.getProductId();
        Product product = getOrganizationProduct(organizationId, productId);

        // Get or create inventory
        Inventory inventory = inventoryRepository
                .findByOrganizationIdAndProductId(organizationId, request.getProductId())
                .orElseGet(() -> {
                    Inventory newInv = new Inventory();
                    newInv.setOrganizationId(organizationId);
                    newInv.setProduct(product);
                    newInv.setQuantity(BigDecimal.ZERO);
                    newInv.setAdjustedPrice(product.getBasePrice());
                    newInv.setCreatedAt(OffsetDateTime.now());
                    newInv.setUpdatedAt(OffsetDateTime.now());
                    return inventoryRepository.save(newInv);
                });

        BigDecimal newQuantity = inventory.getQuantity().add(request.getQuantity());

        inventory.setQuantity(newQuantity);
        inventory.setUpdatedAt(OffsetDateTime.now());
        inventory = inventoryRepository.save(inventory);

        BigDecimal currentPrice = Optional.ofNullable(inventory.getAdjustedPrice())
                .orElse(product.getBasePrice());

        // Create transaction record
        createTransaction(inventory, "PURCHASE", request.getQuantity(),
                newQuantity, currentPrice, currentPrice, null, request.getNotes(), userId);

        InventoryResponseDto base = inventoryMapper.toResponse(inventory);

        base.setProductName(product.getName());
        base.setUnitPrice(currentPrice);
        base.setDescription(product.getDescription());
        base.setBasePrice(null);
        base.setMinPrice(product.getMinPrice());
        base.setMaxPrice(product.getMaxPrice());

        return base;
    }

    @Transactional
    public InventoryResponseDto removeStock(RemoveStockRequestDto request, UUID userId, Long organizationId) {
        Product product = getOrganizationProduct(organizationId, request.getProductId());

        Inventory inventory = inventoryRepository
                .findByOrganizationIdAndProductId(organizationId, request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No inventory found for this product"));

        BigDecimal oldQuantity = inventory.getQuantity();
        BigDecimal newQuantity = oldQuantity.subtract(request.getQuantity());

        if (newQuantity.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Insufficient stock. Available: " + oldQuantity + ", Requested: "
                            + request.getQuantity());
        }

        inventory.setQuantity(newQuantity);
        inventory.setUpdatedAt(OffsetDateTime.now());
        inventory = inventoryRepository.save(inventory);

        BigDecimal currentPrice = Optional.ofNullable(inventory.getAdjustedPrice())
                .orElse(product.getBasePrice());

        // Create transaction record (negative quantity change)
        createTransaction(inventory, "ADJUSTMENT", request.getQuantity().negate(),
                newQuantity, currentPrice, currentPrice, request.getReferenceId(),
                request.getNotes(), userId);

        InventoryResponseDto base = inventoryMapper.toResponse(inventory);

        base.setProductName(product.getName());
        base.setUnitPrice(currentPrice);
        base.setDescription(product.getDescription());
        base.setMinPrice(product.getMinPrice());
        base.setMaxPrice(product.getMaxPrice());

        return base;
    }

    @Transactional
    public InventoryResponseDto adjustStock(AdjustStockRequestDto request, UUID userId, Long organizationId) {
        Product product = getOrganizationProduct(organizationId, request.getProductId());

        Inventory inventory = inventoryRepository
                .findByOrganizationIdAndProductId(organizationId, request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No inventory found for this product"));

        BigDecimal quantityChange = request.getNewQuantity().subtract(inventory.getQuantity());

        inventory.setQuantity(request.getNewQuantity());
        inventory.setUpdatedAt(OffsetDateTime.now());
        inventory = inventoryRepository.save(inventory);

        BigDecimal currentPrice = Optional.ofNullable(inventory.getAdjustedPrice())
                .orElse(product.getBasePrice());

        // Create transaction record
        createTransaction(inventory, "ADJUSTMENT", quantityChange,
                request.getNewQuantity(), currentPrice, currentPrice, null, request.getNotes(),
                userId);

        InventoryResponseDto base = inventoryMapper.toResponse(inventory);

        base.setProductName(product.getName());
        base.setUnitPrice(currentPrice);
        base.setDescription(product.getDescription());
        base.setMinPrice(product.getMinPrice());
        base.setMaxPrice(product.getMaxPrice());

        return base;
    }

    @Transactional(readOnly = true)
    public List<InventoryTransactionResponseDto> getTransactionHistory(Long productId, Long organizationId) {
        Inventory inventory = inventoryRepository
                .findByOrganizationIdAndProductId(organizationId, productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "No inventory found for this product"));

        List<InventoryTransaction> transactions = inventoryTransactionRepository
                .findByInventoryIdOrderByCreatedAtDesc(inventory.getId());

        // Get all unique user IDs (filter out nulls)
        List<UUID> userIds = transactions.stream()
                .map(InventoryTransaction::getCreatedBy)
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        // Fetch all users at once
        Map<UUID, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        // Map transactions with user information
        return transactions.stream()
                .map(transaction -> {
                    User user = userMap.get(transaction.getCreatedBy());
                    BigDecimal quantityBefore = transaction.getQuantityAfter().subtract(transaction.getQuantityChange());
                    InventoryTransactionResponseDto response = inventoryMapper.toTransactionResponse(transaction);

                    response.setQuantityBefore(quantityBefore);
                    response.setQuantityAfter(transaction.getQuantityAfter());
                    response.setCreatedBy(transaction.getCreatedBy() != null ? transaction.getCreatedBy().toString() : null);
                    response.setCreatedByName(user != null ? user.getName() : null);
                    response.setCreatedByEmail(user != null ? user.getEmail() : null);

                    return response;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserSalesStatsResponseDto> getUserSalesStats(Long organizationId) {
        // Get all sale transactions for the organization
        List<InventoryTransaction> saleTransactions = inventoryTransactionRepository
                .findSaleTransactionsByOrganizationId(organizationId);

        // Group transactions by user and station
        Map<String, List<InventoryTransaction>> transactionsByUserAndStation = saleTransactions.stream()
                .filter(t -> t.getCreatedBy() != null)
                .collect(Collectors.groupingBy(transaction -> {
                    UUID userId = transaction.getCreatedBy();
                    Long stationId = transaction.getBarStationId();
                    return userId.toString() + "|"
                            + (stationId != null ? stationId.toString() : "null");
                }));

        // Get all unique user IDs and station IDs
        Set<UUID> userIds = saleTransactions.stream()
                .map(InventoryTransaction::getCreatedBy)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Set<Long> stationIds = saleTransactions.stream()
                .map(InventoryTransaction::getBarStationId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        // Fetch all users and stations at once
        Map<UUID, User> userMap = userRepository.findAllById(new ArrayList<>(userIds)).stream()
                .collect(Collectors.toMap(User::getId, user -> user));

        Map<Long, BarStation> stationMap = barStationRepository.findAllById(new ArrayList<>(stationIds))
                .stream()
                .collect(Collectors.toMap(BarStation::getId, station -> station));

        // Calculate statistics for each user-station combination
        return transactionsByUserAndStation.entrySet().stream()
                .map(entry -> {
                    String[] parts = entry.getKey().split("\\|");
                    UUID userId = UUID.fromString(parts[0]);
                    Long stationId = null;
                    if (parts.length > 1 && !parts[1].equals("null")) {
                        try {
                            stationId = Long.parseLong(parts[1]);
                        } catch (NumberFormatException e) {
                            stationId = null;
                        }
                    }

                    List<InventoryTransaction> userStationTransactions = entry.getValue();
                    User user = userMap.get(userId);
                    BarStation station = stationId != null ? stationMap.get(stationId) : null;

                    // Count unique sales (by referenceId)
                    long salesCount = userStationTransactions.stream()
                            .map(InventoryTransaction::getReferenceId)
                            .filter(Objects::nonNull)
                            .distinct()
                            .count();

                    // Calculate total revenue by getting all products and their prices
                    BigDecimal totalRevenue = calculateTotalRevenue(userStationTransactions);

                    UserSalesStatsResponseDto response = new UserSalesStatsResponseDto();

                    response.setUserId(userId.toString());
                    response.setUserName(user != null ? user.getName() : "Unknown User");
                    response.setUserEmail(user != null ? user.getEmail() : "unknown@email.com");
                    response.setSalesCount(salesCount);
                    response.setTotalRevenue(totalRevenue);
                    response.setBarStationId(stationId);
                    response.setBarStationName(station != null ? station.getName() : null);

                    return response;
                })
                .sorted((a, b) -> Long.compare(b.getSalesCount(), a.getSalesCount())) // Sort by sales count
                // desc
                .toList();
    }

    @Transactional(readOnly = true)
    public List<StationSalesStatsResponseDto> getStationSalesStats(Long organizationId) {
        // Get all sale transactions for the organization
        List<InventoryTransaction> saleTransactions = inventoryTransactionRepository
                .findSaleTransactionsByOrganizationId(organizationId);

        // Group transactions by station
        Map<Long, List<InventoryTransaction>> transactionsByStation = saleTransactions.stream()
                .filter(t -> t.getBarStationId() != null)
                .collect(Collectors.groupingBy(InventoryTransaction::getBarStationId));

        // Get all unique station IDs
        Set<Long> stationIds = transactionsByStation.keySet();

        // Fetch all stations at once
        Map<Long, BarStation> stationMap = barStationRepository.findAllById(new ArrayList<>(stationIds))
                .stream()
                .collect(Collectors.toMap(BarStation::getId, station -> station));

        // Calculate statistics for each station
        return transactionsByStation.entrySet().stream()
                .map(entry -> {
                    Long stationId = entry.getKey();
                    List<InventoryTransaction> stationTransactions = entry.getValue();
                    BarStation station = stationMap.get(stationId);

                    // Count unique sales (by referenceId)
                    long salesCount = stationTransactions.stream()
                            .map(InventoryTransaction::getReferenceId)
                            .filter(Objects::nonNull)
                            .distinct()
                            .count();

                    // Calculate total revenue by getting all products and their prices
                    BigDecimal totalRevenue = calculateTotalRevenue(stationTransactions);

                    StationSalesStatsResponseDto response = new StationSalesStatsResponseDto();

                    response.setBarStationId(stationId);
                    response.setBarStationName(station != null ? station.getName() : null);
                    response.setSalesCount(salesCount);
                    response.setTotalRevenue(totalRevenue);

                    return response;
                })
                .sorted((a, b) -> Long.compare(b.getSalesCount(), a.getSalesCount())) // Sort by sales count
                // desc
                .toList();
    }

    private void createTransaction(Inventory inventory, String type, BigDecimal quantityChange,
                                   BigDecimal quantityAfter, BigDecimal priceBefore,
                                   BigDecimal priceAfter, String referenceId, String notes, UUID userId) {
        InventoryTransaction transaction = new InventoryTransaction();
        transaction.setInventory(inventory);
        transaction.setTransactionType(type);
        transaction.setQuantityChange(quantityChange);
        transaction.setQuantityAfter(quantityAfter);
        transaction.setPriceBefore(priceBefore);
        transaction.setPriceAfter(priceAfter);
        transaction.setReferenceId(referenceId);
        transaction.setNotes(notes);
        transaction.setCreatedBy(userId);
        transaction.setCreatedAt(Instant.now());
        inventoryTransactionRepository.save(transaction);
    }

    private Product getOrganizationProduct(Long organizationId, Long productId) {
        // Verify product exists and belongs to organization
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Product not found"));

        if (!product.getOrganizationId().equals(organizationId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Product does not belong to your organization");
        }
        if (!product.isActive()) {
            throw new ResponseStatusException(HttpStatus.GONE, "Product is deleted");
        }
        return product;
    }


    private BigDecimal calculateTotalRevenue(List<InventoryTransaction> userStationTransactions) {
        var transactionIds = userStationTransactions.stream()
                .map(InventoryTransaction::getId)
                .toList();

        return productRepository.findRevenueData(transactionIds)
                .stream()
                .map(row -> {
                    BigDecimal basePrice = (BigDecimal) row[0];
                    BigDecimal quantityChange = ((BigDecimal) row[1]).abs();
                    return basePrice.multiply(quantityChange);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

}
