FROM node:20-alpine
LABEL authors="CoCrafter GmbH"

RUN mkdir -p /app
WORKDIR /app

COPY ./ ./

RUN npm install
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]