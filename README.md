# Studly
COMP 4350 - Software Engineering 2 - Group Project

Studly is an application platform for students to enhance their studying abilities through gamification and social aspects. Badges are awarded on Studly by completing challenges, for example, by studying 3 days in a row, you get a badge. These badges are stored in a collection and are allowed to be publicly shared to keep your friends up to date on their social feeds. Furthermore, students can work towards badges together through meetups and scheduling study sessions through Studly’s integrated friends list.


## Worksheet Links
[Sprint 0](sprint0.md)
- Read this document for more information about our app, as well as the technical structure used for the development of this app. 

[Sprint 1](./worksheets/sprint1/sprint1worksheet.md)
- Read this document for more information on our testing plans.

[Sprint 2](./worksheets/sprint2/worksheet.md)
- Read this document for our sprint 2 information


[Sprint 3](./worksheets/sprint3/worksheet.md)
- Read this document for our sprint 3 information

## Extra Documents
[ADR Docs](./docs/ADR/)

[Running the Frontend](./docs/running-the-frontend.md)

[Running Biome on the Frontend](./docs/running-biome-on-the-frontend.md)

[CLI Frontend](./apps/cli-frontend/README.md)

[Docker Quickstart](./infra/docker/QUICKSTART.md)



## Containerization with Docker Hub
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



## Members
- Okolie Anthony
- Ben Edgar-Prosen
- Shashika Maldeniya
- Shiv Bhagat
- Hamed Esmaeilzadeh
