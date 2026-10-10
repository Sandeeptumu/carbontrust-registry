package com.carbontrust.backend.security;
import com.carbontrust.backend.repository.AuthSessionRepository;
import com.carbontrust.backend.service.UserService;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.time.Instant;
import java.util.List;
@Component
public class SessionAuthenticationFilter extends OncePerRequestFilter {
 public static final String COOKIE="CT_SESSION";
 private final AuthSessionRepository sessions;
 public SessionAuthenticationFilter(AuthSessionRepository sessions) {this.sessions=sessions;}
 public static String cookie(HttpServletRequest request) {
  if(request.getCookies()!=null) for(Cookie c:request.getCookies()) if(COOKIE.equals(c.getName())) return c.getValue();
  return null;
 }
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain) throws ServletException,IOException {
  String token=cookie(request);
  if(token!=null && token.length()<128) sessions.findById(Secrets.hash(token))
   .filter(s -> s.getExpiresAt().isAfter(Instant.now()) && UserService.active(s.getUser()))
   .ifPresent(s -> {var u=s.getUser();SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(u.getEmail(),null,List.of(new SimpleGrantedAuthority("ROLE_"+u.getRole()))));});
  chain.doFilter(request,response);
 }
}
