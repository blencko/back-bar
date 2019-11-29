exports.timestamp = (date) => {
    var d = new Date(date);
    return d.getDate() + '/' + (d.getMonth() + 1) + '/' + d.getFullYear();
} 