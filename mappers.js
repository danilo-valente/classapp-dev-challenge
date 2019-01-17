const PhoneNumber = require('awesome-phonenumber');

module.exports = {
    'fullname': fullname,
    'class': classMapper,
    'email': address,
    'phone': address,
    'invisible': bool,
    'see_all': bool
};

// Add fullname to the entry
function fullname(entry, col, tags, value) {
    entry.fullname = value;
}

// Map class values into classes array and add it to the entry
function classMapper(entry, col, tags, value) {
    if (!entry.classes) {
        entry.classes = [];
    } else if (typeof entry.classes === 'string') {
        entry.classes = [entry.classes]
    }

    const newClasses = value.split(/\s*[\/,]\s*/g).map(x => x.trim()).filter(x => x);
    if (newClasses.length > 0) {
        entry.classes = [].concat(entry.classes, newClasses);
    }

    if (entry.classes.length === 1) {
        entry.classes = entry.classes[0];
    }
}

// Map address values and tags into addresses array and add it to the entry
function address(entry, col, tags, value) {
    if (!entry.addresses) {
        entry.addresses = [];
    }

    parseAddresses(col, value).forEach(address => {

        const addressEntry = entry.addresses.find(ae => ae.type === col && ae.address === address);
        if (addressEntry) {
            const newTags = tags.filter(t => addressEntry.tags.indexOf(t) === -1);
            addressEntry.tags = addressEntry.tags.concat(newTags);
        } else {
            entry.addresses.push({
                type: col,
                tags,
                address
            });
        }
    });
}

// Parse an address field into multiple addresses
function parseAddresses(type, value) {
    if (!value) {
        return [];
    }

    if (type === 'email') {
        const emails = value.toLowerCase()
            .split(/[\s,\/]+/g)
            .map(email => {
                const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email) ? email : null;
            });

        return emails.indexOf(null) === -1 ? emails : [];
    }

    if (type === 'phone') {
        const number = new PhoneNumber(value, 'BR');
        return number.isValid() ? ['55' + number.getNumber('significant')] : [];
    }

    return [];
}

// Parse a boolean value and add it to the entry
function bool(entry, col, tags, value) {
    if (value === '1' || value === 'yes') {
        entry[col] = true;
    } else if (value === '0' || value === 'no') {
        entry[col] = false;
    }
}
