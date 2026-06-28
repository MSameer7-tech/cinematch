# CineMatch Engineering Principles

Version: 1.0

Status: Draft

---

This document outlines the core engineering and design principles that guide the development of CineMatch. These principles serve as the decision-making framework for architectural, database, and implementation choices.

---

### Principle 1: Single Source of Truth
Never duplicate data without a clear, justified reason.
*   **Example:** Expiration dates are calculated dynamically rather than stored (e.g., guest sessions).

### Principle 2: Delegate Core Infrastructure
Leverage platform capabilities instead of rebuilding them.
*   **Example:** Authentication credentials, hashing, and recovery are managed exclusively by Supabase Auth rather than the application database.

### Principle 3: Store Only Application Domain State
Do not duplicate metadata or properties managed by external systems.
*   **Example:** We store only the stable provider identity (`provider_user_id`) for OAuth accounts rather than duplicating profile details like emails, display names, or avatars that may change.

### Principle 4: Single Responsibility
Every table, service, and component must have a single, clearly defined responsibility.
*   **Example:** User profiles, sessions, and preferences are kept in distinct tables to avoid mixing concerns.

### Principle 5: Dynamic over Static
Prefer calculated values over stored values when practical.
*   **Example:** Session expiration and recommendation scoring thresholds are computed at runtime to prevent database synchronization issues.

### Principle 6: Clarity over Premature Optimization
Optimize for readability and maintainability first, and performance second.
*   **Example:** Write clean, standard SQL/queries, and only introduce indexes, caching, or complex denormalization after measuring bottlenecks.
