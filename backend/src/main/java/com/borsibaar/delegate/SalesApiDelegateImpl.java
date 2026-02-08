package com.borsibaar.delegate;

import com.borsibaar.api.SalesApi;
import com.borsibaar.dto.SaleRequestDto;
import com.borsibaar.dto.SaleResponseDto;
import com.borsibaar.entity.User;
import com.borsibaar.service.SalesService;
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
public class SalesApiDelegateImpl extends AbstractApiDelegateImpl implements SalesApi {

    private final SalesService salesService;

    @Override
    public ResponseEntity<SaleResponseDto> processSale(SaleRequestDto request) {
        User user = SecurityUtils.getCurrentUser();
        SaleResponseDto response = salesService.processSale(request, user.getId(), user.getOrganizationId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
