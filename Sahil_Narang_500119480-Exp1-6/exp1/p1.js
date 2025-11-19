const object = {
    name : "Sahil Narang",
    age : 21,

    greet: function() {
        return `Hello from ${this.name}!`;
    },
}

module.exports = object;