package com.borsibaar.service;

import com.borsibaar.dto.CreateOrderRequestDto;
import com.borsibaar.dto.OrderProductRequestDto;
import com.borsibaar.dto.OrderProductResponseDto;
import com.borsibaar.dto.OrderResponseDto;
import com.borsibaar.dto.OrderStateDto;
import com.borsibaar.dto.UpdateOrderRequestDto;
import com.borsibaar.entity.Order;
import com.borsibaar.entity.OrderProduct;
import com.borsibaar.entity.Product;
import com.borsibaar.entity.User;
import com.borsibaar.repository.OrderProductRepository;
import com.borsibaar.repository.OrderRepository;
import com.borsibaar.repository.ProductRepository;
import com.borsibaar.repository.UserRepository;
import com.borsibaar.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderProductRepository orderProductRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAll() {
        return orderRepository.findAll().stream()
                .sorted(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponseDto getById(Long id) {
        return toDto(getOrder(id));
    }

    @Transactional
    public OrderResponseDto create(CreateOrderRequestDto request) {
        Order order = new Order();
        applyRequest(order, request.getDesk(), request.getClientName(), unwrapNullable(request.getUserId()), request.getSessionId(),
                request.getState(), request.getTotal(), null, true);

        Order saved = orderRepository.save(order);
        replaceProducts(saved.getId(), request.getProducts());
        return toDto(getOrder(saved.getId()));
    }

    @Transactional
    public OrderResponseDto update(Long id, UpdateOrderRequestDto request) {
        Order order = getOrder(id);
        applyRequest(order, request.getDesk(), request.getClientName(), unwrapNullable(request.getUserId()), request.getSessionId(),
                request.getState(), request.getTotal(), request.getAssignedWorkerId(), false);
        orderRepository.save(order);

        if (request.getProducts() != null && !request.getProducts().isEmpty()) {
            replaceProducts(order.getId(), request.getProducts());
        }

        return toDto(getOrder(order.getId()));
    }

    @Transactional
    public void delete(Long id) {
        Order order = getOrder(id);
        orderRepository.delete(order);
    }

    private Order getOrder(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found: " + id));
    }

    private void applyRequest(
            Order order,
            String desk,
            String clientName,
            UUID userId,
            String sessionId,
            OrderStateDto state,
            Double total,
            UUID assignedWorkerId,
            boolean creating
    ) {
        if (desk != null || creating) {
            order.setDesk(requireNonBlank(desk, "desk"));
        }
        if (clientName != null || creating) {
            order.setClientName(requireNonBlank(clientName, "clientName"));
        }
        if (userId != null || creating) {
            order.setUserId(userId);
        }
        if (sessionId != null || creating) {
            order.setSessionId(requireNonBlank(sessionId, "sessionId"));
        }
        if (state != null || creating) {
            order.setState(mapState(state));
        }
        if (total != null || creating) {
            if (total == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "total is required");
            }
            order.setTotal(BigDecimal.valueOf(total));
        }

        UUID resolvedAssignedWorkerId = assignedWorkerId;
        if (state == OrderStateDto.IN_MAKING) {
            User currentUser = SecurityUtils.getCurrentUser(false);
            resolvedAssignedWorkerId = currentUser.getId();
        }
        if (resolvedAssignedWorkerId != null) {
            UUID workerId = resolvedAssignedWorkerId;
            User assignedWorker = userRepository.findById(workerId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Assigned worker not found: " + workerId));
            order.setAssignedWorkerId(workerId);
            order.setAssignedWorker(assignedWorker);
        }
    }

    private void replaceProducts(Long orderId, List<OrderProductRequestDto> productRequests) {
        if (productRequests == null || productRequests.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "products must contain at least one item");
        }

        orderProductRepository.deleteByOrderId(orderId);

        List<OrderProduct> orderProducts = new ArrayList<>();
        for (OrderProductRequestDto productRequest : productRequests) {
            Product product = productRepository.findById(productRequest.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
                            "Product not found: " + productRequest.getProductId()));

            OrderProduct orderProduct = new OrderProduct();
            orderProduct.setOrderId(orderId);
            orderProduct.setProductId(product.getId());
            orderProduct.setQuantity(productRequest.getQuantity());
            orderProduct.setProductName(product.getName());
            orderProduct.setUnitPrice(product.getBasePrice());
            orderProducts.add(orderProduct);
        }

        orderProductRepository.saveAll(orderProducts);
        Order order = getOrder(orderId);
        order.setProducts(new HashSet<>(orderProductRepository.findByOrderId(orderId)));
    }

    private OrderResponseDto toDto(Order order) {
        OrderResponseDto dto = new OrderResponseDto();
        dto.setId(order.getId());
        dto.setDesk(order.getDesk());
        dto.setClientName(order.getClientName());
        dto.setAssignedWorkerId(order.getAssignedWorkerId());
        dto.setAssignedWorkerName(order.getAssignedWorker() != null ? order.getAssignedWorker().getName() : null);
        dto.setUserId(order.getUserId());
        dto.setSessionId(order.getSessionId());
        dto.setState(mapState(order.getState()));
        dto.setTotal(order.getTotal() != null ? order.getTotal().doubleValue() : null);
        dto.setCreatedAt(order.getCreatedAt());
        dto.setUpdatedAt(order.getUpdatedAt());
        dto.setProducts(order.getProducts().stream()
                .sorted(Comparator.comparing(OrderProduct::getId, Comparator.nullsLast(Comparator.naturalOrder())))
                .map(this::toProductDto)
                .toList());
        return dto;
    }

    private OrderProductResponseDto toProductDto(OrderProduct product) {
        OrderProductResponseDto dto = new OrderProductResponseDto();
        dto.setId(product.getId());
        dto.setProductId(product.getProductId());
        dto.setProductName(product.getProductName());
        dto.setQuantity(product.getQuantity());
        dto.setUnitPrice(product.getUnitPrice() != null ? product.getUnitPrice().doubleValue() : null);
        return dto;
    }

    private Order.OrderState mapState(OrderStateDto state) {
        if (state == null) {
            return null;
        }
        return Order.OrderState.valueOf(state.name());
    }

    private OrderStateDto mapState(Order.OrderState state) {
        if (state == null) {
            return null;
        }
        return OrderStateDto.valueOf(state.name());
    }

    private String requireNonBlank(String value, String fieldName) {
        if (value == null || value.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, fieldName + " must not be blank");
        }
        return value.trim();
    }

    private UUID unwrapNullable(JsonNullable<UUID> value) {
        if (value == null || !value.isPresent()) {
            return null;
        }
        return value.get();
    }
}
