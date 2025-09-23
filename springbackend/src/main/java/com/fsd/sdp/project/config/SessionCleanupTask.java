package com.fsd.sdp.project.config;

import com.fsd.sdp.project.model.Session;
import com.fsd.sdp.project.repository.FileRepository;
import com.fsd.sdp.project.repository.SessionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;

@Component
public class SessionCleanupTask {
    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private FileRepository fileRepository;

    @Scheduled(fixedRate = 60000) // Run every minute
    public void cleanUpExpiredSessions() {
        List<Session> sessions = sessionRepository.findAll();
        Date now = new Date();
        for (Session session : sessions) {
            if (session.getExpiresAt().before(now)) {
                // Delete associated files
                fileRepository.findBySessionId(session.getId()).forEach(fileRepository::delete);
                // Delete session
                sessionRepository.delete(session);
            }
        }
    }
}