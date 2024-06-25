const crypto = require('crypto');


//字符串转sha256字符串
function str2sha256(str) {
    var reponse = crypto.createHash('SHA256').update(str).digest('hex');
    return reponse;
}

module.exports.str2sha256=str2sha256;