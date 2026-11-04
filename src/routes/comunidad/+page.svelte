<script lang="ts">
    // Estas fotos van a cambiar, pero así quedan de momento
    import cuadro from '$lib/assets/cuadro.png';
    import lider from '$lib/assets/theLida.jfif';
    import rodrigo from '$lib/assets/rodrigo.jfif';
    import ricky from '$lib/assets/ricky.png';
    import carlos from '$lib/assets/carlos.jpeg';
    import chewin from '$lib/assets/chewin.png';
    import alexin from '$lib/assets/alexin.png';
    import omar from '$lib/assets/omar.png';
    import yaya from '$lib/assets/mariana.jfif';
    import manu from '$lib/assets/Manu.jfif';
    import vic from '$lib/assets/victor.jfif';
    import ferb from '$lib/assets/ferb.jpeg';
    import kevin from '$lib/assets/kevin.jpeg'

    type Persona = { nombre: string; rol: string; foto: string; instagram?: string };

    // Orden: refundadores, mentor en doctorado, laboratorista y colaborador
    const mentores: Persona[] = [
        { nombre: 'Manuel', rol: 'MENTOR Y REFUNDADOR', foto: manu },
        { nombre: 'Edwin', rol: 'MENTOR Y REFUNDADOR', foto: chewin },
        { nombre: 'Kevin', rol: 'MENTOR Y DOCTORANTE', foto: kevin },
        { nombre: 'Victor', rol: 'LABORATORISTA Y COLABORADOR', foto: vic }
    ];

    const directiva: Persona[] = [
        { nombre: 'Rodrigo Reveles', rol: 'PRESIDENTE', foto: rodrigo, instagram: 'rodrigo_vvvvv' },
        { nombre: 'Carlos Lopez', rol: 'VICEPRESIDENTE', foto: carlos, instagram: 'elcharlie226' },
        { nombre: 'Alejandro Díaz', rol: 'FINANZAS', foto: alexin },
        { nombre: 'Ricardo González', rol: 'LOGÍSTICA Y OP.', foto: ricky, instagram: 'rickster_2004' },
        { nombre: 'Mariana Martínez', rol: 'IMAGEN', foto: yaya, instagram: 'llaya_06' },
        { nombre: 'Omar Verduzco', rol: 'RRHH', foto: omar, instagram: 'overduzc_0003' }
    ];

    const miembros: Persona[] = [
        { nombre: 'Juan Carlos', rol: 'MIEMBRO', foto: cuadro },
        { nombre: 'Marco', rol: 'MIEMBRO', foto: cuadro },
        { nombre: 'Juan Pablo', rol: 'MIEMBRO', foto: cuadro },
        { nombre: 'Fernando', rol: 'MIEMBRO', foto: ferb },
        { nombre: 'Homero', rol: 'MIEMBRO', foto: cuadro },
        { nombre: 'Diego', rol: 'MIEMBRO', foto: cuadro },
        { nombre: 'Fernanda', rol: 'MIEMBRO', foto: cuadro },
        { nombre: 'Pablo', rol: 'MIEMBRO', foto: cuadro },
        { nombre: 'Mariana', rol: 'MIEMBRO', foto: cuadro },
        { nombre: 'Miguel', rol: 'MIEMBRO', foto: cuadro }
    ];
</script>

<div class="pagina-comunidad">
    <div class="contenedor">
        <h1 class="titulo-principal">Conoce el equipo</h1>

        <!-- 1. LÍDER -->
        <section class="seccion-lider">
            <img src={lider} alt="Dr. Hernán Abaunza González" class="foto-lider" />

			<div class="info-lider">
				<h2 class="nombre-lider">Hernán Abaunza González</h2>
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
            <div class="info-lider">
                <h2 class="nombre-lider">Hernán Abaunza-González</h2>
                <p class="rol-lider">Líder</p>
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

        <!-- 2. MENTORES -->
        <section>
            <h2 class="titulo-seccion">Mentores</h2>
            <div class="grid grid-4">
                {#each mentores as p}
                    <article class="tarjeta">
                        <img src={p.foto} alt={`${p.nombre}, ${p.rol.toLowerCase()}`} class="foto" />
                        <h3 class="nombre">{p.nombre}</h3>
                        <p class="rol">{p.rol}</p>
                    </article>
                {/each}
            </div>
        </section>

        <hr class="separador" />

        <!-- 3. MESA DIRECTIVA -->
        <section>
            <h2 class="titulo-seccion">Mesa directiva</h2>
            <div class="grid grid-3">
                {#each directiva as p}
                    <article class="tarjeta">
                        <img src={p.foto} alt={p.nombre} class="foto" />
                        <h3 class="nombre">{p.nombre}</h3>
                        <p class="rol">{p.rol}</p>
                        {#if p.instagram}
                            <a
                                href={`https://instagram.com/${p.instagram}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                class="redes"
                            >
                                <svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                                    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                                </svg>
                                <span>@{p.instagram}</span>
                            </a>
                        {/if}
                    </article>
                {/each}
            </div>
        </section>

        <hr class="separador" />

        <!-- 4. MIEMBROS -->
        <section>
            <h2 class="titulo-seccion">Miembros</h2>
            <div class="grid grid-5">
                {#each miembros as p}
                    <article class="tarjeta">
                        <img src={p.foto} alt={p.nombre} class="foto" />
                        <h3 class="nombre">{p.nombre}</h3>
                        <p class="rol">{p.rol}</p>
                    </article>
                {/each}
            </div>
        </section>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Kite+One&display=swap');

    .pagina-comunidad,
    .pagina-comunidad * {
        font-family: 'Kite One', sans-serif;
        box-sizing: border-box;
    }

    .pagina-comunidad {
        background-color: #ffffff;
        color: #1a1a1a;
        width: 100%;
    }

    .contenedor {
        max-width: 1280px;
        margin: 0 auto;
        padding: 40px 40px 80px;
    }

    h1, h2, h3, p {
        margin: 0;
        font-weight: 400;
    }

    /* Títulos */
    .titulo-principal {
        font-size: 36px;
        margin-bottom: 24px;
    }

    .titulo-seccion {
        font-size: 26px;
        text-align: center;
        margin-bottom: 24px;
    }

    .separador {
        border: none;
        border-top: 3px solid #e0e0e0;
        margin: 48px 0;
    }

    /* Líder */
    .seccion-lider {
        display: grid;
        grid-template-columns: 380px 1fr;
        gap: 40px;
        align-items: center;
    }

    .foto-lider {
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
        border-radius: 8px;
        background-color: #f0f0f0;
    }

    .info-lider {
        text-align: center;
    }

    .nombre-lider {
        font-size: 30px;
    }

    .rol-lider {
        font-size: 15px;
        color: #666;
        margin: 6px 0 18px;
    }

    .bio-lider {
        font-size: 16px;
        color: #333;
        line-height: 1.6;
    }

    .bio-lider p + p {
        margin-top: 12px;
    }

    /* Grids */
    .grid {
        display: grid;
        gap: 24px;
    }

    .grid-3 {
        grid-template-columns: repeat(3, 1fr);
    }

    .grid-4 {
        grid-template-columns: repeat(4, 1fr);
    }

    .grid-5 {
        grid-template-columns: repeat(5, 1fr);
        gap: 20px;
    }

    /* Tarjetas */
    .tarjeta {
        display: flex;
        flex-direction: column;
    }

    .foto {
        display: block;
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
        border-radius: 8px;
        background-color: #f0f0f0;
    }

    .nombre {
        font-size: 18px;
        margin-top: 10px;
    }

    .rol {
        font-size: 12px;
        color: #666;
        margin-top: 2px;
        letter-spacing: 0.5px;
    }

    .redes {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        align-self: flex-start;
        font-size: 12px;
        color: #888;
        margin-top: 6px;
        text-decoration: none;
    }

    .redes:hover,
    .redes:focus-visible {
        color: #e1306c;
    }

    .ig-icon {
        width: 13px;
        height: 13px;
    }

    /* Responsivo */
    @media (max-width: 900px) {
        .contenedor {
            padding: 28px 20px 60px;
        }

        .seccion-lider {
            grid-template-columns: 1fr;
        }

        .foto-lider {
            max-width: 380px;
            margin: 0 auto;
        }

        .grid-4,
        .grid-5 {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @media (max-width: 600px) {
        .grid-3,
        .grid-4,
        .grid-5 {
            grid-template-columns: repeat(2, 1fr);
        }
    }
</style>