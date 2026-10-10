package com.carbontrust.backend.repository;
import com.carbontrust.backend.entity.AccountAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AccountAuditRepository extends JpaRepository<AccountAudit,Long> {
 List<AccountAudit> findByUserIdOrderByCreatedAtDesc(Long id);
}
