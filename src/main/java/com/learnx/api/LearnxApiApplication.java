package com.learnx.api;

import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.learnx")
@EntityScan(basePackages = {
    "com.learnx.persistence.model",
    "com.learnx.persistence.entity",
    "com.learnx.core.service",
    "com.learnx.core.entity"
})
@EnableJpaRepositories(basePackages = {
    "com.learnx.persistence.repository",
    "com.learnx.core.service",
    "com.learnx.core.repository"
})
public class LearnxApiApplication {
    public static void main(String[] args) {
        SpringApplication.run(LearnxApiApplication.class, args);
    }
}
