package com.borsibaar.delegate;

import com.borsibaar.api.AccountApi;
import com.borsibaar.dto.MeResponseDto;
import com.borsibaar.dto.OnboardingRequestDto;
import com.borsibaar.entity.Role;
import com.borsibaar.entity.User;
import com.borsibaar.repository.RoleRepository;
import com.borsibaar.repository.UserRepository;
import com.borsibaar.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@ControllerAdvice
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AccountDelegateImpl extends AbstractApiDelegateImpl implements AccountApi {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public ResponseEntity<MeResponseDto> getUser() {
        try {
            // Allow users without organization (for onboarding check)
            User user = SecurityUtils.getCurrentUser(false);

            MeResponseDto response = new MeResponseDto();
            response.setEmail(user.getEmail());
            response.name(user.getName());
            response.setRole(user.getRole() != null ? user.getRole().getName() : null);
            response.setOrganizationId(user.getOrganizationId());
            response.setNeedsOnboarding(user.getOrganizationId() == null);

            return ResponseEntity.ok(response);
        } catch (ResponseStatusException e) {
            return ResponseEntity.status(e.getStatusCode()).build();
        } catch (Exception e) {
            // Log unexpected errors for debugging
            // This will be handled by ApiExceptionHandler and return ProblemDetail
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to retrieve account information: " + e.getMessage(),
                    e);
        }
    }

    @Override
    public ResponseEntity<Void> onboardUser(OnboardingRequestDto request) {
        try {
            if (request.getOrganizationId() == null || !request.getAcceptTerms())
                return ResponseEntity.badRequest().build();

            // Allow users without organization (that's the point of onboarding)
            User user = SecurityUtils.getCurrentUser(false);

            Role adminRole = roleRepository.findByName("ADMIN")
                    .orElseThrow(() -> new IllegalArgumentException("Admin role ADMIN not found"));

            // Set org and role if needed (idempotent: do nothing if already set)
            if (user.getOrganizationId() == null) {
                // At least one user must be admin
                if (userRepository.findByOrganizationIdAndRole(request.getOrganizationId(), adminRole).isEmpty()) {
                    user.setRole(adminRole);
                }
                user.setOrganizationId(request.getOrganizationId());
                userRepository.save(user);
            }

            // If later you add orgId to JWT, re-issue token here.
            return ResponseEntity.noContent().build();
        } catch (ResponseStatusException e) {
            throw e; // Re-throw to be handled by exception handler
        } catch (Exception e) {
            // Log unexpected errors for debugging
            // This will be handled by ApiExceptionHandler and return ProblemDetail
            throw new ResponseStatusException(
                    org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR,
                    "Failed to complete onboarding: " + e.getMessage(),
                    e);
        }
    }
}
