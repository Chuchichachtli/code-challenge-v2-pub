# Add the necessary commands to create a Docker image for the backend service
FROM node:20-alpine
LABEL authors="Baris Basmak"

RUN mkdir -p /app-be
WORKDIR /app-be

COPY ./ ./

RUN npm install
RUN npm run build

EXPOSE 8000

CMD ["npm", "run", "start"]