package com.borsibaar.delegate;

import com.borsibaar.api.OrganizationApi;
import com.borsibaar.dto.OrganizationRequestDto;
import com.borsibaar.dto.OrganizationResponseDto;
import com.borsibaar.service.OrganizationService;
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
public class OrganizationApiDelegateImpl extends AbstractApiDelegateImpl implements OrganizationApi {

    private final OrganizationService organizationService;

    @Override
    public ResponseEntity<OrganizationResponseDto> createOrganization(OrganizationRequestDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(organizationService.create(request));
    }

    @Override
    public ResponseEntity<List<OrganizationResponseDto>> getAllOrganizations() {
        return ResponseEntity.ok(organizationService.getAll());
    }

    @Override
    public ResponseEntity<OrganizationResponseDto> getOrganizationById(Long id) {
        return ResponseEntity.ok(organizationService.getById(id));
    }

    @Override
    public ResponseEntity<OrganizationResponseDto> updateOrganization(Long id, OrganizationRequestDto request) {
        return ResponseEntity.ok(organizationService.update(id, request));
    }
}
