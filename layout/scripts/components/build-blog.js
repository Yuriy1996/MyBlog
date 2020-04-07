module.exports = function () {
	function BuildBlog() {
		const urls = {
			posts: 'https://jsonplaceholder.typicode.com/posts',
			users: 'https://jsonplaceholder.typicode.com/users'
		};

		const classes = {
			blogContainer: 'blog',
			loader: 'loader',
			loaderActive: 'loader--active',
			errorMessage: 'error-message',
			errorMessageActive: 'error-message--active',
			btnLoadMore: 'blog__btn',
			articlesContainer: 'blog__articles'
		};

		const howManyPostsToUpload = 10;
		let counterUploadedPosts = 0;

		const $blogContainer = $(`.${classes.blogContainer}`);
		const $body = $('body');
		const $loaderEl = $(`.${classes.loader}`);
		const $articlesContainer = $blogContainer.find(`.${classes.articlesContainer}`);
		const $errorMessageEl = $(`.${classes.errorMessage}`);
		const $btnLoadMore = $blogContainer.find(`.${classes.btnLoadMore}`);

		const widthScroll = calcWidthScroll();

		if ($blogContainer.length) init();

		function calcWidthScroll() {
			const $div = $('<div></div>');
			$div.css({
				'width': '50px',
				'height': '50px',
				'overflow-y': 'scroll',
				'visibility': 'hidden'
			});

			$body.append($div);
			const scrollWidth = $div.outerWidth() - $div.prop('scrollWidth');
			$div.remove();

			return scrollWidth;
		}

		function init() {
			toggleLoader();

			getBlogPosts()
				.then((allPosts) => {
					const newPosts = allPosts.slice(counterUploadedPosts, counterUploadedPosts + howManyPostsToUpload);
					renderNewPost(newPosts, allPosts.length);

					$btnLoadMore.on('click', function () {
						toggleLoader();

						const newPosts = allPosts.slice(counterUploadedPosts, counterUploadedPosts + howManyPostsToUpload);
						renderNewPost(newPosts, allPosts.length);
					});
				})
				.catch(() => {
					toggleLoader();

					$errorMessageEl.addClass(classes.errorMessageActive);
					$articlesContainer.append($errorMessageEl);

					$btnLoadMore.hide();
				});

			function getBlogPosts() {
				return fetch(urls.posts).then(response => {
					if (response.status !== 200) {
						throw new Error('Error');
					}

					return response.json();
				});
			}

			function renderNewPost(arrNewPost, allPostsLength) {
				Promise.all(arrNewPost.map((postInfo) => {
					return buildPreviewPostHtml(postInfo).then(previewPost => {
						$articlesContainer.append(previewPost);
						counterUploadedPosts++;
					});
				})).then(() => {
					toggleLoader();

					if (allPostsLength === counterUploadedPosts) {
						$btnLoadMore.hide();
					}
				});
			}

			function buildPreviewPostHtml(postInfo) {
				return fetch(`${urls.users}/${postInfo.userId}`)
					.then(response => {
						if (response.status !== 200) {
							throw new Error('Error!');
						}

						return response.json();
					})
					.catch(() => false)
					.then(userInfo => {
						let userInfoHtml = '';

						if (userInfo) {
							userInfoHtml = `<p class="blog__preview-article-author subtext">Posted by <a href="#" class="blog__preview-article-author-link subtext--color-darken">${userInfo.name}</a></p>`
						}

						const previewPost = `<article class="blog__preview-article card"><h3 class="blog__preview-article-title title"><a class="blog__preview-article-link" target="_blank" href="post.html?postId=${postInfo.id}">${postInfo.title}</a></h3>${userInfoHtml}</article>`;

						return previewPost;
					});
			}

			function toggleLoader() {
				const bodyPaddingRight = parseInt($body.css('padding-right'));

				if (!$loaderEl.hasClass(classes.loaderActive)) {
					$loaderEl.addClass(classes.loaderActive);
					$body.css({
						'overflow': 'hidden',
						'padding-right': `${bodyPaddingRight + widthScroll}px`
					});
				} else {
					setTimeout(function () {
						$loaderEl.removeClass(classes.loaderActive);
						$body.css({
							'overflow': 'visible',
							'padding-right': `${bodyPaddingRight - widthScroll}px`
						});
					}, 500)
				}
			}
		}
	}

	return BuildBlog;
}();