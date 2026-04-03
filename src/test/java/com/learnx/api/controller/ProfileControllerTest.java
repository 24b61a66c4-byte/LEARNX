package com.learnx.api.controller;

import com.learnx.api.security.AuthContextService;
import com.learnx.api.service.AuditService;
import com.learnx.persistence.entity.LearnerProfileEntity;
import com.learnx.persistence.service.LearnerProfileService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProfileControllerTest {

    @Mock
    private LearnerProfileService profileService;

    @Mock
    private AuthContextService authContextService;

    @Mock
    private AuditService auditService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ProfileController controller;

    @Test
    void saveProfilePersistsPreferredTopicIds() {
        UUID userId = UUID.randomUUID();
        LearnerProfileEntity request = new LearnerProfileEntity();
        request.setDisplayName("Riley");
        request.setPreferredTopicIds(new String[] { "dbms-joins", "dbms-normalization" });
        request.setStudyGoal("understand-concepts");

        LearnerProfileEntity saved = new LearnerProfileEntity();
        saved.setId(11L);
        saved.setUserId(userId);
        saved.setDisplayName("Riley");
        saved.setPreferredTopicIds(new String[] { "dbms-joins", "dbms-normalization" });
        saved.setStudyGoal("understand-concepts");

        when(authContextService.requireAuthenticatedUser(authentication)).thenReturn(userId);
        when(profileService.saveProfile(any(LearnerProfileEntity.class))).thenReturn(saved);

        ResponseEntity<?> response = controller.saveProfile(request, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        LearnerProfileEntity body = (LearnerProfileEntity) response.getBody();
        assertNotNull(body);
        assertArrayEquals(new String[] { "dbms-joins", "dbms-normalization" }, body.getPreferredTopicIds());

        ArgumentCaptor<LearnerProfileEntity> captor = ArgumentCaptor.forClass(LearnerProfileEntity.class);
        verify(profileService).saveProfile(captor.capture());
        assertEquals(userId, captor.getValue().getUserId());
        assertArrayEquals(new String[] { "dbms-joins", "dbms-normalization" },
                captor.getValue().getPreferredTopicIds());
    }

    @Test
    void getProfileReturnsPreferredTopicIds() {
        UUID userId = UUID.randomUUID();
        LearnerProfileEntity profile = new LearnerProfileEntity();
        profile.setId(12L);
        profile.setUserId(userId);
        profile.setDisplayName("Alex");
        profile.setPreferredTopicIds(new String[] { "edc-diode-basics" });
        profile.setStudyGoal("prepare-exams");

        when(authContextService.requireAuthenticatedUser(authentication)).thenReturn(userId);
        when(authContextService.parseAndRequireMatch(userId, userId.toString())).thenReturn(userId);
        when(profileService.getProfileByUserId(userId)).thenReturn(Optional.of(profile));

        ResponseEntity<?> response = controller.getProfile(userId.toString(), authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        LearnerProfileEntity body = (LearnerProfileEntity) response.getBody();
        assertNotNull(body);
        assertArrayEquals(new String[] { "edc-diode-basics" }, body.getPreferredTopicIds());
    }
}
