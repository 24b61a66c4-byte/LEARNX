package com.learnx.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI learnxOpenApi() {
        return new OpenAPI().info(new Info()
                .title("LearnX API")
                .version("v1")
                .description("LearnX backend APIs for profile, progress, notes, quiz, and tutor workflows.")
                .license(new License().name("MIT")));
    }
}
