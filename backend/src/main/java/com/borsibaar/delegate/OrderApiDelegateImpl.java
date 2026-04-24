package com.borsibaar.delegate;

import com.borsibaar.api.OrderApi;
import com.borsibaar.dto.CreateOrderRequestDto;
import com.borsibaar.dto.OrderResponseDto;
import com.borsibaar.dto.UpdateOrderRequestDto;
import com.borsibaar.service.OrderService;
import jakarta.servlet.http.Cookie;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@ControllerAdvice
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class OrderApiDelegateImpl extends AbstractApiDelegateImpl implements OrderApi {

    private final OrderService orderService;

    @Override
    public ResponseEntity<OrderResponseDto> createOrder(CreateOrderRequestDto createOrderRequestDto) {
        OrderResponseDto orderResponseDto = orderService.create(createOrderRequestDto);

        String sessionId = orderResponseDto.getSessionId();
        if (sessionId == null) {
            throw new IllegalStateException("Missing session Id");
        }

        String cookieValue = sessionId + "|" + System.currentTimeMillis();
        Cookie cookie = new Cookie("session_" + sessionId, cookieValue);
        cookie.setSecure(true);
        cookie.setHttpOnly(true);
        cookie.setAttribute("SameSite", "Strict");
        cookie.setPath("/");
        cookie.setMaxAge(24 * 60 * 60); // 1 day
        response.addCookie(cookie);

        return ResponseEntity.status(HttpStatus.CREATED).body(orderResponseDto);
    }

    @Override
    public ResponseEntity<Void> deleteOrder(Long id) {
        orderService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAll());
    }

    @Override
    public ResponseEntity<OrderResponseDto> getOrderById(Long id) {
        return ResponseEntity.ok(orderService.getById(id));
    }

    @Override
    public ResponseEntity<OrderResponseDto> updateOrder(Long id, UpdateOrderRequestDto updateOrderRequestDto) {
        return ResponseEntity.ok(orderService.update(id, updateOrderRequestDto));
    }
}
