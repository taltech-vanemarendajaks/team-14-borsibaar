package com.borsibaar.delegate;

import com.borsibaar.api.UserApi;
import com.borsibaar.dto.UserSummaryResponseDto;
import com.borsibaar.entity.User;
import com.borsibaar.mapper.UserMapper;
import com.borsibaar.repository.UserRepository;
import com.borsibaar.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
public class UserApiDelegateImpl extends AbstractApiDelegateImpl implements UserApi {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public ResponseEntity<List<UserSummaryResponseDto>> getOrganizationUsers() {
        // Get authenticated user from SecurityContext (set by JwtAuthenticationFilter)
        User currentUser = SecurityUtils.getCurrentUser();
        SecurityUtils.requireAdminRole(currentUser);

        List<User> users = userRepository.findByOrganizationId(currentUser.getOrganizationId());

        return ResponseEntity.ok(users.stream().map(userMapper::toSummaryDto).toList());
    }
}
