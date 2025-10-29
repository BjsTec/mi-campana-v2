# Descripción Funcional Detallada - Proyecto: Mi Campaña v2 (Revisión Post-Aclaraciones)

## 1. Visión General y Propósito 🎯

"Mi Campaña v2" es una plataforma web integral diseñada para la gestión moderna de campañas políticas de diversos tipos en Colombia. Su propósito es centralizar la organización del equipo, optimizar el seguimiento de votantes potenciales (leads), facilitar la comunicación interna y externa, y proveer herramientas cruciales para el día de las elecciones (escrutinio). La aplicación se basa en una estructura **piramidal** robusta para el equipo de campaña y busca maximizar la eficiencia a través de interfaces intuitivas y la integración estratégica de Inteligencia Artificial (IA).

La plataforma busca medir la efectividad de la campaña a través de métricas claras, comparando el crecimiento real de la estructura de votantes con las **promesas de voto**, e integra capacidades de **IA** para asistir a los usuarios. Ofrece además un modelo **freemium** con diferentes niveles de acceso y limitaciones.

## 2. Roles de Usuario y Flujo Jerárquico 🧑‍🤝‍🧑

La estructura de la campaña es estrictamente piramidal. Cada usuario (excepto el Candidato raíz) tiene un **superior inmediato** (quien lo reclutó o a quien está vinculado).

### 2.1. ADMINISTRADOR (`ADMIN`) / WEBMASTER
* **Función:** Superusuario de la plataforma, dueño de la aplicación cliente. Gestiona la configuración global, los tipos de campaña, los planes de suscripción, los tiempos de los demos, y puede supervisar/administrar todos los usuarios y campañas bajo su control. Puede crear otros `WEBMASTER`.
* **Capacidades Clave:**
    * CRUD (Crear, Leer, Actualizar, Borrar Lógico) de Usuarios (`profiles`), Campañas (`campaigns`), Tipos de Campaña (`global_variables`).
    * Gestionar Planes/Suscripciones (`plans`).
    * Configurar variables globales (ej., duración demo, límites por plan).
    * Gestionar PQR (`pqr_tickets`).
    * Gestionar Leads de la Web Comercial (`web_commercial_leads`).
    * Habilitar/Deshabilitar `can_report` para Escrutadores.
    * Ver métricas globales de la plataforma y de las campañas bajo su gestión.
    * **Borrado Lógico:** Al eliminar datos (usuarios, campañas), solo los marca como `is_deleted = true`.

### 2.2. SUPERADMIN (`SUPERADMIN`)
* **Función:** Rol de desarrollador con control total y absoluto sobre toda la plataforma y todos los datos.
* **Capacidades Clave:**
    * Todas las capacidades de `WEBMASTER`.
    * **Borrado Físico:** Único rol que puede eliminar permanentemente registros de la base de datos (`DELETE FROM ...`).
    * Acceso irrestricto a toda la configuración y datos.

### 2.3. CANDIDATO (`CANDIDATO`)
* **Función:** Dueño y líder de una o más campañas. Vértice superior de la pirámide de su campaña. Usualmente creado por un `WEBMASTER`.
* **Capacidades Clave:**
    * Crear/Gestionar sus `campaigns`.
    * **Gestionar Formulario Público:** Configurar preguntas (`campaigns.form_config`), obtener y compartir el link/QR único (`campaigns.public_form_slug`) de su campaña para captar **Leads de Formulario**.
    * **Reclutar `Gerentes`**: Asigna este rol a usuarios dentro de su campaña.
    * Puede reclutar directamente `Anillos` y `Votantes`.
    * **Gestionar Permisos:** Definir qué acciones pueden realizar sus `Gerentes` y `Anillos` (`campaign_memberships.permissions`).
    * Visualizar toda la pirámide de su equipo y las métricas agregadas.
    * Ver todos los **Leads de Formulario** y **Leads de Reuniones** de su campaña.
    * Asignar **Leads de Formulario** a `Gerentes`.
    * Gestionar `Escrutadores` y sus asignaciones.
    * Ver resultados del `Voto de Opinión` y `Escrutinio`.
    * Ver/Editar **Votos Promesa** y **Promesa Real** de sus `Gerentes` directos.
    * Acceso completo a funciones de IA dentro de su campaña.

### 2.4. GERENTE (`GERENTE`)
* **Función:** Segundo nivel, reclutado por `CANDIDATO`. Gestiona una rama de la pirámide.
* **Capacidades Clave:**
    * **Reclutar `Anillos`**.
    * Puede reclutar directamente `Votantes`.
    * Visualizar su rama de la pirámide.
    * Ver y gestionar **Leads de Formulario** asignados. Puede reasignarlos hacia abajo.
    * **Programar Reuniones:** Asistentes son **Leads de Reunión** bajo su propiedad.
    * **Convertir sus `Leads` en `Votos`**.
    * Ver métricas de su rama.
    * Ver/Editar **Votos Promesa** y **Promesa Real** de sus `Anillos` directos.
    * Acceder a funciones de IA (limitadas a su visibilidad).
    * *Limitación:* Solo puede realizar acciones permitidas por el `CANDIDATO`.

### 2.5. ANILLO (`ANILLO`)
* **Función:** Tercer nivel, reclutado por `GERENTE` o `CANDIDATO`. Gestiona `Votantes`.
* **Capacidades Clave:**
    * **Reclutar `Votantes`**.
    * Visualizar su grupo directo.
    * Ver y gestionar **Leads de Formulario** asignados. Puede reasignarlos a sus `Votantes`.
    * **Programar Reuniones:** Asistentes son **Leads de Reunión** bajo su propiedad.
    * **Convertir sus `Leads` en `Votos`**.
    * Ver métricas de su grupo.
    * Ver/Editar **Votos Promesa** y **Promesa Real** de sus `Votantes` directos.
    * Acceder a funciones de IA (limitadas a su visibilidad).
    * *Limitación:* Solo puede realizar acciones permitidas por su superior.

### 2.6. VOTANTE (`VOTANTE`)
* **Función:** Nivel base. Reclutado por superior o convertido desde `Lead`. Expande la base registrando nuevos votos.
* **Capacidades Clave:**
    * **Reclutar Nuevos Votos Directamente:** Vía link/QR personal o registro manual.
    * Visualizar su pirámide directa.
    * **Programar Reuniones:** Asistentes son **Leads de Reunión** bajo su propiedad.
    * **Convertir sus `Leads de Reunión` en `Votos`**.
    * Ver sus métricas personales.
    * **Gestionar `Votos Promesa`:** Informar a su superior (no edita el campo).
    * Acceder a funciones de IA (Asistente, Generador Mensajes).

### 2.7. ESCRUTADOR (`ESCRUTADOR`)
* **Función:** Rol temporal para día de elecciones. No participa en reclutamiento.
* **Capacidades Clave:**
    * Ver sus asignaciones.
    * Reportar resultados si está habilitado y en fecha.

## 3. Flujo de Adquisición y Conversión de Votantes 🗳️➡️👥

### 3.1. Leads de Formulario Público (Captación Masiva Online)
1.  **Configuración:** `CANDIDATO`/`ADMIN`/Permitido configura formulario (`campaigns.form_config`).
2.  **Difusión:** Se comparte link/QR (`campaigns.public_form_slug`).
3.  **Registro:** Se crea `lead` (status `PENDING`, source `FORMULARIO`, `recruited_by`=NULL).
4.  **Asignación:** `CANDIDATO`/`ADMIN` asigna a `GERENTE` (`assigned_member_id`).
5.  **Reasignación:** `GERENTE` -> `ANILLO` -> `VOTANTE`.
6.  **Gestión:** Miembro asignado actualiza `status`, `vote_intention`, `notes`.
7.  **Conversión a Voto:** Miembro asignado confirma (`status`=`SUPPORTER`, `vote_intention`=`YES`).
    * Se crea/actualiza `profile` (rol `VOTANTE`).
    * Se crea `campaign_membership` (`recruiter_id` = ID del miembro que convirtió).
    * Se actualiza `lead` (`status`=`CONVERTED`, `converted_to_membership_id`=ID de membresía).

### 3.2. Leads de Reuniones (Captación Dirigida)
1.  **Programación:** Miembro (`GERENTE`/`ANILLO`/`VOTANTE` con permiso) crea `meeting`.
2.  **Registro Asistentes:** Organizador registra asistentes. Se crean `leads` (`status`=`PENDING`, `source`=`REUNION`, `recruited_by`=ID Organizador). Se crea enlace en `meeting_attendees`.
3.  **Gestión:** Organizador actualiza `status`, `vote_intention`, `notes`.
4.  **Conversión a Voto:** Organizador confirma.
    * Se crea/actualiza `profile` (rol `VOTANTE`).
    * Se crea `campaign_membership` (`recruiter_id` = ID Organizador).
    * Se actualiza `lead` (`status`=`CONVERTED`, `converted_to_membership_id`).

### 3.3. Leads de Web Comercial
1.  **Captura:** Formularios en la web comercial (contacto, demo signup) crean registro en `web_commercial_leads`.
2.  **Gestión:** `WEBMASTER`/`SUPERADMIN` contactan y gestionan estos leads.
3.  **Conversión a Usuario/Candidato:** Si el lead decide usar la plataforma, `WEBMASTER` crea manualmente (o se automatiza) su cuenta (`auth.users`, `profile` con rol `CANDIDATO` o `WEBMASTER`), actualiza `web_commercial_leads.status` = 'CONVERTED\_TO\_USER' y `converted_profile_id`.

### 3.4. Registro Directo de Votos (Crecimiento Orgánico)
1.  **Acción:** Miembro (`VOTANTE`+) usa link/QR personal o registro manual.
2.  **Registro:** Nuevo usuario completa datos.
3.  **Creación:** Se crea/actualiza `profile` (rol `VOTANTE`). Se crea `campaign_membership` (`recruiter_id` = ID del miembro que lo registró). **No pasa por la tabla `leads`**.

### 3.5. Regla de Exclusividad y Conflicto
* **Exclusividad:** Antes de insertar en `campaign_memberships`, la lógica de negocio (Server Action/Function) **debe verificar** que el `user_id` no tenga otra membresía activa (`is_active`=true) en una campaña (`campaigns`) del mismo `campaign_type_id`.
* **Conflicto "First-to-Confirm":** Si Miembro B registra directamente como Voto a Persona P (que era Lead de Miembro A), la membresía se crea bajo B. La lógica de negocio debe buscar y marcar como `INVALID` o `ARCHIVED` cualquier `lead` preexistente para esa Persona P (basado en `phone` o `email`) asociado a Miembro A en esa campaña.

## 4. Votos Promesa y Promesa Real 📊

* **Propósito:** Evaluar efectividad comparando estimaciones con crecimiento real.
* **Flujo:**
    1.  Miembro X informa promesa a Superior Y.
    2.  Superior Y edita el registro de `campaign_memberships` de X.
    3.  Actualiza `votos_promesa` (dicho por X) y `promesa_real` (estimación de Y).
* **Visibilidad:** Controlada estrictamente por **Políticas RLS**:
    * Un usuario **NO PUEDE** ver/editar sus propios `votos_promesa`/`promesa_real`.
    * Un usuario **PUEDE** ver/editar `votos_promesa`/`promesa_real` de los miembros directamente debajo de él (`recruiter_id` = su ID).
    * `CANDIDATO`, `WEBMASTER`, `SUPERADMIN` pueden tener visibilidad total o agregada.
* **Uso:** Dashboards comparan `votos_promesa`, `promesa_real` con el conteo real de la pirámide bajo cada miembro.

## 5. Modelo Freemium y Tipos de Campaña 💰

* **Tipos de Campaña:** Definidos en `global_variables` (`is_campaign_type`=true). Administrados por `WEBMASTER`/`SUPERADMIN`.
* **Planes:** Definidos en la tabla `plans`. Administrados por `WEBMASTER`/`SUPERADMIN`. Cada plan tiene límites (`max_members`, `max_leads`, `max_depth`, `max_direct_recruits`, `demo_duration_days`) y características (`features`).
* **Flujo:**
    1.  **Registro Demo:** Usuario se registra desde web comercial -> Se crea `profile` (rol `CANDIDATO`), se crea `campaign` (tipo `equipo_de_trabajo`, `plan_id`=`demo_limitado`, `demo_expires_at`=now() + `demo_duration_days`).
    2.  **Transición a Gratuito:** Al verificar cuenta (`is_verified`=true) o expirar demo, `plan_id` de la campaña cambia a `equipo_trabajo`, `demo_expires_at`=NULL.
    3.  **Upgrade a Pago:** Usuario selecciona plan pago -> Se integra con pasarela -> Se actualiza `plan_id` de la campaña, se crea/actualiza `subscription`.
* **Aplicación de Límites:** La lógica de negocio (Server Actions/Functions/RLS) debe verificar constantemente los límites del `plan_id` de la campaña antes de permitir acciones como crear miembros, registrar leads, etc.

## 6. Funcionalidades de IA (Integradas) 🤖

* **Asistente:** Chat UI -> `/api/ai/ask` -> Gemini (con RAG y RLS para contexto).
* **Análisis Leads:** Función programada (Supabase Cron?) -> Lee `leads` -> Gemini -> Guarda `ai_insights` / Genera Notificación.
* **Generador Mensajes:** Botón en UI -> `/api/ai/generate-message` -> Gemini con prompt contextual -> Muestra sugerencias.

## 7. Escrutinio (Detalle) 🗳️

* **Flujo Día D:** Asignación (`escrutador_assignments`) -> Habilitación (`can_report`) -> Reporte (`escrutinio_results` + Upload Storage) -> Actualización `campaigns.total_confirmed_votes` (Trigger/Función).
* **Visualización:** Dashboards con contadores y mapas (Supabase Realtime).

## 8. Gestión de PQR y Web Comercial 🌐

* **PQR:** Formulario (público o interno) -> Crea `pqr_ticket`. `WEBMASTER`/`SUPERADMIN` gestionan (asignan `assigned_admin_id`, actualizan `status`, `resolution_notes`). Reportero (si es usuario) puede ver estado.
* **Web Comercial Leads:** Formulario contacto/demo -> Crea `web_commercial_lead`. `WEBMASTER`/`SUPERADMIN` gestionan. Conversión actualiza `status` y `converted_profile_id`.

## 9. Consideraciones Técnicas Clave

* **RLS:** Fundamental para seguridad y lógica jerárquica. Requiere implementación detallada.
* **Soft Delete:** La mayoría de las entidades usan `is_deleted`. Las consultas deben filtrar `WHERE is_deleted = false`. Solo `SUPERADMIN` puede borrar físicamente.
* **Escalabilidad:** Consultas jerárquicas, optimización de índices, uso de caché Next.js.
* **Integraciones:** Google Calendar (OAuth), Pasarela de Pagos (Stripe SDK/Webhooks).
* **UI/UX:** Mobile-first, claridad en dashboards, aplicación de Mejora Premium.

---