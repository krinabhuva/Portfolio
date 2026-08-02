# Richardson Maturity Model Evaluation

This document evaluates the **Express Task Manager REST API** against the **Richardson Maturity Model (RMM)**. Developed by Leonard Richardson, the model defines a roadmap for classifying RESTful web services into four maturity levels (0 through 3) based on their usage of URIs, HTTP methods, HTTP status codes, and hypermedia controls.

---

## 1. Overview of Richardson Maturity Model Levels

### Level 0: The Swamp of POX (Plain Old XML / HTTP)
* **Description:** HTTP is used merely as a transport mechanism for Remote Procedure Calls (RPC).
* **Endpoints:** Uses a single URI endpoint (e.g., `/api` or `/service.php`) for all operations.
* **HTTP Methods & Status Codes:** Uses a single HTTP verb (typically `POST`). Responses almost universally return HTTP `200 OK` regardless of whether the action succeeded or failed, wrapping domain errors in the response body payload.

### Level 1: Resources
* **Description:** Introduces individual resource URIs to break down monolithic endpoints into resource-oriented URIs.
* **Endpoints:** Multiple endpoints represent specific resources or collections (e.g., `/tasks`, `/tasks/1`).
* **HTTP Methods & Status Codes:** Uses discrete URIs for resources, but still relies on a single HTTP method (typically `POST` or `GET`) for all CRUD actions without taking advantage of standard HTTP verbs or status code semantics.

### Level 2: HTTP Verbs & Status Codes
* **Description:** Leverages standard HTTP verbs according to their semantic definitions and utilizes standard HTTP status codes to communicate outcome states.
* **Endpoints:** Resource-based URIs (`/tasks`, `/tasks/:id`).
* **HTTP Verbs:** Employs `GET` for reading, `POST` for creating, `PUT` (or `PATCH`) for updating, and `DELETE` for removing resources.
* **HTTP Status Codes:** Uses semantic status codes to report response status:
  * `200 OK`: Successful read, update, or deletion operations.
  * `201 Created`: Successful creation of a new resource.
  * `400 Bad Request`: Client validation errors or invalid request bodies/parameters.
  * `404 Not Found`: Non-existent resource URIs or invalid task IDs.
  * `500 Internal Server Error`: Unhandled server-side exceptions.

### Level 3: Hypermedia Controls (HATEOAS)
* **Description:** Implements **Hypermedia As The Engine Of Application State (HATEOAS)**.
* **Navigation:** Responses embed hypermedia controls (`_links`) informing the client about available state transitions and valid action URLs directly within the payload.
* **Client Interaction:** Clients navigate the API dynamically using discoverable hypermedia links without needing hardcoded URI endpoints.

---

## 2. API Evaluation Table

| Level | Criterion | Satisfied | Evidence |
| :--- | :--- | :--- | :--- |
| **Level 0** | Single endpoint vs resources | **No** | The API does **not** rely on a single monolithic endpoint (such as `/api`). Instead, it divides functionality across resource-specific paths. |
| **Level 1** | Resource-based URLs (`/tasks`, `/tasks/:id`) | **Yes** | Resources are addressed via distinct, noun-based URIs: `/tasks` represents the task collection, while `/tasks/:id` targets individual task resources. |
| **Level 2** | Correct HTTP methods (`GET`, `POST`, `PUT`, `DELETE`) and HTTP status codes (`200`, `201`, `400`, `404`, `500`) | **Yes** | Routes map operations to semantic HTTP methods (`GET /tasks`, `GET /tasks/:id`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`). Responses return correct HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `404 Not Found`, and `500 Internal Server Error`). |
| **Level 3** | HATEOAS not implemented | **No** | Response payloads return raw JSON objects representing task data without embedded hypermedia controls (`_links`) or relational navigation links. |

---

## 3. Maturity Level Conclusion

The current **Express Task Manager API satisfies Level 2** of the Richardson Maturity Model. It effectively combines resource-oriented URI design, proper HTTP verbs (`GET`, `POST`, `PUT`, `DELETE`), and standard HTTP response status codes (`200`, `201`, `400`, `404`, `500`).

---

## 4. HATEOAS Awareness Example

If Level 3 (HATEOAS) were implemented, fetching a single task (`GET /tasks/1`) would include hypermedia links (`_links`) describing available operations:

```json
{
  "id":1,
  "title":"Task",
  "_links":{
    "self":"/tasks/1",
    "update":"/tasks/1",
    "delete":"/tasks/1",
    "collection":"/tasks"
  }
}
```

---

## 5. Why Most Production APIs Stop at Level 2

Most real-world production APIs stop at Level 2 because HATEOAS adds significant payload overhead, dynamic link generation costs, and client parsing complexity without providing substantial practical benefits. Modern client applications (web and mobile) rely on static routes, type-safe API clients, and standardized documentation like OpenAPI/Swagger. Since front-end developers already know the API structure in advance, dynamic link discovery is rarely needed, making Level 2 the pragmatic industry standard.
