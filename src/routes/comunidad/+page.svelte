<script lang="ts">
    //Estas fotos van a cambiar pero asi quedara de momento
    import cuadro from '$lib/assets/cuadro.png';
    import lider from '$lib/assets/theLida.jfif';
    import grupo from '$lib/assets/DJI_D_RIRO.JPG.jpeg'
	import rodrigo from '$lib/assets/rodrigo.jfif'
	import ricky from '$lib/assets/ricky.png'
	import carlos from '$lib/assets/carlos.jpeg'
	import chewin from '$lib/assets/chewin.png'
	import alexin from '$lib/assets/alexin.png'
	import omar from '$lib/assets/omar.png'
	import yaya from '$lib/assets/mariana.jfif'
    import manu from '$lib/assets/Manu.jfif'
</script>

<div class="pagina-comunidad">
    <div class="Framework-equipo">
        <!-- Título Principal -->
        <h1 class="Meet">MEET THE TEAM</h1>
        <hr class="separador" />

        <!-- 1. SECCIÓN LÍDER / ASESOR -->
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
                    <img src={cuadro} alt="Mentor Kevin" class="foto-cuadrada" />
                    <h2 class="nombre-miembro">Kevin</h2>
                    <h3 class="rol-miembro">MENTOR</h3>
                </div>
                <div class="tarjeta-miembro">
                    <img src={cuadro} alt="Mentor Victor" class="foto-cuadrada" />
                    <h2 class="nombre-miembro">Victor</h2>
                    <h3 class="rol-miembro">MENTOR</h3>
                </div>
                <div class="tarjeta-miembro">
                    <img src={manu} alt="Mentor Manuel" class="foto-cuadrada" />
                    <h2 class="nombre-miembro">Manuel</h2>
                    <h3 class="rol-miembro">MENTOR</h3>
                </div>
                <div class="tarjeta-miembro">
                    <img src={chewin} alt="Mentor Edwin" class="foto-cuadrada" />
                    <h2 class="nombre-miembro">Edwin</h2>
                    <h3 class="rol-miembro">MENTOR</h3>
                </div>
            </div>
        </section>

        <hr class="separador" />

        <!-- 3. SECCIÓN MESA DIRECTIVA Y FOTO DE GRUPO -->
        <section class="seccion-directiva">
            <div class="grid-directiva">
                <!-- Foto principal del equipo -->
                <div class="tarjeta-grupo">
                    <img src={grupo} alt="Equipo Principal" class="foto-grupo" />
                </div>

                <div class="tarjeta-miembro">
                    <img src={rodrigo} alt="Rodrigo Reveles" class="foto-cuadrada" />
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

                <div class="tarjeta-miembro">
                    <img src={carlos} alt="Carlos Lopez" class="foto-cuadrada" />
                    <h2 class="nombre-miembro">Carlos Lopez</h2>
                    <h3 class="rol-miembro">VICEPRESIDENTE</h3>
                    <a href="https://instagram.com/elcharlie226" target="_blank" rel="noopener noreferrer" class="Redes">
                        <svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                        </svg>
                        <span>@elcharlie226</span>
                    </a>
                </div>

                <div class="tarjeta-miembro">
                    <img src={alexin} alt="Alejandro" class="foto-cuadrada" />
                    <h2 class="nombre-miembro">Alejandro Díaz</h2>
                    <h3 class="rol-miembro">FINANZAS</h3>
                </div>

                <div class="tarjeta-miembro">
                    <img src={ricky} alt="Ricardo González" class="foto-cuadrada" />
                    <h2 class="nombre-miembro">Ricardo González</h2>
                    <h3 class="rol-miembro">LOGÍSTICA Y OP.</h3>
                    <a href="https://instagram.com/rickster_2004" target="_blank" rel="noopener noreferrer" class="Redes">
                        <svg class="ig-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                        </svg>
                        <span>@rickster_2004</span>
                    </a>
                </div>

                <div class="tarjeta-miembro">
                    <img src={yaya} alt="Mariana Martínez" class="foto-cuadrada" />
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

                <div class="tarjeta-miembro">
                    <img src={omar} alt="Omar Verduzco" class="foto-cuadrada" />
                    <h2 class="nombre-miembro">Omar Verduzco</h2>
                    <h3 class="rol-miembro">RRHH</h3>
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
                <!-- Se agregaron atributos 'alt' para corregir la advertencia de accesibilidad -->
                <div class="tarjeta-miembro"><img src={cuadro} alt="Juan Carlos" class="foto-cuadrada" /><h2 class="nombre-miembro">Juan Carlos</h2><h3 class="rol-miembro">MIEMBRO</h3></div>
                <div class="tarjeta-miembro"><img src={cuadro} alt="Marco" class="foto-cuadrada" /><h2 class="nombre-miembro">Marco</h2><h3 class="rol-miembro">MIEMBRO</h3></div>
                <div class="tarjeta-miembro"><img src={cuadro} alt="Juan Pablo" class="foto-cuadrada" /><h2 class="nombre-miembro">Juan Pablo</h2><h3 class="rol-miembro">MIEMBRO</h3></div>
                <div class="tarjeta-miembro"><img src={cuadro} alt="Fernando" class="foto-cuadrada" /><h2 class="nombre-miembro">Fernando</h2><h3 class="rol-miembro">MIEMBRO</h3></div>
                <div class="tarjeta-miembro"><img src={cuadro} alt="Homero" class="foto-cuadrada" /><h2 class="nombre-miembro">Homero</h2><h3 class="rol-miembro">MIEMBRO</h3></div>
                <div class="tarjeta-miembro"><img src={cuadro} alt="Diego" class="foto-cuadrada" /><h2 class="nombre-miembro">Diego</h2><h3 class="rol-miembro">MIEMBRO</h3></div>
                <div class="tarjeta-miembro"><img src={cuadro} alt="Fernanda" class="foto-cuadrada" /><h2 class="nombre-miembro">Fernanda</h2><h3 class="rol-miembro">MIEMBRO</h3></div>
                <div class="tarjeta-miembro"><img src={cuadro} alt="Pablo" class="foto-cuadrada" /><h2 class="nombre-miembro">Pablo</h2><h3 class="rol-miembro">MIEMBRO</h3></div>
                <div class="tarjeta-miembro"><img src={cuadro} alt="Mariana" class="foto-cuadrada" /><h2 class="nombre-miembro">Mariana</h2><h3 class="rol-miembro">MIEMBRO</h3></div>
                <div class="tarjeta-miembro"><img src={cuadro} alt="Miguel" class="foto-cuadrada" /><h2 class="nombre-miembro">Miguel</h2><h3 class="rol-miembro">MIEMBRO</h3></div>
            </div>
        </section>
    </div>
</div>

<style>
    @import url('https://fonts.googleapis.com/css2?family=Kite+One&display=swap');

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
        max-width: 1280px; /* Aumentado a 1280px para un balance entre compacto y el tamaño original (1440px) */
        margin: 0 auto;
    }

    /* Títulos */
    .Meet {
        font-size: 36px;
        font-weight: 400;
        margin-bottom: 15px;
    }

    .titulo-seccion {
        font-size: 26px;
        font-weight: 400;
        text-align: center;
        margin-bottom: 20px;
    }

    .separador {
        border: none;
        border-top: 3px solid #e0e0e0;
        margin: 30px 0;
    }

    /* 1. SECCIÓN LÍDER */
    .seccion-lider {
        display: grid;
        grid-template-columns: 380px 1fr; /* Foto ligeramente más grande acorde al nuevo ancho total */
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
        display: flex;
        flex-direction: column;
        align-items: center; /* Vuelto a centrar como solicitaste */
        text-align: center; /* Vuelto a centrar como solicitaste */
    }

    .nombre-lider {
        font-size: 30px; 
        margin: 0;
    }

    .rol-lider {
        font-size: 15px;
        color: #666;
        margin: 5px 0 15px 0;
    }

    .bio-lider {
        font-size: 16px; 
        color: #333;
        line-height: 1.6;
    }

    .bio-lider p {
        margin: 0 0 12px 0;
    }

    /* GRIDS GENERALES */
    .grid-mentores {
        display: grid;
        grid-template-columns: repeat(4, 1fr); 
        gap: 24px; 
    }

    .grid-directiva {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 24px;
    }

    .tarjeta-grupo {
        grid-column: span 2;
    }

    .foto-grupo {
        width: 100%;
        height: 100%;
        min-height: 200px; 
        object-fit: cover;
        border-radius: 8px;
    }

    .grid-miembros {
        display: grid;
        grid-template-columns: repeat(5, 1fr); 
        gap: 20px;
    }

    /* TARJETAS */
    .tarjeta-miembro {
        display: flex;
        flex-direction: column;
    }

    .foto-cuadrada {
        width: 100%;
        aspect-ratio: 1 / 1;
        object-fit: cover;
        border-radius: 8px;
        background-color: #f0f0f0;
    }

    .nombre-miembro {
        font-size: 18px; 
        margin: 8px 0 0 0;
    }

    .rol-miembro {
        font-size: 10px;
        color: #666;
        margin: 2px 0 0 0;
        letter-spacing: 0.5px;
    }

    .Redes {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: #888;
        margin-top: 6px;
        text-decoration: none;
    }

    .Redes:hover {
        color: #e1306c;
    }

    .ig-icon {
        width: 12px;
        height: 12px;
    }

    /* RESPONSIVE */
    @media (max-width: 900px) {
        .seccion-lider {
            grid-template-columns: 1fr;
            text-align: center;
        }
        .info-lider {
            align-items: center;
            text-align: center;
        }
        .grid-directiva, .grid-miembros, .grid-mentores {
            grid-template-columns: repeat(3, 1fr);
        }
        .tarjeta-grupo {
            grid-column: span 3;
        }
    }

    @media (max-width: 600px) {
        .grid-directiva, .grid-miembros, .grid-mentores {
            grid-template-columns: repeat(2, 1fr);
        }
        .tarjeta-grupo {
            grid-column: span 2;
        }
    }
</style>