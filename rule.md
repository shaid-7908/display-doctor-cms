# Coding Rules & Design Patterns

This document describes the standard patterns and conventions for developing pages and APIs in the Display Doctor CMS. Adhering to these rules ensures consistency, readability, and ease of maintenance across the application.

---

## 1. EJS Page with Table Pattern

Any admin interface displaying an entity list in a table format with CRUD actions, search filters, and server-side pagination should follow the standard structure established in [issue-admin.ejs](file:///c:/Users/Shahid/OneDrive/Desktop/diplay-doctor-cms/wts-nest-setup-release-1.0/views/cms/issue-admin.ejs).

### 1.1 HTML/EJS Shell and Layout
Every admin page must include the header template setup, standard styling, and the common sidebar/topbar components.

*   **Document Header & Meta**: Include standard character sets, responsiveness viewports, and page title interpolation.
    ```html
    <title><%= title %> - <%= projectName %></title>
    ```
*   **CSS Stylesheets**: Reference the standard SB Admin 2 style sheets.
    ```html
    <link href="/vendor/fontawesome-free/css/all.min.css" rel="stylesheet" type="text/css">
    <link href="https://fonts.googleapis.com/css?family=Nunito:200...900" rel="stylesheet">
    <link href="/css/sb-admin-2.min.css" rel="stylesheet">
    ```
*   **Page Elements Integration**: Use standard EJS includes for the layout system.
    ```html
    <div id="wrapper">
        <%- include('common/sidebar') %>
        <div id="content-wrapper" class="d-flex flex-column">
            <div id="content">
                <%- include('common/topbar') %>
                <div class="container-fluid">
                    <!-- Page Contents -->
                </div>
            </div>
            <!-- Standard Footer -->
        </div>
    </div>
    ```

---

### 1.2 Elements of the Page Body
The page content must have three main sections inside the `.container-fluid`:

1.  **Header**: Displaying the title `<%= pageName %> Management` and a button to trigger the creation modal:
    ```html
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
        <h1 class="h3 mb-0 text-gray-800"><%= pageName %> Management</h1>
        <button class="btn btn-primary btn-sm shadow-sm" data-toggle="modal" data-target="#entityModal" id="addEntityBtn">
            <i class="fas fa-plus fa-sm text-white-50"></i> Create New [Entity]
        </button>
    </div>
    ```
2.  **Filter Card**: A `.card.shadow.mb-4` containing a filter form with search inputs and dropdowns, along with a "Reset" button.
3.  **Data Table Card**: A card containing the table itself and pagination elements:
    *   Table should be wrapped in `.table-responsive`.
    *   Include headers (`<thead>`) and a body (`<tbody id="entityTableBody">`) where dynamic content is loaded via AJAX.
    *   Include a pagination container with an entry count description and nav links:
        ```html
        <div class="pagination-container">
            <div id="paginationInfo">Showing 0 to 0 of 0 entries</div>
            <nav>
                <ul class="pagination mb-0" id="paginationList"></ul>
            </nav>
        </div>
        ```

---

### 1.3 Modals (Creation, Modification, and Custom Actions)
Modals must reside at the bottom of the page before the scripts.
*   **Forms inside Modals**: The modal body should wrap inputs in a `<form>` element.
*   **Hidden Primary Keys**: Always include an `<input type="hidden" id="entity_id">` to distinguish between Create and Edit operations.
*   **Segmented Field Containers**: Separate fields into semantic sections using container divs (e.g., `#coreFields`, `#editFields`, `#lockedFields`) if the fields should be displayed selectively depending on the entry state or mode (Create vs. Edit).
*   **Locked States**: If an entry reaches a terminal state (like `PAID` or `INVOICE_GENERATED`), show a locked banner and toggle the form field groups to prevent modifications while allowing only cancellations.

---

### 1.4 Client-Side JavaScript & JQuery Implementation
All page interactions, table queries, and AJAX CRUD actions are handled by client-side Javascript.

#### 1.4.1 State Management Variables
At the top of the `$(document).ready` block, define the following variables:
*   `currentPage` (defaults to `1`)
*   `limit` (defaults to `10` or a consistent default)
*   `isEdit` (boolean indicating if the modal is currently editing an item)
*   `globEditEntity` (stores the original object data currently being edited)

#### 1.4.2 Fetching and Rendering List Data
Implement a `loadEntities()` function using an AJAX `POST` call pointing to `/v1/admin/{entity}/getall`.

*   **API Payload**: Pass a JSON payload specifying `page`, `limit`, `search`, and active filters.
*   **Table Content States**: Show a loading placeholder (`<tr><td colspan="X" class="text-center">Loading...</td></tr>`) before triggering the request. Handle request failures gracefully.
*   **Rendering Rows**: Dynamic markup mapping fields to HTML strings:
    *   Format Date strings using `new Date(item.createdAt).toLocaleDateString()`.
    *   Style status variables with status badges matching status colors (defined in `<style>` tag).
    *   Provide explicit `data-id` attributes on control buttons.
*   **Pagination Rendering**:
    ```javascript
    function renderPagination(meta) { ... }
    function updatePaginationInfo(meta) { ... }
    ```
    *   *Note*: The pagination logic should calculate page offsets dynamically from standard API metadata (`meta.totalDocs`, `meta.page`, `meta.limit`, `meta.hasPrevPage`, `meta.hasNextPage`).

#### 1.4.3 Form Actions (Create and Edit Submission)
*   **Modal Form Submission**: Prevent default action, determine if `isEdit` is true or false.
    *   **Create (POST)**: Gather active inputs and send them to `/v1/admin/{entity}` via `POST`.
    *   **Edit (PATCH)**: Gather modified fields (compare with `globEditEntity` to only send delta changes or standard parameters) and send them to `/v1/admin/{entity}/${id}` via `PATCH`.
*   **Loading Indicators**: Disable the submission button during API processing (e.g., change button text to "Saving...").
*   **UI Refresh**: Upon success, close the modal, display an alert with the success message, and call `loadEntities()` to refresh the table.

#### 1.4.4 Delete & custom triggers
*   **Confirm Action**: Always wrap destructive actions in a browser-native confirmation prompt: `confirm('Are you sure you want to delete this [entity]?')`.
*   **Delete request**: Call `/v1/admin/{entity}/${id}` via `DELETE` type. Update table on success.
