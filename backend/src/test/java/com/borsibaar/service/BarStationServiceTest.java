package com.borsibaar.service;

import com.borsibaar.dto.BarStationRequestDto;
import com.borsibaar.entity.BarStation;
import com.borsibaar.entity.User;
import com.borsibaar.exception.BadRequestException;
import com.borsibaar.exception.DuplicateResourceException;
import com.borsibaar.exception.NotFoundException;
import com.borsibaar.repository.BarStationRepository;
import com.borsibaar.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BarStationServiceTest {

    @Mock private BarStationRepository barStationRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private BarStationService barStationService;

    @Test
    void createStation_Success_AssignsUsers() {
        UUID uId = UUID.randomUUID();
        BarStationRequestDto req = createRequest("Main", "Desc", true, List.of(uId));
        when(barStationRepository.findByOrganizationId(1L)).thenReturn(List.of());
        User user = new User(); user.setId(uId); user.setOrganizationId(1L); user.setBarStations(new HashSet<>()); user.setName("User");
        when(userRepository.findById(uId)).thenReturn(Optional.of(user));
        BarStation saved = BarStation.builder().id(5L).name("Main").organizationId(1L).users(new HashSet<>()).build();
        when(barStationRepository.save(any(BarStation.class))).thenReturn(saved);

        BarStation station = barStationService.createStation(1L, req);
        assertEquals("Main", station.getName());
        verify(barStationRepository).save(any(BarStation.class));
    }

    @Test
    void createStation_DuplicateName_Throws() {
        BarStation existing = BarStation.builder().id(1L).name("Main").organizationId(1L).build();
        when(barStationRepository.findByOrganizationId(1L)).thenReturn(List.of(existing));
        BarStationRequestDto request = createRequest("Main", null, null, null);
        assertThrows(DuplicateResourceException.class, () -> barStationService.createStation(1L, request));
    }

    @Test
    void updateStation_DuplicateName_Throws() {
        BarStation station = BarStation.builder().id(2L).name("StationA").organizationId(1L).users(new HashSet<>()).build();
        BarStation other = BarStation.builder().id(3L).name("Main").organizationId(1L).build();
        when(barStationRepository.findByOrganizationIdAndId(1L, 2L)).thenReturn(Optional.of(station));
        when(barStationRepository.findByOrganizationId(1L)).thenReturn(List.of(station, other));
        BarStationRequestDto request = createRequest("Main", null, null, null);
        assertThrows(DuplicateResourceException.class, () -> barStationService.updateStation(1L, 2L, request));
    }

    @Test
    void deleteStation_NotFound_Throws() {
        when(barStationRepository.findByOrganizationIdAndId(1L, 9L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> barStationService.deleteStation(1L, 9L));
    }

    @Test
    void getUserStations_UserOrgMismatch_Throws() {
        UUID uid = UUID.randomUUID();
        User user = new User(); user.setId(uid); user.setOrganizationId(2L); user.setBarStations(new HashSet<>());
        when(userRepository.findById(uid)).thenReturn(Optional.of(user));
        assertThrows(BadRequestException.class, () -> barStationService.getUserStations(uid, 1L));
    }

    @Test
    void getStationById_NotFound_Throws() {
        when(barStationRepository.findByOrganizationIdAndId(1L, 55L)).thenReturn(Optional.empty());
        assertThrows(NotFoundException.class, () -> barStationService.getStationById(1L, 55L));
    }

    @Test
    void getAllStations_ReturnsMappedList() {
        BarStation s1 = BarStation.builder().id(1L).organizationId(1L).name("A").build();
        BarStation s2 = BarStation.builder().id(2L).organizationId(1L).name("B").build();
        when(barStationRepository.findByOrganizationId(1L)).thenReturn(List.of(s1, s2));

        List<BarStation> result = barStationService.getAllStations(1L);
        assertEquals(2, result.size());
        verify(barStationRepository).findByOrganizationId(1L);
    }

    @Test
    void createStation_DefaultsActive_WhenNoUsersProvided() {
        when(barStationRepository.findByOrganizationId(1L)).thenReturn(List.of());
        ArgumentCaptor<BarStation> captor = ArgumentCaptor.forClass(BarStation.class);
        BarStation saved = BarStation.builder().id(3L).organizationId(1L).name("New").isActive(true).build();
        when(barStationRepository.save(any(BarStation.class))).thenReturn(saved);

        BarStationRequestDto request = createRequest("New", "Desc", null, null);
        BarStation station = barStationService.createStation(1L, request);
        assertEquals("New", station.getName());
        verify(barStationRepository).save(captor.capture());
        assertEquals(Boolean.TRUE, captor.getValue().getIsActive());
    }

    @Test
    void updateStation_Success_AssignsUsers() {
        Long orgId = 1L; Long stationId = 10L; UUID uid = UUID.randomUUID();
        BarStation station = BarStation.builder().id(stationId).organizationId(orgId).name("Old").users(new HashSet<>()).build();
        when(barStationRepository.findByOrganizationIdAndId(orgId, stationId)).thenReturn(Optional.of(station));
        when(barStationRepository.findByOrganizationId(orgId)).thenReturn(List.of(station));
        User user = new User(); user.setId(uid); user.setOrganizationId(orgId); user.setBarStations(new HashSet<>());
        when(userRepository.findById(uid)).thenReturn(Optional.of(user));
        when(barStationRepository.save(any(BarStation.class))).thenAnswer(a -> a.getArgument(0));

        BarStationRequestDto request = createRequest("Upd", "D", false, List.of(uid));
        BarStation resultStation = barStationService.updateStation(orgId, stationId, request);
        assertEquals("Upd", resultStation.getName());
        verify(barStationRepository).save(any(BarStation.class));
    }

    @Test
    void deleteStation_Success() {
        BarStation station = BarStation.builder().id(5L).organizationId(1L).name("A").build();
        when(barStationRepository.findByOrganizationIdAndId(1L, 5L)).thenReturn(Optional.of(station));
        barStationService.deleteStation(1L, 5L);
        verify(barStationRepository).delete(station);
    }

    @Test
    void getUserStations_ReturnsMapped() {
        UUID uid = UUID.randomUUID();
        User user = new User(); user.setId(uid); user.setOrganizationId(1L); user.setBarStations(new HashSet<>());
        BarStation st = BarStation.builder().id(1L).organizationId(1L).name("A").build();
        user.getBarStations().add(st);
        when(userRepository.findById(uid)).thenReturn(Optional.of(user));

        List<BarStation> res = barStationService.getUserStations(uid, 1L);
        assertEquals(1, res.size());
    }

    private BarStationRequestDto createRequest(String name, String desc, Boolean active, List<UUID> userIds) {
        return new BarStationRequestDto()
                .name(name)
                .description(desc)
                .isActive(active)
                .userIds(userIds);
    }
}
