module.exports = function () {
	const Global = require('./global');
	const {toggleLoader} = Global();

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
			errorMessage: 'error-message',
			errorMessageActive: 'error-message--active'
		};

		const $fullPostContainer = $(`.${classes.postContainer}`);
		const $errorMessageEl = $(`.${classes.errorMessage}`);
		const postId = location.search.split('=')[1];

		if ($fullPostContainer.length) init();

		function init() {
			toggleLoader();

			Promise.all([
				getPostJson(),
				getCommentsPost()
			])
				.then(function ([postInfo, comments]) {
					renderPost(postInfo);
					renderComments(comments);
				})
				.catch(() => {
					$errorMessageEl.addClass(classes.errorMessageActive);
					$fullPostContainer.append($errorMessageEl);
				})
				.finally(() => {
					toggleLoader();
				});
		}

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

		function changePageTitle(title) {
			document.title = title;
		}
	}

	return BuildPost;
}();