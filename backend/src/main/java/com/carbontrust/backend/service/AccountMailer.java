package com.carbontrust.backend.service;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
@Service
public class AccountMailer {
 private final JavaMailSender sender;
 private final String baseUrl, from;
 public AccountMailer(JavaMailSender sender,@Value("${app.url}") String baseUrl,@Value("${app.mail-from}") String from) {
  this.sender=sender;this.baseUrl=baseUrl.replaceAll("/+$", "");this.from=from;
 }
 public void sendLink(String email,String purpose,String token) {
  String route="RESET".equals(purpose)?"reset-password":"verify-email";
  SimpleMailMessage message=new SimpleMailMessage();message.setFrom(from);message.setTo(email);
  message.setSubject("CarbonTrust: "+("RESET".equals(purpose)?"reset your password":"verify your email"));
  message.setText("Open this link to complete your request:\n"+baseUrl+"/"+route+"?token="+token+"\nThis link expires in 30 minutes and can be used once. If you did not request it, ignore this email.");
  sender.send(message);
 }
}
