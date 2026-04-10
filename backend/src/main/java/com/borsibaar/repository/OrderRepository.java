package com.borsibaar.repository;

import com.borsibaar.entity.Order;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Override
    @EntityGraph(attributePaths = {"assignedWorker", "products"})
    @NonNull
    List<Order> findAll();

    @Override
    @EntityGraph(attributePaths = {"assignedWorker", "products"})
    @NonNull
    Optional<Order> findById(@NonNull Long id);
}
