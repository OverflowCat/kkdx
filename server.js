const { Telegraf } = require("telegraf");
const fetch = require("node-fetch");
function tag(cont, htag) {
  return "<" + htag + ">" + cont + "</" + htag + ">";
}
function search(query, done) {
  console.log("searching " + query);
  fetch("https://movie.douban.com/j/subject_suggest?q=" + query)
    .then(response => response.json())
    .then(d => {
      console.log(d);
      var resp;
      if (!d) resp = "NF";
      else resp = d[0].id;
      done(resp);
    });
}
function mov(id, done) {
  fetch("https://douban.uieee.com/v2/movie/subject/" + id)
    .then(response => response.json())
    .then(d => {
      console.log(d);
      var rating = d.rating.average;
      var res = tag(d.title, "b");
      if (d.hasOwnProperty("aka"))
        res += tag(" ( " + d.aka.join(" · ") + " ) ", "i");
      res += "\n" + d.summary.replace("©豆瓣", "");
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
  var ren = ctx.message.from.id.toString();
  console.log(ctx.message);
  if (
    ["405582582 556691025", "814314400 和 1010364460"].join("&").indexOf(ren) ==
    -1
  )
    return ctx.reply("[你无权使用]");
  //return 1;

  if (ctx.message.hasOwnProperty("entities")) {
    var úrl = ctx.message.entities[0].url;
    var downbtn = Telegraf.Extra.HTML().markup(m =>
      m.inlineKeyboard([
        m.urlButton("🗂️下载⬇️", úrl),
        m.urlButton("✨进群➕", "t.me/PanoanDriveBasic")
      ])
    );

    const aboutMenu = Telegraf.Extra.markdown().markup(m =>
      m.keyboard([m.callbackButton("⬅️ Back")]).resize()
    );
  }

  if (ctx.message.hasOwnProperty("caption_entities")) {
    var úrl = ctx.message.caption_entities[0].url;
    var downbtn = Telegraf.Extra.HTML().markup(m =>
      m.inlineKeyboard([
        m.urlButton("🗂️下载⬇️", úrl),
        m.urlButton("✨进群➕", "t.me/PanoanDriveBasic")
      ])
    );
  }
  var t = ctx.message.hasOwnProperty("caption")
    ? ctx.message.caption
    : ctx.message.text;
  t = t.replace(/\(.*\)/g, "");
  t = t.replace(/\[.*\]/g, " ").trim();
  if (true) {
    t = t.replace("\n", ".");
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
  t = t.replace("undefined", "");
  ctx.reply("作品名称：" + t);

  search(encodeURIComponent(t), id => {
    if (id == "NF") return ctx.reply("Not found.");
    mov(id, d => {
      if (downbtn) {
        ctx.reply(d, downbtn);
        return bot.telegram.sendMessage("@Panoan4K", d, downbtn);
      } else {
        return ctx.reply(d);
      }
    });
  });
});
console.log("OK");
bot.launch();
