package com.borsibaar.ws;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.util.Arrays;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderStatusWebSocketHandler extends TextWebSocketHandler {

    private final OrderStatusSessionRegistry registry;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        String sessionId = extractQueryParam(session.getUri(), "token");

        if (sessionId == null) {
            log.warn("WS connection with missing/invalid token, closing: {}", session.getId());
            try {
                session.close();
            } catch (Exception ex) {
                log.error("Failed to close websocket session", ex);
            }
            return;
        }

        registry.register(sessionId, session);
        log.info("WS connected – token={} session={}", sessionId, session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        String sessionId = extractQueryParam(session.getUri(), "token");
        if (sessionId != null) {
            registry.deregister(sessionId, session);
        }
        log.info("WS disconnected – token={} session={} status={}", sessionId, session.getId(), status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable ex) {
        log.error("WS transport error – session={}", session.getId(), ex);
    }

    private String extractQueryParam(URI uri, String param) {
        if (uri == null || uri.getQuery() == null) return null;
        return Arrays.stream(uri.getQuery().split("&"))
                .map(p -> p.split("=", 2))
                .filter(p -> p.length == 2 && p[0].equals(param))
                .map(p -> p[1])
                .findFirst()
                .orElse(null);
    }
}