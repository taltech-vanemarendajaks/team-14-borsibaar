package com.borsibaar.service;

import com.borsibaar.entity.Role;
import com.borsibaar.entity.User;
import com.borsibaar.dto.UserDTO;
import com.borsibaar.mapper.UserMapper;
import com.borsibaar.repository.RoleRepository;
import com.borsibaar.repository.UserRepository;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final UserMapper userMapper;
    private final RoleRepository roleRepository;

    public record AuthResult(UserDTO dto, boolean needsOnboarding) {
    }

    public AuthService(UserRepository userRepository, JwtService jwtService, UserMapper userMapper,
            RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.userMapper = userMapper;
        this.roleRepository = roleRepository;
    }

    @Transactional
    public AuthResult processOAuthLogin(OAuth2AuthenticationToken auth) {
        String email = auth.getPrincipal().getAttribute("email");
        String name = auth.getPrincipal().getAttribute("name");

        // Check if user exists or create a new one
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // Create new user with default role
                    Role defaultRole = roleRepository.findByName("USER")
                            .orElseThrow(() -> new IllegalStateException("Default role USER not found"));

                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .role(defaultRole)
                            .build();

                    return userRepository.save(newUser);
                });

        // Only update name if it was previously null or empty (preserve user
        // customizations)
        if (user.getName() == null || user.getName().isEmpty()) {
            user.setName(name);
            userRepository.save(user);
        }

        // Issue JWT
        String token = jwtService.generateToken(user.getEmail());
        boolean needsOnboarding = (user.getOrganizationId() == null);

        return new AuthResult(userMapper.toDto(user, token), needsOnboarding);
    }
}