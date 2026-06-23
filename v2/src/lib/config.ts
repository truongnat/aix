import fs from "fs";
import path from "path";
import { fileURLToPath } from "node:url";
import { HARNESS_CONFIG_FILE } from "../constants";
import { IHarnessConfig } from "../types";


export const config: IHarnessConfig = {
    version: "0.0.1",
    core: ["skills", "rules", "hooks", "templates", "memory", "tools", "agents"],
    output: [".ai-harness", ".codex", ".claude"]
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const templateConfigPath = path.join(currentDir, '..', 'templates', HARNESS_CONFIG_FILE);

async function init() {
    // alway init config file when start;
    // init current dir templates
    const checkConfigExist = await fs.promises.access(templateConfigPath).then(() => true).catch(() => false);
    if (!checkConfigExist) {
        await fs.promises.writeFile(templateConfigPath, JSON.stringify(config, null, 2), "utf-8");
        console.log(`Initialized ${HARNESS_CONFIG_FILE} successfully.`);
    } else {
        console.log(`${HARNESS_CONFIG_FILE} already exists. Skipping initialization.`);
    }
}

await init();
