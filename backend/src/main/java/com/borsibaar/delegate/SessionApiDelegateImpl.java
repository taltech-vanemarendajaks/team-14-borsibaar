package com.borsibaar.delegate;

import com.borsibaar.api.SessionApi;
import com.borsibaar.dto.OrderSessionDto;
import jakarta.servlet.http.Cookie;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@ControllerAdvice
@RestController
@RequestMapping("/api")
public class SessionApiDelegateImpl extends AbstractApiDelegateImpl implements SessionApi {

    @Override
    public ResponseEntity<List<OrderSessionDto>> getSessions() {
        List<OrderSessionDto> sessions = new ArrayList<>();

        for (Cookie cookie : request.getCookies()) {
            if (cookie.getName().startsWith("session_")) {
                OrderSessionDto session = new OrderSessionDto();
                String[] valueParts = cookie.getValue().split("\\|");

                if (valueParts.length != 2) {
                    throw new IllegalStateException("Invalid order session cookie. Does not have 2 value parts");
                }

                session.setSessionId(valueParts[0]);
                try {
                    session.createdTime(Long.parseLong(valueParts[1]));
                } catch (NumberFormatException ex) {
                    throw new IllegalStateException("Invalid order session cookie. Created time is not a valid long", ex);
                }
                sessions.add(session);
            }
        }

        return ResponseEntity.ok(sessions);
    }
}
