FROM node:11
COPY . /app
WORKDIR /app
RUN npm install
CMD ["node", "/app/index.js"]