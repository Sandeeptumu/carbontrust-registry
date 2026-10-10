package com.carbontrust.backend.controller;
import com.carbontrust.backend.dto.*;
import com.carbontrust.backend.service.*;
import com.carbontrust.backend.security.SessionAuthenticationFilter;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
@RestController @RequestMapping("/users")
public class UserController {
 private final UserService users;private final AuthRateLimiter rate;
 @Value("${app.secure-cookies:true}") private boolean secure;
 public UserController(UserService users,AuthRateLimiter rate) {this.users=users;this.rate=rate;}
 public record EmailRequest(@NotBlank @Email @Size(max=254) String email) {}
 public record TokenRequest(@NotBlank @Size(max=128) String token) {}
 public record ResetRequest(@NotBlank @Size(max=128) String token,@NotBlank @Size(min=12,max=64) String password,@NotBlank String passwordConfirmation) {}
 private void limit(HttpServletRequest request,String email) {
  // Do not trust arbitrary forwarded headers. Configure trusted proxies at the edge.
  rate.check("ip:"+request.getRemoteAddr(),40);
  if(email!=null) rate.check("email:"+UserService.normalizeEmail(email),10);
 }
 @GetMapping("/csrf") public Map<String,String> csrf(CsrfToken token) {return Map.of("token",token.getToken(),"headerName",token.getHeaderName());}
 @PostMapping("/register") public Map<String,String> register(@Valid @RequestBody UserRegistrationRequest body,HttpServletRequest request) {
  limit(request,body.getEmail());users.registerUser(body);return Map.of("message","Account created. You can now sign in.");
 }
 @PostMapping("/login") public UserLoginResponse login(@Valid @RequestBody UserLoginRequest body,HttpServletRequest request,HttpServletResponse response) {
  limit(request,body.getEmail());var session=users.loginUser(body);
  response.addHeader(HttpHeaders.SET_COOKIE,cookie(session.getToken(),28800));
  return new UserLoginResponse(session.getUserId(),session.getUsername(),session.getEmail(),session.getRole(),null);
 }
 private String cookie(String value,long seconds) {return ResponseCookie.from(SessionAuthenticationFilter.COOKIE,value).httpOnly(true).secure(secure).sameSite("Lax").path("/").maxAge(seconds).build().toString();}
 @PostMapping("/logout") public Map<String,String> logout(HttpServletRequest request,HttpServletResponse response) {
  users.logout(SessionAuthenticationFilter.cookie(request));response.addHeader(HttpHeaders.SET_COOKIE,cookie("",0));return Map.of("message","Signed out");
 }
 @PostMapping("/forgot-password") public Map<String,String> forgot(@Valid @RequestBody EmailRequest body,HttpServletRequest request) {limit(request,body.email());users.requestLink(body.email(),"RESET");return generic();}
 @PostMapping("/resend-verification") public Map<String,String> resend(@Valid @RequestBody EmailRequest body,HttpServletRequest request) {limit(request,body.email());users.requestLink(body.email(),"VERIFY");return generic();}
 private Map<String,String> generic() {return Map.of("message","If the account is eligible, an email has been sent.");}
 @PostMapping("/verify-email") public Map<String,String> verify(@Valid @RequestBody TokenRequest body,HttpServletRequest request) {limit(request,null);users.consume(body.token(),null,null,false);return Map.of("message","Email verified. You can now sign in if your account is active.");}
 @PostMapping("/reset-password") public Map<String,String> reset(@Valid @RequestBody ResetRequest body,HttpServletRequest request) {limit(request,null);users.consume(body.token(),body.password(),body.passwordConfirmation(),true);return Map.of("message","Password changed. Sign in with your new password.");}
 @GetMapping("/me") public CurrentUserResponse me(Authentication a) {return users.getCurrentUser(a.getName());}
}
