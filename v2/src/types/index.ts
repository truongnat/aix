
export interface IHarnessConfig {
    version: string;
    core: string[];
    output: string[];
}

export interface IHarnessProvider {
    value: string;
    label: string;
    hint: string;
}