export class BuildFailedError extends Error {
  constructor(path: string, private _parentError?: unknown) {
    super(
      `Error building resume with the updated file @ ${path}. The file will be reverted to its previous state.`
    );
    this.name = "Build Failed Error";
  }

  get parentError() {
    return this._parentError;
  }

  static isBuildFailedError(e: unknown) {
    return e instanceof BuildFailedError;
  }
}
