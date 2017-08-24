import riot from 'riot';
import './Raw';

const createTag = function CREATE_TAG(options) {
	return riot.mount(document.createElement('div'), 'raw', options)[0];
};

describe('Raw riot element', () => {
	let tag;
	/* eslint-disable */
	let content = {
		multipleLines : `Simple
							example
							text.\n\nline breaks.`,
		entities	  : '<p>Text including some <strong>html</strong> magic.</p>',
		links		  : {
			simple 		 : 'Simple text with a link: http://modelcenter.jasmin.com',
			protocolLess : 'Text with a link, without protocol: modelcenter.jasmin.com',
			wiki		 : 'Text with a wikipedia link: https://en.wikipedia.org/wiki/Peter_Howson_(politician)',
			email		 : 'Text with an email address: info@modelcenter.com'
		}
	};
	/* eslint-enable */

	afterEach(() => {
		tag.unmount();
	});

	describe('"entities" option should work', () => {
		it('shouldn\'t change anything when it is set to false', () => {
			tag = createTag({
				entities : false,
				content  : content.entities
			});
			assert.isTrue(tag.refs.span.innerHTML === content.entities, 'content shouldn\'t change');
		});

		it('should display HTML tags as string', () => {
			tag = createTag({
				entities : true,
				content  : content.entities
			});
			assert.isTrue(tag.refs.span.innerHTML !== content.entities, 'content should change');
		});
	});

	describe('"linkify" option should work', () => {
		it('shouldn\'t change anything when it is set to false', () => {
			tag = createTag({
				linkify : false,
				content : content.links.simple
			});
			assert.isTrue(tag.refs.span.innerHTML === content.links.simple, 'content shouldn\'t change');
		});

		it('should link text containing http://', () => {
			tag = createTag({
				linkify : true,
				content : content.links.simple
			});
			assert.isTrue(tag.refs.span.innerHTML.indexOf('<a href') > -1, 'content should have link in it');
		});

		it('should link even when there isn\'t a protocol defined', () => {
			tag = createTag({
				linkify : true,
				content : content.links.protocolLess
			});
			assert.isTrue(tag.refs.span.innerHTML.indexOf('<a href') > -1, 'content should have link in it');
		});

		it('should link wikipedia pages when url contains brackets', () => {
			tag = createTag({
				linkify : true,
				content : content.links.wiki
			});
			assert.isTrue(tag.refs.span.innerHTML.indexOf('<a href') > -1, 'content should have link in it');
		});

		it('should link email addresses adding mailto:', () => {
			tag = createTag({
				linkify : true,
				content : content.links.email
			});
			assert.isTrue(
				tag.refs.span.innerHTML.indexOf('<a href="mailto:') > -1, 'content should have mailto link in it'
			);
		});
	});

	describe('"nl2br" option should work', () => {
		it('shouldn\'t change anything when the option is set to false', () => {
			tag = createTag({
				nl2br   : false,
				content : content.multipleLines
			});
			assert.isTrue(tag.refs.span.innerHTML === content.multipleLines, 'content shouldn\'t change');
		});

		it('should replace new lines to <br> tags when the option is set to true', () => {
			tag = createTag({
				nl2br   : true,
				content : content.multipleLines
			});
			assert.isTrue(
				tag.refs.span.innerHTML.indexOf('<br>') !== content.multipleLines.indexOf('<br>'),
				'content should have line-breaks'
			);
		});
	});
});