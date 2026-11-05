import { createFileRoute, redirect } from "@tanstack/react-router";

/** El admin ya no tiene login: /auth queda solo como redirección a /admin. */
export const Route = createFileRoute("/auth")({
  beforeLoad: () => {
    throw redirect({ to: "/admin" });
  },
});
