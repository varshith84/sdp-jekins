# Stage 1: Build the app
FROM eclipse-temurin:21-jdk AS builder

WORKDIR /app

# Copy Maven wrapper + config first
COPY mvnw .
COPY .mvn/ .mvn
COPY pom.xml .

# Give execute permission
RUN chmod +x mvnw

# Copy source code
COPY src ./src

# Build the app (skip tests for faster builds)
RUN ./mvnw clean package -DskipTests

# Stage 2: Run the app
FROM eclipse-temurin:21-jdk

WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar

EXPOSE 2000

ENTRYPOINT ["java", "-jar", "app.jar"]
