FROM node:22-alpine
WORKDIR /app
COPY package.json ./
RUN npm install --omit=dev --ignore-scripts 2>/dev/null
COPY dist/ ./dist/
EXPOSE 4000
CMD ["node", "dist/main.js"]
