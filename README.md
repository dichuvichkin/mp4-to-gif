# 🎥 MP4 to GIF Converter

A **scalable and reliable** service that converts MP4 videos into GIFs using **Node.js, Express, Redis, Bull queue, and FFmpeg**.\
The frontend is built with **Angular** and served via **Nginx**.\
The application is **containerized with Docker** and supports **multi-worker parallel processing**.

---

## 🚀 Features

✔ Converts **MP4 videos** to **GIF** asynchronously\
✔ Uses **Bull + Redis** for **queue processing**\
✔ Supports **multiple workers** for scalability\
✔ REST API with **CORS support**\
✔ **Angular Frontend UI**\
✔ **Docker Swarm** for **production deployment**

---

## 🛠 **Development Setup**

### **1️⃣ Clone the Repository**

```sh
git clone https://github.com/your-repo/mp4-to-gif.git
cd mp4-to-gif
```

### **2️⃣ Install Dependencies**

```sh
npm install
```

### **3️⃣ Start Backend Locally**

Run Redis:

```sh
docker run --name redis -d -p 6379:6379 redis
```

Run API:

```sh
cd api
npm run dev
```

Run Worker:

```sh
cd worker
npm run dev
```

### **4️⃣ Start Frontend Locally**

```sh
cd frontend
npm start
```

Then visit `http:localhost:4200` 🎉

---

## 🚢 **Production Deployment (Docker Swarm)**

### **1️⃣ Build & Tag Docker Images**

```sh
docker build -t mp4-to-gif-api ./api
docker build -t mp4-to-gif-worker ./worker
docker build -t frontend-app ./frontend
```

### **2️⃣ Deploy Stack**

```sh
docker stack deploy -c docker-stack.yml mp4-to-gif
```

### **3️⃣ Verify Running Services**

```sh
docker service ls
```

You should see services like:

```
mp4-to-gif_api
mp4-to-gif_worker
mp4-to-gif_frontend
mp4-to-gif_redis
```

### **4️⃣ Check Logs**

```sh
docker service logs mp4-to-gif_api
docker service logs mp4-to-gif_worker
docker service logs mp4-to-gif_frontend
```

### **5️⃣ Access the App**

- **Frontend**: `http://localhost:8080/`
- **API**: `http://localhost:3000/`
- **Redis UI (optional)**: `http://localhost:6379/`

---

## 🛑 **Stopping the Application**

To remove all running containers:

```sh
docker stack rm mp4-to-gif
```

---

## 🎯 **Testing API**

### Upload Video

```sh
curl -X POST http://localhost:3000/upload -F "video=@test.mp4"
```

### Get GIF

```sh
curl -O http://localhost:3000/gif/<JOB_ID>
```

---

## 🔥 **Load Testing**

To run a load test with **1000 requests**, execute:

```sh
./load_test.sh
```

---

## 🚀 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature-name`)
3. Commit changes (`git commit -m "Add new feature"`)
4. Push to GitHub (`git push origin feature-name`)
5. Open a Pull Request 🎉

---

## **📜 License**

MIT License © 2025 Dmitrii Chuvichkin

