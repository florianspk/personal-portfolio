FROM golang:1.22 AS builder
WORKDIR /proxy-rss

COPY . .
RUN go mod download

RUN CGO_ENABLED=0 GOOS=linux go build -o rss-proxy .

FROM gcr.io/distroless/static:nonroot

WORKDIR /
COPY --from=builder /proxy-rss/rss-proxy /rss-proxy
COPY --from=builder /proxy-rss/index.xml /index.xml

USER nonroot:nonroot

CMD ["/rss-proxy"]
