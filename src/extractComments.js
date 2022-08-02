const paramRegex = /@(\w+)\s*: .*/gim;

// Used to remove whitespace from the start of a string
function trimLeft(str) {
    if (!str) return str;
    return str.replace(/^\s+/g, "");
}

const parseMatchByExpectedType = (match, expectedType) => {
    switch (expectedType) {
        // Used for when the annotation value is expected to be a string, not JSON.
        case "string":
            return match.split(":")[1].replace(/\s/g, "");
        // Used for when the annotation value is expected to contain a colon (JSON)
        case "json":
            const split = match.split(":");
            split.shift();
            return trimLeft(split.join(":"));
    }
};

const routeFormat = {
    path: "",
    method: "",
    description: "",
    body: undefined,
    returns: "",
    params: undefined,
    responses: {},
};

function parseFile(contents) {
    const routes = {};

    let currentRoute = { ...routeFormat };
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
                currentRoute = { ...routeFormat, responses: {} };
            }

            if (annotation.includes("@route")) {
                let desc = lines[linesProcessed - 2];
                desc = desc.replace("/** ", "");
                desc = desc.replace("\r", "");
                currentRoute.description = desc;

                currentRoute.path = parseMatchByExpectedType(
                    annotation,
                    "json",
                );
                routes[currentRoute.path] = {};
            } else {
                // Get the method
                if (annotation.includes("@method"))
                    currentRoute.method = parseMatchByExpectedType(
                        annotation,
                        "string",
                    );
                // Get the data that it requires
                if (annotation.includes("@body"))
                    currentRoute.body = parseMatchByExpectedType(
                        annotation,
                        "json",
                    );
                // Get the data that it returns
                if (annotation.includes("@returns"))
                    currentRoute.returns = parseMatchByExpectedType(
                        annotation,
                        "json",
                    );
                // Get the headers that it requires
                if (annotation.includes("@headers"))
                    currentRoute.headers = parseMatchByExpectedType(
                        annotation,
                        "json",
                    );
                // Get responses by status code
                if (annotation.match(/@\d{3}/)) {
                    const statusCode = annotation.match(/@(\d{3})/)[1];
                    if (currentRoute.responses[statusCode])
                        currentRoute.responses[statusCode] =
                            typeof currentRoute.responses[statusCode] ===
                            "string"
                                ? [
                                      currentRoute.responses[statusCode],
                                      parseMatchByExpectedType(
                                          annotation,
                                          "json",
                                      ),
                                  ]
                                : currentRoute.responses[statusCode].concat(
                                      parseMatchByExpectedType(
                                          annotation,
                                          "json",
                                      ),
                                  );
                    else
                        currentRoute.responses[statusCode] =
                            parseMatchByExpectedType(annotation, "json");
                }
                // Get the params that it requires
                if (annotation.includes("@params"))
                    currentRoute.params = parseMatchByExpectedType(
                        annotation,
                        "json",
                    );
            }
        }

        linesProcessed++;
    }

    const lines = contents.split("\n");
    lines.forEach(checkLine);

    return routes;
}

module.exports = parseFile;
