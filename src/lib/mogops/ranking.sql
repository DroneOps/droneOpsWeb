-- Autor: Miguel Tovar
-- Tabla del ranking semanal de MogOps (modo competencia).
-- Ejecutar una sola vez en Supabase: SQL Editor > New query > Run.
--
-- Una fila por dispositivo con su mejor puntuación. En Modo Arcade cada intento
-- es una fila con un uuid nuevo en la columna dispositivo y, si no hay nombre,
-- 'Anónimo' (la tabla no cambia). Cada fila expira 7 días
-- después de registrarse; la API (src/routes/api/mogops/ranking) borra las
-- vencidas en cada petición y nunca las muestra.

create table if not exists public.mogops_ranking (
	dispositivo uuid primary key,
	nombre text not null check (char_length(nombre) between 1 and 24),
	puntuacion numeric(4, 2) not null check (puntuacion between 0 and 10),
	foto text not null, -- JPEG en data URL: la cara al momento de la puntuación más alta; vacía si se registró sin foto
	registrado_en timestamptz not null default now(),
	expira_en timestamptz not null default now() + interval '7 days'
);

create index if not exists mogops_ranking_puntuacion on public.mogops_ranking (puntuacion desc);
create index if not exists mogops_ranking_expira on public.mogops_ranking (expira_en);

-- Sin políticas: el público no puede leer ni escribir directamente.
-- Solo el servidor de la web, con la Service Role Key.
alter table public.mogops_ranking enable row level security;
