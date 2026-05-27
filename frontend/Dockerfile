# ── Stage 1: Validate/copy HTML source ───────────────────────
FROM alpine:3.19 AS builder
WORKDIR /src
COPY . .
# Đảm bảo file tồn tại (có thể thêm bước minify sau)
RUN test -f index.html

# ── Stage 2: Production nginx image ───────────────────────────
FROM nginx:alpine AS runner

# Xóa config mặc định của nginx
RUN rm -rf /usr/share/nginx/html/*

# Copy HTML đã được validate từ stage builder
COPY --from=builder /src/index.html /usr/share/nginx/html/index.html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
