/**
 * 微信小程序-条形码生成器
 * a barcode generator for wechat miniprogram
 * @author long-d
 * @version 1.0.0
 */

function b(e, t, n, o) {
  e.beginPath(), e.setLineWidth(n), e.setStrokeStyle(t);
  for (var r = 0; r < o; r++) {
    var i = n * (2 * r + 1);
    e.moveTo(i, 0), e.lineTo(i, 1)
  }
  e.stroke(), e.closePath()
}

function c(e, t, n, o) {
  e.beginPath(), e.setFillStyle(t), e.setLineWidth(1);
  for (var r = 0; r < o; r++) {
    var i = n * (2 * r + 1);
    e.rect(i, 0, n, 1)
  }
  e.fill(), e.closePath()
}

function d(e, t, n, o) {
  e.beginPath(), e.setFillStyle(t);
  for (var r = 0; r < o.length; r++) {
    var i = n * (2 * r + 1) - n / 2;
    e.setTextAlign("center"), e.fillText(o.charAt(r), i, 1)
  }
  e.closePath()
}

function u(e, t, n, o) {
  var r = "",
    i = e.toString();
  if (i.length < 12) {
    for (var a = i.length; a < 12; a++) r += "0";
    i = r + i
  } else i = i.substr(0, 12);
  var l = 0,
    s = 0;
  for (a = 0; a < 11; a += 2) l += parseInt(i.charAt(a));
  for (a = 1; a < 12; a += 2) s += parseInt(i.charAt(a));
  var f = (10 - (l + 3 * s) % 10) % 10;
  i += f;
  var g = ["101", "0100111", "0110011", "0111001", "0101101", "0110101", "0111011", "0101011", "0101111", "0110111"],
    h = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"],
    c = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"],
    p = ["000000", "001011", "001101", "001110", "010011", "011001", "011100", "010101", "010110", "011010"];
  t.beginPath(), t.setFillStyle("#ffffff"), t.rect(0, 0, n, o), t.fill(), t.closePath();
  var v = p[parseInt(i.charAt(0))];
  r = g[parseInt(i.charAt(1))] + h[parseInt(i.charAt(2))] + g[parseInt(i.charAt(3))] + h[parseInt(i.charAt(4))] + g[parseInt(i.charAt(5))] + h[parseInt(i.charAt(6))];
  var m = c[parseInt(i.charAt(7))] + c[parseInt(i.charAt(8))] + c[parseInt(i.charAt(9))] + c[parseInt(i.charAt(10))] + c[parseInt(i.charAt(11))] + c[parseInt(i.charAt(12))];
  var w = n / 95;
  t.setFillStyle("#000000");
  for (a = 0; a < 3; a++) 1 == parseInt("101".charAt(a)) && t.rect(w * (a + 1), 0, w, o);
  for (a = 0; a < 6; a++) {
    var y = v.charAt(a);
    r = g[parseInt(i.charAt(a + 1))];
    for (var x = 0; x < 7; x++) 1 == parseInt(r.charAt(x)) && t.rect(w * (7 * a + x + 1 + 3), 0, w, .9 * o)
  }
  for (a = 0; a < 5; a++) 1 == parseInt("01010".charAt(a)) && t.rect(w * (a + 45), 0, w, o);
  for (a = 0; a < 6; a++) {
    m = c[parseInt(i.charAt(a + 7))];
    for (x = 0; x < 7; x++) 1 == parseInt(m.charAt(x)) && t.rect(w * (7 * a + x + 1 + 50), 0, w, .9 * o)
  }
  for (a = 0; a < 3; a++) 1 == parseInt("101".charAt(a)) && t.rect(w * (a + 92), 0, w, o);
  t.fill(), t.closePath(), t.beginPath(), t.setFontSize(.1 * o), t.setTextBaseline("middle"), t.setFillStyle("#000000"), t.fillText(i.charAt(0), w * -2, .95 * o), t.setTextAlign("center");
  for (a = 0; a < 6; a++) t.fillText(i.charAt(a + 1), w * (7 * a + 7), .95 * o);
  for (a = 0; a < 6; a++) t.fillText(i.charAt(a + 7), w * (7 * a + 54), .95 * o);
  t.draw()
}

function code128(e, t, n, o) {
  for (var r = function(e) {
      for (var t = e.length, n = e.length; n > 0; n--) e.charCodeAt(n - 1) >= 200 && t++;
      return t
    }(t), i = new Array, a = 0; a < r; a++) {
    var l = t.charCodeAt(a);
    if (l >= 200) {
      var s = t.charCodeAt(a) - 200;
      i.push(105), i.push(s)
    } else i.push(l)
  }
  for (var f = new Array, a = 0; a < i.length; a++) f.push(i[a]);
  for (var g = new Array, a = 0; a < i.length; a++) {
    var h = new Array;
    if (h.push(i[a]), a + 1 < i.length) {
      h.push(i[a + 1]);
      var c = "";
      if (a + 2 < i.length) {
        h.push(i[a + 2]);
        var p = "";
        if (a + 3 < i.length) {
          h.push(i[a + 3]);
          var v = "";
          a + 4 < i.length && h.push(i[a + 4])
        } else v = ""
      } else p = ""
    } else c = "";
    for (var m = "", w = 0; w < h.length; w++) m += h[w];
    g.push(m)
  }
  for (var y = new Array, a = 0; a < g.length; a++) {
    for (var x = g[a], C = new Array, w = 0; w < x.length; w++) C.push(x.substr(w, 1));
    for (var A = "", b = 0, S = 0; S < C.length; S++) {
      var k = C[S];
      if (k >= "0" && k <= "9") b++;
      else {
        if (b > 0) {
          if (b % 2 == 1) {
            A += "a";
            for (var I = 0; I < b - 1; I++) A += "c"
          } else
            for (I = 0; I < b; I++) A += "c";
          b = 0
        } else b = 0;
        A += "a"
      }
    }
    if (b > 0)
      if (b % 2 == 1) {
        A += "a";
        for (I = 0; I < b - 1; I++) A += "c"
      } else
        for (I = 0; I < b; I++) A += "c";
    y.push(A)
  }
  for (var B = "", a = 0; a < y.length; a++) {
    var T = y[a];
    if ("" == B) B = T;
    else if (T.length < B.length) B = T;
    else if (T.length == B.length && T.indexOf("a") < B.indexOf("a")) B = T
  }
  for (var P = new Array, a = 0; a < B.length; a++) {
    var E = B.substr(a, 1);
    if ("a" == E) P.push("a");
    else if ("c" == E) {
      if (a < B.length - 1) {
        var D = B.substr(a + 1, 1);
        "c" == D && (P.push("c"), a++)
      } else P.push("a")
    } else P.push("a")
  }
  for (var L = new Array, a = 0; a < P.length; a++) {
    var N = P[a];
    "a" == N ? L.push("a") : "c" == N && L.push("c")
  }
  for (var F = new Array, a = 0; a < L.length; a++) {
    var M = L[a];
    if (a > 0) {
      var O = L[a - 1];
      M != O && ("a" == M ? F.push(105) : "c" == M && F.push(99))
    } else "a" == M ? F.push(103) : "c" == M && F.push(104)
  }
  for (var R = "", a = 0; a < L.length; a++) {
    var _ = L[a];
    "a" == _ ? R += t.substr(R.length, 1) : "c" == _ && (R += t.substr(R.length, 2))
  }
  for (var a = 0; a < L.length; a++) {
    var U = L[a];
    if ("a" == U) F.push(t.charCodeAt(a));
    else if ("c" == U) {
      var j = t.substr(a, 2);
      F.push(parseInt(j))
    }
  }
  for (var q = F[0], a = 1; a < F.length; a++) q += a * F[a];
  q %= 103, F.push(q), F.push(106);
  var H = ["212222", "222122", "222221", "121223", "121322", "131222", "122213", "122312", "132212", "221213", "221312", "231212", "112232", "122132", "122231", "113222", "123122", "123221", "223211", "221132", "221231", "213212", "223112", "312131", "311222", "321122", "321221", "312212", "322112", "322211", "212123", "212321", "232121", "111323", "131123", "131321", "112313", "132113", "132311", "211313", "231113", "231311", "112133", "112331", "132131", "113123", "113321", "133121", "313121", "211331", "231131", "213113", "213311", "213131", "311123", "311321", "331121", "312113", "312311", "332111", "314111", "221411", "431111", "111224", "111422", "121124", "121421", "141122", "141221", "112214", "112412", "122114", "122411", "142112", "142211", "241211", "221114", "413111", "241112", "134111", "111242", "121142", "121241", "114212", "124112", "124211", "411212", "421112", "421211", "212141", "214121", "412121", "111143", "111341", "131141", "114113", "114311", "411113", "411311", "113141", "114131", "311141", "411131", "211412", "211214", "211232", "2331112"];
  e.beginPath(), e.setFillStyle("#ffffff"), e.rect(0, 0, n, o), e.fill(), e.closePath(), e.setFillStyle("#000000");
  for (var V = "", a = 0; a < F.length; a++) V += H[F[a]];
  for (var z = n / V.length, W = 0, a = 0; a < V.length; a++) {
    W += parseInt(V.substr(a, 1)) * z;
  }
  z = n / W, W = 0;
  for (a = 0; a < F.length; a++) {
    var G = H[F[a]];
    if (a % 2 == 0) {
      var J = parseInt(G.substr(0, 1)) * z,
        K = parseInt(G.substr(1, 1)) * z,
        Q = parseInt(G.substr(2, 1)) * z,
        X = parseInt(G.substr(3, 1)) * z,
        Y = parseInt(G.substr(4, 1)) * z,
        Z = parseInt(G.substr(5, 1)) * z;
      e.rect(W, 0, J, o), e.rect(W + J + K, 0, Q, o), e.rect(W + J + K + Q + X, 0, Y, o), W += J + K + Q + X + Y + Z
    } else {
      J = parseInt(G.substr(0, 1)) * z, K = parseInt(G.substr(1, 1)) * z, Q = parseInt(G.substr(2, 1)) * z, X = parseInt(G.substr(3, 1)) * z, Y = parseInt(G.substr(4, 1)) * z, Z = parseInt(G.substr(5, 1)) * z;
      W += J + K + Q + X + Y + Z
    }
  }
  e.fill(), e.closePath(), e.beginPath(), e.setFontSize(.1 * o), e.setTextBaseline("middle"), e.setTextAlign("center"), e.setFillStyle("#000000"), e.fillText(t, n / 2, .9 * o), e.draw()
}
module.exports = { upce: u, ean8: function(e, t, n, o) {
    var r = "",
      i = e.toString();
    if (i.length < 7) {
      for (var a = i.length; a < 7; a++) r += "0";
      i = r + i
    } else i = i.substr(0, 7);
    var l = 0,
      s = 0;
    for (a = 0; a < 7; a += 2) s += parseInt(i.charAt(a));
    for (a = 1; a < 6; a += 2) l += parseInt(i.charAt(a));
    var f = (10 - (3 * s + l) % 10) % 10;
    i += f;
    var g = ["0001101", "0011001", "0010011", "0111101", "0100011", "0110001", "0101111", "0111011", "0110111", "0001011"],
      h = ["1110010", "1100110", "1101100", "1000010", "1011100", "1001110", "1010000", "1000100", "1001000", "1110100"];
    t.beginPath(), t.setFillStyle("#ffffff"), t.rect(0, 0, n, o), t.fill(), t.closePath();
    var c = n / 67;
    t.setFillStyle("#000000");
    for (a = 0; a < 3; a++) 1 == parseInt("101".charAt(a)) && t.rect(c * (a + 1), 0, c, o);
    for (a = 0; a < 4; a++) {
      var p = g[parseInt(i.charAt(a))];
      for (var v = 0; v < 7; v++) 1 == parseInt(p.charAt(v)) && t.rect(c * (7 * a + v + 1 + 3), 0, c, o)
    }
    for (a = 0; a < 5; a++) 1 == parseInt("01010".charAt(a)) && t.rect(c * (a + 31), 0, c, o);
    for (a = 0; a < 4; a++) {
      var m = h[parseInt(i.charAt(a + 4))];
      for (v = 0; v < 7; v++) 1 == parseInt(m.charAt(v)) && t.rect(c * (7 * a + v + 1 + 36), 0, c, o)
    }
    for (a = 0; a < 3; a++) 1 == parseInt("101".charAt(a)) && t.rect(c * (a + 64), 0, c, o);
    t.fill(), t.closePath(), t.beginPath(), t.setFontSize(.15 * o), t.setTextBaseline("middle"), t.setTextAlign("center"), t.setFillStyle("#000000");
    for (a = 0; a < 4; a++) t.fillText(i.charAt(a), c * (7 * a + 7), o / 2);
    for (a = 4; a < 8; a++) t.fillText(i.charAt(a), c * (7 * a + 11), o / 2);
    t.draw()
  }, ean13: u, code39: function(e, t, n, o) {
    var r = { 0: "bwbwBwBwb", 1: "BwbwBwBwb", 2: "bwBwBwBwb", 3: "BwBwBwBwb", 4: "bwbWBwBwb", 5: "BwbWBwBwb", 6: "bwBWBwBwb", 7: "bwbwBWBwb", 8: "BwbwBWBwb", 9: "bwBwBWBwb", A: "BwbwbwBwB", B: "bwbwbwBwB", C: "BwBwbwBwB", D: "bwbwBwBwB", E: "BwbwBwBwB", F: "bwBwBwBwB", G: "bwbwbWBwB", H: "BwbwbWBwB", I: "bwBwbWBwB", J: "bwbwBWBwB", K: "BwbwbwbWB", L: "bwbwbwbWB", M: "BwBwbwbWB", N: "bwbwBwbWB", O: "BwbwBwbWB", P: "bwBwBwbWB", Q: "bwbwbwBWB", R: "BwbwbwBWB", S: "bwBwbwBWB", T: "bwbwBwBWB", U: "BWBwbwbwB", V: "bWBwbwbwB", W: "BWBwbwbwB", X: "bWBwBwbwB", Y: "BWBwBwbwB", Z: "bWBWBwbwB", "-": "bWBwbwBwB", ".": "BWBwbwBwB", " ": "bWBwBwBwB", "*": "bWBwBwBWB", $: "bWBbWBbwb", "/": "bWBbwbWbB", "+": "bWbWBbwbB", "%": "bwbWBbWbB" };
    t = "*" + t.toUpperCase() + "*";
    var i = t.length;
    e.beginPath(), e.setFillStyle("#ffffff"), e.rect(0, 0, n, o), e.fill(), e.closePath();
    var a = n / i / 3;
    e.setFillStyle("#000000");
    for (var l = 0; l < i; l++) {
      var s = r[t.charAt(l)];
      if (void 0 == s) return void e.clearActions();
      for (var f = 0; f < s.length; f++) {
        var g = s.charAt(f),
          h = l * (3 * a) + f * (a / 2);
        "b" == g ? e.rect(h, 0, a / 2, o) : "B" == g && e.rect(h, 0, a, o)
      }
    }
    e.fill(), e.closePath(), e.beginPath(), e.setFontSize(.1 * o), e.setTextBaseline("middle"), e.setTextAlign("center"), e.setFillStyle("#000000"), e.fillText(t, n / 2, .9 * o), e.draw()
  }, code128: code128 };