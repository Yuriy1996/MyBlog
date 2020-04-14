module.exports = function () {
	const Global = require('./global');
	const {buildPreviewPostHtml, toggleLoader, widthScroll} = Global();

	function AddPost() {
		const urls = {
			posts: 'https://jsonplaceholder.typicode.com/posts'
		};

		const classes = {
			addPostContainer: 'add-post',
			addPostForm: 'add-post__form',
			inputs: 'add-post__input',
			counterSymbol: 'add-post__symbol-counter',
			btnOpenAddPostContainer: 'add-post-trigger',
			btnCloseAddPostContainer: 'add-post__closed',
			addPostOpen: 'add-post--open',
			btnOpenHidden: 'add-post-trigger--hidden',
			blogContainer: 'blog',
			articlesContainer: 'blog__articles',
			errorMessage: 'error-message',
			errorMessageActive: 'error-message--active',
		};

		const $addPostContainer = $(`.${classes.addPostContainer}`);
		const $addPostForm = $addPostContainer.find(`.${classes.addPostForm}`);
		const $inputs = $addPostForm.find(`.${classes.inputs}`);

		const $btnOpenAddPostContainer = $(`.${classes.btnOpenAddPostContainer}`);
		const $btnCloseAddPostContainer = $addPostContainer.find(`.${classes.btnCloseAddPostContainer}`);

		const $blogContainer = $(`.${classes.blogContainer}`);
		const $articlesContainer = $blogContainer.find(`.${classes.articlesContainer}`);
		const $errorMessageEl = $(`.${classes.errorMessage}`).clone();
		const $body = $('body');

		if ($addPostContainer.length) init();

		function init() {
			$btnOpenAddPostContainer.on('click', openAddPostContainer);
			$btnCloseAddPostContainer.on('click', closeAddPostContainer);

			$inputs.each((index, input) => {
				const $input = $(input);
				const maxSymbol = $input.attr('data-max-symbol') || false;

				if (maxSymbol) counterSymbol($input, maxSymbol);
			});
			$inputs.on('input', handlerInput);

			$addPostForm.submit(handlerSubmitPost);
		}

		function openAddPostContainer() {
			const bodyPaddingRight = parseInt($body.css('padding-right'));

			$addPostContainer.addClass(classes.addPostOpen);
			$btnOpenAddPostContainer.addClass(classes.btnOpenHidden);

			$body.css({
				'overflow': 'hidden',
				'padding-right': `${bodyPaddingRight + widthScroll}px`
			});
		}

		function closeAddPostContainer() {
			const bodyPaddingRight = parseInt($body.css('padding-right'));

			$addPostContainer.removeClass(classes.addPostOpen);
			$btnOpenAddPostContainer.removeClass(classes.btnOpenHidden);

			$body.css({
				'overflow': 'visible',
				'padding-right': `${bodyPaddingRight - widthScroll}px`
			});

			$inputs.val('');

			$errorMessageEl.removeClass(classes.errorMessageActive);
			$errorMessageEl.remove();
		}

		function handlerInput() {
			const $currentInput = $(this);
			const text = $currentInput.val();
			const maxSymbol = $currentInput.attr('data-max-symbol') || false;

			if (text[0] === ' ') {
				$currentInput.val(text.slice(1));
				handlerInput.apply(this);
				return;
			}

			if (maxSymbol) {
				$currentInput.val(text.slice(0, maxSymbol));
				counterSymbol($currentInput, maxSymbol);
			}

			if ($currentInput.attr('data-type') === 'number') {
				if (!parseInt(text)) {
					$currentInput.val('');
				} else {
					$currentInput.val(parseInt(text));
				}
			}
		}

		function counterSymbol($input, maxSymbol) {
			const $counter = $input.siblings(`.${classes.counterSymbol}`);
			const numSymbol = $input.val().length;
			$counter.text(`${maxSymbol - numSymbol}/${maxSymbol}`);
		}

		function handlerSubmitPost(e) {
			e.preventDefault();

			const formData = new FormData(this);
			const formDataObj = convertFormDataToObject(formData);

			const isEmptyInput = Object.values(formDataObj).includes('');

			if (isEmptyInput) return;

			toggleLoader();

			pushPost(JSON.stringify(formDataObj))
				.then((postInfo) => {
					return renderPreviewNewPost(postInfo);
				})
				.then(() => {
					closeAddPostContainer();
				})
				.catch(() => {
					$errorMessageEl.addClass(classes.errorMessageActive);
					$addPostForm.append($errorMessageEl);
				})
				.finally(() => {
					toggleLoader();
				});
		}

		function pushPost(postInfoJSON) {
			return fetch(urls.posts, {
				method: 'POST',
				body: postInfoJSON,
				headers: {
					'Content-type': 'application/json; charset=UTF-8'
				}
			})
				.then(response => {
					if (String(response.status)[0] !== '2') {
						throw new Error('Error');
					}

					return response.json();
				});
		}

		function renderPreviewNewPost(postInfo) {
			return buildPreviewPostHtml(postInfo)
				.then((previewPost) => {
					$articlesContainer.prepend(previewPost);
				});
		}

		function convertFormDataToObject(formData) {
			let object = {};

			formData.forEach((value, key) => {
				object[key] = value;
			});

			return object;
		}
	}

	return AddPost;
}();