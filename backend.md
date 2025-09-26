Manual de Integración Frontend: API "Autoridad Política"
1. Introducción y Configuración Inicial
Propósito del Documento
Este manual es la única fuente de verdad para la integración del frontend con el backend de "Autoridad Política", construido sobre Supabase. Detalla el flujo de autenticación, los endpoints de la API, las estructuras de datos y las reglas de seguridad. Seguir esta guía paso a paso garantizará una integración rápida, segura y libre de errores.

Variables de Entorno
Tu aplicación frontend necesitará las siguientes claves para comunicarse con Supabase. Estas son seguras para exponer en el cliente.

JavaScript

SUPABASE_URL="https://<ID_PROYECTO>.supabase.co"
SUPABASE_ANON_KEY="tu_supabase_anon_key"
Inicialización del Cliente Supabase
Usa estas claves para crear la instancia del cliente supabase-js en tu proyecto.

JavaScript

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
2. Flujo de Autenticación: El Núcleo de la Seguridad
La autenticación es el proceso más complejo y crucial. No utiliza el flujo estándar de Supabase, ya que el login se realiza con cédula y contraseña. Presta especial atención a esta sección.

Concepto Clave: El Email Sintético
Supabase Auth requiere un email como identificador único. Para cumplir con el requisito de login por cédula, hemos implementado un sistema de "email sintético".

Regla: email_sintético = ${cédula}@auth.autoridadpolitica.app`

Ejemplo: Si la cédula de un usuario es 123456789, el email que se usará para todas las interacciones con supabase.auth será 123456789@auth.autoridadpolitica.app.

El frontend es responsable de realizar esta transformación antes de llamar a cualquier función de autenticación.

Flujo #1: Registro de un Nuevo Usuario (Paso a Paso)
El registro es un proceso de dos pasos que utiliza una Edge Function para verificar el número de teléfono del usuario a través de un código OTP (One-Time Password).

Endpoint: POST /functions/v1/register-flow

Paso 1: Solicitar el código OTP
El usuario llena el formulario inicial. El frontend envía los datos básicos para que el backend envíe el SMS.

Ejemplo de llamada:

JavaScript

const { data, error } = await supabase.functions.invoke('register-flow', {
  body: {
    cedula: '123456789',
    fullName: 'Juan Pérez',
    phone: '+573001234567' // Formato internacional
  }
});

if (error) throw error;
// Mostrar la pantalla para ingresar el OTP
Respuesta Exitosa (200 OK): { "message": "OTP sent successfully" }

Paso 2: Verificar el OTP y Crear el Usuario
Una vez que el usuario ingresa el código recibido, el frontend vuelve a llamar al mismo endpoint, pero esta vez incluyendo la contraseña y el OTP.

Ejemplo de llamada:

JavaScript

const { data, error } = await supabase.functions.invoke('register-flow', {
  body: {
    cedula: '123456789',
    password: 'una_clave_muy_segura',
    fullName: 'Juan Pérez',
    phone: '+573001234567',
    otp: '654321' // Código ingresado por el usuario
  }
});

if (error) throw error;
// El usuario fue creado exitosamente. Puedes redirigirlo al login.
console.log('Usuario creado:', data.user);
Respuesta Exitosa (201 Created): { "message": "User created successfully", "user": { ... } }

Flujo #2: Inicio de Sesión (Login)
Aquí es donde se aplica la regla del email sintético.

Ejemplo de implementación:

JavaScript

async function login(cedula, password) {
  // 1. Construir el email sintético
  const syntheticEmail = `${cedula}@auth.autoridadpolitica.app`;

  // 2. Llamar a la función de login de Supabase
  const { data, error } = await supabase.auth.signInWithPassword({
    email: syntheticEmail,
    password: password,
  });

  if (error) {
    // Manejar error (ej. credenciales incorrectas)
    console.error('Error de login:', error.message);
    return;
  }

  // 3. Login exitoso. Supabase-js guarda la sesión automáticamente.
  console.log('Sesión iniciada:', data.session);
  // Redirigir al dashboard
}
Flujo #3: Cierre de Sesión (Logout)
Este es un proceso simple.

JavaScript

async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error('Error al cerrar sesión:', error.message);
  // Redirigir a la página de inicio
}
Flujo #4: Recuperación de Contraseña
Sigue la misma lógica de 2 pasos que el registro, usando la Edge Function reset-password-flow.

Endpoint: POST /functions/v1/reset-password-flow

Paso 1 (Solicitar OTP): Enviar { "cedula": "123456789" }. El backend buscará el teléfono asociado y enviará el SMS.

Paso 2 (Actualizar Contraseña): Enviar { "cedula": "123456789", "otp": "123456", "newPassword": "mi_nueva_clave_segura" }.

3. Manejo de la Sesión y Roles
Escuchando Cambios de Autenticación
Para tener una aplicación reactiva (ej. redirigir automáticamente si el usuario inicia o cierra sesión), utiliza este listener en el componente principal de tu aplicación.

JavaScript

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('Usuario ha iniciado sesión', session);
  }
  if (event === 'SIGNED_OUT') {
    console.log('Usuario ha cerrado sesión');
  }
});
Obtener el Perfil del Usuario Actual
Una vez iniciada la sesión, necesitarás obtener los datos de la tabla profiles (nombre, cédula, etc.).

JavaScript

async function getMyProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single(); // .single() es importante para obtener un objeto, no un array

  if (error) throw error;
  return profile;
}
Entendiendo los Roles
La API se comportará de manera diferente según el rol del usuario.

Rol	Descripción
platform_owner	Dueño de Plataforma. Puede crear nuevas campañas y asignar candidatos. Es el cliente principal.
candidato	Líder de Campaña. Gestiona UNA campaña, su equipo (gerentes, anillos) y los permisos internos.
gerente	Segundo al mando. Recluta anillos y votantes. Sus permisos son delegados por el candidato.
anillo	Tercer nivel. Su función principal es reclutar votantes.
votante	Base de la pirámide. Puede registrar a otros votantes debajo de él.
escrutador	Rol especial. Testigo electoral que reporta resultados el día de la elección (módulo separado).

Exportar a Hojas de cálculo
4. API Principal: Endpoints y Casos de Uso
Todos los ejemplos asumen que el cliente Supabase ya está inicializado y el usuario ha iniciado sesión.

Módulo de Campañas y Pirámide
1. Añadir un Miembro a la Pirámide (RPC)
Esta es la operación más común para hacer crecer la red. Utiliza una Función de Base de Datos (RPC) para asegurar que todas las reglas de negocio se cumplan.

Función: add_pyramid_member

Ejemplo:

JavaScript

// Supongamos que un 'gerente' (cuyo campaign_member.id es 25) registra un nuevo 'votante'.
const { error } = await supabase.rpc('add_pyramid_member', {
  campaign_id: 1,
  user_id: 'uuid-del-nuevo-usuario-a-registrar',
  parent_id: 25, // ID del registro en 'campaign_members' del gerente
  role: 'votante'
});

if (error) {
  // Este error puede ser por RLS o por los límites del plan gratuito.
  console.error('No se pudo añadir al miembro:', error.message);
}
2. Obtener Métricas de la Pirámide (RPC)
Para saber cuántas personas hay debajo de un miembro específico en la pirámide.

Función: get_pyramid_metrics

Ejemplo:

JavaScript

// Obtener las métricas del miembro de campaña con id = 25
const { data, error } = await supabase.rpc('get_pyramid_metrics', {
  member_id_input: 25
});

if (error) throw error;

// data = { "direct_members": 10, "total_pyramid_members": 152 }
console.log('Miembros directos:', data.direct_members);
console.log('Total en la pirámide:', data.total_pyramid_members);
Módulo de Almacenamiento (Storage)
1. Subir Foto a la Galería Comunal
El path del archivo es crucial para la seguridad. Debe seguir la estructura carpeta_publica/id_campaña/nombre_archivo.

Bucket: gallery_photos

Ejemplo:

JavaScript

async function uploadImage(campaignId, file) {
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = `${campaignId}/${fileName}`; // Path dinámico

  const { error } = await supabase.storage
    .from('gallery_photos')
    .upload(filePath, file);

  if (error) {
    // Puede fallar si el usuario no es miembro de la campaña o si alcanzó su límite de 10 fotos.
    console.error('Error al subir la imagen:', error);
  }
}
5. Guía de Errores Comunes y Soluciones
Código/Mensaje de Error	Causa Probable	Solución
401 Unauthorized	El token JWT no se envió, es inválido o ha expirado.	Asegúrate de que el usuario haya iniciado sesión y de que el Authorization header esté bien formado.
403 Forbidden / new row violates row-level security policy	El usuario no tiene permisos para realizar la acción (ej. un votante intentando crear una campaña).	Verifica la lógica de tu UI. No muestres botones o acciones para los que el rol del usuario no tiene permiso.
"Límite de ... alcanzado"	Un trigger de la base de datos detuvo la acción (ej. límite de fotos o de miembros en plan gratuito).	Muestra un mensaje amigable al usuario explicando la limitación.
function execution error en Edge Function	Hubo un error en el código de la función (ej. la API de SMS falló).	Revisa los logs de la Edge Function en el dashboard de Supabase para ver el detalle del error.

Exportar a Hojas de cálculo
6. Apéndice: Estructura de Tablas Clave
Un resumen de los campos más importantes con los que interactuará el frontend.

Tabla: profiles

id (UUID): Coincide con auth.users.id.

full_name (TEXT): Nombre completo del usuario.

cedula (TEXT): Documento de identidad, usado para el login.

whatsapp (TEXT): Número de contacto.

Tabla: campaign_members

id (BIGINT): Identificador único de la membresía. Este es el ID que se usa como parent_id.

campaign_id (BIGINT): A qué campaña pertenece la membresía.

user_id (UUID): Qué usuario es parte de la membresía.

parent_id (BIGINT): El id de la membresía de la persona que lo registró (el "padre" en la pirámide).

role (ENUM): candidato, gerente, etc.



Prompt para Definir la Aplicación "Autoridad Política"
Rol: Actúa como un Arquitecto de Software experto en el diseño de aplicaciones SaaS (Software as a Service).

Tarea: Genera el concepto y la arquitectura funcional para una aplicación web y móvil llamada "Autoridad Política". El objetivo de la aplicación es ser una herramienta de gestión de capital humano y crecimiento de redes para campañas políticas.

Concepto Central:
La aplicación se basa en una estructura de red jerárquica (pirámide multinivel). El objetivo es que un candidato político pueda iniciar una campaña y que cada miembro, desde el equipo directivo hasta el votante base, pueda registrar nuevos miembros debajo de ellos. El sistema debe rastrear la genealogía de la red (quién registró a quién) para medir la efectividad y el alcance de cada rama.

Ciclo de Vida del Usuario y Planes:

Plan Demo: Un nuevo usuario se auto-registra en una campaña de prueba con una duración de 7 días. Le permite experimentar la creación de una red con datos de prueba.

Plan Gratuito: Al expirar la demo, la campaña se convierte en "gratuita". Los datos se vuelven reales pero con limitaciones estrictas (ej. solo puede registrar 2 miembros directos, la pirámide tiene un máximo de 2 niveles de profundidad).

Campaña Real (De Pago): El usuario se une o crea una campaña completa, sin las limitaciones del plan gratuito, asumiendo un rol específico.

Jerarquía de Roles y Permisos:

Dueño de Plataforma: Administrador del SaaS. Crea las campañas para sus clientes.

Candidato: Líder de una campaña. Tiene acceso a todas las métricas de su red. Su función clave es delegar permisos granulares a su equipo.

Gerente/Anillo: Equipo de confianza del candidato. Su misión es reclutar y gestionar sus sub-redes. Sus acciones están limitadas por los permisos que el candidato les otorga.

Votante: La base de la pirámide y el motor de crecimiento. Su función principal es registrar nuevos votantes.

Funcionalidades Clave a Incluir:

Autenticación Segura: El registro y la recuperación de contraseña deben realizarse mediante la verificación del número de teléfono con un código OTP enviado por SMS. El inicio de sesión se realiza con un documento de identidad (cédula) y una contraseña.

Métricas de Rendimiento: Cada usuario debe poder visualizar métricas clave de su red, como el número de "miembros directos" (registrados por él) y el "total de la pirámide" (la suma de todos los miembros en su red hacia abajo).

Sistema de Permisos Delegables: El Candidato debe tener un panel de control para activar o desactivar permisos específicos para los miembros de su equipo (ej. permiso para "gestionar activos de campaña" o "ver la pirámide completa").

Galería Comunal: Un espacio donde los miembros de la campaña pueden subir un número limitado de fotos de eventos para fomentar la comunidad.

Biblioteca de Activos: Un repositorio central donde el equipo directivo sube material gráfico oficial (logos, banners) para que todos los miembros lo utilicen, garantizando la consistencia de la marca.