import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Loading from "@/app/loading";
import Template from "@/app/template";

describe("route transition UI", () => {
  it("renders the loading overlay with Romanian loading copy", () => {
    const html = renderToStaticMarkup(<Loading />);

    expect(html).toContain("route-loading-overlay");
    expect(html).toContain("Se încarcă pagina...");
    expect(html).toContain("route-loading-bar");
  });

  it("wraps route content in the transition shell", () => {
    const html = renderToStaticMarkup(
      <Template>
        <div>Conținut</div>
      </Template>
    );

    expect(html).toContain("route-transition-shell");
    expect(html).toContain("Conținut");
  });
});
