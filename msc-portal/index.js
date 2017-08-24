export default async function layoutLoader (layoutId) {
	let controller;

	switch (layoutId) {
		case 'Modelcentergoonline':
		case 'Modelcenterbasic':
			controller = await import('./ModelCenterBasic');
			break;
		case 'Modelcentersimple':
			controller = await import('./ModelCenterSimple');
			break;
		case 'Registration':
			controller = await import('./Registration');
			break;
		case 'Registrationbasic':
			controller = await import('./RegistrationBasic');
			break;
		case 'Error':
			controller = await import('./Error');
			break;
	}

	return controller.default;
}