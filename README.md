Streaming SHA-1 generator in JavaScript
=======================================

Usage
-----

    var hash = hmac_sha1_stream_head(key, data);

    for (var i=0; i<1000; i++) {
        hmac_sha1_stream(data, hash.naked_hash);
    }

    var signature = hmac_sha1_stream_tail(hash.opad, hash.naked_hash);
