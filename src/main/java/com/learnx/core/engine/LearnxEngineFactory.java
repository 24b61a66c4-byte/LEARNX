package com.learnx.core.engine;

import com.learnx.ai.provider.AiProvider;
import com.learnx.ai.provider.FallbackAiProvider;
import com.learnx.ai.provider.GeminiAiProvider;
import com.learnx.ai.search.BraveSearchProvider;
import com.learnx.ai.search.CompositeSearchProvider;
import com.learnx.ai.search.PexelsVideoSearchProvider;
import com.learnx.ai.search.SearchProvider;
import com.learnx.ai.search.TavilySearchProvider;
import com.learnx.ai.search.WikipediaSearchProvider;
import com.learnx.ai.search.YouTubeSearchProvider;
import com.learnx.ai.search.ArxivSearchProvider;
import com.learnx.ai.service.TutorService;
import com.learnx.core.service.AnalyticsService;
import com.learnx.core.service.CatalogService;
import com.learnx.core.service.ProgressService;
import com.learnx.core.service.QuizEngine;
import com.learnx.core.store.InMemoryLearnerStore;
import com.learnx.core.store.InMemoryQuizHistoryStore;
import com.learnx.core.store.JsonCatalogStore;
import com.learnx.shared.config.LearnxConfig;

import java.util.ArrayList;
import java.util.List;

/**
 * Wires the default LearnX runtime using in-memory stores and optional external
 * providers.
 */
public class LearnxEngineFactory {

        public LearnxEngine createDefault() {
                LearnxConfig config = LearnxConfig.fromEnvironment();

                CatalogService catalogService = new CatalogService(new JsonCatalogStore());
                QuizEngine quizEngine = new QuizEngine(catalogService);
                ProgressService progressService = new ProgressService();
                AnalyticsService analyticsService = new AnalyticsService(catalogService);
                RecommendationEngine recommendationEngine = new RecommendationEngine(catalogService);

                List<SearchProvider> searchProviders = new ArrayList<>();
                if (config.hasBraveApiKey()) {
                        searchProviders.add(new BraveSearchProvider(config.braveApiKey(), config.requestTimeout(),
                                        config.maxSearchResults()));
                }
                if (config.hasTavilyApiKey()) {
                        searchProviders.add(new TavilySearchProvider(config.tavilyApiKey(), config.requestTimeout(),
                                        config.maxSearchResults()));
                }
                searchProviders.add(new WikipediaSearchProvider(config.requestTimeout(), config.maxSearchResults()));
                searchProviders.add(new ArxivSearchProvider(config.requestTimeout(), config.maxSearchResults()));
                if (config.hasYoutubeApiKey()) {
                        searchProviders.add(new YouTubeSearchProvider(config.youtubeApiKey(), config.requestTimeout(),
                                        config.maxSearchResults()));
                }
                if (config.hasPexelsApiKey()) {
                        searchProviders.add(new PexelsVideoSearchProvider(config.pexelsApiKey(),
                                        config.requestTimeout(), config.maxSearchResults()));
                }
                SearchProvider searchProvider = new CompositeSearchProvider(searchProviders, config.requestTimeout());

                AiProvider fallbackAiProvider = new FallbackAiProvider();
                AiProvider primaryAiProvider = config.hasGeminiApiKey()
                                ? new GeminiAiProvider(config.geminiApiKey(), config.geminiModel(),
                                                config.requestTimeout())
                                : fallbackAiProvider;

                TutorService tutorService = new TutorService(
                                catalogService,
                                searchProvider,
                                primaryAiProvider,
                                fallbackAiProvider,
                                config.maxQuestionLength(),
                                config.debugPromptLogging());

                return new LearnxEngine(
                                catalogService,
                                quizEngine,
                                progressService,
                                analyticsService,
                                recommendationEngine,
                                tutorService,
                                new InMemoryLearnerStore(),
                                new InMemoryQuizHistoryStore());
        }
}
