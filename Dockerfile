FROM golang:1.21-alpine AS builder
RUN apk add --no-cache git

WORKDIR /app

# Copy the entire target-system so we resolve local dependencies
COPY target-system ./target-system

# Build argument to select which service to build
ARG SERVICE_PATH

WORKDIR /app/target-system/${SERVICE_PATH}
RUN go mod download
RUN go mod tidy
RUN go build -o /app/server main.go

FROM alpine:latest
WORKDIR /root/
COPY --from=builder /app/server .
CMD ["./server"]
