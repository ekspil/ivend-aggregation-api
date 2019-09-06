FROM node:11
RUN mkdir -p /app/app
COPY package-lock.json /app
COPY package.json /app
COPY index.js /app
COPY app /app/app
COPY .env /app
WORKDIR /app
RUN npm install
CMD ["node", "/app/index.js"]
