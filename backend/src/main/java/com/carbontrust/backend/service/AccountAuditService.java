package com.carbontrust.backend.service;
import com.carbontrust.backend.entity.AccountAudit;
import com.carbontrust.backend.repository.AccountAuditRepository;
import org.springframework.stereotype.Service;
@Service
public class AccountAuditService {
 private final AccountAuditRepository repository;
 public AccountAuditService(AccountAuditRepository repository) { this.repository=repository; }
 public void record(Long id,String actor,String action,String detail) {
  AccountAudit a=new AccountAudit();a.setUserId(id);a.setActorEmail(actor);a.setAction(action);a.setDetail(detail);repository.save(a);
 }
}
