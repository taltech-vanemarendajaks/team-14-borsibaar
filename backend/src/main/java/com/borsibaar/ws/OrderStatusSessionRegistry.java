package com.borsibaar.ws;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.WebSocketSession;

import java.util.Collections;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Slf4j
@Service
public class OrderStatusSessionRegistry {

    private final Map<String, Set<WebSocketSession>> sessions =
            new ConcurrentHashMap<>();

    public void register(String sessionId, WebSocketSession session) {
        sessions
                .computeIfAbsent(sessionId, k -> new CopyOnWriteArraySet<>())
                .add(session);
        log.debug("Registered session {} for table {}", session.getId(), sessionId);
    }

    public void deregister(String sessionId, WebSocketSession session) {
        Set<WebSocketSession> set = sessions.get(sessionId);
        if (set != null) {
            set.remove(session);
            if (set.isEmpty()) sessions.remove(sessionId);
        }
        log.debug("Deregistered session {} for table {}", session.getId(), sessionId);
    }

    public Set<WebSocketSession> getSessions(String sessionId) {
        Set<WebSocketSession> set = sessions.get(sessionId);
        return set != null ? Set.copyOf(set) : Collections.emptySet();
    }

}