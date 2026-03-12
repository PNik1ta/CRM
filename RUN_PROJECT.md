# How to Run the CRM Project

## 1. Install Docker

Download and install Docker Desktop:

https://www.docker.com/products/docker-desktop/

After installation, open Docker Desktop and wait until it says **"Docker is running"**.

## 2. Download the Project

Open a terminal and run:

```bash
git clone <repo-url>
```

Then enter the project folder:

```bash
cd CRM
```

## 3. Start the Project

Run:

```bash
docker compose up --build
```

The first run may take a few minutes because Docker needs to download required images.

## 4. Open the CRM

Open your browser and go to:

http://localhost:5173

You should see the CRM interface with demo data already loaded.

## 5. Stop the Project

To stop the project, press:

**CTRL + C**

Or run this in the project folder:

```bash
docker compose down
```
