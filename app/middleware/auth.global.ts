export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path.startsWith("/auth")) return;

  try {
    const headers = process.server ? useRequestHeaders(["cookie"]) : undefined;
    await $fetch("/api/user", {
      query: { me: "1" },
      headers,
    });
  } catch {
    return navigateTo("/auth/login");
  }
});
