<script lang="ts">
	import qr from '$lib/assets/qr.png';

	// TODO: reemplaza esto con el link real de invitación de tu
	// comunidad de WhatsApp (el mismo que generó el QR). Así, quien
	// entre desde el celular puede tocar la tarjeta en vez de escanear.
	const enlaceWhatsApp = 'https://chat.whatsapp.com/TU-ENLACE-AQUI';
</script>

<div class="page-container">
	<div class="content-grid">
		<!-- Columna izquierda: texto e instrucciones -->
		<div class="info-column">
			<span class="pill-badge">
				<span class="dot"></span>
				ÚNETE A NOSOTROS
			</span>

			<h1 class="titulo">Grupo oficial de candidatos en WhatsApp</h1>

			<p class="descripcion">
				Este es el canal oficial de comunicación para los aspirantes y futuros
				miembros de DroneOps. Un espacio diseñado para que resuelvas tus dudas
				técnicas sobre robótica, compartas ideas innovadoras de vuelo autónomo
				y comiences a aportar valor a nuestra división de competencia.
			</p>

			<ol class="pasos">
				<li>
					<span class="paso-numero">1</span>
					<span class="paso-texto">Abre la cámara de tu teléfono y escanea el código QR</span>
				</li>
				<li>
					<span class="paso-numero">2</span>
					<span class="paso-texto">Toca el enlace que aparece para abrir WhatsApp</span>
				</li>
				<li>
					<span class="paso-numero">3</span>
					<span class="paso-texto">Únete al grupo y preséntate con tu nombre y área de interés</span>
				</li>
			</ol>

			<div class="aviso-box">
				<svg class="aviso-icono" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="12" cy="12" r="10" />
					<line x1="12" y1="8" x2="12" y2="12" />
					<line x1="12" y1="16" x2="12.01" y2="16" />
				</svg>
				<p>
					Este es un grupo formal de candidatos. Cualquier comportamiento
					inadecuado puede resultar en la expulsión del grupo. Sé respetuoso y
					colaborativo.
				</p>
			</div>
		</div>

		<!-- Columna derecha: tarjeta con el QR -->
		<div class="qr-column">
			<a
				class="qr-card"
				href={enlaceWhatsApp}
				target="_blank"
				rel="noopener noreferrer"
			>
				<div class="qr-frame">
					<img src={qr} alt="Código QR para unirte al grupo de WhatsApp de DroneOps" />
					<span class="qr-caption">[ ESCANEA EL QR ]</span>
				</div>

				<div class="qr-info">
					<svg width="22" height="22" viewBox="0 0 24 24" fill="#25D366">
						<path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.07L2 22l5.11-1.34A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 18a7.9 7.9 0 0 1-4.06-1.12l-.29-.17-3.03.79.81-2.96-.19-.3A7.93 7.93 0 1 1 12 20Z" opacity="0" />
						<path d="M17.47 14.38c-.29-.15-1.72-.85-1.99-.95-.27-.1-.46-.15-.66.15-.2.29-.76.95-.93 1.15-.17.2-.34.22-.63.07-.29-.15-1.23-.45-2.34-1.44-.86-.77-1.45-1.71-1.62-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.2-.29.29-.49.1-.2.05-.37-.02-.51-.07-.15-.66-1.6-.91-2.19-.24-.58-.48-.5-.66-.51h-.56c-.2 0-.51.07-.78.37-.27.29-1.02 1-1.02 2.44s1.05 2.83 1.19 3.03c.15.2 2.06 3.15 5 4.42.7.3 1.24.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.72-.7 1.96-1.38.24-.68.24-1.26.17-1.38-.07-.13-.27-.2-.56-.35Z" />
						<path d="M12 2C6.48 2 2 6.48 2 12c0 1.85.5 3.58 1.35 5.07L2 22l5.11-1.34A9.94 9.94 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Zm0 18a7.9 7.9 0 0 1-4.06-1.12l-.29-.17-3.03.79.81-2.96-.19-.3A7.93 7.93 0 1 1 12 20Z" />
					</svg>
					<div class="qr-info-texto">
						<span class="qr-nombre">DroneOps Candids</span>
						<span class="qr-subtitulo">WhatsApp Community · Grupo oficial</span>
					</div>
				</div>
			</a>
		</div>
	</div>
</div>

<style>
	.page-container {
		min-height: 100vh;
		background-color: #f8fafc;
		padding: 3rem;
		box-sizing: border-box;
	}

	.content-grid {
		max-width: 80rem;
		margin: 0 auto;
		display: grid;
		grid-template-columns: 1fr;
		gap: 2.5rem;
		align-items: start;
	}

	@media (min-width: 900px) {
		.content-grid {
			grid-template-columns: 1.05fr 0.95fr;
			gap: 3rem;
		}
	}

	/* Columna de texto */
	.pill-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		background-color: rgba(124, 58, 237, 0.08);
		border: 1px solid rgba(124, 58, 237, 0.35);
		color: #7c3aed;
		font-family: monospace;
		font-size: 0.7rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		padding: 0.4rem 0.9rem;
		border-radius: 9999px;
		margin-bottom: 1.5rem;
	}

	.pill-badge .dot {
		width: 0.4rem;
		height: 0.4rem;
		border-radius: 9999px;
		background-color: #7c3aed;
	}

	.titulo {
		font-size: 2.75rem;
		font-weight: 800;
		line-height: 1.15;
		color: #0f172a;
		margin: 0 0 1.25rem;
		font-family: system-ui, -apple-system, sans-serif;
	}

	.descripcion {
		font-size: 1rem;
		line-height: 1.6;
		color: #475569;
		max-width: 42rem;
		margin: 0 0 2rem;
	}

	.pasos {
		list-style: none;
		margin: 0 0 2rem;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}

	.pasos li {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.paso-numero {
		flex-shrink: 0;
		width: 1.9rem;
		height: 1.9rem;
		border-radius: 9999px;
		background-color: #7c3aed;
		color: #ffffff;
		font-weight: 700;
		font-size: 0.9rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.paso-texto {
		color: #1e293b;
		font-size: 1rem;
	}

	.aviso-box {
		display: flex;
		align-items: flex-start;
		gap: 0.85rem;
		background-color: #f3eefc;
		border: 1px solid #e2d3fb;
		border-radius: 0.9rem;
		padding: 1.1rem 1.3rem;
		max-width: 42rem;
	}

	.aviso-icono {
		flex-shrink: 0;
		color: #7c3aed;
		margin-top: 0.15rem;
	}

	.aviso-box p {
		margin: 0;
		font-size: 0.9rem;
		line-height: 1.55;
		color: #4c1d95;
	}

	/* Columna del QR */
	.qr-column {
		display: flex;
		justify-content: center;
	}

	.qr-card {
		display: block;
		width: 100%;
		max-width: 26rem;
		background-color: #ffffff;
		border-radius: 1.5rem;
		box-shadow: 0 20px 45px -10px rgba(15, 23, 42, 0.15);
		padding: 2rem;
		text-decoration: none;
		box-sizing: border-box;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.qr-card:hover {
		transform: translateY(-0.15rem);
		box-shadow: 0 24px 50px -8px rgba(15, 23, 42, 0.2);
	}

	.qr-frame {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		border: 2px dashed #7c3aed;
		border-radius: 1rem;
		padding: 2rem 1.5rem;
		margin-bottom: 1.5rem;
	}

	.qr-frame img {
		width: 100%;
		max-width: 12rem;
		height: auto;
		display: block;
	}

	.qr-caption {
		font-family: monospace;
		font-size: 0.75rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		color: #7c3aed;
	}

	.qr-info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.qr-info-texto {
		display: flex;
		flex-direction: column;
	}

	.qr-nombre {
		font-size: 1.05rem;
		font-weight: 700;
		color: #0f172a;
	}

	.qr-subtitulo {
		font-size: 0.8rem;
		color: #64748b;
	}
</style>