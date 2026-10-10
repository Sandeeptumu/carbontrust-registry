# ---------- Build stage ----------
FROM maven:3.9.16-eclipse-temurin-17 AS build

WORKDIR /app

# Use the image's Maven installation so cloud builds do not bootstrap Maven.
COPY pom.xml ./

# Best-effort dependency pre-download for layer caching
RUN mvn -B -q dependency:go-offline || true

COPY src/ src/
RUN mvn -B clean package -DskipTests

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
