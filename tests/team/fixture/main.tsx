import "@fontsource-variable/noto-sans-kr";
import "@/app/globals.css";
import "@/app/studio.css";
import "@/app/design-tokens.css";
import "@/app/premium.css";
import { createRoot } from "react-dom/client";
import { installFixtureApi } from "./api";
import { fixtures } from "./fixtures";

const id = new URLSearchParams(location.search).get("fixture") ?? "";
const fixture = fixtures[id];
const root = createRoot(document.getElementById("root")!);
if (!fixture) {
  root.render(
    <main id="main">
      <h1>MOCK fixture 목록</h1>
      <ul>
        {Object.entries(fixtures).map(([k, f]) => (
          <li key={k}>
            <a href={`/?fixture=${k}${(f.search ?? "").replace("?", "&")}`}>{f.title}</a>
          </li>
        ))}
      </ul>
    </main>,
  );
} else {
  installFixtureApi(fixture.routes);
  fixture.setup?.();
  document.title = `MOCK · ${fixture.title}`;
  root.render(fixture.render());
}
