# Project Members & Team Collaboration Feature

## Overview
ToggleNest now includes an end-to-end **Project Members & Team Collaboration** system. Projects are no longer strictly single-user silos: a project owner can search existing registered users by name or email, invite them as members, and collaborate in real-time on Kanban boards and tasks.

All authorization is strictly verified at the **backend (database and API routes)** and at the **Socket.IO room layer**, preventing unauthorized data access or room snooping.

---

## 1. Architecture & Data Model

### Project Model (`backend/models/Project.js`)
- **`user`**: Reference to `User` (the project owner / creator).
- **`members`**: Array of subdocuments:
  ```javascript
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      role: { type: String, enum: ["owner", "member"], default: "member" },
      addedAt: { type: Date, default: Date.now }
    }
  ]
  ```
- **Helper methods**:
  - `project.isAuthorized(userId)`: Returns `true` if `userId` is either the owner (`project.user`) or an active member in `project.members`.
  - `project.isOwner(userId)`: Returns `true` if `userId` matches `project.user`.
  - `project.authorizedUserIds`: Virtual returning an array of string IDs representing all authorized participants.

---

## 2. Backend Authorization Middleware

### `backend/middleware/projectAccessMiddleware.js`
A reusable middleware factory:
- `requireProjectAccess("any")`: Verifies user is owner OR member. Attaches `req.project` and `req.isProjectOwner` to `req`. Returns `403 Forbidden` if unauthorized.
- `requireProjectAccess("owner")`: Verifies user is the project owner. Returns `403 Forbidden: Only the project owner can perform this action` if not the owner.

---

## 3. API Endpoints

### Projects (`/api/projects`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/projects` | Logged-in User | Returns projects where user is owner OR member. Each project includes `myRole: "owner"` or `"member"`. |
| `GET` | `/api/projects/:id` | Owner or Member | Returns single project details. Returns 403 if unauthorized. |
| `POST` | `/api/projects` | Logged-in User | Creates a new project with creator as owner. |
| `PUT` | `/api/projects/:id` | Owner Only | Renames or updates project. |
| `DELETE` | `/api/projects/:id` | Owner Only | Deletes project, associated tasks, and activities. Kicks connected sockets. |
| `GET` | `/api/projects/:id/members` | Owner or Member | Returns project owner + populated list of members (name, email, avatar, role, addedAt). |
| `GET` | `/api/projects/:id/members/search?q=` | Owner Only | Searches existing registered users by name or email (excludes self and existing members). |
| `POST` | `/api/projects/:id/members` | Owner Only | Adds a registered user as a member. Prevents duplicates and prevents adding owner. |
| `DELETE` | `/api/projects/:id/members/:userId` | Owner Only | Removes member from project. Calls `kickUserFromProjectRoom` to immediately revoke socket access. |

### Tasks (`/api/tasks`)
- `GET /api/tasks?projectId=X`: Accessible to owner and any member of project X. Returns all tasks in the project.
- `POST /api/tasks`: Project owner or members can create tasks in the project.
- `PATCH /api/tasks/:id`: Project owner or members can update task title, description, status, priority, or reassign.
- `DELETE /api/tasks/:id`: Protected — only task creator OR project owner can delete a task.
- `GET /api/tasks/dashboard` & `GET /api/tasks/recent`: Enriched to include tasks across all accessible projects (owned or member).

### Activities (`/api/activities`)
- `GET /api/activities`: Returns activity feeds for all projects the user is authorized to access.
- `GET /api/activities?projectId=X`: Rejects with 403 if user is not owner or member of project X.

### Users (`/api/users`)
- `GET /api/users/search?q=`: Query endpoint to find users matching name/email prefix (used for member addition autocomplete).

---

## 4. Real-Time Socket.IO Synchronization & Security

### Secure Room Authorization
- `project:join`: When a client emits `project:join` for `projectId`, the server looks up the project in MongoDB and verifies `project.isAuthorized(userId)`.
  - If unauthorized: emits `project:access_denied` and prevents socket from joining `project:${projectId}` room.
  - If authorized: socket joins room, broadcasts presence update (`presence:update`) with avatar/name.

### Instant Member Revocation (`kickUserFromProjectRoom`)
When the owner removes a member via `DELETE /api/projects/:id/members/:userId`:
1. Server emits `project:kicked` to all active sockets belonging to the removed user.
2. Server forces those sockets to leave the `project:${projectId}` room.
3. Server broadcasts updated presence indicators to remaining users.
4. The removed user's client immediately shows a locked **Access Denied** notice with an option to return to the Projects overview.

---

## 5. Frontend User Experience

1. **Projects Page (`Projects.jsx`)**:
   - Projects where the user is a collaborator display a distinctive **"Shared"** pill badge.
   - For owned projects: Three-dots context menu contains **Edit Project**, **Manage Members**, and **Delete Project**.
   - For member projects: Context menu only offers **Open Board** (members cannot edit project metadata or delete the project).

2. **Manage Members Modal (`ManageMembers.jsx` & `ManageMembers.css`)**:
   - Opened by clicking **Manage Members** in the project card options.
   - Displays project owner with crown badge (`👑 Owner`).
   - Displays all existing members with colored avatar initials, email, role badge, and joined date.
   - Owner has an interactive search input to find registered users by typing their name or email.
   - Matching users appear in a dropdown list; clicking **Add** adds them to the project with instant optimistic list update.
   - Owner can click the trash icon next to any member to remove them (includes confirmation prompt).

3. **Board Real-Time Protection (`Board.jsx`)**:
   - Single project fetch verifies permissions upfront.
   - Automatically handles `project:kicked` and `project:access_denied` events from `SocketContext`.
   - On permission revocation or 403 status, displays a clean lock screen preventing further board interaction.
