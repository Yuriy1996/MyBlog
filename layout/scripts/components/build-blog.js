module.exports = function () {
	const Global = require('./global');
	const {buildPreviewPostHtml, toggleLoader} = Global();

	function BuildBlog() {
		const urls = {
			posts: 'https://jsonplaceholder.typicode.com/posts'
		};
		const classes = {
			blogContainer: 'blog',
			errorMessage: 'error-message',
			errorMessageActive: 'error-message--active',
			btnLoadMore: 'blog__btn',
			articlesContainer: 'blog__articles'
		};

		const howManyPostsToUpload = 10;
		let counterUploadedPosts = 0;

		const $blogContainer = $(`.${classes.blogContainer}`);
		const $articlesContainer = $blogContainer.find(`.${classes.articlesContainer}`);
		const $errorMessageEl = $(`.${classes.errorMessage}`);
		const $btnLoadMore = $blogContainer.find(`.${classes.btnLoadMore}`);

		if ($blogContainer.length) init();

		function init() {
			toggleLoader();

			getBlogPosts()
				.then((allPosts) => {
					const newPosts = allPosts.slice(counterUploadedPosts, counterUploadedPosts + howManyPostsToUpload);
					renderPreviewNewPost(newPosts, allPosts.length);

					$btnLoadMore.on('click', allPosts, clickBtnLoadMore);
				})
				.catch(() => {
					$errorMessageEl.addClass(classes.errorMessageActive);
					$articlesContainer.append($errorMessageEl);

					$btnLoadMore.hide();
				})
				.finally(() => {
					toggleLoader();
				});
		}

		function getBlogPosts() {
			return fetch(urls.posts).then(response => {
				if (response.status !== 200) {
					throw new Error('Error');
				}

				return response.json();
			});
		}

		function renderPreviewNewPost(arrNewPost, allPostsLength) {
			return Promise.all(arrNewPost.map((postInfo) => {
				return buildPreviewPostHtml(postInfo).then(previewPost => {
					$articlesContainer.append(previewPost);
					counterUploadedPosts++;
				});
			}))
				.then(() => {
					if (allPostsLength === counterUploadedPosts) {
						$btnLoadMore.hide();
					}
				});
		}

		function clickBtnLoadMore(e) {
			toggleLoader();

			const allPosts = e.data;

			const newPosts = allPosts.slice(counterUploadedPosts, counterUploadedPosts + howManyPostsToUpload);
			renderPreviewNewPost(newPosts, allPosts.length)
				.finally(() => {
					toggleLoader();
				});
		}
	}

	return BuildBlog;
}();