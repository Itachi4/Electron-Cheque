# MYB Cheque Generation Electron App

## Overview
This project is a standalone Electron desktop application for generating, managing, and printing cheques. It combines a Node.js/Express backend (with Prisma/SQLite for data), an Angular frontend, and is packaged with a portable Node.js binary so accountants and end-users do not need to install Node/npm/VS Code.

## Features
- Standalone desktop app (no Node.js installation required)
- Angular-based modern frontend
- Node.js/Express backend with REST API
- Prisma ORM with SQLite database
- PDF cheque generation and printing
- User authentication
- Portable Node.js binary for backend in production

## Folder Structure
```
MYB_cheque_generation_server/
├── backend/
│   ├── index.js                # Backend entry point
│   ├── electron-main.js        # Electron main process (in root for packaging)
│   ├── dist-frontend/browser/  # Angular build output
│   ├── node-win/node.exe       # Portable Node.js binary (for production)
│   ├── node_modules/.prisma/client/ # Prisma generated client
│   ├── prisma/
│   │   ├── schema.prisma       # Prisma schema
│   │   └── prod.db             # SQLite database
│   └── ...
├── frontend/                   # Angular app source
├── electron-main.js            # Electron main process (root)
├── package.json                # Main project config
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd MYB_cheque_generation_server
```

### 2. Install Dependencies
```sh
npm install
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

### 3. Generate Prisma Client
```sh
npx prisma generate --schema=backend/prisma/schema.prisma
```

### 4. Build the Angular Frontend
```sh
cd frontend
ng build
cd ..
```
- The build output will be in `backend/dist-frontend/browser`.

### 5. Development Run (with live backend)
```sh
npm run electron:start
```
- This runs Electron in development mode using your system Node.js.

### 6. Package for Distribution (Windows .exe)
1. **Download a portable Node.js binary** (Windows zip from [nodejs.org](https://nodejs.org/en/download)), extract `node.exe` and place it in `backend/node-win/node.exe`.
2. **Build the app:**
   ```sh
   npm run electron:build
   ```
3. The installer/executable will be in the `dist/` folder.

### 7. Running the Packaged App
- Double-click the `.exe` in `dist/`.
- The backend will be started using the portable Node.js binary.
- All data is stored locally in the packaged app's resources.

## Prisma & Database
- The SQLite database is at `backend/prisma/prod.db`.
- To update the schema, edit `backend/prisma/schema.prisma` and run:
  ```sh
  npx prisma migrate dev --schema=backend/prisma/schema.prisma
  npx prisma generate --schema=backend/prisma/schema.prisma
  ```

## Troubleshooting
- **Blank screen in packaged app:**
  - Check `C:\Users\<YourUsername>\AppData\Roaming\myb-cheque-app\backend-log.txt` for backend errors.
  - Ensure `node.exe` is present in `backend/node-win/` and included in the build.
- **Prisma errors:**
  - Run `npx prisma generate --schema=backend/prisma/schema.prisma`.
  - Ensure the generated client is committed (`backend/node_modules/.prisma/client`).
- **API connection refused:**
  - Backend may not be starting; check logs and ensure correct Node binary is used in production.

## Contribution Guidelines
- Fork the repo and create a feature branch.
- Run all builds and tests before submitting a PR.
- Keep code style consistent with the project.

## License
MIT 