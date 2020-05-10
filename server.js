const { Telegraf } = require("telegraf");
const fetch = require("node-fetch");
function tag(cont, htag) {
  return "<" + htag + ">" + cont + "</" + htag + ">";
}
function search(query, done) {
  fetch("https://movie.douban.com/j/subject_suggest?q=" + query)
    .then(response => response.json())
    .then(d => {
      console.log(d);

      done(d == [] ? undefined : d[0].id);
    });
}
function mov(id, done) {
  fetch("https://douban.uieee.com/v2/movie/subject/" + id)
    .then(response => response.json())
    .then(d => {
      console.log(d);
      var rating = d.rating.average;
      var res = tag(d.title, "b");
      res += "\n" + d.summary;
      res +=
        "\n" +
        tag("上映时间 ", "b") +
        "\n" +
        tag(d.pubdates.join("\n"), "code");
      res += "\n豆瓣评分 " + rating + "\n" + d.images.large;
      // "nhttps://m.douban.com/movie/subject/" + id;
      //      d.iamges.large;
      //     d.pubdates;

      done(res);
    })
    .catch();
}

const bot = new Telegraf(process.env.KKDX);
bot.start(ctx => ctx.reply("Welcome!"));
bot.help(ctx => ctx.reply("Send me a sticker"));
bot.on("sticker", ctx => ctx.reply("👍"));
bot.hears("hi", ctx => ctx.reply("Hey there"));

bot.on("message", ctx => {
  if (ctx.message.hasOwnProperty("entities")) {
    var úrl = ctx.message.entities[0].url;
    var downbtn = Telegraf.Extra.HTML().markup(m =>
      m.inlineKeyboard([m.urlButton("🗂️下载⬇️", úrl)])
    );

    const aboutMenu = Telegraf.Extra.markdown().markup(m =>
      m.keyboard([m.callbackButton("⬅️ Back")]).resize()
    );
  }

  var t = ctx.message.hasOwnProperty("caption")
    ? ctx.message.caption
    : ctx.message.text;
  t = t.replace(/\(.*\)/g, "");
  t = t.replace(/\[.*\]/g, " ").trim();
  if (false) {
    t = t.replace("\n", " ");
    t = t.split(".");
    var i, T;
    for (i = 0; i < t.length; i++) {
      if (t[i] == undefined) continue;
      if (/s[0-9]+/.test(t[i])) break;
      if (/(1080|2160)p?/g.test(t[i])) break;
      if (!/[a-zA-Z]+/.test(t[i])) continue;
      T += t[i] + " ";
    }
  } else {
    var T = t;
  }
  var t = T
    //.join(" ")
    .replace("Shareable link: here", "")
    .replace(",", " ")
    //.replace("undefined")
    .trim();
  console.log("__" + t + "__");
  ctx.reply(["作品名称 ", t.replace("undefined")].join(" "));
  return search(encodeURIComponent(t), id => {
    if (id == []) return ctx.reply("Not found.");
    mov(id, d => {
      downbtn ? ctx.reply(d, downbtn) : ctx.reply(d);
    });
  });
});
console.log("OK");
bot.launch();
