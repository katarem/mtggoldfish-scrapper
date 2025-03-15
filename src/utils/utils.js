"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnumValue = getEnumValue;
function getEnumValue(enumObj, value) {
    return Object.values(enumObj).includes(value) ? value : undefined;
}
