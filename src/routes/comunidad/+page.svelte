<svelte:head>
	<title>Comunidad</title>
</svelte:head>

<script>

</script>
<div class="pagina-comunidad">
	<div class="Framework-equipo">
		<h1 class="Meet">Meet the team</h1>
			<div class= "imagenes-team">
				<div class="Cuadro-gris-0"></div>
				
				<div class = "Clase-Ro">
					<div class="Cuadro-gris-1"></div>
					<h2 class="Nombre-1">Rodrigo Reveles</h2>
					<h3 class ="Rol">PRESIDENTE</h3>
					<p class="Redes">redes</p>
				</div>

				<div class = "Clase-Chewin">
					<div class="Cuadro-gris-2"></div>
					<h2 class="Nombre-2">Alejandro Mojarras</h2>
					<h3 class ="Rol">VICEPRESIDENTE</h3>
					<p class="Redes">redes</p>
				</div>

				<div class = "Clase-Mister">
					<div class="Cuadro-gris-3"></div>
					<h2 class="Nombre-3">Carlos Lopez</h2>
					<h3 class ="Rol">FINANZAS</h3>
					<p class="Redes">redes</p>
				</div>

				<div class = "Clase-Ricky">
					<div class="Cuadro-gris-4"></div>
					<h2 class="Nombre-4">Ricardo González</h2>
					<h3 class ="Rol">LÓGISTICA Y OPERACIONES</h3>
					<p class="Redes">redes</p>
				</div>

				<div class = "Clase-Yaya">
					<div class="Cuadro-gris-5"></div>
					<h2 class="Nombre-5">Mariana Martínez</h2>
					<h3 class ="Rol">IMÁGEN</h3>
					<p class="Redes">redes</p>
				</div>

				<div class = "Clase-RH">
					<div class="Cuadro-gris-6"></div>
					<h2 class="Nombre-6">Omar Verduzco</h2>
					<h3 class ="Rol">RECURSOS HUMANOS</h3>
					<p class="Redes">redes</p>
				</div>
			</div>
	</div>
</div>

<style>
	.pagina-comunidad {
        background-color: #ffffff; 
        color: #1a1a1a;           
        /*min-height: 100vh;*/        
        width: 100%;
    }

	.Framework-equipo {
		padding: 40px;
		max-width: 1200px;
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
		grid-template-columns: repeat(4, 1fr); /* 4 columnas de igual ancho */
		grid-template-rows: repeat(2, auto);    /* 2 filas de alto */
		gap: 25px; 
	}

	/* CUADRO GRANDE PRINCIPAL CON BORDE AZUL */
	.Cuadro-gris-0 {
		grid-column: span 2; 
		grid-row: span 1;    
		background-color: #d1d1d1;
		min-height: 100%;
	}

	/* CUADROS GRISES PEQUEÑOS (1 AL 6) */
	.Cuadro-gris-1,
	.Cuadro-gris-2,
	.Cuadro-gris-3,
	.Cuadro-gris-4,
	.Cuadro-gris-5,
	.Cuadro-gris-6 {
		background-color: #d1d1d1;
		width: 100%;
		aspect-ratio: 1 / 1; /* Mantiene la forma de cuadrado perfecto */
	}

	/* CONTENEDORES DE CADA PERSONA */
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
		font-size: 24px;
		font-style: italic;
		font-weight: normal;
		color: #1a1a1a;
		margin: 10px 0 0 0;
	}

	/* ROLES */
	.Rol {
		font-family: sans-serif;
		font-size: 13px;
		font-weight: bold;
		color: #444;
		margin: 3px 0 0 0;
		text-transform: uppercase;
	}

	/* REDES */
	.Redes {
		font-family: sans-serif;
		font-size: 12px;
		font-style: italic;
		color: #888;
		margin: 2px 0 0 0;
	}
	/*Responsive*/
	@media (max-width: 900px) {
		.imagenes-team {
			grid-template-columns: repeat(2, 1fr);
			grid-template-rows: repeat(4, auto);
		}

		.Cuadro-gris-0 {
			grid-column: span 2;
			aspect-ratio: 2 / 1;
			min-height: auto;
		}
	}
</style>