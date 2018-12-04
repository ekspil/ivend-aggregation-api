FROM node:11
COPY . /app
RUN npm install
CMD ["node", "/app/index.js"]