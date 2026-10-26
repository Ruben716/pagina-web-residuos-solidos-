---
tags: [operacion, facebook]
actualizado: 2026-10-25
---

# Token de Facebook: qué hacer si `/actualidad` no carga

La sección **Actualidad** (`/actualidad`) y el bloque "Lo último que publicamos" de la portada leen las publicaciones de la página **Somos Puno** (ID `2042635832435822`). Usan el token guardado en `.env.local`, en la línea `FACEBOOK_PAGE_TOKEN=`.

> [!warning] El token es una contraseña
> No lo pegues en el chat, en esta nota ni en el repositorio. Va solo en `.env.local`, que no se sube a git, y en las variables de entorno del hosting.

## Arreglo rápido

1. Genera un token nuevo (ver [[#Sacar un token nuevo]]) y pégalo en `.env.local`, después de `FACEBOOK_PAGE_TOKEN=`.
2. En la terminal del proyecto, ejecuta:
   ```
   npm run fb:token
   ```
   Este comando revisa el token. Si es de usuario, lo cambia solo por el de la página y lo guarda. Al final dice de qué tipo es, cuándo caduca y cuántas publicaciones pudo leer. Nunca muestra el token.
3. Reinicia `npm run dev`. Si es para la web publicada, actualiza `FACEBOOK_PAGE_TOKEN` en el hosting y vuelve a hacer el build.

Debe quedar **"Token actual: de página, caduca nunca."**

## Cómo saber qué pasa

Los errores salen en la terminal de `npm run dev` con el prefijo `[facebook]`.

| Mensaje                            | Qué significa                                                                       | Qué hacer                                                                                                        |
| ---------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `Session has expired on ...`       | El token venció. Era un token corto, de 1 a 2 horas.                                | Sacar uno nuevo **y ampliarlo** (paso 2 de abajo).                                                               |
| `Invalid OAuth 2.0 Access Token`   | Facebook no reconoce el texto pegado: falta una parte, hay espacios o es otra cosa. | Volver a copiarlo completo. Puede ser también un error guardado de un intento anterior: reiniciar `npm run dev`. |
| Sin errores, pero no aparece nada  | Es un token **de usuario** (lee tu perfil personal, no la página).                  | `npm run fb:token` lo convierte.                                                                                 |
| `The session has been invalidated` | El administrador cambió su contraseña o perdió el rol en la página.                 | Sacar un token nuevo.                                                                                            |

## Sacar un token nuevo

Tiene que hacerlo una cuenta **administradora** de Somos Puno. La que se usó el 2026-10-25 es la de _Cristian CGuzman_, con la app **Galeria Web**.

1. **Token de usuario:** entra al [Explorador de la Graph API](https://developers.facebook.com/tools/explorer/) y elige la app _Galeria Web_. En "Usuario o página" pon **Token de usuario**. Agrega los permisos `pages_show_list` y `pages_read_engagement`, y pulsa **Generate Access Token**.
2. **Ampliarlo (importante):** pega ese token en el [Depurador de tokens](https://developers.facebook.com/tools/debug/accesstoken/), pulsa **Depurar** y luego **Ampliar token de acceso**. Con eso pasa de unas horas a 60 días.
   - Si te saltas este paso, el token de página también vencerá en pocas horas.
3. Pega el token ampliado en `.env.local` y ejecuta `npm run fb:token`. El comando saca el token de la página, que **no caduca**.

### A mano, sin el comando

En el Explorador, con el token ampliado, consulta `me/accounts`. Copia el `access_token` que aparece junto a _Somos Puno_, no el de arriba. En el Depurador debe decir **Tipo: Page** y **Caduca: Nunca**.

## Fechas a tener en cuenta

- **Acceso a datos hasta el 23 de enero de 2027.** Meta exige renovar cada 90 días el permiso de la app.
  - Si cerca de esa fecha deja de cargar, repite [[#Sacar un token nuevo]] con la misma cuenta.
  - Generar el token otra vez en el Explorador renueva el permiso.
- El token de página deja de servir si el administrador cambia su contraseña, si le quitan el rol en la página o si se elimina la app _Galeria Web_.

## Cómo funciona por dentro

- El código está en `src/modules/facebook/`, y el servidor en `server.ts`.
- La web consulta a Facebook **como mucho una vez por hora**.
- Si Facebook falla, sigue mostrando lo último que trajo y reintenta en minutos.
- Sin token, `/actualidad` muestra "Muy pronto verás aquí nuestras publicaciones" y la portada oculta el bloque.
- **Para ocultar una publicación:** escribe `#noweb` en su texto en Facebook, o pega su enlace en `HIDDEN_POSTS` de `src/modules/facebook/config.ts`.
- `#web` se borra del texto visible.

## Historial

- **2026-10-25:** se migró `galeria.php` a Next.js. En la configuración:
  - El primer token era corto y venció.
  - El segundo era de usuario, no de página.
  - El ampliado se convirtió con `me/accounts` y quedó como token de página, "caduca: nunca".
