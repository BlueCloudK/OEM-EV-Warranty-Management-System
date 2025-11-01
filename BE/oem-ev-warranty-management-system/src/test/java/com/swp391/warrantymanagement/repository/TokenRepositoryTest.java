package com.swp391.warrantymanagement.repository;

import com.swp391.warrantymanagement.entity.Role;
import com.swp391.warrantymanagement.entity.Token;
import com.swp391.warrantymanagement.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@DisplayName("TokenRepository Integration Tests")
class TokenRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TokenRepository tokenRepository;

    private User user1;

    @BeforeEach
    void setUp() {
        Role userRole = new Role();
        userRole.setRoleName("USER");
        entityManager.persist(userRole);

        user1 = new User();
        user1.setUsername("testuser1");
        user1.setEmail("test1@example.com");
        user1.setPassword("password");
        user1.setRole(userRole);
        // Removed user1.setCreatedAt(LocalDateTime.now());
        // Removed user1.setUpdatedAt(LocalDateTime.now());
        entityManager.persist(user1);

        Token refreshToken = new Token();
        refreshToken.setToken("refresh123");
        refreshToken.setTokenType("REFRESH");
        refreshToken.setUser(user1);
        refreshToken.setExpirationDate(LocalDateTime.now().plusDays(7));
        entityManager.persist(refreshToken);

        Token resetToken = new Token();
        resetToken.setToken("reset456");
        resetToken.setTokenType("RESET");
        resetToken.setUser(user1);
        resetToken.setExpirationDate(LocalDateTime.now().plusMinutes(15));
        entityManager.persist(resetToken);

        entityManager.flush();
    }

    @Test
    @DisplayName("Find by token should return the correct token")
    void findByToken_ShouldReturnCorrectToken() {
        // Act
        Optional<Token> foundToken = tokenRepository.findByToken("refresh123");

        // Assert
        assertThat(foundToken).isPresent();
        assertThat(foundToken.get().getToken()).isEqualTo("refresh123");
        assertThat(foundToken.get().getUser()).isEqualTo(user1);
    }

    @Test
    @DisplayName("Find by token and type should return the correct token")
    void findByTokenAndTokenType_ShouldReturnCorrectToken() {
        // Act
        Optional<Token> foundToken = tokenRepository.findByTokenAndTokenType("reset456", "RESET");

        // Assert
        assertThat(foundToken).isPresent();
        assertThat(foundToken.get().getTokenType()).isEqualTo("RESET");
    }

    @Test
    @DisplayName("Delete by user and type should remove only the specified token type")
    void deleteByUserAndTokenType_ShouldRemoveCorrectTokens() {
        // Act
        tokenRepository.deleteByUserAndTokenType(user1, "RESET");
        entityManager.flush(); // Ensure delete is executed

        // Assert
        long count = tokenRepository.count();
        assertThat(tokenRepository.findByToken("reset456")).isNotPresent();
        assertThat(tokenRepository.findByToken("refresh123")).isPresent();
    }

    @Test
    @DisplayName("Delete by user should remove all tokens for that user")
    void deleteByUser_ShouldRemoveAllUserTokens() {
        // Act
        tokenRepository.deleteByUser(user1);
        entityManager.flush();

        // Assert
        long count = tokenRepository.count();
        assertThat(count).isZero();
    }
}
