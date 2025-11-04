// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// Polyfill TextEncoder/TextDecoder for Jest environment (some libs expect them)
if (typeof TextEncoder === 'undefined') {
	// Node's util provides TextEncoder/TextDecoder on most versions
	// eslint-disable-next-line global-require
	const { TextEncoder, TextDecoder } = require('util');
	global.TextEncoder = TextEncoder;
	global.TextDecoder = TextDecoder;
}

import '@testing-library/jest-dom';
