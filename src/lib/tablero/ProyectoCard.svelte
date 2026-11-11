<script lang="ts">
	import {
		SALUD,
		progreso,
		saludEfectiva,
		estaEstancado,
		diasSinAvances,
		diasParaLimite,
		formatoFecha,
		iniciales,
		type Proyecto,
		type Categoria
	} from './tipos';

	let {
		proyecto,
		categoria,
		mostrarCategoria = true,
		nombreDe,
		onabrir
	}: {
		proyecto: Proyecto;
		categoria?: Categoria;
		mostrarCategoria?: boolean;
		nombreDe: (email: string) => string;
		onabrir: () => void;
	} = $props();

	const prog = $derived(progreso(proyecto));
	const salud = $derived(saludEfectiva(proyecto));
	const sinAvances = $derived(estaEstancado(proyecto) ? diasSinAvances(proyecto) : null);
	const equipoExtra = $derived(proyecto.equipo_emails.filter((e) => e !== proyecto.lider_email));
	const diasLimite = $derived(proyecto.fecha_limite ? diasParaLimite(proyecto.fecha_limite) : null);
	const mostrarSalud = $derived(proyecto.estado === 'in_progress' || proyecto.estado === 'in_review');
	const urgencia = $derived(
		proyecto.prioridad === 'urgente' || proyecto.prioridad === 'alta' ? proyecto.prioridad : null
	);
</script>

<button
	type="button"
	onclick={onabrir}
	class="flex w-full flex-col gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-500 hover:shadow-md {salud === 'atrasado' && mostrarSalud
		? 'border-red-300'
		: 'border-slate-200'}"
>
	<span class="flex items-start justify-between gap-2">
		<span class="text-[15px] leading-snug font-bold text-slate-900">{proyecto.titulo}</span>
		{#if urgencia}
			<span
				class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase {urgencia === 'urgente'
					? 'bg-red-100 text-red-700'
					: 'bg-amber-100 text-amber-700'}"
			>
				{urgencia}
			</span>
		{/if}
	</span>

	{#if mostrarCategoria}
		<span class="flex items-center gap-1.5 text-xs text-slate-500">
			<span class="h-2 w-2 rounded-full" style="background-color: {categoria?.color ?? '#cbd5e1'}"></span>
			{categoria?.nombre ?? 'Sin categoría'}
		</span>
	{/if}

	{#if prog.total > 0}
		<span class="flex items-center gap-2">
			<span class="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
				<span class="block h-full rounded-full bg-purple-600" style="width: {prog.pct}%"></span>
			</span>
			<span class="font-mono text-xs text-slate-500">{prog.hechas}/{prog.total}</span>
		</span>
	{/if}

	<span class="flex items-center gap-2 text-xs text-slate-600">
		{#if proyecto.lider_email}
			<span
				title="Líder: {nombreDe(proyecto.lider_email)}"
				class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-purple-600 bg-purple-100 text-[10px] font-bold text-purple-800"
			>
				{iniciales(nombreDe(proyecto.lider_email))}
			</span>
		{:else}
			<span class="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
				Sin líder
			</span>
		{/if}

		{#each equipoExtra.slice(0, 3) as correo (correo)}
			<span
				title={nombreDe(correo)}
				class="-ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-700 ring-2 ring-white"
			>
				{iniciales(nombreDe(correo))}
			</span>
		{/each}
		{#if equipoExtra.length > 3}
			<span
				class="-ml-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-500 ring-2 ring-white"
			>
				+{equipoExtra.length - 3}
			</span>
		{/if}

		<span class="flex-1"></span>

		{#if mostrarSalud}
			<span class="flex items-center gap-1.5 font-medium">
				<span class="h-2 w-2 rounded-full {SALUD[salud].punto}"></span>
				{SALUD[salud].label}
			</span>
		{/if}
	</span>

	{#if proyecto.fecha_limite || sinAvances !== null}
		<span class="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs">
			{#if proyecto.fecha_limite && diasLimite !== null}
				<span
					class="font-medium {diasLimite < 0 && proyecto.estado !== 'done'
						? 'text-red-600'
						: diasLimite <= 2 && proyecto.estado !== 'done'
							? 'text-amber-700'
							: 'text-slate-500'}"
				>
					{diasLimite < 0 && proyecto.estado !== 'done' ? 'Venció' : 'Vence'}
					{formatoFecha(proyecto.fecha_limite)}
				</span>
			{/if}
			{#if sinAvances !== null}
				<span class="font-semibold text-amber-700">Sin avances hace {sinAvances} d</span>
			{/if}
		</span>
	{/if}
</button>