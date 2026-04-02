FROM node:20-slim

RUN apt-get update && apt-get install -y python3 python3-pip

WORKDIR /app

COPY . .

WORKDIR /app/client
RUN npm install
RUN npm run build
RUN rm -rf node_modules

WORKDIR /app/server
RUN pip install --no-cache-dir --break-system-packages -r requirements.txt

WORKDIR /app

CMD ["python3", "server/main.py"]