package com.borsibaar.delegate;

import com.borsibaar.api.AuthApi;
import com.borsibaar.dto.LogoutResponseDto;
import com.borsibaar.service.AuthService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

@Slf4j
@ControllerAdvice
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthApiDelegateImpl extends AbstractApiDelegateImpl implements AuthApi {

    private final AuthService authService;
    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    @SneakyThrows
    public ResponseEntity<Void> loginSuccess() {
        OAuth2AuthenticationToken auth = (OAuth2AuthenticationToken)
                SecurityContextHolder.getContext().getAuthentication();
        var result = authService.processOAuthLogin(auth);

        Cookie cookie = new Cookie("jwt", result.dto().getToken());
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // HTTPS enabled with domain
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 1 day
        response.addCookie(cookie);

        String redirect = result.needsOnboarding() ? "/onboarding" : "/dashboard";

        return ResponseEntity.status(HttpStatus.FOUND).location(URI.create(frontendUrl + redirect)).build();
    }

    @Override
    public ResponseEntity<LogoutResponseDto> logoutUser() {
        // Invalidate the server-side session (removes OAuth2 authentication)
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        // Clear the Spring Security context
        SecurityContextHolder.clearContext();

        // Clear the JWT cookie
        Cookie jwtCookie = new Cookie("jwt", "");
        jwtCookie.setHttpOnly(true);
        jwtCookie.setSecure(true); // HTTPS enabled with domain
        jwtCookie.setPath("/");
        jwtCookie.setMaxAge(0); // Expire immediately
        response.addCookie(jwtCookie);

        LogoutResponseDto response = new LogoutResponseDto();
        response.setMessage("Logged out successfully");

        return ResponseEntity.ok(response);
    }
}
