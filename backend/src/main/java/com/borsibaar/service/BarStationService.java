package com.borsibaar.service;

import com.borsibaar.dto.BarStationRequestDto;
import com.borsibaar.entity.BarStation;
import com.borsibaar.entity.User;
import com.borsibaar.exception.BadRequestException;
import com.borsibaar.exception.DuplicateResourceException;
import com.borsibaar.exception.NotFoundException;
import com.borsibaar.mapper.BarStationMapper;
import com.borsibaar.repository.BarStationRepository;
import com.borsibaar.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BarStationService {

    private final BarStationRepository barStationRepository;
    private final UserRepository userRepository;
    private final BarStationMapper barStationMapper;

    @Transactional(readOnly = true)
    public List<BarStation> getAllStations(Long organizationId) {
        return barStationRepository.findByOrganizationId(organizationId);
    }

    @Transactional(readOnly = true)
    public BarStation getStationById(Long organizationId, Long stationId) {
        return barStationRepository.findByOrganizationIdAndId(organizationId, stationId)
                .orElseThrow(() -> new NotFoundException("Bar station not found"));
    }

    @Transactional
    public BarStation createStation(Long organizationId, BarStationRequestDto request) {
        // Check for duplicate name
        List<BarStation> existingStations = barStationRepository.findByOrganizationId(organizationId);
        boolean nameExists = existingStations.stream()
                .anyMatch(s -> s.getName().equalsIgnoreCase(request.getName()));
        if (nameExists) {
            throw new DuplicateResourceException("A bar station with this name already exists");
        }

        BarStation station = BarStation.builder()
                .organizationId(organizationId)
                .name(request.getName())
                .description(request.getDescription())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        // Assign users if provided
        if (request.getUserIds() != null && !request.getUserIds().isEmpty()) {
            Set<User> users = assignUsersToStation(organizationId, request.getUserIds(), station);
            station.setUsers(users);
        }

        return barStationRepository.save(station);
    }

    @Transactional
    public BarStation updateStation(Long organizationId, Long stationId, BarStationRequestDto request) {
        BarStation station = barStationRepository.findByOrganizationIdAndId(organizationId, stationId)
                .orElseThrow(() -> new NotFoundException("Bar station not found"));

        // Check for duplicate name (excluding current station)
        List<BarStation> existingStations = barStationRepository.findByOrganizationId(organizationId);
        boolean nameExists = existingStations.stream()
                .anyMatch(s -> !s.getId().equals(stationId) && s.getName().equalsIgnoreCase(request.getName()));
        if (nameExists) {
            throw new DuplicateResourceException("A bar station with this name already exists");
        }

        station.setName(request.getName());
        station.setDescription(request.getDescription());
        if (request.getIsActive() != null) {
            station.setIsActive(request.getIsActive());
        }

        // Update assigned users
        if (request.getUserIds() != null) {
            // Clear existing assignments from both sides
            Set<User> existingUsers = new HashSet<>(station.getUsers());
            for (User user : existingUsers) {
                user.getBarStations().remove(station);
            }
            station.getUsers().clear();

            if (!request.getUserIds().isEmpty()) {
                Set<User> users = assignUsersToStation(organizationId, request.getUserIds(), station);
                station.setUsers(users);
            }
        }

        return barStationRepository.save(station);
    }

    @Transactional
    public void deleteStation(Long organizationId, Long stationId) {
        BarStation station = barStationRepository.findByOrganizationIdAndId(organizationId, stationId)
                .orElseThrow(() -> new NotFoundException("Bar station not found"));
        barStationRepository.delete(station);
    }

    @Transactional(readOnly = true)
    public List<BarStation> getUserStations(UUID userId, Long organizationId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!user.getOrganizationId().equals(organizationId)) {
            throw new BadRequestException("User does not belong to this organization");
        }

        return user.getBarStations().stream().toList();
    }

    private Set<User> assignUsersToStation(Long organizationId, List<UUID> userIds, BarStation station) {
        Set<User> users = new HashSet<>();
        for (UUID userId : userIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new NotFoundException("User not found: " + userId));

            if (!user.getOrganizationId().equals(organizationId)) {
                throw new BadRequestException("User " + userId + " does not belong to this organization");
            }

            // Add the station to the user's barStations (owning side)
            user.getBarStations().add(station);
            users.add(user);
        }
        return users;
    }
}
