import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ChatProvider } from "../dist/index.js";
import {
  Button,
  ConfirmProvider,
  EmployeeAvatar,
  EmptyState,
  ObjectSettingsRow,
  ObjectSettingsSection,
  ProductStatus,
  ToastProvider,
} from "../dist/app/index.js";

test("application primitives render without product stores or network access", () => {
  const html = renderToStaticMarkup(
    h(ObjectSettingsSection, { title: "Environment" },
      h(ObjectSettingsRow, { title: "State", value: h(ProductStatus, { tone: "warning", label: "Needs action" }) }),
      h(ObjectSettingsRow, { title: "Open", onClick() {} }),
    ),
  );
  assert.match(html, /agent-ui-settings-section/);
  assert.match(html, /data-tone="warning"[^>]*>.*Needs action/);
  assert.match(html, /<button class="agent-ui-settings-row agent-ui-settings-row-plain agent-ui-settings-button" type="button">/);
  const leading = renderToStaticMarkup(h(ObjectSettingsRow, { title: "Helper", leading: h("span", null, "A") }));
  assert.match(leading, /class="agent-ui-settings-row">/);
  assert.match(renderToStaticMarkup(h(Button, { variant: "primary" }, "Create")), /class="primary-button" type="button"/);
});

test("empty states and employee avatars keep caller-owned labels and deterministic fallbacks", () => {
  const empty = renderToStaticMarkup(
    h(EmptyState, { illustration: "sprout", title: "No agents", actions: [{ label: "Create", onClick() {}, variant: "primary" }] }),
  );
  assert.match(empty, /og-empty-state/);
  assert.match(empty, /<svg[^>]*aria-hidden="true"/);
  assert.match(empty, /class="primary-button"[^>]*>Create</);
  const avatar = renderToStaticMarkup(h(EmployeeAvatar, { seed: "agent-1", fallbackName: "Helper", size: 40 }));
  assert.match(avatar, /width:40px/);
  assert.doesNotMatch(avatar, /<img/);
});

test("confirm and toast providers render on the server without a document", () => {
  const html = renderToStaticMarkup(
    h(ChatProvider, { translate: (key) => `[${key}]` },
      h(ConfirmProvider, null, h(ToastProvider, null, h("main", null, "content")))),
  );
  assert.match(html, /<main>content<\/main>/);
});

test("the application stylesheet defines light and dark tokens used by portaled surfaces", async () => {
  const tokens = await readFile(new URL("../dist/app/tokens.css", import.meta.url), "utf8");
  assert.match(tokens, /^:root \{/m);
  assert.match(tokens, /^:root\[data-theme="dark"\] \{/m);
  for (const name of ["--c-surface", "--modal-overlay-bg", "--z-modal", "--shadow-lg"])
    assert.match(tokens, new RegExp(`\\n  ${name}:`));
  const app = await readFile(new URL("../dist/app/app.css", import.meta.url), "utf8");
  assert.match(app, /@import "\.\/tokens\.css";/);
  assert.match(app, /@import "\.\/components\.css";/);
});
