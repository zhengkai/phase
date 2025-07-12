const origin = new URL(chrome.runtime.getURL('')).origin;

(() => {

	console.log('chrome.runtime.getURL()', origin);

	chrome.runtime.onMessage.addListener((req, sender, sendRsp) => {
		console.log('req', req)
		if (sender.id !== chrome.runtime.id) {
			return;
		}
		console.log('收到来自options页面的消息:', req, sender);
		sendRsp({
			status: 'success',
			message: 'Service Worker已收到你的消息',
			receivedData: req.data
		});
		return true;
	});
})();
