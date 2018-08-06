module.exports.genRandomName = (length) => {
    let posible = "AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz0918273645";
    var r = ""; 
    for(var i = 0; i < length; i++) {
        r += posible[Math.floor(Math.random() * posible.length)]; 
    }
    return r; 
};