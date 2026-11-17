import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { DomainCardLabel } from "../domain-card-label";
import { CardContent } from "../card-content";
import { PrintImageCard } from "../print-image-card";
import { createEmptyCard } from "@/card/card-types";
import { useCardArtworkStore } from "@/lib/card-artwork-store";
const domain = {
  ...createEmptyCard("domain"),
  name: "旋风猛袭",
  class: "利刃",
  level: 1,
};
afterEach(cleanup);
describe("shared domain identifiers", () => {
  it("keeps the identifier in text exports while optional illustrations are hidden", () => {
    useCardArtworkStore.setState({ enabled: false });
    const { container } = render(
      <>
        <CardContent card={domain} />
        <PrintImageCard card={domain} />
      </>,
    );
    expect(container.querySelectorAll(".domain-card-label")).toHaveLength(2);
    expect(container.querySelectorAll("img[data-domain-ribbon]")).toHaveLength(
      2,
    );
    expect(
      container.querySelectorAll("img:not([data-domain-ribbon])"),
    ).toHaveLength(0);
    expect(
      container.querySelector('[aria-label="利刃领域，等级 1"]'),
    ).not.toBeNull();
  });
  it("retains textual labels for missing and custom artwork without broken image requests", () => {
    const { container } = render(
      <>
        <DomainCardLabel card={{ ...domain, class: "恐怖", level: 8 }} />
        <DomainCardLabel card={{ ...domain, class: "梦境" }} />
      </>,
    );
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(
      container.querySelector('[aria-label="恐怖领域，等级 8"]'),
    ).not.toBeNull();
    expect(container.textContent).toContain("梦境");
  });
});
