import Sound from './Sound';

describe('Sound Component', () => {
	describe('should load and', () => {
		let sound;
		let audioEl;
		let stopPromise;

		before(() => {
			sound = new Sound();
			audioEl = sound.audioEl;
			stopPromise = new Promise(resolve => {
				audioEl.addEventListener('ended', resolve, {
					once : true
				});
			});
		});

		it('should play a beep', () => {
			sound.playSound();
			assert.isFalse(audioEl.paused, 'is not playing');
		});

		it('should have stopped', async () => {
			await stopPromise;
			assert.isTrue(audioEl.paused, 'is not stopped');
		});
	});
});