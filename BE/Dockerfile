# Stage 1: build Maven
FROM maven:3.9.11-eclipse-temurin-21 AS build
WORKDIR /app
COPY oem-ev-warranty-management-system/pom.xml .
COPY oem-ev-warranty-management-system/src ./src
RUN mvn clean package -DskipTests

# Stage 2: runtime JDK 21
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]
