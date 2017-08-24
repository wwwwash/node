import riot from 'riot';
import linkifyHtml from 'linkifyjs/html';

riot.tag('raw', '<span ref="span"></span>', '', function(opts) {
	this.updateContent = function() {
		let content = opts.content;
		if (opts.entities) {
			content = content.replace(/&/g, '&amp;')
				.replace(/</g, '&lt;')
				.replace(/>/g, '&gt;')
				.replace(/"/g, '&quot;');
		}
		if (opts.linkify) {
			content = linkifyHtml(content);
		}
		if (opts.nl2br) {
			content = content.replace(/(?:\r\n|\r|\n)/g, '<br />');
		}
		this.refs.span.innerHTML = content;
	};

	this.on('mount', ::this.updateContent);
	this.on('update', ::this.updateContent);
});
