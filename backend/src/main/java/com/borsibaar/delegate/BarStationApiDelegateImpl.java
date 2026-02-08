package com.borsibaar.delegate;

import com.borsibaar.api.BarStationApi;
import com.borsibaar.dto.BarStationRequestDto;
import com.borsibaar.dto.BarStationResponseDto;
import com.borsibaar.entity.BarStation;
import com.borsibaar.entity.User;
import com.borsibaar.mapper.BarStationMapper;
import com.borsibaar.service.BarStationService;
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
public class BarStationApiDelegateImpl extends AbstractApiDelegateImpl implements BarStationApi {

    private final BarStationService barStationService;
    private final BarStationMapper barStationMapper;

    @Override
    public ResponseEntity<BarStationResponseDto> createStation(BarStationRequestDto request) {
        User user = SecurityUtils.getCurrentUser();
        SecurityUtils.requireAdminRole(user);

        BarStation station = barStationService.createStation(user.getOrganizationId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(barStationMapper.toResponseDto(station));
    }

    @Override
    public ResponseEntity<Void> deleteStation(Long id) {
        User user = SecurityUtils.getCurrentUser();
        SecurityUtils.requireAdminRole(user);

        barStationService.deleteStation(user.getOrganizationId(), id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<BarStationResponseDto>> getAllStations() {
        User user = SecurityUtils.getCurrentUser();
        SecurityUtils.requireAdminRole(user);

        List<BarStation> stations = barStationService.getAllStations(user.getOrganizationId());
        return ResponseEntity.ok(barStationMapper.toResponseDtoList(stations));
    }

    @Override
    public ResponseEntity<BarStationResponseDto> getStationById(Long id) {
        User user = SecurityUtils.getCurrentUser();

        BarStation station = barStationService.getStationById(user.getOrganizationId(), id);
        return ResponseEntity.ok(barStationMapper.toResponseDto(station));
    }

    @Override
    public ResponseEntity<List<BarStationResponseDto>> getUserStations() {
        User user = SecurityUtils.getCurrentUser();

        List<BarStation> stations = barStationService.getUserStations(user.getId(), user.getOrganizationId());
        return ResponseEntity.ok(barStationMapper.toResponseDtoList(stations));
    }

    @Override
    public ResponseEntity<BarStationResponseDto> updateStation(Long id, BarStationRequestDto request) {
        User user = SecurityUtils.getCurrentUser();
        SecurityUtils.requireAdminRole(user);

        BarStation station = barStationService.updateStation(user.getOrganizationId(), id, request);
        return ResponseEntity.ok(barStationMapper.toResponseDto(station));
    }
}
