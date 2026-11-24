// portal.ts
import type { Action } from 'svelte/action';

export const portal: Action<HTMLElement, HTMLElement | undefined> = (node, target) => {
	const destino = target ?? document.body;
	destino.appendChild(node);

	return {
		update(nuevoTarget) {
			const sigDestino = nuevoTarget ?? document.body;
			if (node.parentElement !== sigDestino) {
				sigDestino.appendChild(node);
			}
		},
		destroy() {
			node.remove();
		}
	};
};