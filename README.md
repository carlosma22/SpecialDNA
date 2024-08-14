# Special DNA Detector

This project is an application developed in Node.js that detects if a human has "special" DNA. Special DNA is defined as a DNA sequence that contains more than one sequence of four identical letters, whether diagonally, horizontally, or vertically.

## Prerequisites

Before running this project, make sure you have the following components installed:

- **Nodejs** >= 18.0
- **npm** >= 10.0
- **MySQL**
- **GIT**

## Project Setup

1. Clone the project repository:

    ```bash
    git clone <URL_DE_TU_REPOSITORIO>
    ```

2. Navigate to the project directory:

    ```bash
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

3. Install the packages listed in the `package.json` file:

    ```bash
    npm install
    ```

## Installing Redis Server

Redis is required to handle the project's cache. To install it, run the following commands:

```bash
sudo apt install redis-server
sudo nohup redis-server &
```

## Installing Kafka

Kafka is a distributed data streaming platform used for building real-time applications.

1. Install JDK, required to run Kafka:

    ```bash
    sudo apt install default-jdk
    ```

2. Download the latest version of Kafka:
    ```bash
    wget https://dlcdn.apache.org/kafka/3.8.0/kafka_2.13-3.8.0.tgz
    ```

3. Extract the downloaded file:

    ```bash
    tar -xzf kafka_2.13-3.8.0.tgz
    ```

4. Change to the Kafka directory:

    ```bash
    cd kafka_2.13-3.8.0
    ```

5. Start Zookeeper:

    ```bash
    sudo nohup bin/zookeeper-server-start.sh config/zookeeper.properties &
    ```

6. Start Kafka:

    ```bash
    sudo nohup bin/kafka-server-start.sh config/server.properties &
    ```

8. Verify that Kafka is running:

    ```bash
    bin/kafka-topics.sh --list --bootstrap-server localhost:9092
    ```

## Installing K6 (Optional)

K6 is a tool used for performing load testing on the API. Follow these steps to install it:

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys   C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```


## Running the Application

After installing all the necessary dependencies and services, you can run the application using:

```bash
  npm start
```

## Running Tests

You can run the unit tests with the following command:

```bash
  npm test
```

## Running Load and Stress Tests

You can run load and stress tests with the following command:

```bash
  k6 run stressTest.js
```

## Running The Application Without Docker

1. Make sure you have the following prerequisites installed before getting started:

    - [Docker](https://www.docker.com/get-started)
    - [Docker Compose](https://docs.docker.com/compose/install)

2. Set up environment variables

    Create a .env file in the root of the project with the necessary environment variables.

3. Build and run the containers

    Run the following command to build the Docker images and start the containers:

    ```bash
    docker-compose up
    ```
    This command will start the services defined in the docker-compose.yml file, including the MySQL database, Redis, Kafka, and the Node.js application.

4. Verify the application is running

    Once the containers are up and running, you can access the application at http://localhost:3000.

5. Stress testing with K6

    To run the stress test, use the following command:

    ```bash
    docker-compose up k6
    ```

    Replace <k6-container-name> with the name of the K6 container that is running.

6. Stop the containers

    To stop and remove the containers, you can run:

    ```bash
    docker-compose down
    ```

7. Common Issues

    - Error connecting to Redis/Kafka/MySQL: Ensure that the services are running correctly and that the environment variables in the .env file are properly configured.

    - Ports in use: If you encounter port conflicts, make sure that the ports defined in docker-compose.yml are not being used by other services on your local machine.

## API Documentation

The API documentation was generated using Swagger and can be accessed via the GET /api-docs route at the URL where the application is deployed.