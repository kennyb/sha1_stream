Streaming SHA-1 generator in JavaScript
=======================================

Usage
-----

    var hmac = hmac_sha1_stream(key);

    for (var i=0; i<1000; i++) {
        hmac.update(data);
    }

    var signature = hmac.digest();
