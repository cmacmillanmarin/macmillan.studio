# Development

## Setup

- [Nuxt](#nuxt)
- [Vercel](#vercel)
- [WordPress](#wordpress)

Follow the setup steps to run the project locally or in a server.

## Nuxt

Look at the [nuxt 3 documentation](https://v3.nuxtjs.org) to learn more.

### Setup

- Clone this repository.
- Remove the `.git` folder and create your own repository.
- Push the code.

### Development

Make sure to install the dependencies:

```bash
npm install
```

Run your dev server

```bash
npm run dev
```

The local server is running `http://localhost:3000/`

If you need https protocol:

- Install mkcert on your system
- Create a valid certificate by running the following command in your project folder `mkcert localhost`
- Run `npm run dev-https`

The local server is running `https://localhost:3000/`

## Vercel

This starter assumes you will use Vercel as front-end hosting provider. Feel free to use Netlify or others and customize these steps to your needs.

### Setup

- Create a new project in Vercel linking the repository. From now on called `Production Host`. Edit the build task to `npm run generate`.
- Create another project in Vercel linking to the same repository. From now on called `Preview Host`. Edit the build task to `npm run build`.
- Go to the `Preview Host` settings environment values tab and add a variable called `PREVIEW` setting `1` as value. Enable them to all environments.
- Go to the `Production Host` settings git tab, create a deploy hook, this is your deployment link.
- Go to `~/vercel.json` and add your preview link to the permanent redirection.

## Wordpress

Tested with WordPress 6.1.1. We recommend downloading the latest stable WordPress version. However, if the following steps don't work, you can download the tested version [here](https://github.com/cmacmillanmarin/ms_wordpress_6-1-1).

### Simple Setup (Plug and Play)

- Download WordPress source code. [Link](https://wordpress.org/download/).
- Install WordPress locally or in a server. Don't jump to the next step until you have installed WordPress successfully. [More Info](https://wordpress.org/documentation/article/how-to-install-wordpress/).
- Go to `Settings` > `Permalinks` and set `Post name` as active.
- Go to `Plugins`, uninstall existing plugins and install the [required plugins](#plugins).
- Go to `Settings` > `Media` and change the image size settings. I recommend large 1920px, medium 1024px and thumbnail 768px.
- Edit in `~/config/env/.env.*` your `BE_PROTOCOL` and `BE_BASE_URL` values with your installed rest api base url (Check `~/config/env/.env.prod` for reference).
- Check `/posts` frontend page to see if the BE is connected.

### Plugins

- Classic Editor. [Link](https://wordpress.org/plugins/classic-editor/).
- WP REST API Controller. [Link](https://wordpress.org/plugins/wp-rest-api-controller/).
- Easy Updates Manager. [Link](https://wordpress.org/plugins/stops-core-theme-and-plugin-updates/). Disable all updates for WordPress and installed plugins.

## Contributors

- [Christian MacMillan](mailto:christian@macmillan.studio)

## License

MIT.
