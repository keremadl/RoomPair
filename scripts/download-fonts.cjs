const fs = require("fs");
const fonts = {
  "dm-sans.ttf":
    "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf",
  "dm-sans-medium.ttf":
    "https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAfJthTg.ttf",
  "manrope.ttf":
    "https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk4aE-_F.ttf",
  "manrope-regular.ttf":
    "https://fonts.gstatic.com/s/manrope/v20/xn7_YHE41ni1AdIRqAuZuw1Bx9mbZk79FO_F.ttf",
};
Promise.all(
  Object.entries(fonts).map(async ([name, url]) => {
    const r = await fetch(url);
    if (!r.ok) throw Error(r.status);
    fs.writeFileSync(
      "public/fonts/" + name,
      Buffer.from(await r.arrayBuffer()),
    );
  }),
);
