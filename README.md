# Special DNA Detector

Este proyecto es una aplicación desarrollada en Nodejs que detecta si un humano tiene ADN "especial". Un ADN especial se define como una secuencia de ADN que contiene más de una secuencia de cuatro letras idénticas, ya sea diagonal, horizontal o verticalmente.

## Requisitos Previos

Antes de ejecutar este proyecto, asegúrate de tener instalados los siguientes componentes:

- **Nodejs** >= 20.0
- **npm** >= 10.0
- **MySQL**
- **GIT**

## Instalación de Dependencias

Para instalar las dependencias necesarias del proyecto, sigue estos pasos:

1. Clona el repositorio del proyecto:

    ```bash
    git clone <URL_DE_TU_REPOSITORIO>
    ```

2. Navega al directorio del proyecto:

    ```bash
    cd <NOMBRE_DEL_DIRECTORIO>
    ```

3. Instala los paquetes listados en el archivo `package.json`:

    ```bash
    npm install
    ```

## Instalación del Redis Server

Redis es necesario para manejar la cache del proyecto. Para instalarlo, ejecuta los siguientes comandos:

```bash
sudo apt install redis-server
sudo nohup redis-server &
```

## Instalación de Kafka

Kafka es una plataforma de procesamiento de flujos de datos distribuida que se utiliza para construir aplicaciones en tiempo real.

1. Instala Java, necesario para ejecutar Kafka:

    ```bash
    sudo apt install default-jdk
    ```

2. Descarga la última versión de Kafka:
    ```bash
    wget https://dlcdn.apache.org/kafka/3.8.0/kafka_2.13-3.8.0.tgz
    ```

3. Descomprime el archivo descargado:

    ```bash
    tar -xzf kafka_2.13-3.8.0.tgz
    ```

4. Cambia al directorio de Kafka:

    ```bash
    cd kafka_2.13-3.8.0
    ```

5. Inicia Zookeeper:

    ```bash
    sudo nohup bin/zookeeper-server-start.sh config/zookeeper.properties &
    ```

6. Inicia Kafka:

    ```bash
    sudo nohup bin/kafka-server-start.sh config/server.properties &
    ```

8. Verifica que Kafka esté corriendo:

    ```bash
    bin/kafka-topics.sh --list --bootstrap-server localhost:9092
    ```

## Instalación de K6 (Opcional)

K6 es una herramienta utilizada para realizar pruebas de carga al API. Sigue estos pasos para instalarlo:

```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys   C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

## Ejecución de la Aplicación

Después de instalar todas las dependencias y servicios necesarios, puedes ejecutar la aplicación usando:

```bash
  npm start
```

## Ejecución de Pruebas

Puedes ejecutar las pruebas unitarias con el siguiente comando:

```bash
  npm test
```

## Ejecución de Pruebas de Carga y de Estrés

Puedes ejecutar las pruebas de carga y de estrés con el siguiente comando:

```bash
  k6 run stressTest.js
```

## Documentación de la API

La documentación de la API se generó utilizando Swagger y se puede acceder a través de la ruta GET /api-docs en la URL donde esté desplegada la aplicación.

