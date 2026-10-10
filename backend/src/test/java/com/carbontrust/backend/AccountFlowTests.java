package com.carbontrust.backend;

import com.carbontrust.backend.entity.*;
import com.carbontrust.backend.repository.*;
import com.carbontrust.backend.service.AccountMailer;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import java.net.*;
import java.net.http.*;
import java.time.Instant;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class AccountFlowTests {
 @LocalServerPort int port;
 @Autowired UserRepository users;
 @Autowired AuthSessionRepository sessions;
 @Autowired EmailTokenRepository tokens;
 @Autowired AccountAuditRepository audits;
 @Autowired org.springframework.jdbc.core.JdbcTemplate jdbc;
 @MockitoBean AccountMailer mailer;
 @Autowired com.carbontrust.backend.service.UserService userService;
 @org.springframework.test.context.bean.override.mockito.MockitoSpyBean org.springframework.security.crypto.password.PasswordEncoder encoder;
 HttpClient client;String csrf;String mailedToken;
 @BeforeEach void setup() throws Exception {
  sessions.deleteAll();tokens.deleteAll();audits.deleteAll();users.deleteAll();jdbc.update("DELETE FROM auth_throttle");
  reset(mailer);doAnswer(i -> {mailedToken=i.getArgument(2);return null;}).when(mailer).sendLink(anyString(),anyString(),anyString());
  client=browser();csrf=getCsrf(client);
 }
 HttpClient browser(){return HttpClient.newBuilder().cookieHandler(new CookieManager(null,CookiePolicy.ACCEPT_ALL)).build();}
 String getCsrf(HttpClient c)throws Exception {return field(call(c,"GET","/users/csrf",null,false).body(),"token");}
 static String field(String json,String key){var m=java.util.regex.Pattern.compile("\""+key+"\":\"([^\"]*)\"").matcher(json);assertTrue(m.find(),json);return m.group(1);}
 HttpResponse<String> call(HttpClient c,String method,String path,String body,boolean token)throws Exception {
  var b=HttpRequest.newBuilder(URI.create("http://localhost:"+port+path)).timeout(java.time.Duration.ofSeconds(15));
  if(body!=null)b.header("Content-Type","application/json");if(token)b.header("X-XSRF-TOKEN",getCsrf(c));
  b.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(body));
  return c.send(b.build(),HttpResponse.BodyHandlers.ofString());
 }
 HttpResponse<String> post(String path,String body)throws Exception{return call(client,"POST",path,body,true);}
 void signup()throws Exception {var r=post("/users/register","{\"username\":\"forest\",\"email\":\"FOREST@example.test\",\"password\":\"LongPassword123!\",\"passwordConfirmation\":\"LongPassword123!\",\"role\":\"ADMIN\"}");assertEquals(200,r.statusCode(),r.body());}
 void verifyEmail()throws Exception {if(mailedToken==null) userService.requestLink("forest@example.test","VERIFY");assertEquals(200,post("/users/verify-email","{\"token\":\""+mailedToken+"\"}").statusCode());}
 HttpResponse<String> login()throws Exception{return post("/users/login","{\"email\":\"forest@example.test\",\"password\":\"LongPassword123!\"}");}
 @Test void fullEmailSessionAndRoleLifecycle()throws Exception {
  signup();User u=users.findByEmail("forest@example.test").orElseThrow();assertEquals("USER",u.getRole());assertFalse(u.getEmailVerified());assertNotEquals("LongPassword123!",u.getPassword());
  assertEquals(200,login().statusCode());verifyNoInteractions(mailer);verifyEmail();String verification=mailedToken;
  assertEquals(400,post("/users/verify-email","{\"token\":\""+verification+"\"}").statusCode());
  var logged=login();assertEquals(200,logged.statusCode(),logged.body());assertTrue(logged.headers().firstValue("set-cookie").orElseThrow().contains("HttpOnly"));assertTrue(logged.body().contains("\"token\":null"));
  assertEquals(200,call(client,"GET","/users/me",null,false).statusCode());assertEquals(403,call(client,"GET","/admin/users",null,false).statusCode());
  u=users.findById(u.getUserId()).orElseThrow();u.setRole("ADMIN");users.save(u); // isolated fixture only
  var accounts=call(client,"GET","/admin/users",null,false);assertEquals(200,accounts.statusCode());assertTrue(accounts.body().contains("forest@example.test"));
  assertEquals(400,call(client,"PUT","/admin/users/"+u.getUserId()+"/status","{\"status\":\"SUSPENDED\"}",true).statusCode());
  u.setRole("NGO");users.save(u);assertEquals(403,call(client,"GET","/admin/users",null,false).statusCode());
  assertEquals(200,post("/users/logout","{}").statusCode());assertEquals(401,call(client,"GET","/users/me",null,false).statusCode());
 }
 @Test void resetIsSingleUseRevokesSessionsAndDoesNotActivateSuspendedAccount()throws Exception {
  signup();verifyEmail();assertEquals(200,login().statusCode());
  assertEquals(200,post("/users/forgot-password","{\"email\":\"forest@example.test\"}").statusCode());String raw=mailedToken;
  String body="{\"token\":\""+raw+"\",\"password\":\"ChangedPassword123!\",\"passwordConfirmation\":\"ChangedPassword123!\"}";
  assertEquals(200,post("/users/reset-password",body).statusCode());assertEquals(401,call(client,"GET","/users/me",null,false).statusCode());
  assertEquals(400,post("/users/reset-password",body).statusCode());assertEquals(401,login().statusCode());
 }
 @Test void csrfValidationDuplicateExpiryAndThrottling()throws Exception {
  assertEquals(403,call(client,"POST","/users/login","{}",false).statusCode());
  assertEquals(400,post("/users/register","{\"username\":\"x\",\"email\":\"invalid\",\"password\":\"short\",\"passwordConfirmation\":\"no\"}").statusCode());
  signup();assertEquals(409,post("/users/register","{\"username\":\"forest2\",\"email\":\"forest@example.test\",\"password\":\"LongPassword123!\",\"passwordConfirmation\":\"LongPassword123!\"}").statusCode());
  userService.requestLink("forest@example.test","VERIFY");var t=tokens.findAll().get(0);t.setExpiresAt(Instant.now().minusSeconds(1));tokens.save(t);
  assertEquals(400,post("/users/verify-email","{\"token\":\""+mailedToken+"\"}").statusCode());
  int code=0;for(int i=0;i<11;i++)code=post("/users/login","{\"email\":\"nobody@example.test\",\"password\":\"InvalidPassword123!\"}").statusCode();assertEquals(429,code);
 }
 @Test void smtpFailureDoesNotBlockSignup()throws Exception {
  doThrow(new org.springframework.mail.MailSendException("unavailable")).when(mailer).sendLink(anyString(),anyString(),anyString());
  var r=post("/users/register","{\"username\":\"forest\",\"email\":\"forest@example.test\",\"password\":\"LongPassword123!\",\"passwordConfirmation\":\"LongPassword123!\"}");
  assertEquals(200,r.statusCode());assertTrue(users.existsByEmail("forest@example.test"));verifyNoInteractions(mailer);assertEquals(200,login().statusCode());assertEquals(200,call(client,"GET","/users/me",null,false).statusCode());assertEquals(403,call(client,"GET","/admin/users",null,false).statusCode());
 }
 @Test void sessionExpiryAndSuspensionRejectDirectRequests()throws Exception {
  signup();verifyEmail();assertEquals(200,login().statusCode());
  var s=sessions.findAll().get(0);s.setExpiresAt(Instant.now().minusSeconds(1));sessions.save(s);
  assertEquals(401,call(client,"GET","/users/me",null,false).statusCode());assertEquals(200,login().statusCode());
  User u=users.findByEmail("forest@example.test").orElseThrow();u.setStatus(false);u.setAccountStatus("SUSPENDED");users.save(u);
  assertEquals(401,call(client,"GET","/users/me",null,false).statusCode());
 }
 @Test void resetRacingWithLoginCannotLeaveAnOldPasswordSession()throws Exception {
  signup();verifyEmail();userService.requestLink("forest@example.test","RESET");String raw=mailedToken;
  var checked=new java.util.concurrent.CountDownLatch(1);var release=new java.util.concurrent.CountDownLatch(1);
  var once=new java.util.concurrent.atomic.AtomicBoolean();
  doAnswer(i -> {
   boolean result=(boolean)i.callRealMethod();
   if(once.compareAndSet(false,true)){checked.countDown();assertTrue(release.await(5,java.util.concurrent.TimeUnit.SECONDS));}
   return result;
  }).when(encoder).matches(anyString(),anyString());
  var pool=java.util.concurrent.Executors.newFixedThreadPool(2);
  try {
   var request=new com.carbontrust.backend.dto.UserLoginRequest();request.setEmail("forest@example.test");request.setPassword("LongPassword123!");
   var login=pool.submit(() -> userService.loginUser(request));assertTrue(checked.await(5,java.util.concurrent.TimeUnit.SECONDS));
   var reset=pool.submit(() -> userService.consume(raw,"ChangedPassword123!","ChangedPassword123!",true));
   try {reset.get(500,java.util.concurrent.TimeUnit.MILLISECONDS);}catch(java.util.concurrent.TimeoutException expected) { /* reset waits for locked login */ }
   release.countDown();login.get(10,java.util.concurrent.TimeUnit.SECONDS);reset.get(10,java.util.concurrent.TimeUnit.SECONDS);
   assertEquals(0,sessions.count(),"Reset must revoke a login that validated the old password concurrently");
  } finally {release.countDown();pool.shutdownNow();}
 }
 @Test void adminAssignsAllRolesAndEmailChangeRequiresNewInbox()throws Exception {
  signup();verifyEmail();User admin=users.findByEmail("forest@example.test").orElseThrow();admin.setRole("ADMIN");users.save(admin);assertEquals(200,login().statusCode());
  User target=new User();target.setUsername("target");target.setEmail("target@example.test");target.setRole("USER");target.setStatus(true);target.setAccountStatus("ACTIVE");target.setEmailVerified(true);users.save(target);
  String previous="USER";
  for(String role:new String[]{"NGO","VERIFIER","HEALTHCARE_ASSISTANT","ADMIN","USER"}) {
   var r=call(client,"PUT","/admin/users/"+target.getUserId()+"/role","{\"role\":\""+role+"\",\"expectedRole\":\""+previous+"\"}",true);
   assertEquals(200,r.statusCode(),r.body());assertEquals(role,users.findById(target.getUserId()).orElseThrow().getRole());previous=role;
  }
  var r=call(client,"PUT","/admin/users/"+target.getUserId()+"/email","{\"email\":\"new@example.test\"}",true);assertEquals(200,r.statusCode(),r.body());
  assertEquals("target@example.test",users.findById(target.getUserId()).orElseThrow().getEmail());verifyEmail();
  assertEquals("new@example.test",users.findById(target.getUserId()).orElseThrow().getEmail());assertTrue(audits.findByUserIdOrderByCreatedAtDesc(target.getUserId()).size()>=7);
 }

}
