import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import Loading from "@/app/loading";
import Template from "@/app/template";
import PlayerTemplate from "@/app/player/template";
import MentorTemplate from "@/app/mentor/template";
import AdminTemplate from "@/app/admin/template";

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

  it("wraps player route content in the transition shell", () => {
    const html = renderToStaticMarkup(
      <PlayerTemplate>
        <div>Conținut jucător</div>
      </PlayerTemplate>
    );

    expect(html).toContain("route-transition-shell");
    expect(html).toContain("Conținut jucător");
  });

  it("wraps mentor route content in the transition shell", () => {
    const html = renderToStaticMarkup(
      <MentorTemplate>
        <div>Conținut mentor</div>
      </MentorTemplate>
    );

    expect(html).toContain("route-transition-shell");
    expect(html).toContain("Conținut mentor");
  });

  it("wraps admin route content in the transition shell", () => {
    const html = renderToStaticMarkup(
      <AdminTemplate>
        <div>Conținut admin</div>
      </AdminTemplate>
    );

    expect(html).toContain("route-transition-shell");
    expect(html).toContain("Conținut admin");
  });
});
