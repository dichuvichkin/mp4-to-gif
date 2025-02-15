FROM node:18

# Install FFmpeg
RUN apt update && apt install -y ffmpeg

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

CMD ["npm", "run", "start"]
