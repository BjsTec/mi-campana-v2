# Documentación del Backend - Mi Campaña v2 (Supabase - Final)

Este documento detalla la estructura de la base de datos PostgreSQL utilizada en Supabase para la aplicación "Mi Campaña v2", actualizada para reflejar los roles administrativos, modelo freemium, gestión de PQR y web comercial.

## Esquema General

La base de datos está diseñada para soportar la gestión de campañas políticas, incluyendo la estructura jerárquica del equipo, el seguimiento de potenciales votantes (leads), gestión de reuniones, escrutinio, y administración de la plataforma multi-cliente. Se utiliza Supabase Auth para la autenticación de usuarios.

## Tipos ENUM Definidos

* **`user_role`**: ('CANDIDATO', 'GERENTE', 'ANILLO', 'VOTANTE', 'ESCRUTADOR', 'WEBMASTER', 'SUPERADMIN')
* **`campaign_status`**: ('ACTIVE', 'INACTIVE', 'ARCHIVED')
* **`lead_status`**: ('PENDING', 'CONTACTED', 'SUPPORTER', 'REJECTED', 'INVALID', 'CONVERTED')
* **`vote_intention`**: ('YES', 'NO', 'UNDECIDED', 'UNKNOWN')
* **`lead_source`**: ('FORMULARIO', 'REUNION', 'WEB_COMERCIAL')
* **`pqr_status`**: ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')

## Descripción de Tablas

### `plans`
Gestiona los diferentes tiers (Demo, Gratuito, Pagos) y sus limitaciones.

| Columna                | Tipo         | Descripción                                    | Constraints/Notas                   |
| :--------------------- | :----------- | :--------------------------------------------- | :---------------------------------- |
| id                     | text         | Clave Primaria (ej. 'demo_limitado')           |                                     |
| name                   | text         | Nombre del plan                                | NOT NULL                            |
| description            | text         | Descripción                                    |                                     |
| max_members            | integer      | Límite total de miembros (null = ilimitado)    |                                     |
| max_leads              | integer      | Límite total de leads activos (null = ilimitado)|                                     |
| max_depth              | integer      | Profundidad máxima de pirámide                 | CHECK > 0                           |
| max_direct_recruits    | integer      | Máx. reclutados directos por usuario           | CHECK >= 0                          |
| demo_duration_days     | integer      | Duración si es plan demo                       |                                     |
| price_monthly          | numeric      | Precio mensual                                 | (10, 2), DEFAULT 0.00               |
| allowed_campaign_types | text[]       | Array de IDs de tipos de campaña permitidos    |                                     |
| features               | jsonb        | Flags de características (ej. `{"ai": true}`)  | DEFAULT '{}'::jsonb                 |
| is_active              | boolean      | Si el plan está activo                         | NOT NULL, DEFAULT true              |
| created_at             | timestamptz  | Fecha de creación                              | NOT NULL, DEFAULT now()             |
| updated_at             | timestamptz  | Última actualización                           | NOT NULL, DEFAULT now(), Trigger    |

### `profiles`
Información adicional del usuario, vinculada a `auth.users`.

| Columna      | Tipo        | Descripción                       | Constraints/Notas                          |
| :----------- | :---------- | :-------------------------------- | :----------------------------------------- |
| id           | uuid        | PK, FK a `auth.users.id`          | ON DELETE CASCADE                          |
| full_name    | text        | Nombre completo                   | NOT NULL                                   |
| email        | text        | Correo electrónico                | UNIQUE, NOT NULL                           |
| phone        | text        | Teléfono                          |                                            |
| role         | user_role   | Rol en la plataforma              | NOT NULL, DEFAULT 'VOTANTE'                |
| avatar_url   | text        | URL imagen de perfil              |                                            |
| is_verified  | boolean     | Verificado (para Equipo Trabajo)  | NOT NULL, DEFAULT false                    |
| is_deleted   | boolean     | Marcador de borrado lógico        | NOT NULL, DEFAULT false                    |
| deleted_at   | timestamptz | Fecha de borrado lógico           |                                            |
| created_at   | timestamptz | Fecha de creación                 | NOT NULL, DEFAULT now()                    |
| updated_at   | timestamptz | Última actualización              | NOT NULL, DEFAULT now(), Trigger           |

### `global_variables`
Configuraciones globales y tipos de campaña.

| Columna          | Tipo    | Descripción                              | Constraints/Notas         |
| :--------------- | :------ | :--------------------------------------- | :------------------------ |
| key              | text    | Clave Primaria (Nombre variable/tipo)    |                           |
| value            | jsonb   | Valor (puede ser config o detalles tipo) | NOT NULL                  |
| description      | text    | Descripción opcional                     |                           |
| is_campaign_type | boolean | Indica si es un tipo de campaña          | NOT NULL, DEFAULT false   |

### `campaigns`
Define las campañas políticas.

| Columna                 | Tipo             | Descripción                         | Constraints/Notas                        |
| :---------------------- | :--------------- | :---------------------------------- | :--------------------------------------- |
| id                      | uuid             | PK                                  | DEFAULT uuid_generate_v4()             |
| name                    | text             | Nombre                              | NOT NULL                                 |
| campaign_type_id        | text             | FK a `global_variables.key`         | NOT NULL, ON DELETE RESTRICT             |
| candidate_id            | uuid             | FK a `profiles.id` (Candidato)      | NOT NULL, ON DELETE RESTRICT             |
| plan_id                 | text             | FK a `plans.id`                     | NOT NULL, DEFAULT 'equipo_trabajo'       |
| demo_expires_at         | timestamptz      | Fecha expiración demo               |                                          |
| start_date              | date             | Fecha inicio                        |                                          |
| election_date           | date             | Fecha elecciones                    | NOT NULL                                 |
| goal_potential_votes    | integer          | Meta potenciales                    | DEFAULT 0                                |
| goal_confirmed_votes    | integer          | Meta confirmados                    | DEFAULT 0                                |
| total_potential_votes   | integer          | Total potenciales (calculado)       | DEFAULT 0                                |
| total_confirmed_votes | integer          | Total confirmados (calculado)       | DEFAULT 0                                |
| status                  | campaign_status  | Estado                              | NOT NULL, DEFAULT 'ACTIVE'               |
| form_config             | jsonb            | Configuración formulario público    | DEFAULT '{}'::jsonb                      |
| public_form_slug        | text             | Slug URL formulario público         | UNIQUE                                   |
| logo_url                | text             | URL logo                            |                                          |
| color_primary           | text             | Color primario                      |                                          |
| color_secondary         | text             | Color secundario                    |                                          |
| is_deleted              | boolean          | Borrado lógico                      | NOT NULL, DEFAULT false                    |
| deleted_at              | timestamptz      | Fecha borrado lógico                |                                          |
| created_at              | timestamptz      | Fecha creación                      | NOT NULL, DEFAULT now()                  |
| updated_at              | timestamptz      | Última actualización                | NOT NULL, DEFAULT now(), Trigger           |

### `campaign_memberships`
Pertenencia y jerarquía dentro de una campaña.

| Columna               | Tipo        | Descripción                       | Constraints/Notas                             |
| :-------------------- | :---------- | :-------------------------------- | :-------------------------------------------- |
| id                    | uuid        | PK                                | DEFAULT uuid_generate_v4()                  |
| campaign_id           | uuid        | FK a `campaigns.id`               | NOT NULL, ON DELETE CASCADE                   |
| user_id               | uuid        | FK a `profiles.id`                | NOT NULL, ON DELETE CASCADE                   |
| recruiter_id          | uuid        | FK a `profiles.id` (Reclutador)   | ON DELETE SET NULL                            |
| level                 | integer     | Nivel jerárquico (0-3)            | NOT NULL, CHECK (0 <= level <= 3)             |
| permissions           | jsonb       | Permisos asignados por superior   | DEFAULT '{}'::jsonb                           |
| votos_promesa         | integer     | Promesa informada al superior     | DEFAULT 0, CHECK >= 0                         |
| promesa_real          | integer     | Estimación del superior           | DEFAULT 0, CHECK >= 0                         |
| direct_recruits_count | integer     | Conteo directos (trigger)         | DEFAULT 0                                     |
| is_active             | boolean     | Si la membresía está activa       | NOT NULL, DEFAULT true                        |
| joined_at             | timestamptz | Fecha de unión                    | NOT NULL, DEFAULT now()                       |
|                       |             |                                   | UNIQUE(campaign_id, user_id)                  |

### `leads`
Potenciales votantes registrados.

| Columna                      | Tipo           | Descripción                          | Constraints/Notas                            |
| :--------------------------- | :------------- | :----------------------------------- | :------------------------------------------- |
| id                           | uuid           | PK                                   | DEFAULT uuid_generate_v4()                 |
| campaign_id                  | uuid           | FK a `campaigns.id`                  | NOT NULL, ON DELETE CASCADE                  |
| full_name                    | text           | Nombre completo                      | NOT NULL                                     |
| phone                        | text           | Teléfono                             |                                              |
| email                        | text           | Correo electrónico                   |                                              |
| address, city, state, country| text           | Ubicación                            | country DEFAULT 'Colombia'                   |
| status                       | lead_status    | Estado del lead                      | NOT NULL, DEFAULT 'PENDING'                  |
| source                       | lead_source    | Origen (Formulario, Reunión, Web)    | NOT NULL, DEFAULT 'REUNION'                  |
| assigned_member_id         | uuid           | FK a `profiles.id` (Asignado)        | ON DELETE SET NULL                           |
| recruited_by_member_id       | uuid           | FK a `profiles.id` (Registrador)     | ON DELETE SET NULL                           |
| converted_to_membership_id | uuid           | FK a `campaign_memberships.id`       | ON DELETE SET NULL                           |
| vote_intention               | vote_intention | Intención de voto                    | NOT NULL, DEFAULT 'UNKNOWN'                  |
| notes                        | text           | Notas                                |                                              |
| is_deleted                   | boolean        | Borrado lógico                       | NOT NULL, DEFAULT false                    |
| deleted_at                   | timestamptz    | Fecha borrado lógico                 |                                              |
| created_at                   | timestamptz    | Fecha creación                       | NOT NULL, DEFAULT now()                      |
| updated_at                   | timestamptz    | Última actualización                 | NOT NULL, DEFAULT now(), Trigger           |

### `meetings`
Reuniones programadas por miembros de campaña.

| Columna                  | Tipo        | Descripción                  | Constraints/Notas              |
| :----------------------- | :---------- | :--------------------------- | :----------------------------- |
| id                       | uuid        | PK                           | DEFAULT uuid_generate_v4()   |
| campaign_id              | uuid        | FK a `campaigns.id`          | NOT NULL, ON DELETE CASCADE    |
| organizer_id             | uuid        | FK a `profiles.id`           | NOT NULL, ON DELETE CASCADE    |
| title                    | text        | Título                       | NOT NULL                       |
| description              | text        | Descripción                  |                                |
| meeting_time             | timestamptz | Fecha y Hora                 | NOT NULL                       |
| location                 | text        | Ubicación                    |                                |
| google_calendar_event_id | text        | ID Evento Google Calendar    |                                |
| created_at               | timestamptz | Fecha creación               | NOT NULL, DEFAULT now()        |
| updated_at               | timestamptz | Última actualización         | NOT NULL, DEFAULT now(), Trigger|

### `meeting_attendees`
Vincula reuniones con los leads generados a partir de ellas.

| Columna    | Tipo        | Descripción            | Constraints/Notas           |
| :--------- | :---------- | :--------------------- | :-------------------------- |
| id         | uuid        | PK                     | DEFAULT uuid_generate_v4()|
| meeting_id | uuid        | FK a `meetings.id`     | NOT NULL, ON DELETE CASCADE |
| lead_id    | uuid        | FK a `leads.id`        | NOT NULL, ON DELETE CASCADE |
| attended   | boolean     | Si asistió             | NOT NULL, DEFAULT true      |
| created_at | timestamptz | Fecha creación         | NOT NULL, DEFAULT now()     |
|            |             |                        | UNIQUE(meeting_id, lead_id) |

### `escrutador_assignments`
Asignaciones de escrutadores a puestos de votación.

| Columna                | Tipo        | Descripción             | Constraints/Notas                         |
| :--------------------- | :---------- | :---------------------- | :---------------------------------------- |
| id                     | uuid        | PK                      | DEFAULT uuid_generate_v4()              |
| campaign_id            | uuid        | FK a `campaigns.id`     | NOT NULL, ON DELETE CASCADE               |
| user_id                | uuid        | FK a `profiles.id`      | NOT NULL, ON DELETE CASCADE               |
| polling_station_name | text        | Nombre puesto votación  | NOT NULL                                  |
| polling_station_code | text        | Código DANE             |                                           |
| city, state, country   | text        | Ubicación puesto        | NOT NULL, country DEFAULT 'Colombia'      |
| latitude, longitude    | numeric     | Coordenadas             | (10, 7)                                   |
| can_report             | boolean     | Habilitado para reportar| NOT NULL, DEFAULT false                   |
| is_deleted             | boolean     | Borrado lógico          | NOT NULL, DEFAULT false                   |
| deleted_at             | timestamptz | Fecha borrado lógico    |                                           |
| created_at             | timestamptz | Fecha creación          | NOT NULL, DEFAULT now()                   |
| updated_at             | timestamptz | Última actualización    | NOT NULL, DEFAULT now(), Trigger        |
|                        |             |                         | UNIQUE(campaign_id, user_id, polling_station_name) |

### `escrutinio_results`
Resultados de escrutinio reportados por mesa.

| Columna         | Tipo        | Descripción               | Constraints/Notas                       |
| :-------------- | :---------- | :------------------------ | :-------------------------------------- |
| id              | uuid        | PK                        | DEFAULT uuid_generate_v4()            |
| assignment_id   | uuid        | FK a `assignments.id`   | NOT NULL, ON DELETE CASCADE             |
| table_number    | text        | Número de mesa            | NOT NULL                                |
| vote_count      | integer     | Votos para el candidato   | NOT NULL, CHECK >= 0                    |
| photo_url       | text        | URL Foto E-14 (Storage) | NOT NULL                                |
| report_timestamp| timestamptz | Momento del reporte       | NOT NULL, DEFAULT now()                 |
| reporter_id     | uuid        | FK a `profiles.id`        | NOT NULL, ON DELETE RESTRICT            |
| latitude        | numeric     | Geolocalización reporte   | (10, 7)                                 |
| longitude       | numeric     | Geolocalización reporte   | (10, 7)                                 |
| created_at      | timestamptz | Fecha creación            | NOT NULL, DEFAULT now()                 |
|                 |             |                           | UNIQUE(assignment_id, table_number)     |

### `pqr_tickets`
Gestión de Peticiones, Quejas y Reclamos.

| Columna           | Tipo        | Descripción                     | Constraints/Notas           |
| :---------------- | :---------- | :------------------------------ | :-------------------------- |
| id                | uuid        | PK                              | DEFAULT uuid_generate_v4()|
| reporter_user_id  | uuid        | FK a `profiles.id` (Opcional)   | ON DELETE SET NULL          |
| reporter_name     | text        | Nombre (si no es usuario)       |                             |
| reporter_email    | text        | Email (si no es usuario)        |                             |
| subject           | text        | Asunto                          | NOT NULL                    |
| description       | text        | Descripción                     | NOT NULL                    |
| status            | pqr_status  | Estado del ticket               | NOT NULL, DEFAULT 'OPEN'    |
| assigned_admin_id | uuid        | FK a `profiles.id` (Asignado)   | ON DELETE SET NULL          |
| resolution_notes  | text        | Notas de resolución             |                             |
| created_at        | timestamptz | Fecha creación                  | NOT NULL, DEFAULT now()     |
| updated_at        | timestamptz | Última actualización            | NOT NULL, DEFAULT now(), Trigger|

### `web_commercial_leads`
Leads capturados desde la web comercial principal (no ligados a campaña).

| Columna              | Tipo        | Descripción                   | Constraints/Notas           |
| :------------------- | :---------- | :---------------------------- | :-------------------------- |
| id                   | uuid        | PK                            | DEFAULT uuid_generate_v4()|
| full_name            | text        | Nombre completo               | NOT NULL                    |
| email                | text        | Correo electrónico            | UNIQUE, NOT NULL            |
| phone                | text        | Teléfono                      |                             |
| message              | text        | Mensaje formulario            |                             |
| source               | text        | Origen (ej. 'contact_form') |                             |
| status               | text        | Estado (ej. 'NEW')            | DEFAULT 'NEW'               |
| converted_profile_id | uuid        | FK a `profiles.id` (si aplica)| ON DELETE SET NULL          |
| created_at           | timestamptz | Fecha creación                | NOT NULL, DEFAULT now()     |
| updated_at           | timestamptz | Última actualización          | NOT NULL, DEFAULT now(), Trigger|

## Seguridad (RLS - Row Level Security)

RLS está habilitado en todas las tablas relevantes. Es **fundamental** implementar políticas específicas y detalladas para cada tabla, asegurando el acceso basado en roles (`SUPERADMIN`, `WEBMASTER`, `CANDIDATO`, `GERENTE`, `ANILLO`, `VOTANTE`, `ESCRUTADOR`) y la jerarquía (`recruiter_id` en `campaign_memberships`). El borrado lógico (`is_deleted`) debe ser considerado en las políticas SELECT/UPDATE/DELETE para usuarios no-SUPERADMIN.

## Funciones y Triggers

* **`moddatetime` (Extensión):** Utilizada para actualizar automáticamente los campos `updated_at`.
* **`get_my_role()`**: Función auxiliar (SECURITY DEFINER) para verificar el rol del usuario autenticado actual, crucial para RLS.
* **Triggers Adicionales (Recomendados):**
    * Para actualizar `direct_recruits_count` en `campaign_memberships` al insertar/borrar membresías.
    * Para actualizar `total_potential_votes` y `total_confirmed_votes` en `campaigns` al modificar `leads` o `escrutinio_results`.
    * Para sincronizar `profiles` con `auth.users` (trigger en `auth.users`).