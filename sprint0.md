# Sprint 0 Worksheet

- [Repo](https://github.com/HaMeD1379/Studly)
- [Presentation Slides](./worksheets/sprint0/presentation.pdf)
- [Summary & Vision](#project-summary-&-vision)
- [Functional Features](#functional-features--user-stories)
- [Non-Functional Feature](#non-functional-reliability-feature)
- [Nice to Have Features](#nice-to-have-features)
- [Initial Architecture](#initial-architecture)
- [Architecture Diagram](./worksheets/sprint0/diagram.png)
- [Work Division & Coordination](#work-division--coordination)

# Project Summary & Vision

Studly is an application platform for students to enhance their studying abilities through gamification and social aspects. Badges are awarded on Studly by completing challenges, for example, by studying 3 days in a row, you get a badge. These badges are stored in a collection and are allowed to be publicly shared to keep your friends up to date on their social feeds. Furthermore, students can work towards badges together through meetups and scheduling study sessions through Studly’s integrated friends list.

For many students, studying can be hard at times and Studly aims to fill this gap where students need it the most. By encouraging studying through methods that are more approachable, fun and positive, these problems can be made easier to resolve. Not only is it more fun, friends are able to hold each other accountable through meetups and feeds, or have friendly competitions to see who can get badges faster. Both of these examples demonstrate how Studly can solve studying issues to make studying easier to manage. The goal of Studly is to develop positive habits that help students achieve better grades, better habits and overall stronger academic performance that everyone can be happy about.

# Core Features - MVP
### Functional Features & User Stories

### 1) Badges
##### Acceptance Criteria
- Given I am a student that is actively studying, when I track my study sessions, then I gain badges as rewards on my profile as a collection.
- Given I am a student that is about to start studying, when I press “Start Session” and then “End Session”, then my study session is tracked as study progress towards badges.

##### User Stories
- As a user I want a collection of badges in my profile so I can feel accomplished in my studying.
- As a user I want my studying to be tracked and reward badges for various types of good habits so that I am encouraged to keep studying.
- As a user I want my badge tracking to be easy to use by clicking a start and stop session button so that it isn’t difficult to start tracking my studying.

### 2) Social Interactions
##### Acceptance Criteria
- Given I am a logged in student that has a username, when I go to my friends list and press “Add Friend”, then I can add a friend by their username to my friends list.
- Given I have a friend request from another user, when I click “Add Friend” beside the friend request, then I become friends with them and they appear on my friends list.
- Given I am friends with someone, when I go to press “Meetup”, then I can schedule a time to meetup to study together.
- Given I am friends with at least one person from a group, when I am invited to a group, then I can join the group and attend group study sessions.

##### User Stories
- As a user I want to be able to add my friends to my friends list so that I can stay connected to my friends while studying.
- As a user I want to be able to schedule meetups so that I can be held accountable with my friend while studying.
- As a user I want to be able to meet and join a study group so that we can all improve our study habits together.

### 3) Friend Feeds and Display Badge Accomplishments
##### Acceptance Criteria
- Given I am a logged in user, when I go to “Home”, then an active social feed of my friend’s accomplishments and badges will appear.

##### User Stories
- As a user I want to be able to see what my friends have been up to with studying so that I can stay motivated alongside them.
- As a user I want to be able to get live updates when my friends get new badges so I can congratulate them.

### 4) Streak System and Leaderboards
##### Acceptance Criteria
- Given I am a student who has logged study sessions already, when I log a consecutive day of studying, then I see my studying streak start to get counted.
- Given I am a logged in user, when I go to the “Leaderboards” screen, then I can see the top students on my friends list who have the highest streaks or study minutes.

##### User Stories
- As a user I want to be able to have a study streak so that I can feel motivated to study so I keep the streak going.
- As a user I want to be able to see leaderboards of my friends for who has studied the most and kept the longest streak so that I can feel motivated to study more.

### 5) Profile Statistics
##### Acceptance Criteria
- Given I am a logged in user, when I go to my profile and view my statistics, then I can see my own best streak and longest study time by day, week, month, or year.
- Given I am viewing a friend's profile and they do not have statistics hidden, when I go to their statistics then it shows their best streak and longest study time.

##### User Stories
- As a user I want to be able to see in depth statistics on study sessions and my highest streak, which is tracked by the last day, week, month or year on my profile so I can see my study habits progress.
- As a user I want to be able to see my friends statistics so that I can see how many badges they have collected alongside their personal statistics.
- As a user I want to be able to hide my statistics to the public so that I can keep my own statistics private.

### Non-functional Reliability Feature
#### Server Caching
- In the event of database failure, we have limited functionality through server caching in memory so the application can still work.

# Nice to Have Features
- Private messages
- Gifting badges

# Initial Architecture

### Frontend - Hosted on Vercel
- React + TypeScript
- Vite (development/build)
- Mantine (UI components)
- Socket.io client (realtime feed/leaderboards)

#### Secondary Frontend - Python 3 CLI

### Backend - Hosted on Railway
- Node.js + Express
- Socket.io server (realtime)
- Supabase JavaScript client (server-side calls to Supabase services)
- REST/JSON endpoints
#### Database & Auth
- Supabase (PostgreSQL)

### Cross-tier protocols
- Frontend ↔ Backend: HTTPS (CORS allowed)
- Backend ↔ Supabase/Postgres: Supabase SDK / REST API (over TLS)
- Backend ↔ Frontend: WebSocket (Socket.io realtime)

This architecture is a good fit for the project because it is modern, clear, and lightweight while still meeting course requirements. The web frontend uses React with TypeScript and is hosted on Vercel, providing fast performance and automatic redeployments. The backend is built with Node.js and Express on Railway, giving the team a reliable always-on API that can serve both the primary web frontend and the planned Python CLI frontend. Supabase provides a managed PostgreSQL database with built-in authentication and row-level security, reducing development effort and increasing reliability. The clear separation between frontend, backend, and database makes the system easy to extend and maintain, while still being realistic to implement within the course timeline. This setup is cost-effective, scalable, and supports features like Socket.io for real-time updates when needed.

# Work Division & Coordination
We would be distributing tasks based on the interests of the group members to make sure that team members are working on their areas of choice, while at the same time ensuring that tasks are assigned in a fair and balanced manner, currently we have tasks separated into frontend (handled by Ben and Anthony), the backend (handled by Shika), CI/CD pipeline (handled by Hamed) and finally database management (handled by Shiv). The group has agreed to weekly meetings every Monday to ensure that we are on track, discuss potential changes to be implemented in future sprints and brainstorm design ideas.
