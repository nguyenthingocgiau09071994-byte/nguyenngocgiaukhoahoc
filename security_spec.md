# Security Specifications & Rules Design Spec

This spec outlines the security design, data invariants, adversarial attack payloads (the "Dirty Dozen"), and the validation structure for the Masterclass VN Firestore database.

## 1. Data Invariants

1. **Content Invariant**: Only authenticated users with the `admin` role (explicitly verified in `users` collection) can create, update, or delete records in the `content` collection.
2. **User Profiles Integrity**: Users can create their own profile but cannot self-assign the `role: 'admin'`. Profiles contain password hashes and must be protected from unauthorized reads and updates.
3. **Members Registry**: Members register their registration package. Once created, a member profile is private and cannot be read by other users.
4. **Course Progress Integrity**: A user can only write or update their own lesson completion progress.
5. **Q&A Conversations**: Q&A comments can be written by any registered student, but they cannot spoof other user's names, nor can they edit other student's questions.

---

## 2. The "Dirty Dozen" Payloads (Adversarial Security Test Cases)

Below are the 12 malicious payloads designed to breach system laws, which our security rules must reject (`PERMISSION_DENIED`).

### Case 1: Unauthorized Content Publication
* **Intent**: Malicious user attempts to publish a new video lesson directly.
* **Path**: `/content/hack1`
* **Payload**:
  ```json
  {
    "id": "hack1",
    "category": "business",
    "title": "Hack Lesson",
    "createdAt": "2026-07-06T00:00:00Z"
  }
  ```
* **Failure Condition**: User is not authenticated, or does not have `admin` role in `/users/{uid}`.

### Case 2: Content Deletion by Student
* **Intent**: Regular student tries to delete an existing course video.
* **Path**: `/content/b1`
* **Payload**: `DELETE` request
* **Failure Condition**: Student role is not admin.

### Case 3: Admin Privilege Escalation (Self-Assigned Admin)
* **Intent**: A student attempts to register or update their user account to have `role: "admin"`.
* **Path**: `/users/attacker@gmail.com`
* **Payload**:
  ```json
  {
    "name": "Attacker",
    "email": "attacker@gmail.com",
    "password": "hashed_password",
    "role": "admin"
  }
  ```
* **Failure Condition**: Non-admin write attempting to set `role: "admin"`.

### Case 4: Reading Another User's Profile
* **Intent**: Student A attempts to read Student B's user profile (containing password hashes).
* **Path**: `/users/student_b@gmail.com`
* **Payload**: `GET` request
* **Failure Condition**: Requester email/UID does not match `student_b@gmail.com`.

### Case 5: Email Spoofing on Progress Sync
* **Intent**: Attacker attempts to update or erase the completed progress of another student.
* **Path**: `/progress/victim@gmail.com`
* **Payload**:
  ```json
  {
    "completed": []
  }
  ```
* **Failure Condition**: Authenticated user is not `victim@gmail.com`.

### Case 6: Poisoned Document ID Attack (Junk Payload)
* **Intent**: Attacker tries to flood Firestore with extremely long and malformed document IDs (1.5KB string).
* **Path**: `/content/INVALID_ID_!!!_VERY_LONG_STRING_OVER_128_CHARS_...`
* **Payload**: `{ "id": "test" }`
* **Failure Condition**: `isValidId()` check on path variable fails.

### Case 7: Terminal State Bypass for Registrations
* **Intent**: Attacker attempts to change their member plan status or upgrade themselves for free.
* **Path**: `/members/MC-12345`
* **Payload**:
  ```json
  {
    "plan": "Mentoring"
  }
  ```
* **Failure Condition**: Non-admin write trying to modify plan or access levels.

### Case 8: Shadow Field Injection (Ghost Fields)
* **Intent**: User attempts to inject random shadow fields into their profile to exploit app parsers.
* **Path**: `/users/student@gmail.com`
* **Payload**:
  ```json
  {
    "name": "Student",
    "email": "student@gmail.com",
    "password": "pass",
    "role": "student",
    "ghost_field_premium": true
  }
  ```
* **Failure Condition**: Strict key verification fails (`data.keys().size() == N`).

### Case 9: Q&A Identity Impersonation
* **Intent**: User A attempts to write a question under User B's name in the Q&A section.
* **Path**: `/qa/b1`
* **Payload**:
  ```json
  {
    "questions": [
      {
        "name": "User B",
        "text": "Attacker's Question",
        "date": "06/07/2026"
      }
    ]
  }
  ```
* **Failure Condition**: Questions list validation ensures author identity matches current session user.

### Case 10: Denial of Wallet via Giant Text Block
* **Intent**: Attacker attempts to write a 2MB comment text in Q&A to drive up database cost.
* **Path**: `/qa/b1`
* **Payload**: String field size size check fails.
* **Failure Condition**: Text field size exceeds 5000 characters.

### Case 11: Modifying Settings/Access Map Externally
* **Intent**: Regular student tries to modify the global package access mapping.
* **Path**: `/settings/access`
* **Payload**:
  ```json
  {
    "access": { "attacker@gmail.com": "mentoring" }
  }
  ```
* **Failure Condition**: Document is in `/settings` which is strictly restricted to `isAdmin()`.

### Case 12: Invalid Timestamp Modification
* **Intent**: Client sends a self-generated future timestamp on creation.
* **Path**: `/content/new-lesson`
* **Payload**: `{ "createdAt": "2030-01-01T00:00:00Z" }`
* **Failure Condition**: Creation timestamps must match `request.time`.

---

## 3. Test Runner Specification

The Firestore Emulator Test suite (conforming to `firestore.rules.test.ts` layout) would use `@firebase/rules-unit-testing` to verify the above constraints. All twelve scenarios are programmed to trigger `assertFails` and return `PERMISSION_DENIED` on any non-authorized attempts.
