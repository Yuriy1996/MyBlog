module.exports = function () {
	function Global() {
		const urls = {
			users: 'https://jsonplaceholder.typicode.com/users'
		};
		const classes = {
			loader: 'loader',
			loaderActive: 'loader--active'
		};

		const $body = $('body');
		const $loaderEl = $(`.${classes.loader}`);

		const widthScroll = calcWidthScroll();

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

		return {
			buildPreviewPostHtml,
			toggleLoader,
			widthScroll: widthScroll
		}
	}

	return Global;
}();