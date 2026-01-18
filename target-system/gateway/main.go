package main

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"time"

	"github.com/failure-injection-ai/shared/middleware"
	"github.com/failure-injection-ai/shared/telemetry"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {
	// 1. Init Telemetry
	tp, err := telemetry.InitTracer("api-gateway")
	if err != nil {
		log.Fatalf("failed to init tracer: %v", err)
	}
	defer func() {
		if err := tp.Shutdown(context.Background()); err != nil {
			log.Printf("Error shutting down tracer provider: %v", err)
		}
	}()

	// 2. Define Proxy Targets
	authURL, _ := url.Parse("http://auth:8081")
	businessURL, _ := url.Parse("http://business:8082")

	authProxy := httputil.NewSingleHostReverseProxy(authURL)
	businessProxy := httputil.NewSingleHostReverseProxy(businessURL)

	// Wrap proxies with OTel
    // Note: otelhttp.NewHandler automatically extracts/injects trace context
	authHandler := otelhttp.NewHandler(authProxy, "proxy_auth")
	businessHandler := otelhttp.NewHandler(businessProxy, "proxy_business")

	mux := http.NewServeMux()

	// 3. Define Routes
	mux.Handle("/auth/", http.StripPrefix("/auth", authHandler))
	mux.Handle("/business/", http.StripPrefix("/business", businessHandler))

	// Control Plane Endpoint (for AI Agent)
	mux.HandleFunc("/chaos/config", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			var cfg middleware.ChaosConfig
			if err := json.NewDecoder(r.Body).Decode(&cfg); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			middleware.SetChaosConfig(cfg)
			fmt.Printf("Gateway Chaos Config Updated: %+v\n", cfg)
			w.WriteHeader(http.StatusOK)
		} else {
			json.NewEncoder(w).Encode(middleware.GetChaosConfig())
		}
	})

    // Health check
    mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte("OK"))
    })

	// 4. Apply Chaos Middleware
    // The chaos middleware runs BEFORE the proxy, so if we inject latency here, the user sees it.
	finalHandler := middleware.ChaosMiddleware(otelhttp.NewHandler(mux, "gateway-server"))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Gateway running on port %s", port)
	if err := http.ListenAndServe(":"+port, finalHandler); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
