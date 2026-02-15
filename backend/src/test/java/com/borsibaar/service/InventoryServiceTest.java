package com.borsibaar.service;

import com.borsibaar.dto.*;
import com.borsibaar.entity.*;
import com.borsibaar.mapper.InventoryMapper;
import com.borsibaar.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryTransactionRepository inventoryTransactionRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private BarStationRepository barStationRepository;

    @Mock
    private InventoryMapper inventoryMapper;

    @Mock
    private ClientRegistrationRepository clientRegistrationRepository;

    @InjectMocks private InventoryService inventoryService;

    private final UUID userId = UUID.randomUUID();

    @Test
    void addStock_CreatesInventoryIfMissing() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(1L); product.setActive(true); product.setBasePrice(BigDecimal.valueOf(2));
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 5L)).thenReturn(Optional.empty());
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(inv -> { Inventory i = inv.getArgument(0); i.setId(77L); return i; });
        when(inventoryMapper.toResponse(any())).thenAnswer(inv -> {
            Inventory i = inv.getArgument(0); return new InventoryResponseDto().id(i.getId())
                    .organizationId(i.getOrganizationId()).productId(i.getProductId()).productName("P")
                    .quantity(i.getQuantity()).unitPrice(i.getAdjustedPrice()).description(product.getDescription())
                    .updatedAt(i.getUpdatedAt().toInstant());
        });


        AddStockRequestDto request = new AddStockRequestDto().productId(5L).quantity(BigDecimal.valueOf(10)).notes("Notes");
        InventoryResponseDto dto = inventoryService.addStock(request, userId, 1L);
        assertEquals(BigDecimal.valueOf(10), dto.getQuantity());
        verify(inventoryTransactionRepository).save(any(InventoryTransaction.class));
    }

    @Test
    void addStock_ProductInactive_ThrowsGone() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(1L); product.setActive(false);
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        var req = new AddStockRequestDto().productId(5L).quantity(BigDecimal.ONE);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> inventoryService.addStock(req, userId, 1L));
        assertEquals(HttpStatus.GONE, ex.getStatusCode());
    }

    @Test
    void removeStock_Insufficient_ThrowsBadRequest() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(1L); product.setActive(true); product.setBasePrice(BigDecimal.ONE);
        Inventory inv = new Inventory(); inv.setId(9L); inv.setOrganizationId(1L); inv.setProduct(product); inv.setProductId(5L); inv.setQuantity(BigDecimal.valueOf(2)); inv.setAdjustedPrice(BigDecimal.ONE); inv.setUpdatedAt(OffsetDateTime.now());
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 5L)).thenReturn(Optional.of(inv));
        var req = new RemoveStockRequestDto().productId(5L).quantity(BigDecimal.valueOf(5));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> inventoryService.removeStock(req, userId, 1L));
        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
    }

    @Test
    void adjustStock_Success_CreatesTransaction() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(1L); product.setActive(true); product.setBasePrice(BigDecimal.valueOf(2));
        Inventory inv = new Inventory(); inv.setId(9L); inv.setOrganizationId(1L); inv.setProduct(product); inv.setProductId(5L); inv.setQuantity(BigDecimal.valueOf(5)); inv.setAdjustedPrice(BigDecimal.valueOf(2)); inv.setUpdatedAt(OffsetDateTime.now());
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 5L)).thenReturn(Optional.of(inv));
        when(inventoryRepository.save(any(Inventory.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(inventoryMapper.toResponse(any())).thenAnswer(a -> {
            Inventory i = a.getArgument(0); return new InventoryResponseDto().id(i.getId())
                    .organizationId(i.getOrganizationId()).productId(i.getProductId()).productName("Prod")
                    .quantity(i.getQuantity()).unitPrice(i.getAdjustedPrice()).description(product.getDescription())
                    .updatedAt(i.getUpdatedAt().toInstant());
        });

        var req = new AdjustStockRequestDto().productId(5L).newQuantity(BigDecimal.valueOf(8)).notes("Adj");
        InventoryResponseDto dto = inventoryService.adjustStock(req, userId, 1L);
        assertEquals(BigDecimal.valueOf(8), dto.getQuantity());
        verify(inventoryTransactionRepository).save(any(InventoryTransaction.class));
    }

    @Test
    void getByOrganization_FiltersInactiveProducts() {
        Inventory inv1 = new Inventory(); inv1.setId(1L); inv1.setOrganizationId(1L); inv1.setProductId(10L); inv1.setQuantity(BigDecimal.ONE); inv1.setUpdatedAt(OffsetDateTime.now());
        Inventory inv2 = new Inventory(); inv2.setId(2L); inv2.setOrganizationId(1L); inv2.setProductId(11L); inv2.setQuantity(BigDecimal.ONE); inv2.setUpdatedAt(OffsetDateTime.now());
        when(inventoryRepository.findByOrganizationId(1L)).thenReturn(List.of(inv1, inv2));
        Product p1 = new Product(); p1.setId(10L); p1.setActive(true); p1.setBasePrice(BigDecimal.ONE); p1.setName("A");
        Product p2 = new Product(); p2.setId(11L); p2.setActive(false); p2.setBasePrice(BigDecimal.ONE); p2.setName("B");
        when(productRepository.findAllById(List.of(10L, 11L))).thenReturn(List.of(p1, p2));
        var resp = new InventoryResponseDto().id(1L).organizationId(1L).productId(10L).productName("A")
                .quantity(BigDecimal.ONE).unitPrice(BigDecimal.ONE).description("abc").updatedAt(Instant.now());
        when(inventoryMapper.toResponse(inv1)).thenReturn(resp);
        List<InventoryResponseDto> result = inventoryService.getByOrganization(1L);
        assertEquals(1, result.size());
    }

    @Test
    void getByProductAndOrganization_ProductInactive_Gone() {
        Inventory inv = new Inventory(); inv.setId(1L); inv.setOrganizationId(1L); inv.setProductId(10L); inv.setQuantity(BigDecimal.ONE); inv.setUpdatedAt(OffsetDateTime.now());
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 10L)).thenReturn(Optional.of(inv));
        Product p = new Product(); p.setId(10L); p.setActive(false); p.setBasePrice(BigDecimal.ONE); p.setName("A");
        when(productRepository.findById(10L)).thenReturn(Optional.of(p));
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> inventoryService.getByProductAndOrganization(10L, 1L));
        assertEquals(HttpStatus.GONE, ex.getStatusCode());
    }

    @Test
    void addStock_ProductWrongOrg_Forbidden() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(2L); product.setActive(true);
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        var req = new AddStockRequestDto().productId(5L).quantity(BigDecimal.ONE);
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> inventoryService.addStock(req, userId, 1L));
        assertEquals(HttpStatus.FORBIDDEN, ex.getStatusCode());
    }

    @Test
    void removeStock_Success_CreatesNegativeTransaction() {
        Product product = new Product(); product.setId(5L); product.setOrganizationId(1L); product.setActive(true); product.setBasePrice(new BigDecimal("2.00"));
        Inventory inv = new Inventory(); inv.setId(10L); inv.setOrganizationId(1L); inv.setProduct(product); inv.setProductId(5L); inv.setQuantity(new BigDecimal("10")); inv.setAdjustedPrice(new BigDecimal("2.00")); inv.setUpdatedAt(OffsetDateTime.now());
        when(productRepository.findById(5L)).thenReturn(Optional.of(product));
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 5L)).thenReturn(Optional.of(inv));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(a -> a.getArgument(0));
        when(inventoryMapper.toResponse(any())).thenAnswer(a -> { Inventory i = a.getArgument(0); return new InventoryResponseDto().id(i.getId()).organizationId(i.getOrganizationId()).productId(i.getProductId()).productName("Prod").quantity(i.getQuantity()).unitPrice(i.getAdjustedPrice()).description(product.getDescription()).updatedAt(i.getUpdatedAt().toInstant());});

        var req = new RemoveStockRequestDto().productId(5L).quantity(new BigDecimal("3")).referenceId("sale-1").notes("note");
        InventoryResponseDto dto = inventoryService.removeStock(req, userId, 1L);
        assertEquals(new BigDecimal("7"), dto.getQuantity());
        ArgumentCaptor<InventoryTransaction> txCap = ArgumentCaptor.forClass(InventoryTransaction.class);
        verify(inventoryTransactionRepository).save(txCap.capture());
        assertEquals(new BigDecimal("-3"), txCap.getValue().getQuantityChange());
        assertEquals("sale-1", txCap.getValue().getReferenceId());
    }

    @Test
    void getTransactionHistory_MapsUserInfo() {
        Inventory inv = new Inventory(); inv.setId(100L); inv.setOrganizationId(1L); inv.setProductId(10L);
        when(inventoryRepository.findByOrganizationIdAndProductId(1L, 10L)).thenReturn(Optional.of(inv));
        UUID uid = UUID.randomUUID();
        InventoryTransaction tx = new InventoryTransaction();
        tx.setId(1L); tx.setInventory(inv); tx.setInventoryId(inv.getId()); tx.setTransactionType("SALE");
        tx.setQuantityChange(new BigDecimal("-1")); tx.setQuantityAfter(new BigDecimal("9"));
        tx.setPriceBefore(BigDecimal.ONE); tx.setPriceAfter(BigDecimal.ONE); tx.setReferenceId("ref"); tx.setNotes("n");
        tx.setCreatedBy(uid); tx.setCreatedAt(Instant.now());
        when(inventoryTransactionRepository.findByInventoryIdOrderByCreatedAtDesc(100L)).thenReturn(List.of(tx));
        User user = new User(); user.setId(uid); user.setName("Alice"); user.setEmail("a@b.c");
        when(userRepository.findAllById(anyList())).thenReturn(List.of(user));

        var base = new InventoryTransactionResponseDto().id(1L).transactionType("SALE").quantityChange(new BigDecimal("-1"));
        when(inventoryMapper.toTransactionResponse(tx)).thenReturn(base);

        List<InventoryTransactionResponseDto> result = inventoryService.getTransactionHistory(10L, 1L);
        assertEquals(1, result.size());
        assertEquals(uid.toString(), result.get(0).getCreatedBy());
        assertEquals("Alice", result.get(0).getCreatedByName());
    }

    @Test
    void getUserSalesStats_ComputesCountsAndRevenue() {
        Long orgId = 1L;
        UUID uid = UUID.randomUUID();
        Long stationId = 7L;
        // two transactions for same user/station, different inventories
        InventoryTransaction t1 = new InventoryTransaction(); t1.setId(1L); t1.setInventoryId(11L); t1.setTransactionType("SALE"); t1.setReferenceId("o1"); t1.setQuantityChange(new BigDecimal("-2")); t1.setCreatedBy(uid); t1.setBarStationId(stationId);
        InventoryTransaction t2 = new InventoryTransaction(); t2.setId(2L); t2.setInventoryId(12L); t2.setTransactionType("SALE"); t2.setReferenceId("o2"); t2.setQuantityChange(new BigDecimal("-1")); t2.setCreatedBy(uid); t2.setBarStationId(stationId);
        when(inventoryTransactionRepository.findSaleTransactionsByOrganizationId(orgId)).thenReturn(List.of(t1, t2));

        // inventories map to products with base prices
        Inventory inv1 = new Inventory(); inv1.setId(11L); inv1.setProductId(101L);
        Inventory inv2 = new Inventory(); inv2.setId(12L); inv2.setProductId(102L);
        Product p1 = new Product(); p1.setId(101L); p1.setBasePrice(new BigDecimal("3.00"));
        Product p2 = new Product(); p2.setId(102L); p2.setBasePrice(new BigDecimal("5.00"));

        User user = new User(); user.setId(uid); user.setName("Bob"); user.setEmail("b@c.d");
        when(userRepository.findAllById(anyList())).thenReturn(List.of(user));
        BarStation station = new BarStation(); station.setId(stationId); station.setName("Main");
        when(barStationRepository.findAllById(anyList())).thenReturn(List.of(station));
        when(productRepository.findRevenueData(List.of(1L, 2L))).thenReturn(
                List.of(new Object[] {p1.getBasePrice(), t1.getQuantityChange()}, new Object[] {p2.getBasePrice(), t2.getQuantityChange()})
        );

        List<UserSalesStatsResponseDto> stats = inventoryService.getUserSalesStats(orgId);
        assertEquals(1, stats.size());
        UserSalesStatsResponseDto s = stats.get(0);
        assertEquals(2L, s.getSalesCount());
        // revenue = 2*3 + 1*5 = 11
        assertEquals(new BigDecimal("11.00"), s.getTotalRevenue());
        assertEquals("Bob", s.getUserName());
    }

    @Test
    void getStationSalesStats_ComputesCountsAndRevenue() {
        Long orgId = 1L;
        Long stationId = 7L;
        InventoryTransaction t1 = new InventoryTransaction(); t1.setId(1L); t1.setInventoryId(11L); t1.setTransactionType("SALE"); t1.setReferenceId("o1"); t1.setQuantityChange(new BigDecimal("-2")); t1.setBarStationId(stationId);
        InventoryTransaction t2 = new InventoryTransaction(); t2.setId(2L); t2.setInventoryId(12L); t2.setTransactionType("SALE"); t2.setReferenceId("o2"); t2.setQuantityChange(new BigDecimal("-1")); t2.setBarStationId(stationId);
        when(inventoryTransactionRepository.findSaleTransactionsByOrganizationId(orgId)).thenReturn(List.of(t1, t2));

        Inventory inv1 = new Inventory(); inv1.setId(11L); inv1.setProductId(101L);
        Inventory inv2 = new Inventory(); inv2.setId(12L); inv2.setProductId(102L);
        Product p1 = new Product(); p1.setId(101L); p1.setBasePrice(new BigDecimal("3.00"));
        Product p2 = new Product(); p2.setId(102L); p2.setBasePrice(new BigDecimal("5.00"));
        when(productRepository.findRevenueData(List.of(1L, 2L))).thenReturn(
          List.of(new Object[] {p1.getBasePrice(), t1.getQuantityChange()}, new Object[] {p2.getBasePrice(), t2.getQuantityChange()})
        );

        BarStation station = new BarStation(); station.setId(stationId); station.setName("Main");
        when(barStationRepository.findAllById(anyList())).thenReturn(List.of(station));

        List<StationSalesStatsResponseDto> stats = inventoryService.getStationSalesStats(orgId);
        assertEquals(1, stats.size());
        StationSalesStatsResponseDto s = stats.get(0);
        assertEquals(2L, s.getSalesCount());
        assertEquals(new BigDecimal("11.00"), s.getTotalRevenue());
        assertEquals("Main", s.getBarStationName());
    }
}
