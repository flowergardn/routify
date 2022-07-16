const paramRegex = /@(\w+)\s*: .*/gim;

// Used to remove whitespace from the start of a string
function ltrim(str) {
    if (!str) return str;
    return str.replace(/^\s+/g, '');
}

// Used for when the annotation value is expected to be a string, not JSON.
const getValue = (match) => match.split(":")[1].replace(/\s/g, "");
// Used for when the annotation value is expected to contain a colon (JSON)
const getValue2 = (match) => {
    const split = match.split(":");
    split.shift();
    return ltrim(split.join(":"));
}

function parseFile(contents) {
    const routes = {};

    let currentRoute = {};
    let linesProcessed = 1;

    function checkLine(line) {
        if (linesProcessed === lines.length) {
            routes[currentRoute.path] = currentRoute;
            return;
        }

        const matches = line.match(paramRegex);
        if (matches) {
            let annotation = matches[0];

            if (annotation.includes("@route") && currentRoute.path) {
                routes[currentRoute.path] = currentRoute;
                currentRoute = {};
            }

            if (annotation.includes("@route")) {
                let desc = lines[linesProcessed - 2];
                desc = desc.replace("/** ", "");
                desc = desc.replace("\r", "");
                currentRoute.description = desc

                currentRoute.path = getValue2(annotation);
                routes[currentRoute.path] = {};
            } else {
                // Get the method
                if (annotation.includes("@method"))
                    currentRoute.method = getValue(annotation);
                // Get the data that it returns
                if (annotation.includes("@returns"))
                    currentRoute.returns = getValue2(annotation);
                // Get the headers that it requires
                if (annotation.includes("@headers"))
                    currentRoute.headers = getValue2(annotation);
            }
        }

        linesProcessed++;
    }

    const lines = contents.split("\n");
    lines.forEach(checkLine);

    return routes;
}

module.exports = parseFile;
