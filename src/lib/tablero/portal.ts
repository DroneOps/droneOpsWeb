// src/lib/tablero/portal.ts
// Saca un elemento de donde esté y lo coloca directamente en <body>.
// Sirve para que los paneles y ventanas (que son "fixed") siempre queden por encima
// del Navbar y del resto del sitio, sin importar en qué contenedor del layout vivan.
//
// Uso:  <div use:portal> ... </div>   (el elemento debe ser la ÚNICA raíz del componente)
export function portal(node: HTMLElement) {
	document.body.appendChild(node);
	return {
		destroy() {
			node.remove();
		}
	};
}