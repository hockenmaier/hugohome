# Social Preview Images

To control the image shown when a page is shared on social platforms, set a `featured` value in the page front matter:

```toml
featured = "/images/your-image.png"
```

If no `featured` value is provided, the first image in the body will be used. As a last fallback the site wide banner from `params.banner` in `hugo.toml` is used.

After publishing, verify the metadata using tools like [Facebook Debugger](https://developers.facebook.com/tools/debug/) or [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/).
