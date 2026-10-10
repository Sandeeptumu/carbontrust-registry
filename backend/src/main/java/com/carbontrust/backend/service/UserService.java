package com.carbontrust.backend.service;

import com.carbontrust.backend.dto.*;
import com.carbontrust.backend.entity.*;
import com.carbontrust.backend.exception.*;
import com.carbontrust.backend.repository.*;
import com.carbontrust.backend.security.Secrets;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Locale;

@Service
public class UserService {
 private final UserRepository users;
 private final PasswordEncoder encoder;
 private final AuthSessionRepository sessions;
 private final EmailTokenRepository tokens;
 private final AccountMailer mailer;
 private final AccountAuditService audit;
 private final String dummyHash;
 public UserService(UserRepository users,PasswordEncoder encoder,AuthSessionRepository sessions,
                    EmailTokenRepository tokens,AccountMailer mailer,AccountAuditService audit) {
  this.users=users;this.encoder=encoder;this.sessions=sessions;this.tokens=tokens;this.mailer=mailer;this.audit=audit;
  this.dummyHash=encoder.encode(Secrets.token());
 }
 public static String normalizeEmail(String email) { return email.trim().toLowerCase(Locale.ROOT); }
 public static boolean active(User u) {
  return Boolean.TRUE.equals(u.getStatus()) && Boolean.TRUE.equals(u.getEmailVerified())
    && ("ACTIVE".equals(u.getAccountStatus()) || "APPROVED".equals(u.getAccountStatus()));
 }
 @Transactional public User registerUser(UserRegistrationRequest request) {
  validatePassword(request.getPassword(),request.getPasswordConfirmation());
  String email=normalizeEmail(request.getEmail());
  if(users.existsByEmail(email)) throw new DuplicateResourceException("Email already registered. Sign in or reset your password.");
  if(users.existsByUsername(request.getUsername())) throw new DuplicateResourceException("Username already taken");
  User u=new User();u.setUsername(request.getUsername());u.setEmail(email);u.setPassword(encoder.encode(request.getPassword()));
  u.setRole("USER");u.setStatus(false);u.setAccountStatus("PENDING");u.setEmailVerified(false);
  users.saveAndFlush(u);
  issueLink(u,"VERIFY",email);
  audit.record(u.getUserId(),email,"REGISTER","Account registered with User role");
  return u;
 }
 public void validatePassword(String password,String confirmation) {
  if(password==null || password.length()<12 || password.length()>64 || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length>72)
   throw new BusinessException("Password must contain 12–64 characters and at most 72 UTF-8 bytes");
  if(!password.equals(confirmation)) throw new BusinessException("Passwords do not match");
 }
 @Transactional public UserLoginResponse loginUser(UserLoginRequest request) {
  User u=users.findByEmailForUpdate(normalizeEmail(request.getEmail())).orElse(null);
  boolean valid=encoder.matches(request.getPassword(),u==null || u.getPassword()==null ? dummyHash:u.getPassword());
  if(u==null || !valid) throw new ExternalAuthException(401,"INVALID_CREDENTIALS","Invalid email or password");

  if(!active(u)) throw new ExternalAuthException(403,"ACCOUNT_UNAVAILABLE","Verify your email or contact an administrator about your account status.");
  String raw=Secrets.token();AuthSession s=new AuthSession();s.setTokenHash(Secrets.hash(raw));s.setUser(u);s.setExpiresAt(Instant.now().plus(8,ChronoUnit.HOURS));sessions.save(s);
  return new UserLoginResponse(u.getUserId(),u.getUsername(),u.getEmail(),u.getRole(),raw);
 }
 @Transactional public void logout(String raw) { if(raw!=null) sessions.deleteById(Secrets.hash(raw)); }
 @Transactional public void requestLink(String email,String purpose) {
  users.findByEmailForUpdate(normalizeEmail(email)).ifPresent(u -> {
   if("VERIFY".equals(purpose) && Boolean.TRUE.equals(u.getEmailVerified())) return;
   issueLink(u,purpose,u.getEmail());
  });
 }
 public void issueLink(User user,String purpose,String targetEmail) {
  tokens.deleteByUserUserIdAndPurpose(user.getUserId(),purpose);
  String raw=Secrets.token();EmailToken token=new EmailToken();token.setTokenHash(Secrets.hash(raw));token.setUser(user);
  token.setPurpose(purpose);token.setTargetEmail(targetEmail);token.setExpiresAt(Instant.now().plus(30,ChronoUnit.MINUTES));tokens.save(token);
  mailer.sendLink(targetEmail,purpose,raw);
 }
 @Transactional public void consume(String raw,String password,String confirmation,boolean reset) {
  if(raw==null || raw.length()>128) throw new BusinessException("Invalid or expired link");
  // Account lock comes before token lock everywhere to avoid reset/admin deadlocks.
  Long userId=tokens.findUserIdByHash(Secrets.hash(raw)).orElseThrow(() -> new BusinessException("Invalid or expired link"));
  User u=users.findByIdForUpdate(userId).orElseThrow();
  EmailToken token=tokens.lockByHash(Secrets.hash(raw)).orElseThrow(() -> new BusinessException("Invalid or expired link"));
  if(token.getUsedAt()!=null || !token.getExpiresAt().isAfter(Instant.now()) || reset != "RESET".equals(token.getPurpose()))
   throw new BusinessException("Invalid or expired link");
  if(!"EMAIL_CHANGE".equals(token.getPurpose()) && !u.getEmail().equals(token.getTargetEmail()))
   throw new BusinessException("Invalid or expired link");
  if(reset) { validatePassword(password,confirmation);u.setPassword(encoder.encode(password)); }
  else {
   if(!u.getEmail().equals(token.getTargetEmail()) && users.existsByEmail(token.getTargetEmail())) throw new DuplicateResourceException("Email is already registered");
   u.setEmail(token.getTargetEmail());u.setEmailVerified(true);
   if("PENDING".equals(u.getAccountStatus())) { u.setAccountStatus("ACTIVE");u.setStatus(true); }
  }
  tokens.deleteByUserUserId(u.getUserId());users.save(u);sessions.deleteByUserUserId(u.getUserId());
  audit.record(u.getUserId(),u.getEmail(),reset?"PASSWORD_RESET":"EMAIL_VERIFIED",reset?"Password reset; all sessions revoked":"Email verified; all sessions revoked");
 }
 public CurrentUserResponse getCurrentUser(String email) {
  User u=users.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
  return new CurrentUserResponse(u.getUserId(),u.getUsername(),u.getEmail(),u.getRole());
 }
}
