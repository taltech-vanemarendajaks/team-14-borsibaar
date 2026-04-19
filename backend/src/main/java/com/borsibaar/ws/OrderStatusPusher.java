package com.borsibaar.ws;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.io.IOException;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderStatusPusher {

    private final OrderStatusSessionRegistry registry;
    private final ObjectMapper objectMapper;

    public void push(String sessionId, Long orderId, String status) {
        Set<WebSocketSession> targets = registry.getSessions(sessionId);

        if (targets.isEmpty()) {
            log.debug("No WS sessions for table {}, skipping push", sessionId);
            return;
        }

        String payload;
        try {
            payload = objectMapper.writeValueAsString(new OrderStatusMessage(sessionId, orderId, status));
        } catch (Exception e) {
            log.error("Failed to serialize status update for table {}", sessionId, e);
            return;
        }

        TextMessage message = new TextMessage(payload);

        for (WebSocketSession session : targets) {
            if (!session.isOpen()) continue;
            try {
                synchronized (session) {
                    session.sendMessage(message);
                }
                log.debug("Pushed status={} to session={} table={}", status, session.getId(), sessionId);
            } catch (IOException e) {
                log.warn("Failed to send to session={} table={}", session.getId(), sessionId, e);
            }
        }
    }

    public record OrderStatusMessage(String sessionId, Long orderId, String status) {}
}