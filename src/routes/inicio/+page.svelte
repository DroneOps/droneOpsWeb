
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DroneOps-Iniciar-Sesión</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header> 
     <div class="brand-logo">
      <a href="http://127.0.0.1:5500/Inicio/inicio.html">
       <img src="navbar-logo.png" alt="Logo DroneOps" class="topbar-logo">
      </a>
     </div>
        <nav class="nabvar-buttons">
         <a href="http://127.0.0.1:5500/Inicio/inicio.html">
          <button type="submit" class="btn-inicio">Inicio</button>
         </a>
         <button type="submit" class="btn-objetivo">Objetivo</button>
         <button type="submit" class="hacer">Por Hacer</button>
         <button type="submit" class="btn-comunidad">Comunidad</button>
        </nav>
         <a href="http://127.0.0.1:5500/Iniciar%20sesion/iniciar-sesion.html">
          <button type="submit" class="btn-access">Acceso Miembros</button>
         </a>
    </header>
    <main>
    <div class="seccion-bienvenida">
       <img src="hero-badge.png" alt="hero" class="hero">
       <h1 class="txt-principal">¡Bienvenido a la central de <br>DroneOps!</h1>  
       <p class="somos">Somos un equipo apasionado por la tecnología robótica, la innovación y la captura de <br>datos desde las alturas. 
                Diseñamos, operamos y optimizamos soluciones con drones para <br>llevar cualquier proyecto al siguiente nivel.
       </p>
       <div class="unete-hacer">
        <a href="http://127.0.0.1:5500/Crear%20Cuenta/crear-cuenta.html">
         <button type="submit" class="btn-unete">Únete</button>
        </a>
        <a href="#">
         <button type="submit" class="por-hacer">Por hacer</button>
        </a>
       </div>
        <div>
            <img src="Insanos.jpg" alt="gods" class="sigmas">
        </div>
    </div>
       <div>
        <p class="nuestro-objetivo">Nuestro Objetivo</p>
        <h2 class="competencias-tittle">Competencias internacionales</h2>
        <p class="competencias-txt">
         En DroneOps, nos proyectamos hacia el futuro de la industria <br>aérea no tripulada. 
         Transformamos la perspectiva de los proyectos <br>mediante tecnología de vanguardia, precisión técnica y máxima 
         seguridad operativa.
        </p>
        <div class="competencias">
            <img src="mission-right.png" alt="Competencias internacionales" class="mission-right">
        </div>
        <div class="Drone">
            <img src="Drone.jpg" alt="Drone photo" class="Drone-photo">
        </div>
       </div>
       <div>
        <p class="aprendizaje">Aprendizaje y medios</p>
        <h2 class="recursos-y-documentacion">Recursos y documentación</h2>
        <p class="aprendizaje-txt">
         En DroneOps fundamentamos nuestras operaciones en ingeniería de control, visión artificial y simulación avanzada. 
         Compartimos nuestra base de conocimiento y guías<br> de desarrollo para el equipo y la comunidad.
        </p>
         <div>
          <button type="button" class="software" id="btn-software-1">&#9660;Software Base y Simulación</button>
             <p id="texto-software-1" style="display: none;" class="txt-software">
             Este es el texto que se desplegará al hacer clic.
             </p>
         </div>
         <div>
          <button type="button" class="control" id="btn-control-1">&#9660;Control, Estimación y Posicionamiento</button>
             <p id="texto-control-1" style="display: none;" class="txt-control">
             Este es el texto que se desplegará al hacer clic.
             </p>
         </div>
         <div>
          <button type="button" class="documentacion" id="btn-documentacion-1">&#9660;Documentación Oficial y Librerías</button>
             <p id="texto-documentacion-1" style="display: none;" class="txt-documentacion">
             Este es el texto que se desplegará al hacer clic.
             </p>
         </div>
         <p class="a" style="visibility: hidden;">a</p>
       <div class="all-footer">
        <div class="footer">
         <img src="navbar-logo.png" alt="logo abajo" class="footer-logo">
        </div>
        <p class="grupo">Grupo de tecnología y robótica aérea de vanguardia. <br>Diseñando autonomía, rompiendo barreras internacionales.</p>
        <p class="asociasion">Asociación de Robótica de la Universidad</p>
        <p class="guion">▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔</p>
        <div class="aso-right">
        <p>© 2026 DroneOps. Todos los derechos reservados</p>
        <p class="TEC">Instituto Tecnológico y de Estudios Superiores de Monterrey, Campus Guadalajara · TEC</p>
        </div>
        <div class="comunidad">
        <p class="comunidad-txt">COMUNIDAD</p>
        <a href="https://github.com/DroneOps">
            <img src="icon-github.png" class="git-icon"><button type="submit" class="btn-github">GitHub</button>
        </a><br>
        <a href="https://www.instagram.com/droneops.gdl/">
            <img src="icon-instagram.png" class="ig-icon"><button type="submit" class="btn-ig">Instagram</button>
        </a>
        </div>
       </div>
    </main>
    <script src="inicio.js" defer></script>
</body>
</html>
<style>
* {
box-sizing: border-box;
margin: 0;
padding: 0;
font-family: Arial, Helvetica, sans-serif;
}
html, body {
  max-width: 100%;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
}

body {
display: flex;
flex-direction: column;
margin: 0;
padding: 0;
background-color: transparent;
}
header {
background-color: #1a1c23;
display: flex;
align-items: center;
justify-content: space-between;
padding: 12px 32px;
height: 60px;
}
.topbar-logo {
height: 28px;
display: block;
}
.brand-logo {
background-color: #1a1a1e;
color: #ffffff;
padding: 12px 24px;
display: flex;
align-items: center;
height: 48px;
}
header button {
background: transparent;
border: none;
color: #9ca3af; 
font-size: 14px;
font-weight: 500;
cursor: pointer;
margin: 0 16px;
transition: color 0.2s ease;
}
.navbar-buttons {
display: flex;
gap: 24px;
}
header button:hover {
color: #ffffff;
}
.btn-access {
border: 1px solid #2d3748 !important;
border-radius: 6px;
padding: 8px 16px;
color: #ffffff !important;
margin-left: auto;
}
.btn-access:hover {
background-color: rgba(255, 255, 255, 0.05);
}
header a,
.topbar a,
.navbar-buttons a {
text-decoration: none !important;
outline: none !important;
}
header button,
.topbar button,
.navbar-buttons button {
text-decoration: none !important;
outline: none !important;
border-bottom: none !important;
}
header button::after,
.topbar button::after,
.btn-inicio::after {
display: none !important;
}
.hero {
margin-top: 130px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 40px; /* Empuja el contenido de abajo */   
}
.txt-principal {
color: rgb(0, 0, 0);
margin-top: 0px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */
font-size: 50px;
font-family: "Poppins", Arial, sans-serif;
}
.somos {
margin-top: 45px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */ 
}
/* Limpieza base para los dos botones */
.btn-unete, 
.por-hacer {
padding: 10px 20px;       /* Relleno interno: [arriba/abajo] [izquierda/derecha] */
border-radius: 10px;      /* Bordes redondeados */
font-weight: bold;        /* Texto en negrita */
font-size: 14px;          /* Tamaño del texto */
cursor: pointer;          /* Muestra la manita al pasar el mouse */
transition: all 0.2s;     /* Suaviza los efectos de animación */
}
.btn-unete {
background-color: #7c3aed; /* Color de fondo morado */
color: #ffffff;            /* Texto blanco */
border: none;              /* Quitamos el borde por defecto */
}
.por-hacer {
background-color: transparent; /* Fondo transparente */
color: #1e293b;                /* Texto oscuro */
border: 1px solid #1e293b;     /* Borde: [grosor] [estilo] [color] */
}
.unete-hacer {
margin-top: 30px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 150px; /* Empuja el contenido de abajo */ 
display: flex;
gap: 12px; /* Cambia 12px por el espacio que quieras entre ellos */
}
/* 2. Movemos la foto como si fuera una pegatina flotante */
.sigmas {
position: absolute;
top: 150px;     /* Distancia desde la parte superior de la pantalla */
right: 50px;   /* Pegada a la derecha */
width: 600px;  /* Tamaño fijo para que no estorbe */
height: auto;
}
.nuestro-objetivo {
color:#7c3aed;
margin-top: 0px;    /* Empuja hacia abajo */
margin-left: 140px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */ 
}
.competencias-tittle {
color:#000000;
margin-top: 10px;    /* Empuja hacia abajo */
margin-left: 140px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */  
font-size: 32px;  
}
.competencias-txt {
margin-top: 15px;    /* Empuja hacia abajo */
margin-left: 140px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */ 
}
.competencias {
color:#000000;
margin-top: 60px;    /* Empuja hacia abajo */
margin-left: 140px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */  
font-size: 32px;
}
.Drone-photo {
position: absolute;
top: 700px;     /* Distancia desde la parte superior de la pantalla */
right: 175px;   /* Pegada a la derecha */
width: 450px;  /* Tamaño fijo para que no estorbe */
height: auto;
}
.aprendizaje {
color:#7c3aed;
margin-top: 60px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */  
}
.aprendizaje {
color:#7c3aed;
margin-top: 60px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */  
}
.recursos-y-documentacion {
color:#000000;
margin-top: 10px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */ 
font-size: 32px;     
}
.aprendizaje-txt {
margin-top: 15px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */   
}
.software {
margin-top: 15px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */ 
width: 82%;                /* Ocupa todo el ancho de su contenedor */
background-color: #e0e0e0;  /* Color gris claro de fondo */
color: #000000;             /* Texto en color negro */
font-weight: bold;          /* Texto en negrita */
font-size: 28px;            /* Tamaño de la letra */
padding: 36px 48px;         /* Espaciado interno (arriba/abajo e izquierda/derecha) */
border: none;               /* Quita el borde feo por defecto */
border-radius: 20px;        /* Redondea bastante las esquinas */
text-align: left;           /* Alinea el texto a la izquierda */
cursor: pointer;            /* Muestra la manita al pasar el mouse */
box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15); /* Sombra suave gris inferior */
}
.txt-software {
margin-top: 15px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */     
}
.control {
margin-top: 15px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */ 
width: 82%;                /* Ocupa todo el ancho de su contenedor */
background-color: #e0e0e0;  /* Color gris claro de fondo */
color: #000000;             /* Texto en color negro */
font-weight: bold;          /* Texto en negrita */
font-size: 28px;            /* Tamaño de la letra */
padding: 36px 48px;         /* Espaciado interno (arriba/abajo e izquierda/derecha) */
border: none;               /* Quita el borde feo por defecto */
border-radius: 20px;        /* Redondea bastante las esquinas */
text-align: left;           /* Alinea el texto a la izquierda */
cursor: pointer;            /* Muestra la manita al pasar el mouse */
box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15); /* Sombra suave gris inferior */
}
.txt-control {
margin-top: 15px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */
}
.documentacion {
margin-top: 15px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */ 
width: 82%;                /* Ocupa todo el ancho de su contenedor */
background-color: #e0e0e0;  /* Color gris claro de fondo */
color: #000000;             /* Texto en color negro */
font-weight: bold;          /* Texto en negrita */
font-size: 28px;            /* Tamaño de la letra */
padding: 36px 48px;         /* Espaciado interno (arriba/abajo e izquierda/derecha) */
border: none;               /* Quita el borde feo por defecto */
border-radius: 20px;        /* Redondea bastante las esquinas */
text-align: left;           /* Alinea el texto a la izquierda */
cursor: pointer;            /* Muestra la manita al pasar el mouse */
box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.15); /* Sombra suave gris inferior */
}
.txt-documentacion {
margin-top: 15px;    /* Empuja hacia abajo */
margin-left: 100px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */
}
.a {
margin-top: 200px;    /* Empuja hacia abajo */
margin-left: 0px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */   
}
.all-footer {
background-color: #0b0f19; /* Este color oscuro solo afectará esta caja */
color: #ffffff;            /* Cambia el texto interno a blanco */
width: 100%;               /* Ocupa todo el ancho de la pantalla */
padding: 40px 60px 20px;   /* Espaciado interno para que no quede apretado */
box-sizing: border-box;    /* Evita que el padding deforme el ancho */
}
.footer-logo {
margin-top: 0px;    /* Empuja hacia abajo */
margin-left: 50px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */
}
.grupo {
margin-top: 15px;    /* Empuja hacia abajo */
margin-left: 50px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */   
}
.asociasion {
margin-top: 20px;    /* Empuja hacia abajo */
margin-left: 50px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */  
color:#7c3aed;    
}
.aso-right {
margin-top: 20px;    /* Empuja hacia abajo */
margin-left: 50px;  /* Empuja hacia la derecha */
margin-bottom: 0px; /* Empuja el contenido de abajo */
display: flex;
justify-content: space-between; /* Empuja un texto a cada extremo */
align-items: center;            /* Los nivela a la misma altura vertical */ 
gap:1
}
.TEC {
margin-right: 80px; /* Incrementa este número para recorrerlo más a la izquierda */
}
.guion {
margin-top:75px;
margin-left: 50px;
}
.comunidad {
  /* Mueve X px a la derecha (positivo) o izquierda (negativo) y Y px abajo */
  transform: translate(1170px, -260px); 
  display: flex;
  flex-direction: column;
  gap: 0px; /* Aumenta este número para separar más los elementos entre sí */
}
.comunidad-txt {
margin-top: 0px;    /* Empuja hacia abajo */
margin-left: 0px;  /* Empuja hacia la derecha */
margin-bottom: 20px; /* Empuja el contenido de abajo */
}
.btn-github {
margin: 100px;
margin-bottom: 0px;
background: transparent;
border: none;
color: #9ca3af; 
font-size: 14px;
font-weight: 500;
cursor: pointer;
margin: 0 16px;
transition: color 0.2s ease;
}
.btn-ig {
margin-bottom: 0px;
background: transparent;
border: none;
color: #9ca3af; 
font-size: 14px;
font-weight: 500;
cursor: pointer;
margin: 0 16px;
transition: color 0.2s ease;
}
.git-icon {
transform: translate(10px, 4px);
}
.ig-icon {
transform: translate(10px, 4px);
}
</style>