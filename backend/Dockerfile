# Stage 1: Build the Go binary
FROM golang:1.25-alpine AS builder

WORKDIR /app

# Install necessary build tools
RUN apk add --no-cache git

# Set GONOSUMDB and GOFLAGS to avoid sum check issues
ENV GONOSUMDB=*
ENV GOFLAGS=-mod=mod

# Copy dependency files first (layer caching)
COPY go.mod go.sum ./

# Download all dependencies using the committed go.sum
RUN go mod download -x

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Stage 2: Create a minimal production image
FROM alpine:latest

WORKDIR /root/

# Install CA certificates for external API calls and timezone data for DB config.
RUN apk --no-cache add ca-certificates tzdata

# Copy the pre-built binary from builder
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]
