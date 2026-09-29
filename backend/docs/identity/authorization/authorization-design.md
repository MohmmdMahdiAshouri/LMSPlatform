# Authorization Design

## 1. Overview

This document defines the Authorization design of the platform, following the same structure and level of detail as the Authentication design.

The platform is **School-centric**. Every meaningful resource (Course, Lesson, Role, etc.) belongs to exactly one School. A user's power to act on a resource is always evaluated **inside the context of a School**.

Core ideas:

- Every School has exactly **one Owner**, with full access to everything inside that School.
- The Owner can create **custom Roles** for the School and assign them to School members.
- A user can have **at most one Role per School** (but different Roles in different Schools).
- **Permissions** (e.g. `course:create`, `lesson:update`) are defined and seeded by the **platform**, not by Schools. Schools can only attach existing permissions to the Roles they create.
- **Instructor is not a Role.** Teaching rights on a course are a separate, course-scoped assignment (`CourseMembership`), not a School-wide Role.
- Any sensitive action performed by a **non-Owner** role must go through an **Approval Request**, reviewed by the School Owner. The Owner itself acts directly, without needing self-approval.

---

## 2. Business Requirements

| ID    | Rule                                                                                                                                                                                             |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| BR-01 | Every School must have exactly one Owner.                                                                                                                                                        |
| BR-02 | The Owner must have full access (all permissions) inside their School, by default.                                                                                                               |
| BR-03 | A School may define custom Roles, scoped only to that School.                                                                                                                                    |
| BR-04 | A Role is a named set of Permissions.                                                                                                                                                            |
| BR-05 | Permissions are defined by the platform (not by Schools) and are the same across all Schools.                                                                                                    |
| BR-06 | A School may only attach platform-defined Permissions to its Roles; it cannot invent new Permissions.                                                                                            |
| BR-07 | A user must have **at most one Role** within a given School.                                                                                                                                     |
| BR-08 | A user may hold different Roles in different Schools.                                                                                                                                            |
| BR-09 | "Instructor" is not a Role. Teaching/authoring rights on a specific Course are represented by a separate Course-scoped assignment (`CourseMembership`), independent from the user's School Role. |
| BR-10 | A Course Membership can be granted by the Course creator or by the School Owner.                                                                                                                 |
| BR-11 | Any sensitive action performed by a user who is **not** the School Owner must be submitted as an Approval Request.                                                                               |
| BR-12 | Only the School Owner can approve or reject an Approval Request for their School.                                                                                                                |
| BR-13 | An action is applied to the system only after the related Approval Request is approved (if approval was required).                                                                               |
| BR-14 | A user must not be allowed to perform an action without the required Permission.                                                                                                                 |
| BR-15 | A user must not be allowed to access or modify a resource that belongs to a different School than the one their Role is scoped to.                                                               |
| BR-16 | An authorization decision must always be either **Allow** or **Deny** — there is no partial access.                                                                                              |
| BR-17 | Removing or changing a School Owner is handled through School Management, and must always keep exactly one Owner active per School.                                                              |

---

## 3. Core Concepts

### 3.1 Permission
A fixed, atomic capability defined by the platform, e.g. `course:create`, `lesson:update`, `role:create`, `member:invite`. Permissions are **seeded** into the database by the platform and are **read-only** for Schools.

### 3.2 Role
A named, School-scoped group of Permissions.

- Every School automatically gets one system Role: **OWNER** (all permissions, not deletable, not editable, assigned only to the School's owner).
- A School Owner can create additional **custom Roles** (e.g. `role-manager`, `course-creator`) and attach any subset of platform Permissions to them.
- A Role belongs to exactly one School (except the conceptual OWNER role pattern, which exists per-School too).

### 3.3 UserSchoolRole
The assignment of exactly one Role to one user, inside one School. This is the enforcement of "one Role per user per School."

### 3.4 CourseMembership
A separate, course-scoped assignment that grants a user rights over a specific Course (e.g. `INSTRUCTOR`, `ASSISTANT`). This is **not** a School Role — a user can be an Instructor on one course and have no special School Role at all.

### 3.5 ApprovalRequest
A pending action submitted by a non-Owner user, waiting for the School Owner's decision. Holds enough information to describe **what** is being requested and to **apply it automatically** once approved.

---

## 4. Roles

### Role Context Rules
- OWNER is a system Role, automatically created with the School, holding all Permissions.
- Custom Roles are created by the Owner (or, indirectly, via an approved request) and scoped to one School.
- A user has **at most one Role per School** (`UserSchoolRole` is unique per `(userId, schoolId)`).
- A user may have different Roles in different Schools.
- Course-level teaching rights (`CourseMembership`) are independent of School Roles and are not limited to one per user — a user can be a member of multiple courses.

---

## 5. Use Cases

### UC-01 — Create Custom Role
**Goal:** Define a new Role with a set of Permissions for a School.
**Primary Actor:** School Owner (direct) / Authorized member (via request)
**Preconditions:**
- Actor is a member of the School.
- Role name is not already used in the School.
- All selected Permissions exist and are valid.

**Main flow (Owner):**
1. Identify the Owner and target School.
2. Validate the Role name.
3. Select Permissions from the platform's Permission list.
4. Create the Role directly.

**Delegated flow (non-Owner with `role:create` permission):**
1. Identify the actor, verify they hold a Role with `role:create` permission.
2. Validate name and Permissions as above.
3. Create an `ApprovalRequest` of type `ROLE_CREATE` with the proposed Role data as payload.
4. Wait for Owner review.

**Exceptions:** actor not a member of School / lacks permission / role name taken / invalid permission selected.

---

### UC-02 — Update Custom Role
**Goal:** Change the name or Permissions of an existing custom Role.
**Preconditions:** Role belongs to the School; Role is not the system OWNER role.
**Main flow:** same pattern as UC-01 — Owner applies directly; non-Owner with `role:update` permission submits an `ApprovalRequest` of type `ROLE_UPDATE`.
**Exceptions:** role not found / role is OWNER (protected) / invalid permission selected.

---

### UC-03 — Delete Custom Role
**Goal:** Remove a custom Role from a School.
**Preconditions:** Role belongs to School, is not OWNER, and has no users currently assigned (or deletion strategy must handle reassignment).
**Main flow:** Owner deletes directly; non-Owner with `role:delete` permission submits `ApprovalRequest` of type `ROLE_DELETE`.
**Exceptions:** role not found / role is OWNER / role still has assigned users.

---

### UC-04 — Assign Role to User
**Goal:** Give a School member a Role.
**Preconditions:** Target user is a School member; target user has no existing Role in this School; selected Role belongs to this School.
**Main flow:** Owner assigns directly; non-Owner with `role:assign` permission submits `ApprovalRequest` of type `ROLE_ASSIGN` containing target user + role.
**Exceptions:** target not a member / role not in School / user already has a Role in this School.

---

### UC-05 — Change User's Role
**Goal:** Replace a School member's current Role with a different one.
**Preconditions:** Target user already has a Role in the School.
**Main flow:** Owner changes directly; non-Owner with `role:assign` permission submits `ApprovalRequest` of type `ROLE_CHANGE`.
**Exceptions:** target has no current Role / new Role not in School.

---

### UC-06 — Remove User's Role
**Goal:** Remove a School member's Role entirely.
**Main flow:** Owner removes directly; non-Owner with `role:assign` permission submits `ApprovalRequest` of type `ROLE_REMOVE`.
**Exceptions:** target has no Role to remove.

---

### UC-07 — Review Approval Request
**Goal:** Approve or reject a pending request.
**Primary Actor:** School Owner
**Preconditions:** Request belongs to the Owner's School; request status is `PENDING`.
**Main flow:**
1. Identify the Owner.
2. Find the pending request.
3. Display request `type` and `payload` (what is being requested).
4. Owner approves or rejects.
5. If approved → apply the action described in `payload` (create/update/delete Role, assign/change/remove UserSchoolRole, etc.).
6. Update request status to `APPROVED` or `REJECTED`.

**Exceptions:** request not found / not pending / reviewer is not the Owner of that School / applying the action fails (e.g. role name taken meanwhile) → request marked `FAILED` with a reason, no partial state left behind.

---

### UC-08 — Assign Course Membership
**Goal:** Grant a user teaching/authoring rights on a specific Course.
**Primary Actor:** Course creator or School Owner
**Preconditions:** Actor created the Course, or is the School Owner; target user is a School member.
**Main flow:**
1. Identify the actor and verify they are the Course creator or the Owner.
2. Select the target user and the course-level right (e.g. `INSTRUCTOR`).
3. Create the `CourseMembership` directly (no approval needed — this is scoped to a single Course the actor already controls).

**Exceptions:** actor is neither creator nor Owner / target not a School member / membership already exists.

---

### UC-09 — Authorize Action (Core Decision Flow)
**Goal:** Decide Allow/Deny for any protected operation.
**Primary Actor:** System (`AuthorizationService`), triggered on every protected request.
**Main flow:**
1. Verify the request is authenticated (has a valid user).
2. Verify the user is a member of the target School.
3. Verify the target resource belongs to that same School (or the target Course, for course-scoped actions).
4. Load the user's Role in that School (or Course Membership, for course-scoped actions) and its Permissions.
5. Check whether the required Permission is present.
6. Return **Allow** or **Deny**.

**Exceptions:** not authenticated → Deny / not a School member → Deny / resource belongs to a different School → Deny / permission missing → Deny.

---

## 6. Business Rules

- BR-A1: The OWNER Role cannot be edited, deleted, or reassigned outside of School ownership transfer.
- BR-A2: `role:*` Permissions only affect Roles within the actor's own School.
- BR-A3: An `ApprovalRequest` payload must contain everything needed to apply the action without asking the actor again.
- BR-A4: Approving a request must be atomic — either the change is fully applied and the request marked `APPROVED`, or nothing changes and it's marked `FAILED`.
- BR-A5: `CourseMembership` does not grant any School-wide Permission — it only grants rights scoped to that one Course.
- BR-A6: A Permission check always requires School (or Course) match first; a correct Permission on the wrong School/Course is still Deny.

---

## 7. Domain Entities

- **Permission** — `id`, `key` (e.g. `course:create`), `description`. Seeded by platform, read-only for Schools.
- **Role** — `id`, `schoolId`, `name`, `isSystem` (true only for OWNER), `permissions[]` (via join table).
- **RolePermission** — join table: `roleId`, `permissionId`.
- **UserSchoolRole** — `id`, `userId`, `schoolId`, `roleId`. Unique on `(userId, schoolId)`.
- **CourseMembership** — `id`, `userId`, `courseId`, `courseRole` (e.g. `INSTRUCTOR`, `ASSISTANT`), `assignedBy`.
- **ApprovalRequest** — `id`, `schoolId`, `requestedBy`, `type` (enum: `ROLE_CREATE`, `ROLE_UPDATE`, `ROLE_DELETE`, `ROLE_ASSIGN`, `ROLE_CHANGE`, `ROLE_REMOVE`, ...), `payload` (JSON), `status` (`PENDING`/`APPROVED`/`REJECTED`/`FAILED`), `reviewedBy`, `reviewedAt`, `failureReason`.

---

## 8. Domain Events

- `RoleCreated`, `RoleUpdated`, `RoleDeleted`
- `UserRoleAssigned`, `UserRoleChanged`, `UserRoleRemoved`
- `CourseMembershipAssigned`, `CourseMembershipRemoved`
- `ApprovalRequestCreated`, `ApprovalRequestApproved`, `ApprovalRequestRejected`, `ApprovalRequestFailed`

---

## 9. Domain Modules

- **Authorization Module** — owns `Permission`, `Role`, `RolePermission`, `UserSchoolRole`, `ApprovalRequest`, and exposes `AuthorizationService`.
- **School Module** — owns `School`, ownership transfer logic; triggers creation of the system OWNER Role when a School is created.
- **Course Module** — owns `Course` and `CourseMembership`; calls into `AuthorizationService` for course-scoped checks but keeps membership data local.

---

## 10. Architecture

### 10.1 AuthorizationService (no logic in the Guard)

```
AuthorizationService.check({
  userId,
  schoolId,        // or courseId for course-scoped actions
  permission,       // e.g. "course:create"
  resourceSchoolId, // school the target resource actually belongs to
}): Allow | Deny
```

Steps performed inside the service (matches UC-09):
1. Confirm user is authenticated.
2. Confirm user is a member of `schoolId`.
3. Confirm `resourceSchoolId === schoolId`.
4. Load Role (or CourseMembership) and its Permissions.
5. Confirm `permission` is included.
6. Return Allow/Deny.

### 10.2 Guard
A thin `AuthorizationGuard` reads a `@RequirePermission('course:create')` decorator from the route, extracts `userId`/`schoolId`/`resourceSchoolId` from the request, and simply calls `AuthorizationService.check(...)`. The Guard contains **no business logic** — it only wires the request into the service.

### 10.3 Approval flow
Write operations behind sensitive Permissions are split into two paths in the same handler/service:
- If actor is the Owner → apply directly.
- Else → create an `ApprovalRequest` with `type` + `payload`, return "pending" to the actor.
On approval (UC-07), a small dispatcher maps `request.type` → the same internal apply-function used in the direct Owner path, so the logic is written once and reused.

---

## 11. ERD (simplified)

```
School (1) ── owns ──> (N) Role
Role (N) ── has ──> (N) Permission        [via RolePermission]
School (1) ── has ──> (N) UserSchoolRole
User (1) ── has ──> (N) UserSchoolRole    [unique per (userId, schoolId)]
UserSchoolRole (N) ── references ──> (1) Role
Course (1) ── has ──> (N) CourseMembership
User (1) ── has ──> (N) CourseMembership
School (1) ── has ──> (N) ApprovalRequest
User (1) ── requests ──> (N) ApprovalRequest
```

---

## 12. Endpoints

```
# Roles
POST   /schools/:schoolId/roles                 -> create role (direct or via request)
PATCH  /schools/:schoolId/roles/:roleId          -> update role (direct or via request)
DELETE /schools/:schoolId/roles/:roleId          -> delete role (direct or via request)
GET    /schools/:schoolId/roles                  -> list roles
GET    /schools/:schoolId/roles/:roleId          -> role detail

# Permissions (read-only, platform-defined)
GET    /permissions                              -> list all platform permissions

# User Roles
POST   /schools/:schoolId/members/:userId/role        -> assign role
PATCH  /schools/:schoolId/members/:userId/role        -> change role
DELETE /schools/:schoolId/members/:userId/role        -> remove role

# Approval Requests
GET    /schools/:schoolId/requests                -> list pending/handled requests
GET    /schools/:schoolId/requests/:requestId      -> request detail
POST   /schools/:schoolId/requests/:requestId/approve
POST   /schools/:schoolId/requests/:requestId/reject

# Course Membership
POST   /courses/:courseId/members                -> assign course membership
DELETE /courses/:courseId/members/:userId         -> remove course membership
GET    /courses/:courseId/members                 -> list course members
```