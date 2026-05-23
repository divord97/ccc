package middleware

import (
	"net/http"
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "ccc_http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)

	httpRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "ccc_http_request_duration_seconds",
			Help:    "HTTP request duration in seconds",
			Buckets: []float64{0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10},
		},
		[]string{"method", "path"},
	)

	httpRequestsInFlight = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "ccc_http_requests_in_flight",
			Help: "Number of HTTP requests currently being served",
		},
	)

	ActiveCalls = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "ccc_active_calls",
			Help: "Number of active calls",
		},
	)

	ActiveAgents = promauto.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "ccc_active_agents",
			Help: "Number of active agents by status",
		},
		[]string{"status"},
	)

	ESLConnections = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "ccc_esl_connections_active",
			Help: "Number of active ESL connections to FreeSWITCH",
		},
	)

	ESLCommandDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "ccc_esl_command_duration_seconds",
			Help:    "ESL command execution duration",
			Buckets: []float64{0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5},
		},
		[]string{"command"},
	)

	QueueDepth = promauto.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "ccc_queue_depth",
			Help: "Number of calls waiting in queue per skill group",
		},
		[]string{"skill_group"},
	)

	CampaignProgress = promauto.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "ccc_campaign_progress_ratio",
			Help: "Campaign completion ratio (0-1)",
		},
		[]string{"campaign_id"},
	)
)

func Metrics(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path == "/metrics" || r.URL.Path == "/health" {
			next.ServeHTTP(w, r)
			return
		}

		httpRequestsInFlight.Inc()
		defer httpRequestsInFlight.Dec()

		start := time.Now()
		sw := &statusWriter{ResponseWriter: w, status: http.StatusOK}

		next.ServeHTTP(sw, r)

		duration := time.Since(start).Seconds()
		path := normalizePath(r.URL.Path)

		httpRequestsTotal.WithLabelValues(r.Method, path, strconv.Itoa(sw.status)).Inc()
		httpRequestDuration.WithLabelValues(r.Method, path).Observe(duration)
	})
}

func normalizePath(path string) string {
	// Collapse numeric IDs to :id to reduce cardinality
	parts := splitPath(path)
	for i, part := range parts {
		if isNumeric(part) {
			parts[i] = ":id"
		}
	}
	result := "/"
	for _, p := range parts {
		if p != "" {
			result += p + "/"
		}
	}
	if len(result) > 1 {
		result = result[:len(result)-1]
	}
	return result
}

func splitPath(path string) []string {
	var parts []string
	current := ""
	for _, c := range path {
		if c == '/' {
			if current != "" {
				parts = append(parts, current)
				current = ""
			}
		} else {
			current += string(c)
		}
	}
	if current != "" {
		parts = append(parts, current)
	}
	return parts
}

func isNumeric(s string) bool {
	if s == "" {
		return false
	}
	for _, c := range s {
		if c < '0' || c > '9' {
			return false
		}
	}
	return true
}
