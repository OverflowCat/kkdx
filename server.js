const { Telegraf } = require("telegraf");
const fetch = require("node-fetch");
const pangu = require("pangu");
const defaultLogo = "https://i.loli.net/2020/06/16/Ud2fFvntzb3psY9.jpg";
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
  fetch(
    "https://api.douban.com/v2/movie/" +
      id +
      "?apikey=02646d3fb69a52ff072d47bf23cef8fd"
  )
    //apikey=02646d3fb69a52ff072d47bf23cef8fd
    .then(response => response.json())
    .then(d => {
      console.log(d);
      var rating = d.rating.average;
      var res = tag(d.title, "b");
      if (d.hasOwnProperty("aka")) {
        var locations = ["(港)", "(台)"];
        if (d.aka != "") {
          var alias = d.aka.map(ele => {
            var alia;
            locations.map(area => {
              if (ele.indexOf(area) >= 1) {
                alia = ele.replace(area, " " + area);
              } else {
                alia = ele;
              }
            });
            if (ele.indexOf(" ") >= 0) {
              alia = alia.split(" ");
              alia[0] = tag(alia[0], "code");
              alia = alia.join(" ");
              console.log(alia);
            }
            return alia;
          });
          res += " ( " + alias.join(" · ") + " ) ";
        }
      }
      console.log(d.tags);
      var tags = d.tags;
      var tågs = [];
      tags.forEach(_tag => {
        //新 API 中 tag 变为 Object[]   //eg: { count: 6, name: '校园性侵' }
        var _tãg = _tag.name
          .split("·")
          .join("")
          .split("&")
          .join("and");
        tågs.push(/[0-9]{4}/.test(_tãg) ? _tãg + "年" : _tãg);
      });
      tags = tågs;
      if (d.original_title != "") res += "\n" + tag(d.original_title, "i");
      if (d.hasOwnProperty("languages"))
        var languages = d.languages.map(lang => {
          return "#" + lang;
          res += "\n" + tag(languages.join("、"), "b");
        });
      res += " #" + tags.join(" #");
      res +=
        "\n" +
        pangu.spacing(
          d.summary
            .replace("©豆瓣", "")
            .split("“")
            .join("「")
            .split("”")
            .join("」")
        );
      res += "\n" + tag("上映时间 ", "b");
      if (d.hasOwnProperty("pubdates"))
        res +=
          d.pubdates.length > 1
            ? "\n" + tag(d.pubdates.join("\n"), "code")
            : tag(d.pubdates.join("\n"), "code");

      if (rating != 0) res += "\n<b>豆瓣评分 " + rating + " </b>";
      if (d.hasOwnProperty("comments_count"))
        res += "  （ " + tag(d.comments_count + " 条评论）", "i");
      //res = pangu.spacing(res);

      res = res
        .split("undefined")
        .join()
        .split("[object Object]")
        .join();

      done([res, defaultLogo]);
    })
    .catch();
}

const bot = new Telegraf(process.env.KKDX);
bot.start(ctx => ctx.reply("Welcome!"));
bot.help(ctx => ctx.reply("Send me a sticker"));
bot.on("sticker", ctx => ctx.reply("👍"));
bot.hears("hi", ctx => ctx.reply("Hey there"));

function sendPhoto(chatId, photo, caption, extra) {
  bot.telegram.callApi(
    "sendPhoto",
    Object.assign(
      { chat_id: chatId, photo: photo },
      { caption: caption },
      extra
    )
  );
  return console.log("Sent.");
}

bot.on("message", ctx => {
  var ren = ctx.message.from.id.toString();
  console.log(ctx.message);
  if (
    [" 405582582 ", " 556691025 ", " 814314400 ", " 1010364460 ", " 588226975 "]
      .join(" ")
      .indexOf(" " + ren + " ") == -1
  )
    return ctx.reply("[你无权使用]");
  //return 1;

  const aboutMenu = Telegraf.Extra.markdown().markup(m =>
    m.keyboard([m.callbackButton("⬅️ Back")]).resize()
  );

  if (
    ctx.message.hasOwnProperty("caption_entities") ||
    ctx.message.hasOwnProperty("entities")
  ) {
    var úrl = ctx.message.hasOwnProperty("entities")
      ? ctx.message.entities[0].url
      : ctx.message.caption_entities[0].url;
  }
  var t = ctx.message.hasOwnProperty("caption")
    ? ctx.message.caption
    : ctx.message.text;
  var originaltext = t;
  t = t.replace(/\(.*?\)/g, "");
  t = t.replace(/\[.*?\]/g, " ").trim(); //not greedy
  if (true) {
    t = t.split(" ").join(".");
    t = t.split("-").join(".");
    t = t.split("+").join(".");
    t = t.split("\n").join(".");
    t = t.split(".");
    console.log(t);
    var i, T;
    for (i = 0; i < t.length; i++) {
      if (t[i] == undefined) continue;
      if (/^((s|S)[0-9]+|Season)$/.test(t[i])) break; //季
      if (/[0-9]+/.test(t[i]) && i >= 1) break; //防止影片的名称是数字
      if (
        /^((1080|2160)p?|blueray|x26(4|5)|10bit|HEVC|AAC|REMASTERED|HD|MA|SADPANDA|DTS|FGT|TV|BOX|BD|OAD|SP|EXTRAS?)$/gi.test(
          t[i]
        )
      ) {
        if (i >= 1) {
          break;
        } else continue; //防止此类信息在最前**
      } //画质
      if (!/[a-zA-Z0-9]+/.test(t[i])) continue;
      T += t[i] + " ";
    }
  } else {
    var T = t;
  }
  var t = T
    ? T.replace("Shareable link: here", "")
        .replace(",", " ")
        .trim()
    : "";
  console.log("__" + t + "__");
  t = t.replace("undefined", "");
  ctx.reply("作品名称：" + t);

  search(encodeURIComponent(t), id => {
    if (id == "NF") return ctx.reply("Not found.");
    mov(id, response => {
      var d = response[0];
      var picurl = response[1];
      var d = [
        d,
        tag("文件名", "b"),
        tag(
          originaltext
            .split("\n\n")
            .join("\n")
            .replace("Shareable link: here", ""),
          "code"
        )
      ].join("\n");
      console.log(
        "==========reply msg:" + d + "=============end reply============="
      );
      if (úrl) {
        var downbtn = Telegraf.Extra.HTML().markup(m =>
          m
            .inlineKeyboard([
              [
                m.urlButton("🗂️ 查看 ⬇️", úrl),
                m.urlButton(
                  "🌱 影评 💬",
                  "https://movie.douban.com/subject/" + id + "/"
                )
              ],
              [
                m.urlButton(
                  "🔊 使用指南 🤖","https://t.me/PanoanDriveBasic/63121"
                 // "https://t.me/PanoanChannel/46" //"https://t.me/PanoanDriveBasic/46029" //"https://t.me/PanoanDriveBasic/46029"
                ), //"t.me/PanoanDriveBasic"),
                m.urlButton("🐱 视频站 📹", "http://moetv.live")
              ]
            ])
            .resize()
        );
        ctx.reply(d + "\n" + picurl, downbtn);
        //return bot.telegram.sendMessage("@Panoan4K", d, downbtn);
        sendPhoto("@Panoan4K", picurl, d, downbtn);
        return console.log("done.");
      } else {
        return ctx.reply(d);
      }
    });
  });
});
console.log("OK");
bot.launch();
