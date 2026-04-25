package com.borsibaar.config;

import com.borsibaar.entity.Role;
import com.borsibaar.entity.User;
import com.borsibaar.repository.RoleRepository;
import com.borsibaar.repository.UserRepository;
import com.borsibaar.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.context.SecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Debug filter that auto-logs in a user when debug mode is enabled.
 * This bypasses OAuth2 authentication entirely.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "debug.auto.login", havingValue = "true")
public class DebugAutoLoginFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();


    @Value("${debug.auto-login.email:debug@example.com}")
    private String debugEmail;

    @Value("${debug.auto-login.name:Debug User}")
    private String debugName;

    @Value("${app.frontend.url:http://localhost:3000}")
    private String frontendUrl;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {


        // If already authenticated, do nothing
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Check if JWT cookie already exists
        String existingToken = extractJwtFromCookie(request);

        // If we have a valid JWT cookie, let JwtAuthenticationFilter handle it
        if (existingToken != null) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        // If debug mode is active and we reach here, we should auto-login regardless of the path.
        // This makes it easy for developers to test any endpoint directly without hitting the frontend first.
        boolean shouldAutoLogin = true;

        if (shouldAutoLogin) {
            log.info("Debug auto-login triggered for user: {} on path: {}", debugEmail, uri);

                User user = userRepository.findByEmailWithRole(debugEmail)
                    .orElseGet(() -> {
                        Role defaultRole = roleRepository.findByName("USER")
                                .orElseThrow(() -> new IllegalStateException("Default role USER not found"));

                        User newUser = User.builder()
                                .email(debugEmail)
                                .name(debugName)
                                .role(defaultRole)
                                .organizationId(2L) // Assign to seeded organization TalTech ITÜK
                                .build();

                        return userRepository.save(newUser);
                    });

            // Generate JWT
            String token = jwtService.generateToken(user.getEmail());

            // Set JWT cookie with SameSite control
            // For localhost:3000 <-> localhost:8080, Lax usually works.
            // If you ever serve frontend and backend on different "sites", use SameSite=None; Secure=true (HTTPS).
            ResponseCookie cookie = ResponseCookie.from("jwt", token)
                    .httpOnly(true)
                    .secure(false)          // set true if using HTTPS
                    .path("/")
                    .maxAge(24 * 60 * 60)   // 1 day
                    .sameSite("Lax")
                    .build();
            response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

            // Authenticate THIS request immediately (so /api/account returns 200 right away)
            String roleName = (user.getRole() != null && user.getRole().getName() != null && !user.getRole().getName().isBlank())
                    ? user.getRole().getName()
                    : "USER";

            var auth = new UsernamePasswordAuthenticationToken(
                    user,  // Use User object as principal (matches JwtAuthenticationFilter)
                    null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + roleName))
            );
            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContext context = SecurityContextHolder.createEmptyContext();
            context.setAuthentication(auth);
            SecurityContextHolder.setContext(context);
            securityContextRepository.saveContext(context, request, response);

            log.info("Authentication set for user: {}, isAuthenticated: {}, authorities: {}",
                    user.getEmail(), auth.isAuthenticated(), auth.getAuthorities());

            // If this was a request to root, redirect to frontend
            if ("/".equals(uri)) {
                String redirect = user.getOrganizationId() == null ? "/worker/onboarding" : "/worker/dashboard";
                response.sendRedirect(frontendUrl + redirect);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String extractJwtFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("jwt".equals(cookie.getName())
                        && cookie.getValue() != null
                        && !cookie.getValue().isBlank()) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }
}

