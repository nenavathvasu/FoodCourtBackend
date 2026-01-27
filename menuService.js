const Veg = require("./Veg");
const NonVeg = require("./NonVeg");

// VEG
exports.getVegItems = () => Veg.find();
exports.saveVegItem = (data) => Veg.create(data);
exports.deleteVegItem = (id) => Veg.findByIdAndDelete(id);

// NON-VEG
exports.getNonVegItems = () => NonVeg.find();
exports.saveNonVegItem = (data) => NonVeg.create(data);
exports.deleteNonVegItem = (id) => NonVeg.findByIdAndDelete(id);