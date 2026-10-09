<script lang="ts">
	// Importación temporal única para simular todas las imágenes del equipo
	import cuadro from '$lib/assets/cuadro.png';
    import lider from '$lib/assets/theLida.jfif';
    import grupo from '$lib/assets/DJI_D_RIRO.JPG.jpeg'
</script>

<div class="pagina-comunidad">
	<div class="Framework-equipo">
		<!-- Título Principal -->
		<h1 class="Meet">MEET THE TEAM</h1>
		<hr class="separador" />

		<!-- 1. SECCIÓN LÍDER / ASESOR (Hernán Abaunza) -->
		<section class="seccion-lider">
			<div class="foto-lider-container">
				<img src={lider} alt="Dr. Hernán Abaunza González" class="foto-lider" />
			</div>

			<div class="info-lider">
				<h2 class="nombre-lider">Hernán Abaunza-González</h2>
				<h3 class="rol-lider">Líder</h3>
				<div class="bio-lider">
					<p>
						El Dr. Hernán Abaunza González es Ingeniero en Mecatrónica por el Tecnológico de Monterrey (2012), Maestro en Ciencias por el CINVESTAV-IPN (2014) y Doctor en Robótica y Automatización por la <em>Université de Technologie de Compiègne</em> en Francia (2019).
					</p>
					<p>
						Cuenta con trayectoria de investigación internacional en instituciones europeas como la UTC e Institut Pascal (Francia) y FADA-CATEC (España). Sus líneas de investigación se especializan en el control de vuelo ágil, la navegación autónoma, la generación de trayectorias y el vuelo en formación para flotas de drones, con múltiples publicaciones científicas en revistas y conferencias internacionales.
					</p>
					<p>
						Desde 2021 es Profesor de Tiempo Completo y Director del programa de Ingeniería en Robótica y Sistemas Digitales (IRS) en el Tecnológico de Monterrey, Campus Guadalajara, además de ser miembro del Sistema Nacional de Investigadores (SNI-1) en México.
					</p>
				</div>
			</div>
		</section>

		<hr class="separador" />

		<!-- 2. SECCIÓN MENTORES -->
		<section class="seccion-mentores">
			<h2 class="titulo-seccion">Mentores</h2>
			<div class="grid-mentores">
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Mentor 1" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Kevin</h2>
					<h3 class="rol-miembro">MENTOR</h3>
				</div>
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Mentor 2" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Viktor</h2>
					<h3 class="rol-miembro">MENTOR</h3>
				</div>
			</div>
		</section>

		<hr class="separador" />

		<!-- 3. SECCIÓN MESA DIRECTIVA Y FOTO DE GRUPO -->
		<section class="seccion-directiva">
			<div class="grid-directiva">
				<!-- Foto principal del equipo (Ocupa 2 columnas) -->
				<div class="tarjeta-grupo">
					<img src={grupo} alt="Equipo Principal" class="foto-grupo" />
				</div>

				<!-- Presidente -->
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Rodrigo Reveles" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Rodrigo Reveles</h2>
					<h3 class="rol-miembro">PRESIDENTE</h3>
					<a href="https://instagram.com/rodrigo_vvvvv" target="_blank" rel="noopener noreferrer" class="Redes">
						<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
							<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
							<line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
						</svg>
						<span>@rodrigo_vvvvv</span>
					</a>
				</div>

				<!-- Vicepresidente -->
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Alejandro Mojarras" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Alejandro Mojarras</h2>
					<h3 class="rol-miembro">VICEPRESIDENTE</h3>
					<a href="https://instagram.com/alejandro_mojarras" target="_blank" rel="noopener noreferrer" class="Redes">
						<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
							<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
							<line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
						</svg>
						<span>@alejandro_mojarras</span>
					</a>
				</div>

				<!-- Finanzas -->
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Carlos Lopez" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Carlos Lopez</h2>
					<h3 class="rol-miembro">FINANZAS</h3>
					<a href="https://instagram.com/elcharlie226" target="_blank" rel="noopener noreferrer" class="Redes">
						<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
							<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
							<line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
						</svg>
						<span>@elcharlie226</span>
					</a>
				</div>

				<!-- Logística y Operaciones -->
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Ricardo González" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Ricardo González</h2>
					<h3 class="rol-miembro">LOGÍSTICA Y OPERACIONES</h3>
					<a href="https://instagram.com/rickster_2004" target="_blank" rel="noopener noreferrer" class="Redes">
						<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
							<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
							<line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
						</svg>
						<span>@rickster_2004</span>
					</a>
				</div>

				<!-- Imagen -->
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Mariana Martínez" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Mariana Martínez</h2>
					<h3 class="rol-miembro">IMAGEN</h3>
					<a href="https://instagram.com/llaya_06" target="_blank" rel="noopener noreferrer" class="Redes">
						<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
							<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
							<line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
						</svg>
						<span>@llaya_06</span>
					</a>
				</div>

				<!-- Recursos Humanos -->
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Omar Verduzco" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Omar Verduzco</h2>
					<h3 class="rol-miembro">RECURSOS HUMANOS</h3>
					<a href="https://instagram.com/overduzc_0003" target="_blank" rel="noopener noreferrer" class="Redes">
						<svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
							<path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
							<line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
						</svg>
						<span>@overduzc_0003</span>
					</a>
				</div>
			</div>
		</section>

		<hr class="separador" />

		<!-- 4. NUEVOS MIEMBROS -->
		<section class="seccion-miembros">
			<div class="grid-miembros">
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Juan Carlos" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Juan Carlos</h2>
					<h3 class="rol-miembro">MIEMBRO</h3>
				</div>
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Alejandro" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Alejandro</h2>
					<h3 class="rol-miembro">MIEMBRO</h3>
				</div>
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Juan Pablo" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Juan Pablo</h2>
					<h3 class="rol-miembro">MIEMBRO</h3>
				</div>
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Fernando" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Fernando</h2>
					<h3 class="rol-miembro">MIEMBRO</h3>
				</div>
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Homero" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Homero</h2>
					<h3 class="rol-miembro">MIEMBRO</h3>
				</div>
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Diego" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Diego</h2>
					<h3 class="rol-miembro">MIEMBRO</h3>
				</div>
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Fernanda" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Fernanda</h2>
					<h3 class="rol-miembro">MIEMBRO</h3>
				</div>
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Aaron" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Aaron</h2>
					<h3 class="rol-miembro">MIEMBRO</h3>
				</div>
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Mariana" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Mariana</h2>
					<h3 class="rol-miembro">MIEMBRO</h3>
				</div>
				<div class="tarjeta-miembro">
					<img src={cuadro} alt="Miguel" class="foto-cuadrada" />
					<h2 class="nombre-miembro">Miguel</h2>
					<h3 class="rol-miembro">MIEMBRO</h3>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	/* Importación de Kite One desde Google Fonts */
	@import url('https://fonts.googleapis.com/css2?family=Kite+One&display=swap');

	/* Aplicación global de Kite One para toda la comunidad */
	.pagina-comunidad,
	.pagina-comunidad * {
		font-family: 'Kite One', sans-serif;
	}

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

	/* Títulos de sección */
	.Meet {
		font-size: 48px;
		font-weight: 400;
		color: #1a1a1a;
		margin-bottom: 20px;
	}

	.titulo-seccion {
		font-size: 32px;
		font-weight: 400;
		color: #1a1a1a;
		text-align: center;
		margin-bottom: 24px;
	}

	.separador {
		border: none;
		border-top: 1px solid #1a1a1a;
		margin: 35px 0;
	}

	/* 1. SECCIÓN LÍDER */
	.seccion-lider {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 40px;
		align-items: start;
	}

	.foto-lider {
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		background-color: #d1d1d1;
		display: block;
	}

	.info-lider {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding-top: 10px;
	}

	.nombre-lider {
		font-size: 32px;
		font-weight: 400;
		color: #1a1a1a;
		margin: 0;
		text-align: center;
	}

	.rol-lider {
		font-size: 16px;
		font-weight: 400;
		color: #333333;
		margin: 10px 0 24px 0;
		text-align: center;
	}

	.bio-lider {
		font-size: 16px;
		color: #1a1a1a;
		line-height: 1.5;
		text-align: center;
		max-width: 92%;
	}

	.bio-lider p {
		margin: 0 0 20px 0;
	}

	/* 2. SECCIÓN MENTORES */
	.grid-mentores {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 30px;
	}

	/* 3. MESA DIRECTIVA */
	.grid-directiva {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 30px;
	}

	.tarjeta-grupo {
		grid-column: span 2;
	}

	.foto-grupo {
		width: 100%;
		height: 100%;
		min-height: 250px;
		object-fit: cover;
		background-color: #d1d1d1;
		display: block;
	}

	/* 4. NUEVOS MIEMBROS */
	.grid-miembros {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 30px;
	}

	/* Tarjeta individual reutilizable para mentores y miembros */
	.tarjeta-miembro {
		display: flex;
		flex-direction: column;
	}

	.foto-cuadrada {
		width: 100%;
		aspect-ratio: 1 / 1;
		object-fit: cover;
		background-color: #d1d1d1;
		display: block;
	}

	.nombre-miembro {
		font-size: 22px;
		font-weight: 400;
		color: #1a1a1a;
		margin: 10px 0 0 0;
	}

	.rol-miembro {
		font-size: 11px;
		font-weight: 400;
		color: #444;
		margin: 3px 0 0 0;
		text-transform: uppercase;
	}

	.Redes {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		color: #666;
		margin-top: 4px;
		text-decoration: none;
		transition: color 0.2s ease;
	}

	.Redes:hover {
		color: #e1306c;
	}

	.ig-icon {
		width: 14px;
		height: 14px;
	}

    /* Centra los sobrantes (elemento 9 y 10) al iniciar el noveno en la 2da columna */
	.grid-miembros > .tarjeta-miembro:nth-child(9) {
		grid-column-start: 2;
	}

	/* RESPONSIVE */
	@media (max-width: 900px) {
		.Framework-equipo {
			padding: 20px;
		}

		.seccion-lider {
			grid-template-columns: 1fr;
			gap: 20px;
		}

		.grid-directiva,
		.grid-miembros,
		.grid-mentores {
			grid-template-columns: repeat(2, 1fr);
		}

		.tarjeta-grupo {
			grid-column: span 2;
		}
	}

	@media (max-width: 600px) {
		.grid-mentores {
			grid-template-columns: 1fr;
		}
	}
</style>