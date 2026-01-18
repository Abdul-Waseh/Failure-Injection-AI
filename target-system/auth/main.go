package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
    "fmt"

	"github.com/failure-injection-ai/shared/middleware"
	"github.com/failure-injection-ai/shared/telemetry"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {
	tp, _ := telemetry.InitTracer("auth-service")
	defer tp.Shutdown(context.Background())

	mux := http.NewServeMux()

	mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
        // Sleep a bit to simulate work
        // time.Sleep(10 * time.Millisecond) 
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"token": "xyz-123", "user": "test-user"}`))
	})

    mux.HandleFunc("/verify", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
        w.Write([]byte(`{"valid": true}`))
    })

	// Chaos Control
	mux.HandleFunc("/chaos/config", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodPost {
			var cfg middleware.ChaosConfig
            json.NewDecoder(r.Body).Decode(&cfg)
			middleware.SetChaosConfig(cfg)
            fmt.Printf("Auth Chaos Config Updated: %+v\n", cfg)
		}
	})

	finalHandler := middleware.ChaosMiddleware(otelhttp.NewHandler(mux, "auth-server"))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	log.Printf("Auth Service running on port %s", port)
	http.ListenAndServe(":"+port, finalHandler)
}
