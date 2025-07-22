import { mergeRegex } from "../src/utils/mergeRegex";

describe("mergeRegex", () => {
  test("Smoke test", () => {
    expect(mergeRegex).toBeDefined();
  });

  test("Throws when called with no arguments", () => {
    expect(() => mergeRegex([])).toThrow("No regex expressions provided.");
  });

  test("Throws when non-RegExp arguments are passed", () => {
    expect(() => mergeRegex([/foo/, "bar"] as any)).toThrow(
      /Argument 1 is not a RegExp/
    );
  });

  test("Single regex returns unmodified pattern", () => {
    expect(mergeRegex([/foo/])).toEqual(/foo/);
    expect(mergeRegex([/foo/i])).toEqual(/foo/i);
  });

  test("Merges two simple regexes with alternation", () => {
    expect(mergeRegex([/foo/, /bar/])).toEqual(/(?:foo|bar)/);
  });

  test("Merges multiple regexes with alternation", () => {
    expect(mergeRegex([/foo/, /bar/, /baz/])).toEqual(/(?:foo|bar|baz)/);
  });

  test("Uses flags from the first regex consistently", () => {
    const merged = mergeRegex([/foo/i, /bar/]);
    expect(merged.flags).toContain("i");
    expect(merged).toEqual(/(?:foo|bar)/i);
  });

  test("Handles non-capturing groups inside patterns", () => {
    expect(mergeRegex([/(?:foo)/, /bar/])).toEqual(/(?:(?:foo)|bar)/);
  });

  test("Escapes special characters properly", () => {
    expect(mergeRegex([/a\/b/, /c\/d/])).toEqual(/(?:a\/b|c\/d)/);
  });

  test("Handles complex nested groups", () => {
    expect(mergeRegex([/(foo|bar)/, /(baz(?:qux)?)/])).toEqual(
      /(?:(foo|bar)|(baz(?:qux)?))/
    );
  });

  test("Preserves escaped characters", () => {
    expect(mergeRegex([/\d+/, /\w{3,}/])).toEqual(/(?:\d+|\w{3,})/);
  });

  test("Ignores duplicate patterns by default", () => {
    expect(mergeRegex([/foo/, /foo/])).toEqual(/foo/);
  });

  test("Does not deduplicate when deduplicate:false", () => {
    const merged = mergeRegex([/foo/, /foo/], { deduplicate: false });
    expect(merged).toEqual(/(?:foo|foo)/);
  });

  test("Merges long list of regexes", () => {
    const merged = mergeRegex([/a/, /b/, /c/, /d/, /e/, /f/, /g/]);
    expect(merged).toEqual(/(?:a|b|c|d|e|f|g)/);
  });

  describe("Anchors preservation and merging", () => {
    const anchoredPatterns = [/^foo$/, /^bar$/];

    test("Preserves anchors by default", () => {
      const merged = mergeRegex(anchoredPatterns);
      expect(merged).toEqual(/(?:^foo$|^bar$)/);
    });

    test("Removes anchors with preserveAnchors:false", () => {
      const merged = mergeRegex(anchoredPatterns, { preserveAnchors: false });
      expect(merged).toEqual(/(?:foo|bar)/);
    });

    test("Merges anchors globally when mergeAnchors:true", () => {
      const merged = mergeRegex(anchoredPatterns, {
        preserveAnchors: false,
        mergeAnchors: true,
      });
      expect(merged).toEqual(/^(?:foo|bar)$/);
    });

    test("Global mergeAnchors has no effect if preserveAnchors:true", () => {
      const merged = mergeRegex(anchoredPatterns, {
        preserveAnchors: true,
        mergeAnchors: true,
      });
      expect(merged).toEqual(/(?:^foo$|^bar$)/);
    });
  });

  describe("wrapNonCapturingGroup option", () => {
    test("Does not wrap single pattern by default", () => {
      const merged = mergeRegex([/foo/]);
      expect(merged).toEqual(/foo/);
    });

    test("Wraps single pattern when wrapNonCapturingGroup:true", () => {
      const merged = mergeRegex([/foo/], { wrapNonCapturingGroup: true });
      expect(merged).toEqual(/(?:foo)/);
    });
  });

  describe("Advanced flag cases", () => {
    test("Multiple patterns inherit flags from the first regex", () => {
      const merged = mergeRegex([/foo/gi, /bar/]);
      expect(merged.flags).toEqual("gi");
      expect(merged).toEqual(/(?:foo|bar)/gi);
    });

    test("Mixed flags do not combine automatically", () => {
      const merged = mergeRegex([/foo/g, /bar/i]);
      expect(merged.flags).toEqual("g");
    });
  });

  describe("Edge cases", () => {
    test("Merges patterns with embedded anchors and content", () => {
      const merged = mergeRegex([/^foo\d+$/, /^bar\d+$/]);
      expect(merged).toEqual(/(?:^foo\d+$|^bar\d+$)/);
    });

    test("Preserves patterns like ^foo$ alongside normal patterns", () => {
      const merged = mergeRegex([/^foo$/, /bar/]);
      expect(merged).toEqual(/(?:^foo$|bar)/);
    });

    test("Empty regex source handled properly", () => {
      const merged = mergeRegex([/(?:)/, /foo/]);
      expect(merged).toEqual(/(?:(?:)|foo)/);
    });
  });
});
