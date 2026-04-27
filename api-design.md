# CampusFit API Reference

**Version:** v1  
**Base URL:** `https://campusfit-api.up.railway.app/api/v1/`  
**Local Dev Base URL:** `http://localhost:3001/api/v1`  

**Auth:**

- Short-lived **JWT access token** via `Authorization: Bearer <token>` header  
- Long-lived **refresh token** stored in an **HttpOnly, Secure cookie** (rotation supported)

**Content-Type:** `application/json`

---

## Global Conventions

### Response Envelope

```json
// Success (single resource)
{ "success": true, "data": { ... } }

// Success (collection)
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 20, "totalItems": 87, "totalPages": 5 }
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": [
      { "field": "email", "reason": "must be a valid .edu address" }
    ]
  }
}
```

- `details` is optional. It used for validation errors.
- All timestamps are ISO 8601 UTC (e.g., `2026-02-26T12:00:00Z`), unless noted.

### Pagination

Endpoints that return collections support:

- `page` (default `1`)
- `limit` (default `20`, max varies by endpoint)

### Date & Timezone Rules

CampusFit will use each user's local time for “daily/weekly/monthly” goal windows.

- **Activity logs** use a `date` field formatted as `YYYY-MM-DD` which represents the user's local calendar date.
- Frontend will compute “today" / "this week" / "this month” using the user's local timezone.

> Important: The total of the logs will be calculated on the client side

### Aggregation Rule for Goals & Challenges

For all activity types (steps, workouts, distance, calories):

- Multiple logs per day are allowed
- Totals are computed as **sum** of logs across the chosen window

---

## Error Codes


| Status | Code               | Description                          |
| ------ | ------------------ | ------------------------------------ |
| 400    | `VALIDATION_ERROR` | Malformed or missing request fields  |
| 401    | `UNAUTHORIZED`     | Missing/invalid/expired access token |
| 403    | `FORBIDDEN`        | Authenticated but not allowed        |
| 404    | `NOT_FOUND`        | Resource does not exist              |
| 409    | `CONFLICT`         | Duplicate or conflicting state       |
| 429    | `RATE_LIMITED`     | Too many requests                    |
| 500    | `INTERNAL_ERROR`   | Unhandled server error               |


---

## Authentication

### Token Model

- **Access token:** short-lived (e.g., 15 minutes)
- **Refresh token:** long-lived cookie, rotated on refresh

#### Cookies

- Refresh cookie name: `campusfit_rt`
- Cookie flags in production: `HttpOnly; Secure; SameSite=None; Path=/api/v1/auth/refresh`

### Frontend fetch requirements (cross-origin)

All calls that rely on refresh cookie must include:

- `credentials: "include"`

---

### POST `/auth/register`

Create a new user account. **No auth required.**

**Request**

```json
{
  "username": "jdoe",
  "email": "jdoe@university.edu",
  "password": "securepassword123",
  "university": "State University"
}
```

`university` is optional.

**Response `201`**

```json
{
  "success": true,
  "data": {
    "id": "664f1b...",
    "username": "jdoe",
    "email": "jdoe@university.edu",
    "university": "State University",
    "createdAt": "2026-02-26T12:00:00Z"
  }
}
```

---

### POST `/auth/login`

Authenticates the user and sets the refresh cookie. Returns an access token. **No auth required.**

**Request**

```json
{
  "email": "jdoe@university.edu",
  "password": "securepassword123"
}
```

**Response `200`**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "expiresIn": 900
  }
}
```

**Set-Cookie (refresh token)**

- `campusfit_rt=<token>; HttpOnly; Secure; SameSite=None; Path=/api/v1/auth/refresh`

---

### POST `/auth/refresh`

Rotates refresh token and returns a new access token.  
**No Authorization header required** (refresh token is read from cookie).

**Request body:** none

**Response `200`**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbG...",
    "expiresIn": 900
  }
}
```

**Set-Cookie:** refreshed `campusfit_rt=...`

---

### POST `/auth/logout`

Clears refresh cookie (and revokes the token server-side if tracked). **Auth optional**.

**Request body:** none

**Response `200`**

```json
{
  "success": true,
  "data": { "message": "Logged out" }
}
```

---

## Users

### GET `/users/me`

Get the current user's profile. **Auth required.**

**Response `200`**

```json
{
  "success": true,
  "data": {
    "id": "664f1b...",
    "username": "jdoe",
    "email": "jdoe@university.edu",
    "university": "State University",
    "createdAt": "2026-02-26T12:00:00Z"
  }
}
```

---

### PATCH `/users/me`

Update the current user's profile. **Auth required.** All fields optional. Email is read-only.

**Request**

```json
{
  "username": "johndoe",
  "university": "State University"
}
```

`university` may be `null` to clear it.

**Response `200`** — same shape as `GET /users/me`.

---

### GET `/users/me/statistics`

Lifetime fitness statistics for the current user. **Auth required.** Used by the Profile page. `activeChallenges` is duplicated here (also on `/dashboard/stats`) so the Profile page only needs this single stats endpoint.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "totalWorkouts": 12,
    "totalCaloriesBurned": 12450,
    "completedGoals": 2,
    "activeChallenges": 3,
    "activityCountByUnit": {
      "steps": 7,
      "calories": 0,
      "distance": 0
    }
  }
}
```

- `totalWorkouts` is the count of all activity log entries for the user (every logged activity is a "workout").
- `totalCaloriesBurned` is the lifetime sum of `value` across activity logs whose goal has `unit = "calories"`.
- `completedGoals` is the count of goals with `status = "completed"`.
- `activeChallenges` is the user's number of joined challenges.
- `activityCountByUnit` is the **count** of activity logs grouped by the unit of their parent goal — drives the Profile page's Activity Breakdown chart. The `workouts` unit is intentionally excluded (already covered by `totalWorkouts`). Frontend filters out zero entries.

---

### GET `/dashboard/stats`

Aggregate "today / this week" stats used by the Dashboard. **Auth required.** All values are scoped to the current user. Lifetime totals live on `GET /users/me/statistics` instead.

**Response `200`**

```json
{
  "success": true,
  "data": {
    "todaySteps": 8230,
    "todayCalories": 420,
    "weeklyWorkoutsCurrent": 3,
    "weeklyWorkoutsTarget": 5,
    "activeGoals": 4,
    "totalGoals": 5,
    "activeChallenges": 3
  }
}
```

---

## Goals

All goal endpoints require authentication. Users can only access their own goals.

### Note: `currentValue` for a goal will be computed on the client-side as the sum of all activites logged for the current period

### GET `/goals`

List the current user's goals.


| Query Param | Type    | Default     | Description                         |
| ----------- | ------- | ----------- | ----------------------------------- |
| `page`      | integer | `1`         | Page number                         |
| `limit`     | integer | `20`        | Items per page (max 100)            |
| `status`    | string  | —           | `active`, `completed`, `all`        |
| `frequency` | string  | —           | `daily`, `weekly`, `monthly`        |
| `sort`      | string  | `createdAt` | `createdAt`, `title`, `targetValue` |
| `order`     | string  | `desc`      | `asc`, `desc`                       |


**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "664f1c...",
      "userId": "664f1b...",
      "title": "Daily Steps",
      "description": "Walk 10,000 steps every day",
      "targetValue": 10000,
      "unit": "steps",
      "frequency": "daily",
      "status": "active",
      "createdAt": "2026-02-26T12:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "totalItems": 5, "totalPages": 1 }
}
```

---

### POST `/goals`

Create a new goal.

**Request**

```json
{
  "title": "Daily Steps",
  "description": "Walk 10,000 steps every day",
  "targetValue": 10000,
  "unit": "steps",
  "frequency": "daily"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "id": "664f1c...",
    "userId": "664f1b...",
    "title": "Daily Steps",
    "description": "Walk 10,000 steps every day",
    "targetValue": 10000,
    "unit": "steps",
    "frequency": "daily",
    "status": "active",
    "createdAt": "2026-02-26T12:00:00Z"
  }
}
```

---

### GET `/goals/:goalId`

Get a specific goal. **Owner only.**

**Response `200`** Same shape as a single goal object above.

---

### PATCH `/goals/:goalId`

Update a goal. **Owner only.** All fields optional.

**Request**

```json
{
  "title": "Daily Steps (Updated)",
  "targetValue": 12000
}
```

**Response `200`** Returns the updated goal object.

---

### DELETE `/goals/:goalId`

Delete a goal and all its associated activities. **Owner only.**

**Response `200`**

```json
{
  "success": true,
  "data": { "message": "Goal deleted" }
}
```

---

## Activities

Activities are scoped to a goal for creation and listing. Deletion uses the activity ID directly.

### Activity Types & Summation

- Multiple logs per day are allowed across all activity types.
- Frontend will compute totals by summing `value` across the logs.

### GET `/goals/:goalId/activities`

List activity entries for a goal. **Owner only.**


| Query Param | Type         | Default | Description              |
| ----------- | ------------ | ------- | ------------------------ |
| `page`      | integer      | `1`     | Page number              |
| `limit`     | integer      | `20`    | Items per page (max 100) |
| `startDate` | `YYYY-MM-DD` | —       | Activities on/after      |
| `endDate`   | `YYYY-MM-DD` | —       | Activities on/before     |


**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "664f1d...",
      "goalId": "664f1c...",
      "userId": "664f1b...",
      "value": 2500,
      "date": "2026-02-26",
      "notes": "Morning walk",
      "createdAt": "2026-02-26T08:15:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "totalItems": 12, "totalPages": 1 }
}
```

---

### POST `/goals/:goalId/activities`

Log an activity entry for a goal. **Owner only.**

**Optional Idempotency**

- Frontend can send an `Idempotency-Key` header to prevent accidental duplicates on retries.

**Request**

```json
{
  "value": 2500,
  "date": "2026-02-26",
  "notes": "Morning walk"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "id": "664f1d...",
    "goalId": "664f1c...",
    "userId": "664f1b...",
    "value": 2500,
    "date": "2026-02-26",
    "notes": "Morning walk",
    "createdAt": "2026-02-26T08:15:00Z"
  }
}
```

---

### DELETE `/activities/:activityId`

Delete an activity entry. **Owner only.**

**Response `200`**

```json
{
  "success": true,
  "data": { "message": "Activity deleted" }
}
```

---

## Challenges

Challenge listings are visible to all authenticated users. Joining/leaving/logging progress will require participation context.

### GET `/challenges`

List all challenges.


| Query Param | Type    | Default     | Description                                        |
| ----------- | ------- | ----------- | -------------------------------------------------- |
| `page`      | integer | `1`         | Page number                                        |
| `limit`     | integer | `20`        | Items per page (max 50)                            |
| `frequency` | string  | —           | `daily`, `weekly`, `monthly`                       |
| `status`    | string  | `active`    | `active`, `upcoming`, `ended`, `all`               |
| `joined`    | boolean | —           | If `true`, only challenges the current user joined |
| `sort`      | string  | `startDate` | `startDate`, `participantCount`, `createdAt`       |
| `order`     | string  | `desc`      | `asc`, `desc`                                      |


**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "id": "664f1e...",
      "title": "February Step Challenge",
      "description": "Most steps in February wins",
      "frequency": "monthly",
      "unit": "steps",
      "startDate": "2026-02-01T00:00:00Z",
      "endDate": "2026-02-28T23:59:59Z",
      "participantCount": 134,
      "createdBy": "664f1b...",
      "createdAt": "2026-01-28T12:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "totalItems": 8, "totalPages": 1 }
}
```

---

### POST `/challenges`

Create a new challenge.

**Request**

```json
{
  "title": "February Step Challenge",
  "description": "Most steps in February wins",
  "frequency": "monthly",
  "unit": "steps",
  "startDate": "2026-02-01T00:00:00Z",
  "endDate": "2026-02-28T23:59:59Z"
}
```

**Response `201`** Returns the created challenge object.

---

### GET `/challenges/:challengeId`

Get details for a challenge.

**Response `200`** Returns a single challenge object.

---

### POST `/challenges/:challengeId/join`

Join a challenge. No request body — user comes from JWT.

**Response `201`**

```json
{
  "success": true,
  "data": {
    "challengeId": "664f1e...",
    "userId": "664f1b...",
    "joinedAt": "2026-02-26T12:00:00Z",
    "totalProgress": 0
  }
}
```

**Response `409`** Already joined.

---

### POST `/challenges/:challengeId/leave`

Leave a challenge.

**Response `200`**

```json
{
  "success": true,
  "data": { "message": "Left challenge" }
}
```

---

### POST `/challenges/:challengeId/progress`

Log progress toward a joined challenge. **Participant only.**  
Multiple entries per day allowed; totals are sum.

**Optional Idempotency**

- Frontend can send `Idempotency-Key` header.

**Request**

```json
{
  "value": 3200,
  "date": "2026-02-26"
}
```

**Response `201`**

```json
{
  "success": true,
  "data": {
    "challengeId": "664f1e...",
    "userId": "664f1b...",
    "entryValue": 3200,
    "date": "2026-02-26",
    "totalProgress": 15700
  }
}
```

---

### GET `/challenges/:challengeId/leaderboard`

Ranked leaderboard for a challenge (by `totalProgress` desc).


| Query Param | Type    | Default | Description              |
| ----------- | ------- | ------- | ------------------------ |
| `page`      | integer | `1`     | Page number              |
| `limit`     | integer | `20`    | Items per page (max 100) |


**Response `200`**

```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "userId": "664f1b...",
      "username": "jdoe",
      "totalProgress": 45200,
      "lastActivityDate": "2026-02-26"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "totalItems": 134, "totalPages": 7 }
}
```

---

## Rate Limiting

All responses include headers:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1709042400
```

- `X-RateLimit-Reset` is epoch seconds.
- 429 responses may include `Retry-After` header.


| Tier        | Endpoints                       | Window | Max Requests |
| ----------- | ------------------------------- | ------ | ------------ |
| Strict      | `/auth/login`, `/auth/register` | 15 min | 10           |
| Write       | All POST, PATCH, DELETE         | 1 min  | 30           |
| Read        | All GET                         | 1 min  | 100          |
| Leaderboard | `/challenges/:id/leaderboard`   | 1 min  | 30           |


`**429` Response**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many requests. Try again in 43 seconds.",
    "retryAfter": 43
  }
}
```

