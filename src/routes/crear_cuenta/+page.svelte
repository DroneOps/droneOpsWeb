<script lang="ts">
    import singupder from '$lib/assets/singup-der.png'
    import singupizq from '$lib/assets/singup-izq.png'
	interface RegisterForm {
		nombre: string;
		apellidos: string;
		usuario: string;
		email: string;
		tel: string;
		carrera: string;
	}

	let formData: RegisterForm = $state({
		nombre: '',
		apellidos: '',
		usuario: '',
		email: '',
		tel: '',
		carrera: ''
	});

	function handleSubmit(event: SubmitEvent): void {
		event.preventDefault();
		console.log('Datos de registro:', formData);
	}
</script>

<header></header>

<main class="signup-container">
	<div class="left-banner">
		<img src={singupizq} alt="DroneOps izq" />
	</div>

	<div class="form-section">
		<h1>Crear Cuenta</h1>
		
		<form onsubmit={handleSubmit}>
			<div class="input-name">
				<label for="Nombre">Nombre(s):</label>
				<input 
					type="text" 
					id="Nombre" 
					name="Nombre" 
					bind:value={formData.nombre} 
					required 
				/>
			</div>

			<div class="input-Last-name">
				<label for="Apellidos">Apellido(s):</label>
				<input 
					type="text" 
					id="Apellidos" 
					name="Apellidos" 
					bind:value={formData.apellidos} 
					required 
				/>
			</div>

			<div class="input-user">
				<label for="Usuario">Usuario:</label>
				<input 
					type="text" 
					id="Usuario" 
					name="Usuario" 
					bind:value={formData.usuario} 
					required 
				/>
			</div>

			<div class="input-email">
				<label for="email">Correo electrónico:</label>
				<input 
					type="email" 
					id="email" 
					name="email" 
					bind:value={formData.email} 
					required 
				/>
			</div>

			<div class="input-tel">
				<label for="tel">Teléfono:</label>
				<input 
					type="tel" 
					id="tel" 
					name="tel" 
					bind:value={formData.tel} 
					required 
				/>
			</div>

			<div class="input-carrera">
				<label for="carrera">Carrera (Siglas):</label>
				<input 
					type="text" 
					id="carrera" 
					name="carrera" 
					bind:value={formData.carrera} 
					required 
				/>
			</div>

			<button type="submit" class="btn-submit">Crear Cuenta</button>
		</form>
	</div>

	<div class="right-banner">
		<img src={singupder} alt="DroneOps Der" />
	</div>
</main>

<style>
	/* Se eliminaron :global(*) y :global(body) */


	

	.signup-container {
		display: flex;
		width: 99.05vw;
		height: calc(100vh - 60px);
		background-color: #ffffff;
	}

	.left-banner,
	.right-banner {
		width: 32.5%;
		height: 100%;
		overflow: hidden;
	}

	.left-banner img,
	.right-banner img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.form-section {
		width: 35%;
		height: 100%;
		background-color: #ffffff;
		padding: 30px 20px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		overflow-y: auto;
	}

	.form-section h1 {
		font-size: 32px;
		font-weight: 500;
		margin-bottom: 25px;
		color: #000000;
		text-align: center;
	}

	.form-section form {
		width: 100%;
		max-width: 320px;
	}

	.form-section form > div {
		margin-bottom: 12px;
		display: flex;
		flex-direction: column;
	}

	.form-section label {
		font-size: 13px;
		color: #222222;
		margin-bottom: 4px;
	}

	.form-section input {
		width: 100%;
		height: 36px;
		background-color: #d9d9d9;
		border: none;
		border-radius: 2px;
		padding: 0 10px;
		font-size: 13px;
		outline: none;
		color: #111111;
	}

	.btn-submit {
		width: 100%;
		height: 40px;
		margin-top: 18px;
		background-color: #8a2be2;
		color: #ffffff;
		font-size: 14px;
		font-weight: bold;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		transition: background-color 0.2s ease;
	}

	.btn-submit:hover {
		background-color: #7322c2;
	}
</style>