package middleware

import (
	"fmt"
	"math/rand"
	"net/http"
	"sync"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
)

// FailureType defines the type of failure to inject
type FailureType string

const (
	FailureNone    FailureType = "none"
	FailureLatency FailureType = "latency"
	FailureError   FailureType = "error"
	FailureCPU     FailureType = "cpu"
)

// ChaosConfig holds the current failure state
type ChaosConfig struct {
	Type   FailureType `json:"type"`
	Rate   float64     `json:"rate"`  // 0.0 to 1.0
	Value  int         `json:"value"` // ms for latency, or error code
	Active bool        `json:"active"`
}

var (
	currentConfig ChaosConfig
	configLock    sync.RWMutex
)

// SetChaosConfig updates the current chaos configuration (called by Agent)
func SetChaosConfig(cfg ChaosConfig) {
	configLock.Lock()
	defer configLock.Unlock()
	currentConfig = cfg
}

// GetChaosConfig returns the current config
func GetChaosConfig() ChaosConfig {
	configLock.RLock()
	defer configLock.RUnlock()
	return currentConfig
}

// ChaosMiddleware injects faults based on the current config
func ChaosMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		cfg := GetChaosConfig()

		if !cfg.Active {
			next.ServeHTTP(w, r)
			return
		}

		// Probabilistic injection
		if rand.Float64() > cfg.Rate {
			next.ServeHTTP(w, r)
			return
		}

		tracer := otel.Tracer("chaos-middleware")
		_, span := tracer.Start(r.Context(), "chaos_injection")
		defer span.End()

		span.SetAttributes(
			attribute.String("chaos.type", string(cfg.Type)),
			attribute.Bool("chaos.injected", true),
		)

		switch cfg.Type {
		case FailureLatency:
			span.AddEvent("injecting_latency")
			time.Sleep(time.Duration(cfg.Value) * time.Millisecond)
			next.ServeHTTP(w, r)

		case FailureError:
			errMsg := fmt.Sprintf("Injected Error: %d", cfg.Value)
			span.RecordError(fmt.Errorf(errMsg))
			span.SetStatus(codes.Error, errMsg)
			http.Error(w, errMsg, cfg.Value)
			return // Stop processing

		case FailureCPU:
			span.AddEvent("injecting_cpu_pressure")
			// Simulate CPU spike for a duration (Value in ms)
			end := time.Now().Add(time.Duration(cfg.Value) * time.Millisecond)
			for time.Now().Before(end) {
				_ = 1 * 1 // Burn CPU
			}
			next.ServeHTTP(w, r)

		default:
			next.ServeHTTP(w, r)
		}
	})
}
