FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN echo "MONGODB_URI=mongodb://placeholder" > .env.local && \
    echo "NEXTAUTH_SECRET=placeholder" >> .env.local && \
    echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local && \
    echo "CLOUDINARY_CLOUD_NAME=placeholder" >> .env.local && \
    echo "CLOUDINARY_API_KEY=placeholder" >> .env.local && \
    echo "CLOUDINARY_API_SECRET=placeholder" >> .env.local && \
    echo "GMAIL_USER=placeholder@gmail.com" >> .env.local && \
    echo "GMAIL_APP_PASSWORD=placeholder" >> .env.local

RUN npm run build

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]