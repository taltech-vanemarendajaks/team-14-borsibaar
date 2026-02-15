package com.borsibaar.mapper;

import com.borsibaar.dto.User3Dto;
import com.borsibaar.dto.UserSummaryResponseDto;
import com.borsibaar.entity.Role;
import com.borsibaar.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface UserMapper {

    @Mapping(target = "role", source = "user.role", qualifiedByName = "roleToName")
    User3Dto toDto(User user, String token);

    @Mapping(target = "role", source = "role", qualifiedByName = "roleToName")
    @Mapping(target = "token", ignore = true)
    User3Dto toDto(User user);

    @Mapping(target = "role", source = "role", qualifiedByName = "roleToName")
    UserSummaryResponseDto toSummaryDto(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "organizationId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "role", source = "role") // uses map(String)->Role below
    User toEntity(User3Dto dto);

    @Named("roleToName")
    default String roleToName(Role role) {
        return role == null ? null : role.getName();
    }

    default Role map(String roleName) {
        if (roleName == null)
            return null;
        Role r = new Role();
        r.setName(roleName);
        return r;
    }
}
