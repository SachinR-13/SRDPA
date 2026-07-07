const weakPins = [
    "000000",
    "111111",
    "123456",
    "654321",
    "999999",
];

const validateTransactionPin = (pin) => {

    if (!pin) {
        throw new Error("Transaction PIN is required");
    }

    if (!/^\d{6}$/.test(pin)) {
        throw new Error(
            "Transaction PIN must be exactly 6 digits"
        );
    }

    if (weakPins.includes(pin)) {
        throw new Error(
            "This Transaction PIN is too common. Please choose a different 6-digit PIN."
        );
    }

};

module.exports = validateTransactionPin;