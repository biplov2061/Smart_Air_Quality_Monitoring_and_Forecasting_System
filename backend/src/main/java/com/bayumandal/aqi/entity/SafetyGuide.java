package com.bayumandal.aqi.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "safetyguides")
public class SafetyGuide {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "guide_key", nullable = false, unique = true)
    private String guideKey;

    private String icon;

    @Column(length = 300)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String severity;

    @Column(length = 200)
    private String aqiBands;
    @Column(length = 200)
    private String ageGroups;
    @Column(length = 200)
    private String sensitivities;
    @Column(length = 200)
    private String diseases;

    private Integer sortOrder;

    protected SafetyGuide() {
    }

    public SafetyGuide(String guideKey, String icon, String title, String description, String severity,
                       String aqiBands, String ageGroups, String sensitivities, String diseases,
                       Integer sortOrder) {
        this.guideKey = guideKey;
        this.icon = icon;
        this.title = title;
        this.description = description;
        this.severity = severity;
        this.aqiBands = aqiBands;
        this.ageGroups = ageGroups;
        this.sensitivities = sensitivities;
        this.diseases = diseases;
        this.sortOrder = sortOrder;
    }

    public Long getId() { return id; }
    public String getGuideKey() { return guideKey; }
    public String getIcon() { return icon; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getSeverity() { return severity; }
    public String getAqiBands() { return aqiBands; }
    public String getAgeGroups() { return ageGroups; }
    public String getSensitivities() { return sensitivities; }
    public String getDiseases() { return diseases; }
    public Integer getSortOrder() { return sortOrder; }
}
