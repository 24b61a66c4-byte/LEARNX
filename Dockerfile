# ── Build stage ───────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jdk-alpine AS build

WORKDIR /app
COPY pom.xml .
COPY src ./src

# Download dependencies first (improves layer caching)
RUN apk add --no-cache maven && \
    mvn dependency:go-offline -q && \
    mvn package -DskipTests -q

# ── Runtime stage ──────────────────────────────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine AS runtime

WORKDIR /app

RUN addgroup -S learnx && adduser -S learnx -G learnx

COPY --from=build /app/target/learnx-api-*.jar app.jar

USER learnx

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
