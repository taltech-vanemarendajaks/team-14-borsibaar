package com.borsibaar.delegate;

import com.borsibaar.dto.*;
import com.borsibaar.entity.Role;
import com.borsibaar.entity.User;
import com.borsibaar.service.InventoryService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class InventoryApiDelegateImplTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockitoBean
        private InventoryService inventoryService;

        @MockitoBean
        private ClientRegistrationRepository clientRegistrationRepository;

        @AfterEach
        void tearDown() {
                SecurityContextHolder.clearContext();
        }

        @Test
        void getOrganizationInventory_UsesUserOrg_WhenNoQueryParam() throws Exception {
                User user = userWithOrg(42L, "USER");
                setAuth(user);

                when(inventoryService.getByOrganization(42L, null)).thenReturn(List.of());
                mockMvc.perform(get("/api/inventory"))
                                .andExpect(status().isOk());

                verify(inventoryService).getByOrganization(42L, null);
        }

        @Test
        void addStock_ReturnsCreated() throws Exception {
                User user = userWithOrg(1L, "USER");
                setAuth(user);

                var req = new AddStockRequestDto().productId(10L).quantity(new BigDecimal("5")).notes("note");
                var resp = new InventoryResponseDto().id(100L).organizationId(1L).productId(10L)
                        .productName("Cola").quantity(new BigDecimal("15")).unitPrice(new BigDecimal("2.50"))
                        .description("abc").basePrice(new BigDecimal("2.00")).minPrice(new BigDecimal("2.00"))
                        .maxPrice(new BigDecimal("5.00")).updatedAt(Instant.now());
                when(inventoryService.addStock(any(AddStockRequestDto.class), any(UUID.class), eq(1L)))
                                .thenReturn(resp);

                mockMvc.perform(post("/api/inventory/add")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.id").value(100))
                                .andExpect(jsonPath("$.productName").value("Cola"));

                verify(inventoryService).addStock(any(AddStockRequestDto.class), any(UUID.class), eq(1L));
        }

        @Test
        void getOrganizationInventory_UsesQueryParams_WhenProvided() throws Exception {
                var inventoryResponse = new InventoryResponseDto().id(1L).organizationId(99L).productId(10L)
                        .productName("Cola").quantity(BigDecimal.ONE).unitPrice(BigDecimal.ONE).description("abc")
                        .basePrice(BigDecimal.TEN).updatedAt(Instant.now());
                when(inventoryService.getByOrganization(99L, 7L)).thenReturn(List.of(inventoryResponse));

                mockMvc.perform(get("/api/inventory").param("organizationId", "99").param("categoryId", "7"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)))
                                .andExpect(jsonPath("$[0].organizationId").value(99));

                verify(inventoryService).getByOrganization(99L, 7L);
        }

        @Test
        void getProductInventory_DelegatesToService() throws Exception {
                User user = userWithOrg(5L, "USER");
                setAuth(user);
                var inventoryResponse = new InventoryResponseDto().id(1L).organizationId(5L).productId(10L)
                        .productName("Water").quantity(BigDecimal.ONE).unitPrice(BigDecimal.ONE).description("abc")
                        .basePrice(BigDecimal.ONE).updatedAt(Instant.now());
                when(inventoryService.getByProductAndOrganization(10L, 5L)).thenReturn(inventoryResponse);

                mockMvc.perform(get("/api/inventory/product/{productId}", 10L))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.productId").value(10));

                verify(inventoryService).getByProductAndOrganization(10L, 5L);
        }

        @Test
        void removeStock_ReturnsOk() throws Exception {
                User user = userWithOrg(2L, "USER");
                setAuth(user);
                var req = new RemoveStockRequestDto().productId(20L).quantity(new BigDecimal("3"))
                        .referenceId("ref1").notes("note");
                var resp = new InventoryResponseDto().id(2L).organizationId(2L).productId(20L).productName("Beer")
                        .quantity(new BigDecimal("7")).unitPrice(new BigDecimal("4.00")).description("abc")
                        .basePrice(new BigDecimal("3.50")).updatedAt(Instant.now());
                when(inventoryService.removeStock(any(RemoveStockRequestDto.class), any(UUID.class), eq(2L)))
                                .thenReturn(resp);

                mockMvc.perform(post("/api/inventory/remove")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.productId").value(20));

                verify(inventoryService).removeStock(any(RemoveStockRequestDto.class), any(UUID.class), eq(2L));
        }

        @Test
        void adjustStock_ReturnsOk() throws Exception {
                User user = userWithOrg(3L, "USER");
                setAuth(user);
                var req = new AdjustStockRequestDto().productId(30L).newQuantity(new BigDecimal("12")).notes("audit");
                var resp = new InventoryResponseDto().id(3L).organizationId(3L).productId(30L).productName("Juice")
                        .quantity(new BigDecimal("12")).unitPrice(new BigDecimal("2.00")).description("abc")
                        .basePrice(new BigDecimal("2.00")).updatedAt(Instant.now());
                when(inventoryService.adjustStock(any(AdjustStockRequestDto.class), any(UUID.class), eq(3L)))
                                .thenReturn(resp);

                mockMvc.perform(post("/api/inventory/adjust")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(req)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.quantity").value(12));

                verify(inventoryService).adjustStock(any(AdjustStockRequestDto.class), any(UUID.class), eq(3L));
        }

        @Test
        void getTransactionHistory_ReturnsList() throws Exception {
                User user = userWithOrg(4L, "USER");
                setAuth(user);
                var resp = new InventoryTransactionResponseDto().id(1L).inventoryId(99L).transactionType("SALE")
                        .quantityChange(BigDecimal.ONE.negate()).quantityBefore(BigDecimal.TEN)
                        .priceBefore(new BigDecimal("9")).priceAfter(BigDecimal.TEN).referenceId("ref").notes("n")
                        .createdBy(UUID.randomUUID().toString()).createdByName("Alice").createdByEmail("a@b.c")
                        .createdAt(Instant.now());
                when(inventoryService.getTransactionHistory(40L, 4L)).thenReturn(List.of(resp));

                mockMvc.perform(get("/api/inventory/product/{productId}/history", 40L))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)));

                verify(inventoryService).getTransactionHistory(40L, 4L);
        }

        @Test
        void getUserSalesStats_ReturnsList() throws Exception {
                User user = userWithOrg(6L, "USER");
                setAuth(user);
                var resp = new UserSalesStatsResponseDto().userId(UUID.randomUUID().toString()).userName("U")
                        .userEmail("u@x").salesCount(2L).totalRevenue(new BigDecimal("12.00")).barStationId(1L)
                        .barStationName("S");
                when(inventoryService.getUserSalesStats(6L)).thenReturn(List.of(resp));

                mockMvc.perform(get("/api/inventory/sales-stats"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)));

                verify(inventoryService).getUserSalesStats(6L);
        }

        @Test
        void getStationSalesStats_ReturnsList() throws Exception {
                User user = userWithOrg(7L, "USER");
                setAuth(user);
                var resp = new StationSalesStatsResponseDto().barStationId(1L).barStationName("Main").salesCount(3L)
                        .totalRevenue(new BigDecimal("30.00"));
                when(inventoryService.getStationSalesStats(7L)).thenReturn(List.of(resp));

                mockMvc.perform(get("/api/inventory/station-sales-stats"))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$", hasSize(1)));

                verify(inventoryService).getStationSalesStats(7L);
        }

        private static User userWithOrg(Long orgId, String roleName) {
                Role role = Role.builder().id(1L).name(roleName).build();
                return User.builder()
                                .id(UUID.randomUUID())
                                .email("user@test.com")
                                .name("Test User")
                                .organizationId(orgId)
                                .role(role)
                                .build();
        }

        private static void setAuth(User user) {
                Authentication auth = new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
                SecurityContextHolder.getContext().setAuthentication(auth);
        }
}
