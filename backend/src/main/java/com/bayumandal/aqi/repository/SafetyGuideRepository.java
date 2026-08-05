package com.bayumandal.aqi.repository;

import com.bayumandal.aqi.entity.SafetyGuide;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SafetyGuideRepository extends JpaRepository<SafetyGuide, Long> {

    List<SafetyGuide> findAllByOrderBySortOrderAsc();
}
