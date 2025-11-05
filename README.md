# Studly
COMP 4350 - Software Engineering 2 - Group Project

## Members
- Okolie Anthony
- Ben Edgar-Prosen
- Shashika Maldeniya
- Shiv Bhagat
- Hamed Esmaeilzadeh

## Docs
[ADR Docs](./docs/ADR/)

[Running the Frontend](./docs/running-the-frontend.md)

[Running Biome on the Frontend](./docs/running-biome-on-the-frontend.md)

[Docker Quickstart](./infra/docker/QUICKSTART.md)

## Worksheet Links
[Sprint 0](sprint0.md)

[Sprint 1](./worksheets/sprint1/sprint1worksheet.md)



## Containrization Ducker Hub
For convenience, pre-built frontend and backend images have been pushed to Docker Hub. You can pull and run these images directly without building locally.

- Backend image: https://hub.docker.com/r/hamed1379/studly-backend
- Frontend image: https://hub.docker.com/r/hamed1379/studly-frontend

Notes:
- Example quick run commands (Docker will assign a random container name unless you pass `--name`):

  docker run -d -p 3000:3000 hamed1379/studly-backend:latest
  docker run -d -p 8080:80 hamed1379/studly-frontend:latest

  On Windows cmd / PowerShell and most shells these commands are identical; use `--name <your-name>` if you prefer a stable container name.

- To see which host ports are mapped after containers are running, use `docker ps` or `docker port <container>`.
- If you need help with Docker Desktop, try asking the built-in Gordon LLM assistant inside Docker Desktop (search for "Gordon" in the Docker Desktop UI).
