(async () => {
	console.log('options.js loaded');

	const response = await chrome.runtime.sendMessage({
		type: 'FROM_OPTIONS',
		data: '这是来自options页面的消息'
	});
	console.log('response from background:', response);

	/*
	var config = {
		mode: "fixed_servers",
		rules: {
			proxyForHttp: {
				scheme: "socks5",
				host: "1.2.3.4"
			},
			bypassList: ["foobar.com"]
		}
	};
	chrome.proxy.settings.set(
		{ value: config, scope: 'regular' },
		function() { }
	);

	config = {
		mode: "direct",
	}
	chrome.proxy.settings.set(
		{ value: config, scope: 'regular' },
		function() { }
	);

	chrome.proxy.settings.get(
		{ 'incognito': false },
		function(config) {
			console.log(JSON.stringify(config));
		}
	);
	*/
})();
