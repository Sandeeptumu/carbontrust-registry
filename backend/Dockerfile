# ---------- Build stage ----------
FROM eclipse-temurin:17-jdk AS build

WORKDIR /app

# Copy Maven wrapper + POM first for better layer caching
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw

# Best-effort dependency pre-download for layer caching
RUN ./mvnw -B -q dependency:go-offline || true

COPY src/ src/
RUN ./mvnw -B clean package -DskipTests

# ---------- Runtime stage ----------
FROM eclipse-temurin:17-jre AS runtime

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar
COPY certs/aiven-ca.pem /app/certs/aiven-ca.pem
# Public CA certificate only. The truststore contains no private keys or credentials.
RUN keytool -importcert -noprompt -alias carbontrust-aiven \
    -file /app/certs/aiven-ca.pem -keystore /app/aiven-truststore.p12 \
    -storetype PKCS12 -storepass changeit

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
