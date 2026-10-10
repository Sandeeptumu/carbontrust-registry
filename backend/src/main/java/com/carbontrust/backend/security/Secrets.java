package com.carbontrust.backend.security;
import java.security.*;
import java.util.*;
import java.nio.charset.StandardCharsets;
public final class Secrets {
 private static final SecureRandom RANDOM = new SecureRandom();
 private Secrets() {}
 public static String token() { byte[] bytes=new byte[32]; RANDOM.nextBytes(bytes); return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes); }
 public static String hash(String value) {
  try { return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8))); }
  catch(NoSuchAlgorithmException e) { throw new IllegalStateException(e); }
 }
}
