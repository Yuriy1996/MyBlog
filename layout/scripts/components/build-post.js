module.exports = function () {
	function BuildPost() {
		const urls = {
			posts: 'https://jsonplaceholder.typicode.com/posts',
			users: 'https://jsonplaceholder.typicode.com/users',
			comments: 'https://jsonplaceholder.typicode.com/comments'
		};

		const classes = {
			postContainer: 'post',
			commentsBlock: 'comments-block',
			wrapper: 'wrapper',
			loader: 'loader',
			loaderActive: 'loader--active',
			errorMessage: 'error-message',
			errorMessageActive: 'error-message--active'
		};

		const $fullPostContainer = $(`.${classes.postContainer}`);
		const $body = $('body');
		const $loaderEl = $(`.${classes.loader}`);
		const $errorMessageEl = $(`.${classes.errorMessage}`);
		const postId = location.search.split('=')[1];
		const widthScroll = calcWidthScroll();

		if ($fullPostContainer.length) init();

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

			Promise.all([
				getPostJson(),
				getCommentsPost()
			])
				.then(function([postInfo, comments]) {
					renderPost(postInfo);
					renderComments(comments);
			})
				.then(() => {
					toggleLoader();
			})
				.catch(() => {
					toggleLoader();

					$errorMessageEl.addClass(classes.errorMessageActive);
					$fullPostContainer.append($errorMessageEl);
			});

			function getPostJson() {
				return fetch(`${urls.posts}/${postId}`).then(response => {
					if (response.status !== 200) {
						throw new Error('Error');
					}

					return response.json();
				});
			}

			function getUserJson(userId) {
				return fetch(`${urls.users}/${userId}`)
					.then(response => {
						if (response.status !== 200) {
							throw new Error('Error');
						}
						return response.json()
					})
					.catch(() => false);
			}

			function getCommentsPost() {
				return fetch(`${urls.comments}?postId=${postId}`)
					.then(response => {
						if (response.status !== 200) {
							throw new Error('Error');
						}

						return response.json();
					})
					.catch(() => []);
			}

			function renderPost(postInfo) {
				getUserJson(postInfo.userId)
					.then(userInfo => {
						$fullPostContainer.find(`.${classes.wrapper}`).append(buildPostHtml(postInfo, userInfo));
						changePageTitle(postInfo.title);
					});
			}
			
			function renderComments(comments) {
				const $commentsBlock = $(`.${classes.commentsBlock}`);
				const $commentsWrapper = $commentsBlock.find(`.${classes.wrapper}`);

				$commentsWrapper.append(`<h3 class="comments-block__title title"><span class="comments-block__counter-comment">${comments.length}</span> comments</h3>`);

				comments.forEach((comment) => {
					$commentsWrapper.append(buildCommentHtml(comment));
				});
			}

			function buildPostHtml(postInfo, userInfo) {
				let authorHtml = '';

				if (userInfo) {
					authorHtml = `<p class="post__author subtext">Posted by <a href="#" class="post__author-link subtext--color-darken">${userInfo.name}</a></p>`;
				}

				const postHtml = `<h1 class="post__title title">${postInfo.title}</h1>${authorHtml}<p class="post__text">${postInfo.body}</p>`;

				return postHtml;
			}

			function buildCommentHtml(comment) {
				const commentHtml = `<div class="comments-block__item"><h4 class="comments-block__item-title title">${comment.name}</h4><p class="comments-block__item-text">${comment.body}</p></div>`;

				return commentHtml;
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

			function changePageTitle(title) {
				document.title = title;
			}
		}
	}

	return BuildPost;
}();