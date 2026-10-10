package com.carbontrust.backend.service;
import com.carbontrust.backend.dto.*;
import com.carbontrust.backend.entity.*;
import com.carbontrust.backend.repository.*;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import java.util.*;
class RetirementTests {
 @Test void mappedUserCanReadOwnHistory() {
  var ur=mock(UserRepository.class); var rr=mock(CarbonCreditRetirementRepository.class); var pr=mock(PurchaseRepository.class);
  var u=new User();u.setUserId(1L);u.setRole("USER");u.setStatus(true);when(ur.findByEmail("u@test.invalid")).thenReturn(Optional.of(u));
  assertEquals(List.of(),new RetirementService(rr,pr,ur).getBuyerRetirements("u@test.invalid"));
 }
 @Test void rejectsForeignPurchaseAndNonpositiveQuantity() {
  var ur=mock(UserRepository.class); var rr=mock(CarbonCreditRetirementRepository.class); var pr=mock(PurchaseRepository.class);
  var u=new User();u.setUserId(1L);u.setRole("USER");u.setStatus(true);when(ur.findByEmail("u@test.invalid")).thenReturn(Optional.of(u));
  var other=new User();other.setUserId(2L);var p=new Purchase();p.setBuyer(other);p.setQuantity(100.0);p.setPaymentStatus("COMPLETED");when(pr.findLockedById(3L)).thenReturn(Optional.of(p));
  var r=new RetirementRequest();r.setQuantity(1.0);r.setReason("Retirement");
  var service=new RetirementService(rr,pr,ur);
  assertThrows(RuntimeException.class,()->service.retireCredits(3L,r,"u@test.invalid"));
  p.setBuyer(u);r.setQuantity(-1.0);
  assertThrows(RuntimeException.class,()->service.retireCredits(3L,r,"u@test.invalid"));
  verify(rr,never()).save(any());
 }
 @Test void retiresOwnedCompletedBalanceAndRejectsOverdraw() {
  var ur=mock(UserRepository.class); var rr=mock(CarbonCreditRetirementRepository.class); var pr=mock(PurchaseRepository.class);
  var u=new User();u.setUserId(1L);u.setRole("USER");u.setStatus(true);when(ur.findByEmail("u@test.invalid")).thenReturn(Optional.of(u));
  var p=new Purchase();p.setBuyer(u);p.setQuantity(10.0);p.setPaymentStatus("COMPLETED");when(pr.findLockedById(3L)).thenReturn(Optional.of(p));
  var old=new CarbonCreditRetirement();old.setQuantity(7.0);when(rr.findByPurchasePurchaseId(3L)).thenReturn(List.of(old));when(rr.save(any())).thenAnswer(i->i.getArgument(0));
  var r=new RetirementRequest();r.setQuantity(4.0);r.setReason("Retirement");var service=new RetirementService(rr,pr,ur);
  assertThrows(RuntimeException.class,()->service.retireCredits(3L,r,"u@test.invalid"));
  r.setQuantity(3.0);assertEquals(3.0,service.retireCredits(3L,r,"u@test.invalid").getQuantity());
 }
}
