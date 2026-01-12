export default defineNuxtRouteMiddleware(async (to) => {
  const publicRoutes = ["/main", "/about"];

  if (to.path.startsWith("/auth") || publicRoutes.includes(to.path)) {
    return;
  }

  try {
    const headers = process.server ? useRequestHeaders(["cookie"]) : undefined;
    await $fetch("/api/user", {
      query: { me: "1" },
      headers,
    });
  } catch {
    return navigateTo("/main");
  }
});
