package com.carbontrust.backend.service;
import com.carbontrust.backend.exception.ExternalAuthException;
import com.carbontrust.backend.security.Secrets;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
@Service
public class AuthRateLimiter {
 private final JdbcTemplate jdbc;
 public AuthRateLimiter(JdbcTemplate jdbc) {this.jdbc=jdbc;}
 // Atomic increment shared by every application instance; independent of auth transaction rollback.
 @Transactional(noRollbackFor=ExternalAuthException.class) public void check(String key,int limit) {
  long window=Instant.now().getEpochSecond()/900;
  String bucket=Secrets.hash(key+":"+window);
  jdbc.update("INSERT INTO auth_throttle(bucket,attempts,expires_at) VALUES (?,1,?) ON DUPLICATE KEY UPDATE attempts=attempts+1",bucket,java.sql.Timestamp.from(Instant.ofEpochSecond((window+1)*900)));
  Integer count=jdbc.queryForObject("SELECT attempts FROM auth_throttle WHERE bucket=?",Integer.class,bucket);
  if(count!=null && count>limit) throw new ExternalAuthException(429,"RATE_LIMITED","Too many attempts. Please try again in 15 minutes.");
 }
}
