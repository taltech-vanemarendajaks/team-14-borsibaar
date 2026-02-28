package com.borsibaar.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
import java.util.Optional;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final ClientRegistrationRepository clientRegistrationRepository;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final Optional<DebugAutoLoginFilter> debugAutoLoginFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   CorsConfigurationSource corsConfigurationSource) throws Exception {
        DefaultOAuth2AuthorizationRequestResolver defaultResolver = new DefaultOAuth2AuthorizationRequestResolver(
                clientRegistrationRepository, "/oauth2/authorization");

        OAuth2AuthorizationRequestResolver customResolver = new OAuth2AuthorizationRequestResolver() {
            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request) {
                var req = defaultResolver.resolve(request);
                if (req == null)
                    return null;
                return OAuth2AuthorizationRequest.from(req)
                        .additionalParameters(p -> p.put("prompt", "select_account"))
                        .build();
            }

            @Override
            public OAuth2AuthorizationRequest resolve(HttpServletRequest request, String clientRegistrationId) {
                var req = defaultResolver.resolve(request, clientRegistrationId);
                if (req == null)
                    return null;
                return OAuth2AuthorizationRequest.from(req)
                        .additionalParameters(p -> p.put("prompt", "select_account"))
                        .build();
            }
        };

        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource));

        // ✅ Only add when bean exists (DEBUG_AUTO_LOGIN=true)
        debugAutoLoginFilter.ifPresent(filter ->
                http.addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
        );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/", "/error", "/oauth2/**", "/login/oauth2/code/**", "/auth/login/success").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/organizations/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/organizations").permitAll()
                        .requestMatchers(HttpMethod.PUT, "/api/organizations/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/inventory/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex.authenticationEntryPoint((request, response, authException) -> {
                    if (request.getRequestURI().startsWith("/api/")) {
                        response.sendError(HttpServletResponse.SC_UNAUTHORIZED);
                    } else {
                        response.sendRedirect("/oauth2/authorization/google");
                    }
                }))
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("/auth/login/success", true)
                        .authorizationEndpoint(auth -> auth.authorizationRequestResolver(customResolver)));

        return http.build();
    }

    @Value("${app.cors.allowed-origins}")
    private String[] allowedOrigins;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of(allowedOrigins)); // e.g. http://localhost:3000
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true); // since you send cookies
        cfg.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cfg);
        return source;
    }
}
