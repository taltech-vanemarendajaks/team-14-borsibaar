package com.borsibaar.service;

import com.borsibaar.dto.OrganizationRequestDto;
import com.borsibaar.dto.OrganizationResponseDto;
import com.borsibaar.entity.Organization;
import com.borsibaar.mapper.OrganizationMapper;
import com.borsibaar.repository.OrganizationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrganizationServiceTest {

    @Mock
    private OrganizationRepository organizationRepository;
    @Mock
    private OrganizationMapper organizationMapper;

    @InjectMocks
    private OrganizationService organizationService;

    @Test
    void create_SetsCreatedAtAndMaps() {
        var req = new OrganizationRequestDto().name("Org").priceIncreaseStep(BigDecimal.valueOf(0.5))
                .priceDecreaseStep(BigDecimal.valueOf(0.5));
        Organization entity = new Organization();
        when(organizationMapper.toEntity(req)).thenReturn(entity);
        Organization saved = new Organization(); saved.setId(3L); saved.setName("Org"); saved.setCreatedAt(Instant.now());
        when(organizationRepository.save(entity)).thenReturn(saved);
        var resp = new OrganizationResponseDto().id(3L).name("Org").createdAt(saved.getCreatedAt())
                .updatedAt(saved.getUpdatedAt()).priceDecreaseStep(BigDecimal.valueOf(0.5))
                .priceDecreaseStep(BigDecimal.valueOf(0.5));
        when(organizationMapper.toResponse(saved)).thenReturn(resp);

        OrganizationResponseDto dto = organizationService.create(req);
        assertEquals(3L, dto.getId());
        verify(organizationRepository).save(entity);
    }

    @Test
    void getById_NotFound_Throws() {
        when(organizationRepository.findById(99L)).thenReturn(Optional.empty());
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> organizationService.getById(99L));
        assertEquals(HttpStatus.NOT_FOUND, ex.getStatusCode());
    }

    @Test
    void getAll_ReturnsMappedList() {
        Organization o = new Organization(); o.setId(1L); o.setName("A");
        when(organizationRepository.findAll()).thenReturn(List.of(o));
        var resp = new OrganizationResponseDto().id(1L).name("A").createdAt(Instant.now()).updatedAt(Instant.now())
                .priceDecreaseStep(BigDecimal.valueOf(0.5)).priceDecreaseStep(BigDecimal.valueOf(0.5));
        when(organizationMapper.toResponse(o)).thenReturn(resp);
        var list = organizationService.getAll();
        assertEquals(1, list.size());
    }
}
