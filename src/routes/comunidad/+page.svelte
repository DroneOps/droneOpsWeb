<script>
    import rodrigo from '$lib/assets/rodrigo.jfif';
	import edwin from '$lib/assets/edwin.jpg';
    import carlos from '$lib/assets/carlos.jfif';
	import ricardo from '$lib/assets/ricardo.jpg';
    import mariana from '$lib/assets/mariana.jfif';
	import omar from '$lib/assets/omar.jfif';
    import grupo from '$lib/assets/grupo.jfif';
</script>
<div class="pagina-comunidad">
	<div class="Framework-equipo">
		<h1 class="Meet">MEET THE TEAM</h1>
		<div class="imagenes-team">
			<!-- FOTO PRINCIPAL DEL EQUIPO (Reemplazar src) -->
			<img 
				src={grupo} 
				alt="Equipo Principal" 
				class="Cuadro-gris-0" 
			/>
			
			<div class="Clase-Ro">
				<img src={rodrigo} alt="Rodrigo Reveles" class="Cuadro-gris-1" />
				<h2 class="Nombre-1">Rodrigo Reveles</h2>
				<h3 class="Rol">PRESIDENTE</h3>
				<a href="https://instagram.com/rodrigo_vvvvv" target="_blank" rel="noopener noreferrer" class="Redes">
					<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
					<span>@rodrigo_vvvvv</span>
				</a>
			</div>

			<div class="Clase-Chewin">
				<img src={edwin} alt="Alejandro Mojarras" class="Cuadro-gris-2" />
				<h2 class="Nombre-2">Alejandro Mojarras</h2>
				<h3 class="Rol">VICEPRESIDENTE</h3>
				<a href="https://instagram.com/alejandro_mojarras" target="_blank" rel="noopener noreferrer" class="Redes">
					<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
					<span>@alejandro_mojarras</span>
				</a>
			</div>

			<div class="Clase-Mister">
				<img src={carlos} alt="Carlos Lopez" class="Cuadro-gris-3" />
				<h2 class="Nombre-3">Carlos Lopez</h2>
				<h3 class="Rol">FINANZAS</h3>
				<a href="https://instagram.com/elcharlie226" target="_blank" rel="noopener noreferrer" class="Redes">
					<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
					<span>@elcharlie226</span>
				</a>
			</div>

			<div class="Clase-Ricky">
				<img src={ricardo} alt="Ricardo González" class="Cuadro-gris-4" />
				<h2 class="Nombre-4">Ricardo González</h2>
				<h3 class="Rol">LÓGISTICA Y OPERACIONES</h3>
				<a href="https://instagram.com/rickster_2004" target="_blank" rel="noopener noreferrer" class="Redes">
					<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
					<span>@rickster_2004</span>
				</a>
			</div>

			<div class="Clase-Yaya">
				<img src={mariana} alt="Mariana Martínez" class="Cuadro-gris-5" />
				<h2 class="Nombre-5">Mariana Martínez</h2>
				<h3 class="Rol">IMÁGEN</h3>
				<a href="https://instagram.com/llaya_06" target="_blank" rel="noopener noreferrer" class="Redes">
					<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
					<span>@llaya_06</span>
				</a>
			</div>

			<div class="Clase-RH">
				<img src={omar} alt="Omar Verduzco" class="Cuadro-gris-6" />
				<h2 class="Nombre-6">Omar Verduzco</h2>
				<h3 class="Rol">RECURSOS HUMANOS</h3>
				<a href="https://instagram.com/overduzc_0003" target="_blank" rel="noopener noreferrer" class="Redes">
					<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
					<span>@overduzc_0003</span>
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.pagina-comunidad {
		background-color: #ffffff; 
		color: #1a1a1a;        
		width: 100%;
	}

	.Framework-equipo {
		padding: 30px 40px;
		max-width: 1440px; 
		margin: 0 auto;
	}

	.Meet {
		font-family: sans-serif;
		font-size: 48px;
		font-style: italic;
		font-weight: 300;
		color: #333;
		margin-bottom: 30px;
	}

	.imagenes-team {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		grid-template-rows: repeat(2, auto);
		gap: 30px;
	}

	/* FOTO PRINCIPAL */
	.Cuadro-gris-0 {
		grid-column: span 2; 
		grid-row: span 1;    
		background-color: #d1d1d1;
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	/* FOTOS INDIVIDUALES */
	.Cuadro-gris-1,
	.Cuadro-gris-2,
	.Cuadro-gris-3,
	.Cuadro-gris-4,
	.Cuadro-gris-5,
	.Cuadro-gris-6 {
		background-color: #d1d1d1;
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		display: block;
	}

	/* CONTENEDORES */
	.Clase-Ro,
	.Clase-Chewin,
	.Clase-Mister,
	.Clase-Yaya,
	.Clase-Ricky,
	.Clase-RH {
		font-family: serif;
		font-size: 24px;
		font-style: italic;
		font-weight: normal;
		color: #1a1a1a;
	}

	/* NOMBRES */
	.Nombre-1,
	.Nombre-2,
	.Nombre-3,
	.Nombre-4,
	.Nombre-5,
	.Nombre-6 {
		font-family: serif;
		font-size: 22px;
		font-style: italic;
		font-weight: normal;
		color: #1a1a1a;
		margin: 10px 0 0 0;
	}

	/* ROLES */
	.Rol {
		font-family: sans-serif;
		font-size: 12px;
		font-weight: bold;
		color: #444;
		margin: 3px 0 0 0;
		text-transform: uppercase;
		font-style: normal;
	}

	/* REDES */
	.Redes {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-family: sans-serif;
		font-size: 12px;
		font-style: normal;
		color: #666;
		margin-top: 4px;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.Redes:hover {
		color: #e1306c; /* Color de acento de Instagram */
	}

	.ig-icon {
		width: 14px;
		height: 14px;
	}

	/* Responsive */
	@media (max-width: 900px) {
		.Framework-equipo {
			padding: 20px;
		}

		.imagenes-team {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(4, auto);
		}

		.Cuadro-gris-0 {
			grid-column: span 2;
			aspect-ratio: 2 / 1;
			height: auto;
		}
	}
</style>