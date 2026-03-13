// Stub for GAS environment where NodeClient/Axios is not available
export class NodeClient {
    constructor() {
        throw new Error("NodeClient is not supported in GAS environment.");
    }
}
