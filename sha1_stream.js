/**
 * Support for generating SHA-1 of a stream.
 * Jason Davies <jason@jasondavies.com>
 *
 * Based on and requires: http://pajhome.org.uk/crypt/md5/sha1.html
 */

function naked_sha1_head() {
  var w = Array(80);
  var a =  1732584193;
  var b = -271733879;
  var c = -1732584194;
  var d =  271733878;
  var e = -1009589776;
  return [w, a, b, c, d, e, [], 0, 0];
}

function naked_sha1(x, len, h) {
  var w = h[0], a = h[1], b = h[2], c = h[3], d = h[4], e = h[5];
  /* prepend data from last time */
  var old_len = h[8];
  var blen = x.length;
  if (blen > 0) {
    var shift = old_len % 32;
    if (shift > 0) {
      h[6][old_len >> 5] |= x[0] >> shift;
      for (var i=0; i<x.length-1; i++) {
        x[i] = x[i] << (32 - shift) | x[i+1] >> shift;
      }
      x[x.length-1] <<= 32 - shift;
    }
  }
  x = h[6].concat(x)
  var max = (old_len + len) >> 5;
  var rem = max % 16;
  max -= rem;
  for(var i = 0; i < max; i += 16)
  {
    var olda = a;
    var oldb = b;
    var oldc = c;
    var oldd = d;
    var olde = e;

    for(var j = 0; j < 80; j++)
    {
      if(j < 16) w[j] = x[i + j];
      else w[j] = bit_rol(w[j-3] ^ w[j-8] ^ w[j-14] ^ w[j-16], 1);
      var t = safe_add(safe_add(bit_rol(a, 5), sha1_ft(j, b, c, d)),
                       safe_add(safe_add(e, w[j]), sha1_kt(j)));
      e = d;
      d = c;
      c = bit_rol(b, 30);
      b = a;
      a = t;
    }

    a = safe_add(a, olda);
    b = safe_add(b, oldb);
    c = safe_add(c, oldc);
    d = safe_add(d, oldd);
    e = safe_add(e, olde);
  }
  h[0] = w;
  h[1] = a;
  h[2] = b;
  h[3] = c;
  h[4] = d;
  h[5] = e;
  /* store extra for next time */
  h[6] = x.slice(max);
  h[7] += len;
  h[8] = (old_len + len) % 32 + rem * 32;
}

function naked_sha1_tail(h) {
  /* append padding */
  var x = h[6];
  var total_len = h[7];
  var len = h[8];
  x[len >> 5] |= 0x80 << (24 - len % 32);
  x[((len + 64 >> 9) << 4) + 15] = total_len;
  h[8] = x.length * 32
  naked_sha1([], 0, h);
  return h.slice(1, 6);
}

var hmac_sha1_stream = function(key) {
  this.hash = rstr_hmac_sha1_stream_head(str2rstr_utf8(key), str2rstr_utf8(''));
}
hmac_sha1_stream.prototype.update = function(data) {
  rstr_hmac_sha1_stream(str2rstr_utf8(data), this.hash.naked_hash);
}
hmac_sha1_stream.prototype.digest = function() {
  var tail = naked_sha1_tail(this.hash.naked_hash.slice());
  return rstr2b64(binb2rstr(binb_sha1(this.hash.opad.concat(tail), 512 + 160)));
}

function rstr_hmac_sha1_stream_head(key, data) {
  var bkey = rstr2binb(key);
  if(bkey.length > 16) bkey = binb_sha1(bkey, key.length * 8);

  var ipad = Array(16), opad = Array(16);
  for(var i = 0; i < 16; i++)
  {
    ipad[i] = bkey[i] ^ 0x36363636;
    opad[i] = bkey[i] ^ 0x5C5C5C5C;
  }

  var naked_hash = naked_sha1_head();
  naked_sha1(ipad.concat(rstr2binb(data)), 512 + data.length * 8, naked_hash);

  return {
    opad: opad,
    naked_hash: naked_hash
  };
}

function rstr_hmac_sha1_stream(data, naked_hash) {
  naked_sha1(rstr2binb(data), data.length * 8, naked_hash);
}
