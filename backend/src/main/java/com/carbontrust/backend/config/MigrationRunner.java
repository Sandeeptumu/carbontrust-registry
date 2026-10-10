package com.carbontrust.backend.config;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.*;
@Configuration @Profile("migrate")
public class MigrationRunner {
 @Bean ApplicationRunner finishMigration(ConfigurableApplicationContext context) {
  return args -> context.close();
 }
}
