package com.borsibaar.delegate;

import com.borsibaar.dto.OrganizationRequestDto;
import com.borsibaar.dto.OrganizationResponseDto;
import com.borsibaar.service.OrganizationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class OrganizationApiDelegateImplTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private OrganizationService organizationService;

    @MockitoBean
    private ClientRegistrationRepository clientRegistrationRepository;

    @Test
    void create_ReturnsCreated() throws Exception {
        var req = new OrganizationRequestDto().name("Org").priceIncreaseStep(BigDecimal.valueOf(0.5))
                .priceDecreaseStep(BigDecimal.valueOf(0.5));
        var resp = new OrganizationResponseDto().id(1L).name("Org").createdAt(Instant.now()).updatedAt(Instant.now())
                .priceIncreaseStep(BigDecimal.valueOf(0.5)).priceDecreaseStep(BigDecimal.valueOf(0.5));

        when(organizationService.create(any(OrganizationRequestDto.class))).thenReturn(resp);

        mockMvc.perform(post("/api/organizations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Org"));

        verify(organizationService).create(any(OrganizationRequestDto.class));
    }

    @Test
    void get_ReturnsDto() throws Exception {
        var resp = new OrganizationResponseDto().id(2L).name("Org2").createdAt(Instant.now()).updatedAt(Instant.now())
                .priceIncreaseStep(BigDecimal.valueOf(0.5)).priceDecreaseStep(BigDecimal.valueOf(0.5));
        when(organizationService.getById(2L)).thenReturn(resp);

        mockMvc.perform(get("/api/organizations/2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.name").value("Org2"));

        verify(organizationService).getById(2L);
    }

    @Test
    void getAll_ReturnsList() throws Exception {
        var resp1 = new OrganizationResponseDto().id(1L).name("A").createdAt(Instant.now()).updatedAt(Instant.now())
                .priceIncreaseStep(BigDecimal.valueOf(0.5)).priceDecreaseStep(BigDecimal.valueOf(0.5));
        var resp2 = new OrganizationResponseDto().id(2L).name("B").createdAt(Instant.now()).updatedAt(Instant.now())
                .priceIncreaseStep(BigDecimal.valueOf(0.5)).priceDecreaseStep(BigDecimal.valueOf(0.5));

        when(organizationService.getAll()).thenReturn(List.of(resp1, resp2));

        mockMvc.perform(get("/api/organizations"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));

        verify(organizationService).getAll();
    }

    @Test
    void update_ReturnsUpdatedDto() throws Exception {
        var req = new OrganizationRequestDto().name("Updated Org").priceIncreaseStep(BigDecimal.valueOf(1.0))
                .priceDecreaseStep(BigDecimal.valueOf(0.25));
        var resp = new OrganizationResponseDto().id(5L).name("Updated Org").createdAt(Instant.now())
                .updatedAt(Instant.now()).priceIncreaseStep(BigDecimal.valueOf(1.0))
                .priceDecreaseStep(BigDecimal.valueOf(0.25));


        when(organizationService.update(5L, req)).thenReturn(resp);

        mockMvc.perform(put("/api/organizations/5")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5))
                .andExpect(jsonPath("$.name").value("Updated Org"))
                .andExpect(jsonPath("$.priceIncreaseStep").value(1.0))
                .andExpect(jsonPath("$.priceDecreaseStep").value(0.25));

        verify(organizationService).update(5L, req);
    }
}
