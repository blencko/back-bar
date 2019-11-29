var jwtDecode = require('jwt-decode');

exports.permission = (token) => {
    return new Promise((resolve, reject) => {
        profile = jwtDecode(token);
        if (profile.type === 'ADMIN') {
            resolve(200)
        } else {
            reject(401)
        }
    })
}


exports.user = (token) => {
    return jwtDecode(token);
}