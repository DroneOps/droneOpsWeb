<script lang="ts">
	import {
		diasParaLimite,
		formatoFecha,
		iniciales,
		type Proyecto,
		type Competencia,
		type Departamento
	} from './tipos';

	let {
		proyecto,
		competencia,
		departamentos,
		nombreDe,
		onabrir
	}: {
		proyecto: Proyecto;
		competencia?: Competencia;
		departamentos: Departamento[]; // los departamentos de ESTE proyecto
		nombreDe: (email: string) => string;
		onabrir: () => void;
	} = $props();

	const diasLimite = $derived(proyecto.fecha_limite ? diasParaLimite(proyecto.fecha_limite) : null);
	const vencido = $derived(diasLimite !== null && diasLimite < 0);
	const pronto = $derived(diasLimite !== null && diasLimite >= 0 && diasLimite <= 2);
</script>

<button
	type="button"
	onclick={onabrir}
	class="flex w-full flex-col gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-500 hover:shadow-md {vencido
		? 'border-red-300'
		: 'border-slate-200'}"
>
	<span class="text-[15px] leading-snug font-bold text-slate-900">{proyecto.titulo}</span>

	<!-- Quién lo hace (departamentos) y, si aplica, para qué competencia es -->
	<span class="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
		{#if departamentos.length === 0}
			<span class="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">Todo el grupo</span>
		{:else}
			{#each departamentos.slice(0, 3) as d (d.id)}
				<span class="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
					<span class="h-1.5 w-1.5 rounded-full" style="background-color: {d.color}"></span>
					{d.nombre}
				</span>
			{/each}
			{#if departamentos.length > 3}
				<span class="font-semibold text-slate-500">+{departamentos.length - 3}</span>
			{/if}
		{/if}
		{#if competencia}
			<span class="font-medium">{competencia.nombre}</span>
		{/if}
	</span>

	<span class="flex items-center gap-2 text-xs text-slate-600">
		{#if proyecto.encargado_email}
			<span
				title="Encargado: {nombreDe(proyecto.encargado_email)}"
				class="flex h-6 w-6 items-center justify-center rounded-full border-2 border-purple-600 bg-purple-100 text-[10px] font-bold text-purple-800"
			>
				{iniciales(nombreDe(proyecto.encargado_email))}
			</span>
			<span class="font-medium">{nombreDe(proyecto.encargado_email)}</span>
		{:else}
			<span class="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
				Sin encargado
			</span>
		{/if}

		<span class="flex-1"></span>

		{#if proyecto.fecha_limite}
			<span class="font-medium {vencido ? 'text-red-600' : pronto ? 'text-amber-700' : 'text-slate-500'}">
				{vencido ? 'Venció' : 'Entrega'}
				{formatoFecha(proyecto.fecha_limite)}
			</span>
		{/if}
	</span>
</button>