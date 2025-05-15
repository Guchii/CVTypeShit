declare module 'jq-web' {
    const jq: Promise<{json: (object, string) => object}>;
    export = jq;
}