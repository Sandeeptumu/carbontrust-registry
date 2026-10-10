package com.carbontrust.backend.config;
import com.carbontrust.backend.security.SessionAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.*;
import org.springframework.web.cors.*;
import java.util.List;
@Configuration
@org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication(type=org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication.Type.SERVLET)
public class SecurityConfig {
 private final SessionAuthenticationFilter sessions;
 @Value("${app.url}") private String origin;
 @Value("${app.secure-cookies:true}") private boolean secure;
 public SecurityConfig(SessionAuthenticationFilter sessions) {this.sessions=sessions;}
 @Bean public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
  CookieCsrfTokenRepository csrf=new CookieCsrfTokenRepository();
  csrf.setCookieCustomizer(c -> c.httpOnly(true).secure(secure).sameSite("Lax").path("/"));
  http.csrf(c -> c.csrfTokenRepository(csrf).csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler()))
   .cors(Customizer.withDefaults()).sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
   .exceptionHandling(e -> e.authenticationEntryPoint((q,r,x) -> r.sendError(401)).accessDeniedHandler((q,r,x) -> r.sendError(403)))
   .authorizeHttpRequests(a -> a.dispatcherTypeMatchers(jakarta.servlet.DispatcherType.ERROR).permitAll().requestMatchers("/users/csrf","/users/register","/users/login","/users/logout","/users/forgot-password","/users/resend-verification","/users/reset-password","/users/verify-email").permitAll()
    .requestMatchers("/admin/**").hasRole("ADMIN").requestMatchers(org.springframework.http.HttpMethod.POST,"/projects/*/carbon-credits").hasRole("ADMIN").requestMatchers(org.springframework.http.HttpMethod.GET,"/projects","/projects/**").hasAnyRole("NGO","ADMIN").requestMatchers("/projects/**","/ngo/**").hasRole("NGO")
    .requestMatchers("/verifier/**").hasRole("VERIFIER").requestMatchers("/buyer/**").hasRole("USER").requestMatchers("/marketplace/**").hasRole("USER")
    .requestMatchers("/users/me","/mrv/**").authenticated().anyRequest().denyAll())
   .addFilterBefore(sessions,UsernamePasswordAuthenticationFilter.class);
  return http.build();
 }
 @Bean public CorsConfigurationSource corsConfigurationSource() {
  CorsConfiguration c=new CorsConfiguration();c.setAllowedOrigins(List.of(origin));c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));c.setAllowedHeaders(List.of("Content-Type","X-XSRF-TOKEN"));c.setAllowCredentials(true);
  UrlBasedCorsConfigurationSource s=new UrlBasedCorsConfigurationSource();s.registerCorsConfiguration("/**",c);return s;
 }
}
