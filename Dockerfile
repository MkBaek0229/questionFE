# Node.js 이미지를 사용하여 빌드
FROM node:18-alpine AS build

# 작업 디렉토리를 설정합니다.
WORKDIR /app

# 의존성을 설치합니다.
COPY package*.json ./
RUN npm install

# 소스 코드를 복사합니다.
COPY . .

# 애플리케이션을 빌드합니다.
RUN npm run build

# Nginx 이미지를 사용하여 빌드된 애플리케이션을 서빙합니다.
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Nginx 설정 파일을 복사합니다.
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 80

# Nginx를 실행합니다.
CMD ["nginx", "-g", "daemon off;"]