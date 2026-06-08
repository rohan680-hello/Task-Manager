# Daily Task Desk

I chose Exercise 1, the Personal Task Manager. The app is a simple full-stack task board for one user. A user can add daily tasks, update the details, mark work as done, filter the list, search by title, and keep the data saved in a JSON file on the backend.

## Live Demo Links

- Frontend: https://task-manager-kappa-rust.vercel.app
- Backend: https://task-manager-ra1a.onrender.com

## Tech Stack

- React with Vite for the frontend. I used it because it is lightweight and quick to run locally.
- Tailwind CSS for styling the layout and responsive screens.
- Node.js with Express for the REST API.
- JSON file storage in `server/tasks.json`, so the project stays simple but tasks still remain after restarting the server.
- ESLint to catch frontend mistakes while developing.

## How to Run Locally

Install dependencies for both apps:

```powershell
cd client
npm install
cd ../server
npm install
```

Start the backend from the `server` folder:

```powershell
cd server
npm.cmd run dev
```

Start the frontend in a second terminal from the `client` folder:

```powershell
cd client
npm.cmd run dev
```

Open the frontend URL shown by Vite, usually:

```text
http://localhost:5173
```

The backend runs on:

```text
http://localhost:5000
```

On my Windows PowerShell setup, plain `npm` was blocked by script execution policy, so I used `npm.cmd` in the commands above.

## API Documentation

Base URL:

```text
http://localhost:5000/api
```

### GET `/tasks`

Returns all saved tasks. The backend sorts them by creation date with the newest task first.

Response:

```json
[
  {
    "id": "task-id",
    "title": "Finish assessment",
    "description": "Complete README and edit flow",
    "dueDate": "2026-06-04",
    "completed": false,
    "createdAt": "2026-06-03T12:00:00.000Z"
  }
]
```

### POST `/tasks`

Creates a new task.

Request body:

```json
{
  "title": "Finish assessment",
  "description": "Complete README and edit flow",
  "dueDate": "2026-06-04"
}
```

Response: the created task object.

### PATCH `/tasks/:id`

Updates an existing task. I use this endpoint for both editing task details and toggling complete/incomplete status.

Request body examples:

```json
{
  "completed": true
}
```

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "dueDate": "2026-06-05"
}
```

Response: the updated task object.

### DELETE `/tasks/:id`

Deletes a task.

Response:

```json
{
  "message": "Task deleted successfully",
  "id": "task-id"
}
```

## Project Structure

```text
TaskManager/
  client/
    src/
      App.jsx        React UI, task state, filters, search, and API calls
      index.css      Tailwind CSS import and global styles
    package.json     Frontend scripts and dependencies
  server/
    server.js        Express API routes
    tasks.json       JSON file used for task persistence
    package.json     Backend scripts and dependencies
  README.md          Project documentation
```

## What Works

- Add a task with a required title and optional description and due date.
- Show all tasks with the newest task first.
- Edit a task's title, description, and due date.
- Mark a task complete or incomplete.
- Delete a task after a confirmation prompt.
- Filter by All, Active, and Completed.
- Search tasks by title.
- Show active, completed, and overdue counts.
- Highlight overdue tasks that are not completed.
- Show loading and empty states.
- Save tasks in `server/tasks.json`.

## Next Steps

- Add a few backend tests for creating, updating, and deleting tasks.
- Add stricter validation for very long titles and invalid dates.
- Add drag-and-drop ordering later as a bonus improvement.
