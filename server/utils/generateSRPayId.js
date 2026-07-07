const generateSRPayId = () => {
    const random = Math.floor(100000 + Math.random() * 900000);

    return `SRP${random}`;
};

module.exports = generateSRPayId;