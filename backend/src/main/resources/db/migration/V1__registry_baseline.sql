
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` bigint NOT NULL AUTO_INCREMENT,
  `address` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `last_name` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `phone_number` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `status` bit(1) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `project_id` bigint NOT NULL AUTO_INCREMENT,
  `area` double DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `description` varchar(2000) DEFAULT NULL,
  `ecosystem_type` varchar(255) DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `project_name` varchar(255) DEFAULT NULL,
  `project_status` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `updated_at` datetime(6) NOT NULL,
  `user_id` bigint NOT NULL,
  PRIMARY KEY (`project_id`),
  KEY `FKhswfwa3ga88vxv1pmboss6jhm` (`user_id`),
  CONSTRAINT `FKhswfwa3ga88vxv1pmboss6jhm` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mrv_submissions` (
  `mrv_id` bigint NOT NULL AUTO_INCREMENT,
  `mrv_status` varchar(255) DEFAULT NULL,
  `photo_verification` bit(1) DEFAULT NULL,
  `remarks` varchar(2000) DEFAULT NULL,
  `upload_date` datetime(6) NOT NULL,
  `project_id` bigint NOT NULL,
  `evidence_image` longblob,
  PRIMARY KEY (`mrv_id`),
  KEY `FKrddy0q31ic7w7snlojbetc0j9` (`project_id`),
  CONSTRAINT `FKrddy0q31ic7w7snlojbetc0j9` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `verifications` (
  `verification_id` bigint NOT NULL AUTO_INCREMENT,
  `comments` varchar(2000) DEFAULT NULL,
  `verification_date` datetime(6) NOT NULL,
  `verification_status` varchar(255) DEFAULT NULL,
  `mrv_id` bigint NOT NULL,
  `verifier_id` bigint NOT NULL,
  PRIMARY KEY (`verification_id`),
  KEY `FKia0g3xdsgbajqnwr81kbm0w7l` (`mrv_id`),
  KEY `FK2kgx7ekn0ao2oat8w68min8bf` (`verifier_id`),
  CONSTRAINT `FK2kgx7ekn0ao2oat8w68min8bf` FOREIGN KEY (`verifier_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `FKia0g3xdsgbajqnwr81kbm0w7l` FOREIGN KEY (`mrv_id`) REFERENCES `mrv_submissions` (`mrv_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carbon_credit_batches` (
  `ccb_id` bigint NOT NULL AUTO_INCREMENT,
  `available_quantity` double DEFAULT NULL,
  `issued_date` datetime(6) NOT NULL,
  `original_quantity` double DEFAULT NULL,
  `status` varchar(255) DEFAULT NULL,
  `project_id` bigint NOT NULL,
  `price_per_credit` double DEFAULT NULL,
  PRIMARY KEY (`ccb_id`),
  KEY `FKlktdu85e1bqo5h5hsggruggc2` (`project_id`),
  CONSTRAINT `FKlktdu85e1bqo5h5hsggruggc2` FOREIGN KEY (`project_id`) REFERENCES `projects` (`project_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchases` (
  `purchase_id` bigint NOT NULL AUTO_INCREMENT,
  `payment_method` varchar(255) DEFAULT NULL,
  `payment_status` varchar(255) DEFAULT NULL,
  `price` double DEFAULT NULL,
  `purchase_date` datetime(6) NOT NULL,
  `quantity` double DEFAULT NULL,
  `buyer_id` bigint NOT NULL,
  `ccb_id` bigint NOT NULL,
  PRIMARY KEY (`purchase_id`),
  KEY `FKpbgddohncjt0ijwi5pgdjng5u` (`buyer_id`),
  KEY `FKlh7amjy5nimd39qx6474vm0u3` (`ccb_id`),
  CONSTRAINT `FKlh7amjy5nimd39qx6474vm0u3` FOREIGN KEY (`ccb_id`) REFERENCES `carbon_credit_batches` (`ccb_id`),
  CONSTRAINT `FKpbgddohncjt0ijwi5pgdjng5u` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `carbon_credit_retirements` (
  `retirement_id` bigint NOT NULL AUTO_INCREMENT,
  `quantity` double DEFAULT NULL,
  `reason` varchar(2000) DEFAULT NULL,
  `retirement_date` datetime(6) NOT NULL,
  `purchase_id` bigint NOT NULL,
  PRIMARY KEY (`retirement_id`),
  KEY `FK9tgvs6dnwh3gttv45625ttp7j` (`purchase_id`),
  CONSTRAINT `FK9tgvs6dnwh3gttv45625ttp7j` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`purchase_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

