import { describe, it, expect } from "vitest";
import { setup, createPage, $fetch } from "@nuxt/test-utils/e2e"; // :contentReference[oaicite:3]{index=3}

type TestUser = {
  name: string;
  email: string;
  password: string;
};

const AUTH_COOKIE = "fm_token";

function uniqEmail(prefix = "u") {
  const rnd = Math.random().toString(16).slice(2);
  return `${prefix}.${Date.now()}.${rnd}@example.com`.toLowerCase();
}

async function apiFromBrowser<T>(
  page: any,
  input: { path: string; method?: string; body?: any },
): Promise<{ status: number; json: T | null }> {
  return await page.evaluate(async ({ path, method, body }) => {
    const res = await fetch(path, {
      method: method ?? "GET",
      headers: body ? { "content-type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });

    let json: any = null;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    return { status: res.status, json };
  }, input);
}

async function deleteMeIfPossible(page: any) {
  // использует httpOnly cookie из текущего browser-context
  await page.evaluate(async () => {
    try {
      await fetch("/api/user", { method: "DELETE" });
    } catch {}
  });
}

async function registerViaUI(page: any, user: TestUser) {
  await page.goto("/auth/register");

  await page.getByPlaceholder("Как вас зовут").fill(user.name);
  await page.getByPlaceholder("you@example.com").fill(user.email);
  await page.getByPlaceholder("Минимум 8 символов").fill(user.password);

  // submit
  await Promise.all([
    page.waitForURL((u: URL) => u.pathname === "/" || u.pathname === "/main"),
    page.getByRole("button", { name: "Зарегистрироваться" }).click(),
  ]);
}

async function legacyCreateUser(page: any, user: TestUser) {
  // твой __test hook создаёт пользователя с plaintext passwordHash
  const r = await apiFromBrowser<any>(page, {
    path: "/api/user",
    method: "POST",
    body: {
      __test: true,
      email: user.email,
      name: user.name,
      password: user.password,
    },
  });
  expect(r.status).toBe(200);
}

async function loginByApi(
  page: any,
  creds: { email: string; password: string },
) {
  const r = await apiFromBrowser<any>(page, {
    path: "/api/user",
    method: "POST",
    body: { action: "login", email: creds.email, password: creds.password },
  });
  return r;
}

function statusFromFetchError(err: any) {
  return err?.statusCode ?? err?.response?.status ?? err?.data?.statusCode;
}

describe("auth: register/login/redirects", async () => {
  // Включаем browser-e2e (Playwright) через Nuxt Test Utils :contentReference[oaicite:4]{index=4}
  await setup({ browser: true });

  it.each([
    ["simple", { name: "John", email: uniqEmail("john") }],
    ["with space", { name: "John Doe", email: uniqEmail("john.doe") }],
    ["with apostrophe", { name: "O'Neil", email: uniqEmail("oneil") }],
    ["with hyphen", { name: "Mary-Jane", email: uniqEmail("maryjane") }],
    [
      "email case normalize",
      { name: "Alice", email: `ALICE.${Date.now()}@Example.COM` },
    ],
  ])(
    'UI: successful registration (%s) redirects to "/" and sets cookie',
    async (_label, partial) => {
      const page = await createPage("/");

      const user: TestUser = {
        name: partial.name,
        email: partial.email,
        password: "StrongPass123!", // >= 8
      };

      try {
        await registerViaUI(page, user);

        const path = new URL(page.url()).pathname;
        expect(path).toBe("/"); // по твоему критерию успеха

        // cookie должен появиться после login (httpOnly, но виден через context.cookies)
        const cookies = await page.context().cookies();
        const token = cookies.find((c: any) => c.name === AUTH_COOKIE);
        expect(!!token).toBe(true);

        // sanity: /api/user?me=1 должен стать доступен
        const me = await apiFromBrowser<any>(page, { path: "/api/user?me=1" });
        expect(me.status).toBe(200);
        expect(me.json?.email).toBe(user.email.trim().toLowerCase());
      } finally {
        await deleteMeIfPossible(page);
        await page.close();
      }
    },
  );

  it("UI: registration blocks non-latin name", async () => {
    const page = await createPage("/");

    try {
      await page.goto("/auth/register");
      await page.getByPlaceholder("Как вас зовут").fill("Иван");
      await page.getByPlaceholder("you@example.com").fill(uniqEmail("ivan"));
      await page.getByPlaceholder("Минимум 8 символов").fill("StrongPass123!");

      await page.getByRole("button", { name: "Зарегистрироваться" }).click();

      const visible = await page
        .getByText("Имя может содержать только латиницу.")
        .isVisible();
      expect(visible).toBe(true);
    } finally {
      await page.close();
    }
  });

  it("UI: registration blocks short password", async () => {
    const page = await createPage("/");

    try {
      await page.goto("/auth/register");
      await page.getByPlaceholder("Как вас зовут").fill("John");
      await page
        .getByPlaceholder("you@example.com")
        .fill(uniqEmail("shortpwd"));
      await page.getByPlaceholder("Минимум 8 символов").fill("1234567");

      await page.getByRole("button", { name: "Зарегистрироваться" }).click();

      const visible = await page
        .getByText("Пароль должен быть не короче 8 символов.")
        .isVisible();
      expect(visible).toBe(true);
    } finally {
      await page.close();
    }
  });

  it("API: register validation matrix (fast parameter checks)", async () => {
    // успешный кейс
    const okEmail = uniqEmail("apiok");
    const ok = await $fetch("/api/user", {
      method: "POST",
      body: {
        action: "register",
        email: okEmail,
        name: "John Doe",
        password: "StrongPass123!",
      },
    });
    expect((ok as any).email).toBe(okEmail);

    // invalid email
    try {
      await $fetch("/api/user", {
        method: "POST",
        body: {
          action: "register",
          email: "bad",
          name: "John",
          password: "StrongPass123!",
        },
      });
      throw new Error("expected to throw");
    } catch (e: any) {
      expect(statusFromFetchError(e)).toBe(400);
    }

    // non-latin name
    try {
      await $fetch("/api/user", {
        method: "POST",
        body: {
          action: "register",
          email: uniqEmail("apibadname"),
          name: "Иван",
          password: "StrongPass123!",
        },
      });
      throw new Error("expected to throw");
    } catch (e: any) {
      expect(statusFromFetchError(e)).toBe(400);
    }

    // duplicate email => 409
    try {
      await $fetch("/api/user", {
        method: "POST",
        body: {
          action: "register",
          email: okEmail,
          name: "John",
          password: "StrongPass123!",
        },
      });
      throw new Error("expected to throw");
    } catch (e: any) {
      expect(statusFromFetchError(e)).toBe(409);
    }
  });

  it("API+Browser: login success sets fm_token cookie; /api/user?me=1 becomes 200", async () => {
    const page = await createPage("/");

    const user: TestUser = {
      name: "Login User",
      email: uniqEmail("login"),
      password: "Password123!",
    };

    try {
      await legacyCreateUser(page, user);

      const login = await loginByApi(page, {
        email: user.email,
        password: user.password,
      });
      expect(login.status).toBe(200);

      const cookies = await page.context().cookies();
      expect(!!cookies.find((c: any) => c.name === AUTH_COOKIE)).toBe(true);

      const me = await apiFromBrowser<any>(page, { path: "/api/user?me=1" });
      expect(me.status).toBe(200);
      expect(me.json?.email).toBe(user.email);
    } finally {
      await deleteMeIfPossible(page);
      await page.close();
    }
  });

  it("API+Browser: login failure does not authorize user", async () => {
    const page = await createPage("/");

    const user: TestUser = {
      name: "Bad Login",
      email: uniqEmail("badlogin"),
      password: "Password123!",
    };

    try {
      await legacyCreateUser(page, user);

      const login = await loginByApi(page, {
        email: user.email,
        password: "WRONG_PASSWORD",
      });
      expect(login.status).toBe(401);

      const me = await apiFromBrowser<any>(page, { path: "/api/user?me=1" });
      expect(me.status).toBe(401);
    } finally {
      await page.close();
    }
  });

  it("Redirects: unauthenticated user is sent to /main (adjust PROTECTED_ROUTE if needed)", async () => {
    const page = await createPage("/");

    const PROTECTED_ROUTE = "/"; // если у тебя защищённый роут другой — поменяй тут
    const UNAUTH_TARGET = "/main"; // по твоему описанию

    try {
      await page.goto(PROTECTED_ROUTE);
      await page.waitForTimeout(150); // даём middleware дернуть redirect
      const path = new URL(page.url()).pathname;

      // либо уже /main, либо он туда перейдёт чуть позже — поэтому делаем мягко:
      if (path !== UNAUTH_TARGET) {
        await page.waitForURL((u: URL) => u.pathname === UNAUTH_TARGET, {
          timeout: 2000,
        });
      }
      expect(new URL(page.url()).pathname).toBe(UNAUTH_TARGET);
    } finally {
      await page.close();
    }
  });

  it("Redirects: authenticated user stays on protected route and not /main", async () => {
    const page = await createPage("/");

    const user: TestUser = {
      name: "Redirect User",
      email: uniqEmail("redir"),
      password: "Password123!",
    };
    const PROTECTED_ROUTE = "/";

    try {
      await legacyCreateUser(page, user);
      const login = await loginByApi(page, {
        email: user.email,
        password: user.password,
      });
      expect(login.status).toBe(200);

      await page.goto(PROTECTED_ROUTE);
      await page.waitForTimeout(150);

      const path = new URL(page.url()).pathname;
      expect(path).toBe(PROTECTED_ROUTE);
      expect(path).not.toBe("/main");
    } finally {
      await deleteMeIfPossible(page);
      await page.close();
    }
  });
});
