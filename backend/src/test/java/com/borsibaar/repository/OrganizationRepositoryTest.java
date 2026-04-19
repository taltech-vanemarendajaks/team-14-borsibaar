package com.borsibaar.repository;

import com.borsibaar.entity.Organization;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DataJpaTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.liquibase.enabled=false"
})
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class OrganizationRepositoryTest {

    @Autowired
    private OrganizationRepository organizationRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void savesAndLoadsAuthEmailsViaElementCollection() {
        Organization organization = new Organization();
        organization.setName("Test Org");
        organization.setCreatedAt(Instant.now());
        organization.setUpdatedAt(Instant.now());
        organization.setPriceIncreaseStep(BigDecimal.valueOf(0.5));
        organization.setPriceDecreaseStep(BigDecimal.valueOf(0.5));
        organization.setAuthEmails(List.of("one@test.com", "two@test.com"));

        Organization saved = organizationRepository.saveAndFlush(organization);

        entityManager.clear();

        Organization loaded = organizationRepository.findById(saved.getId()).orElseThrow();

        assertEquals("Test Org", loaded.getName());
        assertEquals(2, loaded.getAuthEmails().size());
        assertTrue(loaded.getAuthEmails().contains("one@test.com"));
        assertTrue(loaded.getAuthEmails().contains("two@test.com"));
    }
}