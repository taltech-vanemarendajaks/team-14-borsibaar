package com.borsibaar.delegate;

import com.borsibaar.dto.SaleItemRequestDto;
import com.borsibaar.dto.SaleItemResponseDto;
import com.borsibaar.dto.SaleRequestDto;
import com.borsibaar.dto.SaleResponseDto;
import com.borsibaar.entity.Role;
import com.borsibaar.entity.User;
import com.borsibaar.service.SalesService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class SalesApiDelegateImplTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private SalesService salesService;

    @MockitoBean
    private ClientRegistrationRepository clientRegistrationRepository;

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void processSale_ReturnsCreatedResponse() throws Exception {
        User user = userWithOrg(1L, "USER");
        setAuth(user);

        var req = new SaleRequestDto().items(List.of(new SaleItemRequestDto().productId(10L)
                .quantity(new BigDecimal("2")))).notes("note").barStationId(5L);
        var item = new SaleItemResponseDto().productId(10L).productName("Cola")
                .quantity(new BigDecimal("2")).unitPrice(new BigDecimal("3.00"))
                .totalPrice(new BigDecimal("6.00"));
        var resp = new SaleResponseDto().saleId("SALE-1").items(List.of(item))
                .totalAmount(new BigDecimal("6.00")).notes("note").timestamp(Instant.now());
        when(salesService.processSale(any(SaleRequestDto.class), any(UUID.class), anyLong())).thenReturn(resp);

        mockMvc.perform(post("/api/sales")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.saleId").value("SALE-1"))
                .andExpect(jsonPath("$.items[0].productName").value("Cola"))
                .andExpect(jsonPath("$.totalAmount").value(6.00));

        verify(salesService).processSale(any(SaleRequestDto.class), any(UUID.class), anyLong());
    }

    private static User userWithOrg(Long orgId, String roleName) {
        Role role = new Role();
        role.setId(1L);
        role.setName(roleName);
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail("user@test.com");
        user.setName("Test User");
        user.setOrganizationId(orgId);
        user.setRole(role);
        return user;
    }

    private static void setAuth(User user) {
        Authentication auth = new UsernamePasswordAuthenticationToken(user, null, Collections.emptyList());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }
}
