const bcrypt = require('bcryptjs');

const generate = async () => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash('admin', salt);
    console.log(hash);
};

generate();
