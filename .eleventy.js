module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("src/styles.css");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/_headers");

  // Member pre-law societies, grouped/sorted by province then name.
  eleventyConfig.addCollection("societies", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/societies/*.md").sort((a, b) => {
      const pa = (a.data.province || "").localeCompare(b.data.province || "");
      if (pa !== 0) return pa;
      return (a.data.name || "").localeCompare(b.data.name || "");
    });
  });

  // Board representatives roster, ordered by explicit display order.
  eleventyConfig.addCollection("board", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/board/*.md").sort((a, b) => {
      return (a.data.order || 99) - (b.data.order || 99);
    });
  });

  // National competitions. Upcoming first (soonest date), then completed (newest first).
  eleventyConfig.addCollection("competitions", function (collectionApi) {
    const items = collectionApi.getFilteredByGlob("src/competitions/*.md");
    const rank = (s) => (s === "completed" ? 1 : 0);
    return items.sort((a, b) => {
      const ra = rank(a.data.status);
      const rb = rank(b.data.status);
      if (ra !== rb) return ra - rb;
      const da = new Date(a.data.date || 0).getTime();
      const db = new Date(b.data.date || 0).getTime();
      // Upcoming: soonest first. Completed: most recent first.
      return ra === 0 ? da - db : db - da;
    });
  });

  eleventyConfig.addCollection("events", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/events/*.md").sort((a, b) => {
      return new Date(a.data.date) - new Date(b.data.date);
    });
  });

  eleventyConfig.addCollection("news", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/news/*.md").sort((a, b) => {
      return new Date(b.data.date || 0) - new Date(a.data.date || 0);
    });
  });

  eleventyConfig.addCollection("resources", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/resources/*.md").sort((a, b) => {
      return (a.data.order || 99) - (b.data.order || 99);
    });
  });

  eleventyConfig.addFilter("dateFormat", function (date) {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-CA", { month: "short", day: "numeric", year: "numeric" });
  });

  eleventyConfig.addFilter("monthShort", function (date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-CA", { month: "short" }).toUpperCase();
  });

  eleventyConfig.addFilter("dayNum", function (date) {
    if (!date) return "";
    return new Date(date).getDate();
  });

  return {
    dir: {
      input: "src",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
  };
};
