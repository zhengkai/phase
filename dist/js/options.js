'use strict';

const tpl = document.getElementById('tpl').innerHTML;

const htmlLi = document.getElementById('opt-list');

const setPathPlaceHolder = (c) => {
	const form = new FormData(c.querySelector('form'));
	console.log('form', form.get('type'));

	if (form.get('type') === 'pac') {
		c.querySelector('input[name=path]').placeholder = 'http://localhost/pac.js';
	} else if (form.get('type') === 'socks5') {
		c.querySelector('input[name=path]').placeholder = '127.0.0.1:1080';
	} else {
		c.querySelector('input[name=path]').placeholder = '127.0.0.1:8118';
	}
};

const fillOne = (d) => {
	const c = document.createElement('div');
	c.className = 'opt';
	c.innerHTML = tpl;

	const cfg = d?.cfg || {};

	if (cfg.mode === 'auto_detect') {
		c.querySelector('input[name=type][value=pac]').checked = true;
	} else {
		const scheme = cfg.rules?.singleProxy?.scheme
		if (scheme === 'socks5') {
			c.querySelector('input[name=type][value=socks5]').checked = true;
		} else {
			c.querySelector('input[name=type][value=http]').checked = true;
		}
	}

	setPathPlaceHolder(c);
	c.querySelectorAll('input[name=type]').forEach((el) => {
		el.addEventListener('click', () => {
			setPathPlaceHolder(c);
		});
	});

	c.querySelector('button.delete').addEventListener('click', () => {
		console.log('delete', c);
		c.remove();
	});

	c.querySelector('input[name=name]').value = d?.name || '';

	document.getElementById('opt-list').appendChild(c);

	return c;
};

const setSerial = () => {
	htmlLi.querySelectorAll('div.name > span').forEach((el, idx) => {
		el.innerText = `${idx + 1}.`;
	});
};

document.querySelector('button.new').addEventListener('click', () => {
	const c = fillOne();
	c.querySelector('input[name=name]').focus();
});

chrome.runtime?.sendMessage({
	action: 'getList',
}, (li) => {
	li.forEach(fillOne);
	setSerial();
})

// [1, 2, 3].forEach(() => {
// fillOne();
// });
