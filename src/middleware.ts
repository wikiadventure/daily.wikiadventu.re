import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware(async (context, next) => {
	const response = await next();
	if (response.status === 404 && context.url.pathname.startsWith("/daily")) {
		return new Response(null, { status: 404 });
	}
	return response;
});
