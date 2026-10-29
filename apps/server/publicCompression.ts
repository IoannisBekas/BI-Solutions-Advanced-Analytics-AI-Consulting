import compression from "compression";

/** Compress public campaign documents and shared build assets. */
export function publicAssetCompression() {
  return compression({
    filter(req, res) {
      if (req.method !== "GET" && req.method !== "HEAD") return false;
      const isBuildAsset = /^\/assets\/[^/]+\.(?:css|js)$/.test(req.path);
      const isCampaign = /^\/el\/(?:online-paraggelies|meiosi-kostous-delivery)\/?$/.test(req.path);
      return (isBuildAsset || isCampaign) && compression.filter(req, res);
    },
  });
}
