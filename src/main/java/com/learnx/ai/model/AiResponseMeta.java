package com.learnx.ai.model;

public record AiResponseMeta(
        String text,
        String model,
        String mode,
        long latencyMs) {

    public AiResponseMeta {
        text = text == null ? "" : text.trim();
        model = model == null ? "unknown" : model.trim();
        mode = mode == null ? "explain" : mode.trim();
        latencyMs = Math.max(0L, latencyMs);
    }
}
