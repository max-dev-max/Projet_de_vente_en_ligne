package com.esgis2026.assigame.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.esgis2026.assigame.security.CustomUserDetailsService;
import com.esgis2026.assigame.security.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomUserDetailsService customUserDetailsService;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
            CustomUserDetailsService customUserDetailsService) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customUserDetailsService = customUserDetailsService;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/index.html", "/*.html", "/css/**", "/js/**", "/images/**", "/uploads/**", "/admin/**", "/vendeur/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/produits/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/categorieproduit/**").permitAll()
                        .requestMatchers("/api/typeutilisateur/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/categorieproduit/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categorieproduit/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categorieproduit/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/produits/**").hasAnyRole("Particulier", "Professionnel", "Partenaire Vip", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/produits/**").hasAnyRole("Particulier", "Professionnel", "Partenaire Vip", "ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/produits/**").hasAnyRole("Particulier", "Professionnel", "Partenaire Vip", "ADMIN")
                        .anyRequest().authenticated())
                .httpBasic(basic -> basic.disable())
                .formLogin(form -> form.disable())
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(customUserDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }
}
