package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
    "time"

	"github.com/failure-injection-ai/shared/middleware"
	"github.com/failure-injection-ai/shared/telemetry"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
    "go.opentelemetry.io/otel"
)

func main() {
	tp, _ := telemetry.InitTracer("business-service")
	defer tp.Shutdown(context.Background())

	mux := http.NewServeMux()

	mux.HandleFunc("/data", func(w http.ResponseWriter, r *http.Request) {
        ctx := r.Context()
        tracer := otel.Tracer("business-logic")
        
        // 1. Check Auth (Dependency Call)
        _, span := tracer.Start(ctx, "verify_auth_token")
        // In a real app we'd call the http://auth:8081/verify endpoint
        // Let's simulate that network call
        
        req, _ := http.NewRequestWithContext(ctx, "GET", "http://auth:8081/verify", nil)
        client := http.Client{Transport: otelhttp.NewTransport(http.DefaultTransport)}
        resp, err := client.Do(req)
        
        span.End() // End auth span

        if err != nil || resp.StatusCode != 200 {
            http.Error(w, "Auth failed", http.StatusUnauthorized)
            return
        }
        defer resp.Body.Close()

        // 2. Do "Database" work (Simulated)
        _, dbSpan := tracer.Start(ctx, "query_database")
        time.Sleep(20 * time.Millisecond)
        dbSpan.End()

		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"data": "Critical Business Value", "items": [1, 2, 3]}`))
	})

	// Chaos Control
	mux.HandleFunc("/chaos/config", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			var cfg middleware.ChaosConfig
            json.NewDecoder(r.Body).Decode(&cfg)
			middleware.SetChaosConfig(cfg)
            fmt.Printf("Business Chaos Config Updated: %+v\n", cfg)
		}
	})

	finalHandler := middleware.ChaosMiddleware(otelhttp.NewHandler(mux, "business-server"))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}
	log.Printf("Business Service running on port %s", port)
	http.ListenAndServe(":"+port, finalHandler)
}
