const brands = [
  "BI Solutions Group", "Power BI Solutions", "BI Solutions", "Power BI", "Power Query",
  "Microsoft Fabric", "Azure OpenAI", "Google Analytics", "Google Ads", "Anthropic AI",
  "Collins Aerospace", "Coca-Cola", "PepsiCo", "Fujitsu", "Nespresso", "HarvardX",
  "Databricks", "Snowflake", "BigQuery", "OpenAI", "Anthropic", "Resend", "Airtable",
  "Notion", "Next.js", "Node.js", "React", "Tailwind CSS", "UNICEF", "UNDRR", "IAEA",
];
const escapedBrands = brands.sort((a, b) => b.length - a.length)
  .map(value => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
const protectedPattern = new RegExp(`<[^>]+>|\\b(?:${escapedBrands.join("|")})\\b`, "g");

export function assertTranslationMarkup(source, translated) {
  const expected = source.match(/<[^>]+>/g) ?? [];
  const actual = translated.match(/<[^>]+>/g) ?? [];
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`Translation changed protected HTML markup: ${source.slice(0, 90)}`);
  }
}

export function protectUntranslatedHtml(html) {
  const fragments = [];
  const ranges = [];
  let depth = 0;
  let start = 0;
  const tags = /<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>|<!--[\s\S]*?-->|<\/?([a-z][\w:-]*)\b[^>]*>/gi;
  const voidElements = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  for (const match of html.matchAll(tags)) {
    if (!match[1]) continue;
    const tag = match[0];
    if (tag.startsWith("</")) {
      if (depth > 0 && --depth === 0) ranges.push([start, match.index + tag.length]);
      continue;
    }
    const native = /\btranslate\s*=\s*(["'])no\1/i.test(tag);
    const isVoid = voidElements.has(match[1].toLowerCase()) || /\/\s*>$/.test(tag);
    if (depth === 0 && native) {
      start = match.index;
      if (isVoid) ranges.push([start, start + tag.length]);
      else depth = 1;
    } else if (depth > 0 && !isVoid) depth++;
  }
  if (depth) throw new Error("Unclosed translate=no fragment in prerendered HTML.");
  let cursor = 0;
  let text = "";
  for (const [from, to] of ranges) {
    text += html.slice(cursor, from) + `<!--__NATIVE_COPY_${fragments.length}__-->`;
    fragments.push(html.slice(from, to));
    cursor = to;
  }
  text += html.slice(cursor);
  return {
    text,
    restore: translated => translated.replace(/<!--__NATIVE_COPY_(\d+)__-->/g, (_, index) => fragments[Number(index)]),
  };
}

// Restore translated source copy before React attaches. Explicitly native copy
// must stay untouched and must not consume another node's queued reversion.
export function buildPreHydrationScript(textReversions, attributeReversions) {
  if (!Object.keys(textReversions).length && !Object.keys(attributeReversions).length) return "";
  const serialized = JSON.stringify({ text: textReversions, attributes: attributeReversions }).replace(/</g, "\\u003c");
  return `<script id="i18n-prehydrate">(()=>{
    const m=${serialized};
    const r=document.getElementById("root");
    if(!r)return;
    const take=(b,k)=>b[k]?.shift();
    const w=document.createTreeWalker(r,NodeFilter.SHOW_TEXT);
    while(w.nextNode()){
      const n=w.currentNode;
      if(n.parentElement?.closest('[translate="no"]'))continue;
      const k=n.data.replace(/\\s+/g," ").trim();
      const v=take(m.text,k);
      if(v!==undefined)n.data=n.data.replace(k,v);
    }
    for(const e of r.querySelectorAll("*")){
      if(e.closest('[translate="no"]'))continue;
      for(const a of ["alt","aria-label","placeholder","title"]){
        const s=e.getAttribute(a);
        if(!s)continue;
        const k=s.replace(/\\s+/g," ").trim();
        const v=take(m.attributes,k);
        if(v!==undefined)e.setAttribute(a,s.replace(k,v));
      }
    }
    document.currentScript?.remove();
  })();</script>`;
}

export function protectTranslationTokens(source) {
  if (source.includes("__XLT_")) throw new Error("Source contains a reserved translation token.");
  const tokens = [];
  const text = source.replace(protectedPattern, value => {
    tokens.push(value);
    return `__XLT_${tokens.length - 1}__`;
  });
  return {
    text,
    restore(translated) {
      for (let index = 0; index < tokens.length; index++) {
        if (translated.split(`__XLT_${index}__`).length !== 2) {
          throw new Error(`Translation lost or duplicated protected token ${index}.`);
        }
      }
      const restored = translated.replace(/__XLT_(\d+)__/g, (_, index) => {
        if (tokens[Number(index)] === undefined) throw new Error("Unknown translation token.");
        return tokens[Number(index)];
      });
      assertTranslationMarkup(source, restored);
      return restored;
    },
  };
}
