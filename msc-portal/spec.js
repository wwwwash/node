const style = document.createElement('style');
style.textContent = `
	#webpack-hot-middleware-clientOverlay {
		top: 90px !important;
	}
	body {
		background: #a60000;
		color: #fff;
	}
	#mocha-report > .suite > h1 {
		margin-top: 0;
	}
	#mocha-report > .suite > h1 a {
		display: block;
		margin: 0 !important;
		background: #930000;
		border-radius: 6px 6px 0 0;
		font-weight: 700;
		font-size: 16px;
		line-height: 12px;
		color: #fff;
		padding: 20px;
		text-align: center;
	}
	#mocha-report > .suite > ul > .suite > h1 {
		padding: 0;
		font-size: 18px;
	}
	#mocha-report > .suite > ul > .suite > ul > .suite {
		padding: 15px;
		background: #460000;
		border-radius: 6px;
		margin-bottom: 30px !important;
	}
	#mocha-report > .suite > ul > .suite > ul > .suite:last-of-type {
		margin-bottom: 0 !important;
	}
	#mocha-report > .suite > ul > .suite > ul > .suite > h1 a {
		font-weight: bold;
		font-size: 16px;
	}
	#mocha .suite {
		padding: 15px;
		background: #7b0000;
		border-radius: 30px 30px 6px 6px;
		margin: 0 !important;
	}
	#mocha .suite .suite .suite {
		padding: 0;
	}
	#mocha-report > .suite {
		padding: 0;
		margin-bottom: 30px !important;
	}
	#mocha-report > .suite:last-of-type {
		margin-bottom: 0 !important;
	}
	#mocha .test {
		margin: 0 0 5px 0 !important;
		border-radius: 6px;
		padding: 15px;
		overflow: hidden;
		position: relative;
		color: #fff !important;
	}
	#mocha .test:last-child {
		margin-bottom: 0 !important;
	}
	#mocha .test.fail {
		background: #b70000;
	}
	#mocha .test.pass {
		background: #488e6e;
	}
	#mocha .test.fail::before {
		font-size: 300px !important;
		position: absolute;
		color: #a70707 !important;
		top: -9px;
		left: -32px;
		line-height: 0.6;
	}
	#mocha .test.pass::before {
		font-size: 300px !important;
		position: absolute;
		color: #42c159 !important;
		top: -87px;
		left: -4px;
		line-height: 0.6;
	}
	#mocha .test pre {
		border: 0 !important;
		box-shadow: none !important;
		border-radius: 6px !important;
		background: #000;
		margin: 0 !important;
		position: relative;
		z-index: 1;
		font-size: 16px !important;
		overflow: auto;
	}
	#mocha .test pre.error {
		color: #c00;
		max-height: 300px;
		overflow: auto;
	}
	#mocha .test h2 {
		position: relative;
		font-size: 14px;
	}
	#mocha .test.fail h2 {
		font-size: 24px;
	}
	#mocha .test h2::before,
	#mocha .test h2::after {
		content: '';
		display: block;
		position: absolute;
		top: 100%;
		width: 100%;
		height: 10px;
	}
	#mocha .test h2::after {
		top: auto;
		bottom: 100%;
	}
	#mocha .test a.replay {
		top: 2px !important;
		font-size: 16px !important;
	}
	#mocha-stats {
		top: 13px !important;
		font-size: 21px !important;
		color: #fff !important;
		right: 43px !important;
	}
	#mocha-stats em {
		font-size: 1.3em;
		font-weight: bold;
		font-style: normal;
	}
	#mocha-stats canvas {
		width: 65px !important;
		height: 65px !important;
	}
	#testbed-sticky {
	    text-transform: uppercase;
		padding: 30px 50px;
		color: #a2e2c5;
		font-weight: bold;
	}
	#testbed-sticky > span:first-child {
		display: none;
	}
	.testbed-success#testbed-sticky {
		background: #488e6e;
	}
	.testbed-failed#testbed-sticky {
		color: #000 !important;
		background: #b70000 !important;
	}
	#testbed {
		height: 90px !important;
	}
	#mocha .test.pass.slow .duration {
		background: #b94a48 !important;
		float: right !important;
		position: absolute !important;
		right: 35px !important;
		font-size: 14px !important;
		top: -5px !important;
		border-radius: 20px !important;
		padding: 5px 10px !important;
	}
	#sandboxContainer {
		font-family: sans-serif;
	}
	#sandbox {
		position: relative;
		overflow: hidden;
		width: calc(100% - 100px);
		height: 1px;
		background: #fff;
		border-radius: 6px;
		box-sizing: border-box;
		margin-left: 50px;
		visibility: hidden;
		color: #000;
	}
	#sandbox:empty::after {
		content: 'Empty';
		display: block;
	}
	#sandboxContainer > label {
	    display: inline-block;
		margin: 30px 0 5px 50px;
	}
	#sandboxContainer > input:checked + #sandbox {
		overflow: auto;
		height: auto;
		padding: 15px;
		visibility: visible;
	}
`;
document.head.appendChild(style);

const sandboxContainer = document.createElement('div');
sandboxContainer.innerHTML = `
	<label for="toggle_sandbox">Toggle sandbox visibility</label>
	<input id="toggle_sandbox" type="checkbox" />
	<div id="sandbox"></div>
`;
sandboxContainer.id = 'sandboxContainer';
document.body.insertBefore(sandboxContainer, document.querySelector('#mocha'));

require('babel-polyfill');
require('./src/lib/chaos/Application');
const TestBedMocha = require('test-bed/adapters/mocha');

TestBedMocha.setup({ ui: 'bdd' });

global.chai = require('chai');
global.expect = global.chai.expect;
global.assert = global.chai.assert;
global.sandbox = document.querySelector('#sandbox');

TestBedMocha.run({
	context: require.context(
		'./src',
		true,
		/\.spec\.js$/
	)
});