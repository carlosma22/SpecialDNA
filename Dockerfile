# Use Node.js base image
FROM node:22.6

# Set the working directory to /app
WORKDIR /SpecialDna

# Copy project files to /app
COPY . .

# Install Node.js dependencies
RUN npm install

# Compile TypeScript to JavaScript
RUN npx tsc

# Install Redis
RUN apt-get update && apt-get install -y redis-server

# Start Redis in the background
RUN nohup redis-server &

# Install Java for Kafka
RUN apt-get install -y default-jdk

# Download and install Kafka
RUN wget https://dlcdn.apache.org/kafka/3.8.0/kafka_2.13-3.8.0.tgz \
    && tar -xzf kafka_2.13-3.8.0.tgz \
    && mv kafka_2.13-3.8.0 /usr/local/kafka

# Start Zookeeper in the background
RUN nohup /usr/local/kafka/bin/zookeeper-server-start.sh /usr/local/kafka/config/zookeeper.properties &

# Start Kafka in the background
RUN nohup /usr/local/kafka/bin/kafka-server-start.sh /usr/local/kafka/config/server.properties &

# Install K6
RUN apt-get install -y gnupg2 curl \
    && curl -s https://dl.k6.io/key.gpg | gpg --dearmor > /usr/share/keyrings/k6-archive-keyring.gpg \
    && echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | tee /etc/apt/sources.list.d/k6.list \
    && apt-get update \
    && apt-get install -y k6

# Expose the port used by the application (if applicable)
EXPOSE 3000

# Command to run the application
CMD ["node", "dist/src/main.js"]