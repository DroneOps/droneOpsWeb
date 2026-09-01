<script>
  let showSoftware = false;
  let showControl = false;
  let showDocumentacion = false;
</script>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DroneOps-Iniciar-Sesión</title>
    <header></header>
    <main>
    <div class="fondo">
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
        <a href="/iniciar_sesion">
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
            <img src="Drone.jpg" alt="Drone" class="Drone">
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
 <button type="button" class="software" on:click={() => showSoftware = !showSoftware}>
   &#9660;Software Base y Simulación
 </button>
 {#if showSoftware}
    <p class="txt-software">
      Este es el texto que se desplegará al hacer clic.
    </p>
 {/if}
</div>

<div>
 <button type="button" class="control" on:click={() => showControl = !showControl}>
   &#9660;Control, Estimación y Posicionamiento
 </button>
 {#if showControl}
    <p class="txt-control">
      Este es el texto que se desplegará al hacer clic.
    </p>
 {/if}
</div>

<div>
 <button type="button" class="documentacion" on:click={() => showDocumentacion = !showDocumentacion}>
   &#9660;Documentación Oficial y Librerías
 </button>
 {#if showDocumentacion}
    <p class="txt-documentacion">
      Este es el texto que se desplegará al hacer clic.
    </p>
 {/if}
</div>
       </div>
    </div>
    </main>
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
.Drone {
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
.fondo {
background-color: #ffffff;
}
</style>